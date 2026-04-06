import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Sparkles, Plus, MessageSquare, Star } from 'lucide-react';
import { api, Message, Conversation } from '../api';
import { useAuth } from '../context/AuthContext';

function formatMessage(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

export default function Chat() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: api.getConversations,
    enabled: !!user,
  });

  const { data: msgData } = useQuery({
    queryKey: ['messages', currentConvId],
    queryFn: () => api.getMessages(currentConvId!),
    enabled: !!currentConvId,
  });

  useEffect(() => {
    if (msgData) setLocalMessages(msgData.messages);
  }, [msgData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const createConv = useMutation({
    mutationFn: () => api.createConversation('Nueva consulta'),
    onSuccess: (data) => {
      setCurrentConvId(data.id);
      setLocalMessages([]);
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const userMsg: Message = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
      setLocalMessages(prev => [...prev, userMsg]);

      const res = await fetch(`/api/chat/conversations/${currentConvId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error('Error al enviar mensaje');

      const contentType = res.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream')) {
        // Streaming
        const assistantMsg: Message = {
          id: Date.now() + 1, role: 'assistant', content: '', created_at: new Date().toISOString()
        };
        setLocalMessages(prev => [...prev, assistantMsg]);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const text = decoder.decode(value || new Uint8Array());
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.delta) {
                  setLocalMessages(prev => {
                    const msgs = [...prev];
                    const last = msgs[msgs.length - 1];
                    if (last.role === 'assistant') {
                      msgs[msgs.length - 1] = { ...last, content: last.content + parsed.delta };
                    }
                    return msgs;
                  });
                }
              } catch {}
            }
          }
        }
      } else {
        const data = await res.json();
        const m = data.message;
        setLocalMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: m.role,
          content: m.content,
          created_at: new Date().toISOString(),
        }]);
      }
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    let convId = currentConvId;
    if (!convId) {
      const conv = await api.createConversation('Nueva consulta');
      convId = conv.id;
      setCurrentConvId(convId);
      qc.invalidateQueries({ queryKey: ['conversations'] });
    }

    const msg = input.trim();
    setInput('');
    sendMessage.mutate(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar de conversaciones (solo si autenticado) */}
      {user && (
        <aside className="w-64 flex-shrink-0 flex flex-col gap-3 hidden md:flex">
          <button
            onClick={() => createConv.mutate()}
            className="btn-gold flex items-center gap-2 justify-center py-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva consulta
          </button>
          <div className="overflow-y-auto space-y-1 flex-1">
            {convData?.conversations.map((c: Conversation) => (
              <button
                key={c.id}
                onClick={() => setCurrentConvId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2
                  ${currentConvId === c.id
                    ? 'bg-gold-900/40 border border-gold-700/40 text-gold-300'
                    : 'text-gold-200/60 hover:bg-gold-900/20 hover:text-gold-300'
                  }`}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Chat principal */}
      <div className="flex-1 flex flex-col card-dark rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gold-700/20 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <div>
            <h2 className="font-cinzel font-semibold text-gold-300">Aurum IA</h2>
            <p className="text-gold-600/60 text-xs">Tu oráculo numerológico</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {localMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-12 h-12 text-gold-400/40 mb-4 animate-float" />
              <h3 className="font-cinzel text-gold-400/60 text-lg mb-2">Bienvenido a Aurum IA</h3>
              <p className="text-gold-200/30 text-sm max-w-sm">
                Tu oráculo numerológico dominicano. Pregúntame sobre tus números de la suerte,
                interpretación de sueños o cualquier consulta espiritual.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-6">
                {[
                  '¿Qué números debo jugar hoy?',
                  'Explícame la numerología',
                  'Dame números para Leidsa',
                  '¿Qué significa soñar con agua?',
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs text-left px-3 py-2 rounded-lg border border-gold-700/20 text-gold-400/60 hover:border-gold-500/40 hover:text-gold-400 transition-all bg-dark-100/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {localMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-700 to-gold-500 flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <Star className="w-4 h-4 text-dark-300" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-gold-700/20 border border-gold-600/30 text-gold-200 rounded-tr-sm'
                    : 'bg-dark-100/80 border border-gold-700/20 text-gold-200/90 rounded-tl-sm'
                  }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}

          {sendMessage.isPending && localMessages[localMessages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-700 to-gold-500 flex items-center justify-center mr-3 mt-1">
                <Star className="w-4 h-4 text-dark-300" />
              </div>
              <div className="bg-dark-100/80 border border-gold-700/20 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gold-700/20">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta al oráculo..."
              className="input-dark resize-none h-11 py-2.5 text-sm flex-1"
              rows={1}
              disabled={sendMessage.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className="btn-gold px-4 py-2 flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gold-600/40 text-xs mt-2 text-center">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
