import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  imports: [NgClass],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.css',
  standalone: true
})
export class LoadingSpinnerComponent {
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  color = input<'primary' | 'secondary' | 'accent' | 'neutral'>('primary');
  
  get spinnerClasses(): string {
    const classes = ['loading', 'loading-spinner'];
    classes.push(`loading-${this.size()}`);
    classes.push(`text-${this.color()}`);
    return classes.join(' ');
  }
}
