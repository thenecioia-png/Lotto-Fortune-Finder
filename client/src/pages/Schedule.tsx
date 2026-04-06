import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, Star } from 'lucide-react';
import { api, Lottery } from '../api';

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const TODAY_DAY = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

function LotteryScheduleCard({ lottery }: { lottery: Lottery }) {
  const todayDraws = lottery.schedule.filter(s => s.day === TODAY_DAY);

  return (
    <div className="lottery-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: lottery.color }} />
        <h3 className="font-cinzel font-semibold text-gold-300 text-lg">{lottery.name}</h3>
        {todayDraws.length > 0 && (
          <span className="ml-auto text-xs text-gold-400 bg-gold-900/40 border border-gold-700/30 px-2 py-0.5 rounded-full animate-pulse">
            HOY
          </span>
        )}
      </div>

      <div className="space-y-2">
        {DAYS_ORDER.map(day => {
          const draws = lottery.schedule.filter(s => s.day === day);
          if (draws.length === 0) return null;
          return (
            <div key={day} className={`flex items-center justify-between py-2 px-3 rounded-lg
              ${day === TODAY_DAY ? 'bg-gold-900/30 border border-gold-700/30' : 'bg-dark-100/50'}`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gold-600/60" />
                <span className={`text-sm ${day === TODAY_DAY ? 'text-gold-300 font-semibold' : 'text-gold-200/70'}`}>
                  {day}
                </span>
              </div>
              <div className="flex gap-3">
                {draws.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold-600/60" />
                    <span className="text-gold-400 text-sm font-medium">{d.time}</span>
                    <span className="text-gold-600/50 text-xs">({d.type})</span>
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
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-gold-400/70 text-sm mb-4 tracking-widest uppercase">
          <Star className="w-3 h-3" />
          <span>Calendario de Sorteos</span>
          <Star className="w-3 h-3" />
        </div>
        <h1 className="font-cinzel text-4xl font-bold gold-text mb-3">Horarios de Loterías</h1>
        <p className="text-gold-200/50 max-w-xl mx-auto">
          Todos los sorteos de la República Dominicana. El día de hoy está resaltado en cada lotería.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-gold-900/20 border border-gold-700/30 rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <span className="text-gold-300 text-sm font-medium">Hoy: {TODAY_DAY}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="lottery-card animate-pulse h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data?.draws.map(lottery => (
            <LotteryScheduleCard key={lottery.id} lottery={lottery} />
          ))}
        </div>
      )}
    </div>
  );
}
