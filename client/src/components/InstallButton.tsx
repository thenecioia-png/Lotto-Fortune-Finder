import { useState, useEffect } from 'react';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;
}

// Banner para iPhone/iPad — muestra instrucciones manuales
function IOSBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-lg mx-auto card-dark rounded-2xl p-5 border border-gold-400/40 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-cinzel text-gold-300 font-semibold text-sm">Instalar Aurum en iPhone</p>
            <p className="text-gold-400/60 text-xs mt-0.5">Agrega la app a tu pantalla de inicio</p>
          </div>
          <button onClick={onClose} className="text-gold-600/50 hover:text-gold-400 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-400 font-bold text-sm">1</span>
            </div>
            <p className="text-gold-200/80 text-sm flex items-center gap-1.5">
              Toca el botón <Share className="w-4 h-4 text-blue-400 inline" /> en Safari
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-400 font-bold text-sm">2</span>
            </div>
            <p className="text-gold-200/80 text-sm flex items-center gap-1.5">
              Selecciona <strong className="text-gold-300">"Agregar a pantalla de inicio"</strong>
              <Plus className="w-4 h-4 text-gold-400 inline" />
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-400 font-bold text-sm">3</span>
            </div>
            <p className="text-gold-200/80 text-sm">Toca <strong className="text-gold-300">"Agregar"</strong> para instalar</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) { setInstalled(true); return; }

    // Android / Chrome / Edge — capturar el prompt automático
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed) return null;

  // iPhone/iPad — mostrar instrucciones manuales
  if (isIOS()) {
    return (
      <>
        <button
          onClick={() => setShowIOS(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            bg-gold-400/15 border border-gold-400/40 text-gold-300
            hover:bg-gold-400/25 hover:border-gold-400/60 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
        {showIOS && <IOSBanner onClose={() => setShowIOS(false)} />}
      </>
    );
  }

  // Android / PC — prompt automático del navegador
  if (!prompt) return null;

  const handleInstall = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
        bg-gold-400/15 border border-gold-400/40 text-gold-300
        hover:bg-gold-400/25 hover:border-gold-400/60 transition-all"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
}
