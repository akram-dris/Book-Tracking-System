
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // New import
import { BookService } from '../../services/book.service';
import { ReadingSessionService } from '../../services/reading-session.service'; // New import
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GetBook } from '../../models/get-book.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum'; // New import
import { environment } from 'src/environments/environment';

interface BookWithProgress extends GetBook {
  progressPercentage?: number;
  statusName?: string;
}

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, NgFor, RouterModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: BookWithProgress[] = [];
  rootUrl: string = environment.rootUrl;
  selectedTagId: number | null = null;
  ReadingStatus = ReadingStatus; // Expose enum to template

  constructor(
    private bookService: BookService,
    private readingSessionService: ReadingSessionService // Inject ReadingSessionService
  ) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(tagId: number | null = null): void {
    console.log('BookListComponent - Loading books with tagId:', tagId);
    this.bookService.getBooks(tagId).subscribe(data => {
      this.books = data.map(book => ({ ...book })); // Create new array with spread operator
      console.log('BookListComponent - Books loaded:', this.books);

      this.books.forEach(book => {
        book.statusName = this.getReadingStatusName(book.status); // Set status name

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
    });
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
      default:
        return 'bg-gray-500';
    }
  }

  deleteBook(id: number): void {
    this.bookService.deleteBook(id).subscribe(() => {
      this.loadBooks();
    });
  }
}
