export type DocumentType = 'question_paper' | 'answer_sheet' | 'answer_key';

export interface UploadedDoc {
  file: File | null;
  name: string;
  size: number;
  type: string;
  base64?: string;
  previewUrl?: string;
  pageCount?: number;
}

export type QuestionStatus = 'correct' | 'incorrect' | 'partial' | 'unanswered' | 'review_needed';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface EvaluatedQuestion {
  id: string;
  question_number: string;
  question_text: string;
  student_answer: string;
  correct_answer: string;
  max_marks: number;
  ai_marks: number;
  final_marks: number;
  status: QuestionStatus;
  reason: string;
  confidence: ConfidenceLevel;
  is_ambiguous?: boolean;
  topic?: string;
  difficulty?: DifficultyLevel;
  manually_edited?: boolean;
  teacher_notes?: string;
}

export interface TopicPerformance {
  topic: string;
  total_questions: number;
  correct_questions: number;
  max_marks: number;
  obtained_marks: number;
  accuracy: number;
}

export interface DifficultyPerformance {
  difficulty: DifficultyLevel;
  total_questions: number;
  correct_questions: number;
  max_marks: number;
  obtained_marks: number;
  accuracy: number;
}

export interface MistakeAnalysisItem {
  type: 'Conceptual' | 'Calculation' | 'Careless' | 'Misreading' | 'Incomplete' | 'Formula' | 'Unattempted';
  count: number;
  description: string;
  affected_questions: string[];
}

export interface EvaluationReport {
  id: string;
  student_name: string;
  is_name_detected: boolean;
  roll_number?: string;
  test_name: string;
  subject: string;
  institution_name: string;
  evaluation_date: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  accuracy: number;
  attempted_count: number;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  partial_count: number;
  unanswered_count: number;
  review_required_count: number;
  manually_adjusted_count: number;
  
  questions: EvaluatedQuestion[];
  
  // AI Diagnostic Analysis
  overall_performance: string;
  strengths: string[];
  weak_areas: string[];
  topic_analysis: TopicPerformance[];
  difficulty_analysis: DifficultyPerformance[];
  mistake_analysis: MistakeAnalysisItem[];
  improvement_recommendations: string[];
  
  is_approved: boolean;
  approved_at?: string;
  evaluator_name?: string;
}

export interface ProcessingStage {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}
