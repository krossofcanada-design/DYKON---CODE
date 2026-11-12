export type DoorStatus = 'locked' | 'openable' | 'opened';

export interface QuizContent {
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface CalendarDay {
  day: number;
  title: string;
  paragraphs: string[];
  image: string;
  activity: {
    title: string;
    instructions: string;
    materials: string;
    duration: string;
  };
  quiz: QuizContent;
}

export interface DayProgress {
  opened: boolean;
  doorTicket: boolean;
  answer: number | null;
  quizTickets: number;
  pieces: number[];
}

export interface Progress {
  days: Record<number, DayProgress>;
}

export interface CalendarState {
  version: 1;
  activeProfile: string | null;
  demoDate: string;
  profiles: Record<string, Progress>;
}
