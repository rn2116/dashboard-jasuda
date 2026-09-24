# Cup Sealer Monitoring Dashboard

Web dashboard for monitoring and controlling automatic cup sealer machines (currently 3 units — see "Monitoring multiple machines" below). Built with Next.js (App Router), React, Tailwind CSS v4, and shadcn/ui components.

## Domain

The dashboard monitors and controls a cup sealer machine's process parameters:

- **Suhu (temperature)** — heater temperature, read via MAX31856 (thermocouple/RTD amplifier) + PT100 RTD probe.
- **Tekanan (pressure)** — sealing pressure, read via load cell + HX711 amplifier.
- **Timer** — seal dwell time per cycle.

### Hardware

- **ESP32** — main controller/MCU, reads sensors and exposes data to the dashboard (and likely receives setpoint/control commands from it).
- **SSR (solid-state relay)** — switches the heater element on/off, driven by the ESP32.
- **MAX31856 + PT100** — high-accuracy RTD temperature sensing for the heater.
- **Load cell + HX711** — pressure/force sensing (24-bit ADC amplifier).
- Other supporting components (power supply, wiring/connectors, enclosure, etc.) as needed.

### Planned features (not yet implemented)

- **Anomaly detection** — flag abnormal readings in temperature, pressure, or timer (e.g. threshold/trend-based alerts) on the dashboard.
- **Heater control from the dashboard** — let the user set the ideal heater temperature **setpoint**, sent to the ESP32 to drive the SSR (closed-loop or on/off control around the setpoint).

## Data layer — Firebase Realtime Database (decided)

**Transport decision (made):** ESP32 → **HTTP POST** to this Next.js app's API routes → **Firebase Realtime Database (RTDB)** via REST. There is no PostgreSQL/Prisma — that was tried and fully removed. Do not re-add a SQL database without checking with the project owner.

- RTDB URL: `https://jasuda-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app` (in `.env` as `NEXT_PUBLIC_FIREBASE_DATABASE_URL`).
- Conveyor ESP32 IP: `10.249.201.65` (mesin-3).
- Database rules are currently **open read/write** for `telemetry` and `cycleLogs` (ESP32 writes without auth). Tightening (secret/auth) is a planned follow-up.

### RTDB structure

```
telemetry/{mesin-1|mesin-2|mesin-3}/{pushKey}   → one sensor reading (time-series)
cycleLogs/{mesin-1|mesin-2|mesin-3}/{pushKey}   → one finished cycle
```

Push keys are generated server-side (`pushKey()` in `lib/firebase/rtdb.ts`): fixed-width base36 timestamp + random suffix, so key order = chronological order (used for `?since=` incremental sync).

### API routes (all under `app/api/`)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/telemetry` | ESP32 ingest — single reading **or array (batch ≤100)**; validated by Zod, written with ONE multi-path update |
| GET | `/api/telemetry/[machineId]?limit=60&since=<key>` | History, ascending. `since` = incremental poll (only newer rows) |
| GET | `/api/telemetry/[machineId]/latest` | Latest reading only (stat cards/overview — tiny payload) |
| GET/POST | `/api/cycle-log/[machineId]?limit=20` | Read / append finished cycle logs |
| GET | `/api/health` | Server liveness check |

ESP32 posts `{ "machineId": "mesin-3", "suhu": 192.5, ... }` (or an array of those). Cup sealer sends `tekanan`/`timer`; conveyor sends `kecepatan`/`pouchMasuk`/`pouchKeluar`.

### Architecture (layered — extend here)

```
lib/api/handler.ts            reusable apiHandler wrapper: error → status mapping
                              (Zod→400, ApiError→its status, else→500),
                              + helpers: readJson, param, queryInt, queryKey
lib/validation/telemetry.ts   ALL inbound payloads (single source of truth, Zod)
lib/firebase/rtdb.ts          low-level RTDB REST client (timeout, auth, pushKey, multi-path update)
lib/firebase/telemetry.ts     repository: saveTelemetryBatch/readTelemetry/readLatestTelemetry/
                              saveCycleLog/readCycleLogs
lib/monitoring/types.ts       shared response types (TelemetryReading, CycleLogEntry, ApiResponse)
lib/monitoring/machines.ts    machine metadata (id/name/location/type)
```

**Adding a feature:** new payload → add Zod schema in `lib/validation/`; new RTDB op → add function in `lib/firebase/telemetry.ts` (use `rtdb.*`); new endpoint → thin route in `app/api/.../route.ts` wrapped with `apiHandler`; new client data → hook in `hooks/`.

### Performance strategy (intentional — preserve it)

- **No Firebase SDK on the client** — all RTDB access is server-side REST (`lib/firebase/rtdb.ts`). Keeps the browser bundle light. Global fetch = keep-alive connection reuse; every Firebase call has an 8s timeout.
- **Incremental sync** — `use-machine-telemetry` does one initial `limit=60` load, then polls every 5s with `?since=<lastKey>` so each poll transfers only new rows.
- **`/latest` endpoint** — overview page polls 1 reading per machine (3s) instead of 60.
- **Batch ingest** — ESP32 may POST an array; server writes all rows in ONE HTTP request (RTDB multi-path update).
- **Abort + anti-overlap** — hooks abort in-flight requests on unmount/machineId change; telemetry polling skips a tick if the previous request is still running.

Client hooks: `hooks/use-machine-telemetry.ts` (history + latest for a machine page), `hooks/use-machine-latest.ts` (overview cards), `hooks/use-cycle-log.ts` (cycle table, 10s poll).

## Monitoring multiple machines

The dashboard monitors **3 separate cup sealer machines** (not one), each with its own Suhu/Tekanan/Timer telemetry. Each machine gets its own sidebar menu item and route:

- `/dashboard` — Ringkasan (overview): summary cards for all 3 machines with a link into each.
- `/dashboard/mesin-1`, `/dashboard/mesin-2`, `/dashboard/mesin-3` — per-machine monitoring page (stat cards, live trend chart, cycle log table).

Machine metadata (id, name, location) lives in `lib/monitoring/machines.ts`. The names "Mesin 1/2/3" are placeholders — rename them there once the real machines/lines are identified; nothing else needs to change since routes and the sidebar are generated from that list.

## Current state

The stock `create-next-app` + shadcn dashboard-01 scaffold has been repurposed for the cup-sealer domain, and the telemetry pipeline (ESP32 → API → Firebase RTDB → dashboard) is **wired and tested end-to-end** (see "Data layer" above):

- `components/app-sidebar.tsx` / `components/nav-main.tsx` — sidebar nav links to Ringkasan + the 3 machine pages, with active-link highlighting via `usePathname`.
- `components/monitoring/*` — Suhu/Tekanan/Timer specific UI (stat cards, live trend chart, cycle log table, per-machine dashboard, overview grid). Empty/error states shown when a machine has not reported yet.
- `hooks/*` + `lib/firebase/*` — real data from Firebase RTDB (no more mock generator; `lib/monitoring/mock-telemetry.ts` was deleted).
- There is **no ESP32 firmware in this repo yet** — only the receiving API. Transport is HTTP POST (decided). Auth for the app and hardened RTDB rules are not done yet; add deliberately when needed.

The `app/login` route (empty scaffold files, unreferenced) was removed as dead code — there is no auth in this app yet; add it back deliberately if/when auth is needed.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS v4
- shadcn/ui (`components/ui/*`), Radix/base-ui primitives, Phosphor + Lucide icons
- `recharts` for charts, `zod` for validation
- `@tanstack/react-table` and `@dnd-kit/*` are installed but currently unused (the old drag-and-drop data table was removed when repurposing for the monitoring UI) — pull them back in if a future table needs sorting/pagination/reordering, otherwise safe to drop from `package.json`.
