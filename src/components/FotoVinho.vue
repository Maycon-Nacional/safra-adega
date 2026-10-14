<script setup lang="ts">
import { ref, watch } from 'vue'
import { COR_TIPO, type TipoVinho } from '@/types/vinho'
import { urlImagem } from '@/utils/formato'

/** Foto do vinho em proporção 3:4; sem imagem (ou se ela falhar) mostra a silhueta da garrafa na cor do tipo. */
const props = withDefaults(defineProps<{ imagem: string; tipo: TipoVinho | null; alt?: string; zoom?: boolean }>(), {
  alt: '',
  zoom: false,
})

const falhou = ref(false)
const carregada = ref(false)
watch(
  () => props.imagem,
  () => {
    falhou.value = false
    carregada.value = false
  },
)
</script>

<template>
  <div class="foto" :class="{ 'com-zoom': zoom }" :style="{ '--cor': tipo ? COR_TIPO[tipo] : '#8a6f5a' }">
    <img
      v-if="imagem && !falhou"
      :src="urlImagem(imagem)"
      :alt="alt"
      loading="lazy"
      decoding="async"
      :class="{ visivel: carregada }"
      @load="carregada = true"
      @error="falhou = true"
    />
    <div v-else class="silhueta" role="img" :aria-label="alt ? `${alt} (sem foto)` : 'Sem foto'">
      <svg viewBox="0 0 60 160" aria-hidden="true">
        <path
          d="M24 4h12v34c0 8 14 16 14 40v72a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6V78c0-24 14-32 14-40z"
          fill="currentColor"
        />
        <rect x="14" y="92" width="32" height="34" rx="2" fill="#fffaf2" opacity="0.85" />
        <rect x="20" y="102" width="20" height="2.5" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="23" y="109" width="14" height="2" rx="1" fill="currentColor" opacity="0.4" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.foto {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 50% 10%, color-mix(in srgb, var(--cor) 16%, transparent), transparent 70%),
    rgb(var(--v-theme-surface-variant));
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 0.6s ease, transform 0.9s var(--curva);
}
img.visivel {
  opacity: 1;
  transform: scale(1);
}
.com-zoom:hover img.visivel {
  transform: scale(1.07);
}
.silhueta {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--cor);
}
.silhueta svg {
  height: 62%;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.18));
}
</style>
