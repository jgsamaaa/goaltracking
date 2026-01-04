"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";

type Phase = "focus" | "short" | "long" | "custom";

const LS_KEY = "gdt_timer_prefs_v2";

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

function phaseLabel(p: Phase) {
  if (p === "focus") return "FOCUS";
  if (p === "short") return "SHORT BREAK";
  if (p === "long") return "LONG BREAK";
  return "CUSTOM";
}

export default function TimerPage() {
  // Custom timer
  const [customMinutes, setCustomMinutes] = useState<number>(30);

  // Pomodoro settings
  const [focusMin, setFocusMin] = useState<number>(25);
  const [shortMin, setShortMin] = useState<number>(5);
  const [longMin, setLongMin] = useState<number>(15);
  const [cycleEvery, setCycleEvery] = useState<number>(4);

  // Timer state
  const [phase, setPhase] = useState<Phase>("custom");
  const [pomoCount, setPomoCount] = useState<number>(0); // focus sessions completed (in this run)
  const [isPomodoro, setIsPomodoro] = useState<boolean>(false);
  const [totalSeconds, setTotalSeconds] = useState<number>(30 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // load prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.customMinutes === "number") setCustomMinutes(clamp(Math.floor(parsed.customMinutes), 1, 999));
      if (typeof parsed?.focusMin === "number") setFocusMin(clamp(Math.floor(parsed.focusMin), 5, 180));
      if (typeof parsed?.shortMin === "number") setShortMin(clamp(Math.floor(parsed.shortMin), 1, 60));
      if (typeof parsed?.longMin === "number") setLongMin(clamp(Math.floor(parsed.longMin), 5, 120));
      if (typeof parsed?.cycleEvery === "number") setCycleEvery(clamp(Math.floor(parsed.cycleEvery), 2, 12));

      // restore custom time display
      const cm = typeof parsed?.customMinutes === "number" ? clamp(Math.floor(parsed.customMinutes), 1, 999) : 30;
      setTotalSeconds(cm * 60);
      setPhase("custom");
    } catch {}
  }, []);

  // save prefs
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ customMinutes, focusMin, shortMin, longMin, cycleEvery })
      );
    } catch {}
  }, [customMinutes, focusMin, shortMin, longMin, cycleEvery]);

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

  // auto-advance Pomodoro at 0
  useEffect(() => {
    if (totalSeconds !== 0) return;
    if (!isRunning) return;

    // stop this tick loop first
    setIsRunning(false);

    if (!isPomodoro) return;

    // Advance to next Pomodoro phase
    if (phase === "focus") {
      const nextCount = pomoCount + 1;
      setPomoCount(nextCount);

      const isLong = nextCount % clamp(cycleEvery, 2, 12) === 0;
      const nextPhase: Phase = isLong ? "long" : "short";
      const nextMins = isLong ? longMin : shortMin;

      setPhase(nextPhase);
      setTotalSeconds(clamp(nextMins, 1, 999) * 60);
      setIsRunning(true);
      return;
    }

    // from break -> focus
    if (phase === "short" || phase === "long") {
      setPhase("focus");
      setTotalSeconds(clamp(focusMin, 1, 999) * 60);
      setIsRunning(true);
      return;
    }
  }, [totalSeconds, isRunning, isPomodoro, phase, pomoCount, focusMin, shortMin, longMin, cycleEvery]);

  const minutesLeft = useMemo(() => Math.floor(totalSeconds / 60), [totalSeconds]);

  const setCustom = (mins: number) => {
    const m = clamp(Math.floor(mins), 1, 999);
    setIsPomodoro(false);
    setPomoCount(0);
    setPhase("custom");
    setIsRunning(false);
    setCustomMinutes(m);
    setTotalSeconds(m * 60);
  };

  const applyCustom = () => setCustom(customMinutes);

  const startPhase = (p: Phase, mins: number, pomodoro: boolean) => {
    const m = clamp(Math.floor(mins), 1, 999);
    setIsPomodoro(pomodoro);
    setPhase(p);
    if (!pomodoro) setPomoCount(0);
    setTotalSeconds(m * 60);
    setIsRunning(true);
  };

  const startPomodoro = () => {
    setPomoCount(0);
    startPhase("focus", focusMin, true);
  };

  const reset = () => {
    setIsRunning(false);
    if (isPomodoro) {
      // reset to focus start
      setPomoCount(0);
      setPhase("focus");
      setTotalSeconds(clamp(focusMin, 1, 999) * 60);
    } else {
      setPhase("custom");
      setTotalSeconds(clamp(customMinutes, 1, 999) * 60);
    }
  };

  const stop = () => {
    setIsRunning(false);
    setTotalSeconds(0);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[34px] font-extrabold leading-tight">Timer</div>
          <div className="text-white/60 text-[16px]">
            {isPomodoro ? "Pomodoro mode (auto-advances)." : "Simple timer."} Local-only.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-[14px]">{phaseLabel(phase)}</Badge>
          <Badge className="text-[14px]">{isRunning ? "RUNNING" : totalSeconds === 0 ? "DONE" : "READY"}</Badge>
          {isPomodoro && <Badge className="text-[14px]">POMO #{pomoCount}</Badge>}
        </div>
      </div>

      {/* Pomodoro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[22px]">Pomodoro</CardTitle>
          <div className="text-white/60 text-[16px]">25/5/15 by default. Long break every 4 focus sessions.</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <div className="text-white/60 text-[14px] mb-1">Focus (min)</div>
              <Input className="text-[18px] h-12" type="number" min={5} max={180} value={focusMin} onChange={e => setFocusMin(Number(e.target.value))} />
            </div>
            <div>
              <div className="text-white/60 text-[14px] mb-1">Short break (min)</div>
              <Input className="text-[18px] h-12" type="number" min={1} max={60} value={shortMin} onChange={e => setShortMin(Number(e.target.value))} />
            </div>
            <div>
              <div className="text-white/60 text-[14px] mb-1">Long break (min)</div>
              <Input className="text-[18px] h-12" type="number" min={5} max={120} value={longMin} onChange={e => setLongMin(Number(e.target.value))} />
            </div>
            <div>
              <div className="text-white/60 text-[14px] mb-1">Long every (focus)</div>
              <Input className="text-[18px] h-12" type="number" min={2} max={12} value={cycleEvery} onChange={e => setCycleEvery(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="text-[18px] px-6 py-6" onClick={startPomodoro}>Start Pomodoro</Button>
            <Button className="text-[18px] px-6 py-6" variant="secondary" onClick={() => startPhase("focus", focusMin, true)}>Focus</Button>
            <Button className="text-[18px] px-6 py-6" variant="secondary" onClick={() => startPhase("short", shortMin, true)}>Short Break</Button>
            <Button className="text-[18px] px-6 py-6" variant="secondary" onClick={() => startPhase("long", longMin, true)}>Long Break</Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[22px]">Presets</CardTitle>
          <div className="text-white/60 text-[16px]">Pick a set timer (non-pomodoro).</div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setCustom(30)} className="text-[18px] px-6 py-6">30 mins</Button>
          <Button onClick={() => setCustom(60)} className="text-[18px] px-6 py-6">60 mins</Button>
          <Button onClick={() => setCustom(90)} className="text-[18px] px-6 py-6">90 mins</Button>
        </CardContent>
      </Card>

      {/* Custom */}
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
                <Button onClick={() => setIsRunning(true)} disabled={totalSeconds === 0} className="text-[18px] px-8 py-6">
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

              <Button onClick={stop} className="text-[18px] px-8 py-6" variant="secondary">
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
