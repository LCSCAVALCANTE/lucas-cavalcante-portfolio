import { createFileRoute } from "@tanstack/react-router";
import { Mail, Linkedin, Github, MessageCircle, ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato - Lucas Cavalcante" },
      {
        name: "description",
        content: "Fale com Lucas Cavalcante - e-mail, LinkedIn, GitHub e WhatsApp.",
      },
      { property: "og:title", content: "Contato - Lucas Cavalcante" },
      {
        property: "og:description",
        content: "Vamos conversar sobre dados, automacao e dashboards.",
      },
    ],
  }),
  component: ContactPage,
});

const channels = [
  {
    label: "E-mail",
    value: profile.contact.email,
    href: `mailto:${profile.contact.email}`,
    icon: Mail,
    accent: "from-primary/30 to-primary/5 text-primary",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/lucascavalcante",
    href: profile.contact.linkedin,
    icon: Linkedin,
    accent: "from-cyan/30 to-cyan/5 text-cyan",
  },
  {
    label: "GitHub",
    value: "github.com/lucascavalcante",
    href: profile.contact.github,
    icon: Github,
    accent: "from-purple/30 to-purple/5 text-purple",
  },
  {
    label: "WhatsApp",
    value: "Enviar mensagem",
    href: profile.contact.whatsapp,
    icon: MessageCircle,
    accent: "from-emerald-500/30 to-emerald-500/5 text-emerald-300",
  },
] as const;

function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <div className="animate-fade-up">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
          Contato
        </div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
          Vamos <span className="gradient-text">conversar</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Aberto a novos projetos, colaboracoes e oportunidades em dados,
          automacao e desenvolvimento. Escolha o canal que preferir.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {channels.map((c, i) => {
          const Icon = c.icon;
          return (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="glass-card glow-hover animate-fade-up group flex items-center justify-between gap-4 rounded-2xl p-6"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${c.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-semibold">{c.label}</div>
                  <div className="truncate text-sm text-muted-foreground">{c.value}</div>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
            </a>
          );
        })}
      </div>

      <div className="mt-12 glass-card rounded-2xl p-6 text-center sm:p-10">
        <p className="font-display text-lg text-muted-foreground">
          "A melhor decisao nasce de um bom dado."
        </p>
        <p className="mt-2 font-mono text-xs text-primary">- {profile.name}</p>
      </div>
    </div>
  );
}
