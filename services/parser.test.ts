import { describe, expect, it } from 'vitest'
import { categorizeTransaction } from './categorizer-keywords'
import { parseTransactionText } from './parser'

describe('Clarus capture categorization', () => {
  const cases = [
    ['café 8,50', 'food'], ['pão francês 6', 'food'], ['padaria 20', 'food'], ['almoço 32', 'food'], ['pipoca 18', 'food'],
    ['esmalte 12', 'other'], ['manicure 80', 'other'], ['gasolina 150', 'transport'], ['Uber 24', 'transport'], ['ônibus 5', 'transport'],
    ['conta de luz 120', 'housing'], ['internet 100', 'housing'], ['aluguel 1.800,00', 'housing'], ['Netflix 55,90', 'leisure'], ['farmácia 42,30', 'health'],
  ] as const
  it.each(cases)('%s is classified as %s', (text, category) => expect(categorizeTransaction(text, 'expense').categoryId).toBe(category))
  it('supports accents, spelling variations and context', () => {
    expect(categorizeTransaction('PÃO francês da padaria', 'expense').categoryId).toBe('food')
    expect(categorizeTransaction('uber para o trabalho', 'expense').categoryId).toBe('transport')
    expect(categorizeTransaction('mercado com produtos da semana', 'expense').categoryId).toBe('food')
  })
  it('does not invent categories for unknown descriptions', () => {
    const result = categorizeTransaction('presente xyz 50', 'expense')
    expect(result.categoryId).toBe('other')
    expect(result.confidence).toBeLessThan(0.6)
  })
  it('preserves income classification', () => expect(categorizeTransaction('salário 4.500,00', 'income').categoryId).toBe('salary'))
  it('parses dates and amounts without changing the existing transaction flow', () => {
    const result = parseTransactionText('café 8,50 ontem')
    expect('error' in result).toBe(false)
    if (!('error' in result)) { expect(result.amountCents).toBe(850); expect(result.categoryId).toBe('food'); expect(result.date).not.toBe(new Date().toISOString().slice(0, 10)) }
  })
})
