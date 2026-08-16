import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Printer, 
  RotateCcw, 
  Edit3, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb, 
  BookOpen, 
  Target, 
  Layers, 
  Check, 
  GraduationCap 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EvaluationReport } from '../types';
import { ScoreDonut, StatusDistributionBar, TopicAnalysisChart, DifficultyAnalysisChart } from './AnalyticsCharts';
import { generatePdfFromElement } from '../utils/pdfGenerator';

interface StudentReportProps {
  report: EvaluationReport;
  onEditStudentName: (newName: string) => void;
  onBackToReview: () => void;
  onNewTest: () => void;
}

export const StudentReport: React.FC<StudentReportProps> = ({
  report,
  onEditStudentName,
  onBackToReview,
  onNewTest,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(report.student_name);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on initial report load
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onEditStudentName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePdfFromElement(
        'student-printable-report',
        `${report.student_name.replace(/\s+/g, '_')}_Test_Report.pdf`
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', label: 'Outstanding', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (pct >= 80) return { grade: 'A', label: 'Excellent', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (pct >= 70) return { grade: 'B+', label: 'Very Good', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (pct >= 60) return { grade: 'B', label: 'Good', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (pct >= 50) return { grade: 'C', label: 'Average', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { grade: 'Needs Focus', label: 'Requires Remedial Support', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  const gradeInfo = getGrade(report.percentage);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToReview}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Marks
          </button>
          <button
            type="button"
            onClick={onNewTest}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Check Another Test
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        id="student-printable-report"
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Institute Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-100 print:shadow-none">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {report.institution_name}
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Official Student Performance & Diagnostic Assessment
              </p>
            </div>
          </div>

          <div className="sm:text-right text-xs text-slate-500 space-y-0.5">
            <div>
              Report Ref: <strong className="text-slate-800 font-mono">{report.id}</strong>
            </div>
            <div>Date: {report.evaluation_date}</div>
            <div className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Teacher Verified
            </div>
          </div>
        </div>

        {/* Student & Test Meta Grid */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Student Name */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Student Name
              </span>
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2 py-1 text-xs font-bold text-slate-900 bg-white border border-indigo-500 rounded-lg focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group">
                  <span className="text-sm font-black text-slate-900">
                    {report.student_name}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-indigo-600 print:hidden transition-colors"
                    title="Edit student name"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
              {!report.is_name_detected && (
                <span className="text-[10px] text-amber-700 block font-medium mt-0.5">
                  (Manually entered)
                </span>
              )}
            </div>

            {/* Subject */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Subject
              </span>
              <span className="text-sm font-bold text-slate-900">
                {report.subject}
              </span>
            </div>

            {/* Test Name */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Assessment
              </span>
              <span className="text-sm font-bold text-slate-900">
                {report.test_name}
              </span>
            </div>

            {/* Evaluated By */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Evaluator
              </span>
              <span className="text-sm font-bold text-indigo-700">
                {report.evaluator_name || 'Verified Faculty'}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Score Card & Visual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Score Donut */}
          <div className="md:col-span-5 bg-indigo-50/40 rounded-3xl border border-indigo-100 p-6 flex flex-col items-center justify-center text-center">
            <ScoreDonut
              percentage={report.percentage}
              marksObtained={report.marks_obtained}
              totalMarks={report.total_marks}
              size={160}
            />
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${gradeInfo.color}`}>
                Grade: {gradeInfo.grade} ({gradeInfo.label})
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="md:col-span-7 flex flex-col justify-between gap-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 block mb-2">
                Response Breakdown
              </span>
              <StatusDistributionBar
                correct={report.correct_count}
                partial={report.partial_count}
                incorrect={report.incorrect_count}
                unanswered={report.unanswered_count}
                total={report.total_questions}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Questions</span>
                <span className="text-lg font-black text-slate-900">{report.total_questions}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Questions Attempted</span>
                <span className="text-lg font-black text-indigo-700">{report.attempted_count}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Accuracy Rate</span>
                <span className="text-lg font-black text-emerald-700">{report.accuracy}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 10: AI Diagnostic Analysis Sections */}
        <div className="space-y-6 pt-4 border-t border-slate-200">
          {/* Overall Performance */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Overall Performance Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {report.overall_performance}
            </p>
          </div>

          {/* Strengths & Weak Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-200/80">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths
              </h3>
              <ul className="space-y-2 text-xs text-slate-800">
                {report.strengths.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak Areas */}
            <div className="bg-rose-50/40 rounded-2xl p-5 border border-rose-200/80">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Focus & Weak Areas
              </h3>
              <ul className="space-y-2 text-xs text-slate-800">
                {report.weak_areas.map((wa, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{wa}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Topic / Chapter Analysis */}
          {report.topic_analysis && report.topic_analysis.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Topic & Chapter-wise Mastery
              </h3>
              <TopicAnalysisChart topics={report.topic_analysis} />
            </div>
          )}

          {/* Difficulty Analysis */}
          {report.difficulty_analysis && report.difficulty_analysis.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Difficulty Level Performance
              </h3>
              <DifficultyAnalysisChart difficulties={report.difficulty_analysis} />
            </div>
          )}

          {/* Mistake Pattern Analysis */}
          {report.mistake_analysis && report.mistake_analysis.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                Mistake Pattern Diagnostics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.mistake_analysis.map((m, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{m.type} Mistakes</span>
                      <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        {m.count} instance{m.count > 1 ? 's' : ''} ({m.affected_questions.join(', ')})
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Recommendations */}
          {report.improvement_recommendations && report.improvement_recommendations.length > 0 && (
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-200">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                Targeted Improvement Recommendations
              </h3>
              <div className="space-y-2 text-xs text-indigo-950">
                {report.improvement_recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/80 p-3 rounded-xl border border-indigo-100">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Full Question-by-Question Audit Table */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Question-wise Evaluation Log
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3">Q#</th>
                  <th className="py-3 px-3">Topic</th>
                  <th className="py-3 px-3">Max Marks</th>
                  <th className="py-3 px-3">Marks Awarded</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Evaluation Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {report.questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold">{q.question_number}</td>
                    <td className="py-2.5 px-3 text-slate-500">{q.topic || 'General'}</td>
                    <td className="py-2.5 px-3 font-semibold">{q.max_marks}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-700">
                      {q.final_marks}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.status === 'correct'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : q.status === 'incorrect'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {q.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 leading-relaxed">
                      {q.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Institute Sign-Off Footer */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
          <div>
            <span className="font-bold text-slate-900 block mb-1">Evaluation Methodology</span>
            <p className="text-slate-500 leading-relaxed">
              Evaluated strictly per the Standardized Academic Question-by-Question Marking Scheme & Step Criteria. Verified and authorized by Institute Academic Faculty.
            </p>
          </div>
          <div className="text-right flex flex-col justify-end items-end">
            <div className="w-40 border-b border-slate-400 mb-1" />
            <span className="font-bold text-slate-900">{report.evaluator_name || 'Academic Faculty Incharge'}</span>
            <span className="text-slate-500 text-[11px]">Authorized Signatory</span>
          </div>
        </div>
      </div>

      {/* Bottom Download & Actions Bar (Hidden in Print) */}
      <div className="print:hidden mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Student Performance Marksheet Ready
          </h4>
          <p className="text-xs text-slate-500">
            Download the official high-resolution PDF report to share with students and parents.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            id="download-report-btn"
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
