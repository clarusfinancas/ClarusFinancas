'use client'

import { createElement, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { userStorageKey } from '@/services/auth'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, RefreshCw, Wallet } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { categories } from '@/types/category'
import { getMonthlySummary, getPreviousMonth } from '@/services/transactions'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatSignedCurrency } from '@/lib/format'
import { MonthPicker } from '@/components/form-controls'
import { useGoals } from '@/hooks/useGoals'
import { progress, savedCents } from '@/lib/goals'
import { Target } from 'lucide-react'
import { createDemoGoals } from '@/services/goals'

const money = (cents: number) => formatCurrency(cents / 100)
const signedMoney = (cents: number) => formatSignedCurrency(cents / 100)

function monthLabel(month: string) {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function relativeDate(date: string) {
  const target = new Date(`${date}T12:00:00`)
  const today = new Date()
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const difference = Math.round((todayDay.getTime() - targetDay.getTime()) / 86400000)
  if (difference === 0) return 'hoje'
  if (difference === 1) return 'ontem'
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(target).replace('.', '')
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  const next = new Date(year, monthNumber, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

export default function DashboardPage() {
  const { transactions, loading, error, refresh, loadDemo } = useTransactions()
  const { goals, contributions } = useGoals()
  const hasDemoTransactions = transactions.some((transaction) => transaction.isDemo)
  const [month, setMonth] = useState(currentMonth)
  const summary = useMemo(() => getMonthlySummary(transactions, month), [transactions, month])
  const previous = useMemo(() => getMonthlySummary(transactions, getPreviousMonth(month)), [transactions, month])
  const expensesByCategory = categories.map((category) => ({ ...category, total: summary.current.filter((item) => item.type === 'expense' && item.categoryId === category.id).reduce((sum, item) => sum + item.amountCents, 0) })).filter((item) => item.total > 0).sort((a, b) => b.total - a.total)
  const change = previous.expenses ? ((summary.expenses - previous.expenses) / previous.expenses) * 100 : null
  const isCurrentMonth = month >= currentMonth()

  useEffect(() => {
    if (window.localStorage.getItem(userStorageKey('clarus-onboarding-transaction-id')) && !window.localStorage.getItem(userStorageKey('clarus-onboarding-transaction-toast'))) {
      toast.success('Sua primeira transação já está aqui')
      window.localStorage.setItem(userStorageKey('clarus-onboarding-transaction-toast'), 'shown')
    }
  }, [])

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Carregando seu resumo...</div>
  if (error) return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => void refresh()}><RefreshCw data-icon="inline-start" />Tentar novamente</Button></div>

  return <section className="flex flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm text-muted-foreground">Seu panorama financeiro</p><h2 className="text-2xl font-semibold">{monthLabel(month)}</h2></div>
      <div className="flex items-center gap-2 self-start rounded-xl bg-muted/60 p-1 sm:self-auto"><Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => setMonth(getPreviousMonth(month))}><ArrowLeft data-icon="inline-start" /></Button><div className="min-w-40"><MonthPicker value={month} onChange={setMonth} /></div><Button variant="ghost" size="icon" aria-label="Próximo mês" disabled={isCurrentMonth} onClick={() => setMonth(nextMonth(month))}><ArrowRight data-icon="inline-end" /></Button></div>
    </div>

    <div className="flex flex-col gap-4"><article className="rounded-2xl bg-primary p-5 text-primary-foreground"><div className="flex items-start justify-between"><div><p className="text-sm opacity-80">Saldo do mês</p><p className="mt-2 text-3xl font-semibold">{signedMoney(summary.balance)}</p></div><Wallet className="size-6 opacity-70" /></div>{summary.current.length > 0 && <p className="mt-6 text-sm opacity-80">Receitas menos despesas registradas</p>}<div className="mt-4 border-t border-primary-foreground/20 pt-3 text-sm opacity-90">{change === null ? 'Sem histórico para comparar' : `${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(0)}% em despesas vs. mês anterior`}</div></article><div className="grid grid-cols-1 gap-4 border-t pt-4 min-[400px]:grid-cols-2 min-[400px]:gap-8"><Metric title="Receitas" value={summary.income} icon={<ArrowUpRight />} tone="income" /><Metric title="Despesas" value={summary.expenses} icon={<ArrowDownLeft />} tone="expense" /></div></div>

{summary.current.length === 0 ? <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-6 py-10 text-center shadow-sm"><div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Wallet className="size-5" /></div><div className="flex flex-col gap-1"><h3 className="font-semibold">Nenhuma transação ainda</h3><p className="mx-auto max-w-xs text-sm text-muted-foreground">{isCurrentMonth ? 'Registre sua primeira entrada ou saída para ver o resumo do mês aqui.' : 'Não há transações registradas neste mês.'}</p></div></div> : <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]"><article className="p-1"><div className="flex items-center justify-between"><h3 className="font-semibold">Por categoria</h3><span className="text-xs text-muted-foreground">{expensesByCategory.length} categorias</span></div><div className="mt-5 flex flex-col gap-4">{expensesByCategory.length ? expensesByCategory.slice(0, 5).map((item) => { const Icon = item.icon; return <div key={item.id} className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon className="size-4" /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-sm"><span>{item.name}</span><span className="font-medium">{money(item.total)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(8, (item.total / summary.expenses) * 100)}%` }} /></div></div></div> }) : <p className="text-sm text-muted-foreground">Nenhuma despesa categorizada neste mês.</p>}</div></article><article className="p-1"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Movimentações recentes</h3><Link href="/transactions" className="text-sm font-medium text-primary hover:underline">Ver todas</Link></div><div className="mt-4 flex flex-col divide-y">{summary.current.slice(0, 6).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">{createElement(categories.find((category) => category.id === item.categoryId)?.icon ?? Wallet, { className: 'size-4' })}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{item.description}</p><p className="text-xs text-muted-foreground">{relativeDate(item.date)}</p></div></div><p className={`shrink-0 text-sm font-semibold ${item.type === 'income' ? 'text-primary' : 'text-foreground'}`}>{signedMoney(item.type === 'income' ? item.amountCents : -item.amountCents)}</p></div>)}</div></article></div>}
    <section className="rounded-3xl border border-violet/15 bg-violet/5 p-5"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Suas metas</h3><p className="mt-1 text-sm text-muted-foreground">Pequenos passos, grandes planos.</p></div><Link href="/goals" className="text-sm font-medium text-violet hover:underline">Ver todas</Link></div>{goals.length===0?<div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-card p-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-violet/10 text-violet"><Target/></div><p className="text-sm text-muted-foreground">Crie sua primeira meta</p></div><Link href="/goals" className="inline-flex h-10 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">Criar meta</Link></div>:<div className="mt-5 grid gap-4 md:grid-cols-3">{goals.filter(g=>!g.completedAt).slice(0,3).map(goal=>{const pct=progress(goal,contributions);return <Link href="/goals" key={goal.id} className="rounded-2xl bg-card p-4 transition-shadow hover:shadow-md"><div className="flex justify-between text-sm"><span className="font-medium">{goal.name}</span><span className="text-violet">{pct}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-violet/10"><div className="h-full rounded-full bg-violet" style={{width:`${pct}%`}}/></div><p className="mt-2 text-xs text-muted-foreground">{formatCurrency(savedCents(goal.id,contributions)/100)} guardados</p></Link>})}</div>}</section>
  </section>
}

function Metric({ title, value, icon, tone }: { title: string; value: number; icon: React.ReactNode; tone: 'income' | 'expense' }) {
  return <article className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4 md:block md:bg-transparent md:p-0"><div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone === 'income' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{icon}</div><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-1 text-xl font-semibold">{money(value)}</p></div></article>
}
