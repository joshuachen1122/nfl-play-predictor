import Link from "next/link";
import { FeatureCard } from "@/components/FeatureCard";

export default function Page() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">NFL Play Predictor</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Static showcase for my rush vs. pass model—what it is, how it was built, and how it performs.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/model"
            className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90"
          >
            See the Model
          </Link>
          <Link
            href="/methodology"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            Methodology
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard title="Clean Architecture">
          <p>Next.js + Tailwind. Easy to scale later with API, DB, and auth.</p>
        </FeatureCard>
        <FeatureCard title="Performance">
          <p>Static pages served via CDN. Instant nav, SEO-friendly.</p>
        </FeatureCard>
        <FeatureCard title="Extensible">
          <p>Drop in a FastAPI backend later without refactoring the UI.</p>
        </FeatureCard>
      </section>
    </div>
  );
}