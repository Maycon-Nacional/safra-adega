<script setup lang="ts">
import { COR_TIPO, type TipoVinho } from '@/types/vinho'

defineProps<{ tipo: TipoVinho }>()
</script>

<template>
  <span class="selo-tipo" :style="{ '--cor': COR_TIPO[tipo] }">
    <span class="gota" />
    {{ tipo }}
  </span>
</template>

<style scoped>
.selo-tipo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 11px 3px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  background: color-mix(in srgb, var(--cor) 13%, transparent);
  color: color-mix(in srgb, var(--cor) 80%, rgb(var(--v-theme-on-surface)));
  border: 1px solid color-mix(in srgb, var(--cor) 30%, transparent);
}
.gota {
  width: 9px;
  height: 9px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: var(--cor);
}
</style>
