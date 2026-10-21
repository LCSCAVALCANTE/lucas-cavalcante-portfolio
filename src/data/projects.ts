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
    shortDescription: "Ocupação, agendados, livres, faltas e bloqueios por unidade e profissional, atualizados a cada 10 minutos direto da agenda.",
    fullDescription: "Sistema próprio em Docker que substituiu a versão em n8n e planilhas: banco PostgreSQL dedicado, carga automática da API da agenda e do data warehouse a cada 10 minutos e regras de capacidade portadas uma a uma. Traz visão do dia, comparação entre períodos, ocupação por unidade e turno, um indicador de saúde dos dados que aponta o que corrigir no cadastro e a NEXA, assistente que responde perguntas sobre os números em linguagem natural.",
    problem: "A ocupação era calculada em fluxos e planilhas, com consultas manuais e pouca confiança na capacidade real de cada unidade.",
    results: "Números conferidos contra o painel anterior, atualização a cada 10 minutos e pendências de cadastro visíveis para quem precisa corrigir.",
    technologies: ["TypeScript", "Bun", "PostgreSQL", "Redshift", "API REST", "OpenAI", "Docker", "Dokploy"],
    status: "Concluído",
  },
  {
    id: "painel-propostas-executadas",
    name: "Painel de Propostas",
    shortDescription: "Propostas por status, unidade, profissional, procedimento e pacote, com taxa de execução, ticket médio e comparação entre meses.",
    fullDescription: "Painel que consolida as propostas comerciais em views próprias no PostgreSQL e separa o que foi executado do que ainda está pendente, para não misturar bases de valor diferentes. Traz rankings por profissional, procedimento e pacote, detalhamento diário, comparação entre grupos de meses e acesso por unidade ou visão de rede.",
    problem: "As informações estavam distribuídas entre planilhas e sistemas, dificultando uma análise única e comparável.",
    results: "Uma visão centralizada do funil comercial para apoiar reuniões, acompanhamento de metas e decisões de gestão.",
    technologies: ["React", "Chart.js", "PostgreSQL", "PostgREST", "Supabase Auth", "Redshift", "Docker", "Nginx"],
    status: "Concluído",
  },
  {
    id: "painel-comercial",
    name: "Painel Comercial",
    shortDescription: "Relatório mensal comercial por médico e por dia: agendamentos, comparecimento, indicações, propostas, contratos e financeiro.",
    fullDescription: "Uma camada analítica para conectar a operação comercial de várias unidades. O relatório acompanha o funil da agenda ao pagamento nos recortes Primeira vez, Reativação, Total e Cofre, com detalhes por médico e por dia, e combina regras de negócio e uma base consolidada para que diferentes públicos enxerguem a mesma informação com segurança e consistência.",
    problem: "Cada unidade acompanhava sua operação isoladamente, sem uma visão comparável entre médicos, períodos e localidades.",
    results: "Mais transparência sobre a jornada comercial e uma fonte única para acompanhamento diário e mensal.",
    technologies: ["JavaScript", "PostgreSQL", "PostgREST", "Supabase Auth", "Redshift", "Docker", "Nginx", "Git"],
    status: "Concluído",
  },
  {
    id: "gestor-de-estoque",
    name: "Gestão de Estoque",
    shortDescription: "Estoque, consumo, validade, sugestão de compra e itens de alto custo por unidade, lote e localização.",
    fullDescription: "Painel operacional sobre a réplica do estoque da clínica: posição por unidade, lote e localização, movimentações, consumo mensal, lotes vencidos ou a vencer, sugestão de compra pela cobertura dos últimos três meses e acompanhamento de itens de alto custo. Tem regras de conversão de unidades configuráveis por aba, perfis de acesso (admin, gestor e comum) e registro de acessos.",
    problem: "O controle de estoque precisava de mais rastreabilidade, padronização e visibilidade por unidade e localização.",
    results: "Compra decidida pela cobertura (estoque ÷ média de 3 meses), alertas de validade por lote e uma visão única da rede para gestores e compras.",
    technologies: ["React", "TanStack Start", "TypeScript", "Tailwind", "Recharts", "PostgreSQL", "PostgREST", "Docker"],
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
