import axios from 'axios'

export interface Cotacao {
  dolar: number
  euro: number
  atualizadoEm: string // formato da API: AAAA-MM-DD HH:MM:SS
}

interface MoedaAwesome {
  bid: string
  create_date: string
}

interface RespostaAwesome {
  USDBRL: MoedaAwesome
  EURBRL: MoedaAwesome
}

const api = axios.create({
  baseURL: 'https://economia.awesomeapi.com.br/json',
  timeout: 10000,
})

/** Cotação atual de compra do dólar e do euro em reais (AwesomeAPI). */
export async function buscarCotacao(): Promise<Cotacao> {
  const { data } = await api.get<RespostaAwesome>('/last/USD-BRL,EUR-BRL')
  const dolar = Number(data.USDBRL?.bid)
  const euro = Number(data.EURBRL?.bid)
  if (!dolar || !euro) throw new Error('Resposta da cotação incompleta.')
  const { create_date: dataDolar } = data.USDBRL
  const { create_date: dataEuro } = data.EURBRL
  const atualizadoEm = dataDolar > dataEuro ? dataDolar : dataEuro
  return { dolar, euro, atualizadoEm }
}

export function mensagemDeErroCotacao(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    if (erro.code === 'ECONNABORTED') return 'O serviço de cotação demorou para responder.'
    if (!erro.response) return 'Sem conexão com a internet ou serviço de cotação indisponível.'
    if (erro.response.status === 429) return 'Limite de consultas de cotação atingido. Tente em alguns minutos.'
    return `O serviço de cotação respondeu com erro ${erro.response.status}.`
  }
  return 'Não foi possível obter a cotação do dólar e do euro.'
}
