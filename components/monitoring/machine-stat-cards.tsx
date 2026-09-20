"use client"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TelemetryReading } from "@/lib/monitoring/mock-telemetry"
import { ThermometerIcon, GaugeIcon, TimerIcon } from "@phosphor-icons/react"

function formatUpdatedAt(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function MachineStatCards({ latest }: { latest: TelemetryReading }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <ThermometerIcon className="size-4" />
            Suhu
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {latest.suhu.toFixed(1)}°C
          </CardTitle>
          <CardAction>
            <Badge variant="outline">MAX31856 + PT100</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Diperbarui {formatUpdatedAt(latest.timestamp)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <GaugeIcon className="size-4" />
            Tekanan
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {latest.tekanan.toFixed(2)} bar
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Load cell + HX711</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Diperbarui {formatUpdatedAt(latest.timestamp)}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <TimerIcon className="size-4" />
            Timer
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {latest.timer.toFixed(2)} s
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Seal dwell time</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Diperbarui {formatUpdatedAt(latest.timestamp)}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
