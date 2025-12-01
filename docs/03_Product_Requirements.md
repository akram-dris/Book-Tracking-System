# ** Project Requirements Document (PRD)**

**Project Name:** Book Tracking System

**Overview:**  
A system to track reading progress of books, log daily reading activity, manage authors and tags, set reading targets, and visualize progress using a GitHub-style heatmap calendar. The system aims to help readers monitor their reading habits, achieve goals, and analyze performance over time.

**Goals:**

- Provide a structured way to track reading per book.
    
- Allow users to set daily reading targets (low, medium, high).
    
- Visualize daily reading activity in a heatmap for easy tracking.
    
- Maintain notes per book or per reading session.
    
- Aggregate progress and show statistics like average pages per day.
    

**Target Users:**

- Avid readers.
    
- Students or professionals tracking study or reading goals.
    

**Tech Stack:**

- Database: PostgreSQL
    
- Backend: ASP.NET Core (C#)
    
- Frontend: Angular (TypeScript)
    

**Features:**

1. **Books Management:** Add, edit, delete books; link authors; assign multiple tags.
    
2. **Authors Management:** Add, edit, delete authors; view author details.
    
3. **Tags Management:** Add, edit, delete tags; assign tags to books; filter books by tags.
    
4. **Reading Sessions:** Log daily pages read with optional summary notes; unique session per book per day.
    
5. **Target Levels:** Standardized target levels (low, medium, high).
    
6. **Reading Targets:** Assign reading targets to books; define pages/day for each target.
    
7. **Reading Progress:** Track percentage completion per book per target; start/finish dates; auto-calculated.
    
8. **Notes:** Link notes to book or session; maintain content.
    
9. **Heatmap Calendar:** GitHub-style visualization; color intensity reflects pages read; filterable by book, tag, or target.
    
10. **Global Statistics:** Total pages read; average pages per day.
    

**Constraints & Considerations:**

- One reading session per book per day.
    
- Notes must link to at least a book or session.
    
- Heatmap must handle large datasets efficiently.
    
- System should be responsive for desktop and mobile users.
    

**Acceptance Criteria:**

- Users can create and manage books, authors, tags.
    
- Users can log reading sessions and see accurate progress percentages.
    
- Users can view a yearly heatmap representing pages read per day.
    
- Users can filter heatmap by book, tag, or target.
    
- Users can maintain notes and retrieve them easily.
    