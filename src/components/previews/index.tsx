import type { ComponentType } from "react";
import { OcupacaoPreview } from "./OcupacaoPreview";
import { PropostasPreview } from "./PropostasPreview";

// Mapa: id do projeto (src/data/projects.ts) -> componente de preview
// ilustrativo (dados ficticios) exibido na secao "Previa" da pagina de
// detalhes. Projetos sem entrada aqui continuam com o placeholder padrao.
export const projectPreviews: Record<string, ComponentType> = {
  "dashboard-ocupacao-agenda": OcupacaoPreview,
  "painel-propostas-executadas": PropostasPreview,
};
