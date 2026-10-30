const express = require('express');

const {
  getPosts,
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
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


router.post('/', async (req, res, next) => {
  const {
    author_id,
    title,
    content,
    published = false,
  } = req.body || {};

  if (!Number.isInteger(author_id) || author_id <= 0 ||
      author_id > 2147483647) {
    return res.status(400).json({
      message: 'author_id debe ser un número entero positivo válido',
    });
  }

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      message: 'El título es obligatorio',
    });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      message: 'El título admite hasta 200 caracteres',
    });
  }

  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({
      message: 'El contenido es obligatorio',
    });
  }

  if (typeof published !== 'boolean') {
    return res.status(400).json({
      message: 'published debe ser true o false',
    });
  }

  try {
    const post = await createPost({
      author_id,
      title: title.trim(),
      content: content.trim(),
      published,
    });

    return res.status(201).json(post);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        message: 'El autor indicado no existe',
      });
    }

    next(error);
  }
});


router.put('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      message: 'El ID debe ser un número entero positivo válido',
    });
  }

  const { author_id, title, content, published } = req.body || {};

  if (!Number.isInteger(author_id) || author_id <= 0 ||
      author_id > 2147483647) {
    return res.status(400).json({
      message: 'author_id debe ser un número entero positivo válido',
    });
  }

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      message: 'El título es obligatorio',
    });
  }

  if (title.trim().length > 200) {
    return res.status(400).json({
      message: 'El título admite hasta 200 caracteres',
    });
  }

  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({
      message: 'El contenido es obligatorio',
    });
  }

  if (typeof published !== 'boolean') {
    return res.status(400).json({
      message: 'published debe ser true o false',
    });
  }

  try {
    const post = await updatePost(id, {
      author_id,
      title: title.trim(),
      content: content.trim(),
      published,
    });

    if (!post) {
      return res.status(404).json({
        message: 'Publicación no encontrada',
      });
    }

    return res.status(200).json(post);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        message: 'El autor indicado no existe',
      });
    }

    next(error);
  }
});


router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      message: 'El ID debe ser un número entero positivo válido',
    });
  }

  try {
    const post = await deletePost(id);

    if (!post) {
      return res.status(404).json({
        message: 'Publicación no encontrada',
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});


module.exports = router;
