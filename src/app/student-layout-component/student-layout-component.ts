import { Component } from '@angular/core';
import { NavbarStudentComponent } from '../navbar-student/navbar-student';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-layout',
    templateUrl: './student-layout-component.html',
  styleUrls: ['./student-layout-component.css'],
  standalone: true,
  imports: [CommonModule, NavbarStudentComponent, RouterModule],
})
export class StudentLayoutComponent {}