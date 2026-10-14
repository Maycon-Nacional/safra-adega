<script setup lang="ts">
import type { Vinho } from '@/types/vinho'
import { COR_TIPO } from '@/types/vinho'
import { formatarData, formatarMoeda, simNao } from '@/utils/formato'
import SeloTipo from './SeloTipo.vue'

defineProps<{ vinho: Vinho }>()
</script>

<template>
  <article class="cartao" :style="{ '--cor': COR_TIPO[vinho.tipo] }">
    <div class="topo">
      <SeloTipo :tipo="vinho.tipo" />
      <span class="safra titulo-serifa">{{ vinho.safra }}</span>
    </div>

    <h3 class="titulo-serifa rotulo">{{ vinho.rotulo }}</h3>
    <div class="produtor">{{ vinho.produtor }}</div>

    <dl class="dados">
      <div>
        <dt>Uva</dt>
        <dd>{{ vinho.uva }}</dd>
      </div>
      <div>
        <dt>Origem</dt>
        <dd>{{ vinho.pais }} · {{ vinho.continente }}</dd>
      </div>
      <div>
        <dt>Preço</dt>
        <dd>{{ formatarMoeda(vinho.preco) }}</dd>
      </div>
      <div>
        <dt>Garrafas</dt>
        <dd :class="{ 'text-error': vinho.garrafas === 0 }">
          {{ vinho.garrafas === 0 ? 'Esgotado' : vinho.garrafas }}
        </dd>
      </div>
      <div>
        <dt>Aquisição</dt>
        <dd>{{ formatarData(vinho.dataAquisicao) }}</dd>
      </div>
      <div>
        <dt>Pronto / Orgânico</dt>
        <dd>{{ simNao(vinho.prontoParaBeber) }} / {{ simNao(vinho.organico) }}</dd>
      </div>
    </dl>

    <p v-if="vinho.notas" class="notas">“{{ vinho.notas }}”</p>

    <div class="selos">
      <v-chip v-if="vinho.prontoParaBeber" size="small" color="success" variant="tonal" prepend-icon="mdi-glass-wine">
        Pronto para beber
      </v-chip>
      <v-chip v-else size="small" color="warning" variant="tonal" prepend-icon="mdi-timer-sand">Em guarda</v-chip>
      <v-chip v-if="vinho.organico" size="small" color="secondary" variant="tonal" prepend-icon="mdi-leaf">
        Orgânico
      </v-chip>
    </div>
  </article>
</template>

<style scoped>
.cartao {
  position: relative;
  height: 100%;
  padding: 22px 22px 18px;
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  overflow: hidden;
  transition: transform 0.45s var(--curva), box-shadow 0.45s var(--curva);
}
.cartao::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--cor);
  transform: scaleY(0.25);
  transform-origin: top;
  transition: transform 0.5s var(--curva);
}
.cartao:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 40px -28px rgba(60, 20, 30, 0.6);
}
.cartao:hover::before {
  transform: scaleY(1);
}
.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.safra {
  font-size: 1.6rem;
  color: rgba(var(--v-theme-on-surface), 0.18);
  transition: color 0.4s ease;
}
.cartao:hover .safra {
  color: var(--cor);
}
.rotulo {
  font-size: 1.3rem;
  line-height: 1.2;
  margin-top: 14px;
}
.produtor {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.9rem;
}
.dados {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin: 18px 0 0;
}
dt {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.45);
}
dd {
  font-size: 0.92rem;
  font-weight: 500;
}
.notas {
  margin-top: 14px;
  font-family: var(--fonte-titulo);
  font-style: italic;
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.72);
}
.selos {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 16px;
}
</style>
