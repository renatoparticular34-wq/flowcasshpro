
# FlowCash Pro - Gestão de Fluxo de Caixa

Aplicativo de gestão financeira SaaS, construído com React, Vite e Supabase.

## 🚀 Setup Inicial

### 1. Supabase Setup

1. Crie um novo projeto no [Supabase](https://supabase.com).
2. Vá ao **SQL Editor** no painel do Supabase.
3. Copie o conteúdo de `supabase/migrations/00_initial_schema.sql` e execute.
   - Isso criará as tabelas, funções, triggers e políticas de segurança (RLS).
4. Vá em **Project Settings > API** e copie:
   - Project URL
   - `anon` public key

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (copie de `.env.local` se existir) e preencha:

```env
VITE_SUPABASE_URL=se_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 3. Instalação e Execução

```bash
npm install
npm run dev
```

## 🛠️ Tecnologias

- **Frontend**: React + Vite + TypeScript
- **Estilização**: TailwindCSS (via CDN para dev rápido, ou postcss configurado)
- **Backend**: Supabase (Postgres, Auth, Edge Functions)
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## 🔒 Segurança

O projeto utiliza **RLS (Row Level Security)** do Supabase para garantir que cada usuário/empresa acesse apenas seus próprios dados.

## 📂 Estrutura

- `/components`: Componentes da UI (Dashboard, Transações, etc)
- `/services`: Comunicação com Supabase
- `/lib`: Configuração do cliente Supabase
- `/supabase`: Scripts de migração SQL
