import { ReactNode } from "react";

export function FeatureCard({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm transition hover:shadow">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <div className="prose prose-sm">{children}</div>
    </div>
  );
}