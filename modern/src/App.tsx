import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, CircleAlert, ClipboardList, CloudOff, Droplets, Dumbbell, FileUp, Headphones, HeartPulse, ListFilter, LockKeyhole, Medal, Music2, RotateCw, ShieldCheck, TrendingUp } from 'lucide-react'
import { Navigation } from './components/Navigation'
import { StatCard } from './components/StatCard'
import { nextTrainingArtwork } from './originalArtwork'
import { exportOriginalBackup, formatDate, formatNumber, getLastExerciseWeight, getNextPlan, localDay, parseLegacy, readLegacy, todayWater } from './legacy'
import type { LegacyDB, View } from './models'

const today = new Date()
const dateLabel = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
const fullApp = '../'
const historyKeys = Array.from({ length: 7 }, (_, index) => {
  const day = new Date()
  day.setDate(day.getDate() - 6 + index)
  return { key: localDay(day), label: day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') }
})
const heading: Record<View, { eyebrow: string; title: string; subtitle: string }> = {
  home: { eyebrow: 'SEU PAINEL DE PERFORMANCE', title: 'Cada treino conta.', subtitle: 'Seu progresso, sem distrações.' },
  training: { eyebrow: 'SUA ROTINA', title: 'Treino com intenção.', subtitle: 'Explore sua divisão e as cargas já registradas.' },
  progress: { eyebrow: 'DADOS REAIS', title: 'Evolução em números.', subtitle: 'Seu histórico é o que conta a sua história.' },
  water: { eyebrow: 'RECUPERAÇÃO', title: 'Hidratação em dia.', subtitle: 'Consistência também acontece fora da academia.' },
  settings: { eyebrow: 'SEU GUI GYM', title: 'Tudo sob controle.', subtitle: 'Revise seus dados antes de migrar de versão.' },
}
function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={'surface ' + className}>{children}</section>
}
function EmptyData({ onNavigate }: { onNavigate: () => void }) {
  return <div className="empty-state"><div className="empty-icon"><CloudOff size={27} /></div><h3>Nenhum dado encontrado nesta prévia</h3><p>Os dados são locais ao navegador. Se você usa o GuiGym instalado no iPhone, importe um backup exportado pela versão original para visualizar seus treinos aqui.</p><button className="btn-primary" onClick={onNavigate}>Importar backup <ArrowRight size={16} /></button></div>
}
function TitleRow({ title, caption, icon }: { title: string; caption?: string; icon?: React.ReactNode }) {
  return <div className="section-title"><div><h3>{title}</h3>{caption && <p>{caption}</p>}</div>{icon && <div className="text-rose-400">{icon}</div>}</div>
}
function ActivityBars({ db, type = 'training' }: { db: LegacyDB; type?: 'training' | 'water' }) {
  const values = historyKeys.map((day) => type === 'water'
    ? (db.water ?? []).filter((entry) => entry.day === day.key).reduce((sum, entry) => sum + Number(entry.ml || 0), 0)
    : (db.logs ?? []).filter((log) => log.date?.slice(0, 10) === day.key).length)
  const maximum = Math.max(type === 'water' ? (db.waterGoal ?? 2500) : 1, ...values)
  return <div className="activity-chart" aria-label={type === 'water' ? 'Hidratação dos últimos 7 dias' : 'Treinos dos últimos 7 dias'}>
    {historyKeys.map((day, index) => (
      <div className="chart-column" key={day.key} title={day.key + ': ' + values[index] + (type === 'water' ? ' ml' : ' treino(s)')}>
        <span className="chart-value">{type === 'water' ? (values[index] ? (values[index] / 1000).toFixed(1) + ' L' : '—') : values[index] || '—'}</span>
        <div className="chart-track"><div className={'chart-fill ' + (index === 6 ? 'today' : '')} style={{ height: (values[index] ? Math.max(10, Math.round(values[index] / maximum * 100)) : 3) + '%' }} /></div>
        <span className="chart-day">{day.label}</span>
      </div>
    ))}
  </div>
}
function App() {
  const [view, setView] = useState<View>('home')
  const [db, setDb] = useState<LegacyDB | null>(() => readLegacy())
  const [source, setSource] = useState<'local' | 'backup' | 'none'>(() => readLegacy() ? 'local' : 'none')
  const [error, setError] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const plans = db?.plans ?? []
  const logs = db?.logs ?? []
  const water = db ? todayWater(db) : 0
  const waterGoal = db?.waterGoal ?? 2500
  const next = db ? getNextPlan(db) : undefined
  const plan = useMemo(() => plans.find((item) => item.id === selectedPlanId) ?? next ?? plans[0], [plans, selectedPlanId, next])
  const last30 = useMemo(() => logs.filter((log) => Number.isFinite(new Date(log.date).getTime()) && Date.now() - new Date(log.date).getTime() <= 30 * 86400000).length, [logs])
  const completed = logs.filter((log) => log.completed !== false).length
  function navigate(page: View) { setView(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function refresh() { const nextData = readLegacy(); setDb(nextData); setSource(nextData ? 'local' : 'none'); setError('') }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Arquivo acima de 10 MB. Escolha um backup JSON do GuiGym.'); return }
    try {
      const parsed = parseLegacy(JSON.parse(await file.text()))
      if (!parsed) throw Error('Estrutura de backup inválida')
      setDb(parsed); setSource('backup'); setSelectedPlanId(''); setError('')
    } catch { setError('Não foi possível ler o backup. Selecione um arquivo JSON exportado do GuiGym.') }
    event.target.value = ''
  }
  return <div className="app-shell">
    <main className="main-content">
      <header className="brand-v11-top">
        <div className="brand-v11">
          <div className="brand-v11-logo">
            <svg viewBox="0 0 100 100" width="32" height="32" aria-label="Logo GuiGym"><path d="M77 21A37 37 0 1 0 78 70V49H51" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/><path d="M70 13L59 37h16L64 62 93 29H76L85 13" fill="currentColor"/></svg>
          </div>
          <div><h1>GuiGym</h1><small>EVOLUÇÃO &amp; PERFORMANCE</small></div>
        </div>
        <div className="brand-v11-actions">
          <span className="preview-tag"><LockKeyhole size={12} /> REACT · PRÉVIA</span>
          <a href={fullApp} title="Abrir o GuiGym completo">Original <ArrowUpRight size={13} className="inline" /></a>
        </div>
      </header>
      {view !== 'home' && <div className="legacy-hero">
        <div>
          <div className="legacy-eyebrow">{heading[view].eyebrow}</div>
          <h2>{heading[view].title}</h2>
          <p>{heading[view].subtitle}</p>
        </div>
      </div>}
      {source !== 'none' && <div className="data-banner"><ShieldCheck size={15} /><span>{source === 'backup' ? 'Backup lido nesta prévia, sem modificar seus dados.' : 'Seus dados foram encontrados neste navegador e não serão alterados.'}</span></div>}
      {!db && view !== 'settings' && view !== 'home' ? <EmptyData onNavigate={() => navigate('settings')} /> : null}

      {view === 'home' && <>
        <section className="home-cover">
          <div className="cover-art" aria-hidden="true" /><div className="cover-ai" aria-hidden="true" />
          <div className="cover-content">
            <div className="cover-topline"><span>SEU CENTRO DE PERFORMANCE</span><span className="cover-date">{dateLabel}</span></div>
            <h2>{new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'},<br /><strong>Guilherme <span className="crown">♛</span></strong></h2>
            <div className="cover-focus">
              <div><span className="focus-icon">◎</span><small>FOCO ATUAL</small><b>Hipertrofia</b></div>
              <div><span className="focus-icon">▦</span><small>PLANO ATUAL</small><b>{db?.plans?.length ? 'Meu plano' : 'GuiGym'}</b></div>
            </div>
            <div className="cover-week">
              <div className="weekly">{historyKeys.map((day, index) => <div className={'wday ' + ((db?.logs ?? []).some(log => log.date?.slice(0, 10) === day.key && log.completed !== false) ? 'hit' : '')} key={day.key}>
                {day.label}<small>{index === 6 ? 'Hoje' : (db?.logs ?? []).some(log => log.date?.slice(0, 10) === day.key) ? '✓' : '·'}</small>
              </div>)}</div>
              <p className="mt-2 text-[10px] text-zinc-400">Seus últimos sete dias de evolução</p>
            </div>
          </div>
        </section>
        <section className="home-next">
          <img className="next-ai-image" src={nextTrainingArtwork} alt="" loading="lazy" />
          <div className="next-symbol" aria-hidden="true">ϟ</div>
          <div className="next-copy">
            <span className="legacy-eyebrow">{next ? 'PRÓXIMO NA FILA' : 'PRÓXIMA SESSÃO'}</span>
            <h2>{next?.name || 'Sua rotina de treino'}</h2>
            <p>{next?.focus || (next?.tags ?? []).join(' · ') || 'Importe seu backup para ver o seu plano personalizado.'}</p>
          </div>
          <button className="next-launch" onClick={() => { if(next) setSelectedPlanId(next.id); navigate(next ? 'training' : 'settings') }} aria-label="Abrir próximo treino"><ArrowRight size={21}/></button>
        </section>
        {!db && <EmptyData onNavigate={() => navigate('settings')} />}
        <div className="legacy-metrics">
          <div className="legacy-metric"><small>PESO ATUAL</small><strong>{db?.profile?.weight ? formatNumber(db.profile.weight) + ' kg' : '—'}</strong><span>Corporal</span></div>
          <div className="legacy-metric"><small>SEQUÊNCIA</small><strong>{db ? formatNumber(completed) : '—'}</strong><span>Sessões registradas</span></div>
          <div className="legacy-metric"><small>PLANO</small><strong>{db ? formatNumber(plans.length) : '—'}</strong><span>Treinos na rotina</span></div>
        </div>
        <div className="legacy-head"><h3>Atalhos</h3><span>ACESSO RÁPIDO</span></div>
        <div className="original-quick-grid">
          <button className="original-quick" onClick={() => navigate('water')}><Droplets/><strong>Hidratação</strong><small>Meta diária</small></button>
          <button className="original-quick" onClick={() => navigate('training')}><Dumbbell/><strong>Treinos</strong><small>Minha divisão</small></button>
          <button className="original-quick" onClick={() => navigate('progress')}><Medal/><strong>Recordes</strong><small>Cargas e evolução</small></button>
          <button className="original-quick" onClick={() => navigate('settings')}><Headphones/><strong>GuiGym Music</strong><small>Spotify no original</small></button>
        </div>
        <div className="legacy-head"><h3>Hidratação de hoje</h3><button className="text-xs font-bold text-rose-300" onClick={() => navigate('water')}>Ver diário →</button></div>
        <div className="two-columns">
          <Surface>
            <TitleRow title="Água registrada" caption="Sua meta diária" icon={<Droplets size={20} />} />
            <div className="mt-6 flex items-end gap-2"><strong className="text-4xl font-black">{db ? formatNumber(water) : '—'} <span className="text-lg text-zinc-500">ml</span></strong><span className="mb-1 ml-auto text-xs text-zinc-400">/ {formatNumber(waterGoal)} ml</span></div>
            <div className="progress-track mt-5"><div style={{ width: Math.min(100, water / waterGoal * 100) + '%' }} /></div>
            <div className="mt-4 text-xs text-zinc-400">{db ? water >= waterGoal ? 'Meta atingida. Excelente consistência!' : formatNumber(Math.max(0, waterGoal - water)) + ' ml para atingir sua meta.' : 'Importe um backup para visualizar seus registros.'}</div>
          </Surface>
          <Surface><TitleRow title="Consistência da semana" caption="Treinos registrados em sete dias" icon={<Activity size={20} />} /><ActivityBars db={db ?? {logs:[],water:[],waterGoal:2500}} /></Surface>
        </div>
      </>}

      {db && view === 'training' && <div className="two-columns training-columns">
        <Surface>
          <TitleRow title="Divisão de treinos" caption={plans.length + ' planos personalizados'} icon={<ListFilter size={20} />} />
          <div className="mt-5 grid gap-2">
            {plans.map((item, index) => <button key={item.id} className={'plan-choice ' + (plan?.id === item.id ? 'active' : '')} onClick={() => setSelectedPlanId(item.id)}>
              <span className="plan-num">{String(index + 1).padStart(2, '0')}</span><span className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm">{item.name}</strong><small className="text-xs text-zinc-500">{item.exercises?.length ?? 0} exercícios</small></span><ChevronRight size={17} />
            </button>)}
            {!plans.length && <p className="text-sm text-zinc-400">Nenhum plano no backup.</p>}
          </div>
        </Surface>
        <Surface>
          <TitleRow title={plan?.name ?? 'Escolha um treino'} caption={plan?.focus || 'Detalhes da sessão'} icon={<ClipboardList size={20} />} />
          <div className="mt-5 grid gap-2">
            {(plan?.exercises ?? []).map((exercise, index) => {
              const weight = getLastExerciseWeight(logs, exercise.name)
              return <div key={index} className="exercise-row">
                <div className="exercise-index">{index + 1}</div>
                <div className="min-w-0 flex-1"><strong className="block text-sm text-white">{exercise.name}</strong><span className="text-xs text-zinc-500">{exercise.sets ?? '—'} séries · {exercise.reps ?? '—'} reps</span></div>
                <div className="text-right"><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Última carga</span><strong className="block text-sm text-rose-300">{weight === null ? '—' : formatNumber(weight) + ' kg'}</strong></div>
              </div>
            })}
            {!plan?.exercises?.length && <p className="text-sm text-zinc-400">Exercícios não encontrados neste plano.</p>}
          </div>
          <div className="info-note"><CircleAlert size={16} /> Edição de cargas e início de sessões continuam disponíveis no app atual enquanto esta versão é validada.</div>
          <a href={fullApp} className="btn-primary mt-5 inline-flex">Abrir treino no GuiGym atual <ArrowUpRight size={15} /></a>
        </Surface>
      </div>}

      {db && view === 'progress' && <>
        <div className="stat-grid">
          <StatCard title="Treinos registrados" value={formatNumber(logs.length)} subtitle="Sessões salvas" icon={<Medal size={20} />} />
          <StatCard title="Últimos 30 dias" value={formatNumber(last30)} subtitle="Frequência recente" icon={<CalendarDays size={20} />} tone="blue" />
          <StatCard title="Medidas registradas" value={formatNumber((db.measures ?? []).length)} subtitle="Acompanhamento físico" icon={<HeartPulse size={20} />} tone="green" />
        </div>
        <Surface><TitleRow title="Atividade nos últimos 7 dias" caption="Frequência de treinos" icon={<TrendingUp size={20} />} /><ActivityBars db={db} /></Surface>
        <Surface>
          <TitleRow title="Histórico recente" caption="Suas últimas sessões" icon={<ClipboardList size={20} />} />
          <div className="mt-3 divide-y divide-white/6">
            {[...logs].reverse().slice(0, 10).map((log, index) => <div className="history-row" key={index}>
              <div className="history-icon"><CheckCircle2 size={17} /></div><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{log.planName || 'Treino'}</strong><span className="text-xs text-zinc-500">{(log.entries ?? []).length} exercícios registrados</span></div><span className="text-xs text-zinc-400">{formatDate(log.date)}</span>
            </div>)}
            {!logs.length && <p className="py-6 text-sm text-zinc-500">Seu histórico aparecerá aqui.</p>}
          </div>
        </Surface>
      </>}

      {db && view === 'water' && <>
        <div className="two-columns">
          <Surface className="hydration-panel">
            <TitleRow title="Consumo de hoje" caption="Acompanhamento da meta" icon={<Droplets size={20} />} />
            <div className="water-orb mt-7"><Droplets size={42} /><strong>{Math.min(100, Math.round(water / waterGoal * 100))}%</strong><small>DA META</small></div>
            <div className="mt-5 text-center text-3xl font-black">{formatNumber(water)} <span className="text-base text-zinc-500">/ {formatNumber(waterGoal)} ml</span></div>
            <div className="progress-track mt-5"><div style={{ width: Math.min(100, water / waterGoal * 100) + '%' }} /></div>
            <div className="info-note"><CircleAlert size={16} /> Adicionar água fica na versão atual até concluirmos a migração dos dados.</div>
          </Surface>
          <Surface><TitleRow title="Últimos 7 dias" caption="Consumo de água registrado" icon={<Activity size={20} />} /><ActivityBars db={db} type="water" /></Surface>
        </div>
        <Surface><TitleRow title="Registros de hoje" caption="Histórico de hidratação" icon={<Droplets size={20} />} />
          <div className="mt-4 grid gap-2">{(db.water ?? []).filter((item) => item.day === localDay(new Date())).slice().reverse().map((item, index) => <div className="history-row" key={index}><Droplets className="text-sky-400" size={17} /><strong className="flex-1 text-sm">{formatNumber(Number(item.ml))} ml</strong><span className="text-xs text-zinc-400">{item.at ? new Date(item.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></div>)}
          {water === 0 && <p className="text-sm text-zinc-400">Nenhum registro hoje.</p>}</div>
        </Surface>
      </>}

      {view === 'settings' && <>
        <Surface>
          <TitleRow title="Seus dados são prioridade" caption="Migração progressiva e reversível" icon={<ShieldCheck size={21} />} />
          <div className="privacy-grid mt-5">
            <div><LockKeyhole size={22} className="text-emerald-400" /><h4>Somente leitura</h4><p>Nesta etapa, a interface React lê os dados; ela não grava nem modifica a chave forgeDB.</p></div>
            <div><FileUp size={22} className="text-rose-400" /><h4>Backup JSON</h4><p>Importe um backup da versão original para visualizar seu histórico nesta prévia.</p></div>
            <div><Music2 size={22} className="text-sky-400" /><h4>Spotify preservado</h4><p>A integração com Spotify Connect continua funcionando no GuiGym original.</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => inputRef.current?.click()}><FileUp size={17} /> Importar backup JSON</button>
            <button className="btn-secondary" onClick={() => { if (!exportOriginalBackup()) setError('Nenhum forgeDB encontrado neste navegador. Use a opção Exportar backup do GuiGym original.') }}><ArrowDownToLine size={17} /> Baixar backup local</button>
            <button className="btn-secondary" onClick={refresh}><RotateCw size={17} /> Recarregar dados locais</button>
          </div>
          <input ref={inputRef} className="hidden" type="file" accept=".json,application/json" onChange={importBackup} aria-label="Selecionar backup JSON do GuiGym" />
          {!!error && <p role="alert" className="mt-4 text-sm font-semibold text-rose-300">{error}</p>}
          <p className="mt-5 text-xs leading-6 text-zinc-500">Importar aqui não substitui seu backup e não salva os dados. O navegador da PWA instalada no iPhone pode ter armazenamento separado do Safari.</p>
        </Surface>
        <Surface>
          <TitleRow title="Versão atual do GuiGym" caption="Continue treinando sem interrupções" icon={<Headphones size={20} />} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><h4 className="font-bold text-white">Treinos completos + Spotify Music</h4><p className="mt-1 text-xs text-zinc-400">Todos os recursos operacionais continuam na versão atual.</p></div><a className="btn-primary" href={fullApp}>Abrir app atual <ArrowUpRight size={16} /></a></div>
        </Surface>
      </>}
      <footer className="mt-10 border-t border-white/8 py-6 text-xs text-zinc-600">© GuiGym Studio · React + TypeScript · Prévia independente, sem alteração de dados.</footer>
    </main>
    <Navigation selected={view} onSelect={navigate} />
  </div>
}
export default App
