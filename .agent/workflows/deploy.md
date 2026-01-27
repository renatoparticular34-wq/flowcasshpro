
---
description: Como fazer deploy do FlowCash Pro (Modo Online via Firebase)
---

# Deploy para Produção (Modo Online com Firebase)

O aplicativo foi migrado para **Firebase**. Siga estes passos para colocar no ar.

## Passo 1: Configurar Variáveis no Netlify (CRÍTICO)

Como movemos as chaves para o `.env` (que não sobe para o GitHub), você precisa configurá-las manualmente no painel do Netlify.

1. Vá em **Site Settings > Environment Variables**.
2. Adicione as seguintes variáveis (copie os valores do seu arquivo `.env` local):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## Passo 2: Configurar Domínio no Firebase Authentication

Para que o Login funcione em produção:

1. Acesse o **Console do Firebase**.
2. Vá em **Authentication > Settings > Authorized Domains**.
3. Adicione o domínio do seu site (ex: `flowcash-pro.netlify.app`).

## Passo 3: Deploy

1. Conecte seu GitHub ao Netlify.
2. O Netlify fará o build automaticamente (`npm run build`).
3. Se as variáveis estiverem configuradas, o site funcionará perfeitamente.
