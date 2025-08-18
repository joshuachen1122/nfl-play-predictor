import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <div className="flex gap-4">
            <a href={site.social.github} className="hover:underline">GitHub</a>
            <a href={site.social.x} className="hover:underline">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}