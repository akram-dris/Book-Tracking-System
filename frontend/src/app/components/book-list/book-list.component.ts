
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
  selectedTagId: number | null = null;

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(tagId: number | null = null): void {
    console.log('BookListComponent - Loading books with tagId:', tagId);
    this.bookService.getBooks(tagId).subscribe(data => {
      this.books = data;
      console.log('BookListComponent - Books loaded:', this.books);
      this.books.forEach(book => console.log('BookListComponent - Book ImageUrl:', book.imageUrl, 'Status:', book.status));
    });
  }

  filterBooksByTag(tagId: number | null): void {
    this.selectedTagId = tagId;
    this.loadBooks(this.selectedTagId);
  }

  deleteBook(id: number): void {
    this.bookService.deleteBook(id).subscribe(() => {
      this.loadBooks();
    });
  }
}
