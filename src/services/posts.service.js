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

async function getPostsByAuthor(authorId) {
  const result = await pool.query(
    `SELECT
       posts.id,
       posts.title,
       posts.content,
       posts.published,
       posts.created_at,
       posts.author_id,
       authors.name AS author_name,
       authors.email AS author_email,
       authors.bio AS author_bio,
       authors.created_at AS author_created_at
     FROM posts
     JOIN authors ON posts.author_id = authors.id
     WHERE posts.author_id = $1
     ORDER BY posts.id`,
    [authorId]
  );

  return result.rows;
}




module.exports = { getPosts, getPostById, getPostsByAuthor };