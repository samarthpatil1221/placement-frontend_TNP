import { Routes } from '@angular/router';
import { Home } from './home/home'; // login/register
import { Register } from './register/register';
import { StudentDashboard } from './student-dashboard/student-dashboard';
import { StudentProfile } from './student-profile/student-profile';
import { Drives } from './drives/drives';
import { AuthComponent } from './auth/auth';
import { AuthGuard } from './auth-guard/auth-guard';

import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminDrives } from './admin-drives/admin-drives';
import { AdminAddDrive } from './admin-add-drives/admin-add-drives';
import { AdminProfilePage } from './admin-profile-page/admin-profile-page';
import { AdminProfile } from './admin-profile/admin-profile';
import { AdminUsers } from './admin-users/admin-users';
import { AdminApplications } from './admin-applications/admin-applications';
import { AdminDriveDetails } from './admin-drive-details/admin-drive-details';
import { AdminEditDrive } from './admin-edit-drive/admin-edit-drive';
import { StudentLayoutComponent } from './student-layout-component/student-layout-component';
import { Feedback } from './feedback/feedback';
import { FeedbackReports } from './feedback-reports/feedback-reports';
import { StudentDrivesHistory } from './drive-history/drive-history';
import { StudentApplications } from './student-application/student-application';
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'drives', component: AdminDrives },
      { path: 'drives/add', component: AdminAddDrive },
      { path: 'admin-profile-page', component: AdminProfilePage },
      { path: 'applications', component: AdminApplications },
      { path: 'admin-profile', component: AdminProfile },
      { path: 'users', component: AdminUsers },
      { path: 'feedback-reports', component: FeedbackReports },
      

      { path: 'drives/:id', component: AdminDriveDetails },
      { path: 'drives/edit/:id', component: AdminEditDrive },
 // Drive details route
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '', component: Home },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },

  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      { path: 'dashboard', component: StudentDashboard },
      { path: 'student-profile', component: StudentProfile },
      { path: 'student-drives', component: Drives },
      { path: 'feedback', component: Feedback },
      { path: 'student-drives-history', component: StudentDrivesHistory },
      { path: 'student-application', component: StudentApplications },

      // add other student routes as children here
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'drives', component: Drives, canActivate: [AuthGuard] },
  { path: 'admin-application', component: AdminApplications, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
