import { Routes } from '@angular/router';
import { ContentComponent } from './components/content/content.component';
import { OrgchartComponent } from './components/orgchart/orgchart.component';
import { AnnouncementComponent } from './components/announcement/announcement.component';
import { EventComponent } from './components/event/event.component';
import { FacilitiesComponent } from './components/facilities/facilities.component';
import { ResidentsComponent } from './components/residents/residents.component';
import { ProjectComponent } from './components/project/project.component';
import { InquiriesComponent } from './components/inquiries/inquiries.component';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
	{ path: '', component: ContentComponent },
	{ path: 'organization-chart', component: OrgchartComponent },
	// Optional: placeholders for other sidebar links so navigation doesn't 404 yet
	{ path: 'dashboard', component: ContentComponent },
	{ path: 'announcements', component: AnnouncementComponent },
	{ path: 'events', component: EventComponent },
	{ path: 'permits', component: ContentComponent },
	{ path: 'inspections', component: ContentComponent },
	{ path: 'job-orders', component: ContentComponent }, // legacy placeholder (will be removed after full migration)
	{ path: 'projects', component: ProjectComponent },
	{ path: 'inquiries', component: InquiriesComponent },
	{ path: 'facilities', component: FacilitiesComponent },
	{ path: 'residents', component: ResidentsComponent, canActivate: [adminGuard] },
	{ path: 'departments', component: ContentComponent },
	{ path: 'settings', component: ContentComponent },
	// Wildcard redirect
	{ path: '**', redirectTo: '' }
];
