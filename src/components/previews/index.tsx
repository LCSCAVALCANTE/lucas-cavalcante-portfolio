import type { ComponentType } from "react";
import { IframePreview } from "./IframePreview";
import { ImagePreview } from "./ImagePreview";

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
  "painel-comercial": () => (
    <IframePreview src="/previews/painel-comercial-demo.html" label="Painel Comercial (demo)" />
  ),
  "cerebro-financeiro": () => (
    <IframePreview
      src="/previews/cerebro-financeiro-demo.html"
      label="Cérebro Financeiro (demo com dados fictícios)"
    />
  ),
  "insertvalue-feegow": () => (
    <ImagePreview
      src="/previews/insertvalue-feegow-illustration.svg"
      label="InsertValue on F-CLINIC (ilustracao)"
      caption="A extensao atua sobre a tela ativa do Feegow (sistema de terceiros) - nao ha um HTML standalone para clonar com fidelidade. Esta e' uma ilustracao de portfolio com dados ficticios, fiel ao layout real do popup e do painel injetado."
    />
  ),
};
