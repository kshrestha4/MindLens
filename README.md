# 🧠 MindLens

**Privacy-first predictive mental health monitoring.**

MindLens helps users track mood, stress, sleep, and energy patterns over time using daily check-ins and journaling. A rule-based risk engine detects early warning signs, while a CBT companion provides personalized micro-interventions. Clinicians can optionally access patient data with full consent controls.

---

## Features

- **Daily Check-Ins** — Mood, stress, energy, sleep quality/hours + optional reflection
- **Risk Engine** — Predictive risk scoring (depression, stress, general) using linear regression over 7/14/21-day trends
- **Journal** — Private journaling with optional lexicon-based NLP analysis (sentiment, emotion, keywords)
- **CBT Companion** — Personalized micro-interventions: breathing, cognitive reframing, behavioral activation, sleep hygiene, mindfulness, gratitude
- **Clinician Portal** — Clinicians can view linked patients' trends with audit logging; patients control data sharing
- **Consent Controls** — Granular privacy toggles per feature (journaling analysis, voice upload, clinician sharing)
- **Voice Notes** — Upload audio recordings with optional acoustic feature extraction
- **Trend Visualizations** — Interactive Recharts graphs (mood, stress, energy, sleep over time)
- **Alerts** — Automated alerts when risk thresholds are crossed
- **Auth** — Email/password and Google OAuth (NextAuth v5)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 (next-auth@beta) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Password hashing | bcryptjs |
| Date utilities | date-fns |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1. Clone & Install

```bash
git clone https://github.com/your-org/MindLens.git
cd MindLens
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mindlens"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ENCRYPTION_KEY="your-32-char-encryption-key-here!"
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -hex 32
```

### 3. Set Up Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed with demo data
npx prisma db seed
```

Demo accounts after seeding:
- **User**: `demo@mindlens.app` / `Demo1234!`
- **Clinician**: `clinician@mindlens.app` / `Demo1234!`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB (no migration)
npm run db:migrate       # Create and run migration
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio
npm run risk:compute     # Run risk computation job
```

---

## Project Structure

```
src/
├── app/
│   ├── api/              # REST API routes
│   │   ├── auth/         # NextAuth + signup
│   │   ├── checkin/      # Daily check-in CRUD
│   │   ├── journal/      # Journal CRUD + NLP
│   │   ├── risk/         # Risk scores + computation
│   │   ├── companion/    # CBT suggestions
│   │   ├── consent/      # Privacy settings
│   │   ├── baseline/     # Baseline assessment
│   │   ├── voice/        # Voice note upload
│   │   ├── alerts/       # Alerts management
│   │   └── clinician/    # Clinician portal APIs
│   ├── auth/             # Sign in / sign up pages
│   ├── dashboard/        # User dashboard
│   ├── checkin/          # Daily check-in page
│   ├── journal/          # Journal listing + new entry
│   ├── companion/        # CBT companion
│   ├── voice/            # Voice notes
│   ├── settings/         # Privacy settings
│   ├── onboarding/       # Baseline assessment wizard
│   └── clinician/        # Clinician dashboard + patient detail
├── components/
│   ├── ui/               # Shared UI (AppNav, RiskBadge)
│   └── charts/           # Recharts wrappers (MoodTrendChart, WellbeingRadar)
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── risk-engine.ts    # Risk score computation
│   ├── nlp.ts            # Lexicon-based NLP analysis
│   ├── companion.ts      # CBT intervention library
│   └── encryption.ts     # AES-256-GCM field encryption
├── auth.ts               # NextAuth configuration
└── proxy.ts              # Route protection (Next.js proxy/middleware)

prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Demo data seeder

scripts/
└── compute-risk.ts       # Background risk computation job
```

---

## API Reference

### Authentication
- `POST /api/auth/signup` — Register new user `{ name, email, password }`
- `POST /api/auth/[...nextauth]` — NextAuth handlers (sign in/out, OAuth)

### Check-ins
- `GET /api/checkin` — Get recent check-ins
- `POST /api/checkin` — Create check-in `{ mood, stress, energy, sleepQuality, sleepHours?, reflection? }`

### Journal
- `GET /api/journal` — List entries
- `POST /api/journal` — Create entry `{ title?, content }` — auto-analyzes if consent enabled
- `GET /api/journal/[id]` — Get entry
- `DELETE /api/journal/[id]` — Delete entry

### Risk Scores
- `GET /api/risk` — Get risk scores
- `POST /api/risk/compute` — Trigger risk computation

### Companion
- `GET /api/companion` — Get suggestions
- `POST /api/companion` — Generate new personalized suggestions
- `POST /api/companion/[id]/complete` — Mark suggestion complete `{ isHelpful?: boolean }`

### Consent
- `GET /api/consent` — Get consent settings
- `PATCH /api/consent` — Update consent `{ journalingAnalysis?, voiceUpload?, voiceFeatureExtract?, clinicianSharing?, dataRetentionDays? }`

### Baseline
- `GET /api/baseline` — Get baseline
- `POST /api/baseline` — Save/update baseline

### Clinician (CLINICIAN role required)
- `POST /api/clinician/invite` — Send patient invite `{ email }`
- `POST /api/clinician/link/[token]` — Accept invite (patient action)
- `GET /api/clinician/patients` — List linked patients
- `GET /api/clinician/patients/[id]/risk` — Get patient risk scores

### Alerts
- `GET /api/alerts` — Get alerts
- `PATCH /api/alerts` — Mark alerts read `{ ids: string[], isRead: boolean }`

---

## Risk Engine

The risk engine computes three scores (0–100) from:

1. **Mood trend** — Linear regression slope over 14–21 days of check-ins
2. **Stress trend** — Stress check-in slope (inverted: rising stress = higher risk)
3. **Sleep quality/hours trend** — Sleep decline contributes to depression risk
4. **Energy trend** — Low energy correlated with depression risk
5. **Journal negativity** — Rolling average negativity score from NLP analysis
6. **PHQ-9/GAD-7 baseline** — Clinical screening scores from onboarding

Scores above 50 trigger a MEDIUM alert; above 70 trigger a HIGH/CRITICAL alert.

---

## Privacy & Security

- **Consent gates**: Every sensitive feature (journal analysis, voice, clinician sharing) requires explicit opt-in
- **Audit logging**: All clinician data access is logged to `AuditLog`
- **RBAC**: Users see only their own data; clinicians see only linked, consented patients
- **Field encryption**: Sensitive text fields can be encrypted with AES-256-GCM via `src/lib/encryption.ts`
- **Password hashing**: bcrypt with cost factor 12
- **Session**: JWT-based (no DB sessions needed for users)

---

## Deployment

### Vercel (recommended)

```bash
vercel deploy
```

Set all environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
```

### Environment Variables (Production)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Your deployment URL |
| `NEXTAUTH_SECRET` | Random 32-byte hex string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ENCRYPTION_KEY` | 32-character encryption key |

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

---

## Background Jobs

The risk computation can be run as a cron job:

```bash
# Compute risk for all active users
npm run risk:compute

# Example cron (daily at 2 AM)
0 2 * * * cd /app && npm run risk:compute >> /var/log/mindlens-risk.log 2>&1
```

---

## ⚠️ Disclaimer

MindLens is a wellness monitoring tool, not a medical device. It is not a substitute for professional mental health care. If you are experiencing a mental health crisis, please contact a qualified mental health professional or emergency services.

---

## License

MIT
