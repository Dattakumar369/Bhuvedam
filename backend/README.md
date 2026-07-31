# Bhuvedam API — Neon PostgreSQL

Server-side database layer for Bhuvedam. Uses [Neon](https://neon.tech) (serverless PostgreSQL) with Drizzle ORM.

## Tables & relationships

```
farmers
  ├── lands
  │     └── survey_numbers
  ├── crop_calendar → crops, crop_varieties, lands
  ├── weather
  ├── ai_predictions → crops, crop_varieties, lands
  ├── orders
  │     ├── order_items
  │     └── payments
  └── notifications

crops
  ├── crop_varieties (100s per crop)
  ├── fertilizers
  ├── diseases → disease_sprays
  └── mandi_prices (variety-wise, Agmarknet cache)
```

| Table | Purpose |
|-------|---------|
| `farmers` | App users (phone auth, profile, farm size) |
| `lands` | Parcels owned by a farmer |
| `survey_numbers` | Revenue survey no. per land |
| `crops` | Reference crop catalog |
| `crop_varieties` | Hundreds of varieties per crop |
| `crop_calendar` | Sowing/harvest schedule per farmer |
| `weather` | Cached weather snapshots |
| `mandi_prices` | Daily variety-wise mandi rates |
| `fertilizers` | Stage-wise fertilizer guide |
| `diseases` | Crop diseases / pests |
| `disease_sprays` | Spray products per disease |
| `ai_predictions` | Price forecasts, yield, disease risk |
| `orders` / `order_items` | Fertilizer/seed/spray orders |
| `payments` | UPI/card/COD payments |
| `notifications` | Mandi alerts, spray reminders, etc. |

## Setup

### 1. Create Neon project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a project (e.g. `bhuvedam`)
3. Copy the **pooled** connection string

### 2. Configure environment

```bash
cd backend
copy .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and paste your Neon **pooled** connection string:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

If `npm run db:push` says `DATABASE_URL is missing`, the `.env` file was not created or the URL is empty.

> **Never** put `DATABASE_URL` in the Expo app `.env`. It stays server-side only.

### 3. Install & migrate

```bash
cd backend
npm install
npm run db:push
# or apply SQL directly:
# psql "$DATABASE_URL" -f drizzle/0000_initial.sql
```

### 4. Seed reference data (optional)

```bash
npm run db:seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:push` | Push schema to Neon (dev) |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed crops & curated varieties |

## Connect from NestJS API

```typescript
import { db } from './db';
import { farmers, mandiPrices } from './db/schema';
import { eq } from 'drizzle-orm';

const farmer = await db.query.farmers.findFirst({
  where: eq(farmers.phone, '+919876543210'),
  with: { lands: { with: { surveyNumbers: true } } },
});
```

Point the Expo app at your API via `EXPO_PUBLIC_API_URL` in the root `.env`.
