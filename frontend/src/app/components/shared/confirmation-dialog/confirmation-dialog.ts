import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ButtonComponent } from '../button/button';
import { NgIconComponent } from '@ng-icons/core';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'error' | 'warning' | 'success';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  imports: [ButtonComponent, NgIconComponent],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.css',
  standalone: true
})
export class ConfirmationDialogComponent {
  dialogRef = inject(DialogRef<boolean>);
  data = inject<ConfirmationDialogData>(DIALOG_DATA);

  get confirmText(): string {
    return this.data.confirmText || 'Confirm';
  }

  get cancelText(): string {
    return this.data.cancelText || 'Cancel';
  }

  get confirmVariant(): 'primary' | 'error' | 'warning' | 'success' {
    return this.data.confirmButtonVariant || 'primary';
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
