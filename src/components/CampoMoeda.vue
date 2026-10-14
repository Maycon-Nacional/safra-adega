<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

/**
 * Campo de valor em reais com máscara: os dígitos entram pelos centavos (como em caixas e apps de banco)
 * e o valor aparece formatado, ex.: 1.234,56. Devolve number ou null.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: number | string | null
    label: string
    errorMessages?: string | string[]
    error?: boolean
    hideDetails?: boolean
    clearable?: boolean
  }>(),
  { errorMessages: () => [], error: false, hideDetails: false, clearable: false },
)

const emit = defineEmits<{ 'update:modelValue': [valor: number | null] }>()

const formato = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const LIMITE_DIGITOS = 9 // até 9.999.999,99

const texto = computed(() => {
  const n = props.modelValue === null || props.modelValue === '' ? NaN : Number(props.modelValue)
  return Number.isFinite(n) ? formato.format(n) : ''
})

const campo = ref<{ $el: HTMLElement } | null>(null)

async function aoDigitar(valor: string | null) {
  const digitos = (valor ?? '').replace(/\D/g, '').replace(/^0+/, '').slice(0, LIMITE_DIGITOS)
  emit('update:modelValue', digitos ? Number(digitos) / 100 : null)
  // se o que foi digitado não muda o valor (ex.: uma letra), devolve o campo ao texto formatado
  await nextTick()
  const entrada = campo.value?.$el.querySelector('input')
  if (entrada && entrada.value !== texto.value) entrada.value = texto.value
}
</script>

<template>
  <v-text-field
    ref="campo"
    :model-value="texto"
    :label="label"
    :error-messages="errorMessages"
    :error="error"
    :hide-details="hideDetails"
    :clearable="clearable"
    prefix="R$"
    placeholder="0,00"
    inputmode="numeric"
    autocomplete="off"
    class="campo-moeda"
    @update:model-value="aoDigitar"
    @click:clear="emit('update:modelValue', null)"
  />
</template>

<style scoped>
.campo-moeda :deep(input) {
  font-variant-numeric: tabular-nums;
}
</style>
