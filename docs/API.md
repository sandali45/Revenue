# Revenue API Summary

All Revenue endpoints require an Admin bearer token.

## Authentication

### POST `/api/v1/auth/login`

```json
{
  "email": "admin@itx.local",
  "password": "Admin@123"
}
```

## Overview

### GET `/api/v1/revenue/overview`

Returns commission, revenue, earnings and settlement totals.

## Commission

### GET `/api/v1/revenue/settings/commission`

### PUT `/api/v1/revenue/settings/commission`

```json
{
  "commissionRate": 12.5
}
```

## Earnings

### GET `/api/v1/revenue/earnings`

Optional query parameters:

- `status`
- `workerId`
- `search`

### POST `/api/v1/revenue/earnings/calculate-all`

Creates earning records for completed bookings that do not already have one.

### POST `/api/v1/revenue/bookings/:bookingId/calculate`

Calculates one completed booking.

## Settlements

### GET `/api/v1/revenue/settlements`

### POST `/api/v1/revenue/settlements`

```json
{
  "workerId": 3
}
```

### PATCH `/api/v1/revenue/settlements/:id/complete`

```json
{
  "referenceNo": "BANK-REF-10025"
}
```

## Reports

### GET `/api/v1/revenue/reports/monthly`

Returns six months of platform revenue, worker earnings and completed job totals.
