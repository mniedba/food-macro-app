import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LogEntry, DailyTotals } from '../types';
import { saveDailyLog, loadDailyLog, clearDailyLog } from '../utils/storage';
import { localDateString } from '../utils/formatters';

interface DailyLogContextValue {
  entries: LogEntry[];
  totals: DailyTotals;
  addEntry: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
  removeEntry: (id: string) => void;
  clearLog: () => void;
  isLoading: boolean;
}

const DailyLogContext = createContext<DailyLogContextValue | null>(null);

export function DailyLogProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDailyLog(localDateString()).then((loaded) => {
      setEntries(loaded);
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback((next: LogEntry[]) => {
    setEntries(next);
    saveDailyLog(localDateString(), next);
  }, []);

  const addEntry = useCallback((entry: Omit<LogEntry, 'id' | 'date'>) => {
    const full: LogEntry = {
      ...entry,
      id: Date.now().toString(),
      date: localDateString(),
    };
    persist([...entries, full]);
  }, [entries, persist]);

  const removeEntry = useCallback((id: string) => {
    persist(entries.filter((e) => e.id !== id));
  }, [entries, persist]);

  const clearLog = useCallback(() => {
    setEntries([]);
    clearDailyLog(localDateString());
  }, []);

  const totals = useMemo<DailyTotals>(() => {
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.caloriesPerServing * e.servings,
        proteinG: acc.proteinG + e.proteinGPerServing * e.servings,
        carbsG: acc.carbsG + e.carbsGPerServing * e.servings,
        fatG: acc.fatG + e.fatGPerServing * e.servings,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );
  }, [entries]);

  return (
    <DailyLogContext.Provider value={{ entries, totals, addEntry, removeEntry, clearLog, isLoading }}>
      {children}
    </DailyLogContext.Provider>
  );
}

export function useDailyLog(): DailyLogContextValue {
  const ctx = useContext(DailyLogContext);
  if (!ctx) throw new Error('useDailyLog must be used within DailyLogProvider');
  return ctx;
}
