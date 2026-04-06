const BASE = '/api';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  getUser: () => request<{ user: User | null }>('/auth/user'),
  login: (username: string, password: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: { username: string; email: string; password: string; name?: string }) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  // Lottery
  getLuckyNumbers: () => request<{ luckyNumbers: LuckyNumbers[]; date: string }>('/lottery/lucky-numbers'),
  getDraws: () => request<{ draws: Lottery[] }>('/lottery/draws'),

  // Dreams
  interpretDream: (dreamText: string) =>
    request<{ interpretation: string; numbers: string[] }>('/dreams/interpret', {
      method: 'POST',
      body: JSON.stringify({ dreamText }),
    }),
  getDreamHistory: () => request<{ history: DreamEntry[] }>('/dreams/history'),

  // Chat
  getConversations: () => request<{ conversations: Conversation[] }>('/chat/conversations'),
  createConversation: (title?: string) =>
    request<{ id: number; title: string }>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  getMessages: (convId: number) =>
    request<{ messages: Message[] }>(`/chat/conversations/${convId}/messages`),

  // Admin
  getAdminStats: () => request<AdminStats>('/admin/stats'),
  getAdminUsers: () => request<{ users: AdminUser[] }>('/admin/users'),
  toggleAdmin: (id: number, isAdmin: boolean) =>
    request<{ ok: boolean }>(`/admin/users/${id}/admin`, {
      method: 'PUT',
      body: JSON.stringify({ isAdmin }),
    }),
  deleteUser: (id: number) =>
    request<{ ok: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),
};

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  isAdmin: boolean;
  subscriptionStatus: string;
}

export interface LuckyNumbers {
  lotteryId: string;
  lotteryName: string;
  color: string;
  numbers: string[];
  date: string;
}

export interface Lottery {
  id: string;
  name: string;
  shortName: string;
  color: string;
  schedule: { day: string; time: string; type: string }[];
}

export interface DreamEntry {
  id: number;
  dream_text: string;
  interpretation: string;
  numbers: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalDreams: number;
  totalMessages: number;
  monthlyRevenue: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  name: string;
  is_admin: number;
  subscription_status: string;
  created_at: string;
}
