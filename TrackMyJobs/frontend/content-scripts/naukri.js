/**
 * naukri.js
 * Runs on naukri.com/* pages.
 *
 * NOTE ON SELECTORS: same caveat as the other site scripts — update these
 * if Naukri changes its job-detail page markup.
 */
(function () {
  const { extractField, reportDetectedJob, reportAppliedJob, watchForConfirmation } =
    window.PursuitCommon;

  const TITLE_SELECTORS = [
    "h1.jd-header-title",
    ".jd-header-title",
    "h1[title]",
  ];

  const COMPANY_SELECTORS = [
    ".jd-header-comp-name a",
    ".jd-header-comp-name",
    ".comp-name",
  ];

  const LOCATION_SELECTORS = [
    ".jd-header-comp-info .location span",
    ".loc-area span",
  ];

  function currentJob() {
    return {
      title: extractField(TITLE_SELECTORS),
      company: extractField(COMPANY_SELECTORS),
      location: extractField(LOCATION_SELECTORS),
      source: "naukri",
      url: window.location.href.split("?")[0],
    };
  }

  function init() {
    const job = currentJob();
    if (job.title) reportDetectedJob(job);
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(init, 800);
    }
  }).observe(document.body, { childList: true, subtree: true });

  setTimeout(init, 1200);

  // Naukri typically shows a toast/snackbar like
  // "Your application has been submitted successfully!" after applying.
  watchForConfirmation(
    [/application (has been |was )?submitted/i, /applied successfully/i],
    () => {
      const job = currentJob();
      if (job.title) reportAppliedJob(job);
    }
  );
})();
