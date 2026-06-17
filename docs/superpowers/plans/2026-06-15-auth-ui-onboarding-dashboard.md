# Auth UI with Onboarding Flow and Dashboard Layout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement complete authentication UI (login, 3-step onboarding register) and dashboard layout with sidebar/header for the GPower Studio Next.js 14 app.

**Architecture:** Client-side auth state via Zustand store; tokens persisted to cookies via js-cookie; Axios instance with request/response interceptors for Bearer auth and 401 refresh; route protection via server-side redirect in dashboard layout using Next.js cookies().

**Tech Stack:** Next.js 14 App Router, React Hook Form, Zod, Axios, Zustand, js-cookie, lucide-react, Tailwind CSS, TypeScript.

---

## File Map

### New files to create

| File | Responsibility |
|------|---------------|
| `apps/web/src/lib/api.ts` | Axios instance with auth interceptors |
| `apps/web/src/lib/auth.ts` | Token helpers (get/set/clear/isAuthenticated) |
| `apps/web/src/lib/validations/login.schema.ts` | Zod schema for login |
| `apps/web/src/lib/validations/register.schema.ts` | Zod schema for register |
| `apps/web/src/store/auth.store.ts` | Zustand store: user state + login/logout/register actions |
| `apps/web/src/providers/query-provider.tsx` | ReactQuery client provider (client component) |
| `apps/web/src/app/layout.tsx` | Root layout: Inter font, ReactQuery provider, html/body |
| `apps/web/src/app/page.tsx` | Root redirect: /dashboard if authed, else /login |
| `apps/web/src/app/(auth)/layout.tsx` | Auth group layout: centered card, gradient bg, logo |
| `apps/web/src/app/(auth)/login/page.tsx` | Login page with metadata |
| `apps/web/src/app/(auth)/register/page.tsx` | Register page with metadata |
| `apps/web/src/app/(dashboard)/layout.tsx` | Dashboard layout: sidebar + header + route guard |
| `apps/web/src/app/(dashboard)/page.tsx` | Dashboard home placeholder |
| `apps/web/src/components/auth/login-form.tsx` | Login form (RHF + zod, email/password, loading, error) |
| `apps/web/src/components/auth/register-form.tsx` | Multi-step register orchestrator (3 steps) |
| `apps/web/src/components/auth/onboarding/step-1-studio.tsx` | Step 1: studio name, city, state |
| `apps/web/src/components/auth/onboarding/step-2-plan.tsx` | Step 2: plan selection cards (placeholder) |
| `apps/web/src/components/auth/onboarding/step-3-artist.tsx` | Step 3: personal data + password |
| `apps/web/src/components/layout/sidebar.tsx` | Fixed sidebar with nav items + logo + user info |
| `apps/web/src/components/layout/header.tsx` | Top header: breadcrumb + user name + logout button |
| `apps/web/src/components/layout/mobile-menu.tsx` | Mobile hamburger drawer for sidebar |

### Files to modify

| File | Change |
|------|--------|
| `apps/web/src/app/layout.tsx` | Replace with Inter font + ReactQuery provider |
| `apps/web/src/app/page.tsx` | Replace with server-side redirect logic |

---

## Task 1: Install Dependencies

**Files:** `apps/web/package.json` (modified by pnpm)

- [ ] **Step 1: Install runtime dependencies**

```bash
cd C:\Clientes\gpower_studio\.worktrees\sprint-1
pnpm add --filter @gpower/web @tanstack/react-query axios zod react-hook-form @hookform/resolvers zustand js-cookie lucide-react
```

Expected: Dependencies appear in `apps/web/package.json` under `dependencies`.

- [ ] **Step 2: Install type dependencies**

```bash
pnpm add --filter @gpower/web -D @types/js-cookie
```

Expected: `@types/js-cookie` appears in `devDependencies`.

- [ ] **Step 3: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/package.json pnpm-lock.yaml
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "chore: add auth + query dependencies to web app"
```

---

## Task 2: Auth Helpers and Zod Schemas

**Files:**
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/lib/validations/login.schema.ts`
- Create: `apps/web/src/lib/validations/register.schema.ts`

- [ ] **Step 1: Create auth token helpers**

Create `apps/web/src/lib/auth.ts`:

```typescript
import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'gpower_access_token';
const REFRESH_TOKEN_KEY = 'gpower_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(REFRESH_TOKEN_KEY) ?? null;
}

export function setTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1, sameSite: 'strict' });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30, sameSite: 'strict' });
}

export function clearTokens(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
```

- [ ] **Step 2: Create login schema**

Create `apps/web/src/lib/validations/login.schema.ts`:

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

- [ ] **Step 3: Create register schema**

Create `apps/web/src/lib/validations/register.schema.ts`:

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  studioName: z.string().min(2, 'Nome do estúdio deve ter pelo menos 2 caracteres'),
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  plan: z.enum(['starter', 'pro', 'enterprise']).default('starter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

- [ ] **Step 4: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/lib/auth.ts apps/web/src/lib/validations/
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add auth token helpers and zod schemas"
```

---

## Task 3: Axios API Instance with Interceptors

**Files:**
- Create: `apps/web/src/lib/api.ts`

- [ ] **Step 1: Create Axios instance**

Create `apps/web/src/lib/api.ts`:

```typescript
import axios, { AxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else if (token && config.headers) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      resolve(api(config));
    }
  });
  failedQueue = [];
}

// Response interceptor: 401 → refresh → retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/auth/refresh`,
          { refreshToken },
        );

        setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)['Authorization'] =
            `Bearer ${data.accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/lib/api.ts
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add axios instance with auth interceptors and token refresh"
```

---

## Task 4: Zustand Auth Store

**Files:**
- Create: `apps/web/src/store/auth.store.ts`

- [ ] **Step 1: Create Zustand auth store**

Create `apps/web/src/store/auth.store.ts`:

```typescript
import { create } from 'zustand';
import { api } from '@/lib/api';
import { clearTokens, setTokens } from '@/lib/auth';
import type { LoginFormData } from '@/lib/validations/login.schema';
import type { RegisterFormData } from '@/lib/validations/register.schema';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  studioId: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', credentials);

      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout').catch(() => {
        // Ignore server errors on logout — clear tokens regardless
      });
    } finally {
      clearTokens();
      set({ user: null, isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { data: response } = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: User;
      }>('/auth/register', {
        studioName: data.studioName,
        city: data.city,
        state: data.state,
        plan: data.plan,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      setTokens(response.accessToken, response.refreshToken);
      set({ user: response.user });
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/store/auth.store.ts
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add zustand auth store with login, logout, register actions"
```

---

## Task 5: Root Layout and ReactQuery Provider

**Files:**
- Create: `apps/web/src/providers/query-provider.tsx`
- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Create ReactQuery client provider**

Create `apps/web/src/providers/query-provider.tsx`:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 2: Update root layout**

Replace `apps/web/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GPower Studio',
  description: 'Gestão completa para estúdios de tatuagem e piercing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create globals.css if missing**

Check if `apps/web/src/app/globals.css` exists; if not, create it:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/providers/ apps/web/src/app/layout.tsx apps/web/src/app/globals.css
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add ReactQuery provider and update root layout with Inter font"
```

---

## Task 6: Root Page Redirect

**Files:**
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Replace root page with server-side redirect**

Replace `apps/web/src/app/page.tsx`:

```tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function RootPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('gpower_access_token');

  if (token?.value) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/app/page.tsx
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add root page server-side auth redirect"
```

---

## Task 7: Auth Group Layout

**Files:**
- Create: `apps/web/src/app/(auth)/layout.tsx`

- [ ] **Step 1: Create auth layout**

Create `apps/web/src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-white text-2xl font-bold">GPower Studio</span>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Gestão completa para seu estúdio
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add "apps/web/src/app/(auth)/layout.tsx"
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add auth group layout with gradient background and card"
```

---

## Task 8: Login Form Component

**Files:**
- Create: `apps/web/src/components/auth/login-form.tsx`

- [ ] **Step 1: Create login form**

Create `apps/web/src/components/auth/login-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations/login.schema';
import { useAuthStore } from '@/store/auth.store';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data);
      router.push('/dashboard');
    } catch {
      setServerError('Email ou senha inválidos. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="text-slate-500 text-sm mt-1">Acesse sua conta GPower Studio</p>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          {...register('email')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Não tem uma conta?{' '}
        <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/components/auth/login-form.tsx
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add login form component with RHF, zod, password toggle"
```

---

## Task 9: Login Page

**Files:**
- Create: `apps/web/src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create login page**

Create `apps/web/src/app/(auth)/login/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Entrar — GPower Studio',
};

export default function LoginPage() {
  return <LoginForm />;
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add "apps/web/src/app/(auth)/login/page.tsx"
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add login page"
```

---

## Task 10: Onboarding Step Components

**Files:**
- Create: `apps/web/src/components/auth/onboarding/step-1-studio.tsx`
- Create: `apps/web/src/components/auth/onboarding/step-2-plan.tsx`
- Create: `apps/web/src/components/auth/onboarding/step-3-artist.tsx`

- [ ] **Step 1: Create Step 1 — Studio data**

Create `apps/web/src/components/auth/onboarding/step-1-studio.tsx`:

```tsx
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { RegisterFormData } from '@/lib/validations/register.schema';

interface Step1Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export function Step1Studio({ register, errors }: Step1Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dados do Estúdio</h2>
        <p className="text-slate-500 text-sm mt-1">Como seu estúdio é chamado?</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="studioName" className="block text-sm font-medium text-slate-700">
          Nome do Estúdio
        </label>
        <input
          id="studioName"
          type="text"
          placeholder="Ex: Black Ink Studio"
          {...register('studioName')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        {errors.studioName && (
          <p className="text-red-600 text-xs mt-1">{errors.studioName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="city" className="block text-sm font-medium text-slate-700">
            Cidade
          </label>
          <input
            id="city"
            type="text"
            placeholder="São Paulo"
            {...register('city')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          {errors.city && (
            <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="state" className="block text-sm font-medium text-slate-700">
            Estado
          </label>
          <input
            id="state"
            type="text"
            placeholder="SP"
            maxLength={2}
            {...register('state')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase"
          />
          {errors.state && (
            <p className="text-red-600 text-xs mt-1">{errors.state.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Step 2 — Plan selection**

Create `apps/web/src/components/auth/onboarding/step-2-plan.tsx`:

```tsx
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Check } from 'lucide-react';
import type { RegisterFormData } from '@/lib/validations/register.schema';

interface Step2Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 'R$ 97/mês',
    features: ['1 artista', 'Agenda básica', 'Clientes ilimitados'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 'R$ 197/mês',
    features: ['Até 5 artistas', 'Agenda avançada', 'Financeiro', 'Estoque'],
    recommended: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 'R$ 397/mês',
    features: ['Artistas ilimitados', 'Multi-unidades', 'API', 'Suporte prioritário'],
  },
];

export function Step2Plan({ register, errors }: Step2Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Escolha seu Plano</h2>
        <p className="text-slate-500 text-sm mt-1">
          Você pode mudar de plano a qualquer momento.
        </p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <label
            key={plan.id}
            className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 border-slate-200 hover:border-slate-300 transition-colors"
          >
            <input
              type="radio"
              value={plan.id}
              {...register('plan')}
              className="mt-0.5 accent-amber-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  {plan.name}
                  {plan.recommended && (
                    <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold text-slate-700">{plan.price}</span>
              </div>
              <ul className="mt-2 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={13} className="text-amber-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </label>
        ))}
      </div>

      {errors.plan && (
        <p className="text-red-600 text-xs">{errors.plan.message}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create Step 3 — Artist / personal data**

Create `apps/web/src/components/auth/onboarding/step-3-artist.tsx`:

```tsx
import { useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import type { RegisterFormData } from '@/lib/validations/register.schema';

interface Step3Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export function Step3Artist({ register, errors }: Step3Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Seus Dados</h2>
        <p className="text-slate-500 text-sm mt-1">
          Crie sua conta de administrador do estúdio.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="João"
            {...register('firstName')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          {errors.firstName && (
            <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
            Sobrenome
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Silva"
            {...register('lastName')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          {errors.lastName && (
            <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="regEmail" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="regEmail"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          {...register('email')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        {errors.email && (
          <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="regPassword" className="block text-sm font-medium text-slate-700">
          Senha
        </label>
        <div className="relative">
          <input
            id="regPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register('password')}
            className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
          Confirmar Senha
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repita a senha"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/components/auth/onboarding/
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add 3-step onboarding components (studio, plan, personal data)"
```

---

## Task 11: Register Form (Multi-Step Orchestrator)

**Files:**
- Create: `apps/web/src/components/auth/register-form.tsx`

- [ ] **Step 1: Create register form orchestrator**

Create `apps/web/src/components/auth/register-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/register.schema';
import { useAuthStore } from '@/store/auth.store';
import { Step1Studio } from './onboarding/step-1-studio';
import { Step2Plan } from './onboarding/step-2-plan';
import { Step3Artist } from './onboarding/step-3-artist';

const STEP_LABELS = ['Estúdio', 'Plano', 'Sua Conta'];
const TOTAL_STEPS = 3;

// Fields to validate per step before advancing
const STEP_FIELDS: Record<number, (keyof RegisterFormData)[]> = {
  1: ['studioName', 'city', 'state'],
  2: ['plan'],
  3: ['firstName', 'lastName', 'email', 'password', 'confirmPassword'],
};

export function RegisterForm() {
  const router = useRouter();
  const { register: storeRegister, isLoading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { plan: 'pro' },
  });

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[currentStep]);
    if (valid) setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await storeRegister(data);
      router.push('/dashboard');
    } catch {
      setServerError('Não foi possível criar a conta. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isDone = stepNum < currentStep;
            return (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-amber-500 text-white'
                      : isActive
                        ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : stepNum}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? 'text-amber-600' : isDone ? 'text-amber-500' : 'text-slate-400'}`}
                >
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-px w-8 mx-1 ${isDone ? 'bg-amber-400' : 'bg-slate-200'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      {/* Step content */}
      {currentStep === 1 && <Step1Studio register={register} errors={errors} />}
      {currentStep === 2 && <Step2Plan register={register} errors={errors} />}
      {currentStep === 3 && <Step3Artist register={register} errors={errors} />}

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Anterior
          </button>
        )}

        {currentStep < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Próximo
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        )}
      </div>

      <p className="text-center text-sm text-slate-500">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
          Entrar
        </Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/components/auth/register-form.tsx
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add multi-step register form with progress indicator"
```

---

## Task 12: Register Page

**Files:**
- Create: `apps/web/src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create register page**

Create `apps/web/src/app/(auth)/register/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Criar Conta — GPower Studio',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add "apps/web/src/app/(auth)/register/page.tsx"
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add register page"
```

---

## Task 13: Sidebar Component

**Files:**
- Create: `apps/web/src/components/layout/sidebar.tsx`

- [ ] **Step 1: Create sidebar**

Create `apps/web/src/components/layout/sidebar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Calendar,
  Users,
  DollarSign,
  Package,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <span className="font-bold text-lg">GPower Studio</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-slate-300 uppercase">
                {user.firstName?.[0] ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/components/layout/sidebar.tsx
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add sidebar with navigation items and user info"
```

---

## Task 14: Header Component

**Files:**
- Create: `apps/web/src/components/layout/header.tsx`

- [ ] **Step 1: Create header**

Create `apps/web/src/components/layout/header.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb placeholder */}
        <div className="text-sm text-slate-500">
          <span className="text-slate-900 font-medium">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-slate-700 font-medium hidden sm:block">
            Olá, {user.firstName}
          </span>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Sair</span>
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/components/layout/header.tsx
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add header with user greeting and logout"
```

---

## Task 15: Mobile Menu Component

**Files:**
- Create: `apps/web/src/components/layout/mobile-menu.tsx`

- [ ] **Step 1: Create mobile menu drawer**

Create `apps/web/src/components/layout/mobile-menu.tsx`:

```tsx
'use client';

import { X } from 'lucide-react';
import { Sidebar } from './sidebar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 md:hidden">
        <div className="relative flex h-full w-64 flex-col">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
          <Sidebar />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/src/components/layout/mobile-menu.tsx
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add mobile menu drawer component"
```

---

## Task 16: Dashboard Layout and Page

**Files:**
- Create: `apps/web/src/app/(dashboard)/layout.tsx`
- Create: `apps/web/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: Create dashboard layout**

Create `apps/web/src/app/(dashboard)/layout.tsx`:

```tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('gpower_access_token');

  if (!token?.value) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
```

- [ ] **Step 2: Create DashboardShell client component**

Create `apps/web/src/components/layout/dashboard-shell.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileMenu } from './mobile-menu';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard home page**

Create `apps/web/src/app/(dashboard)/page.tsx`:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — GPower Studio',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Bem-vindo ao GPower Studio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Agendamentos Hoje', 'Clientes Ativos', 'Receita do Mês', 'Artistas'].map(
          (label) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-2"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">—</p>
            </div>
          ),
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-400 text-sm">
          Mais funcionalidades em breve. Configure seu estúdio para começar.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add "apps/web/src/app/(dashboard)/" apps/web/src/components/layout/dashboard-shell.tsx
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add dashboard layout with sidebar, header, route guard, and home page"
```

---

## Task 17: Tailwind Config and globals.css

**Files:**
- Check/create: `apps/web/tailwind.config.ts`
- Check/create: `apps/web/src/app/globals.css`

- [ ] **Step 1: Ensure Tailwind config exists**

Check if `apps/web/tailwind.config.ts` exists. If not, create it:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Ensure globals.css exists with Tailwind directives**

Check if `apps/web/src/app/globals.css` exists. If not, create it:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Commit if changes made**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add apps/web/tailwind.config.ts apps/web/src/app/globals.css
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "chore: ensure tailwind config and globals.css are present"
```

---

## Task 18: Build Verification

- [ ] **Step 1: Run TypeScript build**

```bash
cd C:\Clientes\gpower_studio\.worktrees\sprint-1
pnpm --filter @gpower/web build
```

Expected: Build succeeds with no TypeScript errors. Output ends with "Compiled successfully" or equivalent.

- [ ] **Step 2: Fix any TypeScript errors**

If errors appear, read them carefully and fix the affected files. Common issues:
- Missing imports
- Type mismatches in form props
- `cookies()` usage requiring `async` in Next.js 14.2

- [ ] **Step 3: Final commit**

```bash
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 add -A
git -C C:\Clientes\gpower_studio\.worktrees\sprint-1 commit -m "feat: add auth UI with onboarding flow, login, and dashboard layout"
```

---

## Self-Review Checklist

### Spec coverage
- [x] `src/lib/api.ts` — Axios with interceptors, 401 refresh, redirect on refresh fail
- [x] `src/lib/auth.ts` — getAccessToken, setTokens, clearTokens, isAuthenticated
- [x] `src/store/auth.store.ts` — user, isLoading, login, logout, register
- [x] Root layout with ReactQuery + Inter font
- [x] `(auth)/layout.tsx` — centered card, gradient, logo
- [x] Login page + LoginForm — email, password toggle, loading, error, link to register
- [x] Register page + 3-step form + progress indicator
- [x] Step1: studio name, city, state
- [x] Step2: 3 plan cards (placeholder)
- [x] Step3: firstName, lastName, email, password, confirmPassword
- [x] Dashboard layout with sidebar + header + route guard
- [x] Sidebar: 6 nav items, logo, user info at bottom
- [x] Header: user name + logout button + mobile menu toggle
- [x] MobileMenu drawer
- [x] Dashboard home placeholder
- [x] Root page redirect
- [x] Zod schemas (loginSchema, registerSchema with refine for confirmPassword)
- [x] All UI text in Portuguese (BR)
- [x] Lucide icons used throughout
- [x] Tailwind CSS classes only (no inline styles)

### Type consistency
- `RegisterFormData` type: used consistently across step components and store
- `LoginFormData`: used in login form and store
- `User` interface: defined once in store, not duplicated
- `DashboardShell` created as client component to host state for mobile menu — layout stays server component for route guard

### No placeholders found in plan code.
