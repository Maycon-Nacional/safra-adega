<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { useDisplay } from 'vuetify'
import { TIPOS_VINHO, type Vinho, type VinhoSemId, type TipoVinho } from '@/types/vinho'
import { buscarPaises, mensagemDeErro, type Pais } from '@/services/ibge'
import { hojeIso } from '@/utils/formato'
import { avisar } from '@/services/aviso'
import EditorImagem from './EditorImagem.vue'
import CampoData from './CampoData.vue'
import CampoMoeda from './CampoMoeda.vue'

const props = defineProps<{ modelValue: boolean; vinho: Vinho | null }>()
const emit = defineEmits<{
  'update:modelValue': [aberto: boolean]
  salvar: [dados: VinhoSemId, id: number | null]
}>()

const { xs } = useDisplay()
const editando = computed(() => props.vinho !== null)
const ANO_ATUAL = new Date().getFullYear()

/* ---------------- validação (vee-validate) ---------------- */

interface ValoresFormulario {
  rotulo: string
  produtor: string
  tipo: TipoVinho | null
  uva: string
  pais: string | null
  continente: string
  safra: number | null
  preco: number | null
  garrafas: number | null
  dataAquisicao: string
  prontoParaBeber: boolean
  organico: boolean
  notas: string
  imagem: string
}

type Regra = (valor: any, ctx: { form: Record<string, any> }) => true | string

const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === ''
const TEXTO_VALIDO = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,'&()\-ºª]+$/
const UVA_VALIDA = /^[A-Za-zÀ-ÖØ-öø-ÿ\s,'\-]+$/

const esquema: Record<keyof ValoresFormulario, Regra> = {
  rotulo: (v) => {
    if (vazio(v)) return 'Informe o nome do rótulo.'
    const t = String(v).trim()
    if (t.length < 3) return 'O rótulo precisa ter pelo menos 3 caracteres.'
    if (t.length > 80) return 'O rótulo pode ter no máximo 80 caracteres.'
    if (!TEXTO_VALIDO.test(t)) return 'O rótulo contém caracteres não permitidos.'
    return true
  },
  produtor: (v) => {
    if (vazio(v)) return 'Informe o produtor ou vinícola.'
    const t = String(v).trim()
    if (t.length < 2) return 'O produtor precisa ter pelo menos 2 caracteres.'
    if (t.length > 60) return 'O produtor pode ter no máximo 60 caracteres.'
    if (!TEXTO_VALIDO.test(t)) return 'O produtor contém caracteres não permitidos.'
    return true
  },
  tipo: (v) => (v && (TIPOS_VINHO as readonly string[]).includes(v) ? true : 'Selecione o tipo do vinho.'),
  uva: (v) => {
    if (vazio(v)) return 'Informe a uva (ou as uvas, separadas por vírgula).'
    const t = String(v).trim()
    if (t.length < 3) return 'A uva precisa ter pelo menos 3 caracteres.'
    if (t.length > 80) return 'Use no máximo 80 caracteres.'
    if (!UVA_VALIDA.test(t)) return 'Use apenas letras, espaços, hífen e vírgula.'
    return true
  },
  pais: (v) => (vazio(v) ? 'Selecione o país de origem.' : true),
  continente: () => true,
  safra: (v) => {
    if (vazio(v)) return 'Informe o ano da safra.'
    const n = Number(v)
    if (!Number.isInteger(n)) return 'A safra deve ser um ano inteiro, ex.: 2019.'
    if (n < 1900) return 'A safra não pode ser anterior a 1900.'
    if (n > ANO_ATUAL) return `A safra não pode ser posterior a ${ANO_ATUAL}.`
    return true
  },
  preco: (v) => {
    if (vazio(v)) return 'Informe o preço pago por garrafa.'
    const n = Number(v)
    if (Number.isNaN(n)) return 'Digite um valor numérico, ex.: 149.90.'
    if (n <= 0) return 'O preço deve ser maior que zero.'
    if (n > 100000) return 'O preço máximo permitido é R$ 100.000,00.'
    if (!/^\d+(\.\d{1,2})?$/.test(String(v))) return 'Use no máximo duas casas decimais.'
    return true
  },
  garrafas: (v) => {
    if (vazio(v)) return 'Informe quantas garrafas há na adega.'
    const n = Number(v)
    if (!Number.isInteger(n)) return 'A quantidade deve ser um número inteiro.'
    if (n < 0) return 'A quantidade não pode ser negativa.'
    if (n > 999) return 'A quantidade máxima é 999 garrafas.'
    return true
  },
  dataAquisicao: (v, ctx) => {
    if (vazio(v)) return 'Informe a data de aquisição.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) return 'Data inválida.'
    if (v > hojeIso()) return 'A data de aquisição não pode estar no futuro.'
    const safra = Number(ctx.form.safra)
    if (Number.isInteger(safra) && Number(v.slice(0, 4)) < safra)
      return 'A aquisição não pode ser anterior ao ano da safra.'
    return true
  },
  prontoParaBeber: () => true,
  organico: () => true,
  notas: (v) => (String(v ?? '').length > 280 ? 'As notas podem ter no máximo 280 caracteres.' : true),
  imagem: () => true,
}

function valoresIniciais(): ValoresFormulario {
  if (props.vinho) {
    const { id: _id, ...resto } = props.vinho
    return { ...resto, imagem: resto.imagem ?? '' }
  }
  return {
    rotulo: '',
    produtor: '',
    tipo: null,
    uva: '',
    pais: null,
    continente: '',
    safra: null,
    preco: null,
    garrafas: 1,
    dataAquisicao: hojeIso(),
    prontoParaBeber: true,
    organico: false,
    notas: '',
    imagem: '',
  }
}

const { defineField, handleSubmit, resetForm, setFieldValue, values, isSubmitting } = useForm<ValoresFormulario>({
  validationSchema: esquema,
})

const configVuetify = { props: (estado: { errors: string[] }) => ({ 'error-messages': estado.errors }) }

const [rotulo, rotuloProps] = defineField('rotulo', configVuetify)
const [produtor, produtorProps] = defineField('produtor', configVuetify)
const [tipo, tipoProps] = defineField('tipo', configVuetify)
const [uva, uvaProps] = defineField('uva', configVuetify)
const [pais, paisProps] = defineField('pais', configVuetify)
const [safra, safraProps] = defineField('safra', configVuetify)
const [preco, precoProps] = defineField('preco', configVuetify)
const [garrafas, garrafasProps] = defineField('garrafas', configVuetify)
const [dataAquisicao, dataProps] = defineField('dataAquisicao', configVuetify)
const [prontoParaBeber] = defineField('prontoParaBeber')
const [organico] = defineField('organico')
const [notas, notasProps] = defineField('notas', configVuetify)
const [imagem] = defineField('imagem')

/* ---------------- API do IBGE (Axios) ---------------- */

const paises = ref<Pais[]>([])
const carregandoPaises = ref(false)
const erroPaises = ref('')

async function carregarPaises() {
  if (paises.value.length) return
  carregandoPaises.value = true
  erroPaises.value = ''
  try {
    paises.value = await buscarPaises()
  } catch (erro) {
    erroPaises.value = mensagemDeErro(erro)
    avisar(erroPaises.value, 'erro')
  } finally {
    carregandoPaises.value = false
  }
}

// Se a API falhar durante uma edição, o país já salvo continua disponível.
const opcoesPais = computed(() => {
  if (paises.value.length) return paises.value.map((p) => p.nome)
  return values.pais ? [values.pais] : []
})

function aoEscolherPais(nome: string | null) {
  const encontrado = paises.value.find((p) => p.nome === nome)
  setFieldValue('continente', encontrado?.continente ?? (nome ? values.continente : ''))
}

/* ---------------- abrir / salvar ---------------- */

watch(
  () => props.modelValue,
  (aberto) => {
    if (!aberto) return
    resetForm({ values: valoresIniciais() })
    carregarPaises()
  },
  { immediate: true },
)

const fechar = () => emit('update:modelValue', false)

const enviar = handleSubmit(
  (v) => {
    const dados: VinhoSemId = {
      rotulo: v.rotulo.trim(),
      produtor: v.produtor.trim(),
      tipo: v.tipo as TipoVinho,
      uva: v.uva.trim(),
      pais: v.pais as string,
      continente: v.continente || 'Não informado',
      safra: Number(v.safra),
      preco: Number(v.preco),
      garrafas: Number(v.garrafas),
      dataAquisicao: v.dataAquisicao,
      prontoParaBeber: Boolean(v.prontoParaBeber),
      organico: Boolean(v.organico),
      notas: (v.notas ?? '').trim(),
      imagem: v.imagem ?? '',
    }
    emit('salvar', dados, props.vinho?.id ?? null)
  },
  () => avisar('Há campos com erro. Revise os itens destacados antes de salvar.', 'erro'),
)
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    :fullscreen="xs"
    max-width="860"
    scrollable
    persistent
    transition="dialog-bottom-transition"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="formulario">
      <div class="faixa">
        <div>
          <div class="sobretitulo faixa-sobre">{{ editando ? 'Edição' : 'Novo registro' }}</div>
          <div class="titulo-serifa text-h5 mt-1">
            {{ editando ? vinho?.rotulo : 'Adicionar rótulo à adega' }}
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" aria-label="Fechar formulário" @click="fechar" />
      </div>

      <v-card-text class="pt-6">
        <form id="form-vinho" novalidate @submit.prevent="enviar">
          <div class="secao">Identificação</div>
          <v-row dense>
            <v-col cols="12" md="7">
              <v-text-field v-model="rotulo" v-bind="rotuloProps" label="Rótulo *" counter="80" prepend-inner-icon="mdi-label-outline" />
            </v-col>
            <v-col cols="12" md="5">
              <v-text-field v-model="produtor" v-bind="produtorProps" label="Produtor / vinícola *" prepend-inner-icon="mdi-barn" />
            </v-col>
            <v-col cols="12" md="5">
              <v-select v-model="tipo" v-bind="tipoProps" :items="[...TIPOS_VINHO]" label="Tipo *" prepend-inner-icon="mdi-glass-wine" />
            </v-col>
            <v-col cols="12" md="7">
              <v-text-field
                v-model="uva"
                v-bind="uvaProps"
                label="Uva(s) *"
                hint="Para cortes, separe por vírgula: Cabernet Sauvignon, Merlot"
                prepend-inner-icon="mdi-fruit-grapes-outline"
              />
            </v-col>
          </v-row>

          <div class="secao">Origem <span class="fonte">países carregados do IBGE</span></div>
          <v-row dense>
            <v-col cols="12" md="7">
              <v-autocomplete
                v-model="pais"
                v-bind="paisProps"
                :items="opcoesPais"
                :loading="carregandoPaises"
                :disabled="carregandoPaises && !opcoesPais.length"
                label="País de origem *"
                prepend-inner-icon="mdi-earth"
                no-data-text="Nenhum país encontrado"
                clearable
                @update:model-value="aoEscolherPais"
              />
            </v-col>
            <v-col cols="12" md="5">
              <v-text-field
                :model-value="values.continente"
                label="Continente"
                readonly
                prepend-inner-icon="mdi-map-outline"
                hint="Preenchido automaticamente pelo país"
                persistent-hint
              />
            </v-col>
            <v-col v-if="erroPaises" cols="12">
              <v-alert type="warning" variant="tonal" density="compact" class="mb-2">
                {{ erroPaises }}
                <template #append>
                  <v-btn size="small" variant="text" :loading="carregandoPaises" @click="carregarPaises">
                    Tentar de novo
                  </v-btn>
                </template>
              </v-alert>
            </v-col>
          </v-row>

          <div class="secao">Adega</div>
          <v-row dense>
            <v-col cols="6" md="3">
              <v-number-input
                v-model="safra"
                v-bind="safraProps"
                label="Safra *"
                :min="1900"
                :max="ANO_ATUAL"
                control-variant="stacked"
                inset
              />
            </v-col>
            <v-col cols="6" md="3">
              <CampoMoeda v-model="preco" :error-messages="precoProps['error-messages']" label="Preço *" />
            </v-col>
            <v-col cols="6" md="3">
              <v-number-input
                v-model="garrafas"
                v-bind="garrafasProps"
                label="Garrafas *"
                :min="0"
                :max="999"
                control-variant="stacked"
                inset
              />
            </v-col>
            <v-col cols="6" md="3">
              <CampoData
                v-model="dataAquisicao"
                :error-messages="dataProps['error-messages']"
                label="Aquisição *"
                :max="hojeIso()"
              />
            </v-col>
          </v-row>

          <v-row dense class="mt-1">
            <v-col cols="12" sm="6">
              <div class="interruptor">
                <v-switch v-model="prontoParaBeber" hide-details>
                  <template #label>
                    <div>
                      <div class="font-weight-bold">Pronto para beber</div>
                      <div class="text-caption text-medium-emphasis">Desligado = ainda em guarda</div>
                    </div>
                  </template>
                </v-switch>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="interruptor">
                <v-switch v-model="organico" hide-details color="secondary">
                  <template #label>
                    <div>
                      <div class="font-weight-bold">Orgânico</div>
                      <div class="text-caption text-medium-emphasis">Produção certificada</div>
                    </div>
                  </template>
                </v-switch>
              </div>
            </v-col>
          </v-row>

          <div class="secao">Foto da garrafa <span class="fonte">opcional</span></div>
          <EditorImagem v-model="imagem" :tipo="tipo" />

          <div class="secao">Notas de degustação</div>
          <v-textarea v-model="notas" v-bind="notasProps" label="Notas (opcional)" rows="2" auto-grow counter="280" />
        </form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <span class="text-caption text-medium-emphasis d-none d-sm-inline">* campos obrigatórios</span>
        <v-spacer />
        <v-btn variant="text" @click="fechar">Cancelar</v-btn>
        <v-btn
          type="submit"
          form="form-vinho"
          color="primary"
          variant="flat"
          :loading="isSubmitting"
          prepend-icon="mdi-content-save-outline"
        >
          {{ editando ? 'Salvar alterações' : 'Cadastrar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.faixa {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 22px 24px;
  color: #fff8ee;
  background: radial-gradient(120% 140% at 0% 0%, #8a2b47 0%, #5b1a2e 45%, #2e0c17 100%);
}
.faixa-sobre {
  color: #e2c58e;
}
.secao {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: var(--fonte-titulo);
  font-size: 1.05rem;
  margin: 10px 0 12px;
}
.secao:not(:first-child) {
  margin-top: 22px;
}
.fonte {
  font-family: var(--fonte-texto);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}
.interruptor {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  padding: 4px 14px;
}
</style>
