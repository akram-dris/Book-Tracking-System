<div align="center">

# 📚 Book Tracking System

**A modern, full-stack web application for passionate readers to track their reading journey, manage their library, and visualize their progress.**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=.net)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-20-DD0031?logo=angular)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)

[Features](#-features) • [Quick Start](#-quick-start-with-docker) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📖 About The Project

Book Tracking System is a comprehensive reading management application designed for book lovers who want to track their reading habits, organize their library, and gain insights into their reading patterns. Built with modern technologies and best practices, it provides a seamless experience across devices with rich visualizations and powerful features.

### Why Book Tracking System?

- 📊 **Data-Driven Insights**: Visualize your reading patterns with interactive charts and heatmaps
- 🎯 **Goal-Oriented**: Set reading goals and track progress with precision
- 🏷️ **Organized**: Categorize books with custom tags and manage multiple authors
- 📝 **Rich Content**: Add notes, summaries, and detailed information to your books
- 🚀 **Modern Stack**: Built with the latest versions of Angular, .NET, and PostgreSQL
- 🐳 **Easy Deployment**: One command to run the entire stack with Docker

## ✨ Features

### Core Features
- 📚 **Book Management**: Add, edit, and delete books with cover images, ratings, and detailed information
- ✍️ **Author Management**: Track authors with biographies, profile images, and their complete bibliography
- 🏷️ **Tag System**: Create custom tags to categorize and filter your books
- 📖 **Reading Sessions**: Log daily reading progress with page counts and notes
- 🎯 **Reading Goals**: Set targets and track completion with visual progress indicators
- 📅 **Heatmap Calendar**: GitHub-style heatmap showing your reading activity throughout the year

### Advanced Features
- 📊 **Statistics Dashboard**: Comprehensive analytics including books read, total pages, reading streaks, and trends
- 🔍 **Smart Search**: Quick search across books and authors
- 💡 **Recommendations**: Get personalized book recommendations based on your reading history
- 📝 **Rich Text Notes**: Add formatted notes to reading sessions and book summaries
- 📱 **Responsive Design**: Beautiful UI that works seamlessly on desktop, tablet, and mobile
- 🌓 **Dark Mode**: Eye-friendly dark theme support

## 🛠️ Tech Stack

<table>
<tr>
<td width="50%" valign="top">

### Frontend
- **Framework**: Angular 20 (TypeScript)
- **UI Components**: Angular Material, PrimeNG
- **Styling**: TailwindCSS, DaisyUI
- **Charts**: Chart.js, D3.js
- **Rich Text**: Quill Editor
- **Forms**: ng-select, Flatpickr
- **Animations**: Anime.js
- **Image Handling**: Image cropper, Dropzone

</td>
<td width="50%" valign="top">

### Backend
- **Framework**: ASP.NET Core 10 (C#)
- **ORM**: Entity Framework Core
- **Database**: PostgreSQL 15
- **API Docs**: Swagger/OpenAPI
- **Mapping**: AutoMapper
- **Validation**: Data Annotations

</td>
</tr>
<tr>
<td colspan="2">

### DevOps & Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for frontend)
- **Database**: Persistent PostgreSQL volume
- **Auto-Migrations**: Automatic database schema updates

</td>
</tr>
</table>

## 🚀 Quick Start with Docker

The easiest way to run the Book Tracking System is using Docker. This method requires minimal setup and works on Windows, macOS, and Linux.

### Prerequisites
- [Docker](https://www.docker.com/get-started) (20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Book-Tracking-System
   ```

2. **Start the application** (this will build and start all services)
   ```bash
   docker compose up -d
   ```

   **What happens:**
   - ✅ Builds optimized Docker images for frontend and backend
   - ✅ Pulls PostgreSQL 15 Alpine image
   - ✅ Creates persistent volume for database
   - ✅ Starts all three containers
   - ✅ Automatically applies database migrations
   - ✅ Waits for database to be ready before starting backend

3. **Access the application**
   
   - 🌐 **Web App**: [http://localhost](http://localhost)
   - 📡 **API (Swagger)**: [http://localhost:5000](http://localhost:5000)
   - 🗄️ **Database**: `localhost:5432` (credentials in `docker-compose.yml`)

4. **View logs** (optional)
   ```bash
   # All services
   docker compose logs -f
   
   # Specific service
   docker compose logs -f frontend
   docker compose logs -f backend
   docker compose logs -f db
   ```

5. **Stop the application**
   ```bash
   docker compose down
   ```

6. **Stop and remove all data** (including database)
   ```bash
   docker compose down -v
   ```

### Rebuilding After Changes

If you modify the code, rebuild the images:
```bash
docker compose up -d --build
```

## 💻 Development Setup (Without Docker)

For active development, you may prefer running services locally.

### Prerequisites
- **.NET 10 SDK**: [Download here](https://dotnet.microsoft.com/download)
- **Node.js 18+** (LTS): [Download here](https://nodejs.org/)
- **PostgreSQL 15+**: [Download here](https://www.postgresql.org/download/)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   dotnet restore
   ```

3. **Setup database**
   - Create a PostgreSQL database named `booktracking`
   - Copy environment template:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and set your connection string:
     ```env
     DB_CONNECTION_STRING=Host=localhost;Port=5432;Database=booktracking;Username=postgres;Password=yourpassword
     ```

4. **Apply migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the backend**
   ```bash
   dotnet run
   ```
   
   Backend will be available at:
   - API: `http://localhost:5162`
   - Swagger: `http://localhost:5162/swagger`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL** (if needed)
   
   Edit `src/environments/environment.ts` to point to your backend:
   ```typescript
   export const environment = {
     production: false,
     rootUrl: 'http://localhost:5162',
     apiUrl: 'http://localhost:5162/api'
   };
   ```

4. **Run the development server**
   ```bash
   npm start
   # or: ng serve
   ```
   
   Frontend will be available at: `http://localhost:4200`

### Building for Production

**Backend:**
```bash
cd backend
dotnet publish -c Release -o ./publish
```

**Frontend:**
```bash
cd frontend
npm run build
# Output in: dist/frontend/browser/
```

## 📁 Project Structure

```
Book-Tracking-System/
│
├── 📂 backend/                    # ASP.NET Core API
│   ├── Controllers/               # REST API controllers
│   ├── Models/                    # Entity models (database)
│   ├── DTOs/                      # Data Transfer Objects
│   ├── Services/                  # Business logic layer
│   ├── Repository/                # Data access layer
│   ├── Data/                      # DbContext
│   ├── Migrations/                # EF Core migrations
│   ├── Profiles/                  # AutoMapper profiles
│   ├── ValidationAttributes/      # Custom validation
│   ├── Dockerfile                 # Backend container image
│   ├── Program.cs                 # Application entry point
│   ├── .env.example               # Environment template
│   └── README.md                  # Backend documentation
│
├── 📂 frontend/                   # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/        # UI components
│   │   │   ├── services/          # HTTP & state services
│   │   │   ├── models/            # TypeScript interfaces
│   │   │   ├── directives/        # Custom directives
│   │   │   ├── app.routes.ts      # Routing configuration
│   │   │   └── app.config.ts      # App configuration
│   │   ├── environments/          # Environment configs
│   │   ├── assets/                # Images, icons, etc.
│   │   └── styles.css             # Global styles
│   ├── Dockerfile                 # Frontend container image
│   ├── nginx.conf                 # Nginx configuration
│   └── README.md                  # Frontend documentation
│
├── 📂 docs/                       # Project documentation
│   ├── 01_API_Specification.md
│   ├── 02_Database_Schema.md
│   ├── 03_Product_Requirements.md
│   ├── 04_Technical_Specification.md
│   └── 05_User_Stories.md
│
├── 📄 docker-compose.yml          # Container orchestration
├── 📄 CONTRIBUTING.md             # Contribution guidelines
├── 📄 LICENSE                     # License information
└── 📄 README.md                   # This file
```

## 🏗️ Architecture

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        User Browser                       │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTP :80
                        ▼
┌──────────────────────────────────────────────────────────┐
│              Frontend Container (Nginx)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │           Angular 20 Application                   │  │
│  │  • Components • Services • Routing • State        │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │ REST API :5000
                        ▼
┌──────────────────────────────────────────────────────────┐
│           Backend Container (ASP.NET Core)               │
│  ┌────────────────────────────────────────────────────┐  │
│  │              REST API Layer                        │  │
│  │          Controllers + Swagger Docs                │  │
│  ├────────────────────────────────────────────────────┤  │
│  │           Business Logic Layer                     │  │
│  │    Services + Validation + AutoMapper              │  │
│  ├────────────────────────────────────────────────────┤  │
│  │          Data Access Layer                         │  │
│  │    Repositories + EF Core + Migrations             │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │ PostgreSQL :5432
                        ▼
┌──────────────────────────────────────────────────────────┐
│          Database Container (PostgreSQL 15)              │
│  ┌────────────────────────────────────────────────────┐  │
│  │        Persistent Volume (postgres_data)           │  │
│  │  • Authors  • Books  • Tags  • Sessions  • Goals  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Key Design Patterns

- **3-Tier Architecture**: Clear separation between presentation, business logic, and data layers
- **Repository Pattern**: Abstraction over data access logic
- **Service Layer**: Centralized business logic
- **DTO Pattern**: Separation of API contracts from domain models
- **Dependency Injection**: Loose coupling and testability

## 🗄️ Database Schema

The PostgreSQL database includes the following main entities:

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **Authors** | Author information | Name, Biography, ImageUrl |
| **Books** | Book details | Title, TotalPages, CurrentPage, Rating, AuthorId |
| **Tags** | Custom categories | Name |
| **BookTagAssignments** | Book-Tag relationships | BookId, TagId |
| **ReadingSessions** | Daily reading logs | BookId, Date, PagesRead, Notes |
| **ReadingGoals** | Reading targets | BookId, TargetDate, TargetPages, IsActive |
| **ReadingStatus** | Book completion status | BookId, Status, StartedDate, CompletedDate |

**Indexes:**
- Foreign keys for efficient joins
- Date columns for quick filtering
- Composite indexes on frequently queried combinations

See [Database Schema Documentation](docs/02_Database_Schema.md) for detailed information.

## 📡 API Documentation

The backend provides a comprehensive REST API documented with Swagger/OpenAPI.

### Access Swagger UI
- **Docker**: [http://localhost:5000](http://localhost:5000)
- **Local Dev**: [http://localhost:5162/swagger](http://localhost:5162/swagger)

### Main API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET/POST/PUT/DELETE /api/books` | Manage books |
| `GET/POST/PUT/DELETE /api/authors` | Manage authors |
| `GET/POST/PUT/DELETE /api/tags` | Manage tags |
| `GET/POST/PUT/DELETE /api/readingsessions` | Manage reading sessions |
| `GET/POST/PUT/DELETE /api/readinggoals` | Manage reading goals |
| `GET /api/heatmap/{year}` | Get heatmap data |
| `GET /api/statistics` | Get reading statistics |
| `GET /api/search?query=...` | Search books/authors |
| `GET /api/recommendations` | Get reading recommendations |

See [API Specification](docs/01_API_Specification.md) for complete endpoint details.

## 🐳 Docker Details

### Container Images

1. **Frontend Image** (~55MB)
   - Base: `node:lts` (build stage) + `nginx:alpine` (runtime)
   - Multi-stage build for optimal size
   - Production-optimized Angular build

2. **Backend Image** (~245MB)
   - Base: `mcr.microsoft.com/dotnet/sdk:10.0` (build) + `mcr.microsoft.com/dotnet/aspnet:10.0` (runtime)
   - Includes automatic migration runner with retry logic

3. **Database Image**
   - Official `postgres:15-alpine`
   - Persistent volume: `postgres_data`

### Environment Configuration

Edit `docker-compose.yml` to customize:

```yaml
services:
  db:
    environment:
      POSTGRES_USER: your_username      # Change this
      POSTGRES_PASSWORD: your_password  # Change this
      POSTGRES_DB: booktracking
  
  backend:
    environment:
      - DB_CONNECTION_STRING=Host=db;Port=5432;Database=booktracking;Username=your_username;Password=your_password
```

### Docker Commands Cheat Sheet

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d frontend

# Rebuild all images
docker compose build

# Rebuild and start
docker compose up -d --build

# View logs
docker compose logs -f [service_name]

# Stop all services
docker compose down

# Stop and remove volumes (deletes database!)
docker compose down -v

# Execute command in running container
docker compose exec backend dotnet ef migrations add MigrationName
docker compose exec db psql -U postgres -d booktracking

# View running containers
docker compose ps
```

## 📚 Documentation

- [API Specification](docs/01_API_Specification.md) - Complete API reference
- [Database Schema](docs/02_Database_Schema.md) - Database structure and relationships
- [Product Requirements](docs/03_Product_Requirements.md) - Feature specifications
- [Technical Specification](docs/04_Technical_Specification.md) - Architecture and design
- [User Stories](docs/05_User_Stories.md) - User-centric feature descriptions
- [Frontend README](frontend/README.md) - Frontend-specific documentation
- [Backend README](backend/README.md) - Backend-specific documentation

## 🔒 Security & Production Notes

### Current Setup (Development/Demo)
- Default PostgreSQL credentials in `docker-compose.yml`
- CORS policy allows all origins
- Swagger enabled in production builds

### For Production Deployment
- [ ] Change database credentials
- [ ] Configure specific CORS origins
- [ ] Enable HTTPS/TLS
- [ ] Set up environment-specific configurations
- [ ] Implement authentication (JWT planned)
- [ ] Configure proper logging and monitoring
- [ ] Set up database backups
- [ ] Use secrets management (Docker secrets, Azure Key Vault, etc.)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of Conduct
- Development workflow
- Coding standards
- Pull request process

## 📝 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## 🆘 Troubleshooting

### Common Issues

**Problem**: `docker: command not found`
- **Solution**: Install Docker Desktop from [docker.com](https://www.docker.com/get-started)

**Problem**: Port 80 or 5000 already in use
- **Solution**: Stop the service using that port, or modify ports in `docker-compose.yml`

**Problem**: Frontend can't connect to backend
- **Solution**: Check that `environment.prod.ts` has correct API URL (default: `http://localhost:5000/api`)

**Problem**: Database migration fails
- **Solution**: Backend retries 10 times with 5-second intervals. Check `docker compose logs backend` for errors.

**Problem**: Changes not reflected after rebuild
- **Solution**: Use `docker compose up -d --build --force-recreate`

## 📞 Support

- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Submit an issue with the `enhancement` label
- 💬 **Questions**: Use GitHub Discussions

---

<div align="center">

**Built with ❤️ for book lovers everywhere**

[⬆ Back to Top](#-book-tracking-system)

</div>
