import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from '../login/login';
import { RouterModule } from '@angular/router';
import { AuthComponent } from '../auth/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  standalone: true,
  imports: [CommonModule, RouterModule,AuthComponent]
})
export class Home {}