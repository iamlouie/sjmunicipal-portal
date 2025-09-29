import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast.service';
import { AuthService } from '../../auth.service';

interface Facility {
  id: number;
  name: string;
  type: string;
  location: string;
  status: 'Operational' | 'Under Maintenance' | 'Planned';
  capacity?: number; // optional capacity value
  hours?: string; // operating hours e.g., "Mon-Fri 8:00 AM – 5:00 PM"
  notes?: string;
}

@Component({
  selector: 'app-facilities',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './facilities.component.html',
  styleUrls: ['./facilities.component.css']
})
export class FacilitiesComponent {
  private toast = inject(ToastService);
  private http = inject(HttpClient);
  facilities: Facility[] = [];
  loading = true;
  error: string | null = null;

  trackByFacility = (_: number, f: Facility) => f.id;

  // Create modal state
  showCreate = false;
  creating = false;
  createSubmitted = false;
  createModel: Partial<Facility> = { name:'', type:'', location:'', status:'Operational', capacity: undefined, hours:'', notes:'' };

  // View modal state
  showView = false;
  selected: Facility | null = null;
  editing = false; // whether we are editing inside the view modal
  editSubmitted = false;
  editModel: Partial<Facility> = {};
  
  constructor(private auth: AuthService) {
    this.http.get<Facility[]>('http://localhost:4300/facilities')
      .subscribe({
        next: data => { this.facilities = data; this.loading = false; },
        error: err => { console.error('Failed to load facilities', err); this.error = 'Failed to load facilities'; this.loading = false; }
      });
  }

  openViewModal(f: Facility) {
    this.selected = f;
    this.showView = true;
    document.body.style.overflow = 'hidden';
    this.editing = false;
    this.editSubmitted = false;
  }

  closeViewModal() {
    this.showView = false;
    this.selected = null;
    document.body.style.overflow = '';
    this.editing = false;
    this.editSubmitted = false;
    this.editModel = {};
  }

  startEdit() {
    if (!this.selected || !this.auth.isAdmin()) return;
    // clone current selected into editModel
    this.editModel = { ...this.selected };
    this.editing = true;
    this.editSubmitted = false;
  }

  cancelEdit() {
    this.editing = false;
    this.editSubmitted = false;
    this.editModel = {};
  }

  savingEdit = false;
  saveEdit() {
    this.editSubmitted = true;
    if (!this.editModel.name || !this.editModel.type || !this.editModel.location || !this.editModel.status) return;
    if (!this.selected) return;
    const id = this.selected.id;
    const payload: Facility = {
      ...this.selected,
      ...this.editModel as Facility,
      id
    };
    this.savingEdit = true;
    this.http.put<Facility>(`http://localhost:4300/facilities/${id}`, payload)
      .subscribe({
        next: updated => {
          this.facilities = this.facilities.map(f => f.id === id ? updated : f);
          this.selected = updated;
          this.toast.success('Facility updated');
          this.editing = false;
          this.editSubmitted = false;
          this.editModel = {};
          this.savingEdit = false;
        },
        error: err => { console.error('Failed to update facility', err); this.toast.error('Failed to update facility'); this.savingEdit = false; }
      });
  }

  get isEditDirty(): boolean {
    if (!this.selected) return false;
    const fields: (keyof Facility)[] = ['name','type','location','status','capacity','hours','notes'];
    return fields.some(k => (this.editModel as any)[k] !== (this.selected as any)[k]);
  }

  openCreateModal() {
    if (!this.auth.isAdmin()) return;
    this.showCreate = true;
    document.body.style.overflow = 'hidden';
  }

  cancelCreate() {
    this.showCreate = false;
    document.body.style.overflow = '';
    this.createSubmitted = false;
    this.createModel = { name:'', type:'', location:'', status:'Operational', capacity: undefined, hours:'', notes:'' };
  }

  submitCreateForm() {
    this.createSubmitted = true;
    if (!this.createModel.name || !this.createModel.type || !this.createModel.location || !this.createModel.status) return;
    const payload: Omit<Facility,'id'> = {
      name: this.createModel.name!,
      type: this.createModel.type!,
      location: this.createModel.location!,
      status: (this.createModel.status as Facility['status']) || 'Operational',
      capacity: this.createModel.capacity,
      hours: this.createModel.hours,
      notes: this.createModel.notes
    };
    this.creating = true;
    this.http.post<Facility>('http://localhost:4300/facilities', payload)
      .subscribe({
        next: saved => {
          this.facilities = [saved, ...this.facilities];
          this.creating = false;
          this.showCreate = false;
          document.body.style.overflow = '';
          this.toast.success('Facility added');
          this.createSubmitted = false;
          this.createModel = { name:'', type:'', location:'', status:'Operational', capacity: undefined, hours:'', notes:'' };
        },
        error: err => { console.error('Failed to create facility', err); this.toast.error('Failed to create facility'); this.creating = false; }
      });
  }
  get isAdmin(): boolean { return this.auth.isAdmin(); }
}
