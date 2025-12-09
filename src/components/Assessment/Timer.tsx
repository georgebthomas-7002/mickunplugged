import { useTimer } from '@/hooks';
import './Timer.css';

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
  autoStart?: boolean;
}

function Timer({ initialMinutes, onTimeUp, autoStart = true }: TimerProps) {
  const { formattedTime, isRunning, isTimeUp, start, pause } = useTimer({
    initialMinutes,
    onTimeUp,
    autoStart,
  });

  const getTimerClass = () => {
    if (isTimeUp) return 'timer time-up';
    // Warning when less than 5 minutes remaining
    const warningThreshold = 5 * 60;
    const currentSeconds =
      parseInt(formattedTime.split(':')[0]) * 60 +
      parseInt(formattedTime.split(':')[1]);
    if (currentSeconds <= warningThreshold) return 'timer warning';
    return 'timer';
  };

  return (
    <div className={getTimerClass()}>
      <span className="timer-icon">⏱</span>
      <span className="timer-value">{formattedTime}</span>
      <button
        type="button"
        className="timer-toggle"
        onClick={isRunning ? pause : start}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? '⏸' : '▶'}
      </button>
    </div>
  );
}

export default Timer;
