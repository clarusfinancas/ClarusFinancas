import type { Transaction } from '@/types/transaction'
import { userStorageKey } from '@/services/auth'
import { localDateKey, localMonthKey, previousMonthKey, dateFromKey, monthLabel as localMonthLabel, monthName as localMonthName } from '@/lib/date'

const KEY = 'clarus-transactions'
const wait = () => new Promise((resolve) => setTimeout(resolve, 180))
function storageKey() { return userStorageKey(KEY) }
function read(): Transaction[] { if (typeof window === 'undefined') return []; try { return JSON.parse(window.localStorage.getItem(storageKey()) || '[]') as Transaction[] } catch { return [] } }
function write(items: Transaction[]) { window.localStorage.setItem(storageKey(), JSON.stringify(items)); window.dispatchEvent(new Event('clarus-transactions-updated')) }

export async function createTransaction(input: Omit<Transaction, 'id' | 'createdAt'>) { await wait(); const item = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; write([item, ...read()]); return item }
export async function updateTransaction(id: string, input: Partial<Omit<Transaction, 'id' | 'createdAt'>>) { await wait(); const item = read().find((entry) => entry.id === id); if (!item) throw new Error('Transação não encontrada.'); const updated = { ...item, ...input }; write(read().map((entry) => entry.id === id ? updated : entry)); return updated }
export async function deleteTransaction(id: string) { await wait(); const item = read().find((entry) => entry.id === id); if (item) write(read().map((entry) => entry.id === id ? { ...entry, deletedAt: new Date().toISOString() } : entry)); return item }
export async function restoreTransaction(id: string) { await wait(); write(read().map((entry) => { if (entry.id !== id) return entry; const { deletedAt: _, ...rest } = entry as Transaction & { deletedAt?: string }; return rest })) }
export async function listTransactions(): Promise<Transaction[]> { await wait(); return read().filter((item) => !(item as Transaction & { deletedAt?: string }).deletedAt) }
export async function createDemoTransactions() { await wait(); const now = new Date(); const months = [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() - 1, 1)]; const examples = [['income',450000,'salary','Salário'],['income',85000,'other','Freelance'],['expense',3290,'food','Almoço'],['expense',2490,'transport','Uber'],['expense',890,'food','Café'],['expense',12990,'housing','Aluguel'],['expense',4590,'health','Farmácia'],['expense',7990,'education','Curso'],['expense',3590,'other','Mercado'],['expense',1890,'leisure','Cinema'],['expense',2490,'transport','Combustível'],['expense',5990,'other','Internet'],['expense',2990,'other','Assinatura'],['income',120000,'other','Projeto extra']] as const; const items = [...examples, ...examples.slice(2, 13)].map(([type, amountCents, categoryId, description], index) => { const base = months[index % 2]; const date = new Date(base.getFullYear(), base.getMonth(), Math.min(26, 2 + (index * 2) % 24)); return { id: crypto.randomUUID(), type, amountCents, categoryId, description, date: date.toISOString().slice(0, 10), createdAt: new Date().toISOString(), isDemo: true } as Transaction }); write([...items, ...read()]) }
export async function clearDemoTransactions() { await wait(); write(read().filter((item) => !item.isDemo)) }
export function getMonthlySummary(transactions: Transaction[], month: string) { const current = transactions.filter((item) => item.date.slice(0, 7) === month); const income = current.filter((item) => item.type === 'income').reduce((total, item) => total + item.amountCents, 0); const expenses = current.filter((item) => item.type === 'expense').reduce((total, item) => total + item.amountCents, 0); return { current, income, expenses, balance: income - expenses } }
export function getPreviousMonth(month: string) { return previousMonthKey(month) }
export function subscribeTransactions(listener: () => void) { window.addEventListener('clarus-transactions-updated', listener); return () => window.removeEventListener('clarus-transactions-updated', listener) }

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>
export type TransactionUpdate = Partial<TransactionInput>

export function getAllTransactions() { return read() }
export function replaceTransactions(items: Transaction[]) { write(items) }
export function formatTransactionDate(date: string) { return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dateFromKey(date)) }
export function isFutureDate(date: string) { return date > localDateKey() }
export function transactionMonth(date: string) { return date.slice(0, 7) }
export function monthLabel(month: string) { return localMonthLabel(month) }
export function monthName(month: string) { return localMonthName(month) }
export function sortTransactions(items: Transaction[]) { return [...items].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)) }
export function searchTransactions(items: Transaction[], query: string) { const normalized = query.trim().toLocaleLowerCase('pt-BR'); return normalized ? items.filter((item) => `${item.description} ${item.categoryId}`.toLocaleLowerCase('pt-BR').includes(normalized)) : items }
export function sumTransactions(items: Transaction[]) { return items.reduce((sum, item) => sum + (item.type === 'income' ? item.amountCents : -item.amountCents), 0) }
export function categoryTotals(items: Transaction[]) { return items.reduce<Record<string, number>>((result, item) => { result[item.categoryId] = (result[item.categoryId] || 0) + item.amountCents; return result }, {}) }
export function hasDemoTransactions(items: Transaction[]) { return items.some((item) => item.isDemo) }
export function clearDeletedTransactions() { write(read().filter((item) => !(item as Transaction & { deletedAt?: string }).deletedAt)) }

export function getTransaction(id: string) { return read().find((item) => item.id === id) }
export function deleteTransactionsByCategory(categoryId: string) { write(read().map((item) => item.categoryId === categoryId ? { ...item, categoryId: 'other' } : item)) }
export function countTransactions(items: Transaction[], categoryId: string) { return items.filter((item) => item.categoryId === categoryId).length }
export function isTransactionDemo(item: Transaction) { return item.isDemo === true }
export function transactionAmount(item: Transaction) { return item.amountCents / 100 }
export function normalizeAmountCents(value: number) { return Math.round(value) }

export function getVisibleTransactions(items: Transaction[]) { return items.filter((item) => !(item as Transaction & { deletedAt?: string }).deletedAt) }
export function getDeletedTransaction(id: string) { return read().find((item) => item.id === id && (item as Transaction & { deletedAt?: string }).deletedAt) }
export function purgeTransaction(id: string) { write(read().filter((item) => item.id !== id)) }
export function updateCategory(id: string, categoryId: string) { write(read().map((item) => item.id === id ? { ...item, categoryId } : item)) }
export function transactionExists(id: string) { return Boolean(getTransaction(id)) }
export function allAreDemo(items: Transaction[]) { return items.length > 0 && items.every((item) => item.isDemo) }
export function currentMonth() { return localMonthKey() }
export function previousMonth() { return getPreviousMonth(currentMonth()) }
export function isIncome(item: Transaction) { return item.type === 'income' }
export function isExpense(item: Transaction) { return item.type === 'expense' }
export function absoluteAmount(item: Transaction) { return Math.abs(item.amountCents) }
export function signedAmount(item: Transaction) { return item.type === 'income' ? item.amountCents : -item.amountCents }
export function transactionKey(item: Transaction) { return `${item.date}-${item.id}` }
export function dedupeTransactions(items: Transaction[]) { return Array.from(new Map(items.map((item) => [item.id, item])).values()) }
export function cloneTransaction(item: Transaction): Transaction { return { ...item } }
export function validateTransaction(input: TransactionInput) { return input.amountCents > 0 && Boolean(input.description.trim()) && Boolean(input.date) }
export function transactionCount(items: Transaction[]) { return items.length }
export function emptyTransactions(): Transaction[] { return [] }
export function getTransactionIds(items: Transaction[]) { return items.map((item) => item.id) }
export function filterByType(items: Transaction[], type?: Transaction['type']) { return type ? items.filter((item) => item.type === type) : items }
export function filterByCategory(items: Transaction[], categoryId?: string) { return categoryId ? items.filter((item) => item.categoryId === categoryId) : items }
export function filterByMonth(items: Transaction[], month?: string) { return month ? items.filter((item) => item.date.startsWith(month)) : items }
export function transactionDescription(item: Transaction) { return item.description }
export function transactionDate(item: Transaction) { return item.date }
export function transactionCategory(item: Transaction) { return item.categoryId }
export function transactionType(item: Transaction) { return item.type }
export function transactionAmountCents(item: Transaction) { return item.amountCents }
export function transactionCreatedAt(item: Transaction) { return item.createdAt }
export function transactionIsDemo(item: Transaction) { return Boolean(item.isDemo) }
export function transactionIsDeleted(item: Transaction & { deletedAt?: string }) { return Boolean(item.deletedAt) }
export function transactionDisplayAmount(item: Transaction) { return `${item.type === 'income' ? '+' : '-'}${(item.amountCents / 100).toFixed(2)}` }
export function transactionMonthKey(item: Transaction) { return item.date.slice(0, 7) }
export function transactionMatches(item: Transaction, query: string) { return searchTransactions([item], query).length > 0 }
export function getTransactionSummary(items: Transaction[]) { return { count: items.length, total: sumTransactions(items) } }
export function transactionData(items: Transaction[]) { return items.map(cloneTransaction) }
export function transactionsForMonth(items: Transaction[], month: string) { return filterByMonth(items, month) }
export function transactionsForCategory(items: Transaction[], categoryId: string) { return filterByCategory(items, categoryId) }
export function transactionsForType(items: Transaction[], type: Transaction['type']) { return filterByType(items, type) }
export function transactionsForQuery(items: Transaction[], query: string) { return searchTransactions(items, query) }
export function isValidDate(date: string) { return /^\d{4}-\d{2}-\d{2}$/.test(date) }
export function isValidType(type: string): type is Transaction['type'] { return type === 'income' || type === 'expense' }
export function isValidAmount(amount: number) { return Number.isFinite(amount) && amount > 0 }
export function transactionsToJSON(items: Transaction[]) { return JSON.stringify(items) }
export function transactionsFromJSON(value: string): Transaction[] { try { return JSON.parse(value) as Transaction[] } catch { return [] } }
export function transactionLabel(item: Transaction) { return item.description || 'Sem descrição' }
export function transactionSign(item: Transaction) { return item.type === 'income' ? 1 : -1 }
export function transactionValue(item: Transaction) { return item.amountCents * transactionSign(item) }
export function isCurrentMonth(item: Transaction) { return item.date.startsWith(currentMonth()) }
export function isPreviousMonth(item: Transaction) { return item.date.startsWith(previousMonth()) }
export function transactionHasCategory(item: Transaction, categoryId: string) { return item.categoryId === categoryId }
export function transactionHasDescription(item: Transaction, description: string) { return item.description.toLocaleLowerCase('pt-BR').includes(description.toLocaleLowerCase('pt-BR')) }
export function filterDemo(items: Transaction[]) { return items.filter((item) => item.isDemo) }
export function filterReal(items: Transaction[]) { return items.filter((item) => !item.isDemo) }
export function demoCount(items: Transaction[]) { return filterDemo(items).length }
export function realCount(items: Transaction[]) { return filterReal(items).length }
export function transactionDays(items: Transaction[]) { return new Set(items.map((item) => item.date)).size }
export function transactionCategories(items: Transaction[]) { return new Set(items.map((item) => item.categoryId)) }
export function transactionTypes(items: Transaction[]) { return new Set(items.map((item) => item.type)) }
export function transactionMonths(items: Transaction[]) { return new Set(items.map((item) => transactionMonthKey(item))) }
export function transactionIsInMonth(item: Transaction, month: string) { return transactionMonthKey(item) === month }
export function transactionIsInCategory(item: Transaction, categoryId: string) { return item.categoryId === categoryId }
export function transactionIsInType(item: Transaction, type: Transaction['type']) { return item.type === type }
export function transactionIsInQuery(item: Transaction, query: string) { return transactionMatches(item, query) }
export function getMonthKey(date = new Date()) { return localMonthKey(date) }
export function parseMonthKey(value: string) { return /^\d{4}-\d{2}$/.test(value) ? value : currentMonth() }
export function transactionFilter(items: Transaction[], filters: { month?: string; type?: Transaction['type']; categoryId?: string; query?: string }) { return searchTransactions(filterByCategory(filterByType(filterByMonth(items, filters.month), filters.type), filters.categoryId), filters.query || '') }
export function transactionSort(items: Transaction[], ascending = false) { return [...items].sort((a, b) => ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)) }
export function transactionPage(items: Transaction[], page: number, pageSize = 10) { return items.slice(Math.max(0, page - 1) * pageSize, page * pageSize) }
export function transactionPages(items: Transaction[], pageSize = 10) { return Math.max(1, Math.ceil(items.length / pageSize)) }
export function transactionDisplayDate(date: string) { return formatTransactionDate(date) }
export function isTransactionInput(value: unknown): value is TransactionInput { return Boolean(value && typeof value === 'object') }
export function transactionInput(item: Transaction): TransactionInput { const { id: _, createdAt: __, ...input } = item; return input }
export function transactionWithDemo(item: Transaction, isDemo = true) { return { ...item, isDemo } }
export function transactionWithoutDemo(item: Transaction) { const { isDemo: _, ...rest } = item; return rest }
export function transactionMonthName(month: string) { return monthName(month) }
export function transactionMonthLabel(month: string) { return monthLabel(month) }
export function transactionToInput(item: Transaction): TransactionInput { return transactionInput(item) }
export function getStoredTransactions() { return getAllTransactions() }
export function setStoredTransactions(items: Transaction[]) { replaceTransactions(items) }
export function removeDemoTransactions() { return clearDemoTransactions() }
export function loadDemoTransactions() { return createDemoTransactions() }
export function updateStoredTransaction(id: string, input: TransactionUpdate) { return updateTransaction(id, input) }
export function removeStoredTransaction(id: string) { return deleteTransaction(id) }
export function restoreStoredTransaction(id: string) { return restoreTransaction(id) }
export function transactionServiceVersion() { return '1' }
export const TRANSACTIONS_KEY = KEY
export const TRANSACTION_PAGE_SIZE = 10
export const TRANSACTION_EVENT = 'clarus-transactions-updated'
export const TRANSACTION_TYPES = ['expense', 'income'] as const
export const EMPTY_TRANSACTION_INPUT = { type: 'expense' as const, amountCents: 0, categoryId: 'other', description: '', date: currentMonth() + '-01' }
export const transactionStorage = { read, write }
export default { createTransaction, updateTransaction, deleteTransaction, restoreTransaction, listTransactions }

type DeletedTransaction = Transaction & { deletedAt?: string }
export function getDeleted(items: Transaction[]) { return items.filter((item) => Boolean((item as DeletedTransaction).deletedAt)) }
export function withoutDeleted(items: Transaction[]) { return items.filter((item) => !Boolean((item as DeletedTransaction).deletedAt)) }
export function hasRealTransactions(items: Transaction[]) { return items.some((item) => !item.isDemo) }
export function hasTransactions(items: Transaction[]) { return items.length > 0 }
export function transactionMonthForDate(date: Date) { return localMonthKey(date) }
export function transactionDateForMonth(month: string, day: number) { const [year, monthNumber] = month.split('-').map(Number); return `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}` }
export function transactionAmountLabel(cents: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100) }
export function transactionKindLabel(type: Transaction['type']) { return type === 'income' ? 'Receita' : 'Despesa' }
