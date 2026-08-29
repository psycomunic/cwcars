# CW Motors — site + sistema de gestão

Site de venda de carros (mercado brasileiro) com painel administrativo próprio.
Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma 7 + PostgreSQL.

---

## Como rodar

O banco fica no **Supabase** (nuvem), então basta um terminal:

```bash
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

Não precisa subir banco nenhum — as credenciais já estão no `.env`. Veja
[Supabase](#supabase-banco-e-fotos-em-produção) se precisar trocar de projeto.

> **Trabalhando offline?** Dá para voltar ao Postgres local do Prisma com
> `npm run db` num segundo terminal, colando no `.env` a `DATABASE_URL` que ele
> imprime. Esse servidor local é frágil: derruba conexões quando recebe mais de
> uma ou duas simultâneas, então o pool cai para 1 conexão. Se aparecer erro 500
> com "Server has closed the connection", feche o terminal e rode `npm run db`
> de novo — os dados são preservados.


**Acesso inicial do painel** (criado pelo seed):

- e-mail: `admin@cwmotors.com.br`
- senha: `cwmotors123`

> Troque essa senha antes de colocar no ar.

### Recarregar o estoque a partir do seed

```bash
npm run seed
```

Recria as marcas, os opcionais, o **estoque real** (fotos em `public/estoque`),
o usuário administrador e as configurações da loja. Os veículos ficam
declarados em `prisma/seed.ts` — quem tem `preco: 0` entra como rascunho, fora
do site, até o valor ser informado.

**Atenção:** o seed apaga veículos, leads, marcas e modelos existentes — e
agora ele aponta para o banco do **Supabase**, não mais para um banco local
descartável. Depois que a loja começar a cadastrar veículos pelo painel, não
rode mais este comando.

### Outros comandos

| Comando          | O que faz                                            |
| ---------------- | ---------------------------------------------------- |
| `npm run dev`    | Servidor de desenvolvimento                          |
| `npm run build`  | Build de produção                                    |
| `npm start`      | Roda o build de produção                             |
| `npm run db`     | Sobe o Postgres local do Prisma                      |
| `npm run seed`   | Popula o banco com dados de exemplo                  |
| `npm run studio` | Abre o Prisma Studio (edição visual do banco)        |
| `npm run lint`   | ESLint                                               |
| `npm run logos`  | Regera os logotipos das marcas                       |
| `npm run supabase:check` | Testa a conexão e o bucket do Supabase       |

---

## O que já existe

### Site público

| Página              | Rota               | Conteúdo                                                                     |
| ------------------- | ------------------ | ---------------------------------------------------------------------------- |
| Home                | `/`                | Hero, busca rápida, destaques com abas por carroceria, benefícios, marcas    |
| Estoque             | `/estoque`         | Filtros (marca, modelo, preço, ano, km, câmbio, combustível, cor), ordenação, paginação |
| Detalhe do veículo  | `/veiculo/[slug]`  | Galeria com lightbox, ficha técnica, opcionais, comparativo FIPE, formulário de lead |
| Financiamento       | `/financiamento`   | Simulador com entrada/parcelas e envio da proposta                            |
| Avaliação de troca  | `/avaliar-troca`   | Formulário de avaliação do usado                                              |
| Contato             | `/contato`         | Dados da loja, formulário e mapa (se configurado)                             |
| Sobre               | `/sobre`           | Institucional com números do estoque                                          |
| Privacidade         | `/privacidade`     | Política de privacidade (LGPD)                                                |

Todo formulário grava um **lead** no banco e aparece no painel.

### Painel administrativo (`/admin`)

- **Visão geral** — veículos disponíveis, valor do estoque, leads novos, mais visitados
- **Veículos** — listagem com busca e filtro por status, cadastro/edição completos,
  upload de fotos com reordenação, seleção de opcionais, destaque na home, exclusão
- **Leads** — filtro por status e origem, mudança de status, anotações internas,
  atalhos para e-mail/telefone/WhatsApp, dados de financiamento e de troca
- **Marcas e modelos** — cadastro, destaque na faixa da home, exclusão protegida
- **Configurações** — nome, logo, **cor principal do site**, contatos, endereço,
  horários, mapa e redes sociais

---

## Estrutura

```
prisma/
  schema.prisma        modelos do banco
  seed.ts              dados de exemplo
src/
  acoes/               server actions (leads, veículos, admin, autenticação)
  app/
    (site)/            páginas públicas
    admin/             login + painel
    api/upload/        recebimento de fotos
  components/
    admin/             componentes do painel
    site/              header, footer, formulários, galeria
    ui.tsx             botões, campos, selos, seções
  lib/
    prisma.ts          cliente do banco
    veiculos.ts        consultas e filtros do estoque
    format.ts          moeda, km, telefone, datas
    labels.ts          rótulos em português dos enums
    validacao.ts       schemas Zod dos formulários
    cores.ts           paleta derivada da cor principal
  proxy.ts             proteção das rotas /admin
```

### Decisões que valem saber

- **Valores em centavos.** Todo preço no banco é `Int` em centavos
  (`precoCentavos`), evitando erro de arredondamento. Use `moeda()` para exibir
  e `paraCentavos()` para ler o que o usuário digitou.
- **Identidade visual centralizada.** As cores vivem em tokens CSS no topo de
  `src/app/globals.css`. A cor principal também pode ser trocada pelo painel,
  em Configurações — ela sobrescreve o token em tempo de execução.
- **Sessão do admin.** JWT assinado (HS256) em cookie `httpOnly`. O `proxy.ts`
  valida a assinatura na borda; a página confere no banco se o usuário continua ativo.
- **Fotos.** O upload grava em `public/uploads`. Em hospedagem com disco efêmero
  (Vercel, por exemplo) troque por Vercel Blob, S3 ou Cloudinary — basta alterar
  `src/app/api/upload/route.ts`, mantendo o mesmo retorno `{ urls: string[] }`.
- **Fotos do estoque atual.** Ficam versionadas em `public/estoque/<slug>/01.jpg…`.
  As enviadas pelo painel vão para `public/uploads` (fora do Git).
- **Pool de conexões.** O Postgres local do `npm run db` derruba conexões quando
  recebe mais de ~3 simultâneas, então o pool é pequeno em desenvolvimento e
  grande em produção. `src/lib/prisma.ts` ainda repete automaticamente uma
  leitura que caia por conexão encerrada — o que também protege contra bancos
  gerenciados que fecham conexões ociosas. Ajuste com `DATABASE_POOL_MAX`.
- **Placeholders.** Veículos sem foto caem nas ilustrações de `public/placeholders`.


---

## Supabase (banco e fotos em produção)

**Já está ligado.** O projeto roda hoje no Supabase (`bwwapwvuadxjkcjfffcj`,
região `sa-east-1`): banco, migrations aplicadas, estoque carregado e bucket
público `veiculos` recebendo as fotos do painel. Esta seção fica como registro
de como foi feito — e do que muda se você trocar de projeto.

### 1. Strings de conexão

No painel do Supabase, botão verde **Connect** → aba **Direct** → *Type: URI*.
São duas conexões, por dois motivos diferentes:

```bash
# APP — Transaction pooler (Supavisor), porta 6543
DATABASE_URL="postgresql://postgres.<REF>:<SENHA>@aws-0-<REGIAO>.pooler.supabase.com:6543/postgres?uselibpqcompat=true&sslmode=require"

# MIGRATIONS — Session pooler, porta 5432 (o pooler em modo transação não faz DDL)
DIRECT_URL="postgresql://postgres.<REF>:<SENHA>@aws-0-<REGIAO>.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require"

DATABASE_POOL_MAX="5"
```

Três detalhes que custam tempo se passarem batido:

- **Não use "Direct connection".** Ela só responde por IPv6; da maioria das
  redes domésticas e da Vercel, sem o add-on de IPv4, não conecta. Use os dois
  poolers.
- **Os colchetes de `[YOUR-PASSWORD]` são marcação, não fazem parte da senha.**
  Deixá-los na string dá `password authentication failed`.
- **`uselibpqcompat=true&sslmode=require` é obrigatório.** O `pg` a partir da v8.23
  trata `sslmode=require` sozinho como `verify-full`, e o certificado do Supabase é
  assinado por uma CA própria — sem esse par a conexão morre com
  `self-signed certificate in certificate chain`. O `uselibpqcompat` restaura a
  semântica do libpq: conexão criptografada, sem validar a cadeia. Se quiser
  validação completa, baixe a CA em *Project Settings → Database → SSL
  Configuration* e troque por `sslmode=verify-full&sslrootcert=<caminho>`.
- Se a senha tiver caractere especial (`@ : / ? # &`), ela precisa ir
  **percent-encoded** na URL.

### 2. Storage das fotos

Bucket **público** chamado `veiculos`, limite de 8 MB por arquivo e restrito a
imagens (`jpeg`, `png`, `webp`, `avif`, `svg`) — os mesmos limites que
`src/app/api/upload/route.ts` aplica. Depois preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<REF>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="…"     # secreta, nunca no navegador
SUPABASE_STORAGE_BUCKET="veiculos"
```

Com a `SUPABASE_SERVICE_ROLE_KEY` preenchida, os uploads do painel passam a ir
para o Supabase em vez de `public/uploads` — obrigatório na Vercel, onde o disco
é apagado a cada deploy. O `next.config.ts` libera esse host no otimizador de
imagens automaticamente.

### 3. Conferir e migrar

```bash
npm run supabase:check     # testa as duas conexões e o bucket
npx prisma migrate deploy  # cria as tabelas
npm run seed               # opcional: carrega o estoque de prisma/seed.ts
```

### O que continua local

As fotos em `public/estoque/` são servidas pelo próprio site e continuam
funcionando — só os uploads novos, feitos pelo painel, vão para o Storage.

### Voltar para o Postgres local

Rode `npm run db`; ele imprime a `DATABASE_URL` do servidor local. Cole no
`.env`, apague a `DIRECT_URL` e limpe a `SUPABASE_SERVICE_ROLE_KEY` para os
uploads voltarem a `public/uploads`.

---

## Publicar em produção

1. Crie um Postgres gerenciado (Neon, Supabase, Railway, ou o seu servidor).
2. Ajuste `DATABASE_URL` e gere um `AUTH_SECRET` novo (32+ caracteres):
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
3. Aplique as migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Defina `NEXT_PUBLIC_SITE_URL` com o domínio real.
5. `npm run build && npm start`.

Use o `.env.example` como referência das variáveis.
