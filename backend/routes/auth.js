const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, roll_no, year_no, sem_no, college_id, password } = req.body;

  if (!name || !email || !roll_no || !year_no || !sem_no || !college_id || !password) {
    return res.status(400).json({
      message: 'name, email, roll_no, year_no, sem_no, college_id, password are required'
    });
  }

  try {
    const [exists] = await db.execute('SELECT id FROM students WHERE email = ? OR roll_no = ?', [email, roll_no]);
    if (exists.length > 0) {
      return res.status(409).json({ message: 'Email or roll number already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [studentResult] = await db.execute(
      'INSERT INTO students (name, roll_no, email, password, year_no, sem_no, college_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, roll_no, email, passwordHash, year_no, sem_no, college_id]
    );

    return res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to signup' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT
         s.id AS student_id,
         s.name,
         s.email,
         s.roll_no,
         s.year_no,
         s.sem_no,
         s.college_id,
         c.name AS college,
        s.password
       FROM students s
       JOIN college c ON c.id = s.college_id
       WHERE s.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const storedPassword = user.password || '';
    const looksHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$');
    const match = looksHashed
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        studentId: user.student_id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        student_id: user.student_id,
        name: user.name,
        email: user.email,
        roll_no: user.roll_no,
        year_no: user.year_no,
        sem_no: user.sem_no,
        college_id: user.college_id,
        college: user.college
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to login' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         s.id AS student_id,
         s.name,
         s.email,
         s.roll_no,
         s.year_no,
         s.sem_no,
         s.college_id,
         c.name AS college
       FROM students s
       JOIN college c ON c.id = s.college_id
       WHERE s.id = ?`,
      [req.user.studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch current user' });
  }
});

module.exports = router;
