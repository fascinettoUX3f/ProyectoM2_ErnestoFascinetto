# MiniBlog — Proyecto Integrador M2

API REST desarrollada con Node.js, Express y PostgreSQL para gestionar autores y publicaciones.

Proyecto Integrador del Módulo 2 de Henry Full Stack.

## Funcionalidades

- Crear, listar, consultar, editar y eliminar autores.
- Crear, listar, consultar, editar y eliminar publicaciones.
- Consultar publicaciones por autor incluyendo sus datos.
- Validar campos obligatorios, IDs y email único.
- Guardar los datos en PostgreSQL.
- Ejecutar pruebas automatizadas con Node.js y Supertest.

Un autor puede tener muchas publicaciones. Al eliminar un autor, también se eliminan sus publicaciones.

## Requisitos

- Node.js 24 y npm.
- PostgreSQL disponible localmente.
- Herramienta de terminal `psql`.

## Instalación local

1. Clonar el repositorio y entrar en la carpeta:

   ```bash
   git clone https://github.com/fascinettoUX3f/ProyectoM2_ErnestoFascinetto.git
   cd ProyectoM2_ErnestoFascinetto
   ```

2. Instalar las dependencias:

   ```bash
   npm ci
   ```

3. Copiar la plantilla de configuración:

   ```bash
   cp .env.example .env
   ```

4. Editar `.env` con los datos de conexión locales.
   Configurar `DB_USER` y, si corresponde, `DB_PASSWORD`.

5. Crear la base de datos utilizando un usuario con permiso para hacerlo:

   ```bash
   psql -h localhost -U TU_USUARIO -d postgres -c "CREATE DATABASE miniblog;"
   ```

6. Crear las tablas y cargar los datos iniciales:

   ```bash
   psql -h localhost -U TU_USUARIO -d miniblog -v ON_ERROR_STOP=1 -f sql/setup.sql
   psql -h localhost -U TU_USUARIO -d miniblog -v ON_ERROR_STOP=1 -f sql/seed.sql
   ```

   Reemplazar `TU_USUARIO` por el usuario local de PostgreSQL.
   Ejecutar estos scripts una sola vez sobre una base nueva.

7. Iniciar la aplicación:

   ```bash
   npm start
   ```

La API estará disponible en `http://localhost:3000`, salvo que se configure otro puerto.

Consultar los autores en `http://localhost:3000/authors`.

## Pruebas automatizadas

### Pruebas con consultas simuladas

```bash
npm test
```

Ejecuta 14 pruebas de rutas, validaciones y manejo de errores, sin conectarse a PostgreSQL.

### Pruebas de integración

Crear una base exclusiva para pruebas y sus tablas:

```bash
psql -h localhost -U TU_USUARIO -d postgres -c "CREATE DATABASE miniblog_test;"
psql -h localhost -U TU_USUARIO -d miniblog_test -v ON_ERROR_STOP=1 -f sql/setup.sql
```

Configurar en `.env`:

```env
TEST_DB_NAME=miniblog_test
```

Ejecutar:

```bash
npm run test:integration
```

Las dos pruebas de integración verifican persistencia, actualización, eliminación, relación entre tablas y borrado en cascada. Crean sus propios registros y los limpian al terminar.


## Endpoints

| Método | Ruta | Función |
|---|---|---|
| GET | /authors | Listar autores |
| GET | /authors/:id | Consultar un autor |
| POST | /authors | Crear un autor |
| PUT | /authors/:id | Actualizar un autor |
| DELETE | /authors/:id | Eliminar un autor y sus publicaciones |
| GET | /posts | Listar publicaciones |
| GET | /posts/:id | Consultar una publicación |
| GET | /posts/author/:authorId | Listar publicaciones con datos de su autor |
| POST | /posts | Crear una publicación |
| PUT | /posts/:id | Actualizar una publicación |
| DELETE | /posts/:id | Eliminar una publicación |

Las consultas de listas devuelven `[]` cuando no hay coincidencias. Esto incluye el filtro de publicaciones por un autor inexistente.

### Crear un autor

```bash
curl -i -X POST http://localhost:3000/authors \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ernesto","email":"ernesto@example.com","bio":"Autor de MiniBlog."}'
```

- `name`: texto obligatorio, máximo 100 caracteres.
- `email`: texto obligatorio y único, máximo 150 caracteres.
- `bio`: texto opcional; admite null.

Para actualizar un autor se utiliza PUT con nombre y email obligatorios. Si se omite bio, se guarda como null.

### Crear una publicación

Usar el ID de un autor existente:

```bash
curl -i -X POST http://localhost:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{"author_id":1,"title":"Mi publicación","content":"Contenido de ejemplo.","published":true}'
```

- `author_id`: número entero positivo correspondiente a un autor existente.
- `title`: texto obligatorio, máximo 200 caracteres.
- `content`: texto obligatorio.
- `published`: booleano; al crear, su valor predeterminado es false.

Para actualizar una publicación se utiliza PUT enviando los cuatro campos.

### Respuestas HTTP

| Código | Significado |
|---|---|
| 200 | Consulta o actualización exitosa |
| 201 | Recurso creado |
| 204 | Recurso eliminado; respuesta sin cuerpo |
| 400 | Datos inválidos, JSON incorrecto, email duplicado o autor relacionado inexistente |
| 404 | Recurso o ruta no encontrados |
| 500 | Error interno del servidor |

Los IDs deben ser enteros positivos de hasta 2147483647.

Los errores devuelven un objeto JSON con la propiedad `message`.

## Documentación OpenAPI

Con la aplicación iniciada mediante `npm start`:

- [Swagger UI](http://localhost:3000/docs/): consultar y probar los endpoints.
- [Especificación JSON](http://localhost:3000/openapi.json).
- [Archivo OpenAPI YAML](docs/openapi.yaml).

Las operaciones POST, PUT y DELETE de Swagger modifican la base configurada.

## Uso de IA

Se utilizó ChatGPT/Codex para planificar, apoyar la implementación, corregir errores y preparar pruebas y documentación. Los pasos clave se registran en [Uso de IA](docs/uso-ia.md).

## Variables de entorno

| Variable | Uso |
|---|---|
| PORT | Puerto HTTP; por defecto, 3000 |
| DATABASE_URL | Conexión completa a PostgreSQL; si tiene valor, tiene prioridad sobre DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD |
| DB_HOST | Dirección del servidor PostgreSQL |
| DB_PORT | Puerto de PostgreSQL |
| DB_NAME | Nombre de la base de la aplicación |
| DB_USER | Usuario de PostgreSQL |
| DB_PASSWORD | Contraseña, si corresponde |
| TEST_DB_NAME | Base de integración; debe ser miniblog_test |

El archivo `.env` contiene la configuración local y no se versiona.
`.env.example` es la plantilla pública de configuración.

## Despliegue en Render

- [API pública](https://miniblog-api-kacz.onrender.com/)
- [Swagger público](https://miniblog-api-kacz.onrender.com/docs/)
- [OpenAPI JSON público](https://miniblog-api-kacz.onrender.com/openapi.json)
- [Evidencia del despliegue](docs/evidencia-render.png)

Se utilizó Render como alternativa porque Railway tenía suspendido el registro de cuentas nuevas al intentar desplegar. Este cambio de plataforma está pendiente de aceptación por parte del equipo docente. [Estado de Railway](https://status.railway.com/incident/O1VGXWU5).

### Configuración utilizada

1. Crear una base Postgres Free en Oregon. No confundir el nombre del servicio con el nombre de la base generado por Render.
2. Desde una terminal local en la carpeta del proyecto, conectarse usando el host externo, nombre de base y usuario mostrados por Render:

   ```bash
   psql "host=HOST_EXTERNO dbname=NOMBRE_BASE user=USUARIO sslmode=require" -W
   ```

   Introducir la contraseña cuando se solicite y ejecutar una sola vez sobre la base nueva:

   ```text
   \set ON_ERROR_STOP on
   \i sql/setup.sql
   \i sql/seed.sql
   SELECT id, name FROM authors ORDER BY id;
   \q
   ```

3. Crear un Web Service conectado al repositorio de GitHub, con estos valores:

   | Campo | Valor |
   |---|---|
   | Rama desplegada | `main` |
   | Región | Oregon |
   | Lenguaje | Node |
   | Root Directory | Vacío |
   | Build Command | `npm ci` |
   | Start Command | `npm start` |
   | Compute | Free |
   | `NODE_VERSION` | `24` |
   | `DATABASE_URL` | Internal Database URL completa de la credencial activa |

   Configurar los valores secretos únicamente en Render. La URL interna comunica la API con Postgres dentro de Render; la externa permite conectarse desde la computadora. La URL pública HTTPS es la dirección de la API, no una conexión a la base. Render proporciona `PORT` automáticamente.

4. Desplegar y verificar `/authors`, `/posts`, `/docs/` y `/openapi.json` en la URL pública. Los dos primeros endpoints deben devolver los datos del seed.

El [PR #1](https://github.com/fascinettoUX3f/ProyectoM2_ErnestoFascinetto/pull/1) está integrado. Render despliega desde `main` y el despliegue fue verificado con consultas públicas de autores, publicaciones y OpenAPI. La especificación documenta las 11 operaciones de la API.

La validación local incluye 14 pruebas con consultas simuladas y 2 pruebas de integración aprobadas.

### Límites de la instancia gratuita

La API puede tardar en responder al despertar tras un período de inactividad. La base actual indica vencimiento el **30 de noviembre de 2026**; debe mantenerse disponible durante la evaluación. [Límites de Render Free](https://render.com/docs/free).
