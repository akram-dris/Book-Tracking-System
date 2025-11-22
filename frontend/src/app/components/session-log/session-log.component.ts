import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReadingSessionService } from '../../services/reading-session.service';
import { BookService } from '../../services/book.service';
import { ReadingGoalService } from '../../services/reading-goal.service';
import { CreateReadingSession } from '../../models/create-reading-session.model';
import { UpdateReadingSession } from '../../models/update-reading-session.model';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheckCircle, heroArrowLeft, heroCalendar, heroBookOpen, heroDocumentText } from '@ng-icons/heroicons/outline';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { StreakService } from '../../services/streak.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-session-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, MatDatepickerModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './session-log.component.html',
  styleUrls: ['./session-log.component.css'],
  viewProviders: [provideIcons({ heroCheckCircle, heroArrowLeft, heroCalendar, heroBookOpen, heroDocumentText })]
})
export class SessionLogComponent implements OnInit {
  bookId: number | null = null;
  readingGoal: GetReadingGoal | null = null;
  totalPages: number | null = null;
  maxDate = new Date();

  sessionForm: FormGroup;
  isLoading = false;
  currentPage: number = 0;
  progress: number = 0;
  currentPagesRead: number = 0;
  existingSession: GetReadingSession | null = null;
  allSessions: GetReadingSession[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private readingSessionService: ReadingSessionService,
    private bookService: BookService,
    private readingGoalService: ReadingGoalService,
    private streakService: StreakService,
    private notificationService: NotificationService
  ) {
    this.sessionForm = this.fb.group({
      pagesRead: [null, [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required],
      summary: ['']
    });
  }

  ngOnInit(): void {
    // Get bookId from route params
    this.route.params.subscribe(params => {
      this.bookId = +params['bookId'];
      if (this.bookId) {
        this.loadBookData();
      }
    });

    this.sessionForm.get('date')?.valueChanges.subscribe(date => {
      this.checkForExistingSession(date);
    });
  }

  loadBookData(): void {
    if (!this.bookId) return;

    // Fetch book details
    this.bookService.getBook(this.bookId).subscribe(book => {
      this.totalPages = book.totalPages;

      // Fetch reading goal for this book
      this.readingGoalService.getReadingGoalForBook(this.bookId!).subscribe({
        next: (goal) => {
          this.readingGoal = goal;
        },
        error: () => {
          // No reading goal, that's fine
        }
      });

      // Fetch all sessions to calculate current progress
      this.readingSessionService.getReadingSessionsForBook(this.bookId!).subscribe(sessions => {
        this.allSessions = sessions;
        this.currentPage = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
        if (this.totalPages && this.totalPages > 0) {
          this.progress = (this.currentPage / this.totalPages) * 100;
        }

        // Check for existing session for today's date
        this.checkForExistingSession(this.sessionForm.get('date')?.value);
        this.updatePagesReadValidator();
      });
    });

    // Subscribe to pagesRead changes
    this.sessionForm.get('pagesRead')?.valueChanges.subscribe(value => {
      this.currentPagesRead = value || 0;
    });
  }

  updatePagesReadValidator(): void {
    if (this.totalPages) {
      const remainingPages = this.totalPages - this.currentPage;
      // If editing, add back the current session's pages to the allowance
      const maxPages = this.existingSession ? remainingPages + this.existingSession.pagesRead : remainingPages;

      this.sessionForm.get('pagesRead')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(maxPages)
      ]);
      this.sessionForm.get('pagesRead')?.updateValueAndValidity({ emitEvent: false });
    }
  }

  checkForExistingSession(date: Date): void {
    if (!date || !this.allSessions) return;

    const dateStr = this.formatDate(new Date(date));
    this.existingSession = this.allSessions.find(session =>
      this.formatDate(new Date(session.date)) === dateStr
    ) || null;

    if (this.existingSession) {
      this.sessionForm.patchValue({
        pagesRead: this.existingSession.pagesRead,
        summary: this.existingSession.summary || ''
      }, { emitEvent: false });
      this.currentPagesRead = this.existingSession.pagesRead;
    }
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

  onCancel(): void {
    this.router.navigate(['/books', this.bookId]);
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
          pagesRead: sessionData.pagesRead, // Use the value from the form directly (it's the new total)
          summary: sessionData.summary // Use the summary from the form
        };
        this.readingSessionService.updateReadingSession(this.existingSession.id, updateSession).subscribe({
          next: () => {
            this.isLoading = false;
            this.streakService.forceReload();
            this.notificationService.showSuccess('Reading session updated successfully');
            this.router.navigate(['/books', this.bookId]);
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
            this.streakService.forceReload();
            this.notificationService.showSuccess('Reading session logged successfully');
            this.router.navigate(['/books', this.bookId]);
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
}