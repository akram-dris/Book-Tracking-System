# Book Tracking System

A full-stack web application for tracking your reading progress, managing books, authors, and tags, with visualizations including heatmaps and statistics.

## 📚 Features

- **Book Management**: Add, edit, and delete books with author information
- **Author Management**: Track authors with images and biographies
- **Tag System**: Categorize books with custom tags
- **Reading Sessions**: Log daily reading progress
- **Reading Goals**: Set and track reading targets
- **Heatmap Calendar**: Visualize reading activity over time
- **Statistics Dashboard**: View reading stats and trends
- **Search & Recommendations**: Find books and get personalized recommendations
- **Notes & Summaries**: Add notes to reading sessions and book summaries

## 🛠️ Tech Stack

### Frontend
- **Angular 20** (TypeScript)
- **Angular Material** for UI components
- **TailwindCSS** for styling
- **Chart.js** for data visualization
- **D3.js** for heatmap visualization
- **Quill** for rich text editing

### Backend
- **ASP.NET Core 10** (C#)
- **Entity Framework Core** for ORM
- **PostgreSQL** database
- **Swagger** for API documentation

### DevOps
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Nginx** for frontend serving

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker](https://www.docker.com/get-started) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### Running the Application

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Book-Tracking-System
   ```

2. **Start all services**:
   ```bash
   docker compose up -d
   ```

   This command will:
   - Pull the PostgreSQL image
   - Build the backend and frontend images
   - Start all containers
   - Automatically apply database migrations

3. **Access the application**:
   - **Frontend**: [http://localhost](http://localhost)
   - **Backend API (Swagger)**: [http://localhost:5000](http://localhost:5000)
   - **Database**: `localhost:5432` (for direct connections)

4. **Stop the application**:
   ```bash
   docker compose down
   ```

5. **Stop and remove all data** (including database):
   ```bash
   docker compose down -v
   ```

### Viewing Logs

```bash
# View all logs
docker compose logs

# View logs for a specific service
docker compose logs frontend
docker compose logs backend
docker compose logs db

# Follow logs in real-time
docker compose logs -f
```

## 🔧 Development Setup

### Without Docker

#### Backend Setup

1. **Install .NET 10 SDK**:
   - Download from [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)

2. **Setup PostgreSQL**:
   - Install PostgreSQL 15+
   - Create a database named `booktracking`

3. **Configure the backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database connection string
   ```

4. **Run migrations**:
   ```bash
   dotnet ef database update
   ```

5. **Run the backend**:
   ```bash
   dotnet run
   ```

#### Frontend Setup

1. **Install Node.js** (LTS version):
   - Download from [https://nodejs.org/](https://nodejs.org/)

2. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm start
   ```

4. **Access the app**:
   - Frontend: [http://localhost:4200](http://localhost:4200)
   - Backend: [http://localhost:5162](http://localhost:5162)

## 📁 Project Structure

```
Book-Tracking-System/
├── backend/              # ASP.NET Core API
│   ├── Controllers/      # API controllers
│   ├── Models/           # Entity models
│   ├── DTOs/             # Data transfer objects
│   ├── Services/         # Business logic
│   ├── Repository/       # Data access layer
│   ├── Migrations/       # EF Core migrations
│   ├── Dockerfile        # Backend Docker image
│   └── Program.cs        # Application entry point
├── frontend/             # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI components
│   │   │   ├── services/    # HTTP services
│   │   │   └── models/      # TypeScript models
│   │   └── environments/    # Environment configs
│   ├── Dockerfile        # Frontend Docker image
│   └── nginx.conf        # Nginx configuration
├── docs/                 # Documentation
│   ├── 01_API_Specification.md
│   ├── 02_Database_Schema.md
│   ├── 03_Product_Requirements.md
│   ├── 04_Technical_Specification.md
│   └── 05_User_Stories.md
└── docker-compose.yml    # Docker orchestration
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Authors**: Author information and biographies
- **Books**: Book details, pages, ratings
- **Tags**: Categorization system
- **ReadingSessions**: Daily reading logs
- **ReadingGoals**: Target tracking
- **BookTagAssignments**: Many-to-many relationship

See [Database Schema Documentation](docs/02_Database_Schema.md) for details.

## 📡 API Documentation

When running the application, visit [http://localhost:5000](http://localhost:5000) to access the interactive Swagger API documentation.

Key endpoints:
- `/api/books` - Book CRUD operations
- `/api/authors` - Author management
- `/api/tags` - Tag management
- `/api/readingsessions` - Reading session logs
- `/api/readinggoals` - Goal tracking
- `/api/heatmap` - Heatmap data
- `/api/statistics` - Reading statistics

See [API Specification](docs/01_API_Specification.md) for complete details.

## 🐳 Docker Architecture

The application consists of three services:

1. **Frontend** (Nginx + Angular):
   - Multi-stage build (Node.js → Nginx)
   - Serves the compiled Angular app
   - Port: 80

2. **Backend** (ASP.NET Core):
   - Multi-stage build (SDK → Runtime)
   - Auto-applies database migrations on startup
   - Port: 5000

3. **Database** (PostgreSQL 15):
   - Persistent volume for data
   - Port: 5432

### Environment Variables

The backend uses these environment variables (configured in `docker-compose.yml`):

```bash
DB_CONNECTION_STRING=Host=db;Port=5432;Database=booktracking;Username=postgres;Password=password
ASPNETCORE_URLS=http://+:8080
```

## 🔒 Security Notes

- Change default PostgreSQL credentials in production
- The current setup is for development/demo purposes
- JWT authentication is planned for multi-user support

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📝 License

See [LICENSE](LICENSE) file for details.

## 📞 Support

For issues or questions, please open a GitHub issue.
