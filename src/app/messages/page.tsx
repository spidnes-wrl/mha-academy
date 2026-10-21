'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type ChatMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  created_at: string;
};

type Conversation = {
  id: string;
  label: string;
  preview: string;
  status: string;
  online: boolean;
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

const fallbackConversations: Conversation[] = [
  { id: 'user-a', label: 'Clan Phoenix', preview: 'Parfait, on se tient au courant dans le clan Phoenix.', status: '3 nouveaux', online: true },
  { id: 'user-b', label: 'Groupe de maths', preview: 'Le quiz de logique est ouvert...', status: '2 réponses', online: false },
  { id: 'user-c', label: 'Tutorat', preview: 'Tu as bien reçu le plan de révision ?', status: '1 rappel', online: true },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState<string>('user-a');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      try {
        const response = await fetch('/api/messages', { cache: 'no-store' });

        if (!response.ok) {
          if (mounted) {
            setMessages(fallbackMessages);
            setActiveId('user-a');
            setError('Connexion non authentifiée — vue de démonstration chargée.');
          }
          return;
        }

        const data = await response.json();
        const nextMessages = Array.isArray(data?.messages) && data.messages.length > 0 ? data.messages : fallbackMessages;

        if (mounted) {
          setMessages(nextMessages);
          const firstPeer = Array.from(new Set(nextMessages.flatMap((message) => [message.sender_id, message.receiver_id]))).find((id) => id !== 'me') ?? 'user-a';
          setActiveId(firstPeer);
          setError(null);
        }
      } catch {
        if (mounted) {
          setMessages(fallbackMessages);
          setActiveId('user-a');
          setError('Impossible de charger les messages en temps réel, affichage de secours.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, []);

  const conversations = useMemo<Conversation[]>(() => {
    const peers = Array.from(new Set(messages.flatMap((message) => [message.sender_id, message.receiver_id])));

    return peers.map((peer, index) => {
      const related = messages.filter(
        (message) => message.sender_id === peer || message.receiver_id === peer,
      );
      const last = related[related.length - 1];

      return {
        id: peer,
        label: peer === 'me' ? 'Moi' : `Conversation ${index + 1}`,
        preview: last?.content ?? 'Aucun message',
        status: index === 0 ? '3 nouveaux' : index === 1 ? '2 réponses' : '1 rappel',
        online: index % 2 === 0,
      };
    }).filter((conversation) => conversation.id !== 'me');
  }, [messages]);

  const effectiveConversations = conversations.length > 0 ? conversations : fallbackConversations;

  const activeConversation =
    effectiveConversations.find((conversation) => conversation.id === activeId) ?? effectiveConversations[0];

  const currentMessages = messages.filter((message) => {
    if (!activeConversation) return false;
    const peerId = activeConversation.id;
    return message.sender_id === peerId || message.receiver_id === peerId;
  });

  const sendMessage = async () => {
    if (!draft.trim() || !activeConversation) return;

    const body = {
      receiver_id: activeConversation.id,
      content: draft.trim(),
      message_type: 'text',
    };

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      sender_id: 'me',
      receiver_id: activeConversation.id,
      content: body.content,
      message_type: 'text',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Envoi impossible' }));
        setError(payload.error ?? 'Envoi impossible');
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
          <h1 className="page-header__title">Centre de discussion</h1>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="secondary-button">Retour au dashboard</Link>
          <Link href="/classements" className="secondary-button">Classements</Link>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '330px 1fr', gap: 24 }}>
        <aside className="sidebar-panel glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: '1.4rem' }}>Conversations</h2>
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
                  {conversation.online && <span className="pill">En ligne</span>}
                </div>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--mha-muted)' }}>{conversation.preview}</p>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--mha-green-light)' }}>{conversation.status}</div>
              </button>
            ))}
          </div>
        </aside>

        <div className="content-panel glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem' }}>{activeConversation?.label ?? 'Conversation'}</h2>
              <p style={{ fontSize: 13, marginTop: 4 }}>Dernière activité aujourd’hui</p>
            </div>
            <span className="pill">{activeConversation?.online ? 'Actif' : 'En attente'}</span>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'rgba(255,190,90,0.08)', border: '1px solid rgba(255,190,90,0.25)', color: '#ffd295' }}>
              {error}
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ color: 'var(--mha-muted)', paddingTop: 12 }}>Chargement du chat...</div>
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
                        const isMine = message.sender_id === 'me';

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
                            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{message.content}</div>
                            <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
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
