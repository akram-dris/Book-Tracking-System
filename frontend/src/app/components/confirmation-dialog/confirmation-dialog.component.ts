import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="text-xl">{{ data.title }}</h2>
    <mat-dialog-content class="mat-typography">
      <p class="text-base">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-3">
      <button mat-button [mat-dialog-close]="false" class="hover:bg-base-200 rounded-lg">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button mat-flat-button [color]="data.confirmColor || 'warn'" [mat-dialog-close]="true" class="rounded-lg shadow-md">
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) { }
}
