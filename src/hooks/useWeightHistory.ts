import { useState, useEffect, useCallback } from 'react';
import { WeightEntry } from '../types';
import { loadWeightHistory, saveWeightHistory } from '../utils/storage';

export function useWeightHistory() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await loadWeightHistory();
      setEntries(saved);
      setIsLoading(false);
    })();
  }, []);

  const addEntry = useCallback(async (weightLbs: number, note?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      date: today,
      weightLbs,
      note,
    };
    setEntries(prev => {
      const updated = [newEntry, ...prev];
      saveWeightHistory(updated);
      return updated;
    });
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveWeightHistory(updated);
      return updated;
    });
  }, []);

  // Entries sorted newest first
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return { entries: sortedEntries, addEntry, removeEntry, isLoading };
}
