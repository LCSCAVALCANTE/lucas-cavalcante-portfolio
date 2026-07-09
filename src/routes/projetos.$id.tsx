import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Github, ExternalLink, Target, TrendingUp, Wrench } from "lucide-react";
import { projects } from "@/data/projects";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/projetos/$id")({
  head: ({ params }) => {
    const p = projects.find((x) => x.id === params.id);
    const title = p ? `${p.name} - Lucas Cavalcante` : "Projeto nao encontrado";
    const description = p?.shortDescription ?? "Projeto do portfolio de Lucas Cavalcante.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) throw notFound();
    return { project };
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectDetail,
});

function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Projeto nao encontrado</h1>
      <p className="mt-2 text-muted-foreground">Este projeto pode ter sido removido ou movido.</p>
      <Link to="/projetos" className="mt-6 inline-flex items-center gap-2 text-primary hover:text-cyan">
        <ArrowLeft className="h-4 w-4" /> Voltar aos projetos
      </Link>
    </div>
  );
}

function ProjectDetail() {
  const { project } = Route.useLoaderData();

  return (
    <article className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <Link
        to="/projetos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos projetos
      </Link>

      <header className="mt-6 animate-fade-up">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <StatusBadge status={project.status} />
          <span className="font-mono text-xs text-muted-foreground">
            {project.technologies.length} tecnologias
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
          {project.name}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {project.fullDescription}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-purple px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <ExternalLink className="h-4 w-4" /> Ver demonstracao
            </a>
          )}
        </div>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<Target className="h-4 w-4" />} title="Problema" color="text-cyan">
          {project.problem}
        </InfoCard>
        <InfoCard icon={<TrendingUp className="h-4 w-4" />} title="Resultados" color="text-emerald-300">
          {project.results}
        </InfoCard>
      </div>

      <section className="mt-10 glass-card rounded-2xl p-6">
        <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-purple">
          <Wrench className="h-4 w-4" />
          Tecnologias utilizadas
        </div>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((t: string) => (
            <span
              key={t}
              className="rounded-md border border-border bg-background/40 px-3 py-1 font-mono text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
          Previa
        </div>
        <div className="glass-card grid aspect-video place-items-center rounded-2xl border-dashed text-sm text-muted-foreground">
          Prints e imagens do projeto aparecerao aqui.
        </div>
      </section>
    </article>
  );
}

function InfoCard({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className={`mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest ${color}`}>
        {icon}
        {title}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
