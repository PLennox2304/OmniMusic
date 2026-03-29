# 🔄 OmniMusic Update-Guide (GitHub, Vercel & Supabase)

Da wir OmniMusic nun als professionelle Cloud-Plattform betreiben, musst du nie wieder manuell Dateien auf Webseiten hochladen. Alles läuft vollautomatisch über dein Terminal.

---

### 1. Das Projekt weltweit aktualisieren (Vercel & GitHub)
Wann immer ich Code ändere oder du etwas anpasst, musst du nur diese **3 Befehle** in dein lokales Terminal (im Ordner `OmniMusic`) eingeben. Vercel bemerkt das sofort und aktualisiert die Webseite für alle Nutzer innerhalb von 30 Sekunden.

1. **Dateien vorbereiten**:
   `git add .`
2. **Änderungen beschreiben**:
   `git commit -m "Massives Update: Mobile Design & Artist Profiles"`
3. **Hochladen & Veröffentlichen**:
   `git push origin master` (oder `main`)

**Das war's!** Sobald der letzte Befehl durchgelaufen ist, kannst du deine Vercel-URL im Browser aktualisieren und siehst das Update live.

---

### 2. Die Datenbank aktualisieren (Supabase)
Die Datenbank (Supabase) musst du meistens **gar nicht** manuell aktualisieren, da die App direkt mit ihr spricht. 

**Ausnahme**: Wenn wir neue Datentypen (z.B. "Favoriten" oder "User-Profile") hinzufügen, gebe ich dir einen **SQL-Code**.
1. Gehe in dein [Supabase Dashboard](https://supabase.com).
2. Klicke links auf den **SQL Editor** (`>_`).
3. Füge den Code ein und klicke auf **Run**.

---

### 3. Neue Features lokal testen
Bevor du veröffentlichst, solltest du immer kurz lokal schauen, ob alles passt:
- Befehl: `npm run dev`
- Link: `http://localhost:5173`

---

> [!TIP]
> **Pro-Tipp**: Wenn du die Seite auf deinem Handy testen willst, während `npm run dev` am PC läuft, kannst du oft einfach die IP-Adresse deines PCs (z.B. `192.168.178.20:5173`) im Handy-Browser eingeben, sofern beide im selben WLAN sind!
