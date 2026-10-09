import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'

const origin = (value?: string) => value ? (value.startsWith('http') ? value : `https://${value}`) : undefined
const productionOrigins = [origin(process.env.VERCEL_PROJECT_PRODUCTION_URL), origin(process.env.VERCEL_URL)].filter(Boolean) as string[]
const developmentOrigins = ['http://localhost:3000', process.env.V0_RUNTIME_URL, process.env.V0_DEV_APP_URL, process.env.V0_BUILD_URL, process.env.V0_SANDBOX_URL].filter(Boolean) as string[]

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  advanced: {
    database: {
      generateId: 'uuid',
    },
    ...(process.env.NODE_ENV === 'development'
      ? { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } }
      : {}),
  },
  baseURL: process.env.BETTER_AUTH_URL ? origin(process.env.BETTER_AUTH_URL) : productionOrigins[0] ?? process.env.V0_RUNTIME_URL,
  trustedOrigins: process.env.NODE_ENV === 'development' ? developmentOrigins : productionOrigins,
})
