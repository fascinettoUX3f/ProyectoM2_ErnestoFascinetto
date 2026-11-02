const express = require('express');
const authorsRouter = require('./routes/authors.routes');
const postsRouter = require('./routes/posts.routes');

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

const app = express();


const openapiPath = path.join(__dirname, '../docs/openapi.yaml');
const openapiDocument = YAML.parse(
  fs.readFileSync(openapiPath, 'utf8')
);



app.use(express.json());

app.get('/openapi.json', (req, res) => {
  res.status(200).json(openapiDocument);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));


app.use('/authors', authorsRouter);
app.use('/posts', postsRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API MiniBlog funcionando',
  });
});


app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'El cuerpo de la petición debe contener JSON válido',
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Ocurrió un error interno en el servidor',
  });
});



module.exports = app;