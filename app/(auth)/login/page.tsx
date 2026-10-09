'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth/auth-shell'
import { login } from '@/services/auth'
import { PasswordInput } from '@/components/forms/password-input'
const schema = z.object({ email: z.string().email('Digite um e-mail válido.'), password: z.string().min(1, 'Digite sua senha.') })
export default function LoginPage() { const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false); async function submit(e: React.FormEvent) { e.preventDefault(); const result=schema.safeParse({email,password}); if(!result.success){setError(result.error.issues[0].message);return} setLoading(true);setError(''); try { await login(email,password); window.location.href='/app' } catch(e){setError(e instanceof Error?e.message:'Não foi possível entrar.');setLoading(false)} } return <AuthShell><div><p className="text-sm text-muted-foreground">bem-vindo de volta</p><h2 className="mt-3 font-display text-4xl tracking-[-.04em]">Entre no Clarus</h2><p className="mt-3 text-sm text-muted-foreground">Sua vida financeira, no lugar certo.</p><form onSubmit={submit} className="mt-10 flex flex-col gap-5"><div className="flex flex-col gap-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com" /></div><div className="flex flex-col gap-2"><div className="flex justify-between"><Label htmlFor="password">Senha</Label><Link href="/forgot-password" className="text-xs text-primary hover:underline">Esqueci minha senha</Link></div><PasswordInput id="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></div>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading} className="mt-2 h-12 w-full">{loading?'Entrando...':'Entrar'} {!loading&&<ArrowRight data-icon="inline-end" />}</Button></form><p className="mt-8 text-center text-sm text-muted-foreground">Ainda não tem conta? <Link href="/register" className="font-medium text-primary hover:underline">Criar conta</Link></p></div></AuthShell> }
