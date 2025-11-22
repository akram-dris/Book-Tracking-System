import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly defaultDuration = 4000;

    constructor(private snackBar: MatSnackBar) { }

    showSuccess(message: string, action: string = 'OK'): void {
        this.show(message, action, {
            duration: this.defaultDuration,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'bottom'
        });
    }

    showError(message: string, action: string = 'Dismiss'): void {
        this.show(message, action, {
            duration: 5000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'bottom'
        });
    }

    private show(message: string, action: string, config: MatSnackBarConfig): void {
        this.snackBar.open(message, action, config);
    }
}

