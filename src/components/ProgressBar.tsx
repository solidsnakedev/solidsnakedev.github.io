import { useState, useEffect } from 'react';

interface ProgressBarProps {
  label: string;
  percentage: number;
  width?: number;
}

export default function ProgressBar({ label, percentage, width = 10 }: ProgressBarProps) {
  const [currentPercent, setCurrentPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPercent < percentage) {
        setCurrentPercent(prev => Math.min(prev + 3, percentage));
      }
    }, 15);
    return () => clearTimeout(timer);
  }, [currentPercent, percentage]);

  const filled = Math.floor((currentPercent / 100) * width);
  const empty = width - filled;

  return (
    <div className="flex items-center font-mono gap-2">
      <span className="text-amber-500 w-20 shrink-0 truncate">{label}:</span>
      <span className="text-white whitespace-nowrap">
        {'█'.repeat(filled)}{'░'.repeat(empty)}
      </span>
      <span className="text-amber-500/80 w-10 text-right">{currentPercent}%</span>
    </div>
  );
}