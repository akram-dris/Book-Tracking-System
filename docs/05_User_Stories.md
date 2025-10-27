# **User Stories / Use Case Document**

**Project:** Book Tracking System

**Overview:**  
This document lists detailed user stories for all major features of the Book Tracking System. Each story includes **role, goal, and acceptance criteria**.

---

### **Books / Authors / Tags**

**1. Add a Book**

- **As a** user
    
- **I want** to add a new book with title, author, and total pages
    
- **So that** I can start tracking my reading for this book
    
- **Acceptance Criteria:**
    
    - Book is saved with correct author reference
        
    - Total pages is a positive integer
        
    - Book appears in book list after creation
        

**2. Edit a Book**

- **As a** user
    
- **I want** to edit book details
    
- **So that** I can correct or update information
    
- **Acceptance Criteria:**
    
    - Changes are saved and reflected in book list
        
    - Cannot set total pages less than pages already read
        

**3. Delete a Book**

- **As a** user
    
- **I want** to delete a book
    
- **So that** I can remove unwanted books from the system
    
- **Acceptance Criteria:**
    
    - All related sessions, progress, and notes are handled (deleted or archived)
        

**4. Assign Tags to a Book**

- **As a** user
    
- **I want** to assign multiple tags to a book
    
- **So that** I can categorize and filter books
    
- **Acceptance Criteria:**
    
    - Multiple tags can be assigned
        
    - Tags are stored in a many-to-many relationship
        
    - User can remove or update tags
        

**5. Manage Authors**

- **As a** user
    
- **I want** to add/edit/delete authors
    
- **So that** I can organize my library by author
    
- **Acceptance Criteria:**
    
    - Author list updates dynamically
        
    - Deleting an author prompts handling of associated books
        

---

### **Reading Sessions**

**6. Log a Reading Session**

- **As a** user
    
- **I want** to log the number of pages I read on a given day
    
- **So that** I can track daily progress
    
- **Acceptance Criteria:**
    
    - Only one session per book per day
        
    - Pages read must be a positive integer
        
    - Summary note is optional
        

**7. Edit or Delete a Session**

- **As a** user
    
- **I want** to edit or delete a session
    
- **So that** I can correct mistakes
    
- **Acceptance Criteria:**
    
    - Session updates are saved correctly
        
    - Deleting a session updates progress calculations
        

---

### **Reading Targets & Progress**

**8. Set Reading Targets**

- **As a** user
    
- **I want** to assign low/medium/high targets for a book
    
- **So that** I can set realistic reading goals
    
- **Acceptance Criteria:**
    
    - Each book can have exactly one target per level
        
    - Pages/day is stored for each target
        

**9. View Reading Progress**

- **As a** user
    
- **I want** to see the completion percentage of a book per target
    
- **So that** I can know how close I am to finishing
    
- **Acceptance Criteria:**
    
    - Progress auto-calculates based on reading sessions
        
    - Displays start and finish dates if available
        

---

### **Notes**

**10. Add Notes**

- **As a** user
    
- **I want** to add notes linked to a book or reading session
    
- **So that** I can keep track of thoughts or summaries
    
- **Acceptance Criteria:**
    
    - Notes must link to either a book or a session
        
    - Notes can be edited or deleted
        

---

### **Heatmap / Visualization**

**11. View Heatmap**

- **As a** user
    
- **I want** to see a yearly calendar with colored squares representing pages read
    
- **So that** I can visualize my reading activity
    
- **Acceptance Criteria:**
    
    - Each day displays pages read
        
    - Color intensity reflects number of pages
        
    - Tooltip shows exact number of pages
        

**12. Filter Heatmap**

- **As a** user
    
- **I want** to filter the heatmap by book, tag, or target
    
- **So that** I can focus on specific reading goals
    
- **Acceptance Criteria:**
    
    - Filters apply dynamically
        
    - Heatmap updates without page reload
        

---

### **Global Statistics**

**13. View Global Stats**

- **As a** user
    
- **I want** to see total pages read and average pages per day
    
- **So that** I can track my overall reading performance
    
- **Acceptance Criteria:**
    
    - Stats reflect all reading sessions accurately
        
    - Stats update automatically as sessions are logged
        

---

This document is **ready to hand to the development team** as the base for backlog and sprint planning.

---

If you confirm, I can **generate the next document: Technical Specification / System Design Document (TSD)** in full text.

Do you want me to proceed with that?