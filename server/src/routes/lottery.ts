import { Router, Request, Response } from 'express';

export const lotteryRouter = Router();

const LOTTERIES = [
  {
    id: 'nacional',
    name: 'Lotería Nacional',
    shortName: 'Nacional',
    color: '#DAA520',
    schedule: [
      { day: 'Lunes', time: '3:00 PM', type: 'Tarde' },
      { day: 'Lunes', time: '9:00 PM', type: 'Noche' },
      { day: 'Miércoles', time: '3:00 PM', type: 'Tarde' },
      { day: 'Miércoles', time: '9:00 PM', type: 'Noche' },
      { day: 'Viernes', time: '3:00 PM', type: 'Tarde' },
      { day: 'Viernes', time: '9:00 PM', type: 'Noche' },
      { day: 'Sábado', time: '3:00 PM', type: 'Tarde' },
      { day: 'Sábado', time: '9:00 PM', type: 'Noche' },
      { day: 'Domingo', time: '3:00 PM', type: 'Tarde' },
    ],
  },
  {
    id: 'leidsa',
    name: 'Leidsa',
    shortName: 'Leidsa',
    color: '#C0392B',
    schedule: [
      { day: 'Lunes', time: '8:00 PM', type: 'Noche' },
      { day: 'Martes', time: '8:00 PM', type: 'Noche' },
      { day: 'Miércoles', time: '8:00 PM', type: 'Noche' },
      { day: 'Jueves', time: '8:00 PM', type: 'Noche' },
      { day: 'Viernes', time: '8:00 PM', type: 'Noche' },
      { day: 'Sábado', time: '8:00 PM', type: 'Noche' },
      { day: 'Domingo', time: '3:00 PM', type: 'Tarde' },
    ],
  },
  {
    id: 'real',
    name: 'Lotería Real',
    shortName: 'Real',
    color: '#1A5276',
    schedule: [
      { day: 'Lunes', time: '9:00 PM', type: 'Noche' },
      { day: 'Martes', time: '9:00 PM', type: 'Noche' },
      { day: 'Miércoles', time: '9:00 PM', type: 'Noche' },
      { day: 'Jueves', time: '9:00 PM', type: 'Noche' },
      { day: 'Viernes', time: '9:00 PM', type: 'Noche' },
      { day: 'Sábado', time: '9:00 PM', type: 'Noche' },
      { day: 'Domingo', time: '3:00 PM', type: 'Tarde' },
    ],
  },
  {
    id: 'loteka',
    name: 'Loteka',
    shortName: 'Loteka',
    color: '#117A65',
    schedule: [
      { day: 'Lunes', time: '8:55 PM', type: 'Noche' },
      { day: 'Martes', time: '8:55 PM', type: 'Noche' },
      { day: 'Miércoles', time: '8:55 PM', type: 'Noche' },
      { day: 'Jueves', time: '8:55 PM', type: 'Noche' },
      { day: 'Viernes', time: '8:55 PM', type: 'Noche' },
      { day: 'Sábado', time: '8:55 PM', type: 'Noche' },
      { day: 'Domingo', time: '3:00 PM', type: 'Tarde' },
    ],
  },
  {
    id: 'ny-evening',
    name: 'New York Evening',
    shortName: 'NY Noche',
    color: '#6C3483',
    schedule: [
      { day: 'Lunes', time: '10:30 PM', type: 'Noche' },
      { day: 'Martes', time: '10:30 PM', type: 'Noche' },
      { day: 'Miércoles', time: '10:30 PM', type: 'Noche' },
      { day: 'Jueves', time: '10:30 PM', type: 'Noche' },
      { day: 'Viernes', time: '10:30 PM', type: 'Noche' },
      { day: 'Sábado', time: '10:30 PM', type: 'Noche' },
      { day: 'Domingo', time: '10:30 PM', type: 'Noche' },
    ],
  },
  {
    id: 'ny-midday',
    name: 'New York Mediodía',
    shortName: 'NY Día',
    color: '#7D6608',
    schedule: [
      { day: 'Lunes', time: '2:30 PM', type: 'Tarde' },
      { day: 'Martes', time: '2:30 PM', type: 'Tarde' },
      { day: 'Miércoles', time: '2:30 PM', type: 'Tarde' },
      { day: 'Jueves', time: '2:30 PM', type: 'Tarde' },
      { day: 'Viernes', time: '2:30 PM', type: 'Tarde' },
      { day: 'Sábado', time: '2:30 PM', type: 'Tarde' },
      { day: 'Domingo', time: '2:30 PM', type: 'Tarde' },
    ],
  },
];

function generateLuckyNumbers(seed: string): string[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const numbers: string[] = [];
  let s = Math.abs(hash);
  while (numbers.length < 4) {
    const n = (s % 100).toString().padStart(2, '0');
    if (!numbers.includes(n)) numbers.push(n);
    s = Math.floor(s / 7) + 13;
    if (s === 0) s = 42;
  }
  return numbers;
}

lotteryRouter.get('/draws', (_req: Request, res: Response) => {
  res.json({ draws: LOTTERIES });
});

lotteryRouter.get('/lucky-numbers', (_req: Request, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const luckyNumbers = LOTTERIES.map(lottery => ({
    lotteryId: lottery.id,
    lotteryName: lottery.name,
    color: lottery.color,
    numbers: generateLuckyNumbers(`${today}-${lottery.id}`),
    date: today,
  }));

  res.json({ luckyNumbers, date: today });
});
