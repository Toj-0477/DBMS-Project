const express = require('express');

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
      `SELECT s.id, s.name, s.roll_no, s.email, s.year_no, c.name AS college
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
  const { name, roll_no, email, year_no, college_id } = req.body;

  if (!name || !roll_no || !college_id) {
    return res.status(400).json({ message: 'name, roll_no, college_id are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO students (name, roll_no, email, year_no, college_id) VALUES (?, ?, ?, ?, ?)',
      [name, roll_no, email || null, year_no || null, college_id]
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
      `SELECT cr.id, cr.code, cr.name, cr.sem_no, cr.credits, c.name AS college
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
  const { code, name, sem_no, credits, college_id } = req.body;

  if (!code || !name || !college_id) {
    return res.status(400).json({ message: 'code, name, college_id are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO courses (code, name, sem_no, credits, college_id) VALUES (?, ?, ?, ?, ?)',
      [code, name, sem_no || null, credits || null, college_id]
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

router.post('/teaches', async (req, res) => {
  const { professor_id, course_id, term } = req.body;

  if (!professor_id || !course_id || !term) {
    return res.status(400).json({ message: 'professor_id, course_id, term are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO teaches (professor_id, course_id, term) VALUES (?, ?, ?)',
      [professor_id, course_id, term]
    );
    return res.status(201).json({ message: 'Mapping saved', id: result.insertId });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This professor-course-term mapping already exists' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to save mapping' });
  }
});

router.post('/enrollments', async (req, res) => {
  const { student_id, course_id, term, grade } = req.body;

  if (!student_id || !course_id || !term) {
    return res.status(400).json({ message: 'student_id, course_id, term are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO enrollments (student_id, course_id, term, grade) VALUES (?, ?, ?, ?)',
      [student_id, course_id, term, grade || null]
    );
    return res.status(201).json({ message: 'Enrollment saved', id: result.insertId });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Student already enrolled in this course for this term' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to save enrollment' });
  }
});

module.exports = router;
