module.exports = (io) => {
  // Stockage des utilisateurs connectés
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('Utilisateur connecté:', socket.id);

    // Utilisateur connecté avec son ID
    socket.on('user_connected', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log('Utilisateur', userId, 'connecté avec socket', socket.id);
    });

    // Message direct
    socket.on('send_message', async (data) => {
      try {
        const { sender_id, receiver_id, message } = data;

        // Sauvegarder le message en base
        const db = require('../config/database');
        await db.query(
          'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
          [sender_id, receiver_id, message]
        );

        // Envoyer au destinataire s'il est connecté
        const receiverSocketId = connectedUsers.get(receiver_id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', {
            sender_id,
            message,
            sent_at: new Date()
          });
        }
      } catch (error) {
        console.error('Erreur envoi message:', error);
      }
    });

    // Message de groupe
    socket.on('send_group_message', async (data) => {
      try {
        const { sender_id, group_id, message } = data;

        // Sauvegarder le message en base
        const db = require('../config/database');
        await db.query(
          'INSERT INTO chat_messages (sender_id, group_id, message) VALUES (?, ?, ?)',
          [sender_id, group_id, message]
        );

        // Envoyer à tous les membres du groupe
        const members = await db.query(
          'SELECT user_id FROM chat_group_members WHERE group_id = ?',
          [group_id]
        );

        members.forEach(member => {
          const memberSocketId = connectedUsers.get(member.user_id);
          if (memberSocketId) {
            io.to(memberSocketId).emit('new_group_message', {
              sender_id,
              group_id,
              message,
              sent_at: new Date()
            });
          }
        });
      } catch (error) {
        console.error('Erreur envoi message groupe:', error);
      }
    });

    // Marquer messages comme lus
    socket.on('mark_read', async (data) => {
      try {
        const { sender_id, receiver_id } = data;
        const db = require('../config/database');
        await db.query(
          'UPDATE chat_messages SET is_read = TRUE, read_at = NOW() WHERE sender_id = ? AND receiver_id = ?',
          [sender_id, receiver_id]
        );

        // Notifier l'expéditeur
        const senderSocketId = connectedUsers.get(sender_id);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', { by: receiver_id });
        }
      } catch (error) {
        console.error('Erreur marquer lu:', error);
      }
    });

    // Utilisateur en train d'écrire
    socket.on('typing', (data) => {
      const { receiver_id, sender_id } = data;
      const receiverSocketId = connectedUsers.get(receiver_id);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { user_id: sender_id });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      // Retirer l'utilisateur des connectés
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log('Utilisateur', userId, 'déconnecté');
          break;
        }
      }
    });
  });
};