import { Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { AuthorListComponent } from './components/author-list/author-list.component';
import { AuthorFormComponent } from './components/author-form/author-form.component';

import { AuthorDetailsComponent } from './components/author-details/author-details';
import { BookDetailsComponent } from './components/book-details/book-details';

export const routes: Routes = [
    { path: 'books', component: BookListComponent },
    { path: 'books/new', component: BookFormComponent },
    { path: 'books/edit/:id', component: BookFormComponent },
    { path: 'books/:id', component: BookDetailsComponent },
    { path: 'authors', component: AuthorListComponent },
    { path: 'authors/new', component: AuthorFormComponent },
    { path: 'authors/edit/:id', component: AuthorFormComponent },
    { path: 'authors/:id', component: AuthorDetailsComponent },
    { path: '', redirectTo: '/books', pathMatch: 'full' }
];
