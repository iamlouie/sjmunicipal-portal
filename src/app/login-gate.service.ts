import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginGateService {
  // Track whether a login was requested due to protected navigation
  private _requested = signal(false);
  requested = this._requested.asReadonly();

  // Store a pending URL to redirect after login
  private _redirectTo: string | null = null;

  requestLogin(redirectTo: string) {
    this._redirectTo = redirectTo;
    this._requested.set(true);
  }

  consumeRedirect(): string | null {
    const r = this._redirectTo;
    this._redirectTo = null;
    return r;
  }

  clearRequest() { this._requested.set(false); }
}
