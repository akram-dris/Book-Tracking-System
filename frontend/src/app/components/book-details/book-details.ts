
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { ReadingSessionService } from '../../services/reading-session.service';
import { ReadingGoalService } from '../../services/reading-goal.service';
import { GetBook } from '../../models/get-book.model';
import { GetReadingSession } from '../../models/get-reading-session.model';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SessionLogComponent } from '../session-log/session-log.component';
import { PlanAndGoalModalComponent } from '../plan-and-goal-modal/plan-and-goal-modal.component';
import { ReadingLogModalComponent } from '../reading-log-modal/reading-log-modal.component';
import { QuillModule } from 'ngx-quill';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
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
  heroTag
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
    SessionLogComponent, 
    PlanAndGoalModalComponent, 
    ReadingLogModalComponent,
    QuillModule,
    NgIconComponent
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
      heroTag
    })
  ]
})
export class BookDetailsComponent implements OnInit {
  book: GetBook | undefined;
  readingSessions: GetReadingSession[] = [];
  readingGoal: GetReadingGoal | null = null;
  rootUrl = environment.rootUrl;
  ReadingStatus = ReadingStatus;
  isAddSessionModalOpen: boolean = false;
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
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private readingSessionService: ReadingSessionService,
    private readingGoalService: ReadingGoalService,
    private location: Location,
    private fb: FormBuilder
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
      this.bookService.getBook(+id).subscribe(book => {
        this.book = book;
        this.currentBookId = book.id; // Assign book.id to currentBookId
        if (this.book.summary) {
          this.summaryForm.patchValue({ summary: this.book.summary });
        }
        console.log('BookDetailsComponent refreshBookData - book loaded:', this.book);
        this.readingSessionService.getReadingSessionsForBook(+id).subscribe({
          next: sessions => {
            this.readingSessions = sessions;
            this.calculateProgress(); // Calculate progress after sessions are loaded
            console.log('BookDetailsComponent refreshBookData - readingSessions loaded:', this.readingSessions);
          },
          error: err => {
            if (err.status === 404) {
              console.log('BookDetailsComponent refreshBookData - No reading sessions found for bookId:', id);
              this.readingSessions = []; // Ensure it's an empty array
              this.calculateProgress(); // Calculate progress even if no sessions
            } else {
              console.error('BookDetailsComponent refreshBookData - Error fetching reading sessions:', err);
            }
          }
        });
        this.readingGoalService.getReadingGoalForBook(+id).subscribe({
          next: goal => {
            this.readingGoal = goal;
            console.log('BookDetailsComponent refreshBookData - readingGoal loaded:', this.readingGoal);
          },
          error: err => {
            if (err.status === 404) {
              console.log('BookDetailsComponent refreshBookData - No reading goal found for bookId:', id);
              this.readingGoal = null; // Ensure it's null
            } else {
              console.error('BookDetailsComponent refreshBookData - Error fetching reading goal:', err);
            }
          }
        });
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
      this.bookService.updateBookStatus(this.book.id, ReadingStatus.Summarized, startedDate, new Date(), summaryText).subscribe(() => {
        this.book!.status = ReadingStatus.Summarized;
        this.book!.completedDate = new Date();
        this.book!.summary = summaryText;
        this.isEditingSummary = false;
        console.log('BookDetailsComponent saveSummary - Book summary updated');
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
      this.bookService.updateBookStatus(this.book.id, ReadingStatus.CurrentlyReading, new Date()).subscribe(() => {
        this.book!.status = ReadingStatus.CurrentlyReading;
        this.book!.startedReadingDate = new Date(); // Set started reading date
        console.log('BookDetailsComponent startReading - Book status updated to CurrentlyReading, navigating to set-goal');
        this.router.navigate(['/books', this.book!.id, 'set-goal']);
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
    this.closePlanAndGoalModal();
    this.refreshBookData(); // Refresh all book-related data
  }

  openAddSessionModal(): void {
    console.log('BookDetailsComponent openAddSessionModal - Opening AddSessionModal for bookId:', this.currentBookId);
    this.isAddSessionModalOpen = true;
  }

  closeAddSessionModal(): void {
    console.log('BookDetailsComponent closeAddSessionModal');
    this.isAddSessionModalOpen = false;
  }

  handleAddSessionSaved(): void {
    console.log('BookDetailsComponent handleAddSessionSaved - Session saved, refreshing data for bookId:', this.book?.id);
    this.closeAddSessionModal();
    this.refreshBookData(); // Refresh all book-related data
  }

  startReadingFromPlanning(): void {
    console.log('BookDetailsComponent startReadingFromPlanning - book:', this.book);
    if (this.book) {
      const startDate = this.book.startedReadingDate ? new Date(this.book.startedReadingDate) : new Date(); // Use book.startedReadingDate
      this.bookService.updateBookStatus(this.book.id, ReadingStatus.CurrentlyReading, startDate).subscribe(() => {
        this.book!.status = ReadingStatus.CurrentlyReading;
        this.book!.startedReadingDate = startDate;
        console.log('BookDetailsComponent startReadingFromPlanning - Book status updated to CurrentlyReading with date:', startDate);
        // No navigation needed, stay on the same page
      });
    }
  }

  markAsCompleted(): void {
    console.log('BookDetailsComponent markAsCompleted - book:', this.book);
    if (this.book) {
      this.bookService.updateBookStatus(this.book.id, ReadingStatus.Completed, this.book.startedReadingDate, new Date()).subscribe(() => {
        this.book!.status = ReadingStatus.Completed;
        this.book!.completedDate = new Date();
        this.isSummaryMode = true;
        this.isEditingSummary = true;
        console.log('BookDetailsComponent markAsCompleted - Book status updated to Completed');
      });
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
      this.bookService.deleteBook(this.book.id).subscribe(() => {
        this.router.navigate(['/books']);
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
      this.bookService.updateBookSummary(this.book.id, summaryText).subscribe(() => {
        this.book!.summary = summaryText;
        this.isEditingNotes = false;
        console.log('Book notes updated successfully');
      });
    }
  }
}
