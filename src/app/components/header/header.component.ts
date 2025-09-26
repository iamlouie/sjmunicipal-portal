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

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      // Delay to allow *ngIf to render input before focusing
      setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
    }
  }

  submitSearch(): void {
    // Placeholder: wire to real search logic later
    console.log('Searching for:', this.query);
  }

}
