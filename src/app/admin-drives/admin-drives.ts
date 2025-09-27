import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../api';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-admin-drives',
  templateUrl: './admin-drives.html',
  styleUrls: ['./admin-drives.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule
  ],
})
export class AdminDrives implements OnInit {
  drives: any[] = [];
  filteredDrives: any[] = [];
  completedDrives: any[] = [];
  filterForm: FormGroup;

  constructor(private api: Api, private router: Router, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      start: [null],
      end: [null]
    });
  }

  ngOnInit() {
    this.api.getDrives().subscribe(async drives => {
      const completedIds: number[] = JSON.parse(localStorage.getItem('completedDrives') || '[]');
  
      for (const drive of drives) {
        try {
          const apps: any[] = (await this.api.getApplicationsForDrive(drive.id).toPromise()) || [];
  
          // Filter duplicates
          const uniqueApps: any[] = [];
          const seenStudents = new Set<number>();
          for (const app of apps) {
            if (!seenStudents.has(app.studentId)) {
              uniqueApps.push(app);
              seenStudents.add(app.studentId);
            }
          }
  
          drive.applications = uniqueApps;
          drive.applicationCount = uniqueApps.length;
        } catch {
          drive.applications = [];
          drive.applicationCount = 0;
        }
  
        drive.completed = completedIds.includes(drive.id);
      }
  
      // Split drives
      this.completedDrives = drives.filter(d => d.completed);
      this.drives = drives;
      this.filteredDrives = drives.filter(d => !d.completed);
    });
  }
  
  setThisMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.filterForm.patchValue({ start, end });
    this.applyDateFilter();
  }

  setNextMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    this.filterForm.patchValue({ start, end });
    this.applyDateFilter();
  }

  clearDateFilter() {
    this.filterForm.patchValue({ start: null, end: null });
    this.filteredDrives = [...this.drives];
  }

  applyDateFilter() {
    const { start, end } = this.filterForm.value;
    if (!start || !end) {
      this.filteredDrives = [...this.drives];
      return;
    }
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    this.filteredDrives = this.drives.filter(drive => {
      const driveDate = new Date(drive.dateOfDrive);
      return driveDate >= startDate && driveDate <= endDate && !drive.completed;
    });
  }

  async exportToPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Filtered Drives Report', 14, 20);

    let y = 30;
    for (const drive of this.filteredDrives) {
      doc.setFontSize(12);
      doc.text(`Company: ${drive.companyName}`, 14, y);
      y += 6;
      doc.text(`Date: ${new Date(drive.dateOfDrive).toLocaleDateString()}`, 14, y);
      y += 6;
      doc.text(`Location: ${drive.location}`, 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`Job Description: ${drive.jd.length > 100 ? drive.jd.substring(0, 100) + '...' : drive.jd}`, 14, y);
      y += 10;

      try {
        const applications = drive.applications || [];
        if (applications.length > 0) {
          autoTable(doc, {
            startY: y,
            head: [['Applicant', 'Status']],
            body: applications.map((a: any) => [a.studentName || 'Unknown', a.status || '']),
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 10 },
          });
          y = (doc as any).lastAutoTable.finalY + 10;
        } else {
          doc.text('No applications for this drive.', 14, y);
          y += 10;
        }
      } catch (error) {
        doc.text('Failed to load applications.', 14, y);
        y += 10;
      }

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save('filtered-drives-report.pdf');
  }

  // --- New: Export Completed Drives ---
  exportCompletedToPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Completed Drives Report', 14, 20);

    let y = 30;
    for (const drive of this.completedDrives) {
      doc.setFontSize(12);
      doc.text(`Company: ${drive.companyName}`, 14, y);
      y += 6;
      doc.text(`Date: ${new Date(drive.dateOfDrive).toLocaleDateString()}`, 14, y);
      y += 6;
      doc.text(`Location: ${drive.location}`, 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`Job Description: ${drive.jd.length > 100 ? drive.jd.substring(0, 100) + '...' : drive.jd}`, 14, y);
      y += 10;

      try {
        const applications = drive.applications || [];
        if (applications.length > 0) {
          autoTable(doc, {
            startY: y,
            head: [['Applicant', 'Status']],
            body: applications.map((a: any) => [a.studentName || 'Unknown', a.status || '']),
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { fontSize: 10 },
          });
          y = (doc as any).lastAutoTable.finalY + 10;
        } else {
          doc.text('No applications for this drive.', 14, y);
          y += 10;
        }
      } catch (error) {
        doc.text('Failed to load applications.', 14, y);
        y += 10;
      }

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save('completed-drives-report.pdf');
  }

  exportCompletedToExcel() {
    const data: any[] = [];

    this.completedDrives.forEach(drive => {
      if (drive.applications && drive.applications.length > 0) {
        drive.applications.forEach((app:any) => {
          data.push({
            'Company': drive.companyName,
            'Date': new Date(drive.dateOfDrive).toLocaleDateString(),
            'Location': drive.location,
            'Job Description': drive.jd,
            'Applicant': app.studentName || 'Unknown',
            'Status': app.status || ''
          });
        });
      } else {
        data.push({
          'Company': drive.companyName,
          'Date': new Date(drive.dateOfDrive).toLocaleDateString(),
          'Location': drive.location,
          'Job Description': drive.jd,
          'Applicant': 'No applications',
          'Status': ''
        });
      }
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Completed Drives');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'completed-drives-report.xlsx');
  }

  navigateAddDrive() {
    this.router.navigate(['/admin/drives/add']);
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  openDriveDetails(drive: any) {
    this.router.navigate(['/admin/drives', drive.id]);
  }

  editDrive(drive: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/admin/drives/edit', drive.id]);
  }

  markAsCompleted(drive: any, event: Event) {
    event.stopPropagation();
  
    drive.completed = true;
  
    const completedIds: number[] = JSON.parse(localStorage.getItem('completedDrives') || '[]');
    if (!completedIds.includes(drive.id)) completedIds.push(drive.id);
    localStorage.setItem('completedDrives', JSON.stringify(completedIds));
  
    this.filteredDrives = this.filteredDrives.filter(d => d.id !== drive.id);
    this.completedDrives.push(drive);
  }

  unmarkAsCompleted(drive: any, event: Event) {
    event.stopPropagation();
    this.completedDrives = this.completedDrives.filter(d => d.id !== drive.id);
    this.filteredDrives.push(drive);
    drive.completed = false;

    const completedIds: number[] = JSON.parse(localStorage.getItem('completedDrives') || '[]');
    const updatedIds = completedIds.filter(id => id !== drive.id);
    localStorage.setItem('completedDrives', JSON.stringify(updatedIds));

    this.filteredDrives.sort((a, b) => new Date(a.dateOfDrive).getTime() - new Date(b.dateOfDrive).getTime());
  }
}
