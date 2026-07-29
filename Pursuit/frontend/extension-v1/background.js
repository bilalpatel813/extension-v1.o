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

/**
 * POSTs an entry to the backend. Throws on any failure (missing token,
 * network error, non-2xx response) so callers can decide how to handle it.
 * Returns the parsed JSON body on success.
 */
async function saveToBackend(entry) {
  const access = await getAccessToken();
  if (!access) {
    throw new Error("No access token in storage — user is not logged in");
  }

  // Don't send our locally-generated id: the backend model uses a UUID
  // primary key, and our "job_..." ids aren't valid UUIDs. Let Django
  // generate its own id; we map it back onto the local entry afterwards.
  const { id, ...body } = entry;

  const response = await fetch(`${API_BASE}/applications/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
    body: JSON.stringify(body),
  });

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