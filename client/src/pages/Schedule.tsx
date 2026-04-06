import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, Star } from 'lucide-react';
import { api, Lottery } from '../api';

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TODAY_DAY = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

function LotteryScheduleCard({ lottery }: { lottery: Lottery }) {
  const todayDraws = lottery.schedule.filter(s => s.day === TODAY_DAY);

  return (
    <div className="lottery-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: lottery.color }} />
        <h3 className="font-cinzel font-semibold text-gold-300 text-base sm:text-lg">{lottery.name}</h3>
        {todayDraws.length > 0 && (
          <span className="ml-auto text-xs text-gold-400 bg-gold-400/10 border border-gold-400/30 px-2 py-0.5 rounded-full animate-pulse">
            HOY
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {DAYS_ORDER.map(day => {
          const draws = lottery.schedule.filter(s => s.day === day);
          if (draws.length === 0) return null;
          return (
            <div key={day} className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg
              ${day === TODAY_DAY ? 'bg-gold-400/10 border border-gold-400/20' : 'bg-black/20'}`}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-gold-600/60 flex-shrink-0" />
                <span className={`text-xs sm:text-sm ${day === TODAY_DAY ? 'text-gold-300 font-semibold' : 'text-gold-200/60'}`}>
                  {day}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {draws.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold-600/60" />
                    <span className="text-gold-400 text-xs font-medium">{d.time}</span>
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 text-gold-400/70 text-xs mb-3 tracking-widest uppercase">
          <Star className="w-3 h-3" />
          <span>Calendario de Sorteos</span>
          <Star className="w-3 h-3" />
        </div>
        <h1 className="font-cinzel text-2xl sm:text-4xl font-bold gold-text mb-2">Horarios de Loterías</h1>
        <p className="text-gold-400/50 text-sm max-w-xl mx-auto">
          Todos los sorteos de la República Dominicana.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <span className="text-gold-300 text-xs font-medium">Hoy: {TODAY_DAY}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="lottery-card animate-pulse h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data?.draws.map(lottery => <LotteryScheduleCard key={lottery.id} lottery={lottery} />)}
        </div>
      )}
    </div>
  );
}
