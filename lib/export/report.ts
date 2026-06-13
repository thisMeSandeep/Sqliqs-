// Report export. Markdown is the source of truth, so .md is a raw download.
// CSV is extracted from the markdown tables in the report. PDF uses the
// browser's print-to-PDF on the rendered document (no dependency).

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportReportMarkdown(markdown: string, filename = "report.md") {
  download(markdown, filename, "text/markdown;charset=utf-8");
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// Pull every GFM table out of the markdown and flatten to CSV. Multiple tables
// are separated by a blank line. Returns "" if the report has no tables.
export function reportToCsv(markdown: string): string {
  const lines = markdown.split("\n");
  const blocks: string[][] = [];
  let current: string[] = [];

  const isRow = (l: string) => l.trim().startsWith("|");
  const isSeparator = (l: string) => /^\s*\|?[\s:|-]+\|?\s*$/.test(l) && l.includes("-");

  for (const line of lines) {
    if (isRow(line)) {
      current.push(line);
    } else if (current.length) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length) blocks.push(current);

  const csvBlocks = blocks
    .filter((b) => b.length >= 2 && isSeparator(b[1]))
    .map((b) =>
      b
        .filter((l) => !isSeparator(l))
        .map((row) =>
          row
            .trim()
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => csvEscape(cell.trim()))
            .join(",")
        )
        .join("\n")
    );

  return csvBlocks.join("\n\n");
}

export function exportReportCsv(markdown: string, filename = "report.csv") {
  const csv = reportToCsv(markdown);
  if (!csv) return false;
  download(csv, filename, "text/csv;charset=utf-8");
  return true;
}

// Print-to-PDF: open the rendered document in a window with print styles and
// trigger the browser's print dialog (the user picks "Save as PDF").
export function exportReportPdf(element: HTMLElement, title = "Report") {
  const win = window.open("", "_blank", "width=820,height=1000");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${title}</title>
<style>
  body { font: 14px/1.6 ui-sans-serif, system-ui, sans-serif; color: #111; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
  h1,h2,h3 { line-height: 1.25; margin: 1.4em 0 0.5em; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f5; }
  code { background: #f5f5f5; padding: 0.1em 0.3em; border-radius: 3px; }
</style></head><body>${element.innerHTML}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
