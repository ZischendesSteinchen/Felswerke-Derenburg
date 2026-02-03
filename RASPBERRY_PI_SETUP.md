# 🍓 Raspberry Pi Setup-Anleitung

Diese Anleitung zeigt, wie Sie die Fels Servicebetrieb App auf einem Raspberry Pi mit PostgreSQL installieren.

## Systemanforderungen

- Raspberry Pi 4 (empfohlen) oder Raspberry Pi 3B+
- Raspberry Pi OS (64-bit empfohlen)
- Mindestens 2GB RAM
- Mindestens 16GB SD-Karte
- Internetverbindung für die Installation

## 1. Raspberry Pi vorbereiten

### 1.1 System aktualisieren
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Node.js installieren (v20 LTS empfohlen)
```bash
# Node.js Repository hinzufügen
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js installieren
sudo apt install -y nodejs

# Version prüfen
node --version
npm --version
```

## 2. PostgreSQL installieren

### 2.1 PostgreSQL installieren
```bash
sudo apt install -y postgresql postgresql-contrib
```

### 2.2 PostgreSQL-Dienst starten
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.3 Datenbank und Benutzer erstellen
```bash
# Als postgres-Benutzer anmelden
sudo -u postgres psql

# Im PostgreSQL-Prompt:
CREATE USER fels_user WITH PASSWORD 'IhrSicheresPasswort';
CREATE DATABASE fels_servicebetrieb OWNER fels_user;
GRANT ALL PRIVILEGES ON DATABASE fels_servicebetrieb TO fels_user;
\q
```

### 2.4 Datenbankschema importieren
```bash
# Schema-Datei auf den Raspberry Pi kopieren (z.B. mit SCP)
# Dann importieren:
sudo -u postgres psql -d fels_servicebetrieb -f /pfad/zu/supabase/schema.sql
```

Alternative: Schema-Inhalt manuell einfügen:
```bash
sudo -u postgres psql -d fels_servicebetrieb
# Dann den Inhalt von supabase/schema.sql einfügen
```

### 2.5 PostgreSQL für Netzwerkzugriff konfigurieren (optional)

Falls das Frontend von einem anderen Gerät zugreift:

```bash
# postgresql.conf bearbeiten
sudo nano /etc/postgresql/15/main/postgresql.conf
# Zeile ändern zu: listen_addresses = '*'

# pg_hba.conf bearbeiten
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Zeile hinzufügen:
# host    all    all    192.168.0.0/16    md5

# PostgreSQL neu starten
sudo systemctl restart postgresql
```

## 3. Backend-Server einrichten

### 3.1 Projektdateien kopieren

Kopieren Sie den `server` Ordner auf den Raspberry Pi:
```bash
# Auf Ihrem Computer (Windows PowerShell):
scp -r server pi@raspberry-ip:/home/pi/fels-server

# Oder mit SFTP/FileZilla
```

### 3.2 Dependencies installieren
```bash
cd /home/pi/fels-server
npm install
```

### 3.3 Umgebungsvariablen konfigurieren
```bash
cp .env.example .env
nano .env
```

Konfigurieren Sie die `.env` Datei:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fels_servicebetrieb
DB_USER=fels_user
DB_PASSWORD=IhrSicheresPasswort
CORS_ORIGIN=http://raspberry-ip:5173
```

### 3.4 Server testen
```bash
npm start
```

Sie sollten sehen: `Server läuft auf Port 3001`

### 3.5 Server als Systemdienst einrichten

Erstellen Sie eine systemd Service-Datei:
```bash
sudo nano /etc/systemd/system/fels-server.service
```

Inhalt:
```ini
[Unit]
Description=Fels Servicebetrieb Backend Server
After=network.target postgresql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/fels-server
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Dienst aktivieren und starten:
```bash
sudo systemctl daemon-reload
sudo systemctl enable fels-server
sudo systemctl start fels-server

# Status prüfen
sudo systemctl status fels-server
```

## 4. Frontend einrichten

### Option A: Frontend auf dem Raspberry Pi hosten

```bash
# Frontend-Ordner kopieren
scp -r fels-servicebetrieb-main pi@raspberry-ip:/home/pi/fels-frontend

cd /home/pi/fels-frontend

# Dependencies installieren
npm install

# .env konfigurieren
cp .env.example .env
nano .env
```

Inhalt der `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

Für Produktion bauen und mit nginx hosten:
```bash
npm run build

# nginx installieren
sudo apt install nginx -y

# Build-Dateien kopieren
sudo cp -r dist/* /var/www/html/
```

### Option B: Frontend auf anderem Gerät (Windows-PC)

Konfigurieren Sie die `.env` im Frontend:
```env
VITE_API_URL=http://raspberry-ip:3001/api
```

Dann:
```bash
npm run dev
# oder für Produktion:
npm run build
```

## 5. Nginx als Reverse Proxy (optional, empfohlen für Produktion)

```bash
sudo nano /etc/nginx/sites-available/fels
```

Inhalt:
```nginx
server {
    listen 80;
    server_name _;

    # Frontend (SPA)
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktivieren:
```bash
sudo ln -s /etc/nginx/sites-available/fels /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Firewall konfigurieren (optional)

```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (falls verwendet)
sudo ufw allow 3001/tcp  # Backend API (falls direkter Zugriff nötig)
sudo ufw enable
```

## 7. Admin-Benutzer erstellen

Nach der Installation müssen Sie den ersten Admin-Benutzer erstellen:

```bash
sudo -u postgres psql -d fels_servicebetrieb

INSERT INTO users (username, password, full_name, role)
VALUES ('admin', 'admin123', 'Administrator', 'Administrator');

\q
```

⚠️ **Wichtig**: Ändern Sie das Passwort nach dem ersten Login!

## Fehlerbehebung

### PostgreSQL-Verbindungsfehler
```bash
# PostgreSQL-Status prüfen
sudo systemctl status postgresql

# Logs anzeigen
sudo journalctl -u postgresql -f
```

### Backend-Server-Fehler
```bash
# Server-Logs anzeigen
sudo journalctl -u fels-server -f

# Manuell testen
cd /home/pi/fels-server
node index.js
```

### CORS-Fehler
Stellen Sie sicher, dass `CORS_ORIGIN` in der Server `.env` korrekt ist:
- Für Entwicklung: `http://localhost:5173`
- Für Produktion: `http://raspberry-ip` oder Ihre Domain

### Datenbank zurücksetzen
```bash
sudo -u postgres psql
DROP DATABASE fels_servicebetrieb;
CREATE DATABASE fels_servicebetrieb OWNER fels_user;
\q

# Schema neu importieren
sudo -u postgres psql -d fels_servicebetrieb -f /pfad/zu/schema.sql
```

## Nützliche Befehle

```bash
# Backend-Server neu starten
sudo systemctl restart fels-server

# PostgreSQL neu starten
sudo systemctl restart postgresql

# Logs live anzeigen
sudo journalctl -u fels-server -f

# Raspberry Pi IP-Adresse herausfinden
hostname -I

# Datenbank-Backup erstellen
pg_dump -U fels_user fels_servicebetrieb > backup.sql
```

---

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im GitHub-Repository.
