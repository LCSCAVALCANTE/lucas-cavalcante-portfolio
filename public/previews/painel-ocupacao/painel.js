// Script principal do painel, extraído sem alteração de regra do nó .7 do workflow n8n
// "Dashboard Ocupação". Mudanças: dados vêm de /api/dados, HOJE calculado no navegador,
// chat aponta para /ia do próprio app.
// window.DADOS é preenchido pelo carregador no index.html, a partir de /api/dados.

// 16/10/2026: "hoje" no fuso de Brasília (antes era UTC: das 21h à meia-noite a tela já achava que era o dia seguinte).
var HOJE = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
window.__COMPARE_MODE = 'none';

function getTempoInfo(dataStr, isMensal) {
  if (!dataStr || dataStr.length < 10) return { label: 'Desconhecido', sort: '00000000' };
  var y = dataStr.substring(0, 4);
  var m = dataStr.substring(5, 7);
  var d = dataStr.substring(8, 10);
  if (isMensal) {
    var meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return {
      label: meses[parseInt(m, 10) - 1] + '/' + y,
      sort: y + m
    };
  } else {
    var dt = new Date(y, parseInt(m,10)-1, d);
    var day = dt.getDay();
    var diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    var monday = new Date(dt.setDate(diff));
    var my = String(monday.getFullYear());
    var mm = String(monday.getMonth() + 1).padStart(2, '0');
    var md = String(monday.getDate()).padStart(2, '0');
    return {
      label: 'Sem. ' + md + '/' + mm,
      sort: my + mm + md
    };
  }
}

function fNum(n) { return Math.round(n); }
function fPct(n) { return n.toFixed(1) + '%'; }
function safeRatio(num, den) {
  if (!den || den <= 0) return 0;
  return num / den;
}
function fAvg(n) {
  return (Math.round((n || 0) * 100) / 100).toFixed(2);
}

function normTxt(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function shiftIsoDateByYears(dateStr, years) {
  if (!dateStr || dateStr.length < 10) return dateStr;
  var y = parseInt(dateStr.substring(0, 4), 10) + years;
  var m = dateStr.substring(5, 7);
  var d = dateStr.substring(8, 10);
  if (m === '02' && d === '29' && !isLeapYear(y)) d = '28';
  return String(y).padStart(4, '0') + '-' + m + '-' + d;
}

function daysInMonth(year, monthIndex0) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function shiftIsoDateByMonths(dateStr, months) {
  if (!dateStr || dateStr.length < 10) return dateStr;
  var y = parseInt(dateStr.substring(0, 4), 10);
  var m = parseInt(dateStr.substring(5, 7), 10);
  var d = parseInt(dateStr.substring(8, 10), 10);
  if (!y || !m || !d) return dateStr;

  var totalMonths = (y * 12 + (m - 1)) + months;
  var ny = Math.floor(totalMonths / 12);
  var nm0 = totalMonths % 12;
  if (nm0 < 0) {
    nm0 += 12;
    ny -= 1;
  }

  var maxDay = daysInMonth(ny, nm0);
  var nd = d > maxDay ? maxDay : d;
  return String(ny).padStart(4, '0') + '-' + String(nm0 + 1).padStart(2, '0') + '-' + String(nd).padStart(2, '0');
}

// 'YYYY-MM' → 'YYYY-MM-DD' do último dia do mês
function ultimoDiaDoMes(ym) {
  var y = parseInt(ym.substring(0, 4), 10), m = parseInt(ym.substring(5, 7), 10);
  var d = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return ym + '-' + (d < 10 ? '0' : '') + d;
}
var MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
var MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function nomeMesCurto(ym) { return MESES_CURTOS[parseInt(ym.substring(5, 7), 10) - 1] + '/' + ym.substring(0, 4); }
function nomeMesLongo(ym) { return MESES_LONGOS[parseInt(ym.substring(5, 7), 10) - 1] + '/' + ym.substring(0, 4); }

function isCompleteMonthRange(di, df) {
  if (!di || !df || di.length < 10 || df.length < 10) return false;
  var yi = parseInt(di.substring(0, 4), 10);
  var mi = parseInt(di.substring(5, 7), 10);
  var diDay = parseInt(di.substring(8, 10), 10);
  var yf = parseInt(df.substring(0, 4), 10);
  var mf = parseInt(df.substring(5, 7), 10);
  var dfDay = parseInt(df.substring(8, 10), 10);
  if (!yi || !mi || !diDay || !yf || !mf || !dfDay) return false;
  if (yi !== yf || mi !== mf) return false;
  if (diDay !== 1) return false;
  return dfDay === daysInMonth(yf, mf - 1);
}

function summarizeRows(rows) {
  var t = {
    slots: 0,
    sched: 0,
    marked: 0,
    bloq: 0,
    enc: 0,
    encSlots: 0,
    noshow: 0,
    presentes: 0,
    desm: 0,
    agTotal: 0,
    repres: 0,
    free: 0,
    occ: 0
  };
  (rows || []).forEach(function(r) {
    t.slots += r['Capacidade Total (slots)'] || 0;
    t.sched += r['Slots Agendados (total c/ retornos)'] || 0;
    t.marked += r['Agendamentos Marcados'] || 0;
    t.bloq += r['Bloqueios (slots)'] || 0;
    t.enc += r['Encaixes (atendimentos)'] || 0;
    t.encSlots += r['Encaixes (slots por tempo)'] || 0; // encaixes em slots pela duração, como os marcados
    t.noshow += r['Faltas (no-show)'] || 0;
    t.presentes += r['Agendamentos'] || 0;
    t.desm += r['Desmarcados(Slot)'] || 0;
    t.agTotal += r['Agendados nova'] || 0;
    t.repres += r['Representantes'] || 0;
    t.free += r['Slots Livres'] || 0; // 01/10/2026: livres por slot (sync); soma dos blocos
  });
  t.occ = calcOcupacao(t.sched, t.slots, t.bloq);
  t.agend = calcAgendamento(t.sched, t.noshow, t.slots, t.bloq);
  t.preench = calcPreenchimento(t.free, t.slots, t.bloq);
  return t;
}

function hasAnyTerm(text, terms) {
  for (var i = 0; i < terms.length; i++) {
    if (text.indexOf(terms[i]) !== -1) return true;
  }
  return false;
}

function escH(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"]/g, function(c) {
    return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;';
  });
}

function iniciais(nome) {
  var partes = (nome || '').trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

var PALETA = [
  '#3b82f6','#22c55e','#f97316','#a855f7',
  '#06b6d4','#ec4899','#f59e0b','#10b981',
  '#6366f1','#84cc16'
];
var corCache = {};
var corIdx = 0;
function corProfissional(nome) {
  if (!corCache[nome]) corCache[nome] = PALETA[corIdx++ % PALETA.length];
  return corCache[nome];
}

function occColor(pct) {
  if (pct >= 85) return '#22c55e';
  if (pct >= 60) return '#3b82f6';
  if (pct >= 45) return '#f97316';
  return '#ef4444';
}

// 08/10/2026: nas tabelas, só o número na cor da faixa da taxa (occColor), sem barrinha (decisão do proprietário)
function miniBar(pct, rotulo) {
  return '<span class="taxa-num" style="color:' + occColor(pct) + '" aria-label="' + (rotulo || 'Ocupação') + ' ' + fPct(pct) + '">' +
    fPct(pct) + '</span>';
}
// As três taxas lado a lado, sempre na mesma ordem (Ocupação, Agendamento, Preenchimento).
function tresTaxas(scheduled, noShow, free, totalSlots, blocked) {
  return '<td>' + miniBar(calcOcupacao(scheduled, totalSlots, blocked), 'Ocupação') + '</td>' +
    '<td>' + miniBar(calcAgendamento(scheduled, noShow, totalSlots, blocked), 'Agendamento') + '</td>' +
    '<td>' + miniBar(calcPreenchimento(free, totalSlots, blocked), 'Preenchimento') + '</td>';
}

// 08/10/2026: cabeçalho das tabelas acompanha a rolagem da página até o fim de cada tabela (position: sticky,
// logo abaixo da barra do topo). Sticky não funciona dentro de rolagem lateral, então a rolagem lateral só liga
// na tabela que não cabe na tela (telas estreitas).
function ajustarTabelas() {
  var topo = document.querySelector('.topbar');
  document.documentElement.style.setProperty('--topo-altura', (topo ? topo.offsetHeight : 0) + 'px');
  document.querySelectorAll('.table-card .table-wrapper').forEach(function (w) {
    w.classList.remove('rola');
    var t = w.querySelector('table');
    if (t && t.scrollWidth > w.clientWidth + 1) w.classList.add('rola');
  });
}
window.addEventListener('resize', function () { ajustarTabelas(); });

// 16/10/2026 (auditoria): o total do profissional soma todas as unidades do filtro; a coluna mostra todas, não só a
// primeira encontrada. Ex.: profissional que atende em duas unidades = "Centro, Jardins". O prefixo da marca sai quando há mais de uma.
// MODO DEMO: nomes do exemplo e prefixo da marca trocados por fictícios.
function unidadesDoProfissional(registros, nome) {
  var vistas = [];
  for (var i = 0; i < registros.length; i++) {
    var u = registros[i].Unidade;
    if (registros[i].Profissional === nome && u && vistas.indexOf(u) === -1) vistas.push(u);
  }
  if (!vistas.length) return '—';
  if (vistas.length === 1) return vistas[0];
  return vistas.sort().map(function (u) { return u.replace(/^Clínica Demo - /, ''); }).join(', '); // MODO DEMO: prefixo fictício
}

function isExcludedProfessional(nome) {
  if (!nome) return false;
  var n = String(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  // 06/10/2026: profissionais fora do painel (decisão do proprietário). Mesma lista no banco (02_metricas.sql).
  // MODO DEMO: nomes reais da lista trocados por um fictício.
  return n === 'PROFISSIONAL TESTE';
}

function agrupar(registros, chave) {
  var g = {};
  registros.forEach(function(r) {
    var k = r[chave] || 'Não informado';
    if (!g[k]) {
      g[k] = {
        totalSlots: 0,
        totalScheduled: 0,
        totalMarked: 0,
        totalPresentes: 0,
        totalFree: 0,
        totalBlocked: 0,
        totalExtra: 0,
        totalEncSlots: 0,
        totalNoShow: 0,
        totalDesmarc: 0,
        totalAgTotal: 0,
        totalRepresentantes: 0
      };}
    g[k].totalSlots     += r['Capacidade Total (slots)'] || 0;
    g[k].totalScheduled += r['Slots Agendados (total c/ retornos)'] || 0;
    g[k].totalMarked    += r['Agendamentos Marcados'] || 0;
    g[k].totalPresentes += r['Agendamentos'] || 0;
    g[k].totalBlocked   += r['Bloqueios (slots)'] || 0;
    g[k].totalExtra     += r['Encaixes (atendimentos)'] || 0;
    g[k].totalEncSlots  += r['Encaixes (slots por tempo)'] || 0;
    g[k].totalNoShow    += r['Faltas (no-show)'] || 0;
    g[k].totalDesmarc   += r['Desmarcados(Slot)'] || 0;
    g[k].totalAgTotal   += r['Agendados nova'] || 0;
    g[k].totalRepresentantes += r['Representantes'] || 0;
    // 02/10/2026: livres = soma dos livres por slot de cada bloco (mesma regra do card Livres e dos Registros
    // Detalhados). A conta antiga (capacidade − bloqueios − marcados − faltas) não liberava o desmarcado e divergia
    // do card (ex.: um profissional em 01/10: card 5, tabela 3). MODO DEMO: nome do exemplo removido.
    g[k].totalFree      += r['Slots Livres'] || 0;
  });
  return g;
}

// 05/10/2026 — as três taxas (decisão do proprietário). Mesmo divisor: (capacidade − bloqueios).
//   Taxa de Ocupação       = agendados ÷ (capacidade − bloqueios) (a de sempre, do n8n)
//   Taxa de Agendamento    = (agendados + faltas) ÷ (capacidade − bloqueios) — horário reservado, mesmo com falta
//   Preenchimento da Grade = (capacidade − bloqueios − livres) ÷ (capacidade − bloqueios) — o que não ficou livre na Feegow
function calcAgendamento(scheduled, noShow, totalSlots, blocked) {
  var available = totalSlots - blocked;
  if (available <= 0) return 0;
  return Math.min(100, ((scheduled + noShow) / available) * 100);
}
function calcPreenchimento(free, totalSlots, blocked) {
  var available = totalSlots - blocked;
  if (available <= 0) return 0;
  return Math.max(0, Math.min(100, ((available - free) / available) * 100));
}

function calcOcupacao(scheduled, totalSlots, blocked) {
  var available = totalSlots - blocked;
  if (available <= 0) return 0;
  var pct = (scheduled / available) * 100;
  return pct > 100 ? 100 : pct;
}

function filtrarGruposParaIA(grupos) {
  var filtrados = {};
  Object.keys(grupos || {}).forEach(function(nome) {
    var d = grupos[nome] || {};
    var occ = calcOcupacao(d.totalScheduled || 0, d.totalSlots || 0, d.totalBlocked || 0);
    if (occ > 0) filtrados[nome] = d;
  });
  return filtrados;
}

function render() {
  var di = document.getElementById('dataInicio').value;
  var df = document.getElementById('dataFim').value;
  if (!di || !df) { alert('Selecione datas válidas.'); return; }

  var isInvalidRange = di > df;
  var yearStart = parseInt(di.substring(0, 4), 10) || 0;
  var yearEnd = parseInt(df.substring(0, 4), 10) || 0;
  var priorDi = shiftIsoDateByYears(di, -1);
  var priorDf = shiftIsoDateByYears(df, -1);
  // 01/10/2026: o mês de comparação é escolhido pelo usuário (seletor do botão "Comparar mês").
  // Padrão = mês anterior; se o escolhido coincidir com o mês selecionado, volta ao anterior.
  var momBase = window.__MOM_BASE || '';
  var mesSelecionado = di.substring(0, 7);
  if (!/^\d{4}-\d{2}$/.test(momBase) || momBase === mesSelecionado) momBase = shiftIsoDateByMonths(di, -1).substring(0, 7);
  var momDi = momBase + '-01';
  var momDf = ultimoDiaDoMes(momBase);
  window.__MOM_INFO = { selecionado: mesSelecionado, base: momBase };

  var filtrado = isInvalidRange ? [] : window.DADOS.filter(function(r) { return r.Data >= di && r.Data <= df; });
  filtrado = filtrado.filter(function(r) { return !isExcludedProfessional(r.Profissional); });
  var profVal = profsSelecionados(); // 02/10/2026: lista (vazia = todos)
  var uniVal  = unisSelecionadas(); // 06/10/2026: lista (vazia = todas)
  if (profVal.length) filtrado = filtrado.filter(function(r){ return profNoFiltro(r.Profissional, profVal); });
  if (uniVal.length) filtrado = filtrado.filter(function(r){ return uniNoFiltro(r.Unidade, uniVal); });

  var baseFiltrado = isInvalidRange ? [] : window.DADOS.filter(function(r) { return r.Data >= priorDi && r.Data <= priorDf; });
  baseFiltrado = baseFiltrado.filter(function(r) { return !isExcludedProfessional(r.Profissional); });
  if (profVal.length) baseFiltrado = baseFiltrado.filter(function(r){ return profNoFiltro(r.Profissional, profVal); });
  if (uniVal.length) baseFiltrado = baseFiltrado.filter(function(r){ return uniNoFiltro(r.Unidade, uniVal); });

  var momFiltrado = isInvalidRange ? [] : window.DADOS.filter(function(r) { return r.Data >= momDi && r.Data <= momDf; });
  momFiltrado = momFiltrado.filter(function(r) { return !isExcludedProfessional(r.Profissional); });
  if (profVal.length) momFiltrado = momFiltrado.filter(function(r){ return profNoFiltro(r.Profissional, profVal); });
  if (uniVal.length) momFiltrado = momFiltrado.filter(function(r){ return uniNoFiltro(r.Unidade, uniVal); });

  var hasDataInRange = filtrado.length > 0;
  var hasBaseDataInRange = baseFiltrado.length > 0;
  var hasMoMDataInRange = momFiltrado.length > 0;
  var isFullMonthRange = isCompleteMonthRange(di, df);
  var allowYoY = !isInvalidRange && hasDataInRange && hasBaseDataInRange;
  var allowMoM = !isInvalidRange && hasDataInRange && isFullMonthRange && hasMoMDataInRange;
  var periodReason = '';
  if (isInvalidRange) {
    periodReason = 'Período inválido: a data inicial é maior que a data final.';
  } else if (!hasDataInRange) {
    periodReason = 'Sem dados no período selecionado para os filtros atuais.';
  } else if (!hasBaseDataInRange && !hasMoMDataInRange) {
    periodReason = 'Sem histórico comparável para PY e MOM no período selecionado.';
  } else if (!hasBaseDataInRange) {
    periodReason = 'Sem histórico equivalente no ano anterior para este mesmo período.';
  } else if (!hasMoMDataInRange) {
    periodReason = 'Sem histórico equivalente no mês anterior para este mesmo período.';
  }
  window.__CHAT_PERIOD_STATE = {
    di: di,
    df: df,
    priorDi: priorDi,
    priorDf: priorDf,
    momDi: momDi,
    momDf: momDf,
    yearStart: yearStart,
    yearEnd: yearEnd,
    isInvalidRange: isInvalidRange,
    hasDataInRange: hasDataInRange,
    hasBaseDataInRange: hasBaseDataInRange,
    hasMoMDataInRange: hasMoMDataInRange,
    isFullMonthRange: isFullMonthRange,
    allowYoY: allowYoY,
    allowMoM: allowMoM,
    profFilter: profVal,
    uniFilter: uniVal,
    reason: periodReason
  };

  var atualResumo = summarizeRows(filtrado);
  var baseResumo = summarizeRows(baseFiltrado);
  var slots = atualResumo.slots;
  var sched = atualResumo.sched;
  var marked = atualResumo.marked;
  var bloq = atualResumo.bloq;
  var enc = atualResumo.enc;
  var encSlots = atualResumo.encSlots;
  var noshow = atualResumo.noshow;
  var presentes = atualResumo.presentes;
  var desm = atualResumo.desm;
  var agTotal = atualResumo.agTotal;
  var repres = atualResumo.repres;
  var free = atualResumo.free;
  var occGeral = atualResumo.occ;

  var labelPacientes = 'Pacientes agendados';
  var subPacientes = '1 por agendamento válido (não são pacientes únicos)';
  if (df < HOJE && di < HOJE) {
    labelPacientes = 'Pacientes Presentes';
    subPacientes = '1 por agendamento válido (não são pacientes únicos)';
  } else if (di <= HOJE && df >= HOJE) {
    labelPacientes = 'Total de pacientes no período';
    subPacientes = '1 por agendamento válido (não são pacientes únicos)';
  }

  var canShowComparePy = !isInvalidRange && hasDataInRange && hasBaseDataInRange;
  var canShowCompareMom = !isInvalidRange && hasDataInRange && isFullMonthRange && hasMoMDataInRange;

  var mode = window.__COMPARE_MODE || 'none';
  if (mode === 'py' && !canShowComparePy) mode = 'none';
  if (mode === 'mom' && !canShowCompareMom) mode = 'none';
  window.__COMPARE_MODE = mode;
  var comparePyActive = mode === 'py';
  var compareMomActive = mode === 'mom';
  var compareActive = comparePyActive || compareMomActive;

  var baseComparacaoResumo = compareMomActive ? summarizeRows(momFiltrado) : baseResumo;
  var baseComparacaoLabel = compareMomActive ? 'vs ' + nomeMesCurto(momBase) : 'vs mesmo período de ' + priorDi.substring(0, 4);
  // Para quem mais acompanha a comparação (linha "Qualidade da agenda")
  window.__COMPARE_BASE = compareActive
    ? { di: compareMomActive ? momDi : priorDi, df: compareMomActive ? momDf : priorDf, label: baseComparacaoLabel }
    : null;
  // Meses com dados (com os filtros de profissional/unidade), para o seletor apagar os vazios
  var mesesComDados = {};
  window.DADOS.forEach(function(r) {
    if (isExcludedProfessional(r.Profissional)) return;
    if (!profNoFiltro(r.Profissional, profVal)) return;
    if (!uniNoFiltro(r.Unidade, uniVal)) return;
    mesesComDados[String(r.Data).substring(0, 7)] = true;
  });
  window.__MOM_INFO.comDados = mesesComDados;
  window.__MOM_INFO.podeComparar = !isInvalidRange && hasDataInRange && isFullMonthRange;

  var btnComparePy = document.getElementById('btnComparePY');
  if (btnComparePy) {
    btnComparePy.style.display = canShowComparePy ? '' : 'none';
    btnComparePy.classList.toggle('is-active', comparePyActive);
    btnComparePy.setAttribute('aria-pressed', comparePyActive ? 'true' : 'false');
  }
  var btnCompareMom = document.getElementById('btnCompareMOM');
  if (btnCompareMom) {
    // Aparece com qualquer mês completo selecionado (o mês base é escolhido no seletor)
    btnCompareMom.style.display = window.__MOM_INFO.podeComparar ? '' : 'none';
    btnCompareMom.classList.toggle('is-active', compareMomActive);
    btnCompareMom.setAttribute('aria-pressed', compareMomActive ? 'true' : 'false');
    var hintMom = btnCompareMom.querySelector('.btn-compare-hint');
    if (hintMom) hintMom.textContent = compareMomActive ? 'vs ' + nomeMesCurto(momBase) : 'Escolher mês';
  }

  var kpiItems = [
    {
      key: 'capacidade',
      icon:'📋',
      color:'var(--text1)', // 09/10/2026: segue o tema (no escuro continua #f1f5f9)
      label:'Capacidade Total',
      value:fNum(slots),
      pyValue:fNum(baseComparacaoResumo.slots),
      sub:'Capacidade total de agendamentos por "slot"',
      showPct:false
    },
    {
      key: 'agTotais',
      icon:'🧮',
      color:'#ec4899',
      label:'Agendamentos Totais',
      value:fNum(agTotal),
      pyValue:fNum(baseComparacaoResumo.agTotal),
      sub:'Todos os agendamentos totais no período, contabilizando Marcados, Faltas e Desmarcados por "slot"',
      showPct:false
    },
    {
      key: 'agMarcados',
      icon:'📅',
      color:'#3b82f6',
      label:'Agendamentos Marcados',
      value:fNum(marked),
      pyValue:fNum(baseComparacaoResumo.marked),
      sub:'Marcados, confirmados, atendidos e retornos, em horários ("slots")',
      showPct:true,
      pct:safeRatio(marked, slots) * 100,
      pctText:fPct(safeRatio(marked, slots) * 100),
      pctTitle:fPct(safeRatio(marked, slots) * 100) + ' da capacidade total. Base diferente das taxas de ocupação, agendamento e preenchimento, que usam capacidade − bloqueios.'
    },
    {
      key: 'faltas',
      icon:'❌',
      color:'#ef4444',
      label:'Faltas',
      value:fNum(noshow),
      pyValue:fNum(baseComparacaoResumo.noshow),
      sub:'Horários ("slots") de quem não compareceu, pela duração',
      showPct:true,
      pct:safeRatio(noshow, slots) * 100,
      pctText:fPct(safeRatio(noshow, slots) * 100),
      pctTitle:fPct(safeRatio(noshow, slots) * 100) + ' da capacidade total. Base diferente das taxas de ocupação, agendamento e preenchimento, que usam capacidade − bloqueios.'
    },
    {
      key: 'desmarcados',
      icon:'🚫',
      color:'#f97316',
      label:'Desmarcados',
      value:fNum(desm),
      pyValue:fNum(baseComparacaoResumo.desm),
      sub:'Pacientes desmarcados',
      showPct:false
    },
    {
      key: 'bloqueios',
      icon:'🔒',
      color:'#64748b',
      label:'Bloqueios',
      value:fNum(bloq),
      pyValue:fNum(baseComparacaoResumo.bloq),
      sub:'Horários bloqueados',
      showPct:true,
      pct:safeRatio(bloq, slots) * 100,
      pctText:fPct(safeRatio(bloq, slots) * 100),
      pctTitle:fPct(safeRatio(bloq, slots) * 100) + ' da capacidade total. Base diferente das taxas de ocupação, agendamento e preenchimento, que usam capacidade − bloqueios.'
    },
    {
      key: 'encaixes',
      icon:'➕',
      color:'#f59e0b',
      label:'Encaixes',
      value:fNum(enc),
      pyValue:fNum(baseComparacaoResumo.enc),
      sub:'Pacientes agendados como encaixe por "slot"',
      showPct:false
    },
    {
      key: 'livres',
      icon:'🪑',
      color:'#22c55e',
      label:'Livres',
      value:fNum(free),
      pyValue:fNum(baseComparacaoResumo.free),
      sub:'Horários livres',
      showPct:true,
      pct:safeRatio(free, slots) * 100,
      pctText:fPct(safeRatio(free, slots) * 100),
      pctTitle:fPct(safeRatio(free, slots) * 100) + ' da capacidade total. Base diferente das taxas de ocupação, agendamento e preenchimento, que usam capacidade − bloqueios.'
    },
    {
      key: 'pacientes',
      icon:'✅',
      color:'#8b5cf6',
      label:labelPacientes,
      value:fNum(presentes),
      pyValue:fNum(baseComparacaoResumo.presentes),
      sub:subPacientes,
      showPct:false
    },
    {
      key: 'representantes',
      icon:'🧑‍🤝‍🧑',
      color:'#06b6d4',
      label:'Representantes',
      value:fNum(repres),
      pyValue:fNum(baseComparacaoResumo.repres),
      sub:'Atendimentos realizados por representante',
      showPct:false
    }
  ];
  var kpiSummary = 'KPIs da dashboard (período ' + di + ' até ' + df + '):\n' +
    '- Capacidade Total: ' + fNum(slots) + '\n' +
    '- Agendamentos Totais: ' + fNum(agTotal) + '\n' +
    '- Agendamentos Marcados: ' + fNum(marked) + '\n' +
    '- Faltas: ' + fNum(noshow) + '\n' +
    '- Desmarcados: ' + fNum(desm) + '\n' +
    '- Bloqueios: ' + fNum(bloq) + '\n' +
    '- Encaixes: ' + fNum(enc) + '\n' +
    '- Livres: ' + fNum(free) + '\n' +
    '- ' + labelPacientes + ': ' + fNum(presentes) + '\n' +
    '- Representantes: ' + fNum(repres) + '\n' +
    '- Ocupação Geral: ' + fPct(occGeral);
  var kpiHtml = '';
  for (var i = 0; i < kpiItems.length; i++) {
    var k = kpiItems[i];
    var pctBar = Math.max(0, Math.min(100, k.pct || 0));
    var progressHtml = '';
    if (k.showPct) {
      progressHtml = '<div class="kpi-progress-row" data-dica="' + escH(k.pctTitle) + '">' +
        '<div class="kpi-progress-track"><span class="kpi-progress-fill" data-width="' + pctBar.toFixed(1) + '%"></span></div>' +
        '<div class="kpi-progress-pct" title="' + escH(k.pctTitle) + '">' + k.pctText + '</div>' +
      '</div>';
    }

    var pyHtml = '';
    if (compareActive) {
      var pyBase = Number(k.pyValue || 0);
      var curVal = Number(k.value || 0);
      var delta = curVal - pyBase;
      var deltaClass = delta > 0 ? 'pos' : (delta < 0 ? 'neg' : 'eq');
      var deltaPct = 0;
      if (pyBase !== 0) {
        deltaPct = (delta / pyBase) * 100;
      } else if (curVal > 0) {
        deltaPct = 100;
      }
      var arrow = delta > 0 ? '▲' : (delta < 0 ? '▼' : '●');
      var deltaText = arrow + ' ' + Math.abs(deltaPct).toFixed(1) + '%';
      pyHtml = '<div class="kpi-py-wrap">' +
        '<span class="kpi-py-base">' + baseComparacaoLabel + ': ' + fNum(pyBase) + '</span>' +
        '<span class="kpi-py-delta ' + deltaClass + '">' + deltaText + '</span>' +
      '</div>';
    }

    kpiHtml += '<div class="kpi-card" data-label="' + k.label + '" style="--kpi-accent:' + k.color + '">' +
      '<div class="kpi-top"><span class="kpi-icon">' + k.icon + '</span><span class="kpi-label">' + k.label + '</span></div>' +
      '<div class="kpi-value" style="color:' + k.color + '">' + k.value + '</div>' +
      pyHtml +
      '<div class="kpi-sub">' + k.sub + '</div>' +
      progressHtml +
      '</div>';
  }
  document.getElementById('kpiContainer').innerHTML = kpiHtml;
  document.querySelectorAll('#kpiContainer .kpi-progress-fill[data-width]').forEach(function(fill) {
    requestAnimationFrame(function() {
      fill.style.width = fill.getAttribute('data-width');
    });
  });
  window.__KPI_SUMMARY = kpiSummary;

  document.getElementById('occPct').textContent = fPct(occGeral);
  document.getElementById('occBar').style.width = occGeral + '%';
  // 05/10/2026: Taxa de Agendamento e Preenchimento da Grade, ao lado da Taxa de Ocupação
  (function () {
    var el = document.getElementById('occExtra');
    if (!el) return;
    var item = function (rotulo, valor, base, dica) {
      var chip = '';
      if (compareActive && base !== null) {
        var dlt = valor - base;
        chip = '<span class="occ-extra-delta ' + (dlt > 0 ? 'up' : dlt < 0 ? 'down' : 'eq') + '">' +
          (dlt > 0 ? '▲' : dlt < 0 ? '▼' : '●') + ' ' + Math.abs(dlt).toFixed(1) + ' p.p.</span>';
      }
      return '<div class="occ-extra-item" data-dica="' + dica + '"><span class="occ-extra-rotulo">' + rotulo + '</span>' +
        '<span class="occ-extra-valor">' + fPct(valor) + '</span>' + chip +
        '<div class="occ-extra-trilho"><div style="width:' + Math.min(valor, 100) + '%"></div></div></div>';
    };
    el.innerHTML =
      item('Taxa de Agendamento', atualResumo.agend, compareActive ? baseComparacaoResumo.agend : null, DICA_AGENDAMENTO) +
      item('Preenchimento da Grade', atualResumo.preench, compareActive ? baseComparacaoResumo.preench : null, DICA_PREENCHIMENTO);
  })();

  // 07/10/2026: o pedaço amarelo de encaixes saiu da barra (decisão do proprietário: com as três taxas não faz mais
  // sentido). Encaixes continuam no card próprio; o Preenchimento da Grade já os inclui.
  var encBar = document.getElementById('occEncBar');
  if (encBar) { encBar.style.width = '0%'; encBar.parentNode.classList.remove('tem-encaixe'); }
  // Explicação do card (aparece ao passar o mouse), com os números do filtro atual.
  // Números do filtro atual, linha a linha, com uma minibarra nas mesmas cores do card.
  var linhaInfo = function (k, v, cls, destaque) {
    return '<div class="occ-info-linha' + (destaque ? ' destaque' : '') + '"><span class="k">' + k + '</span>' +
      '<span class="v' + (cls ? ' ' + cls : '') + '">' + v + '</span></div>';
  };
  // 08/10/2026: números exatos, com os mesmos nomes do painel (nada de "disponíveis": é capacidade − bloqueios)
  var capMenosBloq = slots - bloq;
  var faltasF = atualResumo.noshow, livresF = atualResumo.free;
  var numInfo = function (k, v, destaque) {
    return '<div class="occ-info-num' + (destaque ? ' destaque' : '') + '"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
  };
  var contaInfo = function (id, conta, pct) {
    document.getElementById(id).innerHTML = capMenosBloq > 0
      ? '<span class="k">' + conta + '</span><span class="v">' + fPct(pct) + '</span>'
      : '<span class="k">sem horários no filtro</span><span class="v">—</span>';
  };
  contaInfo('occContaOcup', fNum(sched) + ' ÷ ' + fNum(capMenosBloq), occGeral);
  contaInfo('occContaAgend', '(' + fNum(sched) + ' + ' + fNum(faltasF) + ') ÷ ' + fNum(capMenosBloq), atualResumo.agend);
  contaInfo('occContaPreench', '(' + fNum(capMenosBloq) + ' − ' + fNum(livresF) + ') ÷ ' + fNum(capMenosBloq), atualResumo.preench);
  document.getElementById('occInfoAgora').innerHTML =
    '<div class="occ-info-agora-titulo">Neste filtro</div><div class="occ-info-regua">' +
    numInfo('Capacidade', fNum(slots)) +
    numInfo('Bloqueios', fNum(bloq)) +
    numInfo('Capacidade − bloqueios', fNum(capMenosBloq), true) +
    numInfo('Agendados', fNum(sched)) +
    numInfo('Faltas', fNum(faltasF)) +
    numInfo('Livres', fNum(livresF)) + '</div>';
  if (compareActive) {
    var deltaOccPy = occGeral - baseComparacaoResumo.occ;
    var arrowOcc = deltaOccPy > 0 ? '▲' : (deltaOccPy < 0 ? '▼' : '●');
    var clsOcc = deltaOccPy > 0 ? 'up' : (deltaOccPy < 0 ? 'down' : 'eq');
    document.getElementById('occAvg').innerHTML =
      '<span class="occ-avg-wrap">' +
        '<span class="occ-avg-main">MÉDIA: ' + fPct(occGeral) + '</span>' +
        '<span class="occ-avg-chip base">Base ' + fPct(baseComparacaoResumo.occ) + '</span>' +
        '<span class="occ-avg-chip ' + clsOcc + '">' + arrowOcc + ' ' + Math.abs(deltaOccPy).toFixed(1) + ' p.p.</span>' + // diferença de ocupação: pontos percentuais
        '<span class="occ-avg-chip base">' + baseComparacaoLabel + '</span>' +
      '</span>';
  } else {
    document.getElementById('occAvg').textContent = 'MÉDIA DO PERÍODO: ' + fPct(occGeral);
  }

  var diffDays = Math.ceil(Math.abs(new Date(df + 'T00:00:00') - new Date(di + 'T00:00:00')) / (1000 * 60 * 60 * 24));
  var isMensal = diffDays > 60;
  
  var elTitTempo = document.getElementById('tituloUniTempo');
  var elSideTempo = document.getElementById('sideUniTempo');
  var elThTempo = document.getElementById('thTempoLabel');
  if (elTitTempo) elTitTempo.textContent = isMensal ? 'Por unidade mensal' : 'Por unidade semanal';
  if (elSideTempo) elSideTempo.textContent = isMensal ? 'Por unidade mensal' : 'Por unidade semanal';
  if (elThTempo) elThTempo.textContent = isMensal ? 'Mês' : 'Semana';

  if (typeof window.updateChatMenu === 'function') {
      window.updateChatMenu(isMensal, window.__CHAT_PERIOD_STATE);
  }

  filtrado.forEach(function(r) {
    var tInfo = getTempoInfo(r.Data, isMensal);
    var uni = r.Unidade || '—';
    r._UniTempo = uni + "|||" + tInfo.label + "|||" + tInfo.sort;
  });

  var porProf  = agrupar(filtrado, 'Profissional');
  var porUni   = agrupar(filtrado, 'Unidade');
  var porPer   = agrupar(filtrado, 'Período');
  var porDia   = agrupar(filtrado, 'Dia da Semana');
  var porUniTempo = agrupar(filtrado, '_UniTempo');
  var porProfIA = filtrarGruposParaIA(porProf);
  var porUniIA = filtrarGruposParaIA(porUni);
  var porPerIA = filtrarGruposParaIA(porPer);
  var porDiaIA = filtrarGruposParaIA(porDia);
  var porUniTempoIA = filtrarGruposParaIA(porUniTempo);

  // Tabela Profissionais
  var profRows = '';
  var resumoProf = 'Resumo por Profissional:\n';
  var profEntries = Object.entries(porProf);
  var profEntriesIA = Object.entries(porProfIA);
    if (profEntries.length === 0) {
      profRows = '<tr><td colspan="15"><div class="empty-state"><div class="empty-icon">📭</div>Nenhum registro no período selecionado.</div></td></tr>';
  } else {
    function cls(val, base) { return 'num ' + base; }
    for (var j = 0; j < profEntries.length; j++) {
      var entry = profEntries[j];
      var nome = entry[0];
      var d = entry[1];
      var unidade = unidadesDoProfissional(filtrado, nome);
      var occ = calcOcupacao(d.totalScheduled, d.totalSlots, d.totalBlocked);
      profRows += '<tr>' +
        '<td><div class="prof-cell">' +
        '<span class="prof-name">' + escH(nome) + '</span>' +
        '</div></td>' +
        '<td class="c-muted">' + escH(unidade) + '</td>' +
        '<td class="num">' + fNum(d.totalSlots) + '</td>' +
        '<td class="' + cls(d.totalAgTotal, 'c-pink') + ' agTotCol" style="font-weight:700">' + fNum(d.totalAgTotal) + '</td>' +
        '<td class="' + cls(d.totalMarked, 'c-blue') + ' agAtendCol" style="font-weight:700">' + fNum(d.totalMarked) + '</td>' +
        '<td class="' + cls(d.totalPresentes, 'c-purple') + '" style="font-weight:700">' + fNum(d.totalPresentes) + '</td>' +
        '<td class="' + cls(d.totalRepresentantes, 'c-cyan') + '">' + fNum(d.totalRepresentantes) + '</td>' +
        '<td class="' + cls(d.totalFree, 'c-green') + '">' + fNum(d.totalFree) + '</td>' +
        '<td class="' + cls(d.totalBlocked, 'c-muted') + '">' + fNum(d.totalBlocked) + '</td>' +
        '<td class="' + cls(d.totalExtra, 'c-amber') + '">' + fNum(d.totalExtra) + '</td>' +
        '<td class="' + cls(d.totalDesmarc, 'c-orange') + '">' + fNum(d.totalDesmarc) + '</td>' +
        '<td class="' + cls(d.totalNoShow, 'c-red') + '" style="font-weight:700">' + fNum(d.totalNoShow) + '</td>' +
        // 07/10/2026: sem o +X% de encaixes; 08/10: as três taxas com o mesmo medidor em todas as tabelas
        tresTaxas(d.totalScheduled, d.totalNoShow, d.totalFree, d.totalSlots, d.totalBlocked) +
        '</tr>';
    }
  }
  document.getElementById('tbProf').innerHTML = profRows;
  for (var jIA = 0; jIA < profEntriesIA.length; jIA++) {
    var entryIA = profEntriesIA[jIA];
    var nomeIA = entryIA[0];
    var dIA = entryIA[1];
    var unidadeIA = unidadesDoProfissional(filtrado, nomeIA);
    var occIA = calcOcupacao(dIA.totalScheduled, dIA.totalSlots, dIA.totalBlocked);
    resumoProf += '- Profissional: ' + nomeIA + ' | Unidade: ' + unidadeIA + ' | Ocupação: ' + fPct(occIA) + ' | Capacidade: ' + fNum(dIA.totalSlots) + ' | Confirmados: ' + fNum(dIA.totalScheduled) + ' | Faltas: ' + fNum(dIA.totalNoShow) + '\n';
  }
  window.__RESUMO_PROF = resumoProf;

  // Cards Unidade (✅ agora com as métricas solicitadas)
  var uniHtml = '';
  var resumoUni = 'Resumo por Unidade:\n';
  var uniEntries = Object.entries(porUni);
  var uniEntriesIA = Object.entries(porUniIA);
  for (var u = 0; u < uniEntries.length; u++) {
    var entry = uniEntries[u];
    var uni = entry[0];
    var d = entry[1];
    var occ = calcOcupacao(d.totalScheduled, d.totalSlots, d.totalBlocked);
    var c = occColor(occ);
    uniHtml += '<div class="info-card">' +
      '<div class="info-card-header">' +
      '<div class="info-card-icon">🏥</div>' +
      '<span class="info-card-pct" style="color:' + c + '">' + fPct(occ) + '</span>' +
      '</div>' +
      '<div class="info-card-title">' + escH(uni) + '</div>' +

      '<div class="info-card-row"><span class="lbl">Capacidade</span><span class="val">' + fNum(d.totalSlots) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Agendamentos Totais</span><span class="val">' + fNum(d.totalAgTotal) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Agendamentos confirmados</span><span class="val">' + fNum(d.totalScheduled) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Total de Pacientes</span><span class="val">' + fNum(d.totalPresentes) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Representantes</span><span class="val">' + fNum(d.totalRepresentantes) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Livres</span><span class="val">' + fNum(d.totalFree) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Bloqueios</span><span class="val">' + fNum(d.totalBlocked) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Faltas</span><span class="val">' + fNum(d.totalNoShow) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Taxa de ocupação</span><span class="val" style="color:' + c + '">' + fPct(occ) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Taxa de agendamento</span><span class="val">' + fPct(calcAgendamento(d.totalScheduled, d.totalNoShow, d.totalSlots, d.totalBlocked)) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Preenchimento da grade</span><span class="val">' + fPct(calcPreenchimento(d.totalFree, d.totalSlots, d.totalBlocked)) + '</span></div>' +

      '<div class="info-card-bar"><div class="info-card-bar-fill" style="width:' + occ + '%;background:' + c + '"></div></div>' +
      '</div>';
  }
  document.getElementById('cardUnidade').innerHTML = uniHtml || '<p style="color:var(--text4);font-size:13px">Nenhum dado no período.</p>';
  for (var uIA = 0; uIA < uniEntriesIA.length; uIA++) {
    var entryUniIA = uniEntriesIA[uIA];
    var uniIA = entryUniIA[0];
    var dUniIA = entryUniIA[1];
    var occUniIA = calcOcupacao(dUniIA.totalScheduled, dUniIA.totalSlots, dUniIA.totalBlocked);
    resumoUni += '- Unidade: ' + uniIA + ' | Ocupação: ' + fPct(occUniIA) + ' | Capacidade: ' + fNum(dUniIA.totalSlots) + ' | Confirmados: ' + fNum(dUniIA.totalScheduled) + ' | Faltas: ' + fNum(dUniIA.totalNoShow) + '\n';
  }
  window.__RESUMO_UNI = resumoUni;

  // Tabela Unidade Semanal/Mensal
  var uniTempoRows = '';
  var resumoUniTempo = 'Evolução por Unidade:\n';
  var utEntries = Object.entries(porUniTempo);
  var utEntriesIA = Object.entries(porUniTempoIA);
  if (utEntries.length === 0) {
    uniTempoRows = '<tr><td colspan="15"><div class="empty-state"><div class="empty-icon">📭</div>Nenhum registro no período selecionado.</div></td></tr>';
  } else {
    utEntries.sort(function(a, b) {
      var partsA = a[0].split('|||');
      var partsB = b[0].split('|||');
      if (partsA[0] !== partsB[0]) return partsA[0].localeCompare(partsB[0]);
      return partsA[2].localeCompare(partsB[2]);
    });
    
    for (var j = 0; j < utEntries.length; j++) {
      var entry = utEntries[j];
      var partes = entry[0].split('|||');
      var unidade = partes[0] || '—';
      var tempoLbl = partes[1] || '—';
      var d = entry[1];
      var occ = calcOcupacao(d.totalScheduled, d.totalSlots, d.totalBlocked);
      uniTempoRows += '<tr>' +
        '<td style="font-weight:700;color:var(--text1)">' + escH(unidade) + '</td>' +
        '<td class="c-muted">' + escH(tempoLbl) + '</td>' +
        '<td class="num">' + fNum(d.totalSlots) + '</td>' +
        '<td class="' + cls(d.totalAgTotal, 'c-pink') + ' agTotCol" style="font-weight:700">' + fNum(d.totalAgTotal) + '</td>' +
        '<td class="' + cls(d.totalMarked, 'c-blue') + ' agAtendCol" style="font-weight:700">' + fNum(d.totalMarked) + '</td>' +
        '<td class="' + cls(d.totalPresentes, 'c-purple') + '" style="font-weight:700">' + fNum(d.totalPresentes) + '</td>' +
        '<td class="' + cls(d.totalRepresentantes, 'c-cyan') + '">' + fNum(d.totalRepresentantes) + '</td>' +
        '<td class="' + cls(d.totalFree, 'c-green') + '">' + fNum(d.totalFree) + '</td>' +
        '<td class="' + cls(d.totalBlocked, 'c-muted') + '">' + fNum(d.totalBlocked) + '</td>' +
        '<td class="' + cls(d.totalExtra, 'c-amber') + '">' + fNum(d.totalExtra) + '</td>' +
        '<td class="' + cls(d.totalDesmarc, 'c-orange') + '">' + fNum(d.totalDesmarc) + '</td>' +
        '<td class="' + cls(d.totalNoShow, 'c-red') + '" style="font-weight:700">' + fNum(d.totalNoShow) + '</td>' +
        tresTaxas(d.totalScheduled, d.totalNoShow, d.totalFree, d.totalSlots, d.totalBlocked) +
        '</tr>';
    }
  }
  document.getElementById('tbUniTempo').innerHTML = uniTempoRows;
  utEntriesIA.sort(function(a, b) {
    var partsAIA = a[0].split('|||');
    var partsBIA = b[0].split('|||');
    if (partsAIA[0] !== partsBIA[0]) return partsAIA[0].localeCompare(partsBIA[0]);
    return partsAIA[2].localeCompare(partsBIA[2]);
  });
  for (var jUtIA = 0; jUtIA < utEntriesIA.length; jUtIA++) {
    var entryUtIA = utEntriesIA[jUtIA];
    var partesIA = entryUtIA[0].split('|||');
    var unidadeTempoIA = partesIA[0] || '—';
    var tempoLblIA = partesIA[1] || '—';
    var dTempoIA = entryUtIA[1];
    var occTempoIA = calcOcupacao(dTempoIA.totalScheduled, dTempoIA.totalSlots, dTempoIA.totalBlocked);
    resumoUniTempo += '- Unidade: ' + unidadeTempoIA + ' | Período: ' + tempoLblIA + ' | Ocupação: ' + fPct(occTempoIA) + ' | Capacidade: ' + fNum(dTempoIA.totalSlots) + ' | Confirmados: ' + fNum(dTempoIA.totalScheduled) + ' | Faltas: ' + fNum(dTempoIA.totalNoShow) + '\n';
  }
  window.__RESUMO_UNITEMPO = resumoUniTempo;

  // Cards Período (✅ agora com as métricas solicitadas)
  var resumoPer = 'Resumo por Período:\n';
  var periodoConfig = { 'Manhã': { icon:'🌅' }, 'Tarde': { icon:'🌆' }, 'Noite': { icon:'🌙' } };
  function statusPeriodo(pct) {
    if (pct >= 85) return { label:'Crítico', bg:'#052e16', color:'#22c55e' };
    if (pct >= 60) return { label:'Normal',  bg:'#172554', color:'#3b82f6' };
    return              { label:'Ocioso',  bg:'#431407', color:'#f97316' };
  }
  var perHtml = '';
  var perEntries = Object.entries(porPer);
  var perEntriesIA = Object.entries(porPerIA);
  for (var p = 0; p < perEntries.length; p++) {
    var entry = perEntries[p];
    var per = entry[0];
    var d = entry[1];
    var occ = calcOcupacao(d.totalScheduled, d.totalSlots, d.totalBlocked);
    var st = statusPeriodo(occ);
    var icon = periodoConfig[per] ? periodoConfig[per].icon : '⏰';
    perHtml += '<div class="info-card">' +
      '<div class="info-card-header">' +
      '<div class="info-card-icon">' + icon + '</div>' +
      '<span class="info-card-pct" style="color:' + st.color + '">' + fPct(occ) + '</span>' +
      '</div>' +
      '<div class="info-card-title">' + escH(per) + '</div>' +
      '<div><span class="badge" style="background:' + st.bg + ';color:' + st.color + ';border:1px solid ' + st.color + '40">' + st.label + '</span></div>' +

      '<div class="info-card-row" style="margin-top:10px"><span class="lbl">Capacidade</span><span class="val">' + fNum(d.totalSlots) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Agendamentos total</span><span class="val">' + fNum(d.totalAgTotal) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Agendamentos confirmados</span><span class="val">' + fNum(d.totalScheduled) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Total de Pacientes</span><span class="val">' + fNum(d.totalPresentes) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Representantes</span><span class="val">' + fNum(d.totalRepresentantes) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Livres</span><span class="val">' + fNum(d.totalFree) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Bloqueios</span><span class="val">' + fNum(d.totalBlocked) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Faltas</span><span class="val">' + fNum(d.totalNoShow) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Taxa de ocupação</span><span class="val" style="color:' + st.color + '">' + fPct(occ) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Taxa de agendamento</span><span class="val">' + fPct(calcAgendamento(d.totalScheduled, d.totalNoShow, d.totalSlots, d.totalBlocked)) + '</span></div>' +
      '<div class="info-card-row"><span class="lbl">Preenchimento da grade</span><span class="val">' + fPct(calcPreenchimento(d.totalFree, d.totalSlots, d.totalBlocked)) + '</span></div>' +

      '<div class="info-card-bar"><div class="info-card-bar-fill" style="width:' + occ + '%;background:' + st.color + '"></div></div>' +
      '</div>';
  }
  document.getElementById('cardPeriodo').innerHTML = perHtml || '<p style="color:var(--text4);font-size:13px">Nenhum dado no período.</p>';
  for (var pIA = 0; pIA < perEntriesIA.length; pIA++) {
    var entryPerIA = perEntriesIA[pIA];
    var perIA = entryPerIA[0];
    var dPerIA = entryPerIA[1];
    var occPerIA = calcOcupacao(dPerIA.totalScheduled, dPerIA.totalSlots, dPerIA.totalBlocked);
    resumoPer += '- Período: ' + perIA + ' | Ocupação: ' + fPct(occPerIA) + ' | Capacidade: ' + fNum(dPerIA.totalSlots) + ' | Confirmados: ' + fNum(dPerIA.totalScheduled) + ' | Faltas: ' + fNum(dPerIA.totalNoShow) + '\n';
  }
  window.__RESUMO_PER = resumoPer;

  // Tabela Dia da Semana
  var resumoDia = 'Resumo por Dia da Semana:\n';
  var ordemDia = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  var diaEntries = Object.entries(porDia);
  var diaEntriesIA = Object.entries(porDiaIA);
  diaEntries.sort(function(a, b) {
    var ia = ordemDia.indexOf(a[0]), ib = ordemDia.indexOf(b[0]);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  var diaRows = '';
  if (diaEntries.length === 0) {
    diaRows = '<tr><td colspan="12"><div class="empty-state"><div class="empty-icon">📭</div>Nenhum registro no período selecionado.</div></td></tr>';
  } else {
    for (var dI = 0; dI < diaEntries.length; dI++) {
      var entry = diaEntries[dI];
      var dia = entry[0];
      var d = entry[1];
      var occ = calcOcupacao(d.totalScheduled, d.totalSlots, d.totalBlocked);
      var c = occColor(occ);
      diaRows += '<tr>' +
        '<td><div style="display:flex;align-items:center;gap:9px">' +
        '<div style="width:9px;height:9px;border-radius:999px;background:' + c + ';flex-shrink:0"></div>' +
        '<strong style="color:var(--text1)">' + escH(dia) + '</strong>' +
        '</div></td>' +
        '<td class="num">' + fNum(d.totalSlots) + '</td>' +
        '<td class="' + cls(d.totalAgTotal, 'c-pink') + ' agTotCol" style="font-weight:700">' + fNum(d.totalAgTotal) + '</td>' +
        '<td class="' + cls(d.totalMarked, 'c-blue') + ' agAtendCol" style="font-weight:700">' + fNum(d.totalMarked) + '</td>' +
        '<td class="' + cls(d.totalPresentes, 'c-purple') + '" style="font-weight:700">' + fNum(d.totalPresentes) + '</td>' +
        '<td class="' + cls(d.totalRepresentantes, 'c-cyan') + '">' + fNum(d.totalRepresentantes) + '</td>' +
        '<td class="' + cls(d.totalFree, 'c-green') + '">' + fNum(d.totalFree) + '</td>' +
        '<td class="' + cls(d.totalBlocked, 'c-muted') + '">' + fNum(d.totalBlocked) + '</td>' +
        '<td class="' + cls(d.totalNoShow, 'c-red') + '" style="font-weight:700">' + fNum(d.totalNoShow) + '</td>' +
        tresTaxas(d.totalScheduled, d.totalNoShow, d.totalFree, d.totalSlots, d.totalBlocked) +
        '</tr>';
    }
  }
  document.getElementById('tbDia').innerHTML = diaRows;
  diaEntriesIA.sort(function(a, b) {
    var iaA = ordemDia.indexOf(a[0]), ibA = ordemDia.indexOf(b[0]);
    if (iaA === -1 && ibA === -1) return 0;
    if (iaA === -1) return 1;
    if (ibA === -1) return -1;
    return iaA - ibA;
  });
  for (var dIAIdx = 0; dIAIdx < diaEntriesIA.length; dIAIdx++) {
    var entryDiaIA = diaEntriesIA[dIAIdx];
    var diaIA = entryDiaIA[0];
    var dDiaIA = entryDiaIA[1];
    var occDiaIA = calcOcupacao(dDiaIA.totalScheduled, dDiaIA.totalSlots, dDiaIA.totalBlocked);
    resumoDia += '- Dia: ' + diaIA + ' | Ocupação: ' + fPct(occDiaIA) + ' | Capacidade: ' + fNum(dDiaIA.totalSlots) + ' | Confirmados: ' + fNum(dDiaIA.totalScheduled) + ' | Faltas: ' + fNum(dDiaIA.totalNoShow) + '\n';
  }
  window.__RESUMO_DIA = resumoDia;

  // Tabela Detalhada
  var detRows =  '';
  if (filtrado.length === 0) {
    detRows = '<tr><td colspan="16"><div class="empty-state"><div class="empty-icon">📭</div>Nenhum registro no período selecionado.</div></td></tr>';
  } else {
    for (var r = 0; r < filtrado.length; r++) {
      var rec = filtrado[r];
      var total = rec['Capacidade Total (slots)'];
      var blocked = rec['Bloqueios (slots)'];
      var scheduled = rec['Slots Agendados (total c/ retornos)'];
      var occ = calcOcupacao(scheduled, total, blocked);
      detRows += '<tr>' +
        '<td>' + escH(rec.Data) + '</td>' +
        '<td class="c-muted">' + escH(rec['Dia da Semana']) + '</td>' +
        '<td class="c-muted">' + escH(rec.Período) + '</td>' +
        '<td><div class="prof-cell">' +
        '<span style="font-weight:600;color:var(--text1)">' + escH(rec.Profissional) + '</span>' +
        (rec.Origem === 'estimada' ? '<span class="tag-estimada" data-dica="Grade estimada: o horário deste bloco foi calculado pelos pacientes atendidos, porque a grade original foi apagada na Feegow.">estimada</span>' : '') +
        '</div></td>' +
        '<td class="c-muted">' + escH(rec.Unidade) + '</td>' +
        '<td>' + fNum(rec['Capacidade Total (slots)']) + '</td>' +
        '<td class="c-blue" style="font-weight:700">' + fNum(rec['Agendamentos Marcados']) + '</td>' +
        '<td class="c-purple" style="font-weight:700">' + fNum(rec['Agendamentos']) + '</td>' +
        '<td class="c-cyan">' + fNum(rec['Representantes']) + '</td>' +
        '<td class="c-green">' + fNum(rec['Slots Livres']) + '</td>' +
        '<td class="c-muted">' + fNum(rec['Bloqueios (slots)']) + '</td>' +
        '<td class="c-amber">' + fNum(rec['Encaixes (atendimentos)']) + '</td>' +
        '<td class="c-red" style="font-weight:700">' + fNum(rec['Faltas (no-show)']) + '</td>' +
        tresTaxas(scheduled || 0, rec['Faltas (no-show)'] || 0, rec['Slots Livres'] || 0, total || 0, blocked || 0) +
        '</tr>';
    }
  }
  document.getElementById('tbDet').innerHTML = detRows;
  ajustarTabelas();
  window.__DET_ROWS = filtrado; // 06/10/2026: o "Baixar Excel" salva exatamente estas linhas (filtro atual)

  window.__DASH_DATA = {
    kpis: {
      slots: slots,
      agTotal: agTotal,
      marked: marked,
      sched: sched,
      noshow: noshow,
      desm: desm,
      bloq: bloq,
      enc: enc,
      free: free,
      presentes: presentes,
      repres: repres,
      occGeral: occGeral
    },
    porUni: porUniIA,
    porProf: porProfIA,
    porPer: porPerIA,
    porDia: porDiaIA,
    porUniTempo: porUniTempoIA
  };

  ['tblProf','tblDia','tblDet','tblUniTempo'].forEach(makeSortable);
  // 09/10/2026: avisa quem desenha por cima dos mesmos números (gráficos do visual novo)
  document.dispatchEvent(new CustomEvent('painel:render'));
}

function makeSortable(tableId) {
  var table = document.getElementById(tableId);
  if (!table) return;
  var headers = table.querySelectorAll('thead th');
  for (var i = 0; i < headers.length; i++) {
    var th = headers[i];
    var novo = th.cloneNode(true);
    th.parentNode.replaceChild(novo, th);
    (function(idx) {
      novo.addEventListener('click', function() {
        var dir = novo.dataset.dir === 'asc' ? 'desc' : 'asc';
        var allHeaders = table.querySelectorAll('thead th');
        for (var h = 0; h < allHeaders.length; h++) {
          allHeaders[h].dataset.dir = '';
          allHeaders[h].style.color = '';
        }
        novo.dataset.dir = dir;
        novo.style.color = '#94a3b8';
        var tbody = table.querySelector('tbody');
        var rows = Array.from(tbody.querySelectorAll('tr'));
        var mult = dir === 'asc' ? 1 : -1;
        rows.sort(function(a, b) {
          var av = a.cells[idx] ? a.cells[idx].innerText.trim() : '';
          var bv = b.cells[idx] ? b.cells[idx].innerText.trim() : '';
          var an = parseFloat(av.replace(/[^0-9.,]/g,'').replace(',','.'));
          var bn = parseFloat(bv.replace(/[^0-9.,]/g,'').replace(',','.'));
          if (!isNaN(an) && !isNaN(bn)) return (an - bn) * mult;
          return av.localeCompare(bv) * mult;
        });
        for (var r = 0; r < rows.length; r++) tbody.appendChild(rows[r]);
      });
    })(i);
  }
}

// 02/10/2026: filtro de profissional com busca pelo nome e vários selecionados. window.__profFilter = lista de nomes
// (vazia = todos os profissionais).
function selecionados(chave) {
  var v = window[chave];
  return Array.isArray(v) ? v : (v ? [v] : []);
}
function profsSelecionados() { return selecionados('__profFilter'); }
function profNoFiltro(nome, lista) {
  lista = lista || profsSelecionados();
  return !lista.length || lista.indexOf(nome) >= 0;
}
// 06/10/2026: unidade também com vários selecionados. window.__uniFilter = lista (vazia = todas as unidades)
function unisSelecionadas() { return selecionados('__uniFilter'); }
function uniNoFiltro(unidade, lista) {
  lista = lista || unisSelecionadas();
  return !lista.length || lista.indexOf(unidade) >= 0;
}
function semAcento(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
// Estilo do filtro vai junto com o código (página em cache com o HTML antigo não quebra o visual)
function estiloFiltroProfissionais() {
  if (document.getElementById('prof-multi-css')) return;
  var st = document.createElement('style');
  st.id = 'prof-multi-css';
  st.textContent = [
    '.prof-multi .filter-select-display { min-width: 260px; max-width: 360px; overflow: hidden; text-overflow: ellipsis; }',
    '.prof-multi .filter-select-options { background: var(--surface, #111d30); color: var(--text2, #cbd5e1); right: auto; width: min(340px, calc(100vw - 32px)); max-height: none; overflow: visible; padding: 8px; }',
    '.prof-busca { width: 100%; box-sizing: border-box; background: var(--surface2); border: 1px solid var(--border);',
    '  color: var(--text1); border-radius: 8px; padding: 8px 10px; font-size: 13px; font-family: inherit; outline: none; }',
    '.prof-busca:focus { border-color: var(--blue); }',
    '.prof-acoes { display: flex; justify-content: space-between; align-items: center; padding: 6px 2px 4px; font-size: 12px; color: var(--text4); }',
    '.prof-limpar { background: none; border: none; color: var(--blue); font-size: 12px; cursor: pointer; padding: 0; font-family: inherit; }',
    '.prof-lista { max-height: 260px; overflow-y: auto; margin: 0 -8px; }',
    '.prof-opcao { display: flex; align-items: center; gap: 8px; }',
    '.prof-opcao input { accent-color: var(--blue); margin: 0; cursor: pointer; }',
    '.prof-vazio { padding: 10px; font-size: 12px; color: var(--text4); }',
  ].join('\n');
  document.head.appendChild(st);
}
function montarFiltroProfissionais(profs, displayEl, optionsEl) {
  montarFiltroMulti(profs, displayEl, optionsEl, { chave: '__profFilter', todos: 'Todos os profissionais', plural: 'profissionais',
    busca: 'Digite o nome do profissional…', vazio: 'Nenhum profissional com esse nome' });
}
function montarFiltroUnidades(unis, displayEl, optionsEl) {
  montarFiltroMulti(unis, displayEl, optionsEl, { chave: '__uniFilter', todos: 'Todas as unidades', plural: 'unidades',
    busca: 'Digite o nome da unidade…', vazio: 'Nenhuma unidade com esse nome' });
}
function montarFiltroMulti(profs, displayEl, optionsEl, cfg) {
  estiloFiltroProfissionais();
  var sel0 = function () { return selecionados(cfg.chave); };
  window[cfg.chave] = [];
  var wrapper = optionsEl.parentElement;
  wrapper.classList.add('prof-multi');
  optionsEl.innerHTML = '';

  var busca = document.createElement('input');
  busca.type = 'text';
  busca.className = 'prof-busca';
  busca.placeholder = cfg.busca;
  busca.setAttribute('autocomplete', 'off');
  var acoes = document.createElement('div');
  acoes.className = 'prof-acoes';
  acoes.innerHTML = '<span class="prof-contagem"></span><button type="button" class="prof-limpar">Limpar</button>';
  var lista = document.createElement('div');
  lista.className = 'prof-lista';
  optionsEl.appendChild(busca);
  optionsEl.appendChild(acoes);
  optionsEl.appendChild(lista);

  var itens = profs.map(function (nome) {
    var el = document.createElement('label');
    el.className = 'filter-select-option prof-opcao';
    el.innerHTML = '<input type="checkbox"><span></span>';
    el.querySelector('span').textContent = nome;
    var cb = el.querySelector('input');
    cb.addEventListener('change', function () {
      var sel = sel0().slice();
      var i = sel.indexOf(nome);
      if (cb.checked && i < 0) sel.push(nome);
      if (!cb.checked && i >= 0) sel.splice(i, 1);
      window[cfg.chave] = sel;
      atualizar();
      render();
    });
    lista.appendChild(el);
    return { nome: nome, chave: semAcento(nome), el: el, cb: cb };
  });
  var vazio = document.createElement('div');
  vazio.className = 'prof-vazio';
  vazio.textContent = cfg.vazio;
  lista.appendChild(vazio);

  function atualizar() {
    var sel = sel0();
    displayEl.textContent = !sel.length ? cfg.todos
      : sel.length === 1 ? sel[0] : sel.length + ' ' + cfg.plural;
    displayEl.title = sel.join('\n');
    acoes.querySelector('.prof-contagem').textContent = sel.length
      ? sel.length + (sel.length > 1 ? ' selecionados' : ' selecionado') : cfg.todos;
    acoes.querySelector('.prof-limpar').style.visibility = sel.length ? 'visible' : 'hidden';
    itens.forEach(function (it) { it.cb.checked = sel.indexOf(it.nome) >= 0; });
  }
  function filtrar() {
    var q = semAcento(busca.value).trim();
    var partes = q ? q.split(/\s+/) : [];
    var algum = false;
    // Com busca: primeiro quem tem palavra COMEÇANDO com o que foi digitado ("ana" → Ana antes de Juliana; MODO DEMO: exemplo fictício)
    var ordem = itens.map(function (it) {
      var ok = partes.every(function (p) { return it.chave.indexOf(p) >= 0; });
      var comeco = partes.every(function (p) { return (' ' + it.chave).indexOf(' ' + p) >= 0; });
      it.el.style.display = ok ? '' : 'none';
      if (ok) algum = true;
      var marcado = sel0().indexOf(it.nome) >= 0;
      return { it: it, peso: !q ? (marcado ? 0 : 1) : comeco ? 0 : 1 }; // sem busca: marcados primeiro
    });
    ordem.sort(function (x, y) { return x.peso - y.peso || x.it.nome.localeCompare(y.it.nome); })
      .forEach(function (o) { lista.insertBefore(o.it.el, vazio); });
    vazio.style.display = algum ? 'none' : '';
  }
  busca.addEventListener('input', filtrar);
  busca.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { wrapper.classList.remove('open'); return; }
    if (e.key === 'Enter') { // marca/desmarca o primeiro da lista filtrada
      e.preventDefault();
      var el = Array.from(lista.children).filter(function (x) { return x.classList.contains('prof-opcao') && x.style.display !== 'none'; })[0];
      var primeiro = el && itens.filter(function (it) { return it.el === el; })[0]; // o primeiro que aparece na tela
      if (primeiro) { primeiro.cb.checked = !primeiro.cb.checked; primeiro.cb.dispatchEvent(new Event('change')); }
      busca.select();
    }
  });
  optionsEl.addEventListener('click', function (e) { e.stopPropagation(); });
  acoes.querySelector('.prof-limpar').addEventListener('click', function () {
    window[cfg.chave] = [];
    atualizar();
    render();
    busca.focus();
  });
  displayEl.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = wrapper.classList.contains('open');
    var all = document.querySelectorAll('.filter-select-wrapper.open');
    for (var j = 0; j < all.length; j++) all[j].classList.remove('open');
    if (!isOpen) {
      wrapper.classList.add('open');
      // 08/10/2026: abre para baixo quando cabe (antes abria sempre para cima e cobria o card da ocupação ou
      // saía pelo topo da tela)
      var rw = wrapper.getBoundingClientRect(), alto = Math.min(optionsEl.scrollHeight || 360, 380);
      var cabeAbaixo = window.innerHeight - rw.bottom >= alto + 12;
      var abrirAcima = !cabeAbaixo && rw.top > window.innerHeight - rw.bottom;
      optionsEl.style.top = abrirAcima ? 'auto' : 'calc(100% + 6px)';
      optionsEl.style.bottom = abrirAcima ? 'calc(100% + 6px)' : 'auto';
      busca.value = '';
      // marcados primeiro, depois em ordem alfabética
      var sel = sel0();
      itens.slice().sort(function (x, y) {
        return (sel.indexOf(y.nome) >= 0) - (sel.indexOf(x.nome) >= 0) || x.nome.localeCompare(y.nome);
      }).forEach(function (it) { lista.insertBefore(it.el, vazio); });
      filtrar();
      setTimeout(function () { busca.focus(); }, 0);
    }
  });
  atualizar();
  filtrar();
}

function initProfFilters() {
  var profWrapper = document.querySelector('.filter-select-wrapper[data-filter="prof"]');
  var uniWrapper  = document.querySelector('.filter-select-wrapper[data-filter="uni"]');
  if (!profWrapper || !uniWrapper) return;

  var profDisplay = profWrapper.querySelector('.filter-select-display');
  var profOptions = profWrapper.querySelector('.filter-select-options');
  var uniDisplay  = uniWrapper.querySelector('.filter-select-display');
  var uniOptions  = uniWrapper.querySelector('.filter-select-options');

  var profs = Array.from(new Set(window.DADOS.map(function(r){ return r.Profissional; }).filter(function(nome){ return nome && !isExcludedProfessional(nome); }))).sort();
  var unis  = Array.from(new Set(window.DADOS.map(function(r){ return r.Unidade; }).filter(Boolean))).sort();

  function buildDropdown(values, placeholder, displayEl, optionsEl, filterKey) {
    displayEl.textContent = placeholder;
    window[filterKey] = '';
    optionsEl.innerHTML = '';

    function createOption(label, value, isAll) {
      var opt = document.createElement('div');
      opt.className = 'filter-select-option' + (isAll ? ' is-all' : '');
      opt.dataset.value = value;
      opt.textContent = label;
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var v = opt.dataset.value || '';
        window[filterKey] = v;
        displayEl.textContent = v || placeholder;
        optionsEl.parentElement.classList.remove('open');
        render();
      });
      optionsEl.appendChild(opt);
    }

    createOption(placeholder, '', true);
    for (var i = 0; i < values.length; i++) createOption(values[i], values[i], false);

    displayEl.addEventListener('click', function(e) {
      e.stopPropagation();
      var wrapper = optionsEl.parentElement;
      var isOpen = wrapper.classList.contains('open');
      var all = document.querySelectorAll('.filter-select-wrapper.open');
      for (var j = 0; j < all.length; j++) all[j].classList.remove('open');
      if (!isOpen) wrapper.classList.add('open');
    });
  }

  montarFiltroProfissionais(profs, profDisplay, profOptions);
  montarFiltroUnidades(unis, uniDisplay, uniOptions);

  document.addEventListener('click', function(e) {
    var open = document.querySelectorAll('.filter-select-wrapper.open');
    for (var i = 0; i < open.length; i++) {
      if (!open[i].contains(e.target)) open[i].classList.remove('open');
    }
  });
}

// --- SIDEBAR: abrir/fechar + scroll com offset + highlight ---
function openSidebar() { document.body.classList.add('sidebar-open'); }
function closeSidebar() { document.body.classList.remove('sidebar-open'); }
function toggleSidebar() {
  document.body.classList.contains('sidebar-open') ? closeSidebar() : openSidebar();
}

var btnSidebar = document.getElementById('btnSidebar');
var sidebarBackdrop = document.getElementById('sidebarBackdrop');
var sidebarClose = document.getElementById('sidebarClose');

if (btnSidebar) btnSidebar.addEventListener('click', toggleSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);

document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') closeSidebar();
});

function scrollToWithOffset(target, offset) {
  var rect = target.getBoundingClientRect();
  var top = rect.top + window.pageYOffset - offset;
  window.scrollTo({ top: top, behavior: 'smooth' });
}

function horaAtual() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function addChatMessage(sender, text, time) {
  var chatBody = document.getElementById('chatBody');
  if (!chatBody) return;
  var msg = document.createElement('div');
  msg.className = 'chat-msg ' + sender;
  msg.innerHTML = escH(text) + '<span class="chat-time">' + escH(time) + '</span>';
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function initChatAssistant() {
  var chatFab = document.getElementById('chatFab');
  var chatPanel = document.getElementById('chatPanel');
  var chatClose = document.getElementById('chatClose');
  var chatMenuWrap = document.getElementById('chatMenuWrap');
  var chatCatsList = document.getElementById('chatCatsList');
  var chatQsList   = document.getElementById('chatQsList');
  var chatMenuBack = document.getElementById('chatMenuBack');
  var chatMenuLabel= document.getElementById('chatMenuLabel');
  var chatMenuCatTitle = document.getElementById('chatMenuCatTitle');
  var chatLoginOverlay = document.getElementById('chatLoginOverlay');
  var chatTokenInput = document.getElementById('chatTokenInput');
  var chatLoginBtn = document.getElementById('chatLoginBtn');
  var chatLoginError = document.getElementById('chatLoginError');

  if (!chatFab || !chatPanel || !chatClose || !chatMenuWrap) return;

  window.updateChatMenu = function(isMensal, periodState) {
    var state = periodState || window.__CHAT_PERIOD_STATE || {};
    chatCatsList.innerHTML = '';
    var optTempoNome = isMensal ? 'Por unidade mensal' : 'Por unidade semanal';
    var optTempoQs = isMensal ? 
      [ 'Como está a evolução da ocupação por unidade mensalmente?', 'Faça uma análise de um mês contra o outro (ex: março x abril), avaliando qual unidade cresceu ou caiu.', 'Tivemos queda de desempenho em alguma unidade no último mês?' ] : 
      [ 'Como está a evolução da ocupação por unidade semanalmente?', 'Qual unidade teve a melhor evolução nas semanas recentes?', 'Houve alguma queda de desempenho de ocupação na última semana analisada?' ];

    var noticeQs = [];
    if (state.isInvalidRange === true) {
      noticeQs = [
        'Por que as perguntas de análise foram ocultadas?',
        'Como corrigir o período selecionado?'
      ];
    } else if (state.hasDataInRange === false) {
      noticeQs = [
        'Por que não há dados para este período?',
        'Como ajustar os filtros para voltar a analisar?'
      ];
    }

    var CHAT_OPTIONS = [];
    CHAT_OPTIONS.push({ icon: '✍️', name: 'Faça sua pergunta', color: '#2563eb', bg: '#0b1736', qs: [], freeText: true });
    if (noticeQs.length > 0) {
      CHAT_OPTIONS.push({ icon: 'ℹ️', name: 'Diagnóstico do Período', color: '#0369a1', bg: '#082f49', qs: noticeQs });
    } else {
      CHAT_OPTIONS.push(
        { icon: '📊', name: 'Ocupação Geral',      color: '#1e40af', bg: '#0d1f4d', qs: [ 'Como está a ocupação no período selecionado?', 'Estamos com Capacidade ociosa ou saturada?', 'Qual foi a ocupação média do período?', 'A ocupação está saudável ou preocupante?' ] },
        { icon: '🏥', name: 'Por Unidade',          color: '#065f46', bg: '#022c22', qs: [ 'Qual unidade está com maior ocupação?', 'Qual unidade está mais ociosa?', 'Qual unidade teve mais faltas?', 'Onde estamos perdendo mais agenda?', 'Qual unidade tem mais bloqueios?', 'Qual unidade teve melhor aproveitamento de agenda?' ] },
        { icon: '👤', name: 'Por Profissional',     color: '#6b21a8', bg: '#2e1065', qs: [ 'Quais profissionais estão com agenda mais cheia?', 'Quem está com maior ociosidade?', 'Quem teve mais faltas?', 'Quem teve mais encaixes?', 'Quem está com baixa ocupação e precisa de ajuste?', 'Ranking de profissionais por ocupação' ] },
        { icon: '⏳', name: 'Por Período',          color: '#92400e', bg: '#3b1a05', qs: [ 'Qual período tem maior ocupação?', 'Qual período está mais ocioso?', 'Em qual período temos mais faltas?', 'Qual período performa melhor?' ] },
        { icon: '📆', name: 'Por Dia da Semana',   color: '#0e7490', bg: '#042f3d', qs: [ 'Qual dia da semana tem maior ocupação?', 'Qual dia é mais fraco?', 'Temos padrão de ociosidade em algum dia?', 'Qual dia tem mais faltas?', 'Vale redistribuir agenda ao longo da semana?' ] },
        { icon: '📈', name: optTempoNome,           color: '#c026d3', bg: '#4a044e', qs: optTempoQs },
        { icon: '🚨', name: 'Alertas Estratégicos', color: '#991b1b', bg: '#3b0808', qs: [ 'Existe algum ponto crítico na agenda?', 'Onde estamos perdendo mais Capacidade?', 'Há excesso de bloqueios?', 'A taxa de faltas está alta?', 'Existe algum profissional com baixa performance?', 'Quais são os principais gargalos hoje?' ] }
      );

      if (state.allowYoY) {
        CHAT_OPTIONS.push({
          icon: '🗓️',
          name: 'Comparativo por Período',
          color: '#0f766e',
          bg: '#042f2e',
          qs: [
            'Como ficou a ocupação versus o mesmo período do ano anterior?',
            'Quais unidades melhoraram ou pioraram no mesmo período do ano anterior?',
            'Como ficaram faltas e bloqueios no mesmo período do ano anterior?'
          ]
        });
      }
    }

    CHAT_OPTIONS.forEach(function(opt, idx) {
      var card = document.createElement('div');
      card.className = 'chat-cat-card';
      card.style.background = opt.bg;
      card.style.borderColor = opt.color + '55';
      card.innerHTML =
        '<div class="chat-cat-icon" style="background:' + opt.color + '40;border:1.5px solid ' + opt.color + '80">' + opt.icon + '</div>' +
        '<div class="chat-cat-info">' +
          '<div class="chat-cat-name">' + opt.name + '</div>' +
          (!opt.freeText ? '<div class="chat-cat-count">' + opt.qs.length + ' perguntas disponíveis</div>' : '') +
        '</div>' +
        '<span class="chat-cat-arrow">›</span>';
      card.addEventListener('mouseover', function() { card.style.borderColor = opt.color + 'aa'; });
      card.addEventListener('mouseout',  function() { card.style.borderColor = opt.color + '55'; });
      card.addEventListener('click', function() {
        if (opt.freeText) { showManualQuestionInput(); } else { showQuestions(opt); }
      });
      chatCatsList.appendChild(card);
    });

    var currentCatTitle = chatMenuCatTitle ? chatMenuCatTitle.textContent || '' : '';
    if (currentCatTitle.includes('Por unidade semanal') || currentCatTitle.includes('Por unidade mensal') || currentCatTitle.includes('Evolução por Unidade')) {
       showCategories();
    }
  };

  window.updateChatMenu(false, window.__CHAT_PERIOD_STATE || null);

  function showQuestions(opt) {
    window.__CUR_CHAT_CATEGORY = opt.name;
    chatCatsList.classList.add('hidden');
    chatQsList.innerHTML = '';
    chatQsList.classList.add('visible');
    chatMenuBack.classList.add('visible');
    chatMenuLabel.style.display = 'none';
    chatMenuCatTitle.textContent = opt.icon + ' ' + opt.name;
    chatMenuCatTitle.classList.add('visible');
    opt.qs.forEach(function(q) {
      var btn = document.createElement('button');
      btn.className = 'chat-q-btn';
      btn.textContent = q;
      btn.addEventListener('click', function() { sendChatMessage(q); });
      chatQsList.appendChild(btn);
    });
  }

  function showManualQuestionInput() {
    window.__CUR_CHAT_CATEGORY = 'Pergunta Livre';
    chatCatsList.classList.add('hidden');
    chatQsList.classList.remove('visible');
    chatQsList.innerHTML = '';
    chatMenuBack.classList.add('visible');
    chatMenuLabel.style.display = 'none';
    chatMenuCatTitle.textContent = '✍️ Faça sua pergunta';
    chatMenuCatTitle.classList.add('visible');
    var wrap = document.getElementById('chatInputWrap');
    var input = document.getElementById('chatInput');
    if (wrap) wrap.classList.remove('hidden');
    if (input) { input.value = ''; setTimeout(function() { input.focus(); }, 20); }
  }

  function hideManualQuestionInput() {
    var wrap = document.getElementById('chatInputWrap');
    var input = document.getElementById('chatInput');
    if (wrap) wrap.classList.add('hidden');
    if (input) input.value = '';
  }

  var chatSendBtn = document.getElementById('chatSend');
  var chatInputEl = document.getElementById('chatInput');
  if (chatSendBtn && chatInputEl) {
    chatSendBtn.addEventListener('click', function() {
      var txt = chatInputEl.value.trim();
      if (txt) { hideManualQuestionInput(); sendChatMessage(txt); }
    });
    chatInputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var txt = chatInputEl.value.trim();
        if (txt) { hideManualQuestionInput(); sendChatMessage(txt); }
      }
    });
  }

  function showCategories() {
    chatQsList.classList.remove('visible');
    chatCatsList.classList.remove('hidden');
    chatMenuBack.classList.remove('visible');
    chatMenuLabel.style.display = '';
    chatMenuCatTitle.classList.remove('visible');
    chatMenuCatTitle.textContent = '';
    hideManualQuestionInput();
    chatQsList.innerHTML = '';
    window.__CUR_CHAT_CATEGORY = '';
  }

  chatMenuBack.addEventListener('click', showCategories);

  var isAuthenticated = false;
  var currentUserKey = '';
  var LOCAL_REPLY_DELAY_MS = 3200;
  var WEBHOOK_MIN_DELAY_MS = 1800;

  // =============================================
  // CONTROLE DE TOKENS E QUOTAS
  // Configure os tokens permitidos aqui: 'TOKEN': perguntas por dia
  // =============================================
  // MODO DEMO: tokens de produção trocados por um token de demonstração
  var CHAT_KEYS = {
    'demo': 9999
  };

  function isValidKey(key) {
    return key && key.trim() && CHAT_KEYS.hasOwnProperty(key.trim());
  }

  function getKeyQuota(key) {
    var k = (key || '').trim();
    return CHAT_KEYS.hasOwnProperty(k) ? CHAT_KEYS[k] : 0;
  }

  function getToday() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  }

  var __memQuota = {};

  function getUserQuotaData() {
    if (!currentUserKey) return null;
    var key = 'nexa_q_' + currentUserKey;
    var d = null;
    try { d = localStorage.getItem(key); } catch (e) { d = null; }
    if (d === null) { return __memQuota[key] || null; }
    try { return JSON.parse(d); } catch (e) { return null; }
  }

  function saveUserQuotaData(data) {
    if (!currentUserKey) return;
    var key = 'nexa_q_' + currentUserKey;
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* sandboxed */ }
    __memQuota[key] = data;
  }

  function initUserQuota() {
    var h = getToday();
    var q = getUserQuotaData();
    if (!q || q.data !== h) saveUserQuotaData({ data: h, count: 0 });
  }

  function getRemainingQuota() {
    if (!currentUserKey) return 0;
    var max = getKeyQuota(currentUserKey);
    var q = getUserQuotaData();
    return Math.max(0, max - (q ? q.count : 0));
  }

  function incrementQuota() {
    if (!currentUserKey) return;
    var q = getUserQuotaData();
    if (q) {
      q.count++;
      saveUserQuotaData(q);
    }
  }

  function hasQuota() {
    if (!currentUserKey) return false;
    return getRemainingQuota() > 0;
  }

  function updateQuotaDisplay() {
    var q = document.getElementById('quotaDisplay');
    if (!q) return;
    if (!currentUserKey) {
      q.innerHTML = '';
      return;
    }
    var max = getKeyQuota(currentUserKey);
    var usado = getUserQuotaData() ? getUserQuotaData().count : 0;
    var rest = Math.max(0, max - usado);
    if (max >= 9999) {
      q.innerHTML = '♾️ Ilimitado';
      q.style.color = '#22c55e';
    } else {
      q.innerHTML = '📊 ' + rest + '/' + max;
      q.style.color = rest > max * 0.5 ? '#22c55e' : rest > max * 0.2 ? '#f59e0b' : '#ef4444';
    }
  }

  function validateToken(token) {
    return isValidKey(token);
  }

  function showLogin() {
    chatLoginOverlay.style.display = 'flex';
    chatPanel.classList.remove('open');
    chatFab.textContent = '💬';
  }

  function hideLogin() {
    chatLoginOverlay.style.display = 'none';
  }

  chatLoginOverlay.addEventListener('click', function(e) {
    if (e.target === chatLoginOverlay) {
      hideLogin();
    }
  });

  function validateToken(token) {
    return isValidKey(token);
  }

  chatLoginBtn.addEventListener('click', function() {
    var token = chatTokenInput.value.trim();
    if (!isValidKey(token)) {
      chatLoginError.textContent = 'Token inválido: ' + token;
      chatLoginError.classList.add('show');
      chatTokenInput.value = '';
      chatTokenInput.focus();
      chatTokenInput.style.borderColor = '#ef4444';
      setTimeout(function() {
        chatTokenInput.style.borderColor = '';
      }, 500);
      return;
    }
    isAuthenticated = true;
    currentUserKey = token;
    updateQuotaDisplay();
    chatLoginOverlay.style.display = 'none';
    chatPanel.classList.add('open');
    chatFab.textContent = '✕';
    initUserQuota();
  });

  chatTokenInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') chatLoginBtn.click();
  });

  chatTokenInput.addEventListener('input', function() {
    chatLoginError.classList.remove('show');
  });

  function toggleChat(open) {
    var shouldOpen = typeof open === 'boolean' ? open : !chatPanel.classList.contains('open');
    if (shouldOpen) {
      if (!isAuthenticated) {
        showLogin();
        return;
      }
      chatPanel.classList.add('open');
      chatFab.textContent = '✕';
    } else {
      chatPanel.classList.remove('open');
      chatFab.textContent = '💬';
    }
  }

  function getLocalAnswer(question, contextData) {
    if (!question || !contextData) return null;
    var q = question.toLowerCase().trim();
    var nq = normTxt(question);
    var d = window.__DASH_DATA || {};
    var kpis = d.kpis || {};
    var ps = window.__CHAT_PERIOD_STATE || {};

    function contextoCurto() {
      var filtros = [];
      if (ps.uniFilter && ps.uniFilter.length) filtros.push((ps.uniFilter.length > 1 ? 'unidades ' : 'unidade ') + ps.uniFilter.join(', '));
      if (ps.profFilter && ps.profFilter.length) filtros.push((ps.profFilter.length > 1 ? 'profissionais ' : 'profissional ') + ps.profFilter.join(', '));
      var filtroTxt = filtros.length ? ' | Filtros: ' + filtros.join(' + ') : '';
      return 'Período: ' + (ps.di || 'n/d') + ' até ' + (ps.df || 'n/d') + filtroTxt;
    }

    function story(cenario, evidencia, acao) {
      return 'Cenário: ' + cenario + ' | Evidência: ' + evidencia + ' | Ação: ' + acao + ' | ' + contextoCurto();
    }

    if (ps.isInvalidRange === true) {
      if (hasAnyTerm(nq, ['por que as perguntas de analise foram ocultadas', 'como corrigir o periodo selecionado', 'periodo invalido'])) {
        return 'As perguntas analíticas foram ocultadas porque a data inicial está maior que a data final. Ajuste o filtro para continuar. Exemplo válido: 2026-01-01 até 2026-01-31.';
      }
      return 'Não consigo analisar com o período atual porque ele está inválido. Ajuste as datas e tente novamente.';
    }

    if (ps.hasDataInRange === false) {
      if (hasAnyTerm(nq, ['por que nao ha dados para este periodo', 'como ajustar os filtros para voltar a analisar', 'sem dados'])) {
        return 'Não encontramos dados com o período e filtros atuais. Tente ampliar a janela de datas, remover filtros de unidade/profissional ou usar um intervalo com registros.';
      }
      return 'Neste recorte não há dados para análise. Ajuste período ou filtros para liberar novamente as perguntas estratégicas.';
    }
    
    if (q === 'oi' || q === 'olá' || q === 'ola' || q === 'bom dia' || q === 'boa tarde') {
      return "Olá! Sou a NEXA. Selecione uma pergunta no menu para analisarmos os dados de ocupação atual.";
    }
    if (q.includes('ajuda') || q.includes('o que você pode fazer')) {
      return "Eu analiso sua base de agendamentos em tempo real! Escolha no menu para saber sobre a ocupação geral, por unidade, faltas, gargalos e muito mais.";
    }
    if (q.includes('obrigado') || q.includes('thanks') || q === 'vlw') {
      return "Por nada! Sempre às ordens.";
    }

    // --- CATEGORIA: OCUPAÇÃO GERAL ---
    if (q.includes('como está a ocupação no período selecionado') || q.includes('qual a ocupação hoje') || q.includes('qual a taxa de ocupação') || q.includes('ocupação das agendas hoje')) {
      if (kpis.occGeral === undefined) return null;
      var detalhes = [];
      detalhes.push("Capacidade: " + fNum(kpis.slots));
      detalhes.push("Agendamentos totais: " + fNum(kpis.agTotal) + " (" + fNum(kpis.sched) + " confirmados)");
      detalhes.push("Livres: " + fNum(kpis.free));
      detalhes.push("Faltas: " + fNum(kpis.noshow));
      detalhes.push("Bloqueios: " + fNum(kpis.bloq));
      detalhes.push("Encaixes: " + fNum(kpis.enc));
      detalhes.push("Total de pacientes: " + fNum(kpis.presentes));
      
      return "A ocupação no período selecionado é de " + fPct(kpis.occGeral) + ". Detalhes: " + detalhes.join(" | ") + ". Para visualização completa, verifique os gráficos e tabelas.";
    }

    if (q.includes('capacidade ociosa') || q.includes('saturada')) {
      if (kpis.occGeral === undefined) return null;
      var occ = kpis.occGeral;
      var status = occ >= 85 ? "Alta ocupação (saturada), com a agenda bem preenchida." : (occ >= 60 ? "Ocupação saudável, com alguma margem para agendamentos." : "Capacidade com ociosidade considerável e potencial para absorver pacientes.");
      var percLivres = kpis.slots > 0 ? ((kpis.free / kpis.slots) * 100).toFixed(0) : 0;
      return story(
        status,
        fNum(kpis.free) + ' horários livres de ' + fNum(kpis.slots) + ' totais (ociosidade aproximada de ' + percLivres + '%).',
        occ < 60 ? 'Reforçar captação nos horários mais vazios e revisar bloqueios recorrentes.' : 'Manter ritmo e ajustar apenas janelas com ociosidade concentrada.'
      );
    }

    if (q.includes('ocupação média')) {
        if (kpis.occGeral === undefined) return null;
        return "A ocupação média para o período filtrado foi de " + fPct(kpis.occGeral) + ".";
    }

    if (q.includes('saudável ou preocupante') || q.includes('saudável')) {
        if (kpis.occGeral === undefined) return null;
        var r = kpis.occGeral >= 60 ? "A taxa é considerada saudável (acima de 60%)." : "A taxa pode ser classificada como preocupante (abaixo de 60%), demandando atenção à captação.";
        return r + " O dashboard registra " + fPct(kpis.occGeral) + " de ocupação geral.";
    }

    // --- CATEGORIA: POR UNIDADE ---
    if (q.includes('qual unidade está com maior ocupação') || q.includes('qual unidade está mais ociosa')) {
      var uni = Object.entries(d.porUni || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked) }; }).sort(function(a,b){ return b.o - a.o; });
      if (uni.length > 0) {
        if (q.includes('maior ocupação')) return "A unidade com maior ocupação no período é " + uni[0].nome + " com " + fPct(uni[0].o) + ".";
        return "A unidade mais ociosa no período é " + uni[uni.length-1].nome + " com apenas " + fPct(uni[uni.length-1].o) + " de ocupação.";
      }
    }

    if (q.includes('qual unidade teve mais faltas')) {
      var uniF = Object.entries(d.porUni || {}).map(function(e) { return { nome: e[0], f: e[1].totalNoShow }; }).sort(function(a,b){ return b.f - a.f; });
      if (uniF.length > 0) return "A unidade com mais faltas no período é " + uniF[0].nome + " com " + fNum(uniF[0].f) + " faltas.";
    }

    if (q.includes('onde estamos perdendo mais agenda') || q.includes('qual unidade tem mais bloqueios')) {
      var uniB = Object.entries(d.porUni || {}).map(function(e) { return { nome: e[0], b: e[1].totalBlocked }; }).sort(function(a,b){ return b.b - a.b; });
      if (uniB.length > 0) return "A unidade com mais bloqueios no período é " + uniB[0].nome + " com " + fNum(uniB[0].b) + " bloqueios de agenda.";
    }

    if (q.includes('melhor aproveitamento de agenda')) {
      var uniO = Object.entries(d.porUni || {}).map(function(e) { return { nome: e[0], p: e[1].totalSlots > 0 ? (e[1].totalPresentes / e[1].totalSlots)*100 : 0 }; }).sort(function(a,b){ return b.p - a.p; });
      if (uniO.length > 0) return "A unidade com melhor aproveitamento (presença vs Capacidade) é " + uniO[0].nome + " com " + fPct(uniO[0].p) + ".";
    }

    // --- CATEGORIA: POR PROFISSIONAL ---
    if (q.includes('quais profissionais estão com agenda mais cheia')) {
      var prof = Object.entries(d.porProf || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked) }; }).filter(function(p){ return p.o > 0; }).sort(function(a,b){ return b.o - a.o; });
      if (prof.length > 0) return "Os profissionais com agenda mais cheia são:\n1. " + prof[0].nome + " (" + fPct(prof[0].o) + ")" + (prof.length > 1 ? "\n2. " + prof[1].nome + " (" + fPct(prof[1].o) + ")" : "");
    }

    if (q.includes('maior ociosidade') && q.includes('quem')) {
      var prof2 = Object.entries(d.porProf || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked), c: e[1].totalSlots }; }).filter(function(p){ return p.c > 0; }).sort(function(a,b){ return a.o - b.o; });
      if (prof2.length > 0) return "O profissional com maior ociosidade no momento é " + prof2[0].nome + " com " + fPct(prof2[0].o) + " de ocupação (Capacidade: " + fNum(prof2[0].c) + ").";
    }

    if (q.includes('quem teve mais faltas')) {
      var profF = Object.entries(d.porProf || {}).map(function(e) { return { nome: e[0], f: e[1].totalNoShow }; }).sort(function(a,b){ return b.f - a.f; });
      if (profF.length > 0) return "O profissional que teve mais faltas no período é " + profF[0].nome + " com " + fNum(profF[0].f) + " paciente(s) faltante(s).";
    }

    if (q.includes('quem teve mais encaixes')) {
      var profE = Object.entries(d.porProf || {}).map(function(e) { return { nome: e[0], e: e[1].totalExtra }; }).sort(function(a,b){ return b.e - a.e; });
      if (profE.length > 0) return "O profissional com mais encaixes no período é " + profE[0].nome + " com " + fNum(profE[0].e) + " paciente(s) encaixado(s).";
    }

    if (q.includes('baixa ocupação e precisa de ajuste')) {
       var profA = Object.entries(d.porProf || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked), c: e[1].totalSlots }; }).filter(function(p){ return p.c > 0 && p.o < 60; }).sort(function(a,b){ return a.o - b.o; });
       if (profA.length > 0) return "Profissional sugerido para ajuste rápido de captação: " + profA[0].nome + " (" + fPct(profA[0].o) + " de ocupação).";
       return "Nenhum profissional com agenda tão crítica (abaixo de 60%) foi detectado.";
    }

    if (q.includes('ranking de profissionais')) {
      var profR = Object.entries(d.porProf || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked), c: e[1].totalSlots }; }).filter(function(p){ return p.c > 0; }).sort(function(a,b){ return b.o - a.o; });
      var profsStr = profR.map(function(p) { return "- " + p.nome + ": " + fPct(p.o); }).join("\n");
      if (profR.length > 0) return "Ranking de Ocupação dos Profissionais:\n" + profsStr;
    }

    // --- CATEGORIA: POR PERÍODO ---
    if (q.includes('qual período tem maior ocupação') || q.includes('qual período está mais ocioso')) {
      var per = Object.entries(d.porPer || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked) }; }).sort(function(a,b){ return b.o - a.o; });
      if (per.length > 0) {
        if (q.includes('maior ocupação')) return "O período com maior ocupação é: " + per[0].nome + " (" + fPct(per[0].o) + ").";
        return "O período mais ocioso é: " + per[per.length-1].nome + " (" + fPct(per[per.length-1].o) + ").";
      }
    }

    if (q.includes('em qual período temos mais faltas')) {
      var perF = Object.entries(d.porPer || {}).map(function(e) { return { nome: e[0], f: e[1].totalNoShow }; }).sort(function(a,b){ return b.f - a.f; });
      if (perF.length > 0) return "O período com mais faltas registradas é " + perF[0].nome + " com " + fNum(perF[0].f) + " ausências.";
    }

    if (q.includes('qual período performa melhor?')) {
      var perO = Object.entries(d.porPer || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked) }; }).sort(function(a,b){ return b.o - a.o; });
      if (perO.length > 0) return "A melhor performance de ocupação ocorre no período: " + perO[0].nome + " (" + fPct(perO[0].o) + ").";
    }

    // --- CATEGORIA: POR DIA DA SEMANA ---
    if (q.includes('qual dia da semana tem maior ocupação') || q.includes('qual dia é mais fraco')) {
      var dia = Object.entries(d.porDia || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked), c: e[1].totalSlots }; }).filter(function(p){ return p.c > 0; }).sort(function(a,b){ return b.o - a.o; });
      if (dia.length > 0) {
        if (q.includes('maior ocupação')) return "O dia da semana com maior ocupação é " + dia[0].nome + " com " + fPct(dia[0].o) + ".";
        return "O dia mais fraco (menor ocupação) é " + dia[dia.length-1].nome + " com " + fPct(dia[dia.length-1].o) + ".";
      }
    }
    
    if (q.includes('padrão de ociosidade em algum dia')) {
      var diaO = Object.entries(d.porDia || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked), c: e[1].totalSlots }; }).filter(function(p){ return p.c > 0; }).sort(function(a,b){ return a.o - b.o; });
      if (diaO.length > 0 && diaO[0].o <= 60) return "Existe um padrão forte de ociosidade em " + diaO[0].nome + ", registrando ocupação de apenas " + fPct(diaO[0].o) + ". É sugerida alguma campanha para este dia.";
      return "Não há dias críticos. A melhor distribuição de ociosidade aponta " + (diaO.length ? diaO[0].nome : '') + " mas com taxa decente de " + (diaO.length ? fPct(diaO[0].o) : '') + ".";
    }
    
    if (q.includes('qual dia tem mais faltas')) {
      var diaF = Object.entries(d.porDia || {}).map(function(e) { return { nome: e[0], f: e[1].totalNoShow }; }).sort(function(a,b){ return b.f - a.f; });
      if (diaF.length > 0) return "O dia com maior registro de faltas é " + diaF[0].nome + " com " + fNum(diaF[0].f) + " paciente(s) faltante(s).";
    }

    if (q.includes('vale redistribuir agenda ao longo da semana?')) {
      var diaR = Object.entries(d.porDia || {}).map(function(e) { return { nome: e[0], o: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked), c: e[1].totalSlots }; }).filter(function(p){ return p.c > 0; }).sort(function(a,b){ return b.o - a.o; });
      if (diaR.length >= 2) {
         if (diaR[0].o - diaR[diaR.length-1].o > 20) {
           return "Extremamente recomendado. Temos " + diaR[0].nome + " sobrecarregado com " + fPct(diaR[0].o) + " e " + diaR[diaR.length-1].nome + " muito ocioso (" + fPct(diaR[diaR.length-1].o) + "). Balancear seria ideal.";
         }
      }
      return "A distribuição está relativamente equilibrada sem distorções exorbitantes entre os dias da semana neste período.";
    }

    // --- CATEGORIA: EVOLUÇÃO / ALERTAS / YOY 2026x2025 ---
    if (hasAnyTerm(nq, ['como esta a evolucao da ocupacao por unidade mensalmente', 'como esta a evolucao da ocupacao por unidade semanalmente'])) {
      return story(
        'A evolução de ocupação por unidade está disponível na tabela de evolução do período filtrado.',
        'Os melhores e piores momentos ficam destacados pelo ranking de ocupação por unidade/tempo no próprio dashboard.',
        'Priorize unidades com tendência de queda nas últimas janelas e replique práticas das unidades com alta consistente.'
      );
    }

    if (hasAnyTerm(nq, ['analise de um mes contra o outro', 'qual unidade teve a melhor evolucao nas semanas recentes', 'queda de desempenho de ocupacao na ultima semana analisada', 'queda de desempenho em alguma unidade no ultimo mes'])) {
      var evol = Object.entries(d.porUniTempo || {}).map(function(e) {
        return {
          chave: e[0],
          occ: calcOcupacao(e[1].totalScheduled, e[1].totalSlots, e[1].totalBlocked)
        };
      }).sort(function(a, b) { return b.occ - a.occ; });
      if (!evol.length) return 'Não há dados suficientes para medir evolução nesse recorte.';
      var melhor = evol[0];
      var pior = evol[evol.length - 1];
      return story(
        'Há diferença clara de performance entre os recortes de evolução.',
        'Melhor ponto: ' + melhor.chave.replace(/|||/g, ' - ') + ' (' + fPct(melhor.occ) + ') | Pior ponto: ' + pior.chave.replace(/|||/g, ' - ') + ' (' + fPct(pior.occ) + ').',
        'Investigue o que mudou em agenda e bloqueios no pior ponto e use como benchmark o melhor ponto.'
      );
    }

    if (hasAnyTerm(nq, ['existe algum ponto critico na agenda', 'onde estamos perdendo mais capacidade', 'ha excesso de bloqueios', 'a taxa de faltas esta alta', 'existe algum profissional com baixa performance', 'quais sao os principais gargalos hoje'])) {
      var taxaBloq = kpis.slots > 0 ? (kpis.bloq / kpis.slots) * 100 : 0;
      var taxaFalta = kpis.agTotal > 0 ? (kpis.noshow / kpis.agTotal) * 100 : 0;
      var ponto = taxaFalta >= taxaBloq ? 'faltas' : 'bloqueios';
      var valorPonto = ponto === 'faltas' ? fPct(taxaFalta) : fPct(taxaBloq);
      return story(
        'O principal ponto de atenção no período é ' + ponto + '.',
        'Faltas: ' + fPct(taxaFalta) + ' | Bloqueios: ' + fPct(taxaBloq) + ' | Ocupação geral: ' + fPct(kpis.occGeral || 0) + '.',
        'Comece atacando ' + ponto + ' (impacto atual: ' + valorPonto + ') para ganhar capacidade sem ampliar estrutura.'
      );
    }

    if (hasAnyTerm(nq, ['mesmo periodo do ano anterior', 'comparativo por periodo', 'versus o ano anterior', 'como ficaram faltas e bloqueios no mesmo periodo do ano anterior', 'quais unidades melhoraram ou pioraram no mesmo periodo do ano anterior', 'versus 2025', 'comparativo 2026 x 2025'])) {
      if (!ps.allowYoY) {
        return ps.reason || 'Comparativo anual indisponível para o período selecionado.';
      }
      var diBase = ps.priorDi || shiftIsoDateByYears(ps.di, -1);
      var dfBase = ps.priorDf || shiftIsoDateByYears(ps.df, -1);
      var atual = (window.DADOS || []).filter(function(r) { return r.Data >= ps.di && r.Data <= ps.df && !isExcludedProfessional(r.Profissional); });
      var base = (window.DADOS || []).filter(function(r) { return r.Data >= diBase && r.Data <= dfBase && !isExcludedProfessional(r.Profissional); });
      if (ps.uniFilter && ps.uniFilter.length) {
        atual = atual.filter(function(r) { return uniNoFiltro(r.Unidade, ps.uniFilter); });
        base = base.filter(function(r) { return uniNoFiltro(r.Unidade, ps.uniFilter); });
      }
      if (ps.profFilter && ps.profFilter.length) {
        atual = atual.filter(function(r) { return profNoFiltro(r.Profissional, ps.profFilter); });
        base = base.filter(function(r) { return profNoFiltro(r.Profissional, ps.profFilter); });
      }

      function sumBy(rows, key) {
        var s = 0;
        rows.forEach(function(r) { s += r[key] || 0; });
        return s;
      }

      var slotsAtual = sumBy(atual, 'Capacidade Total (slots)');
      var schedAtual = sumBy(atual, 'Slots Agendados (total c/ retornos)');
      var bloqAtual = sumBy(atual, 'Bloqueios (slots)');
      var faltasAtual = sumBy(atual, 'Faltas (no-show)');

      var slotsBase = sumBy(base, 'Capacidade Total (slots)');
      var schedBase = sumBy(base, 'Slots Agendados (total c/ retornos)');
      var bloqBase = sumBy(base, 'Bloqueios (slots)');
      var faltasBase = sumBy(base, 'Faltas (no-show)');

      var occAtual = calcOcupacao(schedAtual, slotsAtual, bloqAtual);
      var occBase = calcOcupacao(schedBase, slotsBase, bloqBase);
      var deltaOcc = occAtual - occBase;
      var deltaFaltas = faltasAtual - faltasBase;
      var deltaBloq = bloqAtual - bloqBase;
      var sinalOcc = deltaOcc >= 0 ? '+' : '';
      var sinalF = deltaFaltas >= 0 ? '+' : '';
      var sinalB = deltaBloq >= 0 ? '+' : '';
      var periodoAtualTxt = (ps.di || 'n/d') + ' até ' + (ps.df || 'n/d');
      var periodoBaseTxt = diBase + ' até ' + dfBase;

      return story(
        'Comparativo concluído entre o período atual e o mesmo período do ano anterior.',
        'Período atual: ' + periodoAtualTxt + ' | Período anterior: ' + periodoBaseTxt + ' | Ocupação: ' + fPct(occAtual) + ' vs ' + fPct(occBase) + ' (' + sinalOcc + deltaOcc.toFixed(1) + ' p.p.) | Faltas: ' + fNum(faltasAtual) + ' vs ' + fNum(faltasBase) + ' (' + sinalF + fNum(deltaFaltas) + ') | Bloqueios: ' + fNum(bloqAtual) + ' vs ' + fNum(bloqBase) + ' (' + sinalB + fNum(deltaBloq) + ').',
        deltaOcc >= 0 ? 'Manter ações que elevaram a ocupação e reduzir variações de faltas.' : 'Priorizar plano de recuperação de ocupação e atacar o componente que mais piorou (faltas ou bloqueios).'
      );
    }

    return null;
  }

  function sendChatMessage(textStr) {
    var text = (textStr || '').trim();
    if (!text) return;

    addChatMessage('user', text, horaAtual());
    // scroll do chat para a nova msg
    var chatBody = document.getElementById('chatBody');
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;

    var qBtns = chatQsList ? chatQsList.querySelectorAll('.chat-q-btn') : [];
    qBtns.forEach(function(b) { b.disabled = true; });

    var contextCat = window.__CUR_CHAT_CATEGORY || 'Geral';
    var kpis = window.__KPI_SUMMARY || 'Dados não disponíveis.';
    
    if (contextCat === 'Por Unidade') {
        kpis += '\n\n' + (window.__RESUMO_UNI || '');
    } else if (contextCat === 'Por Profissional') {
        kpis += '\n\n' + (window.__RESUMO_PROF || '');
    } else if (contextCat === 'Por Período') {
        kpis += '\n\n' + (window.__RESUMO_PER || '');
    } else if (contextCat === 'Por Dia da Semana') {
        kpis += '\n\n' + (window.__RESUMO_DIA || '');
    } else if (contextCat === 'Evolução por Unidade' || contextCat === 'Por unidade mensal' || contextCat === 'Por unidade semanal') {
        kpis += '\n\n' + (window.__RESUMO_UNITEMPO || '');
    } else if (contextCat === 'Alertas Estratégicos') {
        kpis += '\n\n### INSTRUÇÕES E CONTEXTO EXCLUSIVO PARA ALERTAS ESTRATÉGICOS ###\n';
        kpis += 'Sua tarefa é cruzar os dados abaixo para identificar gargalos, ociosidade ou desperdício de agenda.\n';
        kpis += '1. Analise baixas ocupações e números altos de Faltas/Bloqueios nos PROFISSIONAIS:\n' + (window.__RESUMO_PROF || '') + '\n';
        kpis += '2. Analise as UNIDADES identificando onde a Capacidade total não está sendo aproveitada:\n' + (window.__RESUMO_UNI || '') + '\n';
        kpis += '3. Analise gargalos nos DIAS DA SEMANA:\n' + (window.__RESUMO_DIA || '') + '\n';
    }

    // URL do webhook fixo (n8n externo)
    var webhookUrl = '/ia';

    var localText = getLocalAnswer(text, kpis);
    if (localText) {
      var typingLocalMsg = document.createElement('div');
      typingLocalMsg.className = 'chat-msg bot';
      typingLocalMsg.innerHTML = '<span class="typing-dots">Pensando<span>.</span><span>.</span><span>.</span></span>';
      
      var timeSpanLocal = document.createElement('span');
      timeSpanLocal.className = 'chat-time';
      timeSpanLocal.textContent = horaAtual();
      typingLocalMsg.appendChild(timeSpanLocal);
      
      chatBody.appendChild(typingLocalMsg);
      chatBody.scrollTop = chatBody.scrollHeight;
      
      setTimeout(function() {
        if (typingLocalMsg.parentNode) {
          typingLocalMsg.parentNode.removeChild(typingLocalMsg);
        }
        addChatMessage('bot', localText, horaAtual());
        var chatQsLists = chatQsList ? chatQsList.querySelectorAll('.chat-q-btn') : [];
        chatQsLists.forEach(function(b) { b.disabled = false; });
        setTimeout(showCategories, 600);
      }, LOCAL_REPLY_DELAY_MS);

      return;
    }

    if (window.__CUR_CHAT_CATEGORY && window.__CUR_CHAT_CATEGORY !== 'Geral' && window.__CUR_CHAT_CATEGORY !== 'Pergunta Livre') {
      var fallbackLocal = 'Não identifiquei uma resposta automática para esta pergunta do menu, mas não vou consumir tokens externos. Tente outra pergunta da mesma categoria ou ajuste o período.';
      addChatMessage('bot', fallbackLocal, horaAtual());
      qBtns.forEach(function(b) { b.disabled = false; });
      setTimeout(showCategories, 600);
      return;
    }

    if (!hasQuota()) {
      addChatMessage('bot', 'Você atingiu o limite diário de perguntas para este token. Tente novamente amanhã ou solicite ampliação.', horaAtual());
      qBtns.forEach(function(b) { b.disabled = false; });
      return;
    }

    // Se estiver testando manualmente no editor do n8n, use esta no lugar da de cima:
    // var webhookUrl = window.location.origin + '/webhook-test/converse-ia';

    var typingMsg = document.createElement('div');
    typingMsg.className = 'chat-msg bot';
    typingMsg.textContent = 'Pensando...';

    var timeSpan = document.createElement('span');
    timeSpan.className = 'chat-time';
    timeSpan.textContent = horaAtual();
    typingMsg.appendChild(timeSpan);

    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    var webhookRequestAt = Date.now();

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pergunta: text,
        periodo_inicio: document.getElementById('dataInicio').value,
        periodo_fim: document.getElementById('dataFim').value,
        // 16/10/2026 (auditoria): a NEXA herda os filtros da tela (vazio = todos)
        unidades: unisSelecionadas(),
        profissionais: profsSelecionados()
      })
    })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        return response.text();
      })
      .then(function(resp) {
        var elapsed = Date.now() - webhookRequestAt;
        var wait = Math.max(0, WEBHOOK_MIN_DELAY_MS - elapsed);

        setTimeout(function() {
          if (typingMsg.parentNode) {
            typingMsg.parentNode.removeChild(typingMsg);
          }

          var respostaFinal = (resp || '').trim();

          if (!respostaFinal) {
            respostaFinal = 'Não consegui processar sua pergunta no momento. Tente reformulá-la ou escolha outra categoria.';
          }

          addChatMessage('bot', respostaFinal, horaAtual());
          try { incrementQuota(); } catch(e) {}
          try { updateQuotaDisplay(); } catch(e) {}
          qBtns.forEach(function(b) { b.disabled = false; });
          setTimeout(showCategories, 600);
        }, wait);
      })
      .catch(function(err) {
        console.error('Erro ao chamar webhook da IA:', err);

        if (typingMsg.parentNode) {
          typingMsg.parentNode.removeChild(typingMsg);
        }

        addChatMessage(
          'bot',
          'Erro ao contatar o assistente. Verifique a URL do webhook, se o workflow está ativo e se o Respond to Webhook está retornando texto.',
          horaAtual()
        );

        qBtns.forEach(function(b) { b.disabled = false; });
      });
  }

  chatFab.addEventListener('click', function() { toggleChat(); });
  chatClose.addEventListener('click', function() { toggleChat(false); });
}

document.querySelectorAll('.sidebar-link[data-scroll]').forEach(function(el){
  el.addEventListener('click', function(){
    var sel = el.getAttribute('data-scroll');
    var target = document.querySelector(sel);
    if (!target) return;

    closeSidebar();

    var topbar = document.querySelector('.topbar');
    var offset = (topbar ? topbar.offsetHeight : 68) + 14;

    setTimeout(function(){
      scrollToWithOffset(target, offset);

      target.classList.remove('jump-highlight');
      void target.offsetWidth;
      target.classList.add('jump-highlight');
      setTimeout(function(){ target.classList.remove('jump-highlight'); }, 950);
    }, 80);
  });
});

document.getElementById('btnFiltro').addEventListener('click', render);
(function () { var b = document.getElementById('btnExcel'); if (b) b.addEventListener('click', baixarExcelDetalhado); })();
var btnComparePY = document.getElementById('btnComparePY');
if (btnComparePY) {
  btnComparePY.addEventListener('click', function() {
    if (btnComparePY.style.display === 'none') return;
    window.__COMPARE_MODE = window.__COMPARE_MODE === 'py' ? 'none' : 'py';
    render();
  });
}
// Seletor do mês de comparação (01/10/2026). O botão abre um painel preso a ele: atalhos (mês anterior,
// mesmo mês do ano passado), ano com setas e grade de 12 meses. Mês sem dados fica apagado; o mês selecionado
// no painel aparece marcado e não é clicável. Escolher um mês liga a comparação; "Desligar" volta ao normal.
var btnCompareMOM = document.getElementById('btnCompareMOM');
if (btnCompareMOM) {
  var seletorMes = document.createElement('div');
  seletorMes.className = 'mes-picker';
  seletorMes.id = 'mesPicker';
  seletorMes.setAttribute('role', 'dialog');
  seletorMes.setAttribute('aria-label', 'Escolher o mês de comparação');
  seletorMes.hidden = true;
  document.body.appendChild(seletorMes);
  var anoPicker = null;

  function escolherMes(ym) {
    window.__MOM_BASE = ym;
    window.__COMPARE_MODE = 'mom';
    fecharSeletorMes();
    render();
  }
  function desenharSeletorMes() {
    var info = window.__MOM_INFO || {};
    var sel = info.selecionado, ativo = window.__COMPARE_MODE === 'mom';
    var anos = Object.keys(info.comDados || {}).map(function (m) { return parseInt(m.substring(0, 4), 10); });
    var anoMin = Math.min.apply(null, anos.concat([parseInt(sel.substring(0, 4), 10)]));
    var anoMax = Math.max.apply(null, anos.concat([parseInt(sel.substring(0, 4), 10)]));
    if (anoPicker === null) anoPicker = parseInt((ativo ? info.base : sel).substring(0, 4), 10);
    var anterior = shiftIsoDateByMonths(sel + '-01', -1).substring(0, 7);
    var anoPassado = shiftIsoDateByMonths(sel + '-01', -12).substring(0, 7);
    function atalho(ym, texto) {
      var tem = !!(info.comDados || {})[ym];
      var on = ativo && info.base === ym;
      return '<button type="button" class="mes-atalho' + (on ? ' ativo' : '') + '" data-mes="' + ym + '"' + (tem ? '' : ' disabled title="Sem dados"') + '>' +
        texto + '<small>' + nomeMesCurto(ym) + '</small></button>';
    }
    var grade = '';
    for (var m = 1; m <= 12; m++) {
      var ym = anoPicker + '-' + (m < 10 ? '0' : '') + m;
      var tem = !!(info.comDados || {})[ym];
      var eSel = ym === sel;
      var on = ativo && info.base === ym;
      grade += '<button type="button" class="mes-cel' + (on ? ' ativo' : '') + (eSel ? ' selecionado' : '') + '" data-mes="' + ym + '"' +
        ((tem && !eSel) ? '' : ' disabled') + ' title="' + (eSel ? 'Mês em análise' : tem ? 'Comparar com ' + nomeMesLongo(ym) : 'Sem dados') + '">' +
        MESES_CURTOS[m - 1] + '</button>';
    }
    seletorMes.innerHTML =
      '<div class="mes-picker-titulo">Comparar <b>' + nomeMesLongo(sel) + '</b> com</div>' +
      '<div class="mes-atalhos">' + atalho(anterior, 'Mês anterior') + atalho(anoPassado, 'Mesmo mês, ano anterior') + '</div>' +
      '<div class="mes-ano">' +
        '<button type="button" class="mes-ano-btn" data-ano="-1"' + (anoPicker <= anoMin ? ' disabled' : '') + ' aria-label="Ano anterior">‹</button>' +
        '<span>' + anoPicker + '</span>' +
        '<button type="button" class="mes-ano-btn" data-ano="1"' + (anoPicker >= anoMax ? ' disabled' : '') + ' aria-label="Próximo ano">›</button>' +
      '</div>' +
      '<div class="mes-grade">' + grade + '</div>' +
      (ativo ? '<button type="button" class="mes-desligar">Desligar comparação</button>' : '');
  }
  function posicionarSeletorMes() {
    var r = btnCompareMOM.getBoundingClientRect();
    var w = seletorMes.offsetWidth;
    var left = Math.max(8, Math.min(r.left, document.documentElement.clientWidth - w - 8));
    seletorMes.style.left = Math.round(left) + 'px';
    seletorMes.style.top = Math.round(r.bottom + 8) + 'px';
  }
  function abrirSeletorMes() {
    anoPicker = null;
    desenharSeletorMes();
    seletorMes.hidden = false;
    posicionarSeletorMes();
    btnCompareMOM.setAttribute('aria-expanded', 'true');
    var foco = seletorMes.querySelector('.mes-cel.ativo') || seletorMes.querySelector('.mes-atalho:not([disabled])');
    if (foco) foco.focus();
  }
  function fecharSeletorMes() {
    seletorMes.hidden = true;
    btnCompareMOM.setAttribute('aria-expanded', 'false');
  }
  btnCompareMOM.setAttribute('aria-haspopup', 'dialog');
  btnCompareMOM.addEventListener('click', function(e) {
    if (btnCompareMOM.style.display === 'none') return;
    e.stopPropagation();
    if (seletorMes.hidden) abrirSeletorMes(); else fecharSeletorMes();
  });
  seletorMes.addEventListener('click', function(e) {
    e.stopPropagation();
    var b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.ano) { anoPicker += parseInt(b.dataset.ano, 10); desenharSeletorMes(); return; }
    if (b.dataset.mes) { escolherMes(b.dataset.mes); return; }
    if (b.classList.contains('mes-desligar')) { window.__COMPARE_MODE = 'none'; fecharSeletorMes(); render(); }
  });
  document.addEventListener('click', function() { if (!seletorMes.hidden) fecharSeletorMes(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && !seletorMes.hidden) { fecharSeletorMes(); btnCompareMOM.focus(); } });
  window.addEventListener('resize', function() { if (!seletorMes.hidden) posicionarSeletorMes(); });
  window.addEventListener('scroll', function() { if (!seletorMes.hidden) posicionarSeletorMes(); }, true);
}
initChatAssistant();

// Hover sync for Ocupação Geral
var secOcc = document.getElementById('secOcc');
if (secOcc) {
  secOcc.addEventListener('mouseenter', function() {
    var labelsToHighlight = ['Capacidade Total', 'Agendamentos Marcados', 'Bloqueios'];
    labelsToHighlight.forEach(function(label) {
      var kpi = document.querySelector('.kpi-card[data-label="' + label + '"]');
      if (kpi) kpi.classList.add('highlight');
    });
  });
  secOcc.addEventListener('mouseleave', function() {
    document.querySelectorAll('.kpi-card.highlight').forEach(function(kpi) {
      kpi.classList.remove('highlight');
    });
  });
}

initProfFilters();
render();

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODO DICAS (30/09/2026). Mesmo modelo do painel comercial. Os textos explicam a conta real
// (regras do sync portadas do n8n + fórmulas do painel), não o rodapé do card.
// Guardado no navegador: quem liga costuma querer que fique ligado.
// ═══════════════════════════════════════════════════════════════════════════════════════
var DICAS_CHAVE = 'painel-ocupacao:dicas';

var DICA_CAPACIDADE = 'Todos os horários da grade no período, em slots.\nCada bloco de agenda tem (fim − início) ÷ intervalo da grade slots. Vem da grade fixa e da grade de exceção do Feegow.';
var DICA_AG_TOTAIS = 'Tudo o que chegou a ocupar a agenda, em slots:\nagendamentos marcados + desmarcados + faltas.';
var DICA_MARCADOS = 'Slots ocupados por agendamentos válidos: marcados, confirmados, atendidos, em atendimento e retornos.\nConsulta longa ocupa mais de um slot (duração ÷ intervalo da grade). Encaixes e cancelados não entram.\nÉ o numerador da taxa de ocupação.';
var DICA_PACIENTES = '1 por agendamento válido (marcado, confirmado, atendido, retorno), sem encaixes.\nPeríodo passado: quem esteve na agenda. Com dias futuros: inclui quem ainda vai vir.';
var DICA_FALTAS = 'Pacientes com status "Não compareceu", em slots pela duração (mínimo 1).\nContinua sendo atualizado depois do dia, quando a recepção marca o status.';
var DICA_DESMARCADOS = 'Agendamentos desmarcados pelo paciente, pela clínica ou pelo profissional, ou aguardando resposta do paciente.\nRemarcados não contam aqui.';
var DICA_BLOQUEIOS = 'Slots da grade cobertos por bloqueios de agenda do Feegow (horário, dia da semana, período e unidade) e pelos feriados, que bloqueiam o dia inteiro.\nDia que já passou: horário com paciente não conta como bloqueado; agenda sem nenhum paciente e sem bloqueio (ausência não registrada) conta inteira como bloqueada.\nSaem da capacidade: as taxas dividem por (capacidade − bloqueios).';
var DICA_ENCAIXES = 'Quantidade de agendamentos marcados como encaixe, fora dos horários da grade.\nNão entram na Taxa de Ocupação; entram no Preenchimento da Grade quando começam num horário da grade.';
var DICA_LIVRES = 'Horários da grade sem ninguém, contados um a um, como na agenda da Feegow: horário sem bloqueio e sem paciente (marcado, atendido ou falta).\nO atendimento ocupa do início até o horário final dele (vários procedimentos = vários horários). Desmarcado libera. Encaixe só ocupa se começar num horário da grade; encaixe em minuto quebrado (ex.: 10:45) não ocupa.';
var DICA_REPRESENTANTES = 'Agendamentos com procedimento de representante (o texto "representante" no procedimento), inclusive encaixes.';
var DICA_AGENDAMENTO = 'Taxa de Agendamento: (agendados + faltas) ÷ (capacidade − bloqueios).&#10;Quanto da agenda foi reservado para pacientes: quem faltou também conta, porque o horário estava vendido.&#10;Agendamento − Ocupação = o que se perdeu com faltas.';
var DICA_PREENCHIMENTO = 'Preenchimento da Grade: (capacidade − bloqueios − livres) ÷ (capacidade − bloqueios).&#10;Quanto da grade médica não ficou livre na agenda da Feegow: inclui faltas, encaixes no horário da grade e atendimentos longos.&#10;Preenchimento + livres = 100% da (capacidade − bloqueios).';
var DICA_OCUPACAO = 'Agendamentos marcados ÷ (capacidade − bloqueios), limitada a 100%.\nNão conta faltas nem encaixes (veja Taxa de Agendamento e Preenchimento da Grade).';

// Cards de KPI, pelo rótulo (data-label).
var DICAS_CARD = {
  'capacidade total': DICA_CAPACIDADE + '\n100% de referência dos percentuais dos cards.',
  'agendamentos totais': DICA_AG_TOTAIS,
  'agendamentos marcados': DICA_MARCADOS + '\n% = marcados ÷ capacidade.',
  'faltas': DICA_FALTAS + '\n% = faltas ÷ capacidade.',
  'desmarcados': DICA_DESMARCADOS,
  'bloqueios': DICA_BLOQUEIOS + '\n% = bloqueios ÷ capacidade.',
  'encaixes': DICA_ENCAIXES,
  'livres': DICA_LIVRES + '\n% = livres ÷ capacidade.',
  'profissionais no periodo': 'Profissionais com pelo menos uma agenda (grade) no período. Técnicas e PROFISSIONAL TESTE não entram.\n"Só bloqueio": todas as agendas do período bloqueadas (férias, ausência).',
  'atendidos fora da grade': 'Pacientes atendidos num horário em que o profissional não tinha grade: almoço, depois do último horário, antes do início ou dia sem grade.\nConta pacientes, não horários, e não entra na ocupação. Encaixes ficam no card próprio.',
  'faltas fora da grade': 'Faltas em horário sem grade. Ficam fora da taxa de faltas, para ela continuar comparável com o histórico.',
  'desmarcados fora da grade': 'Agendamentos feitos fora da grade e depois desmarcados ou remarcados. Sinal de encaixe mal planejado.',
  'encaixes fora da grade': 'Encaixes em horário sem grade (almoço, depois do último horário, minuto quebrado como 12:01).\nEncaixe fora da grade é legítimo: conta aqui, mas não vira pendência na Saúde do painel.',
  'pacientes agendados': DICA_PACIENTES,
  'pacientes presentes': DICA_PACIENTES,
  'total de pacientes no periodo': DICA_PACIENTES,
  'representantes': DICA_REPRESENTANTES
};

// Colunas de todas as tabelas, pelo texto do cabeçalho.
var DICAS_COLUNA = {
  'profissional': 'Profissional da agenda, com o nome como está na grade do Feegow.',
  'unidade': 'Unidade da agenda.', // MODO DEMO: nomes de unidades reais removidos
  'capacidade': DICA_CAPACIDADE,
  'agendamentos totais': DICA_AG_TOTAIS,
  'agendamentos total': DICA_AG_TOTAIS,
  'agendamentos marcados': DICA_MARCADOS,
  'total de pacientes': DICA_PACIENTES,
  'representantes': DICA_REPRESENTANTES,
  'livres': DICA_LIVRES,
  'bloqueios': DICA_BLOQUEIOS,
  'encaixes': DICA_ENCAIXES,
  'desmarcados': DICA_DESMARCADOS,
  'faltas': DICA_FALTAS,
  'ocupacao': DICA_OCUPACAO,
  'taxa de ocupacao': DICA_OCUPACAO,
  'agendamento': DICA_AGENDAMENTO.replace(/&#10;/g, '\n'),
  'preenchimento': DICA_PREENCHIMENTO.replace(/&#10;/g, '\n'),
  'periodo': 'Turno do bloco pela hora de início: Manhã antes das 12h, Tarde até 18h, Noite a partir das 18h.',
  'dia': 'Dia da semana do bloco de agenda.',
  'data': 'Data do bloco de agenda.',
  'semana': 'Semana de segunda a domingo; o rótulo é a data da segunda-feira.',
  'mes': 'Mês do calendário, do dia 1 ao último dia.'
};

// Filtros, botões e títulos de seção.
var DICAS_ELEMENTO = [
  ['.date-pill', 'Período analisado, datas inclusive.\nDias futuros mostram a agenda já marcada; faltas só aparecem depois do dia.', 'fim'],
  ['#btnFiltro', 'Recalcula o painel inteiro para as datas escolhidas.', 'fim'],
  ['#btnComparePY', 'Compara cada número com o mesmo período do ano anterior.', 'fim'],
  ['#btnCompareMOM', 'Compara o mês selecionado com outro mês à sua escolha (anterior, mesmo mês do ano passado ou qualquer mês com dados).\nAparece quando o período é um mês completo.', 'fim'],
  ['.filter-select-wrapper[data-filter="prof"]', 'Filtra o painel por profissional: digite parte do nome e marque um ou mais.\nEnter marca o primeiro da lista; Limpar volta para todos.'],
  ['.filter-select-wrapper[data-filter="uni"]', 'Filtra o painel por unidade: marque uma ou mais. Limpar volta para todas.'],
  ['#secProf', 'Um profissional por linha, somando todos os blocos de agenda dele no período.'],
  ['#secUni', 'Uma unidade por linha, somando todos os profissionais.'],
  ['#secUniTempo', 'Cada unidade semana a semana, ou mês a mês em períodos longos.'],
  ['#secPer', 'Manhã, Tarde e Noite, pela hora de início de cada bloco de agenda.'],
  ['#secDia', 'Cada dia da semana, somando todas as datas do período.'],
  ['#secDet', 'Um bloco de agenda por linha: profissional, unidade, data e horário.']
];

function normalizarDica(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function aplicarTextosDicas() {
  document.querySelectorAll('.kpi-card[data-label]').forEach(function (card) {
    var d = DICAS_CARD[normalizarDica(card.getAttribute('data-label'))];
    if (d) card.setAttribute('data-dica', d);
  });
  document.querySelectorAll('th').forEach(function (th) {
    var d = DICAS_COLUNA[normalizarDica(th.textContent)];
    if (d) th.setAttribute('data-dica', d);
  });
  DICAS_ELEMENTO.forEach(function (e) {
    var el = document.querySelector(e[0]);
    if (!el) return;
    el.setAttribute('data-dica', e[1]);
    if (e[2]) el.setAttribute('data-dica-dir', e[2]);
  });
}

function dicasLigadas() {
  try { return localStorage.getItem(DICAS_CHAVE) === '1'; }
  catch (e) { return false; } // modo anônimo / storage bloqueado
}

function aplicarDicas(ligado) {
  document.body.classList.toggle('dicas-on', ligado);
  if (!ligado) esconderDica();
  var b = document.getElementById('dicasBtn');
  if (b) {
    b.classList.toggle('ativo', ligado);
    b.setAttribute('aria-pressed', String(ligado));
    b.setAttribute('aria-label', ligado ? 'Desligar dicas' : 'Dicas');
  }
  try { localStorage.setItem(DICAS_CHAVE, ligado ? '1' : '0'); }
  catch (e) { /* sem storage: vale só nesta sessão */ }
}

// Os cards e parte das tabelas são redesenhados a cada filtro. Em vez de envolver render() (o botão
// Aplicar Filtro guarda a referência original), um observador reaplica os textos quando o conteúdo muda.
// Só mudança de filhos dispara: setAttribute não entra em loop.
var dicasAgendadas = false;
new MutationObserver(function () {
  if (dicasAgendadas) return;
  dicasAgendadas = true;
  // setTimeout, e não requestAnimationFrame: o navegador pausa este com a aba oculta.
  setTimeout(function () { dicasAgendadas = false; aplicarTextosDicas(); }, 0);
}).observe(document.querySelector('.main') || document.body, { childList: true, subtree: true });
aplicarTextosDicas();

// Balão flutuante (30/09/2026). Antes era um ::after preso abaixo do elemento: perto do rodapé da janela
// ele ficava fora da tela e era preciso rolar para ler. Agora mede o espaço visível e escolhe o lado.
var balaoDica = document.createElement('div');
balaoDica.className = 'dica-flutuante';
balaoDica.setAttribute('role', 'tooltip');
document.body.appendChild(balaoDica);
var alvoDica = null;
var MARGEM_DICA = 8;

function posicionarDica() {
  if (!alvoDica) return;
  var r = alvoDica.getBoundingClientRect();
  var w = balaoDica.offsetWidth, h = balaoDica.offsetHeight;
  var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  var abaixo = vh - r.bottom - MARGEM_DICA, acima = r.top - MARGEM_DICA;
  var emCima = abaixo < h + MARGEM_DICA && acima > abaixo;
  var top = emCima ? r.top - MARGEM_DICA - h : r.bottom + MARGEM_DICA;
  top = Math.max(MARGEM_DICA, Math.min(top, vh - h - MARGEM_DICA));
  // Ancora na borda esquerda do elemento; se vazar à direita (ou for marcado "fim"), ancora pela direita.
  var left = alvoDica.getAttribute('data-dica-dir') === 'fim' ? r.right - w : r.left;
  left = Math.max(MARGEM_DICA, Math.min(left, vw - w - MARGEM_DICA));
  balaoDica.style.top = Math.round(top) + 'px';
  balaoDica.style.left = Math.round(left) + 'px';
  balaoDica.classList.toggle('acima', emCima);
}

function mostrarDica(el) {
  alvoDica = el;
  balaoDica.textContent = el.getAttribute('data-dica');
  balaoDica.classList.remove('visivel');
  posicionarDica();
  balaoDica.classList.add('visivel');
}

function esconderDica() {
  alvoDica = null;
  balaoDica.classList.remove('visivel');
}

function alvoComDica(no) {
  if (!document.body.classList.contains('dicas-on') || !no || !no.closest) return null;
  var el = no.closest('[data-dica]');
  // O card da Taxa de Ocupação tem balão próprio (occ-info), que já explica as três taxas; dentro do card
  // (inclusive Agendamento e Preenchimento) não abre o genérico por cima (08/10/2026: abriam os dois juntos).
  return el && !el.closest('#secOcc') ? el : null;
}

document.addEventListener('mouseover', function (ev) {
  var el = alvoComDica(ev.target);
  if (el === alvoDica) return;
  if (el) mostrarDica(el); else esconderDica();
});
document.addEventListener('focusin', function (ev) { var el = alvoComDica(ev.target); if (el) mostrarDica(el); });
document.addEventListener('focusout', esconderDica);
// Rolar ou redimensionar: acompanha o elemento; se ele sumiu do DOM (redesenho), fecha.
window.addEventListener('scroll', function () {
  if (alvoDica && !document.body.contains(alvoDica)) esconderDica(); else posicionarDica();
}, true);
window.addEventListener('resize', posicionarDica);

// Balão da Taxa de Ocupação: abre para cima quando não cabe abaixo do card.
(function () {
  var sec = document.getElementById('secOcc');
  var info = document.getElementById('occInfo');
  if (!sec || !info) return;
  sec.addEventListener('mouseenter', function () {
    var r = sec.getBoundingClientRect();
    var h = info.offsetHeight + 16;
    var vh = document.documentElement.clientHeight;
    // 08/10/2026: com Agendamento e Preenchimento o card ficou mais alto; abre para o lado que tem mais espaço
    info.classList.toggle('acima', vh - r.bottom < h && r.top > vh - r.bottom);
  });
})();

document.getElementById('dicasBtn').addEventListener('click', function () {
  aplicarDicas(!document.body.classList.contains('dicas-on'));
});
aplicarDicas(dicasLigadas());

// ═══════════════════════════════════════════════════════════════════════════════════════
// AO VIVO (30/09/2026). O sync grava uma carga a cada 10 min. A tela pergunta a /api/versao a cada
// minuto (resposta de poucos bytes) e só baixa /api/dados de novo quando a versão muda; aí troca
// window.DADOS e chama render(), sem recarregar a página e sem perder filtro, comparação ou dicas.
// Se a pessoa mexeu nas datas e ainda não clicou em Aplicar, não redesenha: os dados novos entram
// no próximo Aplicar.
// ═══════════════════════════════════════════════════════════════════════════════════════
(function aoVivo() {
  var selo = document.getElementById('aoVivo');
  var elIni = document.getElementById('dataInicio');
  var elFim = document.getElementById('dataFim');
  var aplicadas = elIni.value + '|' + elFim.value;
  var baixando = false;
  var PARADO_MIN = 30; // carga mais velha que isso = selo âmbar (sync parado ou falhando)

  document.getElementById('btnFiltro').addEventListener('click', function() {
    aplicadas = elIni.value + '|' + elFim.value;
  });

  function mostrarHorario(iso) {
    if (!selo || !iso) return;
    var d = new Date(iso);
    var hoje = new Date().toDateString() === d.toDateString();
    var hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    selo.textContent = 'Atualizado ' + (hoje ? 'às ' + hora : 'em ' + d.toLocaleDateString('pt-BR') + ' ' + hora);
    selo.classList.toggle('parado', Date.now() - d.getTime() > PARADO_MIN * 60000);
    selo.hidden = false;
  }

  function conferir() {
    if (baixando) return;
    fetch('/api/versao', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(v) {
        if (!v) return;
        mostrarHorario(v.atualizado_em);
        // Aba em segundo plano só atualiza o horário; os dados vêm quando ela voltar (visibilitychange).
        if (!v.versao || v.versao === window.DADOS_VERSAO || document.hidden) return;
        baixando = true;
        return fetch('/api/dados')
          .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            var nova = r.headers.get('X-Versao');
            return r.json().then(function(dados) {
              window.DADOS = dados;
              window.DADOS_VERSAO = nova;
              if (elIni.value + '|' + elFim.value === aplicadas) render();
              if (window.__recarregarQualidade) window.__recarregarQualidade();
            });
          });
      })
      .catch(function(e) { console.warn('[ao vivo]', e.message); })
      .then(function() { baixando = false; });
  }

  conferir();
  setInterval(conferir, 60000);
  // Aba que volta do segundo plano confere na hora, em vez de esperar o próximo minuto.
  document.addEventListener('visibilitychange', function() { if (!document.hidden) conferir(); });
})();

// ═══════════════════════════════════════════════════════════════════════════════════════
// QUALIDADE DA AGENDA (01/10/2026). Segunda linha de cards + pop-up da Saúde dos dados.
// Dados de /api/qualidade (fora da grade e pendências, gravados pelo sync a cada ciclo), filtrados aqui
// pelo mesmo período/unidade/profissional do painel. Nenhum dado de paciente: só contagem e horários.
// Redesenha junto com os cards de cima (observador no #kpiContainer), então segue filtro, comparação e ao vivo.
// ═══════════════════════════════════════════════════════════════════════════════════════
(function qualidadeDaAgenda() {
  var Q = { fora: [], pendencias: [] };
  var cont = document.getElementById('qualContainer');
  if (!cont) return;
  // Tons de azul, sem vermelho/laranja (decisão do proprietário: cor de alarme assusta). A ordem continua pela
  // severidade: o que distorce número primeiro, depois cadastro, depois rotina.
  var SEV = {
    1: { cor: '#38bdf8', bola: '•' },
    2: { cor: '#818cf8', bola: '•' },
    3: { cor: '#94a3b8', bola: '•' },
    4: { cor: '#64748b', bola: '•' } // aviso: grade estimada (não é pendência)
  };
  var TIPOS = {
    sync:             { nome: 'Sync atrasado', acao: 'Avisar a TI: a atualização automática parou.' },
    sem_grade:        { nome: 'Sem grade vigente', acao: 'Conferir ou cadastrar a grade desse horário na Feegow.' },
    dia_sem_grade:    { nome: 'Dia sem grade', acao: 'Cadastrar a grade do dia (ou conferir se o atendimento foi em outra agenda).' },
    bloqueio:         { nome: 'Bloqueio desatualizado', acao: 'Revisar o bloqueio na Feegow (ou remarcar os pacientes).' },
    status:           { nome: 'Status não finalizado', acao: 'Marcar atendido ou falta na Feegow.' },
    agenda_vazia:     { nome: 'Agenda vazia', acao: 'Se foi ausência, registrar o bloqueio na Feegow.' },
    estimada:         { nome: 'Grade estimada', acao: 'Nada a corrigir: leia os números desses dias como estimativa.' }
  };
  var filtroTipo = '';

  function br(iso) { var p = String(iso).split('-'); return p[2] + '/' + p[1]; }
  // Horários dos PACIENTES (não da grade). Com muitos, vira faixa: "entre 09:00 e 18:20".
  function lista(hs) {
    hs = (hs || []).slice().sort();
    if (hs.length > 4) return 'entre ' + hs[0] + ' e ' + hs[hs.length - 1];
    if (hs.length > 1) return hs.slice(0, -1).join(', ') + ' e ' + hs[hs.length - 1];
    return hs[0] || '';
  }
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }
  function agenda(p) {
    var uni = p.unidade ? ' (' + escH(String(p.unidade).replace(/^Clínica Demo - /, '')) /* MODO DEMO: prefixo fictício */ + ')' : '';
    return 'A agenda de <b>' + escH(p.profissional) + '</b>' + uni;
  }
  function horariosTxt(hs) { return (hs && hs.length > 4 ? '' : 'às ') + lista(hs); }

  function frase(p) {
    var d = p.detalhe || {};
    switch (p.tipo) {
      case 'sem_grade':
        return agenda(p) + ' não tem grade ' + horariosTxt(d.horarios) + ' de ' + br(p.data) +
          ': <b>' + plural(p.n, 'paciente', 'pacientes') + ' sem grade vigente</b>.';
      case 'dia_sem_grade':
        return agenda(p) + ' não tem nenhuma grade em ' + br(p.data) + ', mas tem <b>' +
          plural(p.n, 'paciente', 'pacientes') + '</b> (' + lista(d.horarios) + ').';
      case 'bloqueio':
        return agenda(p) + ' estava bloqueada em ' + br(p.data) + ', mas tem <b>' +
          plural(p.n, 'paciente', 'pacientes') + '</b> no horário bloqueado (' + lista(d.horarios) + ').';
      case 'sem_profissional':
        return '<b>' + plural(p.n, 'agendamento', 'agendamentos') + ' sem profissional</b> em ' + br(p.data) +
          (d.faltas ? ' (' + plural(d.faltas, 'falta', 'faltas') + ')' : '') + ': não aparecem em nenhuma agenda do painel.';
      case 'status':
        var st = Object.keys(d.status || {}).map(function (k) { return '"' + escH(k) + '"'; }).join(', ');
        return agenda(p) + ' tem <b>' + plural(p.n, 'paciente', 'pacientes') + '</b> de ' + br(p.data) +
          ' ainda como ' + st + '. O dia já passou.';
      case 'agenda_vazia':
        return agenda(p) + ' ficou aberta em ' + br(p.data) + ' (' + plural(p.n, 'horário', 'horários') +
          ', ' + lista(d.horarios) + ') sem nenhum paciente e sem bloqueio. O painel não conta essa agenda (ausência não registrada?).';
      case 'estimada':
        return agenda(p) + ' usa <b>horário estimado</b> (' + escH(d.turno) + ') em ' + plural(p.n, 'dia', 'dias') +
          (p.n > 1 ? ' entre ' + br(d.de) + ' e ' + br(d.ate) : ' (' + br(d.de) + ')') +
          ', calculado pelos pacientes atendidos: a grade original foi apagada na Feegow.';
      case 'sync':
        return 'Os dados estão parados desde ' + escH(d.desde) + '.';
    }
    return '';
  }

  function filtros() {
    return {
      di: document.getElementById('dataInicio').value,
      df: document.getElementById('dataFim').value,
      prof: profsSelecionados(),
      uni: unisSelecionadas()
    };
  }
  function noFiltro(r, f, semPessoaOk) {
    if (r.data < f.di || r.data > f.df) return false;
    if (!r.profissional) return semPessoaOk && !f.prof.length && !f.uni.length;
    if (isExcludedProfessional(r.profissional)) return false;
    return profNoFiltro(r.profissional, f.prof) && uniNoFiltro(r.unidade, f.uni);
  }

  // Grade estimada (02/10/2026): blocos reconstituídos pelo padrão dos pacientes (origem 'estimada'). Agrupa por
  // profissional, unidade, dia da semana e horário. É aviso, não pendência: não desconta da nota da Saúde.
  function gradesEstimadas(f) {
    var g = {};
    (window.DADOS || []).forEach(function (r) {
      if (r.Origem !== 'estimada' || r.Data < f.di || r.Data > f.df) return;
      if (!profNoFiltro(r.Profissional, f.prof) || !uniNoFiltro(r.Unidade, f.uni)) return;
      var turno = String(r['Dia da Semana']).slice(0, 3).toLowerCase() + ' ' + String(r['Hora Início']).slice(0, 5) + '–' + String(r['Hora Fim']).slice(0, 5);
      var k = r.Profissional + '|' + r.Unidade + '|' + turno;
      var x = g[k] || (g[k] = { tipo: 'estimada', severidade: 4, profissional: r.Profissional, unidade: r.Unidade, n: 0, data: r.Data, detalhe: { turno: turno, de: r.Data, ate: r.Data } });
      x.n++;
      if (r.Data < x.detalhe.de) x.detalhe.de = r.Data;
      if (r.Data > x.detalhe.ate) { x.detalhe.ate = r.Data; x.data = r.Data; }
    });
    return Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.n - a.n; });
  }

  function pendenciasDoFiltro() {
    var f = filtros();
    var ps = Q.pendencias.filter(function (p) { return noFiltro(p, f, true); }).concat(gradesEstimadas(f));
    var selo = document.getElementById('aoVivo');
    if (selo && selo.classList.contains('parado')) {
      ps.unshift({ tipo: 'sync', severidade: 1, n: 0, data: f.df, detalhe: { desde: selo.textContent.replace(/^Atualizado /, '') } });
    }
    return ps;
  }

  function calcular(fx) {
    var f = fx || filtros();
    var rows = (window.DADOS || []).filter(function (r) {
      return r.Data >= f.di && r.Data <= f.df && !isExcludedProfessional(r.Profissional) &&
        profNoFiltro(r.Profissional, f.prof) && uniNoFiltro(r.Unidade, f.uni);
    });
    var porProf = {};
    rows.forEach(function (r) {
      var p = porProf[r.Profissional] || (porProf[r.Profissional] = { aberta: false });
      if ((r['Capacidade Total (slots)'] || 0) > (r['Bloqueios (slots)'] || 0)) p.aberta = true;
    });
    var nomes = Object.keys(porProf);
    var abertas = nomes.filter(function (n) { return porProf[n].aberta; }).length;
    var fora = { atendido: 0, falta: 0, desmarcado: 0, marcado: 0, encaixe: 0 };
    Q.fora.forEach(function (r) { if (noFiltro(r, f, false)) fora[r.tipo] += r.n; });
    var presentes = 0, faltas = 0, pacientes = 0;
    rows.forEach(function (r) {
      presentes += Number(r.PRESENTES) || 0;
      faltas += r['Faltas (no-show)'] || 0;
      pacientes += r['Agendamentos'] || 0;
    });
    var ps = pendenciasDoFiltro();
    var comPend = 0, semProf = 0;
    ps.forEach(function (p) {
      if (p.tipo !== 'agenda_vazia' && p.tipo !== 'sync' && p.tipo !== 'estimada') comPend += p.n;
    });
    var base = pacientes + fora.atendido + fora.falta + fora.marcado + fora.encaixe + semProf;
    var saude = base > 0 ? Math.max(0, 100 - comPend / base * 100) : 100;
    if (ps.some(function (p) { return p.tipo === 'sync'; })) saude = Math.min(saude, 94.9);
    return { profs: nomes.length, abertas: abertas, fora: fora, presentes: presentes, faltas: faltas, saude: saude, pend: ps };
  }

  function pctTxt(n, d) { return d > 0 ? (n / d * 100).toFixed(1).replace('.', ',') + '%' : '0%'; }
  function corSaude() { return '#38bdf8'; } // aquário: mesma cor sempre

  // Comparação (01/10/2026): acompanha o modo do painel (ano anterior ou mês escolhido). Fora da grade só existe
  // desde o primeiro dia gravado pelo sync; base anterior a isso mostra "sem histórico" em vez de variação falsa.
  function comparacao(valor, base, temHistorico, label) {
    if (!temHistorico) return '<div class="kpi-py-wrap"><span class="kpi-py-base">' + label + ': sem histórico</span></div>';
    var delta = valor - base;
    var pct = base !== 0 ? delta / base * 100 : (valor > 0 ? 100 : 0);
    var cls = delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'eq';
    var seta = delta > 0 ? '▲' : delta < 0 ? '▼' : '●';
    return '<div class="kpi-py-wrap"><span class="kpi-py-base">' + label + ': ' + base + '</span>' +
      '<span class="kpi-py-delta ' + cls + '">' + seta + ' ' + Math.abs(pct).toFixed(1) + '%</span></div>';
  }

  function desenhar() {
    var c = calcular();
    var cmp = window.__COMPARE_BASE, cb = null, foraDesde = Q.fora.length ? Q.fora[0].data : '9999';
    if (cmp) {
      var f0 = filtros();
      cb = calcular({ di: cmp.di, df: cmp.df, prof: f0.prof, uni: f0.uni });
    }
    var cards = [
      { label: 'Profissionais no Período', icon: '👩‍⚕️', color: '#38bdf8', value: c.profs,
        sub: c.abertas + ' com agenda aberta · ' + (c.profs - c.abertas) + ' só bloqueio' },
      { label: 'Atendidos fora da Grade', icon: '🕐', color: '#a78bfa', value: c.fora.atendido,
        sub: pctTxt(c.fora.atendido, c.presentes + c.fora.atendido) + ' dos atendimentos do período' },
      { label: 'Faltas fora da Grade', icon: '⏱️', color: '#f87171', value: c.fora.falta,
        sub: pctTxt(c.fora.falta, c.faltas + c.fora.falta) + ' das faltas (fora da taxa de faltas)' },
      { label: 'Desmarcados fora da Grade', icon: '↩️', color: '#fb923c', value: c.fora.desmarcado,
        sub: 'Agendados fora da grade e depois desmarcados' },
      { label: 'Encaixes fora da Grade', icon: '➕', color: '#f59e0b', value: c.fora.encaixe,
        sub: 'Encaixes em horário sem grade (legítimos: não viram pendência)' }
    ];
    // Valor da base de comparação de cada card (mesma ordem)
    var baseVals = cb ? [cb.profs, cb.fora.atendido, cb.fora.falta, cb.fora.desmarcado, cb.fora.encaixe] : [];
    cont.innerHTML = cards.map(function (k, i) {
      var cmpHtml = cb ? comparacao(Number(k.value), baseVals[i], i === 0 || cmp.di >= foraDesde, cmp.label) : '';
      return '<div class="kpi-card' + (k.id ? ' kpi-card-clicavel' : '') + '"' + (k.id ? ' id="' + k.id + '" role="button" tabindex="0"' : '') +
        ' data-label="' + k.label + '" style="--kpi-accent:' + k.color + '">' +
        '<div class="kpi-top"><span class="kpi-icon">' + k.icon + '</span><span class="kpi-label">' + k.label + '</span></div>' +
        '<div class="kpi-value" style="color:' + k.color + '">' + k.value + '</div>' +
        cmpHtml +
        '<div class="kpi-sub">' + k.sub + '</div></div>';
    }).join('');
    // Botão "Saúde do painel" no topo: campo liso com o %, sem cor nem palavra de alarme (decisão do proprietário).
    var btn = document.getElementById('healthButton');
    if (btn) {
      document.getElementById('healthStatus').textContent = c.saude.toFixed(1).replace('.', ',') + '%';
      btn.setAttribute('aria-label', 'Saúde do painel: ' + c.saude.toFixed(1).replace('.', ',') + '% dos agendamentos sem pendência. Abrir detalhes.');
    }
    if (document.getElementById('saudeModal').classList.contains('aberto')) preencherModal();
  }

  function pendenciasVisiveis(c) { return c.pend.filter(function (p) { return !filtroTipo || p.tipo === filtroTipo; }); }

  function preencherModal() {
    var c = calcular(), f = filtros();
    var ps = pendenciasVisiveis(c);
    var porTipo = {};
    c.pend.forEach(function (p) { porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1; });
    document.getElementById('saudeTitulo').textContent = 'Saúde dos dados · ' + br(f.di) + ' a ' + br(f.df);
    // Peso da grade estimada no período (aviso, só quando existe)
    var capTot = 0, capEst = 0;
    (window.DADOS || []).forEach(function (r) {
      if (r.Data < f.di || r.Data > f.df || isExcludedProfessional(r.Profissional)) return;
      if (!profNoFiltro(r.Profissional, f.prof) || !uniNoFiltro(r.Unidade, f.uni)) return;
      capTot += r['Capacidade Total (slots)'] || 0;
      if (r.Origem === 'estimada') capEst += r['Capacidade Total (slots)'] || 0;
    });
    var nPend = c.pend.filter(function (p) { return p.tipo !== 'estimada'; }).length;
    document.getElementById('saudeResumo').innerHTML =
      '<span class="saude-nota" style="color:' + corSaude(c.saude) + '">● ' + c.saude.toFixed(1).replace('.', ',') +
      '%</span> dos agendamentos sem pendência · ' + plural(nPend, 'pendência', 'pendências') +
      (capEst > 0 ? '<div class="saude-aviso-estimada">' + (capEst / capTot * 100).toFixed(1).replace('.', ',') +
        '% da capacidade deste período vem de <b>grade estimada</b> (grade original apagada na Feegow).</div>' : '');
    var chips = '<button type="button" class="saude-chip' + (!filtroTipo ? ' ativo' : '') + '" data-tipo="">Todas <span>' + c.pend.length + '</span></button>';
    Object.keys(TIPOS).forEach(function (t) {
      if (porTipo[t]) chips += '<button type="button" class="saude-chip' + (filtroTipo === t ? ' ativo' : '') + '" data-tipo="' + t + '">' +
        TIPOS[t].nome + ' <span>' + porTipo[t] + '</span></button>';
    });
    document.getElementById('saudeChips').innerHTML = chips;
    var MAX = 300;
    var html = ps.slice(0, MAX).map(function (p) {
      var s = SEV[p.severidade] || SEV[3];
      return '<div class="saude-item" style="--sev:' + s.cor + '">' +
        '<div class="saude-item-tipo">' + s.bola + ' ' + TIPOS[p.tipo].nome + '</div>' +
        '<div class="saude-item-frase">' + frase(p) + '</div>' +
        '<div class="saude-item-acao">→ ' + TIPOS[p.tipo].acao + '</div></div>';
    }).join('');
    if (!ps.length) {
      html = '<div class="saude-vazio">Nenhuma pendência neste filtro. Verificamos: grade vigente, bloqueios, ' +
        'status de dias passados, agendas vazias e atualização automática.</div>';
    }
    if (ps.length > MAX) html += '<div class="saude-vazio">Mostrando ' + MAX + ' de ' + ps.length + '. Use os filtros de tipo, período ou unidade.</div>';
    document.getElementById('saudeLista').innerHTML = html;
  }

  function abrir() {
    filtroTipo = '';
    preencherModal();
    document.getElementById('saudeModal').classList.add('aberto');
  }
  function fechar() { document.getElementById('saudeModal').classList.remove('aberto'); }

  document.getElementById('healthButton').addEventListener('click', abrir);
  document.getElementById('saudeFechar').addEventListener('click', fechar);
  document.getElementById('saudeModal').addEventListener('click', function (e) { if (e.target.id === 'saudeModal') fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
  document.getElementById('saudeChips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tipo]');
    if (!b) return;
    filtroTipo = b.getAttribute('data-tipo');
    preencherModal();
  });
  document.getElementById('saudeCopiar').addEventListener('click', function () {
    var c = calcular(), f = filtros();
    var txt = 'Saúde dos dados — ' + br(f.di) + ' a ' + br(f.df) + '\n\n' + pendenciasVisiveis(c).map(function (p) {
      var tmp = document.createElement('div');
      tmp.innerHTML = frase(p);
      return (SEV[p.severidade] || SEV[3]).bola + ' ' + tmp.textContent + '\n   → ' + TIPOS[p.tipo].acao;
    }).join('\n\n');
    var b = this;
    var ok = function () { b.textContent = 'Copiado!'; setTimeout(function () { b.textContent = 'Copiar lista'; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, function () { window.prompt('Copie o texto:', txt); });
    else window.prompt('Copie o texto:', txt);
  });

  function carregar() {
    return fetch('/api/qualidade', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d) { Q = d; desenhar(); } })
      .catch(function (e) { console.warn('[qualidade]', e.message); });
  }
  window.__recarregarQualidade = carregar;

  // Redesenha sempre que os cards de cima forem redesenhados (filtro, comparação, dados novos)
  var agendado = false;
  new MutationObserver(function () {
    if (agendado) return;
    agendado = true;
    setTimeout(function () { agendado = false; desenhar(); }, 0);
  }).observe(document.getElementById('kpiContainer'), { childList: true });
  desenhar();
  carregar();
})();

// ------------------------------------------------------------------------------------------------------------------
// 06/10/2026 — "Baixar Excel" em Registros Detalhados (pedido do proprietário). Salva TODAS as linhas do filtro atual
// (período, profissionais, unidades) num .xlsx gerado no próprio navegador, sem biblioteca externa: o arquivo é um zip
// (sem compressão) com as partes mínimas do formato do Excel. Taxas por linha com as mesmas contas do painel.
function baixarExcelDetalhado() {
  var linhas = window.__DET_ROWS || [];
  if (!linhas.length) { alert('Nenhum registro no filtro atual.'); return; }
  var di = document.getElementById('dataInicio').value, df = document.getElementById('dataFim').value;
  // 16/10/2026: registra a exportação no log de acesso (docs/ACESSO.md). Falhar o registro não impede o download.
  fetch('/api/acesso/exportou', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linhas: linhas.length, ini: di, fim: df }) }).catch(function () {});
  var hhmm = function (h) { return String(h || '').slice(0, 5); };
  var dataBr = function (d) { var m = String(d || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] : String(d || ''); };
  var num = function (v) { var n = Number(v); return isFinite(n) ? n : 0; };
  var um = function (v) { return Math.round(v * 10) / 10; };
  var cab = ['Data', 'Dia da semana', 'Período', 'Profissional', 'Unidade', 'Grade (início)', 'Grade (fim)', 'Intervalo (min)',
    'Capacidade', 'Bloqueios', 'Capacidade − bloqueios', 'Agendamentos totais', 'Agendamentos marcados', 'Total de pacientes', 'Faltas',
    'Desmarcados', 'Encaixes', 'Representantes', 'Livres', 'Taxa de Ocupação (%)', 'Taxa de Agendamento (%)',
    'Preenchimento da Grade (%)', 'Grade estimada'];
  var dados = linhas.slice().sort(function (a, b) {
    return String(a.Data).localeCompare(String(b.Data)) || String(a.Profissional).localeCompare(String(b.Profissional)) ||
      String(a['Hora Início']).localeCompare(String(b['Hora Início']));
  }).map(function (rec) {
    var cap = num(rec['Capacidade Total (slots)']), bloq = num(rec['Bloqueios (slots)']);
    var marc = num(rec['Slots Agendados (total c/ retornos)']), falt = num(rec['Faltas (no-show)']), liv = num(rec['Slots Livres']);
    return [dataBr(rec.Data), rec['Dia da Semana'] || '', rec['Período'] || '', rec.Profissional || '', rec.Unidade || '',
      hhmm(rec['Hora Início']), hhmm(rec['Hora Fim']), num(rec['Duração do Slot (min)']),
      cap, bloq, Math.max(0, cap - bloq), num(rec['Agendados nova']), num(rec['Agendamentos Marcados']), num(rec['Agendamentos']),
      falt, num(rec['Desmarcados(Slot)']), num(rec['Encaixes (atendimentos)']), num(rec['Representantes']), liv,
      um(calcOcupacao(marc, cap, bloq)), um(calcAgendamento(marc, falt, cap, bloq)), um(calcPreenchimento(liv, cap, bloq)),
      rec.Origem === 'estimada' ? 'Sim' : 'Não'];
  });
  var blob = montarXlsx('Registros Detalhados', cab, dados, [12, 14, 10, 34, 26, 12, 12, 12, 11, 10, 11, 14, 14, 14, 9, 12, 10, 14, 9, 14, 16, 18, 13]);
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'registros-detalhados_' + di + '_a_' + df + '.xlsx';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
}

function montarXlsx(nomeAba, cabecalho, linhas, larguras) {
  var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var col = function (i) { var s = ''; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  var celula = function (v, ref, estilo) {
    if (typeof v === 'number') return '<c r="' + ref + '"' + (estilo ? ' s="' + estilo + '"' : '') + '><v>' + v + '</v></c>';
    return '<c r="' + ref + '" t="inlineStr"' + (estilo ? ' s="' + estilo + '"' : '') + '><is><t xml:space="preserve">' + esc(v) + '</t></is></c>';
  };
  var ultima = col(cabecalho.length - 1) + (linhas.length + 1);
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    '<cols>' + larguras.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join('') + '</cols>' +
    '<sheetData><row r="1">' + cabecalho.map(function (c, i) { return celula(c, col(i) + '1', 1); }).join('') + '</row>' +
    linhas.map(function (l, n) {
      return '<row r="' + (n + 2) + '">' + l.map(function (v, i) {
        return celula(v, col(i) + (n + 2), typeof v === 'number' && /\(%\)$/.test(cabecalho[i]) ? 2 : 0);
      }).join('') + '</row>';
    }).join('') +
    '</sheetData><autoFilter ref="A1:' + ultima + '"/></worksheet>';
  var partes = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + esc(nomeAba).slice(0, 31) + '" sheetId="1" r:id="rId1"/></sheets>' +
      '<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'' + esc(nomeAba).slice(0, 31) + '\'!$A$1:$' + col(cabecalho.length - 1) + '$' + (linhas.length + 1) + '</definedName></definedNames></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="0.0"/></numFmts>' +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>' +
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FF1D4ED8"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    'xl/worksheets/sheet1.xml': xml
  };
  return new Blob([zipSemCompressao(partes)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function zipSemCompressao(arquivos) {
  var enc = new TextEncoder(), tab = zipSemCompressao.tab;
  if (!tab) { tab = zipSemCompressao.tab = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; tab[n] = c >>> 0; } }
  var crc = function (b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = tab[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  var locais = [], central = [], offset = 0;
  Object.keys(arquivos).forEach(function (nome) {
    var nomeB = enc.encode(nome), dados = enc.encode(arquivos[nome]), c = crc(dados);
    var h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint32(14, c, true); h.setUint32(18, dados.length, true); h.setUint32(22, dados.length, true);
    h.setUint16(26, nomeB.length, true);
    locais.push(new Uint8Array(h.buffer), nomeB, dados);
    var ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
    ch.setUint32(16, c, true); ch.setUint32(20, dados.length, true); ch.setUint32(24, dados.length, true);
    ch.setUint16(28, nomeB.length, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), nomeB);
    offset += 30 + nomeB.length + dados.length;
  });
  var tamCentral = central.reduce(function (s, p) { return s + p.length; }, 0);
  var fim = new DataView(new ArrayBuffer(22));
  fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, Object.keys(arquivos).length, true); fim.setUint16(10, Object.keys(arquivos).length, true);
  fim.setUint32(12, tamCentral, true); fim.setUint32(16, offset, true);
  var partes = locais.concat(central, [new Uint8Array(fim.buffer)]);
  var total = partes.reduce(function (s, p) { return s + p.length; }, 0), out = new Uint8Array(total), pos = 0;
  partes.forEach(function (p) { out.set(p, pos); pos += p.length; });
  return out;
}
