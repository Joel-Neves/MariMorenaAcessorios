<template>
  <footer v-if="!isAdmin()" class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3>Mari Morena Acessórios</h3>
        <p>Acessórios elegantes e de qualidade para todas as ocasiões.</p>
      </div>

      <div class="footer-section">
        <h4>Links Rápidos</h4>
        <ul>
          <li><router-link to="/">Catálogo</router-link></li>
          <li><router-link to="/sacola">Sacola</router-link></li>
          <li><router-link to="/perfil/favoritos">Favorito</router-link></li>
          <li><router-link to="/perfil/meus-dados">Perfil</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Contato</h4>
        <p>Email: mari.morena@gmail.com</p>
        <p>Tel: (81) 99399-5306</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Mari Morena Acessórios. Todos os direitos reservados.</p>
    </div>
  </footer>
</template>

<script setup>
import { usuarioService } from '@/services/usuarioService';
import { authService } from '@/services/authService';
import { computed, ref, onMounted } from 'vue';
const usuario = ref(null);
const eAutenticado = ref(false);

function isAdmin(){
  return usuario.value?.userRole === 'ADMIN';
}

onMounted(async () => {
  const user = await authService.waitForUser();
  eAutenticado.value = !!user;
  if (user) {
    try {
      usuario.value = await usuarioService.buscarPorId(user.id);
    } catch (err) {
      console.error('Erro ao buscar usuário no footer:', err);
      usuario.value = null;
    }
  } else {
    usuario.value = null;
  }
});


const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: #2B2B2B;
  color: #ffffff;
  padding: 2rem 2rem 1rem;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.footer-section h4 {
  color: #d4af37;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.footer-section p {
  color: #cccccc;
  line-height: 1.6;
  margin: 0.5rem 0;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: #cccccc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #d4af37;
}

.footer-bottom {
  border-top: 1px solid #333333;
  padding-top: 1rem;
  text-align: center;
  color: #888888;
}
</style>
