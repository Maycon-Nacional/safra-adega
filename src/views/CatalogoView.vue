<script setup lang="ts">
import { computed, ref } from 'vue'
import { vinhos } from '@/services/storage'
import { TIPOS_VINHO, COR_TIPO, type TipoVinho, type Vinho } from '@/types/vinho'
import { normalizar } from '@/utils/formato'
import CabecalhoPagina from '@/components/CabecalhoPagina.vue'
import CartaoCatalogo from '@/components/CartaoCatalogo.vue'
import DetalheVinho from '@/components/DetalheVinho.vue'

const busca = ref('')
const tipo = ref<TipoVinho | null>(null)
const detalheAberto = ref(false)
const selecionado = ref<Vinho | null>(null)

const contagemPorTipo = computed(() => {
  const mapa = new Map<TipoVinho, number>()
  for (const v of vinhos.value) mapa.set(v.tipo, (mapa.get(v.tipo) ?? 0) + 1)
  return mapa
})

// só mostra os tipos que existem no acervo
const tiposPresentes = computed(() => TIPOS_VINHO.filter((t) => contagemPorTipo.value.has(t)))

const vitrine = computed(() => {
  const termo = normalizar(busca.value ?? '')
  return vinhos.value
    .filter((v) => !tipo.value || v.tipo === tipo.value)
    .filter((v) => !termo || [v.rotulo, v.produtor, v.uva, v.pais].some((c) => normalizar(c).includes(termo)))
    .sort((a, b) => Number(b.garrafas > 0) - Number(a.garrafas > 0) || a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
})

// o cartão que sai fica absoluto para os outros se reorganizarem; antes disso ele guarda
// tamanho e posição atuais, senão perde a largura da coluna e a foto aparece gigante
function fixarAoSair(el: Element) {
  const item = el as HTMLElement
  item.style.width = `${item.offsetWidth}px`
  item.style.height = `${item.offsetHeight}px`
  item.style.left = `${item.offsetLeft}px`
  item.style.top = `${item.offsetTop}px`
}

function abrir(vinho: Vinho) {
  selecionado.value = vinho
  detalheAberto.value = true
}
</script>

<template>
  <div>
    <CabecalhoPagina
      sobretitulo="Catálogo"
      titulo="A adega em garrafas"
      descricao="Todos os rótulos com foto. Toque em uma garrafa para ver a ficha completa."
    >
      <template #acoes>
        <v-text-field
          v-model="busca"
          placeholder="Procurar rótulo, uva ou país"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          clearable
          class="campo-busca"
          aria-label="Procurar no catálogo"
        />
      </template>
    </CabecalhoPagina>

    <div class="tipos surgir" style="--i: 2" role="group" aria-label="Filtrar por tipo">
      <button type="button" class="tipo" :class="{ ativo: tipo === null }" @click="tipo = null">
        Todos <span class="qtd">{{ vinhos.length }}</span>
      </button>
      <button
        v-for="t in tiposPresentes"
        :key="t"
        type="button"
        class="tipo"
        :class="{ ativo: tipo === t }"
        :style="{ '--cor': COR_TIPO[t] }"
        :aria-pressed="tipo === t"
        @click="tipo = tipo === t ? null : t"
      >
        <span class="ponto" />{{ t }} <span class="qtd">{{ contagemPorTipo.get(t) }}</span>
      </button>
    </div>

    <TransitionGroup v-if="vitrine.length" name="vitrine" :duration="{ enter: 0, leave: 300 }" tag="div" class="grade" @before-leave="fixarAoSair">
      <div v-for="(v, i) in vitrine" :key="v.id" class="item" :style="{ '--i': Math.min(i, 12) }">
        <CartaoCatalogo :vinho="v" @abrir="abrir" />
      </div>
    </TransitionGroup>

    <div v-else class="vazio surgir">
      <v-icon size="40" color="primary">mdi-bottle-wine-outline</v-icon>
      <h2 class="titulo-serifa text-h5 mt-3">Nenhuma garrafa encontrada</h2>
      <p class="text-medium-emphasis mt-1">
        <template v-if="vinhos.length">Tente outro termo ou escolha outro tipo.</template>
        <template v-else>Cadastre rótulos em Gerenciar adega para montar o catálogo.</template>
      </p>
    </div>

    <DetalheVinho v-model="detalheAberto" :vinho="selecionado" />
  </div>
</template>

<style scoped>
.campo-busca {
  min-width: 260px;
}
.tipos {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 26px;
}
.tipo {
  --cor: rgb(var(--v-theme-primary));
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid rgba(var(--v-border-color), 0.2);
  background: rgb(var(--v-theme-surface));
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s var(--curva);
}
.tipo:hover {
  transform: translateY(-2px);
  border-color: var(--cor);
}
.tipo.ativo {
  color: #fff;
  background: var(--cor);
  border-color: var(--cor);
}
.ponto {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cor);
  transition: background 0.3s ease;
}
.tipo.ativo .ponto {
  background: #fff;
}
.qtd {
  font-size: 0.75rem;
  opacity: 0.6;
}
.grade {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 22px;
}
.item {
  min-width: 0;
  /* a entrada (inclusive ao trocar de filtro) fica a cargo desta animação em cascata */
  animation: surgir 0.7s var(--curva) both;
  animation-delay: calc(var(--i) * 60ms);
}
.vitrine-move {
  transition: transform 0.55s var(--curva);
}
.vitrine-leave-active {
  /* sem isso a animação de entrada (fill: both) segura a opacidade e o cartão nunca termina de sair */
  animation: none !important;
  position: absolute;
  transition: opacity 0.25s ease, transform 0.3s ease;
}
.vitrine-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
.vazio {
  text-align: center;
  padding: 60px 16px;
  border: 1px dashed rgba(var(--v-border-color), 0.25);
  border-radius: 20px;
}
@media (max-width: 600px) {
  .campo-busca {
    min-width: 0;
    flex: 1;
  }
  .grade {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
