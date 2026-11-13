"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { progressService, type ProgressState } from "@/lib/progress";

interface ProgressContextValue {
  state: ProgressState;
  completedCount: number;
  favoriteCount: number;
  isComplete: (slug: string) => boolean;
  isFavorite: (slug: string) => boolean;
  toggleComplete: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  markViewed: (slug: string) => void;
  recent: string[];
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>({
    completed: [],
    favorites: [],
    recentlyViewed: [],
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(progressService.get());
    setMounted(true);
  }, []);

  function refresh() {
    setState(progressService.get());
  }

  const value: ProgressContextValue = {
    state,
    completedCount: mounted ? state.completed.length : 0,
    favoriteCount: mounted ? state.favorites.length : 0,
    isComplete: (slug) => state.completed.includes(slug),
    isFavorite: (slug) => state.favorites.includes(slug),
    toggleComplete: (slug) => {
      progressService.toggleComplete(slug);
      refresh();
    },
    toggleFavorite: (slug) => {
      progressService.toggleFavorite(slug);
      refresh();
    },
    markViewed: (slug) => {
      progressService.markViewed(slug);
      refresh();
    },
    recent: state.recentlyViewed.map((r) => r.slug),
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    // 容错：未挂载 Provider 时返回空实现
    return {
      state: { completed: [], favorites: [], recentlyViewed: [] },
      completedCount: 0,
      favoriteCount: 0,
      isComplete: () => false,
      isFavorite: () => false,
      toggleComplete: () => {},
      toggleFavorite: () => {},
      markViewed: () => {},
      recent: [],
    } as ProgressContextValue;
  }
  return ctx;
}
