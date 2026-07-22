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
    technologies: ["DAX", "SQL", "API", "N8N", "SHEETS", "POSTGRES", "JAVASCRIPT", "CSS", "HTML", "REACT", "VPS"],
    status: "Concluido",
  },
  {
    id: "painel-propostas-executadas",
    name: "Painel de Propostas",
    shortDescription:
      "Dashboard consolidado de propostas comerciais com funil, taxa de conversao e ticket medio.",
    fullDescription:
      "Painel executivo que consolida propostas de multiplas fontes, apresentando indicadores de conversao, tempo medio de fechamento e desempenho por vendedor.",
    problem:
      "Informacoes de propostas estavam pulverizadas em planilhas e sistemas diferentes, dificultando analises consistentes.",
    results:
      "Visao unificada do funil comercial e ganho de agilidade em reunioes estrategicas.",
    technologies: ["DAX", "SQL", "POSTGRES", "CSS", "HTML", "REACT", "GIT", "VPS"],
    status: "Concluido",
  },
  {
    id: "painel-comercial",
    name: "Painel Comercial",
    shortDescription:
      "Relatorio mensal comercial com agendamentos e propostas por medico, dia e unidade.",
    fullDescription:
      "Painel comercial multi-unidade que consolida agendamentos, comparecimento, indicacoes e propostas executadas, com filtros por unidade, periodo e medico.",
    problem:
      "Cada unidade acompanhava agendamentos e propostas de forma isolada, sem uma visao consolidada por medico e por periodo entre as unidades.",
    results:
      "Visao unica de agendamentos, comparecimento e propostas por unidade, medico e dia, com atualizacao automatica a partir da base operacional.",
    technologies: ["SQL", "POSTGRES", "CSS", "HTML", "JAVASCRIPT", "DOCKER", "NGINX", "GIT", "VPS"],
    status: "Concluido",
  },
  {
    id: "esocial-analytics",
    name: "eSocial Analytics",
    shortDescription:
      "Pipeline em Python que consolida milhares de XMLs do eSocial em uma base unica, com Excel analitico e dashboard.",
    fullDescription:
      "Solucao que varre acervos de XMLs do eSocial, identifica o tipo de cada evento e constroi bases relacionaveis de empresas, trabalhadores, vinculos, rubricas, lotacoes, remuneracoes, pagamentos, exclusoes e totalizadores, aplicando cruzamentos e controles de qualidade.",
    problem:
      "Acervos com milhares de XMLs distribuidos entre eventos, trabalhadores e competencias tornavam a analise manual lenta, sem visao de cobertura temporal e sem cruzamentos automaticos entre remuneracao, pagamento e totalizadores.",
    results:
      "Base consolidada e pesquisavel com 19 parsers de evento, cruzamentos automatizados por chaves de negocio, cobertura mensal e anual explicita, alertas classificados por severidade e um Excel de 16 areas acompanhado de dashboard analitica.",
    technologies: ["PYTHON", "PANDAS", "OPENPYXL", "STREAMLIT", "PLOTLY", "HTML", "CSS", "JAVASCRIPT"],
    status: "Em andamento",
  },
];
