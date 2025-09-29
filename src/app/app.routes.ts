import { Routes } from '@angular/router';
import { ContentComponent } from './components/content/content.component';
import { OrgchartComponent } from './components/orgchart/orgchart.component';
import { AnnouncementComponent } from './components/announcement/announcement.component';
import { EventComponent } from './components/event/event.component';
import { FacilitiesComponent } from './components/facilities/facilities.component';
import { ResidentsComponent } from './components/residents/residents.component';

export const routes: Routes = [
	{ path: '', component: ContentComponent },
	{ path: 'organization-chart', component: OrgchartComponent },
	// Optional: placeholders for other sidebar links so navigation doesn't 404 yet
	{ path: 'dashboard', component: ContentComponent },
	{ path: 'announcements', component: AnnouncementComponent },
	{ path: 'events', component: EventComponent },
	{ path: 'permits', component: ContentComponent },
	{ path: 'inspections', component: ContentComponent },
	{ path: 'job-orders', component: ContentComponent },
	{ path: 'facilities', component: FacilitiesComponent },
	{ path: 'residents', component: ResidentsComponent },
	{ path: 'departments', component: ContentComponent },
	{ path: 'settings', component: ContentComponent },
	// Wildcard redirect
	{ path: '**', redirectTo: '' }
];
