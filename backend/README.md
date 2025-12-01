# Book Tracking System - Backend API

ASP.NET Core 10 REST API for the Book Tracking System, providing a robust backend for managing books, authors, reading sessions, and statistics.

## 🎯 Overview

This is the server-side application built with ASP.NET Core 10, featuring RESTful APIs, Entity Framework Core for database access, and automatic database migrations.

## 🛠️ Tech Stack

### Core Framework
- **ASP.NET Core 10.0** - Web API framework
- **Entity Framework Core 10.0** - ORM for database access
- **C# 13** with nullable reference types
- **Npgsql.EntityFrameworkCore.PostgreSQL 10.0** - PostgreSQL provider

### Libraries & Tools
- **AutoMapper 12.0** - Object-to-object mapping
- **Swashbuckle (Swagger) 10.0** - API documentation
- **DotNetEnv 3.1** - Environment variable management

## 📁 Project Structure

```
backend/
├── Controllers/             # API Controllers
│   ├── AuthorsController.cs
│   ├── BooksController.cs
│   ├── TagsController.cs
│   ├── ReadingSessionsController.cs
│   ├── ReadingGoalsController.cs
│   ├── HeatmapController.cs
│   ├── StatisticsController.cs
│   ├── SearchController.cs
│   └── RecommendationController.cs
├── Models/                  # Entity Models
│   ├── Author.cs
│   ├── Book.cs
│   ├── Tag.cs
│   ├── BookTagAssignment.cs
│   ├── ReadingSession.cs
│   ├── ReadingGoal.cs
│   └── ReadingStatus.cs
├── DTOs/                    # Data Transfer Objects
│   ├── Author/
│   ├── Book/
│   ├── Tag/
│   ├── ReadingSession/
│   └── ...
├── Services/                # Business Logic
│   ├── IBookService.cs
│   ├── BookService.cs
│   ├── IAuthorService.cs
│   ├── AuthorService.cs
│   ├── ITagService.cs
│   ├── TagService.cs
│   ├── IReadingSessionService.cs
│   ├── ReadingSessionService.cs
│   ├── IHeatmapService.cs
│   ├── HeatmapService.cs
│   ├── IStatisticsService.cs
│   ├── StatisticsService.cs
│   └── ...
├── Repository/              # Data Access Layer
│   ├── IBookRepository.cs
│   ├── BookRepository.cs
│   ├── IAuthorRepository.cs
│   ├── AuthorRepository.cs
│   └── ...
├── Data/                    # Database Context
│   └── ApplicationDbContext.cs
├── Migrations/              # EF Core Migrations
│   ├── 20251028120153_InitialCreate.cs
│   ├── 20251029114418_UpdateBookTitle.cs
│   └── ...
├── Profiles/                # AutoMapper Profiles
│   └── MappingProfile.cs
├── ValidationAttributes/    # Custom Validation
│   ├── DateNotInFutureAttribute.cs
│   └── PositivePagesAttribute.cs
├── Properties/
│   └── launchSettings.json
├── appsettings.json         # Configuration
├── appsettings.Development.json
├── .env.example             # Environment template
├── .env                     # Environment variables (gitignored)
├── Program.cs               # Application entry point
├── Dockerfile               # Docker build instructions
└── BookTrackingSystem.Api.csproj
```

## 🚀 Getting Started

### Prerequisites
- **.NET 10 SDK** - [Download](https://dotnet.microsoft.com/download)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **IDE**: Visual Studio 2022, VS Code, or JetBrains Rider

### Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies** (RestorePackages):
   ```bash
   dotnet restore
   ```

3. **Setup PostgreSQL**:
   - Create a database named `booktracking`
   - Note your connection details (host, port, username, password)

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database connection:
   ```
   DB_CONNECTION_STRING=Host=localhost;Port=5432;Database=booktracking;Username=postgres;Password=yourpassword
   ```

5. **Apply migrations**:
   ```bash
   dotnet ef database update
   ```

### Development Server

```bash
dotnet run
```

The API will be available at:
- HTTP: `http://localhost:5162`
- Swagger UI: `http://localhost:5162/swagger`

### Building for Production

```bash
dotnet build -c Release
dotnet publish -c Release -o ./publish
```

### Running with Docker

```bash
# From the project root
docker compose up backend
```

## 📡 API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book
- `PUT /api/books/{id}/rating` - Update book rating
- `GET /api/books/{id}/sessions` - Get book reading sessions
- `GET /api/books/{id}/statistics` - Get book statistics

### Authors
- `GET /api/authors` - Get all authors
- `GET /api/authors/{id}` - Get author by ID
- `POST /api/authors` - Create new author
- `PUT /api/authors/{id}` - Update author
- `DELETE /api/authors/{id}` - Delete author (cascade deletes books)
- `GET /api/authors/{id}/books` - Get author's books

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/{id}` - Get tag by ID
- `POST /api/tags` - Create new tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag (cascade deletes assignments)
- `GET /api/tags/{id}/books` - Get books with tag

### Reading Sessions
- `GET /api/readingsessions` - Get all sessions (optional `bookId` filter)
- `GET /api/readingsessions/{id}` - Get session by ID
- `POST /api/readingsessions` - Create new session
- `PUT /api/readingsessions/{id}` - Update session
- `DELETE /api/readingsessions/{id}` - Delete session

### Reading Goals
- `GET /api/readinggoals` - Get all goals
- `GET /api/readinggoals/{id}` - Get goal by ID
- `POST /api/readinggoals` - Create new goal
- `PUT /api/readinggoals/{id}` - Update goal
- `DELETE /api/readinggoals/{id}` - Delete goal
- `GET /api/readinggoals/active` - Get active goals

### Heatmap
- `GET /api/heatmap/{year}` - Get heatmap data for year
- `GET /api/heatmap/years` - Get available years with data

### Statistics
- `GET /api/statistics` - Get overall reading statistics
- `GET /api/statistics/trends` - Get reading trends
- `GET /api/statistics/monthly` - Get monthly statistics

### Search
- `GET /api/search?query={query}` - Search across books and authors

### Recommendations
- `GET /api/recommendations` - Get book recommendations based on reading history

## 🗄️ Database

### Entity Framework Core

The application uses EF Core with PostgreSQL. Key entities include:

**Author**
- Id, Name, Biography, ImageUrl, CreatedAt, UpdatedAt
- Navigation: Books

**Book**
- Id, Title, TotalPages, CurrentPage, AuthorId, CoverImageUrl, Rating, Summary
- Navigation: Author, Sessions, Goals, Tags (via BookTagAssignments)

**Tag**
- Id, Name, CreatedAt
- Navigation: Books (via BookTagAssignments)

**ReadingSession**
- Id, BookId, Date, PagesRead, Notes, Duration
- Navigation: Book

**ReadingGoal**
- Id, BookId, TargetDate, TargetPages, IsActive, CreatedAt
- Navigation: Book

### Migrations

Create a new migration:
```bash
dotnet ef migrations add MigrationName
```

Apply migrations:
```bash
dotnet ef database update
```

Remove last migration:
```bash
dotnet ef migrations remove
```

Generate SQL script:
```bash
dotnet ef migrations script
```

### Database Indexes

The following indexes are automatically created:
- `IX_Books_AuthorId` - Foreign key index
- `IX_ReadingSessions_BookId` - Foreign key index
- `IX_ReadingSessions_Date` - Date filtering
- `IX_ReadingGoals_BookId` - Foreign key index
- `IX_BookTagAssignments_BookId` - Foreign key index
- `IX_BookTagAssignments_TagId` - Foreign key index

## 🔧 Services

### Service Layer Architecture

The application follows a layered architecture:
1. **Controller** → Handles HTTP requests
2. **Service** → Business logic
3. **Repository** → Data access
4. **DbContext** → Database operations

### Key Services

#### BookService
```csharp
Task<IEnumerable<Book>> GetAllBooksAsync();
Task<Book?> GetBookByIdAsync(int id);
Task<Book> CreateBookAsync(CreateBookDto dto);
Task<Book?> UpdateBookAsync(int id, UpdateBookDto dto);
Task<bool> DeleteBookAsync(int id);
Task<Book?> UpdateBookRatingAsync(int id, int rating);
```

#### AuthorService
```csharp
Task<IEnumerable<Author>> GetAllAuthorsAsync();
Task<Author?> GetAuthorByIdAsync(int id);
Task<Author> CreateAuthorAsync(CreateAuthorDto dto);
Task<Author?> UpdateAuthorAsync(int id, UpdateAuthorDto dto);
Task<bool> DeleteAuthorAsync(int id); // Cascade delete
```

#### HeatmapService
```csharp
Task<IEnumerable<HeatmapDataDto>> GetHeatmapDataAsync(int year);
Task<IEnumerable<int>> GetAvailableYearsAsync();
```

#### StatisticsService
```csharp
Task<StatisticsDto> GetOverallStatisticsAsync();
Task<IEnumerable<TrendDataDto>> GetReadingTrendsAsync();
Task<MonthlyStatsDto> GetMonthlyStatisticsAsync(int year, int month);
```

## 🔒 CORS Configuration

The API allows all origins for development:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});
```

**⚠️ For production**: Configure specific allowed origins.

## 🐳 Docker

### Automatic Migrations

The Dockerfile and `Program.cs` are configured to automatically apply migrations on startup:

```csharp
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate(); // Auto-apply migrations
}
```

This includes retry logic (10 retries, 5-second intervals) to wait for PostgreSQL to be ready.

### Build Docker Image

```bash
docker build -t book-tracking-backend .
```

### Run Docker Container

```bash
docker run -p 5000:8080 \
  -e DB_CONNECTION_STRING="Host=db;Port=5432;Database=booktracking;Username=postgres;Password=password" \
  book-tracking-backend
```

## 📝 Environment Variables

### Required Variables

- `DB_CONNECTION_STRING` - PostgreSQL connection string
- `ASPNETCORE_URLS` - (Optional) Override listening URLs

### Example .env

```env
DB_CONNECTION_STRING=Host=localhost;Port=5432;Database=booktracking;Username=postgres;Password=yourpassword
```

## 🧪 Testing

### Run Tests

```bash
dotnet test
```

### Test Coverage

```bash
dotnet test /p:CollectCoverage=true
```

## 🔍 Logging

The application uses ASP.NET Core's built-in logging:

```csharp
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Database migration successful.");
```

Logs include:
- Database migration status
- HTTP requests (in development)
- Errors and exceptions

## 📊 Swagger/OpenAPI

Swagger is enabled in all environments for easier API testing in Docker.

Access Swagger UI:
- Development: `http://localhost:5162/swagger`
- Docker: `http://localhost:5000/swagger`

The API is documented with:
- Operation summaries
- Request/response schemas
- Example values

## 🛡️ Validation

### Built-in Validation

DTOs use data annotations:

```csharp
public class CreateBookDto
{
    [Required]
    [StringLength(500)]
    public required string Title { get; set; }

    [Range(1, int.MaxValue)]
    public int TotalPages { get; set; }

    [Range(0, int.MaxValue)]
    public int CurrentPage { get; set; }
}
```

### Custom Validation Attributes

**DateNotInFutureAttribute** - Ensures dates are not in the future
**PositivePagesAttribute** - Ensures page counts are positive

## 🔗 Related Documentation

- [Main README](../README.md)
- [Frontend README](../frontend/README.md)
- [API Specification](../docs/01_API_Specification.md)
- [Database Schema](../docs/02_Database_Schema.md)
- [Technical Specification](../docs/04_Technical_Specification.md)

## 🤝 Contributing

When contributing to the backend:
1. Follow C# coding conventions
2. Write unit tests for new services
3. Create migrations for schema changes
4. Update API documentation (XML comments)
5. Ensure all endpoints return proper HTTP status codes
6. Validate input using DTOs and validation attributes

## 📄 License

This project is part of the Book Tracking System. See the [main LICENSE](../LICENSE) for details.
