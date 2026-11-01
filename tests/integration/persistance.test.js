require('dotenv').config({ quiet: true });

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const request = require('supertest');

// Validamos la base antes de cargar la conexión.
if (process.env.TEST_DB_NAME !== 'miniblog_test') {
  throw new Error(
    'Las pruebas de integración requieren TEST_DB_NAME=miniblog_test'
  );
}

process.env.DB_NAME = process.env.TEST_DB_NAME;
delete process.env.DATABASE_URL;

const pool = require('../../src/db/pool');
const app = require('../../src/app');

after(async () => {
  await pool.end();
});

test('El CRUD de autores persiste los cambios en PostgreSQL', async () => {
  const email = `test-${randomUUID()}@example.com`;
  let authorId;

  // Confirmamos a qué base se conectó realmente.
  const database = await pool.query('SELECT current_database() AS name');
  assert.equal(database.rows[0].name, 'miniblog_test');

  try {
    // Crear desde la API.
    const created = await request(app)
      .post('/authors')
      .send({
        name: 'Autor de integración',
        email,
        bio: 'Registro temporal de prueba.',
      });

    assert.equal(created.status, 201);
    authorId = created.body.id;
    assert.ok(Number.isInteger(authorId));

    // Comprobar directamente que se guardó en PostgreSQL.
    const saved = await pool.query(
      'SELECT name, email FROM authors WHERE id = $1',
      [authorId]
    );

    assert.equal(saved.rows.length, 1);
    assert.equal(saved.rows[0].email, email);
    assert.equal(saved.rows[0].name, 'Autor de integración');

    // Consultar desde la API.
    const found = await request(app).get(`/authors/${authorId}`);

    assert.equal(found.status, 200);
    assert.equal(found.body.email, email);

    // Actualizar desde la API.
    const updated = await request(app)
      .put(`/authors/${authorId}`)
      .send({
        name: 'Autor actualizado',
        email,
        bio: 'Biografía actualizada.',
      });

    assert.equal(updated.status, 200);

    // Comprobar que la actualización quedó guardada.
    const changed = await pool.query(
      'SELECT name, bio FROM authors WHERE id = $1',
      [authorId]
    );

    assert.equal(changed.rows[0].name, 'Autor actualizado');
    assert.equal(changed.rows[0].bio, 'Biografía actualizada.');

    // Eliminar desde la API.
    const deleted = await request(app).delete(`/authors/${authorId}`);

    assert.equal(deleted.status, 204);

    // Comprobar que desapareció de PostgreSQL.
    const remaining = await pool.query(
      'SELECT id FROM authors WHERE id = $1',
      [authorId]
    );

    assert.equal(remaining.rows.length, 0);

    const missing = await request(app).get(`/authors/${authorId}`);
    assert.equal(missing.status, 404);
  } finally {
    // Limpiar nuestro registro incluso si alguna comprobación falla.
    await pool.query('DELETE FROM authors WHERE email = $1', [email]);
  }
});

test('Las publicaciones persisten y se eliminan junto con su autor', async () => {
  const email = `test-${randomUUID()}@example.com`;

  const database = await pool.query('SELECT current_database() AS name');
  assert.equal(database.rows[0].name, 'miniblog_test');

  try {
    // Crear un autor exclusivo para esta prueba.
    const author = await request(app)
      .post('/authors')
      .send({
        name: 'Autor de publicaciones',
        email,
      });

    assert.equal(author.status, 201);
    const authorId = author.body.id;

    // Crear una publicación.
    const created = await request(app)
      .post('/posts')
      .send({
        author_id: authorId,
        title: 'Publicación de integración',
        content: 'Contenido inicial.',
      });

    assert.equal(created.status, 201);
    const postId = created.body.id;

    // Comprobar que quedó guardada como borrador.
    const saved = await pool.query(
      'SELECT author_id, title, published FROM posts WHERE id = $1',
      [postId]
    );

    assert.equal(saved.rows.length, 1);
    assert.equal(saved.rows[0].author_id, authorId);
    assert.equal(saved.rows[0].title, 'Publicación de integración');
    assert.equal(saved.rows[0].published, false);

    // Verificar la consulta que une publicaciones y autores.
    const byAuthor = await request(app)
      .get(`/posts/author/${authorId}`);

    assert.equal(byAuthor.status, 200);
    assert.equal(byAuthor.body.length, 1);
    assert.equal(byAuthor.body[0].id, postId);
    assert.equal(byAuthor.body[0].author_email, email);

    // Actualizar la publicación.
    const updated = await request(app)
      .put(`/posts/${postId}`)
      .send({
        author_id: authorId,
        title: 'Publicación actualizada',
        content: 'Contenido actualizado.',
        published: true,
      });

    assert.equal(updated.status, 200);

    const changed = await pool.query(
      'SELECT title, content, published FROM posts WHERE id = $1',
      [postId]
    );

    assert.equal(changed.rows[0].title, 'Publicación actualizada');
    assert.equal(changed.rows[0].content, 'Contenido actualizado.');
    assert.equal(changed.rows[0].published, true);

    // Eliminar al autor debe eliminar también su publicación.
    const deleted = await request(app).delete(`/authors/${authorId}`);

    assert.equal(deleted.status, 204);

    const remaining = await pool.query(
      'SELECT id FROM posts WHERE id = $1',
      [postId]
    );

    assert.equal(remaining.rows.length, 0);

    const missing = await request(app).get(`/posts/${postId}`);
    assert.equal(missing.status, 404);
  } finally {
    // La cascada también limpia publicaciones si la prueba falla.
    await pool.query('DELETE FROM authors WHERE email = $1', [email]);
  }
});