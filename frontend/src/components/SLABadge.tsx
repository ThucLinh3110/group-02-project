import React, { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

interface SLABadgeProps {
  dueDate?: string;
  createdAt?: string;
  status: string;
}

const SLABadge: React.FC<SLABadgeProps> = ({ dueDate, createdAt, status }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isBreached, setIsBreached] = useState(false);

  useEffect(() => {
    if (!dueDate || !createdAt || status === 'Closed' || status === 'Resolved') return;

    const due = new Date(dueDate);
    const created = new Date(createdAt);
    const total = differenceInSeconds(due, created);
    setTotalTime(total);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = differenceInSeconds(due, now);
      
      setTimeLeft(diff);
      setIsBreached(diff <= 0);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [dueDate, createdAt, status]);

  if (!dueDate || !createdAt) return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">No SLA</span>;
  if (status === 'Closed' || status === 'Resolved') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold shadow-sm transition-all bg-slate-100 text-slate-600 border-slate-200">
        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
        <span>Done</span>
      </div>
    );
  }

  // Format time
  const absTime = Math.abs(timeLeft);
  const hours = Math.floor(absTime / 3600);
  const minutes = Math.floor((absTime % 3600) / 60);
  const seconds = absTime % 60;
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Determine colors based on rules
  // Green: > 25% remaining
  // Yellow (At Risk): <= 25% remaining or <= 1 hour
  // Red: <= 0 (Breached)
  let colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  let pulseClass = "";
  let label = "On Track";

  const isAtRisk = timeLeft <= (totalTime * 0.25) || timeLeft <= 3600;

  if (isBreached) {
    colorClass = "bg-red-100 text-red-700 border-red-200";
    pulseClass = "animate-pulse";
    label = "Breached";
  } else if (isAtRisk) {
    colorClass = "bg-amber-100 text-amber-700 border-amber-200";
    label = "At Risk";
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold shadow-sm transition-all ${colorClass}`}>
      <div className={`w-2 h-2 rounded-full ${isBreached ? 'bg-red-500 animate-pulse' : (timeLeft <= 3600 ? 'bg-amber-500' : 'bg-emerald-500')} ${pulseClass}`}></div>
      <span>{label}</span>
      <span className="font-mono bg-white/50 px-1.5 rounded">{isBreached ? '-' : ''}{formattedTime}</span>
    </div>
  );
};

export default SLABadge;
