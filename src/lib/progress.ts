// 学习进度服务：封装本地存储，便于未来接入账号与后端。
// 所有读写均容错，避免在不支持的环境抛错。

export interface ProgressState {
  completed: string[]; // tutorial slugs
  favorites: string[]; // tutorial slugs
  recentlyViewed: { slug: string; ts: number }[];
}

const KEY = "eak:progress:v1";

function safeRead(): ProgressState {
  if (typeof window === "undefined") {
    return { completed: [], favorites: [], recentlyViewed: [] };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { completed: [], favorites: [], recentlyViewed: [] };
    const parsed = JSON.parse(raw);
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
    };
  } catch {
    return { completed: [], favorites: [], recentlyViewed: [] };
  }
}

function safeWrite(state: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy errors */
  }
}

export const progressService = {
  get(): ProgressState {
    return safeRead();
  },
  toggleComplete(slug: string): boolean {
    const s = safeRead();
    const i = s.completed.indexOf(slug);
    let nowDone: boolean;
    if (i >= 0) {
      s.completed.splice(i, 1);
      nowDone = false;
    } else {
      s.completed.push(slug);
      nowDone = true;
    }
    safeWrite(s);
    return nowDone;
  },
  isComplete(slug: string): boolean {
    return safeRead().completed.includes(slug);
  },
  toggleFavorite(slug: string): boolean {
    const s = safeRead();
    const i = s.favorites.indexOf(slug);
    let fav: boolean;
    if (i >= 0) {
      s.favorites.splice(i, 1);
      fav = false;
    } else {
      s.favorites.push(slug);
      fav = true;
    }
    safeWrite(s);
    return fav;
  },
  isFavorite(slug: string): boolean {
    return safeRead().favorites.includes(slug);
  },
  markViewed(slug: string) {
    const s = safeRead();
    s.recentlyViewed = [
      { slug, ts: Date.now() },
      ...s.recentlyViewed.filter((r) => r.slug !== slug),
    ].slice(0, 20);
    safeWrite(s);
  },
  getRecent(): string[] {
    return safeRead().recentlyViewed.map((r) => r.slug);
  },
  getStats() {
    const s = safeRead();
    return { completed: s.completed.length, favorites: s.favorites.length };
  },
};
