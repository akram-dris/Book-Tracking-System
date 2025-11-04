import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { ReadingSessionService } from '../../services/reading-session.service';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GetBook } from '../../models/get-book.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from 'src/environments/environment';
import { BookFiltersComponent, BookFilters } from './book-filters/book-filters';
import { BookStatsComponent, BookStatistics } from './book-stats/book-stats';
import { EmptyStateComponent } from '../shared/empty-state/empty-state';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroSquares2x2, heroBars3, heroEllipsisVertical, heroBookOpen, heroPencil, heroTrash } from '@ng-icons/heroicons/outline';

interface BookWithProgress extends GetBook {
  progressPercentage?: number;
  statusName?: string;
}

type SortOption = 'title' | 'dateAdded' | 'progress' | 'author';
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
    LoadingSpinnerComponent,
    NgIconComponent
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
  viewProviders: [provideIcons({ heroSquares2x2, heroBars3, heroEllipsisVertical, heroBookOpen, heroPencil, heroTrash })]
})
export class BookListComponent implements OnInit {
  books: BookWithProgress[] = [];
  displayedBooks: BookWithProgress[] = [];
  rootUrl: string = environment.rootUrl;
  selectedTagId: number | null = null;
  ReadingStatus = ReadingStatus;
  isLoading = true;

  // View and sorting
  viewMode: ViewMode = 'grid';
  sortBy: SortOption = 'dateAdded';
  sortOptions = [
    { value: 'title' as SortOption, label: 'Title' },
    { value: 'dateAdded' as SortOption, label: 'Date Added' },
    { value: 'progress' as SortOption, label: 'Progress' },
    { value: 'author' as SortOption, label: 'Author' }
  ];

  // Statistics
  bookStats: BookStatistics = {
    total: 0,
    currentlyReading: 0,
    completed: 0,
    toRead: 0
  };

  constructor(
    private bookService: BookService,
    private readingSessionService: ReadingSessionService
  ) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(tagId: number | null = null): void {
    this.isLoading = true;
    console.log('BookListComponent - Loading books with tagId:', tagId);
    this.bookService.getBooks(tagId).subscribe(data => {
      this.books = data.map(book => ({ ...book }));
      console.log('BookListComponent - Books loaded:', this.books);

      // Calculate statistics
      this.calculateStats();

      this.books.forEach(book => {
        book.statusName = this.getReadingStatusName(book.status);

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
        console.log('BookListComponent - Book ImageUrl:', book.imageUrl, 'Status:', book.status, 'Progress:', book.progressPercentage);
      });
      
      this.sortBooks();
      this.isLoading = false;
    });
  }

  calculateStats(): void {
    this.bookStats = {
      total: this.books.length,
      currentlyReading: this.books.filter(b => b.status === ReadingStatus.CurrentlyReading).length,
      completed: this.books.filter(b => b.status === ReadingStatus.Completed || b.status === ReadingStatus.Summarized).length,
      toRead: this.books.filter(b => b.status === ReadingStatus.Planning || b.status === ReadingStatus.NotReading).length
    };
  }

  onFiltersChanged(filters: BookFilters): void {
    console.log('Filters changed:', filters);
    
    // Apply filters
    let filteredBooks = [...this.books];
    
    if (filters.status !== undefined) {
      filteredBooks = filteredBooks.filter(book => book.status === filters.status);
    }
    
    if (filters.authorId) {
      filteredBooks = filteredBooks.filter(book => book.author?.id === filters.authorId);
    }
    
    if (filters.tagId) {
      filteredBooks = filteredBooks.filter(book => 
        book.tags?.some(tag => tag.id === filters.tagId)
      );
    }
    
    // For now, just reload with tag filter if provided
    if (filters.tagId) {
      this.loadBooks(filters.tagId);
    } else {
      this.loadBooks(null);
    }
  }

  getReadingStatusName(status: ReadingStatus): string {
    switch (status) {
      case ReadingStatus.NotReading:
        return 'Not Reading';
      case ReadingStatus.Planning:
        return 'Planning';
      case ReadingStatus.CurrentlyReading:
        return 'Currently Reading';
      case ReadingStatus.Completed:
        return 'Completed';
      case ReadingStatus.Summarized:
        return 'Summarized';
      default:
        return 'Unknown';
    }
  }

  filterBooksByTag(tagId: number | null): void {
    this.selectedTagId = tagId;
    this.loadBooks(this.selectedTagId);
  }

  getStatusClass(status: ReadingStatus): string {
    switch (status) {
      case ReadingStatus.NotReading:
        return 'bg-gray-500'; // Example color for Not Reading
      case ReadingStatus.Planning:
        return 'bg-blue-500'; // Example color for Planning
      case ReadingStatus.CurrentlyReading:
        return 'bg-green-500'; // Example color for Currently Reading
      case ReadingStatus.Completed:
        return 'bg-purple-500'; // Example color for Completed
      case ReadingStatus.Summarized:
        return 'status-summarized'; // Custom class for Summarized
      default:
        return 'bg-gray-500';
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

  onSortChange(sortOption: SortOption): void {
    this.sortBy = sortOption;
    this.sortBooks();
  }

  sortBooks(): void {
    switch (this.sortBy) {
      case 'title':
        this.books.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'author':
        this.books.sort((a, b) => (a.author?.name || '').localeCompare(b.author?.name || ''));
        break;
      case 'progress':
        this.books.sort((a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0));
        break;
      case 'dateAdded':
      default:
        this.books.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }
  }
}
