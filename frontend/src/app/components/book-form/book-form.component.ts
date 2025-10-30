
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthorService } from '../../services/author.service';
import { NgFor, CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

import { GetBook } from '../../models/get-book.model';
import { CreateBook } from '../../models/create-book.model';
import { UpdateBook } from '../../models/update-book.model';
import { GetAuthor } from '../../models/get-author.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, NgFor, CommonModule],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  isEditMode = false;
  bookId: number | null = null;
  authors: GetAuthor[] = [];
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isLoading = false;

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
    this.loadAuthors();
    this.bookId = this.route.snapshot.params['id'];
    if (this.bookId) {
      this.isEditMode = true;
      this.bookService.getBook(this.bookId).subscribe((data: GetBook) => {
        this.bookForm.patchValue(data);
        if (data.imageUrl) {
          this.imagePreviewUrl = environment.rootUrl + data.imageUrl;
        }
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
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.imagePreviewUrl = null;
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.bookForm.patchValue({ imageFile: null });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.isLoading = true;
      const bookData = this.bookForm.value;
      if (this.selectedFile) {
        bookData.imageFile = this.selectedFile;
      }

      if (this.isEditMode && this.bookId) {
        this.bookService.updateBook(this.bookId, bookData as UpdateBook).subscribe(() => {
          this.router.navigate(['/books']);
          this.isLoading = false;
        }, () => {
          this.isLoading = false;
        });
      } else {
        this.bookService.addBook(bookData as CreateBook).subscribe(() => {
          this.router.navigate(['/books']);
          this.isLoading = false;
        }, () => {
          this.isLoading = false;
        });
      }
    }
  }
}
