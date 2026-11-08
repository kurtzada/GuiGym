import { ChartNoAxesCombined, Droplets, Dumbbell, House, LayoutGrid } from 'lucide-react'
import type { ComponentType } from 'react'
import type { View } from '../models'

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
const tabs: Array<{ id: View; label: string; icon: IconType }> = [
  { id: 'home', label: 'Início', icon: House },
  { id: 'training', label: 'Treinos', icon: Dumbbell },
  { id: 'progress', label: 'Evolução', icon: ChartNoAxesCombined },
  { id: 'water', label: 'Água', icon: Droplets },
  { id: 'settings', label: 'Mais', icon: LayoutGrid },
]

export function Navigation({ selected, onSelect }: { selected: View; onSelect: (view: View) => void }) {
  return <nav className="original-nav" aria-label="Navegação principal">
    <div className="original-nav-grid">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => onSelect(id)} aria-current={selected === id ? 'page' : undefined} className={'original-nav-btn ' + (selected === id ? 'active' : '')}>
        <Icon size={22} strokeWidth={selected === id ? 2.5 : 1.8} /><span>{label}</span>
      </button>)}
    </div>
  </nav>
}
