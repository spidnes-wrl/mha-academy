import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'MHA Academy',
  description: 'Plateforme académique MHA Academy',
  applicationName: 'MHA Academy',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MHA Academy' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-neutralBg text-white antialiased">
        <div className="min-h-screen pb-20 md:pb-0">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
