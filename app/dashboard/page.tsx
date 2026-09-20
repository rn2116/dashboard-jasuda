import { OverviewGrid } from "@/components/monitoring/overview-grid"

export default function Page() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Ringkasan</h2>
        <p className="text-sm text-muted-foreground">
          Status Suhu, Tekanan, dan Timer untuk 3 mesin cup sealer.
        </p>
      </div>
      <OverviewGrid />
    </div>
  )
}
