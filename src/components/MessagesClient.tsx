'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { ArrowLeft, Send, Search, UserRound, RefreshCw } from 'lucide-react';

type Profile = {
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};
type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  created_at: string;
};
type Contact = Profile & { lastMessage?: string; lastAt?: string };

const fullName = (p?: Profile | null) =>
  [p?.first_name, p?.last_name].filter(Boolean).join(' ') || p?.username || 'Membre MHA';

export default function MessagesClient() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [myId, setMyId] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [active, setActive] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    setMyId(user.id);

    const { data: rows, error: rowsError } = await supabase
      .from('hma_messages')
      .select('id,sender_id,receiver_id,content,message_type,created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(200);

    if (rowsError) {
      setError(rowsError.message);
      setLoading(false);
      return;
    }

    const list = (rows || []) as Message[];
    const otherIds = Array.from(new Set(list.map(m => m.sender_id === user.id ? m.receiver_id : m.sender_id)));
    const { data: profiles, error: profileError } = otherIds.length
      ? await supabase.from('hma_profiles').select('user_id,username,first_name,last_name,avatar_url').in('user_id', otherIds)
      : { data: [], error: null };

    if (profileError) setError(profileError.message);
    const profileMap = new Map((profiles || []).map(p => [p.user_id, p as Profile]));
    const lastByContact = new Map<string, Message>();
    list.forEach(message => {
      const otherId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
      if (!lastByContact.has(otherId)) lastByContact.set(otherId, message);
    });
    const nextContacts = Array.from(lastByContact.entries())
      .map(([id, last]) => ({
        ...(profileMap.get(id) || { user_id: id, username: null, first_name: null, last_name: null, avatar_url: null }),
        lastMessage: last.content,
        lastAt: last.created_at,
      }))
      .sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));

    setContacts(nextContacts);
    setActive(current => current && nextContacts.some(c => c.user_id === current) ? current : (nextContacts[0]?.user_id || ''));
    setLoading(false);
  }, [router, supabase]);

  const loadMessages = useCallback(async () => {
    if (!myId || !active) {
      setMessages([]);
      return;
    }
    const { data, error: queryError } = await supabase
      .from('hma_messages')
      .select('id,sender_id,receiver_id,content,message_type,created_at')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${active}),and(sender_id.eq.${active},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true })
      .limit(200);
    if (queryError) setError(queryError.message);
    else setMessages((data || []) as Message[]);
  }, [active, myId, supabase]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void loadMessages(); }, [loadMessages]);
  useEffect(() => {
    if (!myId || !active) return;
    const channel = supabase.channel(`mha-direct-${myId}-${active}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hma_messages' }, payload => {
        const message = payload.new as Message;
        if ((message.sender_id === myId && message.receiver_id === active) ||
            (message.sender_id === active && message.receiver_id === myId)) {
          void loadMessages();
          void load();
        }
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [active, load, loadMessages, myId, supabase]);

  async function findPeople() {
    const term = search.trim().replace(/^@/, '').replace(/[,%()]/g, '');
    if (!term) return;
    const { data, error: queryError } = await supabase
      .from('hma_profiles')
      .select('user_id,username,first_name,last_name,avatar_url')
      .eq('is_active', true)
      .or(`username.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
      .limit(10);
    if (queryError) setError(queryError.message);
    else setResults(((data || []) as Profile[]).filter(p => p.user_id !== myId));
  }

  async function send() {
    if (!myId || !active || !draft.trim() || sending) return;
    setSending(true);
    setError('');
    const { error: insertError } = await supabase.from('hma_messages').insert({
      sender_id: myId,
      receiver_id: active,
      content: draft.trim(),
      message_type: 'text',
    });
    if (insertError) setError(insertError.message);
    else {
      setDraft('');
      await Promise.all([loadMessages(), load()]);
    }
    setSending(false);
  }

  const activeContact = useMemo(() => contacts.find(c => c.user_id === active), [active, contacts]);

  return <main className="mha-page">
    <header className="mb-6 flex items-center gap-3">
      <Link href="/" aria-label="Retour à l'accueil" className="mha-glass grid h-11 w-11 place-items-center rounded-xl"><ArrowLeft size={19}/></Link>
      <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#BFD2FF]">MHA Academy</p><h1 className="text-2xl font-bold">Messages</h1></div>
      <button type="button" onClick={() => void load()} className="mha-glass grid h-11 w-11 place-items-center rounded-xl" aria-label="Actualiser les messages"><RefreshCw size={18}/></button>
    </header>

    {error && <p role="alert" className="mha-warning mb-4 rounded-xl p-3 text-sm">{error}</p>}

    <section className="card mb-5">
      <h2 className="mb-3 font-bold">Trouver un membre</h2>
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && void findPeople()} placeholder="Nom ou @pseudo" aria-label="Rechercher un membre" className="input min-w-0 flex-1"/>
        <button type="button" onClick={() => void findPeople()} className="button-primary px-3" aria-label="Rechercher"><Search size={18}/></button>
      </div>
      {results.length > 0 && <div className="mt-3 divide-y divide-[#1B2437]">{results.map(p => <div key={p.user_id} className="flex items-center gap-3 py-3">
        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#111827]">{p.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover"/> : <UserRound size={17}/>}</span>
        <div className="min-w-0 flex-1"><b className="block truncate text-sm">{fullName(p)}</b><small className="text-[#9AA7C2]">@{p.username || 'membre'}</small></div>
        <button type="button" onClick={() => { setContacts(current => current.some(c => c.user_id === p.user_id) ? current : [p, ...current]); setActive(p.user_id); setResults([]); setSearch(''); }} className="button-secondary px-3 text-xs">Ouvrir</button>
      </div>)}</div>}
    </section>

    <div className="grid gap-4 md:grid-cols-[.8fr_1.2fr]">
      <section className="card p-3">
        <h2 className="px-2 py-2 text-sm font-bold">Conversations</h2>
        {contacts.length === 0 ? <p className="p-3 text-sm text-[#9AA7C2]">Aucune conversation pour le moment. Recherche un membre pour commencer.</p> :
          contacts.map(c => <button type="button" key={c.user_id} onClick={() => setActive(c.user_id)} className={`mb-1 flex min-h-12 w-full items-center gap-3 rounded-xl p-3 text-left ${active === c.user_id ? 'bg-blue-600/20 text-[#BFD2FF]' : 'hover:bg-white/5'}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#111827]">{c.avatar_url ? <img src={c.avatar_url} alt="" className="h-full w-full object-cover"/> : <UserRound size={17}/>}</span>
            <span className="min-w-0"><b className="block truncate text-sm">{fullName(c)}</b><small className="block truncate text-[#9AA7C2]">{c.lastMessage || 'Nouvelle conversation'}</small></span>
          </button>)}
      </section>

      <section className="card flex min-h-[430px] flex-col p-3">
        <h2 className="border-b border-[#1B2437] px-2 py-3 text-sm font-bold">{activeContact ? fullName(activeContact) : 'Choisis un membre'}</h2>
        <div className="flex-1 space-y-3 overflow-y-auto py-3">
          {!active ? <p className="py-12 text-center text-sm text-[#9AA7C2]">Recherche un membre pour commencer une conversation.</p> :
            messages.map(m => <div key={m.id} className={`flex ${m.sender_id === myId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.sender_id === myId ? 'bg-blue-600 text-white' : 'bg-[#111827] text-slate-100'}`}>
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <small className="mt-1 block text-[10px] opacity-70">{new Date(m.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}</small>
              </div>
            </div>)}
        </div>
        <div className="flex gap-2 border-t border-[#1B2437] pt-3">
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && void send()} maxLength={2000} placeholder="Écrire un message…" aria-label="Écrire un message" className="input min-w-0 flex-1 py-3" disabled={!active}/>
          <button type="button" onClick={() => void send()} disabled={!active || !draft.trim() || sending} className="button-primary px-3 disabled:opacity-40" aria-label="Envoyer le message"><Send size={18}/></button>
        </div>
      </section>
    </div>
    {loading && <p className="mt-4 text-center text-xs text-[#9AA7C2]">Synchronisation avec Supabase…</p>}
  </main>;
}
