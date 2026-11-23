'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X, Save } from 'lucide-react';

export default function ProfileEditor({ firstName = '', lastName = '', bio = '', avatarUrl = '' }: { firstName?: string; lastName?: string; bio?: string; avatarUrl?: string }) {
  const [open,setOpen] = useState(false);
  const [first,setFirst] = useState(firstName);
  const [last,setLast] = useState(lastName);
  const [about,setAbout] = useState(bio);
  const [avatar,setAvatar] = useState(avatarUrl);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const router = useRouter();
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const response = await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({first_name:first,last_name:last,bio:about,avatar_url:avatar})});
    const result = await response.json();
    if(!response.ok){setError(result.error || 'Impossible de sauvegarder.');setBusy(false);return;}
    setBusy(false);setOpen(false);router.refresh();
  }
  return <>
    <button type="button" onClick={()=>setOpen(true)} className="button-secondary inline-flex items-center gap-2"><Pencil size={16}/> Edit profile</button>
    {open && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-3 sm:items-center" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-editor-title" className="w-full max-w-md rounded-3xl border border-[#1B2437] bg-[#0A0D14] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h2 id="profile-editor-title" className="text-lg font-bold">Modifier le profil</h2><button type="button" onClick={()=>setOpen(false)} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-xl border border-[#1B2437]"><X size={18}/></button></div>
        <form onSubmit={save} className="space-y-3">
          <label className="block text-xs font-semibold text-[#BFD2FF]">Prénom<input value={first} onChange={e=>setFirst(e.target.value)} maxLength={60} className="input mt-1"/></label>
          <label className="block text-xs font-semibold text-[#BFD2FF]">Nom<input value={last} onChange={e=>setLast(e.target.value)} maxLength={60} className="input mt-1"/></label>
          <label className="block text-xs font-semibold text-[#BFD2FF]">Bio<textarea value={about} onChange={e=>setAbout(e.target.value)} maxLength={300} rows={3} className="input mt-1"/></label>
          <label className="block text-xs font-semibold text-[#BFD2FF]">URL de l’avatar<input value={avatar} onChange={e=>setAvatar(e.target.value)} maxLength={500} type="url" className="input mt-1" placeholder="https://…"/></label>
          {error && <p role="alert" className="text-sm text-[#BFD2FF]">{error}</p>}
          <button disabled={busy} className="button-primary w-full"><Save size={16}/>{busy?'Enregistrement…':'Enregistrer'}</button>
        </form>
      </section>
    </div>}
  </>;
}
