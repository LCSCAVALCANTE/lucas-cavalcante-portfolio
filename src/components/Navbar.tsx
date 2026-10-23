import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Início", exact: true },
  { to: "/", hash: "servicos", label: "Serviços" },
  { to: "/projetos", label: "Projetos" },
  { to: "/", hash: "sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

const linkClass = "relative px-3 py-2 text-sm font-medium transition-colors hover:text-foreground";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="font-display text-lg font-bold tracking-tight" onClick={close}>
          Lucas Cavalcante<span className="text-primary">.</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={"hash" in l ? l.hash : undefined}
              activeOptions={{ exact: true }}
              activeProps={"hash" in l ? undefined : { className: "text-primary after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary" }}
              inactiveProps={"hash" in l ? undefined : { className: "text-muted-foreground" }}
              className={`${linkClass} ${"hash" in l ? "text-muted-foreground" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/contato"
            className="hidden rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px] shadow-primary/60 transition hover:brightness-110 sm:inline-flex"
          >
            Fale Comigo
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background/95 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                hash={"hash" in l ? l.hash : undefined}
                activeOptions={{ exact: true }}
                activeProps={"hash" in l ? undefined : { className: "text-primary bg-accent/60" }}
                inactiveProps={"hash" in l ? undefined : { className: "text-muted-foreground" }}
                onClick={close}
                className={`rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent/40 hover:text-foreground ${"hash" in l ? "text-muted-foreground" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contato"
              onClick={close}
              className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Fale Comigo
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
