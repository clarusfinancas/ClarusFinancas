export type User = { id: string; name: string; email: string; image?: string | null }
export type OnboardingData = { goal?: string; income?: number; quickCapture?: ParsedTransaction }
export type ParsedTransaction = { description: string; amount: number; category: string; type: 'expense' | 'income'; date: string }
