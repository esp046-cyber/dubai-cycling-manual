# Discovery & Jebel Ali Pedal: Dubai Cycling Manual

An offline-first Progressive Web App with 140+ cycling tips for Discovery Gardens, Jebel Ali Village, Festival Plaza and the Jebel Ali Free Zone (JAFZA). No external runtime dependencies. Works by opening `index.html` or from GitHub Pages.

> Guidance only. Cycling rules, road access and metro policies change. Confirm with the RTA and Dubai Police before you ride.

## Features

- 6 filterable tip categories, live search, bookmarks saved to `localStorage`
- "Ride Ready" checklist with persistent progress
- SOS dial buttons: 999 (Police), 998 (Ambulance), 800 9090 (RTA)
- One-tap copy for coordinates and a starter GPX file
- Online/offline indicator, installable standalone PWA, branded offline page

## Deploy to GitHub from an iPhone (no computer needed)

### Option A: ZIP builder (recommended)

1. Open `zip-builder.html` in Safari (from Files, or host it anywhere).
2. Tap **Build ZIP**. Safari downloads `dubai-cycling-manual.zip`.
3. In Files, tap the ZIP to extract it into a folder.
4. Sign in at github.com in Safari. Tap **+** then **New repository**. Name it (for example `dubai-cycling-manual`), set it **Public**, and create it.
5. On the empty repo page tap **uploading an existing file**.
6. Tap **choose your files**, then browse to the extracted folder and select all files and folders. Upload `assets/` files individually if Safari does not allow selecting folders.
7. Scroll down and tap **Commit changes**.

### Turn on GitHub Pages

1. In the repository, open **Settings** then **Pages**.
2. Under **Build and deployment**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. Wait a minute, then open `https://YOUR-USERNAME.github.io/REPO-NAME/`.

### Install on iPhone

Open the Pages URL in Safari, tap **Share**, then **Add to Home Screen**. Open it once online so the service worker caches everything. After that it works offline.

## Update the placeholders

Replace `YOUR-USERNAME` and `REPO-NAME` in `sitemap.xml` and `robots.txt` with your real GitHub username and repository name. Bump `VERSION` in `service-worker.js` whenever you change files so phones refresh their cache.

## Project structure

```
index.html  style.css  script.js  service-worker.js  offline.html
manifest.json  browserconfig.xml  favicon.ico  icon-192.png  icon-512.png
assets/  (tips-data.js, og-image.png, icons.svg)
tests/  docs/  config/  screenshots/
README.md  LICENSE  package.json  .gitignore  .env.example  robots.txt  sitemap.xml
```

## Local development

```
npm test        # validates tip data and file structure
npm run build   # rebuilds the ZIP and zip-builder.html
npm start       # serves the folder on http://localhost:8080
```

## Adding tips

Edit `assets/tips-data.js`. Each entry is `[category, title, text]`. Categories: `dg`, `ja`, `legal`, `summer`, `mech`, `night`.

## License

MIT. See `LICENSE`.
