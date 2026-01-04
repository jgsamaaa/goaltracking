"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";

const LS_KEY = "gdt_timer_prefs_v1";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(totalSeconds: number) {
  const s = clamp(Math.floor(totalSeconds), 0, 999999);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
}

export default function TimerPage() {
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [totalSeconds, setTotalSeconds] = useState<number>(30 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // load prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.customMinutes === "number") {
        const m = clamp(Math.floor(parsed.customMinutes), 1, 999);
        setCustomMinutes(m);
        setTotalSeconds(m * 60);
      }
    } catch {}
  }, []);

  // save prefs
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ customMinutes }));
    } catch {}
  }, [customMinutes]);

  // tick
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning]);

  // auto-stop at 0
  useEffect(() => {
    if (totalSeconds === 0 && isRunning) setIsRunning(false);
  }, [totalSeconds, isRunning]);

  const minutesLeft = useMemo(() => Math.floor(totalSeconds / 60), [totalSeconds]);

  const setPreset = (mins: number) => {
    const m = clamp(Math.floor(mins), 1, 999);
    setIsRunning(false);
    setCustomMinutes(m);
    setTotalSeconds(m * 60);
  };

  const applyCustom = () => {
    const m = clamp(Math.floor(customMinutes), 1, 999);
    setIsRunning(false);
    setCustomMinutes(m);
    setTotalSeconds(m * 60);
  };

  const reset = () => {
    setIsRunning(false);
    setTotalSeconds(customMinutes * 60);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[34px] font-extrabold leading-tight">Timer</div>
          <div className="text-white/60 text-[16px]">Simple focus timer. Local-only.</div>
        </div>
        <Badge className="text-[14px]">{isRunning ? "RUNNING" : totalSeconds === 0 ? "DONE" : "READY"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[22px]">Presets</CardTitle>
          <div className="text-white/60 text-[16px]">Pick a set timer.</div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setPreset(30)} className="text-[18px] px-6 py-6">30 mins</Button>
          <Button onClick={() => setPreset(60)} className="text-[18px] px-6 py-6">60 mins</Button>
          <Button onClick={() => setPreset(90)} className="text-[18px] px-6 py-6">90 mins</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[22px]">Custom</CardTitle>
          <div className="text-white/60 text-[16px]">Set any minutes you want (saved locally).</div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
              <Input
                type="number"
                min={1}
                max={999}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="text-[18px] h-12"
                placeholder="Minutes"
              />
            </div>
            <Button onClick={applyCustom} className="text-[18px] px-6 py-6">Apply</Button>
            <div className="text-white/60 text-[16px]">Current: <span className="text-white">{customMinutes} mins</span></div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-white/60 text-[16px] mb-2">Time Left</div>
            <div className="text-[72px] font-extrabold tracking-tight">{formatTime(totalSeconds)}</div>
            <div className="text-white/60 text-[16px] mt-2">{minutesLeft} minute(s) remaining</div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {!isRunning ? (
                <Button
                  onClick={() => setIsRunning(true)}
                  disabled={totalSeconds === 0}
                  className="text-[18px] px-8 py-6"
                >
                  Start
                </Button>
              ) : (
                <Button onClick={() => setIsRunning(false)} className="text-[18px] px-8 py-6">
                  Pause
                </Button>
              )}

              <Button onClick={reset} className="text-[18px] px-8 py-6" variant="secondary">
                Reset
              </Button>

              <Button onClick={() => { setIsRunning(false); setTotalSeconds(0); }} className="text-[18px] px-8 py-6" variant="secondary">
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
