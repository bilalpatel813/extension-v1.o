/**
 * linkedin.js
 * Runs on linkedin.com/jobs/* pages.
 *
 * NOTE ON SELECTORS: LinkedIn changes its markup often and A/B tests layouts,
 * so every selector below is a best-effort guess with fallbacks. If detection
 * stops working, open a job page, inspect the title/company elements, and
 * update the arrays below — the rest of the logic does not need to change.
 */
(function () {
  const { extractField, reportDetectedJob, reportAppliedJob, watchForConfirmation } =
    window.PursuitCommon;

  const TITLE_SELECTORS = [
    "h1.job-details-jobs-unified-top-card__job-title",
    "h1.top-card-layout__title",
    ".jobs-unified-top-card__job-title h1",
    "h1",
  ];

  const COMPANY_SELECTORS = [
    ".job-details-jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name a",
    ".topcard__org-name-link",
    ".topcard__flavor--black-link",
  ];

  const LOCATION_SELECTORS = [
    ".job-details-jobs-unified-top-card__primary-description-container span",
    ".jobs-unified-top-card__bullet",
    ".topcard__flavor--bullet",
  ];

  function currentJob() {
    return {
      title: extractField(TITLE_SELECTORS),
      company: extractField(COMPANY_SELECTORS),
      location: extractField(LOCATION_SELECTORS),
      source: "linkedin",
      url: window.location.href.split("?")[0],
    };
  }

  function init() {
    const job = currentJob();
    if (job.title) reportDetectedJob(job);
  }

  // Re-check whenever LinkedIn's SPA swaps the job panel (URL changes
  // without a full reload).
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(init, 800); // let the panel content render
    }
  }).observe(document.body, { childList: true, subtree: true });

  setTimeout(init, 1200);

  // Confirmation screen after "Easy Apply" typically shows text like
  // "Your application was sent to <Company>" or "Application submitted".
  watchForConfirmation(
    [/application (was )?sent/i, /application submitted/i, /you.?ve applied/i],
    () => {
      const job = currentJob();
      if (job.title) reportAppliedJob(job);
    }
  );
})();
