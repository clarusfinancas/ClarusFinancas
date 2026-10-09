'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useTransactions } from '@/hooks/useTransactions'
import { TransactionForm } from '@/components/transaction-form'
import { CategoryManager } from '@/components/category-manager'
import { CategoryCombobox } from '@/components/form-controls'
import { categories } from '@/types/category'
import { formatCurrency } from '@/lib/format'
import type { Transaction } from '@/types/transaction'

const dateLabel = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')

export default function TransactionsPage() {
  const { transactions, loading, remove } = useTransactions()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | Transaction['type']>('all')
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const filtered = useMemo(() => transactions.filter((item) => (!query || `${item.description} ${item.categoryId}`.toLowerCase().includes(query.toLowerCase())) && (type === 'all' || item.type === type) && (category === 'all' || item.categoryId === category)), [transactions, query, type, category])
  const balance = filtered.reduce((sum, item) => sum + (item.type === 'income' ? item.amountCents : -item.amountCents), 0)

  return <section className="flex flex-col gap-6 px-5 pb-12 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Organize seus lançamentos</p><h1 className="text-3xl font-semibold">Transações</h1></div><button onClick={() => { setCreating(true); setEditing(null) }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"><Plus className="size-4" />Nova transação</button></div>
    {(creating || editing) && <TransactionForm transaction={editing ?? undefined} onDone={() => { setCreating(false); setEditing(null) }} onCancel={() => { setCreating(false); setEditing(null) }} />}<CategoryManager />
    <div className="flex flex-col gap-3"><label className="relative min-w-56 flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar descrição" className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm" /></label><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-xl border bg-muted/40 p-1" role="group" aria-label="Filtrar por tipo">{[['all', 'Todas'], ['income', 'Receitas'], ['expense', 'Despesas']].map(([value, label]) => <button type="button" key={value} onClick={() => setType(value as typeof type)} aria-pressed={type === value} className={`rounded-lg px-3 py-2 text-sm transition-colors ${type === value ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>)}</div><div className="min-w-52"><CategoryCombobox value={category} onChange={setCategory} /></div></div></div>
    <div className="rounded-2xl border bg-card p-4"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Resultado filtrado</p><p className={`text-xl font-semibold ${balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(Math.abs(balance / 100))}</p></div><span className="text-sm text-muted-foreground">{filtered.length} lançamentos</span></div>{loading ? <p className="py-12 text-center text-sm text-muted-foreground">Carregando…</p> : filtered.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">Nenhuma transação encontrada.</p> : <div className="divide-y">{filtered.map((item) => { const cat = categories.find((entry) => entry.id === item.categoryId); return <div key={item.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="font-medium">{item.description}</p><p className="text-xs text-muted-foreground">{cat?.name ?? 'Outros'} · {dateLabel(item.date)}{item.isDemo ? ' · exemplo' : ''}</p></div><div className="flex items-center gap-3"><span className={`font-semibold ${item.type === 'income' ? 'text-emerald-700' : 'text-foreground'}`}>{item.type === 'income' ? '+' : '−'}{formatCurrency(item.amountCents / 100)}</span><button aria-label={`Editar ${item.description}`} onClick={() => { setEditing(item); setCreating(false) }} className="text-muted-foreground hover:text-foreground"><Pencil className="size-4" /></button><button aria-label={`Excluir ${item.description}`} onClick={() => setDeleting(item)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></div></div> })}</div>}</div>
    {deleting && <ConfirmDialog open title="Excluir transação?" description={`A transação “${deleting.description}” será removida da sua lista.`} confirmLabel="Excluir transação" onCancel={() => setDeleting(null)} onConfirm={async () => { await remove(deleting.id); setDeleting(null) }} />}
  </section>
}
