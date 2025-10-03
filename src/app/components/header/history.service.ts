import { Injectable } from '@angular/core';

export interface HistoryEntry {
  action: 'add' | 'update' | 'delete' | 'other';
  message: string;
  when: string; // ISO string for storage
}

const STORAGE_KEY = 'app_activity_history_v1';
const MAX_ENTRIES = 200;

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private cache: HistoryEntry[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.cache = raw ? JSON.parse(raw) : [];
    } catch {
      this.cache = [];
    }
  }

  private persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache)); } catch { /* ignore */ }
  }

  getAll(): HistoryEntry[] { return [...this.cache]; }

  add(entry: Omit<HistoryEntry, 'when'> & { when?: string | Date }) {
    const whenIso = (entry.when instanceof Date ? entry.when.toISOString() : (entry.when || new Date().toISOString()));
    this.cache.unshift({ action: entry.action, message: entry.message, when: whenIso });
    if (this.cache.length > MAX_ENTRIES) this.cache.length = MAX_ENTRIES;
    this.persist();
  }

  /** Convenience wrapper for domain events.
   * entity: logical domain entity (e.g., Resident, Facility)
   * action: add|update|delete|other
   * summary: short human readable description
   * extra: optional object; will be stringified compactly
   */
  logChange(params: { entity: string; action: HistoryEntry['action']; summary: string; extra?: any; }) {
    const { entity, action, summary, extra } = params;
    let msg = `[${entity}] ${summary}`;
    if (extra !== undefined) {
      try {
        const compact = JSON.stringify(extra);
        if (compact && compact.length < 160) msg += ` — ${compact}`;
      } catch { /* ignore stringify errors */ }
    }
    this.add({ action, message: msg });
  }

  clear() {
    this.cache = [];
    this.persist();
  }

  // Placeholder for future server synchronization
  // Placeholder for future server synchronization (kept intentionally to show planned extension point)
  async syncFromServer(): Promise<void> { /* no-op */ }
}
