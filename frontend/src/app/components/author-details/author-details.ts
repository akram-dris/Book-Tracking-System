
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorService } from '../../services/author.service';
import { BookService } from '../../services/book.service';
import { ReadingStatusService } from '../../services/reading-status';
import { GetAuthor } from '../../models/get-author.model';
import { GetBook } from '../../models/get-book.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';
import { heroArrowLeft, heroBookOpen, heroPencilSquare, heroTrash, heroCheckCircle, heroDocumentText, heroPlus, heroStar, heroArrowsUpDown } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

interface BookWithStatus extends GetBook {
  statusBadgeClass?: string;
  statusDisplayName?: string;
}

@Component({
  selector: 'app-author-details',
  imports: [CommonModule, RouterModule, NgIconComponent, MatButtonModule, FormsModule],
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
    private location: Location,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAuthorData(+id);
    }
  }

  loadAuthorData(id: number): void {
    this.isLoading = true;
    this.authorService.getAuthor(id).subscribe({
      next: (author) => {
        this.author = author;
        this.loadAuthorBooks(id);
      },
      error: (err) => {
        console.error('Error loading author:', err);
        this.isLoading = false;
      }
    });
  }

  loadAuthorBooks(authorId: number): void {
    this.readingStatusService.getAllStatuses().subscribe(statuses => {
      const statusMap = new Map(statuses.map(s => [s.value, s]));

      this.bookService.getBooks().subscribe({
        next: (books) => {
          this.authorBooks = books
            .filter(book => book.authorId === authorId)
            .map(book => {
              const statusInfo = statusMap.get(book.status);
              return {
                ...book,
                statusBadgeClass: statusInfo?.badgeClass || 'badge-ghost',
                statusDisplayName: statusInfo?.displayName || 'Unknown'
              };
            });

          this.sortBooks();
          this.calculateStatistics();
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
    this.booksCompleted = this.authorBooks.filter(book =>
      book.status === ReadingStatus.Completed || book.status === ReadingStatus.Summarized
    ).length;
    this.booksReading = this.authorBooks.filter(book => book.status === ReadingStatus.CurrentlyReading).length;

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

  deleteAuthor(): void {
    if (!this.author) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Author',
        message: 'Are you sure you want to delete this author? This will also remove all their books.',
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.author) {
        this.authorService.deleteAuthor(this.author.id).subscribe(() => {
          this.notificationService.showSuccess('Author deleted successfully');
          this.router.navigate(['/authors']);
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  getStatusClass(book: BookWithStatus): string {
    if (book.status === ReadingStatus.Completed || book.status === ReadingStatus.Summarized) return 'badge-success text-white';
    if (book.status === ReadingStatus.CurrentlyReading) return 'badge-info text-white';
    return 'badge-ghost';
  }

  getStatusText(book: BookWithStatus): string {
    return book.statusDisplayName || 'Unknown';
  }

  onImageError(event: Event): void {
    console.error('Failed to load author image. URL:', this.rootUrl + this.author?.imageUrl);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getRatingColorClass(rating: number | undefined): string {
    if (!rating) return 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent';

    const roundedRating = Math.round(rating);

    switch (roundedRating) {
      case 5: return 'bg-gradient-to-t from-amber-600/90 via-amber-500/60 to-transparent';
      case 4: return 'bg-gradient-to-t from-emerald-600/90 via-emerald-500/60 to-transparent';
      case 3: return 'bg-gradient-to-t from-cyan-600/90 via-cyan-500/60 to-transparent';
      case 2: return 'bg-gradient-to-t from-orange-600/90 via-orange-500/60 to-transparent';
      case 1: return 'bg-gradient-to-t from-rose-600/90 via-rose-500/60 to-transparent';
      default: return 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent';
    }
  }

  getRatingBorderClass(rating: number | undefined): string {
    if (!rating) return 'hover:shadow-primary/20 hover:border-primary';

    const roundedRating = Math.round(rating);

    switch (roundedRating) {
      case 5: return 'hover:shadow-amber-500/40 hover:border-amber-400';
      case 4: return 'hover:shadow-emerald-500/40 hover:border-emerald-400';
      case 3: return 'hover:shadow-cyan-500/40 hover:border-cyan-400';
      case 2: return 'hover:shadow-orange-500/40 hover:border-orange-400';
      case 1: return 'hover:shadow-rose-500/40 hover:border-rose-400';
      default: return 'hover:shadow-primary/20 hover:border-primary';
    }
  }

  getRatingBadgeClass(rating: number | undefined): string {
    if (!rating) return '';

    const roundedRating = Math.round(rating);

    switch (roundedRating) {
      case 5: return 'bg-amber-500 border-amber-400';
      case 4: return 'bg-emerald-500 border-emerald-400';
      case 3: return 'bg-cyan-500 border-cyan-400';
      case 2: return 'bg-orange-500 border-orange-400';
      case 1: return 'bg-rose-500 border-rose-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  }
}
