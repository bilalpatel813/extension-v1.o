/**
 * indeed.js
 * Runs on indeed.com/* pages (job view pages and the post-apply flow).
 *
 * NOTE ON SELECTORS: same caveat as linkedin.js — Indeed's markup shifts
 * between experiments. Update the selector arrays if detection drifts.
 */
(function () {
  const { extractField, reportDetectedJob, reportAppliedJob, watchForConfirmation } =
    window.PursuitCommon;

  const TITLE_SELECTORS = [
    "h1.jobsearch-JobInfoHeader-title",
    "h1[data-testid='jobsearch-JobInfoHeader-title']",
    "h1.icl-u-xs-mb--xs",
  ];

  const COMPANY_SELECTORS = [
    "[data-testid='inlineHeader-companyName']",
    ".jobsearch-InlineCompanyRating div a",
    ".jobsearch-CompanyInfoContainer a",
    ".icl-u-lg-mr--sm",
  ];

  const LOCATION_SELECTORS = [
    "[data-testid='inlineHeader-companyLocation']",
    ".jobsearch-JobInfoHeader-subtitle div",
  ];

  function currentJob() {
    return {
      title: extractField(TITLE_SELECTORS),
      company: extractField(COMPANY_SELECTORS),
      location: extractField(LOCATION_SELECTORS),
      source: "indeed",
      url: window.location.href.split("&from=")[0],
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

  // Indeed's own apply flow (as opposed to "apply on company site") ends on
  // a confirmation step, often inside an iframe, with text like
  // "Application submitted" or "Your application has been submitted".
  watchForConfirmation(
    [/application submitted/i, /application has been submitted/i, /you.?re all set/i],
    () => {
      const job = currentJob();
      if (job.title) reportAppliedJob(job);
    }
  );

  // Fallback: some flows redirect to a URL containing "/apply/confirmation"
  // or similar once the application actually goes through.
  if (/\/(apply|post-apply)\/.*confirm/i.test(location.href)) {
    // Title/company may not be on this page — best effort only, dashboard
    // lets the user fill gaps in manually if needed.
    const job = currentJob();
    if (job.title) reportAppliedJob(job);
  }
})();
