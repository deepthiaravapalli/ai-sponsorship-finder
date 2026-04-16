// UK Visa Sponsor Checker — Content Script
(function () {
  "use strict";

  // Prevent double-injection
  if (document.getElementById("uk-sponsor-widget")) return;

  const SITE = detectSite();
  if (!SITE) return;

  let extracted = null;
  let widgetEl = null;
  let expanded = false;

  // --- Site detection ---
  function detectSite() {
    const h = location.hostname;
    if (h.includes("linkedin.com")) return "linkedin";
    if (h.includes("indeed.com") || h.includes("indeed.co.uk")) return "indeed";
    if (h.includes("glassdoor.com") || h.includes("glassdoor.co.uk")) return "glassdoor";
    if (h.includes("reed.co.uk")) return "reed";
    if (h.includes("totaljobs.com")) return "totaljobs";
    if (h.includes("monster.co.uk")) return "monster";
    if (h.includes("cv-library.co.uk")) return "cv-library";
    if (h.includes("cwjobs.co.uk")) return "cwjobs";
    if (h.includes("jobsite.co.uk")) return "jobsite";
    if (h.includes("adzuna.co.uk")) return "adzuna";
    if (h.includes("workable.com")) return "workable";
    if (h.includes("guardian.co.uk")) return "guardian";
    if (h.includes("jobs.ac.uk")) return "jobs.ac.uk";
    if (h.includes("charityjob.co.uk")) return "charityjob";
    if (h.includes("s1jobs.com")) return "s1jobs";
    if (h.includes("nijobs.com")) return "nijobs";
    if (h.includes("fish4.co.uk")) return "fish4";
    return null;
  }

  // --- Pretty site name ---
  const SITE_NAMES = {
    linkedin: "LinkedIn",
    indeed: "Indeed",
    glassdoor: "Glassdoor",
    reed: "Reed",
    totaljobs: "Totaljobs",
    monster: "Monster UK",
    "cv-library": "CV-Library",
    cwjobs: "CWJobs",
    jobsite: "Jobsite",
    adzuna: "Adzuna",
    workable: "Workable",
    guardian: "Guardian Jobs",
    "jobs.ac.uk": "Jobs.ac.uk",
    charityjob: "CharityJob",
    s1jobs: "S1Jobs",
    nijobs: "NIJobs",
    fish4: "Fish4Jobs",
  };

  // --- Company extraction ---
  function extractCompany() {
    try {
      // LinkedIn
      if (SITE === "linkedin") {
        const el =
          document.querySelector(".job-details-jobs-unified-top-card__company-name a") ||
          document.querySelector(".jobs-unified-top-card__company-name a") ||
          document.querySelector(".topcard__org-name-link") ||
          document.querySelector(".job-details-jobs-unified-top-card__company-name") ||
          document.querySelector('[data-tracking-control-name="public_jobs_topcard-org-name"]') ||
          document.querySelector(".top-card-layout__second-subline a");
        if (el) return el.textContent.trim();
      }

      // Indeed
      if (SITE === "indeed") {
        const el =
          document.querySelector('[data-testid="inlineHeader-companyName"] a') ||
          document.querySelector('[data-testid="inlineHeader-companyName"]') ||
          document.querySelector(".jobsearch-InlineCompanyRating-companyHeader a") ||
          document.querySelector(".jobsearch-InlineCompanyRating a") ||
          document.querySelector(".css-1ioi40n") ||
          document.querySelector('[data-company-name="true"]');
        if (el) return el.textContent.trim();
      }

      // Glassdoor
      if (SITE === "glassdoor") {
        const el =
          document.querySelector('[data-test="employer-name"]') ||
          document.querySelector(".css-16nw1r8") ||
          document.querySelector(".employerName");
        if (el) return el.textContent.trim().replace(/\s*\d+(\.\d+)?\s*★/, "");
      }

      // Reed
      if (SITE === "reed") {
        const el =
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
          document.querySelector(".company-name a") ||
          document.querySelector(".company-name") ||
          document.querySelector('[data-qa="recruiterName"]') ||
          document.querySelector(".posted-by a");
        if (el) return el.textContent.trim();
      }

      // Totaljobs
      if (SITE === "totaljobs") {
        const el =
          document.querySelector('[data-at="header-company-name"]') ||
          document.querySelector(".company-link") ||
          document.querySelector('[class*="CompanyName"]') ||
          document.querySelector(".at-listing__list-icons_company-name");
        if (el) return el.textContent.trim();
      }

      // Monster UK
      if (SITE === "monster") {
        const el =
          document.querySelector('[data-testid="company-name"]') ||
          document.querySelector(".job-header-company a") ||
          document.querySelector(".job-header-company") ||
          document.querySelector('[name="company"]');
        if (el) return (el.content || el.textContent).trim();
      }

      // CV-Library
      if (SITE === "cv-library") {
        const el =
          document.querySelector(".job-header__company a") ||
          document.querySelector(".job-header__company") ||
          document.querySelector('[data-company-name]') ||
          document.querySelector(".company-name a");
        if (el) return el.textContent.trim();
      }

      // CWJobs
      if (SITE === "cwjobs") {
        const el =
          document.querySelector('[data-at="header-company-name"]') ||
          document.querySelector(".company-link") ||
          document.querySelector('[class*="CompanyName"]');
        if (el) return el.textContent.trim();
      }

      // Jobsite
      if (SITE === "jobsite") {
        const el =
          document.querySelector('[data-at="header-company-name"]') ||
          document.querySelector(".company-link") ||
          document.querySelector('[class*="CompanyName"]');
        if (el) return el.textContent.trim();
      }

      // Adzuna
      if (SITE === "adzuna") {
        const el =
          document.querySelector(".ui-company a") ||
          document.querySelector(".ui-company") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
          document.querySelector("h2.company");
        if (el) return el.textContent.trim();
      }

      // Workable
      if (SITE === "workable") {
        const el =
          document.querySelector('[data-ui="company-name"]') ||
          document.querySelector(".company-name") ||
          document.querySelector("h2");
        if (el) return el.textContent.trim();
      }

      // Guardian Jobs
      if (SITE === "guardian") {
        const el =
          document.querySelector(".job-detail__company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
          document.querySelector(".recruiter-name a");
        if (el) return el.textContent.trim();
      }

      // Jobs.ac.uk
      if (SITE === "jobs.ac.uk") {
        const el =
          document.querySelector(".employer-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
          document.querySelector(".h3.employer");
        if (el) return el.textContent.trim();
      }

      // CharityJob
      if (SITE === "charityjob") {
        const el =
          document.querySelector(".job-org-name a") ||
          document.querySelector(".job-org-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]');
        if (el) return el.textContent.trim();
      }

      // S1Jobs
      if (SITE === "s1jobs") {
        const el =
          document.querySelector(".company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]');
        if (el) return el.textContent.trim();
      }

      // NIJobs
      if (SITE === "nijobs") {
        const el =
          document.querySelector(".company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]');
        if (el) return el.textContent.trim();
      }

      // Fish4Jobs
      if (SITE === "fish4") {
        const el =
          document.querySelector(".company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
          document.querySelector(".recruiter-name");
        if (el) return el.textContent.trim();
      }

      // Generic fallback — try common schema.org / structured data patterns
      const schemaEl =
        document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
        document.querySelector('[itemprop="employer"] [itemprop="name"]');
      if (schemaEl) return schemaEl.textContent.trim();

      // Try JSON-LD structured data
      const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of ldScripts) {
        try {
          const data = JSON.parse(s.textContent);
          const org = data.hiringOrganization || (data["@graph"] || []).find(i => i.hiringOrganization)?.hiringOrganization;
          if (org) return typeof org === "string" ? org : org.name;
        } catch (_) {}
      }
    } catch (e) {
      console.warn("[Sponsor Checker] extraction error:", e);
    }
    return null;
  }

  // --- Widget creation ---
  function createWidget() {
    const w = document.createElement("div");
    w.id = "uk-sponsor-widget";
    w.innerHTML = `
      <div class="uksw-header" id="uksw-toggle">
        <span class="uksw-icon">🇬🇧</span>
        <span class="uksw-title">Visa Sponsor</span>
        <span class="uksw-arrow" id="uksw-arrow">▼</span>
      </div>
      <div class="uksw-status" id="uksw-status">
        <div class="uksw-dot uksw-loading" id="uksw-dot"></div>
        <span id="uksw-label">Checking…</span>
      </div>
      <div class="uksw-details" id="uksw-details" style="display:none;">
        <div class="uksw-company" id="uksw-company"></div>
        <div class="uksw-match" id="uksw-match"></div>
        <div class="uksw-site" id="uksw-site">${SITE_NAMES[SITE] || SITE}</div>
      </div>
    `;
    document.body.appendChild(w);
    widgetEl = w;

    document.getElementById("uksw-toggle").addEventListener("click", toggleExpand);
    return w;
  }

  function toggleExpand() {
    expanded = !expanded;
    const det = document.getElementById("uksw-details");
    const arrow = document.getElementById("uksw-arrow");
    det.style.display = expanded ? "block" : "none";
    arrow.textContent = expanded ? "▲" : "▼";
  }

  function updateWidget(result) {
    const dot = document.getElementById("uksw-dot");
    const label = document.getElementById("uksw-label");
    const company = document.getElementById("uksw-company");
    const match = document.getElementById("uksw-match");

    dot.classList.remove("uksw-loading");

    if (result.status === "sponsor") {
      dot.classList.add("uksw-green");
      label.textContent = "Sponsor ✅";
      company.textContent = `Company: ${result.company}`;
      match.textContent = result.matched ? `Matched: ${result.matched}` : "Exact match";
    } else if (result.status === "not_found") {
      dot.classList.add("uksw-red");
      label.textContent = "Not Found ❌";
      company.textContent = `Company: ${result.company}`;
      match.textContent = "Not on UK sponsor register";
    } else {
      dot.classList.add("uksw-yellow");
      label.textContent = "Unknown ⚠️";
      company.textContent = "Could not detect company";
      match.textContent = "Try refreshing the page";
    }
  }

  // --- Main flow ---
  function run() {
    createWidget();
    // Delay extraction to let SPAs render
    setTimeout(() => {
      extracted = extractCompany();
      chrome.runtime.sendMessage(
        { type: "CHECK_SPONSOR", company: extracted },
        (response) => {
          if (chrome.runtime.lastError) {
            updateWidget({ status: "unknown" });
            return;
          }
          updateWidget(response);
        }
      );
    }, 1500);
  }

  // Handle SPA navigation
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      const old = document.getElementById("uk-sponsor-widget");
      if (old) old.remove();
      setTimeout(run, 1000);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  run();
})();