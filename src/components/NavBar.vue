<template>
  <nav v-if="!isAdmin()" class="navbar" >
    <div class="navbar-container">
      <router-link to="/" class="logo">
        <img src="/src/assets/logo.png"/>
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path :d="mdiHome" />
          </svg>
        </router-link>
        <router-link to="/sacola" class="nav-link cart-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path :d="mdiShopping" />
          </svg>
          <span v-if="totalItens > 0" class="cart-badge">{{ totalItens }}</span>
        </router-link>
        <router-link to="/perfil/favoritos" class="nav-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path :d="mdiHeart" />
          </svg>
        </router-link>
        <router-link v-if="eAutenticado" to="/perfil/meus-dados" class="nav-link">
          <img :src="usuario?.photoURL || '/default-avatar.png'" alt="Foto do Usuário" class="user-avatar" />
        </router-link>
        <div v-else class="dropdown">
          <button @click="toggleDropdown" class="dropdown-toggle nav-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path :d="mdiAccountCircle" />
            </svg>
          </button>
          <div v-if="dropdownOpen" class="dropdown-menu">
            <router-link to="/login" class="dropdown-item" @click="closeDropdown">Login</router-link>
            <router-link to="/register" class="dropdown-item" @click="closeDropdown">Cadastrar</router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useSacolaStore } from '../stores/sacolaStore';
import { authService } from '@/services/authService';
import { usuarioService } from '@/services/usuarioService';
import { mdiAccountCircle, mdiHeart, mdiHome, mdiShopping } from '@mdi/js';

const user = authService.getCurrentUser();
const sacolaStore = useSacolaStore();
const totalItens = computed(() => sacolaStore.totalItens);
const dropdownOpen = ref(false);
const usuario = ref(null);
const eAutenticado = ref(false);

function isAdmin(){
  return usuario.value?.eAdmin === true;
}

authService.isAuthenticated(async (user) => {
  eAutenticado.value = !!user;
  if (user) {
    usuario.value = await usuarioService.buscarPorId(user.uid);
  } else {
    usuario.value = null;
  }
});


const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};
</script>

<style scoped>
.navbar {
  background-color: #2B2B2B;
  padding: 1rem 1rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo img{
    height: 100px;
    
}

.logo {
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: baseline;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover {
  color: #d4af37;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-badge {
  background-color: #d4af37;
  color: #1a1a1a;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s;
}

.dropdown-toggle:hover {
  color: #d4af37;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #2B2B2B;
  border: 1px solid #444;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 120px;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #d4af37;
  color: #1a1a1a;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
