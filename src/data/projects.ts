export type ProjectStatus = "Concluido" | "Em andamento" | "Prototipo";

export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  problem: string;
  results: string;
  technologies: string[];
  status: ProjectStatus;
  images?: string[];
}

export const projects: Project[] = [
  {
    id: "dashboard-ocupacao-agenda",
    name: "Dashboard de Ocupacao de Agenda",
    shortDescription:
      "Painel em Power BI que monitora ocupacao de agendas em tempo real, com filtros por profissional e unidade.",
    fullDescription:
      "Solucao completa de BI para acompanhamento diario da ocupacao de agendas de atendimento, com integracao direta ao banco de dados operacional e atualizacao automatica.",
    problem:
      "A gestao nao tinha visibilidade em tempo real sobre horarios ociosos e capacidade utilizada, dificultando decisoes operacionais.",
    results:
      "Aumento de 22% na ocupacao media das agendas e reducao de tempo gasto em relatorios manuais em 80%.",
    technologies: ["Power BI", "SQL", "DAX", "Power Query"],
    status: "Concluido",
  },
  {
    id: "painel-propostas-executadas",
    name: "Painel de Propostas Executadas",
    shortDescription:
      "Dashboard consolidado de propostas comerciais com funil, taxa de conversao e ticket medio.",
    fullDescription:
      "Painel executivo que consolida propostas de multiplas fontes, apresentando indicadores de conversao, tempo medio de fechamento e desempenho por vendedor.",
    problem:
      "Informacoes de propostas estavam pulverizadas em planilhas e sistemas diferentes, dificultando analises consistentes.",
    results:
      "Visao unificada do funil comercial e ganho de agilidade em reunioes estrategicas.",
    technologies: ["Power BI", "SQL", "Excel"],
    status: "Concluido",
  },
];
