# Safra – Adega Particular

Avaliação 2 – FACET-SNP-310 – Frameworks Modernos para Desenvolvimento de Sistemas (2026.2)

## Integrantes

- Maycon Vasconcellos – @Maycon-Nacional

## Tema

Sistema para organizar uma adega pessoal de vinhos. A entidade cadastrada é o **Vinho**, com os campos:

| Campo | Tipo | Componente |
| --- | --- | --- |
| Rótulo | texto | `v-text-field` |
| Produtor / vinícola | texto | `v-text-field` |
| Tipo (Tinto, Branco, Rosé, Espumante, Fortificado, Sobremesa) | seleção | `v-select` |
| Uva(s) | texto | `v-text-field` |
| País de origem | seleção (API do IBGE) | `v-autocomplete` |
| Continente | texto (preenchido pela API) | `v-text-field` somente leitura |
| Safra | número | `v-number-input` |
| Preço por garrafa | número (R$) | `CampoMoeda` (`v-text-field` com máscara de reais) |
| Garrafas em estoque | número | `v-number-input` |
| Data de aquisição | data | `CampoData` (`v-menu` + `v-date-picker`) |
| Pronto para beber | booleano | `v-switch` |
| Orgânico | booleano | `v-switch` |
| Notas de degustação | texto (opcional) | `v-textarea` |
| Foto da garrafa | imagem (opcional) | componente `EditorImagem` |

## Funcionalidades

- **CRUD de vinhos** (`/adega`): tabela `v-data-table` com editar/excluir por linha, formulário em `v-dialog`
  validado com **vee-validate** (obrigatoriedade, formato, mínimos/máximos e regras como “data de aquisição não
  pode ser anterior à safra”), confirmação antes de excluir e `v-snackbar` após salvar, editar e excluir.
- **Página de consulta** (`/consulta`): exibe todos os registros com todos os campos (cartões ou tabela),
  busca geral sem diferenciar maiúsculas/minúsculas e acentos (rótulo, produtor, uva, país, continente, tipo,
  safra e notas) e filtros combinados por:
  - tipo (seleção múltipla);
  - país (seleção múltipla);
  - faixa de preço (de/até);
  - faixa de safra (`v-range-slider`);
  - intervalo de data de aquisição (de/até, com calendário);
  - pronto para beber (todos/sim/não);
  - orgânico (todos/sim/não).

  Os filtros são aplicados juntos via `computed`, há botão **Limpar filtros**, contador de resultados,
  ordenação e mensagem quando nada é encontrado. Os filtros ficam na URL (a consulta pode ser recarregada ou
  compartilhada) e os resultados filtrados podem ser baixados em **CSV** (separador `;`, abre direto no Excel).
- **Estoque baixo**: a página da adega avisa quantos rótulos estão esgotados ou com a última garrafa, destaca
  essas linhas e permite listar só eles.
- **Dados compartilhados e persistentes**: `src/services/storage.ts` concentra a leitura (`JSON.parse`) e a
  gravação (`JSON.stringify`) no `localStorage` e expõe uma lista reativa usada pelas duas páginas.
- **APIs consumidas** (ambas com **Axios**, indicador de carregamento e tratamento de erro com `try/catch`):
  - [IBGE – Localidades/Países](https://servicodados.ibge.gov.br/api/docs/localidades)
    (`src/services/ibge.ts`): carrega os países no formulário; o país escolhido preenche o continente.
    Erros (sem internet, tempo esgotado, erro do servidor) mostram aviso e botão para tentar de novo.
  - [AwesomeAPI – Cotações](https://docs.awesomeapi.com.br/api-de-moedas) (`src/services/cotacao.ts`):
    busca a cotação do dólar e do euro e a página inicial mostra o valor estimado do acervo em US$ e €,
    com data e hora da cotação, animação durante a atualização e botão para atualizar ou tentar de novo.
- **Fotos dos vinhos**: no cadastro e na edição é possível arrastar ou escolher uma imagem (JPG, PNG ou WebP,
  até 8 MB), com pré-visualização e editor de enquadramento: arrastar para posicionar, zoom, girar, opção
  **Preencher** (corta as bordas) ou **Ajustar inteira** (foto completa com fundo neutro). A imagem final é
  reduzida para 600 × 800 px em WebP antes de ser salva, para caber no `localStorage`.
- **Catálogo** (`/catalogo`): vitrine somente leitura com os vinhos em cartões com foto, filtro por tipo, busca
  e janela de detalhes com a ficha completa.
- Página inicial com resumo da adega, menu lateral (`v-navigation-drawer`) com rotas do **Vue Router**,
  tema claro/escuro e layout responsivo.

## Estrutura

```
src/
├── components/   MenuLateral, VinhoFormulario, EditorImagem, BarraFiltros, CartaoVinho, CartaoCatalogo, ...
├── views/        InicioView, AdegaView (CRUD), ConsultaView, CatalogoView, NaoEncontradaView
├── services/     storage.ts (localStorage), ibge.ts e cotacao.ts (Axios), aviso.ts (snackbar)
├── router/       rotas da aplicação
├── types/        tipo Vinho e filtros
└── utils/        formatação, filtros na URL e exportação CSV
```

## Créditos das imagens

As fotos do acervo inicial são do Wikimedia Commons, sob licenças Creative Commons. Autor e licença de cada
uma estão em [`public/vinhos/CREDITOS.md`](public/vinhos/CREDITOS.md).

## Tecnologias

Vue 3 + Vite, TypeScript, Vuetify 3, Vue Router 4, Axios, vee-validate.

## Como executar

```bash
npm install
npm run dev
```

Depois, acesse o endereço exibido no terminal (por padrão http://localhost:5173).
