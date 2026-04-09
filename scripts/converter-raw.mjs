import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const DIR = 'public/cartas'
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.meta.json'))

console.log(`Convertendo ${files.length} imagens...`)

for (const metaFile of files) {
  const meta = JSON.parse(fs.readFileSync(path.join(DIR, metaFile), 'utf8'))
  const { id, width, height, kind } = meta

  const rawPath = path.join(DIR, `${id}.raw`)
  const jpgPath = path.join(DIR, `${id}.jpg`)

  if (!fs.existsSync(rawPath)) {
    console.log(`[skip] ${id}.raw não encontrado`)
    continue
  }

  const rawData = fs.readFileSync(rawPath)

  // kind=2: RGB (3 bytes/pixel), kind=3: RGBA (4 bytes/pixel)
  const channels = kind === 2 ? 3 : 4
  const expected = width * height * channels

  if (rawData.length !== expected) {
    console.log(`[warn] ${id}: tamanho esperado ${expected}, obtido ${rawData.length}`)
  }

  try {
    await sharp(rawData, {
      raw: { width, height, channels }
    })
    .jpeg({ quality: 90 })
    .toFile(jpgPath)

    console.log(`✓ ${id}.jpg (${width}x${height})`)

    // Remove arquivos temporários
    fs.unlinkSync(rawPath)
    fs.unlinkSync(path.join(DIR, metaFile))
  } catch(e) {
    console.log(`✗ ${id}: ${e.message}`)
  }
}

console.log('\nConversão concluída!')
