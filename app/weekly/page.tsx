"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Badge, Input } from "@/components/ui";
import { TaskList } from "@/components/task-list";
import { useDB } from "@/lib/hooks";
import { WeekRecord } from "@/lib/types";
import { weekStartISO } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function WeeklyPage() {
  const { db, update, hydrated } = useDB();
  const startISO = weekStartISO();

  const record: WeekRecord =
    db.weeks[startISO] ??
    ({
      weekStartISO: startISO,
      title: "This Week",
      tasks: [],
      status: "open"
    } as WeekRecord);

  const doneCount = record.tasks.filter(t => t.done).length;
  const allDone = record.tasks.length > 0 && doneCount === record.tasks.length;

  function setRec(next: WeekRecord) {
    update(d => {
      d.weeks[startISO] = next;
      return d;
    });
  }

  function closePassed() {
    if (!allDone) return;
    setRec({ ...record, status: "passed", closedAt: Date.now(), failReason: "" });
  }

  function closeFailed(reason: string) {
    const r = reason.trim();
    if (!r) return;
    setRec({ ...record, status: "failed", closedAt: Date.now(), failReason: r });
  }

  if (!hydrated) return <div className="text-white/70 text-[18px]">Loading…</div>;

  return (
    <div className="grid gap-5">
      <Header title="Weekly" subtitle={`Week of ${startISO}`} status={record.status} />

      <Card>
        <CardHeader>
          <CardTitle>Week Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={record.title} onChange={e => setRec({ ...record, title: e.target.value })} disabled={record.status !== "open"} />
        </CardContent>
      </Card>

      <Card>
    <CardHeader>
      <CardTitle>Week Deadline</CardTitle>
      <div className="text-white/60 text-[16px]">Pick an exact deadline date (shows on Calendar).</div>
    </CardHeader>
    <CardContent>
      <Input
        type="date"
        value={record.deadlineISO ?? ""}
        onChange={e => setRec({ ...record, deadlineISO: e.target.value || undefined })}
        disabled={record.status !== "open"}
      />
    </CardContent>
  </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Weekly Tasks</CardTitle>
          <div className="text-white/60 text-[16px]">Everything here must be done.</div>
        </CardHeader>
        <CardContent>
          <TaskList
            tasks={record.tasks}
            setTasks={(tasks) => setRec({ ...record, tasks })}
            limit={50}
            locked={record.status !== "open"}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-white/70 text-[16px] font-semibold">
              Done: {doneCount}/{record.tasks.length}
            </div>
            <Button size="lg" onClick={closePassed} disabled={record.status !== "open" || !allDone}>
              Close Week as Passed
            </Button>
          </div>
        </CardContent>
      </Card>

      {record.status === "open" && <FailBox onFail={closeFailed} label="Close Week as Failed" />}

      {record.status !== "open" && record.failReason && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-[16px]">
          <div className="font-semibold">Failure reason:</div>
          <div className="text-white/80 mt-1">{record.failReason}</div>
        </div>
      )}
    </div>
  );
}

function Header({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[34px] font-bold tracking-tight">{title}</div>
        <div className="text-white/60 text-[16px]">{subtitle}</div>
      </div>
      <Badge className={status === "passed" ? "border-emerald-400/30 text-emerald-200" : status === "failed" ? "border-red-400/30 text-red-200" : ""}>
        {status.toUpperCase()}
      </Badge>
    </div>
  );
}

function FailBox({ onFail, label }: { onFail: (reason: string) => void; label: string }) {
  const [reason, setReason] = useState("");
  return (
    <Card className="border-red-400/20">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <div className="text-white/60 text-[16px]">If you failed, write why.</div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Why did you fail?" />
        <Button variant="danger" size="lg" onClick={() => onFail(reason)} disabled={!reason.trim()}>
          {label}
        </Button>
      </CardContent>
    </Card>
  );
}
