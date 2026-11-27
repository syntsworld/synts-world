(() => {
  "use strict";

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  function sanitizeFilename(name, fallback = "synts-lyrics") {
    const clean = String(name || fallback)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return clean || fallback;
  }

  function formatForReading(title, lyrics, meta = {}) {
    const headerLines = [];
    if (title) headerLines.push(String(title).trim());
    if (meta.artist) headerLines.push(`Artist: ${String(meta.artist).trim()}`);
    if (meta.language) headerLines.push(`Language: ${String(meta.language).trim()}`);

    const header = headerLines.length
      ? `${headerLines.join(" | ")}\n${"=".repeat(40)}\n\n`
      : "";

    const body = String(lyrics || "")
      .replace(/\r\n/g, "\n")
      .trim();

    return `${header}${body}\n`;
  }

  function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadLyricFile(title, lyrics, meta = {}, ext = "txt") {
    const safeExt = ext === "md" ? "md" : "txt";
    const base = sanitizeFilename(title, "synts-lyrics");
    const formatted =
      safeExt === "md"
        ? `# ${String(title || "Synts Lyrics").trim()}\n\n${String(lyrics || "").trim()}\n`
        : formatForReading(title, lyrics, meta);

    downloadTextFile(`${base}.${safeExt}`, formatted);
  }

  function downloadProjectSnapshot(projectData = {}) {
    const title = projectData.title || "synts-project";
    const base = sanitizeFilename(title, "synts-project");
    const payload = {
      exportedAt: new Date().toISOString(),
      title: projectData.title || "Untitled Project",
      language: projectData.language || "",
      lyrics: projectData.lyrics || "",
      notes: projectData.notes || ""
    };

    downloadTextFile(
      `${base}-project.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
  }

  window.SyntsReader = {
    formatForReading,
    downloadTxt: (title, lyrics, meta) => downloadLyricFile(title, lyrics, meta, "txt"),
    downloadMd: (title, lyrics, meta) => downloadLyricFile(title, lyrics, meta, "md"),
    downloadProject: downloadProjectSnapshot
  };
})();
