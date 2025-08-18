"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/CodeBlock";

type Block =
  | { type: "code"; language?: "python"; content: string }
  | { type: "stdout"; content: string }
  | { type: "image"; src: string; alt?: string };

export function NotebookStep({
  index,
  title,
  markdown,
  blocks,
  defaultOpen = true
}: {
  index: number;
  title: string;
  markdown?: string;
  blocks: Block[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold">
            {index}
          </span>
          <h3 className="text-lg font-semibold">{title || `Step ${index}`}</h3>
        </div>
        <span className="text-sm text-gray-500">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t p-4">
          {markdown && (
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          )}
          {blocks.map((b, i) => {
            if (b.type === "code") return <CodeBlock key={i} code={b.content} language="python" />;
            if (b.type === "stdout")
              return (
                <pre key={i} className="rounded-xl border bg-white/70 p-3 text-xs overflow-x-auto">
                  {b.content}
                </pre>
              );
            if (b.type === "image")
              return (
                <figure key={i} className="rounded-xl border p-2">
                  <img src={b.src} alt={b.alt || "figure"} className="w-full" />
                  <figcaption className="mt-1 text-xs text-gray-500">{b.alt}</figcaption>
                </figure>
              );
            return null;
          })}
        </div>
      )}
    </section>
  );
}
