import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast.service';
import { AuthService } from '../../auth.service';

interface MunicipalEvent {
  id: number;
  title: string;
  date: string; // ISO date
  time: string; // simple time string
  dateDisplay: string; // human readable
  excerpt: string;
  location?: string;
  category?: string;
}

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  events: MunicipalEvent[] = [];
  loading = true;
  error: string | null = null;
  selected: MunicipalEvent | null = null;
  showModal = false;
  // creation
  showCreate = false;
  creating = false;
  // editing
  editing = false;
  updateSaving = false;
  editModel: Partial<MunicipalEvent> = {};
  editSubmitted = false;
  // inline create form state
  createModel: any = { title:'', date:'', time:'', location:'', excerpt:'' };
  createSubmitted = false;

  constructor(private auth: AuthService) {
    this.http.get<MunicipalEvent[]>('http://localhost:4300/events')
      .subscribe({
        next: data => { this.events = data; this.loading = false; },
        error: err => { this.error = 'Failed to load events'; console.error(err); this.loading = false; }
      });
  }

  private parseDate(d: string) {
    return new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
  }

  private isUpcoming(ev: MunicipalEvent, todayMidnight: number) {
    const t = this.parseDate(ev.date).getTime();
    return !isNaN(t) && t >= todayMidnight;
  }

  get sortedEvents() {
    const today = new Date();
    // normalize to midnight
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const upcoming: MunicipalEvent[] = [];
    const past: MunicipalEvent[] = [];
    for (const ev of this.events) {
      if (this.isUpcoming(ev, todayMidnight)) upcoming.push(ev); else past.push(ev);
    }
    // upcoming ascending (soonest first)
    upcoming.sort((a,b) => {
      const at = this.parseDate(a.date).getTime();
      const bt = this.parseDate(b.date).getTime();
      if (at !== bt) return at - bt;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });
    // past descending (most recent past first)
    past.sort((a,b) => {
      const at = this.parseDate(a.date).getTime();
      const bt = this.parseDate(b.date).getTime();
      if (at !== bt) return bt - at;
      if (a.time && b.time) return b.time.localeCompare(a.time);
      return 0;
    });
    return [...upcoming, ...past];
  }

  trackByEvent = (_: number, item: MunicipalEvent) => item.id;

  openModal(ev: MunicipalEvent) {
    this.selected = ev;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    setTimeout(() => { this.selected = null; }, 200);
    document.body.style.overflow = '';
    this.cancelEdit();
  }

  openCreateModal() {
    if (!this.auth.isAdmin()) return;
    this.showCreate = true;
    document.body.style.overflow = 'hidden';
  }

  cancelCreate() {
    this.showCreate = false;
    document.body.style.overflow = '';
  }

  private postEvent(payload: Omit<MunicipalEvent,'id'>) {
    this.creating = true;
    this.http.post<MunicipalEvent>('http://localhost:4300/events', payload)
      .subscribe({
        next: saved => {
          this.events = [saved, ...this.events];
          this.creating = false;
          this.showCreate = false;
          document.body.style.overflow = '';
          this.toast.success('Event created successfully');
          this.createSubmitted = false;
          this.createModel = { title:'', date:'', time:'', location:'', excerpt:'' };
        },
        error: err => { console.error('Failed to create event', err); this.error='Failed to create event'; this.creating=false; }
      });
  }

  submitCreateForm() {
    this.createSubmitted = true;
    if (!this.createModel.title || !this.createModel.date || !this.createModel.time || !this.createModel.excerpt) return;
    const dateDisplay = new Date(this.createModel.date).toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric'});
    this.postEvent({ ...this.createModel, dateDisplay });
  }

  startEdit() {
    if (!this.selected || !this.auth.isAdmin()) return;
    this.editing = true;
    // clone selected into edit model
    this.editModel = { ...this.selected };
  }

  cancelEdit() {
    this.editing = false;
    this.updateSaving = false;
    this.editModel = {};
  }

  get isEditDirty(): boolean {
    if (!this.selected || !this.editing) return false;
    const fields: (keyof MunicipalEvent)[] = ['title','date','time','location','excerpt'];
    return fields.some(k => (this.editModel as any)[k] !== (this.selected as any)[k]);
  }

  saveUpdate() {
    if (!this.selected || !this.editing) return;
    const id = this.selected.id;
    this.updateSaving = true;
    const payload: MunicipalEvent = {
      ...(this.selected as MunicipalEvent),
      ...this.editModel as MunicipalEvent,
      id
    };
    this.http.put<MunicipalEvent>(`http://localhost:4300/events/${id}`, payload)
      .subscribe({
        next: updated => {
            this.events = this.events.map(e => e.id === id ? updated : e);
            this.selected = updated;
            this.updateSaving = false;
            this.cancelEdit();
            this.toast.success('Event updated successfully');
        },
        error: err => {
          console.error('Failed to update event', err);
          this.error = 'Failed to update event';
          this.updateSaving = false;
        }
      });
  }

  // New handler when using unified form component in edit mode
  submitEditForm() {
    this.editSubmitted = true;
    if (!this.editModel.title || !this.editModel.date || !this.editModel.time || !this.editModel.excerpt) return;
    if (!this.isEditDirty) { this.cancelEdit(); return; }
    // compute dateDisplay if changed
    if (this.selected) {
      const dateDisplay = new Date(this.editModel.date as string).toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric'});
      this.editModel.dateDisplay = dateDisplay;
    }
    this.saveUpdate();
  }

  isPast(ev: MunicipalEvent): boolean {
    const d = new Date(ev.date + (ev.date.length === 10 ? 'T00:00:00' : ''));
    if (isNaN(d.getTime())) return false;
    const todayMidnight = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
    return d.getTime() < todayMidnight;
  }

  isToday(ev: MunicipalEvent): boolean {
    const d = this.parseDate(ev.date);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  isNearUpcoming(ev: MunicipalEvent): boolean {
    // Next 7 days (excluding today). Adjust window as needed.
    const d = this.parseDate(ev.date);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMid = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (targetMid <= todayMid) return false; // not today or past
    const diffDays = (targetMid - todayMid) / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // within next 7 days
  }

  // Days until the event (integer, only valid for future dates)
  daysUntil(ev: MunicipalEvent): number {
    const d = this.parseDate(ev.date);
    if (isNaN(d.getTime())) return NaN;
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetMid = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (targetMid < todayMid) return 0;
    return Math.round((targetMid - todayMid) / (1000 * 60 * 60 * 24));
  }
  get isAdmin(): boolean { return this.auth.isAdmin(); }
}
