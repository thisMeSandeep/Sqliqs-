// Chart export. Recharts renders a native <svg>, so SVG export is a serialize +
// download, and PNG is svg → image → canvas → blob. Both run entirely in the
// browser, no dependencies. (PDF export needs a lib like jsPDF — added later.)

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function serialize(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(clone);
}

export function exportChartSvg(svg: SVGSVGElement, filename = "chart.svg") {
  const blob = new Blob([serialize(svg)], { type: "image/svg+xml;charset=utf-8" });
  download(blob, filename);
}

export async function exportChartPng(svg: SVGSVGElement, filename = "chart.png", scale = 2) {
  const { width, height } = svg.getBoundingClientRect();
  const source = serialize(svg);
  const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const img = new Image();
    img.width = width;
    img.height = height;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to rasterize chart"));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) download(blob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
