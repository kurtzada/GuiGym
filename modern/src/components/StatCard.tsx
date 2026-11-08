import type { ReactNode } from 'react'

export function StatCard({ title, value, subtitle, icon, tone = 'red' }: { title: string; value: string; subtitle: string; icon: ReactNode; tone?: 'red' | 'blue' | 'green' }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className={'stat-icon ' + tone}>{icon}</div>
        <span className="size-1.5 rounded-full bg-white/20" />
      </div>
      <p className="mt-5 text-[11px] font-bold tracking-[.16em] text-zinc-400 uppercase">{title}</p>
      <strong className="mt-2 block text-3xl font-black tracking-tight text-white">{value}</strong>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
    </div>
  )
}
