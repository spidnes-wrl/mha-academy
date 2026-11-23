'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { ImagePlus, MessageCircle, Heart, Send, UserRound, Mail, RefreshCw } from 'lucide-react';

type Profile = { id: string; display_name: string; username: string | null; avatar_url: string | null; class_rank: string };
type Post = { id: string; body: string; image_url: string | null; created_at: string; author_profile_id: string; author?: Profile; likes?: number; liked?: boolean; comments?: { id: string; body: string; created_at: string; author_profile_id: string; author?: Profile }[] };

export default function CommunityClient() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.push('/auth/login'); return; }
    const { data: profile } = await supabase.from('hma_profiles').select('id,display_name,username,avatar_url,class_rank').eq('user_id', auth.user.id).maybeSingle();
    if (!profile) { setError('Profil MHA introuvable. Termine d’abord ton inscription.'); setLoading(false); return; }
    setMe(profile as Profile);
    const { data: rows, error: postError } = await supabase.from('hma_posts').select('id,body,image_url,created_at,author_profile_id').eq('is_published', true).order('created_at', { ascending: false }).limit(40);
    if (postError) { setError(postError.message); setLoading(false); return; }
    const list = (rows || []) as Post[];
    const authorIds = Array.from(new Set(list.map(p => p.author_profile_id)));
    const postIds = list.map(p => p.id);
    const [{ data: authors }, { data: likes }, { data: comments }] = await Promise.all([
      authorIds.length ? supabase.from('hma_profiles').select('id,display_name,username,avatar_url,class_rank').in('id', authorIds) : Promise.resolve({data:[]}),
      postIds.length ? supabase.from('hma_post_likes').select('post_id,profile_id').in('post_id', postIds) : Promise.resolve({data:[]}),
      postIds.length ? supabase.from('hma_post_comments').select('id,post_id,body,created_at,author_profile_id').in('post_id', postIds).order('created_at', {ascending:true}) : Promise.resolve({data:[]})
    ]);
    const commentAuthors = Array.from(new Set((comments || []).map((c:any) => c.author_profile_id)));
    const { data: commentProfiles } = commentAuthors.length ? await supabase.from('hma_profiles').select('id,display_name,username,avatar_url,class_rank').in('id', commentAuthors) : {data:[]};
    const byId = new Map((authors || []).map((p:any) => [p.id,p]));
    const commentById = new Map((commentProfiles || []).map((p:any) => [p.id,p]));
    setPosts(list.map(p => ({
      ...p,
      author: byId.get(p.author_profile_id),
      likes: (likes || []).filter((l:any) => l.post_id === p.id).length,
      liked: (likes || []).some((l:any) => l.post_id === p.id && l.profile_id === profile.id),
      comments: (comments || []).filter((c:any) => c.post_id === p.id).map((c:any) => ({...c, author: commentById.get(c.author_profile_id)}))
    })));
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const channel = supabase.channel('mha-community-feed')
      .on('postgres_changes', {event:'*',schema:'public',table:'hma_posts'}, () => void load())
      .on('postgres_changes', {event:'*',schema:'public',table:'hma_post_comments'}, () => void load())
      .on('postgres_changes', {event:'*',schema:'public',table:'hma_post_likes'}, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load, supabase]);

  async function publish() {
    if (!me || (!body.trim() && !imageUrl.trim())) return;
    setPosting(true); setError('');
    const { error: e } = await supabase.from('hma_posts').insert({ author_profile_id: me.id, body: body.trim(), image_url: imageUrl.trim() || null });
    if (e) setError(e.message); else { setBody(''); setImageUrl(''); await load(); }
    setPosting(false);
  }
  async function toggleLike(post: Post) {
    if (!me) return;
    const result = post.liked
      ? await supabase.from('hma_post_likes').delete().eq('post_id',post.id).eq('profile_id',me.id)
      : await supabase.from('hma_post_likes').insert({post_id:post.id,profile_id:me.id});
    if (result.error) setError(result.error.message); else await load();
  }
  async function addComment(postId: string) {
    if (!me || !commentDrafts[postId]?.trim()) return;
    const { error: e } = await supabase.from('hma_post_comments').insert({post_id:postId,author_profile_id:me.id,body:commentDrafts[postId].trim()});
    if (e) setError(e.message); else { setCommentDrafts(v=>({...v,[postId]:''})); await load(); }
  }

  return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-5 sm:px-6">
    <header className="mb-6 flex items-center justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-400">MHA Academy / Social</p><h1 className="mt-1 text-2xl font-black">Communauté</h1><p className="mt-1 text-sm text-neutral-400">Les nouvelles de ton académie.</p></div>
      <button onClick={() => void load()} aria-label="Actualiser" className="mha-glass rounded-xl p-3 text-white"><RefreshCw size={18}/></button>
    </header>
    <div className="mb-5 grid grid-cols-2 gap-3">
      <Link href="/messages" className="mha-glass flex items-center gap-3 rounded-2xl p-4"><span className="mha-badge grid h-10 w-10 place-items-center rounded-xl"><Mail size={19}/></span><span><b className="block text-sm">Messages</b><small className="text-neutral-400">Discussions privées</small></span></Link>
      <Link href="/clans" className="mha-glass flex items-center gap-3 rounded-2xl p-4"><span className="mha-badge grid h-10 w-10 place-items-center rounded-xl"><UserRound size={19}/></span><span><b className="block text-sm">Clans</b><small className="text-neutral-400">Tes équipes</small></span></Link>
    </div>
    {error && <p role="alert" className="mha-warning mb-4 rounded-xl p-3 text-sm">{error}</p>}
    <section className="mha-glass mb-6 rounded-3xl p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#171717] text-blue-300">{me?.avatar_url ? <img src={me.avatar_url} alt="" className="h-full w-full rounded-full object-cover"/> : <UserRound size={18}/>}</div><div><b className="text-sm">{me?.display_name || 'Ton profil'}</b><p className="text-xs text-neutral-500">Partager avec la communauté</p></div></div>
      <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={3000} placeholder="Quoi de neuf à l’académie ?" className="input min-h-28 resize-y bg-[#050505]"/>
      <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="Lien d’image (facultatif)" className="input mt-3 bg-[#050505]"/>
      <div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-2 text-xs text-neutral-500"><ImagePlus size={15}/> Texte + image uniquement</span><button onClick={()=>void publish()} disabled={posting || (!body.trim() && !imageUrl.trim())} className="button-primary inline-flex items-center gap-2 disabled:opacity-40"><Send size={15}/>{posting?'Publication…':'Publier'}</button></div>
    </section>
    <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Fil d’actualité</h2><span className="text-xs text-neutral-500">{posts.length} publications</span></div>
    {loading ? <div className="mha-glass rounded-2xl p-6 text-center text-sm text-neutral-400">Chargement du fil…</div> : posts.length === 0 ? <div className="mha-glass rounded-2xl p-8 text-center"><p className="font-semibold">Le fil est encore calme.</p><p className="mt-1 text-sm text-neutral-400">Sois le premier à partager quelque chose.</p></div> : <div className="space-y-4">{posts.map(post=><article key={post.id} className="mha-glass rounded-3xl p-4 sm:p-5">
      <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#191919] text-blue-300">{post.author?.avatar_url?<img src={post.author.avatar_url} alt="" className="h-full w-full object-cover"/>:<UserRound size={18}/>}</div><div className="min-w-0 flex-1"><b className="block truncate text-sm">{post.author?.display_name || 'Membre MHA'}</b><span className="text-xs text-neutral-500">{post.author?.username ? '@'+post.author.username+' · ' : ''}{new Date(post.created_at).toLocaleString('fr-FR')}</span></div><span className="mha-badge rounded-lg px-2 py-1 text-[10px] font-bold">{post.author?.class_rank || 'MHA'}</span></div>
      {post.body && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-200">{post.body}</p>}
      {post.image_url && <img src={post.image_url} alt="Image publiée dans la communauté" className="mt-4 max-h-[420px] w-full rounded-2xl border border-white/10 object-cover"/>}
      <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3"><button onClick={()=>void toggleLike(post)} className={`inline-flex items-center gap-2 text-sm ${post.liked?'text-rose-400':'text-neutral-400'}`}><Heart size={17} fill={post.liked?'currentColor':'none'}/>{post.likes || 0}</button><span className="inline-flex items-center gap-2 text-sm text-neutral-400"><MessageCircle size={17}/>{post.comments?.length || 0}</span></div>
      <div className="mt-3 space-y-2">{post.comments?.map(c=><div key={c.id} className="rounded-xl bg-black/40 px-3 py-2"><b className="mr-2 text-xs text-blue-300">{c.author?.display_name || 'Membre'}</b><span className="text-sm text-neutral-300">{c.body}</span></div>)}</div>
      <div className="mt-3 flex gap-2"><input value={commentDrafts[post.id] || ''} onChange={e=>setCommentDrafts(v=>({...v,[post.id]:e.target.value}))} maxLength={1200} placeholder="Écrire un commentaire…" className="input min-w-0 flex-1 py-2.5"/><button onClick={()=>void addComment(post.id)} className="button-secondary px-3" aria-label="Envoyer le commentaire"><Send size={16}/></button></div>
    </article>)}</div>}
  </main>;
}
