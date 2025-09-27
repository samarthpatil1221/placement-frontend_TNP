import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './student-profile/student-profile';

@Injectable({ providedIn: 'root' })
export class Api {
  baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(this.baseUrl + '/auth/register', data, { withCredentials: true });
  }

  login(data: any) {
    return this.http.post(this.baseUrl + '/auth/login', data, { withCredentials: true });
  }

  logout() {
    return this.http.post(this.baseUrl + '/auth/logout', {}, { withCredentials: true });
  }
  // api.ts (or whatever your Angular service is called)
markDriveCompleted(driveId: number) {
  return this.http.put(`/api/drives/${driveId}/complete`, {}); // empty body
}

  getMe() {
    return this.http.get(this.baseUrl + '/auth/me', { withCredentials: true });
  }

  getProfile() {
    return this.http.get(this.baseUrl + '/student/profile', { withCredentials: true });
  }

  updateProfile(data: any) {
    return this.http.put(this.baseUrl + '/student/profile', data, { withCredentials: true });
  }

  uploadResume(data: FormData) {
    return this.http.post(this.baseUrl + '/student/profile/resume', data, { withCredentials: true });
  }

  getDrives() {
    return this.http.get<any[]>(this.baseUrl + '/drives', { withCredentials: true });
  }

  applyToDrive(driveId: number) {
    return this.http.post(this.baseUrl + `/drives/${driveId}/apply`, {}, { withCredentials: true });
  }

  getStudentApplications() {
    return this.http.get<any[]>(this.baseUrl + '/student/applications', { withCredentials: true });
  }

  getApplications() {
    return this.http.get<any[]>(this.baseUrl + '/admin/applications', { withCredentials: true });
  }

  getUsers() {
    return this.http.get<any[]>(this.baseUrl + '/admin/users', { withCredentials: true });
  }

  // Newly added method to delete a user by admin
  deleteUser(id: number) {
    return this.http.delete(`${this.baseUrl}/admin/users/${id}`, { withCredentials: true });
  }

  // Newly added for admin drive & application management

  createDrive(data: any) {
    return this.http.post(this.baseUrl + '/drives', data, { withCredentials: true });
  }

  getApplicationsForDrive(driveId: number) {
    return this.http.get<any[]>(this.baseUrl + `/admin/drives/${driveId}/applications`, { withCredentials: true });
  }

  updateApplicationStatus(applicationId: number, status: string) {
    return this.http.put(this.baseUrl + `/admin/applications/${applicationId}/status`, { status }, { withCredentials: true });
  }

  // Get current admin profile details
  getAdminProfile() {
    return this.http.get(this.baseUrl + '/admin/profile', { withCredentials: true });
  }

  // Update admin profile details
  updateAdminProfile(data: any) {
    return this.http.put(this.baseUrl + '/admin/profile', data, { withCredentials: true });
  }

  getCompanyApplicationStats() {
    return this.http.get<any[]>(this.baseUrl + '/admin/company-application-stats', { withCredentials: true });
  }
  getApplicationsByCompany(companyName: string) {
    return this.http.get<any[]>(`${this.baseUrl}/admin/applications/by-company?companyName=${encodeURIComponent(companyName)}`, { withCredentials: true });
  }
  getDrive(id: number) {
    return this.http.get<any>(`${this.baseUrl}/drives/${id}`, { withCredentials: true });
  }
  
  updateDrive(id: number, driveData: any) {
    return this.http.put<any>(`${this.baseUrl}/drives/${id}`, driveData, { withCredentials: true });
  }
  getDashboardStats() {
    return this.http.get<any>(this.baseUrl + '/dashboard/stats', { withCredentials: true });
  }
  
  getStudent(username: string): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/students/${username}`, { withCredentials: true });
  }
  
  getDashboardStats1() {
    return this.http.get<any>(this.baseUrl + '/dashboard/stats', { withCredentials: true });
  }
  
  getUpcomingUnappliedDrives() {
    return this.http.get<any[]>('http://localhost:8080/api/dashboard/student/upcoming-unapplied', { withCredentials: true });
  }
  submitFeedback(feedbackData: any) {
    return this.http.post(this.baseUrl + '/feed/feedback', feedbackData, { withCredentials: true });
  }
  
  getAllFeedbacks() {
    return this.http.get<any[]>(this.baseUrl + '/feed/admin/feedback-reports', { withCredentials: true });
  }
  getAppliedDriveIds() {
    return this.http.get<number[]>(this.baseUrl + '/dashboard/applied-drives/ids', { withCredentials: true });
  }

  // api.ts
updateMyApplicationStatus(applicationId: number, body: { status: string }) {
  return this.http.put(
    `${this.baseUrl}/dashboard/student/applications/${applicationId}/status`,
    body,
    { withCredentials: true }
  );
}



  }
  

