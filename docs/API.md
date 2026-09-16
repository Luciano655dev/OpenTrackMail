# OpenTrackMail API

Base URL in production: `https://opentrackmail.vercel.app`

Authenticated routes require `Authorization: Bearer <supabase-access-token>`. JSON errors use `{ "error": { "code": string, "message": string } }`. Extension CORS is restricted with `ALLOWED_EXTENSION_ORIGINS`. Authenticated APIs allow 300 requests per user per minute; the token exchange allows 30 requests per keyed source per minute.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/tracked-emails` | Create a tracking record and return its pixel URL. `clientMessageId` makes retries idempotent. |
| `GET` | `/api/v1/tracked-emails` | List up to 100 records. Supports `search`, `status`, `limit`, and `offset`. |
| `GET` | `/api/v1/tracked-emails/:id` | Get one owned record and its non-duplicate activity. |
| `PATCH` | `/api/v1/tracked-emails/:id` | Associate Gmail message/thread metadata after send. |
| `DELETE` | `/api/v1/tracked-emails/:id` | Delete one owned record and its events. |
| `GET` | `/api/v1/recent` | Return the five most recent records for the extension popup. |
| `GET` | `/api/v1/status` | Batch status lookup by provider message or thread ID. |
| `GET`, `PATCH` | `/api/v1/settings` | Read or update default tracking and open notifications. |
| `DELETE` | `/api/v1/history` | Delete all tracking history for the authenticated user. |
| `DELETE` | `/api/v1/account` | Delete the authenticated Supabase user and cascading data. |
| `POST` | `/api/v1/extension/token` | Exchange a PKCE code or refresh token for a user-scoped session. |
| `GET` | `/t/:trackingId.gif` | Record an event asynchronously and immediately return a 1×1 transparent GIF. |
| `GET` | `/api/health` | Deployment health check. |

## Create request

```json
{
  "subject": "Partnership opportunity",
  "recipients": ["scott@example.com"],
  "provider": "gmail",
  "clientMessageId": "f72ed654-9599-4d05-bb3c-30571156c494"
}
```

The response includes an opaque, 192-bit `trackingId` and `pixelUrl`. Database UUIDs never appear in pixel URLs.

## Event behavior

The endpoint always returns the same transparent GIF, including for unknown identifiers, to avoid an enumeration oracle. A database function stores valid requests. Before registration, the API checks that the configured pixel origin serves a healthy response. The extension prevents Gmail's sender tab from loading the exact newly inserted pixel for 60 seconds. The backend retains but classifies a first request within 60 seconds of send as `early_automatic`; a later first request counts as an open. Requests with the same keyed source signature inside 10 seconds are retained as `rapid_duplicate` but do not increment the count. More than 120 requests to the same tracking ID in one minute are dropped. Raw IP addresses are never stored by application code.
