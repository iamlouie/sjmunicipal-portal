import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @HostBinding('class.collapsed') collapsed = false;
  private autoMode = true; // true while collapse state is governed by viewport size

  menu = [
    {
      label: 'General',
      items: [
        { label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { label: 'Organization Chart', icon: '🗂️', path: '/organization-chart' },
        { label: 'Announcements', icon: '📰', path: '/announcements' },
        { label: 'Events', icon: '📅', path: '/events' }
        
      ]
    },
    {
      label: 'Operations',
      items: [
        { label: 'Facilities', icon: '🏗️', path: '/facilities' },
  { label: 'Job Orders', icon: '🛠️', path: '/job-orders' }
      ]
    },
    {
      label: 'Administration',
      items: [
        { label: 'Residents', icon: '👥', path: '/residents' },
        { label: 'Departments', icon: '🏢', path: '/departments' },
        { label: 'Settings', icon: '⚙️', path: '/settings' }
      ]
    }
  ];

  ngOnInit() {
    this.applyResponsiveCollapse();
  }

  @HostListener('window:resize') onResize() {
    this.applyResponsiveCollapse();
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
  }
}
