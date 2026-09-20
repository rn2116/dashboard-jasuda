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

export function MachineStatCards({ latest }: { latest?: TelemetryReading }) {
  if (!latest) return null;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
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
      
      {latest.tekanan !== undefined && (
        <Card className="@container/card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
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
      )}

      {latest.timer !== undefined && (
        <Card className="@container/card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
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
      )}

      {latest.kecepatan !== undefined && (
        <Card className="@container/card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <GaugeIcon className="size-4" />
              Kecepatan
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {latest.kecepatan.toFixed(1)} RPM
            </CardTitle>
            <CardAction>
              <Badge variant="outline">Motor Speed</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Diperbarui {formatUpdatedAt(latest.timestamp)}
            </div>
          </CardFooter>
        </Card>
      )}

      {latest.pouchMasuk !== undefined && (
        <Card className="@container/card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TimerIcon className="size-4" />
              Pouch Masuk
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {latest.pouchMasuk}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">Counter In</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Diperbarui {formatUpdatedAt(latest.timestamp)}
            </div>
          </CardFooter>
        </Card>
      )}

      {latest.pouchKeluar !== undefined && (
        <Card className="@container/card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TimerIcon className="size-4" />
              Pouch Keluar
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {latest.pouchKeluar}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">Counter Out</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              Diperbarui {formatUpdatedAt(latest.timestamp)}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
