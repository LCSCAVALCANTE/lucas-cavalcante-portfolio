import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { projects } from "@/data/projects";
import { StatusBadge } from "@/components/StatusBadge";
import { projectPreviews } from "@/components/previews";
import { NavigationBurst } from "@/components/NavigationBurst";
import DottedBg2 from "@/components/DottedBg2";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos - Lucas Cavalcante" },
      {
        name: "description",
        content:
          "Uma seleção de soluções, dashboards, automações e sistemas que desenvolvi para transformar dados em decisões e otimizar processos.",
      },
      { property: "og:title", content: "Projetos - Lucas Cavalcante" },
      {
        property: "og:description",
        content: "Portfólio de projetos em dados, automação e desenvolvimento.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const [burst, setBurst] = useState<BurstState | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  function openProject(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setBurst({ x, y, key: Date.now() });
    timerRef.current = window.setTimeout(() => {
      navigate({ to: "/projetos/$id", params: { id } });
    }, reduceMotion ? 60 : 520);
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <DottedBg2
          bgColor="#080D16"
          colors={["#38BDF899", "#60A5FA99", "#A78BFA99"]}
          frequency={2}
          speed={4}
          cellSize={1}
          gamma={5}
          paletteBias={-1}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
        {burst && <NavigationBurst key={burst.key} x={burst.x} y={burst.y} />}
      <div className="animate-fade-up">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
          Portfólio
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
          Meus <span className="gradient-text">Projetos</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Uma seleção de soluções, dashboards, automações e sistemas que desenvolvi para transformar dados em decisões e otimizar processos.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <article
            key={p.id}
            className="glass-card glow-hover animate-fade-up group flex flex-col rounded-2xl p-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-purple/20 text-primary">
                <span className="font-mono text-xs font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <h3 className="font-display text-lg font-semibold leading-tight">
              {p.name}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {p.shortDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.technologies.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border/60 bg-background/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/50 pt-4">
              <Link
                to="/projetos/$id"
                params={{ id: p.id }}
                onClick={(event) => openProject(event, p.id)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-cyan"
              >
                Ver detalhes
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              {projectPreviews[p.id] && (
                <Link
                  to="/projetos/$id"
                  params={{ id: p.id }}
                  hash="previa"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="Ver prévia"
                  title="Ver prévia"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              )}
            </div>
          </article>
        ))}
        </div>
      </div>
    </div>
  );
}

interface BurstState {
  x: number;
  y: number;
  key: number;
}
