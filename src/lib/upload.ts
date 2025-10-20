import fs from 'fs'
import path from 'path'

export function ensureUploadDir() {
  const dir = process.env.UPLOAD_DIR || './uploads'
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

export async function saveFile(file: File) {
  const dir = ensureUploadDir()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
  const full = path.join(dir, safeName)
  await fs.promises.writeFile(full, buffer)
  return { full, name: safeName }
}
