import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Api } from '../api';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private api: Api, private router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      this.api.getMe().subscribe({
        next: user => resolve(true),
        error: () => {
          this.router.navigate(['/login']);
          resolve(false);
        }
      });
    });
  }
}