'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { ImagePlus, MessageCircle, Heart, Send, UserRound, Mail, RefreshCw, Search, Users } from 'lucide-react';
import { AvatarFrame, Banner, ChibiSticker, GlassSurface } from '@/components/ui/AcademyUI';

type Profile = { id: string; display_name: string; username: string | null; avatar_url: string | null; class_rank: string };
type Post = { id: string; body: string; image_url: string | null; created_at: string; author_profile_id: string; author?: Profile; likes?: number; liked?: boolean; comments?: { id: string; body: string; created_at: string; author_profile_id: string; author?: Profile }[] };

export default function CommunityClient() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [search, setSearch] = useState('');
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

  const visiblePosts = useMemo(() => posts.filter(post => !search.trim() || post.body.toLowerCase().includes(search.toLowerCase()) || post.author?.display_name?.toLowerCase().includes(search.toLowerCase()) || post.author?.username?.toLowerCase().includes(search.toLowerCase())), [posts, search]);

  return <main className="mha-page">
    <header className="mb-5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3" aria-label="MHA Academy, accueil">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#1B2437] bg-[#0A0D14] text-lg font-bold text-[#BFD2FF]">M</span>
        <span><span className="block text-sm font-bold tracking-wide">MHA ACADEMY</span><span className="text-xs text-[#9AA7C2]">Ton univers, ta communauté</span></span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/messages" aria-label="Messages" className="grid h-11 w-11 place-items-center rounded-xl border border-[#1B2437] bg-[#0A0D14] text-[#BFD2FF]"><Mail size={20} strokeWidth={1.6}/></Link>
        <button onClick={() => void load()} aria-label="Actualiser le fil" className="grid h-11 w-11 place-items-center rounded-xl border border-[#1B2437] bg-[#0A0D14] text-[#9AA7C2]"><RefreshCw size={19} strokeWidth={1.6}/></button>
      </div>
    </header>

    <Banner className="mb-12 min-h-[190px]">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#BFD2FF]">MHA • Communauté</p>
      <h1 className="mt-3 max-w-xs text-2xl font-bold leading-tight sm:text-3xl">Les nouvelles de ton académie.</h1>
      <p className="mt-2 max-w-xs text-sm text-[#BFD2FF]">Partage, découvre et reste connecté.</p>
      <ChibiSticker label="MHA" />
      <GlassSurface className="absolute -bottom-7 left-4 right-4 rounded-2xl p-2 sm:left-6 sm:right-6">
        <div className="flex items-center gap-2 px-2">
          <Search size={19} className="shrink-0 text-[#BFD2FF]" strokeWidth={1.6}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Rechercher dans les publications" placeholder="Rechercher une publication…" className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9AA7C2]"/>
        </div>
      </GlassSurface>
    </Banner>

    {error && <p role="alert" className="mha-warning mb-4 rounded-xl p-3 text-sm">{error}</p>}

    <section className="mb-5 rounded-[20px] border border-[#1B2437] bg-[#0A0D14] p-4">
      <div className="mb-3 flex items-center gap-3">
        <AvatarFrame src={me?.avatar_url} name={me?.display_name || 'M'} size="h-10 w-10"/>
        <div><b className="text-sm">{me?.display_name || 'Ton profil'}</b><p className="text-xs text-[#9AA7C2]">Share news...</p></div>
      </div>
      <textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={3000} placeholder="Quoi de neuf à l’académie ?" className="input min-h-24 resize-y"/>
      <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="Lien d’image (facultatif)" className="input mt-3"/>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs text-[#9AA7C2]"><ImagePlus size={16}/> Texte + image uniquement</span>
        <button onClick={()=>void publish()} disabled={posting || (!body.trim() && !imageUrl.trim())} className="glass-surface glass-fallback inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-40"><Send size={16}/>{posting?'Publication…':'Publish'}</button>
      </div>
    </section>

    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Filtres du fil">
      <span className="rounded-full border border-blue-500 bg-blue-600 px-4 py-2 text-xs font-semibold text-white">All</span>
      <span title="Les catégories ne sont pas enregistrées dans les publications actuelles" className="rounded-full border border-[#1B2437] bg-[#0A0D14] px-4 py-2 text-xs text-[#9AA7C2]">Announcements</span>
      <span title="Les catégories ne sont pas enregistrées dans les publications actuelles" className="rounded-full border border-[#1B2437] bg-[#0A0D14] px-4 py-2 text-xs text-[#9AA7C2]">News</span>
      <span title="Les catégories ne sont pas enregistrées dans les publications actuelles" className="rounded-full border border-[#1B2437] bg-[#0A0D14] px-4 py-2 text-xs text-[#9AA7C2]">Events</span>
    </div>

    <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Fil d’actualité</h2><span className="text-xs text-[#9AA7C2]">{visiblePosts.length} publications</span></div>
    {loading ? <div className="card p-6 text-center text-sm text-[#9AA7C2]">Chargement du fil…</div> : visiblePosts.length === 0 ? <div className="card p-8 text-center"><p className="font-semibold">{search ? 'Aucun résultat.' : 'Le fil est encore calme.'}</p><p className="mt-1 text-sm text-[#9AA7C2]">{search ? 'Essaie un autre mot-clé.' : 'Sois le premier à partager quelque chose.'}</p></div> : <div className="space-y-4">{visiblePosts.map(post=><article key={post.id} className="card p-4 sm:p-5">
      <div className="flex items-center gap-3"><AvatarFrame src={post.author?.avatar_url} name={post.author?.display_name || 'M'} size="h-10 w-10"/><div className="min-w-0 flex-1"><b className="block truncate text-sm">{post.author?.display_name || 'Membre MHA'}</b><span className="text-xs text-[#9AA7C2]">{post.author?.username ? '@'+post.author.username+' · ' : ''}{new Date(post.created_at).toLocaleString('fr-FR')}</span></div><span className="mha-badge rounded-lg px-2 py-1 text-[10px] font-bold">{post.author?.class_rank || 'MHA'}</span></div>
      {post.body && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">{post.body}</p>}
      {post.image_url && <img src={post.image_url} alt="Image publiée dans la communauté" className="mt-4 max-h-[420px] w-full rounded-2xl border border-[#1B2437] object-cover"/>}
      <div className="mt-4 flex items-center gap-5 border-t border-[#1B2437] pt-3"><button onClick={()=>void toggleLike(post)} aria-label={post.liked?'Retirer le like':'Aimer la publication'} className={`inline-flex min-h-11 items-center gap-2 text-sm ${post.liked?'text-blue-300':'text-[#9AA7C2]'}`}><Heart size={18} strokeWidth={1.6} fill={post.liked?'currentColor':'none'}/>{post.likes || 0}</button><span className="inline-flex items-center gap-2 text-sm text-[#9AA7C2]"><MessageCircle size={18} strokeWidth={1.6}/>{post.comments?.length || 0}</span></div>
      <div className="mt-3 space-y-2">{post.comments?.map(c=><div key={c.id} className="rounded-xl bg-black px-3 py-2"><b className="mr-2 text-xs text-[#BFD2FF]">{c.author?.display_name || 'Membre'}</b><span className="text-sm text-slate-300">{c.body}</span></div>)}</div>
      <div className="mt-3 flex gap-2"><input value={commentDrafts[post.id] || ''} onChange={e=>setCommentDrafts(v=>({...v,[post.id]:e.target.value}))} maxLength={1200} placeholder="Écrire un commentaire…" className="input min-w-0 flex-1 py-2.5"/><button onClick={()=>void addComment(post.id)} className="button-secondary px-3" aria-label="Envoyer le commentaire"><Send size={17} strokeWidth={1.6}/></button></div>
    </article>)}</div>}
    <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[#9AA7C2]"><Link href="/clans" className="inline-flex items-center gap-2"><Users size={15}/> Clans</Link><Link href="/messages" className="inline-flex items-center gap-2"><MessageCircle size={15}/> Messages</Link></div>
  </main>;
}
