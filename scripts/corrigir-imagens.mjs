import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const workerUrl = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href

const DIR = 'public/cartas'
const cartas = JSON.parse(fs.readFileSync('src/data/cartas.json', 'utf8'))

// Passo 1: remover a imagem errada (intro text)
const errada = path.join(DIR, `${cartas[0].id}.jpg`) // acqua-blue.jpg
if (fs.existsSync(errada)) {
  fs.unlinkSync(errada)
  console.log(`✓ Removida imagem de introdução: ${cartas[0].id}.jpg`)
}

// Passo 2: renomear todas — cada arquivo vai para o id anterior
// acqua-green.jpg → acqua-blue.jpg, acqua-serenity.jpg → acqua-green.jpg, etc.
console.log('\nRenomeando imagens...')
for (let i = 1; i < cartas.length; i++) {
  const atual = path.join(DIR, `${cartas[i].id}.jpg`)
  const destino = path.join(DIR, `${cartas[i - 1].id}.jpg`)
  if (fs.existsSync(atual)) {
    fs.renameSync(atual, destino)
    console.log(`✓ ${cartas[i].id}.jpg → ${cartas[i - 1].id}.jpg`)
  }
}

// Passo 3: extrair a imagem da última carta (orquidea) que ficou sem imagem
// Orquidea é a página 181 do livro. No PDF, estava na página 178.
// Como o padrão é: página do livro 181 → PDF ~180, vamos varrer as últimas páginas
console.log('\nExtraindo imagem da Orquídea...')
const pdfPath = path.resolve('OráculoAndara.pdf')
const data = new Uint8Array(fs.readFileSync(pdfPath))
const pdf = await pdfjsLib.getDocument({
  data, useWorkerFetch: false, isEvalSupported: false, disableFontFace: true,
}).promise

const ultimaId = cartas[cartas.length - 1].id // orquidea

for (let p = 179; p <= pdf.numPages; p++) {
  const page = await pdf.getPage(p)
  const ops = await page.getOperatorList()
  const imgNames = []
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      imgNames.push(ops.argsArray[i][0])
    }
  }

  for (const imgName of imgNames) {
    await new Promise((resolve) => {
      page.objs.get(imgName, async (imgData) => {
        if (!imgData?.data) { resolve(); return }
        const { width, height, data: pixels, kind } = imgData
        if (width < 200 || height < 200) { resolve(); return }

        console.log(`Encontrada na página ${p}: ${width}x${height}`)
        const channels = kind === 2 ? 3 : 4
        const jpgPath = path.join(DIR, `${ultimaId}.jpg`)
        await sharp(Buffer.from(pixels.buffer || pixels), {
          raw: { width, height, channels }
        }).jpeg({ quality: 90 }).toFile(jpgPath)
        console.log(`✓ ${ultimaId}.jpg salvo!`)
        resolve()
      })
    })
  }
}

// Verificação final
const total = fs.readdirSync(DIR).filter(f => f.endsWith('.jpg')).length
console.log(`\nTotal de imagens em public/cartas: ${total}/84`)
cartas.forEach(c => {
  const ok = fs.existsSync(path.join(DIR, `${c.id}.jpg`))
  if (!ok) console.log(`  ✗ FALTANDO: ${c.id}.jpg`)
})
console.log('Concluído!')
