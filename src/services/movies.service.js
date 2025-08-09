const db = require("../configs/db");

// GET all
exports.getAll = async () => {
  const [rows] = await db.query(
    "SELECT id, title, year, genre, created_at FROM movies"
  );
  return rows;
};

// GET by ID
exports.getById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, title, year, genre, created_at FROM movies WHERE id = ?",
    [id]
  );
  if (rows.length === 0) {
    const err = new Error("Movie not found");
    err.status = 404;
    throw err;
  }
  return rows[0];
};

// CREATE
exports.create = async ({ title, year, genre }) => {
  const [result] = await db.query(
    "INSERT INTO movies (title, year, genre) VALUES (?, ?, ?)",
    [title, year, genre]
  );
  return { id: result.insertId, title, year, genre };
};

// PUT (Replace all fields)
exports.replace = async (id, { title, year, genre }) => {
  const [check] = await db.query("SELECT id FROM movies WHERE id = ?", [id]);
  if (check.length === 0) {
    const err = new Error("Movie not found");
    err.status = 404;
    throw err;
  }
  await db.query(
    "UPDATE movies SET title = ?, year = ?, genre = ? WHERE id = ?",
    [title, year, genre, id]
  );
  return { id, title, year, genre };
};

// PATCH (Partial update)
exports.update = async (id, fields) => {
  const [rows] = await db.query("SELECT * FROM movies WHERE id = ?", [id]);
  if (rows.length === 0) {
    const err = new Error("Movie not found");
    err.status = 404;
    throw err;
  }

  const movie = rows[0];
  const updated = {
    title: fields.title ?? movie.title,
    year: fields.year ?? movie.year,
    genre: fields.genre ?? movie.genre,
  };

  await db.query(
    "UPDATE movies SET title = ?, year = ?, genre = ? WHERE id = ?",
    [updated.title, updated.year, updated.genre, id]
  );

  return { id, ...updated };
};

// DELETE
exports.remove = async (id) => {
  const [result] = await db.query("DELETE FROM movies WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    const err = new Error("Movie not found");
    err.status = 404;
    throw err;
  }
};
