<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Vinho } from '@/types/vinho'
import { formatarData, formatarMoeda, simNao } from '@/utils/formato'
import FotoVinho from './FotoVinho.vue'
import SeloTipo from './SeloTipo.vue'

defineProps<{ modelValue: boolean; vinho: Vinho | null }>()
const emit = defineEmits<{ 'update:modelValue': [aberto: boolean] }>()

const { xs } = useDisplay()
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    :fullscreen="xs"
    max-width="880"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card v-if="vinho" class="detalhe">
      <v-btn
        icon="mdi-close"
        variant="flat"
        size="small"
        class="fechar"
        aria-label="Fechar detalhes"
        @click="emit('update:modelValue', false)"
      />
      <div class="grade">
        <div class="foto-grande">
          <FotoVinho :imagem="vinho.imagem" :tipo="vinho.tipo" :alt="vinho.rotulo" />
        </div>

        <div class="conteudo">
          <div class="d-flex align-center ga-3 flex-wrap">
            <SeloTipo :tipo="vinho.tipo" />
            <span class="sobretitulo">Safra {{ vinho.safra }}</span>
          </div>
          <h2 class="titulo-serifa titulo">{{ vinho.rotulo }}</h2>
          <div class="text-medium-emphasis">{{ vinho.produtor }}</div>

          <div class="preco titulo-serifa">{{ formatarMoeda(vinho.preco) }}</div>

          <dl class="ficha">
            <div><dt>Uva</dt><dd>{{ vinho.uva }}</dd></div>
            <div><dt>Origem</dt><dd>{{ vinho.pais }} · {{ vinho.continente }}</dd></div>
            <div>
              <dt>Garrafas</dt>
              <dd :class="{ 'text-error': vinho.garrafas === 0 }">
                {{ vinho.garrafas === 0 ? 'Esgotado' : vinho.garrafas }}
              </dd>
            </div>
            <div><dt>Aquisição</dt><dd>{{ formatarData(vinho.dataAquisicao) }}</dd></div>
            <div><dt>Pronto para beber</dt><dd>{{ simNao(vinho.prontoParaBeber) }}</dd></div>
            <div><dt>Orgânico</dt><dd>{{ simNao(vinho.organico) }}</dd></div>
          </dl>

          <blockquote v-if="vinho.notas" class="notas">“{{ vinho.notas }}”</blockquote>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.detalhe {
  position: relative;
  overflow: hidden;
}
.fechar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}
.grade {
  display: grid;
  grid-template-columns: minmax(240px, 0.85fr) 1.15fr;
  overflow-y: auto;
}
.foto-grande {
  animation: revelar 0.7s var(--curva) both;
}
.foto-grande :deep(.foto) {
  height: 100%;
}
.conteudo {
  padding: 32px 32px 28px;
  animation: surgir 0.6s 0.1s var(--curva) both;
}
.titulo {
  font-size: clamp(1.6rem, 1.2rem + 1.4vw, 2.2rem);
  line-height: 1.1;
  margin-top: 14px;
}
.preco {
  font-size: 1.7rem;
  color: rgb(var(--v-theme-primary));
  margin: 18px 0 6px;
}
.ficha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px dashed rgba(var(--v-border-color), 0.22);
}
dt {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.45);
}
dd {
  font-weight: 500;
}
.notas {
  margin-top: 22px;
  padding-left: 14px;
  border-left: 3px solid var(--latao);
  font-family: var(--fonte-titulo);
  font-style: italic;
  font-size: 1.05rem;
  color: rgba(var(--v-theme-on-surface), 0.78);
}
@keyframes revelar {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
@media (max-width: 700px) {
  .grade {
    grid-template-columns: 1fr;
  }
  .foto-grande {
    max-height: 56vh;
    overflow: hidden;
  }
  .conteudo {
    padding: 22px 18px 28px;
  }
}
</style>
