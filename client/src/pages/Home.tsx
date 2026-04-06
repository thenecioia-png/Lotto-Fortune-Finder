import { useQuery } from '@tanstack/react-query';
import { Sparkles, Star, RefreshCw, TrendingUp } from 'lucide-react';
import { api, LuckyNumbers } from '../api';

function NumberBall({ n }: { n: string }) {
  return <div className="number-ball">{n}</div>;
}

function LotteryCard({ item }: { item: LuckyNumbers }) {
  return (
    <div className="lottery-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
          <h3 className="font-cinzel text-sm sm:text-base font-semibold text-gold-300 truncate">
            {item.lotteryName}
          </h3>
        </div>
        <TrendingUp className="w-4 h-4 text-gold-400 flex-shrink-0 ml-2 opacity-70" />
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
      {/* Hero — compacto en móvil */}
      <section className="px-4 pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 text-gold-400 text-xs mb-3 tracking-widest uppercase opacity-80">
          <Star className="w-3 h-3" />
          <span>República Dominicana</span>
          <Star className="w-3 h-3" />
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl md:text-7xl font-bold gold-text mb-2 leading-tight">
          AURUM<br />
          <span className="text-xl sm:text-3xl md:text-5xl font-normal">NÚMEROS</span>
        </h1>
        <p className="text-gold-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-1 opacity-80">
          Tu portal de numerología y suerte para las loterías dominicanas
        </p>
        <p className="text-gold-400 text-xs capitalize opacity-65">{today}</p>
      </section>

      {/* Números de la suerte */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-cinzel text-lg sm:text-2xl font-semibold gold-text">Números de la Suerte</h2>
            <p className="text-gold-400 text-xs mt-0.5 opacity-75">Actualizados diariamente</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-outline-gold flex items-center gap-1.5 text-sm py-2 px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="lottery-card animate-pulse" style={{ height: '110px' }} />
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
        <div className="mt-10 card-dark rounded-2xl p-6 sm:p-10 text-center">
          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-gold-400 mx-auto mb-4 animate-float" />
          <h2 className="font-cinzel text-xl sm:text-3xl font-bold gold-text mb-3">
            El Universo Habla a Través de los Números
          </h2>
          <p className="text-gold-200 text-sm max-w-xl mx-auto mb-6 leading-relaxed opacity-80">
            Descubre el significado oculto de tus sueños, consulta nuestros sorteos
            y chatea con Aurum IA, tu asistente numerológico.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/suenos" className="btn-gold text-base text-center">Interpretar Sueño</a>
            <a href="/chat" className="btn-outline-gold text-base text-center">Hablar con Aurum IA</a>
          </div>
        </div>
      </section>
    </div>
  );
}
