<script setup lang="ts">
import { computed, ref } from 'vue'
import { vinhos, criarVinho, atualizarVinho, removerVinho } from '@/services/storage'
import { avisar } from '@/services/aviso'
import { formatarData, formatarMoeda } from '@/utils/formato'
import type { Vinho, VinhoSemId } from '@/types/vinho'
import CabecalhoPagina from '@/components/CabecalhoPagina.vue'
import VinhoFormulario from '@/components/VinhoFormulario.vue'
import ConfirmarExclusao from '@/components/ConfirmarExclusao.vue'
import SeloTipo from '@/components/SeloTipo.vue'
import FotoVinho from '@/components/FotoVinho.vue'

const busca = ref('')
const soEstoqueBaixo = ref(false)

// 0 garrafas = esgotado; 1 garrafa = última unidade
const estoqueBaixo = computed(() => vinhos.value.filter((v) => v.garrafas <= 1))
const esgotados = computed(() => estoqueBaixo.value.filter((v) => v.garrafas === 0).length)
const itensTabela = computed(() => (soEstoqueBaixo.value ? estoqueBaixo.value : vinhos.value))

const propsLinha = ({ item }: { item: Vinho }) => (item.garrafas <= 1 ? { class: 'linha-estoque-baixo' } : {})
const formularioAberto = ref(false)
const emEdicao = ref<Vinho | null>(null)
const confirmacaoAberta = ref(false)
const paraExcluir = ref<Vinho | null>(null)

const cabecalhos = [
  { title: 'Rótulo', key: 'rotulo', minWidth: 260 },
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
  } catch (erro) {
    avisar(erro instanceof Error ? erro.message : 'Não foi possível salvar o registro.', 'erro')
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

    <v-expand-transition>
      <div v-if="estoqueBaixo.length" class="alerta-estoque surgir" style="--i: 2" role="status">
        <div class="alerta-icone"><v-icon size="22">mdi-bottle-wine-outline</v-icon></div>
        <div class="flex-grow-1">
          <div class="font-weight-bold">
            {{ estoqueBaixo.length }} {{ estoqueBaixo.length === 1 ? 'rótulo com estoque baixo' : 'rótulos com estoque baixo' }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            <template v-if="esgotados">{{ esgotados }} {{ esgotados === 1 ? 'esgotado' : 'esgotados' }} e </template>
            {{ estoqueBaixo.length - esgotados }} com a última garrafa.
          </div>
        </div>
        <v-btn
          :variant="soEstoqueBaixo ? 'flat' : 'tonal'"
          color="warning"
          :prepend-icon="soEstoqueBaixo ? 'mdi-filter-remove-outline' : 'mdi-filter-outline'"
          @click="soEstoqueBaixo = !soEstoqueBaixo"
        >
          {{ soEstoqueBaixo ? 'Mostrar todos' : 'Ver só estes' }}
        </v-btn>
      </div>
    </v-expand-transition>

    <v-card class="cartao-papel surgir" style="--i: 3" flat>
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
        :items="itensTabela"
        :row-props="propsLinha"
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
          <div class="d-flex align-center ga-3 py-2">
            <FotoVinho :imagem="item.imagem" :tipo="item.tipo" class="miniatura" />
            <div>
              <div class="font-weight-bold">{{ item.rotulo }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.produtor }} · {{ item.uva }}</div>
            </div>
          </div>
        </template>
        <template #item.tipo="{ item }">
          <SeloTipo :tipo="item.tipo" />
        </template>
        <template #item.preco="{ item }">{{ formatarMoeda(item.preco) }}</template>
        <template #item.garrafas="{ item }">
          <v-chip v-if="item.garrafas === 0" size="small" color="error" variant="tonal" prepend-icon="mdi-alert-circle-outline">
            Esgotado
          </v-chip>
          <v-chip v-else-if="item.garrafas === 1" size="small" color="warning" variant="tonal" prepend-icon="mdi-bottle-wine-outline">
            Última
          </v-chip>
          <span v-else>{{ item.garrafas }}</span>
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
.alerta-estoque {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: rgba(var(--v-theme-warning), 0.09);
  border: 1px solid rgba(var(--v-theme-warning), 0.3);
}
.alerta-icone {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.15);
  animation: pulsar 2.4s ease-in-out infinite;
}
@keyframes pulsar {
  50% {
    box-shadow: 0 0 0 6px rgba(var(--v-theme-warning), 0.08);
  }
}
.tabela-adega :deep(.linha-estoque-baixo) {
  background: rgba(var(--v-theme-warning), 0.05);
}
.tabela-adega :deep(.linha-estoque-baixo td:first-child) {
  box-shadow: inset 3px 0 0 rgb(var(--v-theme-warning));
}
.miniatura {
  width: 36px;
  flex-shrink: 0;
  border-radius: 6px;
}
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
