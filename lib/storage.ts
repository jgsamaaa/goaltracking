import { DayRecord, WeekRecord, MonthRecord, Goal, Settings } from "./types";

const KEY = "gdt_v1";

export type DB = {
  days: Record<string, DayRecord>;
  weeks: Record<string, WeekRecord>;
  months: Record<string, MonthRecord>;
  goals: Record<string, Goal>;
  settings: Settings;
};

const defaultDB: DB = {
  days: {},
  weeks: {},
  months: {},
  goals: {},
  settings: {
    dailyTaskLimit: 8,
    lockAfterStart: false,
    openaiEnabled: false,
    openaiApiKey: ""
  }
};

export function loadDB(): DB {
  if (typeof window === "undefined") return defaultDB;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDB;
    const parsed = JSON.parse(raw) as DB;
    return {
      ...defaultDB,
      ...parsed,
      settings: { ...defaultDB.settings, ...(parsed.settings || {}) }
    };
  } catch {
    return defaultDB;
  }
}

export function saveDB(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function exportDB(): string {
  const db = loadDB();
  return JSON.stringify(db, null, 2);
}

export function importDB(jsonText: string) {
  const parsed = JSON.parse(jsonText) as DB;
  saveDB({
    ...defaultDB,
    ...parsed,
    settings: { ...defaultDB.settings, ...(parsed.settings || {}) }
  });
}
