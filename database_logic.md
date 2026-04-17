# Database Logic & Architecture

This document breaks down the database design, normalization techniques applied, and expected Q&A regarding our raw SQL implementation for the SVKM Professor Feedback project.

## Core Design Philosophy

Our project implements a custom-built, raw SQL backend schema that avoids ORM abstractions (like Prisma or Sequelize) to explicitly demonstrate our mastery over querying, joins, foreign key assignments, and schema constraints. 

### Tables Breakdown

1. `college`: The foundational hierarchy representing physical SVKM institutes (NMIMS, MPSTME, etc.).
2. `professors`: Contains the instructor's core details and their mapping to an underlying `college`.
3. `courses`: The curriculum elements available, spanning credits, codes, semesters, mapped tightly to the specific `professor_id` teaching the course.
4. `students`: Captures the identifiable data of a user. It maps to `college_id` establishing where the student is enrolled, and explicitly bounds to `course_id` mapping the exact course they are actively taking. It acts as the central security ledger natively holding your `password_hash`.
5. `ratings`: The core transactional table of the app. It records star counts and comments natively bound to a `student_id`, `professor_id`, and `course_id`.
6. `id_verifications`: Tracks uploaded student ID card attempts, the captured OCR text, and the subsequent approval/rejection status. 

## Database Normalization (1NF, 2NF, 3NF)

Our schema strictly adheres to the first three normal forms of relational database design to prevent data anomalies and redundancy during inserts, updates, and deletes.

### First Normal Form (1NF)
**Rule**: All columns contain atomic (indivisible) values, and tables possess a unique identity key.
- **Implementation**: We use surrogate primary keys (`id INTEGER PRIMARY KEY`) on every table. Complex traits (like what courses a professor teaches) are never recorded as a comma-separated list. Instead, courses themselves possess a singular explicit `professor_id` mapped precisely to the instructor.

### Second Normal Form (2NF)
**Rule**: Conforms to 1NF, and all non-key attributes are fully, not partially, dependent on the primary key.
- **Implementation**: A violation of 2NF usually occurs with composite primary keys. Because we opted for auto-incrementing single-column `id`s across the board, no partial dependency can exist. We reinforce our business logic using `UNIQUE (student_id, professor_id, course_id, term)` constraints on our rating tables without using them as the primary key.

### Third Normal Form (3NF)
**Rule**: Conforms to 2NF, and no transitive dependencies exist (a non-key attribute cannot depend on another non-key attribute).
- **Implementation**: Instead of logging the college's name inside the `students` or `professors` table, we store `college_id`. If a student moves from MPSTME to NMIMS, we update the `college_id` foreign key. The actual text mapping exists exclusively in the `college` table. This guarantees zero duplication and an infinitely scalable structural hierarchy.

## Common Teacher / Jury Q&A

**Q: How do you generate the average metrics and counts shown on the Professor's page?**  
**A:** We use aggregate functions in raw SQL. When `GET /api/professors` is hit, the backend runs a query that `LEFT JOIN`s the `ratings` table onto the `professors` table. We utilize `COALESCE(ROUND(AVG(r.stars), 2), 0)` aligned under a `GROUP BY p.id` to instantly calculate average scores safely handling cases where `NULL` (zero ratings) exist.

**Q: In the physical `ratings` table, how do you prevent users from submitting multiple feedback forms for the exact same teacher in the same course term?**  
**A:** We established a `UNIQUE (student_id, professor_id, course_id, term)` table-level constraint in `schema.sql`. If a student attempts to spam feedback across the identical parameters, the SQL engine inherently rejects the `INSERT` operation with a collision code (`ER_DUP_ENTRY`), which our backend catches and returns as an error prompt to the user!

**Q: Wait, why not just use junction tables for Students and Courses (Many-to-Many)?**
**A:** We initially possessed an `enrollments` junction layer! We intentionally collapsed that into a simplified mapping where a `student` registers precisely for a specific `course_id` (1:N) inside the same table row containing their passwords. This eliminates heavy back-end `JOIN` aggregations, keeping the runtime architecture incredibly streamlined and simple.

**Q: How exactly are transactions evaluated during the ID Verification process?**  
**A:** Security validation involves two tables. First, we attempt to save the upload history and textual extraction (via Tesseract OCR) to `id_verifications` mapping to the user. Then, if the internal string comparison discovers an authentic keyword (like "nmims" or "mpstme"), we execute an `UPDATE students SET is_verified = TRUE` query targeting the user's root metadata.
