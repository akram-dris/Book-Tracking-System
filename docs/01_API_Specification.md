# **API Specification Document**

**Project:** Book Tracking System  
**Stack:** ASP.NET Core (C#) backend with PostgreSQL

**Overview:**  
This document defines all REST API endpoints for the Book Tracking System, including **routes, request/response formats, parameters, and authentication rules**.

---

## **1. Books**

**1.1 Get All Books**

- **Endpoint:** `GET /api/books`
    
- **Query Parameters (optional):** `authorId`, `tagId`
    
- **Response:**
    

```json
[
  {
    "id": 1,
    "name": "Book Title",
    "authorId": 2,
    "avgPagesPerDay": 10,
    "tags": [{"id": 1, "name": "Fiction"}]
  }
]
```

**1.2 Get Book Details**

- **Endpoint:** `GET /api/books/{id}`
    
- **Response:**
    

```json
{
  "id": 1,
  "name": "Book Title",
  "authorId": 2,
  "avgPagesPerDay": 10,
  "tags": [{"id": 1, "name": "Fiction"}],
  "readingTargets": [
    {"level": "low", "pagesPerDay": 5},
    {"level": "medium", "pagesPerDay": 10},
    {"level": "high", "pagesPerDay": 20}
  ]
}
```

**1.3 Add a Book**

- **Endpoint:** `POST /api/books`
    
- **Request Body:**
    

```json
{
  "name": "Book Title",
  "authorId": 2,
  "totalPages": 300
}
```

- **Response:** `201 Created` with created book object
    

**1.4 Update a Book**

- **Endpoint:** `PUT /api/books/{id}`
    
- **Request Body:** Same as Add a Book
    
- **Response:** `200 OK` with updated book object
    

**1.5 Delete a Book**

- **Endpoint:** `DELETE /api/books/{id}`
    
- **Response:** `204 No Content`
    

---

## **2. Authors**

**2.1 Get All Authors** – `GET /api/authors`  
**2.2 Get Author Details** – `GET /api/authors/{id}`  
**2.3 Add Author** – `POST /api/authors`

```json
{
  "name": "Author Name",
  "bio": "Optional biography"
}
```

**2.4 Update Author** – `PUT /api/authors/{id}`  
**2.5 Delete Author** – `DELETE /api/authors/{id}`

---

## **3. Tags**

**3.1 Get All Tags** – `GET /api/tags`  
**3.2 Add Tag** – `POST /api/tags`

```json
{
  "name": "Fiction"
}
```

**3.3 Update Tag** – `PUT /api/tags/{id}`  
**3.4 Delete Tag** – `DELETE /api/tags/{id}`  
**3.5 Assign Tags to Book** – `POST /api/books/{bookId}/tags`

```json
{
  "tagIds": [1, 2, 3]
}
```

- Response: Updated tag list for the book
    

---

## **4. Reading Sessions**

**4.1 Get Sessions** – `GET /api/sessions?bookId=&start=&end=`

- Filters by book and date range
    
- Response:
    

```json
[
  {
    "id": 1,
    "bookId": 1,
    "date": "2025-10-27",
    "pagesRead": 10,
    "summary": "Read chapter 1-2"
  }
]
```

**4.2 Add Session** – `POST /api/sessions`

```json
{
  "bookId": 1,
  "date": "2025-10-27",
  "pagesRead": 10,
  "summary": "Read chapter 1-2"
}
```

**4.3 Update Session** – `PUT /api/sessions/{id}`  
**4.4 Delete Session** – `DELETE /api/sessions/{id}`

---

## **5. Reading Targets & Progress**

**5.1 Get Targets for Book** – `GET /api/targets?bookId=`  
**5.2 Add Target** – `POST /api/targets`

```json
{
  "bookId": 1,
  "levelId": 2,
  "pagesPerDay": 10
}
```

**5.3 Update Progress** – `PUT /api/progress/{id}`

```json
{
  "percentageComplete": 45.5,
  "startDate": "2025-10-01",
  "finishDate": "2025-10-30"
}
```

---

## **6. Notes**

**6.1 Get Notes for Book or Session** – `GET /api/notes?bookId=&sessionId=`  
**6.2 Add Note** – `POST /api/notes`

```json
{
  "bookId": 1,
  "sessionId": 5,
  "content": "Important points from chapter 1"
}
```

**6.3 Update Note** – `PUT /api/notes/{id}`  
**6.4 Delete Note** – `DELETE /api/notes/{id}`

---

## **7. Heatmap Calendar**

**7.1 Get Heatmap Data** – `GET /api/heatmap?year=&bookId=&tagId=&targetId=`

- Returns JSON with dates as keys and pages read as values:
    

```json
{
  "2025-01-01": 5,
  "2025-01-02": 10,
  "2025-01-03": 0
}
```

- Used to render GitHub-style heatmap with color intensity
    

---

## **8. Global Statistics**

**8.1 Get Global Stats** – `GET /api/stats`

- Response:
    

```json
{
  "totalReadingPages": 1025,
  "avgReadingPerDay": 12.5
}
```

---
