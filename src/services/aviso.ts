import { reactive } from 'vue'

type TipoAviso = 'sucesso' | 'erro' | 'info'

export const aviso = reactive({
  visivel: false,
  texto: '',
  tipo: 'sucesso' as TipoAviso,
})

export function avisar(texto: string, tipo: TipoAviso = 'sucesso'): void {
  aviso.visivel = false
  // pequeno atraso para o snackbar reiniciar a animação quando já está aberto
  setTimeout(() => {
    aviso.texto = texto
    aviso.tipo = tipo
    aviso.visivel = true
  }, 60)
}
