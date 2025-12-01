import { Directive, ElementRef, OnDestroy, OnInit, input, output } from '@angular/core';

@Directive({
    selector: '[appInfiniteScroll]',
    standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
    scrollThreshold = input(200); // Pixels from bottom to trigger loading
    scrolled = output<void>();

    private observer!: IntersectionObserver;
    private sentinel!: HTMLElement;

    constructor(private el: ElementRef) { }

    ngOnInit() {
        this.createSentinel();
        this.setupObserver();
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.sentinel && this.sentinel.parentNode) {
            this.sentinel.parentNode.removeChild(this.sentinel);
        }
    }

    private createSentinel() {
        this.sentinel = document.createElement('div');
        this.sentinel.style.height = `${this.scrollThreshold()}px`;
        this.sentinel.style.visibility = 'hidden';
        this.el.nativeElement.appendChild(this.sentinel);
    }

    private setupObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.scrolled.emit();
                }
            });
        }, options);

        this.observer.observe(this.sentinel);
    }
}
