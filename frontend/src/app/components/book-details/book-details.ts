
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book';
import { ReadingSessionService } from '../../services/reading-session';
import { ReadingGoalService } from '../../services/reading-goal';
import { GetBook } from '../../models/get-book.model';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { PlanAndGoalModalComponent } from '../plan-and-goal-modal/plan-and-goal-modal';
import { ReadingLogModalComponent } from '../reading-log-modal/reading-log-modal';
import { RatingModalComponent } from '../rating-modal/rating-modal';
import { RatingModule } from 'primeng/rating';
import { QuillModule } from 'ngx-quill';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
// import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';
import { NotificationService } from '../../services/notification';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  heroArrowLeft,
  heroPencil,
  heroTrash,
  heroBookOpen,
  heroChartBar,
  heroDocumentText,
  heroClipboardDocumentList,
  heroPlus,
  heroCalendar,
  heroCheckCircle,
  heroTag,
  heroXMark,
  heroStar
} from '@ng-icons/heroicons/outline';

type TabType = 'overview' | 'notes' | 'sessions' | 'statistics';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PlanAndGoalModalComponent,
    ReadingLogModalComponent,
    RatingModalComponent,
    RatingModule,
    QuillModule,
    NgIconComponent,
    MatButtonModule
  ],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css'],
  viewProviders: [
    provideIcons({
      heroArrowLeft,
      heroPencil,
      heroTrash,
      heroBookOpen,
      heroChartBar,
      heroDocumentText,
      heroClipboardDocumentList,
      heroPlus,
      heroCalendar,
      heroCheckCircle,
      heroTag,
      heroXMark,
      heroStar
    })
  ]
})
export class BookDetailsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  book: GetBook | undefined;
  readingSessions: GetReadingSession[] = [];
  readingGoal: GetReadingGoal | null = null;
  rootUrl = environment.rootUrl;
  ReadingStatus = ReadingStatus;
  isPlanAndGoalModalOpen: boolean = false;
  isReadingLogModalOpen: boolean = false;
  currentBookId: number | null = null;
  currentPage: number = 0;
  progress: number = 0;
  isSummaryMode: boolean = false;
  isEditingSummary: boolean = false;
  summaryForm: FormGroup;

  // New properties for tabs
  activeTab: TabType = 'overview';

  // Notes editor
  isEditingNotes: boolean = false;
  notesForm: FormGroup;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ]
  };

  // Note detail modal
  selectedSession: GetReadingSession | null = null;
  isNoteDetailModalOpen: boolean = false;

  // Rating modal
  isRatingModalOpen = false;
  isEditingRating = false;
  tempRating: number | null = null;
  tempCoverRating: number | null = null; // Temporary rating for cover overlay

  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private readingSessionService: ReadingSessionService,
    private readingGoalService: ReadingGoalService,
    private location: Location,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.summaryForm = this.fb.group({
      summary: ['', Validators.required]
    });
    this.notesForm = this.fb.group({
      summary: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.refreshBookData();
  }

  refreshBookData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('BookDetailsComponent refreshBookData - Route ID:', id);
    if (id) {
      this.isLoading = true;
      this.bookService.getBook(+id).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.book = result.data;
            this.currentBookId = this.book.id; // Assign book.id to currentBookId
            if (this.book.summary) {
              this.summaryForm.patchValue({ summary: this.book.summary });
            }
            console.log('BookDetailsComponent refreshBookData - book loaded:', this.book);

            // Initialize temporary rating if book has no rating
            if ((this.book.status === ReadingStatus.Completed || this.book.status === ReadingStatus.Summarized) && !this.book.rating) {
              this.tempCoverRating = null;
            }

            // Load other data in parallel-ish (nested subscriptions for now)
            this.readingSessionService.getReadingSessionsForBook(+id).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
              next: sessionResult => {
                if (sessionResult.isSuccess && sessionResult.data) {
                  this.readingSessions = sessionResult.data;
                  this.calculateProgress(); // Calculate progress after sessions are loaded
                  console.log('BookDetailsComponent refreshBookData - readingSessions loaded:', this.readingSessions);
                } else {
                  // Handle specific error cases if needed, or just log
                  if (sessionResult.errors && sessionResult.errors.some(e => e.includes('404'))) {
                    console.log('BookDetailsComponent refreshBookData - No reading sessions found for bookId:', id);
                    this.readingSessions = [];
                    this.calculateProgress();
                  } else {
                    console.error('BookDetailsComponent refreshBookData - Error fetching reading sessions:', sessionResult.errors);
                    this.readingSessions = [];
                    this.calculateProgress();
                  }
                }
              },
              error: err => {
                console.error('BookDetailsComponent refreshBookData - Error fetching reading sessions:', err);
                this.readingSessions = [];
                this.calculateProgress();
              }
            });

            this.readingGoalService.getReadingGoalForBook(+id).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
              next: goalResult => {
                if (goalResult.isSuccess && goalResult.data) {
                  this.readingGoal = goalResult.data;
                  console.log('BookDetailsComponent refreshBookData - readingGoal loaded:', this.readingGoal);
                } else {
                  if (goalResult.errors && goalResult.errors.some(e => e.includes('404'))) {
                    console.log('BookDetailsComponent refreshBookData - No reading goal found for bookId:', id);
                    this.readingGoal = null;
                  } else {
                    console.error('BookDetailsComponent refreshBookData - Error fetching reading goal:', goalResult.errors);
                    this.readingGoal = null;
                  }
                }
              },
              error: err => {
                console.error('BookDetailsComponent refreshBookData - Error fetching reading goal:', err);
                this.readingGoal = null;
              }
            });
          } else {
            console.error('Error loading book:', result.errors);
            this.notificationService.showError('Failed to load book details');
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading book:', err);
          this.isLoading = false;
        }
      });
    }
  }

  toggleSummaryMode(): void {
    this.isSummaryMode = !this.isSummaryMode;
    if (!this.isSummaryMode) {
      this.isEditingSummary = false;
      this.summaryForm.reset();
      if (this.book?.summary) {
        this.summaryForm.patchValue({ summary: this.book.summary });
      }
    }
  }

  createSummary(): void {
    this.isSummaryMode = true;
    this.isEditingSummary = true;
    this.summaryForm.reset();
  }

  editSummary(): void {
    this.isEditingSummary = true;
  }

  cancelSummaryEdit(): void {
    this.isEditingSummary = false;
    if (this.book?.summary) {
      this.summaryForm.patchValue({ summary: this.book.summary });
    } else {
      this.summaryForm.reset();
    }
  }

  saveSummary(): void {
    console.log('saveSummary called');
    console.log('summaryForm valid:', this.summaryForm.valid);
    console.log('book exists:', !!this.book);
    if (this.summaryForm.valid && this.book) {
      const summaryText = this.summaryForm.get('summary')?.value;
      const startedDate = this.book.startedReadingDate ? new Date(this.book.startedReadingDate) : undefined;

      // Update UI optimistically
      this.book.status = ReadingStatus.Summarized;
      this.book.completedDate = new Date();
      this.book.summary = summaryText;
      this.isEditingSummary = false;

      this.bookService.updateBookStatus(this.book.id, ReadingStatus.Summarized, startedDate, new Date(), summaryText).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.isSuccess) {
          console.log('BookDetailsComponent saveSummary - Book summary updated');
          this.notificationService.showSuccess(`Book '${this.book!.title}' is now Summarized`);
        } else {
          console.error('Error updating book summary:', result.errors);
          this.notificationService.showError('Failed to update book summary');
        }
      });
    }
  }

  showSummary(): void {
    this.isSummaryMode = true;
    this.isEditingSummary = false;
  }

  startReading(): void {
    console.log('BookDetailsComponent startReading - book:', this.book);
    if (this.book) {
      // Update UI optimistically
      this.book.status = ReadingStatus.CurrentlyReading;
      this.book.startedReadingDate = new Date();

      this.bookService.updateBookStatus(this.book.id, ReadingStatus.CurrentlyReading, new Date()).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.isSuccess) {
          console.log('BookDetailsComponent startReading - Book status updated to CurrentlyReading, navigating to set-goal');
          this.notificationService.showSuccess(`Book '${this.book!.title}' is now Currently Reading`);
          this.router.navigate(['/books', this.book!.id, 'set-goal']);
        } else {
          console.error('Error updating book status:', result.errors);
          this.notificationService.showError('Failed to start reading');
        }
      });
    }
  }

  openPlanAndGoalModal(): void {
    console.log('BookDetailsComponent openPlanAndGoalModal - currentBookId:', this.currentBookId);
    if (this.currentBookId) {
      this.isPlanAndGoalModalOpen = true;
    } else {
      console.error('BookDetailsComponent openPlanAndGoalModal - Cannot open Plan and Goal modal: currentBookId is null/undefined.');
    }
  }

  closePlanAndGoalModal(): void {
    console.log('BookDetailsComponent closePlanAndGoalModal');
    this.isPlanAndGoalModalOpen = false;
  }

  handlePlanAndGoalSaved(): void {
    console.log('BookDetailsComponent handlePlanAndGoalSaved - Plan and Goal saved, refreshing data for bookId:', this.book?.id);

    // Update book status optimistically for immediate UI feedback
    if (this.book) {
      this.book.status = ReadingStatus.Planning;
    }

    this.closePlanAndGoalModal();
    this.refreshBookData(); // Refresh all book-related data
  }

  openAddSessionModal(): void {
    console.log('BookDetailsComponent openAddSessionModal - Navigating to session log for bookId:', this.currentBookId);
    this.router.navigate(['/books', this.currentBookId, 'session', 'log']);
  }

  startReadingFromPlanning(): void {
    console.log('BookDetailsComponent startReadingFromPlanning - book:', this.book);
    if (this.book) {
      const startDate = this.book.startedReadingDate ? new Date(this.book.startedReadingDate) : new Date();

      // Update UI optimistically
      this.book.status = ReadingStatus.CurrentlyReading;
      this.book.startedReadingDate = startDate;

      this.bookService.updateBookStatus(this.book.id, ReadingStatus.CurrentlyReading, startDate).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.isSuccess) {
          console.log('BookDetailsComponent startReadingFromPlanning - Book status updated to CurrentlyReading with date:', startDate);
          this.notificationService.showSuccess(`Book '${this.book!.title}' is now Currently Reading`);
          // No navigation needed, stay on the same page
        } else {
          console.error('Error updating book status:', result.errors);
          this.notificationService.showError('Failed to start reading');
        }
      });
    }
  }

  markAsCompleted(): void {
    console.log('BookDetailsComponent markAsCompleted - book:', this.book);
    if (this.book) {
      // Open rating modal instead of immediately marking as completed
      this.isRatingModalOpen = true;
    }
  }

  // Rating modal handlers
  openRatingModal(): void {
    this.isRatingModalOpen = true;
  }

  closeRatingModal(): void {
    this.isRatingModalOpen = false;
  }

  saveRating(rating: number): void {
    console.log('BookDetailsComponent saveRating - rating:', rating);
    if (this.book) {
      // Save rating to book object
      this.book.rating = rating;

      // Update UI optimistically
      if (this.book.status !== ReadingStatus.Completed && this.book.status !== ReadingStatus.Summarized) {
        this.book.status = ReadingStatus.Completed;
        this.book.completedDate = new Date();
      }
      this.isSummaryMode = true;
      this.isEditingSummary = true;

      // Close rating modal
      this.isRatingModalOpen = false;

      // Update book status with rating
      this.bookService.updateBookStatus(
        this.book.id,
        ReadingStatus.Completed,
        this.book.startedReadingDate,
        this.book.completedDate,
        undefined,
        rating
      ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.isSuccess) {
          console.log('BookDetailsComponent saveRating - Book status updated to Completed with rating');
          this.notificationService.showSuccess(`Book '${this.book!.title}' is now Completed with ${rating} stars!`);
        } else {
          console.error('Error updating book status:', result.errors);
          this.notificationService.showError('Failed to save rating');
        }
      });
    }
  }

  // Cover overlay rating methods
  onCoverRatingChange(rating: number): void {
    this.tempCoverRating = rating;
  }

  editRating(): void {
    if (this.book && (this.book.status === ReadingStatus.Completed || this.book.status === ReadingStatus.Summarized)) {
      this.isEditingRating = true;
      this.tempRating = this.book.rating || null;
    }
  }

  saveRatingInline(): void {
    if (this.book && this.tempRating !== null) {
      this.saveRating(this.tempRating);
      this.isEditingRating = false;
      this.tempRating = null;
    }
  }

  cancelRatingInline(): void {
    this.isEditingRating = false;
    this.tempRating = null;
  }

  saveCoverRating(): void {
    if (this.tempCoverRating && this.book) {
      // Save rating using the same logic as modal
      this.saveRating(this.tempCoverRating);
      this.tempCoverRating = null;
    }
  }


  private calculateProgress(): void {
    if (this.book && this.readingSessions.length > 0) {
      this.currentPage = this.readingSessions.reduce((sum, session) => sum + session.pagesRead, 0);
      if (this.book.totalPages && this.book.totalPages > 0) {
        this.progress = (this.currentPage / this.book.totalPages) * 100;
      } else {
        this.progress = 0;
      }
    } else {
      this.currentPage = 0;
      this.progress = 0;
    }
    console.log('BookDetailsComponent calculateProgress - currentPage:', this.currentPage, 'progress:', this.progress);
  }

  getGoalClass(pagesRead: number): string {
    if (!this.readingGoal) {
      return '';
    }
    if (pagesRead >= this.readingGoal.highGoal) {
      return 'text-red-500 font-bold';
    } else if (pagesRead >= this.readingGoal.mediumGoal) {
      return 'text-blue-500 font-bold';
    } else if (pagesRead >= this.readingGoal.lowGoal) {
      return 'text-green-500 font-bold';
    }
    return '';
  }

  handleReadingLogDeleted(): void {
    console.log('BookDetailsComponent handleReadingLogDeleted - Reading session deleted, refreshing book data.');
    this.refreshBookData(); // Refresh all book-related data
  }

  openReadingLogModal(): void {
    console.log('BookDetailsComponent openReadingLogModal - currentBookId:', this.currentBookId);
    if (this.currentBookId) {
      this.isReadingLogModalOpen = true;
    } else {
      console.error('BookDetailsComponent openReadingLogModal - Cannot open Reading Log modal: currentBookId is null/undefined.');
    }
  }

  closeReadingLogModal(): void {
    console.log('BookDetailsComponent closeReadingLogModal');
    this.isReadingLogModalOpen = false;
  }

  deleteBook(): void {
    if (this.book) {
      // Directly delete without confirmation dialog
      this.bookService.deleteBook(this.book.id).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.isSuccess) {
          this.notificationService.showSuccess(`"${this.book!.title}" deleted successfully`);
          this.router.navigate(['/books']);
        } else {
          console.error('Error deleting book:', result.errors);
          this.notificationService.showError('Failed to delete book');
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  // Tab switching
  switchTab(tab: TabType): void {
    this.activeTab = tab;
  }

  getStatusBadgeClass(): string {
    switch (this.book?.status) {
      case ReadingStatus.CurrentlyReading:
        return 'badge-secondary';
      case ReadingStatus.Completed:
      case ReadingStatus.Summarized:
        return 'badge-success';
      case ReadingStatus.Planning:
        return 'badge-info';
      default:
        return 'badge-ghost';
    }
  }

  // Notes editor methods
  openNotesEditor(): void {
    this.isEditingNotes = true;
    if (this.book?.summary) {
      this.notesForm.patchValue({ summary: this.book.summary });
    } else {
      this.notesForm.reset();
    }
  }

  cancelNotesEdit(): void {
    this.isEditingNotes = false;
    this.notesForm.reset();
  }

  saveNotes(): void {
    if (this.notesForm.valid && this.book) {
      const summaryText = this.notesForm.get('summary')?.value;

      // Update book summary
      this.bookService.updateBookSummary(this.book.id, summaryText).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.isSuccess) {
          this.book!.summary = summaryText;
          this.isEditingNotes = false;
          console.log('Book notes updated successfully');
          this.notificationService.showSuccess('Notes saved successfully');
        } else {
          console.error('Error updating book notes:', result.errors);
          this.notificationService.showError('Failed to save notes');
        }
      });
    }
  }

  // Session notes methods
  getSessionsWithNotes(): GetReadingSession[] {
    return this.readingSessions
      .filter(session => session.summary && session.summary.trim().length > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  calculatePageRange(session: GetReadingSession): { start: number; end: number } {
    const sortedSessions = [...this.readingSessions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const sessionIndex = sortedSessions.findIndex(s => s.id === session.id);

    // Calculate cumulative pages up to this session
    let pagesBeforeSession = 0;
    for (let i = 0; i < sessionIndex; i++) {
      pagesBeforeSession += sortedSessions[i].pagesRead;
    }

    const startPage = pagesBeforeSession + 1;
    const endPage = pagesBeforeSession + session.pagesRead;

    return { start: startPage, end: endPage };
  }

  openNoteDetailModal(session: GetReadingSession): void {
    this.selectedSession = session;
    this.isNoteDetailModalOpen = true;
  }

  closeNoteDetailModal(): void {
    this.isNoteDetailModalOpen = false;
    this.selectedSession = null;
  }

  getSelectedSessionPageRange(): { start: number; end: number } | null {
    if (!this.selectedSession) return null;
    return this.calculatePageRange(this.selectedSession);
  }
}
