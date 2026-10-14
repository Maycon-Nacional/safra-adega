import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '@/views/InicioView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: InicioView, meta: { titulo: 'Início' } },
    {
      path: '/adega',
      name: 'adega',
      component: () => import('@/views/AdegaView.vue'),
      meta: { titulo: 'Gerenciar adega' },
    },
    {
      path: '/consulta',
      name: 'consulta',
      component: () => import('@/views/ConsultaView.vue'),
      meta: { titulo: 'Consulta' },
    },
    {
      path: '/catalogo',
      name: 'catalogo',
      component: () => import('@/views/CatalogoView.vue'),
      meta: { titulo: 'Catálogo' },
    },
    {
      path: '/:caminho(.*)*',
      name: 'nao-encontrada',
      component: () => import('@/views/NaoEncontradaView.vue'),
      meta: { titulo: 'Página não encontrada' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.titulo ?? 'Safra'} · Safra`
})

export default router
