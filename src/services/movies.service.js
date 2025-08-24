const db = require("../configs/db");

// Helper: normalisasi array genre (support "Action,Drama" atau array)
function normalizeGenres(val) {
  if (Array.isArray(val))
    return val
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  if (typeof val === "string")
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

// GET all + search + filter + sort
exports.getAll = async (params = {}) => {
  const {
    q, // search di title
    genre, // "Action" | "Action,Drama" | ["Action","Drama"]
    year_min, // >=
    year_max, // <=
    sort = "created_at",
    order = "desc",
    limit,
    page,
  } = params;

  const ALLOWED_SORT = new Set([
    "id",
    "title",
    "release_year",
    "genre",
    "rating",
    "duration_min",
    "created_at",
    "updated_at",
  ]);

  const sortCol = ALLOWED_SORT.has(String(sort)) ? String(sort) : "created_at";
  const sortDir = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

  let yMin = Number.isFinite(Number(year_min)) ? Number(year_min) : null;
  let yMax = Number.isFinite(Number(year_max)) ? Number(year_max) : null;
  if (yMin !== null && yMax !== null && yMin > yMax)
    [yMin, yMax] = [yMax, yMin];

  const genres = normalizeGenres(genre);

  const where = [];
  const values = [];

  if (q && String(q).trim()) {
    where.push("title LIKE ?");
    values.push(`%${String(q).trim()}%`);
  }
  if (genres.length > 0) {
    const placeholders = genres.map(() => "?").join(",");
    where.push(`genre IN (${placeholders})`);
    values.push(...genres);
  }
  if (yMin !== null) {
    where.push("release_year >= ?");
    values.push(yMin);
  }
  if (yMax !== null) {
    where.push("release_year <= ?");
    values.push(yMax);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const usePagination =
    Number.isFinite(Number(limit)) &&
    Number.isFinite(Number(page)) &&
    Number(page) > 0;
  let limitSql = "";
  let safeLimit = 0;
  let offset = 0;
  if (usePagination) {
    safeLimit = Math.max(1, Math.min(100, Number(limit)));
    offset = (Number(page) - 1) * safeLimit;
    limitSql = " LIMIT ? OFFSET ? ";
  }

  const sql = `
    SELECT
      id, title, genre, release_year,
      synopsis, rating, duration_min, poster_url,
      created_at, updated_at
    FROM movies
    ${whereSql}
    ORDER BY ${sortCol} ${sortDir}
    ${limitSql}
  `.trim();

  const dataValues = usePagination ? [...values, safeLimit, offset] : values;
  const [rows] = await db.query(sql, dataValues);
  return rows;
};

// GET by ID
exports.getById = async (id) => {
  const [rows] = await db.query(
    `
    SELECT
      id, title, genre, release_year,
      synopsis, rating, duration_min, poster_url,
      created_at, updated_at
    FROM movies WHERE id = ?
    `,
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
exports.create = async ({
  title,
  release_year = null,
  genre = null,
  synopsis = null,
  rating = null,
  duration_min = null,
  poster_url = null,
}) => {
  const [result] = await db.query(
    `
    INSERT INTO movies
      (title, release_year, genre, synopsis, rating, duration_min, poster_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [title, release_year, genre, synopsis, rating, duration_min, poster_url]
  );
  return this.getById(result.insertId);
};

// PUT (Replace all fields)
exports.replace = async (
  id,
  {
    title,
    release_year,
    genre,
    synopsis = null,
    rating = null,
    duration_min = null,
    poster_url = null,
  }
) => {
  const [check] = await db.query("SELECT id FROM movies WHERE id = ?", [id]);
  if (check.length === 0) {
    const err = new Error("Movie not found");
    err.status = 404;
    throw err;
  }
  await db.query(
    `
    UPDATE movies
    SET title = ?, release_year = ?, genre = ?, synopsis = ?, rating = ?, duration_min = ?, poster_url = ?
    WHERE id = ?
    `,
    [title, release_year, genre, synopsis, rating, duration_min, poster_url, id]
  );
  return this.getById(id);
};

// PATCH (Partial update)
exports.update = async (id, fields) => {
  const [rows] = await db.query("SELECT * FROM movies WHERE id = ?", [id]);
  if (rows.length === 0) {
    const err = new Error("Movie not found");
    err.status = 404;
    throw err;
  }

  const allowed = [
    "title",
    "release_year",
    "genre",
    "synopsis",
    "rating",
    "duration_min",
    "poster_url",
  ];
  const keys = Object.keys(fields).filter((k) => allowed.includes(k));
  if (keys.length === 0) {
    const err = new Error("No valid fields to update");
    err.status = 400;
    throw err;
  }

  const setSql = keys.map((k) => `${k} = ?`).join(", ");
  const params = keys.map((k) => fields[k]);
  params.push(id);

  await db.query(`UPDATE movies SET ${setSql} WHERE id = ?`, params);
  return this.getById(id);
};

// DELETE
exports.remove = async (id) => {
  const [result] = await db.query("DELETE FROM movies WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    const err = new Error("Movie not found");
    err.status = 404;
    throw err;
  }
  return { deleted: true, id: Number(id) };
};
