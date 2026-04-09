import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import fs from 'fs'
import path from 'path'

const workerUrl = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href

const OUTPUT_DIR = 'public/cartas'
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const cartas = JSON.parse(fs.readFileSync('src/data/cartas.json', 'utf8'))

const pdfPath = path.resolve('OráculoAndara.pdf')
const data = new Uint8Array(fs.readFileSync(pdfPath))
const pdf = await pdfjsLib.getDocument({
  data,
  useWorkerFetch: false,
  isEvalSupported: false,
  disableFontFace: true,
}).promise

console.log(`PDF tem ${pdf.numPages} páginas`)

let cartaIdx = 0
let imgCount = 0

for (let p = 1; p <= pdf.numPages && cartaIdx < cartas.length; p++) {
  const page = await pdf.getPage(p)
  const ops = await page.getOperatorList()

  // Verifica se a página contém imagem
  const temImagem = ops.fnArray.some(fn =>
    fn === pdfjsLib.OPS.paintImageXObject ||
    fn === pdfjsLib.OPS.paintInlineImageXObject
  )

  if (!temImagem) continue

  // Extrai imagens embutidas via commonObjs/objs
  const objs = page.commonObjs
  const imgNames = []

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      imgNames.push(ops.argsArray[i][0])
    }
  }

  for (const imgName of imgNames) {
    try {
      await new Promise((resolve) => {
        page.objs.get(imgName, (imgData) => {
          if (!imgData || !imgData.data) { resolve(); return }

          const { width, height, data: pixels, kind } = imgData

          // Ignora imagens pequenas (logos, cabeçalhos, decorações)
          if (width < 200 || height < 200) {
            console.log(`  [skip] Página ${p}: "${imgName}" ${width}x${height} (muito pequena)`)
            resolve()
            return
          }

          const id = cartas[cartaIdx]?.id
          if (!id) { resolve(); return }

          console.log(`Página ${p}: imagem "${imgName}" ${width}x${height} kind=${kind} → ${id}`)

          const rawPath = path.join(OUTPUT_DIR, `${id}.raw`)
          fs.writeFileSync(rawPath, Buffer.from(pixels.buffer || pixels))
          fs.writeFileSync(path.join(OUTPUT_DIR, `${id}.meta.json`), JSON.stringify({ page: p, imgName, width, height, kind, id }))

          cartaIdx++
          imgCount++
          resolve()
        })
      })
    } catch(e) {
      console.log(`Erro na página ${p} imagem ${imgName}:`, e.message)
    }
  }
}

console.log(`\nTotal de imagens encontradas: ${imgCount}`)
