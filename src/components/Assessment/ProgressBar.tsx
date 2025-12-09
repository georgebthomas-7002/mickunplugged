import './ProgressBar.css';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">
          {current} of {total} ({percentage}%)
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
