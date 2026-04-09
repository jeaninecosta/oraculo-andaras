import mammoth from 'mammoth'
import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'OráculoAndara.docx')
const result = await mammoth.extractRawText({ path: filePath })
const texto = result.value

fs.writeFileSync('scripts/texto-bruto.txt', texto, 'utf8')
console.log('Total de caracteres:', texto.length)
console.log('Arquivo salvo em scripts/texto-bruto.txt')
