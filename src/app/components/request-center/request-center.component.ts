import { Component, computed, signal } from '@angular/core';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService, RequestKind } from '../../request.service';
import { ToastService } from '../../toast.service';
import { ConfirmService } from '../../confirm.service';

interface FormModel {
  kind: RequestKind | '';
  applicantName: string;
  contact: string;
  purpose: string;
}

@Component({
  selector: 'app-request-center',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, DatePipe],
  templateUrl: './request-center.component.html',
  styleUrls: ['./request-center.component.css']
})
export class RequestCenterComponent {
  kinds: { value: RequestKind; label: string }[] = [
    { value: 'birth-marriage-death', label: 'Birth / Marriage / Death Certificate' },
    { value: 'barangay-residency', label: 'Barangay / Residency Certificate' },
    { value: 'business-permit', label: 'Business Permit (Application / Renewal)' },
    { value: 'building-permit', label: 'Building Permit Application' }
  ];

  form = signal<FormModel>({ kind: '', applicantName: '', contact: '', purpose: '' });
  submitting = signal(false);
  recent = this.requestSvc.requests; // signal from service

  constructor(private requestSvc: RequestService, private toast: ToastService, private confirm: ConfirmService) {}

  update<K extends keyof FormModel>(key: K, value: FormModel[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  canSubmit = computed(() => {
    const f = this.form();
    return !!f.kind && f.applicantName.trim().length >= 2 && /^(?:\+?\d[\d\s-]{6,})$/.test(f.contact.trim());
  });

  async submit() {
    if (!this.canSubmit()) return;
    const ok = await this.confirm.open({
      title: 'Submit Request',
      message: 'Confirm that all request details are accurate before submission.',
      confirmText: 'Submit',
      cancelText: 'Review'
    });
    if (!ok) return;
    this.submitting.set(true);
    const f = this.form();
    const created = this.requestSvc.submit({
      kind: f.kind as RequestKind,
      applicantName: f.applicantName.trim(),
      contact: f.contact.trim(),
      purpose: f.purpose.trim() || undefined
    });
    this.toast.success(`Request submitted. Reference: ${created.id}`);
    this.form.set({ kind: '', applicantName: '', contact: '', purpose: '' });
    setTimeout(() => this.submitting.set(false), 400); // simulate async delay
  }

  labelFor(kind: RequestKind) {
    return this.kinds.find(k => k.value === kind)?.label || kind;
  }

  trackByReq = (_: number, r: { id: string }) => r.id;
}
