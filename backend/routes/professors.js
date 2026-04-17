const crypto = require('crypto');
const express = require('express');

const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function anonymizeUser(userId) {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${process.env.HASH_SECRET_SALT}`)
    .digest('hex');
}

router.get('/', async (req, res) => {
  const search = (req.query.q || '').trim();

  try {
    let sql = `
      SELECT
        p.id,
        p.name,
        p.department,
        p.course,
        p.college,
        COALESCE(ROUND(AVG(r.overall), 2), 0) AS avg_overall,
        COALESCE(ROUND(AVG(r.quality), 2), 0) AS avg_quality,
        COALESCE(ROUND(AVG(r.difficulty), 2), 0) AS avg_difficulty,
        COALESCE(ROUND(AVG(r.helpfulness), 2), 0) AS avg_helpfulness,
        COUNT(r.id) AS rating_count
      FROM professors p
      LEFT JOIN ratings r ON r.professor_id = p.id
    `;
    const params = [];

    if (search) {
      sql += `
        WHERE p.name LIKE ?
           OR p.department LIKE ?
           OR p.course LIKE ?
           OR p.college LIKE ?
      `;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' GROUP BY p.id ORDER BY rating_count DESC, p.name ASC';

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
         p.department,
         p.course,
         p.college,
         COALESCE(ROUND(AVG(r.overall), 2), 0) AS avg_overall,
         COALESCE(ROUND(AVG(r.quality), 2), 0) AS avg_quality,
         COALESCE(ROUND(AVG(r.difficulty), 2), 0) AS avg_difficulty,
         COALESCE(ROUND(AVG(r.helpfulness), 2), 0) AS avg_helpfulness,
         COUNT(r.id) AS rating_count
       FROM professors p
       LEFT JOIN ratings r ON r.professor_id = p.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [professorId]
    );

    if (profRows.length === 0) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    const [ratingRows] = await db.execute(
      `SELECT
         r.id,
         r.quality,
         r.difficulty,
         r.helpfulness,
         r.overall,
         r.comment,
         r.is_anonymous,
         r.created_at,
         GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR '||') AS tags
       FROM ratings r
       LEFT JOIN rating_tags rt ON rt.rating_id = r.id
       LEFT JOIN tags t ON t.id = rt.tag_id
       WHERE r.professor_id = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [professorId]
    );

    const ratings = ratingRows.map((row) => ({
      id: row.id,
      quality: row.quality,
      difficulty: row.difficulty,
      helpfulness: row.helpfulness,
      overall: Number(row.overall),
      comment: row.comment,
      is_anonymous: Boolean(row.is_anonymous),
      created_at: row.created_at,
      tags: row.tags ? row.tags.split('||') : []
    }));

    return res.json({ professor: profRows[0], ratings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch professor details' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { name, department, course, college } = req.body;

  if (!name || !department || !course || !college) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [users] = await db.execute('SELECT is_verified FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!users[0].is_verified) {
      return res.status(403).json({ message: 'Only verified users can add professors' });
    }

    const addedByHash = anonymizeUser(req.user.id);

    const [insertResult] = await db.execute(
      'INSERT INTO professors (name, department, course, college, added_by_hash) VALUES (?, ?, ?, ?, ?)',
      [name, department, course, college, addedByHash]
    );

    return res.status(201).json({
      message: 'Professor added successfully',
      professorId: insertResult.insertId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to add professor' });
  }
});

module.exports = router;
