import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../toast.service';

@Component({
  selector: 'app-inquiries',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.css']
})
export class InquiriesComponent {
  // Inquiry model (kept local for now; can be moved to a shared models folder later)
  inquiries: Array<{
    id: number;
    name?: string;
    contact?: string;
    subject: string;
    status: string;
    submitted: string; // ISO date string
    barangay: string;
    details: string;
  }> = [];

  submitting = false;
  formTouched = false;

  model = {
    name: '',
    contact: '',
    subject: '',
    barangay: '',
    details: ''
  };

  barangays: string[] = [
    'Agay-ay','Basak','Bobon A','Bobon B','Dayanog','Garrido','Minoyho','Osao','Pong-oy',
    'San Jose (Poblacion)','San Roque','San Vicente','Santa Cruz (Poblacion)','Santa Filomena',
    'Santo Niño (Poblacion)','Somoje','Sua','Timba'
  ];

  get isValid() {
    const nameOk = this.model.name.trim().length >= 2;
    const contactOk = this.model.contact.trim().length >= 7; // basic length check
    const subjOk = this.model.subject.trim().length > 0; // now only required, no min length
    const brgyOk = !!this.model.barangay;
    const detailsOk = this.model.details.trim().length > 0; // only required, no min length
    return nameOk && contactOk && subjOk && brgyOk && detailsOk;
  }

  constructor(private toast: ToastService) {}

  submit(form?: NgForm) {
    this.formTouched = true;
    if (!this.isValid || this.submitting) return;
    this.submitting = true;
    const now = new Date();
    const newInquiry = {
      id: this.inquiries.length ? Math.max(...this.inquiries.map(i => i.id)) + 1 : 1,
      name: this.model.name.trim(),
      contact: this.model.contact.trim(),
      subject: this.model.subject.trim(),
      status: 'Open',
      submitted: now.toISOString().split('T')[0],
      barangay: this.model.barangay,
      details: this.model.details.trim()
    };
    // Simulate async delay
    setTimeout(() => {
      this.inquiries.unshift(newInquiry);
      this.submitting = false;
      this.toast.success('Inquiry submitted');
      // Reset model & clear manual touched flag
      this.resetForm();
      // Also reset Angular form state (touched/dirty) if provided
      if (form) {
        form.resetForm({ name: '', contact: '', subject: '', barangay: '', details: '' });
      }
    }, 400);
  }

  resetForm() {
    this.model = { name: '', contact: '', subject: '', barangay: '', details: '' };
    this.formTouched = false;
  }

  onContactInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    // Keep only digits
    const digits = input.value.replace(/\D+/g, '');
    if (digits !== input.value) {
      input.value = digits;
    }
    this.model.contact = digits;
  }
}
