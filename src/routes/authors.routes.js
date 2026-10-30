const express = require('express');

const {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../services/authors.service');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const authors = await getAuthors();
    res.status(200).json(authors);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'El ID debe ser un número entero positivo',
    });
  }

  try {
    const author = await getAuthorById(id);

    if (!author) {
      return res.status(404).json({
        message: 'Autor no encontrado',
      });
    }

    return res.status(200).json(author);
  } catch (error) {
    next(error);
  }
});


router.post('/', async (req, res, next) => {
  const { name, email, bio } = req.body || {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      message: 'El nombre es obligatorio',
    });
  }

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      message: 'El email es obligatorio',
    });
  }

  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    return res.status(400).json({
      message: 'La biografía debe ser texto',
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();

  if (cleanName.length > 100 || cleanEmail.length > 150) {
    return res.status(400).json({
      message: 'El nombre admite hasta 100 caracteres y el email hasta 150',
    });
  }

  try {
    const author = await createAuthor({
      name: cleanName,
      email: cleanEmail,
      bio: bio == null ? null : bio.trim(),
    });

    return res.status(201).json(author);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        message: 'El email ya está registrado',
      });
    }

    next(error);
  }
});


router.put('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'El ID debe ser un número entero positivo',
    });
  }

  const { name, email, bio } = req.body || {};

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      message: 'El nombre es obligatorio',
    });
  }

  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      message: 'El email es obligatorio',
    });
  }

  if (bio !== undefined && bio !== null && typeof bio !== 'string') {
    return res.status(400).json({
      message: 'La biografía debe ser texto',
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();

  if (cleanName.length > 100 || cleanEmail.length > 150) {
    return res.status(400).json({
      message: 'El nombre admite hasta 100 caracteres y el email hasta 150',
    });
  }

  try {
    const author = await updateAuthor(id, {
      name: cleanName,
      email: cleanEmail,
      bio: bio == null ? null : bio.trim(),
    });

    if (!author) {
      return res.status(404).json({
        message: 'Autor no encontrado',
      });
    }

    return res.status(200).json(author);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        message: 'El email ya está registrado',
      });
    }

    next(error);
  }
});


router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'El ID debe ser un número entero positivo',
    });
  }

  try {
    const author = await deleteAuthor(id);

    if (!author) {
      return res.status(404).json({
        message: 'Autor no encontrado',
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});



module.exports = router;