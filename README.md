# Meta Compartilhada

Um sistema completo de acompanhamento de metas ("Sistema de Metas") que suporta metas individuais e em dupla.

## Tecnologias

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + React Router v6
- **Backend**: Node.js + Express + TypeScript + SQLite (via better-sqlite3) + JWT auth
- **Monorepo**: Estrutura com `client/` e `server/`

## Como executar

1. Instale as dependências:
   \`\`\`bash
   npm run install:all
   \`\`\`

2. Inicie o ambiente de desenvolvimento (inicia o frontend e o backend simultaneamente):
   \`\`\`bash
   npm run dev
   \`\`\`

3. Acesse a aplicação em \`http://localhost:5173\`

## Estrutura do Banco de Dados

O banco de dados SQLite é criado automaticamente na primeira execução em \`server/data/meta.db\`.

## Funcionalidades

- Cadastro e Login de usuários
- Criação de metas individuais ou em dupla
- Busca de parceiros para metas em dupla
- Aceite ou rejeição de convites para metas
- Registro de progresso com histórico
- Visualização de progresso com barra de porcentagem
- Perfil do usuário com estatísticas
