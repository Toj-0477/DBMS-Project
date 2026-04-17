IN - Rate My Professor (SVKM)

Full-stack web app inspired by Rate My Professors for SVKM institutions.

Tech stack:
- Backend: Node.js, Express, mysql2/promise, JWT, Multer, Tesseract.js
- Frontend: React (react-scripts), React Router, Axios
- Database: MySQL with raw SQL (no ORM)

Project layout:
- schema.sql
- backend/
- frontend/

Quick start:
1. Create a MySQL database (example: in_rmp).
2. Run schema.sql in MySQL to create tables and seed tags.
3. Backend setup:
   - Copy backend/.env.example to backend/.env and fill values.
   - cd backend
   - npm install
   - npm start
4. Frontend setup:
   - Copy frontend/.env.example to frontend/.env (optional for local defaults).
   - cd frontend
   - npm install
   - npm start

Default local URLs:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

Implemented APIs:
- /api/auth/register, /api/auth/login, /api/auth/me
- /api/verification/upload
- /api/professors (GET, POST), /api/professors/:id
- /api/ratings (POST), /api/ratings/professor/:id

Important notes:
- One rating per user-professor pair is enforced with anonymized user_hash.
- Ratings and professor additions are available only to verified users.
- OCR verification matches approved SVKM keywords in extracted text.
- Profanity comments are rejected and stored in flagged_comments.
