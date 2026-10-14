<script setup lang="ts">
import { computed } from 'vue'
import CampoData from './CampoData.vue'
import CampoMoeda from './CampoMoeda.vue'
import { TIPOS_VINHO, type FiltrosConsulta, type FiltroBooleano } from '@/types/vinho'

const props = defineProps<{
  filtros: FiltrosConsulta
  paisesDisponiveis: string[]
  ativos: number
  limitesSafra: [number, number]
}>()

const emit = defineEmits<{
  'update:filtros': [filtros: FiltrosConsulta]
  limpar: []
}>()

function alterar<K extends keyof FiltrosConsulta>(campo: K, valor: FiltrosConsulta[K]) {
  emit('update:filtros', { ...props.filtros, [campo]: valor })
}

const opcoesBooleanas: { valor: FiltroBooleano; texto: string }[] = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'sim', texto: 'Sim' },
  { valor: 'nao', texto: 'Não' },
]

// sem filtro, o controle fica nas pontas; encostar numa ponta remove aquele limite
const faixaSafra = computed<[number, number]>(() => {
  const [min, max] = props.limitesSafra
  const de = props.filtros.safraMin ?? min
  const ate = props.filtros.safraMax ?? max
  return [Math.max(min, Math.min(de, max)), Math.min(max, Math.max(ate, min))]
})

function alterarSafra(valor: number[]) {
  const [min, max] = props.limitesSafra
  const de = Math.round(valor[0])
  const ate = Math.round(valor[1])
  emit('update:filtros', {
    ...props.filtros,
    safraMin: de <= min ? null : de,
    safraMax: ate >= max ? null : ate,
  })
}

const precoInvalido = computed(
  () => props.filtros.precoMin !== null && props.filtros.precoMax !== null && props.filtros.precoMin > props.filtros.precoMax,
)
const dataInvalida = computed(
  () => !!props.filtros.dataDe && !!props.filtros.dataAte && props.filtros.dataDe > props.filtros.dataAte,
)
</script>

<template>
  <v-card class="cartao-papel barra" flat>
    <div class="busca">
      <v-text-field
        :model-value="filtros.busca"
        placeholder="Buscar por rótulo, produtor, uva, país, tipo ou notas…"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        variant="solo-filled"
        flat
        density="comfortable"
        aria-label="Busca geral"
        @update:model-value="alterar('busca', $event ?? '')"
      />
    </div>

    <v-row dense class="mt-3">
      <v-col cols="12" sm="6" lg="3">
        <v-select
          :model-value="filtros.tipos"
          :items="[...TIPOS_VINHO]"
          label="Tipo"
          multiple
          chips
          closable-chips
          clearable
          hide-details
          prepend-inner-icon="mdi-glass-wine"
          @update:model-value="alterar('tipos', $event ?? [])"
        />
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-autocomplete
          :model-value="filtros.paises"
          :items="paisesDisponiveis"
          label="País"
          multiple
          chips
          closable-chips
          clearable
          hide-details
          prepend-inner-icon="mdi-earth"
          no-data-text="Nenhum país cadastrado"
          @update:model-value="alterar('paises', $event ?? [])"
        />
      </v-col>
      <v-col cols="6" sm="3" lg="3">
        <CampoMoeda
          :model-value="filtros.precoMin"
          label="Preço de"
          :error="precoInvalido"
          hide-details
          clearable
          @update:model-value="alterar('precoMin', $event)"
        />
      </v-col>
      <v-col cols="6" sm="3" lg="3">
        <CampoMoeda
          :model-value="filtros.precoMax"
          label="Preço até"
          :error="precoInvalido"
          hide-details
          clearable
          @update:model-value="alterar('precoMax', $event)"
        />
      </v-col>
      <v-col cols="12" sm="3" lg="3">
        <CampoData
          :model-value="filtros.dataDe"
          label="Adquirido de"
          :error="dataInvalida"
          hide-details
          clearable
          @update:model-value="alterar('dataDe', $event)"
        />
      </v-col>
      <v-col cols="12" sm="3" lg="3">
        <CampoData
          :model-value="filtros.dataAte"
          label="Adquirido até"
          :error="dataInvalida"
          hide-details
          clearable
          @update:model-value="alterar('dataAte', $event)"
        />
      </v-col>

      <v-col cols="12">
        <div class="grupo grupo-safra">
          <div class="d-flex justify-space-between align-center w-100">
            <span class="rotulo-grupo">Safra</span>
            <span class="faixa-texto titulo-serifa">{{ faixaSafra[0] }} – {{ faixaSafra[1] }}</span>
          </div>
          <v-range-slider
            :model-value="faixaSafra"
            :min="limitesSafra[0]"
            :max="limitesSafra[1]"
            :step="1"
            :disabled="limitesSafra[0] === limitesSafra[1]"
            color="primary"
            track-color="accent"
            thumb-label
            strict
            hide-details
            class="w-100"
            aria-label="Faixa de safra"
            @update:model-value="alterarSafra"
          />
        </div>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <div class="grupo">
          <span class="rotulo-grupo">Pronto para beber</span>
          <v-btn-toggle
            :model-value="filtros.pronto"
            mandatory
            density="compact"
            color="primary"
            variant="outlined"
            divided
            rounded="lg"
            @update:model-value="alterar('pronto', $event)"
          >
            <v-btn v-for="o in opcoesBooleanas" :key="o.valor" :value="o.valor" size="small">{{ o.texto }}</v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <div class="grupo">
          <span class="rotulo-grupo">Orgânico</span>
          <v-btn-toggle
            :model-value="filtros.organico"
            mandatory
            density="compact"
            color="secondary"
            variant="outlined"
            divided
            rounded="lg"
            @update:model-value="alterar('organico', $event)"
          >
            <v-btn v-for="o in opcoesBooleanas" :key="o.valor" :value="o.valor" size="small">{{ o.texto }}</v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
    </v-row>

    <v-expand-transition>
      <div v-if="precoInvalido || dataInvalida" class="text-error text-caption mt-2">
        <v-icon size="16">mdi-alert-outline</v-icon>
        {{ precoInvalido ? 'O preço inicial está maior que o final.' : 'A data inicial está depois da data final.' }}
      </div>
    </v-expand-transition>

    <div class="rodape-barra">
      <span class="text-body-2 text-medium-emphasis">
        <template v-if="ativos">{{ ativos }} {{ ativos === 1 ? 'filtro ativo' : 'filtros ativos' }}</template>
        <template v-else>Nenhum filtro aplicado</template>
      </span>
      <v-btn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-filter-remove-outline"
        :disabled="!ativos"
        @click="emit('limpar')"
      >
        Limpar filtros
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.barra {
  padding: 20px;
}
.grupo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  min-height: 48px;
  padding: 6px 4px 6px 14px;
  border: 1px solid rgba(var(--v-border-color), 0.22);
  border-radius: 6px;
}
.grupo-safra {
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  padding: 10px 18px 6px;
}
.faixa-texto {
  font-size: 1rem;
  color: rgb(var(--v-theme-primary));
  font-variant-numeric: tabular-nums;
}
.rotulo-grupo {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.rodape-barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed rgba(var(--v-border-color), 0.2);
}
</style>
