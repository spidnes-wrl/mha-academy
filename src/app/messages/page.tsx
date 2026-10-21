'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type ChatMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  created_at: string;
};

type ChatConversation = {
  id: string;
  label: string;
  preview: string;
  status: string;
  online: boolean;
  unread: number;
  lastAt: string;
};

type GroupItem = {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  owner_id?: string;
};

const fallbackMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender_id: 'user-a',
    receiver_id: 'me',
    content: 'Salut ! Tu as vu la mission sur les clans ?',
    message_type: 'text',
    created_at: '2026-10-21T10:12:00.000Z',
  },
  {
    id: 'm2',
    sender_id: 'me',
    receiver_id: 'user-a',
    content: 'Oui, je la regarde maintenant. Je te réponds dans 10 min.',
    message_type: 'text',
    created_at: '2026-10-21T10:15:00.000Z',
  },
  {
    id: 'm3',
    sender_id: 'user-a',
    receiver_id: 'me',
    content: 'Parfait, on se tient au courant dans le clan Phoenix.',
    message_type: 'text',
    created_at: '2026-10-21T10:16:00.000Z',
  },
  {
    id: 'm4',
    sender_id: 'user-b',
    receiver_id: 'me',
    content: 'Le quiz de logique est ouvert. Tu veux une session de révision ?',
    message_type: 'text',
    created_at: '2026-10-21T09:58:00.000Z',
  },
];

const fallbackGroups: GroupItem[] = [
  { id: 'g1', name: 'Clan Phoenix', description: 'Clan principal de la promotion', is_private: false },
  { id: 'g2', name: 'Groupe de maths', description: 'Révision et quiz', is_private: false },
  { id: 'g3', name: 'Tutorat', description: 'Aide et conseils', is_private: true },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(fallbackMessages);
  const [groups, setGroups] = useState<GroupItem[]>(fallbackGroups);
  const [activeId, setActiveId] = useState<string>('user-a');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserSupabaseClient();

    async function loadInitialData() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (!mounted) return;

        if (userError || !userData.user) {
          setCurrentUserId('me');
          setError('Session non authentifiée — mode démonstration activé.');
          setMessages(fallbackMessages);
          setGroups(fallbackGroups);
          setActiveId('user-a');
          setLoading(false);
          return;
        }

        setCurrentUserId(userData.user.id);

        const [messagesRes, groupsRes] = await Promise.all([
          fetch('/api/messages', { cache: 'no-store' }),
          fetch('/api/groups', { cache: 'no-store' }),
        ]);

        if (!mounted) return;

        const nextMessages = messagesRes.ok ? ((await messagesRes.json())?.messages ?? []) : fallbackMessages;
        const nextGroups = groupsRes.ok ? ((await groupsRes.json())?.groups ?? []) : fallbackGroups;

        setMessages(nextMessages.length > 0 ? nextMessages : fallbackMessages);
        setGroups(nextGroups.length > 0 ? nextGroups : fallbackGroups);

        const peers = new Set(
          (nextMessages.length > 0 ? nextMessages : fallbackMessages).flatMap((message) => [message.sender_id, message.receiver_id])
        );

        const firstPeer = Array.from(peers).find((id) => id !== userData.user.id && id !== 'me') ?? 'user-a';
        setActiveId(firstPeer);
        setError(null);
      } catch {
        if (!mounted) return;
        setMessages(fallbackMessages);
        setGroups(fallbackGroups);
        setActiveId('user-a');
        setError('La récupération du chat a échoué, le mode démonstration est actif.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUserId || currentUserId === 'me') return;

    const supabase = createBrowserSupabaseClient();
    const channel = supabase.channel('mha-chat-live');

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hma_messages' },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          if (!incoming) return;

          const isRelevant =
            incoming.sender_id === currentUserId ||
            incoming.receiver_id === currentUserId ||
            incoming.sender_id === activeId ||
            incoming.receiver_id === activeId;

          if (!isRelevant) return;

          setMessages((prev) => {
            if (prev.some((message) => message.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, currentUserId]);

  const conversations = useMemo<ChatConversation[]>(() => {
    const map = new Map<string, ChatConversation>();

    messages.forEach((message) => {
      const peerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
      if (!peerId || peerId === currentUserId) return;

      const previous = map.get(peerId);
      const nextPreview = message.content;
      const nextEntry = {
        id: peerId,
        label: previous?.label ?? `Conversation ${peerId.slice(0, 6)}`,
        preview: nextPreview,
        status: previous?.status ?? 'Nouveau',
        online: previous?.online ?? true,
        unread: previous?.unread ?? 0,
        lastAt: message.created_at,
      };

      map.set(peerId, nextEntry);
    });

    return Array.from(map.values())
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
      .map((conversation, index) => ({
        ...conversation,
        label: index === 0 ? 'Clan Phoenix' : index === 1 ? 'Groupe de maths' : 'Tutorat',
        status: index === 0 ? '3 nouveaux' : index === 1 ? '2 réponses' : '1 rappel',
        online: index % 2 === 0,
        unread: index === 0 ? 3 : index === 1 ? 2 : 1,
      }));
  }, [currentUserId, messages]);

  const effectiveConversations = conversations.length > 0 ? conversations : [
    { id: 'user-a', label: 'Clan Phoenix', preview: 'Parfait, on se tient au courant dans le clan Phoenix.', status: '3 nouveaux', online: true, unread: 3, lastAt: new Date().toISOString() },
    { id: 'user-b', label: 'Groupe de maths', preview: 'Le quiz de logique est ouvert...', status: '2 réponses', online: false, unread: 2, lastAt: new Date().toISOString() },
    { id: 'user-c', label: 'Tutorat', preview: 'Tu as bien reçu le plan de révision ?', status: '1 rappel', online: true, unread: 1, lastAt: new Date().toISOString() },
  ];

  const activeConversation =
    effectiveConversations.find((conversation) => conversation.id === activeId) ?? effectiveConversations[0];

  const currentMessages = messages.filter((message) => {
    if (!activeConversation) return false;
    const peer = activeConversation.id;
    return message.sender_id === peer || message.receiver_id === peer || message.sender_id === 'user-a' || message.receiver_id === 'user-a';
  });

  const sendMessage = async () => {
    if (!draft.trim() || !activeConversation) return;

    const payload = {
      receiver_id: activeConversation.id,
      content: draft.trim(),
      message_type: 'text',
    };

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      sender_id: 'me',
      receiver_id: activeConversation.id,
      content: payload.content,
      message_type: 'text',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payloadError = await response.json().catch(() => ({ error: 'Le message n’a pas pu être envoyé.' }));
        setError(payloadError.error ?? 'Le message n’a pas pu être envoyé.');
      } else {
        setError(null);
      }
    } catch {
      setError('Le message a été ajouté localement mais n’a pas pu être synchronisé.');
    }
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <span className="page-header__eyebrow">Messages & clans</span>
          <h1 className="page-header__title">Centre de discussion pro</h1>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="secondary-button">Dashboard</Link>
          <Link href="/classements" className="secondary-button">Classements</Link>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        <aside className="sidebar-panel glass-panel" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.35rem' }}>Conversations</h2>
            <span className="pill">{effectiveConversations.length}</span>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {effectiveConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                style={{
                  textAlign: 'left',
                  padding: 14,
                  borderRadius: 16,
                  background: activeConversation?.id === conversation.id ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.02)',
                  border: activeConversation?.id === conversation.id ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <strong>{conversation.label}</strong>
                  {conversation.online ? <span className="pill">En ligne</span> : null}
                </div>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--mha-muted)' }}>{conversation.preview}</p>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--mha-green-light)' }}>
                  <span>{conversation.status}</span>
                  {conversation.unread > 0 ? <span>{conversation.unread}</span> : null}
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1.15rem' }}>Clans</h3>
              <span className="pill">{groups.length}</span>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {groups.map((group) => (
                <div key={group.id} className="resource-item" style={{ padding: '12px 14px' }}>
                  <div>
                    <strong>{group.name}</strong>
                    <p style={{ marginTop: 4, fontSize: 12 }}>{group.description ?? 'Groupe actif'}</p>
                  </div>
                  <span className="pill">{group.is_private ? 'Privé' : 'Public'}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="content-panel glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 680 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h2 style={{ fontSize: '1.55rem' }}>{activeConversation?.label ?? 'Conversation'}</h2>
              <p style={{ fontSize: 13, marginTop: 4 }}>Dernière activité aujourd’hui</p>
            </div>
            <span className="pill">{activeConversation?.online ? 'Actif' : 'En attente'}</span>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'rgba(255,190,90,0.08)', border: '1px solid rgba(255,190,90,0.25)', color: '#ffd295' }}>
              {error}
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {loading ? (
              <div style={{ color: 'var(--mha-muted)', paddingTop: 18 }}>Chargement du chat...</div>
            ) : (
              <>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 8 }}>
                  {currentMessages.length === 0 ? (
                    <div style={{ padding: '24px 8px', color: 'var(--mha-muted)' }}>Aucun message pour cette conversation.</div>
                  ) : (
                    currentMessages
                      .slice()
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message) => {
                        const isMine = message.sender_id === 'me' || message.sender_id === currentUserId;

                        return (
                          <div
                            key={message.id}
                            style={{
                              alignSelf: isMine ? 'flex-end' : 'flex-start',
                              maxWidth: '75%',
                              padding: '12px 14px',
                              borderRadius: 18,
                              background: isMine ? 'linear-gradient(135deg, #00ff88, #5cff9f)' : 'rgba(255,255,255,0.04)',
                              color: isMine ? '#00190d' : 'var(--mha-text)',
                              border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <div style={{ fontSize: 14, lineHeight: 1.6 }}>{message.content}</div>
                            <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Écrire un message..."
                    aria-label="Écrire un message"
                  />
                  <button type="button" onClick={sendMessage} style={{ whiteSpace: 'nowrap' }}>
                    Envoyer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
