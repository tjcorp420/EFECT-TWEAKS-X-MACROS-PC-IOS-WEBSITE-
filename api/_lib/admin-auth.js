const crypto = require("crypto");

function secretMatches(expectedValue, actualValue) {
  const expected = Buffer.from(String(expectedValue || ""));
  const actual = Buffer.from(String(actualValue || ""));
  if (!expected.length || !actual.length || expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

function requireAdmin(req) {
  return secretMatches(process.env.ADMIN_PASSWORD, req.headers["x-admin-password"]);
}

module.exports = { requireAdmin, secretMatches };
