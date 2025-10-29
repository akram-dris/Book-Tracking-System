
import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GetBook } from '../../models/get-book.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [NgFor, RouterModule],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: GetBook[] = [];
  rootUrl: string = environment.rootUrl;

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe(data => {
      this.books = data;
      console.log('Books loaded:', this.books);
      this.books.forEach(book => console.log('Book ImageUrl:', book.imageUrl));
    });
  }

  deleteBook(id: number): void {
    this.bookService.deleteBook(id).subscribe(() => {
      this.loadBooks();
    });
  }
}
