<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{ valor: number; formatar?: (n: number) => string; duracao?: number }>(), {
  formatar: (n: number) => Math.round(n).toLocaleString('pt-BR'),
  duracao: 900,
})

const exibido = ref(0)
let quadro = 0

function animar(de: number, ate: number) {
  cancelAnimationFrame(quadro)
  const inicio = performance.now()
  const passo = (agora: number) => {
    const t = Math.min((agora - inicio) / props.duracao, 1)
    const suave = 1 - Math.pow(1 - t, 4)
    exibido.value = de + (ate - de) * suave
    if (t < 1) quadro = requestAnimationFrame(passo)
  }
  quadro = requestAnimationFrame(passo)
}

watch(
  () => props.valor,
  (novo, antigo) => animar(antigo ?? 0, novo),
  { immediate: true },
)

onBeforeUnmount(() => cancelAnimationFrame(quadro))
</script>

<template>
  <span class="contador">{{ formatar(exibido) }}</span>
</template>

<style scoped>
.contador {
  font-variant-numeric: tabular-nums;
}
</style>
