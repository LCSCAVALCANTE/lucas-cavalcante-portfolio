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
    lottie: "https://lottie.host/2433a92b-66b2-4e0c-8293-2595eba27c19/qv01aQwHYt.lottie",
    speed: "1",
    accent: "from-primary/30 to-primary/5",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/lucascavalcante",
    href: profile.contact.linkedin,
    lottie: "https://lottie.host/f22fd347-f68d-4f1f-9f16-cbf6fbc28e79/MB5jGr9s8i.lottie",
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
                        ? "grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border border-white/[0.06] bg-white/[0.04] text-purple transition-transform duration-200 group-hover:scale-105 group-hover:bg-white/[0.08]"
                        : `grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${c.accent}`
                    }
                  >
                    {isGitHub ? (
                      <svg
                        viewBox="0 0 98 96"
                        fill="currentColor"
                        aria-hidden="true"
                        className="h-9 w-9"
                      >
                        <path
                          d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.22-22.221-5.468-22.221-24.272 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                        />
                      </svg>
                    ) : (
                      <Lottie src={c.lottie} speed={c.speed} className="h-12 w-12" />
                    )}
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
