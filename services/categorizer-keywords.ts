export const categorizerKeywords = {
  food: ['ifood', 'rappi', '99food', 'mcdonald', 'burger king', 'subway', 'outback', 'starbucks', 'padaria', 'pao', 'paes', 'panificadora', 'cafe', 'cafeteria', 'lanche', 'lancheira', 'mercado', 'supermercado', 'mercadinho', 'atacadao', 'carrefour', 'extra', 'assai', 'pao de acucar', 'hortifruti', 'acougue', 'feira', 'sacolao', 'restaurante', 'lanchonete', 'pizza', 'pizzaria', 'sushi', 'almoco', 'jantar', 'cafe da manha', 'marmita', 'sorvete', 'doce', 'chocolate', 'pipoca', 'bolo', 'biscoito', 'bebida', 'comida', 'alimentacao'],
  transport: ['uber', '99 app', 'cabify', 'onibus', 'ônibus', 'metro', 'metrô', 'trem', 'passagem', 'gasolina', 'etanol', 'combustivel', 'combustível', 'posto', 'shell', 'ipiranga', 'estacionamento', 'pedagio', 'pedágio', 'sem parar', 'bilhete unico', 'bilhete único', 'oficina', 'mecanico', 'mecânico', 'ipva', 'carro', 'moto', 'corrida'],
  housing: ['aluguel', 'condominio', 'condomínio', 'conta de luz', 'luz', 'energia', 'enel', 'cpfl', 'agua', 'água', 'sabesp', 'gas', 'gás', 'internet', 'vivo fibra', 'claro', 'tim', 'iptu', 'reforma', 'faxina', 'diarista', 'casa', 'apartamento'],
  leisure: ['cinema', 'netflix', 'spotify', 'disney', 'hbo', 'prime video', 'youtube premium', 'streaming', 'bar', 'balada', 'show', 'ingresso', 'viagem', 'hotel', 'airbnb', 'steam', 'playstation', 'xbox', 'jogo', 'parque', 'teatro'],
  health: ['farmacia', 'farmácia', 'drogasil', 'droga raia', 'raia', 'pacheco', 'medico', 'médico', 'consulta', 'dentista', 'exame', 'remedio', 'remédio', 'plano de saude', 'plano de saúde', 'unimed', 'academia', 'smartfit', 'psicologo', 'psicólogo', 'terapia', 'hospital'],
  education: ['curso', 'udemy', 'alura', 'livro', 'faculdade', 'mensalidade escolar', 'escola', 'material escolar', 'idioma', 'ingles', 'inglês', 'aula', 'professor'],
  salary: ['salario', 'salário', 'pagamento', 'freelance', 'pix recebido', 'recebi', 'venda', 'reembolso', 'rendimento', '13o', 'bonus', 'bônus', 'comissao', 'comissão', 'pro labore'],
} as const

export function normalizeCategorizerText(value: string) { return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() }

export type CategorizerResult = { categoryId: string; confidence: number; alternatives: string[]; reason: string }
type Correction = { categoryId: string; count: number }
export function getCorrections() { if (typeof window === 'undefined') return {}; try { return JSON.parse(localStorage.getItem('clarus-capture-corrections') || '{}') as Record<string, Correction> } catch { return {} } }
export function learnCorrection(term: string, categoryId: string) { const key = normalizeCategorizerText(term); if (!key || typeof window === 'undefined') return; const corrections = getCorrections(); corrections[key] = { categoryId, count: (corrections[key]?.count || 0) + 1 }; localStorage.setItem('clarus-capture-corrections', JSON.stringify(corrections)) }

function wordMatch(text: string, keyword: string) { return text === keyword || text.includes(` ${keyword} `) || text.startsWith(`${keyword} `) || text.endsWith(` ${keyword}`) }
function scoreKeyword(text: string, keyword: string) { if (wordMatch(text, keyword)) return keyword.includes(' ') ? 4 : keyword.length >= 6 ? 2 : 1; return 0 }

export function categorizeTransaction(text: string, type: 'expense' | 'income', customCategories: Array<{ id: string; name: string }> = []): CategorizerResult {
  const normalized = normalizeCategorizerText(text); const corrections = getCorrections()
  const learned = Object.entries(corrections).filter(([term, value]) => value.count >= 1 && (normalized === term || normalized.startsWith(`${term} `) || normalized.endsWith(` ${term}`))).sort((a, b) => b[0].length - a[0].length)[0]
  if (learned) return { categoryId: learned[1].categoryId, confidence: 0.96, alternatives: [], reason: 'Correção aprendida' }
  const custom = customCategories.find((category) => wordMatch(normalized, normalizeCategorizerText(category.name)))
  if (custom) return { categoryId: custom.id, confidence: 0.92, alternatives: [], reason: 'Categoria personalizada encontrada' }
  const scored = Object.entries(categorizerKeywords).map(([categoryId, words]) => ({ categoryId, score: words.reduce((sum, word) => sum + scoreKeyword(normalized, normalizeCategorizerText(word)), 0) })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score)
  const allowed = type === 'income' ? ['salary'] : Object.keys(categorizerKeywords).filter((id) => id !== 'salary'); const filtered = scored.filter((item) => allowed.includes(item.categoryId)); const winner = filtered[0]; const fallback = type === 'income' ? 'salary' : 'other'
  const confidence = winner ? Math.min(0.96, 0.56 + winner.score * 0.1 + (filtered[1] && winner.score > filtered[1].score ? 0.1 : 0)) : 0.2
  return { categoryId: winner?.categoryId || fallback, confidence, alternatives: filtered.slice(1, 4).map((item) => item.categoryId).concat(fallback).filter((id, index, list) => allowed.includes(id) && list.indexOf(id) === index).slice(0, 3), reason: winner ? 'Palavras-chave e contexto' : 'Nenhum padrão forte encontrado' }
}

export function primaryTerm(description: string) { return normalizeCategorizerText(description).split(/\s+/).find((word) => word.length > 2) || normalizeCategorizerText(description) }
export function isLowConfidence(result: CategorizerResult) { return result.confidence < 0.6 }

export const categoryExamples = ['café', 'pão francês', 'padaria', 'almoço', 'pipoca', 'esmalte', 'manicure', 'gasolina', 'uber', 'ônibus', 'conta de luz', 'internet', 'aluguel', 'netflix', 'farmácia']
export const categoryFallbackNote = 'A categoria Outros é usada quando a descrição não corresponde com segurança a uma categoria existente.'
