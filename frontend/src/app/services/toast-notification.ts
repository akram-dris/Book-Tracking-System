import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastNotificationService {
  
  success(message: string, title?: string): void {
    // TODO: Implement ng-toast integration when types are available
    console.log('Success:', title || 'Success', message);
  }
  
  error(message: string, title?: string): void {
    console.error('Error:', title || 'Error', message);
  }
  
  info(message: string, title?: string): void {
    console.info('Info:', title || 'Info', message);
  }
  
  warning(message: string, title?: string): void {
    console.warn('Warning:', title || 'Warning', message);
  }
}
