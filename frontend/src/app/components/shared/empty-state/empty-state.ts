import { Component, input, output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-empty-state',
  imports: [NgIconComponent],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
  standalone: true
})
export class EmptyStateComponent {
  icon = input<string>('heroBookOpen');
  title = input<string>('No items found');
  description = input<string>('');
  actionLabel = input<string>('');
  action = output<void>();
}
