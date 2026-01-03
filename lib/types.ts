export type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  notes?: string;
  subtasks?: Task[];
};

export type DayRecord = {
  dateISO: string; // YYYY-MM-DD
  tasks: Task[];
  status: "open" | "completed" | "failed";
  failReason?: string;
  closedAt?: number;
  notes?: string;
};

export type WeekRecord = {
  weekStartISO: string; // Monday YYYY-MM-DD
  title: string;
  deadlineISO?: string; // optional explicit deadline date
  tasks: Task[];
  status: "open" | "passed" | "failed";
  failReason?: string;
  closedAt?: number;
};


export type MonthRecord = {
  monthISO: string; // YYYY-MM
  deadlineISO?: string; // optional explicit deadline date
  outcomes: Task[]; // required outcomes
  status: "open" | "passed" | "failed";
  failReason?: string;
  closedAt?: number;
};


export type Goal = {
  id: string;
  title: string;
  deadlineISO?: string;
  why?: string;
  milestones: { id: string; text: string; done: boolean; notes?: string }[];
  createdAt: number;
};

export type Settings = {
  dailyTaskLimit: number;
  lockAfterStart: boolean;
  openaiEnabled: boolean;
  openaiApiKey?: string;
};
