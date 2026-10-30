const express = require('express');
const authorsRouter = require('./routes/authors.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API MiniBlog funcionando',
  });
});

app.use('/authors', authorsRouter);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: 'Ocurrió un error interno en el servidor',
  });
});

module.exports = app;