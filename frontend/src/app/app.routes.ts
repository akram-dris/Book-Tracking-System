import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'books',
        loadComponent: () => import('./components/book-list/book-list.component').then(m => m.BookListComponent)
    },
    {
        path: 'books/new',
        loadComponent: () => import('./components/book-form/book-form.component').then(m => m.BookFormComponent)
    },
    {
        path: 'books/:id/edit',
        loadComponent: () => import('./components/book-form/book-form.component').then(m => m.BookFormComponent)
    },
    {
        path: 'books/:id/summary',
        loadComponent: () => import('./components/book-summary/book-summary').then(m => m.BookSummaryComponent)
    },
    {
        path: 'books/:id',
        loadComponent: () => import('./components/book-details/book-details').then(m => m.BookDetailsComponent)
    },
    {
        path: 'authors',
        loadComponent: () => import('./components/author-list/author-list.component').then(m => m.AuthorListComponent)
    },
    {
        path: 'authors/new',
        loadComponent: () => import('./components/author-form/author-form.component').then(m => m.AuthorFormComponent)
    },
    {
        path: 'authors/:id/edit',
        loadComponent: () => import('./components/author-form/author-form.component').then(m => m.AuthorFormComponent)
    },
    {
        path: 'authors/:id',
        loadComponent: () => import('./components/author-details/author-details').then(m => m.AuthorDetailsComponent)
    },
    {
        path: 'tags',
        loadComponent: () => import('./components/tag-management/tag-management.component').then(m => m.TagManagementComponent)
    },
    {
        path: 'books/:bookId/session/log',
        loadComponent: () => import('./components/session-log/session-log.component').then(m => m.SessionLogComponent)
    },
    {
        path: 'heatmap',
        loadComponent: () => import('./components/heatmap/heatmap').then(m => m.HeatmapComponent)
    },
    {
        path: 'statistics',
        loadComponent: () => import('./components/statistics/statistics').then(m => m.StatisticsComponent)
    },
    {
        path: 'recommendations',
        loadComponent: () => import('./components/recommendations/recommendations').then(m => m.RecommendationsComponent)
    }
];
