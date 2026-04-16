# IN — Rate My Professor for SVKM Institutions

Build a full-stack web application that recreates Rate My Professors, scoped to SVKM group of colleges, with OCR-based student ID verification and anonymous professor ratings.

## User Review Required

> [!IMPORTANT]
> **MySQL Credentials**: The app will use `.env` configuration for MySQL host, user, password, and database name. You'll need a running MySQL server locally.

> [!IMPORTANT]
> **OCR Accuracy**: Tesseract.js is used for ID card OCR. It works well for printed text but may struggle with low-quality images. The verification uses keyword matching against approved college names extracted from the scan.

> [!WARNING]
> **No ORM**: All database operations use raw SQL via `mysql2/promise`. No Sequelize, Prisma, or any ORM.

---

## Project Structure

```
C:\Users\harpr\.gemini\antigravity\scratch\in-rmp\
├── schema.sql                  # Full CREATE TABLE + seed data
├── backend\
│   ├── package.json
│   ├── .env.example
│   ├── server.js               # Express entry point
│   ├── config\
│   │   └── db.js               # MySQL2 connection pool
│   ├── middleware\
│   │   ├── auth.js             # JWT verification middleware
│   │   └── upload.js           # Multer file upload config
│   ├── routes\
│   │   ├── auth.js             # Register, Login
│   │   ├── verification.js     # ID card upload + OCR
│   │   ├── professors.js       # CRUD professors
│   │   └── ratings.js          # Submit/get ratings
│   └── uploads\                # Uploaded ID card images
├── frontend\
│   ├── package.json
│   ├── public\
│   │   └── index.html
│   └── src\
│       ├── index.js
│       ├── index.css           # Global styles (RMP color scheme)
│       ├── App.js              # Router setup
│       ├── context\
│       │   └── AuthContext.js  # Auth state management
│       ├── components\
│       │   ├── Navbar.js       # Header with IN branding
│       │   ├── SearchBar.js    # Professor search
│       │   ├── ProfessorCard.js
│       │   ├── RatingCard.js
│       │   ├── TagPills.js
│       │   └── ProtectedRoute.js
│       └── pages\
│           ├── Home.js
│           ├── Login.js
│           ├── Register.js
│           ├── VerifyID.js
│           ├── SearchResults.js
│           ├── ProfessorProfile.js
│           ├── AddProfessor.js
│           └── RateProfessor.js
```

---

## Proposed Changes

### Database Layer

#### [NEW] [schema.sql](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/schema.sql)

Complete MySQL schema with all 7 tables:

| Table | Purpose |
|-------|---------|
| `users` | Student accounts — name, email, hashed password, SVKM college, `is_verified` flag |
| `id_verifications` | OCR scan results — image path, extracted text, matched college, status (pending/approved/rejected) |
| `professors` | Professor records — name, department, course, college, `added_by_hash` (anonymized) |
| `ratings` | Individual ratings — quality/difficulty/helpfulness (1-5), overall score, comment, `user_hash` (anonymized), `is_anonymous` (always true) |
| `tags` | Master list of 15 predefined tags |
| `rating_tags` | Many-to-many junction between ratings and tags |
| `flagged_comments` | Profanity-flagged comments with reason, stored but never published |

Key design decisions:
- `user_hash` in ratings is a SHA-256 of `user_id + professor_id + secret_salt` — prevents linking ratings to users while enforcing one-rating-per-professor-per-user
- `added_by_hash` in professors is a SHA-256 of the user ID — no direct foreign key exposure
- UNIQUE constraint on `(user_hash)` in ratings prevents duplicate reviews per user-professor pair

---

### Backend

#### [NEW] [package.json](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/package.json)

Dependencies:
- `express` — HTTP server
- `mysql2` — Raw SQL driver (promise API)
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `multer` — File upload handling
- `tesseract.js` — OCR for ID card scanning
- `bad-words` — Profanity filtering
- `cors` — Cross-origin requests
- `dotenv` — Environment variables
- `crypto` — Built-in for SHA-256 hashing

#### [NEW] [server.js](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/server.js)

Express app setup with:
- CORS enabled for React dev server
- JSON body parsing
- Static file serving for uploads
- Route mounting for `/api/auth`, `/api/verification`, `/api/professors`, `/api/ratings`

#### [NEW] [db.js](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/config/db.js)

MySQL2 connection pool using `mysql2/promise.createPool()` with env vars.

#### [NEW] [auth.js middleware](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/middleware/auth.js)

JWT verification middleware — extracts token from `Authorization: Bearer <token>`, verifies, attaches `req.user`.

#### [NEW] [auth.js routes](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/routes/auth.js)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Create user with bcrypt-hashed password, raw SQL INSERT |
| `/api/auth/login` | POST | Validate credentials, return JWT, raw SQL SELECT |
| `/api/auth/me` | GET | Get current user info (protected), raw SQL SELECT |

#### [NEW] [verification.js routes](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/routes/verification.js)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/verification/upload` | POST | Accept ID card image via Multer, run Tesseract.js OCR, match against approved SVKM colleges, INSERT result into `id_verifications`, UPDATE `users.is_verified` if match found |

Approved college keyword list (for OCR matching):
```
NMIMS, MPSTME, Mukesh Patel, ASMSOC, Anil Surendra Modi,
Mithibai, Narsee Monjee College, Wilson College,
DJSCE, Dwarkadas J. Sanghvi, SVKM, School of Law,
Balwant Sheth, School of Architecture, School of Pharmacy,
Indira Gandhi, School of Design, School of Science,
School of Commerce, School of Economics, Jamnabai
```
Schools explicitly excluded: any text containing "school" without a valid college-level keyword (e.g., "Sanpada School").

#### [NEW] [professors.js routes](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/routes/professors.js)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/professors` | GET | List/search professors with aggregate ratings, raw SQL with JOINs |
| `/api/professors/:id` | GET | Get professor detail with all ratings + tags, raw SQL JOINs |
| `/api/professors` | POST | Add professor (verified users only), raw SQL INSERT, anonymized `added_by_hash` |

#### [NEW] [ratings.js routes](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/backend/routes/ratings.js)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ratings` | POST | Submit rating — profanity check → reject or save. Compute overall as AVG(quality, difficulty, helpfulness). Raw SQL INSERT into `ratings` + `rating_tags`. On profanity fail: INSERT into `flagged_comments`, return 400 |
| `/api/ratings/professor/:id` | GET | Get all ratings for a professor with tags, raw SQL SELECT + JOINs |

---

### Frontend

#### [NEW] [index.css](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/frontend/src/index.css)

RMP-inspired design system:
- **Colors**: Background `#f1f1f1`, cards `#ffffff`, header `#000000`, accent yellow `#FFD700`, quality green `#00a67d`, difficulty red `#ff6961`, links blue `#0066ff`
- **Typography**: Inter font from Google Fonts
- **Card-based layout** with rounded corners, shadows
- **Rating badges**: Large colored square boxes
- **Tag pills**: Rounded pill badges with light backgrounds

#### [NEW] [AuthContext.js](file:///C:/Users/harpr/.gemini/antigravity/scratch/in-rmp/frontend/src/context/AuthContext.js)

React context for auth state — stores JWT in localStorage, provides `login()`, `logout()`, `user` object, `isVerified` status.

#### [NEW] Component files

| Component | Purpose |
|-----------|---------|
| `Navbar.js` | Black header bar with RMP-style logo + "IN" branding, nav links, login/signup buttons |
| `SearchBar.js` | Centered search input matching RMP's rounded style |
| `ProfessorCard.js` | Card showing professor name, department, college, aggregate scores |
| `RatingCard.js` | Individual anonymous review with score badges, comment, tag pills |
| `TagPills.js` | Renders tag pills in the RMP style |
| `ProtectedRoute.js` | Route guard requiring auth + verification |

#### [NEW] Page files

| Page | Purpose |
|------|---------|
| `Home.js` | Hero section with search bar, tagline, recent ratings |
| `Login.js` | Clean login form |
| `Register.js` | Signup with college selection dropdown |
| `VerifyID.js` | Post-signup ID card upload with instructions |
| `SearchResults.js` | List of professor cards matching search query |
| `ProfessorProfile.js` | Full professor view — aggregate stats + review feed |
| `AddProfessor.js` | Form to add a new professor (verified only) |
| `RateProfessor.js` | Full rating form with sliders, tags, comment |

---

## Anonymity Enforcement

1. **Ratings**: `user_hash` = SHA-256(`userId:professorId:SECRET_SALT`) — stored for uniqueness enforcement only, never sent to frontend
2. **Professors**: `added_by_hash` = SHA-256(`userId:SECRET_SALT`) — never exposed in API
3. **API responses**: All rating endpoints strip `user_hash`, `user_id`, and any identifying fields before sending JSON

---

## Verification Plan

### Automated Tests
1. Start MySQL, create database, run `schema.sql`
2. Start backend: `cd backend && npm install && node server.js`
3. Start frontend: `cd frontend && npm install && npm start`
4. Verify all routes respond correctly via browser testing
5. Test signup → login → ID verification → add professor → rate professor flow

### Manual Verification
- Browse the app at `http://localhost:3000`
- Confirm RMP-style UI with IN branding
- Test profanity filter rejects bad comments
- Test OCR verification with a sample image
- Confirm no user identity leaks in professor/rating views
