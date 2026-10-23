import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import { profile } from "@/data/profile";

const socials = [
  { label: "E-mail", href: `mailto:${profile.contact.email}`, Icon: Mail },
  { label: "LinkedIn", href: profile.contact.linkedin, Icon: Linkedin },
  { label: "GitHub", href: profile.contact.github, Icon: Github },
  { label: "WhatsApp", href: profile.contact.whatsapp, Icon: MessageCircle },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border sm:mt-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-display text-lg font-bold">
            {profile.name}<span className="text-primary">.</span>
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Dados · Automação · Integrações. Soluções internas que entram em operação.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Links rápidos</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Início</Link></li>
            <li><Link to="/projetos" className="hover:text-foreground">Projetos</Link></li>
            <li><Link to="/contato" className="hover:text-foreground">Contato</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Redes sociais</div>
          <div className="flex items-center gap-2">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {year} {profile.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
