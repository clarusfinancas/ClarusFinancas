export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatSignedCurrency(value: number) {
  const formatted = formatCurrency(Math.abs(value))
  return value < 0 ? `−${formatted}` : formatted
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value))
}

export function applyCashMask(text: string, caret: number, inputType: 'insert' | 'delete'): { text: string; caret: number } {
  const beforeCursor = text.slice(0, caret)
  const tokenMatch = beforeCursor.match(/[0-9.,]+$/)
  if (!tokenMatch || tokenMatch.index === undefined) return { text, caret }

  const tokenStart = tokenMatch.index
  const token = tokenMatch[0]
  let digits = token.replace(/\D/g, '')

  // When backspace removes punctuation, the browser leaves the digits intact.
  // Only remove another digit when the resulting token has no punctuation.
  if (inputType === 'delete' && !/[,.]/.test(token)) digits = digits.slice(0, -1)

  digits = digits.replace(/^0+/, '').slice(0, 8)
  if (!digits) return { text: text.slice(0, tokenStart) + text.slice(caret), caret: tokenStart }

  const normalized = digits.padStart(3, '0')
  const integer = normalized.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const formatted = `${integer},${normalized.slice(-2)}`
  const nextText = text.slice(0, tokenStart) + formatted + text.slice(caret)
  return { text: nextText, caret: tokenStart + formatted.length }
}

export function applyNumberMask(text: string, caret: number | null) {
  const match = text.match(/(^|\s)(\d[\d.,]*)(?=\s|$)/)
  if (!match || match.index === undefined) return { text, caret }
  const start = match.index + match[1].length
  const token = match[2]
  const commaIndex = token.indexOf(',')
  const dotIndex = token.indexOf('.')
  const decimalIndex = commaIndex >= 0 ? commaIndex : (dotIndex >= 0 && token.slice(dotIndex + 1).length <= 2 ? dotIndex : -1)
  const hasDecimal = decimalIndex >= 0
  const integerRaw = hasDecimal ? token.slice(0, decimalIndex) : token
  const decimalRaw = hasDecimal ? token.slice(decimalIndex + 1).replace(/\D/g, '').slice(0, 2) : ''
  const integerDigits = integerRaw.replace(/\D/g, '').slice(0, 6).replace(/^0+(?=\d)/, '') || '0'
  const integer = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const formatted = hasDecimal ? `${integer},${decimalRaw}` : integer
  const nextText = text.slice(0, start) + formatted + text.slice(start + token.length)
  const digitsBeforeCaret = caret === null ? null : text.slice(start, Math.min(caret, start + token.length)).replace(/\D/g, '').length
  const nextCaret = digitsBeforeCaret === null ? null : start + Math.min(formatted.length, digitsBeforeCaret + (hasDecimal && digitsBeforeCaret > integerRaw.replace(/\D/g, '').length ? 1 : 0))
  return { text: nextText, caret: nextCaret }
}

export const applyCashRegisterMask = (text: string, caret: number | null) => {
  const result = applyNumberMask(text, caret)
  return { value: result.text, caret: result.caret }
}
