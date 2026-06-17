# Sprint 5 — Pagamentos Integrados + Flash Sales

**Data:** 2026-06-17
**Branch:** `sprint-5/pagamentos-flash-sales`
**Base:** `main` (pós-sprint-4)

---

## Contexto

Sprints 1–4 entregaram: monorepo, auth/RBAC, CRM, agenda, financeiro, notificações, projetos multi-sessão, gestão de arte com aprovação, consentimento digital.

O estúdio usa **InfinitePay** como maquininha física. O sistema atual não registra parcelas nem integra checkout online. Sprint 5 resolve dois gaps:

1. **Pagamentos integrados** — registro manual de cobranças InfinitePay + geração de link de checkout MercadoPago para pagamento remoto.
2. **Flash Sales** — artista publica slot cancelado com desconto, sistema notifica clientes via WhatsApp broadcast, primeiro cliente a confirmar leva o horário.

---

## Arquitetura

### Módulos novos/alterados (backend)

| Módulo | Responsabilidade |
|---|---|
| `payments` (existente, expandido) | Registro manual InfinitePay, checkout MP, webhook MP |
| `flash-sales` (novo) | CRUD de slots, broadcast, claim público |
| `public` (existente, expandido) | Endpoint público de claim de flash slot |

### Páginas novas/alteradas (frontend)

| Rota | Descrição |
|---|---|
| `/configuracoes/pagamentos` | Configurar access token MercadoPago |
| `/agenda` (modal alterado) | Botão "Cobrar" → modal registro InfinitePay + geração link MP |
| `/flash-sales` | Lista de slots + botão criar |
| `/flash/[token]` | Página pública de reivindicação (sem login) |

---

## Detalhamento

### 1. Pagamentos

#### Schema (adições ao Payment existente)

```prisma
model Payment {
  // campos existentes mantidos
  installments     Int?     // número de parcelas (InfinitePay ou MP)
  installmentValue Float?   // valor de cada parcela
  checkoutUrl      String?  // init_point retornado pelo MercadoPago
  source           String?  // "infinitepay" | "mercadopago" | "manual"
}
```

#### Configuração MercadoPago por estúdio (adições ao Studio)

```prisma
model Studio {
  // campos existentes mantidos
  mpAccessToken String? // access token do MP (por estúdio, criptografado em prod)
  mpPublicKey   String? // public key do MP
}
```

#### Fluxo InfinitePay (registro manual)

```
Estúdio cobra na maquininha → abre modal "Registrar pagamento" →
informa: valor, método (débito/crédito/PIX), parcelas, data →
sistema cria Payment com source "infinitepay", status PAID →
appointment atualizado
```

#### Fluxo MercadoPago (checkout online)

```
Estúdio clica "Gerar link de pagamento" →
API chama POST /preferences no MP com valor e parcelas →
MP retorna init_point (URL de checkout) →
sistema salva checkoutUrl no Payment, status PENDING →
envia link por WhatsApp ao cliente →
cliente paga (PIX ou cartão parcelado) →
MP dispara webhook → API atualiza Payment status → PAID →
appointment status atualizado
```

#### Endpoints backend

**Existentes (mantidos):**
- `POST /payments` — criar pagamento (já existe, adicionar campos installments/source)
- `GET /payments/appointment/:id` — listar por agendamento
- `PATCH /payments/:id/paid` — marcar pago
- `PATCH /payments/:id/refund` — estornar

**Novos:**
- `POST /payments/checkout` — cria preference MercadoPago, retorna `{ checkoutUrl, paymentId }`
- `POST /payments/mp-webhook` — sem auth, verificado por assinatura X-Signature MP; atualiza status
- `GET /studios/me/payment-config` — retorna config MP (sem expor token)
- `PATCH /studios/me/payment-config` — salva mpAccessToken + mpPublicKey

#### Webhook MercadoPago

- Endpoint: `POST /payments/mp-webhook`
- Sem JwtAuthGuard
- Verifica assinatura via `x-signature` header (HMAC-SHA256 com mpAccessToken)
- Eventos tratados: `payment.updated` → se status MP = `approved` → Payment.status = PAID

#### Regras de negócio

- Parcelamento MercadoPago: máximo 12x, mínimo R$1 por parcela
- Se estúdio não configurou MP, endpoint `/payments/checkout` retorna 400 com mensagem clara
- Webhook idempotente: se Payment já está PAID, ignora evento duplicado

---

### 2. Flash Sales

#### Schema (modelo novo)

```prisma
enum FlashSlotStatus {
  OPEN      // disponível para reivindicação
  CLAIMED   // cliente reivindicou
  EXPIRED   // prazo encerrado sem reivindicação
  CANCELLED // cancelado pelo estúdio
}

model FlashSlot {
  id                String          @id @default(cuid())
  title             String          // "Slot relâmpago — blackwork 2h"
  description       String?
  originalPrice     Float
  discountPrice     Float
  sessionAt         DateTime        // quando seria a sessão
  claimDeadline     DateTime        // até quando pode reivindicar
  status            FlashSlotStatus @default(OPEN)
  claimToken        String          @unique // token para URL pública
  artistId          String
  studioId          String
  claimedByClientId String?
  claimedAt         DateTime?
  appointmentId     String?         @unique // criado ao reivindicar

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  artist           Artist   @relation(fields: [artistId], references: [id])
  studio           Studio   @relation(fields: [studioId], references: [id], onDelete: Cascade)
  claimedByClient  Client?  @relation(fields: [claimedByClientId], references: [id])
  appointment      Appointment? @relation(fields: [appointmentId], references: [id])

  @@index([studioId])
  @@index([claimToken])
  @@index([status])
  @@map("flash_slots")
}
```

#### Fluxo completo

```
Artista cria flash slot (título, preço original, preço com desconto, data/hora da sessão, prazo) →
sistema gera claimToken (cuid) →
URL pública: /flash/{claimToken} →
WhatsApp broadcast para todos os clientes ativos do estúdio →
clientes abrem link →
primeiro a confirmar (informa telefone para identificação) reivindica →
appointment criado automaticamente (status PENDING, artistId do slot) →
slot status → CLAIMED →
outros clientes veem "Já reservado" →
estúdio recebe notificação do claim
```

#### Endpoints backend

- `POST /flash-slots` — criar slot + disparar broadcast WhatsApp
- `GET /flash-slots` — listar slots do estúdio (com filtro status)
- `GET /flash-slots/:id` — detalhe
- `POST /flash-slots/:id/cancel` — cancelar slot OPEN
- `GET /public/flash/:token` — info do slot sem auth
- `POST /public/flash/:token/claim` — reivindicar (body: `{ phone: string }`)

#### Claim público

`POST /public/flash/:token/claim`:
1. Verifica slot existe e status = OPEN
2. Verifica claimDeadline não expirou
3. Busca Client por phone + studioId
4. Se cliente não encontrado: retorna 404 com mensagem "Telefone não cadastrado no estúdio"
5. Cria Appointment (PENDING, startAt = sessionAt, artistId do slot, serviceId = null*)
6. Atualiza slot: status CLAIMED, claimedByClientId, claimedAt, appointmentId
7. Envia notificação WhatsApp de confirmação ao cliente
8. Retorna `{ message, appointmentId }`

`serviceId` é obrigatório no FlashSlot (artista escolhe o serviço ao criar o slot). O appointment usa o serviceId do slot — sem alteração no modelo Appointment.

#### Broadcast WhatsApp

- Template novo: `FLASH_SALE_BROADCAST`
- Envia para todos os clients ativos do studio com phone
- Via NotificationsService existente (Bull queue)
- Conteúdo: título do slot, preço com desconto, link, prazo

#### Expiração automática

- Bull job agendado no momento da criação: `delay = claimDeadline - now()`
- Ao disparar: se slot ainda OPEN → status EXPIRED

---

## Segurança

- Webhook MP: verificação de assinatura X-Signature (HMAC-SHA256) obrigatória — rejeita 401 se inválida
- `mpAccessToken` não é retornado em nenhum endpoint GET (masked: `••••••••`)
- Claim por telefone: não expõe dados do cliente além do necessário (só confirma/nega)
- claimToken = cuid (não previsível)

---

## Integrações reutilizadas

- **Bull queue + WhatsApp** — sprint 3, adicionar templates FLASH_SALE_BROADCAST
- **NotificationsService** — já usado em art-files e consent-forms
- **Public module** — já existe, adicionar endpoints de flash

---

## Testes

- Unit: PaymentsService (checkout MP mockado, webhook handler), FlashSalesService (create, claim, expiração)
- Foco: idempotência do webhook, race condition no claim — resolvido via transação Prisma com `updateMany({ where: { id, status: OPEN } })` seguido de verificação do count; se count = 0, slot já foi reivindicado por outro cliente (retorna 409)
- Meta: ≥ 40 novos testes passando

---

## Setup da Conta MercadoPago

### Cadastro e Plano

1. Acesse [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)
2. Crie uma conta ou faça login
3. Durante o cadastro, selecione o plano **Starter** (gratuito) — suficiente para testar:
   - Geração de link de checkout (preferences)
   - Webhook de confirmação de pagamento
   - Parcelamento (até 12x)
4. Após criar a conta, vá em "Suas integrações" → "Credenciais"
5. Copie o **Access Token** e a **Public Key**
6. No GPower Studio, acesse **Configurações > Pagamentos** e cole os tokens

> **Importante:** Para testes em ambiente de desenvolvimento, use as credenciais de teste (TEST-xxxx). O MercadoPago fornece cartões de teste para simular pagamentos sem movimentar dinheiro real.

### Webhook (produção)

- URL: `https://seudominio.com/api/payments/mp-webhook?studio_id=xxxx`
- Configure no painel MP em: **Webhooks & Notificações**

---

## Fora de escopo (sprint 6+)

- Conciliação automática InfinitePay (API InfinitePay)
- Relatório financeiro por gateway
- Parcelamento InfinitePay automático (hoje: registro manual)
- Flash sales com múltiplos slots simultâneos (fila de interessados)
- App mobile
