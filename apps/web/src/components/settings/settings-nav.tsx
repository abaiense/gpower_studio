'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/configuracoes', label: 'Geral' },
  { href: '/configuracoes/deposito', label: 'Depósito' },
  { href: '/configuracoes/comunicacao', label: 'Comunicação' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-slate-200 mb-6">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive =
          href === '/configuracoes' ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
