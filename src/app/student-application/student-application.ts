// student-application.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { Router } from '@angular/router';

type AppStatus = 'PENDING' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

@Component({
  selector: 'app-student-applications',
  templateUrl: './student-application.html',
  styleUrl: './student-application.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class StudentApplications implements OnInit {
  applications: any[] = [];

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.api.getStudentApplications().subscribe({
      next: (applications: any[]) => this.applications = applications,
      error: _ => this.router.navigate([''])
    });
  }

  dropdownValue(status: string): AppStatus {
    const s = (status || '').toUpperCase();
    if (s === 'APPLIED' || s === 'PENDING') return 'PENDING';
    if (s === 'SHORTLISTED') return 'SHORTLISTED';
    if (s === 'INTERVIEW') return 'INTERVIEW';
    if (s === 'SELECTED') return 'SELECTED';
    if (s === 'REJECTED') return 'REJECTED';
    return 'PENDING';
  }

  normalizeStudentStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPLIED') return 'PENDING';
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  onStatusSelectChange(app: any, event: Event) {
    const value = (event.target as HTMLSelectElement | null)?.value;
    if (!value) return;
    const newValue = value.toUpperCase() as AppStatus;
    const allowed: AppStatus[] = ['PENDING','SHORTLISTED','INTERVIEW','SELECTED','REJECTED'];
    if (!allowed.includes(newValue)) return;

    this.api.updateMyApplicationStatus(app.id, { status: newValue }).subscribe({
      next: _ => {
        app.status = newValue;
        // Optionally reload to reflect any server-side normalization
        // this.loadApplications();
      },
      error: err => {
        console.error('Update status failed:', err);
        alert(err?.error?.error || 'Failed to update status');
      }
    });
  }
}
