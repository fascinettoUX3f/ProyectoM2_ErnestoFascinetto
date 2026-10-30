const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const pool = require('../src/db/pool');
const app = require('../src/app');

afterEach(() => {
  mock.restoreAll();
});

test('POST /posts crea una publicación como borrador por defecto', async () => {
  const post = {
    id: 10,
    author_id: 1,
    title: 'Mi publicación',
    content: 'Contenido de prueba.',
    published: false,
    created_at: '2026-10-29T00:00:00.000Z',
  };

  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [post],
  }));

  const response = await request(app)
    .post('/posts')
    .send({
      author_id: 1,
      title: ' Mi publicación ',
      content: ' Contenido de prueba. ',
    });

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, post);
  assert.equal(queryMock.mock.callCount(), 1);
  assert.deepEqual(
    queryMock.mock.calls[0].arguments[1],
    [1, 'Mi publicación', 'Contenido de prueba.', false]
  );
});

test('POST /posts rechaza contenido vacío sin consultar la base', async () => {
  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [],
  }));

  const response = await request(app)
    .post('/posts')
    .send({
      author_id: 1,
      title: 'Mi publicación',
      content: '   ',
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'El contenido es obligatorio');
  assert.equal(queryMock.mock.callCount(), 0);
});

test('POST /posts responde 400 si el autor no existe', async () => {
  mock.method(pool, 'query', async () => {
    const error = new Error('Autor inexistente');
    error.code = '23503';
    throw error;
  });

  const response = await request(app)
    .post('/posts')
    .send({
      author_id: 999,
      title: 'Mi publicación',
      content: 'Contenido de prueba.',
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'El autor indicado no existe');
});

test('GET /posts rechaza un ID fuera de rango sin consultar la base', async () => {
  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [],
  }));

  const response = await request(app).get('/posts/2147483648');

  assert.equal(response.status, 400);
  assert.equal(queryMock.mock.callCount(), 0);
});


test('PUT /posts/10 actualiza una publicación', async () => {
  const post = {
    id: 10,
    author_id: 1,
    title: 'Título actualizado',
    content: 'Contenido actualizado.',
    published: true,
    created_at: '2026-10-29T00:00:00.000Z',
  };

  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [post],
  }));

  const response = await request(app)
    .put('/posts/10')
    .send({
      author_id: 1,
      title: ' Título actualizado ',
      content: ' Contenido actualizado. ',
      published: true,
    });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, post);
  assert.equal(queryMock.mock.callCount(), 1);
  assert.deepEqual(
    queryMock.mock.calls[0].arguments[1],
    [1, 'Título actualizado', 'Contenido actualizado.', true, 10]
  );
});

test('PUT /posts/999 responde 404 si la publicación no existe', async () => {
  mock.method(pool, 'query', async () => ({
    rows: [],
  }));

  const response = await request(app)
    .put('/posts/999')
    .send({
      author_id: 1,
      title: 'Título actualizado',
      content: 'Contenido actualizado.',
      published: false,
    });

  assert.equal(response.status, 404);
  assert.equal(response.body.message, 'Publicación no encontrada');
});

test('DELETE /posts/10 elimina una publicación y responde sin cuerpo', async () => {
  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [{ id: 10 }],
  }));

  const response = await request(app).delete('/posts/10');

  assert.equal(response.status, 204);
  assert.equal(response.text, '');
  assert.equal(queryMock.mock.callCount(), 1);
  assert.deepEqual(queryMock.mock.calls[0].arguments[1], [10]);
});

test('DELETE /posts/999 responde 404 si la publicación no existe', async () => {
  mock.method(pool, 'query', async () => ({
    rows: [],
  }));

  const response = await request(app).delete('/posts/999');

  assert.equal(response.status, 404);
  assert.equal(response.body.message, 'Publicación no encontrada');
});