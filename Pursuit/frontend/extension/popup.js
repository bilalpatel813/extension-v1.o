/**
 * popup.js
 * Loads real data from the background service worker / chrome.storage
 * and renders it into popup.html.
 */

const SOURCE_LABELS = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  naukri: "Naukri",
  manual: "Manual",
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderStats(applications) {
  document.getElementById("statApplied").textContent = applications.length;
  document.getElementById("statInterview").textContent = applications.filter(
    (a) => a.status === "interview"
  ).length;
  document.getElementById("statOffers").textContent = applications.filter(
    (a) => a.status === "offer"
  ).length;
}

function renderList(applications) {
  const list = document.getElementById("appList");
  const empty = document.getElementById("emptyState");
  const recent = [...applications].sort((a, b) => b.appliedAt - a.appliedAt).slice(0, 5);

  if (!recent.length) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.innerHTML = recent
    .map(
      (a) => `
      <a class="app-row" href="${escapeHtml(a.url || "#")}" target="_blank" rel="noopener">
        <div class="app-info">
          <span class="source-dot ${a.source}"></span>
          <div class="app-text">
            <div class="role">${escapeHtml(a.title)}</div>
            <div class="co">${escapeHtml(a.company)} · ${timeAgo(a.appliedAt)}</div>
          </div>
        </div>
        <div class="badge ${a.status}">${a.status}</div>
      </a>`
    )
    .join("");
}

function renderCapture(job, alreadySaved) {
  const card = document.getElementById("captureCard");
  const statusText = document.getElementById("captureStatusText");
  const title = document.getElementById("captureTitle");
  const company = document.getElementById("captureCompany");
  const btn = document.getElementById("saveBtn");
  const btnLabel = document.getElementById("saveBtnLabel");

  if (!job) {
    card.classList.add("idle");
    statusText.textContent = "nothing detected here";
    title.textContent = "No job detected on this page";
    company.textContent = "Open a job listing on LinkedIn, Indeed, or Naukri";
    btn.disabled = true;
    btnLabel.textContent = "Save this application";
    return;
  }

  card.classList.remove("idle");
  statusText.textContent = "detected on this page";
  title.textContent = job.title;
  company.textContent = [job.company, job.location].filter(Boolean).join(" · ");

  if (alreadySaved) {
    btn.disabled = true;
    btnLabel.textContent = "Already tracked";
  } else {
    btn.disabled = false;
    btnLabel.textContent = "Save this application";
  }
}

// UPDATE THIS if the website ever moves to a different domain — it's the
// only place the extension hardcodes the site's URL.
const WEBSITE_URL = "https://pursuit-sandy-three.vercel.app";

function openDashboard(e) {
  if (e) e.preventDefault();
  // Opens the real, backend-connected dashboard on the website (same
  // account, synced data) rather than the extension's own bundled
  // dashboard.html, which only ever showed this browser's local cache.
  chrome.tabs.create({ url: `${WEBSITE_URL}/dashboard` });
}

function showLoginScreen() {
  document.getElementById("loginScreen").hidden = false;
  document.getElementById("appContent").hidden = true;
}

function showAppContent(email, fullName) {
  document.getElementById("loginScreen").hidden = true;
  document.getElementById("appContent").hidden = false;
  const row = document.getElementById("accountRow");
  if (email || fullName) {
    row.hidden = false;
    document.getElementById("accountEmail").textContent = fullName || email;
  } else {
    row.hidden = true;
  }
}

async function loadAppData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const { applications } = await chrome.runtime.sendMessage({ type: "GET_APPLICATIONS" });
  renderStats(applications);
  renderList(applications);

  let job = null;
  if (tab?.id != null) {
    job = await chrome.runtime.sendMessage({ type: "GET_TAB_JOB", tabId: tab.id });
  }
  const alreadySaved = job ? applications.some((a) => a.url === job.url) : false;
  renderCapture(job, alreadySaved);

  document.getElementById("saveBtn").onclick = async () => {
    if (!job) return;
    const btn = document.getElementById("saveBtn");
    const label = document.getElementById("saveBtnLabel");
    btn.disabled = true;
    label.textContent = "Saving…";
    const res = await chrome.runtime.sendMessage({ type: "SAVE_MANUAL", payload: job });
    if (res?.ok) {
      label.textContent = "Saved ✓";
      const fresh = await chrome.runtime.sendMessage({ type: "GET_APPLICATIONS" });
      renderStats(fresh.applications);
      renderList(fresh.applications);
    }
  };
}

function wireLoginForm() {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const btn = document.getElementById("loginBtn");
    const label = document.getElementById("loginBtnLabel");
    const errorBox = document.getElementById("loginError");

    errorBox.hidden = true;
    btn.disabled = true;
    label.textContent = "Signing in…";

    const res = await chrome.runtime.sendMessage({ type: "LOGIN", email, password });

    if (res?.ok) {
      showAppContent(res.email, res.fullName);
      await loadAppData();
    } else {
      errorBox.textContent = res?.error || "Sign in failed. Try again.";
      errorBox.hidden = false;
      btn.disabled = false;
      label.textContent = "Sign in";
    }
  });
}

function wireLogout() {
  document.getElementById("logoutLink").addEventListener("click", async (e) => {
    e.preventDefault();
    await chrome.runtime.sendMessage({ type: "LOGOUT" });
    showLoginScreen();
  });
}

async function init() {
  wireLoginForm();
  wireLogout();

  document.getElementById("openDashboard").addEventListener("click", openDashboard);
  document.getElementById("viewAll").addEventListener("click", openDashboard);
  document.getElementById("openDashboardIcon").addEventListener("click", openDashboard);

  const { loggedIn, email, fullName } = await chrome.runtime.sendMessage({ type: "GET_AUTH_STATE" });
  if (!loggedIn) {
    showLoginScreen();
    return;
  }

  showAppContent(email, fullName);
  await loadAppData();
}

init();
