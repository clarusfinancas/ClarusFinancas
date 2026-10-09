export const categoryKeywords = {
  food: ['cafe', 'café', 'padaria', 'lanche', 'mercado', 'restaurante', 'pizza', 'ifood', 'almoço', 'almoco', 'jantar'],
  transport: ['uber', '99', 'onibus', 'ônibus', 'metro', 'metrô', 'gasolina', 'estacionamento'],
  housing: ['aluguel', 'condominio', 'condomínio', 'luz', 'agua', 'água', 'internet'],
  leisure: ['cinema', 'netflix', 'spotify', 'bar', 'show'],
  health: ['farmacia', 'farmácia', 'medico', 'médico', 'dentista', 'remedio', 'remédio'],
  education: ['curso', 'livro', 'faculdade', 'escola'],
  salary: ['salário', 'salario', 'freelance', 'pix recebido'],
} as const

export const dailyExpenseCategories = new Set(['food', 'transport', 'leisure', 'other'])

export function normalizeKeywordText(value: string) {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
