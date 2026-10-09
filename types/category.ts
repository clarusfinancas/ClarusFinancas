import { Utensils, Bus, House, Gamepad2, HeartPulse, GraduationCap, Wallet, MoreHorizontal } from 'lucide-react'

export const categories = [
  { id: 'food', name: 'Alimentação', icon: Utensils, type: 'expense' as const },
  { id: 'transport', name: 'Transporte', icon: Bus, type: 'expense' as const },
  { id: 'housing', name: 'Moradia', icon: House, type: 'expense' as const },
  { id: 'leisure', name: 'Lazer', icon: Gamepad2, type: 'expense' as const },
  { id: 'health', name: 'Saúde', icon: HeartPulse, type: 'expense' as const },
  { id: 'education', name: 'Educação', icon: GraduationCap, type: 'expense' as const },
  { id: 'salary', name: 'Salário', icon: Wallet, type: 'income' as const },
  { id: 'other', name: 'Outros', icon: MoreHorizontal, type: 'expense' as const },
]
export type Category = (typeof categories)[number]
