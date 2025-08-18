export type StepsManifest = {
    model_version: string;
    steps: {
      index: number;
      title: string;
      markdown?: string;
      blocks: Array<
        | { type: "code"; language?: "python"; content: string }
        | { type: "stdout"; content: string }
        | { type: "image"; src: string; alt?: string }
      >;
    }[];
  };
  
  export async function loadSteps(version: string): Promise<StepsManifest> {
    const res = await fetch(`/data/model-${version}-steps.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Missing steps for version ${version}`);
    return res.json();
  }
  