import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent {
  categories: Array<{
    name: string;
    icon: string;
    blurb: string;
    units: Array<{ name: string; description: string; contact: string; email?: string; office?: string; }>
  }> = [
    {
      name: 'Executive Leadership',
      icon: '🏛️',
      blurb: 'Central offices providing strategic direction, governance alignment, and executive oversight.',
      units: [
        { name: 'Mayor’s Office', description: 'Leads municipal governance, policy execution, and inter-agency coordination.', contact: '(+63) 912-000-1100', email: 'mayors.office@cabalian.gov', office: '2F Main Municipal Hall' },
        { name: 'Legislative Office', description: 'Facilitates local legislation, agenda setting, and public hearings.', contact: '(+63) 912-000-1101', email: 'legislative@cabalian.gov', office: 'Session Hall Wing' },
        { name: 'Manager’s Office', description: 'Oversees administrative performance, program delivery, and operational alignment.', contact: '(+63) 912-000-1102', email: 'municipal.manager@cabalian.gov', office: 'Admin Block 1F' }
      ]
    },
    {
      name: 'Administrative Services',
      icon: '🗄️',
      blurb: 'Foundational support functions ensuring efficient internal operations and resource stewardship.',
      units: [
        { name: 'Municipal Clerk’s Office', description: 'Records management, official documents, and public record transparency.', contact: '(+63) 912-000-1200', email: 'clerk@cabalian.gov', office: 'Records Center G/F' },
        { name: 'Finance Office', description: 'Budget planning, revenue collection, financial reporting, and fiscal compliance.', contact: '(+63) 912-000-1201', email: 'finance@cabalian.gov', office: 'Finance Wing 2F' },
        { name: 'Human Resources Office', description: 'Talent acquisition, employee welfare, training, and organizational development.', contact: '(+63) 912-000-1202', email: 'hr@cabalian.gov', office: 'HR Suite 2F' }
      ]
    },
    {
      name: 'Public Safety & Welfare',
      icon: '🛡️',
      blurb: 'Ensuring public protection, emergency readiness, and the social well-being of residents.',
      units: [
        { name: 'Municipal Police', description: 'Law enforcement, community policing, and crime prevention services.', contact: '(+63) 912-000-1300', email: 'police@cabalian.gov', office: 'Public Safety Complex' },
        { name: 'Fire and Rescue', description: 'Fire suppression, rescue operations, and safety education programs.', contact: '(+63) 912-000-1301', email: 'fire.rescue@cabalian.gov', office: 'Emergency Response Compound' },
        { name: 'Health & Social Services', description: 'Primary care, social welfare programs, and community health initiatives.', contact: '(+63) 912-000-1302', email: 'health.social@cabalian.gov', office: 'Wellness & Social Center' },
        { name: 'Disaster Risk Reduction & Management (DRRM)', description: 'Risk assessment, preparedness training, and coordinated disaster response.', contact: '(+63) 912-000-1303', email: 'drrm@cabalian.gov', office: 'DRRM Operations Center' }
      ]
    }
  ];

  trackByUnit(_i: number, unit: any) { return unit.name; }
  trackByCategory(_i: number, cat: any) { return cat.name; }
  sanitizeContact(raw: string): string { return raw.replace(/[^0-9+]/g, ''); }
}
