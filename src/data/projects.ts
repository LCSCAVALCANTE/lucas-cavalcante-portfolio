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
  pipeline?: string[];
  deliverables?: string[];
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
      "Solucao completa de consolidacao e auditoria do eSocial: varre acervos de XMLs, identifica o tipo de cada evento e constroi bases relacionaveis de empresas, trabalhadores, vinculos, rubricas, lotacoes, remuneracoes, pagamentos, exclusoes e totalizadores. Depois cruza essas bases por chaves de negocio, aplica controles de qualidade e gera uma planilha Excel consolidada acompanhada de uma dashboard HTML navegavel e offline.",
    problem:
      "Acervos com milhares de XMLs distribuidos entre eventos, trabalhadores e competencias tornavam a analise manual lenta, sem visao de cobertura temporal e sem cruzamentos automaticos entre remuneracao, pagamento e totalizadores. Encontrar lacunas e priorizar o que precisa de investigacao exigia conferencia manual arquivo por arquivo.",
    results:
      "Base consolidada e pesquisavel com 19 parsers de evento, cruzamentos automatizados por chaves de negocio, cobertura mensal e anual explicita, alertas classificados por severidade e um Excel de 16 areas acompanhado de dashboard analitica. O polimento conservador completa campos vazios apenas quando ha uma unica resposta segura, com trilha de auditoria completa.",
    technologies: ["PYTHON", "PANDAS", "OPENPYXL", "STREAMLIT", "PLOTLY", "HTML", "CSS", "JAVASCRIPT"],
    status: "Concluido",
    pipeline: [
      "Varredura recursiva do acervo de XMLs e inventario de cada evento encontrado, com registro de arquivo, recibo, CPF e competencia.",
      "Extracao das tabelas de apoio: rubricas (S-1010), lotacoes (S-1020), cargos e horarios (S-1030/S-1050).",
      "Consolidacao de trabalhadores e historico de vinculos (S-2200, S-2205, S-2206, S-2230, S-2299, S-2300).",
      "Extracao de remuneracoes (S-1200) e pagamentos (S-1210).",
      "Identificacao de exclusoes (S-3000) e invalidacao de eventos excluidos ou retificados.",
      "Consolidacao dos totalizadores do trabalhador (S-5001/5002/5003) e da empresa (S-5011/5012/5013).",
      "Cruzamento das bases por chaves de negocio e geracao de alertas de inconsistencia.",
      "Analise de cobertura mensal e anual, com identificacao objetiva de lacunas por competencia.",
      "Exportacao do Excel consolidado com 16 areas e geracao da dashboard HTML navegavel.",
      "Polimento conservador: preenchimento de campos vazios apenas quando ha resposta unica e segura, com auditoria completa das alteracoes em CSV.",
    ],
    deliverables: [
      "Planilha Excel consolidada com 16 areas (empresas, trabalhadores, rubricas, lotacoes, remuneracoes, pagamentos, totalizadores, exclusoes, inconsistencias, cobertura).",
      "Versao polida: mesma base com enriquecimento conservador e trilha de auditoria em CSV.",
      "Dashboard HTML autonoma e offline, com visao executiva, cobertura, inconsistencias filtraveis, conciliacao estrutural e qualidade cadastral.",
      "Ocultacao visual de CPF e CNPJ na dashboard, com opcao de revelar sob demanda.",
      "Exportacao de tabelas em CSV e impressao/PDF da dashboard.",
      "Relatorio de qualidade e lista de lacunas com acao recomendada por competencia.",
    ],
  },
  {
    id: "insertvalue-feegow",
    name: "InsertValue on F-CLINIC",
    shortDescription:
      "Extensao Chrome que automatiza atualizacao em massa de valores de procedimentos e planos direto na tela do Feegow.",
    fullDescription:
      "Extensao de navegador (Manifest V3) que leva automacoes de atualizacao em massa para dentro da propria tela operacional do Feegow. Em vez de exigir uma aplicacao separada, importacoes ou troca de ambiente, ela atua sobre os componentes ja exibidos na aba ativa e pode injetar um painel flutuante na propria pagina.",
    problem:
      "Telas de configuracao em massa no Feegow reunem muitos procedimentos, planos e colunas de valores. Repetir a mesma alteracao em varias linhas de forma manual e lento e suscetivel a inconsistencias: localizar o procedimento e o plano certos em tabelas extensas, editar celula por celula, zerar uma coluna inteira ou selecionar centenas de planos em uma lista longa.",
    results:
      "Tres automacoes disponiveis a partir de um popup simples: atualizacao em massa por procedimento e plano, zeragem parametrizada de coluna e um painel de selecao de planos em lotes de 50. O trabalho que antes exigia editar linha por linha passou a ser feito com poucos cliques, direto na tela ativa do sistema.",
    technologies: ["JAVASCRIPT", "HTML", "CSS", "CHROME EXTENSION", "MANIFEST V3", "GIT"],
    status: "Concluido",
    pipeline: [
      "Usuario acessa a tela de valores em massa no Feegow.",
      "Abre a extensao pelo icone do navegador (popup de 320px).",
      "Escolhe uma das tres funcoes: atualizar por plano, zerar coluna ou selecionar em lotes.",
      "Informa os parametros necessarios (procedimento, plano, valor ou numero da coluna).",
      "A extensao injeta o script na aba ativa, que localiza blocos, tabelas e campos compativeis via seletores CSS/XPath.",
      "Usuario confere o resultado na propria pagina e conclui o fluxo no sistema.",
    ],
    deliverables: [
      "Atualizacao por plano: localiza procedimento e plano e preenche o novo valor nas linhas correspondentes.",
      "Zeragem de coluna: define como zero todas as celulas de uma coluna parametrizavel (padrao coluna 13).",
      "Selecao por lotes: painel flutuante injetado na pagina para navegar e selecionar planos em grupos de 50.",
      "Permissoes enxutas (activeTab e scripting) e nenhuma dependencia externa: apenas HTML, CSS e JavaScript nativos.",
      "Progresso de navegacao mantido no localStorage da propria pagina durante a sessao.",
      "Mensagens de validacao no popup e no painel para campos ausentes, coluna invalida e execucao iniciada.",
    ],
  },
];
