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
    { type: 'image', src: 'assets/cab-logo.png', alt: 'Municipal Logo', title: 'Municipal Identity', tagline: 'Official emblem representing unity and progress.' },
    { type: 'video', src: 'assets/cab-video.mp4', alt: 'Municipal introduction video', title: 'Our Municipality', tagline: 'A glimpse into services and community life.' },
    { type: 'image', src: 'assets/profile-mayor.png', alt: 'Mayor Profile', title: 'Leadership', tagline: 'Committed to service and community development.' },
    { type: 'image', src: 'assets/cab-logo.png', alt: 'Community Emblem Variant', title: 'Community Spirit', tagline: 'Celebrating heritage, culture, and shared future.' }
  ] as Array<{ type: 'image' | 'video'; src: string; alt: string; title: string; tagline?: string }>;
  current = 0;
  private timer: any;
  intervalMs = 4500;
  private videoPlaying = false; // retained for potential future logic (e.g., styling)
  // Removed inactivity resume timer logic per new requirement
  showPlayOverlay = true; // show play overlay when video not started or after pause

  // Mission / Vision / Core Values / Strategic Priorities (static content for now)
  mission = 'To deliver transparent, efficient, and people‑centered local governance that uplifts quality of life through sustainable development, inclusive services, and active community participation.';
  vision = 'A resilient, progressive, and empowered San Juan (Cabalian) where every resident thrives in a safe, vibrant, and forward‑looking municipality grounded in heritage and shared responsibility.';

  coreValues = [
    { icon: '🤝', title: 'Community', desc: 'Fostering unity, participation, and shared progress.' },
    { icon: '⚖️', title: 'Integrity', desc: 'Upholding honesty, fairness, and accountability.' },
    { icon: '🌱', title: 'Sustainability', desc: 'Developing responsibly for future generations.' },
    { icon: '💡', title: 'Innovation', desc: 'Embracing improvement and smart solutions.' },
    { icon: '🛡️', title: 'Resilience', desc: 'Preparing for challenges and adapting to change.' },
    { icon: '📣', title: 'Transparency', desc: 'Clear, open communication and governance.' }
  ];

  strategicPriorities = [
    { icon: '🏗️', title: 'Infrastructure', detail: 'Road, drainage, and facilities modernization to support growth.' },
    { icon: '🚑', title: 'Public Health', detail: 'Strengthening primary care, wellness, and emergency response.' },
    { icon: '📚', title: 'Education & Youth', detail: 'Support programs, digital literacy, and inclusive learning spaces.' },
    { icon: '🌊', title: 'Climate & Environment', detail: 'Coastal protection, waste management, and green initiatives.' },
    { icon: '💼', title: 'Local Economy', detail: 'MSME support, tourism development, and agri-value chains.' },
    { icon: '🛰️', title: 'Digital Services', detail: 'E-governance platforms for faster, citizen-friendly services.' }
  ];

  trackByIndex(_i: number) { return _i; }

  constructor() { this.start(); }

  start() {
    // Do not start auto-advance if current slide is a video
    if (this.slides[this.current].type === 'video') { this.stop(); return; }
    this.stop();
    this.timer = setInterval(() => this.next(), this.intervalMs);
  }
  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  pause() { this.stop(); }
  resume() { this.start(); }
  next() { this.changeTo((this.current + 1) % this.slides.length); }
  prev() { this.changeTo((this.current - 1 + this.slides.length) % this.slides.length); }
  go(i: number) { this.changeTo(i); }

  private changeTo(index: number) {
    // Leaving current slide: if it was a video, pause it (user navigated away) and reset overlay.
    if (this.slides[this.current].type === 'video') {
      const currentFig = document.querySelectorAll<HTMLElement>('.c-slide')[this.current];
      const v = currentFig ? currentFig.querySelector<HTMLVideoElement>('video') : null;
      if (v && !v.paused) { v.pause(); }
      this.videoPlaying = false;
      this.showPlayOverlay = true;
    }
    this.current = index;
    // If new slide is video: stop any auto-advance (strict requirement: never auto-next while on video regardless of state)
    if (this.slides[this.current].type === 'video') {
      this.stop(); // ensure timer cleared
      this.showPlayOverlay = true;
    } else {
      if (!this.timer) { this.start(); }
    }
  }

  onVideoPlay() {
    this.videoPlaying = true;
    // Interval already stopped on entering video; just hide overlay
    this.stop(); // defensive
    this.showPlayOverlay = false;
  }

  onVideoPause() {
    this.videoPlaying = false;
    // Per requirement: still do NOT auto-advance while on video even if paused/idle
    this.stop();
    this.showPlayOverlay = true;
  }

  onVideoEnded() {
    this.videoPlaying = false;
    this.showPlayOverlay = true; // reset overlay
    // Advance to next slide. changeTo() will start interval if next slide is not a video.
    this.next();
  }

  // clearPauseTimer removed (no longer needed)

  playCurrentVideo() {
    const currentFig = document.querySelectorAll<HTMLElement>('.c-slide')[this.current];
    const v = currentFig ? currentFig.querySelector<HTMLVideoElement>('video') : null;
    if (!v) return;
    // Attempt to play
    v.play().then(() => {
      this.showPlayOverlay = false; // event will also set
    }).catch(() => {
      // If play failed (e.g., browser policy), keep overlay
      this.showPlayOverlay = true;
    });
  }
}
