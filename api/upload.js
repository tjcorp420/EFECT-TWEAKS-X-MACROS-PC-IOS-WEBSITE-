import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false
  }
};

async function readRequestBody(request) {
  const chunks = [];
  
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

export default async function handler(request, response) {
  try {
    if (request.method !== "POST") {
      return response.status(405).json({
        ok: false,
        error: "Method not allowed."
      });
    }
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return response.status(500).json({
        ok: false,
        error: "Missing BLOB_READ_WRITE_TOKEN."
      });
    }
    
    const fileName = request.headers["x-file-name"] || `emx-upload-${Date.now()}.png`;
    const contentType = request.headers["content-type"] || "application/octet-stream";
    const safeName = String(fileName)
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase();
    
    const body = await readRequestBody(request);
    
    if (!body || body.length === 0) {
      return response.status(400).json({
        ok: false,
        error: "No file uploaded."
      });
    }
    
    const blob = await put(`emx-products/${Date.now()}-${safeName}`, body, {
      access: "public",
      contentType
    });
    
    return response.status(200).json({
      ok: true,
      url: blob.url
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error.message || "Upload failed."
    });
  }
}