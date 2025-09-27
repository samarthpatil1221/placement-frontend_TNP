// student-application.ts
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { Router } from '@angular/router';

type AppStatus = 'PENDING' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

// IMPURE pipes so they react to in-place object mutations (status changes)
@Pipe({ name:'statusCount', standalone:true, pure:false })
export class StatusCountPipe implements PipeTransform {
  transform(apps:any[], status:string){
    return (apps||[]).filter(a => (a?.status||'').toUpperCase() === (status||'').toUpperCase()).length;
  }
}

@Pipe({ name:'pendingCount', standalone:true, pure:false })
export class PendingCountPipe implements PipeTransform {
  transform(apps:any[]){
    return (apps||[]).filter(a => ['APPLIED','PENDING'].includes((a?.status||'').toUpperCase())).length;
  }
}

@Component({
  selector: 'app-student-applications',
  templateUrl: './student-application.html',
  styleUrl: './student-application.css',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusCountPipe, PendingCountPipe]
})
export class StudentApplications implements OnInit {
  applications: any[] = [];

  constructor(private api: Api, private router: Router) {}

  ngOnInit(){ this.loadApplications(); }

  newApplication(){ this.router.navigate(['/apply']); }

  loadApplications(){
    this.api.getStudentApplications().subscribe({
      next: (applications: any[]) => this.applications = applications,
      error: _ => this.router.navigate([''])
    });

    
  }

 

  dropdownValue(status: string): AppStatus {
    const s = (status || '').toUpperCase();
    if (s === 'APPLIED' || s === 'PENDING') return 'PENDING';
    if (s === 'SHORTLISTED') return 'SHORTLISTED';
    if (s === 'INTERVIEW') return 'INTERVIEW';
    if (s === 'SELECTED') return 'SELECTED';
    if (s === 'REJECTED') return 'REJECTED';
    return 'PENDING';
  }

  normalizeStudentStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'APPLIED') return 'PENDING';
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  onStatusSelectChange(app:any, event:Event){
    const value = (event.target as HTMLSelectElement | null)?.value;
    if (!value) return;
    const newValue = value.toUpperCase() as AppStatus;
    const allowed: AppStatus[] = ['PENDING','SHORTLISTED','INTERVIEW','SELECTED','REJECTED'];
    if (!allowed.includes(newValue)) return;

    this.api.updateMyApplicationStatus(app.id, { status: newValue }).subscribe({
      next: _ => {
        // mutate local item so impure pipes re-evaluate immediately
        app.status = newValue;
        // If using OnPush elsewhere, also replace reference to be extra safe:
        // this.applications = [...this.applications];
      },
      error: err => {
        console.error('Update status failed:', err);
        alert(err?.error?.error || 'Failed to update status');
      }
    });
  }

  

  
}
