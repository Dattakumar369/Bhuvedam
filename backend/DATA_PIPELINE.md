# Bhuvedam — Live Agricultural Data Architecture

Static files in `constants/` are **fallback only**. Production data flows:

```
External APIs                    Neon PostgreSQL              Expo App
─────────────                    ───────────────              ────────
FAO FAOSTAT (global crops)  ──►  crops, agrochemicals  ──►  /api/crops
Agmarknet (India mandi)     ──►  mandi_prices,         ──►  /api/mandi/prices
                                 crop_varieties, seeds        /api/crops/:id/varieties
ISRIC SoilGrids (soil pH)   ──►  soils, soil_readings  ──►  /api/soils?lat=&lon=
Open-Meteo (weather)        ──►  weather               ──►  /api/weather/latest
```

## Setup

### 1. Push new schema tables

```powershell
cd backend
npm run db:push
```

### 2. Add API keys to `backend/.env`

```env
DATABASE_URL=postgresql://...
DATA_GOV_API_KEY=your-data-gov-in-key
PORT=3001
```

### 3. Sync live data (replaces static seed)

```powershell
npm run sync          # all sources
npm run sync:crops    # FAO global crops (~800)
npm run sync:mandi    # Agmarknet varieties + prices
npm run sync:soil     # SoilGrids pH/N/P globally
npm run sync:weather  # Open-Meteo
npm run sync:fertilizers  # FAO nutrient catalog
npm run sync:publications # ICAR → PJTSAU → ANGRAU → research → FAO → gov advisories
```

### Publication knowledge (issue identification)

Priority order in `ag_knowledge`:

1. ICAR publications & guidelines
2. PJTSAU (Telangana) bulletins
3. ANGRAU (Andhra Pradesh) bulletins
4. University research papers (OpenAlex)
5. FAO documents
6. Government advisories (MoA/DoA)

```powershell
npm run sync:publications
# Admin API: POST /api/knowledge/publications/sync
```

Extend curated bulletins in `backend/src/ingestion/data/`:

| File | Entries | Content |
|------|---------|---------|
| `icarPublications.ts` | 25 | ICAR POP, IPM, disease bulletins |
| `angrauPublications.ts` | 18 | AP regional advisories |
| `pjtsauPublications.ts` | 18 | Telangana regional advisories |
| `faoPublications.ts` | 14 | FAO global guides |

Plus ICAR guidelines + gov advisories → **~102 curated entries** in DB (+ university research papers).

To add from PDF/book: paste symptoms, doses, varieties into a new entry object, then `npm run sync:publications`.

### 4. Start API server

```powershell
npm run dev
# → http://localhost:3001
```

### 5. Point mobile app to backend

In root `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:3001
EXPO_PUBLIC_USE_BACKEND_DATA=true
```

Use your LAN IP (not `localhost`) when testing on a physical phone.

## Data sources

| Source | Data | Scope |
|--------|------|-------|
| **FAO FAOSTAT** | Crops, fertilizers/nutrients | Global |
| **Agmarknet** | Mandi prices, variety names | India |
| **SoilGrids** | pH, N, organic C, clay/sand/silt | Global |
| **Open-Meteo** | Weather forecasts | Global |
| **ICAR / PJTSAU / ANGRAU** | Package of practices, pest/disease bulletins | India — AP & TG |
| **FAO** | IPM, water, post-harvest, 4R nutrient guides | Global reference |
| **Gov advisories** | MoA schemes, kharif/rabi alerts, pesticide safety | India |

## Schedule sync (production)

Run `npm run sync` on a cron job (e.g. every 6 hours for mandi, daily for crops):

```bash
0 */6 * * * cd /path/to/backend && npm run sync:mandi
0 2 * * * cd /path/to/backend && npm run sync
```

Or call `POST http://localhost:3001/api/sync` from a scheduler.

## Adding more sources

1. Register in `data_sources` via `ensureDataSources()`
2. Create adapter in `backend/src/ingestion/sources/`
3. Add to `syncAll.ts`
4. Expose via `backend/src/server/index.ts`

Future sources: GBIF (seeds/biodiversity), USDA PLANTS, EPPO (pests), national ag extension APIs.
