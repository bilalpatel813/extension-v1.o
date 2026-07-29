/**
 * background.js — MV3 service worker.
 *
 * Owns the single "applications" array in chrome.storage.local and
 * relays "job detected on this tab" info to the popup.
 */

const API_BASE = "https://pursuit-dp8h.onrender.com/api";

// In-memory map of tabId -> last detected job (cleared on tab close/nav).
// Lives only as long as the service worker is alive; that's fine since the
// popup re-requests it fresh every time it opens.
const detectedByTab = {};

function uid() {
  return "job_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}


// Local storage (source of truth for the popup UI)


async function getApplications() {
  const { applications } = await chrome.storage.local.get("applications");
  return Array.isArray(applications) ? applications : [];
}

async function setApplications(applications) {
  await chrome.storage.local.set({ applications });
  updateBadge(applications);
}

function updateBadge(applications) {
  const count = applications.length;
  chrome.action.setBadgeText({ text: count ? String(count) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#f7600a" });
}

// Backend sync


async function getAccessToken() {
  const { access } = await chrome.storage.local.get("access");
  return access || null;
}

async function getRefreshToken() {
  const { refresh } = await chrome.storage.local.get("refresh");
  return refresh || null;
}

async function getAuthState() {
  const { access, email, fullName } = await chrome.storage.local.get(["access", "email", "fullName"]);
  return { loggedIn: !!access, email: email || null, fullName: fullName || null };
}

async function storeTokens({ access, refresh, email, fullName }) {
  const toStore = {};
  if (access !== undefined) toStore.access = access;
  if (refresh !== undefined) toStore.refresh = refresh;
  if (email !== undefined) toStore.email = email;
  if (fullName !== undefined) toStore.fullName = fullName;
  await chrome.storage.local.set(toStore);
}

async function clearTokens() {
  await chrome.storage.local.remove(["access", "refresh", "email", "fullName"]);
}

/**
 * Logs in against POST /api/login/, which expects {email, password} and
 * returns {user: {id, fullName, email}, access, refresh, message}. Stores
 * both tokens plus the user's name/email on success. Throws with a
 * readable message on failure so the popup can show it.
 */
async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // LoginSerializer raises a plain "Invalid Credential" validation error
    // (as a non_field_errors-style array) on bad credentials.
    const message =
      data.non_field_errors?.[0] || data.detail || data.message || `Login failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  await storeTokens({
    access: data.access,
    refresh: data.refresh,
    email: data.user?.email ?? email,
    fullName: data.user?.fullName ?? null,
  });
  return { email: data.user?.email ?? email, fullName: data.user?.fullName ?? null };
}

/**
 * Calls POST /api/logout/ to blacklist the refresh token server-side, then
 * clears local storage regardless of whether that call succeeds — the user
 * should end up logged out locally either way.
 */
async function logout() {
  const access = await getAccessToken();
  const refresh = await getRefreshToken();

  if (access && refresh) {
    try {
      await fetch(`${API_BASE}/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch (err) {
      console.error("Logout request failed, clearing local session anyway", err);
    }
  }

  await clearTokens();
}

/**
 * Uses the stored refresh token to get a new access token via SimpleJWT's
 * default /api/token/refresh/ endpoint. Returns the new access token, or
 * null if there's no refresh token or it's been rejected (in which case
 * stored tokens are cleared and the user needs to log in again).
 *
 * NOTE: this assumes rest_framework_simplejwt's TokenRefreshView is wired
 * up at this path alongside your custom /api/login/ and /api/logout/. If
 * it isn't, add it to urls.py or point this at whatever refresh route you
 * do have.
 */
async function refreshAccessToken() {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  const response = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    await clearTokens();
    return null;
  }

  const data = await response.json();
  await storeTokens({ access: data.access });
  return data.access;
}

/**
 * POSTs an entry to the backend. Throws on any failure (not logged in,
 * network error, non-2xx response) so callers can decide how to handle it.
 * Returns the parsed JSON body on success. On a 401 it transparently tries
 * one token refresh + retry before giving up.
 */
async function saveToBackend(entry, { isRetry = false } = {}) {
  const access = await getAccessToken();
  if (!access) {
    throw new Error("Not logged in — open the popup and sign in to sync applications");
  }

  // Don't send our locally-generated id: the backend model uses a UUID
  // primary key, and our "job_..." ids aren't valid UUIDs. Let Django
  // generate its own id; we map it back onto the local entry afterwards.
  const { id, synced, backendId, ...body } = entry;

  const response = await fetch(`${API_BASE}/applications/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401 && !isRetry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return saveToBackend(entry, { isRetry: true });
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}${text ? `: ${text}` : ""}`);
  }

  return await response.json();
}

/**
 * Attempts to sync a single local entry to the backend and updates its
 * synced/backendId fields in place in `applications`. Does not persist —
 * caller is responsible for calling setApplications afterwards.
 */
async function trySyncEntry(entry) {
  try {
    const saved = await saveToBackend(entry);
    entry.synced = true;
    entry.backendId = saved.id ?? entry.backendId ?? null;
  } catch (err) {
    entry.synced = false;
    console.error("Backend sync failed for", entry.id, err);
  }
  return entry;
}

// Applications CRUD


async function addApplication(payload) {
  const applications = await getApplications();

  // De-dupe by URL: if we've already logged this exact posting, just touch
  // the timestamp instead of creating a duplicate row.
  const existingIdx = applications.findIndex((a) => a.url && a.url === payload.url);
  if (existingIdx !== -1) {
    applications[existingIdx].lastSeenAt = Date.now();
    await setApplications(applications);
    return applications[existingIdx];
  }

  const entry = {
    id: uid(),
    title: payload.title || "Untitled role",
    company: payload.company || "Unknown company",
    location: payload.location || "",
    url: payload.url || "",
    source: payload.source || "manual",
    status: "applied",
    appliedAt: payload.appliedAt || Date.now(),
    notes: "",
    synced: false,
    backendId: null,
  };

  applications.unshift(entry);
  await setApplications(applications);

  await trySyncEntry(entry);
  // Persist again so the synced/backendId flags stick.
  await setApplications(applications);

  chrome.notifications?.create?.({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Application tracked",
    message: `${entry.title} · ${entry.company}`,
    priority: 0,
  });

  return entry;
}

async function retryUnsyncedApplications() {
  const applications = await getApplications();
  const unsynced = applications.filter((a) => !a.synced);
  if (unsynced.length === 0) return { retried: 0, stillFailing: 0 };

  await Promise.all(unsynced.map((entry) => trySyncEntry(entry)));
  await setApplications(applications);

  const stillFailing = applications.filter((a) => !a.synced).length;
  return { retried: unsynced.length, stillFailing };
}

//Lifecycle

chrome.runtime.onInstalled.addListener(async () => {
  const applications = await getApplications();
  await setApplications(applications); // sets initial badge
});


// Message routing

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  switch (message.type) {
    case "JOB_DETECTED": {
      if (tabId != null) detectedByTab[tabId] = message.payload;
      return; // no response needed
    }

    case "JOB_APPLIED": {
      addApplication(message.payload).then((entry) => sendResponse({ ok: true, entry }));
      return true; // async response
    }

    case "GET_TAB_JOB": {
      sendResponse(detectedByTab[message.tabId] || null);
      return;
    }

    case "GET_APPLICATIONS": {
      getApplications().then((applications) => sendResponse({ applications }));
      return true;
    }

    case "SAVE_MANUAL": {
      addApplication({ ...message.payload, source: message.payload.source || "manual" }).then(
        (entry) => sendResponse({ ok: true, entry })
      );
      return true;
    }

    case "UPDATE_STATUS": {
      getApplications().then(async (applications) => {
        const app = applications.find((a) => a.id === message.id);
        if (app) app.status = message.status;
        await setApplications(applications);
        sendResponse({ ok: !!app });
      });
      return true;
    }

    case "DELETE_APPLICATION": {
      getApplications().then(async (applications) => {
        const next = applications.filter((a) => a.id !== message.id);
        await setApplications(next);
        sendResponse({ ok: true });
      });
      return true;
    }

    case "RETRY_SYNC": {
      retryUnsyncedApplications().then((result) => sendResponse({ ok: true, ...result }));
      return true;
    }

    case "GET_AUTH_STATE": {
      getAuthState().then((state) => sendResponse(state));
      return true;
    }

    case "LOGIN": {
      login(message.email, message.password)
        .then(({ email, fullName }) => sendResponse({ ok: true, email, fullName }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    case "LOGOUT": {
      logout().then(() => sendResponse({ ok: true }));
      return true;
    }

    default:
      return; // unrecognized message type — ignore
  }
});

// Tab lifecycle — clear stale detections


chrome.tabs.onRemoved.addListener((tabId) => {
  delete detectedByTab[tabId];
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") delete detectedByTab[tabId];
});