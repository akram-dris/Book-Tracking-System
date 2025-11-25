import { Component, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ReadingGoalService } from '../../services/reading-goal';
import { BookService } from '../../services/book';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-plan-and-goal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './plan-and-goal-modal.html',
  styleUrls: ['./plan-and-goal-modal.css']
})
export class PlanAndGoalModalComponent implements OnInit {
  bookId = input<number | null>(null);
  bookTitle = input('');
  initialStartedReadingDate = input<Date | undefined>(undefined);
  initialReadingGoal = input<GetReadingGoal | null>(null);
  totalPages = input<number | null>(null);
  saved = output<void>();
  close = output<void>();

  planAndGoalForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private readingGoalService: ReadingGoalService,
    private bookService: BookService,
    private notificationService: NotificationService
  ) {
    this.planAndGoalForm = this.fb.group({
      targetStartDate: [this.formatDate(new Date()), Validators.required],
      lowGoal: [null, [Validators.required, Validators.min(1)]],
      mediumGoal: [null, [Validators.required, Validators.min(1)]],
      highGoal: [null, [Validators.required, Validators.min(1)]]
    }, { validators: this.goalHierarchyValidator });
  }

  ngOnInit(): void {
    if (this.initialStartedReadingDate()) {
      this.planAndGoalForm.patchValue({ targetStartDate: this.formatDate(this.initialStartedReadingDate()!) });
    }
    if (this.initialReadingGoal()) {
      this.planAndGoalForm.patchValue(this.initialReadingGoal()!);
    }
    this.updateHighGoalValidator();
  }

  updateHighGoalValidator(): void {
    if (this.totalPages()) {
      this.planAndGoalForm.get('highGoal')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.totalPages()!)
      ]);
      this.planAndGoalForm.get('highGoal')?.updateValueAndValidity();
    }
  }

  goalHierarchyValidator(group: FormGroup): any {
    const low = group.get('lowGoal')?.value;
    const medium = group.get('mediumGoal')?.value;
    const high = group.get('highGoal')?.value;

    if (low && medium && low >= medium) {
      return { lowNotLessThanMedium: true };
    }
    if (medium && high && medium >= high) {
      return { mediumNotLessThanHigh: true };
    }
    return null;
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  onSubmit(): void {
    if (this.planAndGoalForm.valid && this.bookId()) {
      this.isLoading = true;
      const formData = this.planAndGoalForm.value;

      const targetStartDate = new Date(formData.targetStartDate);

      // Update book status and started reading date
      this.bookService.updateBookStatus(this.bookId() as number, ReadingStatus.Planning, targetStartDate).subscribe({
        next: (statusResult) => {
          if (!statusResult.isSuccess) {
            this.isLoading = false;
            console.error('Error updating book status/date', statusResult.errors);
            this.notificationService.showError('Failed to update book status');
            return;
          }

          // Add or update reading goal
          const goalData = {
            bookId: this.bookId() as number,
            lowGoal: formData.lowGoal,
            mediumGoal: formData.mediumGoal,
            highGoal: formData.highGoal
          };

          if (this.initialReadingGoal()) { // Edit mode for goal
            this.readingGoalService.updateReadingGoal(this.bookId() as number, goalData).subscribe({
              next: (goalResult) => {
                this.isLoading = false;
                if (goalResult.isSuccess) {
                  this.notificationService.showSuccess(`Book '${this.bookTitle()}' is now Planning`);
                  this.saved.emit();
                  this.close.emit();
                } else {
                  console.error('Error updating reading goal', goalResult.errors);
                  this.notificationService.showError('Failed to update reading goal');
                }
              },
              error: (err) => {
                this.isLoading = false;
                console.error('Error updating reading goal', err);
                this.notificationService.showError('Failed to update reading goal');
              }
            });
          } else { // Create mode for goal
            this.readingGoalService.addReadingGoal(goalData).subscribe({
              next: (goalResult) => {
                this.isLoading = false;
                if (goalResult.isSuccess) {
                  this.notificationService.showSuccess(`Book '${this.bookTitle()}' is now Planning`);
                  this.saved.emit();
                  this.close.emit();
                } else {
                  console.error('Error creating reading goal', goalResult.errors);
                  this.notificationService.showError('Failed to create reading goal');
                }
              },
              error: (err) => {
                this.isLoading = false;
                console.error('Error creating reading goal', err);
                this.notificationService.showError('Failed to create reading goal');
              }
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating book status/date', err);
          this.notificationService.showError('Failed to update book status');
        }
      });
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
