import { Component } from '@angular/core';
import { Api } from '../api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class Feedback {
  feedback = {
    company: '',
    category: '',
    subject: '',
    details: '',
    suggestions: '',
    anonymous: false,
    interviewRounds: null as number | null,
    interviewDescription: '',
    roundReached: '',
    interviewDifficulty: '',
    interviewDate: '',
    interviewOutcome: ''
  };

  constructor(private api: Api) {}

  submitFeedback(): void {
    const isInterviewValid = this.feedback.category !== 'interview' || (
      this.feedback.interviewRounds !== null && this.feedback.interviewRounds > 0 &&
      this.feedback.interviewDescription.trim().length > 0 &&
      this.feedback.roundReached.trim().length > 0 &&
      this.feedback.interviewDifficulty.trim().length > 0 &&
      this.feedback.interviewDate.trim().length > 0 &&
      this.feedback.interviewOutcome.trim().length > 0
    );

    if (
      this.feedback.company.trim().length > 0 &&
      this.feedback.category.trim().length > 0 &&
      this.feedback.subject.trim().length > 0 &&
      this.feedback.details.trim().length > 0 &&
      isInterviewValid
    ) {
      this.api.submitFeedback(this.feedback).subscribe({
        next: (response) => {
          alert('Thank you for your feedback!');
          this.feedback = {
            company: '',
            category: '',
            subject: '',
            details: '',
            suggestions: '',
            anonymous: false,
            interviewRounds: null,
            interviewDescription: '',
            roundReached: '',
            interviewDifficulty: '',
            interviewDate: '',
            interviewOutcome: ''
          };
        },
        error: (err) => {
          console.error('Failed to submit feedback:', err);
          alert('Failed to submit feedback. Please try again later.');
        }
      });
    } else {
      alert('Please fill in all required fields.');
    }
  }
}
