"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Contoh dummy data kinerja keuangan
const chartData = [
    { kuartal: "Q1", bri: 110, bni: 85 },
    { kuartal: "Q2", bri: 130, bni: 95 },
    { kuartal: "Q3", bri: 125, bni: 110 },
    { kuartal: "Q4", bri: 145, bni: 120 },
]

const chartConfig = {
    bri: {
        label: "Bank BRI",
        color: "hsl(var(--primary))",
    },
    bni: {
        label: "Bank BNI",
        color: "hsl(var(--chart-2))", // Menggunakan warna sekunder shadcn
    },
} satisfies ChartConfig

export function PerformanceChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Perbandingan Kinerja</CardTitle>
                <CardDescription>Kuartal 1 - Kuartal 4 (2025)</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="kuartal" tickLine={false} tickMargin={10} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="bri" fill="var(--color-bri)" radius={4} />
                        <Bar dataKey="bni" fill="var(--color-bni)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}