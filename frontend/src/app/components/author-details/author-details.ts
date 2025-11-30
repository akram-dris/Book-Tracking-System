
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorService } from '../../services/author';
import { BookService } from '../../services/book';
import { ReadingStatusService } from '../../services/reading-status';
import { ReadingSessionService } from '../../services/reading-session';
import { GetAuthor } from '../../models/get-author.model';
import { GetBook } from '../../models/get-book.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { heroArrowLeft, heroBookOpen, heroPencilSquare, heroTrash, heroCheckCircle, heroDocumentText, heroPlus, heroStar, heroArrowsUpDown, heroCalendar } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';
import { AuthorFormComponent } from '../author-form/author-form';
import { BookCardComponent } from '../shared/book-card/book-card';

interface BookWithStatus extends GetBook {
  statusBadgeClass?: string;
  statusDisplayName?: string;
  progressPercentage?: number;
  statusName?: string;
}

@Component({
  selector: 'app-author-details',
  imports: [CommonModule, RouterModule, NgIconComponent, MatButtonModule, FormsModule, BookCardComponent],
  templateUrl: './author-details.html',
  styleUrls: ['./author-details.css'],
  viewProviders: [provideIcons({ heroArrowLeft, heroBookOpen, heroPencilSquare, heroTrash, heroCheckCircle, heroDocumentText, heroPlus, heroStar, heroArrowsUpDown })]
})
export class AuthorDetailsComponent implements OnInit {
  author: GetAuthor | undefined;
  authorBooks: BookWithStatus[] = [];
  displayedBooks: BookWithStatus[] = [];
  rootUrl = environment.rootUrl;
  ReadingStatus = ReadingStatus;

  // Statistics
  totalBooks = 0;
  booksCompleted = 0;
  booksReading = 0;
  totalPagesRead = 0;
  completionRate = 0;

  // UI state
  bioExpanded = false;
  sortBy: string = 'title-asc';
  isLoading = true;

  sortOptions = [
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'pages-desc', label: 'Most Pages' },
    { value: 'recent', label: 'Recently Added' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authorService: AuthorService,
    private bookService: BookService,
    private readingStatusService: ReadingStatusService,
    private readingSessionService: ReadingSessionService,
    private location: Location,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    console.log('AuthorDetailsComponent initialized');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAuthorData(+id);
    }
  }

  loadAuthorData(id: number): void {
    this.isLoading = true;
    console.log('Loading author data for id:', id);
    this.authorService.getAuthor(id).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.author = result.data;
          this.loadAuthorBooks(id);
        } else {
          console.error('Error loading author:', result.errors);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading author:', err);
        this.isLoading = false;
      }
    });
  }

  loadAuthorBooks(authorId: number): void {
    this.readingStatusService.getAllStatuses().subscribe(statusResult => {
      if (!statusResult.isSuccess || !statusResult.data) {
        console.error('Error loading statuses:', statusResult.errors);
        this.isLoading = false;
        return;
      }

      const statuses = statusResult.data;
      const statusMap = new Map(statuses.map(s => [s.value, s]));

      this.bookService.getBooks().subscribe({
        next: (bookResult) => {
          if (bookResult.isSuccess && bookResult.data) {
            const books = bookResult.data;
            this.authorBooks = books
              .filter(book => book.authorId === authorId)
              .map(book => {
                const statusInfo = statusMap.get(book.status);
                return {
                  ...book,
                  statusBadgeClass: statusInfo?.badgeClass || 'badge-ghost',
                  statusDisplayName: statusInfo?.displayName || 'Unknown',
                  statusName: statusInfo?.displayName || 'Unknown'
                };
              });

            this.sortBooks();
            this.calculateStatistics();
            this.loadProgressForBooks(this.authorBooks);
          } else {
            console.error('Error loading author books:', bookResult.errors);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading author books:', err);
          this.isLoading = false;
        }
      });
    });
  }

  sortBooks(): void {
    let sorted = [...this.authorBooks];

    switch (this.sortBy) {
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'rating-desc':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'pages-desc':
        sorted.sort((a, b) => b.totalPages - a.totalPages);
        break;
      case 'recent':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    this.displayedBooks = sorted;
  }

  onSortChange(): void {
    this.sortBooks();
  }

  calculateStatistics(): void {
    this.totalBooks = this.authorBooks.length;

    // Count completed and reading books
    this.booksCompleted = this.authorBooks.filter(book =>
      book.status === ReadingStatus.Completed || book.status === ReadingStatus.Summarized
    ).length;
    this.booksReading = this.authorBooks.filter(book => book.status === ReadingStatus.CurrentlyReading).length;

    // Calculate completion rate
    this.completionRate = this.totalBooks > 0 ? (this.booksCompleted / this.totalBooks) * 100 : 0;

    // Calculate total pages read from completed and summarized books
    this.totalPagesRead = this.authorBooks.reduce((total, book) => {
      if (book.status === ReadingStatus.Completed || book.status === ReadingStatus.Summarized) {
        return total + book.totalPages;
      }
      return total;
    }, 0);
  }

  toggleBio(): void {
    this.bioExpanded = !this.bioExpanded;
  }

  navigateToAddBook(): void {
    if (this.author) {
      this.router.navigate(['/books/new'], { queryParams: { authorId: this.author.id } });
    }
  }

  openEditModal(): void {
    if (this.author) {
      const dialogRef = this.dialog.open(AuthorFormComponent, {
        data: { authorId: this.author.id },
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        panelClass: 'glass-modal',
        backdropClass: 'glass-modal-backdrop'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadAuthorData(this.author!.id);
        }
      });
    }
  }

  confirmDelete(): void {
    if (!this.author) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Author',
        message: 'Are you sure you want to delete this author? This will also remove all their books.',
        confirmText: 'Delete',
        confirmColor: 'warn'
      },
      panelClass: 'glass-modal',
      backdropClass: 'glass-modal-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.author) {
        this.authorService.deleteAuthor(this.author.id).subscribe(deleteResult => {
          if (deleteResult.isSuccess) {
            this.notificationService.showSuccess('Author deleted successfully');
            this.router.navigate(['/authors']);
          } else {
            console.error('Error deleting author:', deleteResult.errors);
            this.notificationService.showError('Failed to delete author');
          }
        });
      }
    });
  }

  private loadProgressForBooks(books: BookWithStatus[]): void {
    books.forEach(book => {
      if (book.id && book.totalPages && book.totalPages > 0) {
        this.readingSessionService.getReadingSessionsForBook(book.id).subscribe({
          next: result => {
            if (result.isSuccess && result.data) {
              const sessions = result.data;
              const totalPagesRead = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
              book.progressPercentage = (totalPagesRead / book.totalPages!) * 100;
            } else {
              console.error(`Error fetching reading sessions for book ${book.id}:`, result.errors);
              book.progressPercentage = 0;
            }
          },
          error: err => {
            console.error(`Error fetching reading sessions for book ${book.id}:`, err);
            book.progressPercentage = 0;
          }
        });
      } else {
        book.progressPercentage = 0;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/placeholder-book.png';
  }

  getStatusClass(book: BookWithStatus): string {
    return book.statusBadgeClass || 'badge-ghost';
  }

  getStatusText(book: BookWithStatus): string {
    return book.statusDisplayName || 'Unknown';
  }

  getRatingBadgeClass(rating: number): string {
    if (rating >= 4) {
      return 'bg-amber-500/90';
    } else if (rating >= 2) {
      return 'bg-slate-400/90';
    } else {
      return 'bg-orange-500/90';
    }
  }
}
