Precompressed assets and CI artifact

This project generates gzipped and brotli-compressed frontend assets after build.

- Run locally after build: npm run compress:dist
- CI artifact name: frontend-dist (contains dist/ with .gz and .br alongside originals)
- Download artifacts from Actions UI when needed for manual deploy.

Serving precompressed files (NGINX example):

location / {
  try_files $uri $uri/index.html =404;
  gzip_static on;        # serves .gz when client accepts gzip
  brotli_static on;      # serves .br when client accepts brotli (nginx brotli module)
}

Notes:
- Many CDNs (Cloudflare, Fastly) automatically serve precompressed assets when configured; check provider docs.
- Ensure your webserver or CDN prefers precompressed files and sets Content-Encoding and Vary headers correctly.
- For Spring Boot, consider serving static from /public and enabling a resource handling filter to prefer .br/.gz if available behind a proxy that doesn't handle compression.
