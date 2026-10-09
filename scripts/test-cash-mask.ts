import { applyCashMask } from '../lib/format'

const cases: Array<[string, number, 'insert' | 'delete', string]> = [
  ['café 8', 6, 'insert', 'café 0,08'],
  ['café 85', 7, 'insert', 'café 0,85'],
  ['café 850', 8, 'insert', 'café 8,50'],
  ['ração 7525', 10, 'insert', 'ração 75,25'],
  ['ração 7,525', 11, 'insert', 'ração 75,25'],
  ['ração 7,520', 11, 'insert', 'ração 75,20'],
  ['salário 450000', 14, 'insert', 'salário 4.500,00'],
  ['uber 2400 ontem', 9, 'insert', 'uber 24,00 ontem'],
  ['café 12345678', 14, 'insert', 'café 123.456,78'],
  ['café 75,2', 9, 'delete', 'café 7,52'],
  ['café 0,0', 8, 'delete', 'café '],
  ['café 7525', 9, 'delete', 'café 7,52'],
  ['almoço', 6, 'insert', 'almoço'],
]

for (const [text, caret, inputType, expected] of cases) {
  const result = applyCashMask(text, caret, inputType)
  if (result.text !== expected) throw new Error(`${text} => ${result.text}; esperado ${expected}`)
  console.log(`PASS ${JSON.stringify(text)} -> ${JSON.stringify(result.text)}`)
}
console.log(`\n${cases.length} testes passaram`)
