import { useQuery } from '@tanstack/react-query';
import { Sparkles, Star, RefreshCw, TrendingUp } from 'lucide-react';
import { api, LuckyNumbers } from '../api';

function NumberBall({ n }: { n: string }) {
  return (
    <div className="number-ball animate-pulse-gold">
      {n}
    </div>
  );
}

function LotteryCard({ item }: { item: LuckyNumbers }) {
  return (
    <div className="lottery-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <h3 className="font-cinzel text-sm font-semibold text-gold-300">{item.lotteryName}</h3>
        </div>
        <TrendingUp className="w-4 h-4 text-gold-600/50" />
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {item.numbers.map((n, i) => (
          <NumberBall key={i} n={n} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['lucky-numbers'],
    queryFn: api.getLuckyNumbers,
  });

  const today = new Date().toLocaleDateString('es-DO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-gold-400/70 text-sm mb-6 tracking-widest uppercase">
            <Star className="w-3 h-3" />
            <span>República Dominicana</span>
            <Star className="w-3 h-3" />
          </div>
          <h1 className="font-cinzel text-5xl md:text-7xl font-bold gold-text mb-4 text-shadow-gold leading-tight">
            AURUM
            <br />
            <span className="text-3xl md:text-5xl font-normal">NÚMEROS</span>
          </h1>
          <p className="text-gold-200/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-2">
            Tu portal de numerología y suerte para las loterías dominicanas
          </p>
          <p className="text-gold-500/60 text-sm capitalize">{today}</p>
        </div>
      </section>

      {/* Números de la suerte */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-cinzel text-2xl font-semibold gold-text">Números de la Suerte</h2>
            <p className="text-gold-200/50 text-sm mt-1">Actualizados diariamente para cada lotería</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-outline-gold flex items-center gap-2 text-sm py-2 px-4"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="lottery-card animate-pulse">
                <div className="h-4 bg-gold-900/50 rounded mb-4 w-2/3" />
                <div className="flex gap-3 justify-center">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="w-14 h-14 rounded-full bg-gold-900/40" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.luckyNumbers.map(item => (
              <LotteryCard key={item.lotteryId} item={item} />
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-16 text-center card-dark rounded-2xl p-10 border border-gold-700/30">
          <Sparkles className="w-12 h-12 text-gold-400 mx-auto mb-4 animate-float" />
          <h2 className="font-cinzel text-3xl font-bold gold-text mb-3">
            El Universo Habla a Través de los Números
          </h2>
          <p className="text-gold-200/60 max-w-xl mx-auto mb-6">
            Descubre el significado oculto de tus sueños, consulta nuestros sorteos en vivo
            y chatea con Aurum IA, tu asistente numerológico con inteligencia artificial.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/suenos" className="btn-gold">Interpretar Sueño</a>
            <a href="/chat" className="btn-outline-gold">Hablar con Aurum IA</a>
          </div>
        </div>
      </section>
    </div>
  );
}
