'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeftRight, Home, LogOut, PanelLeft, Target, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { QuickCapture } from '@/components/quick-capture'
import { getCurrentUser, logout, userStorageKey } from '@/services/auth'
import { getSessionUser } from '@/lib/auth-client'
import type { User } from '@/types'
import { TransactionsProvider } from '@/hooks/useTransactions'
import { clearDemoTransactions } from '@/services/transactions'
import { GoalsProvider } from '@/hooks/useGoals'
import { clearDemoGoals } from '@/services/goals'
import { UserAvatar } from '@/components/user-avatar'

const nav = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/goals', label: 'Metas', icon: Target },
  { href: '/profile', label: 'Perfil', icon: UserCircle },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [hasDemo, setHasDemo] = useState(false)

  useEffect(() => {
    let active = true
    void getSessionUser().then((sessionUser) => {
      if (!active || !sessionUser) {
        router.replace('/login')
        return
      }
      const currentUser = { id: sessionUser.id, name: sessionUser.name, email: sessionUser.email, image: sessionUser.image }
      window.localStorage.setItem('clarus-user', JSON.stringify(currentUser))
      const onboarding = window.localStorage.getItem(userStorageKey('clarus-onboarding'))
      if (!onboarding) {
        router.replace('/onboarding')
        return
      }
      setCollapsed(window.localStorage.getItem('clarus-sidebar-collapsed') === 'true')
      setUser(currentUser)
      setHasDemo(JSON.parse(window.localStorage.getItem(userStorageKey('clarus-transactions')) ?? '[]').some((item: { isDemo?: boolean }) => item.isDemo))
      setReady(true)
    })
    return () => { active = false }
  }, [router])
  useEffect(() => { const sync = () => { const next = getCurrentUser(); if (next) setUser(next) }; window.addEventListener('clarus-profile-updated', sync); return () => window.removeEventListener('clarus-profile-updated', sync) }, [])

  if (!ready || !user) return null

  const title = nav.find((item) => path.startsWith(item.href))?.label ?? 'Clarus'
  const firstName = user.name.split(' ')[0]
  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    window.localStorage.setItem('clarus-sidebar-collapsed', String(next))
  }

  return (
    <TransactionsProvider><GoalsProvider>
      <div className="min-h-screen bg-background lg:flex">
      <aside className={`hidden shrink-0 flex-col bg-muted/30 p-4 transition-all lg:flex ${collapsed ? 'w-20' : 'w-60'}`}>
        <div className="mb-10 flex items-center justify-between">
          {!collapsed && <Logo />}
          <button aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} onClick={toggleCollapsed} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><PanelLeft className="size-5" /></button>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} title={collapsed ? label : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${path.startsWith(href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'} ${collapsed ? 'justify-center' : ''}`}><Icon />{!collapsed && label}</Link>
          ))}
        </nav>
        <div className={`flex items-center gap-3 border-t pt-4 ${collapsed ? 'justify-center' : ''}`}>
          <UserAvatar name={user.name} image={user.image} size="sm" />
          {!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>}
          <button aria-label="Sair" onClick={async () => { await logout(); router.replace('/login') }} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><LogOut className="size-4" /></button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">
        <header className="flex items-center justify-between border-b px-5 py-4 lg:px-8"><div><p className="text-sm text-muted-foreground">Olá, {firstName}</p><h1 className="text-xl font-semibold">{title}</h1></div><div className="flex items-center gap-2"><UserAvatar name={user.name} image={user.image} size="sm" />{hasDemo && <button type="button" onClick={async () => { await clearDemoTransactions(); setHasDemo(false); window.dispatchEvent(new Event('clarus-transactions-updated')) }} className="hidden text-xs text-muted-foreground underline-offset-4 hover:underline sm:inline">Limpar dados de exemplo</button>}</div></header>
        <div className="sticky top-0 z-30 border-b bg-background/90 px-5 py-3 backdrop-blur-xl lg:px-8"><QuickCapture /></div><div className="p-5 lg:p-8">{children}</div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        {nav.slice(0, 2).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-w-16 flex-col items-center gap-1 py-1 text-xs ${path.startsWith(href) ? 'text-primary' : 'text-muted-foreground'}`}><Icon className="size-5" />{label}</Link>)}
        {nav.slice(2).map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-w-16 flex-col items-center gap-1 py-1 text-xs ${path.startsWith(href) ? 'text-primary' : 'text-muted-foreground'}`}><Icon className="size-5" />{label}</Link>)}
      </nav>
      </div>
    </GoalsProvider></TransactionsProvider>
  )
}
