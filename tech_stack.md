# SVKM Professor Feedback - Tech Stack & Application Architecture 

This document provides an in-depth breakdown of our entire technology stack, exploring the libraries used and mapping out the functionality of every core file within the repository!

## Our Technology Stack

### Frontend Stack (Client-Side)
- **Framework:** `React 18` initiated safely through Create React App (CRA), serving as a powerful Component-based SPA (Single Page Application).
- **Styling:** `Vanilla CSS3` designed iteratively utilizing CSS Custom Properties (Variables) to keep a unified design aesthetic tailored closely to modern web app layouts.
- **Client Routing:** `react-router-dom` v6 enforcing smooth client-side page transitions without demanding expensive HTML window reloads.
- **API Fetching:** `axios` acts as our central network orchestrator standardizing JSON payload headers natively resolving into Promises that seamlessly tie with React's `useEffect` hooks.

### Backend Stack (Server-Side)
- **Framework:** `Node.js` operating an `Express` architectural layer—keeping the overhead lightweight without opinionated directory controls.
- **Database Engine:** `sqlite3` bundled with a Promise-driven `sqlite` overlay. This operates flawlessly off raw relational SQL (identical to MySQL logic) while eliminating the requirement for complex localized database server configurations for submission tasks!
- **Authentication & Security:** 
  - `bcryptjs`: Protects user passwords at transit by salting and encrypting variables into non-revertible hashes prior to insertion into the DB.
  - `jsonwebtoken` (JWT): Governs stateless cross-page security issuing encoded session secrets inside standard HTTP Authorization headers.
- **File Parsing & ML Pipeline:** 
  - `multer`: Intercepts raw multipart/form-data images off browser uploads generating local system files dynamically.
  - `tesseract.js`: Operates as an integrated Optical Character Recognition (OCR) Machine Learning engine capable of isolating alphanumeric patterns off student ID cards!

---

## Complete File directory Breakdown

### **Frontend Directory `frontend/src/`**

**Core Infrastructure**
* `index.js`: The physical root entrypoint into the React engine wrapping `<App>` with necessary routers and logical contexts.
* `index.css`: The central stylesheet encompassing UI components, interactive shadow depths, and default font-families (Inter) used universally.
* `App.js`: Defines the primary navigation mapping structure linking valid URL addresses like `/login` or `/feedback/:id` to proper sub-page Components.

**Contexts**
* `context/AuthContext.js`: Generates a massive generalized state overlay handling background login mechanics! It catches persistent JWT tokens out of `localStorage`, pings `GET /auth/me` to validate identities automatically silently injecting the verified users back into the components.

**Pages (Unique Window Views)**
* `pages/Home.js`: Mounts on startup fetching the entire master-list of Professors triggering data mappings displaying the roster visually.
* `pages/Login.js` & `pages/Register.js`: Contains robust form validations wrapping standard security controls POSTing data efficiently resolving tokens over resolving user identities.
* `pages/AddProfessor.js`: Protects verified account privileges issuing calls to the server mapping instructors directly into a dropdown list populated interactively from the API.
* `pages/ProfessorProfile.js`: Deeply pulls a single instructor's data rendering out statistical summaries bounding iterative `RatingCard` components dynamically visualizing all historic peer-feedback comments!
* `pages/RateProfessor.js`: Forces user states to select terms securely writing payload data injecting 1-5 variable slider scales and sanitized textual arrays into the core engine.
* `pages/VerifyID.js`: A core security bridge managing blob-file states and loading-screen buffers routing into Tesseract. 

**Sub-Components (Modular Micro Elements)**
* `components/Navbar.js`: Dynamic header parsing logic responding explicitly to the truthiness of our `AuthContext` to swap between Login buttons or the active logged-in Profile identifier.
* `components/ProfessorCard.js`: Lightweight list-item element rendering visual badge analytics accurately displaying 0 aggregations securely where SQL logic returned Null interactions!
* `components/RatingCard.js`: The isolated component visualizing individual textual feedback bounds protecting visual overflow.
* `components/ProtectedRoute.js`: An invisible redirector bouncing anonymous users backwards shielding sensitive routes off active DOM components!

### **Backend Directory `backend/`**

**Core Init**
* `server.js`: The entry port initialization point (Port 5000) binding all the independent routes and JSON parsers and applying base `cors` (Cross-Origin Resource Sharing) middleware limits explicitly bounding local connections ensuring security protocols remain enforced.

**Config Layer**
* `config/db.js`: Initializes database pipelines seamlessly. When the app boots, this logic intercepts `schema.sql`, cleans it up for native compatibility checks, and automatically translates incoming `.execute()` queries mimicking native MySQL/Promise API logic against an embedded SQLite memory stack bypassing major environment deployment issues.

**Middlewares**
* `middleware/auth.js`: Acts as a localized route shield. Intercepts `req.headers.authorization`, verifies the hashed secret using the global environment variable `JWT_SECRET` unlocking identifying payloads into `req.user`!
* `middleware/upload.js`: The configuration engine binding internal `fs` (FileSystem) variables allowing physical server-side folders named `/uploads/` allocating randomized millisecond timestamp naming schemes safely ignoring unauthorized non-image formats instantly natively bounding storage overloads limits.

**REST API Routes**
* `routes/auth.js`: The gateway managing `/signup` and `/login` comparing and evaluating raw hashed passwords against internal table rows outputting JSON tokens back to the caller.
* `routes/academic.js`: Universal routing endpoints returning standard reference components required by Forms safely retrieving core lists mapping institutions against generalized courses handling simple inserts.
* `routes/professors.js`: Highly expansive logic bridging complex `LEFT JOIN` aggregations evaluating average metrics natively dynamically computing rating sums utilizing grouped calculations off parameters fetching dynamic outputs bound safely avoiding unmapped logic over simple references.
* `routes/ratings.js`: Secures explicit post commands testing dependencies mapping foreign key assertions strictly blocking duplicate review flooding against specific tables implementing arrays to forcefully scan user inputs filtering blocked profanity arrays dynamically off comment reviews!
* `routes/verification.js`: Extracts local Multer image paths processing data streams heavily computing texts isolating results checking predefined array properties mapped against institution keywords mapping final Boolean authentications securely adjusting authorization metadata over active nodes instantly!
