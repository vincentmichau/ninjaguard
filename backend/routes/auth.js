const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role, sites } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur
    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role, sites) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, password_hash, first_name, last_name, phone, role || 'watcher', JSON.stringify(sites || [])]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier l'utilisateur
    const users = await db.query(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Mettre à jour last_login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        sites: JSON.parse(user.sites || '[]')
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Récupérer le profil
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.query(
      'SELECT id, email, first_name, last_name, phone, role, sites, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      ...user[0],
      sites: JSON.parse(user[0].sites || '[]')
    });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Mettre à jour le profil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;

    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, phone, req.user.id]
    );

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// Changer le mot de passe
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Vérifier l'ancien mot de passe
    const user = await db.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    const validPassword = await bcrypt.compare(current_password, user[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const password_hash = await bcrypt.hash(new_password, 10);

    await db.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, req.user.id]
    );

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

module.exports = router;