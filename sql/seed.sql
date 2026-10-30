BEGIN;

INSERT INTO authors (name, email, bio) VALUES
('Ana García', 'ana@example.com', 'Desarrolladora de aplicaciones web.'),
('Carlos Ruiz', 'carlos@example.com', 'Escritor de artículos sobre tecnología.');

INSERT INTO posts (author_id, title, content, published)
SELECT id, 'Mi primera publicación', 'Estamos construyendo MiniBlog.', TRUE
FROM authors
WHERE email = 'ana@example.com';

INSERT INTO posts (author_id, title, content, published)
SELECT id, 'Aprendiendo PostgreSQL', 'Las publicaciones pertenecen a un autor.', FALSE
FROM authors
WHERE email = 'carlos@example.com';

COMMIT;