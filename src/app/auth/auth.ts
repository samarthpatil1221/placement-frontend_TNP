import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Login } from '../login/login';
import { Register } from '../register/register';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  imports: [CommonModule, RouterModule, Login, Register],
})
export class AuthComponent {
  isLoginActive = true;

  showLogin() {
    this.isLoginActive = true;
  }

  showRegister() {
    this.isLoginActive = false;
  }
}