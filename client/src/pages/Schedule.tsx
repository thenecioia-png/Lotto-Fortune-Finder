import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, Star } from 'lucide-react';
import { api, Lottery } from '../api';

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TODAY_DAY = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

function LotteryScheduleCard({ lottery }: { lottery: Lottery }) {
  const todayDraws = lottery.schedule.filter(s => s.day === TODAY_DAY);

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(30,20,5,0.97), rgba(18,12,2,0.99))',
      border: '1px solid rgba(196,146,10,0.50)',
      borderRadius: '14px',
      padding: '20px',
      width: '100%',
    }}>
      {/* Header de la lotería */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{
          width: '13px', height: '13px', borderRadius: '50%', flexShrink: 0,
          backgroundColor: lottery.color,
          boxShadow: `0 0 8px ${lottery.color}88`,
        }} />
        <h3 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '22px',
          fontWeight: 700,
          color: '#ffffff',
          margin: 0,
          lineHeight: 1.2,
          flex: 1,
        }}>
          {lottery.name}
        </h3>
        {todayDraws.length > 0 && (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#c4920a',
            background: 'rgba(196,146,10,0.15)',
            border: '1px solid rgba(196,146,10,0.4)',
            borderRadius: '20px',
            padding: '3px 10px',
            animation: 'pulse 2s infinite',
            flexShrink: 0,
          }}>
            HOY
          </span>
        )}
      </div>

      {/* Filas de horarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {DAYS_ORDER.map(day => {
          const draws = lottery.schedule.filter(s => s.day === day);
          if (draws.length === 0) return null;
          const isToday = day === TODAY_DAY;
          return (
            <div key={day} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 14px',
              borderRadius: '10px',
              background: isToday ? 'rgba(196,146,10,0.12)' : 'rgba(0,0,0,0.25)',
              border: isToday ? '1px solid rgba(196,146,10,0.35)' : '1px solid rgba(196,146,10,0.08)',
            }}>
              {/* Día */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} color={isToday ? '#c4920a' : 'rgba(196,146,10,0.5)'} />
                <span style={{
                  fontSize: '18px',
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? '#FFD700' : 'rgba(232,204,120,0.80)',
                  lineHeight: 1,
                }}>
                  {day}
                </span>
              </div>

              {/* Horarios */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {draws.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={14} color={isToday ? '#FFD700' : 'rgba(196,146,10,0.6)'} />
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: isToday ? '#ffffff' : 'rgba(232,204,120,0.85)',
                      lineHeight: 1,
                    }}>
                      {d.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Schedule() {
  const { data, isLoading } = useQuery({
    queryKey: ['lottery-draws'],
    queryFn: api.getDraws,
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px 32px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#c4920a', fontSize: '11px', marginBottom: '12px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.85 }}>
          <Star size={11} />
          <span>Calendario de Sorteos</span>
          <Star size={11} />
        </div>
        <h1 className="font-cinzel gold-text" style={{ fontSize: 'clamp(24px, 7vw, 40px)', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.1 }}>
          Horarios de Loterías
        </h1>
        <p style={{ color: 'rgba(196,146,10,0.80)', fontSize: '14px', margin: '0 0 14px' }}>
          Todos los sorteos de la República Dominicana.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(196,146,10,0.12)', border: '1px solid rgba(196,146,10,0.35)',
          borderRadius: '20px', padding: '6px 16px',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c4920a', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#e8cc78', fontSize: '13px', fontWeight: 600 }}>Hoy: {TODAY_DAY}</span>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{
              height: '200px', borderRadius: '14px',
              background: 'rgba(30,20,5,0.6)', border: '1px solid rgba(196,146,10,0.2)',
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data?.draws.map(lottery => (
            <LotteryScheduleCard key={lottery.id} lottery={lottery} />
          ))}
        </div>
      )}
    </div>
  );
}
