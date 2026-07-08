export type ProjectStatus = "Concluído" | "Em andamento" | "Protótipo";

export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  problem: string;
  results: string;
  technologies: string[];
  status: ProjectStatus;
  github?: string;
  demo?: string;
  images?: string[];
}

export const projects: Project[] = [
  {
    id: "dashboard-ocupacao-agenda",
    name: "Dashboard de Ocupação de Agenda",
    shortDescription:
      "Painel em Power BI que monitora ocupação de agendas em tempo real, com filtros por profissional e unidade.",
    fullDescription:
      "Solução completa de BI para acompanhamento diário da ocupação de agendas de atendimento, com integração direta ao banco de dados operacional e atualização automática.",
    problem:
      "A gestão não tinha visibilidade em tempo real sobre horários ociosos e capacidade utilizada, dificultando decisões operacionais.",
    results:
      "Aumento de 22% na ocupação média das agendas e redução de tempo gasto em relatórios manuais em 80%.",
    technologies: ["Power BI", "SQL", "DAX", "Power Query"],
    status: "Concluído",
    github: "https://github.com/lucascavalcante",
  },
  {
    id: "painel-propostas-executadas",
    name: "Painel de Propostas Executadas",
    shortDescription:
      "Dashboard consolidado de propostas comerciais com funil, taxa de conversão e ticket médio.",
    fullDescription:
      "Painel executivo que consolida propostas de múltiplas fontes, apresentando indicadores de conversão, tempo médio de fechamento e desempenho por vendedor.",
    problem:
      "Informações de propostas estavam pulverizadas em planilhas e sistemas diferentes, dificultando análises consistentes.",
    results:
      "Visão unificada do funil comercial e ganho de agilidade em reuniões estratégicas.",
    technologies: ["Power BI", "SQL", "Excel"],
    status: "Concluído",
  },
  {
    id: "automacao-relatorios",
    name: "Automação de Relatórios",
    shortDescription:
      "Fluxo em n8n que gera e envia relatórios recorrentes por e-mail automaticamente.",
    fullDescription:
      "Automação end-to-end que extrai dados via API, formata relatórios em PDF/Excel e distribui para stakeholders em horários programados.",
    problem:
      "Equipe gastava horas semanais compilando e enviando relatórios repetitivos manualmente.",
    results:
      "Economia de mais de 15 horas de trabalho por semana e eliminação de erros de envio.",
    technologies: ["n8n", "Python", "APIs", "SMTP"],
    status: "Em andamento",
    github: "https://github.com/lucascavalcante",
  },
  {
    id: "consolidador-esocial",
    name: "Consolidador de Arquivos eSocial",
    shortDescription:
      "Script Python que consolida centenas de arquivos XML do eSocial em uma base analítica única.",
    fullDescription:
      "Ferramenta que percorre diretórios, faz parsing dos XMLs do eSocial, valida esquemas e gera uma base tabular pronta para análise em Power BI e Excel.",
    problem:
      "Consolidar arquivos XML do eSocial manualmente era inviável dado o volume e a complexidade da estrutura.",
    results:
      "Consolidação de mais de 5.000 arquivos em minutos, com relatórios prontos para auditoria.",
    technologies: ["Python", "Pandas", "XML", "Power BI"],
    status: "Concluído",
    github: "https://github.com/lucascavalcante",
  },
  {
    id: "controle-estoque-clinico",
    name: "Sistema de Controle de Estoque Clínico",
    shortDescription:
      "Aplicação web para controle de estoque de insumos clínicos com alertas e relatórios.",
    fullDescription:
      "Sistema web que registra entradas e saídas de insumos, envia alertas de estoque mínimo e gera relatórios de consumo por setor e período.",
    problem:
      "Falta de controle causava rupturas de estoque e desperdício de insumos com validade próxima.",
    results:
      "Redução de 35% em perdas por vencimento e visibilidade em tempo real do estoque.",
    technologies: ["React", "Node.js", "PostgreSQL", "Tailwind"],
    status: "Protótipo",
    demo: "#",
  },
];
