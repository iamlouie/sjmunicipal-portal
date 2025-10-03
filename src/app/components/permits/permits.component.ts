import { Component, signal, computed } from '@angular/core';
import { ConfirmService } from '../../confirm.service';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

interface BusinessApplicationDetails { businessName: string; ownerName: string; address: string; nature: string; capital: string; }
interface BusinessRenewalDetails { businessName: string; previousPermitNo: string; grossSales: string; ownerContact: string; }
interface BuildingApplicationDetails { projectTitle: string; location: string; estimatedCost: string; contractor: string; ownerName: string; }

type PermitType = 'business-application' | 'business-renewal' | 'building-application' | '';

interface PermitFormState {
  type: PermitType;
  businessApplication: BusinessApplicationDetails;
  businessRenewal: BusinessRenewalDetails;
  buildingApplication: BuildingApplicationDetails;
}

function emptyBusinessApplication(): BusinessApplicationDetails { return { businessName: '', ownerName: '', address: '', nature: '', capital: '' }; }
function emptyBusinessRenewal(): BusinessRenewalDetails { return { businessName: '', previousPermitNo: '', grossSales: '', ownerContact: '' }; }
function emptyBuildingApplication(): BuildingApplicationDetails { return { projectTitle: '', location: '', estimatedCost: '', contractor: '', ownerName: '' }; }

@Component({
  selector: 'app-permits',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './permits.component.html',
  styleUrls: ['./permits.component.css']
})

export class PermitsComponent {
  form = signal<PermitFormState>({
    type: '',
    businessApplication: emptyBusinessApplication(),
    businessRenewal: emptyBusinessRenewal(),
    buildingApplication: emptyBuildingApplication()
  });
  submitting = signal(false);
  requests = signal<PermitRequest[]>([]);

  canSubmit = computed(() => {
    const f = this.form();
    switch (f.type) {
      case 'business-application': {
        const b = f.businessApplication; return b.businessName.trim() && b.ownerName.trim() && b.address.trim() && b.nature.trim() && b.capital.trim(); }
      case 'business-renewal': {
        const r = f.businessRenewal; return r.businessName.trim() && r.previousPermitNo.trim() && r.grossSales.trim() && r.ownerContact.trim(); }
      case 'building-application': {
        const bld = f.buildingApplication; return bld.projectTitle.trim() && bld.location.trim() && bld.estimatedCost.trim() && bld.contractor.trim() && bld.ownerName.trim(); }
      default: return false;
    }
  });

  constructor(private confirm: ConfirmService) {}

  async submit(formRef: NgForm) {
    if (!this.canSubmit()) return;
    const ok = await this.confirm.open({
      title: 'Submit Permit Request',
      message: 'Verify applicant information and purpose (if any). Continue submitting?',
      confirmText: 'Submit',
      cancelText: 'Review'
    });
    if (!ok) return;
    this.submitting.set(true);
    const f = this.form();
    const id = this.generateRef(f.type.startsWith('business') ? (f.type === 'business-renewal' ? 'BIZR' : 'BIZA') : 'BLDG');
    const payload = this.selectPayload(f);
    const entry: PermitRequest = { id, type: f.type as PermitRequest['type'], payload, createdAt: new Date() };
    this.requests.update(list => [entry, ...list]);
    this.form.set({
      type: '',
      businessApplication: emptyBusinessApplication(),
      businessRenewal: emptyBusinessRenewal(),
      buildingApplication: emptyBuildingApplication()
    });
    // Reset template-driven form state (pristine/untouched) to remove any red invalid borders
    setTimeout(() => formRef.resetForm({ type: '' }), 0);
    setTimeout(() => this.submitting.set(false), 300);
  }

  private generateRef(prefix: string) {
    const now = new Date();
    return `${prefix}-${now.getFullYear().toString().slice(-2)}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  }

  trackByReq = (_: number, r: PermitRequest) => r.id;

  labelFor(type: PermitRequest['type']): string {
    return {
      'business-application': 'Business Permit (Application)',
      'business-renewal': 'Business Permit (Renewal)',
      'building-application': 'Building Permit (Application)'
    }[type] || 'Permit';
  }

  primaryName(r: PermitRequest): string | undefined {
    switch (r.type) {
      case 'business-application': return (r.payload as BusinessApplicationDetails).businessName || undefined;
      case 'business-renewal': return (r.payload as BusinessRenewalDetails).businessName || undefined;
      case 'building-application': return (r.payload as BuildingApplicationDetails).projectTitle || undefined;
      default: return undefined;
    }
  }

  updateField(field: 'type', value: PermitType) { this.form.update(f => ({ ...f, [field]: value })); }
  updateNested<T extends 'businessApplication' | 'businessRenewal' | 'buildingApplication', K extends keyof PermitFormState[T]>(section: T, key: K, value: PermitFormState[T][K]) {
    this.form.update(f => ({ ...f, [section]: { ...f[section], [key]: value } }));
  }

  private selectPayload(f: PermitFormState): BusinessApplicationDetails | BusinessRenewalDetails | BuildingApplicationDetails {
    switch (f.type) {
      case 'business-application': return f.businessApplication;
      case 'business-renewal': return f.businessRenewal;
      case 'building-application': return f.buildingApplication;
      default: return f.businessApplication;
    }
  }
}
interface PermitRequest { id: string; type: 'business-application' | 'business-renewal' | 'building-application'; payload: BusinessApplicationDetails | BusinessRenewalDetails | BuildingApplicationDetails; createdAt: Date; }
