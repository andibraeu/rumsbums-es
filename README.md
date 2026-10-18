# Blitz & Donner

Baustellenseite in Astro. Die Startseite zeigt das Schild, Regen und ab und zu einen Blitz. Weitere Seiten gibt es schon als Gerüst.

## Lokal ansehen

Node.js 22.22 oder neuer.

```bash
npm install
npm run dev
```

Danach im Browser öffnen: [http://127.0.0.1:47231](http://127.0.0.1:47231)

## Texte ergänzen

Eine Markdown-Datei in den passenden Ordner legen:

- `src/content/blitzarten/`
- `src/content/gewitter/`
- `src/content/fotos/`

```md
---
title: Wolke-Erde
description: Ein Blitz von der Wolke zum Boden.
---

Hier steht der Text.
```

Die Datei erscheint danach in der passenden Rubrik. Regen und Blitze sind dort aus und lassen sich mit „Wetter“ einschalten. Die Navigation fehlt nur auf der Startseite.

## Deploy per FTPES

Bei jedem Push auf `main` baut GitHub Actions die Seite und lädt `dist/` per FTPES hoch (explizites FTPS, Standardport 21). Diese Secrets im Repository hinterlegen:

- `FTP_HOST` (Hostname oder IP)
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_REMOTE_DIR` (Zielordner, muss schon existieren und mit `/` enden, z. B. `httpdocs/`)
- `FTP_PORT` ist optional, sonst gilt Port 21.

Das Serverzertifikat wird geprüft. Passt es nicht zum Hostnamen, schlägt der Lauf fehl.

Die Action merkt sich den Stand in `.ftp-deploy-sync-state.json` eine Ebene über dem Zielordner, also neben `httpdocs/` und nicht im Webroot. Dafür muss der FTP-Benutzer dort schreiben dürfen. Die bisherige Datei in `httpdocs/` einmal per FTP löschen, sie wird nicht mehr angefasst.

## Updates

`renovate.json` liegt bereit. Die Renovate-App einmal mit dem GitHub-Repository verbinden, danach kommen Update-Pull-Requests von selbst.
