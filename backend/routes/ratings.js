const express = require('express');

const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const blockedTerms = ['fuck', 'shit', 'bitch', 'asshole'];

function containsProfanity(text) {
  const normalized = (text || '').toLowerCase();
  return blockedTerms.some((word) => normalized.includes(word));
}

router.post('/', authMiddleware, async (req, res) => {
  const { professor_id, course_id, term, stars, comment } = req.body;
  const studentId = req.user.studentId;

  if (!studentId || !professor_id || !course_id || !term || !stars) {
    return res.status(400).json({
      message: 'professor_id, course_id, term, stars are required'
    });
  }

  const cleanStars = Number(stars);
  if (!Number.isInteger(cleanStars) || cleanStars < 1 || cleanStars > 5) {
    return res.status(400).json({ message: 'stars must be between 1 and 5' });
  }

  const cleanComment = (comment || '').trim();
  if (cleanComment && containsProfanity(cleanComment)) {
    return res.status(400).json({ message: 'Comment contains blocked words' });
  }

  try {
    const [teachesRows] = await db.execute(
      'SELECT id FROM teaches WHERE professor_id = ? AND course_id = ? AND term = ?',
      [professor_id, course_id, term]
    );

    if (teachesRows.length === 0) {
      return res.status(400).json({ message: 'Professor is not mapped to this course for this term' });
    }

    const [enrollmentRows] = await db.execute(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND term = ?',
      [studentId, course_id, term]
    );

    if (enrollmentRows.length === 0) {
      return res.status(400).json({ message: 'Student is not enrolled in this course for this term' });
    }

    const [result] = await db.execute(
      `INSERT INTO ratings
       (student_id, professor_id, course_id, term, stars, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, professor_id, course_id, term, cleanStars, cleanComment || null]
    );

    return res.status(201).json({ message: 'Rating submitted', id: result.insertId });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Student already rated this professor-course in this term'
      });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to submit rating' });
  }
});

router.get('/professor/:id', async (req, res) => {
  const professorId = Number(req.params.id);
  const term = (req.query.term || '').trim();

  if (!Number.isInteger(professorId)) {
    return res.status(400).json({ message: 'Invalid professor id' });
  }

  try {
    let sql = `
      SELECT
        r.id,
        r.student_id,
        s.name AS student_name,
        r.course_id,
        cr.code AS course_code,
        cr.name AS course_name,
        r.term,
        r.stars,
        r.comment,
        r.created_at
      FROM ratings r
      JOIN students s ON s.id = r.student_id
      JOIN courses cr ON cr.id = r.course_id
      WHERE r.professor_id = ?
    `;
    const params = [professorId];

    if (term) {
      sql += ' AND r.term = ?';
      params.push(term);
    }

    sql += ' ORDER BY r.created_at DESC';

    const [rows] = await db.execute(sql, params);

    const [summaryRows] = await db.execute(
      `SELECT COUNT(*) AS total, COALESCE(ROUND(AVG(stars), 2), 0) AS avg_stars
       FROM ratings
       WHERE professor_id = ?${term ? ' AND term = ?' : ''}`,
      term ? [professorId, term] : [professorId]
    );

    return res.json({
      summary: summaryRows[0],
      ratings: rows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch professor ratings' });
  }
});

router.get('/course/:id', async (req, res) => {
  const courseId = Number(req.params.id);
  const term = (req.query.term || '').trim();

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({ message: 'Invalid course id' });
  }

  try {
    let sql = `
      SELECT
        r.id,
        r.professor_id,
        p.name AS professor_name,
        r.student_id,
        s.name AS student_name,
        r.term,
        r.stars,
        r.comment,
        r.created_at
      FROM ratings r
      JOIN professors p ON p.id = r.professor_id
      JOIN students s ON s.id = r.student_id
      WHERE r.course_id = ?
    `;
    const params = [courseId];

    if (term) {
      sql += ' AND r.term = ?';
      params.push(term);
    }

    sql += ' ORDER BY r.created_at DESC';

    const [rows] = await db.execute(sql, params);
    return res.json({ ratings: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch course ratings' });
  }
});

module.exports = router;
