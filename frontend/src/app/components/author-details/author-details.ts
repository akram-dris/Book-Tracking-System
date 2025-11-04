
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
import { heroArrowLeft, heroBookOpen, heroPencilSquare, heroTrash } from '@ng-icons/heroicons/outline';

interface BookWithStatus extends GetBook {
  statusBadgeClass?: string;
  statusDisplayName?: string;
}

@Component({
  selector: 'app-author-details',
  imports: [CommonModule, RouterModule, NgIconComponent],
  templateUrl: './author-details.html',
  styleUrls: ['./author-details.css'],
  viewProviders: [provideIcons({ heroArrowLeft, heroBookOpen, heroPencilSquare, heroTrash })]
})
export class AuthorDetailsComponent implements OnInit {
  author: GetAuthor | undefined;
  authorBooks: BookWithStatus[] = [];
  rootUrl = environment.rootUrl;
  ReadingStatus = ReadingStatus;
  
  // Statistics
  totalBooks = 0;
  booksCompleted = 0;
  booksReading = 0;
  totalPagesRead = 0;
  
  // UI state
  bioExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authorService: AuthorService,
    private bookService: BookService,
    private readingStatusService: ReadingStatusService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAuthorData(+id);
    }
  }

  loadAuthorData(id: number): void {
    this.authorService.getAuthor(id).subscribe(author => {
      this.author = author;
      this.loadAuthorBooks(id);
    });
  }

  loadAuthorBooks(authorId: number): void {
    this.bookService.getBooks().subscribe(books => {
      this.authorBooks = books.filter(book => book.authorId === authorId);
      
      this.authorBooks.forEach(book => {
        this.readingStatusService.getStatusBadgeClass(book.status).subscribe(badgeClass => {
          book.statusBadgeClass = badgeClass;
        });
        this.readingStatusService.getStatusDisplayName(book.status).subscribe(displayName => {
          book.statusDisplayName = displayName;
        });
      });
      
      this.calculateStatistics();
    });
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
    if (this.author && confirm('Are you sure you want to delete this author? This will also remove all their books.')) {
      this.authorService.deleteAuthor(this.author.id).subscribe(() => {
        this.router.navigate(['/authors']);
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  getStatusClass(book: BookWithStatus): string {
    return book.statusBadgeClass || 'badge-ghost';
  }

  getStatusText(book: BookWithStatus): string {
    return book.statusDisplayName || 'Unknown';
  }

  onImageError(event: Event): void {
    console.error('Failed to load author image. URL:', this.rootUrl + this.author?.imageUrl);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
