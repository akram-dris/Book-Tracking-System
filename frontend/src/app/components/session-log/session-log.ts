import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReadingSessionService } from '../../services/reading-session';
import { BookService } from '../../services/book';
import { ReadingGoalService } from '../../services/reading-goal';
import { CreateReadingSession } from '../../models/create-reading-session.model';
import { UpdateReadingSession } from '../../models/update-reading-session.model';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheckCircle, heroArrowLeft, heroCalendar, heroBookOpen, heroDocumentText, heroTrophy, heroMinus, heroPlus } from '@ng-icons/heroicons/outline';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { StreakService } from '../../services/streak';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-session-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, MatDatepickerModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './session-log.html',
  styleUrls: ['./session-log.css'],
  viewProviders: [provideIcons({ heroCheckCircle, heroArrowLeft, heroCalendar, heroBookOpen, heroDocumentText, heroTrophy, heroMinus, heroPlus })]
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
    private readingSessionService: ReadingSessionService,
    private bookService: BookService,
    private readingGoalService: ReadingGoalService,
    private streakService: StreakService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<SessionLogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bookId: number }
  ) {
    this.sessionForm = this.fb.group({
      pagesRead: [null, [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required],
      summary: ['']
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.bookId) {
      this.bookId = this.data.bookId;
      this.loadBookData();
    }

    this.sessionForm.get('date')?.valueChanges.subscribe(date => {
      this.checkForExistingSession(date);
    });
  }

  totalReadPages: number = 0;

  loadBookData(): void {
    if (!this.bookId) return;

    // Fetch book details
    this.bookService.getBook(this.bookId).subscribe({
      next: (bookResult) => {
        if (bookResult.isSuccess && bookResult.data) {
          const book = bookResult.data;
          this.totalPages = book.totalPages;

          // Fetch reading goal for this book
          this.readingGoalService.getReadingGoalForBook(this.bookId!).subscribe({
            next: (goalResult) => {
              if (goalResult.isSuccess && goalResult.data) {
                this.readingGoal = goalResult.data;
              }
            },
            error: () => {
              // No reading goal, that's fine
            }
          });

          // Fetch all sessions to calculate current progress
          this.readingSessionService.getReadingSessionsForBook(this.bookId!).subscribe({
            next: (sessionsResult) => {
              if (sessionsResult.isSuccess && sessionsResult.data) {
                const sessions = sessionsResult.data;
                this.allSessions = sessions;
                this.totalReadPages = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
                this.currentPage = this.totalReadPages;

                if (this.totalPages && this.totalPages > 0) {
                  this.progress = (this.currentPage / this.totalPages) * 100;
                }

                // Check for existing session for today's date
                this.checkForExistingSession(this.sessionForm.get('date')?.value);
                this.updatePagesReadValidator();
              } else {
                console.error('Error loading sessions:', sessionsResult.errors);
              }
            },
            error: (err) => {
              console.error('Error loading sessions:', err);
            }
          });
        } else {
          console.error('Error loading book:', bookResult.errors);
        }
      },
      error: (err) => {
        console.error('Error loading book:', err);
      }
    });

    // Subscribe to pagesRead changes
    this.sessionForm.get('pagesRead')?.valueChanges.subscribe(value => {
      this.currentPagesRead = value || 0;
    });
  }

  updatePagesReadValidator(): void {
    if (this.totalPages) {
      // Calculate remaining pages based on total read pages excluding current session if editing
      let basePagesRead = this.totalReadPages;
      if (this.existingSession) {
        basePagesRead -= this.existingSession.pagesRead;
      }

      const remainingPages = this.totalPages - basePagesRead;
      // The max pages allowed is the remaining pages (which implicitly allows the current session's pages if editing)
      const maxPages = remainingPages;

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
      // If editing, currentPage should be total pages read MINUS the pages from this session
      // so that the UI shows "Current: X" (before this session) and "After: X + NewValue"
      this.currentPage = this.totalReadPages - this.existingSession.pagesRead;
    } else {
      // If not editing (new session), currentPage is just the total read so far
      this.currentPage = this.totalReadPages;
    }

    // Recalculate progress based on the updated currentPage
    if (this.totalPages && this.totalPages > 0) {
      this.progress = (this.currentPage / this.totalPages) * 100;
    } else {
      this.progress = 0;
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

  adjustPages(delta: number): void {
    const currentValue = this.sessionForm.get('pagesRead')?.value || 0;
    const newValue = Math.max(1, currentValue + delta);

    // Get max pages allowed from validator
    if (this.totalPages) {
      let basePagesRead = this.totalReadPages;
      if (this.existingSession) {
        basePagesRead -= this.existingSession.pagesRead;
      }
      const maxPages = this.totalPages - basePagesRead;

      // Only update if within valid range
      if (newValue <= maxPages) {
        this.sessionForm.patchValue({ pagesRead: newValue });
      }
    } else {
      this.sessionForm.patchValue({ pagesRead: newValue });
    }
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
    this.dialogRef.close();
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

      // Check if this session will complete the book
      const willCompleteBook = this.totalPages &&
        (this.currentPage + this.currentPagesRead >= this.totalPages);

      if (this.existingSession) {
        // Update existing session
        const updateSession: UpdateReadingSession = {
          bookId: sessionData.bookId,
          date: sessionData.date,
          pagesRead: sessionData.pagesRead, // Use the value from the form directly (it's the new total)
          summary: sessionData.summary // Use the summary from the form
        };
        this.readingSessionService.updateReadingSession(this.existingSession.id, updateSession).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.isLoading = false;
              this.streakService.forceReload();

              if (willCompleteBook) {
                this.notificationService.showSuccess('🎉 Congratulations! You completed the book!');
              } else {
                this.notificationService.showSuccess('Reading session updated successfully');
              }

              this.dialogRef.close(true);
            } else {
              this.isLoading = false;
              console.error('Error updating reading session', result.errors);
              this.notificationService.showError('Failed to update reading session');
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error updating reading session', err);
            this.notificationService.showError('Failed to update reading session');
          }
        });
      } else {
        // Add new session
        const newSession: CreateReadingSession = sessionData;
        this.readingSessionService.addReadingSession(newSession).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.isLoading = false;
              this.streakService.forceReload();

              if (willCompleteBook) {
                this.notificationService.showSuccess('🎉 Congratulations! You completed the book!');
              } else {
                this.notificationService.showSuccess('Reading session logged successfully');
              }

              this.dialogRef.close(true);
            } else {
              this.isLoading = false;
              console.error('Error logging reading session', result.errors);
              this.notificationService.showError('Failed to log reading session');
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error logging reading session', err);
            if (err.status === 409) {
              this.notificationService.showError('A reading session for this book on this date already exists');
            } else {
              this.notificationService.showError('Failed to log reading session');
            }
          }
        });
      }
    }
  }
}