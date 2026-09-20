"use client"

import dynamic from "next/dynamic"

export const FloatingGraphWrapper = dynamic(
  () => import("./floating-graph").then((mod) => mod.FloatingGraph),
  {
    ssr: false,
    loading: () => (
      <div className="relative mx-auto flex h-[300px] max-w-md items-center justify-center rounded-xl border border-primary/20 bg-card/60 shadow-2xl shadow-primary/20 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-2 text-primary">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm font-medium">Memuat Visualisasi...</span>
        </div>
      </div>
    ),
  }
)
