"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { useDB } from "@/lib/hooks";
import { monthISO } from "@/lib/utils";

type CalItem = { kind: "goal" | "week" | "month"; id: string; title: string; dateISO: string };
import { useMemo, useState } from "react";

function formatMonthLabel(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(d);
}

function formatMonthShort(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(d);
}

function addMonths(iso: string, delta: number) {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function daysInMonth(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function weekdayOfFirst(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  // 0 Sun .. 6 Sat, we want Monday-first index 0..6
  const wd = d.getDay();
  return (wd + 6) % 7;
}

export default function CalendarPage() {
  const { db, hydrated } = useDB();
  const [mISO, setMISO] = useState(() => monthISO());

  const goalsWithDates = useMemo(() => {
    const goals = Object.values(db.goals);
    return goals
      .filter(g => !!g.deadlineISO)
      .map(g => ({ id: g.id, title: g.title, deadlineISO: g.deadlineISO! }))
      .sort((a, b) => a.deadlineISO.localeCompare(b.deadlineISO));
  }, [db.goals]);

  const weeksWithDates = useMemo(() => {
    const weeks = Object.values(db.weeks);
    return weeks
      .filter(w => !!w.deadlineISO)
      .map(w => ({ id: w.weekStartISO, title: w.title || "Week", deadlineISO: w.deadlineISO! }))
      .sort((a, b) => a.deadlineISO.localeCompare(b.deadlineISO));
  }, [db.weeks]);

  const monthsWithDates = useMemo(() => {
    const months = Object.values(db.months);
    return months
      .filter(m => !!m.deadlineISO)
      .map(m => ({ id: m.monthISO, title: `Month ${m.monthISO}`, deadlineISO: m.deadlineISO! }))
      .sort((a, b) => a.deadlineISO.localeCompare(b.deadlineISO));
  }, [db.months]);

  const monthGoals = useMemo(() => {
    return goalsWithDates.filter(g => g.deadlineISO.startsWith(mISO));
  }, [goalsWithDates, mISO]);

  const itemsByDay = useMemo(() => {
    const map: Record<string, CalItem[]> = {};

    for (const g of goalsWithDates.filter(x => x.deadlineISO.startsWith(mISO))) {
      const day = g.deadlineISO.slice(8, 10);
      map[day] = map[day] ?? [];
      map[day].push({ kind: "goal", id: g.id, title: g.title, dateISO: g.deadlineISO });
    }

    for (const w of weeksWithDates.filter(x => x.deadlineISO.startsWith(mISO))) {
      const day = w.deadlineISO.slice(8, 10);
      map[day] = map[day] ?? [];
      map[day].push({ kind: "week", id: w.id, title: w.title, dateISO: w.deadlineISO });
    }

    for (const m of monthsWithDates.filter(x => x.deadlineISO.startsWith(mISO))) {
      const day = m.deadlineISO.slice(8, 10);
      map[day] = map[day] ?? [];
      map[day].push({ kind: "month", id: m.id, title: m.title, dateISO: m.deadlineISO });
    }

    return map;
  }, [goalsWithDates, weeksWithDates, monthsWithDates, mISO]);

  const totalDays = daysInMonth(mISO);
  const offset = weekdayOfFirst(mISO); // 0..6 Monday-first
  const cells = useMemo(() => {
    const arr: Array<{ day?: number }> = [];
    for (let i = 0; i < offset; i++) arr.push({});
    for (let d = 1; d <= totalDays; d++) arr.push({ day: d });
    while (arr.length % 7 !== 0) arr.push({});
    return arr;
  }, [offset, totalDays]);

  if (!hydrated) return <div className="text-white/70 text-[18px]">Loading…</div>;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-[34px] font-bold tracking-tight">Calendar</div>
          <div className="text-white/60 text-[16px]">{formatMonthLabel(mISO)} • Goal deadlines (from 2026 Goals).</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="lg" onClick={() => setMISO(m => addMonths(m, -1))}>Prev</Button>
          <Badge className="text-[16px]">{formatMonthShort(mISO)}</Badge>
          <Button variant="ghost" size="lg" onClick={() => setMISO(m => addMonths(m, 1))}>Next</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Month View</CardTitle>
          <div className="text-white/60 text-[16px]">Click a day to see items.</div>
        </CardHeader>
        <CardContent>
          <MonthGrid mISO={mISO} cells={cells} itemsByDay={itemsByDay} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Dates</CardTitle>
          <div className="text-white/60 text-[16px]">Goals, weekly deadlines, and monthly deadlines.</div>
        </CardHeader>
        <CardContent>
          {goalsWithDates.length === 0 ? (
            <div className="text-white/60 text-[16px]">No goal deadlines yet. Add deadlines in 2026 Goals.</div>
          ) : (
            <div className="grid gap-2">
              {goalsWithDates.slice(0, 25).map(g => (
                <div key={g.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-neutral-950/30 px-4 py-3">
                  <div className="text-[18px] font-semibold">{g.title}</div>
                  <Badge>{g.deadlineISO}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MonthGrid({
  mISO,
  cells,
  itemsByDay
}: {
  mISO: string;
  cells: Array<{ day?: number }>;
  itemsByDay: Record<string, CalItem[]>;
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedKey = selectedDay ? String(selectedDay).padStart(2, "0") : null;
  const selectedItems = selectedKey ? itemsByDay[selectedKey] ?? [] : [];

  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-7 gap-2">
        {weekday.map(w => (
          <div key={w} className="text-center text-white/60 text-[14px] font-semibold">{w}</div>
        ))}
        {cells.map((c, idx) => {
          const day = c.day;
          if (!day) return <div key={idx} className="h-20 rounded-xl border border-white/5 bg-white/0" />;
          const key = String(day).padStart(2, "0");
          const items = itemsByDay[key] ?? [];
          const has = items.length > 0;
          const hasGoal = items.some(i => i.kind === "goal");
          const hasWeek = items.some(i => i.kind === "week");
          const hasMonth = items.some(i => i.kind === "month");
          const isSel = selectedDay === day;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={[
                "h-20 rounded-xl border p-2 text-left transition",
                isSel
                  ? "border-white/40 bg-white/15"
                  : hasGoal
                  ? "border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/15"
                  : hasWeek
                  ? "border-violet-400/30 bg-violet-500/10 hover:bg-violet-500/15"
                  : hasMonth
                  ? "border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div className="text-[16px] font-bold">{day}</div>
                {has && <Badge className="text-[12px]">{itemsByDay[key].length}</Badge>}
              </div>
              {has && (
                <div className="mt-2 text-white/70 text-[12px] line-clamp-2">
                  {itemsByDay[key].slice(0, 2).map(g => g.title).join(" • ")}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-neutral-950/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[18px] font-semibold">
            {selectedDay ? `Items for ${mISO}-${String(selectedDay).padStart(2, "0")}` : "Select a day"}
          </div>
          {selectedDay && <Badge>{selectedItems.length} items</Badge>}
        </div>
        <div className="mt-3 grid gap-2">
          {selectedDay && selectedItems.length === 0 && (
            <div className="text-white/60 text-[16px]">No goal deadlines on this day.</div>
          )}
          {selectedItems.map(g => (
            <div key={g.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[18px] font-semibold">{g.title}</div>
                <Badge className={g.kind === "goal" ? "border-blue-400/30 text-blue-200" : g.kind === "week" ? "border-violet-400/30 text-violet-200" : "border-amber-400/30 text-amber-200"}>
                  {g.kind.toUpperCase()}
                </Badge>
              </div>
              <div className="text-white/60 text-[14px]">{g.dateISO}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
