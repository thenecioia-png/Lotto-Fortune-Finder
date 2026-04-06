import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Sparkles, Plus, MessageSquare, Star, ChevronLeft } from 'lucide-react';
import { api, Message, Conversation } from '../api';
import { useAuth } from '../context/AuthContext';

function formatMessage(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

const SUGERENCIAS = [
  '¿Qué números debo jugar hoy?',
  'Dame números para Leidsa',
  '¿Qué significa soñar con agua?',
  'Explícame la numerología',
];

export default function Chat() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
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

  useEffect(() => { if (msgData) setLocalMessages(msgData.messages); }, [msgData]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [localMessages]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      let convId = currentConvId;
      if (!convId) {
        const conv = await api.createConversation('Nueva consulta');
        convId = conv.id;
        setCurrentConvId(convId);
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }

      const userMsg: Message = { id: Date.now(), role: 'user', content, created_at: new Date().toISOString() };
      setLocalMessages(prev => [...prev, userMsg]);

      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Error al enviar');

      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('text/event-stream')) {
        const assistantMsg: Message = { id: Date.now() + 1, role: 'assistant', content: '', created_at: new Date().toISOString() };
        setLocalMessages(prev => [...prev, assistantMsg]);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: rd } = await reader.read();
          done = rd;
          const lines = decoder.decode(value || new Uint8Array()).split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.delta) {
                  setLocalMessages(prev => {
                    const msgs = [...prev];
                    const last = msgs[msgs.length - 1];
                    if (last?.role === 'assistant') msgs[msgs.length - 1] = { ...last, content: last.content + parsed.delta };
                    return msgs;
                  });
                }
              } catch {}
            }
          }
        }
      } else {
        const data = await res.json();
        setLocalMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.message.content, created_at: new Date().toISOString() }]);
      }
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessage.isPending) return;
    const msg = input.trim();
    setInput('');
    sendMessage.mutate(msg);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar — desktop siempre visible, mobile: overlay */}
      {user && (
        <>
          {/* Overlay móvil */}
          {showSidebar && (
            <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setShowSidebar(false)} />
          )}
          <aside className={`
            fixed md:relative z-50 md:z-auto top-16 md:top-auto bottom-0 left-0
            w-64 flex flex-col gap-2 p-3 border-r border-gold-400/15
            bg-dark-300/98 md:bg-transparent backdrop-blur-md md:backdrop-blur-none
            transform transition-transform duration-200
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <button onClick={() => { setCurrentConvId(null); setLocalMessages([]); setShowSidebar(false); }}
              className="btn-gold flex items-center gap-2 justify-center py-2 text-xs">
              <Plus className="w-3.5 h-3.5" />Nueva consulta
            </button>
            <div className="overflow-y-auto flex-1 space-y-1">
              {convData?.conversations.map((c: Conversation) => (
                <button key={c.id} onClick={() => { setCurrentConvId(c.id); setShowSidebar(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2
                    ${currentConvId === c.id ? 'bg-gold-400/15 border border-gold-400/30 text-gold-300' : 'text-gold-200/60 hover:bg-gold-400/10'}`}>
                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* Chat principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-3 sm:px-6 py-3 border-b border-gold-400/15 flex items-center gap-3 bg-dark-300/50">
          {user && (
            <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden text-gold-400/70 p-1">
              {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </button>
          )}
          <Sparkles className="w-4 h-4 text-gold-400" />
          <div>
            <h2 className="font-cinzel font-semibold text-gold-300 text-sm">Aurum IA</h2>
            <p className="text-gold-600/50 text-xs">Tu oráculo numerológico</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {localMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Sparkles className="w-10 h-10 text-gold-400/30 mb-3 animate-float" />
              <h3 className="font-cinzel text-gold-400/50 text-base mb-2">Bienvenido a Aurum IA</h3>
              <p className="text-gold-200/25 text-xs max-w-xs mb-5">
                Tu oráculo numerológico dominicano. Pregúntame sobre números de la suerte o interpretación de sueños.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                {SUGERENCIAS.map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    className="text-xs text-left px-3 py-2 rounded-lg border border-gold-400/15 text-gold-400/50 hover:border-gold-400/35 hover:text-gold-400/80 transition-all bg-black/20 active:scale-95">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {localMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Star className="w-3.5 h-3.5 text-dark-300" />
                </div>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-gold-400/15 border border-gold-400/25 text-gold-200 rounded-tr-sm'
                    : 'bg-black/40 border border-gold-400/15 text-gold-200/90 rounded-tl-sm'
                  }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}

          {sendMessage.isPending && localMessages[localMessages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center mr-2 mt-1">
                <Star className="w-3.5 h-3.5 text-dark-300" />
              </div>
              <div className="bg-black/40 border border-gold-400/15 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gold-400/15 bg-dark-300/50">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Escribe tu consulta..."
              className="input-dark resize-none h-10 py-2 text-sm flex-1"
              rows={1}
              disabled={sendMessage.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className="btn-gold px-3 py-2 flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
