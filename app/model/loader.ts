export type ModelManifest = {
    model_version: string;
    metrics: Record<string, string>;
    images: string[];
    notes?: string;
  };
  
  export async function loadManifest(version: string): Promise<ModelManifest> {
    const res = await fetch(`/data/model-${version}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Missing manifest for version ${version}`);
    return res.json();
  }
  