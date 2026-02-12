const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Configuration Multer pour le upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/photos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées'));
  }
});

// Obtenir toutes les photos d'un rapport
router.get('/report/:reportId', authenticateToken, async (req, res) => {
  try {
    const report = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.reportId]);
    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const photos = await db.query('SELECT * FROM photos WHERE report_id = ?', [req.params.reportId]);
    res.json(photos);
  } catch (error) {
    console.error('Erreur récupération photos:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des photos' });
  }
});

// Uploader une photo
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    const { report_id, event_id, description } = req.body;

    const report = await db.query('SELECT * FROM reports WHERE id = ?', [report_id]);
    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (report[0].status === 'validated' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Rapport validé, modification impossible' });
    }

    const result = await db.query(
      `INSERT INTO photos (report_id, event_id, filename, original_filename, file_path, file_size, mime_type, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [report_id, event_id || null, req.file.filename, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, description]
    );

    res.status(201).json({
      message: 'Photo uploadée avec succès',
      photo_id: result.insertId,
      url: `/uploads/photos/${req.file.filename}`
    });
  } catch (error) {
    console.error('Erreur upload photo:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la photo' });
  }
});

// Supprimer une photo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const photo = await db.query('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (photo.length === 0) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }

    const report = await db.query('SELECT * FROM reports WHERE id = ?', [photo[0].report_id]);
    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (report[0].status === 'validated' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Rapport validé, suppression impossible' });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(photo[0].file_path)) {
      fs.unlinkSync(photo[0].file_path);
    }

    await db.query('DELETE FROM photos WHERE id = ?', [req.params.id]);

    res.json({ message: 'Photo supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression photo:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la photo' });
  }
});

module.exports = router;