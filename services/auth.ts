import type { OnboardingData, User } from '@/types'
import { authClient, toUser } from '@/lib/auth-client'
const USER_KEY = 'clarus-user'
const SESSION_KEY = 'clarus-session'
const USERS_KEY = 'clarus-users'
const RESET_KEY = 'clarus-reset'
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))
const read = <T>(key: string, fallback: T): T => { if (typeof window === 'undefined') return fallback; try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback } }
function setSession(user: User) { localStorage.setItem(USER_KEY, JSON.stringify(user)); localStorage.setItem(SESSION_KEY, 'active'); document.cookie = `${SESSION_KEY}=active; path=/; SameSite=Lax` }
export async function register(name: string, email: string, password: string) { const result = await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password }); if (result.error) throw new Error('Não foi possível criar sua conta. Verifique os dados e tente novamente.'); const user = toUser(result.data.user); setSession(user); return user }
export async function login(email: string, password: string) { const result = await authClient.signIn.email({ email: email.trim().toLowerCase(), password }); if (result.error) throw new Error('E-mail ou senha incorretos.'); const user = toUser(result.data.user); setSession(user); return user }
export async function logout() { await authClient.signOut(); localStorage.removeItem(USER_KEY); localStorage.removeItem(SESSION_KEY); document.cookie = `${SESSION_KEY}=; path=/; max-age=0; SameSite=Lax` }
export function getCurrentUser(): User | null { return read<User | null>(USER_KEY, null) }
export function userStorageKey(key: string) { const user = getCurrentUser(); return `${key}:${user?.id ?? 'anonymous'}` }
export function saveOnboarding(data: OnboardingData) { localStorage.setItem(userStorageKey('clarus-onboarding'), JSON.stringify(data)) }
export async function requestPasswordReset(email: string) { await delay(); const normalizedEmail = email.trim().toLowerCase(); const users = read<Record<string, { user: User; password: string }>>(USERS_KEY, {}); if (!users[normalizedEmail]) throw new Error('Não encontramos uma conta com esse e-mail.'); const token = crypto.randomUUID(); localStorage.setItem(RESET_KEY, JSON.stringify({ token, email: normalizedEmail, expires: Date.now() + 15 * 60 * 1000 })); return token }
export async function resetPassword(token: string, password: string) { await delay(); const reset = read<{ token: string; email: string; expires: number } | null>(RESET_KEY, null); if (!reset || reset.token !== token || reset.expires < Date.now()) throw new Error('Este link expirou. Solicite uma nova redefinição.'); const users = read<Record<string, { user: User; password: string }>>(USERS_KEY, {}); if (!users[reset.email]) throw new Error('Conta não encontrada.'); users[reset.email].password = password; localStorage.setItem(USERS_KEY, JSON.stringify(users)); localStorage.removeItem(RESET_KEY) }
export function getResetDemoToken() { return read<{ token: string } | null>(RESET_KEY, null)?.token ?? '' }
