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

  console.log(`[Sponsor Checker] Loaded ${sponsorList.length} sponsors (${defaultSponsors.length} default + ${sponsorList.length - defaultSponsors.length} custom)`);
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
      return true; // async
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

function checkCompany(rawName) {
  if (!rawName || rawName.trim() === "") {
    return { status: "unknown", company: rawName, message: "Company not detected" };
  }

  const name = rawName.toUpperCase().trim();

  // Exact match
  if (sponsorList.includes(name)) {
    return { status: "sponsor", company: rawName, message: "UK Visa Sponsor ✅" };
  }

  // Fuzzy: check if any sponsor contains the name or vice-versa
  const fuzzy = sponsorList.find(s =>
    s.includes(name) || name.includes(s.replace(/ (LIMITED|LTD|PLC|LLP|INC|B\.V\.)$/i, "").trim())
  );

  if (fuzzy) {
    return { status: "sponsor", company: rawName, matched: fuzzy, message: "UK Visa Sponsor ✅" };
  }

  return { status: "not_found", company: rawName, message: "Not on sponsor list" };
}
