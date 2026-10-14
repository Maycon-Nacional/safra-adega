<script setup lang="ts">
import type { Vinho } from '@/types/vinho'
import { formatarMoeda } from '@/utils/formato'
import FotoVinho from './FotoVinho.vue'
import SeloTipo from './SeloTipo.vue'

defineProps<{ vinho: Vinho }>()
const emit = defineEmits<{ abrir: [vinho: Vinho] }>()
</script>

<template>
  <button type="button" class="cartao" :aria-label="`Ver detalhes de ${vinho.rotulo}`" @click="emit('abrir', vinho)">
    <div class="vitrine">
      <FotoVinho :imagem="vinho.imagem" :tipo="vinho.tipo" :alt="vinho.rotulo" zoom />
      <div class="reflexo" aria-hidden="true" />
      <div class="sombra" aria-hidden="true" />
      <div class="topo">
        <SeloTipo :tipo="vinho.tipo" class="selo-vidro" />
        <span class="safra">{{ vinho.safra }}</span>
      </div>
      <span v-if="vinho.garrafas === 0" class="faixa-esgotado">Esgotado</span>
      <div class="ver-mais" aria-hidden="true">
        <v-icon size="16">mdi-arrow-top-right</v-icon> Ver detalhes
      </div>
    </div>

    <div class="info">
      <div class="origem">{{ vinho.pais }} · {{ vinho.uva }}</div>
      <h3 class="titulo-serifa rotulo">{{ vinho.rotulo }}</h3>
      <div class="produtor">{{ vinho.produtor }}</div>
      <div class="rodape">
        <span class="preco titulo-serifa">{{ formatarMoeda(vinho.preco) }}</span>
        <span class="icones">
          <v-icon v-if="vinho.organico" size="18" color="secondary" title="Orgânico">mdi-leaf</v-icon>
          <v-icon
            :color="vinho.prontoParaBeber ? 'success' : 'warning'"
            size="18"
            :title="vinho.prontoParaBeber ? 'Pronto para beber' : 'Em guarda'"
          >
            {{ vinho.prontoParaBeber ? 'mdi-glass-wine' : 'mdi-timer-sand' }}
          </v-icon>
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.cartao {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  text-align: left;
  border-radius: 18px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: transform 0.5s var(--curva), box-shadow 0.5s var(--curva);
  outline: none;
}
.cartao:hover,
.cartao:focus-visible {
  transform: translateY(-6px);
  box-shadow: 0 30px 50px -32px rgba(60, 20, 30, 0.75);
}
.cartao:focus-visible {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.45), 0 30px 50px -32px rgba(60, 20, 30, 0.75);
}
.vitrine {
  position: relative;
}
.sombra {
  position: absolute;
  inset: auto 0 0 0;
  height: 40%;
  background: linear-gradient(to top, rgba(18, 8, 10, 0.55), transparent);
  opacity: 0;
  transition: opacity 0.45s ease;
}
.reflexo {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.28) 50%, transparent 65%);
  transform: translateX(-120%);
  pointer-events: none;
}
.cartao:hover .reflexo {
  transition: transform 0.9s var(--curva);
  transform: translateX(120%);
}
.cartao:hover .sombra,
.cartao:focus-visible .sombra {
  opacity: 1;
}
.topo {
  position: absolute;
  inset: 12px 12px auto 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.selo-vidro {
  background: rgba(255, 252, 246, 0.85) !important;
  backdrop-filter: blur(6px);
}
.safra {
  font-family: var(--fonte-titulo);
  font-size: 0.95rem;
  padding: 2px 10px;
  border-radius: 999px;
  color: #fff8ee;
  background: rgba(30, 12, 16, 0.55);
  backdrop-filter: blur(6px);
}
.faixa-esgotado {
  position: absolute;
  top: 18px;
  right: -36px;
  transform: rotate(35deg) translateY(30px);
  padding: 4px 40px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(var(--v-theme-error));
}
.ver-mais {
  position: absolute;
  left: 14px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.35s ease, transform 0.45s var(--curva);
}
.cartao:hover .ver-mais,
.cartao:focus-visible .ver-mais {
  opacity: 1;
  transform: none;
}
.info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 18px 18px;
}
.origem {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--latao);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rotulo {
  font-size: 1.22rem;
  line-height: 1.2;
  margin-top: 6px;
}
.produtor {
  font-size: 0.88rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 2px;
}
.rodape {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 14px;
}
.preco {
  font-size: 1.15rem;
  color: rgb(var(--v-theme-primary));
}
.icones {
  display: flex;
  gap: 6px;
}
@media (max-width: 600px) {
  .info {
    padding: 12px 12px 14px;
  }
  .rotulo {
    font-size: 1rem;
  }
  .produtor {
    font-size: 0.78rem;
  }
  .preco {
    font-size: 1rem;
  }
  .topo {
    inset: 8px 8px auto 8px;
  }
  .selo-vidro {
    font-size: 0.7rem;
  }
  .faixa-esgotado {
    font-size: 0.6rem;
  }
}
</style>
