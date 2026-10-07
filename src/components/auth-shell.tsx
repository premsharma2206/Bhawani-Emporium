const POINTS = [
  "Your cart is saved between visits",
  "Delivery details filled in at checkout",
  "Every order and its status in one place",
];

/** Two-panel frame for the login and signup pages: shop blurb on the left, form on the right. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card my-auto grid w-full max-w-4xl animate-rise self-center overflow-hidden md:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between gap-5 border-r border-line p-5 md:flex">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(28rem_20rem_at_0%_0%,rgb(246_196_83/0.22),transparent_65%),radial-gradient(24rem_18rem_at_100%_100%,rgb(94_234_212/0.14),transparent_65%)]"
        />
        <div className="relative">
          <p className="eyebrow">Bhawani Emporium</p>
          <p className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight">
            Handicrafts, gifts and <span className="text-gradient">novelties</span>
          </p>
        </div>
        <ul className="relative space-y-3 text-sm text-ink-soft">
          {POINTS.map((point) => (
            <li key={point} className="flex items-center gap-3">
              <span className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
              {point}
            </li>
          ))}
        </ul>
      </aside>
      <div className="p-4 sm:p-5">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 mb-3 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
