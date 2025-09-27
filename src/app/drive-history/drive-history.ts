import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // for routerLink
import { NavbarStudentComponent } from '../navbar-student/navbar-student';

type AppStatus = 'PENDING' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

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
        this.api.getStudentApplications().subscribe({
          next: (apps: any[]) => {
            const statusByDrive = new Map<number, string>();
            const appliedAtByDrive = new Map<number, string | null>();

            (apps || []).forEach((a: any) => {
              const key = Number(a?.driveId);
              if (!Number.isNaN(key)) {
                statusByDrive.set(key, a?.status || 'APPLIED');
                appliedAtByDrive.set(key, a?.appliedAt ?? null);
              }
            });

            this.api.getDrives().subscribe({
              next: (drives) => {
                this.appliedDrives = (drives || [])
                  .filter((d: any) => appliedIds.includes(d.id))
                  .map((d: any) => {
                    const key = Number(d.id);
                    const status = statusByDrive.get(key) || 'APPLIED';
                    const rawAppliedAt = appliedAtByDrive.get(key);

                    let appliedOn: Date | null = null;
                    if (rawAppliedAt) {
                      appliedOn =
                        rawAppliedAt.length <= 10
                          ? new Date(rawAppliedAt + 'T00:00:00Z')
                          : new Date(rawAppliedAt);
                    }

                    return {
                      ...d,
                      status,
                      appliedOn,
                    };
                  });

                this.filteredDrives = [...this.appliedDrives];
                this.filterDrives();
              },
              error: (err) => console.error('getDrives failed:', err),
            });
          },
          error: (err) => console.error('getStudentApplications failed:', err),
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

    this.filteredDrives = this.appliedDrives.filter((drive: any) => {
      const driveStatus = drive.status ? String(drive.status).toLowerCase() : '';
      const companyName = drive.companyName ? String(drive.companyName).toLowerCase() : '';
      const roleName = drive.role ? String(drive.role).toLowerCase() : '';

      const matchesStatus = !status || driveStatus === status;
      const matchesSearch =
        !search || companyName.includes(search) || roleName.includes(search);

      return matchesStatus && matchesSearch;
    });
  }

  // status display text
  currentRoundFromStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPLIED') return 'Applied';
    if (s === 'PENDING') return 'Pending';
    if (s === 'SHORTLISTED') return 'Shortlisted';
    if (s === 'INTERVIEW') return 'Interview';
    if (s === 'SELECTED') return 'Selected';
    if (s === 'REJECTED') return 'Rejected';
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  // dropdown initial value
  dropdownValue(status: string): AppStatus {
    const s = (status || '').toUpperCase();
    if (s === 'APPLIED' || s === 'PENDING') return 'PENDING';
    if (s === 'SHORTLISTED') return 'SHORTLISTED';
    if (s === 'INTERVIEW') return 'INTERVIEW';
    if (s === 'SELECTED') return 'SELECTED';
    if (s === 'REJECTED') return 'REJECTED';
    return 'PENDING';
  }

  // normalize for student display
  normalizeStudentStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPLIED') return 'PENDING';
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  // update status via dropdown
  onStatusSelectChange(drive: any, event: Event) {
    const value = (event.target as HTMLSelectElement | null)?.value;
    if (!value) return;
    const newValue = value.toUpperCase() as AppStatus;
    const allowed: AppStatus[] = ['PENDING','SHORTLISTED','INTERVIEW','SELECTED','REJECTED'];
    if (!allowed.includes(newValue)) return;

    this.api.updateMyApplicationStatus(drive.id, { status: newValue }).subscribe({
      next: _ => {
        drive.status = newValue; // update UI immediately
      },
      error: err => {
        console.error('Update status failed:', err);
        alert(err?.error?.error || 'Failed to update status');
      }
    });
  }

  // apply and set applied date locally
  applyToDrive(drive: any) {
    const appliedOn = new Date(); // today
    this.api.applyToDrive(drive.id).subscribe({
      next: () => {
        drive.appliedOn = appliedOn;
        drive.status = 'APPLIED'; // mark status applied
      },
      error: (err) => console.error('applyToDrive failed:', err),
    });
  }
}
