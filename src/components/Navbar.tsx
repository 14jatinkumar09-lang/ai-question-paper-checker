import React from 'react';
import { Sparkles, FileText, CheckCircle2, RotateCcw, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentStep: 'upload' | 'processing' | 'review' | 'report';
  onNewTest: () => void;
  onLoadDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNewTest,
  onLoadDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                AI Answer Sheet Checker
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Coaching Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Intelligent 3-Document Assessment & Evaluation System
            </p>
          </div>
        </div>

        {/* Workflow Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span
            className={`px-2.5 py-1 rounded-md transition-colors ${
              currentStep === 'upload'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                : 'text-slate-500'
            }`}
          >
            1. Upload Files
          </span>
          <span>→</span>
          <span
            className={`px-2.5 py-1 rounded-md transition-colors ${
              currentStep === 'processing'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 animate-pulse'
                : 'text-slate-500'
            }`}
          >
            2. AI Checking
          </span>
          <span>→</span>
          <span
            className={`px-2.5 py-1 rounded-md transition-colors ${
              currentStep === 'review'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                : 'text-slate-500'
            }`}
          >
            3. Review & Edit
          </span>
          <span>→</span>
          <span
            className={`px-2.5 py-1 rounded-md transition-colors ${
              currentStep === 'report'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                : 'text-slate-500'
            }`}
          >
            4. Performance Report
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentStep !== 'upload' && (
            <button
              id="nav-new-test-btn"
              onClick={onNewTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Start a fresh test evaluation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              New Test
            </button>
          )}

          {currentStep === 'upload' && (
            <button
              id="nav-try-demo-btn"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Try Demo Test
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
