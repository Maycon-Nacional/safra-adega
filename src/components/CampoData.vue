<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatarData } from '@/utils/formato'

/** Campo de data com o calendário do Vuetify. Recebe e devolve a data no formato AAAA-MM-DD. */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    min?: string
    max?: string
    errorMessages?: string | string[]
    error?: boolean
    hideDetails?: boolean
    clearable?: boolean
  }>(),
  { min: undefined, max: undefined, errorMessages: () => [], error: false, hideDetails: false, clearable: false },
)

const emit = defineEmits<{ 'update:modelValue': [data: string] }>()

const aberto = ref(false)

function paraIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

function deIso(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a, m - 1, d)
}

const dataSelecionada = computed(() => deIso(props.modelValue))
const texto = computed(() => (props.modelValue ? formatarData(props.modelValue) : ''))

function escolher(valor: unknown) {
  if (!(valor instanceof Date)) return
  emit('update:modelValue', paraIso(valor))
  aberto.value = false
}

function limpar() {
  emit('update:modelValue', '')
}
</script>

<template>
  <v-menu v-model="aberto" :close-on-content-click="false" location="bottom start" offset="4" transition="scale-transition">
    <template #activator="{ props: ativador }">
      <v-text-field
        v-bind="ativador"
        :model-value="texto"
        :label="label"
        :error-messages="errorMessages"
        :error="error"
        :hide-details="hideDetails"
        :clearable="clearable"
        placeholder="dd/mm/aaaa"
        prepend-inner-icon="mdi-calendar-blank-outline"
        readonly
        class="campo-data"
        @click:clear.stop="limpar"
        @keydown.enter.prevent="aberto = true"
        @keydown.space.prevent="aberto = true"
      />
    </template>

    <v-card class="calendario" elevation="10" rounded="lg">
      <v-date-picker
        :model-value="dataSelecionada"
        :min="min"
        :max="max"
        color="primary"
        show-adjacent-months
        hide-header
        @update:model-value="escolher"
      />
      <v-divider />
      <div class="d-flex justify-space-between pa-2">
        <v-btn variant="text" size="small" :disabled="!modelValue" @click="limpar(); aberto = false">Limpar</v-btn>
        <v-btn variant="text" size="small" color="primary" @click="aberto = false">Fechar</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<style scoped>
.campo-data :deep(input) {
  cursor: pointer;
}
.calendario :deep(.v-date-picker) {
  background: transparent;
}
</style>
