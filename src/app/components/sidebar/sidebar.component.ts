import { Component, HostBinding, HostListener, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class.collapsed') collapsed = false;
  private autoMode = true; // true while collapse state is governed by viewport size

  menu = [
    {
      label: 'General',
      items: [
        { label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { label: 'Organization Chart', icon: '🗂️', path: '/organization-chart' },
        { label: 'Announcements', icon: '📰', path: '/announcements' },
        { label: 'Events', icon: '📅', path: '/events' },
        { label: 'Tourism', icon: '✈️', path: '/tourism' } // updated icon
      ]
    },
    {
      label: 'Operations',
      items: [
    { label: 'Facilities', icon: '🏗️', path: '/facilities' },
    { label: 'Projects', icon: '🛠️', path: '/projects' }
      ]
    },
     {
      label: 'Services',
      items: [
    { label: 'Inquiry', icon: '📨', path: '/inquiries' },
    { label: 'Certificates', icon: '🧾', path: '/certificates' },
    { label: 'Permits', icon: '📝', path: '/permits' }
      ]
    },
    {
      label: 'Administration',
      items: [
        { label: 'Residents', icon: '👥', path: '/residents' },
        { label: 'Departments', icon: '🏢', path: '/departments' },
        // Settings entry removed per request
      ]
    }
  ];

  @ViewChild('scrollRef') scrollEl?: ElementRef<HTMLElement>;
  private needsScroll = false;
  private mutationObserver?: MutationObserver;

  ngOnInit() {
    this.applyResponsiveCollapse();
  }

  ngAfterViewInit() {
    this.evaluateScroll();
    // Observe dynamic changes inside the scroll container
    if (this.scrollEl) {
      this.mutationObserver = new MutationObserver(() => this.evaluateScroll());
      this.mutationObserver.observe(this.scrollEl.nativeElement, { childList: true, subtree: true });
    }
  }

  ngOnDestroy() {
    this.mutationObserver?.disconnect();
  }

  @HostListener('window:resize') onResize() {
    this.applyResponsiveCollapse();
    this.evaluateScroll();
  }

  private applyResponsiveCollapse() {
    const w = window.innerWidth;
    const breakpoint = 860; // px breakpoint for auto-collapse
    if (w <= breakpoint) {
      this.collapsed = true;
      this.autoMode = true;
    } else if (this.autoMode) {
      // Only auto-expand back if user hasn't manually overridden
      this.collapsed = false;
    }
  }

  toggle(): void {
    // User explicitly overrides; stop auto mode until next navigation/refresh
    this.autoMode = false;
    this.collapsed = !this.collapsed;
    // After animation, reevaluate scroll necessity
    setTimeout(() => this.evaluateScroll(), 400);
  }

  private evaluateScroll() {
    if (!this.scrollEl) return;
    const el = this.scrollEl.nativeElement;
    const shouldScroll = el.scrollHeight > el.clientHeight + 2; // fudge factor
    if (shouldScroll !== this.needsScroll) {
      this.needsScroll = shouldScroll;
      if (shouldScroll) {
        el.classList.add('sidebar__scroll--show');
      } else {
        el.classList.remove('sidebar__scroll--show');
      }
    }
  }
}
