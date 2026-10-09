export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function localMonthKey(date = new Date()) {
  return localDateKey(date).slice(0, 7)
}

export function dateFromKey(value: string) {
  return new Date(`${value}T12:00:00`)
}

export function monthLabel(value: string) {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(dateFromKey(`${value}-01`))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function previousMonthKey(value: string) {
  const date = dateFromKey(`${value}-01`)
  date.setMonth(date.getMonth() - 1)
  return localMonthKey(date)
}

export function nextMonthKey(value: string) {
  const date = dateFromKey(`${value}-01`)
  date.setMonth(date.getMonth() + 1)
  return localMonthKey(date)
}

export function isFutureDate(value: string) {
  return value > localDateKey()
}

export function isFutureMonth(value: string) {
  return value > localMonthKey()
}

export function relativeDate(value: string) {
  const target = dateFromKey(value)
  const today = dateFromKey(localDateKey())
  const difference = Math.round((today.getTime() - target.getTime()) / 86400000)
  if (difference === 0) return 'hoje'
  if (difference === 1) return 'ontem'
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(target).replace('.', '')
}

export function monthName(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dateFromKey(`${value}-01`))
}

export function formatLocalDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dateFromKey(value))
}

export function monthKeysAround(value: string) {
  const date = dateFromKey(`${value}-01`)
  return Array.from({ length: 12 }, (_, index) => {
    const item = new Date(date.getFullYear(), index, 1, 12)
    return localMonthKey(item)
  })
}

export const todayISO = localDateKey
export const currentMonthKey = localMonthKey

export function currentDateForInput() {
  return localDateKey()
}

export function currentMonthForInput() {
  return localMonthKey()
}

export function monthKeyFromDate(value: Date) {
  return localMonthKey(value)
}

export function dateKeyFromDate(value: Date) {
  return localDateKey(value)
}

export function toLocalDate(value: string) {
  return dateFromKey(value)
}

export function toLocalMonth(value: string) {
  return dateFromKey(`${value}-01`)
}

export function sameLocalDate(a: string, b: string) {
  return a === b
}

export function sameLocalMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7)
}

export function clampMonth(value: string, max = localMonthKey()) {
  return value > max ? max : value
}

export function clampDate(value: string, max = localDateKey()) {
  return value > max ? max : value
}

export function dateKeyFromTimestamp(value: string | number | Date) {
  const date = new Date(value)
  return localDateKey(date)
}

export function monthKeyFromTimestamp(value: string | number | Date) {
  return localMonthKey(new Date(value))
}

export function parseLocalDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? dateFromKey(value) : undefined
}

export function parseLocalMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value) ? dateFromKey(`${value}-01`) : undefined
}

export function formatMonthYear(value: string) {
  return monthLabel(value)
}

export function formatMonth(value: string) {
  return monthName(value)
}

export function formatDateKey(value: string) {
  return formatLocalDate(value)
}

export function startOfLocalDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

export function endOfLocalDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999)
}

export function daysBetween(a: string, b: string) {
  return Math.round((dateFromKey(b).getTime() - dateFromKey(a).getTime()) / 86400000)
}

export function isToday(value: string) {
  return value === localDateKey()
}

export function isCurrentMonth(value: string) {
  return value.slice(0, 7) === localMonthKey()
}

export function getMonthKey(value = new Date()) {
  return localMonthKey(value)
}

export function getDateKey(value = new Date()) {
  return localDateKey(value)
}

export function getPreviousMonth(value = localMonthKey()) {
  return previousMonthKey(value)
}

export function getNextMonth(value = localMonthKey()) {
  return nextMonthKey(value)
}

export function getMonthLabel(value: string) {
  return monthLabel(value)
}

export function getRelativeDate(value: string) {
  return relativeDate(value)
}

export function getMonthName(value: string) {
  return monthName(value)
}

export function getDateLabel(value: string) {
  return formatLocalDate(value)
}

export function localDateTimeKey(date = new Date()) {
  return `${localDateKey(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`
}

export function addDays(value: string, days: number) {
  const date = dateFromKey(value)
  date.setDate(date.getDate() + days)
  return localDateKey(date)
}

export function addMonths(value: string, months: number) {
  const date = dateFromKey(`${value}-01`)
  date.setMonth(date.getMonth() + months)
  return localMonthKey(date)
}

export function yearOf(value: string) { return Number(value.slice(0, 4)) }
export function monthOf(value: string) { return Number(value.slice(5, 7)) }
export function dayOf(value: string) { return Number(value.slice(8, 10)) }
export function isValidDateKey(value: string) { return Boolean(parseLocalDate(value)) }
export function isValidMonthKey(value: string) { return Boolean(parseLocalMonth(value)) }
export function todayLabel() { return formatLocalDate(localDateKey()) }
export function currentMonthLabel() { return monthLabel(localMonthKey()) }
export function previousMonthLabel() { return monthLabel(previousMonthKey(localMonthKey())) }
export function nextMonthLabel() { return monthLabel(nextMonthKey(localMonthKey())) }
export function currentYear() { return new Date().getFullYear() }
export function currentMonthNumber() { return new Date().getMonth() + 1 }
export function currentDay() { return new Date().getDate() }
export function currentWeekday() { return new Date().getDay() }
export function isSameMonth(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() }
export function isSameDay(a: Date, b: Date) { return isSameMonth(a, b) && a.getDate() === b.getDate() }
export function localDateAtNoon(value = new Date()) { return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12) }
export function localMonthAtNoon(value = new Date()) { return new Date(value.getFullYear(), value.getMonth(), 1, 12) }
export function localDateString(value = new Date()) { return localDateKey(value) }
export function localMonthString(value = new Date()) { return localMonthKey(value) }
export function safeDateKey(value: string | undefined) { return value && isValidDateKey(value) ? value : localDateKey() }
export function safeMonthKey(value: string | undefined) { return value && isValidMonthKey(value) ? value : localMonthKey() }
export function dateRangeLabel(start: string, end: string) { return `${formatLocalDate(start)} – ${formatLocalDate(end)}` }
export function monthsUntil(value: string) { return Math.max(0, (yearOf(localMonthKey()) - yearOf(value)) * 12 + currentMonthNumber() - monthOf(value)) }
export function monthIndex(value: string) { return yearOf(value) * 12 + monthOf(value) }
export function compareMonths(a: string, b: string) { return monthIndex(a) - monthIndex(b) }
export function compareDates(a: string, b: string) { return dateFromKey(a).getTime() - dateFromKey(b).getTime() }
export function sortDateKeys(values: string[]) { return [...values].sort(compareDates) }
export function sortMonthKeys(values: string[]) { return [...values].sort(compareMonths) }
export function uniqueMonthKeys(values: string[]) { return [...new Set(values.map((value) => value.slice(0, 7)))] }
export function uniqueDateKeys(values: string[]) { return [...new Set(values)] }
export function startOfMonth(value: string) { return `${value}-01` }
export function endOfMonth(value: string) { const date = dateFromKey(`${value}-01`); date.setMonth(date.getMonth() + 1); date.setDate(0); return localDateKey(date) }
export function daysInMonth(value: string) { return Number(endOfMonth(value).slice(8, 10)) }
export function dateParts(value: string) { return { year: yearOf(value), month: monthOf(value), day: dayOf(value) } }
export function monthParts(value: string) { return { year: yearOf(value), month: monthOf(value) }
}

export default { localDateKey, localMonthKey, dateFromKey, monthLabel, previousMonthKey, nextMonthKey, relativeDate }
