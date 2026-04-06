import { useQuery } from '@tanstack/react-query';
import { Sparkles, Star, RefreshCw, TrendingUp } from 'lucide-react';
import { api, LuckyNumbers } from '../api';

function NumberBall({ n }: { n: string }) {
  return (
    <div className="number-ball" style={{ width: '3rem', height: '3rem', fontSize: '1rem' }}>
      {n}
    </div>
  );
}

function LotteryCard({ item }: { item: LuckyNumbers }) {
  return (
    <div className="lottery-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
          <h3 className="font-cinzel text-xs sm:text-sm font-semibold text-gold-300 truncate">
            {item.lotteryName}
          </h3>
        </div>
        <TrendingUp className="w-3.5 h-3.5 text-gold-600/50 flex-shrink-0 ml-2" />
      </div>
      <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
        {item.numbers.map((n, i) => <NumberBall key={i} n={n} />)}
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
      <section className="relative px-4 pt-12 pb-10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-gold-400/70 text-xs mb-4 tracking-widest uppercase">
            <Star className="w-3 h-3" />
            <span>República Dominicana</span>
            <Star className="w-3 h-3" />
          </div>
          <h1 className="font-cinzel text-4xl sm:text-5xl md:text-7xl font-bold gold-text mb-3 text-shadow-gold leading-tight">
            AURUM
            <br />
            <span className="text-2xl sm:text-3xl md:text-5xl font-normal">NÚMEROS</span>
          </h1>
          <p className="text-gold-400/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-1">
            Tu portal de numerología y suerte para las loterías dominicanas
          </p>
          <p className="text-gold-500/50 text-xs capitalize">{today}</p>
        </div>
      </section>

      {/* Números de la suerte */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div>
            <h2 className="font-cinzel text-lg sm:text-2xl font-semibold gold-text">Números de la Suerte</h2>
            <p className="text-gold-400/50 text-xs mt-0.5">Actualizados diariamente</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-outline-gold flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="lottery-card animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {data?.luckyNumbers.map(item => (
              <LotteryCard key={item.lotteryId} item={item} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center card-dark rounded-2xl p-6 sm:p-10 border border-gold-400/30">
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-gold-400 mx-auto mb-4 animate-float" />
          <h2 className="font-cinzel text-xl sm:text-3xl font-bold gold-text mb-3">
            El Universo Habla a Través de los Números
          </h2>
          <p className="text-gold-400/60 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Descubre el significado oculto de tus sueños, consulta nuestros sorteos
            y chatea con Aurum IA, tu asistente numerológico.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/suenos" className="btn-gold text-sm text-center">Interpretar Sueño</a>
            <a href="/chat" className="btn-outline-gold text-sm text-center">Hablar con Aurum IA</a>
          </div>
        </div>
      </section>
    </div>
  );
}
