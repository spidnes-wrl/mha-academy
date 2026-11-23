'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, BookOpen, ShoppingBag, UserRound } from 'lucide-react';

const items = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/missions', label: 'Missions', Icon: Target },
  { href: '/bibliotheque', label: 'Library', Icon: BookOpen },
  { href: '/boutique', label: 'Shop', Icon: ShoppingBag },
  { href: '/dashboard', label: 'Profile', Icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/auth/')) return null;
  return <>
    <nav aria-label="Navigation principale" className="mha-tabbar fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),.65rem)] z-50 rounded-2xl px-2 py-2 md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition ${active ? 'bg-blue-600/20 text-[#BFD2FF]' : 'text-[#9AA7C2] hover:text-white'}`}>
            <Icon size={22} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />
            <span>{label}</span>
          </Link>;
        })}
      </div>
    </nav>
    <aside aria-label="Navigation principale" className="mha-tabbar fixed bottom-4 left-4 top-4 z-50 hidden w-[76px] flex-col items-center rounded-2xl py-4 md:flex">
      <Link href="/" aria-label="MHA Academy, accueil" className="mb-7 grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white">M</Link>
      <div className="flex w-full flex-1 flex-col items-center gap-3">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} aria-label={label} aria-current={active ? 'page' : undefined} className={`grid h-12 w-12 place-items-center rounded-xl transition ${active ? 'bg-blue-600/25 text-[#BFD2FF]' : 'text-[#9AA7C2] hover:bg-white/5 hover:text-white'}`}>
            <Icon size={24} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </Link>;
        })}
      </div>
    </aside>
  </>;
}
