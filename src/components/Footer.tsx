import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";
import { profile } from "@/data/profile";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border/50 sm:mt-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-7 sm:flex-row sm:px-6 sm:py-8">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          © {year} {profile.name}. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-2">
          <a href={`mailto:${profile.contact.email}`} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="E-mail">
            <Mail className="h-4 w-4" />
          </a>
          <a href={profile.contact.linkedin} target="_blank" rel="noreferrer" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="LinkedIn">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href={profile.contact.github} target="_blank" rel="noreferrer" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="GitHub">
            <Github className="h-4 w-4" />
          </a>
          <a href={profile.contact.whatsapp} target="_blank" rel="noreferrer" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="WhatsApp">
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
