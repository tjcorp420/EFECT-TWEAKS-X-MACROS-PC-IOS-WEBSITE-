const { put } = require("@vercel/blob");
const { requireAdmin } = require("./_lib/admin-auth");

const MAX_UPLOAD_BYTES = 45 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

function sendJson(res, response, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(response));
}

function safeFileName(value) {
  const fileName = String(value || "emx-upload")
    .trim()
    .replace(/[\\/]/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return fileName || "emx-upload";
}

function extensionForContentType(contentType) {
  if (contentType === "image/jpeg") return ".jpg";
  if (contentType === "image/png") return ".png";
  if (contentType === "image/webp") return ".webp";
  if (contentType === "image/gif") return ".gif";
  if (contentType === "video/mp4") return ".mp4";
  if (contentType === "video/webm") return ".webm";
  if (contentType === "video/quicktime") return ".mov";
  return "";
}

async function readRequestBuffer(req) {
  if (Buffer.isBuffer(req.body)) return req.body;

  if (typeof req.body === "string") {
    return Buffer.from(req.body);
  }

  if (req.body && typeof req.body === "object" && req.body.type === "Buffer" && Array.isArray(req.body.data)) {
    return Buffer.from(req.body.data);
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;

    if (total > MAX_UPLOAD_BYTES) {
      throw new Error("Upload is too large. Keep media under 45 MB.");
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, { ok: true });
    }

    if (req.method !== "POST") {
      return sendJson(res, { ok: false, error: "Method not allowed." }, 405);
    }

    if (!requireAdmin(req)) {
      return sendJson(res, { ok: false, error: "Unauthorized." }, 401);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return sendJson(res, {
        ok: false,
        error: "BLOB_READ_WRITE_TOKEN is not configured in Vercel. Add Vercel Blob storage before uploading media."
      }, 500);
    }

    const contentType = String(req.headers["content-type"] || "application/octet-stream").split(";")[0].trim().toLowerCase();

    if (!ALLOWED_TYPES.has(contentType)) {
      return sendJson(res, {
        ok: false,
        error: "Unsupported file type. Upload JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV. Active SVG files are not accepted."
      }, 400);
    }

    const buffer = await readRequestBuffer(req);

    if (!buffer.length) {
      return sendJson(res, { ok: false, error: "Upload was empty." }, 400);
    }

    if (buffer.length > MAX_UPLOAD_BYTES) {
      return sendJson(res, { ok: false, error: "Upload is too large. Keep media under 45 MB." }, 413);
    }

    const originalName = safeFileName(req.headers["x-file-name"]);
    const hasExtension = /\.[a-z0-9]{2,5}$/i.test(originalName);
    const fileName = hasExtension ? originalName : `${originalName}${extensionForContentType(contentType)}`;
    const pathname = `emx-store/${Date.now()}-${fileName}`;

    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: true
    });

    return sendJson(res, {
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType,
      size: buffer.length
    });
  } catch (error) {
    return sendJson(res, {
      ok: false,
      error: error instanceof Error ? error.message : "Upload failed."
    }, 500);
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false
  }
};
