<script setup lang="ts">
import { computed, ref } from 'vue'
import { vinhos } from '@/services/storage'
import { filtrosVazios, type FiltrosConsulta, type FiltroBooleano, type Vinho } from '@/types/vinho'
import { formatarData, formatarMoeda, normalizar, simNao } from '@/utils/formato'
import CabecalhoPagina from '@/components/CabecalhoPagina.vue'
import BarraFiltros from '@/components/BarraFiltros.vue'
import CartaoVinho from '@/components/CartaoVinho.vue'
import SeloTipo from '@/components/SeloTipo.vue'
import ContadorAnimado from '@/components/ContadorAnimado.vue'

const filtros = ref<FiltrosConsulta>(filtrosVazios())
const modo = ref<'cartoes' | 'tabela'>('cartoes')
const ordem = ref<'recentes' | 'rotulo' | 'precoAsc' | 'precoDesc' | 'safra'>('recentes')

const opcoesOrdem = [
  { title: 'Aquisição mais recente', value: 'recentes' },
  { title: 'Rótulo (A–Z)', value: 'rotulo' },
  { title: 'Menor preço', value: 'precoAsc' },
  { title: 'Maior preço', value: 'precoDesc' },
  { title: 'Safra mais antiga', value: 'safra' },
]

const paisesDisponiveis = computed(() =>
  [...new Set(vinhos.value.map((v) => v.pais))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
)

function atendeBooleano(filtro: FiltroBooleano, valor: boolean) {
  return filtro === 'todos' || (filtro === 'sim') === valor
}

function atendeBusca(v: Vinho, termo: string) {
  if (!termo) return true
  const campos = [v.rotulo, v.produtor, v.uva, v.pais, v.continente, v.tipo, v.notas, String(v.safra)]
  return campos.some((c) => normalizar(c).includes(termo))
}

// Todos os filtros são aplicados ao mesmo tempo, de forma reativa.
const resultados = computed(() => {
  const f = filtros.value
  const termo = normalizar(f.busca ?? '')

  const filtrados = vinhos.value.filter(
    (v) =>
      atendeBusca(v, termo) &&
      (f.tipos.length === 0 || f.tipos.includes(v.tipo)) &&
      (f.paises.length === 0 || f.paises.includes(v.pais)) &&
      (f.precoMin === null || v.preco >= f.precoMin) &&
      (f.precoMax === null || v.preco <= f.precoMax) &&
      (!f.dataDe || v.dataAquisicao >= f.dataDe) &&
      (!f.dataAte || v.dataAquisicao <= f.dataAte) &&
      atendeBooleano(f.pronto, v.prontoParaBeber) &&
      atendeBooleano(f.organico, v.organico),
  )

  const ordenadores: Record<typeof ordem.value, (a: Vinho, b: Vinho) => number> = {
    recentes: (a, b) => b.dataAquisicao.localeCompare(a.dataAquisicao),
    rotulo: (a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'),
    precoAsc: (a, b) => a.preco - b.preco,
    precoDesc: (a, b) => b.preco - a.preco,
    safra: (a, b) => a.safra - b.safra,
  }
  return filtrados.sort(ordenadores[ordem.value])
})

const filtrosAtivos = computed(() => {
  const f = filtros.value
  return [
    !!f.busca?.trim(),
    f.tipos.length > 0,
    f.paises.length > 0,
    f.precoMin !== null || f.precoMax !== null,
    !!f.dataDe || !!f.dataAte,
    f.pronto !== 'todos',
    f.organico !== 'todos',
  ].filter(Boolean).length
})

function limparFiltros() {
  filtros.value = filtrosVazios()
}

const cabecalhos = [
  { title: 'Rótulo', key: 'rotulo', minWidth: 180 },
  { title: 'Produtor', key: 'produtor' },
  { title: 'Tipo', key: 'tipo' },
  { title: 'Uva', key: 'uva' },
  { title: 'País', key: 'pais' },
  { title: 'Continente', key: 'continente' },
  { title: 'Safra', key: 'safra', align: 'end' as const },
  { title: 'Preço', key: 'preco', align: 'end' as const },
  { title: 'Garrafas', key: 'garrafas', align: 'end' as const },
  { title: 'Aquisição', key: 'dataAquisicao' },
  { title: 'Pronto', key: 'prontoParaBeber' },
  { title: 'Orgânico', key: 'organico' },
  { title: 'Notas', key: 'notas', minWidth: 220, sortable: false },
]
</script>

<template>
  <div>
    <CabecalhoPagina
      sobretitulo="Consulta"
      titulo="Acervo completo"
      descricao="Combine a busca com os filtros para encontrar exatamente a garrafa que procura."
    />

    <div class="surgir" style="--i: 2">
      <BarraFiltros
        v-model:filtros="filtros"
        :paises-disponiveis="paisesDisponiveis"
        :ativos="filtrosAtivos"
        @limpar="limparFiltros"
      />
    </div>

    <div class="barra-resultados surgir" style="--i: 3">
      <div class="contagem" aria-live="polite">
        <span class="titulo-serifa numero"><ContadorAnimado :valor="resultados.length" :duracao="500" /></span>
        <span class="text-medium-emphasis">
          {{ resultados.length === 1 ? 'resultado encontrado' : 'resultados encontrados' }}
          <span class="d-none d-sm-inline">de {{ vinhos.length }} no acervo</span>
        </span>
      </div>
      <div class="d-flex ga-3 align-center flex-wrap">
        <v-select
          v-model="ordem"
          :items="opcoesOrdem"
          density="compact"
          hide-details
          label="Ordenar por"
          class="campo-ordem"
        />
        <v-btn-toggle v-model="modo" mandatory density="compact" variant="outlined" color="primary" divided rounded="lg">
          <v-btn value="cartoes" icon="mdi-view-grid-outline" aria-label="Ver em cartões" />
          <v-btn value="tabela" icon="mdi-table" aria-label="Ver em tabela" />
        </v-btn-toggle>
      </div>
    </div>

    <v-fade-transition mode="out-in">
      <div v-if="resultados.length === 0" key="vazio" class="vazio">
        <svg viewBox="0 0 120 120" class="vazio-ilustracao" aria-hidden="true">
          <path d="M44 10h32v18c0 6 10 10 10 26v52a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V54c0-16 10-20 10-26z" fill="none" stroke="currentColor" stroke-width="2.5" />
          <rect x="34" y="66" width="52" height="26" rx="2" fill="currentColor" opacity="0.12" />
          <path d="M50 79h20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <h2 class="titulo-serifa text-h5 mt-4">Nenhuma garrafa por aqui</h2>
        <p class="text-medium-emphasis mt-2">
          <template v-if="vinhos.length">Nenhum registro atende a todos os filtros escolhidos. Tente afrouxar algum critério.</template>
          <template v-else>O acervo ainda está vazio. Cadastre um rótulo na página de gerenciamento.</template>
        </p>
        <v-btn v-if="filtrosAtivos" class="mt-5" color="primary" variant="tonal" prepend-icon="mdi-filter-remove-outline" @click="limparFiltros">
          Limpar filtros
        </v-btn>
        <v-btn v-else-if="!vinhos.length" class="mt-5" color="primary" variant="flat" to="/adega">Ir para a adega</v-btn>
      </div>

      <TransitionGroup v-else-if="modo === 'cartoes'" key="cartoes" name="lista" tag="div" class="grade">
        <CartaoVinho v-for="v in resultados" :key="v.id" :vinho="v" />
      </TransitionGroup>

      <v-card v-else key="tabela" class="cartao-papel" flat>
        <v-data-table
          :headers="cabecalhos"
          :items="resultados"
          item-value="id"
          class="tabela-adega"
          :items-per-page="10"
          items-per-page-text="Itens por página"
          :mobile-breakpoint="'sm'"
        >
          <template #item.rotulo="{ item }"><strong>{{ item.rotulo }}</strong></template>
          <template #item.tipo="{ item }"><SeloTipo :tipo="item.tipo" /></template>
          <template #item.preco="{ item }">{{ formatarMoeda(item.preco) }}</template>
          <template #item.dataAquisicao="{ item }">{{ formatarData(item.dataAquisicao) }}</template>
          <template #item.prontoParaBeber="{ item }">
            <v-chip size="small" :color="item.prontoParaBeber ? 'success' : 'warning'" variant="tonal">
              {{ simNao(item.prontoParaBeber) }}
            </v-chip>
          </template>
          <template #item.organico="{ item }">
            <v-chip size="small" :color="item.organico ? 'secondary' : undefined" variant="tonal">
              {{ simNao(item.organico) }}
            </v-chip>
          </template>
          <template #item.notas="{ item }">
            <span class="text-medium-emphasis">{{ item.notas || '—' }}</span>
          </template>
        </v-data-table>
      </v-card>
    </v-fade-transition>
  </div>
</template>

<style scoped>
.barra-resultados {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 28px 0 18px;
}
.contagem {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.numero {
  font-size: 2.4rem;
  line-height: 1;
  color: rgb(var(--v-theme-primary));
}
.campo-ordem {
  min-width: 220px;
}
.grade {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
}
.vazio {
  text-align: center;
  padding: 64px 16px;
  border: 1px dashed rgba(var(--v-border-color), 0.25);
  border-radius: 20px;
}
.vazio-ilustracao {
  width: 96px;
  color: rgb(var(--v-theme-primary));
  animation: tombar 2.8s ease-in-out infinite;
  transform-origin: 50% 100%;
}
@keyframes tombar {
  0%,
  100% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(4deg);
  }
}
@media (max-width: 600px) {
  .campo-ordem {
    min-width: 0;
    flex: 1;
  }
  .grade {
    grid-template-columns: 1fr;
  }
}
</style>
