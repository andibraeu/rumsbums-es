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

## Deploy per SFTP

Bei jedem Push auf `main` baut GitHub Actions die Seite und lädt `dist/` per SFTP hoch. Das funktioniert auf jedem Host, der SFTP über SSH anbietet. Diese Secrets im Repository hinterlegen:

- `SFTP_HOST` (Hostname oder IP)
- `SFTP_USERNAME`
- `SFTP_REMOTE_DIR` (der Zielordner, er muss schon existieren)
- Anmeldung über eines der beiden Secrets: `SFTP_SSH_KEY` (privater Schlüssel, vollständig, mit den Zeilen BEGIN und END) oder `SFTP_PASSWORD`. Ist ein Passwort hinterlegt, wird das Passwort benutzt.
- `SFTP_PORT` ist optional, sonst gilt Port 22.

## Updates

`renovate.json` liegt bereit. Die Renovate-App einmal mit dem GitHub-Repository verbinden, danach kommen Update-Pull-Requests von selbst.
