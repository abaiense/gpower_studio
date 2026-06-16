import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GPower Studio',
  description: 'Gestão completa para estúdios de tatuagem e piercing',
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
