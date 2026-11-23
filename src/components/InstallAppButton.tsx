'use client';
import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }> };
export default function InstallAppButton({ show = true }: { show?: boolean }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    const onPrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  async function install() {
    if (!installPrompt) { setShowHelp(true); return; }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  }
  if (!show) return null;
  if (installed) return <p className="flex items-center gap-2 text-sm text-emerald-300"><Smartphone size={17} /> MHA Academy est installé sur cet appareil.</p>;
  return <div className="space-y-3">
    <button type="button" onClick={install} className="button-primary inline-flex w-full items-center justify-center gap-2"><Download size={18} /> Installer MHA Academy</button>
    {showHelp && <div role="status" className="rounded-xl border border-neutralBorder bg-slate-950/60 p-4 text-sm text-slate-300">
      <p className="font-semibold text-white">Installation manuelle</p>
      <p className="mt-1">Sur Android, ouvre le menu ⋮ du navigateur puis « Installer l'application » ou « Ajouter à l'écran d'accueil ».</p>
      <p className="mt-1">Sur iPhone, ouvre le menu de partage puis « Sur l'écran d'accueil ».</p>
    </div>}
  </div>;
}