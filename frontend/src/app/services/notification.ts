import { Injectable, signal } from '@angular/core';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title?: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toasts = signal<Toast[]>([]);
    readonly toasts$ = this.toasts.asReadonly();
    private counter = 0;

    showSuccess(message: string, title: string = 'Success'): void {
        this.add({ message, type: 'success', title });
    }

    showError(message: string, title: string = 'Error'): void {
        this.add({ message, type: 'error', title });
    }

    showInfo(message: string, title: string = 'Info'): void {
        this.add({ message, type: 'info', title });
    }

    showWarning(message: string, title: string = 'Warning'): void {
        this.add({ message, type: 'warning', title });
    }

    remove(id: number): void {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }

    private add(toast: Omit<Toast, 'id'>): void {
        const id = this.counter++;
        const newToast = { ...toast, id, duration: toast.duration || 5000 };

        this.toasts.update(current => [...current, newToast]);

        if (newToast.duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, newToast.duration);
        }
    }
}


