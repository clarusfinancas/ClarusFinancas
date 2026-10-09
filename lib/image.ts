export const MAX_AVATAR_BYTES = 100 * 1024
const SAFE_IMAGE = /^data:image\/(jpeg|webp|png);base64,[a-z0-9+/]+=*$/i

export function isSafeImage(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 150 * 1024) return false
  return SAFE_IMAGE.test(value) || /^https:\/\//i.test(value)
}

export function calculateSquareCrop(width: number, height: number, zoom: number, offsetX: number, offsetY: number) {
  const sourceSize = Math.min(width, height) / Math.max(1, zoom)
  const maxX = Math.max(0, width - sourceSize)
  const maxY = Math.max(0, height - sourceSize)
  return { x: Math.min(maxX, Math.max(0, (width - sourceSize) / 2 + offsetX)), y: Math.min(maxY, Math.max(0, (height - sourceSize) / 2 + offsetY)), size: sourceSize, outputSize: 256 }
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Não foi possível ler a imagem.')); reader.readAsDataURL(file) })
}

export function resizeAvatar(source: HTMLImageElement, zoom = 1, offsetX = 0, offsetY = 0) {
  const crop = calculateSquareCrop(source.naturalWidth, source.naturalHeight, zoom, offsetX, offsetY)
  const canvas = document.createElement('canvas'); canvas.width = crop.outputSize; canvas.height = crop.outputSize
  const context = canvas.getContext('2d'); if (!context) throw new Error('Seu navegador não suporta recorte de imagem.')
  context.drawImage(source, crop.x, crop.y, crop.size, crop.size, 0, 0, 256, 256)
  const webp = canvas.toDataURL('image/webp', 0.85)
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85)
}
