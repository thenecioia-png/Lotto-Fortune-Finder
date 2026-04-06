import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Ya instalada como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed || !prompt) return null;

  const handleInstall = async () => {
    if (!prompt) return;
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
      title="Instalar como app"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
}
