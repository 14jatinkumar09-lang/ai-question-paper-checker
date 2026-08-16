import React, { useState } from 'react';
import { Check, X, AlertCircle, HelpCircle, Edit3, RotateCcw, MessageSquare, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { EvaluatedQuestion, QuestionStatus, ConfidenceLevel } from '../types';

interface QuestionCardProps {
  question: EvaluatedQuestion;
  index: number;
  onUpdateMarks: (questionId: string, newMarks: number, notes?: string) => void;
  onResetMarks: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onUpdateMarks,
  onResetMarks,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [marksInput, setMarksInput] = useState<string>(question.final_marks.toString());
  const [teacherNotes, setTeacherNotes] = useState<string>(question.teacher_notes || '');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSaveMarks = () => {
    const num = parseFloat(marksInput);
    if (!isNaN(num) && num >= 0 && num <= question.max_marks) {
      onUpdateMarks(question.id, num, teacherNotes);
      setIsEditing(false);
    } else {
      alert(`Please enter a valid mark between 0 and ${question.max_marks}`);
    }
  };

  const handleQuickStep = (delta: number) => {
    const current = parseFloat(marksInput) || 0;
    const nextVal = Math.min(question.max_marks, Math.max(0, current + delta));
    setMarksInput(nextVal.toString());
    onUpdateMarks(question.id, nextVal, teacherNotes);
  };

  // Status Badge Helper
  const getStatusBadge = (status: QuestionStatus) => {
    switch (status) {
      case 'correct':
        return {
          label: 'Correct',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <Check className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'partial':
        return {
          label: 'Partially Correct',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'incorrect':
        return {
          label: 'Incorrect',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <X className="w-3.5 h-3.5 text-rose-600" />,
        };
      case 'unanswered':
        return {
          label: 'Unanswered',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
        };
      case 'review_needed':
      default:
        return {
          label: 'Review Needed',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-indigo-600" />,
        };
    }
  };

  // Confidence Badge Helper
  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'high':
        return {
          label: 'High Confidence',
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50/60',
        };
      case 'medium':
        return {
          label: 'Medium Confidence',
          dot: 'bg-amber-500',
          text: 'text-amber-700',
          bg: 'bg-amber-50/60',
        };
      case 'low':
      default:
        return {
          label: 'Low Confidence — Review Required',
          dot: 'bg-red-500',
          text: 'text-red-700',
          bg: 'bg-red-50 border border-red-200 font-bold',
        };
    }
  };

  const statusBadge = getStatusBadge(question.status);
  const confidenceBadge = getConfidenceBadge(question.confidence);

  return (
    <div
      id={`question-card-${question.id}`}
      className={`rounded-2xl border transition-all ${
        question.confidence === 'low' || question.status === 'review_needed'
          ? 'border-amber-300 bg-amber-50/20 shadow-xs'
          : question.manually_edited
          ? 'border-indigo-200 bg-indigo-50/10 shadow-xs'
          : 'border-slate-200 bg-white hover:border-slate-300'
      } overflow-hidden`}
    >
      {/* Question Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-extrabold text-slate-900 text-base">
            {question.question_number}
          </span>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge.bg}`}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </span>

          {/* Confidence Badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${confidenceBadge.bg} ${confidenceBadge.text}`}
          >
            <span className={`w-2 h-2 rounded-full ${confidenceBadge.dot}`} />
            {confidenceBadge.label}
          </span>

          {/* Manually Modified Badge */}
          {question.manually_edited && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
              <Edit3 className="w-3 h-3" />
              Manually adjusted
            </span>
          )}

          {question.topic && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {question.topic}
            </span>
          )}
          {question.difficulty && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Marks Control & Toggle Area */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Inline Marks Display / Input */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 pl-1.5">
              Marks:
            </span>

            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max={question.max_marks}
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  className="w-16 px-2 py-1 text-sm font-bold text-slate-900 bg-white border border-indigo-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <span className="text-xs font-bold text-slate-600">
                  / {question.max_marks}
                </span>
                <button
                  type="button"
                  onClick={handleSaveMarks}
                  className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  title="Save marks"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMarksInput(question.final_marks.toString());
                    setIsEditing(false);
                  }}
                  className="p-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer group flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 transition-colors"
                  title="Click to edit marks manually"
                >
                  <span className="text-sm font-black text-indigo-700">
                    {question.final_marks}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    / {question.max_marks}
                  </span>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>

                {/* Quick adjustments +/- 0.5 */}
                <div className="hidden sm:flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleQuickStep(-0.5)}
                    disabled={question.final_marks <= 0}
                    className="px-1.5 py-0.5 text-xs font-bold bg-white text-slate-600 hover:bg-slate-200 border border-slate-200 rounded disabled:opacity-30"
                    title="Decrease 0.5"
                  >
                    -0.5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStep(0.5)}
                    disabled={question.final_marks >= question.max_marks}
                    className="px-1.5 py-0.5 text-xs font-bold bg-white text-slate-600 hover:bg-slate-200 border border-slate-200 rounded disabled:opacity-30"
                    title="Increase 0.5"
                  >
                    +0.5
                  </button>
                </div>

                {question.manually_edited && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetMarks(question.id);
                      setMarksInput(question.ai_marks.toString());
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                    title={`Reset to AI score (${question.ai_marks})`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Card Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 text-sm">
          {/* Question Text */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Question Statement
            </span>
            <p className="text-slate-900 font-medium leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              {question.question_text}
            </p>
          </div>

          {/* Student Answer vs Answer Key Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Answer */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Student's Response</span>
                {question.is_ambiguous && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Handwriting/diagram flagged
                  </span>
                )}
              </span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed min-h-[70px]">
                {question.student_answer || (
                  <span className="text-slate-400 italic">No answer provided</span>
                )}
              </div>
            </div>

            {/* Answer Key */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">
                Official Answer Key / Solution
              </span>
              <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/80 text-emerald-950 text-xs font-mono whitespace-pre-wrap leading-relaxed min-h-[70px]">
                {question.correct_answer}
              </div>
            </div>
          </div>

          {/* Evaluation Reason */}
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 block">
                  AI Evaluation Rationale & Step Deductions
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {question.reason}
                </p>
                {question.manually_edited && (
                  <p className="text-[11px] text-indigo-700 font-semibold pt-1 border-t border-slate-200">
                    Original AI Awarded: {question.ai_marks} / {question.max_marks} marks
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
