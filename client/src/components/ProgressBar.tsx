import React from 'react';

interface ProgressBarProps {
  percentage: number;
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, colorClass = 'bg-indigo-600' }) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
