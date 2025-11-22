import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ReadingGoalService } from '../../services/reading-goal.service';
import { BookService } from '../../services/book.service';
import { GetReadingGoal } from '../../models/get-reading-goal.model';
import { ReadingStatus } from '../../models/enums/reading-status.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-plan-and-goal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './plan-and-goal-modal.component.html',
  styleUrls: ['./plan-and-goal-modal.component.css']
})
export class PlanAndGoalModalComponent implements OnInit {
  @Input() bookId: number | null = null;
  @Input() initialStartedReadingDate: Date | undefined;
  @Input() initialReadingGoal: GetReadingGoal | null = null;
  @Input() totalPages: number | null = null; // New input
  @Output() saved = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  planAndGoalForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private readingGoalService: ReadingGoalService,
    private bookService: BookService
  ) {
    this.planAndGoalForm = this.fb.group({
      targetStartDate: [this.formatDate(new Date()), Validators.required],
      lowGoal: [null, [Validators.required, Validators.min(1)]],
      mediumGoal: [null, [Validators.required, Validators.min(1)]],
      highGoal: [null, [Validators.required, Validators.min(1)]]
    }, { validators: this.goalHierarchyValidator });
  }

  ngOnInit(): void {
    if (this.initialStartedReadingDate) {
      this.planAndGoalForm.patchValue({ targetStartDate: this.formatDate(this.initialStartedReadingDate) });
    }
    if (this.initialReadingGoal) {
      this.planAndGoalForm.patchValue(this.initialReadingGoal);
    }
    this.updateHighGoalValidator();
  }

  updateHighGoalValidator(): void {
    if (this.totalPages) {
      this.planAndGoalForm.get('highGoal')?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.totalPages)
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
    if (this.planAndGoalForm.valid && this.bookId) {
      this.isLoading = true;
      const formData = this.planAndGoalForm.value;

      const targetStartDate = new Date(formData.targetStartDate);

      // Update book status and started reading date
      this.bookService.updateBookStatus(this.bookId as number, ReadingStatus.Planning, targetStartDate).subscribe({
        next: () => {
          // Add or update reading goal
          const goalData = {
            bookId: this.bookId as number,
            lowGoal: formData.lowGoal,
            mediumGoal: formData.mediumGoal,
            highGoal: formData.highGoal
          };

          if (this.initialReadingGoal) { // Edit mode for goal
            this.readingGoalService.updateReadingGoal(this.bookId as number, goalData).subscribe({
              next: () => {
                this.isLoading = false;
                this.saved.emit();
                this.close.emit();
              },
              error: (err) => {
                this.isLoading = false;
                console.error('Error updating reading goal', err);
              }
            });
          } else { // Create mode for goal
            this.readingGoalService.addReadingGoal(goalData).subscribe({
              next: () => {
                this.isLoading = false;
                this.saved.emit();
                this.close.emit();
              },
              error: (err) => {
                this.isLoading = false;
                console.error('Error creating reading goal', err);
              }
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating book status/date', err);
        }
      });
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}
