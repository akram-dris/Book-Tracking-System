# ** Technical Specification / System Design Document (TSD)**

**Project:** Book Tracking System  
**Stack:**

- **Database:** PostgreSQL
    
- **Backend:** ASP.NET Core (C#) with Entity Framework Core
    
- **Frontend:** Angular (TypeScript)
    

---

## **1. System Architecture**

The system follows a **3-tier architecture**:

1. **Presentation Layer (Frontend – Angular)**
    
    - Components: Book management, session logging, reading progress, notes, heatmap calendar.
        
    - Services: HTTP services for API calls.
        
    - Responsibilities: Display data, handle user interactions, input validation, and send requests to backend APIs.
        
2. **Business Logic Layer (Backend – ASP.NET Core)**
    
    - Controllers: Expose REST APIs for books, authors, tags, reading sessions, targets, progress, notes, and heatmap.
        
    - Services: Handle business logic, calculation of reading progress, validation rules, target assignments.
        
    - Repository: Interfaces for database access using EF Core.
        
3. **Data Layer (PostgreSQL)**
    
    - Tables: authors, books, book_tags, book_tag_assignments, reading_sessions, target_levels, reading_targets, reading_progress, notes, settings.
        
    - Relationships: Fully normalized with proper constraints and indexes.
        
    - Indexes: `(book_id, date)` on reading_sessions for fast retrieval and heatmap aggregation.
        

---

## **2. Database Overview**

- **Authors**: Manage author info. Linked to books.
    
- **Books**: Stores book details, linked to authors and tags.
    
- **Book Tags**: Many-to-many relationship with books via `book_tag_assignments`.
    
- **Reading Sessions**: Daily logs per book; unique per book per day.
    
- **Target Levels**: Standard target types (low, medium, high).
    
- **Reading Targets**: Book-specific targets, linked to target levels.
    
- **Reading Progress**: Tracks percentage completion, start and finish dates, per target.
    
- **Notes**: Can link to books or reading sessions.
    
- **Settings**: Global stats (total pages read, average pages/day).
    

**Indexes & Constraints**:

- Unique session per book per day.
    
- Unique target per book per level.
    
- Notes must link to at least a book or session.
    

---

## **3. API Endpoints**

### **Books**

- `GET /api/books` – List all books
    
- `GET /api/books/{id}` – Get book details
    
- `POST /api/books` – Add new book
    
- `PUT /api/books/{id}` – Update book
    
- `DELETE /api/books/{id}` – Delete book
    

### **Authors**

- `GET /api/authors` – List authors
    
- `POST /api/authors` – Add author
    
- `PUT /api/authors/{id}` – Update author
    
- `DELETE /api/authors/{id}` – Delete author
    

### **Tags**

- `GET /api/tags` – List tags
    
- `POST /api/tags` – Add tag
    
- `PUT /api/tags/{id}` – Update tag
    
- `DELETE /api/tags/{id}` – Delete tag
    
- `POST /api/books/{id}/tags` – Assign tags to book
    

### **Reading Sessions**

- `GET /api/sessions?bookId=&start=&end=` – List sessions
    
- `POST /api/sessions` – Add session
    
- `PUT /api/sessions/{id}` – Update session
    
- `DELETE /api/sessions/{id}` – Delete session
    

### **Targets & Progress**

- `GET /api/targets?bookId=` – List reading targets
    
- `POST /api/targets` – Add target
    
- `PUT /api/progress/{id}` – Update progress
    

### **Heatmap**

- `GET /api/heatmap?year=&bookId=&tagId=&targetId=` – Return daily pages for calendar visualization
    

---

## **4. Backend Design**

- **Controllers**: Separate controllers for books, authors, tags, sessions, targets, progress, notes.
    
- **Services**:
    
    - ReadingService: Calculate progress, average pages/day.
        
    - HeatmapService: Aggregate sessions to generate yearly calendar data.
        
- **Repository Layer**: Handles EF Core queries, joins, and aggregation.
    
- **Validation Rules**:
    
    - Session pages must be positive
        
    - Book total pages ≥ sum of session pages
        
    - Unique session per book per day
        

---

## **5. Frontend Design (Angular)**

**Components:**

1. Book List / Detail Component – CRUD books, assign tags
    
2. Author List Component – Manage authors
    
3. Tag Management Component – Add, edit, assign tags
    
4. Reading Session Component – Daily session log, edit, delete
    
5. Progress Component – Show reading progress per book and target
    
6. Notes Component – Add notes to book or session
    
7. Heatmap Component – Yearly calendar visualization
    
8. Global Stats Component – Total pages, average pages/day
    

**Services:**

- `BookService`, `AuthorService`, `TagService`, `SessionService`, `ProgressService`, `HeatmapService`
    

**UI/UX Considerations:**

- Responsive layout for desktop and mobile
    
- Tooltip on heatmap squares for pages read
    
- Filter heatmap by book, tag, target
    

---

## **6. Data Flow**

1. **User Action → Angular Component → HTTP Request → Backend Controller → Service → Repository → PostgreSQL**
    
2. **Data returned → Service → Controller → Angular Component → Display to user**
    

---

## **7. Business Logic**

- Calculate **percentage completion**: `(sum of pages read / total pages for target) * 100`
    
- Compute **average pages per day**: `total pages read / total days with sessions`
    
- Aggregate **heatmap data** per day for visualization
    
- Update **global stats** dynamically or via scheduled background task
    

---

## **8. Security & Authentication**

- Authentication: JWT tokens for user sessions (future multi-user support)
    
- Authorization: Admin vs regular user roles (optional)
    
- Input validation: Backend and frontend validation for all forms
    

---

## **9. Deployment & Environment**

- PostgreSQL: Production and staging databases
    
- ASP.NET Core backend: API hosted on IIS, Docker, or Kestrel
    
- Angular frontend: Deployed on same domain or separate host
    
- Environment variables for connection strings, JWT secrets, and app configuration
    
