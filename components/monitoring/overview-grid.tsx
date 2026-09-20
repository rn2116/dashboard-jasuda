"use client"

import Link from "next/link"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMachineTelemetry } from "@/hooks/use-machine-telemetry"
import { MACHINES, type Machine } from "@/lib/monitoring/machines"
import { ArrowRightIcon } from "@phosphor-icons/react"

function OverviewMachineCard({ machine }: { machine: Machine }) {
  const { latest } = useMachineTelemetry(machine.id)

  if (!latest) {
    return (
      <Card className="@container/card animate-pulse">
        <CardHeader>
          <div className="h-4 w-1/3 bg-muted rounded"></div>
          <div className="h-6 w-1/2 bg-muted rounded mt-2"></div>
        </CardHeader>
        <CardFooter>
          <div className="h-10 w-full bg-muted rounded"></div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="@container/card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 cursor-pointer">
      <CardHeader>
        <CardDescription>{machine.location}</CardDescription>
        <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl">
          {machine.name}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">Live</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="grid w-full grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-semibold tabular-nums">{latest.suhu.toFixed(1)}°C</div>
            <div className="text-xs text-muted-foreground">Suhu</div>
          </div>
          {machine.type === "conveyor" ? (
            <>
              <div>
                <div className="font-semibold tabular-nums">{latest.kecepatan?.toFixed(1) || "-"}</div>
                <div className="text-xs text-muted-foreground">Kecepatan (RPM)</div>
              </div>
              <div>
                <div className="font-semibold tabular-nums">{latest.pouchMasuk || "-"}</div>
                <div className="text-xs text-muted-foreground">Pouch In</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="font-semibold tabular-nums">{latest.tekanan?.toFixed(2) || "-"}</div>
                <div className="text-xs text-muted-foreground">Tekanan (bar)</div>
              </div>
              <div>
                <div className="font-semibold tabular-nums">{latest.timer?.toFixed(2) || "-"}</div>
                <div className="text-xs text-muted-foreground">Timer (s)</div>
              </div>
            </>
          )}
        </div>
        <Link
          href={`/dashboard/${machine.id}`}
          className="flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Lihat detail <ArrowRightIcon className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}

export function OverviewGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      {MACHINES.map((machine) => (
        <OverviewMachineCard key={machine.id} machine={machine} />
      ))}
    </div>
  )
}
