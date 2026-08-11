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
    shortDescription:
      "Painel em Power BI que monitora ocupação de agendas em tempo real, com filtros por profissional e unidade.",
    fullDescription:
      "Solução completa de BI para acompanhamento diário da ocupação de agendas de atendimento, com integração direta ao banco de dados operacional e atualização automática.\n\nBônus: o painel conta com a Nexa, uma inteligência artificial integrada que lê os dados da dashboard e responde às perguntas do usuário em linguagem natural, funcionando como um agente de suporte — explicando indicadores, apontando horários ociosos e ajudando na leitura dos números sem precisar navegar por filtros.",
    problem:
      "A gestão não tinha visibilidade em tempo real sobre horários ociosos e capacidade utilizada, dificultando decisões operacionais.",
    results:
      "Aumento de 22% na ocupação média das agendas e redução de tempo gasto em relatórios manuais em 80%.",
    technologies: ["DAX", "SQL", "API", "N8N", "SHEETS", "POSTGRES", "JAVASCRIPT", "CSS", "HTML", "REACT", "VPS", "MCP", "IA"],
    status: "Concluído",
  },
  {
    id: "painel-propostas-executadas",
    name: "Painel de Propostas",
    shortDescription:
      "Dashboard consolidado de propostas comerciais com funil, taxa de conversão e ticket médio.",
    fullDescription:
      "Painel executivo que consolida propostas de múltiplas fontes, apresentando indicadores de conversão, tempo médio de fechamento e desempenho por vendedor.",
    problem:
      "Informações de propostas estavam pulverizadas em planilhas e sistemas diferentes, dificultando análises consistentes.",
    results:
      "Visão unificada do funil comercial e ganho de agilidade em reuniões estratégicas.",
    technologies: ["DAX", "SQL", "POSTGRES", "CSS", "HTML", "REACT", "GIT", "VPS"],
    status: "Concluído",
  },
  {
    id: "painel-comercial",
    name: "Painel Comercial",
    shortDescription:
      "Relatório mensal comercial com agendamentos e propostas por médico, dia e unidade.",
    fullDescription:
      "Painel comercial multi-unidade que consolida agendamentos, comparecimento, indicações e propostas executadas, com filtros por unidade, período e médico.",
    problem:
      "Cada unidade acompanhava agendamentos e propostas de forma isolada, sem uma visão consolidada por médico e por período entre as unidades.",
    results:
      "Visão única de agendamentos, comparecimento e propostas por unidade, médico e dia, com atualização automática a partir da base operacional.",
    technologies: ["SQL", "POSTGRES", "CSS", "HTML", "JAVASCRIPT", "DOCKER", "NGINX", "GIT", "VPS"],
    status: "Concluído",
  },
  {
    id: "esocial-analytics",
    name: "eSocial Analytics",
    hidePreview: true,
    shortDescription:
      "Pipeline em Python que consolida milhares de XMLs do eSocial em uma base única, com Excel analítico e dashboard.",
    fullDescription:
      "Solução completa de consolidação e auditoria do eSocial: varre acervos de XMLs, identifica o tipo de cada evento e constrói bases relacionáveis de empresas, trabalhadores, vínculos, rubricas, lotações, remunerações, pagamentos, exclusões e totalizadores. Depois cruza essas bases por chaves de negócio, aplica controles de qualidade e gera uma planilha Excel consolidada acompanhada de uma dashboard HTML navegável e offline.",
    problem:
      "Acervos com milhares de XMLs distribuídos entre eventos, trabalhadores e competências tornavam a análise manual lenta, sem visão de cobertura temporal e sem cruzamentos automáticos entre remuneração, pagamento e totalizadores. Encontrar lacunas e priorizar o que precisa de investigação exigia conferência manual arquivo por arquivo.",
    results:
      "Base consolidada e pesquisável com 19 parsers de evento, cruzamentos automatizados por chaves de negócio, cobertura mensal e anual explícita, alertas classificados por severidade e um Excel de 16 áreas acompanhado de dashboard analítica. O polimento conservador completa campos vazios apenas quando há uma única resposta segura, com trilha de auditoria completa.",
    technologies: ["PYTHON", "PANDAS", "OPENPYXL", "STREAMLIT", "PLOTLY", "HTML", "CSS", "JAVASCRIPT"],
    status: "Concluído",
    pipeline: [
      "Varredura recursiva do acervo de XMLs e inventário de cada evento encontrado, com registro de arquivo, recibo, CPF e competência.",
      "Extração das tabelas de apoio: rubricas (S-1010), lotações (S-1020), cargos e horários (S-1030/S-1050).",
      "Consolidação de trabalhadores e histórico de vínculos (S-2200, S-2205, S-2206, S-2230, S-2299, S-2300).",
      "Extração de remunerações (S-1200) e pagamentos (S-1210).",
      "Identificação de exclusões (S-3000) e invalidação de eventos excluídos ou retificados.",
      "Consolidação dos totalizadores do trabalhador (S-5001/5002/5003) e da empresa (S-5011/5012/5013).",
      "Cruzamento das bases por chaves de negócio e geração de alertas de inconsistência.",
      "Análise de cobertura mensal e anual, com identificação objetiva de lacunas por competência.",
      "Exportação do Excel consolidado com 16 áreas e geração da dashboard HTML navegável.",
      "Polimento conservador: preenchimento de campos vazios apenas quando há resposta única e segura, com auditoria completa das alterações em CSV.",
    ],
    deliverables: [
      "Planilha Excel consolidada com 16 áreas (empresas, trabalhadores, rubricas, lotações, remunerações, pagamentos, totalizadores, exclusões, inconsistências, cobertura).",
      "Versão polida: mesma base com enriquecimento conservador e trilha de auditoria em CSV.",
      "Dashboard HTML autônoma e offline, com visão executiva, cobertura, inconsistências filtráveis, conciliação estrutural e qualidade cadastral.",
      "Ocultação visual de CPF e CNPJ na dashboard, com opção de revelar sob demanda.",
      "Exportação de tabelas em CSV e impressão/PDF da dashboard.",
      "Relatório de qualidade e lista de lacunas com ação recomendada por competência.",
    ],
  },
  {
    id: "cerebro-financeiro",
    name: "Cérebro Financeiro",
    shortDescription:
      "Dashboard financeiro multi-marketplace para acompanhar vendas, receita líquida, custos, repasses e estoque de Mercado Livre e Shopee em uma única visão.",
    fullDescription:
      "Protótipo de uma plataforma de gestão financeira para e-commerce que consolida Mercado Livre e Shopee em uma única interface. A solução foi estruturada para responder rapidamente quanto foi vendido, quanto já foi recebido, quais custos impactaram o resultado e quanto ainda há a receber. A arquitetura separa a camada visual da camada de domínio e de dados, deixando o front-end preparado para receber conectores reais posteriormente sem precisar reescrever as telas.\n\nObservação: trata-se de um protótipo com dados demonstrativos, com arquitetura preparada para integrações futuras.",
    problem:
      "Vendedores que operam em mais de um marketplace precisam cruzar manualmente vendas, taxas, fretes, descontos, repasses e estoque entre plataformas diferentes, o que dificulta enxergar o resultado líquido real e identificar rapidamente problemas de caixa ou produtos críticos.",
    results:
      "Protótipo funcional e responsivo com visão consolidada por marketplace, KPIs financeiros, evolução diária de vendas, comparação entre canais, ranking de produtos, situação do caixa, alertas operacionais e estados de carregamento, ausência de dados e primeiro uso. A camada de domínio foi criada de forma independente da interface para permitir futura integração com APIs sem alterar as telas.",
    technologies: ["REACT", "TYPESCRIPT", "TANSTACK START", "TAILWIND CSS", "SHADCN/UI", "RECHARTS", "LUCIDE", "GIT"],
    status: "Protótipo",
    pipeline: [
      "Dados de pedidos, pagamentos, envios, descontos e estoque entram por uma camada de repositório normalizada.",
      "A camada de domínio calcula faturamento bruto, taxas, fretes, descontos, receita líquida estimada, valores recebidos e valores a receber.",
      "O provider central entrega consultas tipadas para visão geral, vendas, financeiro, produtos, contas conectadas e alertas.",
      "A interface apresenta os indicadores de forma consolidada ou separada por Mercado Livre e Shopee.",
      "Estados de dados completos, parciais, sincronizando ou indisponíveis são tratados na própria experiência do usuário.",
      "A arquitetura já prevê conectores reais no back-end por OAuth, sincronização periódica/webhooks e normalização dos payloads externos.",
    ],
    deliverables: [
      "Dashboard executivo com faturamento bruto, receita líquida estimada, pedidos pagos, ticket médio, valor a receber e taxas/fretes.",
      "Gráfico de vendas por dia com alternância entre faturamento bruto e receita líquida.",
      "Comparativo Mercado Livre x Shopee com participação de cada canal.",
      "Ranking de produtos com unidades vendidas, faturamento e resultado líquido.",
      "Área Prioridades de hoje com alertas de estoque crítico, repasse pendente e queda de vendas.",
      "Página de vendas com detalhamento de pedidos.",
      "Área financeira e visão de situação do caixa.",
      "Página de produtos e estoque com ajuste de estoque mínimo.",
      "Área de contas conectadas e configurações.",
      "Estados de onboarding, carregamento, vazio e dados parciais.",
      "Camada de domínio desacoplada da interface e preparada para integração futura com APIs do Mercado Livre e Shopee.",
    ],
  },
  {
    id: "insertvalue-feegow",
    name: "InsertValue on F-CLINIC",
    shortDescription:
      "Extensão Chrome que automatiza atualização em massa de valores de procedimentos e planos direto na tela do Feegow.",
    fullDescription:
      "Extensão de navegador (Manifest V3) que leva automações de atualização em massa para dentro da própria tela operacional do Feegow. Em vez de exigir uma aplicação separada, importações ou troca de ambiente, ela atua sobre os componentes já exibidos na aba ativa e pode injetar um painel flutuante na própria página.",
    problem:
      "Telas de configuração em massa no Feegow reúnem muitos procedimentos, planos e colunas de valores. Repetir a mesma alteração em várias linhas de forma manual é lento e suscetível a inconsistências: localizar o procedimento e o plano certos em tabelas extensas, editar célula por célula, zerar uma coluna inteira ou selecionar centenas de planos em uma lista longa.",
    results:
      "Três automações disponíveis a partir de um popup simples: atualização em massa por procedimento e plano, zeragem parametrizada de coluna e um painel de seleção de planos em lotes de 50. O trabalho que antes exigia editar linha por linha passou a ser feito com poucos cliques, direto na tela ativa do sistema.",
    technologies: ["JAVASCRIPT", "HTML", "CSS", "CHROME EXTENSION", "MANIFEST V3", "GIT"],
    status: "Concluído",
    pipeline: [
      "Usuário acessa a tela de valores em massa no Feegow.",
      "Abre a extensão pelo ícone do navegador (popup de 320px).",
      "Escolhe uma das três funções: atualizar por plano, zerar coluna ou selecionar em lotes.",
      "Informa os parâmetros necessários (procedimento, plano, valor ou número da coluna).",
      "A extensão injeta o script na aba ativa, que localiza blocos, tabelas e campos compatíveis via seletores CSS/XPath.",
      "Usuário confere o resultado na própria página e conclui o fluxo no sistema.",
    ],
    deliverables: [
      "Atualização por plano: localiza procedimento e plano e preenche o novo valor nas linhas correspondentes.",
      "Zeragem de coluna: define como zero todas as células de uma coluna parametrizável (padrão coluna 13).",
      "Seleção por lotes: painel flutuante injetado na página para navegar e selecionar planos em grupos de 50.",
      "Permissões enxutas (activeTab e scripting) e nenhuma dependência externa: apenas HTML, CSS e JavaScript nativos.",
      "Progresso de navegação mantido no localStorage da própria página durante a sessão.",
      "Mensagens de validação no popup e no painel para campos ausentes, coluna inválida e execução iniciada.",
    ],
  },
];
