<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { vinhos } from '@/services/storage'
import { buscarCotacao, mensagemDeErroCotacao, type Cotacao } from '@/services/cotacao'
import { avisar } from '@/services/aviso'
import { formatarData, formatarMoeda } from '@/utils/formato'
import TacaAnimada from '@/components/TacaAnimada.vue'
import ContadorAnimado from '@/components/ContadorAnimado.vue'
import SeloTipo from '@/components/SeloTipo.vue'

const totalRotulos = computed(() => vinhos.value.length)
const totalGarrafas = computed(() => vinhos.value.reduce((s, v) => s + v.garrafas, 0))
const valorAcervo = computed(() => vinhos.value.reduce((s, v) => s + v.preco * v.garrafas, 0))
const prontos = computed(() => vinhos.value.filter((v) => v.prontoParaBeber && v.garrafas > 0).length)

const cotacao = ref<Cotacao | null>(null)
const carregandoCotacao = ref(false)
const erroCotacao = ref('')

async function carregarCotacao() {
  carregandoCotacao.value = true
  erroCotacao.value = ''
  try {
    cotacao.value = await buscarCotacao()
  } catch (erro) {
    erroCotacao.value = mensagemDeErroCotacao(erro)
    avisar(erroCotacao.value, 'erro')
  } finally {
    carregandoCotacao.value = false
  }
}

onMounted(carregarCotacao)

const emDolar = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' })
const emEuro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' })

const dataCotacao = computed(() => {
  if (!cotacao.value) return ''
  const [dia, hora] = cotacao.value.atualizadoEm.split(' ')
  return `${formatarData(dia)} às ${hora.slice(0, 5)}`
})

const recentes = computed(() =>
  [...vinhos.value].sort((a, b) => b.dataAquisicao.localeCompare(a.dataAquisicao)).slice(0, 4),
)

const paises = computed(() => new Set(vinhos.value.map((v) => v.pais)).size)

const indicadores = computed(() => [
  { rotulo: 'Rótulos', valor: totalRotulos.value, icone: 'mdi-tag-outline' },
  { rotulo: 'Garrafas', valor: totalGarrafas.value, icone: 'mdi-bottle-wine-outline' },
  { rotulo: 'Prontos para abrir', valor: prontos.value, icone: 'mdi-glass-wine' },
  { rotulo: 'Países', valor: paises.value, icone: 'mdi-earth' },
])
</script>

<template>
  <div>
    <section class="heroi">
      <div class="heroi-texto">
        <div class="sobretitulo surgir" style="--i: 0">Acervo pessoal de vinhos</div>
        <h1 class="titulo-serifa heroi-titulo surgir" style="--i: 1">
          Cada garrafa,<br />
          <em>com a sua história.</em>
        </h1>
        <p class="heroi-sub surgir" style="--i: 2">
          Registre rótulos, safras e o momento certo de abrir cada vinho. Consulte o acervo por tipo, país, faixa de
          preço ou data de compra.
        </p>
        <div class="d-flex ga-3 flex-wrap mt-7 surgir" style="--i: 3">
          <v-btn to="/adega" color="primary" size="large" variant="flat" prepend-icon="mdi-bottle-wine-outline">
            Gerenciar adega
          </v-btn>
          <v-btn to="/consulta" size="large" variant="outlined" color="primary" prepend-icon="mdi-text-search-variant">
            Consultar acervo
          </v-btn>
        </div>
      </div>
      <div class="heroi-taca surgir" style="--i: 2">
        <div class="halo" />
        <TacaAnimada />
      </div>
    </section>

    <section class="indicadores">
      <div v-for="(ind, i) in indicadores" :key="ind.rotulo" class="indicador surgir" :style="{ '--i': i + 3 }">
        <v-icon color="accent" size="20">{{ ind.icone }}</v-icon>
        <div class="titulo-serifa numero"><ContadorAnimado :valor="ind.valor" /></div>
        <div class="text-medium-emphasis text-body-2">{{ ind.rotulo }}</div>
      </div>
    </section>

    <v-row class="mt-2">
      <v-col cols="12" md="7">
        <div class="sobretitulo mb-3">Últimas aquisições</div>
        <v-card class="cartao-papel" flat>
          <v-list v-if="recentes.length" lines="two" bg-color="transparent">
            <v-list-item
              v-for="(v, i) in recentes"
              :key="v.id"
              class="surgir"
              :style="{ '--i': i + 5 }"
              :title="v.rotulo"
              :subtitle="`${v.produtor} · ${v.pais} · safra ${v.safra}`"
            >
              <template #append>
                <div class="text-right">
                  <SeloTipo :tipo="v.tipo" />
                  <div class="text-caption text-medium-emphasis mt-1">{{ formatarData(v.dataAquisicao) }}</div>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="pa-8 text-center text-medium-emphasis">
            A adega está vazia. Cadastre o primeiro rótulo em <router-link to="/adega">Gerenciar adega</router-link>.
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <div class="sobretitulo mb-3">Valor estimado do acervo</div>
        <v-card class="valor surgir" style="--i: 6" flat>
          <div class="text-body-2 valor-legenda">Soma de preço × garrafas em estoque</div>
          <div class="titulo-serifa valor-numero">
            <ContadorAnimado :valor="valorAcervo" :formatar="formatarMoeda" :duracao="1400" />
          </div>
          <hr class="filete my-5" />
          <div class="d-flex justify-space-between text-body-2">
            <span>Preço médio por rótulo</span>
            <strong>{{ formatarMoeda(totalRotulos ? vinhos.reduce((s, v) => s + v.preco, 0) / totalRotulos : 0) }}</strong>
          </div>

          <div class="cambio mt-5" aria-live="polite">
            <div class="d-flex justify-space-between align-center mb-3">
              <span class="sobretitulo cambio-titulo">Em moeda estrangeira</span>
              <v-btn
                icon="mdi-refresh"
                size="x-small"
                variant="text"
                color="#F1D9A6"
                :loading="carregandoCotacao"
                aria-label="Atualizar cotação"
                @click="carregarCotacao"
              />
            </div>

            <div v-if="carregandoCotacao && !cotacao" class="moedas">
              <v-skeleton-loader v-for="n in 2" :key="n" type="text" class="esqueleto" />
            </div>

            <div v-else-if="erroCotacao && !cotacao" class="erro-cambio">
              <span>{{ erroCotacao }}</span>
              <v-btn size="small" variant="outlined" color="#F1D9A6" :loading="carregandoCotacao" @click="carregarCotacao">
                Tentar de novo
              </v-btn>
            </div>

            <template v-else-if="cotacao">
              <div class="moedas">
                <div class="moeda">
                  <span class="moeda-sigla">USD</span>
                  <span class="titulo-serifa moeda-valor">
                    <ContadorAnimado :valor="valorAcervo / cotacao.dolar" :formatar="(n) => emDolar.format(n)" />
                  </span>
                  <span class="moeda-taxa">US$ 1 = {{ formatarMoeda(cotacao.dolar) }}</span>
                </div>
                <div class="moeda">
                  <span class="moeda-sigla">EUR</span>
                  <span class="titulo-serifa moeda-valor">
                    <ContadorAnimado :valor="valorAcervo / cotacao.euro" :formatar="(n) => emEuro.format(n)" />
                  </span>
                  <span class="moeda-taxa">€ 1 = {{ formatarMoeda(cotacao.euro) }}</span>
                </div>
              </div>
              <div class="cambio-rodape">Cotação de {{ dataCotacao }} · AwesomeAPI</div>
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.heroi {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  align-items: center;
  gap: 32px;
  padding: 12px 0 28px;
}
.heroi-titulo {
  font-size: clamp(2.4rem, 1.4rem + 4vw, 4.4rem);
  line-height: 1.02;
  margin-top: 14px;
}
.heroi-titulo em {
  font-style: italic;
  font-weight: 400;
  color: rgb(var(--v-theme-primary));
}
.heroi-sub {
  margin-top: 18px;
  max-width: 48ch;
  font-size: 1.05rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.heroi-taca {
  position: relative;
  max-width: 260px;
  justify-self: center;
  width: 100%;
}
.halo {
  position: absolute;
  inset: 10% -20% 20%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(176, 138, 74, 0.28), transparent 65%);
  filter: blur(10px);
  animation: respirar 6s ease-in-out infinite;
}
@keyframes respirar {
  50% {
    transform: scale(1.08);
    opacity: 0.7;
  }
}
.indicadores {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(var(--v-border-color), 0.16);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.16);
  margin-bottom: 28px;
}
.indicador {
  padding: 22px 20px;
}
.indicador + .indicador {
  border-left: 1px solid rgba(var(--v-border-color), 0.16);
}
.numero {
  font-size: 2.3rem;
  line-height: 1.1;
  margin-top: 8px;
}
.valor {
  padding: 26px;
  color: #f8efe2;
  background: radial-gradient(140% 120% at 100% 0%, #8a2b47 0%, #5b1a2e 40%, #26101a 100%);
  box-shadow: 0 24px 50px -30px rgba(91, 26, 46, 0.9);
}
.valor-legenda {
  color: rgba(248, 239, 226, 0.7);
}
.valor-numero {
  font-size: clamp(2rem, 1.5rem + 2vw, 2.8rem);
  margin-top: 6px;
  color: #f1d9a6;
}
.cambio {
  padding: 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(241, 217, 166, 0.18);
}
.cambio-titulo {
  color: #e2c58e !important;
}
.moedas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.moeda {
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: surgir 0.6s var(--curva) both;
}
.moeda + .moeda {
  animation-delay: 90ms;
}
.moeda-sigla {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: rgba(248, 239, 226, 0.55);
}
.moeda-valor {
  font-size: 1.35rem;
  color: #f8efe2;
}
.moeda-taxa,
.cambio-rodape {
  font-size: 0.75rem;
  color: rgba(248, 239, 226, 0.6);
}
.cambio-rodape {
  margin-top: 12px;
}
.erro-cambio {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
}
.esqueleto {
  background: transparent !important;
  opacity: 0.35;
}
@media (max-width: 960px) {
  .heroi {
    grid-template-columns: 1fr;
  }
  .heroi-taca {
    max-width: 170px;
    order: -1;
  }
  .indicadores {
    grid-template-columns: repeat(2, 1fr);
  }
  .indicador:nth-child(3) {
    border-left: 0;
  }
  .indicador:nth-child(n + 3) {
    border-top: 1px solid rgba(var(--v-border-color), 0.16);
  }
}
</style>
