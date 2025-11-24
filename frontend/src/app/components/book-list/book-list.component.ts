import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { ReadingSessionService } from '../../services/reading-session.service';
import { ReadingStatusService } from '../../services/reading-status';
import { NgFor } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { GetBook } from '../../models/get-book.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from 'src/environments/environment';
import { BookFiltersComponent, BookFilters } from './book-filters/book-filters';
import { BookStatsComponent, BookStatistics } from './book-stats/book-stats';
import { EmptyStateComponent } from '../shared/empty-state/empty-state';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroSquares2x2, heroBars3, heroEllipsisVertical, heroBookOpen, heroPencil, heroTrash, heroPlus, heroStar } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';

interface BookWithProgress extends GetBook {
  progressPercentage?: number;
  statusName?: string;
  statusBadgeClass?: string;
}

type SortOption = 'title' | 'dateAdded' | 'progress' | 'author' | 'rating';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    RouterModule,
    BookFiltersComponent,
    BookStatsComponent,
    EmptyStateComponent,
    NgIconComponent,
    MatButtonModule,
    InfiniteScrollDirective
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  viewProviders: [provideIcons({ heroSquares2x2, heroBars3, heroEllipsisVertical, heroBookOpen, heroPencil, heroTrash, heroPlus, heroStar })]
})
export class BookListComponent implements OnInit {
  books: BookWithProgress[] = [];
  displayedBooks: BookWithProgress[] = [];
  rootUrl: string = environment.rootUrl;
  selectedTagId: number | null = null;
  ReadingStatus = ReadingStatus;
  isLoading = true;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  hasMorePages = true;
  isLoadingMore = false;

  // View and sorting
  viewMode: ViewMode = 'grid';
  sortBy: string = 'title-asc';
  currentStatusFilter: number | null = null;
  currentAuthorId: number | null = null;
  currentRating: number | null = null;
  currentSearch: string = '';
  sortOptions = [
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'author-asc', label: 'Author (A-Z)' },
    { value: 'author-desc', label: 'Author (Z-A)' },
    { value: 'date-newest', label: 'Newest' },
    { value: 'date-oldest', label: 'Oldest' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'rating-asc', label: 'Lowest Rated' }
  ];

  // Statistics
  bookStats: BookStatistics = {
    total: 0,
    notReading: 0,
    planning: 0,
    currentlyReading: 0,
    completed: 0,
    summarized: 0
  };



  // ... imports

  constructor(
    private bookService: BookService,
    private readingSessionService: ReadingSessionService,
    private readingStatusService: ReadingStatusService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const search = params['search'] || null;
      const tagId = params['tagId'] ? +params['tagId'] : (this.selectedTagId || null);
      this.loadBooks(tagId, search);
    });
  }

  loadBooks(tagId: number | null = null, search: string | null = null): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.books = [];
    this.hasMorePages = true;

    if (search !== null) {
      this.currentSearch = search;
    }
    if (tagId !== null) {
      this.selectedTagId = tagId;
    }

    this.readingStatusService.getAllStatuses().subscribe(statuses => {
      const statusMap = new Map(statuses.map(s => [s.value, s]));

      this.bookService.getBooksPaginated(
        this.currentPage,
        this.pageSize,
        this.currentSearch || null,
        this.selectedTagId,
        this.currentStatusFilter,
        this.sortBy,
        this.currentAuthorId,
        this.currentRating
      ).subscribe(result => {
        if (result.isSuccess && result.data) {
          this.books = result.data.items.map(book => {
            const statusInfo = statusMap.get(book.status);
            return {
              ...book,
              statusName: statusInfo?.displayName || 'Unknown',
              statusBadgeClass: statusInfo?.badgeClass || 'badge-ghost'
            };
          });
          this.displayedBooks = this.books;

          this.hasMorePages = result.data.hasNextPage;
          this.loadBookStats();
          this.loadProgressForBooks(this.books);
        } else {
          console.error('Error loading books:', result.errors);
        }
        this.isLoading = false;
      });
    });
  }

  loadBookStats(): void {
    this.bookService.getBookCountsByStatus().subscribe({
      next: (counts) => {
        const summarizedCount = counts[ReadingStatus.Summarized] || 0;
        const completedCount = counts[ReadingStatus.Completed] || 0;

        // Calculate total from all status counts
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

        this.bookStats = {
          total: total,
          notReading: counts[ReadingStatus.NotReading] || 0,
          planning: counts[ReadingStatus.Planning] || 0,
          currentlyReading: counts[ReadingStatus.CurrentlyReading] || 0,
          completed: completedCount + summarizedCount,
          summarized: summarizedCount
        };
      },
      error: (err) => {
        console.error('Error loading book stats:', err);
      }
    });
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMorePages) return;

    this.isLoadingMore = true;
    this.currentPage++;

    this.readingStatusService.getAllStatuses().subscribe(statuses => {
      const statusMap = new Map(statuses.map(s => [s.value, s]));

      console.log('LoadMore - Parameters:', {
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.currentSearch,
        tagId: this.selectedTagId,
        statusFilter: this.currentStatusFilter,
        sort: this.sortBy
      });

      this.bookService.getBooksPaginated(
        this.currentPage,
        this.pageSize,
        this.currentSearch || null,
        this.selectedTagId,
        this.currentStatusFilter,
        this.sortBy,
        this.currentAuthorId,
        this.currentRating
      ).subscribe(result => {
        if (result.isSuccess && result.data) {
          const newBooks = result.data.items.map(book => {
            const statusInfo = statusMap.get(book.status);
            return {
              ...book,
              statusName: statusInfo?.displayName || 'Unknown',
              statusBadgeClass: statusInfo?.badgeClass || 'badge-ghost'
            };
          });

          this.books = [...this.books, ...newBooks];
          this.displayedBooks = this.books;
          this.hasMorePages = result.data.hasNextPage;

          this.loadProgressForBooks(newBooks);
        }
        this.isLoadingMore = false;
      });
    });
  }

  onStatusFilterChange(status: number | null): void {
    this.currentStatusFilter = status;
    this.loadBooks();
  }

  onSortChange(sort: string): void {
    this.sortBy = sort;
    this.loadBooks();
  }

  onSearchChange(search: string): void {
    this.currentSearch = search;
    this.loadBooks();
  }

  private loadProgressForBooks(books: BookWithProgress[]): void {
    books.forEach(book => {
      if (book.id && book.totalPages && book.totalPages > 0) {
        this.readingSessionService.getReadingSessionsForBook(book.id).subscribe({
          next: sessions => {
            const totalPagesRead = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
            book.progressPercentage = (totalPagesRead / book.totalPages!) * 100;
          },
          error: err => {
            if (err.status === 404) {
              book.progressPercentage = 0;
            } else {
              console.error(`Error fetching reading sessions for book ${book.id}:`, err);
              book.progressPercentage = 0;
            }
          }
        });
      } else {
        book.progressPercentage = 0;
      }
    });
  }

  onFiltersChanged(filters: BookFilters): void {
    console.log('Filters changed:', filters);

    // Update filter state - if undefined or null, clear the filter
    this.currentStatusFilter = (filters.status !== undefined && filters.status !== null) ? filters.status : null;
    this.selectedTagId = filters.tagId ?? null;
    this.currentAuthorId = filters.authorId ?? null;
    this.currentRating = filters.rating ?? null;

    // Reload from server with new filters
    this.loadBooks();
  }

  filterBooksByTag(tagId: number | null): void {
    this.selectedTagId = tagId;
    this.loadBooks(this.selectedTagId);
  }

  getStatusClass(book: BookWithProgress): string {
    if (book.status === ReadingStatus.Completed) return 'badge-success text-white';
    if (book.status === ReadingStatus.CurrentlyReading) return 'badge-info text-white'; // Corrected from Reading to CurrentlyReading
    return 'badge-ghost';
  }

  getRatingColorClass(rating: number | undefined): string {
    if (!rating) return 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent';

    const roundedRating = Math.round(rating);

    switch (roundedRating) {
      case 5: return 'bg-gradient-to-t from-amber-600/90 via-amber-500/60 to-transparent'; // Gold/Masterpiece
      case 4: return 'bg-gradient-to-t from-emerald-600/90 via-emerald-500/60 to-transparent'; // Emerald/Great
      case 3: return 'bg-gradient-to-t from-cyan-600/90 via-cyan-500/60 to-transparent'; // Cyan/Good
      case 2: return 'bg-gradient-to-t from-orange-600/90 via-orange-500/60 to-transparent'; // Orange/Fair
      case 1: return 'bg-gradient-to-t from-rose-600/90 via-rose-500/60 to-transparent'; // Rose/Poor
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

  deleteBook(id: number): void {
    this.bookService.deleteBook(id).subscribe(() => {
      this.loadBooks();
    });
  }

  // View and sorting methods
  toggleView(mode: ViewMode): void {
    this.viewMode = mode;
  }

  sortFilteredBooks(): void {
    switch (this.sortBy) {
      case 'title':
        this.displayedBooks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'author':
        this.displayedBooks.sort((a, b) => (a.author?.name || '').localeCompare(b.author?.name || ''));
        break;
      case 'progress':
        this.displayedBooks.sort((a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0));
        break;
      case 'rating':
        this.displayedBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'dateAdded':
      default:
        this.displayedBooks.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }
  }
}
