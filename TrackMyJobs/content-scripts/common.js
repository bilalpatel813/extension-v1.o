/**
 * common.js
 * Shared helpers loaded before every site-specific content script.
 * Exposes a small "PursuitCommon" namespace on window.
 */
(function () {
  if (window.__pursuitCommon) return; // avoid double-injection
  window.__pursuitCommon = true;

  function cleanText(el) {
    if (!el) return "";
    return el.textContent.replace(/\s+/g, " ").trim();
  }

  function firstMatch(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && cleanText(el)) return el;
    }
    return null;
  }

  function extractField(selectors) {
    const el = firstMatch(selectors);
    return el ? cleanText(el) : "";
  }

  // Sends the job the user is currently viewing, so the popup can show
  // "detected on this page" even before an application is submitted.
  function reportDetectedJob(job) {
    if (!job || !job.title) return;
    chrome.runtime.sendMessage({
      type: "JOB_DETECTED",
      payload: { ...job, url: window.location.href },
    });
  }

  // Sends a confirmed application to the background script for storage.
  function reportAppliedJob(job) {
    if (!job || !job.title) return;
    chrome.runtime.sendMessage({
      type: "JOB_APPLIED",
      payload: {
        ...job,
        url: job.url || window.location.href,
        source: job.source,
        appliedAt: Date.now(),
      },
    });
  }

  // Watches the DOM for any added node whose text matches one of the given
  // confirmation phrase patterns (regexes). Calls onConfirmed() once per
  // distinct confirmation, debounced so rapid DOM churn doesn't fire twice.
  function watchForConfirmation(patterns, onConfirmed) {
    let firedAt = 0;
    const observer = new MutationObserver((mutations) => {
      const now = Date.now();
      if (now - firedAt < 4000) return; // debounce duplicate toasts/modals
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          const text = cleanText(node);
          if (!text) continue;
          if (patterns.some((re) => re.test(text))) {
            firedAt = now;
            onConfirmed();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }

  window.PursuitCommon = {
    cleanText,
    firstMatch,
    extractField,
    reportDetectedJob,
    reportAppliedJob,
    watchForConfirmation,
  };
})();
