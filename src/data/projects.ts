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
  {
    id: "automacao-relatorios",
    name: "Automacao de Relatorios",
    shortDescription:
      "Fluxo em n8n que gera e envia relatorios recorrentes por e-mail automaticamente.",
    fullDescription:
      "Automacao end-to-end que extrai dados via API, formata relatorios em PDF/Excel e distribui para stakeholders em horarios programados.",
    problem:
      "Equipe gastava horas semanais compilando e enviando relatorios repetitivos manualmente.",
    results:
      "Economia de mais de 15 horas de trabalho por semana e eliminacao de erros de envio.",
    technologies: ["n8n", "Python", "APIs", "SMTP"],
    status: "Em andamento",
  },
  {
    id: "consolidador-esocial",
    name: "Consolidador de Arquivos eSocial",
    shortDescription:
      "Script Python que consolida centenas de arquivos XML do eSocial em uma base analitica unica.",
    fullDescription:
      "Ferramenta que percorre diretorios, faz parsing dos XMLs do eSocial, valida esquemas e gera uma base tabular pronta para analise em Power BI e Excel.",
    problem:
      "Consolidar arquivos XML do eSocial manualmente era inviavel dado o volume e a complexidade da estrutura.",
    results:
      "Consolidacao de mais de 5.000 arquivos em minutos, com relatorios prontos para auditoria.",
    technologies: ["Python", "Pandas", "XML", "Power BI"],
    status: "Concluido",
  },
  {
    id: "controle-estoque-clinico",
    name: "Sistema de Controle de Estoque Clinico",
    shortDescription:
      "Aplicacao web para controle de estoque de insumos clinicos com alertas e relatorios.",
    fullDescription:
      "Sistema web que registra entradas e saidas de insumos, envia alertas de estoque minimo e gera relatorios de consumo por setor e periodo.",
    problem:
      "Falta de controle causava rupturas de estoque e desperdicio de insumos com validade proxima.",
    results:
      "Reducao de 35% em perdas por vencimento e visibilidade em tempo real do estoque.",
    technologies: ["React", "Node.js", "PostgreSQL", "Tailwind"],
    status: "Prototipo",
  },
];
