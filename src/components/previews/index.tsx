import type { ComponentType } from "react";
import { IframePreview } from "./IframePreview";

// Mapa: id do projeto (src/data/projects.ts) -> componente de preview
// exibido na secao "Previa" da pagina de detalhes. Projetos sem entrada
// aqui continuam com o placeholder padrao.
//
// - painel-propostas-executadas: reusa o HTML/CSS/JS real do projeto
//   (public/previews/painel-propostas-demo.html), so' com a fonte de dados
//   trocada por dados ficticios gerados no proprio arquivo.
// - dashboard-ocupacao-agenda: o app real (fluxo n8n) embute os dados do
//   cliente diretamente na resposta HTML - nao da' pra clonar o HTML 1:1
//   sem arrastar dados reais. Reconstruido do zero usando a mesma paleta
//   de cores e estrutura (nav, KPIs, tabelas) do dashboard real, com
//   dados 100% ficticios (public/previews/dashboard-ocupacao-demo.html).
export const projectPreviews: Record<string, ComponentType> = {
  "painel-propostas-executadas": () => (
    <IframePreview src="/previews/painel-propostas-demo.html" label="Painel de Propostas (demo)" />
  ),
  "dashboard-ocupacao-agenda": () => (
    <IframePreview src="/previews/dashboard-ocupacao-demo.html" label="Dashboard de Ocupação de Agenda (demo)" />
  ),
};
