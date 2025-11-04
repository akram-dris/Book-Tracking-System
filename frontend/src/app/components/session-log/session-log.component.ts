import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReadingSessionService } from '../../services/reading-session.service';
import { CreateReadingSession } from '../../models/create-reading-session.model';
import { UpdateReadingSession } from '../../models/update-reading-session.model';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheckCircle } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-session-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './session-log.component.html',
  styleUrls: ['./session-log.component.css'],
  viewProviders: [provideIcons({ heroCheckCircle })]
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
  existingSession: GetReadingSession | null = null; // New property

  constructor(
    private fb: FormBuilder,
    private readingSessionService: ReadingSessionService
  ) {
    this.sessionForm = this.fb.group({
      pagesRead: [null, [Validators.required, Validators.min(1)]],
      date: [this.formatDate(new Date()), Validators.required],
      summary: ['']
    });
  }

  ngOnInit(): void {
    console.log('SessionLogComponent ngOnInit - bookId:', this.bookId, 'readingGoal:', this.readingGoal, 'totalPages:', this.totalPages);
    if (this.bookId) {
      // Fetch all sessions to calculate current progress
      this.readingSessionService.getReadingSessionsForBook(this.bookId).subscribe(sessions => {
        this.currentPage = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
        if (this.totalPages && this.totalPages > 0) {
          this.progress = (this.currentPage / this.totalPages) * 100;
        }
        console.log('SessionLogComponent ngOnInit - currentPage:', this.currentPage, 'progress:', this.progress);
      });

      // Check for existing session for today's date
      const today = this.formatDate(new Date());
      this.readingSessionService.getReadingSessionsForBook(this.bookId).subscribe(sessions => {
        this.existingSession = sessions.find(session => this.formatDate(new Date(session.date)) === today) || null;

        if (this.existingSession) {
          this.sessionForm.patchValue({
            pagesRead: null, // User will enter additional pages
            date: this.formatDate(new Date(this.existingSession.date)),
            summary: this.existingSession.summary || ''
          });
          this.currentPagesRead = this.existingSession.pagesRead; // Keep track of total pages read for goal feedback
        }
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
      const sessionData = {
        bookId: this.bookId,
        date: new Date(this.sessionForm.value.date),
        pagesRead: this.sessionForm.value.pagesRead,
        summary: this.sessionForm.value.summary
      };

      if (this.existingSession) {
        // Update existing session
        const updateSession: UpdateReadingSession = {
          bookId: sessionData.bookId,
          date: sessionData.date,
          pagesRead: this.existingSession.pagesRead + (sessionData.pagesRead || 0), // Aggregate pages
          summary: sessionData.summary // Use the summary from the form
        };
        this.readingSessionService.updateReadingSession(this.existingSession.id, updateSession).subscribe({
          next: () => {
            this.isLoading = false;
            this.sessionSaved.emit();
            this.close.emit();
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error updating reading session', err);
            alert('Failed to update reading session. Please try again.');
          }
        });
      } else {
        // Add new session
        const newSession: CreateReadingSession = sessionData;
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
  }

  onCancel(): void {
    this.close.emit();
  }
}