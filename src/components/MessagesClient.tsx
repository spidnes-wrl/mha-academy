'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { ArrowLeft, Send, Search, UserRound, Check, X, RefreshCw } from 'lucide-react';

type Profile={id:string;display_name:string;username:string|null;avatar_url:string|null};
type Chat={id:string;kind:string;name:string|null;other?:Profile;last?:string};
type Message={id:string;body:string;sender_id:string;created_at:string};

export default function MessagesClient(){
 const supabase=createBrowserSupabaseClient();
 const router=useRouter();
 const params=useSearchParams();
 const initialConversation=params.get('conversation')||'';
 const [me,setMe]=useState<Profile|null>(null);
 const [chats,setChats]=useState<Chat[]>([]);
 const [active,setActive]=useState(initialConversation);
 const [messages,setMessages]=useState<Message[]>([]);
 const [draft,setDraft]=useState('');
 const [search,setSearch]=useState('');
 const [results,setResults]=useState<Profile[]>([]);
 const [requests,setRequests]=useState<any[]>([]);
 const [requestProfiles,setRequestProfiles]=useState<Record<string,Profile>>({});
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');

 const load=useCallback(async()=>{
  setLoading(true);setError('');
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){router.push('/auth/login');return;}
  const {data:profile}=await supabase.from('hma_profiles').select('id,display_name,username,avatar_url').eq('user_id',user.id).maybeSingle();
  if(!profile){setError('Profil MHA introuvable.');setLoading(false);return;}
  setMe(profile as Profile);
  const {data:members,error:memberError}=await supabase.from('hma_conversation_members').select('conversation_id').eq('profile_id',profile.id);
  if(memberError){setError(memberError.message);setLoading(false);return;}
  const ids=(members||[]).map((m:any)=>m.conversation_id);
  let chatRows:any[]=[];
  if(ids.length){
   const {data:conversations}=await supabase.from('hma_conversations').select('id,kind,name,created_at').in('id',ids).order('created_at',{ascending:false});
   chatRows=conversations||[];
  }
  const allMembers=ids.length?(await supabase.from('hma_conversation_members').select('conversation_id,profile_id').in('conversation_id',ids)).data||[]:[];
  const otherIds=[...new Set((allMembers as any[]).filter(m=>m.profile_id!==profile.id).map(m=>m.profile_id))];
  const {data:profiles}=otherIds.length?await supabase.from('hma_profiles').select('id,display_name,username,avatar_url').in('id',otherIds):{data:[]};
  const profileMap=new Map((profiles||[]).map((p:any)=>[p.id,p]));
  const chatList:Chat[]=chatRows.map(c=>({...c,other:profileMap.get((allMembers as any[]).find(m=>m.conversation_id===c.id&&m.profile_id!==profile.id)?.profile_id)}));
  setChats(chatList);
  if(!active&&chatList[0])setActive(chatList[0].id);
  const {data:incoming}=await supabase.from('hma_dm_requests').select('id,sender_profile_id,created_at').eq('recipient_profile_id',profile.id).eq('status','pending').order('created_at',{ascending:false});
  const reqs=incoming||[];
  const senderIds=[...new Set(reqs.map((r:any)=>r.sender_profile_id))];
  const {data:senders}=senderIds.length?await supabase.from('hma_profiles').select('id,display_name,username,avatar_url').in('id',senderIds):{data:[]};
  setRequests(reqs);
  setRequestProfiles(Object.fromEntries((senders||[]).map((p:any)=>[p.id,p])));
  setLoading(false);
 },[active,router,supabase]);

 const loadMessages=useCallback(async()=>{
  if(!active||!me)return;
  const {data,error:e}=await supabase.from('hma_messages').select('id,body,sender_id,created_at').eq('conversation_id',active).order('created_at',{ascending:true}).limit(100);
  if(e)setError(e.message);else setMessages((data||[]) as Message[]);
 },[active,me,supabase]);

 useEffect(()=>{void load();},[load]);
 useEffect(()=>{void loadMessages();},[loadMessages]);
 useEffect(()=>{
  const channel=supabase.channel('mha-messages-'+active)
   .on('postgres_changes',{event:'*',schema:'public',table:'hma_messages',filter:active?'conversation_id=eq.'+active:'conversation_id=eq.none'},()=>void loadMessages())
   .on('postgres_changes',{event:'*',schema:'public',table:'hma_dm_requests'},()=>void load())
   .subscribe();
  return()=>{void supabase.removeChannel(channel);};
 },[active,load,loadMessages,supabase]);

 async function findPeople(){
  if(!search.trim())return;
  const term=search.trim().replace(/^@/,'');
  const {data,error:e}=await supabase.from('hma_profiles').select('id,display_name,username,avatar_url').eq('is_active',true).or('username.ilike.'+term+',display_name.ilike.%'+term+'%').limit(8);
  if(e)setError(e.message);else setResults((data||[]).filter((p:Profile)=>p.id!==me?.id) as Profile[]);
 }
 async function requestChat(profile:Profile){
  const {error:e}=await supabase.rpc('hma_request_direct_message',{target_profile:profile.id});
  if(e)setError(e.message);else{setError('Demande envoyée. La personne doit l’accepter avant la conversation.');setResults([]);setSearch('');}
 }
 async function answerRequest(id:string,accept:boolean){
  const {data,error:e}=await supabase.rpc('hma_respond_direct_message_request',{target_request:id,accept_request:accept});
  if(e)setError(e.message);else{await load();if(data)setActive(data);}
 }
 async function send(){
  if(!active||!draft.trim())return;
  const {error:e}=await supabase.rpc('hma_send_message',{p_conv:active,p_body:draft.trim()});
  if(e)setError(e.message);else{setDraft('');await loadMessages();}
 }

 const activeChat=chats.find(c=>c.id===active);
 return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-5 sm:px-6">
  <header className="mb-6 flex items-center gap-3"><Link href="/communaute" className="mha-glass grid h-10 w-10 place-items-center rounded-xl"><ArrowLeft size={18}/></Link><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-400">MHA Academy</p><h1 className="text-2xl font-black">Messages</h1></div><button onClick={()=>void load()} className="mha-glass ml-auto rounded-xl p-3" aria-label="Actualiser"><RefreshCw size={17}/></button></header>
  {error&&<p role="status" className="mha-notification mb-4 rounded-xl p-3 text-sm">{error}</p>}
  <section className="mha-glass mb-5 rounded-2xl p-4">
   <h2 className="mb-3 font-bold">Trouver un membre</h2>
   <div className="flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void findPeople()} placeholder="Nom ou @pseudo" className="input min-w-0 flex-1"/><button onClick={()=>void findPeople()} className="button-primary px-3" aria-label="Rechercher"><Search size={17}/></button></div>
   {results.length>0&&<div className="mt-3 divide-y divide-white/10">{results.map(p=><div key={p.id} className="flex items-center gap-3 py-3"><div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#191919]">{p.avatar_url?<img src={p.avatar_url} alt="" className="h-full w-full object-cover"/>:<UserRound size={16}/>}</div><div className="min-w-0 flex-1"><b className="block truncate text-sm">{p.display_name}</b><small className="text-neutral-500">@{p.username||'membre'}</small></div><button onClick={()=>void requestChat(p)} className="button-secondary px-3 py-2 text-xs">Demander</button></div>)}</div>}
  </section>
  {requests.length>0&&<section className="mha-glass mb-5 rounded-2xl p-4"><h2 className="mb-2 font-bold">Demandes reçues <span className="mha-badge rounded-md px-2 py-1 text-xs">{requests.length}</span></h2>{requests.map(r=>{const p=requestProfiles[r.sender_profile_id];return <div key={r.id} className="flex items-center gap-3 border-t border-white/10 py-3"><div className="min-w-0 flex-1"><b className="block text-sm">{p?.display_name||'Membre MHA'}</b><small className="text-neutral-500">Souhaite démarrer une conversation</small></div><button onClick={()=>void answerRequest(r.id,true)} className="rounded-xl bg-blue-500/15 p-2 text-blue-300" aria-label="Accepter"><Check size={18}/></button><button onClick={()=>void answerRequest(r.id,false)} className="rounded-xl bg-red-500/10 p-2 text-red-300" aria-label="Refuser"><X size={18}/></button></div>})}</section>}
  <div className="grid gap-4 md:grid-cols-[.8fr_1.2fr]">
   <section className="mha-glass rounded-2xl p-3"><h2 className="px-2 py-2 text-sm font-bold">Conversations</h2>{chats.length===0?<p className="p-3 text-sm text-neutral-500">Aucune conversation pour le moment.</p>:chats.map(c=><button key={c.id} onClick={()=>setActive(c.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left ${active===c.id?'bg-blue-500/15 text-blue-200':'hover:bg-white/5'}`}><span className="grid h-9 w-9 place-items-center rounded-full bg-[#202020]"><UserRound size={16}/></span><span className="min-w-0"><b className="block truncate text-sm">{c.name||c.other?.display_name||'Conversation'}</b><small className="text-neutral-500">{c.kind==='direct'?'Privé':'Groupe'}</small></span></button>)}</section>
   <section className="mha-glass flex min-h-[430px] flex-col rounded-2xl p-3"><h2 className="border-b border-white/10 px-2 py-3 text-sm font-bold">{activeChat?.other?.display_name||activeChat?.name||'Choisis une conversation'}</h2><div className="flex-1 space-y-3 overflow-y-auto py-3">{!active?<p className="py-12 text-center text-sm text-neutral-500">Sélectionne une conversation.</p>:messages.map(m=><div key={m.id} className={`flex ${m.sender_id===me?.id?'justify-end':'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.sender_id===me?.id?'bg-[#f4b879] text-black':'bg-[#202020] text-neutral-100'}`}><p className="whitespace-pre-wrap break-words">{m.body}</p><small className={`mt-1 block text-[10px] ${m.sender_id===me?.id?'text-black/60':'text-neutral-500'}`}>{new Date(m.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div></div>)}</div><div className="flex gap-2 border-t border-white/10 pt-3"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&void send()} maxLength={2000} placeholder="Écrire un message…" className="input min-w-0 flex-1 py-3" disabled={!active}/><button onClick={()=>void send()} disabled={!active||!draft.trim()} className="button-primary px-3 disabled:opacity-40" aria-label="Envoyer"><Send size={17}/></button></div></section>
  </div>
  {loading&&<p className="mt-4 text-center text-xs text-neutral-500">Synchronisation avec Supabase…</p>}
 </main>;
}
