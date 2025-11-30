
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TagService } from '../../services/tag';
import { BookService } from '../../services/book';
import { ReadingStatusService } from '../../services/reading-status';
import { ReadingSessionService } from '../../services/reading-session';
import { GetTag } from '../../models/get-tag.model';
import { GetBook } from '../../models/get-book.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { heroArrowLeft, heroBookOpen, heroPencilSquare, heroTrash, heroCheckCircle, heroDocumentText, heroPlus, heroStar, heroArrowsUpDown, heroTag } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';
import { BookCardComponent } from '../shared/book-card/book-card';

interface BookWithStatus extends GetBook {
  statusBadgeClass?: string;
  statusDisplayName?: string;
  progressPercentage?: number;
  statusName?: string;
}

@Component({
  selector: 'app-tag-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, MatButtonModule, MatIconModule, FormsModule, BookCardComponent],
  templateUrl: './tag-details.html',
  styleUrls: ['./tag-details.css'],
  viewProviders: [provideIcons({ heroArrowLeft, heroBookOpen, heroPencilSquare, heroTrash, heroCheckCircle, heroDocumentText, heroPlus, heroStar, heroArrowsUpDown, heroTag })]
})
export class TagDetailsComponent implements OnInit {
  tag: GetTag | undefined;
  tagBooks: BookWithStatus[] = [];
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
    private tagService: TagService,
    private bookService: BookService,
    private readingStatusService: ReadingStatusService,
    private readingSessionService: ReadingSessionService,
    private location: Location,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTagData(+id);
    }
  }

  loadTagData(id: number): void {
    this.isLoading = true;
    // Since we don't have getTagById, we'll fetch all tags and find the one we need
    this.tagService.getTagsPaginated({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.tag = result.data.items.find(t => t.id === id);
          if (this.tag) {
            this.loadTagBooks(id);
          } else {
            this.notificationService.showError('Tag not found');
            this.router.navigate(['/tags']);
          }
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.showError('Error loading tag');
      }
    });
  }

  loadTagBooks(tagId: number): void {
    this.readingStatusService.getAllStatuses().subscribe(statusResult => {
      if (!statusResult.isSuccess || !statusResult.data) {
        this.isLoading = false;
        return;
      }

      const statuses = statusResult.data;
      const statusMap = new Map(statuses.map(s => [s.value, s]));

      // Use getBooksPaginated with tagId filter
      this.bookService.getBooksPaginated(1, 1000, null, tagId).subscribe({
        next: (bookResult) => {
          if (bookResult.isSuccess && bookResult.data) {
            const books = bookResult.data.items; // Paginated result has items
            this.tagBooks = books.map(book => {
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
            this.loadProgressForBooks(this.tagBooks);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading tag books:', err);
          this.isLoading = false;
        }
      });
    });
  }

  sortBooks(): void {
    let sorted = [...this.tagBooks];

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
    this.totalBooks = this.tagBooks.length;

    // Count completed and reading books
    this.booksCompleted = this.tagBooks.filter(book =>
      book.status === ReadingStatus.Completed || book.status === ReadingStatus.Summarized
    ).length;
    this.booksReading = this.tagBooks.filter(book => book.status === ReadingStatus.CurrentlyReading).length;

    // Calculate completion rate
    this.completionRate = this.totalBooks > 0 ? (this.booksCompleted / this.totalBooks) * 100 : 0;

    // Calculate total pages read from completed and summarized books
    this.totalPagesRead = this.tagBooks.reduce((total, book) => {
      if (book.status === ReadingStatus.Completed || book.status === ReadingStatus.Summarized) {
        return total + book.totalPages;
      }
      return total;
    }, 0);
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
              book.progressPercentage = 0;
            }
          },
          error: () => {
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

  openEditModal(): void {
    if (!this.tag) return;
    // Navigate to tags page and trigger edit (we'll need to implement this in tag-management)
    this.router.navigate(['/tags'], { queryParams: { edit: this.tag.id } });
  }

  confirmDelete(): void {
    if (!this.tag) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Tag',
        message: `Are you sure you want to delete "${this.tag.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      },
      panelClass: 'glass-modal',
      backdropClass: 'glass-modal-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.tag) {
        this.tagService.deleteTag(this.tag.id).subscribe(deleteResult => {
          if (deleteResult.isSuccess) {
            this.notificationService.showSuccess('Tag deleted successfully');
            this.router.navigate(['/tags']);
          } else {
            console.error('Error deleting tag:', deleteResult.errors);
            this.notificationService.showError('Failed to delete tag');
          }
        });
      }
    });
  }
}
