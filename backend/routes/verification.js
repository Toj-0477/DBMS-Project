const path = require('path');
const express = require('express');
const Tesseract = require('tesseract.js');

const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const approvedKeywords = [
  'nmims',
  'mpstme',
  'mukesh patel',
  'asmsoc',
  'anil surendra modi',
  'mithibai',
  'narsee monjee college',
  'wilson college',
  'djsce',
  'dwarkadas j. sanghvi',
  'svkm',
  'school of law',
  'balwant sheth',
  'school of architecture',
  'school of pharmacy',
  'indira gandhi',
  'school of design',
  'school of science',
  'school of commerce',
  'school of economics',
  'jamnabai'
];

function detectCollege(text) {
  const cleaned = (text || '').toLowerCase();

  const match = approvedKeywords.find((keyword) => cleaned.includes(keyword));
  if (match) {
    return { status: 'approved', matchedCollege: match };
  }

  if (cleaned.includes('school')) {
    return { status: 'rejected', matchedCollege: null };
  }

  return { status: 'rejected', matchedCollege: null };
}

router.post('/upload', authMiddleware, upload.single('idCard'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'ID card image is required' });
  }

  try {
    const imagePath = req.file.path;
    const { data } = await Tesseract.recognize(imagePath, 'eng');
    const extractedText = data.text || '';

    const result = detectCollege(extractedText);
    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');

    await db.execute(
      `INSERT INTO id_verifications
       (user_id, image_path, extracted_text, matched_college, status)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.studentId, relativePath, extractedText, result.matchedCollege, result.status]
    );

    if (result.status === 'approved') {
      await db.execute('UPDATE students SET is_verified = TRUE WHERE id = ?', [req.user.studentId]);
    }

    return res.json({
      message: result.status === 'approved' ? 'Verification approved' : 'Verification rejected',
      status: result.status,
      matchedCollege: result.matchedCollege
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to process verification' });
  }
});

module.exports = router;
