import { Injectable, signal, effect } from '@angular/core';

export interface AuthUser {
  username: string;
  loggedInAt: Date;
  role: 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(null);
  user = this._user.asReadonly();

  private STORAGE_KEY = 'app.auth.user';

  constructor() {
    // Attempt restore on creation
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser & { loggedInAt: string };
        // Rehydrate date
        this._user.set({ username: parsed.username, role: parsed.role, loggedInAt: new Date(parsed.loggedInAt) });
      }
    } catch { /* ignore restore errors */ }

    // Persist on change
    effect(() => {
      const u = this._user();
      if (u) {
        try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(u)); } catch { /* ignore */ }
      } else {
        try { localStorage.removeItem(this.STORAGE_KEY); } catch { /* ignore */ }
      }
    });
  }

  isAuthenticated() { return this._user() !== null; }

  login(username: string, password: string): boolean {
    const u = username.trim();
    const p = password.trim();
    // Only allow a single hard-coded admin credential for now.
    if (u === 'admin' && p === 'admin') {
      this._user.set({ username: 'admin', loggedInAt: new Date(), role: 'admin' });
      return true;
    }
    return false;
  }

  isAdmin() { return this._user()?.role === 'admin'; }

  logout() { this._user.set(null); }
}
