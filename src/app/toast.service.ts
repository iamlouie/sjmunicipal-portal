import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private counter = 0;

  toasts = this._toasts.asReadonly();

  push(message: string, type: Toast['type'] = 'info', timeout = 3500) {
    const id = ++this.counter;
    const toast: Toast = { id, type, message, timeout };
    this._toasts.update(list => [...list, toast]);
    if (timeout > 0) {
      setTimeout(() => this.dismiss(id), timeout);
    }
  }

  success(message: string, timeout = 3500) { this.push(message, 'success', timeout); }
  error(message: string, timeout = 5000) { this.push(message, 'error', timeout); }
  info(message: string, timeout = 3500) { this.push(message, 'info', timeout); }

  dismiss(id: number) {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  clear() { this._toasts.set([]); }
}
