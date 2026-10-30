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


async function createPost({ author_id, title, content, published }) {
  const result = await pool.query(
    `INSERT INTO posts (author_id, title, content, published)
     VALUES ($1, $2, $3, $4)
     RETURNING id, author_id, title, content, published, created_at`,
    [author_id, title, content, published]
  );

  return result.rows[0];
}


async function updatePost(id, { author_id, title, content, published }) {
  const result = await pool.query(
    `UPDATE posts
     SET author_id = $1, title = $2, content = $3, published = $4
     WHERE id = $5
     RETURNING id, author_id, title, content, published, created_at`,
    [author_id, title, content, published, id]
  );

  return result.rows[0];
}


async function deletePost(id) {
  const result = await pool.query(
    'DELETE FROM posts WHERE id = $1 RETURNING id',
    [id]
  );

  return result.rows[0];
}



module.exports = {
  getPosts,
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
};