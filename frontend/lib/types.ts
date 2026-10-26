export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "PENDING" | "ACTIVE" | "DEACTIVATED";
export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "GRADED";
export type ExamState = "UPCOMING" | "ONGOING" | "COMPLETED";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status?: UserStatus;
  createdAt?: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  shuffleQuestions: boolean;
  maxTabSwitches: number;
  state: ExamState;
  _count?: { questions: number; attempts?: number };
  // only present for students
  attempts?: { id: number; status: AttemptStatus; totalScore: number }[];
}

// Staff view: includes the correct answer
export interface Question {
  id: number;
  questionText: string;
  questionType: QuestionType;
  options: string[] | null;
  correctAnswer: string | null;
  marks: number;
}

// Student view while taking the exam: no correct answer
export interface ExamQuestion {
  id: number;
  questionText: string;
  questionType: QuestionType;
  options: string[] | null;
  marks: number;
}

export interface SavedAnswer {
  questionId: number;
  selectedAnswer: string | null;
  markedReview: boolean;
}

export interface AttemptPayload {
  attempt: { id: number; status: AttemptStatus; startTime: string; tabSwitchCount: number };
  exam: { id: number; title: string; durationMinutes: number; totalMarks: number; maxTabSwitches: number };
  deadline: string;
  secondsLeft: number;
  questions: ExamQuestion[];
  answers: SavedAnswer[];
}

export interface MyAttempt {
  id: number;
  status: AttemptStatus;
  totalScore: number;
  startTime: string;
  exam: { id: number; title: string; totalMarks: number; passingMarks: number };
}

export interface AttemptRow {
  id: number;
  status: AttemptStatus;
  totalScore: number;
  tabSwitchCount: number;
  startTime: string;
  endTime: string | null;
  student: { id: number; name: string; email: string };
}

export interface ResultAnswer {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  options: string[] | null;
  marks: number;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  isCorrect: boolean | null;
  marksObtained: number;
}

export interface ResultData {
  attempt: {
    id: number;
    status: AttemptStatus;
    totalScore: number;
    startTime: string;
    endTime: string | null;
    tabSwitchCount: number;
  };
  student: { id: number; name: string; email: string };
  exam: { id: number; title: string; totalMarks: number; passingMarks: number };
  pendingManual: boolean;
  passed: boolean | null;
  answers: ResultAnswer[];
}
