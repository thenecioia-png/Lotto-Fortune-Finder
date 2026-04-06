import { Crown, Check, Sparkles, Star, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import AuthModal from '../components/AuthModal';

const FEATURES_FREE = [
  'Números de la suerte diarios',
  'Horarios de sorteos',
  '5 interpretaciones de sueños/mes',
  'Chat básico con Aurum IA',
];

const FEATURES_PREMIUM = [
  'Todo lo del plan gratuito',
  'Interpretaciones de sueños ilimitadas',
  'Chat IA sin límites (GPT-4)',
  'Historial completo de sueños',
  'Números personalizados por fecha',
  'Alertas de sorteos por notificación',
  'Panel de estadísticas personal',
  'Soporte prioritario',
];

export default function Subscription() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const isPremium = user?.subscriptionStatus === 'active';

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 text-gold-400/70 text-sm mb-4 tracking-widest uppercase">
          <Star className="w-3 h-3" />
          <span>Plan Premium</span>
          <Star className="w-3 h-3" />
        </div>
        <Crown className="w-16 h-16 text-gold-400 mx-auto mb-4 animate-float" />
        <h1 className="font-cinzel text-4xl font-bold gold-text mb-3">Desbloquea el Poder Completo</h1>
        <p className="text-gold-200/50 max-w-xl mx-auto">
          Accede a todas las herramientas numerológicas y espiritiales de Aurum Números.
        </p>
      </div>

      {/* Planes */}
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free */}
        <div className="lottery-card relative">
          <div className="mb-6">
            <h3 className="font-cinzel text-xl font-semibold text-gold-200 mb-1">Gratuito</h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-gold-200">$0</span>
              <span className="text-gold-600/60 mb-1">/mes</span>
            </div>
          </div>
          <ul className="space-y-3 mb-8">
            {FEATURES_FREE.map(f => (
              <li key={f} className="flex items-center gap-3 text-gold-200/70 text-sm">
                <Check className="w-4 h-4 text-gold-600 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button className="btn-outline-gold w-full" disabled>
            Plan Actual
          </button>
        </div>

        {/* Premium */}
        <div className="relative lottery-card border-gold-500/50 bg-gradient-to-b from-gold-900/20 to-dark-100/95">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gold-gradient text-dark-300 text-xs font-bold font-cinzel px-4 py-1 rounded-full shadow-lg">
              RECOMENDADO
            </span>
          </div>

          <div className="mb-6 mt-2">
            <h3 className="font-cinzel text-xl font-semibold gold-text mb-1">Premium</h3>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold gold-text">$5</span>
              <span className="text-gold-600/60 mb-1">/mes</span>
            </div>
            <p className="text-gold-600/60 text-xs">Cancela cuando quieras</p>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES_PREMIUM.map(f => (
              <li key={f} className="flex items-center gap-3 text-gold-200/80 text-sm">
                <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {isPremium ? (
            <div className="btn-gold w-full text-center py-3 rounded-md font-cinzel">
              ✓ Plan Activo
            </div>
          ) : user ? (
            <button
              className="btn-gold w-full"
              onClick={() => alert('Integración con Stripe próximamente. Contacta al administrador para activar tu cuenta premium.')}
            >
              Suscribirme Ahora
            </button>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="btn-gold w-full flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Inicia sesión para suscribirte
            </button>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-16 text-center">
        <p className="text-gold-600/50 text-sm mb-6">Pagos seguros · Cancela en cualquier momento · Soporte 24/7</p>
        <div className="flex justify-center gap-8 flex-wrap text-gold-600/40 text-xs">
          <span>🔒 SSL Seguro</span>
          <span>💳 Tarjeta de crédito/débito</span>
          <span>🔄 Sin contratos</span>
          <span>🌟 Satisfacción garantizada</span>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
