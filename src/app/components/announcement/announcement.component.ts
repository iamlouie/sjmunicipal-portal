import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast.service';
import { AuthService } from '../../auth.service';
import { parseIsoDate, isIsoPast, isIsoToday, isIsoWithinNextDays, daysUntilIso, formatIsoDisplay, todayMidnightTs } from '../../date-utils';

interface MunicipalAnnouncement {
  id: number;
  title: string;
  date: string; // ISO date
  dateDisplay: string;
  excerpt: string;
  type?: string;
  author?: string;
}

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  announcements: MunicipalAnnouncement[] = [];
  loading = true;
  error: string | null = null;
  selected: MunicipalAnnouncement | null = null;
  showModal = false;
  showCreate = false;
  creating = false;
  editing = false;
  updateSaving = false;
  editModel: Partial<MunicipalAnnouncement> = {};
  createModel: Partial<MunicipalAnnouncement> = { title: '', date: '', excerpt: '' };
  createSubmitted = false;
  editSubmitted = false;

  constructor(private auth: AuthService) {
    this.http.get<MunicipalAnnouncement[]>('https://my-json-db-3.onrender.com/announcements')
      .subscribe({
        next: data => { this.announcements = data; this.loading = false; },
        error: err => { this.error = 'Failed to load announcements'; console.error(err); this.loading = false; }
      });
  }

  get sortedAnnouncements() {
    const todayTs = todayMidnightTs();
    const upcoming: MunicipalAnnouncement[] = [];
    const past: MunicipalAnnouncement[] = [];
    for (const a of this.announcements) {
      const t = parseIsoDate(a.date).getTime();
      if (!isNaN(t) && t >= todayTs) upcoming.push(a); else past.push(a);
    }
    upcoming.sort((a,b) => parseIsoDate(a.date).getTime() - parseIsoDate(b.date).getTime());
    past.sort((a,b) => parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime());
    return [...upcoming, ...past];
  }

  openModal(a: MunicipalAnnouncement) {
    this.selected = a;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    setTimeout(() => { this.selected = null; }, 200);
    document.body.style.overflow = '';
    this.cancelEdit();
  }

  trackByAnnouncement = (_: number, item: MunicipalAnnouncement) => item.id;

  openCreateModal() {
    if (!this.auth.isAdmin()) return;
    this.showCreate = true;
    document.body.style.overflow = 'hidden';
  }

  cancelCreate() {
    this.showCreate = false;
    document.body.style.overflow = '';
    this.createModel = { title: '', date: '', excerpt: '' };
    this.createSubmitted = false;
  }

  submitCreateForm() {
    this.createSubmitted = true;
    if (!this.createModel.title || !this.createModel.date || !this.createModel.excerpt) return;
    const payload: Omit<MunicipalAnnouncement, 'id'> = {
      title: this.createModel.title!,
      date: this.createModel.date!,
      dateDisplay: formatIsoDisplay(this.createModel.date),
      excerpt: this.createModel.excerpt!,
      type: this.createModel.type,
      author: this.createModel.author
    };
    this.creating = true;
    this.http.post<MunicipalAnnouncement>('https://my-json-db-3.onrender.com/announcements', payload)
      .subscribe({
        next: saved => {
          this.announcements = [saved, ...this.announcements];
          this.creating = false;
          this.showCreate = false;
          document.body.style.overflow = '';
          this.toast.success('Announcement created successfully');
          this.createModel = { title: '', date: '', excerpt: '' };
          this.createSubmitted = false;
        },
        error: err => {
          console.error('Failed to create announcement', err);
          this.error = 'Failed to create announcement';
          this.creating = false;
        }
      });
  }

  startEdit() {
    if (!this.selected || !this.auth.isAdmin()) return;
    this.editing = true;
    this.editModel = { ...this.selected };
  }

  cancelEdit() {
    this.editing = false;
    this.updateSaving = false;
    this.editModel = {};
    this.editSubmitted = false;
  }

  get isEditDirty(): boolean {
    if (!this.selected || !this.editing) return false;
    const fields: (keyof MunicipalAnnouncement)[] = ['title','date','excerpt','type','author'];
    return fields.some(k => (this.editModel as any)[k] !== (this.selected as any)[k]);
  }

  submitEditForm() {
    if (!this.selected) return;
    this.editSubmitted = true;
    if (!this.editModel.title || !this.editModel.date || !this.editModel.excerpt) return;
    if (!this.isEditDirty) { this.cancelEdit(); return; }
    const id = this.selected.id;
    this.updateSaving = true;
    const payload: MunicipalAnnouncement = {
      ...(this.selected as MunicipalAnnouncement),
      ...this.editModel as MunicipalAnnouncement,
      id,
      dateDisplay: formatIsoDisplay(this.editModel.date)
    };
    this.http.put<MunicipalAnnouncement>(`https://my-json-db-3.onrender.com/announcements/${id}`, payload)
      .subscribe({
        next: updated => {
          this.announcements = this.announcements.map(a => a.id === id ? updated : a);
          this.selected = updated;
          this.updateSaving = false;
          this.editing = false;
          this.editSubmitted = false;
          this.toast.success('Announcement updated successfully');
        },
        error: err => {
          console.error('Failed to update announcement', err);
          this.error = 'Failed to update announcement';
          this.updateSaving = false;
        }
      });
  }

  isPast(a: MunicipalAnnouncement): boolean { return isIsoPast(a.date); }
  isToday(a: MunicipalAnnouncement): boolean { return isIsoToday(a.date); }
  isNearUpcoming(a: MunicipalAnnouncement): boolean { return isIsoWithinNextDays(a.date, 7); }
  daysUntil(a: MunicipalAnnouncement): number { return daysUntilIso(a.date); }
  get isAdmin(): boolean { return this.auth.isAdmin(); }
}
