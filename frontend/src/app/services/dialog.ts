import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/shared/confirmation-dialog/confirmation-dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(Dialog);

  confirm(data: ConfirmationDialogData): Observable<boolean | undefined> {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialogComponent, {
      data,
      panelClass: 'cdk-overlay-pane',
      backdropClass: 'cdk-overlay-dark-backdrop',
      disableClose: false
    });

    return dialogRef.closed;
  }

  confirmDelete(itemName: string, itemType: string = 'item'): Observable<boolean | undefined> {
    return this.confirm({
      title: `Delete ${itemType}`,
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonVariant: 'error',
      icon: 'heroExclamationTriangle'
    });
  }
}
