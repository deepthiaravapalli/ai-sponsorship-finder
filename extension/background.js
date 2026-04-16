// UK Visa Sponsor Checker — Background Service Worker

let sponsorList = [];
let defaultSponsors = [];

// Load sponsor data: default JSON + custom from storage
async function loadSponsors() {
  try {
    const res = await fetch(chrome.runtime.getURL("sponsors.json"));
    const data = await res.json();
    defaultSponsors = data.sponsors.map(s => s.toUpperCase().trim());
  } catch (e) {
    console.error("[Sponsor Checker] Failed to load sponsors:", e);
    defaultSponsors = [];
  }

  // Merge custom sponsors from storage
  try {
    const stored = await chrome.storage.local.get("customSponsors");
    const custom = (stored.customSponsors || []).map(s => s.toUpperCase().trim());
    sponsorList = [...new Set([...defaultSponsors, ...custom])];
  } catch (e) {
    sponsorList = [...defaultSponsors];
  }

  console.log(`[Sponsor Checker] Loaded ${sponsorList.length} sponsors`);
}

chrome.runtime.onInstalled.addListener(loadSponsors);
chrome.runtime.onStartup.addListener(loadSponsors);

// Listen for messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CHECK_SPONSOR") {
    if (sponsorList.length === 0) {
      loadSponsors().then(() => {
        sendResponse(checkCompany(msg.company));
      });
      return true;
    }
    sendResponse(checkCompany(msg.company));
  }

  if (msg.type === "RELOAD_SPONSORS") {
    loadSponsors().then(() => {
      sendResponse({ ok: true, count: sponsorList.length });
    });
    return true;
  }

  return false;
});

// Normalize a company name for matching — strip suffixes and common noise
function normalize(name) {
  return name
    .toUpperCase()
    .trim()
    // Remove common suffixes
    .replace(/\b(LIMITED|LTD\.?|PLC|LLP|LLC|INC\.?|INCORPORATED|CORPORATION|CORP\.?|GROUP|HOLDINGS|B\.V\.|N\.V\.|GMBH|PTY|PVT|PRIVATE)\b/g, "")
    // Remove special characters
    .replace(/[.,()&]/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function checkCompany(rawName) {
  if (!rawName || rawName.trim() === "") {
    return { status: "unknown", company: rawName, message: "Company not detected" };
  }

  const name = rawName.toUpperCase().trim();
  const nameNorm = normalize(rawName);

  // 1. Exact match
  if (sponsorList.includes(name)) {
    return { status: "sponsor", company: rawName, message: "UK Visa Sponsor ✅" };
  }

  // 2. Normalized exact match
  for (const s of sponsorList) {
    if (normalize(s) === nameNorm) {
      return { status: "sponsor", company: rawName, matched: s, message: "UK Visa Sponsor ✅" };
    }
  }

  // 3. One contains the other (normalized)
  if (nameNorm.length >= 3) {
    for (const s of sponsorList) {
      const sNorm = normalize(s);
      if (sNorm.includes(nameNorm) || nameNorm.includes(sNorm)) {
        return { status: "sponsor", company: rawName, matched: s, message: "UK Visa Sponsor ✅" };
      }
    }
  }

  // 4. Word-start matching — check if extracted name words all appear at start of sponsor words
  if (nameNorm.length >= 3) {
    const queryWords = nameNorm.split(" ").filter(w => w.length > 1);
    for (const s of sponsorList) {
      const sNorm = normalize(s);
      const sWords = sNorm.split(" ").filter(w => w.length > 1);
      // All query words must match start of some sponsor word
      const allMatch = queryWords.every(qw =>
        sWords.some(sw => sw.startsWith(qw) || qw.startsWith(sw))
      );
      if (allMatch && queryWords.length > 0) {
        return { status: "sponsor", company: rawName, matched: s, message: "UK Visa Sponsor ✅" };
      }
    }
  }

  return { status: "not_found", company: rawName, message: "Not on sponsor list" };
}
