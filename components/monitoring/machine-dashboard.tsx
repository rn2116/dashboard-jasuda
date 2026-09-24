"use client"

import { useMachineTelemetry } from "@/hooks/use-machine-telemetry"
import { useCycleLog } from "@/hooks/use-cycle-log"
import { getMachine, type MachineId } from "@/lib/monitoring/machines"
import { MachineStatCards } from "./machine-stat-cards"
import dynamic from "next/dynamic"

const MachineTrendChart = dynamic(
  () => import("./machine-trend-chart").then((mod) => mod.MachineTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-border/50 bg-muted/20">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Memuat Grafik...</span>
        </div>
      </div>
    ),
  }
)
import { MachineCycleTable } from "./machine-cycle-table"

export function MachineDashboard({ machineId }: { machineId: MachineId }) {
  const machine = getMachine(machineId)
  const { latest, history, isLoading, error } = useMachineTelemetry(machineId)
  const { logs: cycles } = useCycleLog(machineId)

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">{machine.name}</h2>
        <p className="text-sm text-muted-foreground">{machine.location}</p>
      </div>

      {error && (
        <div className="px-4 lg:px-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
            Gagal memuat data: {error}
          </div>
        </div>
      )}

      {!isLoading && !latest && !error && (
        <div className="px-4 lg:px-6">
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground">
            Belum ada pembacaan dari mesin ini. Pastikan ESP32 sudah mengirim data ke{" "}
            <code className="rounded bg-muted px-1 py-0.5">POST /api/telemetry</code>.
          </div>
        </div>
      )}

      <MachineStatCards latest={latest ?? undefined} />
      <div className="px-4 lg:px-6">
        <MachineTrendChart history={history} />
      </div>

      <MachineCycleTable data={cycles} />
    </div>
  )
}
