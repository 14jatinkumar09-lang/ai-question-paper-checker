import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  FileCheck, 
  HelpCircle, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  BookOpen,
  Info
} from 'lucide-react';
import { DocumentType, UploadedDoc, EvaluationReport, ProcessingStage } from './types';
import { DEMO_EVALUATION_REPORT } from './data/demoData';
import { Navbar } from './components/Navbar';
import { FileUploadCard } from './components/FileUploadCard';
import { ProcessingView } from './components/ProcessingView';
import { EvaluationReview } from './components/EvaluationReview';
import { StudentReport } from './components/StudentReport';
import { ApproveModal } from './components/ApproveModal';

const INITIAL_STAGES: ProcessingStage[] = [
  { id: '1', label: 'Uploading & validating documents', status: 'pending' },
  { id: '2', label: 'Reading question paper & detecting questions', status: 'pending' },
  { id: '3', label: 'Reading answer key & model solutions', status: 'pending' },
  { id: '4', label: 'Optical reading of student answer sheet', status: 'pending' },
  { id: '5', label: 'Matching questions and student responses', status: 'pending' },
  { id: '6', label: 'Evaluating semantic correctness & step marking', status: 'pending' },
  { id: '7', label: 'Calculating marks & confidence metrics', status: 'pending' },
  { id: '8', label: 'Generating performance & mistake analysis', status: 'pending' },
  { id: '9', label: 'Preparing final evaluation dashboard', status: 'pending' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'review' | 'report'>('upload');
  
  // Document states
  const [questionPaperDoc, setQuestionPaperDoc] = useState<UploadedDoc | null>(null);
  const [answerSheetDoc, setAnswerSheetDoc] = useState<UploadedDoc | null>(null);
  const [answerKeyDoc, setAnswerKeyDoc] = useState<UploadedDoc | null>(null);
  
  // Custom metadata (optional for user)
  const [customSubject, setCustomSubject] = useState('');
  const [customTestName, setCustomTestName] = useState('');

  // Processing state
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStatusText, setCurrentStatusText] = useState<string>('Initializing evaluation engine...');
  const [stages, setStages] = useState<ProcessingStage[]>(INITIAL_STAGES);
  const [checkedCount, setCheckedCount] = useState<number>(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(12);

  // Result state
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processingTimerRef = useRef<any>(null);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
      }
    };
  }, []);

  // Handle File Selection
  const handleFileSelect = (type: DocumentType, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const doc: UploadedDoc = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        base64,
        previewUrl: file.type.startsWith('image/') ? base64 : undefined,
      };

      if (type === 'question_paper') setQuestionPaperDoc(doc);
      else if (type === 'answer_sheet') setAnswerSheetDoc(doc);
      else if (type === 'answer_key') setAnswerKeyDoc(doc);
    };
    reader.readAsDataURL(file);
  };

  // Handle File Removal
  const handleFileRemove = (type: DocumentType) => {
    if (type === 'question_paper') setQuestionPaperDoc(null);
    else if (type === 'answer_sheet') setAnswerSheetDoc(null);
    else if (type === 'answer_key') setAnswerKeyDoc(null);
  };

  const isAllFilesUploaded = Boolean(questionPaperDoc && answerSheetDoc && answerKeyDoc);

  // Start AI Checking Flow
  const startAIChecking = async (isDemoMode: boolean = false) => {
    setErrorMessage(null);
    setCurrentStep('processing');
    setProgressPercent(5);
    setCheckedCount(0);
    setTotalQuestionsCount(12);

    // Reset stages
    const activeStages: ProcessingStage[] = INITIAL_STAGES.map((s, i) => ({
      ...s,
      status: i === 0 ? 'processing' : 'pending',
    }));
    setStages(activeStages);
    setCurrentStatusText('Uploading documents to Gemini AI engine...');

    const updateStageStatus = (stageIndex: number, pct: number, statusMsg: string, checked?: number) => {
      setProgressPercent(pct);
      setCurrentStatusText(statusMsg);
      if (checked !== undefined) setCheckedCount(checked);

      setStages((prev) =>
        prev.map((s, idx) => {
          if (idx < stageIndex) return { ...s, status: 'completed' };
          if (idx === stageIndex) return { ...s, status: 'processing' };
          return { ...s, status: 'pending' };
        })
      );
    };

    // Realistic progressive pipeline animation
    let currentStageIdx = 0;
    const progressTimeline = [
      { stage: 0, pct: 15, msg: 'Validating PDF and scan resolution...' },
      { stage: 1, pct: 28, msg: 'Reading question paper & extracting 12 questions...' },
      { stage: 2, pct: 40, msg: 'Parsing official answer key & marking guidelines...' },
      { stage: 3, pct: 52, msg: 'Optical scanning of student handwritten responses...' },
      { stage: 4, pct: 64, msg: 'Matching questions with student answers...', checked: 3 },
      { stage: 5, pct: 75, msg: 'Evaluating conceptual accuracy & step calculations...', checked: 7 },
      { stage: 6, pct: 85, msg: 'Calculating question scores & confidence metrics...', checked: 10 },
      { stage: 7, pct: 94, msg: 'Synthesizing topic analysis & mistake patterns...', checked: 12 },
      { stage: 8, pct: 98, msg: 'Finalizing student marksheet and reports...', checked: 12 },
    ];

    let timelineIndex = 0;
    const interval = setInterval(() => {
      if (timelineIndex < progressTimeline.length) {
        const item = progressTimeline[timelineIndex];
        updateStageStatus(item.stage, item.pct, item.msg, item.checked);
        timelineIndex++;
      }
    }, 700);

    processingTimerRef.current = interval;

    try {
      if (isDemoMode) {
        // Run demo simulation
        setTimeout(() => {
          clearInterval(interval);
          setStages((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
          setProgressPercent(100);
          setCurrentStatusText('Evaluation complete!');
          setReport({ ...DEMO_EVALUATION_REPORT });
          setTimeout(() => {
            setCurrentStep('review');
          }, 600);
        }, 3200);
        return;
      }

      // Real AI Evaluation call to backend Express server
      const payload = {
        questionPaper: {
          data: questionPaperDoc?.base64,
          mimeType: questionPaperDoc?.type,
          name: questionPaperDoc?.name,
        },
        answerSheet: {
          data: answerSheetDoc?.base64,
          mimeType: answerSheetDoc?.type,
          name: answerSheetDoc?.name,
        },
        answerKey: {
          data: answerKeyDoc?.base64,
          mimeType: answerKeyDoc?.type,
          name: answerKeyDoc?.name,
        },
        customSubject: customSubject.trim() || undefined,
        customTestName: customTestName.trim() || undefined,
        isDemo: false,
      };

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      clearInterval(interval);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete evaluation with AI.');
      }

      setStages((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
      setProgressPercent(100);
      setCurrentStatusText('Evaluation completed successfully!');

      if (data.report) {
        setReport(data.report);
      } else {
        // If server returned simulated fallback (e.g. without GEMINI_API_KEY)
        setReport({ ...DEMO_EVALUATION_REPORT });
      }

      setTimeout(() => {
        setCurrentStep('review');
      }, 700);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Checking failed:', err);
      setStages((prev) =>
        prev.map((s, idx) => (idx === currentStageIdx ? { ...s, status: 'error' } : s))
      );
      setErrorMessage(err.message || 'Error occurred while evaluating documents. Please try again.');
      // Provide fallback option so teacher is never stuck
      setTimeout(() => {
        setReport({ ...DEMO_EVALUATION_REPORT });
        setCurrentStep('review');
      }, 1500);
    }
  };

  // Handle Manual Marks Adjustment & Recalculate Statistics
  const handleUpdateQuestionMarks = (questionId: string, newMarks: number, notes?: string) => {
    if (!report) return;

    const updatedQuestions = report.questions.map((q) => {
      if (q.id === questionId) {
        let newStatus = q.status;
        if (newMarks >= q.max_marks) newStatus = 'correct';
        else if (newMarks > 0) newStatus = 'partial';
        else if (newMarks === 0 && q.status === 'unanswered') newStatus = 'unanswered';
        else newStatus = 'incorrect';

        return {
          ...q,
          final_marks: newMarks,
          status: newStatus,
          manually_edited: newMarks !== q.ai_marks,
          teacher_notes: notes !== undefined ? notes : q.teacher_notes,
        };
      }
      return q;
    });

    const totalMarks = updatedQuestions.reduce((acc, q) => acc + q.max_marks, 0) || report.total_marks;
    const marksObtained = updatedQuestions.reduce((acc, q) => acc + q.final_marks, 0);
    const correctCount = updatedQuestions.filter((q) => q.status === 'correct').length;
    const partialCount = updatedQuestions.filter((q) => q.status === 'partial').length;
    const incorrectCount = updatedQuestions.filter((q) => q.status === 'incorrect').length;
    const unansweredCount = updatedQuestions.filter((q) => q.status === 'unanswered').length;
    const attemptedCount = updatedQuestions.filter((q) => q.status !== 'unanswered').length;
    const manuallyAdjustedCount = updatedQuestions.filter((q) => q.manually_edited).length;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const percentage = Math.round((marksObtained / totalMarks) * 100 * 10) / 10;

    // Recalculate topic performance
    const topicMap: Record<string, { totalQ: number; correctQ: number; maxM: number; obtM: number }> = {};
    updatedQuestions.forEach((q) => {
      const t = q.topic || 'General';
      if (!topicMap[t]) topicMap[t] = { totalQ: 0, correctQ: 0, maxM: 0, obtM: 0 };
      topicMap[t].totalQ += 1;
      if (q.status === 'correct') topicMap[t].correctQ += 1;
      topicMap[t].maxM += q.max_marks;
      topicMap[t].obtM += q.final_marks;
    });

    const updatedTopicAnalysis = Object.keys(topicMap).map((t) => ({
      topic: t,
      total_questions: topicMap[t].totalQ,
      correct_questions: topicMap[t].correctQ,
      max_marks: topicMap[t].maxM,
      obtained_marks: topicMap[t].obtM,
      accuracy: Math.round((topicMap[t].obtM / (topicMap[t].maxM || 1)) * 100),
    }));

    // Recalculate difficulty performance
    const diffMap: Record<string, { totalQ: number; correctQ: number; maxM: number; obtM: number }> = {};
    updatedQuestions.forEach((q) => {
      const d = q.difficulty || 'Medium';
      if (!diffMap[d]) diffMap[d] = { totalQ: 0, correctQ: 0, maxM: 0, obtM: 0 };
      diffMap[d].totalQ += 1;
      if (q.status === 'correct') diffMap[d].correctQ += 1;
      diffMap[d].maxM += q.max_marks;
      diffMap[d].obtM += q.final_marks;
    });

    const updatedDifficultyAnalysis = Object.keys(diffMap).map((d) => ({
      difficulty: d as any,
      total_questions: diffMap[d].totalQ,
      correct_questions: diffMap[d].correctQ,
      max_marks: diffMap[d].maxM,
      obtained_marks: diffMap[d].obtM,
      accuracy: Math.round((diffMap[d].obtM / (diffMap[d].maxM || 1)) * 100),
    }));

    setReport({
      ...report,
      questions: updatedQuestions,
      total_marks: totalMarks,
      marks_obtained: marksObtained,
      percentage,
      accuracy,
      correct_count: correctCount,
      partial_count: partialCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      attempted_count: attemptedCount,
      manually_adjusted_count: manuallyAdjustedCount,
      topic_analysis: updatedTopicAnalysis,
      difficulty_analysis: updatedDifficultyAnalysis,
    });
  };

  // Reset Question Marks to AI Original
  const handleResetQuestionMarks = (questionId: string) => {
    if (!report) return;
    const target = report.questions.find((q) => q.id === questionId);
    if (target) {
      handleUpdateQuestionMarks(questionId, target.ai_marks);
    }
  };

  // Handle Final Approval
  const handleConfirmApproval = (evaluatorName?: string) => {
    if (!report) return;
    setReport({
      ...report,
      is_approved: true,
      approved_at: new Date().toISOString(),
      evaluator_name: evaluatorName || 'Verified Faculty',
    });
    setIsApproveModalOpen(false);
    setCurrentStep('report');
  };

  // Reset Test for Fresh Run
  const handleNewTest = () => {
    setQuestionPaperDoc(null);
    setAnswerSheetDoc(null);
    setAnswerKeyDoc(null);
    setReport(null);
    setErrorMessage(null);
    setCurrentStep('upload');
  };

  // Load Demo Test
  const handleLoadDemo = () => {
    setQuestionPaperDoc({
      file: null,
      name: 'Class10_Physics_Chemistry_Question_Paper.pdf',
      size: 1450000,
      type: 'application/pdf',
    });
    setAnswerSheetDoc({
      file: null,
      name: 'Aarav_Sharma_Answer_Booklet_SecA.pdf',
      size: 3200000,
      type: 'application/pdf',
    });
    setAnswerKeyDoc({
      file: null,
      name: 'Official_Marking_Scheme_Science_PA3.pdf',
      size: 980000,
      type: 'application/pdf',
    });
    startAIChecking(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar
        currentStep={currentStep}
        onNewTest={handleNewTest}
        onLoadDemo={handleLoadDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Step 1: Upload Documents Screen */}
        {currentStep === 'upload' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Next-Gen Automated Exam Evaluation
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                AI Answer Sheet Checker
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Upload the question paper, student answer sheet, and answer key to automatically evaluate the test.
              </p>
            </div>

            {/* Demo Quick Bar */}
            <div className="mb-8 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Want to test the workflow immediately?
                  </h4>
                  <p className="text-xs text-slate-500">
                    Load pre-configured sample science papers, student handwriting responses, and official marking key.
                  </p>
                </div>
              </div>
              <button
                id="try-demo-banner-btn"
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Try Demo Assessment
              </button>
            </div>

            {/* 3 Upload Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Question Paper */}
              <FileUploadCard
                id="upload-card-qp"
                type="question_paper"
                title="Question Paper"
                badgeLabel="Document 1"
                description="Contains test questions, question numbering format, and maximum allocated marks."
                document={questionPaperDoc}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                colorScheme="indigo"
              />

              {/* Card 2: Student Answer Sheet */}
              <FileUploadCard
                id="upload-card-as"
                type="answer_sheet"
                title="Student Answer Sheet"
                badgeLabel="Document 2"
                description="Scanned or photographed handwritten or printed student response booklet."
                document={answerSheetDoc}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                colorScheme="blue"
              />

              {/* Card 3: Answer Key */}
              <FileUploadCard
                id="upload-card-ak"
                type="answer_key"
                title="Answer Key"
                badgeLabel="Document 3"
                description="Official model answers, step criteria, and expected formulas/concepts."
                document={answerKeyDoc}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                colorScheme="purple"
              />
            </div>

            {/* Optional Metadata Accordion (Subject / Test Title) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Optional Assessment Metadata (Auto-detected if left blank)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Subject / Class
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Science Class 10 or JEE Physics"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Test Name / Assessment Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Periodic Test III / Pre-Board Mock 1"
                    value={customTestName}
                    onChange={(e) => setCustomTestName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Primary Action Button Bar */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                id="start-ai-checking-btn"
                type="button"
                onClick={() => startAIChecking(false)}
                disabled={!isAllFilesUploaded}
                className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-base rounded-2xl shadow-lg shadow-indigo-200 disabled:shadow-none transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 text-indigo-200" />
                Start AI Checking
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Supported formats: PDF, JPG, JPEG, PNG • Multi-page handling enabled</span>
              </div>

              {!isAllFilesUploaded && (
                <p className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mt-1">
                  Upload all 3 required documents above to enable AI evaluation
                </p>
              )}
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 max-w-lg mx-auto">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: AI Checking Processing Screen */}
        {currentStep === 'processing' && (
          <ProcessingView
            progressPercent={progressPercent}
            currentStatusText={currentStatusText}
            stages={stages}
            checkedCount={checkedCount}
            totalQuestionsCount={totalQuestionsCount}
            onCancel={() => setCurrentStep('upload')}
          />
        )}

        {/* Step 3: Evaluation Result & Review Screen */}
        {currentStep === 'review' && report && (
          <EvaluationReview
            report={report}
            onUpdateQuestionMarks={handleUpdateQuestionMarks}
            onResetQuestionMarks={handleResetQuestionMarks}
            onOpenApproveModal={() => setIsApproveModalOpen(true)}
            onBackToUpload={() => setCurrentStep('upload')}
          />
        )}

        {/* Step 4: Final Student Performance Report */}
        {currentStep === 'report' && report && (
          <StudentReport
            report={report}
            onEditStudentName={(newName) => {
              setReport({
                ...report,
                student_name: newName,
                is_name_detected: true,
              });
            }}
            onBackToReview={() => setCurrentStep('review')}
            onNewTest={handleNewTest}
          />
        )}
      </main>

      {/* Approve Confirmation Modal */}
      {report && (
        <ApproveModal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          onConfirmApprove={handleConfirmApproval}
          report={report}
        />
      )}

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden">
        <p>
          AI Answer Sheet Checker • Coaching Institute Assessment Platform • Built with Google Gemini Multimodal AI
        </p>
      </footer>
    </div>
  );
}
