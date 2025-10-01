import { Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService, HistoryEntry as StoredEntry } from './history.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../../auth.service';
import { ToastService } from '../../toast.service';
interface HistoryEntry { action: 'add' | 'update' | 'delete' | 'other'; message: string; when: Date; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, LoginComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  historyOpen = false;
  history: HistoryEntry[] = [];
  loginOpen = false;
  menuOpen = false;

  constructor(
    private el: ElementRef,
    private historySvc: HistoryService,
  public auth: AuthService,
    private toast: ToastService,
  private router: Router,
  ) {
    // Load existing stored entries
    this.history = historySvc.getAll().map(this.mapStored);
    if (!this.history.length) {
      // seed only if empty
      [
        { action: 'add' as const, message: 'Added new resident record', when: new Date(Date.now() - 1000 * 60 * 5) },
        { action: 'update' as const, message: 'Updated facility schedule', when: new Date(Date.now() - 1000 * 60 * 15) },
        { action: 'delete' as const, message: 'Deleted announcement draft', when: new Date(Date.now() - 1000 * 60 * 60) },
        { action: 'add' as const, message: 'Created event “Health Fair”', when: new Date(Date.now() - 1000 * 60 * 90) },
        { action: 'update' as const, message: 'Modified org chart positions', when: new Date(Date.now() - 1000 * 60 * 120) },
      ].forEach(e => this.pushAndPersist(e));
    }
  }

  private mapStored = (s: StoredEntry): HistoryEntry => ({ action: s.action, message: s.message, when: new Date(s.when) });
  private pushAndPersist(e: HistoryEntry) {
    this.history.unshift(e);
    this.historySvc.add({ action: e.action, message: e.message, when: e.when });
  }

  // Example public method to add new entry (can be called from elsewhere in future)
  addHistory(action: HistoryEntry['action'], message: string) {
    this.pushAndPersist({ action, message, when: new Date() });
  }

  toggleHistory() { this.historyOpen = !this.historyOpen; }
  closeHistory() { this.historyOpen = false; }
  toggleMenu() { this.menuOpen = !this.menuOpen; if (!this.menuOpen) { this.historyOpen = false; } }
  closeMenu() { this.menuOpen = false; this.historyOpen = false; }

  openLogin() { this.loginOpen = true; }
  closeLogin() { this.loginOpen = false; }
  onLoggedIn(user: string) { this.loginOpen = false; }

  logout() {
    const name = this.auth.user()?.username;
    this.auth.logout();
    this.toast.info('Logged out' + (name ? ' (' + name + ')' : ''));
    // Redirect to dashboard/root after logout
    this.router.navigate(['/']);
  }



  @HostListener('document:keydown.escape') onEscape() {
    if (this.historyOpen) this.closeHistory();
    if (this.menuOpen) this.closeMenu();
    if (this.loginOpen) this.closeLogin();
  }

  @HostListener('document:mousedown', ['$event']) onDocClick(ev: MouseEvent) {
    const host = ev.target as HTMLElement;
    const root = this.el.nativeElement as HTMLElement;
    if (this.historyOpen) {
      if (!root.contains(host)) return;
      const panel = root.querySelector('.history-panel');
      if (panel && !panel.contains(host) && !host.closest('.icon-history')) this.closeHistory();
    }
    if (this.menuOpen) {
      const drawer = root.querySelector('#header-menu');
      if (drawer && !drawer.contains(host) && !host.closest('.hamburger')) {
        this.closeMenu();
      }
    }
  }

  
}
