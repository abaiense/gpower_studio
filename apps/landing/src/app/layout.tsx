import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GPower Studio — Plataforma para Estúdios',
  description: 'A melhor plataforma de gestão para estúdios de tatuagem e piercing do Brasil',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
