# FinanHub

Aplicativo web/mobile de gerenciamento financeiro pessoal que reúne gastos e ganhos
de várias instituições bancárias em um único lugar. Design mobile-first, tema escuro.

## Estrutura

```
finanhub/
├── frontend/        # HTML/CSS/JS puro, mobile-first, tema escuro
├── backend/         # API REST em Node.js + Express
├── bancos/          # espaço reservado para integrações específicas por instituição
├── database/         # arquivo SQLite (finanhub.db)
```

## Como rodar

```bash
npm install
cp .env.example .env
npm start
```

O servidor sobe em `http://localhost:3000` e já serve o frontend estático
junto com a API (`/api/...`). Ao iniciar pela primeira vez, o banco SQLite
é criado automaticamente com as instituições e categorias padrão.

## Modo demonstração

Sem nenhuma integração bancária real configurada, use o modo demonstração:

- No frontend, a tela **Modo de demonstração** (`modo-demonstracao.html`)
  gera contas e transações fictícias direto no navegador (via `sessionStorage`),
  sem precisar do backend — ótimo para testar a interface rapidamente.
- Com o backend rodando, o endpoint `POST /api/demo/ativar` (autenticado)
  cria as mesmas contas e transações fictícias no banco de dados do usuário.

Nenhum dado fictício representa movimentações reais, e nenhuma senha bancária
é solicitada ou armazenada em nenhum momento.

## Principais endpoints da API

| Método | Rota                              | Descrição                                  |
|--------|------------------------------------|---------------------------------------------|
| POST   | `/api/auth/cadastro`               | Cria conta com e-mail/senha                  |
| POST   | `/api/auth/login`                  | Login com e-mail/senha                       |
| POST   | `/api/auth/google`                 | Login/cadastro via Google (OAuth)            |
| GET    | `/api/instituicoes`                | Lista instituições e status de conexão       |
| POST   | `/api/instituicoes/conectar`       | Conecta uma instituição (simulado/demo)      |
| GET    | `/api/transacoes`                  | Lista transações (filtros: banco, tipo, busca, mês, ano) |
| PATCH  | `/api/transacoes/:id/categoria`    | Altera a categoria de uma transação          |
| GET    | `/api/categorias`                  | Lista categorias                             |
| GET    | `/api/categorias/resumo`           | Totais por categoria em um período           |
| GET    | `/api/relatorios/resumo`           | Entradas, saídas e resultado de um período   |
| GET    | `/api/relatorios/comparar`         | Compara dois períodos (ex: mês a mês)        |
| POST   | `/api/demo/ativar`                 | Gera dados fictícios para o usuário logado   |

## Configurar login com Google

O login com e-mail/senha já funciona assim que o backend sobe. Para ativar
o botão "Entrar com Google":

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie
   (ou selecione) um projeto.
2. Vá em **APIs e serviços → Tela de consentimento OAuth** e configure o
   básico (nome do app "FinanHub", e-mail de suporte). Pode deixar em modo
   "Externo" e "Teste" enquanto desenvolve.
3. Vá em **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**.
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Em **Origens JavaScript autorizadas**, adicione `http://localhost:3000`
     (e depois o domínio real quando publicar).
   - Não precisa preencher "URIs de redirecionamento" — o fluxo usado
     (Google Identity Services) não redireciona.
4. Copie o **Client ID** gerado (termina com `.apps.googleusercontent.com`).
5. Cole esse Client ID em dois lugares:
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`
   - `frontend/js/config.js` → `GOOGLE_CLIENT_ID: '...'`
6. Reinicie o backend (`npm start`). O botão oficial do Google passa a
   aparecer nas telas de login e cadastro, e o backend valida o token
   recebido antes de criar/logar o usuário (`google-auth-library`).

Sem o Client ID configurado, o botão continua visível mas apenas abre o
modo demonstração, sem depender do backend.

## Open Finance

A arquitetura já está preparada para a integração oficial com o Open Finance
brasileiro:

- Tabela `consentimentos` para armazenar o ciclo de vida do consentimento
  (pendente/ativo/revogado/expirado) por instituição e usuário.
- Nenhuma senha bancária é solicitada ou armazenada em nenhuma tela ou rota.
- A pasta `bancos/` está pronta para receber, futuramente, um adaptador por
  instituição quando as integrações oficiais forem implementadas.

Enquanto isso, o app funciona inteiramente com dados fictícios via modo
demonstração.

## Próximos passos sugeridos

1. Substituir o SQLite por PostgreSQL em produção (o schema já é compatível).
2. Implementar o fluxo real do OAuth do Google.
3. Trocar as regras de categorização por um classificador com IA, mantendo
   as correções manuais do usuário como dado de treino.
4. Integrar oficialmente com o Open Finance, banco a banco.
