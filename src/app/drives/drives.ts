import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarStudentComponent } from '../navbar-student/navbar-student';

@Component({
  selector: 'app-drives',
  templateUrl: './drives.html',
  styleUrls: ['./drives.css'],
  standalone: true,
  imports: [CommonModule, NavbarStudentComponent]
})
export class Drives implements OnInit {
  drives: any[] = [];
  appliedDrives: number[] = []; // hold applied drive IDs here
  username = '';
  selectedDrive: any = null;

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.api.getMe().subscribe({ next: (me: any) => this.username = me.username });

    // fetch drives and applied drives info (assumed API support)
    this.api.getDrives().subscribe({
      next: drives => {
        this.api.getAppliedDriveIds().subscribe({
          next: (applied: number[]) => {
            this.appliedDrives = applied;
            this.drives = drives.filter(drive => !this.appliedDrives.includes(drive.id));
          },
          error: () => {
            // fallback: show all drives if applied drives fetch fails
            this.drives = drives;
          }
        });
      },
      error: () => this.router.navigate(['/'])
    });
  }

  openDetails(drive: any) {
    this.selectedDrive = drive;
  }

  closeDetails() {
    this.selectedDrive = null;
  }

  applyToDrive(driveId: number) {
    this.api.applyToDrive(driveId).subscribe({
      next: () => {
        alert('Applied!');
        // After applying, remove drive from list
        this.appliedDrives.push(driveId);
        this.drives = this.drives.filter(d => d.id !== driveId);
      },
      error: (error) => {
        if (error.status === 400 && error.error === 'You are already applied to this drive') {
          alert('You have already applied to this drive');
        } else {
          alert('Application failed!');
        }
      }
    });
  }
}