const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const pool = require('../src/db/pool');
const app = require('../src/app');

afterEach(() => {
  mock.restoreAll();
});

test('GET /authors devuelve la lista de autores', async () => {
  const authors = [
    {
      id: 1,
      name: 'Ana García',
      email: 'ana@example.com',
      bio: 'Desarrolladora web.',
      created_at: '2026-10-29T00:00:00.000Z',
    },
  ];

  mock.method(pool, 'query', async () => ({
    rows: authors,
  }));

  const response = await request(app).get('/authors');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, authors);
});

test('GET /authors/999 devuelve 404 si el autor no existe', async () => {
  mock.method(pool, 'query', async () => ({
    rows: [],
  }));

  const response = await request(app).get('/authors/999');

  assert.equal(response.status, 404);
  assert.equal(response.body.message, 'Autor no encontrado');
});

test('GET /authors/abc rechaza el ID sin consultar la base', async () => {
  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [],
  }));

  const response = await request(app).get('/authors/abc');

  assert.equal(response.status, 400);
  assert.equal(queryMock.mock.callCount(), 0);
});


test('POST /authors crea un autor y responde 201', async () => {
  const author = {
    id: 3,
    name: 'Ernesto',
    email: 'ernesto@example.com',
    bio: null,
    created_at: '2026-10-29T00:00:00.000Z',
  };

  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [author],
  }));

  const response = await request(app)
    .post('/authors')
    .send({
      name: ' Ernesto ',
      email: ' ernesto@example.com ',
    });

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, author);

  assert.equal(queryMock.mock.callCount(), 1);
  assert.deepEqual(
    queryMock.mock.calls[0].arguments[1],
    ['Ernesto', 'ernesto@example.com', null]
  );
});

test('POST /authors rechaza un nombre vacío sin consultar la base', async () => {
  const queryMock = mock.method(pool, 'query', async () => ({
    rows: [],
  }));

  const response = await request(app)
    .post('/authors')
    .send({
      name: '   ',
      email: 'ernesto@example.com',
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'El nombre es obligatorio');
  assert.equal(queryMock.mock.callCount(), 0);
});

test('POST /authors responde 400 si el email ya está registrado', async () => {
  mock.method(pool, 'query', async () => {
    const error = new Error('Email duplicado');
    error.code = '23505';
    throw error;
  });

  const response = await request(app)
    .post('/authors')
    .send({
      name: 'Ernesto',
      email: 'ernesto@example.com',
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'El email ya está registrado');
});