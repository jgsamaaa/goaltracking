"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Badge } from "@/components/ui";
import { useDB } from "@/lib/hooks";
import { Goal } from "@/lib/types";
import { uid } from "@/lib/utils";
import { useMemo, useState } from "react";

export default function GoalsPage() {
  const { db, update, hydrated } = useDB();
  const goals = useMemo(() => Object.values(db.goals).sort((a,b)=>b.createdAt-a.createdAt), [db.goals]);

  const [title, setTitle] = useState("");
  const [deadlineISO, setDeadlineISO] = useState("");
  const [why, setWhy] = useState("");

  function addGoal() {
    const t = title.trim();
    if (!t) return;
    const g: Goal = {
      id: uid("goal"),
      title: t,
      deadlineISO: deadlineISO.trim() || undefined,
      why: why.trim() || undefined,
      milestones: [],
      createdAt: Date.now()
    };
    update(d => {
      d.goals[g.id] = g;
      return d;
    });
    setTitle(""); setDeadlineISO(""); setWhy("");
  }

  function updateGoal(id: string, next: Goal) {
    update(d => {
      d.goals[id] = next;
      return d;
    });
  }

  function removeGoal(id: string) {
    update(d => {
      delete d.goals[id];
      return d;
    });
  }

  if (!hydrated) return <div className="text-white/70 text-[18px]">Loading…</div>;

  return (
    <div className="grid gap-5">
      <div>
        <div className="text-[34px] font-bold tracking-tight">2026 Goals</div>
        <div className="text-white/60 text-[16px]">Big goals + milestones. Keep it clean.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Goal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title (required)" />
          <Input type="date" value={deadlineISO} onChange={e => setDeadlineISO(e.target.value)} placeholder="Deadline (optional)" />
          <Textarea value={why} onChange={e => setWhy(e.target.value)} placeholder="Why it matters (optional)" />
          <Button size="lg" onClick={addGoal} disabled={!title.trim()}>Add Goal</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {goals.length === 0 ? (
          <div className="text-white/60 text-[16px]">No goals yet.</div>
        ) : (
          goals.map(g => (
            <GoalCard key={g.id} goal={g} onChange={(ng)=>updateGoal(g.id, ng)} onRemove={()=>removeGoal(g.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function MilestoneRow({
  text,
  done,
  notes,
  onToggle,
  onRemove,
  onSetNotes
}: {
  text: string;
  done: boolean;
  notes: string;
  onToggle: () => void;
  onRemove: () => void;
  onSetNotes: (notes: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/30 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={done} onChange={onToggle} className="h-5 w-5 accent-white" />
          <span className={done ? "line-through text-white/60 text-[18px] font-semibold" : "text-[18px] font-semibold"}>
            {text}
          </span>
        </label>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setOpen(v => !v)}>{open ? "Hide Notes" : "Notes"}</Button>
          <Button variant="ghost" onClick={onRemove}>Remove</Button>
        </div>
      </div>
      {open && (
        <div className="mt-3 grid gap-2">
          <div className="text-white/60 text-[14px]">Notes (optional)</div>
          <Textarea value={notes} onChange={e => onSetNotes(e.target.value)} placeholder="Notes for this milestone…" />
        </div>
      )}
    </div>
  );
}

function GoalCard        ({ goal, onChange, onRemove }: { goal: Goal; onChange: (g: Goal)=>void; onRemove: ()=>void }) {
  const [msText, setMsText] = useState("");

  const doneCount = goal.milestones.filter(m=>m.done).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="text-[24px]">{goal.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge>{doneCount}/{goal.milestones.length} milestones</Badge>
            <Button variant="ghost" onClick={onRemove}>Delete</Button>
          </div>
        </div>
        <div className="text-white/60 text-[16px]">
          {goal.deadlineISO ? `Deadline: ${goal.deadlineISO}` : "No deadline set"}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <div className="text-white/60 text-[14px]">Deadline (shows on Calendar)</div>
          <Input
            type="date"
            value={goal.deadlineISO ?? ""}
            onChange={e => onChange({ ...goal, deadlineISO: e.target.value || undefined })}
          />
        </div>

        <Textarea
          value={goal.why ?? ""}
          onChange={e => onChange({ ...goal, why: e.target.value })}
          placeholder="Why it matters…"
        />

        <div className="grid gap-2">
          <div className="text-[18px] font-semibold">Milestones (required if you want this goal to move)</div>
          {goal.milestones.length === 0 ? (
            <div className="text-white/60 text-[16px]">No milestones yet.</div>
          ) : (
            goal.milestones.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-950/30 px-4 py-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={m.done}
                    onChange={() => onChange({ ...goal, milestones: goal.milestones.map(x => x.id===m.id ? { ...x, done: !x.done } : x) })}
                    className="h-5 w-5 accent-white"
                  />
                  <span className={m.done ? "line-through text-white/60 text-[18px] font-semibold" : "text-[18px] font-semibold"}>
                    {m.text}
                  </span>
                </label>
                <Button
                  variant="ghost"
                  onClick={() => onChange({ ...goal, milestones: goal.milestones.filter(x => x.id !== m.id) })}
                >
                  Remove
                </Button>
              </div>
            ))
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <Input value={msText} onChange={e => setMsText(e.target.value)} placeholder="Add a milestone" onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); const t=msText.trim(); if(!t) return; onChange({ ...goal, milestones: [...goal.milestones, { id: uid("ms"), text: t, done: false }]}); setMsText(""); }}} />
            <Button
              size="lg"
              onClick={() => {
                const t = msText.trim();
                if (!t) return;
                onChange({ ...goal, milestones: [...goal.milestones, { id: uid("ms"), text: t, done: false }] });
                setMsText("");
              }}
              disabled={!msText.trim()}
            >
              Add Milestone
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
