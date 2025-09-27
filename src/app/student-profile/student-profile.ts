import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarStudentComponent } from '../navbar-student/navbar-student';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarStudentComponent]
})
export class StudentProfile implements OnInit {
  student: any = null;
  success = '';
  error = '';
  username = '';
  mode: 'fill' | 'view' | 'edit' = 'fill';

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.api.getMe().subscribe({
      next: (me: any) => this.username = me.username
    });
    this.loadProfile();
  }

  loadProfile() {
    // Always set mode after loading the latest data
    this.api.getProfile().subscribe({
      next: data => {
        this.student = data;
        this.mode = (this.student.fullName && this.student.email) ? 'view' : 'fill';
      },
      error: () => {
        this.student = {};
        this.mode = 'fill';
      }
    });
  }

  updateProfile() {
    this.success = '';
    this.error = '';
    this.api.updateProfile(this.student).subscribe({
      next: () => {
        this.success = 'Profile updated successfully!';
        this.loadProfile();   // Calls loadProfile, which sets mode
      },
      error: () => this.error = 'Update failed, please try again.'
    });
  }

  editProfile() {
    this.mode = 'edit';
  }

  cancelEdit() {
    this.mode = 'view';
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.api.uploadResume(formData).subscribe({
        next: (res: any) => {
          this.student.resumePath = res.path;
          this.success = 'Resume uploaded!';
        },
        error: () => this.error = 'Resume upload failed.'
      });
    }
  }
}

export interface Student {
  id: number;
  username: string;
  name: string;
  email: string;
  imageUrl?: string; // optional field
}