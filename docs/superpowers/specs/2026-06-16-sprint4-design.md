# Sprint 4 — Projetos Multi-Sessão + Gestão de Arte + Consentimento Digital

**Data:** 2026-06-16  
**Branch:** `sprint-4/projetos-arte-consentimento`  
**Base:** `sprint-3/financeiro-comunicacao`

---

## Contexto

Sprints 1–3 entregaram: monorepo, auth/RBAC, CRM, agenda (FullCalendar), financeiro, notificações WhatsApp/email, configurações de depósito.

Sprint 4 endereça o **maior gap competitivo** identificado na análise: nenhum player oferece gestão de arte com aprovação pelo cliente nem consentimento digital integrado. O schema já tem `Project` e `ConsentForm` — base sólida.

---

## Arquitetura

### Fluxo principal

```
Artista cria Projeto → vincula Appointments → faz upload de Arte →
envia link para cliente → cliente aprova ou pede revisão →
artista confirma → Appointment concluído → envia Consentimento →
cliente assina → pós-cuidado enviado automaticamente
```

### Novos módulos backend

| Módulo | Responsabilidade |
|---|---|
| `projects` | CRUD de projetos, vincular sessões, fechar |
| `art-files` | Upload S3, versionamento, fluxo de aprovação |
| `consent-forms` | CRUD, envio por canal, assinatura digital |
| `aftercare` | Templates por serviço, envio automático pós-sessão |
| `public` | Endpoints sem auth para aprovação e assinatura |

### Novas páginas frontend

| Rota | Descrição |
|---|---|
| `/projetos` | Lista de projetos com progresso e status de arte |
| `/projetos/[id]` | Timeline de sessões + galeria de versões de arte |
| `/projetos/novo` | Formulário de criação de projeto |
| `/approve/[token]` | Aprovação de arte pelo cliente (público, sem login) |
| `/consent/[token]` | Assinatura de consentimento pelo cliente (público, sem login) |

---

## Detalhamento

### 1. Projetos (`Project` model — já existe)

**Campos adicionados ao schema:**
```prisma
artFiles    ArtFile[]
consentForms ConsentForm[] // já existe a relação, falta no model
```

**Endpoints:**
- `POST /projects` — criar projeto com clientId, artistId, estimatedSessions
- `GET /projects` — listar com filtros (status, artistId, clientId)
- `GET /projects/:id` — detalhe com appointments e artFiles
- `PATCH /projects/:id` — atualizar nome, status, estimatedSessions
- `POST /projects/:id/close` — fechar projeto (status → COMPLETED)
- `POST /projects/:id/appointments/:appointmentId` — vincular sessão ao projeto

**Regras:**
- Projeto só fecha se todos appointments vinculados estão COMPLETED
- Status ACTIVE → COMPLETED (via close) ou CANCELLED (manual)

---

### 2. Gestão de Arte (`ArtFile` — model novo)

**Schema:**
```prisma
model ArtFile {
  id          String        @id @default(cuid())
  version     Int           // 1, 2, 3...
  filename    String
  s3Key       String
  mimeType    String
  sizeBytes   Int
  status      ArtFileStatus @default(DRAFT)
  notes       String?       // notas do artista
  clientNotes String?       // feedback do cliente
  approvalToken String?     @unique
  approvalTokenExpiresAt DateTime?
  approvedAt  DateTime?
  approvedIp  String?
  projectId   String
  studioId    String
  uploadedBy  String        // userId

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  studio  Studio  @relation(fields: [studioId], references: [id], onDelete: Cascade)
  uploader User   @relation(fields: [uploadedBy], references: [id])

  @@index([projectId])
  @@index([approvalToken])
  @@map("art_files")
}

enum ArtFileStatus {
  DRAFT              // rascunho interno
  SENT               // link enviado para cliente
  APPROVED           // aprovado pelo cliente
  REVISION_REQUESTED // cliente pediu revisão
}
```

**Endpoints:**
- `POST /projects/:id/art-files` — upload via S3 pre-signed URL (retorna uploadUrl + artFileId)
- `POST /projects/:id/art-files/:fileId/confirm-upload` — confirma upload, atualiza S3Key
- `GET /projects/:id/art-files` — lista versões em ordem
- `POST /projects/:id/art-files/:fileId/send` — gera approvalToken (JWT 7d), envia WhatsApp/email
- `GET /public/art/:token` — retorna metadados + URL da arte (sem auth)
- `POST /public/art/:token/approve` — registra aprovação (IP, timestamp)
- `POST /public/art/:token/request-revision` — registra pedido de revisão + clientNotes
- `GET /projects/:id/art-files/:fileId/download` — URL assinada S3 (acesso interno)

**Versioning:** cada upload cria novo ArtFile com `version = max(version)+1`. Versões anteriores ficam imutáveis (status não muda).

---

### 3. Consentimento Digital (`ConsentForm` model — já existe)

**Campos adicionados ao model existente:**
```prisma
consentToken          String?   @unique
consentTokenExpiresAt DateTime?
projectId             String?   // novo: vincular a projeto além de appointment
```

**Endpoints:**
- `POST /consent-forms` — criar formulário (formType, clientId, appointmentId?, projectId?)
- `GET /consent-forms/:id` — detalhe
- `POST /consent-forms/:id/send` — gera token (JWT 7d), envia por WhatsApp/email
- `GET /public/consent/:token` — retorna formulário para preenchimento (sem auth)
- `POST /public/consent/:token/sign` — recebe dados + aceite, registra IP, timestamp, userAgent → status SIGNED
- `GET /consent-forms` — listar com filtros (clientId, status, studioId)

**Tipos de formulário (formType):**
- `TATTOO_ADULT` — adulto, cláusulas padrão tatuagem
- `PIERCING_ADULT` — adulto, cláusulas piercing
- `MINOR` — menor de idade, campo para responsável
- `TOUCH_UP` — retoque, cláusulas simplificadas

**Assinatura digital:**
- Checkbox de aceite obrigatório
- Registra: IP, User-Agent, timestamp, hash SHA-256 do conteúdo assinado
- Retorna PDF gerado (simples, texto + metadados) → salva em S3, preenche `signatureUrl`
- LGPD: dados mínimos, sem biometria, sem imagem de assinatura

---

### 4. Aftercare

**Sem model novo** — usa sistema de notificações existente (Bull queue + WhatsApp/email).

**Endpoint:**
- `POST /appointments/:id/send-aftercare` — envia template de pós-cuidado ao cliente

**Templates por formType (4 templates estáticos):**
- Pós-tattoo (cuidados primeiros 7 dias)
- Pós-piercing
- Pós-remoção
- Retoque

**Envio automático:** quando appointment muda para COMPLETED, Bull job agenda envio de aftercare em 2h (configurável por studio).

---

## Integrações existentes reutilizadas

- **S3** — pre-signed URLs (já implementado em sprint 2 para foto de cliente)
- **Bull queue + WhatsApp/email** — (já implementado em sprint 3, adicionar novos templates)
- **JWT** — tokens de aprovação/consentimento usam mesmo secret, audience diferente

---

## Segurança

- Tokens de aprovação/consentimento: JWT HS256, exp 7d, audience `art-approval` ou `consent-sign`
- Página pública não recebe dados sensíveis além do necessário
- IP e User-Agent registrados para auditoria (LGPD art. 46)
- ArtFile S3 keys com prefixo `studios/{studioId}/art/` — acesso via URL assinada com TTL 1h

---

## Testes

- Unit: services de projects, art-files, consent-forms (mock Prisma + S3)
- E2E: fluxo completo — criar projeto → upload arte → enviar → aprovar (público) → fechar projeto
- E2E: criar consentimento → enviar → assinar (público)
- Meta: ≥ 60 novos testes passando

---

## Fora de escopo (sprint 5+)

- Marketplace público de artistas
- Portfólio público do artista
- Parcelamento integrado (Stripe/Pagar.me)
- Flash sales / slots relâmpago
- App mobile (React Native)
