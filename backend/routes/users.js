const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtenir tous les utilisateurs (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, email, first_name, last_name, phone, role, sites, created_at, last_login, is_active FROM users ORDER BY created_at DESC'
    );
    res.json(users.map(u => ({ ...u, sites: JSON.parse(u.sites || '[]') })));
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Obtenir un utilisateur par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await db.query(
      'SELECT id, email, first_name, last_name, phone, role, sites, created_at, last_login, is_active FROM users WHERE id = ?',
      [req.params.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ ...user[0], sites: JSON.parse(user[0].sites || '[]') });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Créer un utilisateur (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role, sites } = req.body;

    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role, sites) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, password_hash, first_name, last_name, phone, role || 'watcher', JSON.stringify(sites || [])]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { first_name, last_name, phone, role, sites, is_active } = req.body;

    let query = 'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = NOW()';
    const params = [first_name, last_name, phone];

    if (req.user.role === 'admin') {
      if (role !== undefined) {
        query += ', role = ?';
        params.push(role);
      }
      if (sites !== undefined) {
        query += ', sites = ?';
        params.push(JSON.stringify(sites));
      }
      if (is_active !== undefined) {
        query += ', is_active = ?';
        params.push(is_active);
      }
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    await db.query(query, params);

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// Supprimer un utilisateur (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

module.exports = router;