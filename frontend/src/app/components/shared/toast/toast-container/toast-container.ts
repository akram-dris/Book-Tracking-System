import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../services/notification';
import { ToastComponent } from '../toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.html',
  styleUrls: ['./toast-container.css']
})
export class ToastContainerComponent {
  private notificationService = inject(NotificationService);
  toasts = this.notificationService.toasts$;

  remove(id: number): void {
    this.notificationService.remove(id);
  }
}
