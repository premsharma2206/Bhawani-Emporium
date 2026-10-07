import Link from "next/link";
import { CRAFT_LINES, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-6 border-t border-line bg-bg/60 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 text-sm sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-base font-semibold text-ink">
            Bhawani <span className="text-gradient">Emporium</span>
          </p>
          <p className="mt-1 max-w-xs text-muted">
            {SITE.tagline}. {SITE.blurb}
          </p>
        </div>
        <nav aria-label="Shop">
          <p className="text-xs tracking-widest text-faint uppercase">Shop</p>
          <ul className="mt-2 space-y-1.5 text-ink-soft">
            <li>
              <Link href="/products" className="transition hover:text-accent">
                All products
              </Link>
            </li>
            {CRAFT_LINES.map((line) => (
              <li key={line.query}>
                <Link
                  href={`/products?q=${encodeURIComponent(line.query)}`}
                  className="transition hover:text-accent"
                >
                  {line.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-xs tracking-widest text-faint uppercase">Follow</p>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-ink-soft transition hover:text-accent"
          >
            <InstagramIcon className="size-4" />@{SITE.instagramHandle}
          </a>
          <p className="mt-1.5">
            <Link href="/account" className="text-ink-soft transition hover:text-accent">
              Your account
            </Link>
          </p>
        </div>
      </div>
      <p className="border-t border-line py-3 text-center text-xs text-faint">
        © {new Date().getFullYear()} {SITE.name}. {SITE.tagline}.
      </p>
    </footer>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
