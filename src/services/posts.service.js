const pool = require('../db/pool');

async function getPosts() {
  const result = await pool.query(
    `SELECT id, author_id, title, content, published, created_at
     FROM posts
     ORDER BY id`
  );

  return result.rows;
}

async function getPostById(id) {
  const result = await pool.query(
    `SELECT id, author_id, title, content, published, created_at
     FROM posts
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

module.exports = { getPosts, getPostById };