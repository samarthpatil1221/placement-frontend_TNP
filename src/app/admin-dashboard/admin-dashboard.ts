import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';
import { Api } from '../api';
import { AdminProfile } from '../admin-profile/admin-profile';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    BaseChartDirective,
    MatMenuModule,
    
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AdminDashboard implements OnInit {
  sidebarOpen = true;
  totalDrives = 0;
  totalApplications = 0;
  totalUsers = 0;
  adminUsername = '';
  companyLabels: string[] = [];
  appliedData: number[] = [];
  notAppliedData: number[] = [];
  companyBarData: any[] = [];
  upcomingDrives: any[] = [];
  companyBarChartType = 'bar' as const;
  companyStats: any[] = [];
  totalApplied = 0;
  totalNotApplied = 0;
  placementRate = 78;

  sortOption = 'alphabetical';
  sortedCompanyStats: any[] = [];

  applicationStatusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: 65,
    plugins: {
      legend: { display: false }
    }
  };

  companyBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'right' as const } },
    scales: {
      x: { ticks: { font: { size: 14 } }, grid: { display: false }, stacked: true },
      y: { beginAtZero: true, ticks: { font: { size: 14 } }, stacked: true }
    }
  };

  applicationStatusData: ChartData<'doughnut'> = {
    labels: ['Applied', 'Not Applied', 'Shortlisted', 'Selected', 'Rejected'],
    datasets: [{
      data: [],
      backgroundColor: ['#4285f4', '#fbbc04', '#ff9800', '#34a853', '#ea4335'],
      borderWidth: 0
    }]
  };
  applicationStatusChartType = 'doughnut' as const;

  constructor(private api: Api, private router: Router) {}

  ngOnInit(): void {
    const completedIds: number[] = JSON.parse(localStorage.getItem('completedDrives') || '[]');

    this.api.getDrives().subscribe(drives => {
      this.totalDrives = drives.length;
      this.upcomingDrives = drives
        .filter(d => new Date(d.dateOfDrive) >= new Date())
        .sort((a, b) => new Date(a.dateOfDrive).getTime() - new Date(b.dateOfDrive).getTime())
        .map(drive => {
          const countdown = this.getCountdownDays(drive.dateOfDrive);
          return {
            ...drive,
            countdown,
            countdownPercent: Math.min(100, (15 - countdown) * (100 / 15)),
            isUrgent: countdown > 0 && countdown <= 5,
            initials: drive.companyName ? drive.companyName[0].toUpperCase() : 'C',
            companyShort: drive.companyShort || drive.companyName
          };
        });
    });

    
    // Deduplicate applications and exclude completed drives
    this.api.getApplications().subscribe(apps => {
      const dedupedApps = apps.filter(
        (app, index, self) =>
          index === self.findIndex(a =>
            a.student?.email === app.student?.email &&
            a.drive?.companyName === app.drive?.companyName &&
            a.drive?.dateOfDrive === app.drive?.dateOfDrive
          )
      );
      const activeApps = dedupedApps.filter(app => !completedIds.includes(app.drive?.id));
      this.totalApplications = activeApps.length;
    });

    this.api.getUsers().subscribe(users => {
      const studentUsers = users.filter((u: any) =>
        u.roles?.some((r: any) => r.name === 'STUDENT')
      );
      this.totalUsers = studentUsers.length;
    });

    this.api.getMe().subscribe(user => this.adminUsername = (user as any).username);

    this.loadCompanyApplicationStats();
  }

  loadCompanyApplicationStats() {
    const completedIds: number[] = JSON.parse(localStorage.getItem('completedDrives') || '[]');

    this.api.getApplications().subscribe(apps => {
      const dedupedApps = apps.filter(
        (app, index, self) =>
          index === self.findIndex(a =>
            a.student?.email === app.student?.email &&
            a.drive?.companyName === app.drive?.companyName &&
            a.drive?.dateOfDrive === app.drive?.dateOfDrive
          )
      );

      // Exclude completed drives
      const activeApps = dedupedApps.filter(app => !completedIds.includes(app.drive?.id));

      const statsMap: { [company: string]: { appliedCount: number; notAppliedCount: number } } = {};
      activeApps.forEach(app => {
        const company = app.drive?.companyName || 'Unknown';
        if (!statsMap[company]) statsMap[company] = { appliedCount: 0, notAppliedCount: 0 };
        if (app.status?.toUpperCase() === 'APPLIED') statsMap[company].appliedCount++;
        else statsMap[company].notAppliedCount++;
      });

      let totalAppliedSum = 0;
      let totalNotAppliedSum = 0;
      this.companyStats = Object.keys(statsMap).map(company => {
        const { appliedCount, notAppliedCount } = statsMap[company];
        totalAppliedSum += appliedCount;
        totalNotAppliedSum += notAppliedCount;
        const total = (appliedCount + notAppliedCount) || 1;
        return {
          companyName: company,
          appliedCount,
          notAppliedCount,
          appliedPercent: (appliedCount / total) * 100,
          notAppliedPercent: ((this.totalUsers-appliedCount) / total) * 100
        };
      });

      this.totalApplied = totalAppliedSum;
      this.totalNotApplied = totalNotAppliedSum;

      const shortlisted = 89;
      const selected = 45;
      const rejected = 67;
      this.applicationStatusData.datasets[0].data = [
        this.totalApplied,
        this.totalNotApplied,
        shortlisted,
        selected,
        rejected
      ];

      this.companyLabels = this.companyStats.map(c => c.companyName);
      this.appliedData = this.companyStats.map(c => c.appliedCount);
      this.notAppliedData = this.companyStats.map(c => c.notAppliedCount);

      this.companyBarData = [
        { data: this.appliedData, label: 'Applied', backgroundColor: '#00bcd4' },
        { data: this.notAppliedData, label: 'Not Applied', backgroundColor: '#ff4081' }
      ];

      this.applySort();
    }, error => {
      console.error('Failed to load company application stats', error);
    });
  }

  applySort() {
    if (this.sortOption === 'alphabetical') {
      this.sortedCompanyStats = [...this.companyStats].sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (this.sortOption === 'mostApplied') {
      this.sortedCompanyStats = [...this.companyStats].sort((a, b) => b.appliedCount - a.appliedCount);
    } else if (this.sortOption === 'mostNotApplied') {
      this.sortedCompanyStats = [...this.companyStats].sort((a, b) => b.notAppliedCount - a.notAppliedCount);
    } else {
      this.sortedCompanyStats = this.companyStats;
    }
  }

  showNotAppliedForCompany(companyName: string) {
    console.log('Show not applied for:', companyName);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  isUrgent(dateStr: string): boolean {
    const driveDate = new Date(dateStr);
    const today = new Date();
    const diffTime = driveDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 5;
  }

  getCountdownDays(dateStr: string): number {
    const driveDate = new Date(dateStr);
    const today = new Date();
    const diffTime = driveDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  goToDrives() {
    this.router.navigate(['/admin/drives']);
  }

  showApplicationsForCompany(companyName: string) {
    this.router.navigate(['/admin/drives'], { queryParams: { company: companyName } });
  }
}
