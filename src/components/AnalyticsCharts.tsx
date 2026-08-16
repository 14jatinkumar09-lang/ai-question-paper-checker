import React from 'react';
import { TopicPerformance, DifficultyPerformance } from '../types';

interface ScoreDonutProps {
  percentage: number;
  marksObtained: number;
  totalMarks: number;
  size?: number;
}

export const ScoreDonut: React.FC<ScoreDonutProps> = ({
  percentage,
  marksObtained,
  totalMarks,
  size = 140,
}) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 80) return '#10b981'; // Emerald
    if (pct >= 60) return '#3b82f6'; // Blue
    if (pct >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(validPercentage)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Centered Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {validPercentage}%
        </span>
        <span className="text-xs font-semibold text-slate-500">
          {marksObtained} / {totalMarks}
        </span>
      </div>
    </div>
  );
};

interface StatusDonutProps {
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  total: number;
}

export const StatusDistributionBar: React.FC<StatusDonutProps> = ({
  correct,
  partial,
  incorrect,
  unanswered,
  total,
}) => {
  const safeTotal = total || 1;
  const correctPct = (correct / safeTotal) * 100;
  const partialPct = (partial / safeTotal) * 100;
  const incorrectPct = (incorrect / safeTotal) * 100;
  const unansweredPct = (unanswered / safeTotal) * 100;

  return (
    <div className="w-full">
      {/* Segmented Bar */}
      <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200/80 mb-3">
        {correctPct > 0 && (
          <div
            style={{ width: `${correctPct}%` }}
            className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
            title={`Correct: ${correct} (${correctPct.toFixed(0)}%)`}
          />
        )}
        {partialPct > 0 && (
          <div
            style={{ width: `${partialPct}%` }}
            className="bg-amber-400 h-full transition-all duration-500"
            title={`Partial: ${partial} (${partialPct.toFixed(0)}%)`}
          />
        )}
        {incorrectPct > 0 && (
          <div
            style={{ width: `${incorrectPct}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Incorrect: ${incorrect} (${incorrectPct.toFixed(0)}%)`}
          />
        )}
        {unansweredPct > 0 && (
          <div
            style={{ width: `${unansweredPct}%` }}
            className="bg-slate-300 h-full rounded-r-full transition-all duration-500"
            title={`Unanswered: ${unanswered} (${unansweredPct.toFixed(0)}%)`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Correct:</span>
          <span className="font-bold text-slate-900">{correct}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span>Partial:</span>
          <span className="font-bold text-slate-900">{partial}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span>Incorrect:</span>
          <span className="font-bold text-slate-900">{incorrect}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
          <span>Unanswered:</span>
          <span className="font-bold text-slate-900">{unanswered}</span>
        </div>
      </div>
    </div>
  );
};

interface TopicAnalysisProps {
  topics: TopicPerformance[];
}

export const TopicAnalysisChart: React.FC<TopicAnalysisProps> = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic py-2">
        Topic breakdown will be populated once question papers are classified.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((t, idx) => {
        const accuracy = Math.round(t.accuracy || ((t.obtained_marks || 0) / (t.max_marks || 1)) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 truncate">{t.topic}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  {t.obtained_marks}/{t.max_marks} marks ({t.correct_questions}/{t.total_questions} Qs)
                </span>
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    accuracy >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : accuracy >= 50
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {accuracy}%
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  accuracy >= 75
                    ? 'bg-emerald-500'
                    : accuracy >= 50
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, accuracy)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DifficultyAnalysisProps {
  difficulties: DifficultyPerformance[];
}

export const DifficultyAnalysisChart: React.FC<DifficultyAnalysisProps> = ({ difficulties }) => {
  if (!difficulties || difficulties.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic py-2">
        Difficulty analysis not available.
      </p>
    );
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50' };
      case 'medium':
        return { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' };
      case 'hard':
        return { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50' };
      default:
        return { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-50' };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {difficulties.map((d, idx) => {
        const accuracy = Math.round(d.accuracy || ((d.obtained_marks || 0) / (d.max_marks || 1)) * 100);
        const colors = getDifficultyColor(d.difficulty);

        return (
          <div
            key={idx}
            className={`p-3 rounded-xl border border-slate-200/80 ${colors.light} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}>
                {d.difficulty}
              </span>
              <span className="text-xs font-black text-slate-900">{accuracy}%</span>
            </div>
            <div className="w-full bg-white rounded-full h-2 overflow-hidden mb-2 border border-slate-200">
              <div
                className={`h-full ${colors.bg} rounded-full`}
                style={{ width: `${Math.min(100, accuracy)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>{d.correct_questions}/{d.total_questions} Questions</span>
              <span className="font-semibold">{d.obtained_marks}/{d.max_marks} M</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
