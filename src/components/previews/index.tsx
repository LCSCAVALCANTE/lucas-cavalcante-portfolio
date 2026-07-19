import type { ComponentType } from "react";
import { OcupacaoPreview } from "./OcupacaoPreview";
import { IframePreview } from "./IframePreview";

// Mapa: id do projeto (src/data/projects.ts) -> componente de preview
// exibido na secao "Previa" da pagina de detalhes. Projetos sem entrada
// aqui continuam com o placeholder padrao.
//
// - painel-propostas-executadas: usa o HTML/CSS/JS real do projeto
//   (public/previews/painel-propostas-demo.html), so' com dados ficticios
//   gerados no proprio arquivo (sem nenhuma chamada de rede real).
// - dashboard-ocupacao-agenda: o app real embute os dados do cliente
//   diretamente na resposta HTML (nao busca por API separada), entao nao
//   da' pra clonar o HTML 1:1 sem arrastar dados reais. Por enquanto usa
//   uma reconstrucao visual (mesmos rotulos/colunas), com dados ficticios.
export const projectPreviews: Record<string, ComponentType> = {
  "painel-propostas-executadas": () => (
    <IframePreview src="/previews/painel-propostas-demo.html" label="Painel de Propostas (demo)" />
  ),
  "dashboard-ocupacao-agenda": OcupacaoPreview,
};
