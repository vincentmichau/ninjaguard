const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireSupervisorOrAdmin } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Obtenir tous les rapports (filtre par utilisateur)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, site_id, date_from, date_to } = req.query;
    let query = `
      SELECT r.*, s.name as site_name, s.address as site_address, s.city as site_city,
             u.first_name as watcher_first_name, u.last_name as watcher_last_name,
             v.first_name as validator_first_name, v.last_name as validator_last_name
      FROM reports r
      JOIN sites s ON r.site_id = s.id
      JOIN users u ON r.watcher_id = u.id
      LEFT JOIN users v ON r.validated_by = v.id
      WHERE 1=1
    `;
    const params = [];

    // Filtre par utilisateur (sauf admin/supervisor)
    if (req.user.role === 'watcher') {
      query += ' AND r.watcher_id = ?';
      params.push(req.user.id);
    }

    // Filtres additionnels
    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    if (site_id) {
      query += ' AND r.site_id = ?';
      params.push(site_id);
    }
    if (date_from) {
      query += ' AND r.shift_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND r.shift_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY r.shift_date DESC, r.created_at DESC';

    const reports = await db.query(query, params);
    res.json(reports);
  } catch (error) {
    console.error('Erreur récupération rapports:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rapports' });
  }
});

// Obtenir un rapport par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await db.query(
      `SELECT r.*, s.name as site_name, s.address as site_address, s.city as site_city,
              u.first_name as watcher_first_name, u.last_name as watcher_last_name,
              v.first_name as validator_first_name, v.last_name as validator_last_name
       FROM reports r
       JOIN sites s ON r.site_id = s.id
       JOIN users u ON r.watcher_id = u.id
       LEFT JOIN users v ON r.validated_by = v.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Vérifier les droits d'accès
    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(report[0]);
  } catch (error) {
    console.error('Erreur récupération rapport:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du rapport' });
  }
});

// Créer un nouveau rapport
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { site_id, shift_date, shift_start, shift_end, weather, temperature, general_notes } = req.body;

    // Vérifier si un rapport existe déjà pour ce shift
    const existing = await db.query(
      'SELECT id FROM reports WHERE watcher_id = ? AND site_id = ? AND shift_date = ?',
      [req.user.id, site_id, shift_date]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Un rapport existe déjà pour ce shift' });
    }

    const result = await db.query(
      `INSERT INTO reports (watcher_id, site_id, shift_date, shift_start, shift_end, weather, temperature, general_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, site_id, shift_date, shift_start, shift_end, weather, temperature, general_notes]
    );

    res.status(201).json({
      message: 'Rapport créé avec succès',
      report_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création rapport:', error);
    res.status(500).json({ error: 'Erreur lors de la création du rapport' });
  }
});

// Mettre à jour un rapport
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);

    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Vérifier les droits et le statut
    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (report[0].status === 'validated' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Rapport validé, modification impossible' });
    }

    const { weather, temperature, general_notes } = req.body;

    await db.query(
      `UPDATE reports SET weather = ?, temperature = ?, general_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [weather, temperature, general_notes, req.params.id]
    );

    res.json({ message: 'Rapport mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour rapport:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rapport' });
  }
});

// Valider un rapport
router.put('/:id/validate', authenticateToken, requireSupervisorOrAdmin, async (req, res) => {
  try {
    const report = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);

    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    if (report[0].status === 'validated') {
      return res.status(400).json({ error: 'Rapport déjà validé' });
    }

    await db.query(
      `UPDATE reports SET status = 'validated', validated_by = ?, validated_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [req.user.id, req.params.id]
    );

    res.json({ message: 'Rapport validé avec succès' });
  } catch (error) {
    console.error('Erreur validation rapport:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du rapport' });
  }
});

// Supprimer un rapport
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);

    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Vérifier les droits et le statut
    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    if (report[0].status === 'validated' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Rapport validé, suppression impossible' });
    }

    await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);

    res.json({ message: 'Rapport supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression rapport:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rapport' });
  }
});

// Générer PDF pour un rapport
router.get('/:id/pdf', authenticateToken, async (req, res) => {
  try {
    // Récupérer le rapport
    const report = await db.query(
      `SELECT r.*, s.name as site_name, s.address as site_address, s.city as site_city,
              u.first_name as watcher_first_name, u.last_name as watcher_last_name,
              v.first_name as validator_first_name, v.last_name as validator_last_name
       FROM reports r
       JOIN sites s ON r.site_id = s.id
       JOIN users u ON r.watcher_id = u.id
       LEFT JOIN users v ON r.validated_by = v.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Vérifier les droits d'accès
    if (req.user.role === 'watcher' && report[0].watcher_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer les événements
    const events = await db.query('SELECT * FROM events WHERE report_id = ? ORDER BY event_time ASC', [req.params.id]);

    // Récupérer les photos
    const photos = await db.query('SELECT * FROM photos WHERE report_id = ?', [req.params.id]);

    // Créer le PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `rapport_${req.params.id}_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../uploads/pdfs', filename);

    // Créer le dossier si nécessaire
    const pdfsDir = path.dirname(filepath);
    if (!fs.existsSync(pdfsDir)) {
      fs.mkdirSync(pdfsDir, { recursive: true });
    }

    // Stream le fichier
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // En-tête
    doc.fontSize(20).text('RAPPORT DE VEILLE DE NUIT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Rapport #${report[0].id}`, { align: 'center' });
    doc.moveDown();

    // Informations générales
    doc.fontSize(14).text('INFORMATIONS GÉNÉRALES', { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Site: ${report[0].site_name}`);
    doc.text(`Adresse: ${report[0].site_address}, ${report[0].site_city}`);
    doc.text(`Date: ${new Date(report[0].shift_date).toLocaleDateString('fr-FR')}`);
    doc.text(`Horaires: ${new Date(report[0].shift_start).toLocaleTimeString('fr-FR')} - ${new Date(report[0].shift_end).toLocaleTimeString('fr-FR')}`);
    doc.text(`Veilleur: ${report[0].watcher_first_name} ${report[0].watcher_last_name}`);
    if (report[0].weather) doc.text(`Météo: ${report[0].weather}`);
    if (report[0].temperature) doc.text(`Température: ${report[0].temperature}°C`);
    doc.moveDown();

    // Événements
    if (events.length > 0) {
      doc.fontSize(14).text('ÉVÉNEMENTS', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      
      events.forEach((event, index) => {
        doc.text(`${index + 1}. ${event.title} (${event.event_type})`);
        doc.text(`   Heure: ${new Date(event.event_time).toLocaleTimeString('fr-FR')}`);
        if (event.location) doc.text(`   Lieu: ${event.location}`);
        if (event.description) doc.text(`   Description: ${event.description}`);
        if (event.action_taken) doc.text(`   Action: ${event.action_taken}`);
        doc.moveDown(0.5);
      });
    }

    // Notes générales
    if (report[0].general_notes) {
      doc.fontSize(14).text('NOTES GÉNÉRALES', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(report[0].general_notes);
      doc.moveDown();
    }

    // Validation
    if (report[0].status === 'validated') {
      doc.fontSize(14).text('VALIDATION', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Validé par: ${report[0].validator_first_name} ${report[0].validator_last_name}`);
      doc.text(`Date de validation: ${new Date(report[0].validated_at).toLocaleString('fr-FR')}`);
    }

    doc.end();

    stream.on('finish', () => {
      res.download(filepath, `rapport_${req.params.id}.pdf`, () => {
        fs.unlinkSync(filepath); // Supprimer le fichier après envoi
      });
    });
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
});

module.exports = router;