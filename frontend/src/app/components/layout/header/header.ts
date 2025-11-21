import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
import { SearchService } from '../../../services/search.service';
import { SearchResult } from '../../../models/search-result.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { CommonModule } from '@angular/common';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  imports: [NgIconComponent, StreakIndicatorComponent, FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
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
  rootUrl = environment.rootUrl;
  private searchSubject = new Subject<string>();

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;

  constructor(
    private router: Router,
    private searchService: SearchService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          return of(null);
        }
        return this.searchService.search(query).pipe(
          catchError(() => of(null))
        );
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.showDropdown = !!results && (results.books.length > 0 || results.authors.length > 0 || results.tags.length > 0);
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
    }
  }

  onSearchFocus(): void {
    if (this.searchQuery && this.searchQuery.length >= 2 && this.searchResults) {
      this.showDropdown = true;
    }
  }

  onSearchSubmit(): void {
    this.showDropdown = false;
    this.router.navigate(['/books'], {
      queryParams: { search: this.searchQuery || null },
      queryParamsHandling: 'merge'
    });
  }

  navigateToBook(id: number): void {
    this.showDropdown = false;
    this.router.navigate(['/books', id]);
    this.searchQuery = '';
  }

  navigateToAuthor(id: number): void {
    this.showDropdown = false;
    this.router.navigate(['/authors', id]);
    this.searchQuery = '';
  }

  navigateToTag(id: number): void {
    this.showDropdown = false;
    this.router.navigate(['/books'], { queryParams: { tagId: id } });
    this.searchQuery = '';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target) &&
      this.searchInput && !this.searchInput.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
