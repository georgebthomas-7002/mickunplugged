import { useState, useEffect, useCallback } from 'react';

interface UseTimerOptions {
  initialMinutes: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isTimeUp: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  formattedTime: string;
}

export function useTimer({
  initialMinutes,
  onTimeUp,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    let intervalId: number | undefined;

    if (isRunning && timeRemaining > 0) {
      intervalId = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsTimeUp(true);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeRemaining, onTimeUp]);

  const start = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeRemaining(initialMinutes * 60);
    setIsRunning(false);
    setIsTimeUp(false);
  }, [initialMinutes]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    isRunning,
    isTimeUp,
    start,
    pause,
    reset,
    formattedTime: formatTime(timeRemaining),
  };
}
