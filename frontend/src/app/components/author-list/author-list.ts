import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { AuthorService } from '../../services/author';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GetAuthor } from '../../models/get-author.model';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '../shared/empty-state/empty-state';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroXMark, heroUserPlus, heroFunnel, heroArrowsUpDown, heroPlus, heroStar, heroBookOpen, heroUsers } from '@ng-icons/heroicons/outline';
import { BookService } from '../../services/book';
import { MatButtonModule } from '@angular/material/button';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog';
import { PaginationParams } from '../../models/result';

interface AuthorWithCount extends GetAuthor {
  bookCount?: number;
  averageRating?: number;
}

type SortOption = 'name' | 'bookCount' | 'rating' | 'dateAdded';

import { AuthorFormComponent } from '../author-form/author-form';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIconComponent, MatButtonModule, InfiniteScrollDirective, EmptyStateComponent],
  templateUrl: './author-list.html',
  styleUrls: ['./author-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroMagnifyingGlass, heroArrowsUpDown, heroXMark, heroBookOpen, heroStar, heroUsers, heroPlus })]
})
export class AuthorListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private authorService = inject(AuthorService);
  private router = inject(Router);
  private bookService = inject(BookService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  authors: AuthorWithCount[] = [];
  filteredAuthors: AuthorWithCount[] = [];
  rootUrl: string = environment.rootUrl;
  searchQuery: string = '';
  sortBy: SortOption = 'name';
  currentPage: number = 1;
  pageSize: number = 20;
  hasMorePages: boolean = true;
  isLoadingMore: boolean = false;
  isLoading: boolean = true;

  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'bookCount', label: 'Most Books' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'dateAdded', label: 'Recently Added' }
  ];

  ngOnInit(): void {
    this.loadAuthors();
  }


  openAddAuthorModal() {
    const dialogRef = this.dialog.open(AuthorFormComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'glass-modal',
      backdropClass: 'glass-modal-backdrop',
      data: { authorId: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAuthors();
      }
    });
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

    this.authorService.getAuthorsPaginated(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.authors = result.data.items;
            this.filteredAuthors = result.data.items;
            this.hasMorePages = result.data.hasNextPage;
          } else {
            console.error('Error loading authors:', result.errors);
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading authors:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMorePages) return;

    this.isLoadingMore = true;
    const nextPage = this.currentPage + 1;
    const params: PaginationParams = {
      pageNumber: nextPage,
      pageSize: this.pageSize,
      search: this.searchQuery,
      sort: this.sortBy
    };

    this.authorService.getAuthorsPaginated(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.authors = [...this.authors, ...result.data.items];
            this.filteredAuthors = [...this.filteredAuthors, ...result.data.items];
            this.hasMorePages = result.data.hasNextPage;
            this.currentPage = nextPage;
          }
          this.isLoadingMore = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading more authors:', error);
          this.isLoadingMore = false;
          this.cdr.markForCheck();
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
        this.authorService.deleteAuthor(id).subscribe(deleteResult => {
          if (deleteResult.isSuccess) {
            this.notificationService.showSuccess('Author deleted successfully');
            this.loadAuthors();
          } else {
            console.error('Error deleting author:', deleteResult.errors);
            this.notificationService.showError('Failed to delete author');
          }
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

    const roundedRating = Math.floor(rating);

    if (roundedRating >= 4) return 'bg-gradient-to-t from-amber-500/90 via-amber-400/60 to-transparent'; // Gold (4-5)
    if (roundedRating >= 2) return 'bg-gradient-to-t from-slate-500/90 via-slate-400/60 to-transparent'; // Silver (2-3)
    return 'bg-gradient-to-t from-orange-700/90 via-orange-600/60 to-transparent'; // Bronze (1)
  }

  getRatingBorderClass(rating: number | undefined): string {
    if (!rating) return 'hover:shadow-primary/20 hover:border-primary';

    const roundedRating = Math.floor(rating);

    if (roundedRating >= 4) return 'hover:shadow-amber-500/40 hover:border-amber-400'; // Gold
    if (roundedRating >= 2) return 'hover:shadow-slate-500/40 hover:border-slate-400'; // Silver
    return 'hover:shadow-orange-700/40 hover:border-orange-600'; // Bronze
  }

  getRatingBadgeClass(rating: number | undefined): string {
    if (!rating) return '';

    const roundedRating = Math.floor(rating);

    if (roundedRating >= 4) return 'bg-amber-500 border-amber-400'; // Gold
    if (roundedRating >= 2) return 'bg-slate-500 border-slate-400'; // Silver
    return 'bg-orange-700 border-orange-600'; // Bronze
  }
}
