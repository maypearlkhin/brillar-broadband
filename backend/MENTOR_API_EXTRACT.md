# Mentor API Extract (Additive Endpoints)

These APIs were added as **new extract endpoints** to avoid changing existing application flow/routes.

Base URL (local):

- `http://localhost:4000/api`

## Public (no middleware)

### 1) Get all announcements (impacts)

- `GET /extract/announcements-impacts`
- Latest first
- Returns active impacts only (`resolvedAt = null`)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "country": "Singapore",
      "district": "Jurong East",
      "postalCode": "609606",
      "message": "....",
      "createdAt": "....",
      "resolvedAt": null
    }
  ]
}
```

### 2) Get all resolved histories

- `GET /extract/resolved-histories`
- Latest resolved first

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "country": "Singapore",
      "district": "Tampines",
      "postalCode": "529653",
      "message": "....",
      "createdAt": "....",
      "resolvedAt": "...."
    }
  ]
}
```

### 3) Get notices

- `GET /extract/notices`
- Latest first

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "message": "....",
      "createdAt": "...."
    }
  ]
}
```

### 4) Get all plans

- `GET /extract/all-plans`
- Sorted by category and plan order

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "plan_004",
      "name": "100Mbps Essential",
      "monthlyPrice": 32,
      "downloadSpeedMbps": 100,
      "price90Days": 111,
      "price180Days": 120,
      "price365Days": 260,
      "features": ["Unlimited data"],
      "categoryId": "res_everyday",
      "categoryTitle": "Residential · Everyday fibre",
      "categorySortOrder": 0,
      "planSortOrder": 0,
      "isActive": true
    }
  ]
}
```

## Middleware (token required)

Token can be provided via:

- `Authorization: Bearer <jwt>`
- or `brillar_token` cookie

### 5) Get current plan / getmyplan

- `POST /extract/getmyplan`
- Body: `{ "userId": "<token_user_id>" }`

Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "userId": "...",
    "status": "Installation Pending",
    "billingTerm": "90",
    "amount": 111,
    "startDate": "....",
    "endDate": "....",
    "createdAt": "....",
    "plan": {
      "id": "plan_004",
      "name": "100Mbps Essential"
    }
  }
}
```

### 6) My order history

- `GET /extract/my-order-history`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "userId": "...",
      "status": "Installation Pending",
      "billingTerm": "30",
      "amount": 32,
      "startDate": "....",
      "endDate": "....",
      "createdAt": "....",
      "plan": {
        "id": "plan_004",
        "name": "100Mbps Essential"
      }
    }
  ]
}
```

## Code locations

- Route registration: `backend/src/api/router/extractApiRoutes.js`
- Controller logic: `backend/src/api/controller/extractApiController.js`
- API router mount: `backend/src/api/router/index.js`

