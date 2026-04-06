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
  'Interpretaciones ilimitadas',
  'Chat IA sin límites (GPT-4)',
  'Historial completo de sueños',
  'Números personalizados por fecha',
  'Alertas de sorteos',
  'Soporte prioritario',
];

export default function Subscription() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const isPremium = user?.subscriptionStatus === 'active';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 text-gold-400/70 text-xs mb-3 tracking-widest uppercase">
          <Star className="w-3 h-3" /><span>Plan Premium</span><Star className="w-3 h-3" />
        </div>
        <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-gold-400 mx-auto mb-3 animate-float" />
        <h1 className="font-cinzel text-2xl sm:text-4xl font-bold gold-text mb-2">Desbloquea el Poder Completo</h1>
        <p className="text-gold-400/50 text-sm max-w-xl mx-auto">
          Accede a todas las herramientas numerológicas de Aurum Números.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 max-w-2xl mx-auto">
        {/* Gratis */}
        <div className="lottery-card">
          <div className="mb-5">
            <h3 className="font-cinzel text-lg font-semibold text-gold-200 mb-1">Gratuito</h3>
            <div className="flex items-end gap-1">
              <span className="text-3xl sm:text-4xl font-bold text-gold-200">$0</span>
              <span className="text-gold-600/60 mb-1 text-sm">/mes</span>
            </div>
          </div>
          <ul className="space-y-2.5 mb-7">
            {FEATURES_FREE.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-gold-200/70 text-sm">
                <Check className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />{f}
              </li>
            ))}
          </ul>
          <button className="btn-outline-gold w-full text-sm" disabled>Plan Actual</button>
        </div>

        {/* Premium */}
        <div className="relative lottery-card border-gold-400/40 bg-gradient-to-b from-gold-400/10 to-black/50">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gold-gradient text-dark-300 text-xs font-bold font-cinzel px-4 py-1 rounded-full shadow-lg">
              RECOMENDADO
            </span>
          </div>
          <div className="mb-5 mt-2">
            <h3 className="font-cinzel text-lg font-semibold gold-text mb-1">Premium</h3>
            <div className="flex items-end gap-1">
              <span className="text-3xl sm:text-4xl font-bold gold-text">$5</span>
              <span className="text-gold-600/60 mb-1 text-sm">/mes</span>
            </div>
            <p className="text-gold-600/50 text-xs">Cancela cuando quieras</p>
          </div>
          <ul className="space-y-2.5 mb-7">
            {FEATURES_PREMIUM.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-gold-200/80 text-sm">
                <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />{f}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <div className="btn-gold w-full text-center py-3 rounded-md font-cinzel text-sm">✓ Plan Activo</div>
          ) : user ? (
            <button className="btn-gold w-full text-sm"
              onClick={() => alert('Integración con Stripe próximamente.')}>
              Suscribirme Ahora
            </button>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="btn-gold w-full flex items-center justify-center gap-2 text-sm">
              <Lock className="w-4 h-4" />Inicia sesión para suscribirte
            </button>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gold-600/40 text-xs mb-4">Pagos seguros · Cancela cuando quieras · Soporte 24/7</p>
        <div className="flex justify-center gap-4 sm:gap-8 flex-wrap text-gold-600/30 text-xs">
          <span>🔒 SSL Seguro</span>
          <span>💳 Tarjeta de crédito</span>
          <span>🔄 Sin contratos</span>
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
