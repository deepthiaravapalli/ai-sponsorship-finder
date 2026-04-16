// UK Visa Sponsor Checker — Content Script (Universal Job Page Detection)
(function () {
  "use strict";

  if (document.getElementById("uk-sponsor-widget")) return;

  const KNOWN_SITE = detectKnownSite();
  let extracted = null;
  let widgetEl = null;
  let expanded = false;

  // --- Known site detection ---
  function detectKnownSite() {
    const h = location.hostname;
    const sites = {
      "linkedin.com": "linkedin",
      "indeed.com": "indeed", "indeed.co.uk": "indeed",
      "glassdoor.com": "glassdoor", "glassdoor.co.uk": "glassdoor",
      "reed.co.uk": "reed",
      "totaljobs.com": "totaljobs",
      "monster.co.uk": "monster",
      "cv-library.co.uk": "cv-library",
      "cwjobs.co.uk": "cwjobs",
      "jobsite.co.uk": "jobsite",
      "adzuna.co.uk": "adzuna",
      "workable.com": "workable",
      "guardian.co.uk": "guardian",
      "jobs.ac.uk": "jobs.ac.uk",
      "charityjob.co.uk": "charityjob",
      "s1jobs.com": "s1jobs",
      "nijobs.com": "nijobs",
      "fish4.co.uk": "fish4",
    };
    for (const [domain, name] of Object.entries(sites)) {
      if (h.includes(domain)) return name;
    }
    return null;
  }

  const SITE_NAMES = {
    linkedin: "LinkedIn", indeed: "Indeed", glassdoor: "Glassdoor",
    reed: "Reed", totaljobs: "Totaljobs", monster: "Monster UK",
    "cv-library": "CV-Library", cwjobs: "CWJobs", jobsite: "Jobsite",
    adzuna: "Adzuna", workable: "Workable", guardian: "Guardian Jobs",
    "jobs.ac.uk": "Jobs.ac.uk", charityjob: "CharityJob",
    s1jobs: "S1Jobs", nijobs: "NIJobs", fish4: "Fish4Jobs",
  };

  // =========================================================
  // JOB PAGE DETECTION — determines if current page is a job listing
  // =========================================================
  function isJobPage() {
    if (KNOWN_SITE) return true;

    const url = (location.href + " " + document.title).toLowerCase();
    const jobKeywords = [
      "job", "career", "vacancy", "vacancies", "hiring", "recruit",
      "position", "opening", "apply", "application", "employment",
      "work with us", "join us", "join our team", "we are hiring",
    ];
    if (jobKeywords.some(k => url.includes(k))) return true;

    // Check meta tags
    const metaDesc = (document.querySelector('meta[name="description"]')?.content || "").toLowerCase();
    const metaKw = (document.querySelector('meta[name="keywords"]')?.content || "").toLowerCase();
    if (jobKeywords.some(k => metaDesc.includes(k) || metaKw.includes(k))) return true;

    // Check for structured data (JobPosting schema)
    const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const s of ldScripts) {
      try {
        const d = JSON.parse(s.textContent);
        if (d["@type"] === "JobPosting" || (d["@graph"] || []).some(i => i["@type"] === "JobPosting")) return true;
      } catch (_) {}
    }

    // Check page content for job-related headings
    const headings = document.querySelectorAll("h1, h2, h3");
    const headingText = Array.from(headings).map(h => h.textContent.toLowerCase()).join(" ");
    const strongJobSignals = ["apply now", "job description", "job details", "about the role", "responsibilities", "requirements", "qualifications"];
    if (strongJobSignals.filter(k => headingText.includes(k) || document.body.innerText.slice(0, 5000).toLowerCase().includes(k)).length >= 2) return true;

    return false;
  }

  // =========================================================
  // COMPANY EXTRACTION — site-specific + universal fallbacks
  // =========================================================
  function extractCompany() {
    try {
      // --- Known site extractors ---
      const siteExtractors = {
        linkedin: () => (
          document.querySelector(".job-details-jobs-unified-top-card__company-name a") ||
          document.querySelector(".jobs-unified-top-card__company-name a") ||
          document.querySelector(".topcard__org-name-link") ||
          document.querySelector(".job-details-jobs-unified-top-card__company-name") ||
          document.querySelector('[data-tracking-control-name="public_jobs_topcard-org-name"]') ||
          document.querySelector(".top-card-layout__second-subline a")
        ),
        indeed: () => (
          document.querySelector('[data-testid="inlineHeader-companyName"] a') ||
          document.querySelector('[data-testid="inlineHeader-companyName"]') ||
          document.querySelector(".jobsearch-InlineCompanyRating-companyHeader a") ||
          document.querySelector(".jobsearch-InlineCompanyRating a") ||
          document.querySelector(".css-1ioi40n") ||
          document.querySelector('[data-company-name="true"]')
        ),
        glassdoor: () => {
          const el = document.querySelector('[data-test="employer-name"]') ||
            document.querySelector(".css-16nw1r8") ||
            document.querySelector(".employerName");
          if (el) el._clean = txt => txt.replace(/\s*\d+(\.\d+)?\s*★/, "");
          return el;
        },
        reed: () => (
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
          document.querySelector(".company-name a") || document.querySelector(".company-name") ||
          document.querySelector('[data-qa="recruiterName"]') || document.querySelector(".posted-by a")
        ),
        totaljobs: () => (
          document.querySelector('[data-at="header-company-name"]') ||
          document.querySelector(".company-link") || document.querySelector('[class*="CompanyName"]')
        ),
        monster: () => {
          const el = document.querySelector('[data-testid="company-name"]') ||
            document.querySelector(".job-header-company a") || document.querySelector(".job-header-company");
          return el;
        },
        "cv-library": () => (
          document.querySelector(".job-header__company a") || document.querySelector(".job-header__company") ||
          document.querySelector('[data-company-name]')
        ),
        cwjobs: () => (
          document.querySelector('[data-at="header-company-name"]') ||
          document.querySelector(".company-link") || document.querySelector('[class*="CompanyName"]')
        ),
        jobsite: () => (
          document.querySelector('[data-at="header-company-name"]') ||
          document.querySelector(".company-link") || document.querySelector('[class*="CompanyName"]')
        ),
        adzuna: () => (
          document.querySelector(".ui-company a") || document.querySelector(".ui-company") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')
        ),
        workable: () => (
          document.querySelector('[data-ui="company-name"]') || document.querySelector(".company-name")
        ),
        guardian: () => (
          document.querySelector(".job-detail__company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')
        ),
        "jobs.ac.uk": () => (
          document.querySelector(".employer-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')
        ),
        charityjob: () => (
          document.querySelector(".job-org-name a") || document.querySelector(".job-org-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')
        ),
        s1jobs: () => (
          document.querySelector(".company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')
        ),
        nijobs: () => (
          document.querySelector(".company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')
        ),
        fish4: () => (
          document.querySelector(".company-name") ||
          document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')
        ),
      };

      // Try known site extractor first
      if (KNOWN_SITE && siteExtractors[KNOWN_SITE]) {
        const el = siteExtractors[KNOWN_SITE]();
        if (el) {
          const raw = (el.content || el.textContent).trim();
          return el._clean ? el._clean(raw) : raw;
        }
      }

      // --- Universal fallback strategies ---

      // 1. Schema.org itemprop
      const schemaEl =
        document.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]') ||
        document.querySelector('[itemprop="employer"] [itemprop="name"]');
      if (schemaEl) return schemaEl.textContent.trim();

      // 2. JSON-LD structured data
      const ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of ldScripts) {
        try {
          const data = JSON.parse(s.textContent);
          const items = data["@graph"] ? data["@graph"] : [data];
          for (const item of items) {
            const org = item.hiringOrganization;
            if (org) return typeof org === "string" ? org : org.name;
          }
        } catch (_) {}
      }

      // 3. Common CSS class / attribute patterns
      const genericSelectors = [
        '[data-company-name]', '[data-company]', '[data-employer]',
        '.company-name', '.employer-name', '.hiring-company',
        '.job-company', '.company-title', '.org-name',
        '[class*="companyName"]', '[class*="company-name"]',
        '[class*="employerName"]', '[class*="employer-name"]',
        '[class*="CompanyName"]', '[class*="EmployerName"]',
      ];
      for (const sel of genericSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 1 && el.textContent.trim().length < 100) {
          return el.textContent.trim();
        }
      }

      // 4. Open Graph / meta tag extraction
      const ogSite = document.querySelector('meta[property="og:site_name"]');
      if (ogSite && ogSite.content && !["LinkedIn", "Indeed", "Glassdoor"].includes(ogSite.content)) {
        // Could be the company's own career page
        const title = document.title.toLowerCase();
        if (["career", "job", "hiring", "apply"].some(k => title.includes(k))) {
          return ogSite.content.trim();
        }
      }

      // 5. Career page pattern: "Careers at [Company]" or "[Company] - Jobs"
      const titleMatch = document.title.match(
        /(?:careers?\s+(?:at|@)\s+(.+?)(?:\s*[-|–—]|$))|(?:(.+?)\s*[-|–—]\s*(?:careers?|jobs?|hiring|vacancies))/i
      );
      if (titleMatch) {
        return (titleMatch[1] || titleMatch[2]).trim();
      }

    } catch (e) {
      console.warn("[Sponsor Checker] extraction error:", e);
    }
    return null;
  }

  // =========================================================
  // WIDGET
  // =========================================================
  function createWidget() {
    const w = document.createElement("div");
    w.id = "uk-sponsor-widget";
    const siteName = KNOWN_SITE ? (SITE_NAMES[KNOWN_SITE] || KNOWN_SITE) : location.hostname.replace("www.", "");
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
        <div class="uksw-site" id="uksw-site">${siteName}</div>
      </div>
    `;
    document.body.appendChild(w);
    widgetEl = w;
    document.getElementById("uksw-toggle").addEventListener("click", toggleExpand);
    return w;
  }

  function toggleExpand() {
    expanded = !expanded;
    document.getElementById("uksw-details").style.display = expanded ? "block" : "none";
    document.getElementById("uksw-arrow").textContent = expanded ? "▲" : "▼";
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

  // =========================================================
  // MAIN FLOW
  // =========================================================
  function run() {
    // Only show widget on job pages
    if (!isJobPage()) return;

    createWidget();
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
