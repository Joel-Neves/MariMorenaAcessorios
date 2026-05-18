# Migração Firebase → Spring Boot + PostgreSQL

## ✅ Mudanças Realizadas

### 1. **Dependências Removidas**
- `firebase` (12.6.0)
- Todos os pacotes relacionados a Firebase

### 2. **Arquivos Deletados**
- `src/services/firebase/` (pasta inteira com config.js)
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`

### 3. **Dependências Adicionadas**
- `axios` (1.6.2) - Para chamadas HTTP

### 4. **Novos Arquivos Criados**
- `src/services/api.js` - Cliente Axios configurado com interceptors de autenticação
- `.env.example` - Configuração de exemplo para a URL da API

### 5. **Serviços Reescritos (API REST)**
- `authService.js` - Autenticação via JWT tokens
- `usuarioService.js` - Gerenciamento de usuários
- `produtoService.js` - Gerenciamento de produtos
- `pedidoService.js` - Gerenciamento de pedidos
- `comentarioService.js` - Gerenciamento de comentários
- `favoritosService.js` - Gerenciamento de favoritos
- `storageService.js` - Upload de imagens via API

## 🔌 Endpoints Esperados no Spring Boot

### **Autenticação** (`/api/auth`)
```
POST   /auth/register          - Registrar novo usuário
POST   /auth/login             - Fazer login (retorna token JWT)
POST   /auth/reset-password    - Resetar senha
PUT    /auth/profile           - Atualizar perfil do usuário
```

### **Usuários** (`/api/usuarios`)
```
GET    /usuarios               - Listar todos os usuários
GET    /usuarios/{id}          - Buscar usuário por ID
GET    /usuarios/email/{email} - Buscar usuário por email
POST   /usuarios               - Criar novo usuário
PUT    /usuarios/{id}          - Atualizar usuário
DELETE /usuarios/{id}          - Deletar usuário
```

### **Produtos** (`/api/produtos`)
```
GET    /produtos               - Listar todos os produtos
GET    /produtos/{id}          - Buscar produto por ID
GET    /produtos/categoria/{categoria} - Buscar por categoria
POST   /produtos               - Criar novo produto
PUT    /produtos/{id}          - Atualizar produto
DELETE /produtos/{id}          - Deletar produto
```

### **Pedidos** (`/api/pedidos`)
```
GET    /pedidos                - Listar todos os pedidos
GET    /pedidos/{id}           - Buscar pedido por ID
GET    /pedidos/usuario/{userId} - Buscar pedidos do usuário
GET    /pedidos/status/{status} - Buscar por status
POST   /pedidos                - Criar novo pedido
PUT    /pedidos/{id}           - Atualizar pedido
DELETE /pedidos/{id}           - Deletar pedido
```

### **Comentários** (`/api/comentarios`)
```
GET    /comentarios            - Listar todos os comentários
GET    /comentarios/{id}       - Buscar comentário por ID
GET    /comentarios/produto/{produtoId} - Buscar por produto
GET    /comentarios/usuario/{userId} - Buscar por usuário
POST   /comentarios            - Criar novo comentário
PUT    /comentarios/{id}       - Atualizar comentário
DELETE /comentarios/{id}       - Deletar comentário
PUT    /comentarios/{id}/aprovar - Aprovar comentário
PUT    /comentarios/{id}/reprovar - Reprovar comentário
```

### **Favoritos** (`/api/favoritos`)
```
GET    /favoritos/usuario/{userId} - Buscar favoritos do usuário
POST   /favoritos              - Adicionar favorito
DELETE /favoritos/{id}         - Remover favorito
```

### **Upload** (`/api/upload`)
```
POST   /upload                 - Fazer upload de imagem
DELETE /upload                 - Deletar imagem
GET    /upload/url             - Obter URL da imagem
```

## 🔐 Autenticação (JWT)

### **Token Storage**
- Token armazenado em `localStorage` como `authToken`
- Usuário atual armazenado em `localStorage` como `currentUser` (JSON)

### **Headers**
Todas as requisições incluem automaticamente:
```
Authorization: Bearer {token}
```

### **Interceptors**
- **Request**: Adiciona token JWT automaticamente
- **Response**: 
  - Retorna apenas o `.data` da resposta
  - Em caso de erro 401, remove token e redireciona para `/login`

## 📁 Configuração da API

Criar arquivo `.env` (baseado em `.env.example`):
```env
VITE_API_URL=http://localhost:8080/api
```

## 🚀 Próximos Passos

1. **Criar Spring Boot Backend** com:
   - JPA/Hibernate para persistência
   - PostgreSQL como banco de dados
   - Spring Security com JWT
   - Endpoints conforme especificação acima

2. **Configurar Upload de Arquivos**:
   - Diretório local para armazenar imagens
   - Servir imagens via `GET /files/{filename}`

3. **Executar Vue.js com Backend**:
   ```bash
   npm install
   npm run dev
   ```

4. **Configurar variáveis de ambiente** conforme necessário

## ⚠️ Notas Importantes

- Todos os serviços agora fazem requisições HTTP via Axios
- Autenticação é baseada em JWT tokens em localStorage
- Storage local significa arquivos no servidor (pasta configurada)
- Remover cache/localStorage se houver problemas de autenticação

---

**Data da migração**: 18/05/2026
