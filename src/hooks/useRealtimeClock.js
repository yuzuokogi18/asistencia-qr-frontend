import { useState, useEffect } from 'react';

/**
 * Hook para reloj digital en tiempo real con fecha en español (México)
 */
export const useRealtimeClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
  const timeFormatted = `${String(hours12).padStart(2, '0')}:${minutes}:${seconds}`;

  const dateFormatted = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

  return {
    time: timeFormatted,
    seconds,
    ampm,
    date: dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1),
    rawDate: now
  };
};
