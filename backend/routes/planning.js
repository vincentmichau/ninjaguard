const express = require('express');
const axios = require('axios');
const ical = require('ical-generator');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtenir le planning personnel
router.get('/personal', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT p.*, s.name as site_name, s.address as site_address, s.city as site_city
      FROM planning p
      JOIN sites s ON p.site_id = s.id
      WHERE p.watcher_id = ?
    `;
    const params = [req.user.id];

    if (month && year) {
      query += ' AND MONTH(p.shift_date) = ? AND YEAR(p.shift_date) = ?';
      params.push(month, year);
    }

    query += ' ORDER BY p.shift_date ASC, p.shift_start ASC';

    const planning = await db.query(query, params);
    res.json(planning);
  } catch (error) {
    console.error('Erreur récupération planning:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du planning' });
  }
});

// Obtenir tout le planning (admin/supervisor)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'watcher') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { watcher_id, site_id, month, year } = req.query;
    let query = `
      SELECT p.*, s.name as site_name, s.city as site_city,
             u.first_name as watcher_first_name, u.last_name as watcher_last_name
      FROM planning p
      JOIN sites s ON p.site_id = s.id
      JOIN users u ON p.watcher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (watcher_id) {
      query += ' AND p.watcher_id = ?';
      params.push(watcher_id);
    }
    if (site_id) {
      query += ' AND p.site_id = ?';
      params.push(site_id);
    }
    if (month && year) {
      query += ' AND MONTH(p.shift_date) = ? AND YEAR(p.shift_date) = ?';
      params.push(month, year);
    }

    query += ' ORDER BY p.shift_date ASC, p.shift_start ASC';

    const planning = await db.query(query, params);
    res.json(planning);
  } catch (error) {
    console.error('Erreur récupération planning:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du planning' });
  }
});

// Créer un shift de planning
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { watcher_id, site_id, shift_date, shift_start, shift_end } = req.body;

    const result = await db.query(
      `INSERT INTO planning (watcher_id, site_id, shift_date, shift_start, shift_end)
       VALUES (?, ?, ?, ?, ?)`,
      [watcher_id, site_id, shift_date, shift_start, shift_end]
    );

    res.status(201).json({
      message: 'Shift créé avec succès',
      planning_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création planning:', error);
    res.status(500).json({ error: 'Erreur lors de la création du planning' });
  }
});

// Mettre à jour un shift
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { watcher_id, site_id, shift_date, shift_start, shift_end, status } = req.body;

    await db.query(
      `UPDATE planning SET watcher_id = ?, site_id = ?, shift_date = ?, shift_start = ?, 
       shift_end = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [watcher_id, site_id, shift_date, shift_start, shift_end, status, req.params.id]
    );

    res.json({ message: 'Planning mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour planning:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du planning' });
  }
});

// Supprimer un shift
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM planning WHERE id = ?', [req.params.id]);
    res.json({ message: 'Shift supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression planning:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du planning' });
  }
});

// Importer depuis API RH (Combo)
router.post('/import/rh', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    if (!process.env.RH_API_KEY) {
      return res.status(400).json({ error: 'API RH non configurée' });
    }

    // Appel à l'API Combo
    const response = await axios.get(`${process.env.RH_API_URL}/planning`, {
      params: { start_date, end_date },
      headers: { 'Authorization': `Bearer ${process.env.RH_API_KEY}` }
    });

    let importedCount = 0;

    for (const shift of response.data) {
      // Trouver ou créer l'utilisateur
      let user = await db.query('SELECT id FROM users WHERE email = ?', [shift.email]);
      if (user.length === 0) {
        const result = await db.query(
          'INSERT INTO users (email, first_name, last_name, role) VALUES (?, ?, ?, ?)',
          [shift.email, shift.first_name, shift.last_name, 'watcher']
        );
        user = [{ id: result.insertId }];
      }

      // Trouver ou créer le site
      let site = await db.query('SELECT id FROM sites WHERE name = ?', [shift.site_name]);
      if (site.length === 0) {
        const result = await db.query(
          'INSERT INTO sites (name) VALUES (?)',
          [shift.site_name]
        );
        site = [{ id: result.insertId }];
      }

      // Créer ou mettre à jour le planning
      const existing = await db.query(
        'SELECT id FROM planning WHERE watcher_id = ? AND shift_date = ? AND shift_start = ?',
        [user[0].id, shift.date, shift.start]
      );

      if (existing.length === 0) {
        await db.query(
          `INSERT INTO planning (watcher_id, site_id, shift_date, shift_start, shift_end, external_id, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [user[0].id, site[0].id, shift.date, shift.start, shift.end, shift.external_id, 'scheduled']
        );
        importedCount++;
      }
    }

    res.json({
      message: 'Import réussi',
      imported: importedCount
    });
  } catch (error) {
    console.error('Erreur import RH:', error);
    res.status(500).json({ error: 'Erreur lors de l\'import depuis le système RH' });
  }
});

// Exporter en iCalendar
router.get('/export/ical', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT p.*, s.name as site_name,
             u.first_name as watcher_first_name, u.last_name as watcher_last_name
      FROM planning p
      JOIN sites s ON p.site_id = s.id
      JOIN users u ON p.watcher_id = u.id
      WHERE p.watcher_id = ?
    `;
    const params = [req.user.id];

    if (month && year) {
      query += ' AND MONTH(p.shift_date) = ? AND YEAR(p.shift_date) = ?';
      params.push(month, year);
    }

    query += ' ORDER BY p.shift_date ASC';

    const planning = await db.query(query, params);

    const calendar = ical({ name: 'Planning NightWatch' });

    planning.forEach(shift => {
      calendar.createEvent({
        start: new Date(shift.shift_start),
        end: new Date(shift.shift_end),
        summary: `Veille - ${shift.site_name}`,
        description: `Guard: ${shift.watcher_first_name} ${shift.watcher_last_name}`,
        location: shift.site_name,
        status: shift.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'
      });
    });

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=planning.ics');
    res.send(calendar.toString());
  } catch (error) {
    console.error('Erreur export iCal:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export du planning' });
  }
});

module.exports = router;