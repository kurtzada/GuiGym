import { Activity, ChartNoAxesCombined, Droplets, Dumbbell, House, Settings2 } from 'lucide-react'
import type { ComponentType } from 'react'
import type { View } from '../models'

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
const tabs: Array<{ id: View; label: string; icon: IconType }> = [
  { id: 'home', label: 'Início', icon: House },
  { id: 'training', label: 'Treinos', icon: Dumbbell },
  { id: 'progress', label: 'Evolução', icon: ChartNoAxesCombined },
  { id: 'water', label: 'Água', icon: Droplets },
  { id: 'settings', label: 'Mais', icon: Settings2 },
]

interface NavigationProps {
  selected: View
  onSelect: (view: View) => void
}

export function Navigation({ selected, onSelect }: NavigationProps) {
  return (
    <>
      <aside className="desktop-nav hidden lg:flex">
        <div className="brand-lockup">
          <div className="brand-symbol"><Activity size={24} strokeWidth={2.6} /></div>
          <div><strong>GuiGym<span>®</span></strong><small>EVOLUÇÃO & PERFORMANCE</small></div>
        </div>
        <div className="nav-caption">SEU ESPAÇO</div>
        <nav aria-label="Navegação principal" className="space-y-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => onSelect(id)} aria-current={selected === id ? 'page' : undefined} className={'desktop-link ' + (selected === id ? 'selected' : '')}>
              <Icon size={19} strokeWidth={2} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-[.22em] text-rose-400">GuiGym Studio</div>
          <div className="mt-2 text-sm font-semibold">Uma nova fase.</div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">Prévia React · Seus dados continuam protegidos no app original.</p>
        </div>
      </aside>
      <nav className="mobile-nav lg:hidden" aria-label="Navegação principal">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} aria-current={selected === id ? 'page' : undefined} onClick={() => onSelect(id)} className={'mobile-link ' + (selected === id ? 'selected' : '')}>
            <Icon size={21} strokeWidth={selected === id ? 2.5 : 1.85} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
