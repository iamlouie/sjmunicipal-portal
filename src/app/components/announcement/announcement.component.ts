import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast.service';
import { AuthService } from '../../auth.service';

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
    this.http.get<MunicipalAnnouncement[]>('http://localhost:4300/announcements')
      .subscribe({
        next: data => { this.announcements = data; this.loading = false; },
        error: err => { this.error = 'Failed to load announcements'; console.error(err); this.loading = false; }
      });
  }

  private parseDate(d: string) {
    return new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
  }

  get sortedAnnouncements() {
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const upcoming: MunicipalAnnouncement[] = [];
    const past: MunicipalAnnouncement[] = [];
    for (const a of this.announcements) {
      const t = this.parseDate(a.date).getTime();
      if (!isNaN(t) && t >= todayMidnight) upcoming.push(a); else past.push(a);
    }
    upcoming.sort((a,b) => this.parseDate(a.date).getTime() - this.parseDate(b.date).getTime());
    past.sort((a,b) => this.parseDate(b.date).getTime() - this.parseDate(a.date).getTime());
    return [...upcoming, ...past];
  }

  private formatDate(dateStr: string | undefined) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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
      dateDisplay: this.formatDate(this.createModel.date),
      excerpt: this.createModel.excerpt!,
      type: this.createModel.type,
      author: this.createModel.author
    };
    this.creating = true;
    this.http.post<MunicipalAnnouncement>('http://localhost:4300/announcements', payload)
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
      dateDisplay: this.formatDate(this.editModel.date)
    };
    this.http.put<MunicipalAnnouncement>(`http://localhost:4300/announcements/${id}`, payload)
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

  isPast(a: MunicipalAnnouncement): boolean {
    const d = new Date(a.date + (a.date.length === 10 ? 'T00:00:00' : ''));
    if (isNaN(d.getTime())) return false;
    const todayMidnight = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
    return d.getTime() < todayMidnight;
  }

  isToday(a: MunicipalAnnouncement): boolean {
    const d = this.parseDate(a.date);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  isNearUpcoming(a: MunicipalAnnouncement): boolean {
    const d = this.parseDate(a.date);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMid = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (targetMid <= todayMid) return false; // not today or past
    const diffDays = (targetMid - todayMid) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  // Days until announcement date (if future). Used for upcoming badge countdown.
  daysUntil(a: MunicipalAnnouncement): number {
    const d = this.parseDate(a.date);
    if (isNaN(d.getTime())) return NaN;
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMid = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (targetMid < todayMid) return 0;
    return Math.round((targetMid - todayMid) / (1000 * 60 * 60 * 24));
  }
  get isAdmin(): boolean { return this.auth.isAdmin(); }
}
