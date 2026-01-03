"use client";

import React, { useMemo, useState } from "react";
import { Button, Input, Textarea, cx } from "@/components/ui";
import { Task } from "@/lib/types";
import { uid } from "@/lib/utils";

type Props = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  limit?: number; // top-level limit
  locked?: boolean;
  allowSubtasks?: boolean;
};

type Id = string;

function updateTree(tasks: Task[], id: Id, updater: (t: Task) => Task): Task[] {
  return tasks.map(t => {
    if (t.id === id) return updater(t);
    if (t.subtasks?.length) return { ...t, subtasks: updateTree(t.subtasks, id, updater) };
    return t;
  });
}

function removeFromTree(tasks: Task[], id: Id): Task[] {
  return tasks
    .filter(t => t.id !== id)
    .map(t => (t.subtasks?.length ? { ...t, subtasks: removeFromTree(t.subtasks, id) } : t));
}

function addChildToTree(tasks: Task[], parentId: Id, child: Task): Task[] {
  return tasks.map(t => {
    if (t.id === parentId) return { ...t, subtasks: [...(t.subtasks ?? []), child] };
    if (t.subtasks?.length) return { ...t, subtasks: addChildToTree(t.subtasks, parentId, child) };
    return t;
  });
}

export function TaskList({ tasks, setTasks, limit = 8, locked = false, allowSubtasks = true }: Props) {
  const [text, setText] = useState("");
  const remaining = useMemo(() => Math.max(0, limit - tasks.length), [limit, tasks.length]);

  function addTopLevel() {
    const t = text.trim();
    if (!t || locked) return;
    if (tasks.length >= limit) return;
    setTasks([
      ...tasks,
      { id: uid("task"), text: t, done: false, createdAt: Date.now(), notes: "", subtasks: [] }
    ]);
    setText("");
  }

  function toggle(id: string) {
    setTasks(updateTree(tasks, id, t => ({ ...t, done: !t.done })));
  }

  function remove(id: string) {
    if (locked) return;
    setTasks(removeFromTree(tasks, id));
  }

  function setNotes(id: string, notes: string) {
    setTasks(updateTree(tasks, id, t => ({ ...t, notes })));
  }

  function addSubtask(parentId: string, subText: string) {
    if (locked) return;
    const t = subText.trim();
    if (!t) return;
    const sub: Task = { id: uid("sub"), text: t, done: false, createdAt: Date.now(), notes: "", subtasks: [] };
    setTasks(addChildToTree(tasks, parentId, sub));
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={locked ? "Tasks are locked" : `Add a required task (${remaining} slots left)`}
          onKeyDown={e => {
            if (e.key === "Enter") addTopLevel();
          }}
          disabled={locked}
        />
        <Button onClick={addTopLevel} size="lg" disabled={locked || tasks.length >= limit || !text.trim()}>
          Add
        </Button>
      </div>

      <div className="grid gap-2">
        {tasks.length === 0 ? (
          <div className="text-white/60 text-[16px]">No tasks yet.</div>
        ) : (
          tasks.map(t => (
            <TaskRow
              key={t.id}
              task={t}
              depth={0}
              locked={locked}
              allowSubtasks={allowSubtasks}
              onToggle={toggle}
              onRemove={remove}
              onSetNotes={setNotes}
              onAddSubtask={addSubtask}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  depth,
  locked,
  allowSubtasks,
  onToggle,
  onRemove,
  onSetNotes,
  onAddSubtask
}: {
  task: Task;
  depth: number;
  locked: boolean;
  allowSubtasks: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onSetNotes: (id: string, notes: string) => void;
  onAddSubtask: (parentId: string, text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [subText, setSubText] = useState("");

  const subtasks = task.subtasks ?? [];
  const subDone = subtasks.filter(s => s.done).length;

  return (
    <div className={cx("grid gap-2", depth > 0 && "ml-6")}>
      <div
        className={cx(
          "flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-950/30 px-4 py-3",
          task.done && "bg-white/10"
        )}
      >
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} className="h-5 w-5 accent-white" />
          <button type="button" onClick={() => setOpen(v => !v)} className="text-left">
            <div className={cx("text-[18px] font-semibold", task.done && "line-through text-white/60")}>{task.text}</div>
            {subtasks.length > 0 && (
              <div className="text-white/60 text-[14px]">Subtasks: {subDone}/{subtasks.length}</div>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setOpen(v => !v)}>{open ? "Hide" : "Details"}</Button>
          <Button variant="ghost" onClick={() => onRemove(task.id)} disabled={locked}>Remove</Button>
        </div>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 grid gap-3">
          <div className="text-[16px] text-white/70">Notes (optional)</div>
          <Textarea value={task.notes ?? ""} onChange={e => onSetNotes(task.id, e.target.value)} placeholder="Notes for this task…" />

          {allowSubtasks && (
            <>
              <div className="text-[16px] text-white/70">Subtasks (required if you add them)</div>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  value={subText}
                  onChange={e => setSubText(e.target.value)}
                  placeholder="Add a subtask"
                  disabled={locked}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onAddSubtask(task.id, subText);
                      setSubText("");
                    }
                  }}
                />
                <Button
                  size="lg"
                  onClick={() => { onAddSubtask(task.id, subText); setSubText(""); }}
                  disabled={locked || !subText.trim()}
                >
                  Add subtask
                </Button>
              </div>

              <div className="grid gap-2">
                {subtasks.map(st => (
                  <TaskRow
                    key={st.id}
                    task={st}
                    depth={depth + 1}
                    locked={locked}
                    allowSubtasks={allowSubtasks}
                    onToggle={onToggle}
                    onRemove={onRemove}
                    onSetNotes={onSetNotes}
                    onAddSubtask={onAddSubtask}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
