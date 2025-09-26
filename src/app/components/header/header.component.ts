import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  showSearch = false;
  query = '';
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;
  private inactivityTimer: any; // NodeJS.Timeout or number (browser)
  private readonly INACTIVITY_MS = 8000; // collapse after 8s of no typing while empty

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      // Delay to allow *ngIf to render input before focusing
      setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
      this.startInactivityTimer();
    } else {
      this.clearInactivityTimer();
    }
  }

  submitSearch(): void {
    // Placeholder: wire to real search logic later
    console.log('Searching for:', this.query);
  }

  clearSearch(): void {
    this.query = '';
    // Refocus input and restart inactivity timer so it can auto-close again if left empty
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
    this.startInactivityTimer();
  }

  onInput(): void {
    // If user starts typing, keep it open and reset inactivity timer
    this.startInactivityTimer();
  }

  handleBlur(): void {
    // Collapse only if empty; if user typed something we keep it (could change requirement later)
    if (this.query.trim() === '') {
      this.showSearch = false;
      this.clearInactivityTimer();
    }
  }

  handleEscape(): void {
    this.showSearch = false;
    this.clearInactivityTimer();
  }

  private startInactivityTimer(): void {
    this.clearInactivityTimer();
    // Only run inactivity collapse when empty
    this.inactivityTimer = setTimeout(() => {
      if (this.query.trim() === '') {
        this.showSearch = false;
      }
    }, this.INACTIVITY_MS);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

}
