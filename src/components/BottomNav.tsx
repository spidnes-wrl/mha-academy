'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Shield, Users, UserRound, Gamepad2 } from 'lucide-react';

const items = [
  { href: '/', label: 'Accueil', Icon: Home },
  { href: '/academie', label: 'Académie', Icon: BookOpen },
  { href: '/jeux', label: 'Jeux', Icon: Gamepad2 },
  { href: '/clans', label: 'Clans', Icon: Shield },
  { href: '/communaute', label: 'Communauté', Icon: Users },
  { href: '/dashboard', label: 'Profil', Icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/auth/')) return null;
  return (
    <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-50 border-t border-neutralBorder/80 bg-neutralBg/95 px-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-2xl grid-cols-6 gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[9px] font-medium transition ${active ? 'bg-primaryGreen/15 text-emerald-300' : 'text-slate-400 hover:text-white'}`}>
            <Icon size={19} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" /><span>{label}</span>
          </Link>;
        })}
      </div>
    </nav>
  );
}