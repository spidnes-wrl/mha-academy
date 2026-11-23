import Link from 'next/link';
import { ArrowLeft, Coins, Shield, Gamepad2, BookOpen } from 'lucide-react';
import { requireAuthenticatedUser } from '@/lib/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  let coins = 0; let signedIn = true;
  try {
    const user = await requireAuthenticatedUser(); const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('hma_profiles').select('virtual_coins').eq('user_id', user.id).single();
    coins = Number(data?.virtual_coins ?? 0);
  } catch { signedIn = false; }
  return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-10 pt-5 sm:px-6">
    <header className="mb-7 flex items-center gap-3"><Link href="/" aria-label="Retour" className="grid h-10 w-10 place-items-center rounded-xl border border-neutralBorder bg-neutralCard"><ArrowLeft size={18}/></Link><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">MHA Academy</p><h1 className="text-xl font-bold">Mon espace</h1></div></header>
    <section className="mha-glass relative overflow-hidden rounded-3xl p-6"><span className="mha-sticker">PLAYER PROFILE</span><h2 className="mt-4 text-2xl font-black">{signedIn ? 'Bienvenue dans ton espace.' : 'Ton aventure commence ici.'}</h2><p className="mt-2 text-sm text-neutral-400">{signedIn ? 'Retrouve ta progression et tes ressources.' : 'Connecte-toi pour accéder à ton profil et à ta progression.'}</p>
      {signedIn ? <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#f4b879]/25 bg-[#f4b879]/10 px-4 py-3 text-sm font-bold text-[#f4b879]"><Coins size={18}/> {coins} pièces virtuelles</div> : <Link href="/auth/login" className="button-primary mt-5 inline-flex">Se connecter</Link>}
    </section>
    <div className="mt-5 grid grid-cols-2 gap-3">{[{href:'/academie',label:'Académie',Icon:BookOpen},{href:'/clans',label:'Mes clans',Icon:Shield},{href:'/jeux',label:'Espace jeux',Icon:Gamepad2}].map(({href,label,Icon})=><Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-neutralBorder bg-neutralCard p-4 text-sm font-semibold transition hover:border-[#f4b879]/50"><Icon size={19} className="text-blue-300"/>{label}</Link>)}</div>
  </main>;
}
