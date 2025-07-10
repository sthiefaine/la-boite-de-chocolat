import { useState, useEffect } from 'react';

interface UseCountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  start?: number;
}

export const useCountUp = ({ 
  end, 
  duration = 2000, 
  delay = 0, 
  start = 0 
}: UseCountUpProps) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Fonction d'easing pour un effet plus naturel
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(start + (end - start) * easeOutQuart);
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      requestAnimationFrame(updateCount);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, duration, delay, start]);

  return count;
}; 