import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../api';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class NavbarComponent {
  constructor(private api: Api, private router: Router) {}

  logout() {
    this.api.logout().subscribe({
      next: () => {
        // After successful logout, navigate to login page (or home page)
        this.router.navigate(['/']); // replace '/login' with '/' if your home page contains login form
      },
      error: (err) => {
        console.error('Logout failed', err);
        // Even on error, navigate to login page to avoid stuck state
        this.router.navigate(['/login']);
      }
    });
  }
  
 }
