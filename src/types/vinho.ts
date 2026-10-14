export const TIPOS_VINHO = [
  'Tinto',
  'Branco',
  'Rosé',
  'Espumante',
  'Fortificado',
  'Sobremesa',
] as const

export type TipoVinho = (typeof TIPOS_VINHO)[number]

export interface Vinho {
  id: number
  rotulo: string
  produtor: string
  tipo: TipoVinho
  uva: string
  pais: string
  continente: string
  safra: number
  preco: number
  garrafas: number
  dataAquisicao: string // formato ISO: AAAA-MM-DD
  prontoParaBeber: boolean
  organico: boolean
  notas: string
  imagem: string // caminho relativo (vinhos/...) ou imagem enviada (data URL); vazio quando não há foto
}

export type VinhoSemId = Omit<Vinho, 'id'>

export type FiltroBooleano = 'todos' | 'sim' | 'nao'

export interface FiltrosConsulta {
  busca: string
  tipos: TipoVinho[]
  paises: string[]
  precoMin: number | null
  precoMax: number | null
  safraMin: number | null // null = sem limite
  safraMax: number | null
  dataDe: string
  dataAte: string
  pronto: FiltroBooleano
  organico: FiltroBooleano
}

export function filtrosVazios(): FiltrosConsulta {
  return {
    busca: '',
    tipos: [],
    paises: [],
    precoMin: null,
    precoMax: null,
    safraMin: null,
    safraMax: null,
    dataDe: '',
    dataAte: '',
    pronto: 'todos',
    organico: 'todos',
  }
}

export const COR_TIPO: Record<TipoVinho, string> = {
  Tinto: '#7A1F3D',
  Branco: '#C9A94E',
  Rosé: '#D98C8C',
  Espumante: '#8FA6A0',
  Fortificado: '#8A4B2A',
  Sobremesa: '#B7793A',
}
