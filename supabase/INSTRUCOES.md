# Supabase — Inforwnet OS Manager

## Papéis

| Papel | Permissões |
|-------|------------|
| **master** | Vê tudo, edita/apaga qualquer OS e entrega, apaga tudo, remove palavras-chave |
| **user** | Vê tudo da equipe, edita/apaga **só o que registrou**, adiciona palavras-chave |
| **Todos** | Leem OS, entregas e lista de materiais; veem badge com nome de quem registrou |

O **primeiro usuário cadastrado** vira **master** automaticamente.

## Passo a passo

### 1. Criar projeto
1. [supabase.com](https://supabase.com) → New project  
2. Anote a senha do banco  

### 2. Rodar o SQL
1. **SQL Editor** → New query  
2. Cole todo o conteúdo de `schema.sql`  
3. Run  

**Texto completo da OS:** o sistema já salva automaticamente (campo `extras` ou `texto_os`). Opcional: rode `migration_texto_os.sql` para uma coluna dedicada no banco.

### 3. Autenticação por e-mail
1. **Authentication** → **Providers** → Email → Enable  
2. (Recomendado para testes) **Authentication** → **Providers** → Email → desative **Confirm email**  

### 4. Credenciais no projeto
1. **Settings** → **API**  
2. Copie **Project URL** e **anon public** key  
3. Copie `config.example.js` → `config.js` na raiz do projeto  
4. Preencha URL e anon key  

### 5. Abrir o sistema
Abra `index.html` (ou sirva a pasta com um servidor local).

## Promover alguém a master

No **SQL Editor**:

```sql
update profiles set role = 'master' where email = 'daniel@empresa.com';
```

## Várias pessoas no mesmo PC

Não há mais “conta local única”. Cada pessoa usa **e-mail e senha** no Supabase.  
**Sair** → a próxima pessoa clica em **Entrar** com a conta dela (ou **Criar conta**).

## Sem config.js

O login não funciona até existir `config.js` com URL e anon key válidas.
