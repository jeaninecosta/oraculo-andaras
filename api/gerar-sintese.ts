import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { cartas, posicoes, cliente_nome } = req.body

  const cartasTexto = cartas.map((carta: any, i: number) => {
    const posicao = posicoes[i] ? `Posição: ${posicoes[i]}` : `Carta ${i + 1}`
    return `${posicao}\nNome: ${carta.nome}\nPalavras-chave: ${carta.palavrasChave}\nMensagem: ${carta.mensagem}\nAção Prática: ${carta.acaoPratica}`
  }).join('\n\n---\n\n')

  const prompt = `Você é uma oraculista experiente e sensível, especializada nas cartas Andaras — um oráculo de alta frequência espiritual.

${cliente_nome ? `A consulta é para: ${cliente_nome}.` : 'Esta é uma consulta pessoal.'}

As seguintes cartas foram sorteadas:

${cartasTexto}

Com base nessas cartas e suas posições, escreva uma síntese da leitura em português brasileiro. A síntese deve:
- Ser fluida, acolhedora e espiritualmente profunda
- Conectar as cartas entre si criando uma narrativa coerente
- Usar linguagem poética mas acessível
- Ter entre 3 e 5 parágrafos
- Integrar os temas das cartas naturalmente, sem repetir mecanicamente
- Trazer orientação prática ao final
- NÃO usar tópicos ou listas — apenas texto corrido

Escreva apenas a síntese, sem título, sem introdução explicativa.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const sintese = data.content?.[0]?.text ?? ''
  res.status(200).json({ sintese })
}
