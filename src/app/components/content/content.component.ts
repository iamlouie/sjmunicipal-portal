import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent {
slides = [
    { src: 'assets/cab-logo.png', alt: 'Municipal Logo', title: 'Municipal Identity', tagline: 'Official emblem representing unity and progress.' },
    { src: 'assets/profile-mayor.png', alt: 'Mayor Profile', title: 'Leadership', tagline: 'Committed to service and community development.' },
    { src: 'assets/cab-logo.png', alt: 'Community Emblem Variant', title: 'Community Spirit', tagline: 'Celebrating heritage, culture, and shared future.' }
  ];
  current = 0;
  private timer: any;
  intervalMs = 4500;

  constructor() { this.start(); }

  start() { this.stop(); this.timer = setInterval(() => this.next(), this.intervalMs); }
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  pause() { this.stop(); }
  resume() { this.start(); }
  next() { this.current = (this.current + 1) % this.slides.length; }
  prev() { this.current = (this.current - 1 + this.slides.length) % this.slides.length; }
  go(i: number) { this.current = i; this.start(); }
}
