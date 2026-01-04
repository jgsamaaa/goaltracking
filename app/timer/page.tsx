"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";

type Phase = "focus" | "short" | "long" | "custom";

const LS_KEY = "gdt_timer_prefs_v2";

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatTime = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
};

const phaseLabel = (p: Phase) =>
  p === "focus" ? "FOCUS" : p === "short" ? "SHORT BREAK" : p === "long" ? "LONG BREAK" : "CUSTOM";

export default function TimerPage() {
  const [customMinutes, setCustomMinutes] = useState(30);

  const [focusMin, setFocusMin] = useState(25);
  const [shortMin, setShortMin] = useState(5);
  const [longMin, setLongMin] = useState(15);
  const [cycleEvery, setCycleEvery] = useState(4);

  const [phase, setPhase] = useState<Phase>("custom");
  const [pomoCount, setPomoCount] = useState(0);
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<number | null>(null);

  /* Load prefs */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      setCustomMinutes(p.customMinutes ?? 30);
      setFocusMin(p.focusMin ?? 25);
      setShortMin(p.shortMin ?? 5);
      setLongMin(p.longMin ?? 15);
      setCycleEvery(p.cycleEvery ?? 4);
      setTotalSeconds((p.customMinutes ?? 30) * 60);
    } catch {}
  }, []);

  /* Save prefs */
  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ customMinutes, focusMin, shortMin, longMin, cycleEvery })
    );
  }, [customMinutes, focusMin, shortMin, longMin, cycleEvery]);

  /* Timer tick */
useEffect(() => {
  if (!isRunning) return;

  const id = window.setInterval(() => {
    setTotalSeconds((s) => (s <= 1 ? 0 : s - 1));
  }, 1000);

  intervalRef.current = id;

  return () => {
    window.clearInterval(id);
    intervalRef.current = null;
  };
}, [isRunning]);


  /* Pomodoro auto-advance */
  useEffect(() => {
    if (totalSeconds !== 0 || !isRunning || !isPomodoro) return;
    setIsRunning(false);

    if (phase === "focus") {
      const next = pomoCount + 1;
      setPomoCount(next);
      const isLong = next % cycleEvery === 0;
      setPhase(isLong ? "long" : "short");
      setTotalSeconds((isLong ? longMin : shortMin) * 60);
      setIsRunning(true);
    } else {
      setPhase("focus");
      setTotalSeconds(focusMin * 60);
      setIsRunning(true);
    }
  }, [totalSeconds]);

  const minutesLeft = useMemo(() => Math.floor(totalSeconds / 60), [totalSeconds]);

  const startCustom = (m: number) => {
    setIsPomodoro(false);
    setPhase("custom");
    setCustomMinutes(m);
    setTotalSeconds(m * 60);
    setIsRunning(false);
  };

  const startPhase = (p: Phase, m: number, pomo: boolean) => {
    setIsPomodoro(pomo);
    setPhase(p);
    setTotalSeconds(m * 60);
    setIsRunning(true);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">

      {/* 🔥 MAIN TIMER AT TOP */}
      <Card>
        <CardContent className="p-10 text-center">
          <div className="flex justify-center gap-2 mb-3">
            <Badge>{phaseLabel(phase)}</Badge>
            <Badge>{isRunning ? "RUNNING" : "READY"}</Badge>
            {isPomodoro && <Badge>POMO #{pomoCount}</Badge>}
          </div>

          <div className="text-[96px] font-extrabold tracking-tight">
            {formatTime(totalSeconds)}
          </div>
          <div className="text-white/60 mt-2">
            {minutesLeft} minute(s) remaining
          </div>

          <div className="mt-6 flex justify-center gap-3">
            {!isRunning ? (
              <Button className="px-8 py-6 text-lg" onClick={() => setIsRunning(true)}>
                Start
              </Button>
            ) : (
              <Button className="px-8 py-6 text-lg" onClick={() => setIsRunning(false)}>
                Pause
              </Button>
            )}
            <Button variant="ghost" className="px-8 py-6 text-lg" onClick={() => startCustom(customMinutes)}>
              Reset
            </Button>
            <Button variant="ghost" className="px-8 py-6 text-lg" onClick={() => setTotalSeconds(0)}>
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* POMODORO */}
      <Card>
        <CardHeader>
          <CardTitle>Pomodoro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input value={focusMin} onChange={(e) => setFocusMin(+e.target.value)} />
            <Input value={shortMin} onChange={(e) => setShortMin(+e.target.value)} />
            <Input value={longMin} onChange={(e) => setLongMin(+e.target.value)} />
            <Input value={cycleEvery} onChange={(e) => setCycleEvery(+e.target.value)} />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => startPhase("focus", focusMin, true)}>Start Pomodoro</Button>
            <Button variant="ghost" onClick={() => startPhase("focus", focusMin, true)}>Focus</Button>
            <Button variant="ghost" onClick={() => startPhase("short", shortMin, true)}>Short Break</Button>
            <Button variant="ghost" onClick={() => startPhase("long", longMin, true)}>Long Break</Button>
          </div>
        </CardContent>
      </Card>

      {/* PRESETS */}
      <Card>
        <CardHeader>
          <CardTitle>Presets</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => startCustom(30)}>30 mins</Button>
          <Button onClick={() => startCustom(60)}>60 mins</Button>
          <Button onClick={() => startCustom(90)}>90 mins</Button>
        </CardContent>
      </Card>

      {/* CUSTOM */}
      <Card>
        <CardHeader>
          <CardTitle>Custom</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Input
            type="number"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(+e.target.value)}
          />
          <Button onClick={() => startCustom(customMinutes)}>Apply</Button>
        </CardContent>
      </Card>
    </div>
  );
}
