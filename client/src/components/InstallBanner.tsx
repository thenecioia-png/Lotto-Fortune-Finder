import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Guardamos el evento globalmente para no perdernos si llega antes del mount
declare global {
  interface Window { _pwaPrompt?: BeforeInstallPromptEvent; }
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;
}

function wasDismissed() {
  const ts = localStorage.getItem('install-dismissed');
  if (!ts) return false;
  return Date.now() - Number(ts) < 7 * 24 * 60 * 60 * 1000; // 7 días
}

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || wasDismissed()) return;

    // Capturar evento de Android / Chrome
    const capturePrompt = (e: Event) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      window._pwaPrompt = ev;
      setPrompt(ev);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', () => setVisible(false));

    // Si ya se capturó antes del mount
    if (window._pwaPrompt) {
      setPrompt(window._pwaPrompt);
      setVisible(true);
    }

    // iOS: mostrar después de 3 segundos
    let timer: ReturnType<typeof setTimeout>;
    if (isIOS()) {
      timer = setTimeout(() => setVisible(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setShowIOSSteps(false);
    localStorage.setItem('install-dismissed', String(Date.now()));
  };

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      window._pwaPrompt = undefined;
    }
    setPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 animate-slide-up">
      <div className="max-w-lg mx-auto card-dark rounded-2xl border border-gold-400/40 shadow-2xl overflow-hidden">
        {!showIOSSteps ? (
          /* Banner principal */
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-dark-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cinzel text-gold-300 font-semibold text-sm leading-tight">Instalar Aurum Números</p>
              <p className="text-gold-400/60 text-xs mt-0.5 truncate">Acceso rápido desde tu pantalla de inicio</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isIOS() ? (
                <button
                  onClick={() => setShowIOSSteps(true)}
                  className="btn-gold py-1.5 px-3 text-xs"
                >
                  Instalar
                </button>
              ) : (
                <button
                  onClick={handleInstall}
                  className="btn-gold py-1.5 px-3 text-xs"
                >
                  Instalar
                </button>
              )}
              <button onClick={dismiss} className="text-gold-600/50 hover:text-gold-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Instrucciones iOS */
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-cinzel text-gold-300 font-semibold text-sm">Instalar en iPhone / iPad</p>
                <p className="text-gold-400/60 text-xs mt-0.5">Usa Safari para instalar</p>
              </div>
              <button onClick={dismiss} className="text-gold-600/50 hover:text-gold-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { n: '1', text: 'Toca el botón', icon: <Share className="w-4 h-4 text-blue-400 inline mx-1" />, suffix: 'en Safari' },
                { n: '2', text: 'Selecciona "Agregar a inicio"', icon: <Plus className="w-4 h-4 text-gold-400 inline ml-1" />, suffix: '' },
                { n: '3', text: 'Toca "Agregar" para confirmar', icon: null, suffix: '' },
              ].map(step => (
                <div key={step.n} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-gold-400 font-bold text-xs">{step.n}</span>
                  </div>
                  <p className="text-gold-200/80 text-sm">
                    {step.text}{step.icon}{step.suffix}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
