import { Routes } from '@angular/router';
import { ContentComponent } from './components/content/content.component';
import { OrgchartComponent } from './components/orgchart/orgchart.component';
import { ResidentsComponent } from './components/residents/residents.component';
import { InquiriesComponent } from './components/inquiries/inquiries.component';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
	{ path: '', component: ContentComponent },
	{ path: 'organization-chart', component: OrgchartComponent },
	// Optional: placeholders for other sidebar links so navigation doesn't 404 yet
	{ path: 'dashboard', component: ContentComponent },
	{ path: 'announcements', loadComponent: () => import('./components/announcement/announcement.component').then(m => m.AnnouncementComponent) },
	{ path: 'events', loadComponent: () => import('./components/event/event.component').then(m => m.EventComponent) },
	{ path: 'tourism', loadComponent: () => import('./components/tourism/tourism.component').then(m => m.TourismComponent) },
	{ path: 'certificates', loadComponent: () => import('./components/certificates/certificates.component').then(m => m.CertificatesComponent) },
	{ path: 'permits', loadComponent: () => import('./components/permits/permits.component').then(m => m.PermitsComponent) },
	{ path: 'inspections', component: ContentComponent },
	{ path: 'job-orders', component: ContentComponent }, // legacy placeholder (will be removed after full migration)
	{ path: 'projects', loadComponent: () => import('./components/project/project.component').then(m => m.ProjectComponent) },
	{ path: 'inquiries', component: InquiriesComponent },
	{ path: 'facilities', loadComponent: () => import('./components/facilities/facilities.component').then(m => m.FacilitiesComponent) },
	{ path: 'residents', canActivate: [adminGuard], loadComponent: () => import('./components/residents/residents.component').then(m => m.ResidentsComponent) },
	{ path: 'departments', loadComponent: () => import('./components/departments/departments.component').then(m => m.DepartmentsComponent) },
	{ path: 'settings', component: ContentComponent },
	// Wildcard redirect
	{ path: '**', redirectTo: '' }
];
