'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { CalendarDays, Heart, Mail, MessageCircle, RefreshCw, Search, Send, Users } from 'lucide-react';
import { AvatarFrame, Banner, ChibiSticker, GlassSurface } from '@/components/ui/AcademyUI';

type Profile = { user_id: string; first_name: string | null; last_name: string | null; username: string | null; avatar_url: string | null; class_rank: string };
type Clan = { id: string; name: string; slug: string };
type Comment = { id: string; post_id: string; user_id: string; content: string; created_at: string; author?: Profile };
type ClanPost = { id: string; clan_id: string; author_id: string; caption: string; image_url: string | null; created_at: string; author?: Profile; clan?: Clan; likes: number; liked: boolean; comments: Comment[] };
type EventItem = { id: string; title: string; description: string | null; event_date: string; banner_url: string | null; created_at: string };

const displayName = (p?: Profile | null) =>
  [p?.first_name, p?.last_name].filter(Boolean).join(' ') || p?.username || 'Membre MHA';

export default function CommunityClient() {
  const supabase = createBrowserSupabaseClient();
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);
  const [myId, setMyId] = useState('');
  const [posts, setPosts] = useState<ClanPost[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [leaderClan, setLeaderClan] = useState<Clan | null>(null);
  const [followedClans, setFollowedClans] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'posts' | 'events'>('all');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
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

    const [{ data: profile, error: profileError }, { data: postRows, error: postError }, { data: eventRows, error: eventError }, { data: memberships }, { data: follows }] = await Promise.all([
      supabase.from('hma_profiles').select('user_id,first_name,last_name,username,avatar_url,class_rank').eq('user_id', user.id).maybeSingle(),
      supabase.from('hma_clan_posts').select('id,clan_id,author_id,caption,image_url,created_at').order('created_at', { ascending: false }).limit(40),
      supabase.from('hma_events').select('id,title,description,event_date,banner_url,created_at').eq('status', 'published').order('event_date', { ascending: true }).limit(20),
      supabase.from('hma_clan_members').select('clan_id').eq('user_id', user.id).eq('membership_status', 'active').eq('member_role', 'leader').limit(1),
      supabase.from('hma_clan_follows').select('clan_id').eq('user_id', user.id),
    ]);

    if (profileError) setError(profileError.message);
    if (postError) setError(postError.message);
    if (eventError) setError(eventError.message);
    if (profile) setMe(profile as Profile);
    setEvents((eventRows || []) as EventItem[]);
    setFollowedClans((follows || []).map(f => f.clan_id));

    const leaderClanId = memberships?.[0]?.clan_id;
    if (leaderClanId) {
      const { data: clan } = await supabase.from('hma_clans').select('id,name,slug').eq('id', leaderClanId).maybeSingle();
      setLeaderClan((clan as Clan) || null);
    } else {
      setLeaderClan(null);
    }

    const list = (postRows || []) as Omit<ClanPost, 'likes' | 'liked' | 'comments'>[];
    const authorIds = Array.from(new Set(list.map(p => p.author_id)));
    const clanIds = Array.from(new Set(list.map(p => p.clan_id)));
    const postIds = list.map(p => p.id);
    const [{ data: authors }, { data: clans }, { data: likes }, { data: comments }] = await Promise.all([
      authorIds.length ? supabase.from('hma_profiles').select('user_id,first_name,last_name,username,avatar_url,class_rank').in('user_id', authorIds) : Promise.resolve({ data: [] }),
      clanIds.length ? supabase.from('hma_clans').select('id,name,slug').in('id', clanIds) : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from('hma_clan_post_likes').select('post_id,user_id').in('post_id', postIds) : Promise.resolve({ data: [] }),
      postIds.length ? supabase.from('hma_clan_post_comments').select('id,post_id,user_id,content,created_at').in('post_id', postIds).order('created_at', { ascending: true }) : Promise.resolve({ data: [] }),
    ]);
    const commentUserIds = Array.from(new Set((comments || []).map(c => c.user_id)));
    const { data: commentAuthors } = commentUserIds.length
      ? await supabase.from('hma_profiles').select('user_id,first_name,last_name,username,avatar_url,class_rank').in('user_id', commentUserIds)
      : { data: [] };
    const authorMap = new Map((authors || []).map(p => [p.user_id, p as Profile]));
    const clanMap = new Map((clans || []).map(c => [c.id, c as Clan]));
    const commentAuthorMap = new Map((commentAuthors || []).map(p => [p.user_id, p as Profile]));
    setPosts(list.map(post => ({
      ...post,
      author: authorMap.get(post.author_id),
      clan: clanMap.get(post.clan_id),
      likes: (likes || []).filter(l => l.post_id === post.id).length,
      liked: (likes || []).some(l => l.post_id === post.id && l.user_id === user.id),
      comments: (comments || []).filter(c => c.post_id === post.id).map(c => ({ ...c, author: commentAuthorMap.get(c.user_id) })) as Comment[],
    })));
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const channel = supabase.channel('mha-community-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hma_clan_posts' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hma_clan_post_likes' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hma_clan_post_comments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hma_events' }, () => void load())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [load, supabase]);

  async function publish() {
    if (!leaderClan || !myId || (!caption.trim() && !imageUrl.trim())) return;
    if (!caption.trim()) { setError('Ajoute une légende avant de publier une image.'); return; }
    setPosting(true);
    setError('');
    const { error: insertError } = await supabase.from('hma_clan_posts').insert({
      clan_id: leaderClan.id,
      author_id: myId,
      caption: caption.trim(),
      image_url: imageUrl.trim() || null,
    });
    if (insertError) setError(insertError.message);
    else { setCaption(''); setImageUrl(''); await load(); }
    setPosting(false);
  }

  async function toggleLike(post: ClanPost) {
    if (!myId || !followedClans.includes(post.clan_id)) {
      setError('Suis ce clan pour aimer ses publications.');
      return;
    }
    const result = post.liked
      ? await supabase.from('hma_clan_post_likes').delete().eq('post_id', post.id).eq('user_id', myId)
      : await supabase.from('hma_clan_post_likes').insert({ post_id: post.id, user_id: myId });
    if (result.error) setError(result.error.message);
    else await load();
  }

  async function addComment(postId: string, clanId: string) {
    const content = commentDrafts[postId]?.trim();
    if (!myId || !content) return;
    if (!followedClans.includes(clanId)) {
      setError('Suis ce clan pour commenter ses publications.');
      return;
    }
    const { error: insertError } = await supabase.from('hma_clan_post_comments').insert({ post_id: postId, user_id: myId, content });
    if (insertError) setError(insertError.message);
    else { setCommentDrafts(current => ({ ...current, [postId]: '' })); await load(); }
  }

  const filteredPosts = useMemo(() => posts.filter(post =>
    !search.trim() ||
    post.caption.toLowerCase().includes(search.toLowerCase()) ||
    displayName(post.author).toLowerCase().includes(search.toLowerCase()) ||
    post.clan?.name.toLowerCase().includes(search.toLowerCase())
  ), [posts, search]);
  const filteredEvents = useMemo(() => events.filter(event =>
    !search.trim() || event.title.toLowerCase().includes(search.toLowerCase()) || event.description?.toLowerCase().includes(search.toLowerCase())
  ), [events, search]);

  return <main className="mha-page">
    <header className="mb-5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3" aria-label="MHA Academy, accueil">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#1B2437] bg-[#0A0D14] text-lg font-bold text-[#BFD2FF]">M</span>
        <span><span className="block text-sm font-bold tracking-wide">MHA ACADEMY</span><span className="text-xs text-[#9AA7C2]">Ton univers, ta communauté</span></span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/messages" aria-label="Messages" className="grid h-11 w-11 place-items-center rounded-xl border border-[#1B2437] bg-[#0A0D14] text-[#BFD2FF]"><Mail size={20} strokeWidth={1.6}/></Link>
        <button type="button" onClick={() => void load()} aria-label="Actualiser le fil" className="grid h-11 w-11 place-items-center rounded-xl border border-[#1B2437] bg-[#0A0D14] text-[#9AA7C2]"><RefreshCw size={19} strokeWidth={1.6}/></button>
      </div>
    </header>

    <Banner className="mb-12 min-h-[190px]">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#BFD2FF]">MHA • Communauté</p>
      <h1 className="mt-3 max-w-xs text-2xl font-bold leading-tight sm:text-3xl">Les nouvelles de ton académie.</h1>
      <p className="mt-2 max-w-xs text-sm text-[#BFD2FF]">Actualités, événements et publications des clans.</p>
      <ChibiSticker label="MHA"/>
      <GlassSurface className="absolute -bottom-7 left-4 right-4 rounded-2xl p-2 sm:left-6 sm:right-6">
        <div className="flex items-center gap-2 px-2"><Search size={19} className="shrink-0 text-[#BFD2FF]" strokeWidth={1.6}/><input value={search} onChange={e => setSearch(e.target.value)} aria-label="Rechercher dans la communauté" placeholder="Rechercher…" className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9AA7C2]"/></div>
      </GlassSurface>
    </Banner>

    {error && <p role="alert" className="mha-warning mb-4 rounded-xl p-3 text-sm">{error}</p>}

    {leaderClan && <section className="mb-5 rounded-[20px] border border-[#1B2437] bg-[#0A0D14] p-4">
      <div className="mb-3 flex items-center gap-3"><AvatarFrame src={me?.avatar_url} name={displayName(me)} size="h-10 w-10"/><div><b className="text-sm">{displayName(me)}</b><p className="text-xs text-[#9AA7C2]">Publier pour {leaderClan.name}</p></div></div>
      <textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={2000} placeholder="Partager une actualité avec ton clan…" className="input min-h-24 resize-y"/>
      <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Lien d’image (facultatif)" className="input mt-3"/>
      <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-[#9AA7C2]">Publication de clan</span><button type="button" onClick={() => void publish()} disabled={posting || !caption.trim()} className="glass-surface glass-fallback inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-40"><Send size={16}/>{posting ? 'Publication…' : 'Publish'}</button></div>
    </section>}

    <div className="mb-4 flex flex-wrap gap-2" aria-label="Filtres de la communauté">
      <button type="button" onClick={() => setFilter('all')} className={`min-h-10 rounded-full border px-4 text-xs font-semibold ${filter === 'all' ? 'border-blue-500 bg-blue-600 text-white' : 'border-[#1B2437] bg-[#0A0D14] text-[#9AA7C2]'}`}>All</button>
      <button type="button" onClick={() => setFilter('posts')} className={`min-h-10 rounded-full border px-4 text-xs font-semibold ${filter === 'posts' ? 'border-blue-500 bg-blue-600 text-white' : 'border-[#1B2437] bg-[#0A0D14] text-[#9AA7C2]'}`}>Clan posts</button>
      <button type="button" onClick={() => setFilter('events')} className={`min-h-10 rounded-full border px-4 text-xs font-semibold ${filter === 'events' ? 'border-blue-500 bg-blue-600 text-white' : 'border-[#1B2437] bg-[#0A0D14] text-[#9AA7C2]'}`}>Events</button>
    </div>

    <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Fil d’actualité</h2><span className="text-xs text-[#9AA7C2]">{(filter === 'events' ? filteredEvents.length : filter === 'posts' ? filteredPosts.length : filteredEvents.length + filteredPosts.length)} éléments</span></div>
    {loading ? <div className="card p-6 text-center text-sm text-[#9AA7C2]">Chargement du fil…</div> : <>
      {(filter !== 'posts') && filteredEvents.map(event => <article key={event.id} className="card mb-4 p-4 sm:p-5">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600/15 text-[#BFD2FF]"><CalendarDays size={20}/></span><div><b className="text-sm">MHA Academy</b><p className="text-xs text-[#9AA7C2]">Événement · {new Date(event.event_date).toLocaleString('fr-FR')}</p></div><span className="mha-badge ml-auto rounded-lg px-2 py-1 text-[10px] font-bold">EVENT</span></div>
        <h3 className="mt-4 font-bold">{event.title}</h3>
        {event.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{event.description}</p>}
        {event.banner_url && <img src={event.banner_url} alt="" className="mt-4 max-h-72 w-full rounded-xl object-cover"/>}
      </article>)}
      {(filter !== 'events') && filteredPosts.map(post => <article key={post.id} className="card mb-4 p-4 sm:p-5">
        <div className="flex items-center gap-3"><AvatarFrame src={post.author?.avatar_url} name={displayName(post.author)} size="h-10 w-10"/><div className="min-w-0 flex-1"><b className="block truncate text-sm">{displayName(post.author)}</b><span className="text-xs text-[#9AA7C2]">{post.clan?.name || 'Clan'} · {new Date(post.created_at).toLocaleString('fr-FR')}</span></div><span className="mha-badge rounded-lg px-2 py-1 text-[10px] font-bold">CLAN</span></div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">{post.caption}</p>
        {post.image_url && <img src={post.image_url} alt="Image publiée par un clan" className="mt-4 max-h-[420px] w-full rounded-2xl border border-[#1B2437] object-cover"/>}
        <div className="mt-4 flex items-center gap-5 border-t border-[#1B2437] pt-3"><button type="button" onClick={() => void toggleLike(post)} aria-label={post.liked ? 'Retirer le like' : 'Aimer la publication'} className={`inline-flex min-h-11 items-center gap-2 text-sm ${post.liked ? 'text-blue-300' : 'text-[#9AA7C2]'}`}><Heart size={18} strokeWidth={1.6} fill={post.liked ? 'currentColor' : 'none'}/>{post.likes}</button><span className="inline-flex items-center gap-2 text-sm text-[#9AA7C2]"><MessageCircle size={18} strokeWidth={1.6}/>{post.comments.length}</span><Link href={post.clan?.slug ? `/clans/${post.clan.slug}` : '/clans'} className="ml-auto inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[#BFD2FF]">Voir le clan <Users size={15}/></Link></div>
        <div className="mt-3 space-y-2">{post.comments.map(comment => <div key={comment.id} className="rounded-xl bg-black px-3 py-2"><b className="mr-2 text-xs text-[#BFD2FF]">{displayName(comment.author)}</b><span className="text-sm text-slate-300">{comment.content}</span></div>)}</div>
        <div className="mt-3 flex gap-2"><input value={commentDrafts[post.id] || ''} onChange={e => setCommentDrafts(current => ({ ...current, [post.id]: e.target.value }))} maxLength={1000} placeholder="Écrire un commentaire…" aria-label="Écrire un commentaire" className="input min-w-0 flex-1 py-2.5"/><button type="button" onClick={() => void addComment(post.id, post.clan_id)} className="button-secondary px-3" aria-label="Envoyer le commentaire"><Send size={17} strokeWidth={1.6}/></button></div>
        {!followedClans.includes(post.clan_id) && <p className="mt-2 text-xs text-[#9AA7C2]">Pour aimer ou commenter, suis ce clan depuis sa page.</p>}
      </article>)}
      {((filter === 'events' && filteredEvents.length === 0) || (filter === 'posts' && filteredPosts.length === 0) || (filter === 'all' && filteredEvents.length + filteredPosts.length === 0)) && <div className="card p-8 text-center"><p className="font-semibold">Le fil est encore calme.</p><p className="mt-1 text-sm text-[#9AA7C2]">Les événements publiés et actualités des clans apparaîtront ici.</p></div>}
    </>}
    <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[#9AA7C2]"><Link href="/clans" className="inline-flex items-center gap-2"><Users size={15}/> Clans</Link><Link href="/messages" className="inline-flex items-center gap-2"><MessageCircle size={15}/> Messages</Link></div>
  </main>;
}
