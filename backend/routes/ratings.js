const crypto = require('crypto');
const express = require('express');

const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const blockedTerms = [
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'bastard',
  'motherfucker',
  'dick',
  'slut'
];

function containsProfanity(input) {
  const normalized = (input || '').toLowerCase();
  return blockedTerms.some((term) => normalized.includes(term));
}

function buildUserHash(userId, professorId) {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${professorId}:${process.env.HASH_SECRET_SALT}`)
    .digest('hex');
}

router.post('/', authMiddleware, async (req, res) => {
  const { professorId, quality, difficulty, helpfulness, comment, tagIds } = req.body;

  const q = Number(quality);
  const d = Number(difficulty);
  const h = Number(helpfulness);
  const pId = Number(professorId);

  if (!Number.isInteger(pId) || ![q, d, h].every((n) => Number.isInteger(n) && n >= 1 && n <= 5)) {
    return res.status(400).json({ message: 'Invalid rating payload' });
  }

  try {
    const [users] = await db.execute('SELECT is_verified FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!users[0].is_verified) {
      return res.status(403).json({ message: 'Only verified users can submit ratings' });
    }

    const ratingComment = (comment || '').trim();
    const userHash = buildUserHash(req.user.id, pId);

    if (ratingComment && containsProfanity(ratingComment)) {
      await db.execute(
        'INSERT INTO flagged_comments (user_hash, professor_id, comment, reason) VALUES (?, ?, ?, ?)',
        [userHash, pId, ratingComment, 'Profanity detected']
      );
      return res.status(400).json({ message: 'Comment rejected due to profanity' });
    }

    const overall = ((q + d + h) / 3).toFixed(2);

    const [result] = await db.execute(
      `INSERT INTO ratings
       (professor_id, quality, difficulty, helpfulness, overall, comment, user_hash, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [pId, q, d, h, overall, ratingComment || null, userHash]
    );

    const ratingId = result.insertId;
    const cleanedTagIds = Array.isArray(tagIds)
      ? [...new Set(tagIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
      : [];

    if (cleanedTagIds.length > 0) {
      const [tagRows] = await db.query('SELECT id FROM tags WHERE id IN (?)', [cleanedTagIds]);
      const validTagIds = tagRows.map((t) => t.id);

      if (validTagIds.length > 0) {
        const values = validTagIds.map((tagId) => [ratingId, tagId]);
        await db.query('INSERT INTO rating_tags (rating_id, tag_id) VALUES ?', [values]);
      }
    }

    return res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'You have already rated this professor' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Failed to submit rating' });
  }
});

router.get('/professor/:id', async (req, res) => {
  const professorId = Number(req.params.id);

  if (!Number.isInteger(professorId)) {
    return res.status(400).json({ message: 'Invalid professor id' });
  }

  try {
    const [rows] = await db.execute(
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

    const ratings = rows.map((row) => ({
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

    return res.json({ ratings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch ratings' });
  }
});

module.exports = router;
