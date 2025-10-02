import { Component, OnInit, signal, inject } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Project {
  id: number;
  name: string;
  category: string;
  status: string;
  startDate: string;
  targetEndDate: string;
  budget: number;
  fundSource: string;
  percentComplete: number;
  description: string;
  location: string; // barangay / area
}

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {
  private http = inject(HttpClient);

  projects = signal<Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    if (!this.projects().length) {
      this.load();
    }
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
  const API_URL = 'https://my-json-db-3.onrender.com/projects';
  this.http.get<Project[]>(API_URL).subscribe({
      next: list => {
        this.projects.set(list);
        this.loading.set(false);
      },
      error: err => {
        console.error('Projects load error', err);
        this.error.set('Failed to load projects');
        this.loading.set(false);
      }
    });
  }

  trackById(_i:number, p:Project){ return p.id; }
}
