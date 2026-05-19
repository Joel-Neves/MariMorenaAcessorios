<template>
    <div class="perfil-container">
        <div class="sidebar">
            <div class="user-photo">
                <img :src="user?.photoURL || defaultAvatar" alt="Foto do usuário" class="avatar" />
                <h3>{{ user?.displayName || 'Usuário' }}</h3>
            </div>
            <nav class="sidebar-nav">
                <router-link to="/perfil/meus-dados" class="sidebar-link">Meus Dados</router-link>
                <router-link to="/perfil/meus-pedidos" class="sidebar-link">Meus Pedidos</router-link>
                <router-link to="/perfil/favoritos" class="sidebar-link">Favoritos</router-link>
            </nav>
            <button @click="logout" class="sidebar-link logout-btn">Sair</button>
        </div>
        <router-view class="content"></router-view>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import defaultAvatar from '@/assets/default-avatar.png';

const router = useRouter();

const user = computed(() => authService.getCurrentUser());

onMounted(() => {
    if (!user.value) {
        router.push('/login');
    }
});

const logout = async () => {
    try {
        await authService.logout();
        router.push('/');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
};
</script>

<style scoped>
.perfil-container {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background-color: #f8f9fa;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e0e0e0;
}

.user-photo {
    text-align: center;
    margin-bottom: 2rem;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #d4af37;
    margin-bottom: 0.5rem;
}

.user-photo h3 {
    font-size: 1.1rem;
    color: #1a1a1a;
    margin: 0;
}

.sidebar-nav {
    flex: 1;
}

.sidebar-link {
    display: block;
    padding: 0.8rem 1rem;
    color: #666666;
    text-decoration: none;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: background-color 0.3s;
}

.sidebar-link:hover,
.sidebar-link.router-link-active {
    background-color: #d4af37;
    color: #1a1a1a;
}

.logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 1rem;
    margin-top: auto;
}

.logout-btn:hover {
    background-color: #ffcccc;
    color: #d9534f;
}

.content {
    flex: 1;
    padding: 2rem;
}
</style>
