# Handoff: beitragswandel.de – Landingpage 2026 (Claude-Design-Export → statisches HTML)

Stand: 2026-08-22 (Session S2564). Quelle: Claude-Design-Export `Beitragswandel-Landingpage.dc.html` (diese Mappe).
Die Export-Datei ist die **Lese-Referenz** (Layout, Farben, Abstände, Texte). Sie wird **nicht** als dc-runtime ausgeliefert.

## Stack (unverändert)
- Statische Seite, `nginx:alpine`, `Dockerfile` kopiert `*.html` nach `/usr/share/nginx/html/`, `nginx.conf` lauscht auf Port 3000.
- Deploy: Push/Merge auf `main` → GitHub Actions → GHCR `ghcr.io/kanne87/beitragswandel-landingpage:latest` → Coolify-App `zck4w0w0wcc88gg044gccco0` → https://beitragswandel.de
- Kein Build-Tool, kein Node, kein Tailwind-CDN mehr. Reines HTML + CSS (+ minimal JS nur falls unvermeidbar).

## Zielzustand
| Datei | Soll |
|---|---|
| `index.html` | NEU: statische Re-Implementierung des Exports (Templates aufgelöst, Datenarrays ausgerollt, Texte wörtlich) |
| `impressum.html`, `datenschutz.html` | Rechtstext **unverändert**, nur neuer Seitenrahmen (Header/Footer/Typografie des Exports) |
| `variante-b.html` | löschen; `nginx.conf`: `location = /b { return 301 /; }` |
| `assets/fonts/*` | selbst gehostete Fonts (liegen hier), `fonts.css` einbinden; `Dockerfile` um `COPY assets /usr/share/nginx/html/assets` ergänzen |
| `design/landingpage-2026/*` | bleibt im Repo als Referenz (wird nicht ausgeliefert) |

## Regeln (verbindlich)
- Texte **wörtlich** aus dem Export übernehmen – auch die Platzhalter-Markierungen (Video, Aktualitätsanker, Beispielrechnung). Nichts umformulieren, nichts ergänzen. Sie-Form.
- Nirgends: „unabhängig“, „Gebühr“, „86,40“, „Geld-zurück“, Gesellschafts-/Tarifnamen, Ortsnamen, Beraternamen, WhatsApp.
- **Keine externen Requests**: keine Google Fonts, kein unpkg, kein Tailwind-CDN, kein GTM/Tracking, keine Cookies.
- Buchungs-CTA (alle Buttons „Kennenlerngespräch vereinbaren“/„Termin auswählen“): `https://calendly.com/beitragswandel/erstgespraech` (aus der alten `index.html`), als eine Stelle/Konstante gepflegt. Den sichtbaren Text „[ Buchungs-Link: Platzhalter ]“ entfernen.
- FAQ als native `<details>/<summary>` (kein JS). „Zu den Zahlen ↓“ springt per Anker auf die Zahlen-Sektion.
- `<head>`: `lang="de"`, Title/Description aus dem Export, viewport, canonical `https://beitragswandel.de/`, OG-Basics, robots erlaubt.

## Definition of Done (vom Job selbst prüfen, Ergebnis in den PR-Text)
1. Sichtbarer Text `index.html` == sichtbarer Text des Exports nach Auflösung der Templates (Tags strippen, Whitespace normalisieren, diff). Abweichungen auflisten.
2. `grep -ril` über `index.html impressum.html datenschutz.html`: 0 Treffer für `unabhängig`, `Gebühr`, `86,40`, `Geld-zurück`, `googleapis`, `gstatic`, `unpkg`, `tailwindcss`, `googletagmanager`, `gtm`.
3. HTML parsebar (python3 `html.parser`), alle referenzierten Assets existieren im Repo, keine toten Anker.
4. `Dockerfile`-COPY-Pfade stimmen; `nginx.conf` plausibel (301 für `/b`, Cache-Header für woff2 bleiben).
5. Keine `variante-b.html` mehr, kein Tailwind-CDN, keine externen URLs außer Calendly-Link, schema.org und vermittlerregister.info.

## Bewusste Entscheidungen (nicht nachfragen)
- Variante B (A/B-Test) entfällt – eine Seite.
- Fonts self-hosted (DSGVO), Datei- und Klassennamen frei, CSS-Variablen des Exports übernehmen.
- Calendly bleibt vorerst Buchungsziel (Umschalten auf eigenes Buchungstool ist ein späterer Einzeiler).

## Offen für Kai (nicht Teil dieses Jobs)
- Impressum: Aufsichts-/Registerbehörde prüfen (IHK Hannover?), Datenschutz-Abschnitt „Google Fonts“ nach Self-Hosting streichen.
- Platzhalter befüllen: Video, Aktualitätsanker (Rechtsstand), Beispielrechnung aus dem Beratungstool.
- Buchungsziel Calendly vs. eigenes Tool (Attribution/gclid).
