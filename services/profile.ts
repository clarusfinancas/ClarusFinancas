'use client'

import { authClient } from '@/lib/auth-client'
import { getCurrentUser, userStorageKey } from '@/services/auth'
import { getAllTransactions, replaceTransactions } from '@/services/transactions'
import type { Transaction } from '@/types/transaction'
import type { OnboardingData } from '@/types'

export type ProfilePreferences = { currency: 'BRL'; weekStartsOnMonday: boolean }
export type ProfileBackup = { version: 1; exportedAt: string; onboarding: OnboardingData | null; preferences: ProfilePreferences; transactions: Transaction[]; goals: unknown[]; contributions: unknown[]; categories: unknown[] }

const preferencesKey = 'clarus-preferences'
const categoriesKey = 'clarus-custom-categories'
const read = <T>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(userStorageKey(key)) || JSON.stringify(fallback)) as T } catch { return fallback } }
const write = (key: string, value: unknown) => localStorage.setItem(userStorageKey(key), JSON.stringify(value))

export function getOnboardingProfile(): OnboardingData { return read('clarus-onboarding', {}) }
export function saveOnboardingProfile(value: Partial<OnboardingData>) { const next = { ...getOnboardingProfile(), ...value }; write('clarus-onboarding', next); window.dispatchEvent(new Event('clarus-profile-updated')); return next }

export function getPreferences(): ProfilePreferences { return read(preferencesKey, { currency: 'BRL', weekStartsOnMonday: true }) }
export function savePreferences(value: Partial<ProfilePreferences>) { const next = { ...getPreferences(), ...value }; write(preferencesKey, next); window.dispatchEvent(new Event('clarus-profile-updated')); return next }
export function getProfileBackup(): ProfileBackup { return { version: 1, exportedAt: new Date().toISOString(), onboarding: read<OnboardingData | null>('clarus-onboarding', null), preferences: getPreferences(), transactions: getAllTransactions().map(({ id: _, createdAt: __, ...item }) => ({ ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() })), goals: read('clarus-goals', []), contributions: read('clarus-goal-contributions', []), categories: read(categoriesKey, []) } }
export function downloadBackup() { const blob = new Blob([JSON.stringify(getProfileBackup(), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `clarus-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url) }
export function importBackup(value: unknown) {
  if (!value || typeof value !== 'object' || (value as { version?: number }).version !== 1) throw new Error('Arquivo inválido ou incompatível.')
  const backup = value as ProfileBackup & { data?: Partial<ProfileBackup> }
  const importedTransactions = Array.isArray(backup.transactions) ? backup.transactions : Array.isArray(backup.data?.transactions) ? backup.data.transactions : []
  const existing = getAllTransactions()
  const byId = new Map(existing.map((item) => [item.id, item]))
  importedTransactions.forEach((item) => {
    if (!item || typeof item !== 'object' || !item.description || !item.date || !item.type || !Number.isFinite(item.amountCents)) return
    const id = item.id && !byId.has(item.id) ? item.id : crypto.randomUUID()
    byId.set(id, { ...item, id, createdAt: item.createdAt || new Date().toISOString() })
  })
  replaceTransactions([...byId.values()])
  if (backup.preferences) savePreferences(backup.preferences)
  if (backup.onboarding) write('clarus-onboarding', backup.onboarding)
  if (Array.isArray(backup.goals)) write('clarus-goals', backup.goals)
  if (Array.isArray(backup.contributions)) write('clarus-goal-contributions', backup.contributions)
  if (Array.isArray(backup.categories)) write(categoriesKey, backup.categories)
  window.dispatchEvent(new Event('clarus-goals-updated'))
  window.dispatchEvent(new Event('clarus-profile-updated'))
}
export async function updateProfileName(name: string) { const trimmed = name.trim(); if (trimmed.length < 2 || trimmed.length > 60) throw new Error('Digite um nome entre 2 e 60 caracteres.'); const result = await (authClient as unknown as { updateUser: (input: { name: string }) => Promise<{ error?: unknown; data?: { user?: { name: string } } }> }).updateUser({ name: trimmed }); if (result.error) throw new Error('Não foi possível atualizar seu nome.'); const user = getCurrentUser(); if (user) localStorage.setItem('clarus-user', JSON.stringify({ ...user, name: trimmed })); window.dispatchEvent(new Event('clarus-profile-updated')); return trimmed }
export async function updateProfileImage(image: string | null) {
  if (image !== null && !(/^data:image\/(jpeg|webp|png);base64,/i.test(image) || /^https:\/\//i.test(image)) ) throw new Error('Formato de imagem inválido.')
  if (image && image.length > 150 * 1024) throw new Error('A imagem ficou grande demais.')
  const result = await (authClient as unknown as { updateUser: (input: { image: string | null }) => Promise<{ error?: unknown }> }).updateUser({ image })
  if (result.error) throw new Error('Não foi possível atualizar sua foto.')
  const user = getCurrentUser(); if (user) localStorage.setItem('clarus-user', JSON.stringify({ ...user, image }))
  window.dispatchEvent(new Event('clarus-profile-updated'))
}

export async function changeProfilePassword(currentPassword: string, newPassword: string) { const result = await (authClient as unknown as { changePassword: (input: { currentPassword: string; newPassword: string; revokeOtherSessions: boolean }) => Promise<{ error?: unknown }> }).changePassword({ currentPassword, newPassword, revokeOtherSessions: false }); if (result.error) throw new Error('Não foi possível alterar a senha. Confira sua senha atual.'); }
export function clearLocalProfileData() { const user = getCurrentUser(); if (!user) return; ['clarus-onboarding', 'clarus-preferences', 'clarus-transactions', 'clarus-goals', 'clarus-goal-contributions', 'clarus-custom-categories'].forEach((key) => localStorage.removeItem(userStorageKey(key))); localStorage.removeItem('clarus-user'); localStorage.removeItem('clarus-session') }
export function subscribeProfile(listener: () => void) { window.addEventListener('clarus-profile-updated', listener); return () => window.removeEventListener('clarus-profile-updated', listener) }
export { categoriesKey }
