# AI Recipe Keeper

## Das Problem

Rezeptsuche mit klassischen Schlagwortfiltern ist oft zu starr: Wer nach "etwas Leichtes mit Gemüse unter 30 Minuten" sucht, bekommt mit SQL allein keine sinnvollen Ergebnisse. Gleichzeitig liefern reine Embedding-Suchen keine zuverlässigen Filterergebnisse für harte Constraints wie Kalorien oder Zubereitungszeit.

Ziel dieses Projekts ist ein hybrider RAG-Ansatz, der beide Welten kombiniert.

Die Datenbasis bietet dabei meine eigene Sammlung an Rezepten aus der App "Recipe Keeper".

## Architektur

```
User Query
    │
    ├─► SQL Filter (harte Constraints)
    │     └─ Kalorien, Proteingehalt, Küche, Zubereitungszeit
    │
    ├─► pgvector Semantic Search (weiche Ähnlichkeit)
    │     └─ Eingebettete Felder: Titel, Zutaten, Zubereitungsschritte
    │
    └─► LLM Reasoning Layer
          └─ Strukturierter Output (JSON) auf Basis gefilterter + semantisch passender Rezepte
```

## Integration: Einkaufsliste & Vorrat

Neben der Rezeptsuche ist ein zweites zentrales Feature die Verknüpfung von Rezepten mit dem persönlichen Vorrat und der Einkaufsliste:

- **Vorrat (Pantry)**: Der Nutzer pflegt, welche Zutaten er zuhause hat. Die Rezeptsuche kann darauf filtern und bevorzugt Rezepte vorschlagen, die größtenteils mit vorhandenen Zutaten auskommen.
- **Einkaufsliste**: Fehlende Zutaten eines ausgewählten Rezepts werden automatisch auf die Einkaufsliste gesetzt — als Diff zwischen Rezeptzutaten und aktuellem Vorrat.
- **LLM-gestützte Auflösung**: Das Modell gleicht unscharfe Bezeichnungen ab (z.B. "Zwiebel" vs. "rote Zwiebel") und fasst Mengenangaben zusammen.

```
Rezept ausgewählt
    │
    ├─► Rezeptzutaten vs. Vorrat abgleichen (SQL)
    │
    ├─► Fehlende Zutaten → Einkaufsliste
    │
    └─► LLM: Mengen konsolidieren, Synonyme auflösen
```

## Design-Entscheidungen

- **Hybrid statt rein vektoriell**: Embeddings allein sind unzuverlässig für numerische oder kategoriale Filter. SQL übernimmt harte Constraints, pgvector die semantische Ähnlichkeit.
- **Server Components first**: Datenfetching findet wo möglich auf dem Server statt — kein unnötiges Client-State-Management.
- **Strukturierter LLM-Output**: Das Modell gibt JSON zurück, das direkt weiterverarbeitet werden kann, statt Freitext zu parsen.

## Setup

### Voraussetzungen

- Node.js 18+
- Supabase-Projekt mit aktivierter `pgvector`-Extension

### Umgebungsvariablen

Kopiere `.env.example` nach `.env.local` und fülle die Werte aus:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
```

### Installation & Start

```bash
npm install
npm run dev
```

Die App läuft unter [http://localhost:3000](http://localhost:3000).
