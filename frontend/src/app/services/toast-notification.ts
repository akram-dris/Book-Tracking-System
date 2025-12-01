import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {

  success(message: string, title?: string): void {
    // TODO: Implement ng-toast integration when types are available

  }

  error(message: string, title?: string): void {

  }

  info(message: string, title?: string): void {

  }

  warning(message: string, title?: string): void {

  }
}
