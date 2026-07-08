import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Mail, Sparkles, Briefcase, GraduationCap } from "lucide-react";
import { profile, skills, experiences, education } from "@/data/profile";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* HERO */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Disponível para novos projetos
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Olá, sou <span className="gradient-text">{profile.name}</span>
          </h1>
          <p className="mt-4 font-mono text-sm text-primary sm:text-base">
            {profile.title}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {profile.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/projetos"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-purple px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Ver Projetos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              <Mail className="h-4 w-4" />
              Entrar em contato
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <Section id="sobre" eyebrow="01 — Sobre" title="Sobre mim" icon={<Sparkles className="h-4 w-4" />}>
        <div className="glass-card rounded-2xl p-6 sm:p-10">
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {profile.about}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { k: "+5", v: "Anos com dados" },
              { k: "+30", v: "Dashboards" },
              { k: "+15", v: "Automações" },
              { k: "100%", v: "Foco em resultado" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="font-display text-2xl font-bold gradient-text">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* HABILIDADES */}
      <Section eyebrow="02 — Stack" title="Habilidades">
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <span
              key={s.name}
              className="glass-card glow-hover animate-fade-up rounded-full px-4 py-2 text-sm font-medium"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="mr-2 font-mono text-xs text-primary">{"</>"}</span>
              {s.name}
            </span>
          ))}
        </div>
      </Section>

      {/* CURRÍCULO */}
      <Section eyebrow="03 — Trajetória" title="Currículo">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              Experiência
            </div>
            <ol className="relative space-y-4 border-l border-border/60 pl-6">
              {experiences.map((e) => (
                <li key={e.role + e.period} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-primary to-purple ring-4 ring-background" />
                  <div className="glass-card rounded-xl p-4">
                    <div className="font-mono text-xs text-primary">{e.period}</div>
                    <div className="mt-1 font-display font-semibold">{e.role}</div>
                    <div className="text-sm text-muted-foreground">{e.company}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <GraduationCap className="h-4 w-4 text-purple" />
              Formação & Cursos
            </div>
            <ol className="relative space-y-4 border-l border-border/60 pl-6">
              {education.map((e) => (
                <li key={e.course} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-purple to-cyan ring-4 ring-background" />
                  <div className="glass-card rounded-xl p-4">
                    <div className="font-mono text-xs text-purple">{e.period}</div>
                    <div className="mt-1 font-display font-semibold">{e.course}</div>
                    <div className="text-sm text-muted-foreground">{e.institution}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                aria-label="Baixar currículo"
              >
                <Download className="h-4 w-4" />
                Baixar currículo (PDF)
              </a>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  icon,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-16 sm:py-20">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          {icon}
          {eyebrow}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <h2 className="mb-8 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {children}
    </section>
  );
}
