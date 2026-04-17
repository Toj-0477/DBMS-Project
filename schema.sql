-- Simple academic schema (semester-level)
-- Run this on a clean database for your submission.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS teaches;
DROP TABLE IF EXISTS user_accounts;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS professors;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS college;
DROP TABLE IF EXISTS ratings;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE college (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  parent_group VARCHAR(50) NOT NULL DEFAULT 'SVKM'
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  roll_no VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(120) UNIQUE,
  year_no INT,
  sem_no INT,
  college_id INT NOT NULL,
  FOREIGN KEY (college_id) REFERENCES college(id)
);

CREATE TABLE user_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE professors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE,
  dept VARCHAR(80),
  college_id INT NOT NULL,
  FOREIGN KEY (college_id) REFERENCES college(id)
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  sem_no INT,
  credits INT,
  college_id INT NOT NULL,
  FOREIGN KEY (college_id) REFERENCES college(id)
);

-- Which professor teaches which course
CREATE TABLE teaches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professor_id INT NOT NULL,
  course_id INT NOT NULL,
  term VARCHAR(20) NOT NULL,
  UNIQUE (professor_id, course_id, term),
  FOREIGN KEY (professor_id) REFERENCES professors(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Which student is enrolled in which course
CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  term VARCHAR(20) NOT NULL,
  grade VARCHAR(2),
  UNIQUE (student_id, course_id, term),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Student ratings for professor and course
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  professor_id INT NOT NULL,
  course_id INT NOT NULL,
  term VARCHAR(20) NOT NULL,
  stars TINYINT NOT NULL,
  comment VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_id, professor_id, course_id, term),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (professor_id) REFERENCES professors(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  CHECK (stars BETWEEN 1 AND 5)
);

INSERT INTO college (name, parent_group) VALUES
('NMIMS', 'SVKM'),
('MPSTME', 'SVKM'),
('DJ Sanghvi', 'SVKM'),
('SOBA', 'SVKM'),
('AMSOC', 'SVKM');

-- Demo data for class show-and-tell
-- Assumes this file is run on a fresh database.

INSERT INTO professors (name, email, dept, college_id) VALUES
('Dr Mehta', 'mehta@nmims.edu', 'Computer', 1),
('Prof Iyer', 'iyer@mpstme.edu', 'Data Science', 2),
('Prof Kulkarni', 'kulkarni@djsce.edu', 'Electronics', 3),
('Prof Shah', 'shah@soba.edu', 'Business', 4),
('Prof Desai', 'desai@amsoc.edu', 'Finance', 5);

INSERT INTO courses (code, name, sem_no, credits, college_id) VALUES
('CS201', 'Database Systems', 3, 4, 1),
('DS301', 'Machine Learning Basics', 5, 4, 2),
('EC202', 'Digital Logic', 3, 3, 3),
('BA210', 'Marketing Fundamentals', 3, 3, 4),
('FN305', 'Investment Analysis', 5, 4, 5);

INSERT INTO students (name, roll_no, email, year_no, sem_no, college_id) VALUES
('Aarav Shah', 'NM001', 'aarav@nmims.edu', 2, 4, 1),
('Riya Patel', 'NM002', 'riya@nmims.edu', 2, 4, 1),
('Kabir Nair', 'MP001', 'kabir@mpstme.edu', 3, 6, 2),
('Anaya Joshi', 'DJ001', 'anaya@djsce.edu', 2, 4, 3),
('Neha Kapoor', 'SO001', 'neha@soba.edu', 2, 4, 4),
('Vikram Rao', 'AM001', 'vikram@amsoc.edu', 3, 6, 5);

INSERT INTO teaches (professor_id, course_id, term) VALUES
(1, 1, '2026-SEM2'),
(2, 2, '2026-SEM2'),
(3, 3, '2026-SEM2'),
(4, 4, '2026-SEM2'),
(5, 5, '2026-SEM2');

INSERT INTO enrollments (student_id, course_id, term, grade) VALUES
(1, 1, '2026-SEM2', NULL),
(2, 1, '2026-SEM2', NULL),
(3, 2, '2026-SEM2', NULL),
(4, 3, '2026-SEM2', NULL),
(5, 4, '2026-SEM2', NULL),
(6, 5, '2026-SEM2', NULL);

INSERT INTO ratings (student_id, professor_id, course_id, term, stars, comment) VALUES
(1, 1, 1, '2026-SEM2', 5, 'Very clear explanations and good pace'),
(2, 1, 1, '2026-SEM2', 4, 'Helpful in practical sessions'),
(3, 2, 2, '2026-SEM2', 5, 'Great examples in class'),
(4, 3, 3, '2026-SEM2', 4, 'Concepts explained well'),
(5, 4, 4, '2026-SEM2', 3, 'Good but assignment heavy'),
(6, 5, 5, '2026-SEM2', 4, 'Useful for exam preparation');
