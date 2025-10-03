import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface InternalConfirmState extends Required<ConfirmOptions> {
  visible: boolean;
  resolve?: (value: boolean) => void;
}

const defaultState: InternalConfirmState = {
  title: 'Confirm Submission',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Yes',
  cancelText: 'Cancel',
  destructive: false,
  visible: false
};

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private _state = signal<InternalConfirmState>({ ...defaultState });
  state = this._state.asReadonly();

  open(opts: ConfirmOptions = {}): Promise<boolean> {
    return new Promise(resolve => {
      this._state.set({ ...defaultState, ...opts, visible: true, resolve });
    });
  }

  confirm() {
    const s = this._state();
    s.resolve?.(true);
    this._state.set({ ...s, visible: false, resolve: undefined });
  }

  cancel() {
    const s = this._state();
    s.resolve?.(false);
    this._state.set({ ...s, visible: false, resolve: undefined });
  }
}
