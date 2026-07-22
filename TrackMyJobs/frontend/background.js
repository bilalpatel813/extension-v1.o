/**
 * background.js — MV3 service worker.
 * Owns the single "applications" array in chrome.storage.local and
 * relays "job detected on this tab" info to the popup.
 */

// In-memory map of tabId -> last detected job (cleared on tab close/nav).
// Lives only as long as the service worker is alive; that's fine since the
// popup re-requests it fresh every time it opens.
const detectedByTab = {};

function uid() {
  return "job_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

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

async function addApplication(payload) {
  const applications = await getApplications();

  // De-dupe by URL: if we've already logged this exact posting, just touch
  // the timestamp instead of creating a duplicate row.
  const existingIdx = applications.findIndex((a) => a.url === payload.url);
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
  };

  applications.unshift(entry);
  await setApplications(applications);
  
  async function saveToBackend(){
    const response = await 
    fetch(
    "http://127.0.0.1:8000/api/applications/",
    {
      method:"POST",
      headers:{
        "Content_Type":"application/json",
        //"Authorization":`Bearer ${token}`
      },
      body:JSON.stringify(entry)
    });
    return await response.json();
  }
  try{
    await saveToBackend(entry);
  }catch(err){
    console.error("Backend error : "err);
  }

  chrome.notifications?.create?.({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Application tracked",
    message: `${entry.title} · ${entry.company}`,
    priority: 0,
  });

  return entry;
}

chrome.runtime.onInstalled.addListener(async () => {
  const applications = await getApplications();
  await setApplications(applications); // sets initial badge
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (message.type === "JOB_DETECTED") {
    if (tabId != null) detectedByTab[tabId] = message.payload;
    return; // no response needed
  }

  if (message.type === "JOB_APPLIED") {
    addApplication(message.payload).then((entry) => sendResponse({ ok: true, entry }));
    return true; // async response
  }

  if (message.type === "GET_TAB_JOB") {
    sendResponse(detectedByTab[message.tabId] || null);
    return;
  }

  if (message.type === "GET_APPLICATIONS") {
    getApplications().then((applications) => sendResponse({ applications }));
    return true;
  }

  if (message.type === "SAVE_MANUAL") {
    addApplication({ ...message.payload, source: message.payload.source || "manual" }).then(
      (entry) => sendResponse({ ok: true, entry })
    );
    return true;
  }

  if (message.type === "UPDATE_STATUS") {
    getApplications().then(async (applications) => {
      const app = applications.find((a) => a.id === message.id);
      if (app) app.status = message.status;
      await setApplications(applications);
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message.type === "DELETE_APPLICATION") {
    getApplications().then(async (applications) => {
      const next = applications.filter((a) => a.id !== message.id);
      await setApplications(next);
      sendResponse({ ok: true });
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete detectedByTab[tabId];
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") delete detectedByTab[tabId];
});
