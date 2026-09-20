export type MachineId = "mesin-1" | "mesin-2" | "mesin-3"

export interface Machine {
  id: MachineId
  /** Placeholder name — rename once the real machines/lines are identified. */
  name: string
  location: string
}

export const MACHINES: Machine[] = [
  { id: "mesin-1", name: "Mesin 1", location: "Line produksi 1" },
  { id: "mesin-2", name: "Mesin 2", location: "Line produksi 2" },
  { id: "mesin-3", name: "Mesin 3", location: "Line produksi 3" },
]

export function getMachine(id: MachineId): Machine {
  const machine = MACHINES.find((m) => m.id === id)
  if (!machine) {
    throw new Error(`Unknown machine id: ${id}`)
  }
  return machine
}
