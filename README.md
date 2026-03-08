# Finance Tracker PWA

This is a Progressive Web App version of the finance dashboard.

## What you get
- installable from the browser
- works offline after first load
- GitHub Pages ready
- local saved data in the browser

## Files
- `index.html`
- `style.css`
- `script.js`
- `manifest.json`
- `service-worker.js`
- `icons/`

## Run locally
A service worker needs a web server, so do one of these:
- upload to GitHub Pages, or
- run a simple local server

Example Python server:
```bash
python -m http.server 8000
```

Then open:
```bash
http://localhost:8000
```

## GitHub Pages
1. Create a repo
2. Upload all files
3. Enable Pages in repo settings
4. Open your Pages URL in Chrome or Edge on Android
5. Use the browser menu or the on-screen button to install

## Offline note
The app caches its files for offline use after the first successful load.
