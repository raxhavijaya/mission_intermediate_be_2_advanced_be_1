// services/users.services.js
const db = require("../configs/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { sendVerificationEmail } = require("../utils/mailer"); // pastikan file utils/mailer.js sudah ada

// === REGISTER ===
exports.register = async ({ fullname, username, password, email }) => {
  if (!fullname || !username || !password || !email) {
    const err = new Error("All fields are required");
    err.status = 400;
    throw err;
  }
  if (password.length < 8) {
    const err = new Error("Password must be at least 8 characters");
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const token = uuidv4();
  const ttlHours = Number(process.env.VERIFICATION_TTL_HOURS || 24);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const emailLower = email.trim().toLowerCase();

  try {
    const [result] = await db.query(
      `
      INSERT INTO Pengguna 
        (fullname, username, password, email, email_verified, verification_token, verification_sent_at, verification_expires_at)
      VALUES (?, ?, ?, ?, 0, ?, NOW(), ?)
      `,
      [fullname.trim(), username.trim(), hashed, emailLower, token, expiresAt]
    );

    // Kirim email verifikasi (kalau gagal, biarin error bubble biar ketahuan misconfig SMTP)
    await sendVerificationEmail(emailLower, token);

    return {
      id: result.insertId,
      fullname,
      username,
      email: emailLower,
      email_verified: 0,
    };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const e = new Error("Username or email already exists");
      e.status = 409;
      throw e;
    }
    throw err;
  }
};

// === LOGIN ===
exports.login = async ({ email, password }) => {
  const emailLower = email.trim().toLowerCase();
  const [rows] = await db.query(`SELECT * FROM Pengguna WHERE email = ?`, [
    emailLower,
  ]);

  if (rows.length === 0) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  // Enforce verified-only
  if (!user.email_verified) {
    const err = new Error("Email belum terverifikasi");
    err.status = 403;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  return {
    token,
    user: {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      email_verified: !!user.email_verified,
    },
  };
};

// === VERIFY EMAIL ===
exports.verifyEmail = async (token) => {
  if (!token || !String(token).trim()) {
    const err = new Error("Token is required");
    err.status = 400;
    throw err;
  }

  const [rows] = await db.query(
    `SELECT id, email_verified, verification_expires_at 
     FROM Pengguna 
     WHERE verification_token = ?`,
    [token]
  );

  if (rows.length === 0) {
    const err = new Error("Invalid Verification Token");
    err.status = 400;
    throw err;
  }

  const user = rows[0];
  if (
    user.verification_expires_at &&
    new Date(user.verification_expires_at) < new Date()
  ) {
    const err = new Error("Invalid Verification Token");
    err.status = 400;
    throw err;
  }

  await db.query(
    `UPDATE Pengguna 
     SET email_verified = 1, verification_token = NULL, verification_expires_at = NULL, updated_at = NOW()
     WHERE id = ?`,
    [user.id]
  );

  return { message: "Email Terverifikasi Berhasil" };
};
