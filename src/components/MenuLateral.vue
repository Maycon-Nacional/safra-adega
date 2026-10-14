<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { vinhos } from '@/services/storage'

defineProps<{ modelValue: boolean; escuro: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [aberto: boolean]
  'alternar-tema': []
}>()

const { mdAndUp } = useDisplay()

const itens = [
  { titulo: 'Início', icone: 'mdi-home-variant-outline', rota: '/' },
  { titulo: 'Gerenciar adega', icone: 'mdi-bottle-wine-outline', rota: '/adega' },
  { titulo: 'Consulta', icone: 'mdi-text-search-variant', rota: '/consulta' },
]

const totalGarrafas = computed(() => vinhos.value.reduce((soma, v) => soma + v.garrafas, 0))
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
    width="268"
    color="surface"
    class="menu"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="marca">
      <div class="selo">
        <v-icon size="22" color="#E9D9B8">mdi-glass-wine</v-icon>
      </div>
      <div>
        <div class="titulo-serifa nome">Safra</div>
        <div class="sobretitulo">Adega particular</div>
      </div>
    </div>

    <hr class="filete mx-5 mb-3" />

    <v-list nav density="comfortable" class="px-3">
      <v-list-item
        v-for="(item, i) in itens"
        :key="item.rota"
        :to="item.rota"
        :exact="item.rota === '/'"
        :prepend-icon="item.icone"
        :title="item.titulo"
        rounded="lg"
        color="primary"
        class="item surgir"
        :style="{ '--i': i }"
        @click="!mdAndUp && emit('update:modelValue', false)"
      />
    </v-list>

    <template #append>
      <div class="rodape">
        <div class="adega-resumo">
          <span class="sobretitulo">Na adega agora</span>
          <div class="d-flex align-baseline ga-1 mt-1">
            <span class="titulo-serifa text-h5">{{ totalGarrafas }}</span>
            <span class="text-medium-emphasis text-body-2">
              {{ totalGarrafas === 1 ? 'garrafa' : 'garrafas' }}
            </span>
          </div>
        </div>
        <v-btn
          v-if="mdAndUp"
          variant="text"
          block
          class="mt-3"
          :prepend-icon="escuro ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"
          @click="emit('alternar-tema')"
        >
          {{ escuro ? 'Tema claro' : 'Tema escuro' }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.menu {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
.marca {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 26px 22px 20px;
}
.selo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #7a2540, #3f1020);
  box-shadow: 0 8px 18px -8px rgba(91, 26, 46, 0.7);
}
.nome {
  font-size: 1.55rem;
  line-height: 1.1;
}
.item {
  margin-bottom: 4px;
  transition: transform 0.3s var(--curva);
}
.item:hover {
  transform: translateX(3px);
}
.rodape {
  padding: 16px 18px 20px;
}
.adega-resumo {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px dashed rgba(var(--v-theme-primary), 0.25);
}
</style>
