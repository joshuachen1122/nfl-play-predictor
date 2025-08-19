export type StepsManifest = {
  model_version: string;
  steps: {
    index: number;
    title: string;
    blocks: Array<
      | { type: "markdown"; content: string }
      | { type: "code"; language?: "python"; content: string }
      | { type: "stdout"; content: string }
      | { type: "image"; src: string; alt?: string }
      | { type: "html"; content: string }
    >;
  }[];
};

const H_RE = /^<h([12])[^>]*>(.*?)<\/h\1>\s*/i;
const STRIP_TAGS = /<[^>]+>/g;

function splitOnHeadings(data: StepsManifest): StepsManifest {
  if (!data.steps?.length) return data;
  if (data.steps.length > 1) return data; // already split

  const only = data.steps[0];
  const newSteps: StepsManifest["steps"] = [];
  let cur: (typeof newSteps)[number] | null = null;

  for (const b of only.blocks) {
    if (b.type === "markdown") {
      const text = (b.content || "").trim();
      const m = text.match(H_RE);
      if (m) {
        const title = (m[2] || "").replace(STRIP_TAGS, "").trim() || "Section";
        cur = { index: newSteps.length + 1, title, blocks: [] };
        newSteps.push(cur);
        const rest = text.replace(H_RE, "").trim();
        if (rest) cur.blocks.push({ type: "markdown", content: rest });
        continue;
      }
    }
    if (!cur) {
      cur = { index: 1, title: "Prologue", blocks: [] };
      newSteps.push(cur);
    }
    cur.blocks.push(b as any);
  }

  newSteps.forEach((s, i) => (s.index = i + 1));
  return { ...data, steps: newSteps };
}

export async function loadSteps(version: string): Promise<StepsManifest> {
  const res = await fetch(`/data/model-${version}-steps.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Missing steps for version ${version}`);
  const raw = (await res.json()) as StepsManifest;
  return splitOnHeadings(raw);
}