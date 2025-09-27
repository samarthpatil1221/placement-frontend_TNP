import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Api } from '../api';

@Component({
  selector: 'admin-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile-page.html',
  styleUrls: ['./admin-profile-page.css']
})
export class AdminProfilePage implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private api: Api, private router: Router) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    this.loadAdminDetails();
  }

  loadAdminDetails(): void {
    this.loading = true;
    this.api.getMe().subscribe({
      next: (admin: any) => {
        this.profileForm.patchValue({
          username: admin.username,
          fullName: admin.fullName  || '',
          email: admin.email || ''
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load admin details.';
        this.loading = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  get hasPasswordMismatchError(): boolean {
    return this.profileForm.errors ? !!this.profileForm.errors['passwordMismatch'] : false;
  }

  onSubmit(): void {
     if (this.profileForm.invalid) {
    console.log('Form Errors:', this.profileForm.errors);
    Object.keys(this.profileForm.controls).forEach(key => {
      const controlErrors = this.profileForm.get(key)?.errors;
      if (controlErrors) {
        console.log(`Control: ${key}, Errors:`, controlErrors);
      }
    });
    this.errorMessage = 'Please fix the errors in the form.';
    return;
  }

    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    const updateData: any = {
      fullName: this.profileForm.get('fullName')?.value,
      email: this.profileForm.get('email')?.value
    };
    if (this.profileForm.get('password')?.value) {
      updateData.password = this.profileForm.get('password')?.value;
    }

    this.api.updateAdminProfile(updateData).subscribe({
  next: () => {
    this.successMessage = 'Profile updated successfully.';
    this.loading = false;
    this.profileForm.get('password')?.reset();
    this.profileForm.get('confirmPassword')?.reset();
  },
  error: (err) => {
    console.error('Update profile error:', err);
    if (err.error && err.error.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = 'Failed to update profile.';
    }
    this.loading = false;
  }
});

  }
}