CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  college VARCHAR(150) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS id_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  extracted_text TEXT,
  matched_college VARCHAR(150),
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS professors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  department VARCHAR(120) NOT NULL,
  course VARCHAR(120) NOT NULL,
  college VARCHAR(150) NOT NULL,
  added_by_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  professor_id INT NOT NULL,
  quality TINYINT NOT NULL,
  difficulty TINYINT NOT NULL,
  helpfulness TINYINT NOT NULL,
  overall DECIMAL(3,2) NOT NULL,
  comment TEXT,
  user_hash CHAR(64) NOT NULL UNIQUE,
  is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
  CONSTRAINT chk_quality CHECK (quality BETWEEN 1 AND 5),
  CONSTRAINT chk_difficulty CHECK (difficulty BETWEEN 1 AND 5),
  CONSTRAINT chk_helpfulness CHECK (helpfulness BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS rating_tags (
  rating_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (rating_id, tag_id),
  FOREIGN KEY (rating_id) REFERENCES ratings(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flagged_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_hash CHAR(64) NOT NULL,
  professor_id INT NOT NULL,
  comment TEXT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE
);

INSERT IGNORE INTO tags (name) VALUES
('Gives good feedback'),
('Inspirational'),
('Lots of homework'),
('Accessible outside class'),
('Test heavy'),
('Tough grader'),
('Clear grading criteria'),
('Would take again'),
('Participation matters'),
('Group projects'),
('Lecture heavy'),
('Practical examples'),
('Chill class'),
('Skip if possible'),
('Respects students');
