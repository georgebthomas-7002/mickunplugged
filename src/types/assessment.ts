// Assessment-related type definitions

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: Option[];
  required: boolean;
  points?: number;
  correctAnswer?: string | string[];
}

export type QuestionType =
  | 'multiple-choice'
  | 'single-choice'
  | 'text'
  | 'rating'
  | 'boolean';

export interface Option {
  id: string;
  text: string;
  value: string;
  isCorrect?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentResponse {
  assessmentId: string;
  respondentId: string;
  answers: Answer[];
  startedAt: Date;
  completedAt?: Date;
  score?: number;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean;
}

export interface AssessmentResult {
  assessmentId: string;
  respondentId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  completedAt: Date;
}
