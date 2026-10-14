<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { TipoVinho } from '@/types/vinho'
import { urlImagem } from '@/utils/formato'
import FotoVinho from './FotoVinho.vue'

const props = defineProps<{ modelValue: string; tipo: TipoVinho | null }>()
const emit = defineEmits<{ 'update:modelValue': [imagem: string] }>()

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAXIMO = 8 * 1024 * 1024
const SAIDA = { largura: 600, altura: 800, qualidade: 0.82 }

const entradaArquivo = ref<HTMLInputElement | null>(null)
const moldura = ref<HTMLDivElement | null>(null)
const arrastandoArquivo = ref(false)
const erro = ref('')
const editando = ref(false)
const processando = ref(false)

/* ---------------- estado do enquadramento ---------------- */

const fonte = ref('') // endereço da imagem em edição
const natural = ref({ largura: 0, altura: 0 })
const molduraTam = ref({ largura: 0, altura: 0 })
const modo = ref<'preencher' | 'inteira'>('preencher')
const zoom = ref(1)
const rotacao = ref(0)
const deslocamento = ref({ x: 0, y: 0 })
const movendo = ref(false)

const girada = computed(() => rotacao.value % 180 !== 0)

// escala que faz a imagem cobrir (ou caber inteira na) moldura, antes do zoom
const escalaBase = computed(() => {
  const { largura: iw, altura: ih } = natural.value
  const { largura: fw, altura: fh } = molduraTam.value
  if (!iw || !fw) return 1
  const w = girada.value ? ih : iw
  const h = girada.value ? iw : ih
  return modo.value === 'preencher' ? Math.max(fw / w, fh / h) : Math.min(fw / w, fh / h)
})

const escala = computed(() => escalaBase.value * zoom.value)

function limitar(x: number, y: number) {
  const { largura: iw, altura: ih } = natural.value
  const w = (girada.value ? ih : iw) * escala.value
  const h = (girada.value ? iw : ih) * escala.value
  const limX = Math.abs(w - molduraTam.value.largura) / 2
  const limY = Math.abs(h - molduraTam.value.altura) / 2
  return { x: Math.max(-limX, Math.min(limX, x)), y: Math.max(-limY, Math.min(limY, y)) }
}

const estiloImagem = computed(() => ({
  width: `${natural.value.largura}px`,
  height: `${natural.value.altura}px`,
  transform: `translate(-50%, -50%) translate(${deslocamento.value.x}px, ${deslocamento.value.y}px) rotate(${rotacao.value}deg) scale(${escala.value})`,
}))

function reenquadrar() {
  deslocamento.value = limitar(deslocamento.value.x, deslocamento.value.y)
}

function restaurar() {
  modo.value = 'preencher'
  zoom.value = 1
  rotacao.value = 0
  deslocamento.value = { x: 0, y: 0 }
}

function girar() {
  rotacao.value = (rotacao.value + 90) % 360
  nextTick(reenquadrar)
}

function trocarModo(novo: 'preencher' | 'inteira') {
  modo.value = novo
  zoom.value = 1
  deslocamento.value = { x: 0, y: 0 }
}

/* ---------------- arrastar e zoom ---------------- */

let inicio = { px: 0, py: 0, x: 0, y: 0 }

function aoPressionar(e: PointerEvent) {
  movendo.value = true
  inicio = { px: e.clientX, py: e.clientY, x: deslocamento.value.x, y: deslocamento.value.y }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function aoMover(e: PointerEvent) {
  if (!movendo.value) return
  deslocamento.value = limitar(inicio.x + e.clientX - inicio.px, inicio.y + e.clientY - inicio.py)
}

function aoSoltar() {
  movendo.value = false
}

function aoRolar(e: WheelEvent) {
  zoom.value = Math.max(1, Math.min(4, +(zoom.value - e.deltaY * 0.0015).toFixed(3)))
  reenquadrar()
}

function aoTeclar(e: KeyboardEvent) {
  const passo = e.shiftKey ? 20 : 6
  const mov: Record<string, [number, number]> = {
    ArrowLeft: [-passo, 0],
    ArrowRight: [passo, 0],
    ArrowUp: [0, -passo],
    ArrowDown: [0, passo],
  }
  if (e.key === '+' || e.key === '=') zoom.value = Math.min(4, zoom.value + 0.1)
  else if (e.key === '-') zoom.value = Math.max(1, zoom.value - 0.1)
  else if (mov[e.key]) deslocamento.value = limitar(deslocamento.value.x + mov[e.key][0], deslocamento.value.y + mov[e.key][1])
  else return
  e.preventDefault()
  reenquadrar()
}

/* ---------------- abrir arquivo ---------------- */

function escolherArquivo() {
  entradaArquivo.value?.click()
}

function aoSelecionar(e: Event) {
  const arquivo = (e.target as HTMLInputElement).files?.[0]
  if (arquivo) abrirArquivo(arquivo)
  ;(e.target as HTMLInputElement).value = ''
}

function aoSoltarArquivo(e: DragEvent) {
  arrastandoArquivo.value = false
  const arquivo = e.dataTransfer?.files?.[0]
  if (arquivo) abrirArquivo(arquivo)
}

function abrirArquivo(arquivo: File) {
  erro.value = ''
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    erro.value = 'Formato não suportado. Envie uma imagem JPG, PNG ou WebP.'
    return
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    erro.value = `A imagem tem ${(arquivo.size / 1024 / 1024).toFixed(1)} MB. O limite é 8 MB.`
    return
  }
  const leitor = new FileReader()
  leitor.onload = () => iniciarEdicao(String(leitor.result))
  leitor.onerror = () => (erro.value = 'Não foi possível ler o arquivo selecionado.')
  leitor.readAsDataURL(arquivo)
}

function iniciarEdicao(endereco: string) {
  processando.value = true
  const img = new Image()
  img.onload = () => {
    natural.value = { largura: img.naturalWidth, altura: img.naturalHeight }
    fonte.value = endereco
    restaurar()
    editando.value = true
    processando.value = false
  }
  img.onerror = () => {
    processando.value = false
    erro.value = 'O arquivo não parece ser uma imagem válida.'
  }
  img.src = endereco
}

function ajustarAtual() {
  if (props.modelValue) iniciarEdicao(urlImagem(props.modelValue))
}

// a moldura entra depois da transição; o observador mede o tamanho real dela (e acompanha redimensionamentos)
const observador = new ResizeObserver(([entrada]) => {
  const { width, height } = entrada.contentRect
  if (!width) return
  const anterior = molduraTam.value.largura
  molduraTam.value = { largura: width, altura: height }
  if (anterior && anterior !== width) {
    const f = width / anterior
    deslocamento.value = limitar(deslocamento.value.x * f, deslocamento.value.y * f)
  }
})

watch(moldura, (el, antigo) => {
  if (antigo) observador.unobserve(antigo)
  if (el) {
    observador.observe(el)
    nextTick(() => el.focus({ preventScroll: true }))
  } else {
    molduraTam.value = { largura: 0, altura: 0 }
  }
})

onBeforeUnmount(() => observador.disconnect())

/* ---------------- gerar imagem final ---------------- */

async function aplicar() {
  processando.value = true
  try {
    const img = new Image()
    img.src = fonte.value
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = SAIDA.largura
    canvas.height = SAIDA.altura
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')

    const k = SAIDA.largura / molduraTam.value.largura
    ctx.fillStyle = '#efe6d8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingQuality = 'high'
    ctx.translate(canvas.width / 2 + deslocamento.value.x * k, canvas.height / 2 + deslocamento.value.y * k)
    ctx.rotate((rotacao.value * Math.PI) / 180)
    ctx.scale(escala.value * k, escala.value * k)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

    let resultado = canvas.toDataURL('image/webp', SAIDA.qualidade)
    // navegadores sem suporte a WebP devolvem PNG; nesse caso usa JPEG, que é bem menor
    if (!resultado.startsWith('data:image/webp')) resultado = canvas.toDataURL('image/jpeg', 0.85)

    emit('update:modelValue', resultado)
    editando.value = false
  } catch {
    erro.value = 'Não foi possível processar a imagem. Tente outro arquivo.'
  } finally {
    processando.value = false
  }
}

function cancelar() {
  editando.value = false
}

function remover() {
  emit('update:modelValue', '')
  erro.value = ''
}
</script>

<template>
  <div class="editor">
    <input ref="entradaArquivo" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="aoSelecionar" />

    <Transition name="painel" mode="out-in">
      <!-- enquadramento -->
      <div v-if="editando" key="editar" class="enquadrar">
        <div
          ref="moldura"
          class="moldura"
          :class="{ movendo, inteira: modo === 'inteira' }"
          tabindex="0"
          role="application"
          aria-label="Área de enquadramento. Arraste ou use as setas para posicionar e + ou - para o zoom."
          @pointerdown="aoPressionar"
          @pointermove="aoMover"
          @pointerup="aoSoltar"
          @pointercancel="aoSoltar"
          @wheel.prevent="aoRolar"
          @keydown="aoTeclar"
        >
          <img :src="fonte" alt="" draggable="false" :style="estiloImagem" />
          <div class="tercos" aria-hidden="true" />
          <div class="dica-arrastar" aria-hidden="true">
            <v-icon size="16">mdi-cursor-move</v-icon> Arraste para posicionar
          </div>
        </div>

        <div class="controles">
          <v-btn-toggle
            :model-value="modo"
            mandatory
            density="compact"
            variant="outlined"
            color="primary"
            divided
            rounded="lg"
            class="w-100"
            @update:model-value="trocarModo"
          >
            <v-btn value="preencher" class="flex-grow-1" prepend-icon="mdi-crop">Preencher</v-btn>
            <v-btn value="inteira" class="flex-grow-1" prepend-icon="mdi-fit-to-screen-outline">Ajustar inteira</v-btn>
          </v-btn-toggle>

          <div class="linha-zoom">
            <v-icon size="18">mdi-magnify-minus-outline</v-icon>
            <v-slider
              v-model="zoom"
              :min="1"
              :max="4"
              :step="0.01"
              hide-details
              color="primary"
              aria-label="Zoom"
              @update:model-value="reenquadrar"
            />
            <v-icon size="18">mdi-magnify-plus-outline</v-icon>
          </div>

          <div class="d-flex ga-2">
            <v-btn variant="tonal" size="small" prepend-icon="mdi-rotate-right" @click="girar">Girar</v-btn>
            <v-btn variant="text" size="small" prepend-icon="mdi-restore" @click="restaurar">Restaurar</v-btn>
          </div>

          <p class="text-caption text-medium-emphasis mb-0">
            “Preencher” corta as bordas para ocupar toda a moldura. “Ajustar inteira” mostra a foto completa com
            fundo neutro.
          </p>

          <div class="d-flex ga-2 mt-auto">
            <v-btn variant="text" @click="cancelar">Cancelar</v-btn>
            <v-btn color="primary" variant="flat" prepend-icon="mdi-check" :loading="processando" @click="aplicar">
              Usar esta foto
            </v-btn>
          </div>
        </div>
      </div>

      <!-- foto escolhida -->
      <div v-else-if="modelValue" key="ver" class="com-foto">
        <div class="miniatura">
          <FotoVinho :imagem="modelValue" :tipo="tipo" alt="Foto do vinho" />
        </div>
        <div class="d-flex flex-column ga-2 justify-center">
          <v-btn variant="tonal" color="primary" prepend-icon="mdi-crop-rotate" :loading="processando" @click="ajustarAtual">
            Ajustar enquadramento
          </v-btn>
          <v-btn variant="text" prepend-icon="mdi-image-sync-outline" @click="escolherArquivo">Trocar foto</v-btn>
          <v-btn variant="text" color="error" prepend-icon="mdi-image-remove-outline" @click="remover">Remover foto</v-btn>
        </div>
      </div>

      <!-- sem foto -->
      <button
        v-else
        key="vazio"
        type="button"
        class="soltar"
        :class="{ ativo: arrastandoArquivo }"
        @click="escolherArquivo"
        @dragover.prevent="arrastandoArquivo = true"
        @dragleave.prevent="arrastandoArquivo = false"
        @drop.prevent="aoSoltarArquivo"
      >
        <span class="icone-soltar">
          <v-progress-circular v-if="processando" indeterminate size="22" width="2" color="primary" />
          <v-icon v-else size="26" color="primary">mdi-image-plus-outline</v-icon>
        </span>
        <span class="font-weight-bold">Arraste a foto da garrafa ou clique para escolher</span>
        <span class="text-caption text-medium-emphasis">JPG, PNG ou WebP · até 8 MB · você ajusta o corte em seguida</span>
      </button>
    </Transition>

    <v-expand-transition>
      <div v-if="erro" class="erro-imagem" role="alert">
        <v-icon size="16">mdi-alert-circle-outline</v-icon> {{ erro }}
      </div>
    </v-expand-transition>
  </div>
</template>

<style scoped>
.soltar {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 16px;
  border-radius: 14px;
  border: 1.5px dashed rgba(var(--v-theme-primary), 0.35);
  background: rgba(var(--v-theme-primary), 0.03);
  text-align: center;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.3s var(--curva);
}
.soltar:hover,
.soltar:focus-visible,
.soltar.ativo {
  background: rgba(var(--v-theme-primary), 0.07);
  border-color: rgb(var(--v-theme-primary));
  outline: none;
}
.soltar.ativo {
  transform: scale(1.01);
}
.icone-soltar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
  background: rgba(var(--v-theme-primary), 0.1);
  transition: transform 0.4s var(--curva);
}
.soltar:hover .icone-soltar,
.soltar.ativo .icone-soltar {
  transform: translateY(-3px) rotate(-6deg);
}
.com-foto {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}
.com-foto :deep(.v-btn) {
  justify-content: flex-start;
}
.miniatura {
  width: 132px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 14px 28px -18px rgba(60, 20, 30, 0.7);
}
.enquadrar {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 22px;
}
.moldura {
  position: relative;
  width: 240px;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 12px;
  background: #efe6d8;
  cursor: grab;
  touch-action: none;
  user-select: none;
  outline: none;
  box-shadow: 0 0 0 1px rgba(var(--v-border-color), 0.2), 0 18px 34px -22px rgba(60, 20, 30, 0.8);
  transition: box-shadow 0.25s ease;
}
.moldura:focus-visible {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.5);
}
.moldura.movendo {
  cursor: grabbing;
}
.moldura img {
  position: absolute;
  left: 50%;
  top: 50%;
  max-width: none;
  pointer-events: none;
  transition: transform 0.18s ease-out;
}
.moldura.movendo img {
  transition: none;
}
.tercos {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
  background-image:
    linear-gradient(to right, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.7) 33.33%, transparent calc(33.33% + 0.5px), transparent calc(66.66% - 0.5px), rgba(255, 255, 255, 0.7) 66.66%, transparent calc(66.66% + 0.5px)),
    linear-gradient(to bottom, transparent calc(33.33% - 0.5px), rgba(255, 255, 255, 0.7) 33.33%, transparent calc(33.33% + 0.5px), transparent calc(66.66% - 0.5px), rgba(255, 255, 255, 0.7) 66.66%, transparent calc(66.66% + 0.5px));
}
.moldura.movendo .tercos,
.moldura:hover .tercos {
  opacity: 1;
}
.dica-arrastar {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  white-space: nowrap;
  color: #fff;
  background: rgba(20, 10, 12, 0.55);
  backdrop-filter: blur(4px);
  pointer-events: none;
  animation: sumir 3.5s 1.5s forwards;
}
@keyframes sumir {
  to {
    opacity: 0;
  }
}
.controles {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.linha-zoom {
  display: flex;
  align-items: center;
  gap: 8px;
}
.erro-imagem {
  margin-top: 10px;
  font-size: 0.82rem;
  color: rgb(var(--v-theme-error));
}
.painel-enter-active,
.painel-leave-active {
  transition: opacity 0.3s ease, transform 0.35s var(--curva);
}
.painel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.painel-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
@media (max-width: 600px) {
  .enquadrar {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .moldura {
    width: min(260px, 100%);
  }
  .controles {
    width: 100%;
  }
}
</style>
