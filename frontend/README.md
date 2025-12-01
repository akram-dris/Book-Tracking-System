# Book Tracking System - Frontend

Angular-based frontend application for the Book Tracking System, providing a modern and responsive UI for managing your reading journey.

## 🎯 Overview

This is the client-side application built with Angular 20, featuring a rich set of components for book management, reading progress tracking, and data visualization.

## 🛠️ Tech Stack

### Core Framework
- **Angular 20.3** - Latest Angular framework with standalone components
- **TypeScript 5.9** - Type-safe development
- **RxJS 7.8** - Reactive programming

### UI Libraries
- **Angular Material 20.2** - Material Design components
- **TailwindCSS 4.1** - Utility-first CSS framework
- **DaisyUI 5.3** - Tailwind CSS component library
- **PrimeNG 20.3** - Rich UI component library

### Visualization & Data
- **Chart.js 4.5** with ng2-charts - Charts and graphs
- **D3.js 7.9** - Heatmap visualization
- **ngx-skeleton-loader 11.3** - Loading placeholders

### Rich Text & Media
- **Quill 2.0** with ngx-quill - Rich text editor for notes
- **ngx-markdown 20.1** - Markdown rendering
- **ngx-image-cropper 7.0** - Image cropping for covers
- **ngx-dropzone 3.1** - File upload

### Form Controls
- **@ng-select/ng-select 20.7** - Advanced select dropdowns
- **flatpickr 4.6** with angularx-flatpickr - Date picker
- **hammerjs 2.0** - Touch gestures

### Other Features
- **ng-toast 2.0** - Toast notifications
- **ngx-infinite-scroll 20.0** - Infinite scrolling
- **ngx-pagination 6.0** - Pagination
- **Swiper 12.0** - Carousels and sliders
- **animejs 4.2** - Advanced animations

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/          # UI Components
│   │   │   ├── dashboard/       # Dashboard with stats
│   │   │   ├── book-list/       # Book management
│   │   │   ├── book-details/    # Book details
│   │   │   ├── author-list/     # Author management
│   │   │   ├── author-details/  # Author details
│   │   │   ├── tag-management/  # Tag management
│   │   │   ├── tag-details/     # Tag details
│   │   │   ├── heatmap/         # Reading heatmap
│   │   │   ├── statistics/      # Statistics page
│   │   │   ├── session-log/     # Reading sessions
│   │   │   └── ...             # Other components
│   │   ├── services/            # HTTP Services
│   │   │   ├── author.ts
│   │   │   ├── book.ts
│   │   │   ├── tag.ts
│   │   │   ├── reading-session.ts
│   │   │   ├── reading-goal.ts
│   │   │   ├── heatmap.ts
│   │   │   ├── statistic.ts
│   │   │   └── ...
│   │   ├── models/              # TypeScript Models
│   │   │   ├── author.model.ts
│   │   │   ├── book.model.ts
│   │   │   ├── tag.model.ts
│   │   │   └── ...
│   │   ├── directives/          # Custom Directives
│   │   ├── app.routes.ts        # Routing configuration
│   │   ├── app.config.ts        # Application configuration
│   │   └── app.ts               # Root component
│   ├── environments/            # Environment configs
│   │   ├── environment.ts       # Development
│   │   └── environment.prod.ts  # Production
│   ├── assets/                  # Static assets
│   ├── styles.css              # Global styles
│   └── main.ts                 # Application entry point
├── public/                     # Public assets
├── angular.json                # Angular configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
├── Dockerfile                 # Docker build instructions
└── nginx.conf                 # Nginx configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)
- **Angular CLI** (optional but recommended)

### Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Development uses `src/environments/environment.ts`
   - Update API URL if backend runs on a different port:
     ```typescript
     export const environment = {
       production: false,
       rootUrl: 'http://localhost:5162',
       apiUrl: 'http://localhost:5162/api'
     };
     ```

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any source files.

### Building for Production

```bash
npm run build
# or
ng build --configuration production
```

The build artifacts will be stored in the `dist/frontend/browser/` directory.

### Running with Docker

```bash
# From the project root
docker compose up frontend
```

## 🧩 Key Components

### Dashboard
- **Location**: `src/app/components/dashboard/`
- **Purpose**: Main landing page with reading statistics and quick actions
- **Features**: Book count, reading streak, current books, recent activity

### Book Management
- **List**: `src/app/components/book-list/` - Browse and search books
- **Details**: `src/app/components/book-details/` - View and edit book information
- **Features**: Cover upload, tag assignment, rating, progress tracking

### Author Management
- **List**: `src/app/components/author-list/` - Browse authors
- **Details**: `src/app/components/author-details/` - Author biography and books
- **Features**: Image upload, biography editing, book list

### Tag System
- **Management**: `src/app/components/tag-management/` - Create and manage tags
- **Details**: `src/app/components/tag-details/` - View books by tag
- **Features**: Tag creation, editing, deletion, book assignment

### Reading Sessions
- **Session Log**: `src/app/components/session-log/` - View all sessions
- **Modal**: `src/app/components/reading-log-modal/` - Add/edit sessions
- **Features**: Daily page logging, date selection, notes

### Visualizations
- **Heatmap**: `src/app/components/heatmap/` - Calendar heatmap of reading activity
- **Statistics**: `src/app/components/statistics/` - Detailed reading statistics
- **Features**: D3.js visualization, year selection, filtering

## 🔧 Services

### HTTP Services
All services use the `HttpClient` for API communication and are located in `src/app/services/`.

#### BookService (`book.ts`)
```typescript
- getBooks(): Observable<Book[]>
- getBook(id: number): Observable<Book>
- createBook(book: CreateBookDto): Observable<Book>
- updateBook(id: number, book: UpdateBookDto): Observable<Book>
- deleteBook(id: number): Observable<void>
- updateBookRating(id: number, rating: number): Observable<Book>
```

#### AuthorService (`author.ts`)
```typescript
- getAuthors(): Observable<Author[]>
- getAuthor(id: number): Observable<Author>
- createAuthor(author: CreateAuthorDto): Observable<Author>
- updateAuthor(id: number, author: UpdateAuthorDto): Observable<Author>
- deleteAuthor(id: number): Observable<void>
```

#### TagService (`tag.ts`)
```typescript
- getTags(): Observable<Tag[]>
- getTag(id: number): Observable<Tag>
- createTag(tag: CreateTagDto): Observable<Tag>
- updateTag(id: number, tag: UpdateTagDto): Observable<Tag>
- deleteTag(id: number): Observable<void>
```

#### ReadingSessionService (`reading-session.ts`)
```typescript
- getSessions(bookId?: number): Observable<ReadingSession[]>
- createSession(session: CreateSessionDto): Observable<ReadingSession>
- updateSession(id: number, session: UpdateSessionDto): Observable<ReadingSession>
- deleteSession(id: number): Observable<void>
```

#### HeatmapService (`heatmap.ts`)
```typescript
- getHeatmapData(year: number): Observable<HeatmapData[]>
- getAvailableYears(): Observable<number[]>
```

#### StatisticsService (`statistic.ts`)
```typescript
- getStatistics(): Observable<Statistics>
- getReadingTrends(): Observable<ReadingTrend[]>
```

## 🎨 Styling

### TailwindCSS
The project uses TailwindCSS with custom configuration in `tailwind.config.js`.

#### Custom Colors
- Primary: Indigo shades
- Dark mode support with `dark:` variants

#### Usage Example
```html
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Title</h2>
</div>
```

### Angular Material
Material components are themed with custom palette. See `src/styles.css` for theme configuration.

### Global Styles
Located in `src/styles.css`:
- Material theme customization
- TailwindCSS imports
- Global CSS variables
- Dark mode styles

## 🧪 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Angular style guide
- Use standalone components (no NgModules)
- Prefer signals and modern Angular features
- Use `@if` and `@for` control flow (not `*ngIf`/`*ngFor`)

### Component Structure
```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ...],
  templateUrl: './example.html',
  styleUrls: ['./example.css']
})
export class ExampleComponent {
  // Use signals for reactive state
  data = signal<DataType[]>([]);
  
  constructor(private service: DataService) {}
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.service.getData().subscribe(data => {
      this.data.set(data);
    });
  }
}
```

### State Management
- Use Angular signals for local state
- Use services with BehaviorSubject for shared state
- Avoid unnecessary global state

### Performance
- Use `ChangeDetectionStrategy.OnPush` where possible
- Implement virtual scrolling for long lists
- Lazy load routes and components
- Use skeleton loaders for better UX

## 🔍 Testing

### Run Unit Tests
```bash
npm test
# or
ng test
```

### Run End-to-End Tests
```bash
npm run e2e
# or
ng e2e
```

## 🐳 Docker

### Build Docker Image
```bash
docker build -t book-tracking-frontend .
```

### Run Docker Container
```bash
docker run -p 80:80 book-tracking-frontend
```

### Nginx Configuration
The `nginx.conf` file configures:
- Static file serving
- Client-side routing support (SPA)
- Optional API proxy configuration

## 📝 Environment Variables

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  rootUrl: 'http://localhost:5162',
  apiUrl: 'http://localhost:5162/api'
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  rootUrl: 'http://localhost:5000',
  apiUrl: 'http://localhost:5000/api'
};
```

## 🔗 Related Documentation
- [Main README](../README.md)
- [Backend README](../backend/README.md)
- [API Specification](../docs/01_API_Specification.md)
- [Technical Specification](../docs/04_Technical_Specification.md)

## 🤝 Contributing

When contributing to the frontend:
1. Follow the Angular style guide
2. Write unit tests for new components
3. Update documentation for new features
4. Ensure the app builds without errors
5. Test in both light and dark modes
6. Check responsive design on mobile

## 📄 License

This project is part of the Book Tracking System. See the [main LICENSE](../LICENSE) for details.
