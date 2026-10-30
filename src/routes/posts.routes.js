const express = require('express');

const {
  getPosts,
  getPostById,
  getPostsByAuthor,
} = require('../services/posts.service');



const router = express.Router();


router.get('/', async (req, res, next) => {
  try {
    const posts = await getPosts();
    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});


router.get('/author/:authorId', async (req, res, next) => {
  const authorId = Number(req.params.authorId);

  if (!Number.isSafeInteger(authorId) || authorId <= 0) {
    return res.status(400).json({
      message: 'El ID del autor debe ser un número entero positivo',
    });
  }

  try {
    const posts = await getPostsByAuthor(authorId);

    return res.status(200).json(posts);
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
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        message: 'Publicación no encontrada',
      });
    }

    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

module.exports = router;