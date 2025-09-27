import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../api';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-edit-drive',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule],
  templateUrl: './admin-edit-drive.html',
  styleUrls: ['./admin-edit-drive.css']
})
export class AdminEditDrive implements OnInit {
  driveForm!: FormGroup;
  driveId!: number;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.driveId = +this.route.snapshot.paramMap.get('id')!;
    this.driveForm = this.fb.group({
      companyName: ['', Validators.required],
      jd: ['', Validators.required],
      dateOfDrive: ['', Validators.required],
      location: ['', Validators.required],
    });

    this.loadDrive();
  }

  loadDrive() {
    this.api.getDrive(this.driveId).subscribe({
      next: (drive) => {
        this.driveForm.patchValue({
          companyName: drive.companyName,
          jd: drive.jd,
          dateOfDrive: drive.dateOfDrive,
          location: drive.location,
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load drive data.';
        console.error(err);
      }
    });
  }

  save() {
    if (this.driveForm.invalid) return;

    this.loading = true;
    const updatedDrive = this.driveForm.value;

    this.api.updateDrive(this.driveId, updatedDrive).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/drives']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to save changes.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/drives']);
  }
}
