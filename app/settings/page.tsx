"use client";

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Badge } from "@/components/ui";
import { useDB } from "@/lib/hooks";
import { exportDB, importDB } from "@/lib/storage";
import { useState } from "react";

export default function SettingsPage() {
  const { db, update, hydrated } = useDB();
  const [backup, setBackup] = useState("");
  const [importText, setImportText] = useState("");

  if (!hydrated) return <div className="text-white/70 text-[18px]">Loading…</div>;

  const s = db.settings;

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[34px] font-bold tracking-tight">Settings</div>
          <div className="text-white/60 text-[16px]">Local-only. Simple controls.</div>
        </div>
        <Badge>v1</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discipline Rules</CardTitle>
          <div className="text-white/60 text-[16px]">Keep it strict, keep it simple.</div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <div className="text-[18px] font-semibold">Daily task limit</div>
            <Input
              type="number"
              min={1}
              max={50}
              value={s.dailyTaskLimit}
              onChange={e => {
                const v = Math.max(1, Math.min(50, Number(e.target.value || 8)));
                update(d => ({ ...d, settings: { ...d.settings, dailyTaskLimit: v } }));
              }}
            />
          </div>

          <label className="flex items-center gap-3 text-[18px] font-semibold">
            <input
              type="checkbox"
              checked={s.lockAfterStart}
              onChange={e => update(d => ({ ...d, settings: { ...d.settings, lockAfterStart: e.target.checked } }))}
              className="h-5 w-5 accent-white"
            />
            Lock adding/removing tasks after you start the day (focus or 1 task added)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
          <div className="text-white/60 text-[16px]">Export and import your data (local).</div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button
            size="lg"
            onClick={() => {
              const data = exportDB();
              setBackup(data);
              navigator.clipboard?.writeText(data);
            }}
          >
            Export (also copies to clipboard)
          </Button>
          <Textarea value={backup} onChange={e => setBackup(e.target.value)} placeholder="Export will appear here…" />

          <div className="h-px bg-white/10 my-2" />

          <Textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste exported JSON here to import…" />
          <Button
            variant="danger"
            size="lg"
            onClick={() => {
              importDB(importText);
              window.location.reload();
            }}
            disabled={!importText.trim()}
          >
            Import (overwrites local data)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
