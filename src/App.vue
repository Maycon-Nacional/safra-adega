<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import MenuLateral from '@/components/MenuLateral.vue'
import AvisoGlobal from '@/components/AvisoGlobal.vue'

const { mdAndUp } = useDisplay()
const tema = useTheme()
const menuAberto = ref(mdAndUp.value)
watch(mdAndUp, (desktop) => (menuAberto.value = desktop))

const CHAVE_TEMA = 'safra:tema'

function alternarTema() {
  const proximo = tema.global.current.value.dark ? 'adega' : 'adegaNoite'
  tema.global.name.value = proximo
  localStorage.setItem(CHAVE_TEMA, proximo)
}

onMounted(() => {
  const salvo = localStorage.getItem(CHAVE_TEMA)
  if (salvo === 'adega' || salvo === 'adegaNoite') tema.global.name.value = salvo
})
</script>

<template>
  <v-app>
    <MenuLateral v-model="menuAberto" :escuro="tema.global.current.value.dark" @alternar-tema="alternarTema" />

    <v-app-bar v-if="!mdAndUp" flat color="background" density="comfortable" class="barra-movel">
      <v-app-bar-nav-icon aria-label="Abrir menu" @click="menuAberto = !menuAberto" />
      <v-app-bar-title>
        <span class="titulo-serifa text-primary">Safra</span>
      </v-app-bar-title>
      <v-btn
        icon
        :aria-label="tema.global.current.value.dark ? 'Usar tema claro' : 'Usar tema escuro'"
        @click="alternarTema"
      >
        <v-icon>{{ tema.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <div class="conteudo">
        <router-view v-slot="{ Component, route }">
          <transition name="rota" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </v-main>

    <AvisoGlobal />
  </v-app>
</template>

<style scoped>
.conteudo {
  position: relative;
  z-index: 1;
  max-width: 1320px;
  margin: 0 auto;
  padding: 32px 32px 64px;
}
.barra-movel {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
@media (max-width: 600px) {
  .conteudo {
    padding: 20px 16px 48px;
  }
}
</style>
