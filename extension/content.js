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
    return null;
  }

  // --- Company extraction ---
  function extractCompany() {
    try {
      if (SITE === "linkedin") {
        // Job detail page
        const el =
          document.querySelector(".job-details-jobs-unified-top-card__company-name a") ||
          document.querySelector(".jobs-unified-top-card__company-name a") ||
          document.querySelector(".topcard__org-name-link") ||
          document.querySelector(".job-details-jobs-unified-top-card__company-name") ||
          document.querySelector('[data-tracking-control-name="public_jobs_topcard-org-name"]') ||
          document.querySelector(".top-card-layout__second-subline a");
        if (el) return el.textContent.trim();
      }

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

      if (SITE === "glassdoor") {
        const el =
          document.querySelector('[data-test="employer-name"]') ||
          document.querySelector(".css-16nw1r8") ||
          document.querySelector(".employerName");
        if (el) return el.textContent.trim().replace(/\s*\d+(\.\d+)?\s*★/, "");
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
        <div class="uksw-site" id="uksw-site">${SITE.charAt(0).toUpperCase() + SITE.slice(1)}</div>
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

  // Handle SPA navigation (LinkedIn is an SPA)
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
