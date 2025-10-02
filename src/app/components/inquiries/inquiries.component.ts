import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inquiries',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.css']
})
export class InquiriesComponent {
  inquiries = [
    { id: 1, subject: 'Business permit processing', status: 'Open', submitted: '2025-09-30', barangay: 'Poblacion', details: 'Clarification on documentary requirements.' },
    { id: 2, subject: 'Road repair follow-up', status: 'Pending', submitted: '2025-09-28', barangay: 'Zone 2', details: 'Pothole still unrepaired near corner.' },
    { id: 3, subject: 'Health center medicine availability', status: 'Resolved', submitted: '2025-09-25', barangay: 'San Roque', details: 'Asking for stock levels of maintenance meds.' }
  ];

  submitting = false;
  formTouched = false;
  successMessage: string | null = null;

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
    const subjOk = this.model.subject.trim().length >= 4;
    const brgyOk = !!this.model.barangay;
    const detailsOk = this.model.details.trim().length >= 10;
    return nameOk && contactOk && subjOk && brgyOk && detailsOk;
  }

  submit() {
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
      this.successMessage = 'Inquiry submitted successfully.';
      this.resetForm();
      setTimeout(()=> this.successMessage = null, 4000);
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
