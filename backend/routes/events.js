const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obtenir tous les événements d'un rapport
router.get('/report/:reportId', authenticateToken, async (req, res) => {
  try {
    // Vérifier l'accès au rapport
    const report = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.reportId]);
    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (report[0].status === 'validated' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Rapport validé, modification impossible' });
    }

    const events = await db.query(
      'SELECT * FROM events WHERE report_id = ? ORDER BY event_time ASC',
      [req.params.reportId]
    );
    res.json(events);
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
});

// Créer un événement
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { report_id, event_type, title, description, event_time, location, severity, action_taken } = req.body;

    // Vérifier l'accès au rapport
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
      `INSERT INTO events (report_id, event_type, title, description, event_time, location, severity, action_taken)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [report_id, event_type, title, description, event_time, location, severity, action_taken]
    );

    res.status(201).json({
      message: 'Événement créé avec succès',
      event_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement' });
  }
});

// Mettre à jour un événement
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (event.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Vérifier l'accès au rapport
    const report = await db.query('SELECT * FROM reports WHERE id = ?', [event[0].report_id]);
    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (report[0].status === 'validated' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Rapport validé, modification impossible' });
    }

    const { event_type, title, description, event_time, location, severity, action_taken } = req.body;

    await db.query(
      `UPDATE events SET event_type = ?, title = ?, description = ?, event_time = ?, 
       location = ?, severity = ?, action_taken = ?, updated_at = NOW()
       WHERE id = ?`,
      [event_type, title, description, event_time, location, severity, action_taken, req.params.id]
    );

    res.json({ message: 'Événement mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement' });
  }
});

// Supprimer un événement
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (event.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Vérifier l'accès au rapport
    const report = await db.query('SELECT * FROM reports WHERE id = ?', [event[0].report_id]);
    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (report[0].status === 'validated' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Rapport validé, suppression impossible' });
    }

    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement' });
  }
});

module.exports = router;