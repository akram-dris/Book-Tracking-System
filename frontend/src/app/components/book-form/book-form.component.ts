import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthorService } from '../../services/author.service';
import { TagService } from '../../services/tag.service';
import { NgFor, CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { switchMap, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPhoto, heroPlus, heroBookOpen, heroUser, heroDocumentText, heroTag, heroPencil, heroArrowLeft } from '@ng-icons/heroicons/outline';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { GetBook } from '../../models/get-book.model';
import { CreateBook } from '../../models/create-book.model';
import { UpdateBook } from '../../models/update-book.model';
import { GetAuthor } from '../../models/get-author.model';
import { GetTag } from '../../models/get-tag.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule, NgFor, CommonModule, ImageCropperModule, NgSelectModule, NgxDropzoneModule, NgIconComponent, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule, MatAutocompleteModule, MatCardModule, MatDividerModule],
  providers: [provideIcons({ heroXMark, heroPhoto, heroPlus, heroBookOpen, heroUser, heroDocumentText, heroTag, heroPencil, heroArrowLeft })],
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

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  
  // For ng-select custom items
  selectedTags: any[] = [];
  
  // For Material chips
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private authorService: AuthorService,
    private tagService: TagService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      authorId: [null, Validators.required],
      totalPages: [null, [Validators.required, Validators.min(1)]],
      imageFile: [null],
      tagIds: [[]]
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
      this.authors = authors;
      this.tags = tags;

      if (this.isEditMode && book) {
        this.bookForm.patchValue({
          title: book.title,
          authorId: book.authorId,
          totalPages: book.totalPages
        });
        if (book.imageUrl) {
          this.imagePreviewUrl = environment.rootUrl + book.imageUrl;
        }
        if (book.tags) {
          const tagIds = book.tags.map(t => t.id);
          this.selectedTags = book.tags;
          this.bookForm.patchValue({ tagIds: tagIds });
        }
      }
    });
  }

  onTagsChange(tags: GetTag[]) {
    const tagIds = tags.map(t => t.id);
    this.bookForm.patchValue({ tagIds: tagIds });
  }
  
  removeTag(tag: GetTag) {
    this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
    this.onTagsChange(this.selectedTags);
  }
  
  removeTagById(tagId: number) {
    const currentTags = this.bookForm.get('tagIds')?.value || [];
    const updatedTags = currentTags.filter((id: number) => id !== tagId);
    this.bookForm.patchValue({ tagIds: updatedTags });
  }
  
  toggleTag(tagId: number) {
    const currentTags = this.bookForm.get('tagIds')?.value || [];
    const index = currentTags.indexOf(tagId);
    
    if (index > -1) {
      // Tag is already selected, remove it
      currentTags.splice(index, 1);
    } else {
      // Tag is not selected, add it
      currentTags.push(tagId);
    }
    
    this.bookForm.patchValue({ tagIds: [...currentTags] });
  }
  
  isTagSelected(tagId: number): boolean {
    const currentTags = this.bookForm.get('tagIds')?.value || [];
    return currentTags.includes(tagId);
  }
  
  getTagName(tagId: number): string {
    const tag = this.tags.find(t => t.id === tagId);
    return tag?.name || '';
  }
  
  onAuthorChange(authorId: number | null) {
    this.bookForm.patchValue({ authorId: authorId });
  }
  
  // Handle file drop - show preview directly
  onFilesAdded(files: File[]) {
    if (files.length > 0) {
      this.selectedFile = files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  getSelectedAuthorImage(authorId: number): string | null {
    const author = this.authors.find(a => a.id === authorId);
    return author?.imageUrl ? environment.rootUrl + author.imageUrl : null;
  }

  getRootUrl(): string {
    return environment.rootUrl;
  }
  
  onFileRemoved() {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.bookForm.patchValue({ imageFile: null });
  }

  onFileSelected(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.blob) {
      const reader = new FileReader();
      reader.readAsDataURL(event.blob);
      reader.onloadend = () => {
        this.croppedImage = reader.result;
      };
    } else {
      console.error('Cropped image blob data is not available.');
    }
  }

  saveCroppedImage() {
    if (this.croppedImage) {
      this.imagePreviewUrl = this.croppedImage;
      this.selectedFile = this.base64ToFile(this.croppedImage, this.imageChangedEvent.target.files[0].name);
      this.showCropper = false;
    } else {
      console.error('Cropped image is not available to save.');
    }
  }

  cancelCropping() {
    this.showCropper = false;
    this.imageChangedEvent = null;
  }

  base64ToFile(data: any, filename: string): File {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
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