# Backend Integration Guide — Django

This frontend is fully functional right now against a **mock API layer**
(`src/lib/api.ts`) that reads and writes `localStorage`. Every function in
that file is written against a specific Django endpoint, noted in its
comment. This document is the full contract: build the Django side to match
it, then swap the body of each function in `api.ts` for a real `fetch()`
call. No other file needs to change.

## Recommended Django stack

- **Django** + **Django REST Framework** for the API
- **djangorestframework-simplejwt** for JWT auth (access + refresh tokens)
- **django-cors-headers** — only needed if you ever call the API from a
  plain browser tab for testing; a same-origin Next.js deployment calling
  its own API route, or a reverse-proxied setup, won't need it
- **SQLite** for local development, swappable to **Postgres** in production
  via `DATABASE_URL` (e.g. `dj-database-url` + `psycopg2-binary`)

## Data models

### `User` (custom user model, email as the login field)

```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]
```

### `JobApplication`

```python
class JobApplication(models.Model):
    SOURCE_CHOICES = [
        ("linkedin", "LinkedIn"),
        ("indeed", "Indeed"),
        ("naukri", "Naukri"),
        ("manual", "Manual"),
    ]
    STATUS_CHOICES = [
        ("applied", "Applied"),
        ("interview", "Interview"),
        ("offer", "Offer"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="applications")
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="manual")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="applied")
    applied_at = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "url")
        ordering = ["-applied_at"]
```

The `unique_together` constraint is what the extension's own background
worker already relies on for de-duplication — the same posting URL should
never create two rows for one user.

## Endpoint contract

All endpoints below are prefixed with `/api/`. Every non-auth endpoint
requires `Authorization: Bearer <access_token>`.

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register/` | `{ full_name, email, password }` | `{ user: { id, full_name, email }, access, refresh }` |
| POST | `/api/auth/token/` | `{ email, password }` | `{ access, refresh }` |
| POST | `/api/auth/token/refresh/` | `{ refresh }` | `{ access }` |
| POST | `/api/auth/logout/` | `{ refresh }` | `204 No Content` (blacklists the refresh token) |
| GET | `/api/auth/me/` | — | `{ id, full_name, email }` |
| PATCH | `/api/profile/` | `{ full_name?, email? }` | `{ id, full_name, email }` |
| POST | `/api/auth/change-password/` | `{ current_password, new_password }` | `204 No Content` |

For `simplejwt`, wire up register/login with a custom view or
`TokenObtainPairView` subclass that also returns the user object, since the
frontend expects `user` alongside the tokens on register.

### Applications

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/applications/` | — | `[ { id, title, company, location, url, source, status, applied_at, notes }, ... ]` |
| POST | `/api/applications/` | same shape minus `id` | created object, `201` |
| PATCH | `/api/applications/:id/` | any subset of fields (frontend only ever sends `{ status }`) | updated object |
| DELETE | `/api/applications/:id/` | — | `204 No Content` |

Scope every queryset to `request.user` — a user should never be able to
read or modify another user's applications. A standard DRF
`ModelViewSet` with `permission_classes = [IsAuthenticated]` and
`get_queryset(self): return JobApplication.objects.filter(user=self.request.user)`
covers this.

## Auth flow the frontend expects

1. **Register or log in** → frontend stores `access` and `refresh` tokens
   (recommend `httpOnly` cookies set by Django rather than `localStorage`,
   for XSS resistance — the frontend's fetch calls should use
   `credentials: "include"` if you go that route).
2. **Every subsequent request** attaches the access token.
3. **On a 401**, the frontend should transparently call
   `/api/auth/token/refresh/` once and retry the original request before
   giving up and redirecting to `/login`.
4. **Logout** blacklists the refresh token server-side
   (`rest_framework_simplejwt.token_blacklist` app) so a stolen refresh
   token can't be reused after logout.

## Field name note

The frontend's TypeScript types use `camelCase` (`fullName`, `appliedAt`).
Django REST Framework serializes `snake_case` by default. Handle this
however you prefer — either:
- keep Django's DRF defaults and add a thin `camelCase` conversion in the
  frontend's `api.ts` when the real fetch calls replace the mocks, or
- use a package like `djangorestframework-camel-case` so the API responds
  in `camelCase` directly and no translation layer is needed.

The second option means fewer changes to `api.ts` when you wire it up.

## CORS / same-origin

If Django is deployed on a separate domain from the Next.js app (e.g.
`api.pursuit.app` vs `pursuit.app`), add `django-cors-headers` and set
`CORS_ALLOWED_ORIGINS` to the frontend's exact origin, plus
`CORS_ALLOW_CREDENTIALS = True` if you're using cookie-based auth.

## What the frontend already assumes, so the backend doesn't have to guess

- Applications are always scoped to the logged-in user.
- `status` is one of exactly four values: `applied`, `interview`, `offer`,
  `rejected` — the dashboard's `<select>` only ever sends one of these.
- `source` is one of `linkedin`, `indeed`, `naukri`, `manual`.
- `applied_at` is used for sorting (most recent first) and display
  formatting — send it as an ISO 8601 string.
