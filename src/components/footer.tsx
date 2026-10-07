import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-6 border-t border-line bg-bg/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-sm text-muted">
        <div>
          <p className="font-display text-base font-semibold text-ink">
            Bhawani <span className="text-gradient">Emporium</span>
          </p>
          <p className="mt-0.5 text-xs text-faint">
            © {new Date().getFullYear()} · Handicrafts, gifts and novelties.
          </p>
        </div>
        <nav className="flex gap-5">
          <Link href="/products" className="transition hover:text-accent">
            Products
          </Link>
          <Link href="/account" className="transition hover:text-accent">
            Account
          </Link>
        </nav>
      </div>
    </footer>
  );
}
