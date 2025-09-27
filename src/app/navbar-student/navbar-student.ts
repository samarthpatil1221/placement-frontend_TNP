import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-navbar',
  templateUrl: './navbar-student.html',
  styleUrls: ['./navbar-student.css'],
  standalone: true,
  imports: [RouterModule,FormsModule]
})
export class NavbarStudentComponent implements OnInit {
  @Input() username: string = '';
  studentImageUrl: string | null = null;

  constructor(private api: Api, private router: Router) {}

  ngOnInit(): void {
    // 🔥 Fetch student details from DB
    this.api.getStudent(this.username).subscribe({
  next: (student) => {
    this.studentImageUrl = student?.imageUrl || null;
  },
  error: () => {
    this.studentImageUrl = null;
  }
});

  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}