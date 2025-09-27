import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Register {
  username = '';
  password = '';
  role = 'STUDENT';
  error = '';
  success = '';

  constructor(private api: Api, private router: Router) {}
  loading = false;

  register() {
    this.error = '';
    this.success = '';
    this.loading = true;
    this.api.register({ username: this.username, password: this.password, role: this.role })
      .subscribe({
        next: () => {
          this.success = 'Registration successful!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: err => {
          this.loading = false;
          if (err.error?.message) this.error = err.error.message;
          else this.error = 'Registration failed';
        }
      });
  }
  
 
  
  
}