import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
      } else {
        await register({ username: form.username, email: form.email, password: form.password, name: form.name });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card-dark rounded-2xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gold-600/60 hover:text-gold-400">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <Sparkles className="w-10 h-10 text-gold-400 mx-auto mb-3" />
          <h2 className="font-cinzel text-2xl gold-text font-bold">
            {mode === 'login' ? 'Bienvenido' : 'Únete a Aurum'}
          </h2>
          <p className="text-gold-200/50 text-sm mt-1">
            {mode === 'login' ? 'Accede a tu portal numerológico' : 'Comienza tu viaje espiritual'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gold-200/70 text-sm mb-1">Usuario</label>
            <input
              type="text"
              className="input-dark"
              placeholder="tu_usuario"
              value={form.username}
              onChange={set('username')}
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-gold-200/70 text-sm mb-1">Nombre completo</label>
                <input type="text" className="input-dark" placeholder="Tu nombre" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="block text-gold-200/70 text-sm mb-1">Email</label>
                <input type="email" className="input-dark" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} required />
              </div>
            </>
          )}

          <div>
            <label className="block text-gold-200/70 text-sm mb-1">Contraseña</label>
            <input
              type="password"
              className="input-dark"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded px-3 py-2">{error}</p>
          )}

          <button type="submit" className="btn-gold w-full" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
          </button>
        </form>

        <p className="text-center text-gold-200/40 text-sm mt-5">
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
            className="text-gold-400 hover:text-gold-300 underline"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
