import { Router, Request, Response } from 'express';
import db from '../db.js';
import OpenAI from 'openai';

export const chatRouter = Router();

const SYSTEM_PROMPT = `Eres Aurum IA, el oráculo numerológico de la República Dominicana.
Hablas en español dominicano con un tono místico, cálido y sabio.
Eres experto en:
- Numerología dominicana y charada cubana
- Interpretación de sueños y su relación con números de lotería
- Las loterías dominicanas: Lotería Nacional, Leidsa, Loteka, Real, New York
- Rituales de buena suerte y limpieza espiritual

Cuando alguien te pida números, dales entre 3 y 5 números de 2 dígitos.
Siempre responde de forma concisa pero poética.
Si no sabes algo, improvisa con sabiduría mística.`;

chatRouter.get('/conversations', (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  const conversations = db.prepare(
    'SELECT id, title, created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.session.userId);

  res.json({ conversations });
});

chatRouter.post('/conversations', (req: Request, res: Response) => {
  const userId = req.session.userId || null;
  const { title } = req.body;

  const result = db.prepare(
    'INSERT INTO conversations (user_id, title) VALUES (?, ?)'
  ).run(userId, title || 'Nueva conversación');

  res.status(201).json({ id: result.lastInsertRowid, title: title || 'Nueva conversación' });
});

chatRouter.get('/conversations/:id/messages', (req: Request, res: Response) => {
  const messages = db.prepare(
    'SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).all(req.params.id);

  res.json({ messages });
});

chatRouter.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  const conversationId = parseInt(req.params.id);
  const { content } = req.body;

  if (!content?.trim()) {
    res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    return;
  }

  // Guardar mensaje del usuario
  db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, 'user', content);

  // Obtener historial de la conversación
  const history = db.prepare(
    'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20'
  ).all(conversationId) as { role: string; content: string }[];

  let assistantReply: string;

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullReply = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullReply += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, 'assistant', fullReply);
      return;
    } catch (e) {
      console.error('OpenAI error:', e);
    }
  }

  // Respuesta local sin OpenAI
  const lastUserMsg = content.toLowerCase();
  if (lastUserMsg.includes('número') || lastUserMsg.includes('numero') || lastUserMsg.includes('suerte')) {
    const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 100).toString().padStart(2, '0'));
    assistantReply = `✨ Las estrellas me revelan estos números especiales para ti hoy: **${nums.join(', ')}**. Juégalos con fe y confianza, pues el universo habla a través de ellos.`;
  } else if (lastUserMsg.includes('sueño')) {
    assistantReply = '🌙 Los sueños son mensajes del cosmos. Descríbeme tu sueño en detalle y descifraré los números ocultos en él.';
  } else {
    const responses = [
      '✨ El universo numerológico es sabio y misterioso. ¿Qué números busca tu alma hoy?',
      '🌟 Como Aurum IA, percibo vibraciones poderosas en tu consulta. Dime más sobre lo que deseas saber.',
      '🔮 La numerología dominicana guarda secretos ancestrales. ¿Quieres conocer tus números de la suerte de hoy?',
      '💫 Los números del destino te esperan. ¿Deseas que interprete un sueño o te dé números de la suerte?',
    ];
    assistantReply = responses[Math.floor(Math.random() * responses.length)];
  }

  db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, 'assistant', assistantReply);
  res.json({ message: { role: 'assistant', content: assistantReply } });
});
