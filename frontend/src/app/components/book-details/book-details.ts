
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
import { PlanAndGoalModalComponent } from '../plan-and-goal-modal/plan-and-goal-modal.component'; // New import

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, SessionLogComponent, PlanAndGoalModalComponent], // Updated imports
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetailsComponent implements OnInit {
  book: GetBook | undefined;
  readingSessions: GetReadingSession[] = [];
  readingGoal: GetReadingGoal | null = null;
  rootUrl = environment.rootUrl;
  ReadingStatus = ReadingStatus;
  isAddSessionModalOpen: boolean = false; // Existing property
  isPlanAndGoalModalOpen: boolean = false; // New property
  currentBookId: number | null = null; // Existing property

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private readingSessionService: ReadingSessionService,
    private readingGoalService: ReadingGoalService,
    private location: Location,
    private fb: FormBuilder
  ) {
    // sessionLogForm and logSession() are removed as session logging is now handled by a modal
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('BookDetailsComponent ngOnInit - Route ID:', id);
    if (id) {
      this.bookService.getBook(+id).subscribe(book => {
        this.book = book;
        this.currentBookId = book.id; // Assign book.id to currentBookId
        console.log('BookDetailsComponent ngOnInit - book loaded:', this.book);
        this.readingSessionService.getReadingSessionsForBook(+id).subscribe({
          next: sessions => {
            this.readingSessions = sessions;
            console.log('BookDetailsComponent ngOnInit - readingSessions loaded:', this.readingSessions);
          },
          error: err => {
            if (err.status === 404) {
              console.log('BookDetailsComponent ngOnInit - No reading sessions found for bookId:', id);
              this.readingSessions = []; // Ensure it's an empty array
            } else {
              console.error('BookDetailsComponent ngOnInit - Error fetching reading sessions:', err);
            }
          }
        });
        this.readingGoalService.getReadingGoalForBook(+id).subscribe({
          next: goal => {
            this.readingGoal = goal;
            console.log('BookDetailsComponent ngOnInit - readingGoal loaded:', this.readingGoal);
          },
          error: err => {
            if (err.status === 404) {
              console.log('BookDetailsComponent ngOnInit - No reading goal found for bookId:', id);
              this.readingGoal = null; // Ensure it's null
            } else {
              console.error('BookDetailsComponent ngOnInit - Error fetching reading goal:', err);
            }
          }
        });
      });
    }
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
    // Refresh book details to get updated reading goal and status
    if (this.book) {
      this.bookService.getBook(this.book.id).subscribe(book => {
        this.book = book;
        this.readingGoalService.getReadingGoalForBook(this.book.id).subscribe(goal => {
          this.readingGoal = goal;
          console.log('BookDetailsComponent handlePlanAndGoalSaved - Refreshed readingGoal:', this.readingGoal);
        });
        console.log('BookDetailsComponent handlePlanAndGoalSaved - Refreshed book:', this.book);
      });
    }
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
    // Refresh reading sessions and potentially book details (e.g., current page)
    if (this.book) {
      this.readingSessionService.getReadingSessionsForBook(this.book.id).subscribe(sessions => {
        this.readingSessions = sessions;
        console.log('BookDetailsComponent handleAddSessionSaved - Refreshed readingSessions:', this.readingSessions);
      });
      // Also refresh the book to get the latest current page
      this.bookService.getBook(this.book.id).subscribe(book => {
        this.book = book;
        console.log('BookDetailsComponent handleAddSessionSaved - Refreshed book:', this.book);
      });
    }
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
      this.bookService.updateBookStatus(this.book.id, ReadingStatus.Completed).subscribe(() => {
        this.book!.status = ReadingStatus.Completed;
        console.log('BookDetailsComponent markAsCompleted - Book status updated to Completed');
      });
    }
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
}
