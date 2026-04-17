const express = require('express');

const db = require('../config/db');

const router = express.Router();

router.get('/teachers-ranking', async (_req, res) => {
  try {
    const [summaryRows] = await db.execute(
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
       GROUP BY p.id, p.name, p.dept, c.name
       ORDER BY avg_stars DESC, rating_count DESC, p.name ASC`
    );

    const [reviewRows] = await db.execute(
      `SELECT
         r.id,
         r.professor_id,
         r.course_id,
         cr.code AS course_code,
         cr.name AS course_name,
         r.term,
         r.stars,
         r.comment,
         r.created_at
       FROM ratings r
       JOIN courses cr ON cr.id = r.course_id
       ORDER BY r.created_at DESC`
    );

    const reviewsByProfessor = new Map();
    for (const review of reviewRows) {
      const list = reviewsByProfessor.get(review.professor_id) || [];
      list.push(review);
      reviewsByProfessor.set(review.professor_id, list);
    }

    const ranking = summaryRows.map((teacher, index) => ({
      rank: index + 1,
      ...teacher,
      reviews: reviewsByProfessor.get(teacher.id) || []
    }));

    return res.json({ ranking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch analytics ranking' });
  }
});

module.exports = router;
