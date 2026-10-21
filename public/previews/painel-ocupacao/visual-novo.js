// Visual novo (09/10/2026, padrão; ?visual=atual volta ao anterior) — inspirado no shot "Shopeers" (Dribbble). Estilos em visual-novo.css.
// Só age com <html data-visual="novo"> (padrão; ?visual=atual desliga). Não cria número novo: os gráficos usam as
// mesmas linhas filtradas (window.__DET_ROWS), os mesmos totais (window.__DASH_DATA) e as mesmas fórmulas do painel.js
// (calcOcupacao, calcAgendamento, calcPreenchimento). Redesenha a cada render (evento "painel:render").
(function () {
  'use strict';
  if (document.documentElement.dataset.visual !== 'novo') return;

  var NS = 'http://www.w3.org/2000/svg';
  var DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  var DIAS_CURTOS = { 'Segunda': 'Seg', 'Terça': 'Ter', 'Quarta': 'Qua', 'Quinta': 'Qui', 'Sexta': 'Sex', 'Sábado': 'Sáb', 'Domingo': 'Dom' };

  function svgIcone(d) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  var ICONES = {
    grade: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    grafico: '<path d="M4 19.5h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/>',
    pessoa: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4"/>',
    predio: '<path d="M4 20.5h16M6 20.5V6.5l6-3 6 3v14"/><path d="M10 10h1M13 10h1M10 13.5h1M13 13.5h1M11 20.5v-3h2v3"/>',
    calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    semana: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2"/>',
    lupa: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    filtro: '<path d="M4 5.5h16l-6.2 7.3v5.2l-3.6 1.8v-7Z"/>',
    capacidade: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 12.5h8M8 16h5"/>',
    agenda: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M8.5 14.5l2.3 2.2 4.7-4.6"/>',
    falta: '<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
    desmarcado: '<path d="M9 14 4.5 9.5 9 5"/><path d="M4.5 9.5H14a5.5 5.5 0 0 1 0 11h-3"/>',
    cadeado: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    livre: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
    pacientes: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.7-3.2 3-4.8 5.5-4.8s4.8 1.6 5.5 4.8"/><path d="M15.5 5.6a3.2 3.2 0 0 1 0 6.1M17.5 14.6c1.6.6 2.6 2.1 3 4.4"/>',
    representante: '<path d="M7.5 20.5v-4.8a4.5 4.5 0 0 1 9 0v4.8"/><circle cx="12" cy="6.8" r="3.3"/>',
    alerta: '<path d="M12 4 2.8 19.5h18.4Z"/><path d="M12 10v4.2M12 17h.01"/>',
    faisca: '<path d="M12 3.5l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7Z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z"/>'
  };
  var ICONE_SECAO = { '#kpiContainer': 'grade', '#secOcc': 'grafico', '#secProf': 'pessoa', '#secUni': 'predio',
    '#secUniTempo': 'calendario', '#secPer': 'relogio', '#secDia': 'semana', '#secDet': 'lupa' };
  var ICONE_KPI = { 'Capacidade Total': 'capacidade', 'Agendamentos Totais': 'agenda', 'Agendamentos Marcados': 'agenda',
    'Faltas': 'falta', 'Desmarcados': 'desmarcado', 'Bloqueios': 'cadeado', 'Encaixes': 'mais', 'Livres': 'livre',
    'Total de Pacientes no Período': 'pacientes', 'Representantes': 'representante', 'Profissionais no Período': 'pessoa',
    'Atendidos fora da Grade': 'relogio', 'Faltas fora da Grade': 'falta', 'Desmarcados fora da Grade': 'desmarcado',
    'Encaixes fora da Grade': 'mais' };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  // Cor com var()/color-mix só funciona em style (atributo de SVG não lê variável CSS)
  var CORES_SVG = { fill: 1, stroke: 1, 'stop-color': 1 };
  function s(tag, attrs, pai) {
    var e = document.createElementNS(NS, tag), estilo = '';
    for (var k in attrs) {
      var v = String(attrs[k]);
      if (CORES_SVG[k] && /var\(|color-mix/.test(v)) estilo += k + ':' + v + ';';
      else if (k === 'style') estilo += v;
      else e.setAttribute(k, v);
    }
    if (estilo) e.setAttribute('style', estilo);
    if (pai) pai.appendChild(e);
    return e;
  }
  function pct(n) { return (Math.round(n * 10) / 10).toFixed(1) + '%'; } // mesmo formato do painel (fPct: ponto)

  // ---------- Fonte ----------
  var fonte = document.createElement('link');
  fonte.rel = 'stylesheet';
  fonte.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(fonte);

  // ---------- Menu lateral: ícones de linha, item ativo pela rolagem, cartão da NEXA ----------
  document.querySelectorAll('.sidebar-link[data-scroll]').forEach(function (a) {
    var nome = ICONE_SECAO[a.getAttribute('data-scroll')];
    var ico = a.querySelector('.ico');
    if (nome && ico) ico.innerHTML = svgIcone(ICONES[nome]);
  });
  var lateral = document.querySelector('.sidebar');
  var fab = document.querySelector('.chat-fab');
  if (lateral && fab) {
    var nexa = el('div', 'vn-nexa-lateral',
      '<div class="vn-orbe">' + svgIcone(ICONES.faisca) + '</div><b>Pergunte à NEXA</b>' +
      '<p>Assistente com IA que responde sobre a ocupação usando os dados do filtro atual.</p>');
    var btnNexa = el('button', '', 'Abrir assistente');
    btnNexa.type = 'button';
    btnNexa.addEventListener('click', function () { fab.click(); });
    nexa.appendChild(btnNexa);
    nexa.querySelector('.vn-orbe').addEventListener('click', function () { fab.click(); }); // menu recolhido: só o ícone
    lateral.appendChild(nexa);
  }
  var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar-link[data-scroll]'));
  function marcarAtivo() {
    var atual = links[0], limite = 140;
    links.forEach(function (a) {
      var alvo = document.querySelector(a.getAttribute('data-scroll'));
      if (alvo && alvo.getBoundingClientRect().top - limite <= 0) atual = a;
    });
    links.forEach(function (a) { a.classList.toggle('vn-ativo', a === atual); });
  }
  window.addEventListener('scroll', marcarAtivo, { passive: true });

  // ---------- Recolher o menu fixo (alça na borda, como a opção 2 enviada pelo proprietário) ----------
  var alca = el('button', 'vn-alca', '<svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="m12.5 4.5-5 5.5 5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  alca.type = 'button';
  function aplicarRecolhido(sim) {
    document.documentElement.classList.toggle('vn-recolhido', sim);
    alca.setAttribute('aria-label', sim ? 'Expandir menu' : 'Recolher menu');
    alca.title = sim ? 'Expandir menu' : 'Recolher menu';
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 300); // tabelas e gráficos reajustam
  }
  alca.addEventListener('click', function () {
    var sim = !document.documentElement.classList.contains('vn-recolhido');
    aplicarRecolhido(sim);
    try { localStorage.setItem('painel-menu', sim ? 'recolhido' : 'aberto'); } catch (e) {}
  });
  document.body.appendChild(alca);
  // Menu recolhido: o quadrado laranja do logo (450 px de origem, nítido em tela de alta resolução) no lugar da palavra
  var selo = document.querySelector('.sidebar-badge.marca');
  if (selo) {
    var icone = el('img', 'vn-icone-recolhido');
    icone.src = 'logo-demo-icone.svg'; // MODO DEMO: logo neutro, caminho relativo
    icone.alt = 'Clínica Demo';
    selo.appendChild(icone);
  }
  try { aplicarRecolhido(localStorage.getItem('painel-menu') === 'recolhido'); } catch (e) { aplicarRecolhido(false); }
  document.querySelectorAll('.sidebar-link').forEach(function (a) { var t = a.querySelector('.left span:last-child'); if (t) a.title = t.textContent; });

  // ---------- Telas estreitas / zoom alto (menu em gaveta): botão ☰ explícito ao lado do logo ----------
  var abreMenu = document.getElementById('btnSidebar');
  if (abreMenu) {
    var hamb = el('button', 'vn-menu-btn', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>');
    hamb.type = 'button';
    hamb.setAttribute('aria-label', 'Abrir menu');
    hamb.addEventListener('click', function () { abreMenu.click(); });
    abreMenu.parentNode.insertBefore(hamb, abreMenu);
  }

  // ---------- Cabeçalho da página: título + período e ações (os mesmos botões, só mudam de lugar) ----------
  var main = document.querySelector('.main');
  var cab = el('div', 'vn-cabecalho');
  var titulos = el('div', '', '<h1>Ocupação de Agenda</h1>');
  var sub = el('div', 'vn-sub');
  var aoVivo = document.getElementById('aoVivo');
  if (aoVivo) sub.appendChild(aoVivo);
  titulos.appendChild(sub);
  var acoes = el('div', 'vn-acoes');
  // Sem barra do topo (telas largas): Saúde do painel, Dicas, "+" do agendador e lua/sol vêm para o cabeçalho
  var icones = el('div', 'vn-icones');
  ['healthButton', 'dicasBtn', 'configBtn', 'agendadorBtn', 'temaBtn'].forEach(function (id) { var b = document.getElementById(id); if (b) icones.appendChild(b); });
  ['btnComparePY', 'btnCompareMOM'].forEach(function (id) { var b = document.getElementById(id); if (b) acoes.appendChild(b); });
  // Datas + Aplicar num bloco só: com zoom, o grupo quebra entre os botões de comparar e esse bloco, nunca no meio dele
  var periodo = el('div', 'vn-periodo');
  var datas = document.querySelector('.date-pill');
  if (datas) periodo.appendChild(datas);
  var aplicar = document.getElementById('btnFiltro');
  if (aplicar) { aplicar.innerHTML = svgIcone(ICONES.filtro) + '<span>Aplicar</span>'; aplicar.querySelector('svg').style.cssText = 'width:15px;height:15px'; periodo.appendChild(aplicar); }
  acoes.appendChild(periodo);
  // Ordem: título | ícones (Saúde, Dicas, tema) | período. Sem espaço, o período desce inteiro para a linha de baixo.
  cab.append(titulos, icones, acoes);
  if (main) main.insertBefore(cab, main.firstChild);

  // Sem barra do topo, o logo divide a faixa com "Ocupação de Agenda": o topo do menu passa a ter a altura que põe o
  // centro do logo na altura do centro do bloco do título (acompanha zoom e quebra de linha do cabeçalho).
  var topoMenu = document.querySelector('.sidebar-header');
  // Mede depois que o desenho assentar. Aba em segundo plano não desenha quadros (requestAnimationFrame não roda):
  // aí mede por timer, e de novo quando a aba volta a ficar visível.
  function alinharLogo() {
    if (document.hidden) setTimeout(alinharLogoAgora, 60);
    else requestAnimationFrame(alinharLogoAgora);
  }
  document.addEventListener('visibilitychange', alinharLogo);
  function alinharLogoAgora() {
    if (!topoMenu) return;
    if (window.innerWidth < 1100) { topoMenu.style.height = ''; return; }
    // O menu é fixo a partir do topo da tela: altura = 2 × centro do bloco do título (em coordenadas da página)
    var r = titulos.getBoundingClientRect();
    if (r.height) topoMenu.style.height = Math.round(r.top + r.bottom + 2 * window.scrollY) + 'px';
  }
  window.addEventListener('resize', alinharLogo);
  // O bloco muda de altura sozinho ("Atualizado às…" aparece depois da 1ª carga; a fonte Inter chega depois)
  if (window.ResizeObserver) new ResizeObserver(alinharLogo).observe(titulos);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alinharLogo);
  alinharLogo();

  // ---------- Área dos gráficos (entre os KPIs e a Qualidade da agenda) ----------
  var area = el('section', 'vn-graficos');
  area.innerHTML =
    '<div class="vn-col"><div class="vn-card" id="vnLinha"></div></div>' +
    '<div class="vn-col"><div class="vn-card" id="vnBarras"></div></div>';
  var kpis = document.getElementById('kpiContainer');
  if (kpis) kpis.parentNode.insertBefore(area, kpis.nextSibling);
  // Linha 2: o cartão "Taxa de Ocupação Geral" que já existe, com o medidor ao lado (como tabela + medidor do shot)
  var secOcc = document.getElementById('secOcc');
  if (secOcc) {
    var linha2 = el('section', 'vn-graficos vn-linha2');
    secOcc.parentNode.insertBefore(linha2, secOcc);
    var colOcc = el('div', 'vn-col');
    colOcc.appendChild(secOcc);
    var colMed = el('div', 'vn-col', '<div class="vn-card" id="vnMedidor"></div>');
    linha2.append(colOcc, colMed);
  }

  var tip = el('div', 'vn-tip');
  tip.hidden = true;
  document.body.appendChild(tip);
  // Abre à direita do mouse; se não couber na tela, abre à esquerda (antes cortava na borda)
  function mostrarTip(ev, texto) {
    tip.textContent = texto; tip.hidden = false;
    var larg = tip.offsetWidth, x = ev.clientX + 14;
    if (x + larg > window.innerWidth - 8) x = ev.clientX - larg - 14;
    tip.style.left = Math.max(8, x) + 'px';
    tip.style.top = Math.max(8, ev.clientY - 38) + 'px';
  }
  function esconderTip() { tip.hidden = true; }
  window.addEventListener('scroll', esconderTip, { passive: true });

  // Mesma conta do painel, por grupo
  function somar(linhas) {
    var t = { cap: 0, ag: 0, bloq: 0, falta: 0, livre: 0 };
    linhas.forEach(function (r) {
      t.cap += r['Capacidade Total (slots)'] || 0;
      t.ag += r['Slots Agendados (total c/ retornos)'] || 0;
      t.bloq += r['Bloqueios (slots)'] || 0;
      t.falta += r['Faltas (no-show)'] || 0;
      t.livre += r['Slots Livres'] || 0;
    });
    t.occ = calcOcupacao(t.ag, t.cap, t.bloq);
    return t;
  }
  function porData(linhas) {
    var g = {};
    linhas.forEach(function (r) { var d = String(r.Data).slice(0, 10); (g[d] = g[d] || []).push(r); });
    return Object.keys(g).sort().map(function (d) { var t = somar(g[d]); t.data = d; return t; })
      .filter(function (t) { return t.cap - t.bloq > 0; });
  }
  // Linhas do período de comparação, com os mesmos filtros da tela (profissional, unidade, exclusões)
  function linhasDaComparacao() {
    var base = window.__COMPARE_BASE;
    if (!base || !window.DADOS) return null;
    var profs = typeof profsSelecionados === 'function' ? profsSelecionados() : [];
    var unis = typeof unisSelecionadas === 'function' ? unisSelecionadas() : [];
    return window.DADOS.filter(function (r) {
      var d = String(r.Data).slice(0, 10);
      return d >= base.di && d <= base.df && !isExcludedProfessional(r.Profissional) &&
        profNoFiltro(r.Profissional, profs) && uniNoFiltro(r.Unidade, unis);
    });
  }
  function dm(iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7); }

  // Soma dias em semanas (começando na segunda) ou meses; a taxa é refeita sobre a soma, como no painel
  var MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function agruparSerie(serie, modo) {
    if (modo === 'dia') return serie.map(function (t) { t.chave = t.data; return t; });
    var g = {}, ordem = [];
    serie.forEach(function (t) {
      var chave;
      if (modo === 'mes') chave = t.data.slice(0, 7);
      else { var d = new Date(t.data + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); chave = d.toISOString().slice(0, 10); }
      if (!g[chave]) { g[chave] = { chave: chave, inicio: t.data, cap: 0, ag: 0, bloq: 0, falta: 0, livre: 0, dias: 0 }; ordem.push(chave); }
      if (t.data < g[chave].inicio) g[chave].inicio = t.data;
      ['cap', 'ag', 'bloq', 'falta', 'livre'].forEach(function (c) { g[chave][c] += t[c]; });
      g[chave].dias++;
    });
    return ordem.sort().map(function (c) { var t = g[c]; t.occ = calcOcupacao(t.ag, t.cap, t.bloq); t.data = c; return t; });
  }
  function rotuloPonto(t, modo, variosAnos, longo) {
    if (modo === 'mes') {
      var m = MES_CURTO[+t.chave.slice(5, 7) - 1];
      return longo ? m + '/' + t.chave.slice(0, 4) : m + (variosAnos ? '/' + t.chave.slice(2, 4) : '');
    }
    if (modo === 'semana') return (longo ? 'semana de ' : '') + dm(t.inicio || t.chave); // 1º dia dentro do período
    return dm(t.chave);
  }
  function fmtN(n) { return Math.round(n).toLocaleString('pt-BR'); }

  // ---------- 1) Ocupação ao longo do período (linha com área; tracejado = período de comparação) ----------
  function desenharLinha() {
    var card = document.getElementById('vnLinha');
    var serie = porData(window.__DET_ROWS || []);
    var k = (window.__DASH_DATA || {}).kpis || {};
    var base = linhasDaComparacao();
    var serieBase = base ? porData(base) : [];
    if (serie.length === 1) { desenharDia(card, serie[0]); return; }
    // Período grande: um ponto por dia vira serrote ilegível. Até 45 dias = dia; até ~6 meses = semana; acima = mês.
    var diasComAgenda = serie.length;
    var modo = diasComAgenda <= 45 ? 'dia' : diasComAgenda <= 160 ? 'semana' : 'mes';
    serie = agruparSerie(serie, modo);
    serieBase = agruparSerie(serieBase, modo);
    var variosAnos = serie.length && serie[0].chave.slice(0, 4) !== serie[serie.length - 1].chave.slice(0, 4);
    var titulo = { dia: 'Ocupação dia a dia', semana: 'Ocupação semana a semana', mes: 'Ocupação mês a mês' }[modo];
    var extremos = '';
    if (modo !== 'dia' && serie.length > 2) {
      var melhor = serie.reduce(function (a, b) { return b.occ > a.occ ? b : a; });
      var pior = serie.reduce(function (a, b) { return b.occ < a.occ ? b : a; });
      var nome = modo === 'mes' ? 'mês' : 'semana';
      extremos = ' · melhor ' + nome + ': ' + rotuloPonto(melhor, modo, variosAnos, true) + ' (' + pct(melhor.occ) + ')' +
        ' · pior: ' + rotuloPonto(pior, modo, variosAnos, true) + ' (' + pct(pior.occ) + ')';
    }
    card.innerHTML =
      '<div class="vn-card-topo"><span class="vn-card-titulo">' + titulo + '</span>' +
      '<span class="vn-card-legenda"><span><i></i>Período</span>' + (serieBase.length ? '<span><i class="base"></i>' + escH(window.__COMPARE_BASE.label) + '</span>' : '') + '</span></div>' +
      '<div class="vn-destaque"><b>' + pct(k.occGeral || 0) + '</b><span>ocupação média · ' + plural(diasComAgenda, 'dia', 'dias') +
      ' com agenda' + escH(extremos) + '</span></div>';
    if (!serie.length) { card.appendChild(el('div', 'vn-vazio', 'Sem agenda no período.')); return; }
    if (serie.length === 1) {
      card.appendChild(el('div', 'vn-vazio', 'O período cabe num só ' + (modo === 'mes' ? 'mês' : 'grupo') + ': ' + pct(serie[0].occ) + '.'));
      return;
    }
    var W = 760, H = 230, pe = 38, pd = 14, pt = 12, pb = 26, w = W - pe - pd, h = H - pt - pb;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'vn-svg', role: 'img', 'aria-label': titulo });
    // Semana/mês: as taxas ficam numa faixa estreita (ex.: 64–71%); com eixo 0–100% a linha sai reta e esconde a
    // tendência. O eixo se ajusta à faixa dos dados (passos de 10, valores marcados). Dia a dia continua 0–100%.
    var lo = 0, hi = 100;
    if (modo !== 'dia') {
      var vals = serie.concat(serieBase).map(function (t) { return Math.min(100, t.occ); });
      lo = Math.max(0, Math.floor((Math.min.apply(null, vals) - 5) / 10) * 10);
      hi = Math.min(100, Math.ceil((Math.max.apply(null, vals) + 5) / 10) * 10);
      if (hi - lo < 20) hi = Math.min(100, lo + 20);
    }
    var marcas = [], passoEixo = modo === 'dia' ? 25 : (hi - lo) <= 40 ? 10 : 20;
    for (var v0 = lo; v0 <= hi; v0 += passoEixo) marcas.push(v0);
    marcas.forEach(function (v) {
      var yy = pt + h - ((v - lo) / (hi - lo)) * h;
      s('line', { x1: pe, x2: W - pd, y1: yy, y2: yy, class: 'grade' }, svg);
      s('text', { x: pe - 8, y: yy + 4, 'text-anchor': 'end', class: 'eixo' }, svg).textContent = v + '%';
    });
    var n = serie.length, x = function (i, total) { return pe + (total <= 1 ? w / 2 : (i / (total - 1)) * w); };
    var y = function (v) { return pt + h - ((Math.max(lo, Math.min(100, v)) - lo) / (hi - lo)) * h; };
    var defs = s('defs', {}, svg);
    var grad = s('linearGradient', { id: 'vnArea', x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    s('stop', { offset: '0%', 'stop-color': 'var(--blue)', 'stop-opacity': '0.22' }, grad);
    s('stop', { offset: '100%', 'stop-color': 'var(--blue)', 'stop-opacity': '0' }, grad);
    if (serieBase.length > 1) {
      var m = Math.min(n, serieBase.length);
      var pb2 = serieBase.slice(0, m).map(function (t, i) { return x(i, n) + ',' + y(t.occ); }).join(' ');
      s('polyline', { points: pb2, fill: 'none', stroke: 'var(--text5)', 'stroke-width': 1.6, 'stroke-dasharray': '5 5' }, svg);
    }
    var pts = serie.map(function (t, i) { return [x(i, n), y(t.occ)]; });
    var linha = pts.map(function (p) { return p.join(','); }).join(' ');
    s('polygon', { points: pe + ',' + (pt + h) + ' ' + linha + ' ' + x(n - 1, n) + ',' + (pt + h), fill: 'url(#vnArea)' }, svg);
    s('polyline', { points: linha, fill: 'none', stroke: 'var(--blue)', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, svg);
    if (modo !== 'dia') pts.forEach(function (p) {
      s('circle', { cx: p[0], cy: p[1], r: 3.2, fill: 'var(--surface)', stroke: 'var(--blue)', 'stroke-width': 2 }, svg);
    });
    var passo = Math.max(1, Math.ceil(n / (modo === 'mes' ? 12 : 8)));
    serie.forEach(function (t, i) {
      // último rótulo sempre aparece; o do passo anterior sai se ficar colado nele
      var ultimo = i === n - 1, pertoDoUltimo = !ultimo && (n - 1 - i) < passo * 0.75;
      if ((i % passo === 0 && !pertoDoUltimo) || ultimo) {
        s('text', { x: x(i, n), y: H - 6, 'text-anchor': i === 0 ? 'start' : ultimo ? 'end' : 'middle', class: 'eixo' }, svg)
          .textContent = rotuloPonto(t, modo, variosAnos, false);
      }
    });
    var marca = s('circle', { r: 4.5, fill: 'var(--surface)', stroke: 'var(--blue)', 'stroke-width': 2.2, visibility: 'hidden' }, svg);
    var alvo = s('rect', { x: pe, y: pt, width: w, height: h, fill: 'transparent' }, svg);
    alvo.addEventListener('mousemove', function (ev) {
      var r = svg.getBoundingClientRect(), fx = (ev.clientX - r.left) / r.width * W;
      var i = Math.max(0, Math.min(n - 1, Math.round((fx - pe) / w * (n - 1))));
      marca.setAttribute('cx', pts[i][0]); marca.setAttribute('cy', pts[i][1]); marca.setAttribute('visibility', 'visible');
      var t = serie[i], b = serieBase[i];
      mostrarTip(ev, rotuloPonto(t, modo, variosAnos, true) + ' · ocupação ' + pct(t.occ) + (b ? ' (comparação ' + pct(b.occ) + ')' : '') +
        ' · agendados ' + fmtN(t.ag) + ' de ' + fmtN(t.cap - t.bloq) + ' · livres ' + fmtN(t.livre));
    });
    alvo.addEventListener('mouseleave', function () { marca.setAttribute('visibility', 'hidden'); esconderTip(); });
    card.appendChild(svg);
  }

  // ---------- 1b) Um dia só: visão do dia (mesma conta do painel, agrupada por profissional) ----------
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var DIA_LONGO = { 'Segunda': 'Segunda-feira', 'Terça': 'Terça-feira', 'Quarta': 'Quarta-feira', 'Quinta': 'Quinta-feira',
    'Sexta': 'Sexta-feira', 'Sábado': 'Sábado', 'Domingo': 'Domingo' };
  var estadoDia = { uni: '', ordem: 'cheias' }; // sobrevive aos redesenhos (unidade e ordenação escolhidas no cartão)
  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }

  function desenharDia(card, dia) {
    var linhas = (window.__DET_ROWS || []).filter(function (r) { return String(r.Data).slice(0, 10) === dia.data; });
    var nomeDia = (linhas[0] || {})['Dia da Semana'] || '';
    var hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) === dia.data;
    var base = linhasDaComparacao(), serieBase = base ? porData(base) : [];
    var g = {};
    linhas.forEach(function (r) { var k = r.Profissional + '|' + r.Unidade; (g[k] = g[k] || []).push(r); });
    var bloqueadas = 0;
    var todas = Object.keys(g).map(function (k) { var t = somar(g[k]); t.prof = g[k][0].Profissional; t.uni = g[k][0].Unidade; return t; })
      .filter(function (t) { if (t.cap - t.bloq > 0) return true; bloqueadas++; return false; });
    var unidades = todas.map(function (p) { return p.uni; }).filter(function (u, i, a) { return a.indexOf(u) === i; }).sort();
    var nomeCurto = semPrefixo(unidades);
    if (unidades.indexOf(estadoDia.uni) < 0) estadoDia.uni = '';
    var mes = MESES[+dia.data.slice(5, 7) - 1], disp = dia.cap - dia.bloq;

    card.innerHTML =
      '<div class="vn-dia-cab">' +
        '<div class="vn-dia-cal"><b>' + dia.data.slice(8, 10) + '</b><span>' + mes.slice(0, 3) + '</span></div>' +
        '<div class="vn-dia-tit"><div class="vn-card-titulo">' + escH(DIA_LONGO[nomeDia] || nomeDia) + ', ' + (+dia.data.slice(8, 10)) +
          ' de ' + mes + (hoje ? ' <em class="vn-tag-hoje">Hoje</em>' : '') + '</div>' +
          '<div class="vn-dia-sub">Visão do dia · ' + plural(todas.length, 'agenda aberta', 'agendas abertas') +
          (bloqueadas ? ' · ' + plural(bloqueadas, 'toda bloqueada', 'todas bloqueadas') : '') +
          (serieBase.length ? ' · ' + escH(window.__COMPARE_BASE.label) + ': ' + pct(serieBase[0].occ) : '') + '</div></div>' +
        '<div class="vn-dia-occ"><b style="color:' + occColor(dia.occ) + '">' + pct(dia.occ) + '</b><span>ocupação do dia</span></div>' +
      '</div>' +
      '<div class="vn-dia-stats">' +
        '<div><span>Agendados</span><b>' + dia.ag + '<small> de ' + disp + '</small></b></div>' +
        '<div><span>Livres</span><b class="ok">' + dia.livre + '</b></div>' +
        '<div><span>Faltas</span><b class="ruim">' + dia.falta + '</b></div>' +
        '<div><span>Bloqueios</span><b>' + dia.bloq + '</b></div>' +
      '</div>';
    if (!todas.length) { card.appendChild(el('div', 'vn-vazio', 'Nenhuma agenda aberta neste dia.')); return; }

    // Controles: unidade e ordenação (redesenham só este cartão)
    var barra = el('div', 'vn-dia-ctrl');
    var chips = el('div', 'vn-chips');
    [''].concat(unidades).forEach(function (u) {
      var c = el('button', 'vn-chip' + (estadoDia.uni === u ? ' ativo' : ''));
      c.type = 'button';
      c.textContent = u ? nomeCurto(u) : 'Todas';
      c.addEventListener('click', function () { estadoDia.uni = u; desenharDia(card, dia); });
      chips.appendChild(c);
    });
    var ordem = el('div', 'vn-seg');
    [['cheias', 'Mais cheias'], ['livres', 'Mais livres'], ['nome', 'A–Z']].forEach(function (o) {
      var b = el('button', estadoDia.ordem === o[0] ? 'ativo' : '', o[1]);
      b.type = 'button';
      b.addEventListener('click', function () { estadoDia.ordem = o[0]; desenharDia(card, dia); });
      ordem.appendChild(b);
    });
    barra.append(chips, ordem);
    card.appendChild(barra);
    card.appendChild(el('div', 'vn-dia-leg', '<span><i class="ag"></i>Agendados</span><span><i class="fa"></i>Faltas</span>' +
      '<span><i class="li"></i>Livres</span>')); // 16/10/2026: "Sem paciente e não livre" saiu junto com o gráfico de composição

    var profs = todas.filter(function (p) { return !estadoDia.uni || p.uni === estadoDia.uni; });
    profs.sort(estadoDia.ordem === 'livres' ? function (a, b) { return b.livre - a.livre || a.occ - b.occ; }
      : estadoDia.ordem === 'nome' ? function (a, b) { return a.prof.localeCompare(b.prof); }
      : function (a, b) { return b.occ - a.occ || a.prof.localeCompare(b.prof); });

    var lista = el('div', 'vn-dia-lista');
    profs.forEach(function (p) {
      // Barra dividida dentro do disponível (capacidade − bloqueios); com encaixe a soma pode passar, aí a barra usa a soma
      var d = p.cap - p.bloq, total = Math.max(d, p.ag + p.falta + p.livre);
      var w = function (v) { return (Math.max(0, v) / total * 100).toFixed(2) + '%'; };
      var linha = el('div', 'vn-dia-linha',
        '<span class="vn-av" style="background:' + corProfissional(p.prof) + '"></span>' +
        '<div class="vn-dia-nome"><b></b><span></span></div>' +
        '<div class="vn-dia-barra"><i class="ag" style="width:' + w(p.ag) + '"></i><i class="fa" style="width:' + w(p.falta) +
          '"></i><i class="li" style="width:' + w(p.livre) + '"></i><i class="ou" style="width:' + w(total - p.ag - p.falta - p.livre) + '"></i></div>' +
        // Acima do disponível (encaixe em cima de horário cheio): "8 de 8 · +1" em vez de "9 de 8"
        '<div class="vn-dia-pct"><b style="color:' + occColor(p.occ) + '">' + pct(p.occ) + '</b><span>' +
          (p.ag > d ? d + ' de ' + d + ' · +' + (p.ag - d) : p.ag + ' de ' + d) + '</span></div>');
      linha.querySelector('.vn-av').textContent = iniciais(p.prof);
      linha.querySelector('.vn-dia-nome b').textContent = p.prof;
      var sub = linha.querySelector('.vn-dia-nome span');
      sub.textContent = nomeCurto(p.uni);
      if (p.livre) sub.insertAdjacentHTML('beforeend', ' <em class="vn-livres">' + plural(p.livre, 'livre', 'livres') + '</em>');
      linha.addEventListener('mousemove', function (ev) {
        mostrarTip(ev, p.prof + ' · disponível ' + d + ' (capacidade ' + p.cap + ' − bloqueios ' + p.bloq + ') · agendados ' + p.ag +
          ' · faltas ' + p.falta + ' · livres ' + p.livre);
      });
      linha.addEventListener('mouseleave', esconderTip);
      lista.appendChild(linha);
    });
    if (!profs.length) lista.appendChild(el('div', 'vn-vazio', 'Nenhuma agenda aberta nesta unidade.'));
    card.appendChild(lista);
  }

  // ---------- 2) Ocupação por dia da semana (maior em destaque); com um dia só, por período do dia ----------
  function desenharBarras() {
    var card = document.getElementById('vnBarras');
    var linhas = window.__DET_ROWS || [];
    var umDia = porData(linhas).length === 1;
    var chave = umDia ? 'Período' : 'Dia da Semana';
    var ordem = umDia ? ['Manhã', 'Tarde', 'Noite'] : DIAS;
    var g = {};
    linhas.forEach(function (r) { (g[r[chave]] = g[r[chave]] || []).push(r); });
    var dados = ordem.filter(function (d) { return g[d]; }).map(function (d) { var t = somar(g[d]); t.dia = d; return t; })
      .filter(function (t) { return t.cap - t.bloq > 0; });
    if (umDia) { desenharTurnos(card, dados); return; }
    card.innerHTML = '<div class="vn-card-topo"><span class="vn-card-titulo">Dia da semana mais ocupado</span></div>';
    if (!dados.length) { card.appendChild(el('div', 'vn-vazio', 'Sem agenda no período.')); return; }
    var maior = dados.reduce(function (a, b) { return b.occ > a.occ ? b : a; });
    var menor = dados.reduce(function (a, b) { return b.occ < a.occ ? b : a; });
    card.appendChild(el('div', 'vn-destaque', '<b>' + escH(maior.dia) + '</b><span>' + pct(maior.occ) + ' de ocupação' +
      (dados.length > 1 ? ' · menos ocupado: ' + escH(menor.dia.toLowerCase()) + ', ' + pct(menor.occ) : '') + '</span>'));
    // Rótulo acima do trilho (não em cima dele) e linha tracejada da média do período, para ver quem está acima/abaixo
    var W = 360, H = 200, topo = 30, base = 24, h = H - topo - base, n = dados.length, larg = Math.min(34, (W / n) * 0.55);
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'vn-svg', role: 'img', 'aria-label': 'Ocupação por dia da semana' });
    var media = ((window.__DASH_DATA || {}).kpis || {}).occGeral || 0;
    dados.forEach(function (t, i) {
      var cx = (i + 0.5) * (W / n), alt = Math.max(6, (Math.min(100, t.occ) / 100) * h), destaque = t === maior;
      s('rect', { x: cx - larg / 2, y: topo, width: larg, height: h, rx: 9, fill: 'var(--surface2)' }, svg);
      var barra = s('rect', { x: cx - larg / 2, y: topo + h - alt, width: larg, height: alt, rx: 9,
        fill: destaque ? 'var(--blue)' : 'color-mix(in srgb, var(--blue) 22%, var(--surface))' }, svg);
      s('text', { x: cx, y: topo - 9, 'text-anchor': 'middle', class: 'eixo',
        style: destaque ? 'fill:var(--blue);font-weight:700' : 'fill:var(--text4)' }, svg).textContent = pct(t.occ);
      var rot = s('text', { x: cx, y: H - 6, 'text-anchor': 'middle', class: 'eixo' }, svg);
      rot.textContent = DIAS_CURTOS[t.dia] || t.dia;
      if (destaque) rot.setAttribute('style', 'fill:var(--blue);font-weight:700');
      [barra].forEach(function (b) {
        b.addEventListener('mousemove', function (ev) {
          mostrarTip(ev, t.dia + ': ocupação ' + pct(t.occ) + ' · capacidade ' + t.cap + ' · bloqueios ' + t.bloq + ' · livres ' + t.livre);
        });
        b.addEventListener('mouseleave', esconderTip);
      });
    });
    if (media > 0) {
      var ym = topo + h - (Math.min(100, media) / 100) * h;
      s('line', { x1: 4, x2: W - 4, y1: ym, y2: ym, stroke: 'var(--text4)', 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }, svg);
    }
    card.appendChild(svg);
    if (media > 0) card.appendChild(el('div', 'vn-barras-leg', '<i></i>média do período: ' + pct(media)));
  }

  // ---------- 2b) Um dia só: turnos do dia (anel de ocupação + composição + onde ainda há horário) ----------
  var ICONE_TURNO = {
    'Manhã': '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    'Tarde': '<path d="M4 18h16M7 18a5 5 0 0 1 10 0"/><path d="M12 7v3M5.5 11.5l1.6 1.2M18.5 11.5l-1.6 1.2M4 21h16"/>',
    'Noite': '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z"/>'
  };
  function anel(pctValor, cor) {
    var r = 26, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, pctValor));
    return '<svg viewBox="0 0 64 64" class="vn-anel" aria-hidden="true">' +
      '<circle cx="32" cy="32" r="' + r + '" fill="none" style="stroke:var(--vn-grade)" stroke-width="7"/>' +
      '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + cor + '" stroke-width="7" stroke-linecap="round" ' +
      'stroke-dasharray="' + (c * v / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 32 32)"/></svg>';
  }
  function desenharTurnos(card, dados) {
    card.innerHTML = '<div class="vn-card-topo"><span class="vn-card-titulo">Turnos do dia</span>' +
      '<span class="vn-card-legenda">ocupação por turno</span></div>';
    if (!dados.length) { card.appendChild(el('div', 'vn-vazio', 'Sem agenda neste dia.')); return; }
    var maior = dados.reduce(function (a, b) { return b.occ > a.occ ? b : a; });
    var lista = el('div', 'vn-turnos');
    dados.forEach(function (t) {
      var d = t.cap - t.bloq, total = Math.max(d, t.ag + t.falta + t.livre), cor = occColor(t.occ);
      var w = function (v) { return (Math.max(0, v) / total * 100).toFixed(2) + '%'; };
      var bloco = el('div', 'vn-turno' + (t === maior && dados.length > 1 ? ' maior' : ''),
        '<div class="vn-turno-cab"><span class="vn-turno-ico">' + svgIcone(ICONE_TURNO[t.dia] || ICONES.relogio) + '</span>' +
          '<b>' + escH(t.dia) + '</b>' + (t === maior && dados.length > 1 ? '<em>Mais ocupado</em>' : '') + '</div>' +
        '<div class="vn-turno-corpo"><div class="vn-turno-anel">' + anel(t.occ, cor) + '<span style="color:' + cor + '">' + pct(t.occ) + '</span></div>' +
          '<div class="vn-turno-info"><div class="vn-turno-num"><b>' + t.ag + '</b> de ' + d + ' agendados</div>' +
          '<div class="vn-dia-barra"><i class="ag" style="width:' + w(t.ag) + '"></i><i class="fa" style="width:' + w(t.falta) +
            '"></i><i class="li" style="width:' + w(t.livre) + '"></i><i class="ou" style="width:' + w(total - t.ag - t.falta - t.livre) + '"></i></div>' +
          '<div class="vn-turno-det"><span class="li">' + plural(t.livre, 'livre', 'livres') + '</span><span class="fa">' +
            plural(t.falta, 'falta', 'faltas') + '</span><span>' + plural(t.bloq, 'bloqueio', 'bloqueios') + '</span></div></div></div>');
      bloco.addEventListener('mousemove', function (ev) {
        mostrarTip(ev, t.dia + ' · disponível ' + d + ' (capacidade ' + t.cap + ' − bloqueios ' + t.bloq + ') · agendados ' + t.ag +
          ' · faltas ' + t.falta + ' · livres ' + t.livre);
      });
      bloco.addEventListener('mouseleave', esconderTip);
      lista.appendChild(bloco);
    });
    card.appendChild(lista);
    var maisLivres = dados.reduce(function (a, b) { return b.livre > a.livre ? b : a; });
    card.appendChild(el('div', 'vn-turno-dica', maisLivres.livre
      ? svgIcone(ICONES.faisca) + '<span>Mais horários para oferecer: <b>' + escH(maisLivres.dia.toLowerCase()) + '</b>, ' +
        plural(maisLivres.livre, 'livre', 'livres') + '</span>'
      : svgIcone(ICONES.agenda) + '<span>Nenhum horário livre neste dia: agenda cheia.</span>'));
  }

  // ---------- 3) Ao lado da "Taxa de Ocupação Geral": ranking por unidade (o medidor repetia os mesmos 3 números).
  //      Com uma unidade só no filtro, o ranking teria uma linha: aí volta o medidor. ----------
  function desenharMedidor() {
    var card = document.getElementById('vnMedidor');
    var g = {};
    (window.__DET_ROWS || []).forEach(function (r) { (g[r.Unidade] = g[r.Unidade] || []).push(r); });
    var unis = Object.keys(g).map(function (u) { var t = somar(g[u]); t.uni = u; return t; })
      .filter(function (t) { return t.cap - t.bloq > 0; }).sort(function (a, b) { return b.occ - a.occ; });
    if (unis.length > 1) { desenharUnidades(card, unis); return; }
    var k = (window.__DASH_DATA || {}).kpis || {};
    var occ = Math.max(0, Math.min(100, k.occGeral || 0));
    var agend = calcAgendamento(k.sched || 0, k.noshow || 0, k.slots || 0, k.bloq || 0);
    var preen = calcPreenchimento(k.free || 0, k.slots || 0, k.bloq || 0);
    card.innerHTML = '<div class="vn-card-topo"><span class="vn-card-titulo">Taxa de ocupação</span></div>';
    var W = 300, H = 158, cx = W / 2, cy = 150, r1 = 100, r2 = 136, tracos = 40;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'vn-svg', role: 'img', 'aria-label': 'Taxa de ocupação ' + pct(occ) });
    var cor = typeof occColor === 'function' ? occColor(occ) : 'var(--green)';
    for (var i = 0; i < tracos; i++) {
      var a = Math.PI - (i / (tracos - 1)) * Math.PI, ativo = (i / (tracos - 1)) * 100 <= occ;
      s('line', { x1: cx + r1 * Math.cos(a), y1: cy - r1 * Math.sin(a), x2: cx + r2 * Math.cos(a), y2: cy - r2 * Math.sin(a),
        stroke: ativo ? cor : 'var(--vn-grade)', 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    }
    var v = s('text', { x: cx, y: cy - 30, 'text-anchor': 'middle', style: 'font-size:34px;font-weight:700;fill:var(--text1)' }, svg);
    v.textContent = pct(occ);
    s('text', { x: cx, y: cy - 8, 'text-anchor': 'middle', class: 'eixo' }, svg).textContent = 'do disponível';
    card.appendChild(svg);
    card.appendChild(el('div', 'vn-medidor-formula', 'agendados ÷ (capacidade − bloqueios)'));
    card.appendChild(el('div', 'vn-medidor-rodape',
      '<div><span>Taxa de agendamento</span><b>' + pct(agend) + '</b></div><div><span>Preenchimento da grade</span><b>' + pct(preen) + '</b></div>'));
  }

  // Prefixo repetido ("Marca - ") sai de quem o tem, mesmo que alguma unidade não tenha (MODO DEMO: nomes do exemplo removidos)
  function semPrefixo(nomes) {
    var cont = {};
    nomes.forEach(function (n) { var m = n.match(/^(.+? - )/); if (m) cont[m[1]] = (cont[m[1]] || 0) + 1; });
    var p = Object.keys(cont).filter(function (k) { return cont[k] >= 2; })[0] || '';
    return function (n) { return p && n.indexOf(p) === 0 ? n.slice(p.length) : n; };
  }

  function desenharUnidades(card, unis) {
    var nomeCurto = semPrefixo(unis.map(function (u) { return u.uni; }));
    card.innerHTML = '<div class="vn-card-topo"><span class="vn-card-titulo">Ocupação por unidade</span>' +
      '<span class="vn-card-legenda">da maior para a menor</span></div>';
    var lista = el('div', 'vn-unis');
    unis.forEach(function (t) {
      var d = t.cap - t.bloq, total = Math.max(d, t.ag + t.falta + t.livre), cor = occColor(t.occ);
      var w = function (v) { return (Math.max(0, v) / total * 100).toFixed(2) + '%'; };
      var linha = el('div', 'vn-uni',
        '<div class="vn-uni-anel">' + anel(t.occ, cor) + '</div>' +
        '<div class="vn-uni-info"><div class="vn-uni-topo"><b></b><span style="color:' + cor + '">' + pct(t.occ) + '</span></div>' +
          '<div class="vn-dia-barra"><i class="ag" style="width:' + w(t.ag) + '"></i><i class="fa" style="width:' + w(t.falta) +
            '"></i><i class="li" style="width:' + w(t.livre) + '"></i><i class="ou" style="width:' + w(total - t.ag - t.falta - t.livre) + '"></i></div>' +
          '<div class="vn-uni-sub">' + fmtN(t.ag) + ' de ' + fmtN(d) + ' agendados · <span class="li">' + fmtN(t.livre) + ' livres</span></div></div>');
      linha.querySelector('.vn-uni-topo b').textContent = nomeCurto(t.uni);
      linha.addEventListener('mousemove', function (ev) {
        mostrarTip(ev, t.uni + ' · disponível ' + fmtN(d) + ' (capacidade ' + fmtN(t.cap) + ' − bloqueios ' + fmtN(t.bloq) + ') · agendados ' +
          fmtN(t.ag) + ' · faltas ' + fmtN(t.falta) + ' · livres ' + fmtN(t.livre));
      });
      linha.addEventListener('mouseleave', esconderTip);
      lista.appendChild(linha);
    });
    card.appendChild(lista);
  }

  // ---------- Milhar nos números dos cartões ("74897" → "74.897"); o painel.js escreve sem separador ----------
  function milharKpi() {
    document.querySelectorAll('.kpi-value').forEach(function (v) {
      var t = v.textContent.trim();
      if (/^\d{4,}$/.test(t)) v.textContent = Number(t).toLocaleString('pt-BR');
    });
  }

  // ---------- Ícones dos KPIs (o painel.js recria os cartões a cada render) ----------
  function iconesKpi() {
    document.querySelectorAll('.kpi-card').forEach(function (c) {
      var nome = ICONE_KPI[c.getAttribute('data-label')] || ICONE_KPI[(c.querySelector('.kpi-label') || {}).textContent];
      var ico = c.querySelector('.kpi-icon');
      if (nome && ico && !ico.querySelector('svg')) ico.innerHTML = svgIcone(ICONES[nome]);
    });
  }

  function redesenhar() {
    try { desenharLinha(); } catch (e) { console.error('[visual-novo] linha:', e); }
    try { desenharBarras(); } catch (e) { console.error('[visual-novo] barras:', e); }
    try { desenharMedidor(); } catch (e) { console.error('[visual-novo] medidor:', e); }
    iconesKpi();
    milharKpi();
    marcarAtivo();
    alinharLogo();
  }
  document.addEventListener('painel:render', redesenhar);
  // A Qualidade da agenda chega depois (outra requisição): ícones de novo quando os cartões mudarem
  var qual = document.getElementById('qualContainer');
  if (qual) new MutationObserver(function () { iconesKpi(); milharKpi(); }).observe(qual, { childList: true });
  if (window.__DASH_DATA) redesenhar();
})();
