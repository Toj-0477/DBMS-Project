const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('../config/db');

const router = express.Router();

router.get('/colleges', async (_req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, parent_group FROM college ORDER BY name');
    return res.json({ colleges: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch colleges' });
  }
});

router.get('/students', async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.id, s.name, s.roll_no, s.email, s.year_no, s.sem_no, c.name AS college
       FROM students s
       JOIN college c ON c.id = s.college_id
       ORDER BY s.name`
    );
    return res.json({ students: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch students' });
  }
});

router.post('/students', async (req, res) => {
  const { name, roll_no, email, password, year_no, sem_no, college_id } = req.body;

  if (!name || !roll_no || !college_id || !password) {
    return res.status(400).json({ message: 'name, roll_no, college_id, password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO students (name, roll_no, email, password, year_no, sem_no, college_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, roll_no, email || null, passwordHash, year_no || null, sem_no || null, college_id]
    );
    return res.status(201).json({ message: 'Student created', id: result.insertId });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'roll_no or email already exists' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to create student' });
  }
});

router.get('/courses', async (_req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT cr.id, cr.code, cr.name, cr.sem_no, cr.credits, c.name AS college, cr.professor_id
       FROM courses cr
       JOIN college c ON c.id = cr.college_id
       ORDER BY cr.code`
    );
    return res.json({ courses: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

router.post('/courses', async (req, res) => {
  const { code, name, sem_no, credits, college_id, professor_id } = req.body;

  if (!code || !name || !college_id || !professor_id) {
    return res.status(400).json({ message: 'code, name, college_id, professor_id are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO courses (code, name, sem_no, credits, college_id, professor_id) VALUES (?, ?, ?, ?, ?, ?)',
      [code, name, sem_no || null, credits || null, college_id, professor_id]
    );
    return res.status(201).json({ message: 'Course created', id: result.insertId });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Course code already exists' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to create course' });
  }
});

module.exports = router;
