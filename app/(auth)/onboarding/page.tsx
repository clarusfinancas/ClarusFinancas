'use client'

import { useRef, useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CurrencyInput } from '@/components/forms/currency-input'
import { applyCashMask, formatCurrency, formatDate } from '@/lib/format'
import { parseQuickCapture } from '@/services/quick-capture'
import { getCurrentUser, saveOnboarding, userStorageKey } from '@/services/auth'
import { createTransaction } from '@/services/transactions'
import { toast } from 'sonner'
import { localDateKey } from '@/lib/date'

const goals = ['Organizar meus gastos', 'Juntar dinheiro para uma meta', 'Sair do aperto', 'Investir melhor']

function mapCategory(category: string) {
  return category === 'Alimentação' ? 'food' : category === 'Transporte' ? 'transport' : category === 'Renda' ? 'salary' : 'other'
}

function parseAmountToCents(amount: number) {
  return Math.round(amount * 100)
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('')
  const [income, setIncome] = useState(0)
  const [capture, setCapture] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof parseQuickCapture> | null>(null)
  const captureInputRef = useRef<HTMLInputElement>(null)

  async function next() {
    const currentParsed = step === 3 && capture.trim() ? parseQuickCapture(capture) : parsed
    if (step === 3 && capture.trim() && !parsed) setParsed(currentParsed)
    if (step < 3) {
      setStep((current) => current + 1)
      return
    }

    saveOnboarding({
      goal,
      income: income ? income / 100 : undefined,
      quickCapture: currentParsed || undefined,
    })

    if (currentParsed && currentParsed.amount > 0 && !window.localStorage.getItem(userStorageKey('clarus-onboarding-transaction-id'))) {
      try {
      const created = await createTransaction({ type: currentParsed.type, amountCents: parseAmountToCents(currentParsed.amount), categoryId: mapCategory(currentParsed.category), description: currentParsed.description, date: localDateKey(new Date(currentParsed.date)) })
        window.localStorage.setItem(userStorageKey('clarus-onboarding-transaction-id'), created.id)
        window.dispatchEvent(new Event('clarus-transactions-updated'))
      } catch {
        toast.error('Não foi possível salvar sua primeira transação.')
      }
    }

    window.location.href = '/app'
  }

  return (
    <main className="min-h-screen bg-background px-6 py-7 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-sm text-muted-foreground">{step} de 3</span>
        </div>
        <Progress value={(step / 3) * 100} className="mt-8 h-1" />
        <div className="mx-auto max-w-xl py-20">
          <p className="text-sm text-muted-foreground">vamos deixar tudo com a sua cara</p>

          {step === 1 && (
            <>
              <h1 className="mt-3 font-display text-4xl tracking-[-.04em] sm:text-5xl">O que você quer com o Clarus?</h1>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {goals.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGoal(item)}
                    aria-pressed={goal === item}
                    className={`min-h-28 rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-primary ${goal === item ? 'border-primary bg-primary/10 shadow-sm' : 'bg-card'}`}
                  >
                    <span className="font-display text-2xl text-muted-foreground">0{index + 1}</span>
                    <span className="mt-5 block text-sm font-medium">{item}</span>
                  </button>
                ))}
              </div>
              <Button onClick={next} disabled={!goal} className="mt-10 h-12">Continuar</Button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="mt-3 font-display text-4xl tracking-[-.04em] sm:text-5xl">Qual sua renda mensal aproximada?</h1>
              <div className="mt-10">
                <CurrencyInput autoFocus id="income" cents={income} onCentsChange={setIncome} className="h-16 text-2xl" />
                <button type="button" onClick={() => setIncome(0)} className="mt-4 text-sm text-muted-foreground underline">Prefiro configurar depois</button>
              </div>
              <Button onClick={next} disabled={!income} className="mt-10 h-12">Continuar</Button>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="mt-3 font-display text-4xl tracking-[-.04em] sm:text-5xl">Experimente a captura rápida</h1>
              <p className="mt-4 text-muted-foreground">Escreva como você falaria. O Clarus organiza para você.</p>
              <Input ref={captureInputRef} autoFocus value={capture} onChange={(event) => { const inputType = (event.nativeEvent as InputEvent).inputType; const value = event.target.value; const caret = event.target.selectionStart ?? value.length; const masked = inputType === 'insertFromPaste' ? { text: value, caret } : applyCashMask(value, caret, inputType.startsWith('delete') ? 'delete' : 'insert'); setCapture(masked.text); setParsed(null); requestAnimationFrame(() => captureInputRef.current?.setSelectionRange(masked.caret, masked.caret)) }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229 && capture.trim()) setParsed(parseQuickCapture(capture)) }} className="mt-8 h-16 text-lg" placeholder="café 8,50" />
              {parsed && <div className="mt-3 rounded-2xl border bg-card p-5"><div className="flex items-start justify-between"><div><p className="font-medium">{parsed.description}</p><p className="mt-1 text-sm text-muted-foreground">{parsed.category} · {formatDate(parsed.date)}</p></div><p className="font-display text-xl text-destructive">− {formatCurrency(parsed.amount)}</p></div></div>}
              <Button onClick={next} className="mt-10 h-12">Ir para o Clarus</Button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
