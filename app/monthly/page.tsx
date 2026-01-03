"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Badge, Input } from "@/components/ui";
import { TaskList } from "@/components/task-list";
import { useDB } from "@/lib/hooks";
import { MonthRecord } from "@/lib/types";
import { monthISO } from "@/lib/utils";
import { useState } from "react";

export default function MonthlyPage() {
  const { db, update, hydrated } = useDB();
  const mISO = monthISO();

  const record: MonthRecord =
    db.months[mISO] ??
    ({
      monthISO: mISO,
      outcomes: [],
      status: "open"
    } as MonthRecord);

  const doneCount = record.outcomes.filter(t => t.done).length;
  const allDone = record.outcomes.length > 0 && doneCount === record.outcomes.length;

  function setRec(next: MonthRecord) {
    update(d => {
      d.months[mISO] = next;
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[34px] font-bold tracking-tight">Monthly</div>
          <div className="text-white/60 text-[16px]">{mISO}</div>
        </div>
        <Badge className={record.status === "passed" ? "border-emerald-400/30 text-emerald-200" : record.status === "failed" ? "border-red-400/30 text-red-200" : ""}>
          {record.status.toUpperCase()}
        </Badge>
      </div>

      <Card>
  <CardHeader>
    <CardTitle>Month Deadline</CardTitle>
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
          <CardTitle>Required Monthly Outcomes</CardTitle>
          <div className="text-white/60 text-[16px]">Keep it tight (3–5). Everything must be done.</div>
        </CardHeader>
        <CardContent>
          <TaskList
            tasks={record.outcomes}
            setTasks={(outcomes) => setRec({ ...record, outcomes })}
            limit={12}
            locked={record.status !== "open"}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="text-white/70 text-[16px] font-semibold">
              Done: {doneCount}/{record.outcomes.length}
            </div>
            <Button size="lg" onClick={closePassed} disabled={record.status !== "open" || !allDone}>
              Close Month as Passed
            </Button>
          </div>
        </CardContent>
      </Card>

      {record.status === "open" && <FailBox onFail={closeFailed} />}

      {record.status !== "open" && record.failReason && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-[16px]">
          <div className="font-semibold">Failure reason:</div>
          <div className="text-white/80 mt-1">{record.failReason}</div>
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
        <CardTitle>Close Month as Failed</CardTitle>
        <div className="text-white/60 text-[16px]">If you failed, write why.</div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Why did you fail this month?" />
        <Button variant="danger" size="lg" onClick={() => onFail(reason)} disabled={!reason.trim()}>
          Close Month as Failed
        </Button>
      </CardContent>
    </Card>
  );
}
