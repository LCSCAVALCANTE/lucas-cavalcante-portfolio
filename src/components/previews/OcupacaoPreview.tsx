import { Users, Building2, CalendarDays, Sparkles } from "lucide-react";

// Preview ilustrativo do "Dashboard de Ocupacao de Agenda".
// Todos os nomes, unidades e numeros abaixo sao FICTICIOS - servem apenas
// para reproduzir a linguagem visual do painel real (KPIs, filtros por
// aba, tabela por profissional e assistente de IA embutido).

const kpis = [
  { label: "Ocupacao geral", value: "84%", hint: "+5pp vs. mes anterior" },
  { label: "Capacidade total", value: "1.240", hint: "horarios no periodo" },
  { label: "Agendamentos marcados", value: "968", hint: "no periodo filtrado" },
  { label: "Faltas", value: "42", hint: "3,4% dos marcados" },
];

const rows = [
  { prof: "Dra. Camila Rocha", unidade: "Unidade Centro", cap: 220, marcados: 198, faltas: 6, ocupacao: 90 },
  { prof: "Dr. Eduardo Lima", unidade: "Unidade Sul", cap: 210, marcados: 165, faltas: 9, ocupacao: 79 },
  { prof: "Dra. Fernanda Alves", unidade: "Unidade Centro", cap: 195, marcados: 172, faltas: 5, ocupacao: 88 },
  { prof: "Dr. Rafael Souza", unidade: "Unidade Norte", cap: 180, marcados: 121, faltas: 11, ocupacao: 67 },
];

const tabs = ["Visao geral", "Por profissional", "Por unidade", "Por dia da semana"];

export function OcupacaoPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-primary" />
          Dashboard de Ocupacao de Agenda
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
          dados ficticios
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border/50 px-4 py-2.5">
        {tabs.map((t, i) => (
          <span
            key={t}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
              i === 1 ? "bg-primary/15 text-primary" : "text-muted-foreground"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/60 bg-card/40 p-3">
            <div className="font-mono text-lg font-bold">{k.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.label}</div>
            <div className="mt-1 text-[10px] text-cyan">{k.hint}</div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> Por profissional
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Profissional</th>
                <th className="px-3 py-2 font-medium">Unidade</th>
                <th className="px-3 py-2 font-medium text-right">Marcados</th>
                <th className="px-3 py-2 font-medium text-right">Faltas</th>
                <th className="px-3 py-2 font-medium text-right">Ocupacao</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.prof} className="border-b border-border/30 last:border-0">
                  <td className="px-3 py-2">{r.prof}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {r.unidade}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.marcados}/{r.cap}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.faltas}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border/50">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${r.ocupacao}%` }} />
                      </div>
                      <span className="w-9 text-right font-mono tabular-nums">{r.ocupacao}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/50 px-4 py-2.5 text-[11px] text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-purple" />
        Inclui assistente de IA embutido para responder perguntas sobre os dados filtrados.
      </div>
    </div>
  );
}
