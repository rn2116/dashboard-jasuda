"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TelemetryReading } from "@/lib/monitoring/mock-telemetry"

type ParameterKey = "suhu" | "tekanan" | "timer"

const PARAMETERS: Record<
  ParameterKey,
  { label: string; unit: string; config: ChartConfig }
> = {
  suhu: {
    label: "Suhu",
    unit: "°C",
    config: { suhu: { label: "Suhu (°C)", color: "var(--primary)" } },
  },
  tekanan: {
    label: "Tekanan",
    unit: "bar",
    config: { tekanan: { label: "Tekanan (bar)", color: "var(--primary)" } },
  },
  timer: {
    label: "Timer",
    unit: "s",
    config: { timer: { label: "Timer (s)", color: "var(--primary)" } },
  },
}

export function MachineTrendChart({
  history,
}: {
  history: TelemetryReading[]
}) {
  const [parameter, setParameter] = React.useState<ParameterKey>("suhu")
  const { label, unit, config } = PARAMETERS[parameter]

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tren {label}</CardTitle>
        <CardDescription>Pembacaan langsung (simulasi) beberapa menit terakhir</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Tabs
          value={parameter}
          onValueChange={(value) => setParameter(value as ParameterKey)}
        >
          <TabsList>
            <TabsTrigger value="suhu">Suhu</TabsTrigger>
            <TabsTrigger value="tekanan">Tekanan</TabsTrigger>
            <TabsTrigger value="timer">Timer</TabsTrigger>
          </TabsList>
          <TabsContent value={parameter}>
            <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id={`fill-${parameter}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`var(--color-${parameter})`} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={`var(--color-${parameter})`} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(value).toLocaleTimeString("id-ID")
                      }
                      formatter={(value) => `${value} ${unit}`}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey={parameter}
                  type="natural"
                  fill={`url(#fill-${parameter})`}
                  stroke={`var(--color-${parameter})`}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
