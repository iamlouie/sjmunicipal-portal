import { Injectable, signal } from '@angular/core';

export type RequestKind = 'birth-marriage-death' | 'barangay-residency' | 'business-permit' | 'building-permit';

export interface BaseRequest {
  id: string;
  kind: RequestKind;
  applicantName: string;
  contact: string;
  purpose?: string;
  createdAt: Date;
  status: 'submitted' | 'review' | 'approved' | 'rejected';
}

@Injectable({ providedIn: 'root' })
export class RequestService {
  private _requests = signal<BaseRequest[]>([]);
  requests = this._requests.asReadonly();

  submit(partial: Omit<BaseRequest, 'id' | 'createdAt' | 'status'>) {
    const id = this.generateRef(partial.kind);
    const req: BaseRequest = { ...partial, id, createdAt: new Date(), status: 'submitted' };
    this._requests.update(list => [req, ...list]);
    return req;
  }

  private generateRef(kind: RequestKind) {
    const prefix = {
      'birth-marriage-death': 'CRV',
      'barangay-residency': 'BRG',
      'business-permit': 'BIZ',
      'building-permit': 'BLD'
    }[kind];
    const now = new Date();
    return `${prefix}-${now.getFullYear().toString().slice(-2)}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  }
}
