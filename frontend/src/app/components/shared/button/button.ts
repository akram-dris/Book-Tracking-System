import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-button',
  imports: [NgClass, NgIconComponent],
  templateUrl: './button.html',
  styleUrl: './button.css',
  standalone: true
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'error' | 'success' | 'warning'>('primary');
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  loading = input<boolean>(false);
  disabled = input<boolean>(false);
  icon = input<string>();
  iconPosition = input<'left' | 'right'>('left');
  fullWidth = input<boolean>(false);
  
  clicked = output<MouseEvent>();

  get buttonClasses(): string {
    const classes = ['btn'];
    
    // Variant
    classes.push(`btn-${this.variant()}`);
    
    // Size
    classes.push(`btn-${this.size()}`);
    
    // Loading
    if (this.loading()) {
      classes.push('loading');
    }
    
    // Full width
    if (this.fullWidth()) {
      classes.push('btn-block');
    }
    
    return classes.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
