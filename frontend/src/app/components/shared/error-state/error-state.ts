import { Component, input, output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-error-state',
  imports: [NgIconComponent, ButtonComponent],
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
  standalone: true
})
export class ErrorStateComponent {
  title = input<string>('Something went wrong');
  message = input<string>('An unexpected error occurred. Please try again.');
  icon = input<string>('heroExclamationCircle');
  retryText = input<string>('Try Again');
  showRetry = input<boolean>(true);
  
  retry = output<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
