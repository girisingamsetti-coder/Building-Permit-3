# LTP Approval — Building Permit Management System

An enterprise-grade LTP (Licensed Technical Person) Login Approval Workflow Management System for building/project approval processing.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui component library
- **State**: Zustand for client state
- **Database**: Prisma ORM (SQLite)
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
npm install

# Start the development server (binds to 0.0.0.0:3000)
npm run dev
```

The dev server runs on `http://0.0.0.0:3000` and is accessible via the preview panel.

## Production Build

```bash
# Build the application for production
npm run build

# Start the production server (standalone mode, binds to 0.0.0.0:3000)
npm run start
```

## Preview

```bash
# Preview the production build
npm run preview
```

## Other Commands

```bash
# Lint
npm run lint

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
```

## Demo Access

The portal includes demo role-based access for testing:

- **LTP** — `ltp@demo.gov.in` / `demo1234`
- **TPS** — `tps@demo.gov.in` / `demo1234`
- **TPA** — `tpa@demo.gov.in` / `demo1234`
- **ZAD** — `zad@demo.gov.in` / `demo1234`
- **ZDD** — `zdd@demo.gov.in` / `demo1234`
- **ZJD** — `zjd@demo.gov.in` / `demo1234`
- **Director – DP** — `director@demo.gov.in` / `demo1234`
- **Addl. Commissioner** — `addlcomm@demo.gov.in` / `demo1234`
- **Commissioner** — `commissioner@demo.gov.in` / `demo1234`
- **Admin** — `admin@demo.gov.in` / `demo1234`

## Notes

- This is a demonstration portal — no real payments or SMS are processed.
- All data is mock/demo data stored in-memory via Zustand.
- The server binds to `0.0.0.0` to allow access through the Caddy gateway.
