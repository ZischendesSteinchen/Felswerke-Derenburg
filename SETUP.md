# Fels-Servicebetrieb

Eine Terminplanungs- und Verwaltungsanwendung für den Servicebetrieb.

## 🚀 Features

- Kalenderansicht (Tag, Woche, Monat, Jahr)
- Mitarbeiterverwaltung
- Fahrzeugverwaltung
- Auftragsverwaltung
- Kundenverwaltung
- Abwesenheitsverwaltung
- Notfallmanagement

## 🔧 Installation

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Supabase einrichten

1. Erstellen Sie ein kostenloses Projekt auf [Supabase](https://supabase.com)
2. Kopieren Sie die Datei `.env.example` nach `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fügen Sie Ihre Supabase-Credentials in die `.env` Datei ein:
   - `VITE_SUPABASE_URL`: Ihre Supabase Projekt-URL
   - `VITE_SUPABASE_ANON_KEY`: Ihr Supabase Anon Key

### 3. Datenbank-Schema erstellen

Führen Sie das SQL-Schema in Ihrer Supabase-Datenbank aus:
- Öffnen Sie den SQL-Editor in Ihrem Supabase Dashboard
- Führen Sie den Inhalt von `supabase/schema.sql` aus

### 4. Entwicklungsserver starten

```bash
npm run dev
```

## 📦 Technologie-Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: PostgreSQL via Supabase
- **Authentifizierung**: Custom Auth (einfache Benutzeranmeldung)
- **UI-Komponenten**: Radix UI, Shadcn/UI
- **Animationen**: Framer Motion

## 📁 Projektstruktur

```
src/
├── components/     # React-Komponenten
│   └── ui/        # UI-Bibliothek (shadcn/ui)
├── hooks/         # Custom React Hooks
├── lib/           # Hilfsfunktionen und Typen
│   ├── database.ts       # Datenbank-Service Layer
│   ├── database.types.ts # TypeScript-Typen für Supabase
│   ├── supabase.ts       # Supabase-Client
│   └── types.ts          # App-Typen
└── styles/        # CSS-Styles

supabase/
└── schema.sql     # PostgreSQL Datenbank-Schema
```

## 🔐 Standard-Login

Nach der Installation ist ein Admin-Benutzer verfügbar:
- **Benutzername**: admin
- **Passwort**: admin

⚠️ Ändern Sie das Passwort in der Produktion!

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.
