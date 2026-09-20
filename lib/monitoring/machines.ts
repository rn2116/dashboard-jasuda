export type MachineId = "mesin-1" | "mesin-2" | "mesin-3"

export interface Machine {
  id: MachineId
  /** Placeholder name — rename once the real machines/lines are identified. */
  name: string
  location: string
  type: "cup-sealer" | "conveyor"
}

export const MACHINES: Machine[] = [
  { id: "mesin-1", name: "Mesin Cup Sealer Manual", location: "Line produksi 1", type: "cup-sealer" },
  { id: "mesin-2", name: "Mesin Cup Sealer Otomatis", location: "Line produksi 2", type: "cup-sealer" },
  { id: "mesin-3", name: "Mesin Conveyor", location: "Line produksi 3", type: "conveyor" },
]

export function getMachine(id: MachineId): Machine {
  const machine = MACHINES.find((m) => m.id === id)
  if (!machine) {
    throw new Error(`Unknown machine id: ${id}`)
  }
  return machine
}
