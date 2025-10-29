
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthorService } from '../../services/author.service';
import { NgFor } from '@angular/common';
import { GetBook } from '../../models/get-book.model';
import { CreateBook } from '../../models/create-book.model';
import { UpdateBook } from '../../models/update-book.model';
import { GetAuthor } from '../../models/get-author.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgFor],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  isEditMode = false;
  bookId: number | null = null;
  authors: GetAuthor[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private authorService: AuthorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      authorId: [null, Validators.required],
      totalPages: [null, [Validators.required, Validators.min(1)]],
      imageFile: [null]
    });
  }

  ngOnInit(): void {
    this.loadAuthors(); // Call loadAuthors here
    this.bookId = this.route.snapshot.params['id'];
    if (this.bookId) {
      this.isEditMode = true;
      this.bookService.getBook(this.bookId).subscribe((data: GetBook) => {
        console.log('Book data received:', data);
        this.bookForm.patchValue(data);
        console.log('Book form value after patchValue:', this.bookForm.value);
      });
    }
  }

  loadAuthors(): void {
    this.authorService.getAuthors().subscribe({
      next: (authors) => {
        this.authors = authors;
      },
      error: (err) => {
        console.error('Error loading authors', err);
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      const bookData = this.bookForm.value;
      if (this.selectedFile) {
        bookData.imageFile = this.selectedFile;
      }

      if (this.isEditMode && this.bookId) {
        this.bookService.updateBook(this.bookId, bookData as UpdateBook).subscribe(() => {
          this.router.navigate(['/books']);
        });
      } else {
        this.bookService.addBook(bookData as CreateBook).subscribe(() => {
          this.router.navigate(['/books']);
        });
      }
    }
  }
}
