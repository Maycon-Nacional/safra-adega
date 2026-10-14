import { ref } from 'vue'
import type { Vinho, VinhoSemId } from '@/types/vinho'
import { ACERVO_INICIAL } from '@/data/acervo-inicial'

/**
 * Fonte única de dados da aplicação.
 * O CRUD (Adega) e a Consulta importam a mesma lista reativa `vinhos`,
 * então qualquer alteração em uma página aparece imediatamente na outra.
 * Toda gravação passa por `JSON.stringify` e toda leitura por `JSON.parse`.
 */
const CHAVE = 'safra:vinhos'

function lerDoStorage(): Vinho[] {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (bruto === null) {
      localStorage.setItem(CHAVE, JSON.stringify(ACERVO_INICIAL))
      return structuredClone(ACERVO_INICIAL)
    }
    const dados = JSON.parse(bruto)
    return Array.isArray(dados) ? (dados as Vinho[]) : []
  } catch {
    return []
  }
}

function gravarNoStorage(): void {
  localStorage.setItem(CHAVE, JSON.stringify(vinhos.value))
}

export const vinhos = ref<Vinho[]>(lerDoStorage())

function proximoId(): number {
  return vinhos.value.reduce((maior, v) => Math.max(maior, v.id), 0) + 1
}

export function criarVinho(dados: VinhoSemId): Vinho {
  const novo: Vinho = { ...dados, id: proximoId() }
  vinhos.value.push(novo)
  gravarNoStorage()
  return novo
}

export function atualizarVinho(vinho: Vinho): void {
  const indice = vinhos.value.findIndex((v) => v.id === vinho.id)
  if (indice === -1) throw new Error('Registro não encontrado.')
  vinhos.value.splice(indice, 1, { ...vinho })
  gravarNoStorage()
}

export function removerVinho(id: number): void {
  const indice = vinhos.value.findIndex((v) => v.id === id)
  if (indice === -1) throw new Error('Registro não encontrado.')
  vinhos.value.splice(indice, 1)
  gravarNoStorage()
}

// Mantém abas diferentes do navegador sincronizadas.
window.addEventListener('storage', (evento) => {
  if (evento.key === CHAVE) vinhos.value = lerDoStorage()
})
