import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MHA Academy',
  description: 'Plateforme académique MHA Academy',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-neutralBg text-white antialiased">{children}</body>
    </html>
  );
}
