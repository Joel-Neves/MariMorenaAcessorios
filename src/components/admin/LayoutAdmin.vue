<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>Admin MariMorena</h3>
      </div>
      <nav class="sidebar-nav">
        <!-- Visão Geral -->
        <div class="nav-section">
          <h4 class="nav-section-title">Visão Geral</h4>
          <router-link to="/admin/dashboard" class="nav-link">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </router-link>
        </div>

        <!-- Gestão -->
        <div class="nav-section">
          <h4 class="nav-section-title">Gestão</h4>
          <router-link to="/admin/produtos" class="nav-link">
            <i class="fas fa-box"></i> Produtos
          </router-link>
          <router-link to="/admin/orders" class="nav-link">
            <i class="fas fa-receipt"></i> Orders
          </router-link>
          <router-link to="/admin/clients" class="nav-link">
            <i class="fas fa-users"></i> Clients
          </router-link>
        </div>

        <!-- Relatórios -->
        <div class="nav-section">
          <h4 class="nav-section-title">Análises</h4>
          <router-link to="/admin/relatorios" class="nav-link">
            <i class="fas fa-chart-bar"></i> Relatórios
          </router-link>
        </div>
      </nav>
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Sair
      </button>
    </aside>
    <main class="main-content">
      <header class="navbar">
        <div class="navbar-brand">
          <h2>Painel Administrativo</h2>
        </div>
        <div class="navbar-profile">
          <span>Olá, {{ user.displayName }}</span>
          <img :src="user?.photoURL || '/default-avatar.png'" alt="Foto do Usuário" class="profile-avatar" />
        </div>
      </header>
      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'

const user = authService.getCurrentUser()

const router = useRouter()

const logout = async () => {
  try {
    await authService.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
  font-family: "Inter", sans-serif;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px;
  background-color: #0e0e0e;
  color: #fff;
  padding: 28px 22px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-header h3 {
  font-size: 1.45rem;
  font-weight: 700;
  color: #f5f5dc;
  text-align: center;
  margin-bottom: 32px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* SEÇÕES DA NAV */
.nav-section {
  margin-bottom: 28px;
}

.nav-section-title {
  color: #f5f5dc;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.8;
  letter-spacing: 0.4px;
}

/* LINKS */
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: #cfcfcf;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.98rem;
  transition: all 0.25s ease;
}

.nav-link i {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
  opacity: 0.85;
}

/* Hover mais premium */
.nav-link:hover {
  background-color: #1c1c1c;
  color: #fff;
  transform: translateX(4px);
}

/* Ativo */
.router-link-active {
  background-color: #f5f5dc !important;
  color: #0e0e0e !important;
  font-weight: 700;
}

.router-link-active i {
  color: #111;
}

/* BOTÃO DE SAIR */
.logout-btn {
  background: #c2185b;
  border: none;
  color: white;
  padding: 13px;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  transition: all 0.25s;
  margin-top: 10px;
}

.logout-btn:hover {
  background: #9c164c;
  transform: scale(1.03);
}

/* --- MAIN CONTENT --- */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* NAVBAR SUPERIOR */
.navbar {
  background: #f5f5dc;
  padding: 18px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e5e5c5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.navbar-brand h2 {
  margin: 0;
  color: #2d2d2d;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.navbar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
  font-weight: 600;
}

.profile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #ddd;
}

/* ÁREA DAS VIEWS */
.content-area {
  padding: 30px;
}

</style>
        