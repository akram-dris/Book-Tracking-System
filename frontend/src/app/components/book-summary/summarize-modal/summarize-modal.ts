import { Component, EventEmitter, Input, OnInit, Output, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../../services/book';
import { NotificationService } from '../../../services/notification';
import { ReadingStatus } from '../../../models/enums/reading-status.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroDocumentText, heroXMark, heroCheck } from '@ng-icons/heroicons/outline';

@Component({
    selector: 'app-summarize-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
    templateUrl: './summarize-modal.html',
    styleUrls: ['./summarize-modal.css'],
    viewProviders: [provideIcons({ heroDocumentText, heroXMark, heroCheck })]
})
export class SummarizeModalComponent implements OnInit {
    @Input() bookId: number | null = null;
    @Input() bookTitle: string = '';
    @Input() existingSummary: string | null = null;
    @Input() startedDate: Date | string | undefined;
    @Input() completedDate: Date | string | undefined;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<string>();

    summaryForm: FormGroup;
    isLoading = false;
    private destroyRef = inject(DestroyRef);

    constructor(
        private fb: FormBuilder,
        private bookService: BookService,
        private notificationService: NotificationService
    ) {
        this.summaryForm = this.fb.group({
            summary: ['', [Validators.required, Validators.maxLength(10000)]]
        });
    }

    ngOnInit(): void {
        if (this.existingSummary) {
            this.summaryForm.patchValue({ summary: this.existingSummary });
        }
    }

    onCancel(): void {
        this.close.emit();
    }

    onSubmit(): void {
        if (this.summaryForm.invalid || !this.bookId) {
            return;
        }

        this.isLoading = true;
        const summaryText = this.summaryForm.get('summary')?.value;

        // Ensure dates are Date objects
        const start = this.startedDate ? new Date(this.startedDate) : undefined;
        const end = this.completedDate ? new Date(this.completedDate) : new Date();

        this.bookService.updateBookStatus(
            this.bookId,
            ReadingStatus.Summarized,
            start,
            end,
            summaryText
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (result) => {
                    this.isLoading = false;
                    if (result.isSuccess) {
                        this.notificationService.showSuccess('Summary saved successfully');
                        this.saved.emit(summaryText);
                        this.close.emit();
                    } else {

                        this.notificationService.showError('Failed to save summary');
                    }
                },
                error: (err) => {
                    this.isLoading = false;

                    this.notificationService.showError('An error occurred while saving');
                }
            });
    }
}
