const express = require('express');

const {
  getAuthors,
  getAuthorById,
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


module.exports = router;