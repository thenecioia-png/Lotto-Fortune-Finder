import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Moon, Sparkles, Star, Wand2 } from 'lucide-react';
import { api } from '../api';

export default function Dreams() {
  const [dreamText, setDreamText] = useState('');
  const [result, setResult] = useState<{ interpretation: string; numbers: string[] } | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: (text: string) => api.interpretDream(text),
    onSuccess: (data) => setResult(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dreamText.trim().length >= 5) {
      mutate(dreamText.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-gold-400/70 text-sm mb-4 tracking-widest uppercase">
          <Star className="w-3 h-3" />
          <span>Interpretación de Sueños</span>
          <Star className="w-3 h-3" />
        </div>
        <Moon className="w-16 h-16 text-gold-400 mx-auto mb-4 animate-float" />
        <h1 className="font-cinzel text-4xl font-bold gold-text mb-3">Descifra tus Sueños</h1>
        <p className="text-gold-200/50 max-w-xl mx-auto leading-relaxed">
          Describe tu sueño y Aurum IA revelará los números ocultos que el universo
          te envía a través de la tradición numerológica dominicana.
        </p>
      </div>

      {/* Formulario */}
      <div className="card-dark rounded-2xl p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gold-300 font-medium mb-2 font-cinzel text-sm tracking-wide">
              Cuéntanos tu sueño
            </label>
            <textarea
              className="input-dark min-h-[150px] resize-y text-sm leading-relaxed"
              placeholder="Ejemplo: Soñé que estaba en el mar, el agua era cristalina y vi un gran pez dorado..."
              value={dreamText}
              onChange={e => setDreamText(e.target.value)}
              required
              minLength={5}
            />
            <p className="text-gold-600/50 text-xs mt-1">
              {dreamText.length} caracteres — Sé específico para una mejor interpretación
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded px-3 py-2">
              {(error as Error).message}
            </p>
          )}

          <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2" disabled={isPending}>
            {isPending ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Interpretando...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Revelar mis Números
              </>
            )}
          </button>
        </form>
      </div>

      {/* Resultado */}
      {result && (
        <div className="card-dark rounded-2xl p-8 border border-gold-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-gold-400" />
            <h2 className="font-cinzel text-xl font-semibold gold-text">Revelación Numerológica</h2>
          </div>

          {/* Números */}
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            {result.numbers.map((n, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="number-ball" style={{ width: '4rem', height: '4rem', fontSize: '1.25rem' }}>
                  {n}
                </div>
                <span className="text-gold-600/60 text-xs">#{i + 1}</span>
              </div>
            ))}
          </div>

          {/* Interpretación */}
          <div className="bg-dark-200/60 border border-gold-700/20 rounded-xl p-5">
            <p className="text-gold-200/80 leading-relaxed whitespace-pre-wrap text-sm">
              {result.interpretation}
            </p>
          </div>

          <div className="mt-5 pt-5 border-t border-gold-700/20 text-center">
            <p className="text-gold-600/50 text-xs">
              ✨ Recuerda jugar con responsabilidad. La numerología es una guía espiritual, no una garantía.
            </p>
          </div>

          <button
            onClick={() => { setResult(null); setDreamText(''); }}
            className="btn-outline-gold w-full mt-4 text-sm"
          >
            Interpretar otro sueño
          </button>
        </div>
      )}

      {/* Ejemplos de sueños */}
      {!result && (
        <div className="mt-8">
          <h3 className="font-cinzel text-sm text-gold-400/70 tracking-widest uppercase text-center mb-4">
            Símbolos Comunes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🌊', name: 'Agua', nums: '04-18-36' },
              { icon: '💰', name: 'Dinero', nums: '10-20-30' },
              { icon: '🐍', name: 'Culebra', nums: '09-19-39' },
              { icon: '🌙', name: 'Luna', nums: '28-48-68' },
              { icon: '🐕', name: 'Perro', nums: '02-22-44' },
              { icon: '🔥', name: 'Fuego', nums: '06-16-26' },
              { icon: '🌞', name: 'Sol', nums: '29-49-69' },
              { icon: '🐟', name: 'Pez', nums: '27-47-67' },
            ].map(s => (
              <button
                key={s.name}
                onClick={() => setDreamText(`Soñé con ${s.name.toLowerCase()}`)}
                className="card-dark rounded-xl p-3 text-center hover:border-gold-500/50 transition-all group"
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-gold-300 text-xs font-cinzel">{s.name}</div>
                <div className="text-gold-600/60 text-xs mt-0.5">{s.nums}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
