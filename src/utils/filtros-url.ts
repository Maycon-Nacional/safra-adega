import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import { TIPOS_VINHO, filtrosVazios, type FiltroBooleano, type FiltrosConsulta, type TipoVinho } from '@/types/vinho'

export type OrdemConsulta = 'recentes' | 'rotulo' | 'precoAsc' | 'precoDesc' | 'safra'
export type ModoConsulta = 'cartoes' | 'tabela'

const ORDENS: OrdemConsulta[] = ['recentes', 'rotulo', 'precoAsc', 'precoDesc', 'safra']
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/

function texto(valor: LocationQuery[string]): string {
  const v = Array.isArray(valor) ? valor[0] : valor
  return v ?? ''
}

function lista(valor: LocationQuery[string]): string[] {
  const t = texto(valor)
  return t ? t.split(',').map((s) => s.trim()).filter(Boolean) : []
}

function numero(valor: LocationQuery[string]): number | null {
  const t = texto(valor)
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function booleano(valor: LocationQuery[string]): FiltroBooleano {
  const t = texto(valor)
  return t === 'sim' || t === 'nao' ? t : 'todos'
}

function data(valor: LocationQuery[string]): string {
  const t = texto(valor)
  return DATA_ISO.test(t) ? t : ''
}

/** Monta os filtros a partir da URL, ignorando valores inválidos. */
export function filtrosDaUrl(query: LocationQuery): FiltrosConsulta {
  return {
    ...filtrosVazios(),
    busca: texto(query.busca),
    tipos: lista(query.tipo).filter((t): t is TipoVinho => (TIPOS_VINHO as readonly string[]).includes(t)),
    paises: lista(query.pais),
    precoMin: numero(query.precoDe),
    precoMax: numero(query.precoAte),
    dataDe: data(query.de),
    dataAte: data(query.ate),
    pronto: booleano(query.pronto),
    organico: booleano(query.organico),
  }
}

export function ordemDaUrl(query: LocationQuery): OrdemConsulta {
  const t = texto(query.ordem) as OrdemConsulta
  return ORDENS.includes(t) ? t : 'recentes'
}

export function modoDaUrl(query: LocationQuery): ModoConsulta {
  return texto(query.ver) === 'tabela' ? 'tabela' : 'cartoes'
}

/** Gera a query string só com o que difere do padrão, para a URL ficar curta. */
export function paraQuery(f: FiltrosConsulta, ordem: OrdemConsulta, modo: ModoConsulta): LocationQueryRaw {
  const q: LocationQueryRaw = {}
  if (f.busca?.trim()) q.busca = f.busca.trim()
  if (f.tipos.length) q.tipo = f.tipos.join(',')
  if (f.paises.length) q.pais = f.paises.join(',')
  if (f.precoMin !== null) q.precoDe = String(f.precoMin)
  if (f.precoMax !== null) q.precoAte = String(f.precoMax)
  if (f.dataDe) q.de = f.dataDe
  if (f.dataAte) q.ate = f.dataAte
  if (f.pronto !== 'todos') q.pronto = f.pronto
  if (f.organico !== 'todos') q.organico = f.organico
  if (ordem !== 'recentes') q.ordem = ordem
  if (modo !== 'cartoes') q.ver = modo
  return q
}
