import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../api';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-drive-details',
  templateUrl: './admin-drive-details.html',
  styleUrls: ['./admin-drive-details.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
})
export class AdminDriveDetails implements OnInit {
  driveId!: number;
  drive: any = null;
  applications: any[] = [];
  errorMsg = '';

  constructor(private api: Api, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.driveId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.driveId)) {
      this.errorMsg = 'Invalid drive ID';
      return;
    }
    this.loadDriveDetails();
    this.loadApplications();
  }

  loadDriveDetails(): void {
    this.api.getDrives().subscribe(
      (drives) => {
        this.drive = drives.find((d) => d.id === this.driveId);
        if (!this.drive) this.errorMsg = 'Drive not found';
      },
      () => (this.errorMsg = 'Failed to load drive details')
    );
  }

  loadApplications(): void {
    this.api.getApplicationsForDrive(this.driveId).subscribe(
      (apps) => {
        const uniqueApps: any[] = [];
        const seenStudents = new Set<number>();
  
        for (const app of apps || []) {
          if (!seenStudents.has(app.studentId)) {
            uniqueApps.push(app);
            seenStudents.add(app.studentId);
          }
        }
  
        this.applications = uniqueApps;
        this.errorMsg = '';
      },
      () => (this.errorMsg = 'Failed to load applications')
    );
  }
  

  goBack(): void {
    this.router.navigate(['/admin/drives']);
  }
}
