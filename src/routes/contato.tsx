import { createElement, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/profile";
import DottedBg2 from "@/components/DottedBg2";

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
    lottie: "https://lottie.host/f196ea15-613b-4f76-a4e3-6246e4f4afaa/JFImcWkfhu.lottie",
    speed: "1",
    accent: "from-primary/30 to-primary/5",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/lucascavalcante",
    href: profile.contact.linkedin,
    lottie: "https://lottie.host/a25ddb48-5c10-4425-932e-5aacea8ea9b8/T1RPRbwrBs.lottie",
    speed: "0.55",
    accent: "from-cyan/30 to-cyan/5",
  },
  {
    label: "GitHub",
    value: "github.com/LCSCAVALCANTE",
    href: profile.contact.github,
    lottie: "https://lottie.host/9d5079c5-b731-4a94-9b62-a6982f6c9e1b/oIYyaAcIW4.lottie",
    speed: "1",
    accent: "from-purple/30 to-purple/5",
  },
  {
    label: "WhatsApp",
    value: "Enviar mensagem",
    href: profile.contact.whatsapp,
    lottie: "https://lottie.host/e4d5f2e3-60c5-4ed1-ba31-a2d035b6ada5/bj4zKfvMCu.lottie",
    speed: "1",
    accent: "from-emerald-500/30 to-emerald-500/5",
  },
] as const;

function Lottie({ src, speed = "1", className }: { src: string; speed?: string; className?: string }) {
  return createElement("dotlottie-wc", {
    src,
    speed,
    autoplay: true,
    loop: true,
    class: className,
  });
}

function ContactPage() {
  useEffect(() => {
    if (document.querySelector('script[data-dotlottie-wc="true"]')) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.4/dist/dotlottie-wc.js";
    script.dataset.dotlottieWc = "true";
    document.head.appendChild(script);
  }, []);

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden">
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

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <div className="copy-panel relative min-h-[320px] overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="relative z-10 max-w-[580px] lg:pr-[17rem]">
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
              Contato
            </div>
            <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
              Vamos <span className="gradient-text">conversar</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Aberto a novos projetos, colaborações e oportunidades em dados,
              automação e desenvolvimento. Escolha o canal que preferir.
            </p>
          </div>

          <div className="pointer-events-none absolute right-5 top-1/2 hidden h-[280px] w-[280px] -translate-y-1/2 place-items-center lg:grid">
            <Lottie
              src="https://lottie.host/ce7deb8b-4adf-4d0d-9e32-f9fc1e8ac0a0/EvmqLzQGm6.lottie"
              className="h-[280px] w-[280px]"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {channels.map((c, i) => {
            const isGitHub = c.label === "GitHub";

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
                  <div
                    className={
                      isGitHub
                        ? "grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white"
                        : `grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${c.accent}`
                    }
                  >
                    <Lottie
                      src={c.lottie}
                      speed={c.speed}
                      className="h-12 w-12"
                    />
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
      </div>
    </div>
  );
}
