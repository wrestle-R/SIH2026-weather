"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { NormalizedEvent, NormalizationBatch, ParserManifest } from "@/lib/types";

const STORAGE_KEY = "ulpf-demo-state-v1";
const MAX_STORED_EVENTS = 200;

interface StoredState {
  version: 1;
  events: NormalizedEvent[];
  manifests: ParserManifest[];
}

interface AppStateValue {
  hydrated: boolean;
  events: NormalizedEvent[];
  manifests: ParserManifest[];
  addBatch: (batch: NormalizationBatch) => void;
  saveManifest: (manifest: ParserManifest) => void;
  clearEvents: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [manifests, setManifests] = useState<ParserManifest[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as StoredState;
          if (stored.version === 1) {
            setEvents(stored.events ?? []);
            setManifests(stored.manifests ?? []);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { version: 1, events, manifests };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { /* Storage is optional; the active session still works. */ }
  }, [events, manifests, hydrated]);

  const addBatch = useCallback((batch: NormalizationBatch) => {
    setEvents((current) => [...batch.events, ...current].slice(0, MAX_STORED_EVENTS));
  }, []);
  const saveManifest = useCallback((manifest: ParserManifest) => {
    setManifests((current) => [manifest, ...current.filter((item) => item.id !== manifest.id)]);
  }, []);
  const clearEvents = useCallback(() => setEvents([]), []);
  const value = useMemo(() => ({ hydrated, events, manifests, addBatch, saveManifest, clearEvents }), [hydrated, events, manifests, addBatch, saveManifest, clearEvents]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used within AppStateProvider.");
  return value;
}
