const express = require('express');

const db = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();

  try {
    let sql = `
      SELECT
        p.id,
        p.name,
        p.dept,
        c.name AS college,
        COALESCE(ROUND(AVG(r.stars), 2), 0) AS avg_stars,
        COUNT(r.id) AS rating_count
      FROM professors p
      JOIN college c ON c.id = p.college_id
      LEFT JOIN ratings r ON r.professor_id = p.id
    `;
    const params = [];

    if (q) {
      sql += ' WHERE p.name LIKE ? OR p.dept LIKE ? OR c.name LIKE ?';
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    sql += ' GROUP BY p.id, p.name, p.dept, c.name ORDER BY p.name';

    const [rows] = await db.execute(sql, params);
    return res.json({ professors: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch professors' });
  }
});

router.get('/:id', async (req, res) => {
  const professorId = Number(req.params.id);

  if (!Number.isInteger(professorId)) {
    return res.status(400).json({ message: 'Invalid professor id' });
  }

  try {
    const [profRows] = await db.execute(
      `SELECT
         p.id,
         p.name,
         p.dept,
         c.name AS college,
         COALESCE(ROUND(AVG(r.stars), 2), 0) AS avg_stars,
         COUNT(r.id) AS rating_count
       FROM professors p
       JOIN college c ON c.id = p.college_id
       LEFT JOIN ratings r ON r.professor_id = p.id
       WHERE p.id = ?
       GROUP BY p.id, p.name, p.dept, c.name`,
      [professorId]
    );

    if (profRows.length === 0) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    const [teachingRows] = await db.execute(
      `SELECT t.term, cr.id AS course_id, cr.code, cr.name
       FROM teaches t
       JOIN courses cr ON cr.id = t.course_id
       WHERE t.professor_id = ?
       ORDER BY t.term DESC, cr.code ASC`,
      [professorId]
    );

    return res.json({
      professor: profRows[0],
      teaches: teachingRows
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch professor details' });
  }
});

router.post('/', async (req, res) => {
  const { name, dept, email, college_id } = req.body;

  if (!name || !college_id) {
    return res.status(400).json({ message: 'name and college_id are required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO professors (name, email, dept, college_id) VALUES (?, ?, ?, ?)',
      [name, email || null, dept || null, college_id]
    );

    return res.status(201).json({ message: 'Professor created', id: result.insertId });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Professor email already exists' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to create professor' });
  }
});

module.exports = router;
