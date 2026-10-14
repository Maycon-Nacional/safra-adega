<script setup lang="ts">
defineProps<{ sobretitulo: string; titulo: string; descricao?: string }>()
</script>

<template>
  <header class="cabecalho">
    <div class="surgir" style="--i: 0">
      <div class="sobretitulo mb-2">{{ sobretitulo }}</div>
      <h1 class="titulo-serifa titulo">{{ titulo }}</h1>
      <p v-if="descricao" class="text-medium-emphasis mt-2 descricao">{{ descricao }}</p>
    </div>
    <div class="acoes surgir" style="--i: 1">
      <slot name="acoes" />
    </div>
  </header>
</template>

<style scoped>
.cabecalho {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 28px;
}
.titulo {
  font-size: clamp(1.9rem, 1.3rem + 2vw, 2.7rem);
  line-height: 1.08;
}
.descricao {
  max-width: 60ch;
}
.acoes {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
