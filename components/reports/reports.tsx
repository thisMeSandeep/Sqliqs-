"use client";

import { useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ReportUIMessage } from "@/lib/ai/agent";
import type { ConnectionConfig } from "@/lib/ai/types";
import { toRequestBody } from "@/lib/ai/request";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { FileDownIcon, FileTextIcon } from "lucide-react";
import {
  exportReportCsv,
  exportReportMarkdown,
  exportReportPdf,
  reportToCsv,
} from "@/lib/export/report";
import { ReportDocument } from "./report-document";

const suggestions = [
  "A hiring and compensation overview by department",
  "A summary of project budgets and staffing",
  "An overview of headcount and salaries across cities",
];

export function Reports({ config }: { config?: ConnectionConfig }) {
  const [input, setInput] = useState("");
  const docRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(
    () => new DefaultChatTransport<ReportUIMessage>({ api: "/api/report", body: toRequestBody(config) }),
    [config]
  );
  const { messages, sendMessage, status } = useChat<ReportUIMessage>({ transport });

  // The report is the latest assistant message's text (streamed).
  const markdown = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    return (
      last?.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("") ?? ""
    );
  }, [messages]);

  const isWorking = status === "submitted" || status === "streaming";
  const hasTables = useMemo(() => reportToCsv(markdown).length > 0, [markdown]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {!markdown && !isWorking && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <FileTextIcon className="size-6 text-muted-foreground" />
              <div>
                <p className="font-medium">Describe a report</p>
                <p className="text-muted-foreground text-sm">
                  Ask for a written report in plain English — the model gathers the data and writes
                  it.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isWorking && !markdown && (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Gathering data and writing your report…
            </div>
          )}

          {markdown && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => exportReportMarkdown(markdown)}>
                  <FileDownIcon className="size-4" /> Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasTables}
                  onClick={() => exportReportCsv(markdown)}
                >
                  <FileDownIcon className="size-4" /> CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => docRef.current && exportReportPdf(docRef.current)}
                >
                  <FileDownIcon className="size-4" /> PDF
                </Button>
              </div>
              <ReportDocument ref={docRef} markdown={markdown} />
            </div>
          )}
        </ConversationContent>
      </Conversation>

      <div className="px-4 pb-4">
        <PromptInput onSubmit={(message) => submit(message.text)}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the report you want…"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div />
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
