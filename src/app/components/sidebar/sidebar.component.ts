import { Component, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @HostBinding('class.collapsed') collapsed = false;

  menu = [
    {
      label: 'General',
      items: [
  { label: 'Dashboard', icon: '�', path: '/dashboard' },
        { label: 'Announcements', icon: '📰', path: '/announcements' }
      ]
    },
    {
      label: 'Operations',
      items: [
        { label: 'Permits', icon: '📝', path: '/permits' },
        { label: 'Inspections', icon: '🔍', path: '/inspections' },
  { label: 'Job Orders', icon: '🛠️', path: '/work-orders' }
      ]
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users', icon: '👥', path: '/users' },
        { label: 'Departments', icon: '🏢', path: '/departments' },
        { label: 'Settings', icon: '⚙️', path: '/settings' }
      ]
    }
  ];

  toggle(): void {
    this.collapsed = !this.collapsed;
  }
}
