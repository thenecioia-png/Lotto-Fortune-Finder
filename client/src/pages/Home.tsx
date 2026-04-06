import { useQuery } from '@tanstack/react-query';
import { Sparkles, Star, RefreshCw, TrendingUp } from 'lucide-react';
import { api, LuckyNumbers } from '../api';

function LotteryCard({ item }: { item: LuckyNumbers }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(30,20,5,0.97), rgba(18,12,2,0.99))',
      border: '1px solid rgba(196,146,10,0.50)',
      borderRadius: '14px',
      padding: '20px 24px',
      width: '100%',
    }}>
      {/* Header de la card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: item.color,
            boxShadow: `0 0 8px ${item.color}88`,
          }} />
          <h3 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.lotteryName}
          </h3>
        </div>
        <TrendingUp size={18} color="#c4920a" style={{ flexShrink: 0, marginLeft: '8px', opacity: 0.8 }} />
      </div>

      {/* Bolas de números */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {item.numbers.map((n, i) => (
          <div key={i} style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #7a5008, #c4920a, #e0b030)',
            color: '#0d0d0d',
            fontFamily: "'Cinzel', serif",
            fontWeight: 800,
            fontSize: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(196,146,10,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>
            {n}
          </div>
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
    <div>
      {/* Hero compacto */}
      <section style={{ padding: '28px 16px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#c4920a', fontSize: '11px', marginBottom: '12px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.85 }}>
          <Star size={11} />
          <span>República Dominicana</span>
          <Star size={11} />
        </div>
        <h1 className="font-cinzel gold-text" style={{ fontSize: 'clamp(28px, 8vw, 72px)', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.1 }}>
          AURUM<br />
          <span style={{ fontSize: 'clamp(18px, 5vw, 48px)', fontWeight: 400 }}>NÚMEROS</span>
        </h1>
        <p style={{ color: 'rgba(232,204,120,0.82)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 4px', lineHeight: 1.5 }}>
          Tu portal de numerología y suerte para las loterías dominicanas
        </p>
        <p style={{ color: 'rgba(196,146,10,0.65)', fontSize: '12px', textTransform: 'capitalize' }}>{today}</p>
      </section>

      {/* Sección principal */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 32px' }}>
        {/* Encabezado con botón */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 className="font-cinzel gold-text" style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 700, margin: '0 0 2px' }}>
              Números de la Suerte
            </h2>
            <p style={{ color: 'rgba(196,146,10,0.75)', fontSize: '12px', margin: 0 }}>Actualizados diariamente</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-outline-gold"
            style={{ padding: '8px 14px', fontSize: '13px', gap: '6px', display: 'flex', alignItems: 'center' }}
          >
            <RefreshCw size={15} className={isRefetching ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* Grid — 1 col en móvil, 2 en tablet, 3 en desktop */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse" style={{
                height: '120px', borderRadius: '14px',
                background: 'rgba(30,20,5,0.6)', border: '1px solid rgba(196,146,10,0.2)',
              }} />
            ))}
          </div>
        ) : (
          <div className="lottery-grid">
            {data?.luckyNumbers.map(item => (
              <LotteryCard key={item.lotteryId} item={item} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{
          marginTop: '32px',
          background: 'linear-gradient(145deg, rgba(30,20,5,0.95), rgba(15,11,2,0.98))',
          border: '1px solid rgba(196,146,10,0.45)',
          borderRadius: '16px',
          padding: '32px 24px',
          textAlign: 'center',
        }}>
          <Sparkles size={40} color="#c4920a" style={{ margin: '0 auto 16px', display: 'block' }} className="animate-float" />
          <h2 className="font-cinzel gold-text" style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 700, margin: '0 0 10px' }}>
            El Universo Habla a Través de los Números
          </h2>
          <p style={{ color: 'rgba(232,204,120,0.82)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Descubre el significado oculto de tus sueños, consulta nuestros sorteos
            y chatea con Aurum IA, tu asistente numerológico.
          </p>
          <div className="flex-col-sm-row">
            <a href="/suenos" className="btn-gold" style={{ fontSize: '15px' }}>Interpretar Sueño</a>
            <a href="/chat" className="btn-outline-gold" style={{ fontSize: '15px' }}>Hablar con Aurum IA</a>
          </div>
        </div>
      </section>
    </div>
  );
}
