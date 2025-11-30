import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheckCircle, heroExclamationCircle, heroInformationCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { Toast } from '../../../services/notification';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
  viewProviders: [provideIcons({ heroCheckCircle, heroExclamationCircle, heroInformationCircle, heroXMark })]
})
export class ToastComponent {
  @Input() toast!: Toast;
  @Output() close = new EventEmitter<void>();

  get icon(): string {
    switch (this.toast.type) {
      case 'success': return 'heroCheckCircle';
      case 'error': return 'heroExclamationCircle';
      case 'warning': return 'heroExclamationCircle';
      case 'info': return 'heroInformationCircle';
      default: return 'heroInformationCircle';
    }
  }

  get typeClass(): string {
    switch (this.toast.type) {
      case 'success': return 'text-success';
      case 'error': return 'text-error';
      case 'warning': return 'text-warning';
      case 'info': return 'text-info';
      default: return 'text-info';
    }
  }
}
