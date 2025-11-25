import { Component, ElementRef, HostListener, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroSun,
  heroMoon,
  heroBookOpen,
  heroUser,
  heroTag
} from '@ng-icons/heroicons/outline';
import { StreakIndicatorComponent } from '../../streak-sidebar/streak-indicator';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search';
import { SearchResult } from '../../../models/search-result.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, map, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  imports: [NgIconComponent, StreakIndicatorComponent, FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      heroMagnifyingGlass,
      heroSun,
      heroMoon,
      heroBookOpen,
      heroUser,
      heroTag
    })
  ]
})
export class HeaderComponent {
  isDarkMode = false;
  searchQuery: string = '';
  searchResults: SearchResult | null = null;
  showDropdown = false;
  isSearching = false;
  selectedIndex = -1;
  rootUrl = environment.rootUrl;
  private searchSubject = new Subject<string>();

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;

  constructor(
    private router: Router,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(150), // Reduced from 300ms to 150ms for faster response
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.isSearching = false;
          this.selectedIndex = -1;
          this.cdr.markForCheck();
          return of(null);
        }
        this.isSearching = true;
        this.cdr.markForCheck();
        return this.searchService.search(query).pipe(
          map(result => {
            if (result.isSuccess && result.data) {
              return result.data;
            }
            return null;
          }),
          catchError(() => of(null)),
          finalize(() => {
            this.isSearching = false;
            this.cdr.markForCheck();
          })
        );
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.showDropdown = !!results; // Show dropdown if we have a results object, even if empty
      this.selectedIndex = -1;
      this.cdr.markForCheck();
    });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.setAttribute(
      'data-theme',
      this.isDarkMode ? 'dark' : 'light'
    );
  }

  onSearchInput(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
    if (!query) {
      this.showDropdown = false;
      this.selectedIndex = -1;
      this.cdr.markForCheck();
    }
  }

  onSearchFocus(): void {
    if (this.searchQuery && this.searchQuery.length >= 2 && this.searchResults) {
      this.showDropdown = true;
    }
  }

  onSearchSubmit(): void {
    if (this.selectedIndex >= 0) {
      this.selectCurrentItem();
    } else {
      this.showDropdown = false;
      this.router.navigate(['/books'], {
        queryParams: { search: this.searchQuery || null },
        queryParamsHandling: 'merge'
      });
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (!this.showDropdown || !this.searchResults) return;

    const allResults = [
      ...(this.searchResults.books || []).map(b => ({ type: 'book', id: b.id })),
      ...(this.searchResults.authors || []).map(a => ({ type: 'author', id: a.id })),
      ...(this.searchResults.tags || []).map(t => ({ type: 'tag', id: t.id }))
    ];

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, allResults.length - 1);
      this.cdr.markForCheck();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
      this.cdr.markForCheck();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.showDropdown = false;
      this.selectedIndex = -1;
      this.cdr.markForCheck();
    } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
      event.preventDefault();
      this.selectCurrentItem();
    }
  }

  private selectCurrentItem(): void {
    if (!this.searchResults) return;

    const allResults = [
      ...(this.searchResults.books || []).map(b => ({ type: 'book', id: b.id })),
      ...(this.searchResults.authors || []).map(a => ({ type: 'author', id: a.id })),
      ...(this.searchResults.tags || []).map(t => ({ type: 'tag', id: t.id }))
    ];

    const selected = allResults[this.selectedIndex];
    if (selected) {
      if (selected.type === 'book') {
        this.navigateToBook(selected.id!);
      } else if (selected.type === 'author') {
        this.navigateToAuthor(selected.id!);
      } else if (selected.type === 'tag') {
        this.navigateToTag(selected.id!);
      }
    }
  }

  getResultIndex(type: string, index: number): number {
    if (!this.searchResults) return -1;

    let offset = 0;
    if (type === 'author') {
      offset = this.searchResults.books?.length || 0;
    } else if (type === 'tag') {
      offset = (this.searchResults.books?.length || 0) + (this.searchResults.authors?.length || 0);
    }
    return offset + index;
  }

  navigateToBook(id: number): void {
    this.showDropdown = false;
    this.selectedIndex = -1;
    this.router.navigate(['/books', id]);
    this.searchQuery = '';
  }

  navigateToAuthor(id: number): void {
    this.showDropdown = false;
    this.selectedIndex = -1;
    this.router.navigate(['/authors', id]);
    this.searchQuery = '';
  }

  navigateToTag(id: number): void {
    this.showDropdown = false;
    this.selectedIndex = -1;
    this.router.navigate(['/books'], { queryParams: { tagId: id } });
    this.searchQuery = '';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target) &&
      this.searchInput && !this.searchInput.nativeElement.contains(event.target)) {
      this.showDropdown = false;
      this.selectedIndex = -1;
      this.cdr.markForCheck();
    }
  }
}
