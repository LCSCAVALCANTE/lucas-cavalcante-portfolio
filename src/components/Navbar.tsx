import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteLogoDataUrl } from "@/data/site-logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/projetos", label: "Projetos" },
  { to: "/contato", label: "Contato" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-black p-[2px] shadow-lg">
            <img
              src={siteLogoDataUrl}
              alt="Logo Lucas Cavalcante"
              className="h-full w-full rounded-full object-cover"
            />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight sm:text-base">
            Lucas Cavalcante
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground bg-accent/60" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-foreground hover:bg-accent/40"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-accent md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/50 bg-background/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-foreground bg-accent/60" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="rounded-md px-3 py-3 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
