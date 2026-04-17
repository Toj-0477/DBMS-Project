require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const academicRoutes = require('./routes/academic');
const professorRoutes = require('./routes/professors');
const ratingsRoutes = require('./routes/ratings');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/academic', academicRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/ratings', ratingsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
