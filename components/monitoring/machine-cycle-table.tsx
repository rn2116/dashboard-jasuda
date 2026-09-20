"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircleIcon } from "@phosphor-icons/react"
import type { CycleLogEntry } from "@/lib/monitoring/mock-telemetry"

export function MachineCycleTable({ data }: { data: CycleLogEntry[] }) {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Siklus</CardTitle>
          <CardDescription>Catatan siklus sealing terakhir (data simulasi)</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Siklus</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead className="text-right">Suhu (°C)</TableHead>
                  <TableHead className="text-right">Tekanan (bar)</TableHead>
                  <TableHead className="text-right">Timer (s)</TableHead>
                  <TableHead className="text-right">Kecepatan (RPM)</TableHead>
                  <TableHead className="text-right">Pouch (In/Out)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">#{entry.id}</TableCell>
                    <TableCell>
                      {new Date(entry.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.suhu.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.tekanan !== undefined ? entry.tekanan.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.timer !== undefined ? entry.timer.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.kecepatan !== undefined ? entry.kecepatan.toFixed(1) : "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {entry.pouchMasuk !== undefined ? entry.pouchMasuk : "-"} / {entry.pouchKeluar !== undefined ? entry.pouchKeluar : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-1.5 text-muted-foreground">
                        <CheckCircleIcon className="fill-green-500 dark:fill-green-400" />
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
