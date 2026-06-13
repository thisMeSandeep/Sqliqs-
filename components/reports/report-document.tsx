"use client";

import { forwardRef } from "react";
import { Streamdown } from "streamdown";

// The styled document: Streamdown renders the markdown, the `prose` typography
// plugin styles the elements (headings, tables, lists). Ref is exposed so PDF
// export can read the rendered HTML.
export const ReportDocument = forwardRef<HTMLDivElement, { markdown: string }>(
  function ReportDocument({ markdown }, ref) {
    return (
      <div ref={ref} className="prose prose-sm dark:prose-invert max-w-none">
        <Streamdown>{markdown}</Streamdown>
      </div>
    );
  }
);
