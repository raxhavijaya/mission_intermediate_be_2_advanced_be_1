const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // TLS STARTTLS di 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Kirim email verifikasi
 * @param {string} to - email tujuan
 * @param {string} token - token verifikasi (plain)
 */
async function sendVerificationEmail(to, token) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const ttl = Number(process.env.VERIFICATION_TTL_HOURS || 24);
  const link = `${baseUrl}/api/v1/users/verify-email?token=${encodeURIComponent(
    token
  )}`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Movie App <no-reply@movie.app>",
    to,
    subject: "Verifikasi Email Movie App",
    text: `Halo! Verifikasi email kamu dengan membuka link ini: ${link}\nBerlaku ${ttl} jam.`,
    html: `
      <p>Halo!</p>
      <p>Silakan verifikasi email kamu dengan klik link di bawah:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Link ini berlaku ${ttl} jam.</p>
    `,
  });

  // Nodemailer (Ethereal) biasanya memberi preview URL di info.messageId melalui logger provider
  return info;
}

module.exports = { transporter, sendVerificationEmail };
