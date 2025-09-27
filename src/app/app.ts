import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [CommonModule, RouterOutlet,RouterModule]
})
export class AppComponent {
  constructor(private router: Router) {}

  isLandingPage() {
    return this.router.url === '/' || this.router.url === '/register';
  }
}
