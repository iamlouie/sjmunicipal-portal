import { Component, signal, computed, ViewChild } from '@angular/core';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../toast.service';
import { ConfirmService } from '../../confirm.service';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, DatePipe],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent {
  @ViewChild('certForm') certForm?: NgForm;
  form = signal<CertificateFormState>({
    type: '',
    birth: emptyBirth(),
    marriage: emptyMarriage(),
    death: emptyDeath(),
    residency: emptyResidency(),
    requestor: emptyRequestor(),
    purpose: ''
  });
  submitting = signal(false);
  requests = signal<CertificateRequestRecord[]>([]);

  canSubmit = computed(() => {
    const f = this.form();
    if (!f.type) return false;
    const rq = f.requestor;
  // Removed strict contact regex to avoid character length/pattern limitations
  if (!rq.name.trim() || !rq.contact.trim()) return false;
    switch (f.type) {
      case 'birth': {
        const b = f.birth; return b.firstName.trim() && b.lastName.trim() && !!b.dateOfBirth && b.sex !== '' && b.placeOfBirth.trim(); }
      case 'marriage': {
        const m = f.marriage; return m.husbandName.trim() && m.wifeMaidenName.trim() && !!m.dateOfMarriage && m.placeOfMarriage.trim(); }
      case 'death': {
        const d = f.death; return d.fullName.trim() && !!d.dateOfDeath && d.placeOfDeath.trim(); }
      case 'residency': {
        const r = f.residency; return r.fullName.trim() && r.address.trim() && r.lengthOfResidency.trim() && !!r.dateOfBirth && r.civilStatus.trim() && r.citizenship.trim(); }
      default: return false;
    }
  });

  constructor(private toast: ToastService, private confirm: ConfirmService) {}

  async submit() {
    if (!this.canSubmit()) return;
    const ok = await this.confirm.open({
      title: 'Submit Certificate Request',
      message: 'Please review all entered certificate details. Submit this request now?',
      confirmText: 'Submit',
      cancelText: 'Review'
    });
    if (!ok) return;
    this.submitting.set(true);
    const f = this.form();
    const id = this.generateRef(this.prefixFor(f.type));
    const record: CertificateRequestRecord = {
      id,
      type: f.type as CertificateType,
      payload: structuredClone(this.selectPayload(f)),
      requestor: { ...f.requestor },
      purpose: f.purpose.trim(),
      createdAt: new Date()
    };
    this.requests.update(list => [record, ...list]);
    this.toast.success(`${this.labelFor(record.type)} submitted (Ref: ${record.id})`);
    // Reset form state and pristine status so required Request Type does not show red validation immediately
    const resetState: CertificateFormState = { type: '', birth: emptyBirth(), marriage: emptyMarriage(), death: emptyDeath(), residency: emptyResidency(), requestor: emptyRequestor(), purpose: '' };
    this.form.set(resetState);
    this.certForm?.resetForm(resetState);
    setTimeout(() => this.submitting.set(false), 350);
  }

  private selectPayload(f: CertificateFormState): BirthDetails | MarriageDetails | DeathDetails | ResidencyDetails {
    switch (f.type) {
      case 'birth': return f.birth;
      case 'marriage': return f.marriage;
      case 'death': return f.death;
      case 'residency': return f.residency;
      default: return f.birth; // fallback (should not happen because canSubmit guards)
    }
  }

  private generateRef(prefix: string) {
    const now = new Date();
    return `${prefix}-${now.getFullYear().toString().slice(-2)}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  }

  trackByReq = (_: number, r: CertificateRequestRecord) => r.id;

  displaySubject(r: CertificateRequestRecord): string {
    switch (r.type) {
      case 'birth': {
        const b = r.payload as BirthDetails; return `${b.firstName} ${b.lastName}`.trim();
      }
      case 'marriage': {
        const m = r.payload as MarriageDetails; return `${m.husbandName} & ${m.wifeMaidenName}`.trim();
      }
      case 'death': return (r.payload as DeathDetails).fullName;
      case 'residency': return (r.payload as ResidencyDetails).fullName;
      default: return '';
    }
  }

  updateField<K extends keyof CertificateFormState>(field: K, value: CertificateFormState[K]) {
    this.form.update(f => ({ ...f, [field]: value }));
  }
  updateNested<T extends CertificateType, K extends keyof CertificateFormState[T]>(type: T, key: K, value: CertificateFormState[T][K]) {
    this.form.update(f => ({ ...f, [type]: { ...f[type], [key]: value } }));
  }
  updateRequestor<K extends keyof RequestorInfo>(key: K, value: RequestorInfo[K]) {
    this.form.update(f => ({ ...f, requestor: { ...f.requestor, [key]: value } }));
  }

  labelFor(t: CertificateType) {
    return {
      birth: 'Live Birth Certificate',
      marriage: 'Marriage Certificate',
      death: 'Death Certificate',
      residency: 'Residency Certificate'
    }[t];
  }

  private prefixFor(t: string) {
    return ({
      birth: 'CRV',
      marriage: 'CRV',
      death: 'CRV',
      residency: 'RES'
    } as Record<string,string>)[t] || 'GEN';
  }
}
type CertificateType = 'birth' | 'marriage' | 'death' | 'residency';

interface BirthDetails { firstName: string; middleName: string; lastName: string; dateOfBirth: string; placeOfBirth: string; sex: '' | 'M' | 'F'; fatherFull: string; motherMaiden: string; }
interface MarriageDetails { husbandName: string; wifeMaidenName: string; dateOfMarriage: string; placeOfMarriage: string; }
interface DeathDetails { fullName: string; dateOfDeath: string; placeOfDeath: string; dateOfBirth?: string; parents?: string; }
interface ResidencyDetails { fullName: string; address: string; lengthOfResidency: string; dateOfBirth: string; civilStatus: string; citizenship: string; }
interface RequestorInfo { name: string; contact: string; relationship?: string; validId?: string; }

interface CertificateFormState {
  type: '' | CertificateType;
  birth: BirthDetails;
  marriage: MarriageDetails;
  death: DeathDetails;
  residency: ResidencyDetails;
  requestor: RequestorInfo;
  purpose: string;
}

interface CertificateRequestRecord {
  id: string;
  type: CertificateType;
  payload: BirthDetails | MarriageDetails | DeathDetails | ResidencyDetails;
  requestor: RequestorInfo;
  purpose: string;
  createdAt: Date;
}

function emptyBirth(): BirthDetails { return { firstName: '', middleName: '', lastName: '', dateOfBirth: '', placeOfBirth: '', sex: '', fatherFull: '', motherMaiden: '' }; }
function emptyMarriage(): MarriageDetails { return { husbandName: '', wifeMaidenName: '', dateOfMarriage: '', placeOfMarriage: '' }; }
function emptyDeath(): DeathDetails { return { fullName: '', dateOfDeath: '', placeOfDeath: '', dateOfBirth: '', parents: '' }; }
function emptyResidency(): ResidencyDetails { return { fullName: '', address: '', lengthOfResidency: '', dateOfBirth: '', civilStatus: '', citizenship: '' }; }
function emptyRequestor(): RequestorInfo { return { name: '', contact: '', relationship: '', validId: '' }; }
