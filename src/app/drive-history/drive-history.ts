import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // for routerLink
import { NavbarStudentComponent } from '../navbar-student/navbar-student';

@Component({
  selector: 'app-drives-history',
  templateUrl: './drive-history.html',
  styleUrls: ['./drive-history.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarStudentComponent],
})
export class StudentDrivesHistory implements OnInit {
  appliedDrives: any[] = [];
  filteredDrives: any[] = [];
  username = '';
  searchText = '';
  statusFilter = '';

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.api.getMe().subscribe({
      next: (me: any) => {
        this.username = me.username;
      },
      error: (err) => {
        console.error('getMe error', err);
        this.router.navigate(['/']);
      },
    });

    this.api.getAppliedDriveIds().subscribe({
      next: (appliedIds: number[]) => {
        this.api.getDrives().subscribe({
          next: (drives) => {
            this.appliedDrives = drives.filter((d) => appliedIds.includes(d.id));
            this.filteredDrives = [...this.appliedDrives];
            this.filterDrives();
          },
          error: (err) => console.error('getDrives failed:', err),
        });
      },
      error: (err) => console.error('getAppliedDriveIds failed:', err),
    });
  }

  onSearchTextChange(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.filterDrives();
  }

  onStatusFilterChange(event: Event) {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.filterDrives();
  }

  filterDrives() {
  const search = this.searchText.trim().toLowerCase();
  const status = this.statusFilter.trim().toLowerCase();

  console.log('Filtering drives with:', { search, status }); // For debugging

  this.filteredDrives = this.appliedDrives.filter((drive) => {
    // Defensive check for drive.status and companyName
    const driveStatus = drive.status ? drive.status.toLowerCase() : '';
    const companyName = drive.companyName ? drive.companyName.toLowerCase() : '';
    const roleName = drive.role ? drive.role.toLowerCase() : '';

    const matchesStatus = !status || driveStatus === status;
    const matchesSearch =
      !search || companyName.includes(search) || roleName.includes(search);

    return matchesStatus && matchesSearch;
  });

  console.log('Filtered drives:', this.filteredDrives);
}

private currentRoundFromStatus(status: string): string {
  const s = (status || '').toUpperCase();
  if (s === 'SHORTLISTED') return 'Shortlisted';
  if (s === 'INTERVIEW') return 'Interview';
  if (s === 'SELECTED') return 'Selected';
  if (s === 'REJECTED') return 'Rejected';
  // Treat APPLIED/PENDING as same
  return 'Applied/Pending';
}
}