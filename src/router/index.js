import ClientList from '@/components/admin/clients/ClientList.vue'
import ClientDetails from '@/components/admin/clients/ClientDetails.vue'
import Dashboard from '@/components/admin/Dashboard.vue'
import Reports from '@/components/admin/Reports.vue'
import OrderList from '@/components/admin/orders/OrderList.vue'
import OrderDetails from '@/components/admin/orders/OrderDetails.vue'
import CreateProduct from '@/components/admin/products/CreateProduct.vue'
import ProductList from '@/components/admin/products/ProductList.vue'
import Checkout from '@/components/checkout/Checkout.vue'
import Confirmation from '@/components/checkout/Confirmation.vue'
import Address from '@/components/checkout/Address.vue'
import Payment from '@/components/checkout/Payment.vue'
import Favorite from '@/components/user/Favorite.vue'
import ProfileData from '@/components/user/ProfileData.vue'
import MyOrders from '@/components/user/MyOrders.vue'
import Catalog from '@/views/Catalog.vue'
import Profile from '@/views/Profile.vue'
import ProductDetails from '@/views/ProductDetails.vue'
import Bag from '@/views/Bag.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import UpdateProduct from '@/components/admin/products/UpdateProduct.vue'
import LayoutAdmin from '@/components/admin/LayoutAdmin.vue'

import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'

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
    const user = await userService.findById(user.id)
    if (user.role === "ADMIN") {
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
    { path: '/', name: 'Catalog', component: Catalog },
    { path: '/login', name: 'login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/reset-password', name: 'reset-password', component: ResetPassword },
    { path: '/Bag', name: 'Bag', component: Bag },
    { path: '/product/:id', name: 'product-details', component: ProductDetails, props: true },

    { 
      path: '/Profile', name: 'Profile', component: Profile, beforeEnter: authGuard,
      children: [
        { path: 'my-data', name: 'Profile-data', component: ProfileData },
        { path: 'my-orders', name: 'Profile-orders', component: MyOrders },
        { path: 'Favorite', name: 'Profile-Favorite', component: Favorite }
      ]
    },
    {
      path: '/checkout', name: 'checkout', component: Checkout, beforeEnter: authGuard,
      children: [
        { path: 'Address', name: 'checkout-Address', component: Address },
        { path: 'Payment', name: 'checkout-Payment', component: Payment },
        { path: 'Confirmation', name: 'checkout-Confirmation', component: Confirmation }
      ]
    },

    {
      path: '/admin', name: 'admin', component: LayoutAdmin, beforeEnter: adminGuard,
      children: [
        { path: 'dashboard', name: 'dashboard', component: Dashboard },
        { path: 'clients', name: 'clients', component: ClientList },
        { path: 'clients/:id', name: 'client-details', component: ClientDetails },
        { path: 'orders', name: 'orders', component: OrderList },
        { path: 'order/:id', name: 'order-details', component: OrderDetails },
        { path: 'products', name: 'products', component: ProductList },
        { path: 'products/create', name: 'product-create', component: CreateProduct },
        { path: 'products/update/:id', name: 'product-update', component: UpdateProduct },
        { path: 'Reports', name: 'Reports', component: Reports }
      ]
    }
  ]
})




// Global guard to restrict admin users to admin routes only
router.beforeEach(async (to, from, next) => {
  const user = await authService.waitForUser()

  if (user) {
    try {
      const user = await userService.findById(user.id)
      if (user.role === "ADMIN" && !to.path.startsWith('/admin')) {
        return next('/admin')
      }
    } catch (error) {
      console.error('Erro ao verificar permissões de admin:', error)
    }
  }

  next()
})

export default router
