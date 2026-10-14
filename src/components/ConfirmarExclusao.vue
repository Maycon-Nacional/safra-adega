<script setup lang="ts">
defineProps<{ modelValue: boolean; nome: string }>()
const emit = defineEmits<{
  'update:modelValue': [aberto: boolean]
  confirmar: []
}>()
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="440"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="pa-2">
      <v-card-item>
        <div class="icone-alerta mb-4">
          <v-icon color="error" size="26">mdi-delete-alert-outline</v-icon>
        </div>
        <v-card-title class="titulo-serifa text-h5 px-0">Remover da adega?</v-card-title>
      </v-card-item>
      <v-card-text class="pt-0">
        O registro <strong>{{ nome }}</strong> será excluído definitivamente. Essa ação não pode ser desfeita.
      </v-card-text>
      <v-card-actions class="px-4 pb-3">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="error" variant="flat" prepend-icon="mdi-delete-outline" @click="emit('confirmar')">
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.icone-alerta {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(var(--v-theme-error), 0.1);
  animation: balancar 0.6s 0.15s var(--curva);
}
@keyframes balancar {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-9deg);
  }
  60% {
    transform: rotate(6deg);
  }
}
</style>
