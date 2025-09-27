import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../api';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-admin-add-drive',
  templateUrl: './admin-add-drives.html',
  styleUrls: ['./admin-add-drives.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule
  ]
})
export class AdminAddDrive {
  companyName = '';
  jd = '';
  dateOfDrive: Date | null = null;
  location = '';
  error = '';
  success = '';
  today = new Date();

  constructor(private api: Api, private router: Router) {}

  goBack() {
    this.router.navigate(['/admin/drives']);
  }

  addDrive() {
    this.error = this.success = '';
    if (!this.companyName || !this.jd || !this.dateOfDrive || !this.location) {
      this.error = 'Please fill all fields';
      return;
    }

    const drive = {
      companyName: this.companyName,
      jd: this.jd,
      dateOfDrive: this.dateOfDrive,
      location: this.location
    };

    this.api.createDrive(drive).subscribe({
      next: () => {
        this.success = 'Drive added successfully!';
        // Clear form
        this.companyName = this.jd = this.location = '';
        this.dateOfDrive = null;
        setTimeout(() => this.router.navigate(['/admin/drives']), 1500);
      },
      error: err => this.error = err.error?.message || 'Failed to add drive'
    });
  }

  get completionProgress() {
    const total = 4;
    let filled = 0;
    if (this.companyName) filled++;
    if (this.jd) filled++;
    if (this.dateOfDrive) filled++;
    if (this.location) filled++;
    return (filled / total) * 100;
  }
}
