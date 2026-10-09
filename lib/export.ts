import type { Goal, GoalContribution } from '@/types/goal'
import type { Transaction } from '@/types/transaction'

type Category = { id: string; name: string; type: 'expense' | 'income' }
export type BackupData = {
  version: 1
  exportedAt: string
  user: { name: string; email: string }
  preferences: { income?: number; goal?: string }
  categories: Category[]
  transactions: Transaction[]
  goals: Goal[]
  contributions: GoalContribution[]
}

export function createBackup(input: Omit<BackupData, 'version' | 'exportedAt'>): BackupData {
  return { version: 1, exportedAt: new Date().toISOString(), ...input }
}

export function serializeBackup(input: Omit<BackupData, 'version' | 'exportedAt'>): string {
  return JSON.stringify(createBackup(input), null, 2)
}

function formulaSafe(value: string) { return /^[=+\-@]/.test(value) ? `'${value}` : value }
function csvCell(value: string | number) { const text = formulaSafe(String(value)); return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text }
function dateLabel(value: string) { const [year, month, day] = value.split('-'); return `${day}/${month}/${year}` }

export function serializeTransactionsCsv(transactions: Transaction[], categories: Category[]): string {
  const names = new Map(categories.map((category) => [category.id, category.name]))
  const rows = transactions.filter((item) => !(item as Transaction & { deletedAt?: string }).deletedAt).map((item) => [dateLabel(item.date), item.type === 'income' ? 'Receita' : 'Despesa', item.description, names.get(item.categoryId) ?? item.categoryId, item.type === 'expense' ? -item.amountCents / 100 : item.amountCents / 100])
  return '\ufeff' + [['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'], ...rows].map((row) => row.map((cell) => csvCell(typeof cell === 'number' ? cell.toFixed(2).replace('.', ',') : cell)).join(';')).join('\r\n')
}

export function downloadText(filename: string, content: string, type: string) {
  if (typeof document === 'undefined') return
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
}
export type { Category }

export const __test__ = { formulaSafe, csvCell, dateLabel }

export default createBackup
