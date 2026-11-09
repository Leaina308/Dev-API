const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Connexion à la base + création de la table depuis schema.sql
const db = new Database(path.join(__dirname, 'articles.db'));
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// Bonus : validation (title requis, max 255 caractères)
exports.validate = (req, res, next) => {
  const { title, content } = req.body;
  const errors = {};

  if (!title) errors.title = 'Le titre est requis';
  else if (typeof title !== 'string' || title.length > 255)
    errors.title = 'Le titre ne doit pas dépasser 255 caractères';

  if (!content) errors.content = 'Le contenu est requis';

  if (Object.keys(errors).length) return res.status(422).json({ errors });
  next();
};

// GET /api/articles
exports.index = (req, res) => {
  const perPage = 15;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const total = db.prepare('SELECT COUNT(*) AS n FROM articles').get().n;
  const data = db
    .prepare('SELECT * FROM articles ORDER BY id DESC LIMIT ? OFFSET ?')
    .all(perPage, (page - 1) * perPage);

  res.json({
    data,
    current_page: page,
    per_page: perPage,
    total,
    last_page: Math.ceil(total / perPage),
  });
};

// GET /api/articles/:id
exports.show = (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ message: 'Article introuvable' });
  res.json(article);
};

// POST /api/articles
exports.store = (req, res) => {
  const { title, content, published_at = null } = req.body;
  const info = db
    .prepare('INSERT INTO articles (title, content, published_at) VALUES (?, ?, ?)')
    .run(title, content, published_at);
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(article);
};

// PUT /api/articles/:id
exports.update = (req, res) => {
  const { title, content, published_at = null } = req.body;
  const info = db
    .prepare(`UPDATE articles
              SET title = ?, content = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`)
    .run(title, content, published_at, req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'Article introuvable' });
  res.json(db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id));
};

// DELETE /api/articles/:id
exports.destroy = (req, res) => {
  const info = db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ message: 'Article introuvable' });
  res.status(204).send();
};