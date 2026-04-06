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
    /* Ocupa exactamente el espacio bajo el navbar — usa dvh para móvil correcto */
    <div className="flex" style={{ height: 'calc(100dvh - 4rem)' }}>

      {/* ── Sidebar ── */}
      {user && (
        <>
          {showSidebar && (
            <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setShowSidebar(false)} />
          )}
          <aside className={`
            fixed md:relative z-50 md:z-auto top-16 md:top-auto bottom-0 left-0
            w-64 flex flex-col gap-2 p-3
            border-r border-gold-400/30
            bg-[#0d0d0d] md:bg-transparent
            transform transition-transform duration-200
            ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <button
              onClick={() => { setCurrentConvId(null); setLocalMessages([]); setShowSidebar(false); }}
              className="btn-gold flex items-center gap-2 justify-center py-2.5 text-sm"
            >
              <Plus className="w-4 h-4" />Nueva consulta
            </button>
            <div className="overflow-y-auto flex-1 space-y-1 mt-1">
              {convData?.conversations.map((c: Conversation) => (
                <button
                  key={c.id}
                  onClick={() => { setCurrentConvId(c.id); setShowSidebar(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2
                    ${currentConvId === c.id
                      ? 'bg-gold-400/20 border border-gold-400/40 text-gold-300'
                      : 'text-gold-200 hover:bg-gold-400/10 border border-transparent'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-gold-400" />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          </aside>
        </>
      )}

      {/* ── Área principal del chat ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gold-400/30 flex items-center gap-3 bg-black/40 flex-shrink-0">
          {user && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden text-gold-400 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </button>
          )}
          <Sparkles className="w-5 h-5 text-gold-400 flex-shrink-0" />
          <div>
            <h2 className="font-cinzel font-semibold text-gold-300 text-base">Aurum IA</h2>
            <p className="text-gold-400 text-xs opacity-75">Tu oráculo numerológico</p>
          </div>
        </div>

        {/* Mensajes — flex-1 para llenar todo el espacio disponible */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overscrollBehavior: 'contain' }}>
          {localMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
              <Sparkles className="w-12 h-12 text-gold-400 opacity-50 animate-float" />
              <div>
                <h3 className="font-cinzel text-gold-300 text-lg mb-2">Bienvenido a Aurum IA</h3>
                <p className="text-gold-200 text-sm max-w-xs mx-auto opacity-75 leading-relaxed">
                  Tu oráculo numerológico dominicano. Pregúntame sobre números de la suerte o interpretación de sueños.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm mt-2">
                {SUGERENCIAS.map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-sm text-left px-4 py-3 rounded-xl border border-gold-400/35
                      text-gold-300 hover:border-gold-400/60 hover:text-gold-200
                      transition-all bg-black/30 active:scale-95 min-h-[44px]"
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
                <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <Star className="w-4 h-4 text-dark-300" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-3 text-base leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-gold-400/20 border border-gold-400/40 text-gold-100 rounded-tr-sm'
                    : 'bg-black/50 border border-gold-400/25 text-gold-200 rounded-tl-sm'
                  }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}

          {sendMessage.isPending && localMessages[localMessages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center mr-2 mt-1">
                <Star className="w-4 h-4 text-dark-300" />
              </div>
              <div className="bg-black/50 border border-gold-400/25 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input — siempre pegado al fondo */}
        <div className="px-4 py-3 border-t border-gold-400/30 bg-black/40 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Escribe tu consulta..."
              className="input-dark resize-none flex-1 text-base"
              style={{ minHeight: '44px', maxHeight: '120px', paddingTop: '10px', paddingBottom: '10px' }}
              rows={1}
              disabled={sendMessage.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className="btn-gold px-4 flex items-center justify-center disabled:opacity-40 flex-shrink-0"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
