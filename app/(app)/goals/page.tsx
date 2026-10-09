'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { GoalCard } from '@/components/goal-card'
import { GoalForm } from '@/components/goal-form'
import { CurrencyInput } from '@/components/forms/currency-input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { localToday } from '@/lib/goals'
import type { Goal } from '@/types/goal'

export default function GoalsPage() {
  const { goals, contributions, loading, error, create, update, remove, addContribution } = useGoals()
  const [filter, setFilter] = useState<'all' | 'done'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Goal>()
  const [deposit, setDeposit] = useState<Goal>()
  const [amount, setAmount] = useState(0)
  const [deleting, setDeleting] = useState<Goal>()

  const visible = useMemo(() => goals.filter((goal) => filter === 'all' || contributions.filter((item) => item.goalId === goal.id).reduce((sum, item) => sum + item.amountCents, 0) >= goal.targetCents), [goals, contributions, filter])

  function openNewGoal() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEditGoal(goal: Goal) {
    setEditing(goal)
    setFormOpen(true)
  }

  async function save(input: Omit<Goal, 'id' | 'createdAt'>) {
    if (editing) await update(editing.id, input)
    else await create(input)
    setEditing(undefined)
    setFormOpen(false)
  }

  async function confirmDelete() {
    if (!deleting) return
    await remove(deleting.id)
    setDeleting(undefined)
  }

  async function contribute() {
    if (!deposit || amount <= 0) return
    await addContribution({ goalId: deposit.id, amountCents: amount, date: localToday(), note: 'Controle da meta' })
    setDeposit(undefined)
    setAmount(0)
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-violet">Planeje com intenção</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Metas</h1><p className="mt-2 text-muted-foreground">Acompanhe o que você está construindo, passo a passo.</p></div>
        <Button onClick={openNewGoal}><Plus /> Nova meta</Button>
      </header>
      <div className="flex gap-2"><Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todas</Button><Button variant={filter === 'done' ? 'default' : 'outline'} onClick={() => setFilter('done')}>Concluídas</Button></div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? <p className="text-muted-foreground">Carregando metas…</p> : visible.length === 0 ? <section className="rounded-3xl border border-dashed p-12 text-center"><h2 className="text-xl font-semibold">{filter === 'done' ? 'Nenhuma meta concluída' : 'Ainda não há metas'}</h2><p className="mt-2 text-muted-foreground">{filter === 'done' ? 'Quando você alcançar uma meta, ela aparecerá aqui.' : 'Crie uma meta para começar a construir seu próximo plano.'}</p>{filter === 'all' && <Button className="mt-5" onClick={openNewGoal}><Plus /> Criar meta</Button>}</section> : <div className="grid gap-5 lg:grid-cols-2">{visible.map((goal) => <GoalCard key={goal.id} goal={goal} contributions={contributions} onContribute={(selected) => { setDeposit(selected); setAmount(0) }} onEdit={openEditGoal} onDelete={setDeleting} />)}</div>}

      <GoalForm key={editing?.id ?? 'new-goal'} open={formOpen} editing={editing} onClose={() => { setFormOpen(false); setEditing(undefined) }} onSave={save} />

      {deposit && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">Guardar em {deposit.name}</h2><p className="mt-1 text-sm text-muted-foreground">Quanto deseja guardar agora?</p></div><Button variant="ghost" size="icon" onClick={() => setDeposit(undefined)} aria-label="Fechar"><X /></Button></div><div className="mt-6"><CurrencyInput autoFocus cents={amount} onCentsChange={setAmount} aria-label="Valor do aporte" placeholder="0,00" /></div><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeposit(undefined)}>Cancelar</Button><Button onClick={contribute} disabled={amount <= 0}>Guardar {formatCurrency(amount / 100)}</Button></div></div></div>}

      {deleting && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-goal-title"><div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl"><div className="flex items-start justify-between"><div><div className="mb-3 grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="size-5" /></div><h2 id="delete-goal-title" className="text-xl font-semibold">Excluir meta?</h2><p className="mt-2 text-muted-foreground">A meta <strong>{deleting.name}</strong> e seus aportes serão removidos.</p></div><Button variant="ghost" size="icon" onClick={() => setDeleting(undefined)} aria-label="Fechar"><X /></Button></div><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleting(undefined)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Excluir meta</Button></div></div></div>}
    </main>
  )
}
