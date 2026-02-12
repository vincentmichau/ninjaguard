const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obtenir les conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    // Messages directs
    const direct = await db.query(`
      SELECT DISTINCT 
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as user_id,
        u.first_name, u.last_name,
        MAX(sent_at) as last_message_time
      FROM chat_messages cm
      JOIN users u ON u.id = CASE WHEN cm.sender_id = ? THEN cm.receiver_id ELSE cm.sender_id END
      WHERE (sender_id = ? OR receiver_id = ?) AND receiver_id IS NOT NULL
      GROUP BY user_id, u.first_name, u.last_name
      ORDER BY last_message_time DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id]);

    // Groupes
    const groups = await db.query(`
      SELECT g.id, g.name, g.description, MAX(cm.sent_at) as last_message_time
      FROM chat_groups g
      JOIN chat_group_members gm ON g.id = gm.group_id
      LEFT JOIN chat_messages cm ON g.id = cm.group_id
      WHERE gm.user_id = ?
      GROUP BY g.id, g.name, g.description
      ORDER BY last_message_time DESC
    `, [req.user.id]);

    res.json({
      direct,
      groups
    });
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

// Obtenir les messages d'une conversation
router.get('/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await db.query(`
      SELECT cm.*, 
             u1.first_name as sender_first_name, u1.last_name as sender_last_name,
             u2.first_name as receiver_first_name, u2.last_name as receiver_last_name
      FROM chat_messages cm
      JOIN users u1 ON cm.sender_id = u1.id
      LEFT JOIN users u2 ON cm.receiver_id = u2.id
      WHERE (cm.sender_id = ? AND cm.receiver_id = ?) 
         OR (cm.sender_id = ? AND cm.receiver_id = ?)
      ORDER BY cm.sent_at ASC
    `, [req.user.id, req.params.userId, req.params.userId, req.user.id]);

    // Marquer comme lus
    await db.query(
      'UPDATE chat_messages SET is_read = TRUE, read_at = NOW() WHERE receiver_id = ? AND sender_id = ?',
      [req.user.id, req.params.userId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// Obtenir les messages d'un groupe
router.get('/group/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est membre du groupe
    const member = await db.query(
      'SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ?',
      [req.params.groupId, req.user.id]
    );

    if (member.length === 0) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const messages = await db.query(`
      SELECT cm.*, u.first_name as sender_first_name, u.last_name as sender_last_name
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.group_id = ?
      ORDER BY cm.sent_at ASC
    `, [req.params.groupId]);

    res.json(messages);
  } catch (error) {
    console.error('Erreur récupération messages groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages du groupe' });
  }
});

// Créer un groupe
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      'INSERT INTO chat_groups (name, description, created_by) VALUES (?, ?, ?)',
      [name, description, req.user.id]
    );

    // Ajouter le créateur comme admin
    await db.query(
      'INSERT INTO chat_group_members (group_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, req.user.id, 'admin']
    );

    res.status(201).json({
      message: 'Groupe créé avec succès',
      group_id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la création du groupe' });
  }
});

// Ajouter un membre à un groupe
router.post('/groups/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.body;

    // Vérifier que l'utilisateur est admin du groupe
    const admin = await db.query(
      'SELECT * FROM chat_group_members WHERE group_id = ? AND user_id = ? AND role = ?',
      [req.params.groupId, req.user.id, 'admin']
    );

    if (admin.length === 0) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    await db.query(
      'INSERT INTO chat_group_members (group_id, user_id) VALUES (?, ?)',
      [req.params.groupId, user_id]
    );

    res.json({ message: 'Membre ajouté avec succès' });
  } catch (error) {
    console.error('Erreur ajout membre:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du membre' });
  }
});

// Obtenir les membres d'un groupe
router.get('/groups/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const members = await db.query(`
      SELECT gm.*, u.first_name, u.last_name, u.email
      FROM chat_group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
    `, [req.params.groupId]);

    res.json(members);
  } catch (error) {
    console.error('Erreur récupération membres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
  }
});

module.exports = router;