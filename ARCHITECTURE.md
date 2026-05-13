# Mari Morena - Arquitetura do Projeto

## Stack

| Camada        | Tecnologia       | Responsabilidade                          |
|---------------|-----------------|-------------------------------------------|
| Frontend      | Vue.js 3 + Vite | UI, rotas, estado, chamadas API           |
| Backend       | Spring Boot     | Logica de negocio complexa, pagamentos, jobs |
| Auth/DB/Storage | Supabase      | Auth, Postgres, Storage, Realtime         |

## Principio Geral

- **Supabase** gerencia tudo que e padrao: auth, CRUD de entidades simples, storage de imagens, realtime
- **Spring Boot** entra apenas para regras de negocio: calculo de frete, gestao de estoque transacional, processamento de pagamentos, integracoes externas, jobs agendados
- **Vue.js** e o frontend puro, consome Supabase diretamente para auth/CRUD/realtime e chama Spring Boot para logica de negocio

---

## Frontend - Vue.js 3

```
src/
  main.js                         # Ponto de entrada
  App.vue                         # Root component
  style.css                       # Estilos globais

  router/
    index.js                      # Rotas (catalogo, produto, sacola, checkout, perfil, admin)

  views/                          # Paginas (uma view = uma rota)
    Catalogo.vue                  # Catalogo de produtos
    ProdutoDetalhes.vue           # Detalhe do produto
    Sacola.vue                    # Carrinho
    Login.vue                     # Login
    Register.vue                  # Registro
    ResetPassword.vue             # Recuperar senha
    Perfil.vue                    # Area do cliente

  components/                      # Componentes por dominio
    NavBar.vue                    # Navegacao principal
    Footer.vue                    # Rodape
    ProductCard.vue              # Card de produto
    PedidoItem.vue                # Item de pedido

    checkout/                     # Fluxo de checkout
      Checkout.vue               # Orquestrador do checkout
      Endereco.vue               # Formulario de endereco
      Pagamento.vue              # Formulario de pagamento
      Confirmacao.vue            # Confirmacao do pedido

    usuario/                      # Area do cliente
      Meusdados.vue              # Dados pessoais
      MeusPedidos.vue            # Historico de pedidos
      Favoritos.vue              # Lista de favoritos

    admin/                        # Painel administrativo
      LayoutAdmin.vue            # Layout do admin
      Dashboard.vue              # Dashboard
      Relatorios.vue             # Relatorios
      produtos/
        ListaProdutos.vue        # Listagem
        CadastrarProduto.vue     # Cadastro
        AtualizarProduto.vue     # Edicao
      pedidos/
        ListaPedidos.vue         # Listagem
        DetalhesPedido.vue       # Detalhes
      clientes/
        ListaClientes.vue        # Listagem
        DetalhesCliente.vue      # Detalhes

  composables/                    # Vue composables (hooks)
    useAuth.js                   # Estado de autenticacao
    useCart.js                    # Estado do carrinho
    useFavorites.js               # Estado de favoritos
    useProducts.js                # Busca/filtro de produtos
    useRealtime.js                # Subscricoes realtime

  stores/                         # Pinia stores (estado global)
    sacolaStore.js               # Carrinho
    checkoutStore.js              # Checkout
    favoritosStore.js             # Favoritos
    produtoStore.js               # Produtos

  services/                       # Camada de servicos (chamadas API)
    supabase/                     # Servicos que falam direto com Supabase
      auth.service.js            # signIn, signUp, signOut, resetPassword
      produto.service.js         # CRUD produtos (SELECT publico)
      favorito.service.js        # CRUD favoritos
      storage.service.js         # Upload/delete imagens
      usuario.service.js         # CRUD perfil do usuario
      comentario.service.js      # CRUD comentarios
      cep.service.js             # Busca de CEP (via Supabase edge function ou API)

    spring/                       # Servicos que falam com Spring Boot
      pedido.service.js          # Criar/atualizar pedido
      pagamento.service.js       # Processar pagamento
      relatorio.service.js       # Relatorios agregados
      estoque.service.js         # Ajuste de estoque (admin)
      frete.service.js           # Calculo de frete

  lib/                            # Utilitarios puros
    supabase.js                  # Cliente Supabase (singleton)
    api-client.js                # Cliente HTTP para Spring Boot
    utils.js                     # Helpers (formatarPreco, validarCPF, etc.)

  types/                          # JSDoc / TypeScript declarations
    produto.d.ts
    pedido.d.ts
    usuario.d.ts
    checkout.d.ts

  assets/                         # Imagens, icones, fontes
```

### Responsabilidades por camada

| Camada        | O que faz                            | Nao faz                  |
|---------------|--------------------------------------|--------------------------|
| `views/`      | Monta pagina, orquestra componentes  | Logica de negocio        |
| `components/` | Renderiza UI, emite eventos          | Chamadas API diretas     |
| `composables/`| Gerencia estado local + chamadas     | Renderiza HTML           |
| `stores/`     | Estado global (carrinho, checkout)   | Logica de negocio        |
| `services/`   | Faz chamadas HTTP (Supabase/Spring)  | Armazena estado          |
| `lib/`        | Utilitarios, clientes API             | Estado ou UI             |

---

## Backend - Spring Boot (Arquitetura Hexagonal)

```
backend/
  src/main/java/com/marimorena/
    app/
      produto/
        domain/
          model/                # Produto, ImagemProduto, Estoque
          exception/            # ProdutoNaoEncontradoException, EstoqueInsuficienteException
          service/              # ProdutoDomainService (regras de dominio)
          port/
            out/                # ProdutoRepository, EstoqueRepository (interfaces)
        application/
          service/              # ProdutoApplicationService (orquestracao)
          dto/                  # ProdutoDTO, AjusteEstoqueDTO
          mapper/               # ProdutoMapper
          port/
            in/                 # CriarProdutoUseCase, AtualizarEstoqueUseCase
            out/                # ProdutoRepository, NotificacaoPort
        infrastructure/
          persistence/          # SupabaseProdutoRepository (implementa port out)
          web/                  # ProdutoController
          config/               # ProdutoConfig

      pedido/
        domain/
          model/                # Pedido, ItemPedido, StatusPedido
          exception/            # PedidoNaoEncontradoException, TransicaoInvalidaException
          service/              # PedidoDomainService (transicoes de status, regras)
          port/
            out/                # PedidoRepository, EstoquePort
        application/
          service/              # PedidoApplicationService
          dto/                  # PedidoDTO, CriarPedidoRequest
          mapper/               # PedidoMapper
          port/
            in/                 # CriarPedidoUseCase, AtualizarStatusPedidoUseCase
            out/                # PedidoRepository, EstoquePort, NotificacaoPort
        infrastructure/
          persistence/          # SupabasePedidoRepository
          web/                  # PedidoController
          config/               # PedidoConfig

      pagamento/
        domain/
          model/                # Pagamento, MetodoPagamento, StatusPagamento
          exception/            # PagamentoRecusadoException
          service/              # PagamentoDomainService
          port/
            out/                # PagamentoRepository, GatewayPagamentoPort
        application/
          service/              # PagamentoApplicationService
          dto/                  # PagamentoDTO, ProcessarPagamentoRequest
          mapper/               # PagamentoMapper
          port/
            in/                 # ProcessarPagamentoUseCase, EstornarPagamentoUseCase
            out/                # PagamentoRepository, GatewayPagamentoPort
        infrastructure/
          persistence/          # SupabasePagamentoRepository
          gateway/              # StripeGateway, PagSeguroGateway (implementa GatewayPagamentoPort)
          web/                  # PagamentoController
          config/               # PagamentoConfig

      frete/
        domain/
          model/                # Frete, FaixaCep, RegiaoEntrega
          exception/            # FreteIndisponivelException
          service/              # FreteDomainService (calcula frete por regiao/cep)
          port/
            out/                # FreteRepository
        application/
          service/              # FreteApplicationService
          dto/                  # FreteDTO, CalcularFreteRequest
          mapper/               # FreteMapper
          port/
            in/                 # CalcularFreteUseCase
            out/                # FreteRepository, CepPort
        infrastructure/
          persistence/          # SupabaseFreteRepository
          integration/          # ViaCepClient (implementa CepPort)
          web/                  # FreteController
          config/               # FreteConfig

      relatorio/
        domain/
          model/                # RelatorioVendas, RelatorioEstoque, Periodo
          exception/
          service/              # RelatorioDomainService (agregacoes, calculos)
          port/
            out/                # RelatorioRepository
        application/
          service/              # RelatorioApplicationService
          dto/                  # RelatorioDTO, FiltroRelatorioDTO
          mapper/               # RelatorioMapper
          port/
            in/                 # GerarRelatorioVendasUseCase, GerarRelatorioEstoqueUseCase
            out/                # RelatorioRepository
        infrastructure/
          persistence/          # SupabaseRelatorioRepository
          web/                  # RelatorioController
          config/               # RelatorioConfig

      integracao/               # Integracoes externas (webhooks, callbacks)
        domain/
          model/                # WebhookEvent, IntegracaoConfig
          exception/
          service/              # IntegracaoDomainService
          port/
            out/                # IntegracaoRepository
        application/
          service/              # IntegracaoApplicationService
          dto/
          port/
            in/                 # ProcessarWebhookUseCase
            out/                # IntegracaoRepository
        infrastructure/
          persistence/
          web/                  # WebhookController
          config/

      job/                      # Jobs agendados
        domain/
          model/                # JobSchedule, JobResult
          service/              # JobDomainService
          port/
            out/                # JobRepository
        application/
          service/              # JobApplicationService
          port/
            in/                 # ExecutarJobUseCase
            out/                # JobRepository
        infrastructure/
          scheduling/           # @Scheduled tasks (EstoqueJob, NotificacaoJob)
          persistence/
          config/

    shared/
      domain/                   # Value objects (Dinheiro, CEP, Email)
      infrastructure/          # SupabaseClient, HttpClient, interceptors
      config/                   # SecurityConfig, CorsConfig, SupabaseConfig

  src/main/resources/
    application.yml
    application-dev.yml
    application-prod.yml
```

### Regras da Arquitetura Hexagonal

| Camada            | Pode depender de                    | Nao pode depender de              |
|-------------------|-------------------------------------|-----------------------------------|
| `domain/`         | Nada (puro Java)                    | application, infrastructure, frameworks |
| `application/`    | domain + ports (interfaces)         | infrastructure, frameworks        |
| `infrastructure/` | domain + application + frameworks   | Nada alem disso                   |
| `port/in/`        | Definido por application            | Implementado por infrastructure (web) |
| `port/out/`       | Definido por domain/application     | Implementado por infrastructure (persistence/gateway) |

### Fluxo de dependencia

```
Controller (infrastructure/web)
  -> UseCase (port/in)
    -> ApplicationService
      -> DomainService + DomainModel
      -> Repository (port/out)
        -> SupabaseRepository (infrastructure/persistence)
```

---

## Supabase - Tabelas e Responsabilidades

### O que o Vue.js chama direto no Supabase

| Entidade           | Operacoes                    | Quem chama       |
|--------------------|------------------------------|------------------|
| Auth (usuarios)    | signUp, signIn, signOut, resetPassword | Vue direto |
| Produtos           | SELECT (listagem, busca, filtros)      | Vue direto |
| Favoritos          | CRUD completo                          | Vue direto |
| Storage (imagens)  | Upload, delete                         | Vue direto |
| Perfil do usuario  | SELECT/UPDATE proprio perfil           | Vue direto |
| Comentarios        | CRUD completo                          | Vue direto |
| Realtime           | Subscricoes (pedidos, estoque)         | Vue direto |

### O que passa pelo Spring Boot

| Entidade    | Operacoes                    | Motivo                              |
|-------------|------------------------------|-------------------------------------|
| Pedidos     | Criar, atualizar status      | Logica de estoque transacional      |
| Pagamentos  | Processar, estornar          | Regras de negocio + gateway externo |
| Estoque     | Atualizar (decrementar)      | Consistencia transacional          |
| Frete       | Calcular                     | Regras por regiao/CEP              |
| Relatorios  | Gerar                        | Agregacoes complexas               |
| Webhooks    | Receber/processar            | Integracoes externas               |
| Jobs        | Executar agendado            | Tarefas periodicas                 |

### Tabelas Supabase (a serem criadas via migracoes)

- `usuarios` - perfil extendido do auth.users
- `produtos` - catalogo de produtos
- `pedidos` - pedidos com itens
- `pedido_itens` - itens de cada pedido
- `favoritos` - favoritos dos usuarios
- `pagamentos` - registros de pagamento
- `comentarios` - comentarios em produtos
- `faixas_cep` - faixas de CEP para calculo de frete

---

## Comunicacao entre camadas

```
[Usuario]
   |
   v
[Vue.js Frontend]
   |-- Auth/CRUD/Realtime --> [Supabase] (direto via @supabase/supabase-js)
   |-- Logica de negocio --> [Spring Boot API] --> [Supabase] (via service role)
   |
   v
[Supabase]
   - Auth (email/password)
   - Postgres (RLS)
   - Storage (imagens)
   - Realtime (subscricoes)
```

### Rotas Spring Boot (apenas negocio)

| Metodo | Rota                            | Use Case                        |
|--------|---------------------------------|---------------------------------|
| POST   | /api/v1/pedidos                 | Criar pedido + debitar estoque  |
| PATCH  | /api/v1/pedidos/{id}/status     | Atualizar status do pedido      |
| POST   | /api/v1/pagamentos              | Processar pagamento             |
| POST   | /api/v1/pagamentos/{id}/estorno | Estornar pagamento              |
| POST   | /api/v1/frete/calcular          | Calcular frete por CEP          |
| GET    | /api/v1/relatorios/vendas       | Relatorio de vendas             |
| GET    | /api/v1/relatorios/estoque      | Relatorio de estoque            |
| POST   | /api/v1/produtos/{id}/estoque   | Ajustar estoque (admin)         |
| POST   | /api/v1/webhooks/stripe         | Webhook Stripe                  |
| POST   | /api/v1/webhooks/pagseguro      | Webhook PagSeguro               |

Tudo o mais (CRUD de produtos, favoritos, perfil, auth, comentarios, realtime) e feito direto no Supabase pelo Vue.js.
