"use client";
import { useState, Fragment } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import DOMPurify from "isomorphic-dompurify";
import { CodeBlock } from "@/components/CodeBlock";

type Block =
  | { type: "markdown"; content: string }
  | { type: "code"; language?: "python"; content: string }
  | { type: "stdout"; content: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "html"; content: string };

export function NotebookStep({
  index,
  title,
  blocks,
  defaultOpen = true,
}: {
  index: number;
  title: string;
  blocks: Block[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Render blocks with "cell grouping": CODE -> [all outputs until next CODE/MARKDOWN] as one card
  const grouped: JSX.Element[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];

    // 1) Markdown stays as-is (not part of a cell run)
    if (b.type === "markdown") {
      grouped.push(
        <div key={`md-${i}`} className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
            {b.content}
          </ReactMarkdown>
        </div>,
      );
      i += 1;
      continue;
    }

    // 2) Code cell + coalesced outputs
    if (b.type === "code") {
      // collect outputs until next code/markdown or end
      const textParts: string[] = [];
      const htmlParts: string[] = [];
      const images: { src: string; alt?: string }[] = [];

      let j = i + 1;
      while (j < blocks.length && blocks[j].type !== "code" && blocks[j].type !== "markdown") {
        const ob = blocks[j] as Block;
        if (ob.type === "stdout") textParts.push(ob.content);
        else if (ob.type === "html") htmlParts.push(ob.content);
        else if (ob.type === "image") images.push({ src: ob.src, alt: ob.alt });
        j += 1;
      }

      grouped.push(<CodeBlock key={`code-${i}`} code={b.content} language="python" />);

      const hasOutputs = htmlParts.length || images.length || textParts.length;
      if (hasOutputs) {
        grouped.push(
          <div key={`out-${i}`} className="rounded-xl border bg-white p-3 space-y-3">
            {/* HTML outputs (tables, rich displays) */}
            {htmlParts.map((html, k) => {
              const safe = DOMPurify.sanitize(html);
              return (
                <div key={`html-${i}-${k}`} className="notebook-html overflow-x-auto">
                  <div dangerouslySetInnerHTML={{ __html: safe }} />
                </div>
              );
            })}

            {/* Images (plots) */}
            {images.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {images.map((im, k) => (
                  <figure key={`img-${i}-${k}`} className="rounded-lg border p-2">
                    <img src={im.src} alt={im.alt || "figure"} className="w-full" />
                    {im.alt && <figcaption className="mt-1 text-xs text-gray-500">{im.alt}</figcaption>}
                  </figure>
                ))}
              </div>
            )}

            {/* Text (all prints combined into one pre) */}
            {textParts.length > 0 && (
              <pre className="rounded-lg border bg-gray-50 p-3 text-xs overflow-x-auto">
                {textParts.join("\n\n")}
              </pre>
            )}
          </div>,
        );
      }

      i = j;
      continue;
    }

    // 3) Orphan outputs (rare) – render in a single card
    if (b.type === "stdout" || b.type === "html" || b.type === "image") {
      const textParts: string[] = [];
      const htmlParts: string[] = [];
      const images: { src: string; alt?: string }[] = [];

      // coalesce consecutive orphan outputs
      let j = i;
      while (j < blocks.length && blocks[j].type !== "code" && blocks[j].type !== "markdown") {
        const ob = blocks[j] as Block;
        if (ob.type === "stdout") textParts.push(ob.content);
        else if (ob.type === "html") htmlParts.push(ob.content);
        else if (ob.type === "image") images.push({ src: ob.src, alt: ob.alt });
        j += 1;
      }

      grouped.push(
        <div key={`orph-${i}`} className="rounded-xl border bg-white p-3 space-y-3">
          {htmlParts.map((html, k) => {
            const safe = DOMPurify.sanitize(html);
            return (
              <div key={`orph-html-${i}-${k}`} className="notebook-html overflow-x-auto">
                <div dangerouslySetInnerHTML={{ __html: safe }} />
              </div>
            );
          })}
          {images.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {images.map((im, k) => (
                <figure key={`orph-img-${i}-${k}`} className="rounded-lg border p-2">
                  <img src={im.src} alt={im.alt || "figure"} className="w-full" />
                </figure>
              ))}
            </div>
          )}
          {textParts.length > 0 && (
            <pre className="rounded-lg border bg-gray-50 p-3 text-xs overflow-x-auto">
              {textParts.join("\n\n")}
            </pre>
          )}
        </div>,
      );

      i = j;
      continue;
    }

    i += 1;
  }

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

      {open && <div className="space-y-4 border-t p-4">{grouped}</div>}
    </section>
  );
}
