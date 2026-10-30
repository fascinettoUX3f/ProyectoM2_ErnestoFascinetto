CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHECK (TRIM(name) <> ''),
  email VARCHAR(150) UNIQUE NOT NULL CHECK (TRIM(email) <> ''),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL CHECK (TRIM(title) <> ''),
  content TEXT NOT NULL CHECK (TRIM(content) <> ''),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);