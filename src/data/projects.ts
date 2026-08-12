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
  images?: string[];
  pipeline?: string[];
  deliverables?: string[];
  hidePreview?: boolean;
}

export const projects: Project[] = [
  {
    id: "dashboard-ocupacao-agenda",
    name: "Dashboard de Ocupação de Agenda",
    shortDescription: "Inteligência operacional para acompanhar capacidade, ocupação e oportunidades de agenda por unidade e profissional.",
    fullDescription: "Uma solução de BI conectada à operação para transformar dados de agenda em uma visão executiva acionável. O projeto combina ingestão automatizada, camada de serviço, cache e indicadores que ajudam a gestão a identificar ociosidade e agir mais rápido.",
    problem: "A operação dependia de consultas manuais e não tinha uma visão confiável da capacidade utilizada em cada unidade.",
    results: "Mais velocidade para acompanhar a operação, priorizar horários ociosos e reduzir o trabalho manual de consolidação.",
    technologies: ["SQL", "PostgreSQL", "n8n", "JavaScript", "React", "HTML", "CSS", "VPS"],
    status: "Concluído",
  },
  {
    id: "painel-propostas-executadas",
    name: "Painel de Propostas",
    shortDescription: "Visão executiva do funil comercial, conversão, ticket médio e desempenho das propostas.",
    fullDescription: "Painel comercial construído para consolidar propostas de diferentes fontes e transformar dados dispersos em indicadores consistentes. A solução organiza o funil e facilita a leitura de conversão, fechamento e performance por responsável.",
    problem: "As informações estavam distribuídas entre planilhas e sistemas, dificultando uma análise única e comparável.",
    results: "Uma visão centralizada do funil comercial para apoiar reuniões, acompanhamento de metas e decisões de gestão.",
    technologies: ["SQL", "PostgreSQL", "React", "HTML", "CSS", "Git", "VPS"],
    status: "Concluído",
  },
  {
    id: "painel-comercial",
    name: "Painel Comercial",
    shortDescription: "Indicadores de agendamentos, comparecimento, indicações e propostas por unidade, período e profissional.",
    fullDescription: "Uma camada analítica para conectar a operação comercial de várias unidades. O painel combina regras de negócio, filtros e uma base consolidada para que diferentes públicos enxerguem a mesma informação com segurança e consistência.",
    problem: "Cada unidade acompanhava sua operação isoladamente, sem uma visão comparável entre médicos, períodos e localidades.",
    results: "Mais transparência sobre a jornada comercial e uma fonte única para acompanhamento diário e mensal.",
    technologies: ["SQL", "PostgreSQL", "JavaScript", "React", "Docker", "Nginx", "Git", "VPS"],
    status: "Concluído",
  },
  {
    id: "gestor-de-estoque",
    name: "Gestor de Estoque Clínico",
    shortDescription: "Protótipo integrado à API e ao PostgreSQL para controlar entradas, saídas, lotes, validades e movimentações.",
    fullDescription: "Protótipo em desenvolvimento de uma aplicação operacional para dar rastreabilidade ao estoque clínico. A solução é conectada à API e ao PostgreSQL, organizando produtos, saldos, lotes e movimentações em fluxos claros de consulta, entrada, saída e transferência entre locais.",
    problem: "O controle de estoque precisava de mais rastreabilidade, padronização e visibilidade por unidade e localização.",
    results: "Base funcional em evolução, com persistência no PostgreSQL e integração via API para centralizar e tornar auditáveis os processos de estoque.",
    technologies: ["React", "TanStack", "TypeScript", "Tailwind", "Zod", "API", "PostgreSQL", "Feegow"],
    status: "Em andamento",
  },
  {
    id: "esocial-analytics",
    name: "eSocial Analytics",
    hidePreview: true,
    shortDescription: "Pipeline em Python que transforma milhares de XMLs do eSocial em base analítica, Excel e dashboard offline.",
    fullDescription: "Solução de consolidação e auditoria que identifica eventos, cruza trabalhadores, vínculos, remunerações, pagamentos e totalizadores, além de apontar lacunas e inconsistências com trilha de auditoria.",
    problem: "A análise arquivo a arquivo era lenta e dificultava encontrar lacunas, divergências e prioridades de investigação.",
    results: "Base pesquisável, relatórios estruturados e uma dashboard offline para acelerar auditorias e conferências.",
    technologies: ["Python", "Pandas", "OpenPyXL", "Streamlit", "Plotly", "HTML", "CSS"],
    status: "Concluído",
    pipeline: ["Inventário dos XMLs", "Parsing dos eventos", "Cruzamento das bases", "Alertas de qualidade", "Exportação do Excel e dashboard"],
  },
  {
    id: "cerebro-financeiro",
    name: "Painel e-commerce",
    shortDescription: "Dashboard em desenvolvimento para consolidar a visão financeira de operações em marketplaces.",
    fullDescription: "Protótipo de uma plataforma que reúne indicadores financeiros de diferentes contas de marketplace em uma experiência única. O projeto está em evolução e seus detalhes estratégicos foram preservados.",
    problem: "Operações distribuídas entre diferentes canais dificultam a leitura consolidada dos resultados e do fluxo financeiro.",
    results: "Protótipo funcional com visão executiva, indicadores consolidados e experiência preparada para evoluir com novas integrações.",
    technologies: ["React", "TypeScript", "APIs", "Dashboards", "PostgreSQL", "Git"],
    status: "Em andamento",
  },
  {
    id: "insertvalue-feegow",
    name: "InsertValue on F-CLINIC",
    shortDescription: "Extensão Chrome que automatiza alterações em massa de valores diretamente na tela do Feegow.",
    fullDescription: "Extensão Manifest V3 criada para reduzir tarefas repetitivas na configuração de procedimentos e planos. A ferramenta injeta controles na tela ativa, valida parâmetros e executa alterações em lote sem exigir outro sistema.",
    problem: "Editar valores linha a linha em tabelas extensas era demorado e sujeito a inconsistências.",
    results: "Atualizações em massa executadas em poucos cliques, com validações e feedback ao usuário.",
    technologies: ["JavaScript", "HTML", "CSS", "Chrome Extension", "Manifest V3", "Git"],
    status: "Concluído",
    pipeline: ["Configuração no popup", "Validação dos parâmetros", "Injeção na tela ativa", "Execução e conferência no Feegow"],
  },
];
