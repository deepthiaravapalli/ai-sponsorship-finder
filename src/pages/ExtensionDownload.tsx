import { Button } from "@/components/ui/button";
import { Download, Globe, CheckCircle } from "lucide-react";

const ExtensionDownload = () => {
  const handleDownload = () => {
    fetch("/uk-sponsor-checker.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "uk-sponsor-checker.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="text-5xl">🇬🇧</div>
          <h1 className="text-3xl font-heading font-bold">UK Visa Sponsor Checker</h1>
          <p className="text-muted-foreground">Chrome Extension — Auto-detect sponsorship status on job boards</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Globe className="w-5 h-5" /> Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Auto-detects company name on LinkedIn, Indeed & Glassdoor",
              "Checks against 95+ UK licensed sponsor companies",
              "Green/Red/Yellow floating widget on job pages",
              "Search any company from the popup",
              "Zero performance impact — vanilla JS, no frameworks",
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={handleDownload} className="gap-2">
            <Download className="w-5 h-5" /> Download Extension (.zip)
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">📦 Installation Steps</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Download and <strong>unzip</strong> the file</li>
            <li>Open <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code> in Chrome</li>
            <li>Enable <strong>Developer mode</strong> (top-right toggle)</li>
            <li>Click <strong>"Load unpacked"</strong> and select the unzipped folder</li>
            <li>Visit any job page on LinkedIn, Indeed, or Glassdoor!</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2">Also works on Edge, Brave, Arc, and Opera.</p>
        </div>
      </div>
    </div>
  );
};

export default ExtensionDownload;
