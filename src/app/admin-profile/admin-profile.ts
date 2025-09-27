import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Api } from '../api';

@Component({
  selector: 'admin-profile',
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class AdminProfile {
  @Input() username = '';
  dropdownOpen = false;

  constructor(private api: Api, private router: Router) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      this.dropdownOpen = false;
    }
  }

  logout() {
    this.api.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}