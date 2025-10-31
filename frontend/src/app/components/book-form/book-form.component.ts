import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthorService } from '../../services/author.service';
import { TagService } from '../../services/tag.service';
import { NgFor, CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

import { GetBook } from '../../models/get-book.model';
import { CreateBook } from '../../models/create-book.model';
import { UpdateBook } from '../../models/update-book.model';
import { GetAuthor } from '../../models/get-author.model';
import { GetTag } from '../../models/get-tag.model';

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
  tags: GetTag[] = [];
  selectedFile: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private authorService: AuthorService,
    private tagService: TagService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      authorId: [null, Validators.required],
      totalPages: [null, [Validators.required, Validators.min(1)]],
      imageFile: [null],
      tagIds: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAuthors();
    this.loadTags();
    this.bookId = this.route.snapshot.params['id'];
    if (this.bookId) {
      this.isEditMode = true;
      this.bookService.getBook(this.bookId).subscribe((data: GetBook) => {
        this.bookForm.patchValue(data);
        if (data.imageUrl) {
          this.imagePreviewUrl = environment.rootUrl + data.imageUrl;
        }
        if (data.tags) {
          const tagIds = data.tags.map(t => t.id);
          this.bookForm.setControl('tagIds', this.fb.array(tagIds || []));
        }
      });
    }
  }

  loadTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
      },
      error: (err) => {
        console.error('Error loading tags', err);
      }
    });
  }

  onTagChange(event: any) {
    const tagIds = <FormArray>this.bookForm.get('tagIds');

    if (event.target.checked) {
      tagIds.push(new FormControl(event.target.value));
    } else {
      const index = tagIds.controls.findIndex(x => x.value == event.target.value);
      tagIds.removeAt(index);
    }
  }

  isChecked(tagId: number): boolean {
    const tagIds = this.bookForm.get('tagIds') as FormArray;
    return tagIds.value.includes(tagId);
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
          this.bookService.assignTags(this.bookId!, bookData.tagIds).subscribe(() => {
            this.router.navigate(['/books']);
            this.isLoading = false;
          });
        }, () => {
          this.isLoading = false;
        });
      } else {
        this.bookService.addBook(bookData as CreateBook).subscribe((newBook) => {
          this.bookService.assignTags(newBook.id, bookData.tagIds).subscribe(() => {
            this.router.navigate(['/books']);
            this.isLoading = false;
          });
        }, () => {
          this.isLoading = false;
        });
      }
    }
  }
}