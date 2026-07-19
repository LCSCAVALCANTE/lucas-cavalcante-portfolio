import { Wallet, Percent, FileText, ChevronRight } from "lucide-react";

// Preview ilustrativo do "Painel de Propostas Executadas".
// Nomes, unidades e valores abaixo sao FICTICIOS - reproduzem apenas o
// padrao visual do painel real (KPIs financeiros, filtro por mes e
// ranking por profissional com barra de progresso).

const kpis = [
  { icon: FileText, label: "Propostas no periodo", value: "312" },
  { icon: Wallet, label: "Valor total", value: "R$ 486.200" },
  { icon: Wallet, label: "Ticket medio", value: "R$ 1.558" },
  { icon: Percent, label: "Taxa de conversao", value: "38,4%" },
];

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

const rows = [
  { nome: "Vendedor A", propostas: 94, valor: 148200, conversao: 44 },
  { nome: "Vendedor B", propostas: 81, valor: 121500, conversao: 39 },
  { nome: "Vendedor C", propostas: 76, valor: 109800, conversao: 33 },
  { nome: "Vendedor D", propostas: 61, valor: 106700, conversao: 31 },
];

const maxValor = Math.max(...rows.map((r) => r.valor));

export function PropostasPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-primary" />
          Painel de Propostas Executadas
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
          dados ficticios
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/50 px-4 py-2.5">
        {months.map((m, i) => (
          <span
            key={m}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
              i === 3 ? "bg-primary/15 text-primary" : "text-muted-foreground"
            }`}
          >
            {m}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/60 bg-card/40 p-3">
            <k.icon className="h-3.5 w-3.5 text-cyan" />
            <div className="mt-1.5 font-mono text-lg font-bold">{k.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5" /> Ranking por vendedor
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Vendedor</th>
                <th className="px-3 py-2 font-medium text-right">Propostas</th>
                <th className="px-3 py-2 font-medium text-right">Conversao</th>
                <th className="px-3 py-2 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.nome} className="border-b border-border/30 last:border-0">
                  <td className="px-3 py-2">{r.nome}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.propostas}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.conversao}%</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/50">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-purple"
                          style={{ width: `${(r.valor / maxValor) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right font-mono tabular-nums">
                        R$ {r.valor.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
