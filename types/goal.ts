export type Goal = { id: string; name: string; targetCents: number; deadline?: string; icon: string; createdAt: string; completedAt?: string; isDemo?: boolean }
export type GoalContribution = { id: string; goalId: string; amountCents: number; date: string; note?: string; createdAt: string; isDemo?: boolean }
export type GoalWithProgress = Goal & { savedCents: number } 
