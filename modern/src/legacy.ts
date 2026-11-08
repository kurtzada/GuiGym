import type { LegacyDB, TrainingLog, Plan, WaterEntry } from './models'

const KEY = 'forgeDB'

export function parseLegacy(value: unknown): LegacyDB | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const db: LegacyDB = {
    profile: raw.profile && typeof raw.profile === 'object' ? raw.profile as LegacyDB['profile'] : {},
    logs: Array.isArray(raw.logs) ? raw.logs.filter((item): item is TrainingLog => !!item && typeof item === 'object' && typeof item.date === 'string') : [],
    plans: Array.isArray(raw.plans) ? raw.plans.filter((item): item is Plan => !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string') : [],
    water: Array.isArray(raw.water) ? raw.water.filter((item): item is WaterEntry => !!item && typeof item === 'object' && typeof item.day === 'string' && Number.isFinite(Number(item.ml))) : [],
    waterGoal: Number(raw.waterGoal) > 0 ? Number(raw.waterGoal) : 2500,
    workoutQueue: Array.isArray(raw.workoutQueue) ? raw.workoutQueue.filter((id): id is string => typeof id === 'string') : [],
    queueIndex: Number.isInteger(raw.queueIndex) ? Number(raw.queueIndex) : 0,
    measures: Array.isArray(raw.measures) ? raw.measures : [],
  }
  return db
}

export function readLegacy(): LegacyDB | null {
  try {
    const stored = localStorage.getItem(KEY)
    return stored ? parseLegacy(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

export function exportOriginalBackup(): boolean {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return false
    const objectUrl = URL.createObjectURL(new Blob([stored], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = 'guigym-backup-original-' + localDay(new Date()) + '.json'
    link.click()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 500)
    return true
  } catch {
    return false
  }
}

export function localDay(date: Date): string {
  return String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}
export function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '0'
}
export function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'
}
export function getNextPlan(db: LegacyDB): Plan | undefined {
  const plans = db.plans ?? []
  const queue = (db.workoutQueue ?? []).filter((id) => plans.some((plan) => plan.id === id))
  const selected = queue.length ? queue[((db.queueIndex ?? 0) % queue.length + queue.length) % queue.length] : plans[0]?.id
  return plans.find((plan) => plan.id === selected) ?? plans[0]
}
export function todayWater(db: LegacyDB): number {
  const today = localDay(new Date())
  return (db.water ?? []).filter((item) => item.day === today).reduce((total, item) => total + Number(item.ml || 0), 0)
}
export function getLastExerciseWeight(logs: TrainingLog[], name: string): number | null {
  for (const log of [...logs].reverse()) {
    const entry = (log.entries ?? []).find((item) => item.name === name && Number(item.weight) > 0)
    if (entry) return Number(entry.weight)
  }
  return null
}
