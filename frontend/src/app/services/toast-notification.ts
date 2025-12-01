import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {

  success(message: string, title?: string): void {
    // Placeholder for toast notification
  }

  error(message: string, title?: string): void {

  }

  info(message: string, title?: string): void {

  }

  warning(message: string, title?: string): void {

  }
}
