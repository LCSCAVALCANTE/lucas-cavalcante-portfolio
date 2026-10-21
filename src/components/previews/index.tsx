import type { ComponentType } from "react";
import { IframePreview } from "./IframePreview";
import { ImagePreview } from "./ImagePreview";

// Mapa: id do projeto (src/data/projects.ts) -> componente de preview
// exibido na secao "Previa" da pagina de detalhes. Projetos sem entrada
// aqui continuam com o placeholder padrao.
//
// Os quatro paineis reusam o HTML/CSS/JS que esta em producao (copiado do
// Dokploy em 21/10/2026), so' com a fonte de dados trocada por dados
// ficticios gerados no navegador e a marca da empresa removida - nenhuma
// chamada de rede real acontece. Cada demo fica numa pasta de
// public/previews/ (a de estoque e' um build estatico do app real).
export const projectPreviews: Record<string, ComponentType> = {
  "painel-propostas-executadas": () => (
    <IframePreview src="/previews/painel-propostas/index.html" label="Painel de Propostas, demonstração com dados fictícios" />
  ),
  "dashboard-ocupacao-agenda": () => (
    <IframePreview src="/previews/painel-ocupacao/index.html" label="Painel de Ocupação de Agenda, demonstração com dados fictícios" />
  ),
  "painel-comercial": () => (
    <IframePreview src="/previews/painel-comercial/index.html" label="Painel Comercial, demonstração com dados fictícios" />
  ),
  "gestor-de-estoque": () => (
    <IframePreview src="/previews/gestao-estoque/index.html" label="Gestão de Estoque, demonstração com dados fictícios" />
  ),
  "insertvalue-feegow": () => (
    <ImagePreview
      src="/previews/insertvalue-feegow-illustration.svg"
      label="InsertValue on F-CLINIC (ilustracao)"
      caption="A extensao atua sobre a tela ativa do Feegow (sistema de terceiros) - nao ha um HTML standalone para clonar com fidelidade. Esta e' uma ilustracao de portfolio com dados ficticios, fiel ao layout real do popup e do painel injetado."
    />
  ),
};
