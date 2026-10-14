<script setup lang="ts">
import { computed } from 'vue'
import { aviso } from '@/services/aviso'

const estilo = computed(() => {
  switch (aviso.tipo) {
    case 'erro':
      return { cor: 'error', icone: 'mdi-alert-circle-outline' }
    case 'info':
      return { cor: 'info', icone: 'mdi-information-outline' }
    default:
      return { cor: 'success', icone: 'mdi-check-circle-outline' }
  }
})
</script>

<template>
  <v-snackbar
    v-model="aviso.visivel"
    :color="estilo.cor"
    :timeout="3800"
    location="bottom"
    rounded="lg"
    elevation="8"
  >
    <div class="d-flex align-center ga-3">
      <v-icon>{{ estilo.icone }}</v-icon>
      <span>{{ aviso.texto }}</span>
    </div>
    <template #actions>
      <v-btn variant="text" icon="mdi-close" aria-label="Fechar aviso" @click="aviso.visivel = false" />
    </template>
  </v-snackbar>
</template>
