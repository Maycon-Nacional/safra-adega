<script setup lang="ts">
import { ref } from 'vue'
import { vinhos, criarVinho, atualizarVinho, removerVinho } from '@/services/storage'
import { avisar } from '@/services/aviso'
import { formatarData, formatarMoeda } from '@/utils/formato'
import type { Vinho, VinhoSemId } from '@/types/vinho'
import CabecalhoPagina from '@/components/CabecalhoPagina.vue'
import VinhoFormulario from '@/components/VinhoFormulario.vue'
import ConfirmarExclusao from '@/components/ConfirmarExclusao.vue'
import SeloTipo from '@/components/SeloTipo.vue'

const busca = ref('')
const formularioAberto = ref(false)
const emEdicao = ref<Vinho | null>(null)
const confirmacaoAberta = ref(false)
const paraExcluir = ref<Vinho | null>(null)

const cabecalhos = [
  { title: 'Rótulo', key: 'rotulo', minWidth: 220 },
  { title: 'Tipo', key: 'tipo' },
  { title: 'País', key: 'pais' },
  { title: 'Safra', key: 'safra', align: 'end' as const },
  { title: 'Preço', key: 'preco', align: 'end' as const },
  { title: 'Garrafas', key: 'garrafas', align: 'end' as const },
  { title: 'Aquisição', key: 'dataAquisicao' },
  { title: 'Pronto', key: 'prontoParaBeber', align: 'center' as const },
  { title: 'Orgânico', key: 'organico', align: 'center' as const },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'end' as const },
]

function novo() {
  emEdicao.value = null
  formularioAberto.value = true
}

function editar(vinho: Vinho) {
  emEdicao.value = { ...vinho }
  formularioAberto.value = true
}

function salvar(dados: VinhoSemId, id: number | null) {
  try {
    if (id === null) {
      criarVinho(dados)
      avisar(`“${dados.rotulo}” foi adicionado à adega.`)
    } else {
      atualizarVinho({ ...dados, id })
      avisar(`Alterações em “${dados.rotulo}” salvas.`)
    }
    formularioAberto.value = false
  } catch {
    avisar('Não foi possível salvar. Verifique o armazenamento do navegador.', 'erro')
  }
}

function pedirExclusao(vinho: Vinho) {
  paraExcluir.value = vinho
  confirmacaoAberta.value = true
}

function confirmarExclusao() {
  if (!paraExcluir.value) return
  const { id, rotulo } = paraExcluir.value
  try {
    removerVinho(id)
    avisar(`“${rotulo}” foi removido da adega.`)
  } catch {
    avisar('Não foi possível excluir o registro.', 'erro')
  } finally {
    confirmacaoAberta.value = false
    paraExcluir.value = null
  }
}
</script>

<template>
  <div>
    <CabecalhoPagina
      sobretitulo="Cadastro"
      titulo="Gerenciar adega"
      descricao="Cadastre novos rótulos, atualize o estoque de garrafas e remova o que já foi consumido."
    >
      <template #acoes>
        <v-btn color="primary" size="large" variant="flat" prepend-icon="mdi-plus" class="botao-novo" @click="novo">
          Novo rótulo
        </v-btn>
      </template>
    </CabecalhoPagina>

    <v-card class="cartao-papel surgir" style="--i: 2" flat>
      <div class="d-flex align-center flex-wrap ga-4 pa-4">
        <div class="titulo-serifa text-h6">
          {{ vinhos.length }} {{ vinhos.length === 1 ? 'rótulo cadastrado' : 'rótulos cadastrados' }}
        </div>
        <v-spacer />
        <v-text-field
          v-model="busca"
          placeholder="Filtrar tabela"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          clearable
          class="campo-busca"
        />
      </div>
      <v-divider />

      <v-data-table
        :headers="cabecalhos"
        :items="vinhos"
        :search="busca ?? ''"
        item-value="id"
        class="tabela-adega"
        :items-per-page="10"
        :sort-by="[{ key: 'dataAquisicao', order: 'desc' }]"
        hover
        no-data-text="Nenhum rótulo cadastrado ainda. Clique em “Novo rótulo” para começar."
        items-per-page-text="Itens por página"
        :mobile-breakpoint="'sm'"
      >
        <template #item.rotulo="{ item }">
          <div class="py-2">
            <div class="font-weight-bold">{{ item.rotulo }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.produtor }} · {{ item.uva }}</div>
          </div>
        </template>
        <template #item.tipo="{ item }">
          <SeloTipo :tipo="item.tipo" />
        </template>
        <template #item.preco="{ item }">{{ formatarMoeda(item.preco) }}</template>
        <template #item.garrafas="{ item }">
          <span :class="{ 'text-error font-weight-bold': item.garrafas === 0 }">{{ item.garrafas }}</span>
        </template>
        <template #item.dataAquisicao="{ item }">{{ formatarData(item.dataAquisicao) }}</template>
        <template #item.prontoParaBeber="{ item }">
          <v-icon :color="item.prontoParaBeber ? 'success' : 'warning'" size="20">
            {{ item.prontoParaBeber ? 'mdi-check-circle-outline' : 'mdi-timer-sand' }}
          </v-icon>
          <span class="d-sr-only">{{ item.prontoParaBeber ? 'Sim' : 'Não' }}</span>
        </template>
        <template #item.organico="{ item }">
          <v-icon :color="item.organico ? 'secondary' : 'grey'" size="20">
            {{ item.organico ? 'mdi-leaf' : 'mdi-minus' }}
          </v-icon>
          <span class="d-sr-only">{{ item.organico ? 'Sim' : 'Não' }}</span>
        </template>
        <template #item.acoes="{ item }">
          <div class="d-flex justify-end ga-1">
            <v-tooltip text="Editar" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  :aria-label="`Editar ${item.rotulo}`"
                  @click="editar(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip text="Excluir" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  :aria-label="`Excluir ${item.rotulo}`"
                  @click="pedirExclusao(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <VinhoFormulario v-model="formularioAberto" :vinho="emEdicao" @salvar="salvar" />
    <ConfirmarExclusao v-model="confirmacaoAberta" :nome="paraExcluir?.rotulo ?? ''" @confirmar="confirmarExclusao" />
  </div>
</template>

<style scoped>
.campo-busca {
  max-width: 280px;
  min-width: 200px;
}
.botao-novo {
  box-shadow: 0 12px 24px -14px rgba(91, 26, 46, 0.9);
  transition: transform 0.3s var(--curva), box-shadow 0.3s var(--curva);
}
.botao-novo:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px -14px rgba(91, 26, 46, 0.9);
}
</style>
