import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../toast.service';
import { AuthService } from '../../auth.service';
import { parseIsoDate, isIsoPast, isIsoToday, isIsoWithinNextDays, daysUntilIso, todayMidnightTs, formatIsoDisplay } from '../../date-utils';

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
  private pristineEditSnapshot: Partial<MunicipalEvent> | null = null;
  editSubmitted = false;
  // inline create form state
  createModel: any = { title:'', date:'', time:'', location:'', excerpt:'' };
  createSubmitted = false;

  constructor(private auth: AuthService) {
    this.http.get<MunicipalEvent[]>('https://my-json-db-3.onrender.com/events')
      .subscribe({
        next: data => { this.events = data; this.loading = false; },
        error: err => { this.error = 'Failed to load events'; console.error(err); this.loading = false; }
      });
  }

  get sortedEvents() {
    const todayTs = todayMidnightTs();
    const upcoming: MunicipalEvent[] = [];
    const past: MunicipalEvent[] = [];
    for (const ev of this.events) {
      const t = parseIsoDate(ev.date).getTime();
      if (!isNaN(t) && t >= todayTs) upcoming.push(ev); else past.push(ev);
    }
    // upcoming ascending (soonest first)
    upcoming.sort((a,b) => {
      const at = parseIsoDate(a.date).getTime();
      const bt = parseIsoDate(b.date).getTime();
      if (at !== bt) return at - bt;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });
    // past descending (most recent past first)
    past.sort((a,b) => {
      const at = parseIsoDate(a.date).getTime();
      const bt = parseIsoDate(b.date).getTime();
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
    this.http.post<MunicipalEvent>('https://my-json-db-3.onrender.com/events', payload)
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
    const dateDisplay = formatIsoDisplay(this.createModel.date);
    this.postEvent({ ...this.createModel, dateDisplay });
  }

  startEdit() {
    if (!this.selected || !this.auth.isAdmin()) return;
    // Clone first (so values exist at first render) then flip editing flag
    // Normalize date to YYYY-MM-DD (in case any time portion sneaks in) for <input type="date">
    const normalizedDate = this.selected.date ? this.selected.date.substring(0,10) : '';
    // Normalize time to HH:MM for <input type="time"> (strip seconds if present)
    let normalizedTime = this.selected.time || '';
    if (normalizedTime && normalizedTime.length >= 5) {
      // Accept formats like HH:MM or HH:MM:SS -> take first 5 chars
      normalizedTime = normalizedTime.substring(0,5);
    }
    this.editModel = { ...this.selected, date: normalizedDate, time: normalizedTime };
    // Store pristine snapshot for accurate dirty comparison (avoid comparing against original selected which may have different formatting)
    this.pristineEditSnapshot = { ...this.editModel };
    this.editing = true;
  }

  cancelEdit() {
    this.editing = false;
    this.updateSaving = false;
    this.editModel = {};
    this.pristineEditSnapshot = null;
  }

  get isEditDirty(): boolean {
    if (!this.selected || !this.editing) return false;
    if (!this.pristineEditSnapshot) return false;
    const fields: (keyof MunicipalEvent)[] = ['title','date','time','location','excerpt'];
    return fields.some(k => (this.editModel as any)[k] !== (this.pristineEditSnapshot as any)[k]);
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
    this.http.put<MunicipalEvent>(`https://my-json-db-3.onrender.com/events/${id}`, payload)
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
    if (this.selected) {
      this.editModel.dateDisplay = formatIsoDisplay(this.editModel.date as string);
    }
    // After successful save we will refresh selected via response; snapshot cleared in cancelEdit()
    this.saveUpdate();
  }

  isPast(ev: MunicipalEvent): boolean { return isIsoPast(ev.date); }
  isToday(ev: MunicipalEvent): boolean { return isIsoToday(ev.date); }
  isNearUpcoming(ev: MunicipalEvent): boolean { return isIsoWithinNextDays(ev.date, 7); }
  daysUntil(ev: MunicipalEvent): number { return daysUntilIso(ev.date); }
  get isAdmin(): boolean { return this.auth.isAdmin(); }
}
