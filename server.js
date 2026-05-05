import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app = express();
const publicDir = path.join(__dirname, "public");

// RSS proxy – avoids browser CORS restrictions when fetching external feeds
app.get("/api/rss", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url param" });

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid url" });
  }

  // Only allow http(s) feeds
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return res.status(400).json({ error: "Only http/https URLs are allowed" });
  }

  try {
    const upstream = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSS-proxy/1.0)" },
      redirect: "follow",
    });
    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream returned ${upstream.status}` });
    }
    const text = await upstream.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch feed", detail: err.message });
  }
});

// Serve static files normally (css/js/images/html if requested directly)
app.use(express.static(publicDir));

// Route -> file mapping (lets us keep "pretty" URLs, case-insensitive)
const routeToFile = new Map([
  ["", "index.html"],
  ["index", "index.html"],
  ["blog", "blog.html"],
  ["faq", "faq.html"],
  ["financements", "financements.html"],
  ["formation-dev-web", "formation-dev-web.html"],
  ["mentions-legales", "mentions-legales.html"],
  ["notre-equipe", "notre-equipe.html"],
  ["nous-contacter", "nous-contacter.html"],
  ["pedagogie", "pedagogie.html"],
  // Backwards-compatible slug used in index.html
  ["pedagogie-et-environnement", "pedagogie.html"],
  ["politique", "politique.html"],
  ["recruter-un-alternant", "recruter-un-alternant.html"],
  ["se-renseigner-et-candidater", "se-renseigner-et-candidater.html"],
]);

// Missing pages referenced in the HTML (avoid 404s)
const redirectTo = new Map([
  ["nos-formations", "/#formations"],
  ["chef-de-projet-cyber", "/#formations"],
]);

function sendPublicFile(res, filename) {
  return res.sendFile(path.join(publicDir, filename));
}

function normalizeSlug(slug) {
  return slug.replace(/^\/+|\/+$/g, "").toLowerCase();
}

function handleSlug(req, res, next, slug) {
  const normalized = normalizeSlug(slug);

  // Basic path traversal guard
  if (normalized.includes("..")) return res.status(400).send("Bad request");

  // Redirects first
  if (redirectTo.has(normalized)) return res.redirect(302, redirectTo.get(normalized));

  // Known routes
  if (routeToFile.has(normalized)) return sendPublicFile(res, routeToFile.get(normalized));

  // Fallback: if "/something" and "something.html" exists, serve it
  const htmlFile = path.join(publicDir, `${normalized}.html`);
  if (fs.existsSync(htmlFile)) return res.sendFile(htmlFile);

  return next();
}

// If someone requests "/something" and "something.html" exists, serve it.
// (Express 5 doesn't accept app.get("*") anymore, so use middleware instead.)
app.use((req, res, next) => {
  let pathname;
  try {
    pathname = decodeURIComponent(req.path);
  } catch {
    return res.status(400).send("Bad request");
  }

  const ext = path.posix.extname(pathname);

  // Let express.static handle non-HTML assets (css/js/images/...)
  if (ext && ext !== ".html") return next();

  // If someone requested "/page.html" we can still map/redirect
  if (ext === ".html") {
    const base = pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/i, "");
    return handleSlug(req, res, next, base);
  }

  // Extension-less path ("/faq", "/FAQ/", ...)
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  return handleSlug(req, res, next, slug);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));