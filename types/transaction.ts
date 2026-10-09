export type TransactionType = 'expense' | 'income'
export type Transaction = { id: string; type: TransactionType; amountCents: number; categoryId: string; description: string; date: string; createdAt: string; isDemo?: boolean }
