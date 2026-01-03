"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Badge } from "@/components/ui";
import { TaskList } from "@/components/task-list";
import { useDB } from "@/lib/hooks";
import { DayRecord } from "@/lib/types";
import { todayISO, uid } from "@/lib/utils";

export function TodayView() {
  const { db, update, hydrated } = useDB();
  const dateISO = todayISO();

  const day: DayRecord =
    db.days[dateISO] ??
    ({
      dateISO,
      tasks: [],
      status: "open",
      notes: ""
    } as DayRecord);

  const locked = db.settings.lockAfterStart && (day.tasks.length > 0);

  const doneCount = day.tasks.filter(t => t.done).length;
  const allDone = day.tasks.length > 0 && doneCount === day.tasks.length;

  function setDay(next: DayRecord) {
    update(d => {
      d.days[dateISO] = next;
      return d;
    });
  }

  function closeCompleted() {
    if (!allDone) return;
    setDay({ ...day, status: "completed", closedAt: Date.now(), failReason: "" });
  }

  function closeFailed(reason: string) {
    const r = reason.trim();
    if (!r) return;
    setDay({ ...day, status: "failed", closedAt: Date.now(), failReason: r });
  }

  if (!hydrated) {
    return <div className="text-white/70 text-[18px]">Loading…</div>;
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[34px] font-bold tracking-tight">Today</div>
          <div className="text-white/60 text-[16px]">{dateISO}</div>
        </div>
        <Badge className={day.status === "completed" ? "border-emerald-400/30 text-emerald-200" : day.status === "failed" ? "border-red-400/30 text-red-200" : ""}>
          {day.status.toUpperCase()}
        </Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Required Tasks</CardTitle>
          <div className="text-white/60 text-[16px]">
            Everything here must be completed. Limit: {db.settings.dailyTaskLimit}
            {locked ? " • Locked" : ""}
          </div>
        </CardHeader>
        <CardContent>
          <TaskList
            tasks={day.tasks}
            setTasks={(tasks) => setDay({ ...day, tasks })}
            limit={db.settings.dailyTaskLimit}
            locked={day.status !== "open" || locked}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-white/70 text-[16px] font-semibold">
              Done: {doneCount}/{day.tasks.length}
            </div>
            <div className="flex gap-2">
              <Button
                size="lg"
                onClick={closeCompleted}
                disabled={day.status !== "open" || !allDone}
              >
                Close Day as Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <div className="text-white/60 text-[16px]">Optional notes. (Tasks are not optional.)</div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={day.notes ?? ""}
            onChange={e => setDay({ ...day, notes: e.target.value })}
            placeholder="Quick notes about today…"
            disabled={day.status !== "open" ? true : false}
          />
        </CardContent>
      </Card>

      {day.status === "open" && (
        <FailBox onFail={closeFailed} />
      )}

      {day.status !== "open" && day.failReason && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-[16px]">
          <div className="font-semibold">Failure reason:</div>
          <div className="text-white/80 mt-1">{day.failReason}</div>
        </div>
      )}
    </div>
  );
}

function FailBox({ onFail }: { onFail: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Card className="border-red-400/20">
      <CardHeader>
        <CardTitle>Close Day as Failed</CardTitle>
        <div className="text-white/60 text-[16px]">If you failed, you must write why.</div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Why did you fail today?" />
        <Button variant="danger" size="lg" onClick={() => onFail(reason)} disabled={!reason.trim()}>
          Close Day as Failed
        </Button>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
