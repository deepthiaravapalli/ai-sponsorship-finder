// UK Visa Sponsor Checker — Popup Script
(async function () {
  const res = await fetch(chrome.runtime.getURL("sponsors.json"));
  const data = await res.json();
  const defaultSponsors = data.sponsors.map(s => s.toUpperCase().trim());

  // Load custom sponsors
  const stored = await new Promise(r => chrome.storage.local.get("customSponsors", r));
  const customSponsors = (stored.customSponsors || []);
  const allSponsors = [...new Set([...defaultSponsors, ...customSponsors.map(s => s.toUpperCase().trim())])];

  document.getElementById("total").textContent = allSponsors.length;
  document.getElementById("custom").textContent = customSponsors.length;

  // Load check count
  chrome.storage.local.get("checkCount", (r) => {
    document.getElementById("checked").textContent = r.checkCount || 0;
  });

  // Admin panel link
  document.getElementById("openAdmin").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("admin.html") });
  });

  const input = document.getElementById("searchInput");
  const resultDiv = document.getElementById("result");
  const card = document.getElementById("resultCard");
  const nameEl = document.getElementById("resultName");
  const statusEl = document.getElementById("resultStatus");

  let debounce;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => search(input.value.trim()), 250);
  });

  function search(query) {
    if (!query) {
      resultDiv.style.display = "none";
      return;
    }

    const q = query.toUpperCase();
    const exact = allSponsors.includes(q);
    const fuzzy = !exact && allSponsors.find(s =>
      s.includes(q) || q.includes(s.replace(/ (LIMITED|LTD|PLC|LLP|INC|B\.V\.)$/i, "").trim())
    );

    resultDiv.style.display = "block";
    card.className = "result-card " + (exact || fuzzy ? "sponsor" : "not_found");
    nameEl.textContent = query;
    statusEl.textContent = exact
      ? "✅ Licensed UK Visa Sponsor"
      : fuzzy
        ? `✅ Likely match: ${fuzzy}`
        : "❌ Not found on sponsor register";

    // Increment check count
    chrome.storage.local.get("checkCount", (r) => {
      const n = (r.checkCount || 0) + 1;
      chrome.storage.local.set({ checkCount: n });
      document.getElementById("checked").textContent = n;
    });
  }
})();
