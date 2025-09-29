import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-orgchart',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './orgchart.component.html',
  styleUrls: ['./orgchart.component.css']
})
 export class OrgchartComponent {
  // Using same placeholder photo for now: assets/profile-mayor.png
  mayor = { name: 'Louie Nuez', photo: 'assets/profile-mayor.png', role: 'Mayor', initials: 'LN' };
  viceMayor = { name: 'Vice Mayor', photo: 'assets/profile-mayor.png', role: 'Vice Mayor', initials: 'VM' };

   councilors = [
  { name: 'Councilor 1', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C1', slug: 'councilor-1' },
  { name: 'Councilor 2', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C2', slug: 'councilor-2' },
  { name: 'Councilor 3', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C3', slug: 'councilor-3' },
  { name: 'Councilor 4', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C4', slug: 'councilor-4' },
  { name: 'Councilor 5', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C5', slug: 'councilor-5' },
  { name: 'Councilor 6', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C6', slug: 'councilor-6' },
  { name: 'Councilor 7', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C7', slug: 'councilor-7' },
  { name: 'Councilor 8', role: 'Councilor', photo: 'assets/profile-mayor.png', initials: 'C8', slug: 'councilor-8' }
   ];

   trackByCouncilor = (_: number, c: any) => c.slug || c.name;
 }
