import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  username: string;
  loggedInAt: Date;
  role: 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(null);
  user = this._user.asReadonly();

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
