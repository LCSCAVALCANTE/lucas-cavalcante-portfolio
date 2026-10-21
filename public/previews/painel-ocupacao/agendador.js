// DLC agendador (08/10/2026, docs/DLCS.md): botão "+" ao lado das Dicas abre a tela com os horários livres dos próximos
// 4 dias (domingo pulado). Azul = livre; clique = verde, "em discussão com o cliente" (compartilhado entre atendentes,
// expira sozinho). Feriado (bloqueio geral da Feegow) aparece como "Feriado" com o nome do dia.
// Sem a DLC no servidor, /api/agendador dá 404 e o botão continua escondido.
(function () {
  'use strict';
  const ATUALIZA_MS = 20_000;
  const SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const CORES = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#22c55e', '#f97316', '#6366f1'];
  const btn = document.getElementById('agendadorBtn');
  if (!btn) return;

  let dados = null;
  let emDiscussao = new Set();
  let timer = null;
  let tela = null;
  const filtro = { unidade: '', busca: '' };

  const ICONE = {
    agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M12 12.5v5M9.5 15h5"/></svg>',
    busca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    feriado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="m12 12 1.1 2.2 2.4.35-1.75 1.7.4 2.4L12 17.5l-2.15 1.15.4-2.4-1.75-1.7 2.4-.35Z"/></svg>',
    vazio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  };

  const css = `
.ag-tela { position: fixed; inset: 0; z-index: 900; display: flex; flex-direction: column; color: var(--text1);
  background: radial-gradient(1200px 500px at 15% -10%, #1d4ed81f, transparent 60%), var(--bg);
  font-variant-numeric: tabular-nums; animation: ag-entra .18s ease-out; }
.ag-tela[hidden] { display: none; }
@keyframes ag-entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.ag-tela button:focus-visible, .ag-tela select:focus-visible, .ag-tela input:focus-visible { outline: 2px solid #60a5fa; outline-offset: 2px; }

.ag-topo { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px 24px;
  border-bottom: 1px solid var(--border); background: #111d30e6; backdrop-filter: blur(6px); }
.ag-marca { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ag-marca-ico { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8); box-shadow: 0 6px 18px #1d4ed855; flex-shrink: 0; }
.ag-marca-ico svg { width: 21px; height: 21px; }
.ag-titulo { font-size: 18px; font-weight: 750; letter-spacing: -.01em; }
.ag-sub { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text5); margin-top: 2px; }
.ag-vivo { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px #22c55e26; }
.ag-numeros { display: flex; gap: 8px; margin-left: 8px; }
.ag-num { display: flex; flex-direction: column; padding: 6px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface2); min-width: 92px; }
.ag-num b { font-size: 17px; line-height: 1.15; }
.ag-num span { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--text5); }
.ag-num.azul b { color: #60a5fa; } .ag-num.verde b { color: var(--green); }
.ag-ferramentas { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap; }
.ag-campo { position: relative; display: flex; align-items: center; }
.ag-campo svg { position: absolute; left: 10px; width: 15px; height: 15px; color: var(--text5); pointer-events: none; }
.ag-ferramentas select, .ag-ferramentas input { height: 36px; background: var(--surface2); color: var(--text2);
  border: 1px solid var(--border); border-radius: 10px; padding: 0 12px; font: inherit; font-size: 13px; transition: border-color .15s; }
.ag-ferramentas input { padding-left: 32px; width: 210px; }
.ag-ferramentas select:hover, .ag-ferramentas input:hover { border-color: #3b82f660; }
.ag-fechar { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface2);
  color: var(--text3); cursor: pointer; display: grid; place-items: center; transition: color .15s, border-color .15s; }
.ag-fechar svg { width: 17px; height: 17px; }
.ag-fechar:hover { color: var(--text1); border-color: #ef444480; }

.ag-faixa { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 10px 24px; font-size: 12px; color: var(--text3); }
.ag-leg { display: inline-flex; align-items: center; gap: 7px; }
.ag-leg i { width: 26px; height: 14px; border-radius: 4px; }
.ag-aviso { color: var(--amber); margin-left: auto; }

.ag-dias { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; padding: 4px 24px 20px; }
.ag-dia { min-height: 0; display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden; box-shadow: 0 1px 0 #ffffff08 inset, 0 10px 30px #0000002e; }
.ag-dia.hoje { border-color: #3b82f655; }
.ag-dia-topo { padding: 12px 14px 11px; border-bottom: 1px solid var(--border); display: flex; align-items: flex-end; justify-content: space-between; gap: 8px;
  background: linear-gradient(180deg, #ffffff06, transparent); }
.ag-dia.hoje .ag-dia-topo { background: linear-gradient(180deg, #3b82f61c, transparent); }
.ag-dia-sem { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text5); display: flex; gap: 6px; align-items: center; }
.ag-tag { font-size: 10px; letter-spacing: .04em; padding: 2px 7px; border-radius: 999px; background: #3b82f62e; color: #93c5fd; }
.ag-tag.feriado { background: #f59e0b26; color: #fcd34d; }
.ag-dia-data { font-size: 22px; font-weight: 750; letter-spacing: -.02em; line-height: 1.1; margin-top: 2px; }
.ag-dia-n { font-size: 11.5px; font-weight: 600; padding: 4px 9px; border-radius: 999px; background: var(--surface2); border: 1px solid var(--border); color: var(--text3); white-space: nowrap; }
.ag-dia-n.tem { color: #93c5fd; border-color: #3b82f640; }

.ag-dia-lista { flex: 1; min-height: 0; overflow: auto; padding: 10px; display: flex; flex-direction: column; gap: 10px;
  scrollbar-width: thin; scrollbar-color: #334155 transparent; }
.ag-prof { border: 1px solid var(--border); border-radius: 12px; background: var(--surface2); padding: 10px 10px 6px; }
.ag-prof-topo { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.ag-avatar { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 11.5px; font-weight: 750; color: #fff; flex-shrink: 0; }
.ag-prof-txt { min-width: 0; flex: 1; }
.ag-prof-nome { font-size: 13px; font-weight: 650; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ag-prof-uni { font-size: 11px; color: var(--text5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ag-prof-n { font-size: 11px; color: var(--text5); white-space: nowrap; }
.ag-periodo { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: var(--text5); padding: 8px 4px 4px; }
.ag-linha { display: flex; align-items: center; gap: 10px; width: 100%; padding: 5px 6px; margin: 1px 0; border: 1px solid transparent; background: none;
  color: var(--text3); font: inherit; font-size: 12.5px; text-align: left; cursor: pointer; border-radius: 8px; transition: background .12s, border-color .12s; }
.ag-linha:hover { background: #3b82f612; border-color: #3b82f633; }
.ag-hora { min-width: 58px; text-align: center; padding: 4px 0; border-radius: 7px; font-weight: 700; font-size: 12.5px; color: #fff;
  background: var(--blue); box-shadow: 0 2px 8px #3b82f640; transition: background .12s; }
.ag-estado { flex: 1; }
.ag-acao { font-size: 11px; color: #93c5fd; opacity: 0; transition: opacity .12s; }
.ag-linha:hover .ag-acao { opacity: 1; }
.ag-linha.verde { background: #22c55e14; border-color: #22c55e40; color: #86efac; }
.ag-linha.verde .ag-hora { background: var(--green); box-shadow: 0 2px 8px #22c55e40; }
.ag-linha.verde .ag-acao { color: var(--text5); }
.ag-ok { width: 16px; height: 16px; color: var(--green); display: none; }
.ag-linha.verde .ag-ok { display: block; }

.ag-centro { margin: auto; padding: 28px 12px; text-align: center; color: var(--text5); font-size: 12.5px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.ag-centro svg { width: 34px; height: 34px; opacity: .7; }
.ag-centro.feriado { color: #fcd34d; }
.ag-centro.feriado b { font-size: 18px; color: var(--text1); }
.ag-centro.feriado span { color: var(--text3); font-size: 13px; }

@media (max-width: 1100px) { .ag-dias { grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: auto; } .ag-dia { min-height: 420px; } }
@media (max-width: 680px) { .ag-dias { grid-template-columns: 1fr; padding: 4px 12px 16px; } .ag-topo, .ag-faixa { padding-left: 12px; padding-right: 12px; }
  .ag-numeros { margin-left: 0; } .ag-ferramentas { margin-left: 0; width: 100%; } .ag-ferramentas input { width: 100%; } .ag-campo { flex: 1; } }
`;

  function el(tag, cls, texto) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  function icone(nome, cls) {
    const s = el('span');
    s.innerHTML = ICONE[nome];
    if (cls) s.firstChild.classList.add(cls);
    return s.firstChild;
  }

  function iniciais(nome) {
    const p = nome.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter((x) => x && !/^(d[aeo]s?|e)$/i.test(x));
    return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?';
  }
  function corDe(nome) {
    let h = 0;
    for (const c of nome) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return CORES[h % CORES.length];
  }
  // "Marca - Centro" → "Centro" quando todas as unidades têm o mesmo prefixo (MODO DEMO: exemplo fictício)
  function prefixoComum(unidades) {
    const m = unidades[0]?.match(/^(.+? - )/);
    return m && unidades.every((u) => u.startsWith(m[1])) ? m[1] : '';
  }
  const periodoDe = (hora) => (hora < '12:00' ? 'Manhã' : hora < '18:00' ? 'Tarde' : 'Noite');

  function montarTela() {
    const estilo = el('style');
    estilo.textContent = css;
    document.head.appendChild(estilo);

    tela = el('div', 'ag-tela');
    tela.hidden = true;
    tela.setAttribute('role', 'dialog');
    tela.setAttribute('aria-modal', 'true');
    tela.setAttribute('aria-label', 'Agendador');

    const topo = el('header', 'ag-topo');
    const marca = el('div', 'ag-marca');
    const marcaIco = el('div', 'ag-marca-ico');
    marcaIco.innerHTML = ICONE.agenda;
    const titulos = el('div');
    const sub = el('div', 'ag-sub');
    sub.append(el('span', 'ag-vivo'), el('span', 'ag-sub-txt', 'Carregando…'));
    titulos.append(el('div', 'ag-titulo', 'Agendador'), sub);
    marca.append(marcaIco, titulos);

    const numeros = el('div', 'ag-numeros');
    const nLivres = el('div', 'ag-num azul');
    nLivres.append(el('b', 'ag-n-livres', '—'), el('span', '', 'livres'));
    const nDisc = el('div', 'ag-num verde');
    nDisc.append(el('b', 'ag-n-disc', '—'), el('span', '', 'em discussão'));
    numeros.append(nLivres, nDisc);

    const ferramentas = el('div', 'ag-ferramentas');
    const selUni = el('select', 'ag-unidade');
    selUni.setAttribute('aria-label', 'Unidade');
    selUni.addEventListener('change', () => { filtro.unidade = selUni.value; desenhar(); });
    const campo = el('label', 'ag-campo');
    campo.append(icone('busca'));
    const busca = el('input');
    busca.type = 'search';
    busca.placeholder = 'Buscar profissional';
    busca.setAttribute('aria-label', 'Buscar profissional');
    busca.addEventListener('input', () => { filtro.busca = busca.value.trim().toLowerCase(); desenhar(); });
    campo.append(busca);
    const fechar = el('button', 'ag-fechar');
    fechar.type = 'button';
    fechar.setAttribute('aria-label', 'Fechar agendador');
    fechar.innerHTML = ICONE.fechar;
    fechar.addEventListener('click', fecharTela);
    ferramentas.append(selUni, campo, fechar);
    topo.append(marca, numeros, ferramentas);

    const faixa = el('div', 'ag-faixa');
    const leg1 = el('span', 'ag-leg');
    leg1.append(Object.assign(el('i'), { style: 'background:var(--blue)' }), el('span', '', 'Livre'));
    const leg2 = el('span', 'ag-leg');
    leg2.append(Object.assign(el('i'), { style: 'background:var(--green)' }), el('span', 'ag-leg-verde', 'Em discussão com o cliente'));
    const leg3 = el('span', '', 'Clique no horário para marcar ou desmarcar');
    faixa.append(leg1, leg2, leg3, el('span', 'ag-aviso'));

    tela.append(topo, faixa, el('main', 'ag-dias'));
    document.body.appendChild(tela);

    tela.querySelector('.ag-dias').addEventListener('click', (ev) => {
      const linha = ev.target.closest('.ag-linha');
      if (linha) alternar(linha.dataset.slot);
    });
  }

  function cabecalhoDia(dia, hojeIso, n, feriado) {
    const [a, m, d] = dia.split('-').map(Number);
    const topo = el('div', 'ag-dia-topo');
    const esq = el('div');
    const sem = el('div', 'ag-dia-sem', SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]);
    if (dia === hojeIso) sem.append(el('span', 'ag-tag', 'Hoje'));
    if (feriado) sem.append(el('span', 'ag-tag feriado', 'Feriado'));
    esq.append(sem, el('div', 'ag-dia-data', `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`));
    topo.append(esq, el('span', `ag-dia-n${n ? ' tem' : ''}`, feriado ? 'Fechado' : `${n} livre${n === 1 ? '' : 's'}`));
    return topo;
  }

  function cartaoProfissional(hs, prefixo) {
    const card = el('article', 'ag-prof');
    const topo = el('div', 'ag-prof-topo');
    const av = el('div', 'ag-avatar', iniciais(hs[0].profissional));
    av.style.background = corDe(hs[0].profissional);
    const txt = el('div', 'ag-prof-txt');
    txt.append(el('div', 'ag-prof-nome', hs[0].profissional), el('div', 'ag-prof-uni', hs[0].unidade.slice(prefixo.length)));
    txt.title = `${hs[0].profissional} · ${hs[0].unidade}`;
    topo.append(av, txt, el('span', 'ag-prof-n', `${hs.length} horário${hs.length === 1 ? '' : 's'}`));
    card.append(topo);
    let periodo = '';
    for (const h of hs) {
      if (periodoDe(h.hora) !== periodo) {
        periodo = periodoDe(h.hora);
        card.append(el('div', 'ag-periodo', periodo));
      }
      const verde = emDiscussao.has(h.slot);
      const linha = el('button', `ag-linha${verde ? ' verde' : ''}`);
      linha.type = 'button';
      linha.dataset.slot = h.slot;
      linha.setAttribute('aria-pressed', String(verde));
      linha.setAttribute('aria-label', `${h.hora}, ${h.profissional}: ${verde ? 'em discussão com o cliente' : 'livre'}`);
      linha.append(el('span', 'ag-hora', h.hora), el('span', 'ag-estado', verde ? 'Em discussão' : 'Livre'),
        icone('check', 'ag-ok'), el('span', 'ag-acao', verde ? 'Liberar' : 'Selecionar'));
      card.append(linha);
    }
    return card;
  }

  function desenhar() {
    if (!dados || !tela) return;
    const quando = dados.atualizado_em
      ? new Date(dados.atualizado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';
    tela.querySelector('.ag-sub-txt').textContent = `Agenda atualizada às ${quando} · tela atualiza sozinha`;
    tela.querySelector('.ag-leg-verde').textContent = `Em discussão com o cliente (libera em ${dados.expira_minutos} min)`;
    const aviso = tela.querySelector('.ag-aviso');
    aviso.textContent = dados.blocos_sem_mapa ? `${dados.blocos_sem_mapa} agenda(s) aparecem depois do próximo ciclo` : '';

    const unidades = [...new Set(dados.horarios.map((h) => h.unidade))].sort((a, b) => a.localeCompare(b));
    const prefixo = prefixoComum(unidades);
    const selUni = tela.querySelector('.ag-unidade');
    if (selUni.options.length !== unidades.length + 1) {
      selUni.replaceChildren(new Option('Todas as unidades', ''), ...unidades.map((u) => new Option(u.slice(prefixo.length), u)));
      selUni.value = unidades.includes(filtro.unidade) ? filtro.unidade : '';
    }

    const visiveis = dados.horarios.filter((h) =>
      (!filtro.unidade || h.unidade === filtro.unidade) && (!filtro.busca || h.profissional.toLowerCase().includes(filtro.busca)));
    tela.querySelector('.ag-n-livres').textContent = visiveis.filter((h) => !emDiscussao.has(h.slot)).length;
    tela.querySelector('.ag-n-disc').textContent = visiveis.filter((h) => emDiscussao.has(h.slot)).length;

    const hojeIso = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const colunas = dados.dias.map((dia) => {
      const feriado = dados.feriados?.[dia];
      const doDia = feriado ? [] : visiveis.filter((h) => h.data === dia);
      const col = el('section', `ag-dia${dia === hojeIso ? ' hoje' : ''}`);
      const lista = el('div', 'ag-dia-lista');
      if (feriado) {
        const c = el('div', 'ag-centro feriado');
        c.append(icone('feriado'), el('b', '', 'Feriado'), el('span', '', feriado));
        lista.append(c);
      } else if (!doDia.length) {
        const c = el('div', 'ag-centro');
        c.append(icone('vazio'), el('span', '', filtro.unidade || filtro.busca ? 'Nenhum horário livre neste filtro' : 'Nenhum horário livre'));
        lista.append(c);
      }
      const grupos = new Map();
      for (const h of doDia) {
        const k = `${h.profissional}|${h.unidade}`;
        (grupos.get(k) ?? grupos.set(k, []).get(k)).push(h);
      }
      for (const hs of grupos.values()) lista.append(cartaoProfissional(hs, prefixo));
      col.append(cabecalhoDia(dia, hojeIso, doDia.length, feriado), lista);
      return col;
    });
    const area = tela.querySelector('.ag-dias');
    const rolagens = [...area.querySelectorAll('.ag-dia-lista')].map((l) => l.scrollTop);
    area.replaceChildren(...colunas);
    area.querySelectorAll('.ag-dia-lista').forEach((l, i) => { l.scrollTop = rolagens[i] ?? 0; });
  }

  async function carregar() {
    const r = await fetch('/api/agendador', { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    dados = await r.json();
    emDiscussao = new Set(dados.em_discussao);
    desenhar();
  }

  async function alternar(slot) {
    const ligado = !emDiscussao.has(slot);
    // Resposta imediata na tela; o servidor confirma (ou desfaz) logo em seguida
    if (ligado) emDiscussao.add(slot); else emDiscussao.delete(slot);
    desenhar();
    try {
      const r = await fetch('/api/agendador/selecao', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slot, ligado }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      emDiscussao = new Set((await r.json()).em_discussao);
    } catch (e) {
      console.error('[agendador] não marcou o horário:', e.message);
      if (ligado) emDiscussao.delete(slot); else emDiscussao.add(slot);
    }
    desenhar();
  }

  function abrir() {
    if (!tela) montarTela();
    tela.hidden = false;
    document.body.style.overflow = 'hidden';
    carregar().catch((e) => console.error('[agendador]', e.message));
    clearInterval(timer);
    timer = setInterval(() => carregar().catch((e) => console.error('[agendador]', e.message)), ATUALIZA_MS);
    tela.querySelector('.ag-fechar').focus();
  }

  function fecharTela() {
    tela.hidden = true;
    document.body.style.overflow = '';
    clearInterval(timer);
    btn.focus();
  }

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && tela && !tela.hidden) fecharTela();
  });
  btn.addEventListener('click', abrir);

  // Só mostra o "+" se o servidor tem a DLC
  fetch('/api/agendador', { cache: 'no-store' }).then((r) => {
    if (r.ok) btn.style.display = '';
  }).catch(() => {});
})();
