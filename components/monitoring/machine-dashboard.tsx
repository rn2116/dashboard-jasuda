"use client"

import * as React from "react"

import { useMachineTelemetry } from "@/hooks/use-machine-telemetry"
import { getMachine, type MachineId } from "@/lib/monitoring/machines"
import { generateCycleLog } from "@/lib/monitoring/mock-telemetry"
import { MachineStatCards } from "./machine-stat-cards"
import { MachineTrendChart } from "./machine-trend-chart"
import { MachineCycleTable } from "./machine-cycle-table"

export function MachineDashboard({ machineId }: { machineId: MachineId }) {
  const machine = getMachine(machineId)
  const { latest, history } = useMachineTelemetry(machineId)
  const cycles = React.useMemo(() => generateCycleLog(machineId), [machineId])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">{machine.name}</h2>
        <p className="text-sm text-muted-foreground">{machine.location}</p>
      </div>
      <MachineStatCards latest={latest} />
      <div className="px-4 lg:px-6">
        <MachineTrendChart history={history} />
      </div>
      <MachineCycleTable data={cycles} />
    </div>
  )
}
