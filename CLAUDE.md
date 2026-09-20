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

## Monitoring multiple machines

The dashboard monitors **3 separate cup sealer machines** (not one), each with its own Suhu/Tekanan/Timer telemetry. Each machine gets its own sidebar menu item and route:

- `/dashboard` — Ringkasan (overview): summary cards for all 3 machines with a link into each.
- `/dashboard/mesin-1`, `/dashboard/mesin-2`, `/dashboard/mesin-3` — per-machine monitoring page (stat cards, live trend chart, cycle log table).

Machine metadata (id, name, location) lives in `lib/monitoring/machines.ts`. The names "Mesin 1/2/3" are placeholders — rename them there once the real machines/lines are identified; nothing else needs to change since routes and the sidebar are generated from that list.

## Current state

The stock `create-next-app` + shadcn dashboard-01 scaffold has been repurposed for the cup-sealer domain:

- `components/app-sidebar.tsx` / `components/nav-main.tsx` — sidebar nav now links to Ringkasan + the 3 machine pages (routes above), with active-link highlighting via `usePathname`.
- `components/monitoring/machine-stat-cards.tsx`, `machine-trend-chart.tsx`, `machine-cycle-table.tsx`, `machine-dashboard.tsx`, `overview-grid.tsx` — replace the old `SectionCards`/`ChartAreaInteractive`/`DataTable`/`StatCard` block scaffold with Suhu/Tekanan/Timer specific UI.
- `lib/monitoring/mock-telemetry.ts` + `hooks/use-machine-telemetry.ts` — **placeholder telemetry only**: readings are generated client-side (sine wobble + noise, polled on an interval) to simulate live sensor data. This is not connected to any real ESP32/sensor. Swap the generator call for a real fetch/WebSocket/MQTT/SSE subscription once the transport below is decided.

There is still no ESP32 firmware, backend/API route, or database in this repo — only the frontend shell, now wired to simulated per-machine data instead of the original document-review placeholder rows. When wiring up real data, a decision is needed on transport (e.g. HTTP polling, WebSocket, MQTT bridge, Server-Sent Events) between the ESP32(s) and this Next.js app, and on where control commands (setpoint changes) get sent from — this hasn't been decided yet, so don't assume one without checking.

The `app/login` route (empty scaffold files, unreferenced) was removed as dead code — there is no auth in this app yet; add it back deliberately if/when auth is needed.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS v4
- shadcn/ui (`components/ui/*`), Radix/base-ui primitives, Phosphor + Lucide icons
- `recharts` for charts, `zod` for validation
- `@tanstack/react-table` and `@dnd-kit/*` are installed but currently unused (the old drag-and-drop data table was removed when repurposing for the monitoring UI) — pull them back in if a future table needs sorting/pagination/reordering, otherwise safe to drop from `package.json`.
