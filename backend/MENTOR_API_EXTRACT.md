# Agent / extract API overview

Additive **`/api/agent/*`** routes share handlers with storefront routes where noted. Canonical registration: `backend/src/api/router/extractApiRoutes.js`.

**OpenAPI specs (repo root):**  
`Brillar_Agent_Plans_API_Spec.json`, `Brillar_Agent_Personal_API_Spec.json`, `Brillar_Agent_Billing_API_Spec.json`, `Brillar_Agent_Scheduling_API_Spec.json`, `Brillar_Agent_Announcements_Notices_API_Spec.json`.

Base URL (local): `http://localhost:4000/api`

## Public

| Agent path | App equivalent | Notes |
|------------|----------------|-------|
| `GET /agent/all-plans` | — | `{ success, data: Plan[] }` |
| `GET /agent/appointment-slots` | `GET /appointments/slots` | Next 7 days |
| `GET /agent/announcements-impacts` | — | Nested active + resolved |
| `GET /agent/resolved-histories` | — | Flat list of resolved incidents only |
| `GET /agent/notices` | — | |

## Bearer JWT (customer unless noted)

| Agent path | App equivalent | Envelope / notes |
|------------|----------------|------------------|
| `GET /agent/get-my-plan` | — | `{ success, data }` narrow extract |
| `GET /agent/my-order-history` | — | `{ success, data[] }` narrow extract |
| `GET /agent/my-account-billing` | `GET /me/subscription` | `{ success, data }` + `billingSummary` |
| `GET /agent/billing-history` | — | `{ success, data: { invoices, subscriptions } }` |
| `POST /agent/buy-plan` | `POST /checkout` | Flat JSON; **card fields required for agents** (not stored server-side) |
| `POST /agent/cancel-plan` | `POST /cancel-plan` | Flat JSON |
| `POST /agent/schedule-appointment` | `POST /appointments` | `type`: `installation` \| `home_service`; installation needs `subscriptionId` from `buy-plan` → `subscription.id` |
| `GET /agent/my-appointments` | `GET /appointments` | Customers: own only; admin / isp_team: all |

## Code locations

- `backend/src/api/router/extractApiRoutes.js` — agent route table  
- `backend/src/api/controller/extractApiController.js` — catalogue, narrow views, billing wrappers  
- `backend/src/api/controller/subscriptionController.js` — `checkout`, `cancelPlan`, `getMySubscription`, `getMySubscriptionPayload`  
- `backend/src/api/controller/appointmentController.js` — slots, create, list, status updates  
