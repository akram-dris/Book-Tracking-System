
import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../services/author.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GetAuthor } from '../../models/get-author.model';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroXMark, heroUserPlus, heroFunnel, heroArrowsUpDown, heroPlus } from '@ng-icons/heroicons/outline';
import { BookService } from '../../services/book.service';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

interface AuthorWithCount extends GetAuthor {
  bookCount?: number;
}

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [RouterModule, FormsModule, NgIconComponent, DatePipe, MatButtonModule],
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.css'],
  viewProviders: [provideIcons({ heroMagnifyingGlass, heroXMark, heroUserPlus, heroFunnel, heroArrowsUpDown, heroPlus })]
})
export class AuthorListComponent implements OnInit {
  authors: AuthorWithCount[] = [];
  filteredAuthors: AuthorWithCount[] = [];
  rootUrl: string = environment.rootUrl;
  searchQuery: string = '';
  sortBy: string = 'name-asc';
  isLoading: boolean = true;

  sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'books-desc', label: 'Most Books' },
    { value: 'books-asc', label: 'Least Books' },
    { value: 'recent', label: 'Recently Added' }
  ];

  constructor(
    private authorService: AuthorService,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    this.isLoading = true;
    this.authorService.getAuthors().subscribe(authors => {
      // Get book count for each author
      const bookCountRequests = authors.map(author => 
        this.bookService.getBooks().pipe()
      );

      forkJoin([...bookCountRequests]).subscribe(allBooks => {
        this.authors = authors.map((author, index) => {
          console.log('Author loaded:', author.name, 'ImageURL:', author.imageUrl, 'Full URL:', this.rootUrl + author.imageUrl);
          return {
            ...author,
            bookCount: allBooks[index].filter((book: any) => book.authorId === author.id).length
          };
        });
        this.applyFilters();
        this.isLoading = false;
      });
    });
  }

  applyFilters(): void {
    let result = [...this.authors];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(author => 
        author.name.toLowerCase().includes(query) ||
        (author.bio && author.bio.toLowerCase().includes(query))
      );
    }

    // Sort
    result = this.sortAuthors(result);

    this.filteredAuthors = result;
  }

  sortAuthors(authors: AuthorWithCount[]): AuthorWithCount[] {
    switch (this.sortBy) {
      case 'name-asc':
        return authors.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return authors.sort((a, b) => b.name.localeCompare(a.name));
      case 'books-desc':
        return authors.sort((a, b) => (b.bookCount || 0) - (a.bookCount || 0));
      case 'books-asc':
        return authors.sort((a, b) => (a.bookCount || 0) - (b.bookCount || 0));
      case 'recent':
        return authors.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return authors;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  deleteAuthor(id: number): void {
    if (confirm('Are you sure you want to delete this author?')) {
      this.authorService.deleteAuthor(id).subscribe(() => {
        this.loadAuthors();
      });
    }
  }

  onImageError(event: Event, author: AuthorWithCount): void {
    console.error('Failed to load image for author:', author.name, 'URL:', this.rootUrl + author.imageUrl);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
