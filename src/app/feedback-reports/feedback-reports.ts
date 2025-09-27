import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback-reports',
  templateUrl: './feedback-reports.html',
  styleUrls: ['./feedback-reports.css'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class FeedbackReports implements OnInit {
  feedbackList: any[] = [];

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.api.getAllFeedbacks().subscribe(feedbacks => {
      this.feedbackList = feedbacks;
    }, error => {
      console.error('Failed to load feedback reports', error);
    });
  }
}
