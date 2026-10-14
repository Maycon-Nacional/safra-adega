import type { Vinho } from '@/types/vinho'
import { formatarData, simNao } from './formato'

const COLUNAS: { titulo: string; valor: (v: Vinho) => string | number }[] = [
  { titulo: 'Rótulo', valor: (v) => v.rotulo },
  { titulo: 'Produtor', valor: (v) => v.produtor },
  { titulo: 'Tipo', valor: (v) => v.tipo },
  { titulo: 'Uva', valor: (v) => v.uva },
  { titulo: 'País', valor: (v) => v.pais },
  { titulo: 'Continente', valor: (v) => v.continente },
  { titulo: 'Safra', valor: (v) => v.safra },
  { titulo: 'Preço (R$)', valor: (v) => v.preco.toFixed(2).replace('.', ',') },
  { titulo: 'Garrafas', valor: (v) => v.garrafas },
  { titulo: 'Data de aquisição', valor: (v) => formatarData(v.dataAquisicao) },
  { titulo: 'Pronto para beber', valor: (v) => simNao(v.prontoParaBeber) },
  { titulo: 'Orgânico', valor: (v) => simNao(v.organico) },
  { titulo: 'Notas', valor: (v) => v.notas },
]

// aspas quando o texto tem separador, aspas ou quebra de linha
function celula(valor: string | number): string {
  const texto = String(valor ?? '')
  return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

/** Gera e baixa um CSV (separador ';' e BOM UTF-8, para abrir direto no Excel em português). */
export function exportarCsv(vinhos: Vinho[], nomeArquivo: string): void {
  const linhas = [
    COLUNAS.map((c) => celula(c.titulo)).join(';'),
    ...vinhos.map((v) => COLUNAS.map((c) => celula(c.valor(v))).join(';')),
  ]
  const blob = new Blob(['﻿' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
