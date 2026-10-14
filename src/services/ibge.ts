import axios from 'axios'

export interface Pais {
  nome: string
  sigla: string
  continente: string
}

interface PaisIbge {
  id: { M49: number; 'ISO-ALPHA-2': string; 'ISO-ALPHA-3': string }
  nome: string
  'sub-regiao': { regiao: { nome: string } | null } | null
}

const api = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1/localidades',
  timeout: 10000,
})

let cache: Pais[] | null = null

/** Lista de países em português, vinda da API de localidades do IBGE. */
export async function buscarPaises(): Promise<Pais[]> {
  if (cache) return cache
  const { data } = await api.get<PaisIbge[]>('/paises', { params: { orderBy: 'nome' } })
  cache = data
    .map((p) => ({
      nome: p.nome,
      sigla: p.id['ISO-ALPHA-2'],
      continente: p['sub-regiao']?.regiao?.nome ?? 'Não informado',
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  return cache
}

export function mensagemDeErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    if (erro.code === 'ECONNABORTED') return 'O IBGE demorou para responder. Tente novamente.'
    if (!erro.response) return 'Sem conexão com a internet ou serviço do IBGE indisponível.'
    return `O IBGE respondeu com erro ${erro.response.status}. Tente novamente em instantes.`
  }
  return 'Não foi possível carregar a lista de países.'
}
