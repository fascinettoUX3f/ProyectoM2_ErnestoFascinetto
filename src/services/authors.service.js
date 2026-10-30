const pool = require('../db/pool');

async function getAuthors() {
  const result = await pool.query(
    'SELECT id, name, email, bio, created_at FROM authors ORDER BY id'
  );

  return result.rows;
}

module.exports = { getAuthors };