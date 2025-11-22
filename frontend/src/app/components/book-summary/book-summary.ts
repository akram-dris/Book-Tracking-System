import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { BookService } from '../../services/book.service';
import { GetBook } from '../../models/get-book.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { environment } from '../../../environments/environment';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-book-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './book-summary.html',
  styleUrls: ['./book-summary.css']
})
export class BookSummaryComponent implements OnInit {
  book: GetBook | undefined;
  rootUrl = environment.rootUrl;
  isEditMode: boolean = false;
  summaryForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.summaryForm = this.fb.group({
      summary: ['', [Validators.required, Validators.maxLength(10000)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(+id);
    }
  }

  loadBook(id: number): void {
    this.bookService.getBook(id).subscribe(book => {
      this.book = book;

      // If book has no summary, start in edit mode
      if (!book.summary || book.summary.trim().length === 0) {
        this.isEditMode = true;
      } else {
        this.summaryForm.patchValue({ summary: book.summary });
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.book?.summary) {
      this.summaryForm.patchValue({ summary: this.book.summary });
    }
  }

  saveSummary(): void {
    if (this.summaryForm.valid && this.book) {
      const summaryText = this.summaryForm.get('summary')?.value;
      const startedDate = this.book.startedReadingDate ? new Date(this.book.startedReadingDate) : undefined;

      // Update book summary and status to Summarized
      this.bookService.updateBookStatus(
        this.book.id,
        ReadingStatus.Summarized,
        startedDate,
        this.book.completedDate ? new Date(this.book.completedDate) : new Date(),
        summaryText
      ).subscribe(() => {
        // Update local book object
        this.book!.summary = summaryText;
        this.book!.status = ReadingStatus.Summarized;
        this.isEditMode = false;
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.book?.summary) {
      this.summaryForm.patchValue({ summary: this.book.summary });
    }
  }

  goBack(): void {
    this.location.back();
  }

  getLastUpdateDate(): Date | null {
    return this.book?.completedDate ? new Date(this.book.completedDate) : null;
  }
}
