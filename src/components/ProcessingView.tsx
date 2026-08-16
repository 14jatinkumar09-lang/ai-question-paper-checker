import React from 'react';
import { CheckCircle2, Loader2, Sparkles, AlertTriangle, FileCheck, Layers, Award } from 'lucide-react';
import { ProcessingStage } from '../types';

interface ProcessingViewProps {
  progressPercent: number;
  currentStatusText: string;
  stages: ProcessingStage[];
  checkedCount: number;
  totalQuestionsCount: number;
  onCancel?: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({
  progressPercent,
  currentStatusText,
  stages,
  checkedCount,
  totalQuestionsCount,
  onCancel,
}) => {
  return (
    <div id="ai-processing-container" className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          Multimodal Gemini AI Engine Active
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          AI Checking in Progress
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Correlating Question Paper, Student Answer Sheet, and Answer Key with OCR and semantic step-evaluation.
        </p>
      </div>

      {/* Main Card with Progress Bar & Question Counter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
            <span className="text-sm font-bold text-slate-800">
              Overall Progress
            </span>
          </div>
          <span className="text-2xl font-black text-indigo-600">
            {Math.min(100, Math.max(0, Math.round(progressPercent)))}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden mb-4 border border-slate-200/60">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>

        {/* Live Status Message & Question Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-slate-100">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold bg-indigo-50/70 px-3 py-1.5 rounded-lg border border-indigo-100">
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
            <span className="truncate">{currentStatusText || 'Analyzing documents...'}</span>
          </div>

          {totalQuestionsCount > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium">
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>Questions Checked:</span>
              <span className="font-bold text-slate-900">
                {checkedCount} / {totalQuestionsCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Structured Pipeline Stages */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Evaluation Pipeline Stages
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isProcessing = stage.status === 'processing';
            const isError = stage.status === 'error';
            const isPending = stage.status === 'pending';

            return (
              <div
                key={stage.id || idx}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : isProcessing
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-xs'
                    : isError
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-slate-50/40 border-slate-200/60 text-slate-500'
                }`}
              >
                {/* Icon Indicator */}
                <div className="shrink-0">
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {isProcessing && (
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  )}
                  {isError && (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  {isPending && (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-semibold text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Stage Title */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isProcessing
                        ? 'text-indigo-950 font-bold'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {isCompleted && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                  {isProcessing && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] font-medium text-slate-400">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
