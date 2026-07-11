import { createFileRoute } from "@tanstack/react-router";
import { Github, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { education, experiences, profile, skills } from "@/data/profile";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Editor - Lucas Cavalcante" },
      {
        name: "description",
        content: "Editor de textos do portfolio.",
      },
    ],
  }),
  component: AdminPage,
});

const repo = {
  owner: "LCSCAVALCANTE",
  name: "lucas-cavalcante-portfolio",
  branch: "main",
  path: "src/data/profile.ts",
};

function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("portfolio_github_token") ?? "");
  const [form, setForm] = useState({
    name: profile.name,
    title: profile.title,
    tagline: profile.tagline,
    about: profile.about,
    email: profile.contact.email,
    linkedin: profile.contact.linkedin,
    github: profile.contact.github,
    whatsapp: profile.contact.whatsapp,
  });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => buildProfileFile(form), [form]);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveToGithub() {
    if (!token.trim()) {
      setStatus("Cole um token do GitHub antes de salvar.");
      return;
    }

    setSaving(true);
    setStatus("Buscando arquivo no GitHub...");
    localStorage.setItem("portfolio_github_token", token.trim());

    try {
      const url = `https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${repo.path}?ref=${repo.branch}`;
      const current = await fetch(url, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!current.ok) {
        throw new Error(`Nao consegui ler o arquivo no GitHub. Status ${current.status}. Confira se o repositorio esta publico e se o caminho existe.`);
      }

      const currentJson = await current.json();
      setStatus("Salvando alteracoes no GitHub...");

      const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${repo.path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: "Update portfolio profile from admin editor",
          content: toBase64(preview),
          sha: currentJson.sha,
          branch: repo.branch,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          throw new Error("Token sem permissao para salvar. Crie um token fine-grained com acesso ao repositorio LCSCAVALCANTE/lucas-cavalcante-portfolio e permissao Contents: Read and write.");
        }
        throw new Error(error.message ?? `Nao consegui salvar no GitHub. Status ${response.status}.`);
      }

      setStatus("Salvo no GitHub. A Lovable deve atualizar quando sincronizar o repositorio.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div className="mb-8">
        <div className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">Editor</div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Editar textos do <span className="gradient-text">portfolio</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Altere os campos abaixo e salve direto no GitHub. Use um token fine-grained com permissao de leitura/escrita
          em Contents para este repositorio. O token fine-grained normalmente comeca com github_pat_.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="grid gap-4">
            <Field label="Nome">
              <input value={form.name} onChange={(event) => update("name", event.target.value)} className="editor-input" />
            </Field>
            <Field label="Titulo profissional">
              <input value={form.title} onChange={(event) => update("title", event.target.value)} className="editor-input" />
            </Field>
            <Field label="Texto principal">
              <textarea value={form.tagline} onChange={(event) => update("tagline", event.target.value)} className="editor-textarea" rows={3} />
            </Field>
            <Field label="Sobre mim">
              <textarea value={form.about} onChange={(event) => update("about", event.target.value)} className="editor-textarea" rows={7} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mail">
                <input value={form.email} onChange={(event) => update("email", event.target.value)} className="editor-input" />
              </Field>
              <Field label="WhatsApp">
                <input value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} className="editor-input" />
              </Field>
              <Field label="LinkedIn">
                <input value={form.linkedin} onChange={(event) => update("linkedin", event.target.value)} className="editor-input" />
              </Field>
              <Field label="GitHub">
                <input value={form.github} onChange={(event) => update("github", event.target.value)} className="editor-input" />
              </Field>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2 font-display font-semibold">
              <Github className="h-4 w-4 text-primary" />
              Publicar
            </div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              GitHub token
            </label>
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="editor-input mt-2"
              placeholder="github_pat_..."
            />
            <button
              type="button"
              disabled={saving}
              onClick={saveToGithub}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-purple px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar no GitHub"}
            </button>
            {status && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{status}</p>}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="mb-3 font-display font-semibold">Previa textual</div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">Nome</div>
                <div className="text-foreground">{form.name}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">Titulo</div>
                <div>{form.title}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-primary">Texto principal</div>
                <div>{form.tagline}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function buildProfileFile(form: {
  name: string;
  title: string;
  tagline: string;
  about: string;
  email: string;
  linkedin: string;
  github: string;
  whatsapp: string;
}) {
  const nextProfile = {
    name: form.name,
    title: form.title,
    tagline: form.tagline,
    about: form.about,
    contact: {
      email: form.email,
      linkedin: form.linkedin,
      github: form.github,
      whatsapp: form.whatsapp,
    },
  };

  return `export const profile = ${JSON.stringify(nextProfile, null, 2)};

export const skills = ${JSON.stringify(skills, null, 2)};

export const experiences = ${JSON.stringify(experiences, null, 2)};

export const education = ${JSON.stringify(education, null, 2)};
`;
}

function toBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}
