import type { ProjectStatus } from "@/data/projects";

const styles: Record<ProjectStatus, string> = {
  Concluido: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  "Em andamento": "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Prototipo: "bg-purple/10 text-purple border-purple/30",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
