'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth/auth-shell'
import { PasswordInput, PasswordMatch } from '@/components/forms/password-input'
import { getResetDemoToken, resetPassword } from '@/services/auth'

const schema = z
  .object({
    password: z.string().min(6, 'Use pelo menos 6 caracteres.'),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    path: ['confirm'],
    message: 'As senhas não coincidem.',
  })

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const result = schema.safeParse({ password, confirm })

    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = new URLSearchParams(window.location.search).get('token') || getResetDemoToken()
      await resetPassword(token, password)
      setDone(true)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Não foi possível redefinir a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <p className="text-sm text-muted-foreground">quase lá</p>
      <h2 className="mt-3 font-display text-4xl tracking-[-.04em]">Crie uma nova senha</h2>
      {done ? (
        <div className="mt-10 rounded-2xl border bg-card p-5">
          <Check className="size-5 text-primary" />
          <p className="mt-3 font-medium">Senha atualizada.</p>
          <Link href="/login" className="mt-5 inline-flex text-sm font-medium text-primary underline">
            Voltar para entrar
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-10 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Nova senha</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Pelo menos 6 caracteres"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">Confirme a nova senha</Label>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repita sua senha"
            />
            <PasswordMatch password={password} confirmation={confirm} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="h-12 w-full">
            {loading ? 'Salvando...' : 'Atualizar senha'}
            {!loading && <ArrowRight data-icon="inline-end" />}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />
}
