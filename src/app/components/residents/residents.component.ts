import { Component, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HistoryService } from '../header/history.service';
import { ToastService } from '../../toast.service';
import { AuthService } from '../../auth.service';

interface Resident {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  age: number;
  gender: string;
  occupation: string;
  barangay: string;
  civilStatus: string;
  status: 'Active' | 'Deceased';
  street?: string;
  birthday?: string; // ISO date (YYYY-MM-DD)
  contactNumber?: string;
  // (removed voter and 4Ps membership flags)
}

// Explicit changed fields interface (avoids index signature property access warning in templates)
interface ResidentChangedFields {
  firstName?: boolean;
  middleName?: boolean;
  lastName?: boolean;
  age?: boolean;
  gender?: boolean;
  occupation?: boolean;
  barangay?: boolean;
  civilStatus?: boolean;
  status?: boolean;
}

// Static list of barangays for dropdown selection in create modal
const BARANGAY_OPTIONS: string[] = [
  'Agay-ay','Basak','Bobon A','Bobon B','Dayanog','Garrido','Minoyho','Osao','Pong-oy',
  'San Jose (Poblacion)','San Roque','San Vicente','Santa Cruz (Poblacion)','Santa Filomena',
  'Santo Niño (Poblacion)','Somoje','Sua','Timba'
];

@Component({
  selector: 'app-residents',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './residents.component.html',
  styleUrls: ['./residents.component.css']
})
export class ResidentsComponent {
  private http = inject(HttpClient);
  loading = true;
  error: string | null = null;
  residents: Resident[] = [];
  filtered: Resident[] = [];
  showFilters = false;
  // filter fields
  filterName = '';
  filterBarangay = '';
  filterOccupation = '';
  filterCivilStatus = '';
  filterStatus = '';
  filterGender = '';
  uniqueBarangays: string[] = [];
  uniqueCivilStatuses: string[] = [];
  filterAgeMin: number | null = null;
  filterAgeMax: number | null = null;
  private nameDebounce: any = null;
  pageSize = 15;
  currentPage = 1;
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get residentsLimited(): Resident[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }
  // Active filters helpers
  get hasActiveFilters(): boolean {
    return !!(
      this.filterName ||
      this.filterBarangay ||
      this.filterOccupation ||
      this.filterCivilStatus ||
      this.filterStatus ||
      this.filterGender ||
      this.filterAgeMin != null ||
      this.filterAgeMax != null
    );
  }
  get activeFilterCount(): number {
    let c = 0;
    if (this.filterName) c++;
    if (this.filterBarangay) c++;
    if (this.filterOccupation) c++;
    if (this.filterCivilStatus) c++;
    if (this.filterStatus) c++;
    if (this.filterGender) c++;
    if (this.filterAgeMin != null) c++;
    if (this.filterAgeMax != null) c++;
    return c;
  }
  selected: Resident | null = null;
  showModal = false;
  editing = false; // profile edit mode
  editModel: Partial<Resident> = {};
  editSubmitted = false;
  updating = false;
  // Tracks which individual fields have changed during edit session
  editChanged: Record<string, boolean> = {};
  // Important notice modal
  showNotice = false;
  noticeDontShow = false; // default unchecked; user must opt-in to hide in future
  // When user clicks Add Resident we now force showing the notice first, then open create.
  pendingCreate = false; // tracks intent to open create modal after notice dismissal
  // Create resident modal state
  showCreate = false;
  saving = false;
  createModel: Partial<Resident> = {
    firstName: '',
    middleName: '',
    lastName: '',
    age: undefined as any,
    gender: '',
    occupation: '',
    barangay: '',
    civilStatus: '',
    status: 'Active',
    street: '',
    birthday: '',
    contactNumber: ''
  };
  // Snapshot of pristine create state to compare for dirtiness
  private createPristine: Partial<Resident> | null = null;
  changedFields: ResidentChangedFields = {};
  barangayOptions = BARANGAY_OPTIONS.slice();

  constructor(private history: HistoryService, private auth: AuthService, private toast: ToastService) {
    // restore filters from storage
    const saved = localStorage.getItem('residentFilters');
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        this.filterName = obj.filterName ?? this.filterName;
        this.filterBarangay = obj.filterBarangay ?? this.filterBarangay;
        this.filterOccupation = obj.filterOccupation ?? this.filterOccupation;
  this.filterCivilStatus = obj.filterCivilStatus ?? this.filterCivilStatus;
  this.filterStatus = obj.filterStatus ?? this.filterStatus;
  this.filterGender = obj.filterGender ?? this.filterGender;
        this.filterAgeMin = obj.filterAgeMin ?? this.filterAgeMin;
        this.filterAgeMax = obj.filterAgeMax ?? this.filterAgeMax;
      } catch {}
    }
    this.http.get<Resident[]>('https://my-json-db-3.onrender.com/residents')
      .subscribe({
        next: data => { 
          this.residents = data; 
          this.uniqueBarangays = [...new Set(data.map(r => r.barangay))].sort((a,b)=> a.localeCompare(b));
          this.uniqueCivilStatuses = [...new Set(data.map(r => r.civilStatus))].sort((a,b)=> a.localeCompare(b));
          this.applyFilters(); this.loading = false; },
        error: err => { console.error('Failed to load residents', err); this.error = 'Failed to load residents'; this.loading = false; }
      });

    // Show important notice if not dismissed
    const dismissed = localStorage.getItem('residentsNoticeDismissed');
    if (!dismissed) {
      // delay a tick so main content renders first
      setTimeout(()=> { this.showNotice = true; document.body.style.overflow = 'hidden'; }, 50);
    }
  }


  trackByResident = (_: number, r: Resident) => r.id;
  trackByPage = (_: number, p: number) => p;

  open(res: Resident) {
    this.selected = res;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
    this.editing = false;
    this.editSubmitted = false;
    this.updating = false;
  }

  close() {
    this.showModal = false;
    setTimeout(()=>{ this.selected = null; },200);
    document.body.style.overflow = '';
    this.editing = false;
    this.editModel = {};
    this.editSubmitted = false;
  }
  goTo(page: number) { if (page >=1 && page <= this.totalPages) { this.currentPage = page; } }
  next() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prev() { if (this.currentPage > 1) this.currentPage--; }
  toggleFilters() { this.showFilters = !this.showFilters; }
  dismissNotice(permanent = true) {
    this.showNotice = false;
    if (permanent && this.noticeDontShow) {
      localStorage.setItem('residentsNoticeDismissed', 'true');
    } else if (!this.noticeDontShow) {
      // ensure not stored if user unchecked
      localStorage.removeItem('residentsNoticeDismissed');
    }
    // If we have a pending create action from the Add button, open create modal now
    if (this.pendingCreate) {
      this.pendingCreate = false;
      // open the create modal (was previously handled directly in openCreate)
      this.openCreateActual();
      return; // body scroll remains locked because create modal opens
    }
    // restore scroll only if no other modal is open or pending
    if (!this.showModal && !this.showCreate) {
      document.body.style.overflow = '';
    }
  }
  cancelPendingCreate() {
    // User chose to abort Add Resident after seeing notice.
    this.pendingCreate = false;
    this.dismissNotice(false); // treat as non-permanent dismissal of the notice
  }
  reopenNotice() {
    this.showNotice = true;
    document.body.style.overflow = 'hidden';
  }
  openCreate() {
    // Prevent non-admin users from opening create modal.
    if (!this.auth.isAdmin()) {
      return;
    }
    // Always show the Important Notice first when Add Resident is triggered.
    // If notice already visible just mark intent.
    this.pendingCreate = true;
    if (!this.showNotice) {
      this.showNotice = true;
      document.body.style.overflow = 'hidden';
    }
  }
  private openCreateActual() {
    this.resetCreateModel();
    this.showCreate = true;
    document.body.style.overflow = 'hidden';
  }
  cancelCreate() {
    this.showCreate = false;
    // restore scroll only if no other modal open
    if (!this.showModal && !this.showNotice) document.body.style.overflow = '';
  }
  markChanged(field: keyof ResidentChangedFields) {
    this.changedFields[field] = true;
  }
  private resetCreateModel() {
  this.createModel = { firstName: '', middleName: '', lastName: '', age: undefined as any, gender: '', occupation: '', barangay: '', civilStatus: '', status: 'Active', street: '', birthday: '', contactNumber: '' };
    this.changedFields = {};
    this.saving = false;
    // Store pristine snapshot
    this.createPristine = { ...this.createModel };
  }
  saveResident() {
    if (this.saving) return;
    // basic validation
    if (!this.createModel.firstName || !this.createModel.lastName || !this.createModel.birthday || this.createModel.age == null || !this.createModel.gender || this.createModel.barangay === '' || !this.createModel.civilStatus || !this.createModel.status) {
      return;
    }
    const newResident: Resident = {
      id: this.nextId(),
      firstName: this.createModel.firstName!.trim(),
      middleName: (this.createModel.middleName||'').trim(),
      lastName: this.createModel.lastName!.trim(),
      age: Number(this.createModel.age),
      gender: this.createModel.gender!,
      occupation: (this.createModel.occupation||'').trim(),
      barangay: this.createModel.barangay!.trim(),
      civilStatus: this.createModel.civilStatus!,
      status: this.createModel.status as 'Active' | 'Deceased',
      street: (this.createModel.street||'').trim() || undefined,
      birthday: this.createModel.birthday || undefined,
      contactNumber: (this.createModel.contactNumber ? this.createModel.contactNumber : undefined)
    };
    this.saving = true;
    // POST to backend (optimistic update)
    this.http.post<Resident>('https://my-json-db-3.onrender.com/residents', newResident)
      .subscribe({
        next: res => {
          this.residents.push(res);
          this.history.logChange({ entity: 'Resident', action: 'add', summary: `Created resident #${res.id}`, extra: { name: res.firstName + ' ' + res.lastName } });
          this.toast.success(`Resident ${res.firstName} ${res.lastName} added successfully.`);
          // refresh unique lists
          this.uniqueBarangays = [...new Set(this.residents.map(r => r.barangay))].sort((a,b)=> a.localeCompare(b));
          this.uniqueCivilStatuses = [...new Set(this.residents.map(r => r.civilStatus))].sort((a,b)=> a.localeCompare(b));
          this.applyFilters();
          this.showCreate = false;
          this.saving = false;
          if (!this.showModal && !this.showNotice) document.body.style.overflow = '';
        },
        error: err => {
          console.error('Failed to save resident', err);
          this.saving = false;
        }
      });
  }
  // --- Editing existing resident profile ---
  startEdit() {
    if (!this.isAdmin || !this.selected) return;
    this.editing = true;
    // clone selected fields
    this.editModel = { ...this.selected };
    this.editSubmitted = false;
    this.editChanged = {};
  }
  cancelEditProfile() {
    this.editing = false;
    this.editModel = {};
    this.editSubmitted = false;
    this.editChanged = {};
  }
  submitEditProfile() {
    if (!this.selected || !this.isAdmin) return;
    this.editSubmitted = true;
    // basic required fields to allow saving (reuse existing rules)
    if (!this.editModel.firstName || !this.editModel.lastName || !this.editModel.gender || !this.editModel.barangay || !this.editModel.civilStatus || !this.editModel.status) return;
    // If birthday changed, recompute age
    if (this.editModel.birthday) {
      const newAge = this.calculateAge(this.editModel.birthday);
      if (!isNaN(newAge) && newAge >= 0) {
        this.editModel.age = newAge as any;
      }
    }
    // Sanitize contact number if present
    if (this.editModel.contactNumber) {
      this.editModel.contactNumber = this.editModel.contactNumber.replace(/[^0-9]/g,'').slice(0,11);
    }
    const id = this.selected.id;
    const updated: Resident = {
      ...this.selected,
      ...this.editModel as Resident,
      id,
      age: this.editModel.age ?? this.selected.age
    };
    this.updating = true;
    this.http.put<Resident>(`https://my-json-db-3.onrender.com/residents/${id}`, updated)
      .subscribe({
        next: res => {
          // replace in list
          this.residents = this.residents.map(r => r.id === id ? res : r);
          this.selected = res;
          this.applyFilters();
          this.toast.success(`Resident ${res.firstName} ${res.lastName} updated successfully.`);
          this.editing = false;
          this.updating = false;
          this.editModel = {};
          this.editSubmitted = false;
          this.editChanged = {};
        },
        error: err => {
          console.error('Failed to update resident', err);
          this.updating = false;
        }
      });
  }
  sanitizeEditContact() {
    if (this.editModel.contactNumber != null) {
      this.editModel.contactNumber = this.editModel.contactNumber.replace(/[^0-9]/g,'').slice(0,11);
    }
  }
  sanitizeContact() {
    if (this.createModel.contactNumber != null) {
      const cleaned = this.createModel.contactNumber.replace(/[^0-9]/g, '');
      // Optional: enforce starting with '09' pattern (Philippines mobile style) - leave as is if not needed.
      this.createModel.contactNumber = cleaned.slice(0, 11);
    }
  }
  // Generic digit-only enforcement for key presses in contact input
  onContactKeyDown(e: KeyboardEvent) {
    const allowedControl = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
    if (allowedControl.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }
  // Prevent non-digit paste
  onContactPaste(e: ClipboardEvent, isEdit = false) {
    const data = e.clipboardData?.getData('text') || '';
    if (/[^0-9]/.test(data)) {
      e.preventDefault();
      const digits = data.replace(/[^0-9]/g,'').slice(0,11);
      if (isEdit) {
        this.editModel.contactNumber = (this.editModel.contactNumber||'') + digits;
        this.sanitizeEditContact();
      } else {
        this.createModel.contactNumber = (this.createModel.contactNumber||'') + digits;
        this.sanitizeContact();
      }
    }
  }
  onBirthdayChange(val: string) {
    this.createModel.birthday = val;
    if (val) {
      const age = this.calculateAge(val);
      if (!isNaN(age) && age >= 0) {
        this.createModel.age = age as any;
      }
    }
  }
  private calculateAge(birthday: string): number {
    // Expect YYYY-MM-DD
    const parts = birthday.split('-');
    if (parts.length !== 3) return NaN;
    const [y, m, d] = parts.map(p => parseInt(p, 10));
    if (!y || !m || !d) return NaN;
    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = today.getMonth() + 1 - m;
    const dayDiff = today.getDate() - d;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  }
  private nextId(): number {
    return this.residents.length ? Math.max(...this.residents.map(r => r.id)) + 1 : 1;
  }
  resetFilters() {
    this.filterName = '';
    this.filterBarangay = '';
    this.filterOccupation = '';
  this.filterCivilStatus = '';
  this.filterStatus = '';
  this.filterGender = '';
    this.filterAgeMin = null;
    this.filterAgeMax = null;
    this.applyFilters();
  }
  onNameInput(val: string) {
    this.filterName = val;
    if (this.nameDebounce) clearTimeout(this.nameDebounce);
    this.nameDebounce = setTimeout(()=>{ this.applyFilters(); }, 300);
  }
  applyFilters() {
    const nameTerm = this.filterName.trim().toLowerCase();
    const brgy = this.filterBarangay.trim().toLowerCase();
    const occupationTerm = this.filterOccupation.trim().toLowerCase();
  const civilStatusTerm = this.filterCivilStatus.trim().toLowerCase();
  const statusTerm = this.filterStatus.trim().toLowerCase();
    const genderTerm = this.filterGender.trim().toLowerCase();
    this.filtered = this.residents.filter(r => {
      const matchesName = !nameTerm || (r.firstName + ' ' + r.middleName + ' ' + r.lastName).toLowerCase().includes(nameTerm)
        || r.firstName.toLowerCase().includes(nameTerm) || r.lastName.toLowerCase().includes(nameTerm);
      const matchesBarangay = !brgy || r.barangay.toLowerCase().includes(brgy);
      const matchesOccupation = !occupationTerm || r.occupation.toLowerCase().includes(occupationTerm);
      const matchesCivilStatus = !civilStatusTerm || r.civilStatus.toLowerCase() === civilStatusTerm;
  const matchesStatus = !statusTerm || r.status.toLowerCase() === statusTerm;
	  const matchesGender = !genderTerm || (r.gender && r.gender.toLowerCase() === genderTerm);
  const matchesAgeMin = this.filterAgeMin == null || r.age >= this.filterAgeMin;
      const matchesAgeMax = this.filterAgeMax == null || r.age <= this.filterAgeMax;
	return matchesName && matchesBarangay && matchesOccupation && matchesCivilStatus && matchesStatus && matchesGender && matchesAgeMin && matchesAgeMax;
    });
    this.currentPage = 1;
    // persist
    localStorage.setItem('residentFilters', JSON.stringify({
      filterName: this.filterName,
      filterBarangay: this.filterBarangay,
      filterOccupation: this.filterOccupation,
  filterCivilStatus: this.filterCivilStatus,
  filterStatus: this.filterStatus,
      filterGender: this.filterGender,
      filterAgeMin: this.filterAgeMin,
      filterAgeMax: this.filterAgeMax
    }));
  }
  // Helper used by template to decide if Save button should be enabled.
  isCreateValid(): boolean {
    const m = this.createModel;
    const first = (m.firstName||'').trim();
    const last = (m.lastName||'').trim();
    const bday = (m.birthday||'').trim();
    const gender = (m.gender||'').trim();
    const brgy = (m.barangay||'').trim();
    const civ = (m.civilStatus||'').trim();
    const status = (m.status||'').toString().trim();
    // Age should be computed from birthday; ensure birthday format looks like YYYY-MM-DD
    const birthdayValid = /^\d{4}-\d{2}-\d{2}$/.test(bday);
    return !!(first && last && birthdayValid && m.age != null && gender && brgy && civ && status);
  }
  // Determine if create form has any changes from its pristine snapshot
  get isCreateDirty(): boolean {
    if (!this.createPristine) return false;
    const keys: (keyof Resident)[] = ['firstName','middleName','lastName','birthday','gender','occupation','street','civilStatus','status','barangay','contactNumber'];
    return keys.some(k => (this.createModel as any)[k] !== (this.createPristine as any)[k]);
  }
  // Unified disable flag for Create Save button (template binding)
  get disableCreateSave(): boolean {
    return !this.isCreateValid() || !this.isCreateDirty || this.saving;
  }
  // Export residents (current filtered) as JSON file
  exportResidents() {
    if (!this.isAdmin) return;
    const data = JSON.stringify(this.filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'residents-export.json';
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Residents exported');
  }
  // Import residents from JSON file (append; basic validation)
  onImportFile(ev: Event) {
    if (!this.isAdmin) return;
    const input = ev.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) throw new Error('Invalid format');
        const added: Resident[] = [];
        parsed.forEach((r: any) => {
          if (r && r.firstName && r.lastName && r.barangay) {
            const newResident: Resident = {
              id: this.nextId(),
              firstName: String(r.firstName),
              middleName: String(r.middleName||''),
              lastName: String(r.lastName),
              age: Number(r.age) || 0,
              gender: String(r.gender||'') ,
              occupation: String(r.occupation||''),
              barangay: String(r.barangay),
              civilStatus: String(r.civilStatus||'Single'),
              status: (r.status === 'Deceased' ? 'Deceased':'Active'),
              street: r.street ? String(r.street) : undefined,
              birthday: r.birthday ? String(r.birthday) : undefined,
              contactNumber: r.contactNumber ? String(r.contactNumber) : undefined
            };
            this.residents.push(newResident);
            added.push(newResident);
          }
        });
        if (added.length) {
          this.applyFilters();
          this.toast.success(`Imported ${added.length} resident${added.length===1?'':'s'}`);
        } else {
          this.toast.info('No valid residents found in file');
        }
      } catch (e) {
        console.error('Import failed', e);
        this.toast.error('Failed to import residents');
      } finally {
        input.value = '';
      }
    };
    reader.readAsText(file);
  }
  // Exposed for template conditionals
  get isAdmin(): boolean { return this.auth.isAdmin(); }
  // Determine if any edit field changed
  get isEditDirty(): boolean {
    if (!this.selected) return false;
    const keys: (keyof Resident)[] = ['firstName','middleName','lastName','birthday','gender','occupation','street','civilStatus','status','barangay','contactNumber'];
    return keys.some(k => (this.editModel as any)[k] !== (this.selected as any)[k]);
  }
  // Mark a specific field as changed for CSS highlight
  markEditChanged(field: string) {
    if (!this.selected) return;
    if ((this.editModel as any)[field] !== (this.selected as any)[field]) {
      this.editChanged[field] = true;
    } else {
      delete this.editChanged[field];
    }
  }
}
