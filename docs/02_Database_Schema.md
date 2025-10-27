``` dbml
// Authors table

Table authors {

id int [pk, increment] // Author ID

name varchar(255) // Author name

bio text // Optional biography

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

}

  

// Books table

Table books {

id int [pk, increment] // Book ID

author_id int [ref: > authors.id] // Reference to author

name varchar(255) // Book title

total_pages int // Total pages in the book

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

}

  

// Tags table

Table book_tags {

id int [pk, increment] // Tag ID

name varchar(255) // Tag name

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

}

  

// Junction table for book-tag many-to-many relationship

Table book_tag_assignments {

book_id int [ref: > books.id] // Reference to book

tag_id int [ref: > book_tags.id] // Reference to tag

primary key (book_id, tag_id)

}

  

// Reading sessions (daily or periodic reading details)

Table reading_sessions {

id int [pk, increment] // Session ID

book_id int [ref: > books.id] // Reference to book

date date // Date of reading activity

pages_read int // Pages read this session

summary text // Summary of this session

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

  

Indexes {

(book_id, date) [unique] // Ensure one session per book per day

(date) // For fast aggregation

}

}

  

// Target levels table (low, medium, high)

Table target_levels {

id int [pk, increment] // Target level ID

name varchar(20) // Name: low, medium, high

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

}

  

// Reading targets per book

Table reading_targets {

id int [pk, increment] // Target ID

book_id int [ref: > books.id] // Reference to book

level_id int [ref: > target_levels.id] // Reference to target level

pages_per_day int // Pages expected per day for this target

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

  

Indexes {

(book_id, level_id) [unique] // Ensure one target per book per level

}

}

  

// Reading progress (per book and target)

Table reading_progress {

id int [pk, increment] // Progress ID

book_id int [ref: > books.id] // Reference to book

target_id int [ref: > reading_targets.id] // Reference to target

percentage_complete float // Completion percentage (0-100)

start_date date // Start date of reading

finish_date date // Finish date (nullable)

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

}

  

// Notes table (linked to book or session)

Table notes {

id int [pk, increment] // Note ID

book_id int [ref: > books.id, null] // Optional link to book

session_id int [ref: > reading_sessions.id, null] // Optional link to session

content text // Note content

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

  

// Constraint: must link to at least book or session

}

  

// Global settings table

Table settings {

id int [pk, increment] // Setting ID

created_at timestamp [default: `now()`]

updated_at timestamp [default: `now()`]

total_reading_pages int // Total pages read across all books

avg_reading_per_day float // Average pages per day across all books

}
```