import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Mail, Sparkles, Briefcase, GraduationCap, Database, Rocket, ShieldCheck } from "lucide-react";
import { profile, skills, experiences, education } from "@/data/profile";
import { NavigationBurst } from "@/components/NavigationBurst";
import DottedBg2 from "@/components/DottedBg2";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number; key: number } | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  function openProjects(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBurst({ x, y, key: Date.now() });
    timerRef.current = window.setTimeout(() => navigate({ to: "/projetos" }), reduceMotion ? 60 : 520);
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
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {burst && <NavigationBurst key={burst.key} x={burst.x} y={burst.y} />}
      <section className="relative grid gap-12 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
        <div className="copy-panel animate-fade-up flex flex-col gap-5 p-5 sm:p-7 lg:gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1.5 font-mono text-xs text-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            {profile.title}
          </span>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Olá, sou <span className="gradient-text">{profile.name}</span>
          </h1>
          <div className="h-1 w-20 rounded-full bg-gradient-to-r from-primary to-purple" />
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {profile.tagline}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              to="/projetos"
              onClick={openProjects}
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
        <div className="animate-fade-in lg:pl-8" style={{ animationDelay: "180ms" }}>
          <div className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">Perfil técnico</span>
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Em produção</span>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3 rounded-xl border border-border/60 bg-background/40 p-3"><Database className="mt-0.5 h-5 w-5 shrink-0 text-cyan" /><div><div className="font-semibold">Dados que viram decisão</div><p className="mt-1 text-sm text-muted-foreground">ETL, SQL, dashboards e análises para orientar o negócio.</p></div></div>
                <div className="flex gap-3 rounded-xl border border-border/60 bg-background/40 p-3"><Rocket className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><div className="font-semibold">Soluções que entram em operação</div><p className="mt-1 text-sm text-muted-foreground">Integrações, deploy, versionamento e manutenção contínua.</p></div></div>
                <div className="flex gap-3 rounded-xl border border-border/60 bg-background/40 p-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple" /><div><div className="font-semibold">Segurança na medida certa</div><p className="mt-1 text-sm text-muted-foreground">Acesso por unidade, controle e confiabilidade para cada contexto.</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="sobre" eyebrow="01 - Sobre" title="Sobre mim" icon={<Sparkles className="h-4 w-4" />}>
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

      <Section eyebrow="02 - Stack" title="Habilidades">
        <p className="copy-panel mb-8 max-w-2xl px-5 py-4 text-base leading-relaxed text-muted-foreground">Da extração dos dados à manutenção da solução em produção: tecnologia aplicada para resolver problemas reais.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {['Dados', 'Ingestão de dados', 'Integração', 'Desenvolvimento', 'Entrega'].map((category) => (
            <div key={category} className="glass-card rounded-2xl p-5">
              <div className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">{category}</div>
              <div className="flex flex-wrap gap-2">{skills.filter((s) => s.category === category).map((s) => <span key={s.name} className="rounded-lg border border-border/60 bg-background/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">{s.name}</span>)}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="03 - Trajetória" title="Currículo">
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
          </div>
        </div>
        </Section>
      </div>
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
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white text-eyebrow-shadow">
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
