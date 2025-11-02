import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReadingSessionService } from '../../services/reading-session.service';
import { CreateReadingSession } from '../../models/create-reading-session.model';
import { GetReadingGoal } from '../../models/get-reading-goal.model';

@Component({
  selector: 'app-session-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './session-log.component.html',
  styleUrls: ['./session-log.component.css']
})
export class SessionLogComponent implements OnInit {
  @Input() bookId: number | null = null;
  @Input() readingGoal: GetReadingGoal | null = null;
  @Input() totalPages: number | null = null;
  @Output() sessionSaved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  sessionForm: FormGroup;
  isLoading = false;
  currentPage: number = 0; // To be calculated
  progress: number = 0; // To be calculated
  currentPagesRead: number = 0; // New property to track pages read input

  constructor(
    private fb: FormBuilder,
    private readingSessionService: ReadingSessionService
  ) {
    this.sessionForm = this.fb.group({
      pagesRead: [null, [Validators.required, Validators.min(1)]],
      sessionDate: [this.formatDate(new Date()), Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('SessionLogComponent ngOnInit - bookId:', this.bookId, 'readingGoal:', this.readingGoal, 'totalPages:', this.totalPages);
    if (this.bookId) {
      this.readingSessionService.getReadingSessionsForBook(this.bookId).subscribe(sessions => {
        this.currentPage = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
        if (this.totalPages && this.totalPages > 0) {
          this.progress = (this.currentPage / this.totalPages) * 100;
        }
        console.log('SessionLogComponent ngOnInit - currentPage:', this.currentPage, 'progress:', this.progress);
      });
    }

    // Subscribe to pagesRead changes to update visual feedback
    this.sessionForm.get('pagesRead')?.valueChanges.subscribe(value => {
      this.currentPagesRead = value || 0;
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  getGoalLevelClass(goalLevel: 'low' | 'medium' | 'high'): string {
    if (!this.readingGoal) {
      return '';
    }

    const pagesRead = this.currentPagesRead;
    let classes = '';

    if (goalLevel === 'high') {
      if (pagesRead >= this.readingGoal.highGoal) {
        classes += 'font-bold text-red-500';
      } else {
        classes += 'text-gray-400';
      }
    } else if (goalLevel === 'medium') {
      if (pagesRead >= this.readingGoal.mediumGoal && pagesRead < this.readingGoal.highGoal) {
        classes += 'font-bold text-blue-500';
      } else {
        classes += 'text-gray-400';
      }
    } else if (goalLevel === 'low') {
      if (pagesRead >= this.readingGoal.lowGoal && pagesRead < this.readingGoal.mediumGoal) {
        classes += 'font-bold text-green-500';
      } else {
        classes += 'text-gray-400';
      }
    }
    return classes;
  }

  onSubmit(): void {
    if (this.sessionForm.valid && this.bookId) {
      this.isLoading = true;
      const newSession: CreateReadingSession = {
        bookId: this.bookId,
        sessionDate: new Date(this.sessionForm.value.sessionDate),
        pagesRead: this.sessionForm.value.pagesRead
      };

      this.readingSessionService.addReadingSession(newSession).subscribe({
        next: () => {
          this.isLoading = false;
          this.sessionSaved.emit();
          this.close.emit();
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error logging reading session', err);
          if (err.status === 409) {
            alert('A reading session for this book on this date already exists.');
          } else {
            alert('Failed to log reading session. Please try again.');
          }
        }
      });
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}