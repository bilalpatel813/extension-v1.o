/**
 * dashboard.js
 */

let allApplications = [];
let activeFilter = "all";
let searchTerm = "";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderStats(apps) {
  document.getElementById("statTotal").textContent = apps.length;
  document.getElementById("statInterview").textContent = apps.filter(
    (a) => a.status === "interview"
  ).length;
  document.getElementById("statOffer").textContent = apps.filter(
    (a) => a.status === "offer"
  ).length;
  document.getElementById("statRejected").textContent = apps.filter(
    (a) => a.status === "rejected"
  ).length;
}

function getFiltered() {
  return allApplications
    .filter((a) => activeFilter === "all" || a.status === activeFilter)
    .filter((a) => {
      if (!searchTerm) return true;
      const hay = `${a.title} ${a.company}`.toLowerCase();
      return hay.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => b.appliedAt - a.appliedAt);
}

function renderRows() {
  const rows = document.getElementById("rows");
  const empty = document.getElementById("emptyState");
  const filtered = getFiltered();

  if (!filtered.length) {
    rows.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  rows.innerHTML = filtered
    .map(
      (a) => `
    <div class="row" data-id="${a.id}">
      <div class="role-cell">
        <a href="${escapeHtml(a.url || "#")}" target="_blank" rel="noopener">${escapeHtml(a.title)}</a>
        <div class="co">${escapeHtml(a.company)}${a.location ? " · " + escapeHtml(a.location) : ""}</div>
      </div>
      <div class="source-pill">
        <span class="dot ${a.source}"></span>${a.source}
      </div>
      <div class="date-cell">${formatDate(a.appliedAt)}</div>
      <div>
        <select class="status-select ${a.status}" data-id="${a.id}">
          <option value="applied" ${a.status === "applied" ? "selected" : ""}>Applied</option>
          <option value="interview" ${a.status === "interview" ? "selected" : ""}>Interview</option>
          <option value="offer" ${a.status === "offer" ? "selected" : ""}>Offer</option>
          <option value="rejected" ${a.status === "rejected" ? "selected" : ""}>Rejected</option>
        </select>
      </div>
      <button class="delete-btn" data-id="${a.id}" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"></path>
        </svg>
      </button>
    </div>`
    )
    .join("");

  rows.querySelectorAll(".status-select").forEach((sel) => {
    sel.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;
      await chrome.runtime.sendMessage({ type: "UPDATE_STATUS", id, status });
      const app = allApplications.find((a) => a.id === id);
      if (app) app.status = status;
      e.target.className = `status-select ${status}`;
      renderStats(allApplications);
    });
  });

  rows.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      await chrome.runtime.sendMessage({ type: "DELETE_APPLICATION", id });
      allApplications = allApplications.filter((a) => a.id !== id);
      renderStats(allApplications);
      renderRows();
    });
  });
}

function wireControls() {
  document.getElementById("search").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderRows();
  });

  document.getElementById("filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    document.querySelectorAll(".filter").forEach((f) => f.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderRows();
  });
}

async function init() {
  const { applications } = await chrome.runtime.sendMessage({ type: "GET_APPLICATIONS" });
  allApplications = applications || [];
  renderStats(allApplications);
  renderRows();
  wireControls();
}

init();
