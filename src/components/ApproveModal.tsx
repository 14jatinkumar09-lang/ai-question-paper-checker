import React, { useState } from 'react';
import { CheckCircle2, X, AlertTriangle, ShieldCheck, UserCheck, Award } from 'lucide-react';
import { EvaluationReport } from '../types';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (evaluatorName?: string) => void;
  report: EvaluationReport;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  onConfirmApprove,
  report,
}) => {
  const [evaluatorName, setEvaluatorName] = useState('Faculty Evaluator');

  if (!isOpen) return null;

  const lowConfidenceCount = report.questions.filter(
    (q) => q.confidence === 'low' || q.status === 'review_needed'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-indigo-600 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-indigo-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            Approve & Lock Evaluation
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            Verify score calculation before generating official student performance report.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Student:</span>
              <span className="text-xs font-bold text-slate-900">{report.student_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Subject / Test:</span>
              <span className="text-xs font-bold text-slate-900">{report.subject}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
              <span className="text-sm font-bold text-slate-800">Final Evaluated Score:</span>
              <div className="text-right">
                <span className="text-lg font-black text-indigo-700">
                  {report.marks_obtained} / {report.total_marks}
                </span>
                <span className="text-xs font-bold text-indigo-600 block">
                  ({report.percentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* Verification Statistics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total Questions</span>
              <span className="font-bold text-slate-900 text-sm">
                {report.questions.length} Evaluated
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Manually Adjusted</span>
              <span className="font-bold text-indigo-700 text-sm">
                {report.manually_adjusted_count} Questions
              </span>
            </div>
          </div>

          {/* Low Confidence Warning if any */}
          {lowConfidenceCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {lowConfidenceCount} question{lowConfidenceCount > 1 ? 's' : ''} had low AI confidence.
                </span>
                <span>
                  Ensure you have verified these questions before final sign-off.
                </span>
              </div>
            </div>
          )}

          {/* Teacher / Evaluator Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Evaluator / Teacher Name (for report sign-off)
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="Enter teacher name"
                className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Go Back & Edit
          </button>
          <button
            type="button"
            onClick={() => onConfirmApprove(evaluatorName)}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};
