// MODO DEMO — Painel de Ocupação de Agenda com dados 100% fictícios (unidades, profissionais, agendas e usuários
// inventados). Carregado antes de qualquer outro script: troca window.fetch e responde, sem rede, as rotas que o
// servidor de produção atende (app/src/server.ts, acesso.ts, agendador.ts e nexa), no mesmo formato:
//   GET  /api/dados              linhas no formato Página3 + montarRegistros (cabeçalho X-Versao)
//   GET  /api/versao             { versao, atualizado_em }
//   GET  /api/qualidade          { fora, pendencias }
//   GET  /api/eu                 { nome, email, papel, leLog }
//   GET  /api/acesso/log         { permitido, linhas }
//   POST /api/acesso/exportou    { ok }
//   GET  /api/agendador          { dias, feriados, agora, atualizado_em, expira_minutos, blocos_sem_mapa, horarios, em_discussao }
//   POST /api/agendador/selecao  { ok, em_discussao }
//   POST /ia                     texto puro (NEXA respondendo aqui mesmo, com os dados da demo)
//   POST /auth/entrar, /auth/sair
// Gerador determinístico: cada bloco de agenda tem semente própria (pelo ID_MDP), então o mesmo dia sempre gera os
// mesmos números. As datas acompanham o dia de hoje (jan do ano anterior até 4 semanas à frente).
(function () {
  'use strict';

  // ---------- utilidades ----------
  var TZ = 'America/Sao_Paulo';
  var DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function agoraSP() {
    var p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { data: p.year + '-' + p.month + '-' + p.day, hora: p.hour + ':' + p.minute };
  }
  function somaDias(iso, n) { var d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function diaSemana(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay(); }
  function difDias(a, b) { return Math.round((new Date(a + 'T12:00:00Z') - new Date(b + 'T12:00:00Z')) / 864e5); }
  function paraMin(h) { return +h.slice(0, 2) * 60 + +h.slice(3, 5); }
  function hhmm(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }
  function br(iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4); }
  function hash(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function hex16(s) { return (('00000000' + hash(s).toString(16)).slice(-8) + ('00000000' + hash(s + '#').toString(16)).slice(-8)).toUpperCase(); }
  // mulberry32 com semente pela chave: mesma chave, mesma sequência
  function sorteio(chave) {
    var a = hash(chave);
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function periodo(min) { return min < 720 ? 'Manhã' : min < 1080 ? 'Tarde' : 'Noite'; } // mesma regra do sync
  function conta(arr) { var n = 0; for (var i = 0; i < arr.length; i++) n += arr[i]; return n; }

  // Feriados nacionais (fixos + móveis pela Páscoa)
  function pascoa(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return y + '-' + pad(Math.floor((h + l - 7 * m + 114) / 31)) + '-' + pad(((h + l - 7 * m + 114) % 31) + 1);
  }
  function feriadosDe(anos) {
    var f = {};
    anos.forEach(function (y) {
      [['01-01', 'Confraternização Universal'], ['04-21', 'Tiradentes'], ['05-01', 'Dia do Trabalho'], ['09-07', 'Independência do Brasil'],
        ['10-12', 'Nossa Senhora Aparecida'], ['11-02', 'Finados'], ['11-15', 'Proclamação da República'], ['11-20', 'Consciência Negra'],
        ['12-25', 'Natal']].forEach(function (x) { f[y + '-' + x[0]] = x[1]; });
      var p = pascoa(y);
      f[somaDias(p, -47)] = 'Carnaval';
      f[somaDias(p, -2)] = 'Sexta-feira Santa';
      f[somaDias(p, 60)] = 'Corpus Christi';
    });
    return f;
  }

  // ---------- cadastro fictício ----------
  var UNIDADES = ['Unidade Centro', 'Unidade Jardins', 'Unidade Paulista', 'Unidade Vila Nova'];
  var FATOR_UNI = [1.0, 1.04, 0.98, 0.93];
  var FATOR_DIA = [0, 1.04, 1.03, 1.0, 0.99, 0.94, 0.97];
  var FATOR_TURNO = { 'Manhã': 1.03, 'Tarde': 0.98, 'Noite': 0.9 };
  var SAZONAL = [0.86, 0.94, 1.0, 1.02, 1.03, 0.97, 0.9, 0.98, 1.02, 1.04, 1.0, 0.88];
  // grade: "dia-da-semana unidade início fim"; de/ate: dias contados de 1º de janeiro do ano corrente
  var PROFS = [
    { nome: 'Ana Clara Moreira', passo: 20, base: 0.86, falta: 0.06, grade: ['1 0 08:00 12:00', '1 0 13:00 18:00', '3 1 08:00 12:00', '5 0 13:00 17:00'] },
    { nome: 'Bruno Sales', passo: 30, base: 0.74, falta: 0.09, grade: ['2 0 08:00 12:00', '4 0 13:00 18:00', '6 0 08:00 12:00'] },
    { nome: 'Carla Fontes', passo: 20, base: 0.91, falta: 0.05, grade: ['1 1 13:00 18:00', '2 1 08:00 12:00', '4 1 08:00 12:00', '4 1 13:00 17:00'] },
    { nome: 'Daniel Prado', passo: 30, base: 0.62, falta: 0.11, grade: ['3 2 13:00 19:00', '5 2 08:00 12:00'] },
    { nome: 'Elisa Rocha', passo: 20, base: 0.82, falta: 0.07, grade: ['1 2 08:00 12:00', '2 2 13:00 18:00', '4 2 08:00 12:00', '6 2 08:00 12:00'] },
    { nome: 'Felipe Arantes', passo: 20, base: 0.69, falta: 0.08, grade: ['2 3 08:00 12:00', '3 3 13:00 18:00', '5 3 13:00 18:00'] },
    { nome: 'Gabriela Nunes', passo: 30, base: 0.88, falta: 0.06, grade: ['1 3 08:00 12:00', '3 0 08:00 12:00', '5 1 08:00 12:00'] },
    { nome: 'Helena Duarte', passo: 20, base: 0.78, falta: 0.07, grade: ['2 1 13:00 18:00', '3 1 13:00 18:00', '4 3 13:00 18:00'] },
    { nome: 'Igor Tavares', passo: 30, base: 0.57, falta: 0.12, grade: ['1 1 18:00 21:00', '3 2 18:00 21:00', '5 0 18:00 21:00'] },
    { nome: 'Juliana Peixoto', passo: 20, base: 0.84, falta: 0.06, grade: ['2 2 08:00 12:00', '4 2 13:00 18:00', '6 1 08:00 12:00'] },
    { nome: 'Marina Coutinho', passo: 20, base: 0.76, falta: 0.08, grade: ['1 3 13:00 18:00', '3 3 08:00 12:00', '5 3 08:00 12:00'] },
    { nome: 'Paulo Lemos', passo: 30, base: 0.64, falta: 0.1, ate: 225, grade: ['2 0 13:00 18:00', '4 0 08:00 12:00'] },
    { nome: 'Renata Albuquerque', passo: 20, base: 0.8, falta: 0.07, de: 59, grade: ['1 2 13:00 18:00', '3 2 08:00 12:00', '5 2 13:00 18:00'] },
    { nome: 'Tiago Moura', passo: 30, base: 0.71, falta: 0.09, de: -150, grade: ['2 3 13:00 18:00', '4 1 08:00 12:00', '6 3 08:00 12:00'] }
  ];

  // Férias: uma por ano (10 ou 14 dias) + uma marcada para as próximas semanas, para aparecer "só bloqueio" no futuro
  function emFerias(p, d, hoje) {
    if (p.nome === 'Felipe Arantes' && d >= somaDias(hoje, 8) && d <= somaDias(hoje, 19)) return true;
    var y = d.slice(0, 4), ini = somaDias(y + '-01-01', 20 + hash(p.nome + y) % 300);
    return d >= ini && d < somaDias(ini, hash(p.nome + 'L' + y) % 2 ? 14 : 10);
  }

  // ---------- gerador ----------
  var G = null;
  function gerar() {
    if (G) return G;
    var hoje = agoraSP().data, ano = +hoje.slice(0, 4), anoIni = ano + '-01-01';
    var inicio = (ano - 1) + '-01-01', fim = somaDias(hoje, 28);
    var feriados = feriadosDe([ano - 1, ano, ano + 1]);
    var linhas = [], futuros = [];
    var fora = {}, semGrade = {}, bloqueio = {}, status = {}, vazias = {};

    function addFora(data, prof, uni, tipo, n, horarios, diaSemGrade) {
      var k = data + '|' + prof + '|' + uni + '|' + tipo;
      var f = fora[k] || (fora[k] = { data: data, profissional: prof, unidade: uni, tipo: tipo, n: 0, horarios: [], dia_sem_grade: diaSemGrade });
      f.n += n;
      horarios.forEach(function (h) { if (f.horarios.indexOf(h) === -1) f.horarios.push(h); });
      f.horarios.sort();
    }
    function horariosFora(r, iniMin, fimMin, n) {
      var cand = [fimMin + 10, fimMin + 20, fimMin + 30, iniMin - 20, iniMin - 40].filter(function (m) { return m >= 420 && m <= 1290; });
      var hs = [];
      while (hs.length < n && cand.length) hs.push(hhmm(cand.splice(Math.floor(r() * cand.length), 1)[0]));
      return hs.sort();
    }
    function primeiroLivre(r, bloq, pre) {
      var cap = bloq.length, s0 = Math.floor(r() * cap);
      for (var i = 0; i < cap; i++) { var s = (s0 + i) % cap; if (!bloq[s] && !pre[s]) return s; }
      return -1;
    }

    function bloco(p, d, dow, ui, iniStr, fimStr) {
      var uni = UNIDADES[ui], iniMin = paraMin(iniStr), fimMin = paraMin(fimStr), passo = p.passo;
      var cap = Math.floor((fimMin - iniMin) / passo), turno = periodo(iniMin);
      var id = p.nome + '|' + br(d) + '|' + uni + '|' + iniStr + '|' + fimStr;
      var r = sorteio(id), q = sorteio('q|' + id);
      var passado = d < hoje, distancia = difDias(d, hoje), anoD = +d.slice(0, 4);
      var bloq = [], pre = [], s, k;
      for (s = 0; s < cap; s++) { bloq.push(0); pre.push(0); }
      var fechado = !!feriados[d] || emFerias(p, d, hoje), vazia = false;
      var x = r();
      if (fechado || x < 0.02) { for (s = 0; s < cap; s++) bloq[s] = 1; } // feriado, férias ou ausência registrada
      else if (x < 0.13) { // bloqueio parcial (reunião, procedimento, saída mais cedo)
        var nb = 1 + Math.floor(r() * Math.max(1, Math.ceil(cap / 3))), b0 = Math.floor(r() * (cap - nb + 1));
        for (s = b0; s < b0 + nb; s++) bloq[s] = 1;
      } else if (passado && anoD === ano && x < 0.137) vazia = true; // agenda aberta sem ninguém (ausência não registrada)
      var estimada = p.nome === 'Daniel Prado' && dow === 3 && d >= somaDias(anoIni, 30) && d <= somaDias(anoIni, 75);

      var prob = p.base * SAZONAL[+d.slice(5, 7) - 1] * FATOR_DIA[dow] * FATOR_TURNO[turno] * FATOR_UNI[ui] *
        (anoD < ano ? 0.95 : 1) * (0.9 + 0.2 * r());
      if (!passado) prob *= distancia === 0 ? 0.97 : Math.max(0.12, 1 - distancia / 30); // agenda futura ainda enchendo
      prob = Math.min(0.98, prob);

      var sched = 0, pacientes = 0, faltas = 0, faltasPac = 0, retornos = 0, presentes = 0;
      if (!vazia) {
        for (s = 0; s < cap; s++) {
          if (bloq[s] || pre[s] || r() >= prob) continue;
          var dur = r() < 0.22 && s + 1 < cap && !bloq[s + 1] ? 2 : 1; // consulta longa ocupa 2 horários
          for (k = 0; k < dur; k++) pre[s + k] = 1;
          if (passado && r() < p.falta) { faltas += dur; faltasPac++; }
          else { sched += dur; pacientes++; if (passado) presentes++; if (r() < 0.1) retornos += dur; }
        }
      }
      var enc = 0, encTempo = 0;
      if (!fechado && !vazia && (passado || distancia <= 3)) { var e = r(); enc = e < 0.04 ? 2 : e < 0.2 ? 1 : 0; }
      for (k = 0; k < enc; k++) {
        encTempo += r() < 0.3 ? 2 : 1;
        if (r() < 0.5) { var livre = primeiroLivre(r, bloq, pre); if (livre >= 0) pre[livre] = 1; } // encaixe que começa num horário da grade
      }
      var desm = fechado || vazia ? 0 : Math.floor(r() * cap * (passado ? 0.14 : 0.06));
      var rep = pacientes && r() < 0.05 ? 1 : 0;
      var livres = 0;
      for (s = 0; s < cap; s++) if (!bloq[s] && !pre[s]) livres++;

      linhas.push({
        row_number: linhas.length + 1,
        ID_MDP: id,
        ID_Agenda: (estimada ? 'REC-' : 'AG-') + hex16(id),
        Data: d,
        'Dia da Semana': DIAS[dow],
        'Período': turno,
        'Hora Início': iniStr + ':00',
        'Hora Fim': fimStr + ':00',
        'Duração do Slot (min)': passo,
        'Capacidade Total (slots)': cap,
        Agendamentos: pacientes,
        Unidade: uni,
        Profissional: p.nome,
        'Bloqueios (slots)': vazia ? cap : conta(bloq), // agenda vazia: o painel tira tudo dos disponíveis (regra do sync)
        'Encaixes (slots)': enc,
        'Encaixes (slots por tempo)': encTempo,
        'Retornos (slots)': retornos,
        'Tempo Total Agendado (min)': sched * passo,
        'Faltas (no-show)': faltas,
        'Duração do Período (min)': fimMin - iniMin,
        'Slots Agendados': sched,
        'Slots Agendados (total c/ retornos)': sched,
        'Slots Livres': vazia ? 0 : livres,
        'Desmarcados(Slot)': desm,
        'Agendados nova': sched + desm + faltas,
        AGENDADOS: pacientes + faltasPac,
        PRESENTES: presentes,
        REPRESENTANTES: rep,
        Teste: 'falso',
        Origem: estimada ? 'estimada' : 'sync',
        // colunas que montarRegistros (app/src/painel-registros.ts) acrescenta
        'Agendamentos Marcados': sched,
        'Encaixes (atendimentos)': enc,
        Representantes: rep
      });
      if (!passado && distancia <= 7) futuros.push({ data: d, profissional: p.nome, unidade: uni, ini: iniMin, passo: passo, bloq: bloq.join(''), pre: pre.join('') });

      // Qualidade da agenda (só o ano corrente, como a tabela do sync)
      var kb = d + '|' + p.nome + '|' + uni;
      if (vazia) {
        var v = vazias[kb] || (vazias[kb] = { data: d, tipo: 'agenda_vazia', severidade: 3, profissional: p.nome, unidade: uni, n: 0, detalhe: { horarios: [] } });
        v.n += cap; v.detalhe.horarios.push(iniStr + '–' + fimStr); v.detalhe.horarios.sort();
      }
      if (d < anoIni || fechado || vazia || distancia > 14) return;
      if (q() < (passado ? 0.06 : 0.02)) {
        var nf = q() < 0.3 ? 2 : 1; // um horário por paciente
        addFora(d, p.nome, uni, passado ? (q() < 0.85 ? 'atendido' : 'falta') : 'marcado', nf, horariosFora(q, iniMin, fimMin, nf), false);
      }
      if (passado && q() < 0.025) addFora(d, p.nome, uni, 'desmarcado', 1, horariosFora(q, iniMin, fimMin, 1), false);
      if (q() < (passado ? 0.05 : 0.015)) addFora(d, p.nome, uni, 'encaixe', 1, [hhmm(fimMin + 5)], false);
      if (passado && pacientes && q() < (distancia >= -25 ? 0.07 : 0.003)) {
        var st = status[kb] || (status[kb] = { data: d, tipo: 'status', severidade: 3, profissional: p.nome, unidade: uni, n: 0, detalhe: { status: {} } });
        var nome = ['Marcado - confirmado', 'Marcado - não confirmado', 'Aguardando'][Math.floor(q() * 3)], ns = Math.min(pacientes, q() < 0.35 ? 2 : 1);
        st.n += ns; st.detalhe.status[nome] = (st.detalhe.status[nome] || 0) + ns;
      }
      if (!passado && conta(bloq) && conta(bloq) < cap && q() < 0.2) { // paciente marcado em horário bloqueado (hoje ou futuro)
        var bq = bloqueio[kb] || (bloqueio[kb] = { data: d, tipo: 'bloqueio', severidade: 2, profissional: p.nome, unidade: uni, n: 0, detalhe: { horarios: [] } });
        bq.n++; bq.detalhe.horarios.push(hhmm(iniMin + bloq.indexOf(1) * passo)); bq.detalhe.horarios.sort();
      }
    }

    for (var d = inicio; d <= fim; d = somaDias(d, 1)) {
      var dow = diaSemana(d);
      if (dow === 0) continue;
      PROFS.forEach(function (p) {
        if (p.de != null && d < somaDias(anoIni, p.de)) return;
        if (p.ate != null && d > somaDias(anoIni, p.ate)) return;
        var temGrade = false;
        p.grade.forEach(function (g) {
          var c = g.split(' ');
          if (+c[0] !== dow) return;
          temGrade = true;
          bloco(p, d, dow, +c[1], c[2], c[3]);
        });
        // Atendimento em dia sem nenhuma grade do profissional
        if (!temGrade && d >= anoIni && d < hoje && !feriados[d]) {
          var r = sorteio('dsg|' + p.nome + '|' + d);
          if (r() < 0.006) {
            var n = 1 + Math.floor(r() * 3), hs = [];
            while (hs.length < n) { var h = hhmm(540 + 20 * Math.floor(r() * 24)); if (hs.indexOf(h) === -1) hs.push(h); }
            addFora(d, p.nome, UNIDADES[+p.grade[0].split(' ')[1]], r() < 0.85 ? 'atendido' : 'falta', n, hs.sort(), true);
          }
        }
      });
    }

    // Pendências "sem grade vigente" / "dia sem grade": atendidos, faltas e marcados fora de qualquer bloco (mesma regra do sync)
    var listaFora = Object.keys(fora).map(function (k) { return fora[k]; });
    listaFora.forEach(function (f) {
      if (f.tipo === 'desmarcado' || f.tipo === 'encaixe') return;
      var k = f.data + '|' + f.profissional + '|' + f.unidade;
      var g = semGrade[k] || (semGrade[k] = { data: f.data, tipo: f.dia_sem_grade ? 'dia_sem_grade' : 'sem_grade', severidade: 1, profissional: f.profissional, unidade: f.unidade, n: 0, detalhe: { horarios: [] } });
      g.n += f.n;
      f.horarios.forEach(function (h) { if (g.detalhe.horarios.indexOf(h) === -1) g.detalhe.horarios.push(h); });
      g.detalhe.horarios.sort();
      g.detalhe[f.tipo] = (g.detalhe[f.tipo] || 0) + f.n;
    });
    var valores = function (o) { return Object.keys(o).map(function (k) { return o[k]; }); };
    var pendencias = valores(semGrade).concat(valores(bloqueio), valores(status), valores(vazias).filter(function (v) { return v.data >= anoIni; }))
      .sort(function (a, b) { return a.severidade - b.severidade || (a.data < b.data ? 1 : a.data > b.data ? -1 : 0); });
    listaFora.sort(function (a, b) { return a.data < b.data ? -1 : a.data > b.data ? 1 : 0; });

    G = { hoje: hoje, linhas: linhas, futuros: futuros, feriados: feriados, fora: listaFora, pendencias: pendencias,
      versao: '1287:' + linhas.length };
    return G;
  }

  // Última carga: o sync roda a cada 10 min; a demo diz que a última terminou há poucos minutos
  function atualizadoEm() {
    var t = Math.floor(Date.now() / 600000) * 600000 + 60000;
    if (t > Date.now()) t -= 600000;
    return new Date(t).toISOString();
  }

  // ---------- conta e registros de acesso (fictícios) ----------
  var EU = { nome: 'Usuário Demo', email: 'demo@example.com', papel: 'admin' };
  var LOG = null;
  function logAcesso() {
    if (LOG) return LOG;
    var hoje = agoraSP().data, agora = Date.now(), linhas = [];
    var pessoas = [['Usuário Demo', 'demo@example.com'], ['Patrícia Gomes', 'patricia.gomes@example.com'],
      ['Rafael Lima', 'rafael.lima@example.com'], ['Camila Torres', 'camila.torres@example.com']];
    for (var i = 0; i < 30; i++) {
      var d = somaDias(hoje, -i);
      if (diaSemana(d) === 0) continue;
      pessoas.forEach(function (p, ip) {
        var r = sorteio('log|' + d + '|' + p[1]);
        if (r() > (ip === 0 ? 0.75 : 0.45)) return;
        var min = 480 + Math.floor(r() * 600), quando = function (m) { return new Date(d + 'T' + hhmm(m) + ':00-03:00').getTime(); };
        var t = quando(min);
        if (t > agora) return;
        linhas.push({ quando: new Date(t).toISOString(), usuario: p[1], nome: p[0], evento: 'ENTROU', detalhe: null });
        if (r() < 0.3 && quando(min + 12) <= agora) {
          linhas.push({ quando: new Date(quando(min + 12)).toISOString(), usuario: p[1], nome: p[0], evento: 'EXPORTOU',
            detalhe: { linhas: 40 + Math.floor(r() * 400), ini: d.slice(0, 8) + '01', fim: d } });
        }
        if (r() < 0.25 && quando(min + 40) <= agora) linhas.push({ quando: new Date(quando(min + 40)).toISOString(), usuario: p[1], nome: p[0], evento: 'SAIU', detalhe: null });
      });
    }
    var dr = somaDias(hoje, -6);
    linhas.push({ quando: new Date(dr + 'T10:17:00-03:00').toISOString(), usuario: 'vitor.andrade@example.com', nome: 'Vitor Andrade', evento: 'RECUSADO',
      detalhe: { motivo: 'projeto não liberado no Hub' } });
    LOG = linhas.sort(function (a, b) { return a.quando < b.quando ? 1 : -1; });
    return LOG;
  }

  // ---------- agendador (DLC) ----------
  var emDiscussao = null;
  function proximosDias(hoje) {
    var dias = [];
    for (var d = hoje; dias.length < 4; d = somaDias(d, 1)) if (diaSemana(d) !== 0) dias.push(d);
    return dias;
  }
  function agendador() {
    var g = gerar(), agora = agoraSP(), dias = proximosDias(agora.data), horarios = [], vistos = {};
    g.futuros.forEach(function (b) {
      if (dias.indexOf(b.data) === -1) return;
      for (var s = 0; s < b.bloq.length; s++) {
        if (b.bloq[s] === '1' || b.pre[s] === '1') continue;
        var hora = hhmm(b.ini + s * b.passo);
        if (b.data === agora.data && hora <= agora.hora) continue;
        var slot = b.profissional + '|' + b.data + '|' + b.unidade + '|' + hora;
        if (vistos[slot]) continue;
        vistos[slot] = 1;
        horarios.push({ slot: slot, data: b.data, profissional: b.profissional, unidade: b.unidade, hora: hora });
      }
    });
    var cmp = function (a, b) { return a < b ? -1 : a > b ? 1 : 0; };
    horarios.sort(function (a, b) { return cmp(a.data, b.data) || cmp(a.unidade, b.unidade) || cmp(a.profissional, b.profissional) || cmp(a.hora, b.hora); });
    if (!emDiscussao) { // dois horários já "em discussão com o cliente" por outro atendente
      emDiscussao = [];
      [3, Math.floor(horarios.length / 2)].forEach(function (i) { if (horarios[i] && emDiscussao.indexOf(horarios[i].slot) === -1) emDiscussao.push(horarios[i].slot); });
    }
    var feriados = {};
    dias.forEach(function (d) { if (g.feriados[d]) feriados[d] = g.feriados[d]; });
    return { dias: dias, feriados: feriados, agora: agora.hora, atualizado_em: atualizadoEm(), expira_minutos: 30,
      blocos_sem_mapa: 0, horarios: horarios, em_discussao: emDiscussao.slice() };
  }
  function marcarSelecao(corpo) {
    var slot = corpo && typeof corpo.slot === 'string' ? corpo.slot : '';
    if (!/^[^|]{1,120}\|\d{4}-\d{2}-\d{2}\|[^|]{1,120}\|\d{2}:\d{2}$/.test(slot) || typeof corpo.ligado !== 'boolean') return [400, { erro: 'pedido inválido' }];
    if (proximosDias(agoraSP().data).indexOf(slot.split('|')[1]) === -1) return [400, { erro: 'dia fora do agendador' }];
    if (!emDiscussao) agendador();
    var i = emDiscussao.indexOf(slot);
    if (corpo.ligado && i === -1) emDiscussao.push(slot);
    if (!corpo.ligado && i !== -1) emDiscussao.splice(i, 1);
    return [200, { ok: true, em_discussao: emDiscussao.slice() }];
  }

  // ---------- NEXA local: responde pelos dados da demo, no tom da NEXA de produção ----------
  function nexa(corpo) {
    var NOME = 'Sou NEXA, sua analista de dados de ocupação de agenda.';
    var FUNCAO = 'Analiso os dados de ocupação da agenda e respondo perguntas sobre médicos, unidades, dias e períodos.';
    var pergunta = String(corpo.pergunta || '').trim();
    var q = pergunta.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai)\b/.test(q) && q.length < 30) return 'Olá! ' + NOME + ' ' + FUNCAO;
    if (/quem e voce|seu nome|como voce se chama|o que voce faz/.test(q)) return NOME + ' ' + FUNCAO;
    var g = gerar(), data = /^\d{4}-\d{2}-\d{2}$/;
    var ini = data.test(corpo.periodo_inicio) ? corpo.periodo_inicio : g.hoje, fim = data.test(corpo.periodo_fim) ? corpo.periodo_fim : ini;
    var unis = Array.isArray(corpo.unidades) ? corpo.unidades : [], profs = Array.isArray(corpo.profissionais) ? corpo.profissionais : [];
    var rows = (window.DADOS || g.linhas).filter(function (r) {
      return r.Data >= ini && r.Data <= fim && (!unis.length || unis.indexOf(r.Unidade) !== -1) && (!profs.length || profs.indexOf(r.Profissional) !== -1);
    });
    var recorte = (ini === fim ? 'Em ' + br(ini) : 'De ' + br(ini) + ' a ' + br(fim)) + (unis.length ? ', ' + unis.join(', ') : '') +
      (profs.length ? ', ' + profs.join(', ') : '');
    if (!rows.length) return 'Não encontrei dados suficientes para responder com precisão. ' + recorte + '.';
    function soma(rs) {
      var t = { cap: 0, bloq: 0, sched: 0, faltas: 0, livres: 0 };
      rs.forEach(function (r) {
        t.cap += r['Capacidade Total (slots)']; t.bloq += r['Bloqueios (slots)']; t.sched += r['Slots Agendados (total c/ retornos)'];
        t.faltas += r['Faltas (no-show)']; t.livres += r['Slots Livres'];
      });
      t.disp = t.cap - t.bloq;
      t.ocupacao = t.disp > 0 ? Math.min(100, t.sched / t.disp * 100) : 0;
      t.agendamento = t.disp > 0 ? Math.min(100, (t.sched + t.faltas) / t.disp * 100) : 0;
      return t;
    }
    var fN = function (n) { return n.toLocaleString('pt-BR'); }, fP = function (n) { return n.toFixed(1).replace('.', ',') + '%'; };
    var t = soma(rows);
    var geral = 'ocupação de ' + fP(t.ocupacao) + ' (' + fN(t.sched) + ' de ' + fN(t.disp) + ' horários disponíveis), agendamento de ' +
      fP(t.agendamento) + ', ' + fN(t.faltas) + ' faltas, ' + fN(t.bloq) + ' horários bloqueados e ' + fN(t.livres) + ' livres';
    var dim = /unidade/.test(q) ? 'Unidade' : /dia da semana|dias da semana|qual dia|dia mais/.test(q) ? 'Dia da Semana'
      : /turno|manha|tarde|noite/.test(q) ? 'Período' : /profissiona|medic|doutor|quem|ranking/.test(q) ? 'Profissional' : '';
    var met = /falta/.test(q) ? 'faltas' : /bloque/.test(q) ? 'bloq' : /livre|ocios|vaga|sobra/.test(q) ? 'livres' : 'ocupacao';
    var nomeMet = { faltas: 'mais faltas', bloq: 'mais bloqueios', livres: 'mais horários livres', ocupacao: 'maior ocupação' }[met];
    var futuro = fim >= g.hoje ? ' Inclui a agenda já marcada dos dias que ainda não aconteceram.' : '';
    if (!dim) return recorte + ': ' + geral + '.' + futuro;
    var grupos = {};
    rows.forEach(function (r) { (grupos[r[dim]] = grupos[r[dim]] || []).push(r); });
    var lista = Object.keys(grupos).map(function (k) { return { nome: k, t: soma(grupos[k]) }; })
      .filter(function (x) { return x.t.disp >= 5; })
      .sort(function (a, b) { return b.t[met] - a.t[met]; });
    if (!lista.length) return recorte + ': ' + geral + '.' + futuro;
    var valor = function (x) { return met === 'ocupacao' ? fP(x.t.ocupacao) : fN(x.t[met]); };
    var topo = lista.slice(0, 3).map(function (x) { return x.nome + ' (' + valor(x) + ')'; });
    var ultimo = lista.length > 3 ? ' Na outra ponta: ' + lista[lista.length - 1].nome + ' (' + valor(lista[lista.length - 1]) + ').' : '';
    return recorte + ', quem teve ' + nomeMet + ' foi ' + topo[0] + (topo.length > 1 ? ', seguido de ' + topo.slice(1).join(' e ') : '') + '.' +
      ultimo + ' No total: ' + geral + '.' + futuro;
  }

  // ---------- roteador ----------
  function responder(corpo, status, extra) {
    var texto = typeof corpo === 'string';
    var h = { 'Content-Type': texto ? 'text/plain; charset=utf-8' : 'application/json', 'Cache-Control': 'no-store' };
    for (var k in extra || {}) h[k] = extra[k];
    return new Response(texto ? corpo : JSON.stringify(corpo), { status: status || 200, headers: h });
  }
  function lerCorpo(init) {
    try { return JSON.parse(init && typeof init.body === 'string' ? init.body : '{}') || {}; } catch (e) { return {}; }
  }
  function rota(caminho, metodo, init) {
    var corpo;
    switch (caminho) {
      case '/api/dados':
        var g = gerar();
        return responder(g.linhas, 200, { 'X-Versao': g.versao });
      case '/api/versao': return responder({ versao: gerar().versao, atualizado_em: atualizadoEm() });
      case '/api/qualidade': return responder({ fora: gerar().fora, pendencias: gerar().pendencias });
      case '/api/eu': return responder({ nome: EU.nome, email: EU.email, papel: EU.papel, leLog: true });
      case '/api/acesso/log': return responder({ permitido: true, linhas: logAcesso() });
      case '/api/acesso/exportou':
        if (metodo !== 'POST') return responder({ erro: 'método não permitido' }, 405);
        corpo = lerCorpo(init);
        logAcesso().unshift({ quando: new Date().toISOString(), usuario: EU.email, nome: EU.nome, evento: 'EXPORTOU',
          detalhe: { linhas: Number(corpo.linhas) || 0, ini: String(corpo.ini || '').slice(0, 10), fim: String(corpo.fim || '').slice(0, 10) } });
        return responder({ ok: true });
      case '/api/agendador':
        if (metodo !== 'GET') return responder({ erro: 'método não permitido' }, 405);
        return responder(agendador());
      case '/api/agendador/selecao':
        if (metodo !== 'POST') return responder({ erro: 'método não permitido' }, 405);
        var r = marcarSelecao(lerCorpo(init));
        return responder(r[1], r[0]);
      case '/ia':
        if (metodo !== 'POST') return responder({ erro: 'método não permitido' }, 405);
        return responder(nexa(lerCorpo(init)));
      case '/auth/entrar': return responder({ nome: EU.nome, email: EU.email });
      case '/auth/sair': return responder({ ok: true });
    }
    return responder({ erro: 'não encontrado' }, 404);
  }

  var fetchReal = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (entrada, init) {
    var url = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || String(entrada);
    var u;
    try { u = new URL(url, location.href); } catch (e) { u = null; }
    // Rotas do servidor do painel (absolutas como no app, ou relativas à pasta da demo)
    var m = u && u.origin === location.origin && u.pathname.match(/(\/api\/[a-z\/]+|\/ia|\/auth\/(?:entrar|sair))$/);
    if (!m) {
      if (fetchReal) return fetchReal(entrada, init);
      return Promise.reject(new TypeError('fetch indisponível'));
    }
    var metodo = String((init && init.method) || (entrada && entrada.method) || 'GET').toUpperCase();
    var espera = m[1] === '/api/dados' ? 250 : 60 + Math.floor(Math.random() * 90); // latência de rede simulada
    return new Promise(function (ok) { setTimeout(ok, espera); }).then(function () { return rota(m[1], metodo, init); });
  };

  // Para conferência no console: window.__DEMO.gerar()
  window.__DEMO = { gerar: gerar, agendador: agendador, nexa: nexa };
})();
