import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  SlidersHorizontal, 
  Check, 
  X, 
  AlertCircle, 
  HelpCircle, 
  Edit3,
  Award,
  ChevronRight
} from 'lucide-react';
import { EvaluationReport, EvaluatedQuestion, QuestionStatus } from '../types';
import { QuestionCard } from './QuestionCard';
import { ScoreDonut, StatusDistributionBar } from './AnalyticsCharts';

interface EvaluationReviewProps {
  report: EvaluationReport;
  onUpdateQuestionMarks: (questionId: string, newMarks: number, notes?: string) => void;
  onResetQuestionMarks: (questionId: string) => void;
  onOpenApproveModal: () => void;
  onBackToUpload: () => void;
}

export const EvaluationReview: React.FC<EvaluationReviewProps> = ({
  report,
  onUpdateQuestionMarks,
  onResetQuestionMarks,
  onOpenApproveModal,
  onBackToUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [onlyLowConfidence, setOnlyLowConfidence] = useState(false);
  const [onlyManuallyEdited, setOnlyManuallyEdited] = useState(false);

  // Extract unique topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    report.questions.forEach((q) => {
      if (q.topic) set.add(q.topic);
    });
    return Array.from(set);
  }, [report.questions]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return report.questions.filter((q) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNumber = q.question_number.toLowerCase().includes(query);
        const matchText = q.question_text.toLowerCase().includes(query);
        const matchStudent = (q.student_answer || '').toLowerCase().includes(query);
        const matchCorrect = (q.correct_answer || '').toLowerCase().includes(query);
        const matchTopic = (q.topic || '').toLowerCase().includes(query);
        if (!matchNumber && !matchText && !matchStudent && !matchCorrect && !matchTopic) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && q.status !== statusFilter) {
        return false;
      }

      // Topic
      if (topicFilter !== 'all' && q.topic !== topicFilter) {
        return false;
      }

      // Difficulty
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) {
        return false;
      }

      // Low confidence
      if (onlyLowConfidence && q.confidence !== 'low' && q.status !== 'review_needed') {
        return false;
      }

      // Manually edited
      if (onlyManuallyEdited && !q.manually_edited) {
        return false;
      }

      return true;
    });
  }, [
    report.questions,
    searchQuery,
    statusFilter,
    topicFilter,
    difficultyFilter,
    onlyLowConfidence,
    onlyManuallyEdited,
  ]);

  const lowConfidenceCount = report.questions.filter(
    (q) => q.confidence === 'low' || q.status === 'review_needed'
  ).length;

  return (
    <div id="evaluation-review-screen" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={onBackToUpload}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Uploads
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Student Test Evaluation</span>
            {report.id.includes('DEMO') && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Demo Evaluation
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Student: <strong className="text-slate-800 font-semibold">{report.student_name}</strong> • Subject: <strong className="text-slate-800 font-semibold">{report.subject}</strong> • Test: <strong className="text-slate-800 font-semibold">{report.test_name}</strong>
          </p>
        </div>

        {/* Top Right Quick Approve Trigger */}
        <button
          type="button"
          onClick={onOpenApproveModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95 shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve Results & Generate Report
        </button>
      </div>

      {/* Low Confidence Banner if any questions require attention */}
      {lowConfidenceCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                {lowConfidenceCount} question{lowConfidenceCount > 1 ? 's require' : ' requires'} teacher review
              </p>
              <p className="text-xs text-amber-700">
                Unclear handwriting or subjective calculation steps were flagged for your manual verification.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOnlyLowConfidence(!onlyLowConfidence)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              onlyLowConfidence
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            {onlyLowConfidence ? 'Show All Questions' : 'Filter Review Items'}
          </button>
        </div>
      )}

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Score Ring Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-6 text-center">
          <ScoreDonut
            percentage={report.percentage}
            marksObtained={report.marks_obtained}
            totalMarks={report.total_marks}
            size={150}
          />
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Score Assigned
            </span>
            <div className="text-2xl font-black text-slate-900">
              {report.marks_obtained} <span className="text-base font-semibold text-slate-400">/ {report.total_marks}</span>
            </div>
            <p className="text-xs text-slate-500">
              Accuracy on attempted questions: <strong className="text-slate-800 font-bold">{report.accuracy}%</strong>
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Performance Breakdown
            </span>
            <StatusDistributionBar
              correct={report.correct_count}
              partial={report.partial_count}
              incorrect={report.incorrect_count}
              unanswered={report.unanswered_count}
              total={report.total_questions}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Questions</span>
              <span className="text-lg font-black text-slate-900">
                {report.total_questions} Total
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Attempted</span>
              <span className="text-lg font-black text-indigo-700">
                {report.attempted_count}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Needs Review</span>
              <span className={`text-lg font-black ${lowConfidenceCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {lowConfidenceCount}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Teacher Edited</span>
              <span className="text-lg font-black text-indigo-600">
                {report.manually_adjusted_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by question text, number, solution, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="correct">🟢 Correct</option>
              <option value="partial">🟡 Partial</option>
              <option value="incorrect">🔴 Incorrect</option>
              <option value="unanswered">⚪ Unanswered</option>
              <option value="review_needed">⚠️ Review Needed</option>
            </select>

            {/* Topic Filter */}
            {topics.length > 0 && (
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="all">All Topics</option>
                {topics.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Quick view:</span>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setTopicFilter('all');
              setDifficultyFilter('all');
              setOnlyLowConfidence(false);
              setOnlyManuallyEdited(false);
              setSearchQuery('');
            }}
            className="px-2.5 py-1 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            Reset Filters
          </button>
          <button
            type="button"
            onClick={() => setOnlyLowConfidence(!onlyLowConfidence)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              onlyLowConfidence
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            ⚠️ Low Confidence ({lowConfidenceCount})
          </button>
          <button
            type="button"
            onClick={() => setOnlyManuallyEdited(!onlyManuallyEdited)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              onlyManuallyEdited
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            ✏️ Manually Adjusted ({report.manually_adjusted_count})
          </button>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900">
            Question-by-Question Evaluation ({filteredQuestions.length} of {report.questions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click on any marks value to override AI assessment
          </span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-1">
              No questions match the selected filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setTopicFilter('all');
                setDifficultyFilter('all');
                setOnlyLowConfidence(false);
                setOnlyManuallyEdited(false);
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              onUpdateMarks={onUpdateQuestionMarks}
              onResetMarks={onResetQuestionMarks}
            />
          ))
        )}
      </div>

      {/* Floating Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Current Approved Score:
              </span>
              <span className="text-base sm:text-lg font-black text-indigo-700">
                {report.marks_obtained} / {report.total_marks} ({report.percentage}%)
              </span>
              {report.manually_adjusted_count > 0 && (
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {report.manually_adjusted_count} adjusted
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              You are evaluating {report.questions.length} questions for {report.student_name}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToUpload}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Uploads
            </button>
            <button
              type="button"
              onClick={onOpenApproveModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
