# ITX Revenue Project

A standalone full-stack Revenue Management project for the Developer 4 allocation.

## Included functions

- Admin login
- Revenue dashboard overview
- Configurable commission percentage
- Commission calculation for completed bookings
- Worker earnings records
- Pending and completed settlements
- Monthly revenue report
- Search and filtering
- PostgreSQL sample database
- React web interface

## Technology

- Frontend: React, JavaScript, JSX, CSS, Vite
- Backend: Node.js, Express, JavaScript
- Database: PostgreSQL and SQL
- API: REST and JSON

## Folder structure

```text
ITX_Revenue_Project/
├── backend/
├── frontend/
├── database/
├── docs/
└── docker-compose.yml
```

## 1. Start PostgreSQL

From the main project folder:

```powershell
docker compose up -d
```

The Revenue database uses port `5433` so it will not conflict with the earlier Admin project on port `5432`.

## 2. Create tables and sample data

```powershell
Get-Content .\database\schema.sql | docker exec -i itx-revenue-postgres psql -U postgres -d itx_revenue
```

```powershell
Get-Content .\database\seed.sql | docker exec -i itx-revenue-postgres psql -U postgres -d itx_revenue
```

## 3. Start backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Backend URL:

```text
http://localhost:3001
```

Health check:

```text
http://localhost:3001/health
```

## 4. Start frontend

Open a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5174
```

## Demo login

```text
Email: admin@itx.local
Password: Admin@123
```

## Main API endpoints

```text
POST   /api/v1/auth/login

GET    /api/v1/revenue/overview
GET    /api/v1/revenue/workers
GET    /api/v1/revenue/earnings
POST   /api/v1/revenue/earnings/calculate-all
POST   /api/v1/revenue/bookings/:bookingId/calculate

GET    /api/v1/revenue/settlements
POST   /api/v1/revenue/settlements
PATCH  /api/v1/revenue/settlements/:id/complete

GET    /api/v1/revenue/settings/commission
PUT    /api/v1/revenue/settings/commission

GET    /api/v1/revenue/reports/monthly
```

## Important team integration notes

This project is standalone for learning and demonstration. When integrating with the group project:

1. Replace the demo Admin login with Developer 1's authentication middleware.
2. Use Developer 2's real worker table and IDs.
3. Use Developer 3's real bookings and completed status.
4. Trigger earning calculation when a booking becomes completed.
5. Confirm all shared column names before copying SQL queries.
6. Keep existing earnings unchanged when the commission rate changes; the new rate should apply to future completed bookings.
