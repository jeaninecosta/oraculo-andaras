import fs from 'fs'

const texto = fs.readFileSync('scripts/texto-bruto.txt', 'utf8')
const linhas = texto.split('\n').map(l => l.trim())

// Nomes de todas as cartas (do índice)
const nomes = [
  'Andara Acqua Blue', 'Andara Acqua Green', 'Andara Acqua Serenity',
  'Andara Amarela', 'Andara Âmbar Dourado', 'Andara Anjo', 'Andara Atlantis',
  'Andara Azul Celestial', 'Andara Azul Céu', 'Andara Azul Elétrico',
  'Andara Azul Safira', 'Andara Branca Nuvem', 'Andara Branco Opalescente',
  'Andara Carmesim', 'Andara Chama Gêmea', 'Andara Chama Violeta',
  'Andara Champanhe', 'Andara Chocolate', 'Andara Cianita Azul', 'Andara Ciano',
  'Andara Cobre', 'Andara Coração da Galáxia', 'Andara Coração de Avalon',
  'Andara Coral', 'Andara Cosmic Ice', 'Andara Cosmos', 'Andara Crepúsculo',
  'Andara Divina', 'Andara Divine Fire', 'Andara Dourado Crístico',
  'Andara Dragão', 'Andara Elestial Fumê', 'Andara Esfumaçado',
  'Andara Esmeralda do Mar', 'Andara Fada', 'Andara Fogo', 'Andara Fúcsia',
  'Andara Gaia', 'Andara Gelo Polar', 'Andara Índigo', 'Andara Iônico',
  'Andara Íris', 'Andara Laranja', 'Andara Lilás', 'Andara Luminescente Lemuriano',
  'Andara Magenta', 'Andara Mágica Algodão Doce', 'Andara Mágica Verde Melancia',
  'Andara Mágica Violeta', 'Andara Mel', 'Andara Merlin Blue', 'Andara Mistério',
  'Andara Mística', 'Andara Morango', 'Andara Natureza', 'Andara Oceania',
  'Andara Oceano Profundo', 'Andara Oliva', 'Andara Ouro Rosa', 'Andara Pêssego',
  'Andara Pistache', 'Andara Platina', 'Andara Prata', 'Andara Preto',
  'Andara Rainbow (Arco-Íris)', 'Andara Rosa Lady Nellie',
  'Andara Roxa Dragonfly (Libélula Roxa)', 'Andara Ruby (Rubi)',
  'Andara Primavera', 'Andara Selenita Branca', 'Andara Sereia', 'Andara Sweet',
  'Andara Turquesa', 'Andara Unicórnio', 'Andara Verde Esmeralda',
  'Andara Verde Floresta', 'Andara Verde Jade', 'Andara Verde Menta',
  'Andara Verde-Limão', 'Andara Vermelha Opaca', 'Andara Violeta de Saint Germain',
  'Andara Xamã', 'Andara Gelo Cósmico', 'Andara Orquídea',
]

const isSeparador = (l) => l.includes('🙢') || l.includes('🙠')

// Encontra a linha onde cada carta começa
const inicios = nomes.map(nome => {
  const idx = linhas.findIndex((l, i) => l === nome && i > 260)
  return { nome, idx }
}).filter(c => c.idx !== -1)

const cartas = []

for (let i = 0; i < inicios.length; i++) {
  const { nome, idx } = inicios[i]
  const fim = i + 1 < inicios.length ? inicios[i + 1].idx : linhas.length

  const bloco = linhas.slice(idx + 1, fim).filter(l => l.length > 0)

  // Palavras-chave: primeira linha não vazia antes do primeiro separador
  const idxSep1 = bloco.findIndex(isSeparador)
  const palavrasChave = idxSep1 > 0 ? bloco.slice(0, idxSep1).join(' ').trim() : ''

  // Mensagem: entre "Mensagem" e próximo separador
  const idxMsg = bloco.findIndex(l => l === 'Mensagem')
  const idxSep2 = bloco.findIndex((l, i) => isSeparador(l) && i > idxSep1)
  const mensagem = idxMsg !== -1 && idxSep2 > idxMsg
    ? bloco.slice(idxMsg + 1, idxSep2).join(' ').trim()
    : idxMsg !== -1
    ? bloco.slice(idxMsg + 1).join(' ').trim()
    : ''

  // Ação prática: após "Ação prática"
  const idxAcao = bloco.findIndex(l => l.toLowerCase().startsWith('ação prática'))
  const acaoPratica = idxAcao !== -1
    ? bloco.slice(idxAcao + 1).join(' ').trim()
    : ''

  const id = nome
    .replace('Andara ', '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  cartas.push({
    id,
    nome,
    palavrasChave,
    mensagem,
    acaoPratica,
    imagem: `/cartas/${id}.jpg`,
  })
}

console.log(`Total de cartas extraídas: ${cartas.length}`)
console.log('\nExemplo carta 1:')
console.log(JSON.stringify(cartas[0], null, 2))
console.log('\nExemplo carta 2:')
console.log(JSON.stringify(cartas[1], null, 2))

fs.writeFileSync('src/data/cartas.json', JSON.stringify(cartas, null, 2), 'utf8')
console.log('\n✓ Arquivo gerado: src/data/cartas.json')
