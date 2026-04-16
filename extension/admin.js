// UK Visa Sponsor Checker — Admin Panel Script
(async function () {
  // Load default sponsors from bundled JSON
  const res = await fetch(chrome.runtime.getURL("sponsors.json"));
  const data = await res.json();
  const defaultSponsors = data.sponsors.map(s => s.toUpperCase().trim());

  // State
  let customSponsors = [];
  let activeTab = "all";

  // Elements
  const newCompanyInput = document.getElementById("newCompany");
  const addBtn = document.getElementById("addBtn");
  const filterInput = document.getElementById("filterInput");
  const companyList = document.getElementById("companyList");
  const defaultCountEl = document.getElementById("defaultCount");
  const customCountEl = document.getElementById("customCount");
  const totalCountEl = document.getElementById("totalCount");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  const clearCustomBtn = document.getElementById("clearCustomBtn");

  // Load custom sponsors from storage
  async function loadCustom() {
    return new Promise(resolve => {
      chrome.storage.local.get("customSponsors", r => {
        customSponsors = (r.customSponsors || []).map(s => s.toUpperCase().trim());
        resolve();
      });
    });
  }

  async function saveCustom() {
    return new Promise(resolve => {
      chrome.storage.local.set({ customSponsors }, resolve);
    });
  }

  // Notify background to reload
  function notifyBackground() {
    chrome.runtime.sendMessage({ type: "RELOAD_SPONSORS" });
  }

  function showToast(msg, type = "success") {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast " + type + " show";
    setTimeout(() => el.classList.remove("show"), 2000);
  }

  function updateStats() {
    defaultCountEl.textContent = defaultSponsors.length;
    customCountEl.textContent = customSponsors.length;
    totalCountEl.textContent = defaultSponsors.length + customSponsors.length;
  }

  function render() {
    const filter = filterInput.value.toUpperCase().trim();
    let items = [];

    if (activeTab === "all" || activeTab === "default") {
      items.push(...defaultSponsors.map(s => ({ name: s, type: "default" })));
    }
    if (activeTab === "all" || activeTab === "custom") {
      items.push(...customSponsors.map(s => ({ name: s, type: "custom" })));
    }

    // Sort
    items.sort((a, b) => a.name.localeCompare(b.name));

    // Filter
    if (filter) {
      items = items.filter(i => i.name.includes(filter));
    }

    if (items.length === 0) {
      companyList.innerHTML = '<div class="empty">No companies found</div>';
      return;
    }

    companyList.innerHTML = items.map(item => `
      <div class="company-item">
        <span class="name">${escapeHtml(item.name)}</span>
        <span class="badge ${item.type === 'custom' ? 'badge-custom' : 'badge-default'}">${item.type}</span>
        ${item.type === 'custom' ? `<button class="btn btn-danger remove-btn" data-name="${escapeHtml(item.name)}">✕</button>` : ''}
      </div>
    `).join("");

    // Bind remove buttons
    companyList.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const name = btn.dataset.name;
        customSponsors = customSponsors.filter(s => s !== name);
        await saveCustom();
        notifyBackground();
        updateStats();
        render();
        showToast("Removed: " + name);
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Add company
  addBtn.addEventListener("click", async () => {
    const val = newCompanyInput.value.toUpperCase().trim();
    if (!val) return;

    if (defaultSponsors.includes(val)) {
      showToast("Already in default list", "error");
      return;
    }
    if (customSponsors.includes(val)) {
      showToast("Already added", "error");
      return;
    }

    customSponsors.push(val);
    await saveCustom();
    notifyBackground();
    newCompanyInput.value = "";
    updateStats();
    render();
    showToast("Added: " + val);
  });

  newCompanyInput.addEventListener("keydown", e => {
    if (e.key === "Enter") addBtn.click();
  });

  // Filter
  let debounce;
  filterInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(render, 200);
  });

  // Tabs
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      render();
    });
  });

  // Export custom
  exportBtn.addEventListener("click", () => {
    if (customSponsors.length === 0) {
      showToast("No custom sponsors to export", "error");
      return;
    }
    const csvHeader = "Company Name\n";
    const csvRows = customSponsors.map(s => '"' + s.replace(/"/g, '""') + '"').join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom_sponsors.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported " + customSponsors.length + " companies as CSV");
  });

  // Import
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      showToast("Only CSV files are supported", "error");
      importFile.value = "";
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split("\n");
      let added = 0;

      lines.forEach(line => {
        // Strip CSV quotes and whitespace
        const name = line.replace(/^"|"$/g, "").replace(/""/g, '"').toUpperCase().trim();
        if (name && name !== "COMPANY NAME" && !defaultSponsors.includes(name) && !customSponsors.includes(name)) {
          customSponsors.push(name);
          added++;
        }
      });

      await saveCustom();
      notifyBackground();
      updateStats();
      render();
      showToast("Imported " + added + " new companies from CSV");
    } catch (err) {
      showToast("Import failed: " + err.message, "error");
    }
    importFile.value = "";
  });

  // Clear custom
  clearCustomBtn.addEventListener("click", async () => {
    if (customSponsors.length === 0) {
      showToast("No custom sponsors to clear", "error");
      return;
    }
    if (!confirm("Remove all " + customSponsors.length + " custom sponsors?")) return;
    customSponsors = [];
    await saveCustom();
    notifyBackground();
    updateStats();
    render();
    showToast("All custom sponsors removed");
  });

  // Init
  await loadCustom();
  updateStats();
  render();
})();
