"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Mock data to give it an industrial wave look
const data = [
  { time: "00:00", value: 40 },
  { time: "01:00", value: 30 },
  { time: "02:00", value: 45 },
  { time: "03:00", value: 60 },
  { time: "04:00", value: 45 },
  { time: "05:00", value: 70 },
  { time: "06:00", value: 85 },
  { time: "07:00", value: 75 },
  { time: "08:00", value: 90 },
]

export function FloatingGraph() {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-primary/20 bg-card/60 p-4 shadow-2xl shadow-primary/20 backdrop-blur-xl sm:p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Suhu Optimal</h3>
            <p className="text-xs text-muted-foreground">Sistem Stabil (Simulasi)</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
            </span>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValue)"
                isAnimationActive={true}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
