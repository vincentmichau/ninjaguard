const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();

// Clé de cryptage pour RGPD (32 caractères = 256 bits)
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default32characterencryptionkey!!', 'utf8').slice(0, 32);

// Fonction de cryptage
function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Fonction de décryptage
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erreur décryptage:', error);
    return null;
  }
}

// Configuration pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nightwatch_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test de connexion
pool.getConnection()
  .then(connection => {
    console.log('✅ Connexion MySQL réussie');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MySQL:', err);
  });

module.exports = {
  pool,
  encrypt,
  decrypt,
  query: async (sql, params) => {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Erreur SQL:', error);
      throw error;
    }
  }
};