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

function openDashboard(e) {
  if (e) e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
}

async function init() {
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

  document.getElementById("saveBtn").addEventListener("click", async () => {
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
  });

  document.getElementById("openDashboard").addEventListener("click", openDashboard);
  document.getElementById("viewAll").addEventListener("click", openDashboard);
  document.getElementById("openDashboardIcon").addEventListener("click", openDashboard);
}

init();
