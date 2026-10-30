const express = require('express');
const { getAuthors } = require('../services/authors.service');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const authors = await getAuthors();
    res.status(200).json(authors);
  } catch (error) {
    next(error);
  }
});

module.exports = router;