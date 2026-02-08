# RedStory - Affiliate Content Portal

Ein **Affiliate-Business-Portal** für erotische Geschichten mit integrierten Camgirl-Empfehlungen. Du erstellst im Admin-Backend Content-Seiten mit KI-generierten Geschichten und Affiliate-Links, User konsumieren die Inhalte und klicken auf die Camgirl-Links.

## 💰 Business-Modell

- **Admin erstellt Content**: Du generierst Geschichten mit Grok AI im Backend
- **SEO-optimierte Seiten**: Jede Geschichte = eigene URL für Google-Traffic
- **Affiliate-Links**: Camgirl-Links mit deinen Affiliate-IDs eingebettet
- **Passive Income**: User klicken auf Links → du verdienst Provisionen

## ✨ Features

### Admin-Backend (`/admin`)
- 🎨 **Story-Generator** mit Grok-4-1-Fast-Reasoning
- 📝 **Content-Management** für Geschichten
- 👥 **Camgirl-Verwaltung** mit Affiliate-Links
- 🔒 **Nur für dich** zugänglich

### Public Frontend
- 📖 **Story-Übersicht** mit allen veröffentlichten Geschichten
- 🔗 **SEO-optimierte URLs** (`/story/slug`)
- � **Affiliate-Links** in Geschichten eingebettet
- 📊 **View-Tracking** für Performance-Analyse
- 📱 **Responsive Design** für alle Geräte
- 🌙 **Dark Mode** Support

## 🛠 Technologie-Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, TailwindCSS
- **Icons**: Lucide React
- **AI**: Groq SDK (Grok-4-1-Fast-Reasoning)
- **TypeScript**: Vollständige Type-Safety
- **Database**: In-Memory (später: PostgreSQL/MongoDB)

## 🚀 Installation & Setup

1. **Abhängigkeiten installieren**:
```bash
npm install
```

2. **Groq API Key ist bereits konfiguriert** in `.env.local`

3. **Development Server starten**:
```bash
npm run dev
```

4. **URLs**:
   - Public Frontend: `http://localhost:3000`
   - Admin Backend: `http://localhost:3000/admin`

## 📖 Workflow

### Content erstellen (Admin)

1. Gehe zu `http://localhost:3000/admin`
2. Klicke auf "Neue Geschichte"
3. Wähle Thema, Stil und Länge
4. Klicke "Geschichte generieren" (Grok AI erstellt den Content)
5. Bearbeite Titel, Slug, SEO-Daten
6. Speichere und veröffentliche

### User-Experience (Public)

1. User besucht `http://localhost:3000`
2. Sieht Übersicht aller veröffentlichten Geschichten
3. Klickt auf eine Geschichte → `/story/slug`
4. Liest die Geschichte
5. Sieht Camgirl-Empfehlungen mitten in der Story
6. Klickt auf Affiliate-Link → du verdienst Provision

## 📁 Projektstruktur

```
redstory/
├── app/
│   ├── admin/                    # Admin-Backend
│   │   ├── page.tsx             # Dashboard
│   │   └── stories/new/         # Story erstellen
│   ├── story/[slug]/            # Einzelne Story-Seite (SEO-optimiert)
│   ├── api/
│   │   ├── generate-story/      # Grok AI Story-Generierung
│   │   └── admin/stories/       # Story CRUD API
│   ├── page.tsx                 # Public Homepage (Story-Übersicht)
│   └── layout.tsx               # Root Layout
├── components/
│   └── CamgirlCard.tsx          # Affiliate-Link Card
├── lib/
│   ├── db.ts                    # In-Memory Database
│   └── utils.ts                 # Utilities
└── .env.local                   # Groq API Key
```

## 🎯 Nächste Schritte

### Sofort möglich:
1. ✅ Geschichten im Admin erstellen
2. ✅ Stories auf der Homepage anzeigen
3. ✅ Einzelne Story-Seiten mit SEO-URLs

### Noch zu implementieren:
- [ ] **Echte Datenbank** (PostgreSQL/MongoDB statt In-Memory)
- [ ] **Camgirl-Verwaltung** im Admin-Backend
- [ ] **Affiliate-Link-Tracking** (Klicks zählen)
- [ ] **Admin-Login** (Passwortschutz für `/admin`)
- [ ] **Bild-Upload** für Camgirls
- [ ] **Analytics Dashboard** (Views, Klicks, Conversions)

## 💡 Affiliate-Integration

### Camgirl-Plattformen mit Affiliate-Programmen:
- **Chaturbate** - bis zu 20% Revenue Share
- **Stripchat** - bis zu 25% Revenue Share
- **LiveJasmin** - bis zu 35% Revenue Share
- **BongaCams** - bis zu 25% Revenue Share

### So fügst du Affiliate-Links hinzu:

1. Registriere dich bei Camgirl-Plattformen als Affiliate
2. Erhalte deine Affiliate-IDs
3. Erstelle Camgirl-Profile im Admin (noch zu implementieren)
4. Weise Camgirls zu Geschichten zu
5. Links werden automatisch mit `rel="nofollow"` versehen

## 🔒 Sicherheit

- **Admin-Bereich**: Aktuell NICHT geschützt - implementiere Login!
- **Affiliate-Links**: Verwenden `rel="nofollow"` für SEO
- **API-Keys**: Nie im Frontend exposen (nur Server-Side)

## 📊 SEO-Optimierung

Jede Geschichte hat:
- **Eigene URL**: `/story/slug-name`
- **Meta-Title**: Individuell anpassbar
- **Meta-Description**: Für Google-Snippets
- **View-Tracking**: Beliebte Stories identifizieren

## ⚠️ Wichtige Hinweise

- **18+ Content**: Nur für Erwachsene
- **Rechtliches**: Prüfe lokale Gesetze für Adult-Content
- **Affiliate-Regeln**: Halte dich an die Terms der Plattformen
- **Datenbank**: In-Memory = Daten gehen bei Neustart verloren!
# redstory
