import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'MHA Academy',
  description: 'Ton académie, ta communauté et tes défis.',
  applicationName: 'MHA Academy',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MHA Academy' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#102d1f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-neutralBg text-white antialiased">
        <ServiceWorkerRegister />
        <div className="min-h-screen pb-20 md:pb-0">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
