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
import type { TelemetryReading } from "@/lib/monitoring/types"

type ParameterKey = "suhu" | "tekanan" | "timer" | "kecepatan"

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
  kecepatan: {
    label: "Kecepatan",
    unit: "RPM",
    config: { kecepatan: { label: "Kecepatan (RPM)", color: "var(--primary)" } },
  }
}

export function MachineTrendChart({
  history,
}: {
  history: TelemetryReading[]
}) {
  const availableParameters = React.useMemo(() => {
    const params: ParameterKey[] = ["suhu"]
    if (history.some((r) => r.tekanan !== undefined)) params.push("tekanan")
    if (history.some((r) => r.timer !== undefined)) params.push("timer")
    if (history.some((r) => r.kecepatan !== undefined)) params.push("kecepatan")
    return params
  }, [history])

  const [parameter, setParameter] = React.useState<ParameterKey>("suhu")

  // Sesuaikan parameter terpilih saat render (bukan di effect) —
  // data awal bisa kosong / berubah ketika mesin berganti tipe.
  const activeParameter: ParameterKey = availableParameters.includes(parameter)
    ? parameter
    : availableParameters[0]

  const { label, unit, config } = PARAMETERS[activeParameter] || PARAMETERS.suhu

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tren {label}</CardTitle>
        <CardDescription>Pembacaan langsung beberapa menit terakhir</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Tabs
          value={activeParameter}
          onValueChange={(value) => setParameter(value as ParameterKey)}
        >
          <TabsList>
            {availableParameters.map((p) => (
              <TabsTrigger key={p} value={p}>
                {PARAMETERS[p].label}
              </TabsTrigger>
            ))}
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
