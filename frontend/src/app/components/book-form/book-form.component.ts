import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthorService } from '../../services/author.service';
import { TagService } from '../../services/tag.service';
import { NgFor, CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { switchMap, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

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
    this.bookId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.bookId;

    const book$ = this.isEditMode ? this.bookService.getBook(this.bookId!) : of(null);

    forkJoin({
      authors: this.authorService.getAuthors(),
      tags: this.tagService.getTags(),
      book: book$
    }).subscribe(({ authors, tags, book }) => {
      console.log('Data loaded from forkJoin:', { authors, tags, book });
      this.authors = authors;
      this.tags = tags;

      if (this.isEditMode && book) {
        this.bookForm.patchValue(book);
        if (book.imageUrl) {
          this.imagePreviewUrl = environment.rootUrl + book.imageUrl;
        }
                          if (book.tags) {
                            console.log('book.tags:', book.tags);
                            const tagIds = book.tags.map(t => t.id);
                            console.log('Extracted tagIds:', tagIds);
                            this.bookForm.setControl('tagIds', this.fb.array(tagIds || []));
                            console.log('Book tags set in form:', this.bookForm.get('tagIds')?.value);
                          }      }
    });
  }

  onTagChange(event: any) {
    const tagIds = <FormArray>this.bookForm.get('tagIds');
    const tagId = parseInt(event.target.value, 10);

    if (event.target.checked) {
      tagIds.push(new FormControl(tagId));
    } else {
      const index = tagIds.controls.findIndex(x => x.value === tagId);
      if (index !== -1) {
        tagIds.removeAt(index);
      }
    }
  }

  isChecked(tagId: number): boolean {
    const tagIds = this.bookForm.get('tagIds') as FormArray;
    const result = tagIds.value.includes(tagId);
    console.log(`[DEBUG] isChecked: tagId=${tagId}, form.tagIds=${JSON.stringify(tagIds.value)}, result=${result}`);
    return result;
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
        this.bookService.updateBook(this.bookId, bookData as UpdateBook).pipe(
          switchMap(() => this.bookService.assignTags(this.bookId!, bookData.tagIds)),
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: () => this.router.navigate(['/books']),
          error: (err) => console.error(err)
        });
      } else {
        this.bookService.addBook(bookData as CreateBook).pipe(
          switchMap((newBook) => this.bookService.assignTags(newBook.id, bookData.tagIds)),
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: () => this.router.navigate(['/books']),
          error: (err) => console.error(err)
        });
      }
    }
  }
}