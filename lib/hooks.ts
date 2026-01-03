"use client";

import { useEffect, useMemo, useState } from "react";
import { loadDB, saveDB, DB } from "./storage";

export function useDB() {
  const [db, setDB] = useState<DB>(() => loadDB());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDB(loadDB());
    setHydrated(true);
  }, []);

  function update(mutator: (draft: DB) => DB) {
    setDB(prev => {
      const next = mutator(structuredClone(prev));
      saveDB(next);
      return next;
    });
  }

  return { db, update, hydrated };
}

export function useSettings() {
  const { db, update, hydrated } = useDB();
  const settings = useMemo(() => db.settings, [db.settings]);
  return { settings, setSettings: (s: typeof settings) => update(d => ({ ...d, settings: s })), hydrated };
}
