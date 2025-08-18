"use client";
import { Highlight, themes } from "prism-react-renderer";
import type { Language } from "prism-react-renderer";

export function CodeBlock({
  code,
  language = "python",
}: {
  code: string;
  language?: Language;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-3 text-sm overflow-x-auto">
      <Highlight code={code} language={language} theme={themes.github}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} m-0`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
