import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-neutralBorder bg-neutralCard/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          MHA Academy
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/dashboard" className="text-slate-300 hover:text-primaryLight">Dashboard</Link>
          <Link href="/admin" className="text-slate-300 hover:text-primaryLight">Admin</Link>
          <Link href="/auth/login" className="button-secondary">Connexion</Link>
        </div>
      </nav>
    </header>
  );
}
