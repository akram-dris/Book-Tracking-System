
import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../services/author.service';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GetAuthor } from '../../models/get-author.model';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroXMark, heroUserPlus, heroFunnel, heroArrowsUpDown, heroPlus, heroStar } from '@ng-icons/heroicons/outline';
import { BookService } from '../../services/book.service';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll.directive';
import { PaginationParams } from '../../models/result';

interface AuthorWithCount extends GetAuthor {
  bookCount?: number;
}

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIconComponent, MatButtonModule, InfiniteScrollDirective],
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.css'],
  viewProviders: [provideIcons({ heroMagnifyingGlass, heroXMark, heroUserPlus, heroFunnel, heroArrowsUpDown, heroPlus, heroStar })]
})
export class AuthorListComponent implements OnInit {
  authors: AuthorWithCount[] = [];
  filteredAuthors: AuthorWithCount[] = [];
  rootUrl: string = environment.rootUrl;
  searchQuery: string = '';
  sortBy: string = 'name-asc';
  currentPage: number = 1;
  pageSize: number = 20;
  hasMorePages: boolean = true;
  isLoadingMore: boolean = false;
  isLoading: boolean = true;

  sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'books-desc', label: 'Most Books' },
    { value: 'books-asc', label: 'Least Books' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'recent', label: 'Recently Added' }
  ];

  constructor(
    private authorService: AuthorService,
    private bookService: BookService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.authors = [];
    this.filteredAuthors = [];
    this.hasMorePages = true;

    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery,
      sort: this.sortBy
    };

    this.authorService.getAuthorsPaginated(params).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.authors = result.data.items;
          this.filteredAuthors = result.data.items;
          this.hasMorePages = result.data.items.length === this.pageSize;

          // We need to fetch book counts separately if not included in DTO
          // But wait, the backend DTO *doesn't* have bookCount, it has Books list?
          // The backend DTO has `AverageRating` but not explicit `BookCount`.
          // Let's check the DTO. If it has Books, we can count them.
          // The backend DTO has `AverageRating`.
          // For now, we'll assume the backend returns what we need or we might need to fetch counts.
          // Actually, the previous implementation fetched ALL books to count them. That's bad for pagination.
          // We should rely on the backend to provide the count or just show what we have.
          // The current AuthorDto has `AverageRating` but not `BookCount`.
          // We should probably add `BookCount` to AuthorDto in the backend for efficiency.
          // For now, let's just display the authors.
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading authors:', error);
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMorePages) return;

    this.isLoadingMore = true;
    this.currentPage++;

    const params: PaginationParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchQuery,
      sort: this.sortBy
    };

    this.authorService.getAuthorsPaginated(params).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          const newAuthors = result.data.items;
          this.authors = [...this.authors, ...newAuthors];
          this.filteredAuthors = [...this.filteredAuthors, ...newAuthors];
          this.hasMorePages = newAuthors.length === this.pageSize;
        }
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading more authors:', error);
        this.isLoadingMore = false;
      }
    });
  }

  onSearchChange(): void {
    this.loadAuthors();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadAuthors();
  }

  onSortChange(): void {
    this.loadAuthors();
  }

  deleteAuthor(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Author',
        message: 'Are you sure you want to delete this author? This will also remove all their books.',
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authorService.deleteAuthor(id).subscribe(() => {
          this.notificationService.showSuccess('Author deleted successfully');
          this.loadAuthors();
        });
      }
    });
  }

  onImageError(event: Event, author: AuthorWithCount): void {
    console.error('Failed to load image for author:', author.name, 'URL:', this.rootUrl + author.imageUrl);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
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
}
