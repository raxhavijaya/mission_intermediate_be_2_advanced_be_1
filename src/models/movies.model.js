const pool = require("../configs/db");
const query = (...args) => pool.query(...args);

const ALLOWED_SORT = new Set([
  "id",
  "title",
  "release_year",
  "rating",
  "duration_min",
  "created_at",
  "updated_at",
]);

async function findAll({
  page = 1,
  limit = 10,
  sort = "created_at",
  order = "desc",
  q = "",
}) {
  page = Number(page) || 1;
  limit = Math.min(Number(limit) || 10, 100);
  const offset = (page - 1) * limit;

  const sortCol = ALLOWED_SORT.has(String(sort)) ? String(sort) : "created_at";
  const orderDir = ["asc", "desc"].includes(String(order).toLowerCase())
    ? order.toUpperCase()
    : "DESC";

  const params = [];
  let whereSql = "";
  if (q && q.trim()) {
    whereSql = "WHERE title LIKE ?";
    params.push(`%${q}%`);
  }

  const rows = await query(
    `SELECT id, title, synopsis, release_year, rating, duration_min, created_at, updated_at
     FROM movies
     ${whereSql}
     ORDER BY ${sortCol} ${orderDir}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const total = (
    await query(`SELECT COUNT(*) AS c FROM movies ${whereSql}`, params)
  )[0].c;
  return { rows, total, page, limit };
}

async function findById(id) {
  const rows = await query(`SELECT * FROM movies WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function createOne({
  title,
  synopsis = null,
  release_year = null,
  rating = null,
  duration_min = null,
}) {
  const result = await query(
    `INSERT INTO movies (title, synopsis, release_year, rating, duration_min)
     VALUES (?, ?, ?, ?, ?)`,
    [title, synopsis, release_year, rating, duration_min]
  );
  return findById(result.insertId);
}

async function updateById(id, data) {
  const allowed = [
    "title",
    "synopsis",
    "release_year",
    "rating",
    "duration_min",
  ];
  const fields = Object.keys(data).filter((k) => allowed.includes(k));
  if (fields.length === 0) return null; 

  const setSql = fields.map((f) => `${f} = ?`).join(", ");
  const params = fields.map((f) => data[f]);
  params.push(id);

  await query(`UPDATE movies SET ${setSql} WHERE id = ?`, params);
  return findById(id);
}

async function deleteById(id) {
  await query(`DELETE FROM movies WHERE id = ?`, [id]);
  return { deleted: true, id: Number(id) };
}

module.exports = { findAll, findById, createOne, updateById, deleteById };
