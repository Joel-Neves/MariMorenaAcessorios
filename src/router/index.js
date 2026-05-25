import ListaClientes from '@/components/admin/clientes/ListaClientes.vue'
import DetalhesCliente from '@/components/admin/clientes/DetalhesCliente.vue'
import Dashboard from '@/components/admin/Dashboard.vue'
import Relatorios from '@/components/admin/Relatorios.vue'
import ListaPedidos from '@/components/admin/pedidos/ListaPedidos.vue'
import DetalhesPedido from '@/components/admin/pedidos/DetalhesPedido.vue'
import CadastrarProduto from '@/components/admin/produtos/CadastrarProduto.vue'
import ListaProdutos from '@/components/admin/produtos/ListaProdutos.vue'
import Checkout from '@/components/checkout/Checkout.vue'
import Confirmacao from '@/components/checkout/Confirmacao.vue'
import Endereco from '@/components/checkout/Endereco.vue'
import Pagamento from '@/components/checkout/Pagamento.vue'
import Favoritos from '@/components/usuario/Favoritos.vue'
import Meusdados from '@/components/usuario/Meusdados.vue'
import MeusPedidos from '@/components/usuario/MeusPedidos.vue'
import Catalogo from '@/views/Catalogo.vue'
import Perfil from '@/views/Perfil.vue'
import ProdutoDetalhes from '@/views/ProdutoDetalhes.vue'
import Sacola from '@/views/Sacola.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import AtualizarProduto from '@/components/admin/produtos/AtualizarProduto.vue'
import LayoutAdmin from '@/components/admin/LayoutAdmin.vue'

import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/authService'
import { usuarioService } from '@/services/usuarioService'

// Guard functions
const authGuard = async (to, from, next) => {
  if (await authService.waitForUser()) {
    next()
  } else {
    next('/login')
  }
}

const adminGuard = async (to, from, next) => {
  const user = await authService.getCurrentUser()

  if (!user) {
    return next('/login')
  }

  try {
    const usuario = await usuarioService.buscarPorId(user.id)
    if (usuario.role === "ADMIN") {
      return next()
    }
  } catch (error) {
    console.error('Erro ao verificar permissões de admin:', error)
  }

  return next('/') 
}


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'catalogo', component: Catalogo },
    { path: '/login', name: 'login', component: Login, beforeEnter: async (to, from, next) => {
      if (await authService.waitForUser()) {
        next('/')
      } else {
        next()
      }
    } 
  },
    { path: '/register', name: 'register', component: Register },
    { path: '/reset-password', name: 'reset-password', component: ResetPassword },
    { path: '/sacola', name: 'sacola', component: Sacola },
    { path: '/produto/:id', name: 'produto-detalhes', component: ProdutoDetalhes, props: true },

    { 
      path: '/perfil', name: 'perfil', component: Perfil, beforeEnter: authGuard,
      children: [
        { path: 'meus-dados', name: 'perfil-dados', component: Meusdados },
        { path: 'meus-pedidos', name: 'perfil-pedidos', component: MeusPedidos },
        { path: 'favoritos', name: 'perfil-favoritos', component: Favoritos }
      ]
    },
    {
      path: '/checkout', name: 'checkout', component: Checkout, beforeEnter: authGuard,
      children: [
        { path: 'endereco', name: 'checkout-endereco', component: Endereco },
        { path: 'pagamento', name: 'checkout-pagamento', component: Pagamento },
        { path: 'confirmacao', name: 'checkout-confirmacao', component: Confirmacao }
      ]
    },

    {
      path: '/admin', name: 'admin', component: LayoutAdmin, beforeEnter: adminGuard,
      children: [
        { path: 'dashboard', name: 'dashboard', component: Dashboard },
        { path: 'clientes', name: 'clientes', component: ListaClientes },
        { path: 'clientes/:id', name: 'cliente-detalhes', component: DetalhesCliente },
        { path: 'pedidos', name: 'pedidos', component: ListaPedidos },
        { path: 'pedidos/:id', name: 'pedido-detalhes', component: DetalhesPedido },
        { path: 'produtos', name: 'produtos', component: ListaProdutos },
        { path: 'produtos/cadastrar', name: 'produto-cadastrar', component: CadastrarProduto },
        { path: 'produtos/atualizar/:id', name: 'produto-atualizar', component: AtualizarProduto },
        { path: 'relatorios', name: 'relatorios', component: Relatorios }
      ]
    }
  ]
})




// Global guard to restrict admin users to admin routes only
router.beforeEach(async (to, from, next) => {
  const user = await authService.waitForUser()

  if (user) {
    try {
      const usuario = await usuarioService.buscarPorId(user.id)
      if (usuario.eAdmin === true && !to.path.startsWith('/admin')) {
        return next('/admin')
      }
    } catch (error) {
      console.error('Erro ao verificar permissões de admin:', error)
    }
  }

  next()
})

export default router
