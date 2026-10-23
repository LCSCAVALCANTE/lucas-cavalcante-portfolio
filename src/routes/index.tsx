import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Database,
  Github,
  Layers,
  LayoutDashboard,
  Linkedin,
  Mail,
  MessageCircle,
  Plug,
  Settings,
  Workflow,
} from "lucide-react";
import { profile, skills, experiences, education } from "@/data/profile";
import { projects } from "@/data/projects";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/")({
  component: Home,
});

const rotating = ["SQL e PostgreSQL", "Python e Node.js", "n8n e APIs", "React e dashboards"];

const services = [
  {
    icon: Database,
    tag: "Dados",
    title: "Dados & Dashboards",
    text: "ETL, SQL e painéis que transformam dados espalhados em uma visão única para decidir mais rápido.",
    chips: ["SQL", "PostgreSQL", "ETL", "Power BI", "Excel Avançado"],
    cta: "Ver painéis",
    to: "/projetos",
  },
  {
    icon: Workflow,
    tag: "Automação",
    title: "Automações & Integrações",
    text: "Fluxos com Python, Node.js e n8n que eliminam tarefas repetitivas e conectam sistemas via API, banco e webhooks.",
    chips: ["Python", "n8n", "Webhooks", "APIs", "MCP"],
    cta: "Ver exemplos",
    to: "/projetos",
  },
  {
    icon: Layers,
    tag: "Sistemas",
    title: "Aplicações Web Internas",
    text: "Soluções sob medida em React e Node.js, do levantamento ao deploy, com versionamento e manutenção em produção.",
    chips: ["React", "Node.js", "TypeScript", "Docker", "Git"],
    cta: "Ver exemplos",
    to: "/projetos",
  },
] as const;

const reasons = [
  { icon: Workflow, title: "Foco em Dados e Automação", text: "SQL, Python e n8n para transformar dados e rotinas manuais em fluxos automáticos." },
  { icon: LayoutDashboard, title: "Projetos em Produção", text: "Painéis de ocupação, propostas, comercial e estoque rodando no dia a dia da operação." },
  { icon: Settings, title: "Ponta a Ponta", text: "Da extração por API, ETL e banco de dados até o deploy em Docker e versionamento em Git." },
  { icon: Plug, title: "Integrações Conectadas", text: "APIs, webhooks, PostgreSQL, Redshift e Feegow falando entre si num único fluxo." },
];

const projectCategory: Record<string, string> = {
  "dashboard-ocupacao-agenda": "Dados & Dashboards",
  "painel-propostas-executadas": "Dados & Dashboards",
  "painel-comercial": "Dados & Dashboards",
  "gestor-de-estoque": "Sistemas",
  "esocial-analytics": "Automação",
  "insertvalue-feegow": "Automação",
};
const filters = ["Todos", "Dados & Dashboards", "Automação", "Sistemas"] as const;

const socials = [
  { label: "LinkedIn", href: profile.contact.linkedin, Icon: Linkedin },
  { label: "GitHub", href: profile.contact.github, Icon: Github },
  { label: "WhatsApp", href: profile.contact.whatsapp, Icon: MessageCircle },
];

function useTyped(words: string[]) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(words[0]);
      return;
    }
    let w = 0;
    let i = 0;
    let deleting = false;
    let id: number;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      setText(word.slice(0, i));
      let delay = deleting ? 35 : 80;
      if (!deleting && i === word.length) {
        deleting = true;
        delay = 1500;
      } else if (deleting && i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        delay = 350;
      }
      id = window.setTimeout(tick, delay);
    };
    id = window.setTimeout(tick, 400);
    return () => window.clearTimeout(id);
  }, [words]);
  return text;
}

function Home() {
  const typed = useTyped(rotating);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Todos");
  const photo = `${import.meta.env.BASE_URL}foto-lucas.webp`;
  const shown = projects.filter((p) => filter === "Todos" || projectCategory[p.id] === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-24">
        <div className="animate-fade-up flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Analista de Tecnologia · Dados, Automação e Integrações
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
            Dados, automação e <span className="text-primary">integrações</span> que entram em operação
          </h1>
          <p className="flex items-center gap-2 text-lg text-muted-foreground">
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Criando soluções com <span className="text-foreground">{typed}</span>
              <span className="ml-0.5 inline-block w-px animate-pulse bg-primary align-middle">&nbsp;</span>
            </span>
          </p>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            {profile.tagline} Atuo da extração dos dados à manutenção em produção, com automações, dashboards,
            integrações via API e aplicações web internas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/projetos"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/70 transition hover:brightness-110"
            >
              Ver meus projetos <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-semibold transition hover:border-primary/60"
            >
              <Mail className="h-4 w-4" /> Entrar em contato
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            Me encontre:
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary/60 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="animate-fade-in relative mx-auto w-full max-w-sm lg:max-w-md" style={{ animationDelay: "180ms" }}>
          <div className="absolute inset-6 -z-10 rounded-full border border-primary/20" />
          <div className="absolute -inset-4 -z-10 rounded-full border border-primary/10" />
          <span className="absolute -left-4 top-10 z-10 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-lg">SQL</span>
          <span className="absolute -right-3 top-1/2 z-10 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-lg">n8n</span>
          <div className="rotate-2 rounded-3xl border border-border bg-card p-3 shadow-[0_30px_80px_-30px] shadow-primary/40 transition-transform duration-500 hover:rotate-0">
            <div className="mb-3 flex items-center justify-between px-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Analista de Tecnologia</span>
            </div>
            <img
              src={photo}
              alt={`Foto de ${profile.name}`}
              width={1254}
              height={1254}
              className="aspect-square w-full rounded-2xl object-cover object-top"
            />
            <div className="flex items-center justify-between px-2 pb-1 pt-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">Dados & Automação</div>
                <div className="font-display text-lg font-semibold">{profile.name}</div>
              </div>
              <Link
                to="/"
                hash="sobre"
                aria-label="Sobre mim"
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="scroll-mt-24 py-14 sm:py-20">
        <Heading eyebrow="Minhas expertises" title="Soluções para processos" accent="reais" sub="Do dado bruto à solução rodando em produção." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map(({ icon: Icon, tag, title, text, chips, cta, to }) => (
            <article key={title} className="glass-card glow-hover flex flex-col rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span>
                <span className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">{tag}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span key={c} className="rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground">{c}</span>
                ))}
              </div>
              <Link to={to} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary">
                {cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Forma de trabalhar */}
      <section className="py-14 sm:py-20">
        <Heading eyebrow="Na prática" title="Tecnologia em" accent="produção" sub="Projetos reais construídos com Python, SQL, n8n, React e Docker." />
        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="relative rounded-2xl border border-border bg-card/80 px-6 pb-7 pt-9 text-center shadow-[var(--shadow-card)]">
              <span className="absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                0{i + 1}
              </span>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/25 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              {i < reasons.length - 1 && (
                <span className="absolute -right-8 top-[8.1rem] hidden h-1 w-8 bg-primary lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Projetos */}
      <section id="projetos" className="scroll-mt-24 py-14 sm:py-20">
        <Heading eyebrow="Portfólio" title="Meus" accent="projetos" sub="Painéis, automações e sistemas em produção." />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {shown.map((p) => (
            <Link key={p.id} to="/projetos/$id" params={{ id: p.id }} className="glass-card glow-hover group flex flex-col rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">{projectCategory[p.id]}</span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.shortDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.technologies.slice(0, 5).map((t) => (
                  <span key={t} className="rounded-md border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground">{t}</span>
                ))}
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary">
                Ver detalhes <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/projetos" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:border-primary/60">
            Ver todos os projetos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Ferramentas */}
      <section className="py-10">
        <div className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">Ferramentas que utilizo</div>
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-3">
            {[...skills, ...skills].map((s, i) => (
              <span key={s.name + i} className="whitespace-nowrap rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground">{s.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="scroll-mt-24 py-14 sm:py-20">
        <Heading eyebrow="Sobre" title="Quem é o" accent="Lucas?" />
        <div className="glass-card mt-10 rounded-2xl p-6 sm:p-10">
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground sm:text-lg">{profile.about}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { k: "+5", v: "Anos com dados" },
              { k: "+30", v: "Dashboards" },
              { k: "+15", v: "Automações" },
              { k: "100%", v: "Foco em resultado" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-border bg-background/40 p-4">
                <div className="font-display text-2xl font-bold gradient-text">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Timeline title="Experiência" items={experiences.map((e) => ({ key: e.role + e.period, when: e.period, head: e.role, sub: e.company, text: e.description }))} />
          <Timeline title="Formação & Cursos" items={education.map((e) => ({ key: e.course, when: e.period, head: e.course, sub: e.institution, text: "duration" in e ? e.duration : undefined }))} />
        </div>
      </section>

      {/* Contato */}
      <section className="py-14 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold sm:text-4xl">
            Vamos <span className="text-primary">conversar?</span>
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground">
            Dados, automação, integrações ou um projeto que você queira trocar ideia? Me chame.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contato" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px] shadow-primary/70 transition hover:brightness-110">
              Entrar em contato <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={`mailto:${profile.contact.email}`} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:border-primary/60">
              <Mail className="h-4 w-4" /> {profile.contact.email}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Heading({ eyebrow, title, accent, sub }: { eyebrow: string; title: string; accent: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="font-display text-3xl font-bold sm:text-4xl">
        {title} <span className="text-primary">{accent}</span>
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Timeline({ title, items }: { title: string; items: { key: string; when: string; head: string; sub: string; text?: string }[] }) {
  return (
    <div>
      <div className="mb-4 font-display text-lg font-semibold">{title}</div>
      <ol className="relative space-y-4 border-l border-border pl-6">
        {items.map((e) => (
          <li key={e.key} className="relative">
            <span className="absolute -left-[29px] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
            <div className="glass-card rounded-xl p-4">
              <div className="font-mono text-xs text-primary">{e.when}</div>
              <div className="mt-1 font-display font-semibold">{e.head}</div>
              <div className="text-sm text-muted-foreground">{e.sub}</div>
              {e.text && <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
