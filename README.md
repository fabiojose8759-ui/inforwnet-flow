# Inforwnet — Sistema de Ordem de Serviço

App web estático (HTML/CSS/JS) com login e dados no [Supabase](https://supabase.com).

## Publicar no GitHub (site gratuito)

O GitHub oferece hospedagem gratuita com **GitHub Pages**. Seu site ficará em um endereço como:

`https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`

### 1. Instalar o Git

1. Baixe: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Instale (pode deixar as opções padrão)
3. **Feche e abra de novo** o Cursor ou o PowerShell

### 2. Criar conta e repositório no GitHub

1. Crie conta em [https://github.com](https://github.com) (se ainda não tiver)
2. Clique em **New repository**
3. Nome sugerido: `sistema-os-inforwnet` (sem espaços)
4. Deixe **Public**
5. **Não** marque “Add a README” (já existe no projeto)
6. Clique em **Create repository**

### 3. Enviar o código (primeira vez)

No PowerShell, na pasta do projeto:

```powershell
cd "C:\Users\Fabio\Desktop\SISTEMA DE OS"

git init
git add .
git commit -m "Publicar sistema de OS no GitHub Pages"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sistema-os-inforwnet.git
git push -u origin main
```

Troque `SEU-USUARIO` e o nome do repositório pelos seus.

Na primeira vez o GitHub pode pedir login no navegador ou um **Personal Access Token** em vez da senha da conta.

### 4. Ativar o site gratuito (GitHub Pages)

1. No repositório no GitHub: **Settings** → **Pages**
2. Em **Build and deployment** → **Source**: escolha **Deploy from a branch**
3. **Branch**: `main` — pasta **`/ (root)`**
4. Salve (**Save**)
5. Em 1–3 minutos aparece o link do site (ex.: `https://seu-usuario.github.io/sistema-os-inforwnet/`)

### 5. Configurar o Supabase para o site online

Sem isso o login pode falhar no domínio `github.io`.

1. Painel Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: cole a URL do GitHub Pages (com barra no final), exemplo:
   `https://seu-usuario.github.io/sistema-os-inforwnet/`
3. Em **Redirect URLs**, adicione a mesma URL
4. Salve

As chaves do Supabase já estão no `index.html` como fallback (chave **anon** é pública; a segurança vem das regras RLS no banco). O arquivo `config.js` continua fora do Git (`.gitignore`).

### 6. Domínio próprio (opcional)

Se você **comprar** um domínio (ex.: `inforwnet.com.br`):

1. GitHub → repositório → **Settings** → **Pages** → **Custom domain**
2. No provedor do domínio, crie um registro **CNAME** apontando para `SEU-USUARIO.github.io`
3. Atualize também a **Site URL** no Supabase para o domínio novo

O endereço `*.github.io` já é gratuito e não exige comprar domínio.

## Desenvolvimento local

- Abra `index.html` com **Live Server** no VS Code, ou
- Copie `config.example.js` → `config.js` e ajuste URL/chave se quiser testar com outro projeto Supabase

Mais detalhes do banco: `supabase/INSTRUCOES.md`

## Arquivos principais

| Arquivo | Função |
|---------|--------|
| `index.html` | Interface do sistema |
| `script.js` | Lógica da aplicação |
| `supabase-db.js` | API Supabase |
| `config.js` | Credenciais locais (não vai para o Git) |
| `supabase/schema.sql` | Estrutura do banco |
