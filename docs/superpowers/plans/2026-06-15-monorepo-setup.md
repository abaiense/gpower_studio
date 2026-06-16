# Turborepo Monorepo Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a complete Turborepo monorepo for GPower Studio SaaS with Next.js web/landing apps, React Native mobile app, NestJS API, Prisma DB layer, shared UI, and shared types packages.

**Architecture:** Turborepo orchestrates build pipelines across `apps/` (web, landing, mobile) and `packages/` (api, db, ui, shared). pnpm workspaces wire cross-package references. Infrastructure lives in `infra/` with Docker Compose for local Postgres + Redis.

**Tech Stack:** Turborepo, pnpm workspaces, TypeScript 5, Next.js 14, React Native + Expo 51, NestJS, Prisma, shadcn/ui (via class-variance-authority), PostgreSQL 15, Redis 7.

---

### File Map

**Root:**
- `package.json` — workspace root, turbo scripts
- `pnpm-workspace.yaml` — pnpm workspace config
- `turbo.json` — pipeline definitions
- `tsconfig.base.json` — strict TS base config
- `.gitignore` — add node_modules, .next, dist, .turbo
- `.env.example` — env vars template

**apps/web:**
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/layout.tsx`

**apps/landing:**
- `apps/landing/package.json`
- `apps/landing/next.config.ts`
- `apps/landing/tsconfig.json`
- `apps/landing/src/app/page.tsx`
- `apps/landing/src/app/layout.tsx`

**apps/mobile:**
- `apps/mobile/package.json`
- `apps/mobile/app.json`
- `apps/mobile/tsconfig.json`
- `apps/mobile/app/index.tsx`

**packages/api:**
- `packages/api/package.json`
- `packages/api/tsconfig.json`
- `packages/api/src/main.ts`
- `packages/api/src/app.module.ts`

**packages/db:**
- `packages/db/package.json`
- `packages/db/tsconfig.json`
- `packages/db/prisma/schema.prisma`
- `packages/db/src/index.ts`

**packages/ui:**
- `packages/ui/package.json`
- `packages/ui/tsconfig.json`
- `packages/ui/src/index.ts`
- `packages/ui/src/components/button.tsx`

**packages/shared:**
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/auth.ts`
- `packages/shared/src/types/common.ts`

**infra:**
- `infra/docker/docker-compose.yml`
- `infra/.env.example`

---

### Task 1: Root Configuration Files

**Files:**
- Modify: `.gitignore`
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.env.example`

- [ ] Write root `package.json`
- [ ] Write `pnpm-workspace.yaml`
- [ ] Write `turbo.json`
- [ ] Write `tsconfig.base.json`
- [ ] Write `.env.example`
- [ ] Update `.gitignore`

### Task 2: packages/shared

**Files:** All files under `packages/shared/`

- [ ] Create `packages/shared/package.json`
- [ ] Create `packages/shared/tsconfig.json`
- [ ] Create `packages/shared/src/types/common.ts`
- [ ] Create `packages/shared/src/types/auth.ts`
- [ ] Create `packages/shared/src/index.ts`

### Task 3: packages/ui

**Files:** All files under `packages/ui/`

- [ ] Create `packages/ui/package.json`
- [ ] Create `packages/ui/tsconfig.json`
- [ ] Create `packages/ui/src/components/button.tsx`
- [ ] Create `packages/ui/src/index.ts`

### Task 4: packages/db

**Files:** All files under `packages/db/`

- [ ] Create `packages/db/package.json`
- [ ] Create `packages/db/tsconfig.json`
- [ ] Create `packages/db/prisma/schema.prisma`
- [ ] Create `packages/db/src/index.ts`

### Task 5: packages/api

**Files:** All files under `packages/api/`

- [ ] Create `packages/api/package.json`
- [ ] Create `packages/api/tsconfig.json`
- [ ] Create `packages/api/src/main.ts`
- [ ] Create `packages/api/src/app.module.ts`

### Task 6: apps/web and apps/landing

**Files:** All files under `apps/web/` and `apps/landing/`

- [ ] Create all web app files
- [ ] Create all landing app files

### Task 7: apps/mobile

**Files:** All files under `apps/mobile/`

- [ ] Create all mobile app files

### Task 8: Infrastructure

**Files:** `infra/docker/docker-compose.yml`, `infra/.env.example`

- [ ] Create docker-compose.yml
- [ ] Create infra env example

### Task 9: Install dependencies and commit

- [ ] Run `pnpm install` in worktree root
- [ ] Fix any issues
- [ ] Commit
