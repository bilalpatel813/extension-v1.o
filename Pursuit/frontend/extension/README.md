# Pursuit — Job Application Tracker

A Chrome (Manifest V3) extension that automatically detects and logs job
applications you submit on **LinkedIn**, **Indeed**, and **Naukri**, plus a
popup and a full dashboard to review and manage them.

## Install (unpacked, for development)

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this folder.
4. Pin the extension so the popup icon is visible in the toolbar.

## How it works

- **Content scripts** (`content-scripts/linkedin.js`, `indeed.js`, `naukri.js`)
  run on job pages. They:
  1. Read the job title/company/location off the page and tell the popup
     "this is what's currently open" (`JOB_DETECTED`).
  2. Watch the page for confirmation text (e.g. "Application sent",
     "Applied successfully") using a `MutationObserver`, and when it appears,
     save the application automatically (`JOB_APPLIED`).
- **`background.js`** is the single source of truth. It stores everything in
  `chrome.storage.local` under the `applications` key, de-duplicates by job
  URL, updates the toolbar badge count, and fires a system notification when
  something new is tracked.
- **`popup.html`/`popup.js`** shows live stats, your 5 most recent
  applications, and a "Save this application" button for the page you're
  currently on (useful as a manual fallback if auto-detection misses a
  confirmation).
- **`dashboard.html`/`dashboard.js`** is the full management view — search,
  filter by status, change status (Applied → Interview → Offer/Rejected),
  and delete entries. Opened via the popup's "Open full dashboard" link.

## A note on selectors (please read)

LinkedIn, Indeed, and Naukri frequently change their page markup and A/B
test layouts. The CSS selectors in each content script are best-effort with
fallback chains, but they **will** need occasional updates. If detection
stops working on a site:

1. Open a job page on that site and open DevTools.
2. Inspect the job title and company name elements.
3. Update the relevant selector array at the top of that site's content
   script (`TITLE_SELECTORS`, `COMPANY_SELECTORS`, etc.) — no other logic
   needs to change.
4. Same idea for the confirmation-text patterns (the regex arrays passed to
   `watchForConfirmation`) if a site changes its "application submitted"
   wording.

The manual "Save this application" button in the popup is there specifically
so tracking still works even if auto-detection is temporarily out of date.

## Fonts

Extension pages run under a strict default CSP that blocks remote font/CSS
requests, so `fonts.css` ships with system-font fallbacks only (no calls to
Google Fonts). See the comments in `fonts.css` if you want to bundle the real
Cormorant Garamond / DM Mono `.woff2` files locally.

## Data & privacy

Everything is stored locally in the browser via `chrome.storage.local` —
nothing is sent to any external server. Uninstalling the extension (or
clearing its storage) deletes all tracked applications.

## File structure

```
job-tracker-extension/
├── manifest.json
├── background.js            # storage + messaging hub
├── popup.html / .css / .js  # toolbar popup
├── dashboard.html / .css / .js  # full management page
├── fonts.css
├── content-scripts/
│   ├── common.js             # shared helpers
│   ├── linkedin.js
│   ├── indeed.js
│   └── naukri.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
