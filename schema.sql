-- Simple academic schema (semester-level)
-- Run this on a clean database for your submission.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS teaches;
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
  college_id INT NOT NULL,
  FOREIGN KEY (college_id) REFERENCES college(id)
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
