'use client'

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,
})

export const { signIn, signUp, signOut, useSession } = authClient

export async function getSessionUser() {
  const result = await authClient.getSession()
  return result.data?.user ?? null
}

export function toUser(user: { id: string; name: string; email: string; image?: string | null }) {
  return { id: user.id, name: user.name, email: user.email, image: user.image }
}
