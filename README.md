# gPower Studio

Sistema de gestão para estúdios de tatuagem e piercing.

## Stack

- **Backend**: NestJS 10, Prisma 5, PostgreSQL, Passport (JWT)
- **Frontend Web**: Next.js 14, Tailwind CSS, React Query, Zustand
- **Mobile**: Expo 51, React Native
- **Infra**: Turborepo, pnpm, TypeScript

## Estrutura

```
apps/
├── landing/     # Landing page (Next.js)
├── mobile/      # App mobile (Expo / React Native)
└── web/         # Painel web (Next.js)
packages/
├── api/         # API REST (NestJS)
├── db/          # Prisma schema + migrations
├── shared/      # Tipos e utilitários compartilhados
└── ui/          # Componentes de UI
```

---

## API Endpoints

Base URL: `http://localhost:3001/api/v1`

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Registrar estúdio + owner |
| POST | /auth/login | Login (email + senha) |
| POST | /auth/refresh | Renovar access token |
| POST | /auth/logout | Logout |

### Estúdios

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /studios/:id | Buscar por ID |
| GET | /studios/slug/:slug | Buscar por slug |

### Artistas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /artists | Criar |
| GET | /artists | Listar |
| GET | /artists/:id | Buscar por ID |
| PATCH | /artists/:id | Atualizar |
| DELETE | /artists/:id | Remover |
| GET | /artists/:id/schedules | Horários do artista |
| PUT | /artists/:id/schedules | Substituir horários |

### Clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /clients | Criar |
| GET | /clients | Listar |
| GET | /clients/search/phone?phone= | Buscar por telefone |
| GET | /clients/:id | Buscar por ID |
| PATCH | /clients/:id | Atualizar |
| DELETE | /clients/:id | Remover |

### Serviços

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /services | Criar |
| GET | /services | Listar (`?category=TATTOO`) |
| GET | /services/:id | Buscar por ID |
| PATCH | /services/:id | Atualizar |
| DELETE | /services/:id | Remover |

Categorias: `TATTOO`, `PIERCING`, `CONSULTATION`, `TOUCH_UP`, `REMOVAL`

### Agendamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /appointments | Criar |
| GET | /appointments | Listar (filtros abaixo) |
| GET | /appointments/:id | Buscar por ID |
| PATCH | /appointments/:id | Atualizar |
| DELETE | /appointments/:id | Remover |

**Filtros:** `startDate`, `endDate`, `status`, `artistId`

Status: `PENDING`, `DEPOSIT_PAID`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`

---

## Ambiente

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/gpower_studio
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## Desenvolvimento

```bash
pnpm install
cd packages/db && npx prisma generate && npx prisma migrate dev
cd packages/api && npm run dev
cd packages/api && npm test
```
