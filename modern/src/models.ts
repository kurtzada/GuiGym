export type View = 'home' | 'training' | 'progress' | 'water' | 'settings'

export interface Exercise {
  name: string
  sets?: number
  reps?: string | number
  rest?: string
  tip?: string
}
export interface Plan {
  id: string
  name: string
  focus?: string
  tags?: string[]
  exercises?: Exercise[]
}
export interface SessionEntry {
  name: string
  weight?: number
  reps?: string | number
  setsDone?: number
  done?: boolean
}
export interface TrainingLog {
  date: string
  planId?: string
  planName?: string
  entries?: SessionEntry[]
  completed?: boolean
}
export interface WaterEntry {
  day: string
  ml: number
  at?: string
}
export interface LegacyDB {
  profile?: { weight?: number; height?: number; start?: string }
  logs?: TrainingLog[]
  plans?: Plan[]
  water?: WaterEntry[]
  waterGoal?: number
  workoutQueue?: string[]
  queueIndex?: number
  measures?: Array<{ date?: string; weight?: number }>
}
