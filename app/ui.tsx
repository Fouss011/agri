import Link from "next/link";

export function Card({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
      {subtitle && <p className="mt-1 text-sm text-slate-700">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
        "text-slate-900 placeholder:text-slate-400",
        "outline-none",
        "focus:ring-4 focus:ring-slate-200 focus:border-slate-300",
        props.className || "",
      ].join(" ")}
    />
  );
}


export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition border";
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
      : variant === "danger"
      ? "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <button {...props} className={[base, styles, props.className || ""].join(" ")}>
      {children}
    </button>
  );
}

export function TopBar({
  left,
  right,
  title,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {left}
        {title && <div className="text-lg font-semibold">{title}</div>}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-slate-700 hover:underline">
      {children}
    </Link>
  );
}
