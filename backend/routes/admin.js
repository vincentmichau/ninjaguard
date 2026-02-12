const express = require('express');
const router = express.Router();
const db = require('../config/database');
const nodemailer = require('nodemailer');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// ========== GESTION DES SITES ==========

// Obtenir tous les sites
router.get('/sites', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const sites = await db.query(`
      SELECT s.*, c.name as client_name, c.company_name
      FROM sites s
      LEFT JOIN clients c ON s.client_id = c.id
      ORDER BY s.name
    `);
    res.json(sites);
  } catch (error) {
    console.error('Erreur récupération sites:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sites' });
  }
});

// Créer un site
router.post('/sites', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, city, postal_code, client_id, contact_person, contact_phone, emergency_contact, emergency_phone } = req.body;

    const result = await db.query(
      `INSERT INTO sites (name, address, city, postal_code, client_id, contact_person, contact_phone, emergency_contact, emergency_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address, city, postal_code, client_id, contact_person, contact_phone, emergency_contact, emergency_phone]
    );

    res.status(201).json({
      message: 'Site créé avec succès',
      site_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création site:', error);
    res.status(500).json({ error: 'Erreur lors de la création du site' });
  }
});

// Mettre à jour un site
router.put('/sites/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, city, postal_code, client_id, contact_person, contact_phone, emergency_contact, emergency_phone } = req.body;

    await db.query(
      `UPDATE sites SET name = ?, address = ?, city = ?, postal_code = ?, client_id = ?, 
       contact_person = ?, contact_phone = ?, emergency_contact = ?, emergency_phone = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, address, city, postal_code, client_id, contact_person, contact_phone, emergency_contact, emergency_phone, req.params.id]
    );

    res.json({ message: 'Site mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour site:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du site' });
  }
});

// Supprimer un site
router.delete('/sites/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM sites WHERE id = ?', [req.params.id]);
    res.json({ message: 'Site supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression site:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du site' });
  }
});

// ========== GESTION DES CLIENTS ==========

// Obtenir tous les clients
router.get('/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const clients = await db.query('SELECT * FROM clients ORDER BY name');
    res.json(clients);
  } catch (error) {
    console.error('Erreur récupération clients:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
});

// Créer un client
router.post('/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, company_name, email, phone, address } = req.body;

    const result = await db.query(
      'INSERT INTO clients (name, company_name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, company_name, email, phone, address]
    );

    res.status(201).json({
      message: 'Client créé avec succès',
      client_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ error: 'Erreur lors de la création du client' });
  }
});

// ========== GESTION DES EMAILS ==========

// Obtenir tous les destinataires d'emails
router.get('/email-recipients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const recipients = await db.query(`
      SELECT er.*, s.name as site_name, c.name as client_name
      FROM email_recipients er
      LEFT JOIN sites s ON er.site_id = s.id
      LEFT JOIN clients c ON er.client_id = c.id
      WHERE er.is_active = TRUE
    `);
    res.json(recipients);
  } catch (error) {
    console.error('Erreur récupération destinataires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des destinataires' });
  }
});

// Ajouter un destinataire d'email
router.post('/email-recipients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { site_id, client_id, email, name, role } = req.body;

    const result = await db.query(
      'INSERT INTO email_recipients (site_id, client_id, email, name, role) VALUES (?, ?, ?, ?, ?)',
      [site_id, client_id, email, name, role]
    );

    res.status(201).json({
      message: 'Destinataire ajouté avec succès',
      recipient_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur ajout destinataire:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du destinataire' });
  }
});

// Supprimer un destinataire d'email
router.delete('/email-recipients/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE email_recipients SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Destinataire désactivé avec succès' });
  } catch (error) {
    console.error('Erreur suppression destinataire:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du destinataire' });
  }
});

// ========== ENVOI D'EMAILS DE RAPPORT ==========

// Envoyer le rapport par email
router.post('/reports/:id/send-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const report = await db.query(
      `SELECT r.*, s.name as site_name, s.city as site_city,
              u.first_name as watcher_first_name, u.last_name as watcher_last_name
       FROM reports r
       JOIN sites s ON r.site_id = s.id
       JOIN users u ON r.watcher_id = u.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (report.length === 0) {
      return res.status(404).json({ error: 'Rapport non trouvé' });
    }

    // Récupérer les destinataires
    const recipients = await db.query(
      'SELECT email, name FROM email_recipients WHERE (site_id = ? OR site_id IS NULL) AND is_active = TRUE',
      [report[0].site_id]
    );

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'Aucun destinataire configuré pour ce site' });
    }

    // Configurer le transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Préparer les emails
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipients.map(r => r.email).join(', '),
      subject: `Rapport de veille - ${report[0].site_name} - ${new Date(report[0].shift_date).toLocaleDateString('fr-FR')}`,
      html: `
        <h2>Rapport de Veille de Nuit</h2>
        <p><strong>Site:</strong> ${report[0].site_name}</p>
        <p><strong>Date:</strong> ${new Date(report[0].shift_date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Veilleur:</strong> ${report[0].watcher_first_name} ${report[0].watcher_last_name}</p>
        <p><strong>Horaires:</strong> ${new Date(report[0].shift_start).toLocaleTimeString('fr-FR')} - ${new Date(report[0].shift_end).toLocaleTimeString('fr-FR')}</p>
        ${report[0].weather ? `<p><strong>Météo:</strong> ${report[0].weather}</p>` : ''}
        ${report[0].temperature ? `<p><strong>Température:</strong> ${report[0].temperature}°C</p>` : ''}
        ${report[0].general_notes ? `<p><strong>Notes:</strong> ${report[0].general_notes}</p>` : ''}
        <hr>
        <p>PDF disponible via l'application NightWatch.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
  }
});

// ========== STATISTIQUES ==========

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = {};

    stats.users = (await db.query('SELECT COUNT(*) as count FROM users'))[0].count;
    stats.sites = (await db.query('SELECT COUNT(*) as count FROM sites'))[0].count;
    stats.clients = (await db.query('SELECT COUNT(*) as count FROM clients'))[0].count;
    stats.reports = (await db.query('SELECT COUNT(*) as count FROM reports'))[0].count;
    stats.reports_validated = (await db.query('SELECT COUNT(*) as count FROM reports WHERE status = "validated"'))[0].count;
    stats.events = (await db.query('SELECT COUNT(*) as count FROM events'))[0].count;

    const reports_this_month = await db.query(
      'SELECT COUNT(*) as count FROM reports WHERE MONTH(shift_date) = MONTH(CURRENT_DATE) AND YEAR(shift_date) = YEAR(CURRENT_DATE)'
    );
    stats.reports_this_month = reports_this_month[0].count;

    res.json(stats);
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router;