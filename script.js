// ══════════════════════════════════════
// MODAL SYSTEM
// ══════════════════════════════════════
const MODAL_ICONS = {
  info:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  success: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error:   `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warn:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  confirm: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
};
let _modalResolve = null;

function showModal({ type='info', title, msg, actions }) {
  const overlay = document.getElementById('app-modal');
  const box     = document.getElementById('app-modal-box');
  const iconEl  = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const msgEl   = document.getElementById('modal-msg');
  const actEl   = document.getElementById('modal-actions');

  iconEl.className = `modal-icon ${type}`;
  iconEl.innerHTML = MODAL_ICONS[type] || MODAL_ICONS.info;
  titleEl.textContent = title;
  msgEl.innerHTML = msg || '';

  actEl.innerHTML = actions.map(a =>
    `<button class="modal-btn ${a.style||'ghost'}" onclick="_modalClick('${a.value}')">${a.label}</button>`
  ).join('');

  overlay.classList.remove('closing');
  overlay.classList.add('visible');

  // Focus first primary/danger button
  setTimeout(() => {
    const primary = actEl.querySelector('.primary,.danger');
    if(primary) primary.focus();
  }, 220);

  return new Promise(resolve => { _modalResolve = resolve; });
}

function _modalClick(value) {
  const overlay = document.getElementById('app-modal');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.classList.remove('visible','closing');
    if(_modalResolve) { _modalResolve(value); _modalResolve = null; }
  }, 200);
}

function modalOverlayClick(e) {
  if(e.target === document.getElementById('app-modal')) {
    const box = document.getElementById('app-modal-box');
    box.classList.remove('shake');
    void box.offsetWidth; // reflow to restart animation
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 400);
  }
}

// Convenience wrappers
function appAlert(msg, type='info', title=null) {
  const defaultTitles = { info:'Atenção', success:'Sucesso', error:'Erro', warn:'Aviso' };
  return showModal({ type, title: title||defaultTitles[type], msg,
    actions: [{ label:'OK', style:'primary', value:'ok' }] });
}

function appConfirm(msg, title='Confirmar', opts={}) {
  return showModal({
    type: opts.type||'confirm',
    title,
    msg,
    actions: [
      { label: opts.cancelLabel||'Cancelar', style:'ghost',  value:'cancel' },
      { label: opts.confirmLabel||'Confirmar', style: opts.danger?'danger':'primary', value:'confirm' },
    ]
  });
}

// ══════════════════════════════════════
// DATA
// ══════════════════════════════════════
let orders = [];
let keywords = ['CABO LAN','CONECTOR RJ45','FIXA FIO','METROS DE DROP','CONECTOR UPC/APC','ACOPLADOR'];
let equipamentosCatalogo = ['ONT TP LINK', 'ROTEADOR TP LINK', 'ONU'];
let dashPeriod = 'all';
let analisePeriod = 'all';
let analiseDateFrom = '';
let analiseDateTo = '';
let ordemFilter = 'all';
let chartPizza, chartBarras, chartCompare;

// Materiais extras temporários (limpos após processar)
let extrasTemp = []; // [{nome, qtd}]

// Dados locais (localStorage — fallback sem Supabase)
try { orders = JSON.parse(localStorage.getItem('os_v3_orders') || '[]'); } catch(e){}
try { const k = JSON.parse(localStorage.getItem('os_v3_kw')); if(k) keywords = k; } catch(e){}
try { const eq = JSON.parse(localStorage.getItem('os_v3_equip')); if(eq) equipamentosCatalogo = eq; } catch(e){}

function useSupabase() {
  return typeof DB !== 'undefined' && DB.isConfigured();
}

function userBadge(item) {
  if (!item?.createdByName) return '';
  if (useSupabase()) return DB.userBadgeHtml(item.createdByName);
  return `<span class="user-badge">${item.createdByName}</span>`;
}

function canEditRecord(item) {
  if (!useSupabase()) return true;
  return DB.canModify(item);
}

function applyRoleUI() {
  const master = useSupabase() && DB.isMaster();
  const btnLimpar = document.getElementById('btn-limpar-tudo');
  if (btnLimpar) btnLimpar.classList.toggle('hidden', useSupabase() && !master);
  const u = useSupabase() ? DB.getUser() : null;
  const pill = document.getElementById('topbar-role-pill');
  if (pill) {
    if (u?.isMaster) {
      pill.textContent = 'Master';
      pill.style.display = '';
    } else {
      pill.style.display = 'none';
    }
  }
}

const today = new Date();
const pad = n => String(n).padStart(2,'0');
const todayStr = () => { const d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
const fmtDate = s => { try { const [y,m,d]=s.split('-'); return `${d}/${m}/${y}`; } catch(e){ return s; } };
const fmtDateLong = s => { try { const [y,m,d]=s.split('-'); return new Date(+y,+m-1,+d).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}); } catch(e){ return s; } };

document.getElementById('top-date').textContent = today.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
function atualizarDataTopbar() {
  const el = document.getElementById('top-date');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
}
document.getElementById('rel-dia').value = todayStr();

const COLORS = ['#3b82f6','#22d3ee','#a78bfa','#f59e0b','#22c55e','#f87171','#fb923c','#e879f9'];

// ══════════════════════════════════════
// SAVE — localStorage
// ══════════════════════════════════════
function save() {
  if (useSupabase()) return;
  try {
    localStorage.setItem('os_v3_orders', JSON.stringify(orders));
    localStorage.setItem('os_v3_kw', JSON.stringify(keywords));
    localStorage.setItem('os_v3_equip', JSON.stringify(equipamentosCatalogo));
  } catch(e){}
}

function saveEquipamentosCatalogo() {
  save();
}

function saveOrder(order) {
  save();
}

function saveKeywords() {
  save();
}

async function deleteAllOrdersDB() {
  if (useSupabase()) {
    await DB.deleteAllOrders();
    orders = [];
    entregas = [];
    return;
  }
  orders = [];
  save();
}

// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
const TITLES = {
  dashboard:'Dashboard', inserir:'Inserir OS', ordens:'Ordens',
  analise:'Materiais', equipe:'Por Equipe',
  reldiario:'Diário', relmensal:'Mensal',
  controle:'Controle Diário',
  historico:'Histórico', config:'Configurações'
};
const CRUMBS = {
  dashboard:'Dashboard',
  inserir:'Operações › Inserir OS', ordens:'Operações › Ordens', historico:'Operações › Histórico',
  reldiario:'Relatórios › Diário', relmensal:'Relatórios › Mensal', equipe:'Relatórios › Por Equipe',
  analise:'Estoque › Materiais', controle:'Estoque › Controle Diário',
  config:'Sistema › Configurações'
};

function nav(id, el) {
  if (window.innerWidth <= 768) closeSidebarMobile();
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');

  document.getElementById('page-title').textContent = TITLES[id];
  document.getElementById('page-crumb').textContent = 'Início › ' + (CRUMBS[id] || TITLES[id]);

  const currentPanel = document.querySelector('.panel.active');
  const nextPanel = document.getElementById('panel-' + id);
  if (currentPanel === nextPanel) return;

  const doSwitch = () => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active', 'fade-out'));
    nextPanel.classList.add('active'); // CSS `fin` anima a entrada automaticamente
    if(id==='dashboard') renderDashboard();
    if(id==='ordens') renderOrdens();
    if(id==='analise') renderAnalise();
    if(id==='equipe') renderEquipe();
    if(id==='reldiario') renderRelDiario();
    if(id==='relmensal') { populateMeses(); renderRelMensal(); }
    if(id==='controle') { initControle(); renderControle(); }
    if(id==='checklist') { initChecklist(); }
    if(id==='checklist-historico') { initChecklistHistorico(); }
    if(id==='historico') renderHistorico();
    if(id==='config') renderConfig();

  };

  if (currentPanel) {
    currentPanel.classList.add('fade-out');
    setTimeout(doSwitch, 150);
  } else {
    doSwitch();
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const isOpen = sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('visible', isOpen);
  } else {
    sidebar.classList.toggle('collapsed');
  }
}

function closeSidebarMobile() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('visible');
}

// ══════════════════════════════════════
// FILTER HELPERS
// ══════════════════════════════════════
function filterByPeriod(arr, period, from='', to='') {
  const now = new Date();
  const toDate = s => new Date(s+'T12:00');
  if(period==='today') {
    const t = todayStr();
    return arr.filter(o => o.date === t);
  }
  if(period==='week') {
    const wk = new Date(now); wk.setDate(now.getDate()-7);
    return arr.filter(o => toDate(o.date) >= wk);
  }
  if(period==='month') {
    const mo = new Date(now); mo.setDate(now.getDate()-30);
    return arr.filter(o => toDate(o.date) >= mo);
  }
  if(period==='custom' && from && to) {
    return arr.filter(o => o.date >= from && o.date <= to);
  }
  return arr;
}

function getTotals(arr) {
  const t = {};
  keywords.forEach(k => t[k] = {e1:0, e2:0});
  arr.forEach(o => {
    // Materiais extraídos do texto (palavras-chave)
    Object.entries(o.extracted||{}).forEach(([k,v]) => {
      if(!t[k]) t[k] = {e1:0, e2:0};
      if(o.team==='equipe1') t[k].e1 += v;
      else t[k].e2 += v;
    });
    // Materiais extras manuais (ONT, Roteador, ONU, Placa, etc.)
    (o.extras||[]).filter(e => e && e.tipo !== '__texto_os' && e.tipo !== '__equip').forEach(ex => {
      const k = ex.nome || ex.name || '';
      if(!k) return;
      if(!t[k]) t[k] = {e1:0, e2:0};
      if(o.team==='equipe1') t[k].e1 += (ex.qtd||1);
      else t[k].e2 += (ex.qtd||1);
    });
  });
  return t;
}

// ── Tipo de OS toggle ──
const TIPO_OS_LABELS = {
  'corretiva':        'Corretiva',
  'preventiva':       'Preventiva',
  'instalacao_kit':   'Instalação de Kit',
  'mudanca_endereco': 'Mudança de Endereço',
};

function onTipoOSChange() {}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeBusca(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function extrairMaterial(texto, lista) {
  const result = {};
  lista.forEach(kw => {
    const re = new RegExp(escapeRegExp(kw) + '\\s*[:\\-]?\\s*\\(?\\s*(\\d+)\\s*\\)?', 'gi');
    let m, total = 0;
    while((m = re.exec(texto)) !== null) total += parseInt(m[1]);
    if(total > 0) result[kw] = total;
  });
  return result;
}

function autoExtrairNumOS(texto) {
  const campoNum = document.getElementById('ins-num');
  // Tenta pegar o número da OS no formato: ORDEM DE SERVIÇO (18989) ou ORDEM DE SERVIÇO 18989
  const match = texto.match(/ORDEM\s+DE\s+SERVI[\xC7C]O\s*[\(\s#\-]*\s*(\d{3,6})/i);
  if(match) campoNum.value = match[1];
  else campoNum.value = '';
}

async function processarOS() {
  const texto   = document.getElementById('ins-texto').value.trim();
  const team    = document.getElementById('ins-equipe').value;
  let tipo      = document.getElementById('ins-tipo').value;
  const tec     = document.getElementById('ins-tec').value.trim();
  const numOS   = document.getElementById('ins-num').value.trim();
  const alertEl = document.getElementById('ins-alert');

  if(!texto) { alertEl.className='alert err'; alertEl.textContent='Cole o texto da OS antes de processar.'; return; }

  const extracted = extrairMaterial(texto, keywords);

  if(!Object.keys(extracted).length && !extrasTemp.length) {
    alertEl.className='alert err';
    alertEl.innerHTML='Nada para registrar.<br><small style="opacity:.7">Use palavras-chave no texto (ex: CABO LAN: (16)) ou <strong>Material extra</strong>.</small>';
    return;
  }

  const d = todayStr();
  const newOrder = {
    id: Date.now(), date: d, dateLabel: fmtDate(d),
    team, tecnico: tec||'—',
    tipo: tipo||'corretiva', tipoLabel: TIPO_OS_LABELS[tipo]||'Corretiva',
    numOS: numOS||'—',
    textoOS: texto,
    extracted,
    extras: extrasTemp.length ? [...extrasTemp] : [],
  };

  if (useSupabase()) {
    try {
      const saved = await DB.insertOrder(newOrder);
      orders.push(saved);
    } catch (e) {
      alertEl.className = 'alert err';
      alertEl.textContent = e.message || 'Erro ao salvar OS.';
      return;
    }
  } else {
    orders.push(newOrder);
    save();
  }

  const matItems = Object.entries(extracted);
  const numLabel = numOS ? `<span style="font-family:var(--mono);font-weight:700;color:var(--accent2)">OS #${numOS}</span> — ` : '';
  let resultHtml = `\u2713 ${numLabel}${TIPO_OS_LABELS[tipo]||'Geral'} registrada!`;
  if(matItems.length) {
    resultHtml += `<div style="margin-top:6px;font-size:10px;color:var(--muted2);">Materiais (${matItems.length})</div>
    <div class="result-chips">${matItems.map(([k,v])=>`<span class="chip">${k}: <strong>${v}</strong></span>`).join('')}</div>`;
  }
  if(extrasTemp.length) {
    resultHtml += `<div style="margin-top:4px;font-size:10px;color:var(--orange);">⊕ ${extrasTemp.length} material(is) extra(s) incluído(s)</div>`;
  }

  alertEl.className='alert ok';
  alertEl.innerHTML = resultHtml;
  document.getElementById('ins-texto').value = '';
  document.getElementById('ins-num').value = '';
  extrasTemp = [];
  renderExtrasList();
  renderDashboard();
}

function limparInserir() {
  document.getElementById('ins-texto').value = '';
  document.getElementById('ins-num').value = '';
  document.getElementById('ins-tec').value = '';
  document.getElementById('ins-alert').className = 'alert';
  extrasTemp = [];
  renderExtrasList();
}

// ══════════════════════════════════════
// MATERIAIS EXTRAS (temporários por OS)
// ══════════════════════════════════════
function adicionarExtra() {
  const nomeEl = document.getElementById('extra-nome');
  const qtdEl  = document.getElementById('extra-qtd');
  const nome = nomeEl.value.trim().toUpperCase();
  const qtd  = parseInt(qtdEl.value) || 0;
  if(!nome) { nomeEl.focus(); return; }
  if(qtd <= 0) { qtdEl.focus(); return; }

  // Se já existe, soma a quantidade
  const existe = extrasTemp.find(e => e.nome === nome);
  if(existe) { existe.qtd += qtd; }
  else { extrasTemp.push({ nome, qtd }); }

  nomeEl.value = '';
  qtdEl.value = '';
  nomeEl.focus();
  renderExtrasList();
}

function renderExtrasList() {
  const el = document.getElementById('extras-list');
  const countEl = document.getElementById('extras-count');
  if(countEl) countEl.textContent = extrasTemp.length === 0 ? '0 itens' : `${extrasTemp.length} item${extrasTemp.length>1?'s':''}`;
  if(!extrasTemp.length) {
    el.innerHTML = '<div class="extras-empty">Nenhum material extra adicionado.</div>';
    return;
  }
  el.innerHTML = extrasTemp.map((ex, i) => `
    <div class="extra-item" id="extra-row-${i}">
      <span class="extra-item-nome" title="${ex.nome}">${ex.nome}</span>
      <span class="extra-item-qtd">${ex.qtd}</span>
      <button class="extra-btn edit" onclick="editarExtra(${i})" title="Editar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="extra-btn del" onclick="removerExtra(${i})" title="Remover">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>`).join('');
}

function editarExtra(i) {
  const ex = extrasTemp[i];
  const row = document.getElementById(`extra-row-${i}`);
  if(!row) return;
  row.innerHTML = `
    <input class="extra-item-nome-edit" id="edit-nome-${i}" value="${ex.nome}" onkeydown="if(event.key==='Enter')salvarExtra(${i});if(event.key==='Escape')renderExtrasList();">
    <input type="number" class="extra-item-qtd-edit" id="edit-qtd-${i}" value="${ex.qtd}" min="1" onkeydown="if(event.key==='Enter')salvarExtra(${i});if(event.key==='Escape')renderExtrasList();">
    <button class="extra-btn save" onclick="salvarExtra(${i})" title="Salvar">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
    <button class="extra-btn del" onclick="renderExtrasList()" title="Cancelar">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
  document.getElementById(`edit-nome-${i}`).focus();
  document.getElementById(`edit-nome-${i}`).select();
}

function salvarExtra(i) {
  const nomeEl = document.getElementById(`edit-nome-${i}`);
  const qtdEl  = document.getElementById(`edit-qtd-${i}`);
  if(!nomeEl || !qtdEl) return;
  const nome = nomeEl.value.trim().toUpperCase();
  const qtd  = parseInt(qtdEl.value) || 0;
  if(!nome || qtd <= 0) return;
  extrasTemp[i] = { nome, qtd };
  renderExtrasList();
}

function removerExtra(i) {
  extrasTemp.splice(i, 1);
  renderExtrasList();
}


// ══════════════════════════════════════
// CHECKLIST DE CONFERÊNCIA
// ══════════════════════════════════════

const CHECKLIST_STORAGE_KEY = 'inforwnet_checklist_itens';
const CHECKLIST_WPP_KEY = 'inforwnet_checklist_wpp';

const CHECKLIST_ITENS_DEFAULT = [
  { nome: 'DROP', unidade: 'METROS' },
  { nome: 'CABO LAN', unidade: 'METROS' },
  { nome: 'APC', unidade: '' },
  { nome: 'UPC', unidade: '' },
  { nome: 'ACOPLADOR', unidade: '' },
  { nome: 'RJ45', unidade: '' },
  { nome: 'ONU', unidade: '' },
  { nome: 'ONT', unidade: '' },
  { nome: 'ROTEADOR', unidade: '' },
  { nome: 'FONTE POE', unidade: '' },
  { nome: 'CÂMERA EXTERNA', unidade: '' },
  { nome: 'CÂMERA INTERNA', unidade: '' },
  { nome: 'PLACA METRO', unidade: '' },
  { nome: 'SWITCH', unidade: '' },
  { nome: 'FIXA-FIO', unidade: '' },
  { nome: 'CAIXINHA DE EMENDA', unidade: '' },
  { nome: 'ARAME DE ESPINAR', unidade: '' },
  { nome: 'FITA DE AUTO FUSÃO', unidade: '' },
  { nome: 'ADESIVOS', unidade: '' },
];

function getChecklistItens() {
  try {
    const s = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    return s ? JSON.parse(s) : [...CHECKLIST_ITENS_DEFAULT];
  } catch { return [...CHECKLIST_ITENS_DEFAULT]; }
}

function saveChecklistItens(itens) {
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(itens));
}

function getChecklistWpp() {
  return localStorage.getItem(CHECKLIST_WPP_KEY) || '';
}

function saveChecklistWpp(link) {
  localStorage.setItem(CHECKLIST_WPP_KEY, link);
}

function initChecklist() {
  renderChecklistForm();
  renderChecklistPreview();
}

function renderChecklistForm() {
  const itens = getChecklistItens();
  const el = document.getElementById('chk-itens-form');
  if (!el) return;
  el.innerHTML = itens.map((item, i) => `
    <div style="display:grid;grid-template-columns:1fr 90px;gap:8px;margin-bottom:8px;align-items:center;">
      <label style="font-size:11px;font-family:var(--mono);color:var(--muted2);">${item.nome}${item.unidade ? ' (' + item.unidade + ')' : ''}</label>
      <input type="number" id="chk-val-${i}" placeholder="0" min="0" oninput="renderChecklistPreview()" style="text-align:center;font-family:var(--mono);font-size:12px;">
    </div>
  `).join('');
}

function renderChecklistPreview() {
  const itens = getChecklistItens();
  const equipe = document.getElementById('chk-equipe')?.value || 'EQUIPE 01';
  const tecnico = document.getElementById('chk-tecnico')?.value?.trim() || '—';
  const hoje = new Date().toLocaleDateString('pt-BR');

  let msg = `${equipe} - ${tecnico}
DATA ${hoje}
MATERIAIS:
`;

  itens.forEach((item, i) => {
    const val = (document.getElementById(`chk-val-${i}`)?.value || '').trim();
    const unid = item.unidade ? ` ${item.unidade}` : '';
    msg += `${item.nome}: ${val || 'NÃO'}${unid}
`;
  });

  const pre = document.getElementById('chk-preview');
  if (pre) pre.textContent = msg;

  // Mostrar hint do WhatsApp se não configurado
  const hint = document.getElementById('chk-wpp-hint');
  if (hint) hint.style.display = getChecklistWpp() ? 'none' : 'block';
}

function copiarChecklist() {
  const texto = document.getElementById('chk-preview')?.textContent || '';
  if (!texto) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(texto).then(() => appAlert('Texto copiado!', 'success', 'Copiado'));
  } else {
    appAlert('Copie manualmente o texto da prévia.', 'warn');
  }
}

function enviarChecklistWhatsApp() {
  const texto = document.getElementById('chk-preview')?.textContent || '';
  const wppLink = getChecklistWpp();

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(texto);
  }

  if (wppLink) {
    window.open(wppLink, '_blank');
    appAlert('Mensagem copiada! Cole no grupo do WhatsApp.', 'success', 'WhatsApp');
  } else {
    const encoded = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }
}

async function editarItensChecklist() {
  const itens = getChecklistItens();
  const wpp = getChecklistWpp();

  const listaHtml = itens.map((item, i) =>
    `<div class="edit-extra-item" id="chk-edit-${i}">
      <span style="font-family:var(--mono);font-size:11px;">${item.nome}${item.unidade ? ' (' + item.unidade + ')' : ''}</span>
      <button type="button" onclick="removeChecklistItem(${i})" class="btn-del-record">✕</button>
    </div>`
  ).join('');

  const box = document.getElementById('app-modal-box');
  box.classList.add('modal-box--os');

  const v = await showModal({
    type: 'info',
    title: 'Editar itens do Checklist',
    msg: `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label class="flabel">Link do grupo WhatsApp</label>
          <input type="text" id="chk-edit-wpp" class="finput" placeholder="https://chat.whatsapp.com/..." value="${escapeHtml(wpp)}" style="margin-top:4px;">
          <div style="font-size:10px;color:var(--muted);margin-top:4px;">Cole o link de convite do grupo. Deixe vazio para abrir o WhatsApp normalmente.</div>
        </div>
        <div>
          <label class="flabel">Itens da lista</label>
          <div id="chk-edit-list" style="margin:8px 0;">${listaHtml}</div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <input type="text" id="chk-new-nome" class="finput" placeholder="Nome do item (ex: FIBRA)" style="flex:1;">
            <button type="button" class="btn btn-primary" onclick="addChecklistItem()">+</button>
          </div>
        </div>
      </div>
    `,
    actions: [
      { label: 'Cancelar', style: 'ghost', value: 'cancel' },
      { label: 'Salvar', style: 'primary', value: 'ok' },
    ],
  });

  box.classList.remove('modal-box--os');

  if (v !== 'ok') { window._chkEditItens = null; return; }

  const novosItens = window._chkEditItens || itens;
  saveChecklistItens(novosItens);
  window._chkEditItens = null;

  const novoWpp = (document.getElementById('chk-edit-wpp')?.value || '').trim();
  saveChecklistWpp(novoWpp);

  renderChecklistForm();
  renderChecklistPreview();
  appAlert('Checklist atualizado!', 'success', 'Salvo');
}

function addChecklistItem() {
  if (!window._chkEditItens) window._chkEditItens = [...getChecklistItens()];
  const nome = (document.getElementById('chk-new-nome')?.value || '').trim().toUpperCase();
  if (!nome) return;
  window._chkEditItens.push({ nome, unidade: '' });
  renderChkEditList();
  document.getElementById('chk-new-nome').value = '';
}

function removeChecklistItem(idx) {
  if (!window._chkEditItens) window._chkEditItens = [...getChecklistItens()];
  window._chkEditItens.splice(idx, 1);
  renderChkEditList();
}

function renderChkEditList() {
  const el = document.getElementById('chk-edit-list');
  if (!el) return;
  el.innerHTML = (window._chkEditItens || []).map((item, i) =>
    `<div class="edit-extra-item" id="chk-edit-${i}">
      <span style="font-family:var(--mono);font-size:11px;">${item.nome}${item.unidade ? ' (' + item.unidade + ')' : ''}</span>
      <button type="button" onclick="removeChecklistItem(${i})" class="btn-del-record">✕</button>
    </div>`
  ).join('');
}


// ══════════════════════════════════════
// HISTÓRICO DE CHECKLISTS
// ══════════════════════════════════════

const CHECKLIST_HIST_KEY = 'inforwnet_checklist_historico';

function getChecklistHistorico() {
  try {
    const s = localStorage.getItem(CHECKLIST_HIST_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function saveChecklistHistorico(hist) {
  localStorage.setItem(CHECKLIST_HIST_KEY, JSON.stringify(hist));
}

function salvarChecklist() {
  const itens = getChecklistItens();
  const equipe = document.getElementById('chk-equipe')?.value || 'EQUIPE 01';
  const tecnico = document.getElementById('chk-tecnico')?.value?.trim() || '—';
  const hoje = new Date();
  const dataStr = hoje.toLocaleDateString('pt-BR');
  const horaStr = hoje.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Coletar valores preenchidos
  const valores = itens.map((item, i) => ({
    nome: item.nome,
    unidade: item.unidade || '',
    valor: document.getElementById(`chk-val-${i}`)?.value?.trim() || '',
  }));

  const registro = {
    id: Date.now(),
    data: dataStr,
    hora: horaStr,
    equipe,
    tecnico,
    valores,
    texto: document.getElementById('chk-preview')?.textContent || '',
  };

  const hist = getChecklistHistorico();
  hist.unshift(registro); // mais recente primeiro
  saveChecklistHistorico(hist);

  appAlert(`Checklist salvo! ${dataStr} ${horaStr} — ${equipe}`, 'success', 'Salvo');
}

function initChecklistHistorico() {
  renderChecklistHistorico();
}

function renderChecklistHistorico() {
  const el = document.getElementById('chk-historico-list');
  if (!el) return;
  const hist = getChecklistHistorico();
  if (!hist.length) {
    el.innerHTML = '<div class="empty">Nenhum checklist salvo ainda.</div>';
    return;
  }
  el.innerHTML = hist.map(r => `
    <div class="os-item" style="margin-bottom:10px;">
      <div class="os-header">
        <span class="badge" style="background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#4ade80;font-family:var(--mono);font-size:10px;padding:2px 8px;border-radius:4px;">${r.equipe}</span>
        <span style="font-size:11px;color:var(--muted2);font-family:var(--mono);">${r.data} ${r.hora}</span>
        <span style="font-size:11px;color:var(--text2);">${escapeHtml(r.tecnico)}</span>
        <div style="margin-left:auto;display:flex;gap:6px;">
          <button type="button" class="btn-ver-os" onclick="verChecklistCompleto(${r.id})">Ver completo</button>
          <button type="button" class="btn-del-os" onclick="apagarChecklist(${r.id})">✕</button>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;">
        ${r.valores.filter(v => v.valor && v.valor !== '0' && v.valor !== '').map(v =>
          `<span class="chip">${escapeHtml(v.nome)}: ${escapeHtml(v.valor)}${v.unidade ? ' ' + v.unidade : ''}</span>`
        ).join('')}
      </div>
    </div>
  `).join('');
}

function verChecklistCompleto(id) {
  const hist = getChecklistHistorico();
  const r = hist.find(x => x.id === id);
  if (!r) return;
  showModal({
    type: 'info',
    title: `Checklist — ${r.equipe} — ${r.data} ${r.hora}`,
    msg: `<pre style="font-family:var(--mono);font-size:11px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;white-space:pre-wrap;max-height:400px;overflow-y:auto;">${escapeHtml(r.texto)}</pre>`,
    actions: [
      { label: 'Copiar', style: 'ghost', value: 'copy' },
      { label: 'Fechar', style: 'primary', value: 'close' },
    ],
  }).then(v => {
    if (v === 'copy' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(r.texto).then(() => appAlert('Texto copiado!', 'success', 'Copiado'));
    }
  });
}

function apagarChecklist(id) {
  const hist = getChecklistHistorico().filter(x => x.id !== id);
  saveChecklistHistorico(hist);
  renderChecklistHistorico();
}

// ══════════════════════════════════════
// ANIMATED COUNTER
// ══════════════════════════════════════
function animateCounter(el, target, duration=600) {
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  if(diff === 0) { el.textContent = target; return; }
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    el.textContent = Math.round(start + diff * eased);
    if(progress < 1) requestAnimationFrame(update);
    else { el.textContent = target; el.classList.add('updated'); setTimeout(()=>el.classList.remove('updated'),300); }
  }
  requestAnimationFrame(update);
}


function setDashPeriod(p, el) {
  dashPeriod = p;
  document.querySelectorAll('#dash-pills .pill').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  renderDashboard();
}

function renderDashboard() {
  const f = filterByPeriod(orders, dashPeriod);
  const e1 = f.filter(o => o.team==='equipe1');
  const e2 = f.filter(o => o.team==='equipe2');
  const totals = getTotals(f);
  const keys = Object.keys(totals).filter(k => totals[k].e1+totals[k].e2 > 0);
  let grand = 0, t1sum=0, t2sum=0;
  keys.forEach(k => { t1sum+=totals[k].e1; t2sum+=totals[k].e2; grand+=totals[k].e1+totals[k].e2; });

  animateCounter(document.getElementById('kpi-total-os'), f.length);
  animateCounter(document.getElementById('kpi-total-mat'), grand);
  animateCounter(document.getElementById('kpi-e1'), e1.length);
  animateCounter(document.getElementById('kpi-e2'), e2.length);

  // Pizza chart — com porcentagens
  const pizzaCtx = document.getElementById('chart-pizza').getContext('2d');
  if(chartPizza) chartPizza.destroy();
  if(!keys.length) { pizzaCtx.clearRect(0,0,300,220); }
  else {
    const pizzaData = keys.map(k => totals[k].e1 + totals[k].e2);
    const pizzaTotal = pizzaData.reduce((a,b) => a+b, 0);
    chartPizza = new Chart(pizzaCtx, {
      type: 'doughnut',
      data: {
        labels: keys,
        datasets: [{
          data: pizzaData,
          backgroundColor: COLORS.map(c => c),
          borderWidth: 3,
          borderColor: '#111827',
          hoverBorderWidth: 4,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateRotate: true, animateScale: true, duration: 800, easing: 'easeOutQuart' },
        cutout: '58%',
        layout: { padding: { right: 10 } },
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              color: '#e2e8f0',
              font: { family: 'IBM Plex Mono', size: 13 },
              boxWidth: 14, padding: 16,
              generateLabels: (chart) => {
                const ds = chart.data.datasets[0];
                return chart.data.labels.map((label, i) => {
                  const val = ds.data[i];
                  const pct = pizzaTotal ? Math.round(val / pizzaTotal * 100) : 0;
                  return {
                    text: `${label}  ${pct}%`,
                    fillStyle: ds.backgroundColor[i],
                    strokeStyle: ds.backgroundColor[i],
                    fontColor: '#e2e8f0',
                    lineWidth: 0,
                    index: i,
                  };
                });
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed;
                const pct = pizzaTotal ? Math.round(val / pizzaTotal * 100) : 0;
                return ` ${ctx.label}: ${val} (${pct}%)`;
              }
            },
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
          }
        }
      }
    });
  }

  // Barras chart — melhorado com valores e grid
  const barCtx = document.getElementById('chart-barras').getContext('2d');
  if(chartBarras) chartBarras.destroy();
  if(!keys.length) { barCtx.clearRect(0,0,300,220); }
  else {
    const barLabels = keys.map(k => k.length > 10 ? k.substring(0,10)+'…' : k);
    chartBarras = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [
          {
            label: 'Equipe 1',
            data: keys.map(k => totals[k].e1),
            backgroundColor: 'rgba(167,139,250,0.75)',
            borderColor: 'rgba(167,139,250,1)',
            borderWidth: 1,
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Equipe 2',
            data: keys.map(k => totals[k].e2),
            backgroundColor: 'rgba(251,146,60,0.75)',
            borderColor: 'rgba(251,146,60,1)',
            borderWidth: 1,
            borderRadius: 5,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart', delay: (ctx) => ctx.dataIndex * 50 },
        plugins: {
          legend: {
            labels: {
              color: '#e2e8f0',
              font: { family: 'IBM Plex Mono', size: 11, weight: '500' },
              boxWidth: 12, padding: 14,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const k = keys[ctx.dataIndex];
                const total = totals[k].e1 + totals[k].e2;
                const pct = grand ? Math.round(ctx.parsed.y / grand * 100) : 0;
                return ` ${ctx.dataset.label}: ${ctx.parsed.y}  (${pct}% do total)`;
              }
            },
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
          }
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 9 }, maxRotation: 45, minRotation: 30 },
            grid: { color: 'rgba(255,255,255,0.03)' },
          },
          y: {
            ticks: { color: '#94a3b8', font: { family: 'IBM Plex Mono', size: 9 }, callback: (v) => v },
            grid: { color: 'rgba(255,255,255,0.08)' },
            beginAtZero: true,
          }
        }
      }
    });
  }

  // Tabela ProTable
  const dashRows = keys.map((k,i) => {
    const v = totals[k].e1+totals[k].e2;
    const pct = grand ? Math.round(v/grand*100) : 0;
    return { _i:i, material:k, e1:totals[k].e1, e2:totals[k].e2, total:v, pct };
  });
  ProTable({
    containerId:'dash-tbl-pro',
    pageSize:8,
    exportName:'resumo-materiais',
    defaultSort:3,
    columns:[
      { key:'material', label:'Material', sortType:'str', render:r=>`<span class="dot" style="background:${COLORS[r._i%COLORS.length]}"></span>${r.material}` },
      { key:'e1', label:'Equipe 1', align:'r', sortType:'num' },
      { key:'e2', label:'Equipe 2', align:'r', sortType:'num' },
      { key:'total', label:'Total', align:'r', sortType:'num', render:r=>`<span style="color:var(--accent2);font-family:var(--mono)">${r.total}</span>` },
      { key:'pct', label:'%', align:'r', sortType:'num', noSort:false, render:r=>`<span class="badge badge-blue">${r.pct}%</span>` },
    ],
    data: dashRows,
  });
}

// ══════════════════════════════════════
// ORDENS PROCESSADAS
// ══════════════════════════════════════
function setOrdemFilter(f, el) {
  ordemFilter = f;
  document.querySelectorAll('#panel-ordens .pills .pill').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  renderOrdens();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOSItemHtml(o, idx, opts = {}) {
  const items = Object.entries(o.extracted || {});
  const tipoLabel = o.tipoLabel || TIPO_OS_LABELS[o.tipo] || '📄 Geral';
  const extrasCount = (o.extras || []).filter((e) => e && e.tipo !== '__texto_os' && e.tipo !== '__equip').length;
  const equips = o.equipamentos || [];
  const anim = opts.anim !== false;
  const animAttr = anim ? ` class="os-item os-item-anim" style="animation-delay:${Math.min(idx * 0.04, 0.4)}s"` : ' class="os-item"';
  const temTexto = !!(o.textoOS || '').trim();
  return `<div${animAttr}>
      <div class="os-header">
        ${o.numOS && o.numOS !== '—' ? `<span style="font-family:var(--mono);font-size:11px;font-weight:700;color:var(--accent2);background:rgba(34,211,238,0.1);border:1px solid rgba(34,211,238,0.2);border-radius:4px;padding:2px 9px;">#${escapeHtml(o.numOS)}</span>` : ''}
        <span class="os-date">${escapeHtml(o.dateLabel || o.date)}</span>
        ${o.tecnico !== '—' ? `<span class="os-tech">${escapeHtml(o.tecnico)}</span>` : ''}
        <span style="font-size:10px;font-family:var(--mono);color:var(--muted);background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:2px 8px;">${escapeHtml(tipoLabel)}</span>
        ${extrasCount ? `<span style="font-size:10px;font-family:var(--mono);color:var(--orange);background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);border-radius:6px;padding:2px 8px;">⊕ ${extrasCount} extra${extrasCount > 1 ? 's' : ''}</span>` : ''}
        ${equips.length ? `<span style="font-size:10px;font-family:var(--mono);color:#a78bfa;background:rgba(167,139,250,0.12);border:1px solid rgba(167,139,250,0.25);border-radius:6px;padding:2px 8px;">⚙ ${equips.length} equip.</span>` : ''}
        <span class="os-team"><span class="badge ${o.team === 'equipe1' ? 'badge-blue' : 'badge-warn'}">${o.team === 'equipe1' ? 'Equipe 1' : 'Equipe 2'}</span></span>
        ${userBadge(o)}
        <button type="button" class="btn-ver-os${temTexto ? '' : ' btn-ver-os--off'}" onclick="verOSCompleta(${o.id})" title="${temTexto ? 'Ver texto completo da OS' : 'Texto não salvo nesta OS'}">Ver OS completa</button>
        ${(opts.showActions && canEditRecord(o)) ? `<button type="button" class="btn-edit-os" onclick="editarOS(${o.id})" title="Editar OS">✎ Editar</button>` : ''}
        ${(opts.showActions && canEditRecord(o)) ? `<button type="button" class="btn-del-os" onclick="apagarOS(${o.id})" title="Apagar OS">✕ Apagar</button>` : ''}
      </div>
      ${items.length ? `<div class="os-mats">${items.map(([k, v]) => `<span class="chip">${escapeHtml(k)}: <strong>${v}</strong></span>`).join('')}</div>` : ''}
      ${equips.length ? `<div class="os-mats os-equips">${equips.map((e) => `<span class="chip chip-equip">${escapeHtml(e.nome)}: <strong>${e.qtd}</strong></span>`).join('')}</div>` : ''}
    </div>`;
}

function verOSCompleta(orderId) {
  const o = orders.find((x) => x.id === orderId);
  if (!o) {
    appAlert('OS não encontrada.', 'warn', 'Erro');
    return;
  }
  const texto = (o.textoOS || '').trim();
  const titulo = o.numOS && o.numOS !== '—' ? `OS #${o.numOS}` : 'Ordem de serviço';
  const meta = [
    o.dateLabel || o.date,
    o.tecnico !== '—' ? o.tecnico : '',
    o.tipoLabel || TIPO_OS_LABELS[o.tipo] || '',
    o.team === 'equipe1' ? 'Equipe 1' : 'Equipe 2',
  ].filter(Boolean).join(' · ');

  if (!texto) {
    appAlert(
      'O texto completo desta OS não foi salvo.<br><small style="opacity:.85">OS antigas ou registradas antes desta função não têm o texto. Novas OS passam a guardar o conteúdo automaticamente.</small>',
      'warn',
      titulo
    );
    return;
  }

  const box = document.getElementById('app-modal-box');
  box.classList.add('modal-box--os');
  showModal({
    type: 'info',
    title: titulo,
    msg: `<div class="os-view-meta">${escapeHtml(meta)}</div><pre class="os-texto-full">${escapeHtml(texto)}</pre>`,
    actions: [
      { label: 'Copiar texto', style: 'ghost', value: 'copy' },
      { label: 'Fechar', style: 'primary', value: 'ok' },
    ],
  }).then((v) => {
    box.classList.remove('modal-box--os');
    if (v === 'copy') {
      const done = () => appAlert('Texto da OS copiado.', 'success', 'Copiado');
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(texto).then(done).catch(() => appAlert('Não foi possível copiar.', 'error'));
      } else {
        appAlert('Copie manualmente pelo texto exibido.', 'warn');
      }
    }
  });
}


async function apagarOS(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  if (!canEditRecord(o)) {
    appAlert('Você só pode apagar OS que você registrou.', 'warn', 'Sem permissão');
    return;
  }
  const confirm = await showModal({
    type: 'warn',
    title: 'Apagar OS?',
    msg: `Tem certeza que deseja apagar a OS <strong>${o.numOS !== '—' ? '#' + o.numOS : ''}</strong>?<br>Esta ação não pode ser desfeita.`,
    actions: [
      { label: 'Cancelar', style: 'ghost', value: 'cancel' },
      { label: 'Apagar', style: 'danger', value: 'ok' },
    ],
  });
  if (confirm !== 'ok') return;
  if (useSupabase()) {
    try {
      await DB.deleteOrder(id);
    } catch (e) {
      appAlert(e.message || 'Erro ao apagar OS.', 'error', 'Erro');
      return;
    }
  }
  orders = orders.filter(x => x.id !== id);
  if (!useSupabase()) save();
  renderOrdens();
  renderDashboard();
  appAlert('OS apagada com sucesso.', 'success', 'Apagado');
}


function editarOS(id) {
  const o = orders.find(x => x.id === id);
  if (!o) return;
  if (!canEditRecord(o)) {
    appAlert('Você só pode editar OS que você registrou.', 'warn', 'Sem permissão');
    return;
  }

  const tipoOptions = [
    { value: 'corretiva', label: 'Corretiva' },
    { value: 'preventiva', label: 'Preventiva' },
    { value: 'instalacao_kit', label: 'Instalação de Kit' },
    { value: 'mudanca_endereco', label: 'Mudança de Endereço' },
  ].map(t => `<option value="${t.value}"${o.tipo === t.value ? ' selected' : ''}>${t.label}</option>`).join('');

  const extrasHtml = (o.extras || []).map((ex, i) =>
    `<div class="edit-extra-item" id="edit-extra-${i}">
      <span>${escapeHtml(ex.nome)} × ${ex.qtd}</span>
      <button type="button" onclick="removeEditExtra(${i})" class="btn-del-record">✕</button>
    </div>`
  ).join('');

  const box = document.getElementById('app-modal-box');
  box.classList.add('modal-box--os');

  showModal({
    type: 'info',
    title: o.numOS !== '—' ? `Editar OS #${o.numOS}` : 'Editar OS',
    msg: `
      <div class="edit-os-form">
        <div class="edit-os-row">
          <div class="edit-os-field">
            <label class="flabel">Data</label>
            <input type="date" id="edit-date" class="finput" value="${o.date}">
          </div>
          <div class="edit-os-field">
            <label class="flabel">Nº OS</label>
            <input type="text" id="edit-num" class="finput" value="${o.numOS !== '—' ? o.numOS : ''}">
          </div>
        </div>
        <div class="edit-os-row">
          <div class="edit-os-field">
            <label class="flabel">Equipe</label>
            <select id="edit-equipe" class="finput">
              <option value="equipe1"${o.team === 'equipe1' ? ' selected' : ''}>Equipe 1</option>
              <option value="equipe2"${o.team === 'equipe2' ? ' selected' : ''}>Equipe 2</option>
            </select>
          </div>
          <div class="edit-os-field">
            <label class="flabel">Técnico</label>
            <input type="text" id="edit-tec" class="finput" value="${o.tecnico !== '—' ? escapeHtml(o.tecnico) : ''}">
          </div>
        </div>
        <div class="edit-os-field">
          <label class="flabel">Tipo de OS</label>
          <select id="edit-tipo" class="finput">${tipoOptions}</select>
        </div>
        <div class="edit-os-field">
          <label class="flabel">Texto da OS</label>
          <textarea id="edit-texto" class="finput" rows="8" style="resize:vertical;font-family:var(--mono);font-size:11px;">${escapeHtml(o.textoOS || '')}</textarea>
        </div>
        <div class="edit-os-field">
          <label class="flabel">Material Extra</label>
          <div id="edit-extras-list">${extrasHtml}</div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <input type="text" id="edit-extra-nome" class="finput" placeholder="Nome do material" style="flex:1;">
            <input type="number" id="edit-extra-qtd" class="finput" placeholder="Qtd" min="1" style="width:70px;" value="1">
            <button type="button" class="btn btn-primary" onclick="addEditExtra()">+</button>
          </div>
        </div>
      </div>
    `,
    actions: [
      { label: 'Cancelar', style: 'ghost', value: 'cancel' },
      { label: 'Salvar', style: 'primary', value: 'ok' },
    ],
  }).then(async (v) => {
    box.classList.remove('modal-box--os');
    if (v !== 'ok') return;

    const texto = document.getElementById('edit-texto').value.trim();
    const extracted = texto ? extrairMaterial(texto, keywords) : {};
    const extraItems = window._editExtras || [...(o.extras || [])];

    const updated = {
      ...o,
      date: document.getElementById('edit-date').value || o.date,
      numOS: document.getElementById('edit-num').value.trim() || '—',
      team: document.getElementById('edit-equipe').value,
      tecnico: document.getElementById('edit-tec').value.trim() || '—',
      tipo: document.getElementById('edit-tipo').value,
      tipoLabel: TIPO_OS_LABELS[document.getElementById('edit-tipo').value] || 'Corretiva',
      textoOS: texto,
      extracted,
      extras: extraItems,
    };
    updated.dateLabel = fmtDate(updated.date);

    if (useSupabase()) {
      try {
        await DB.updateOrder(updated);
      } catch (e) {
        appAlert(e.message || 'Erro ao salvar OS.', 'error', 'Erro');
        return;
      }
    }

    const idx = orders.findIndex(x => x.id === id);
    if (idx > -1) orders[idx] = updated;
    if (!useSupabase()) save();
    window._editExtras = null;
    renderOrdens();
    renderDashboard();
    appAlert('OS atualizada com sucesso!', 'success', 'Salvo');
  });

  // Inicializar extras temporários para edição
  window._editExtras = [...(o.extras || [])];
}

function addEditExtra() {
  const nome = (document.getElementById('edit-extra-nome').value || '').trim().toUpperCase();
  const qtd = parseInt(document.getElementById('edit-extra-qtd').value) || 1;
  if (!nome) return;
  if (!window._editExtras) window._editExtras = [];
  window._editExtras.push({ nome, qtd });
  renderEditExtrasList();
  document.getElementById('edit-extra-nome').value = '';
  document.getElementById('edit-extra-qtd').value = '1';
}

function removeEditExtra(idx) {
  if (!window._editExtras) return;
  window._editExtras.splice(idx, 1);
  renderEditExtrasList();
}

function renderEditExtrasList() {
  const el = document.getElementById('edit-extras-list');
  if (!el) return;
  el.innerHTML = (window._editExtras || []).map((ex, i) =>
    `<div class="edit-extra-item">
      <span>${escapeHtml(ex.nome)} × ${ex.qtd}</span>
      <button type="button" onclick="removeEditExtra(${i})" class="btn-del-record">✕</button>
    </div>`
  ).join('');
}

function renderOrdens() {
  const f = ordemFilter==='all' ? orders : orders.filter(o => o.team===ordemFilter);
  const el = document.getElementById('ordens-list');
  if(!f.length) { el.innerHTML='<div class="empty">Nenhuma OS encontrada.</div>'; return; }
  el.innerHTML = [...f].reverse().map((o, idx) => buildOSItemHtml(o, idx, { showActions: true })).join('');
}

// ══════════════════════════════════════
// ANÁLISE DE MATERIAIS
// ══════════════════════════════════════
function setAnalisePeriod(p, el) {
  analisePeriod = p;
  document.querySelectorAll('#analise-pills .pill').forEach(x => x.classList.remove('active'));
  el.classList.add('active');
  const cd = document.getElementById('custom-dates');
  cd.style.display = p==='custom' ? 'flex' : 'none';
  if(p!=='custom') renderAnalise();
}

function applyCustomDate() {
  analiseDateFrom = document.getElementById('date-from').value;
  analiseDateTo = document.getElementById('date-to').value;
  renderAnalise();
}

function renderAnalise() {
  const f = filterByPeriod(orders, analisePeriod, analiseDateFrom, analiseDateTo);
  const totals = getTotals(f);
  const keys = Object.keys(totals).filter(k => totals[k].e1+totals[k].e2 > 0);
  const maxV = Math.max(...keys.map(k=>totals[k].e1+totals[k].e2),1);

  // Bars
  const barsEl = document.getElementById('analise-bars');
  if(!keys.length) { barsEl.innerHTML='<div class="empty">Sem dados.</div>'; }
  else {
    barsEl.innerHTML = keys.map((k,i) => {
      const v = totals[k].e1+totals[k].e2;
      const p1 = Math.round(totals[k].e1/maxV*100), p2 = Math.round(totals[k].e2/maxV*100);
      const c = COLORS[i%COLORS.length];
      return `<div class="bar-row">
        <div class="bar-name" title="${k}">${k}</div>
        <div class="bar-tracks">
          <div class="bar-track"><div class="bar-fill" style="width:${p1}%;background:${c}"></div></div>
          <div class="bar-track"><div class="bar-fill" style="width:${p2}%;background:${c}55"></div></div>
          <div class="bar-sub"><span style="color:${c}">E1: ${totals[k].e1}</span><span>E2: ${totals[k].e2}</span></div>
        </div>
        <div class="bar-val">${v}</div>
      </div>`;
    }).join('');
  }

  // Table ProTable
  let grand=0, t1s=0, t2s=0;
  keys.forEach(k=>{grand+=totals[k].e1+totals[k].e2;t1s+=totals[k].e1;t2s+=totals[k].e2;});
  const analiseRows = keys.map((k,i)=>({ _i:i, material:k, e1:totals[k].e1, e2:totals[k].e2, total:totals[k].e1+totals[k].e2 }));
  ProTable({
    containerId:'analise-tbl-pro',
    pageSize:10,
    exportName:'analise-materiais',
    defaultSort:3,
    columns:[
      { key:'material', label:'Material', sortType:'str', render:r=>`<span class="dot" style="background:${COLORS[r._i%COLORS.length]}"></span>${r.material}` },
      { key:'e1', label:'E1', align:'r', sortType:'num' },
      { key:'e2', label:'E2', align:'r', sortType:'num' },
      { key:'total', label:'Total', align:'r', sortType:'num', render:r=>`<span style="color:var(--accent2);font-family:var(--mono)">${r.total}</span>` },
    ],
    data: analiseRows,
  });
}

// ══════════════════════════════════════
// ANÁLISE POR EQUIPE
// ══════════════════════════════════════
let currentChartType = 'bar';

function setChartType(type, el) {
  currentChartType = type;
  document.querySelectorAll('#chart-type-pills .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderCompareChart();
}

function renderEquipe() {
  const t1orders = orders.filter(o => o.team==='equipe1');
  const t2orders = orders.filter(o => o.team==='equipe2');
  const totals1 = getTotals(t1orders), totals2 = getTotals(t2orders);
  const k1 = Object.keys(totals1).filter(k=>totals1[k].e1>0);
  const k2 = Object.keys(totals2).filter(k=>totals2[k].e2>0);

  let s1=0,s2=0;
  Object.values(totals1).forEach(v=>s1+=v.e1);
  Object.values(totals2).forEach(v=>s2+=v.e2);
  animateCounter(document.getElementById('eq-kpi1'), s1);
  animateCounter(document.getElementById('eq-kpi2'), s2);

  const renderBars = (id, keys, totalsObj, field, color) => {
    const el = document.getElementById(id);
    if(!keys.length) { el.innerHTML='<div class="empty">Sem dados.</div>'; return; }
    const mx = Math.max(...keys.map(k=>totalsObj[k][field]),1);
    el.innerHTML = keys.map(k => {
      const v = totalsObj[k][field];
      return `<div class="bar-row">
        <div class="bar-name" title="${k}">${k}</div>
        <div class="bar-tracks"><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/mx*100)}%;background:${color}"></div></div></div>
        <div class="bar-val">${v}</div>
      </div>`;
    }).join('');
  };
  renderBars('eq1-bars', k1, totals1, 'e1', '#a78bfa');
  renderBars('eq2-bars', k2, totals2, 'e2', '#f59e0b');

  renderCompareChart();
}

function renderCompareChart() {
  const t1orders = orders.filter(o => o.team==='equipe1');
  const t2orders = orders.filter(o => o.team==='equipe2');
  const totals1 = getTotals(t1orders), totals2 = getTotals(t2orders);
  const k1 = Object.keys(totals1).filter(k=>totals1[k].e1>0);
  const k2 = Object.keys(totals2).filter(k=>totals2[k].e2>0);
  const allKeys = [...new Set([...k1,...k2])];
  const canvas = document.getElementById('chart-compare');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  if(chartCompare) { chartCompare.destroy(); chartCompare = null; }
  if(!allKeys.length) return;

  const shortLabels = allKeys.map(k => k.length > 12 ? k.substring(0,12)+'…' : k);
  const d1 = allKeys.map(k => totals1[k] ? totals1[k].e1 : 0);
  const d2 = allKeys.map(k => totals2[k] ? totals2[k].e2 : 0);
  const legendOpts = { labels:{ color:'#94a3b8', font:{family:'IBM Plex Mono',size:11}, boxWidth:12, padding:12 } };
  const scaleOpts = { x:{ ticks:{color:'#64748b',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'rgba(255,255,255,0.05)'} }, y:{ ticks:{color:'#64748b',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'rgba(255,255,255,0.07)'} } };

  const chartAnim = { duration:700, easing:'easeOutQuart' };

  // Round/circular types
  if(currentChartType === 'doughnut' || currentChartType === 'polarArea') {
    const combined = allKeys.map(k => (totals1[k]?totals1[k].e1:0) + (totals2[k]?totals2[k].e2:0));
    chartCompare = new Chart(ctx, {
      type: currentChartType,
      data:{ labels: shortLabels, datasets:[{ data: combined, backgroundColor: COLORS, borderWidth: 2, borderColor:'#111827' }] },
      options:{
        responsive:true,
        maintainAspectRatio:true,
        aspectRatio: 2,
        animation:{ ...chartAnim, animateRotate:true, animateScale:true },
        plugins:{
          legend:{ position:'right', labels:{ color:'#94a3b8', font:{family:'IBM Plex Mono',size:11}, boxWidth:12, padding:10 } },
          tooltip:{ callbacks:{ label: c => ` ${c.label}: ${c.raw}` } }
        },
        ...(currentChartType==='doughnut' ? {cutout:'50%'} : {
          scales:{ r:{ ticks:{ color:'#64748b', backdropColor:'transparent', font:{size:10} }, grid:{ color:'rgba(255,255,255,0.08)' }, pointLabels:{ color:'#94a3b8', font:{size:10} } } }
        })
      }
    });
  } else if(currentChartType === 'bar_h') {
    // Horizontal bar
    chartCompare = new Chart(ctx, {
      type:'bar',
      data:{ labels: shortLabels, datasets:[
        { label:'Equipe 1', data:d1, backgroundColor:'rgba(167,139,250,0.8)', borderRadius:4 },
        { label:'Equipe 2', data:d2, backgroundColor:'rgba(245,158,11,0.8)', borderRadius:4 }
      ]},
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
        animation:{ ...chartAnim, delay:(ctx)=>ctx.dataIndex*50 },
        plugins:{ legend: legendOpts },
        scales:{ x:{ ticks:{color:'#64748b',font:{size:10}}, grid:{color:'rgba(255,255,255,0.05)'} }, y:{ ticks:{color:'#64748b',font:{family:'IBM Plex Mono',size:10}}, grid:{color:'rgba(255,255,255,0.04)'} } }
      }
    });
  } else if(currentChartType === 'line') {
    chartCompare = new Chart(ctx, {
      type:'line',
      data:{ labels: shortLabels, datasets:[
        { label:'Equipe 1', data:d1, borderColor:'#a78bfa', backgroundColor:'rgba(167,139,250,0.15)', pointBackgroundColor:'#a78bfa', tension:0.35, fill:true, pointRadius:5, pointHoverRadius:7 },
        { label:'Equipe 2', data:d2, borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.12)', pointBackgroundColor:'#f59e0b', tension:0.35, fill:true, pointRadius:5, pointHoverRadius:7 }
      ]},
      options:{ responsive:true, maintainAspectRatio:false, animation:chartAnim, plugins:{ legend: legendOpts }, scales: scaleOpts }
    });
  } else {
    // Default: vertical bar (colunas)
    chartCompare = new Chart(ctx, {
      type:'bar',
      data:{ labels: shortLabels, datasets:[
        { label:'Equipe 1', data:d1, backgroundColor:'rgba(167,139,250,0.8)', borderRadius:5 },
        { label:'Equipe 2', data:d2, backgroundColor:'rgba(245,158,11,0.8)', borderRadius:5 }
      ]},
      options:{ responsive:true, maintainAspectRatio:false, animation:{ ...chartAnim, delay:(ctx)=>ctx.dataIndex*60 }, plugins:{ legend: legendOpts }, scales: scaleOpts }
    });
  }
}

// ══════════════════════════════════════
// RELATÓRIO DIÁRIO
// ══════════════════════════════════════
function renderRelDiario() {
  const d = document.getElementById('rel-dia').value;
  const f = orders.filter(o => o.date===d);
  const el = document.getElementById('rel-diario-content');
  if(!f.length) { el.innerHTML='<div class="empty">Nenhuma OS nesta data.</div>'; return; }
  const totals = getTotals(f);
  const keys = Object.keys(totals).filter(k=>totals[k].e1+totals[k].e2>0);
  let grand=0,t1s=0,t2s=0;
  keys.forEach(k=>{grand+=totals[k].e1+totals[k].e2;t1s+=totals[k].e1;t2s+=totals[k].e2;});
  const e1os=f.filter(o=>o.team==='equipe1'), e2os=f.filter(o=>o.team==='equipe2');

  el.innerHTML = `
  <div class="kpi-row" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px;">
    <div class="kpi" style="--kc:#3b82f6"><div class="kpi-val">${f.length}</div><div class="kpi-lbl">Total OS</div></div>
    <div class="kpi" style="--kc:#a78bfa"><div class="kpi-val">${e1os.length}</div><div class="kpi-lbl">Equipe 1</div></div>
    <div class="kpi" style="--kc:#f59e0b"><div class="kpi-val">${e2os.length}</div><div class="kpi-lbl">Equipe 2</div></div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">Materiais do dia — ${fmtDate(d)}</div>
      <div id="reldiario-tbl-pro"></div>
    </div>
    <div class="card">
      <div class="card-title">OS do dia</div>
      ${f.map((o, idx) => buildOSItemHtml(o, idx, { anim: false })).join('')}
    </div>
  </div>`;
  // ProTable após innerHTML
  ProTable({
    containerId:'reldiario-tbl-pro',
    pageSize:10,
    exportName:`relatorio-diario-${d}`,
    defaultSort:3,
    columns:[
      { key:'material', label:'Material', sortType:'str' },
      { key:'e1', label:'E1', align:'r', sortType:'num' },
      { key:'e2', label:'E2', align:'r', sortType:'num' },
      { key:'total', label:'Total', align:'r', sortType:'num', render:r=>`<span style="color:var(--accent2);font-family:var(--mono)">${r.total}</span>` },
    ],
    data: keys.map(k=>({ material:k, e1:totals[k].e1, e2:totals[k].e2, total:totals[k].e1+totals[k].e2 })),
  });
}

// ══════════════════════════════════════
// RELATÓRIO MENSAL
// ══════════════════════════════════════
function populateMeses() {
  const sel = document.getElementById('rel-mes');
  const meses = [...new Set(orders.map(o => o.date.substring(0,7)))].sort().reverse();
  const cur = sel.value;
  sel.innerHTML = '<option value="">Selecione o mês</option>' + meses.map(m => {
    const [y,mo] = m.split('-');
    const nome = new Date(+y,+mo-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    return `<option value="${m}" ${m===cur?'selected':''}>${nome.charAt(0).toUpperCase()+nome.slice(1)}</option>`;
  }).join('');
}

function renderRelMensal() {
  const mes = document.getElementById('rel-mes').value;
  const el = document.getElementById('rel-mensal-content');
  if(!mes) { el.innerHTML='<div class="empty">Selecione um mês acima.</div>'; return; }
  const f = orders.filter(o => o.date.startsWith(mes));
  if(!f.length) { el.innerHTML='<div class="empty">Nenhuma OS neste mês.</div>'; return; }
  const totals = getTotals(f);
  const keys = Object.keys(totals).filter(k=>totals[k].e1+totals[k].e2>0);
  let grand=0,t1s=0,t2s=0;
  keys.forEach(k=>{grand+=totals[k].e1+totals[k].e2;t1s+=totals[k].e1;t2s+=totals[k].e2;});

  // Group by day
  const byDay = {};
  f.forEach(o => {
    if(!byDay[o.date]) byDay[o.date] = [];
    byDay[o.date].push(o);
  });

  el.innerHTML = `
  <div class="kpi-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px;">
    <div class="kpi" style="--kc:#3b82f6"><div class="kpi-val">${f.length}</div><div class="kpi-lbl">Total OS</div></div>
    <div class="kpi" style="--kc:#22d3ee"><div class="kpi-val">${grand}</div><div class="kpi-lbl">Total Materiais</div></div>
    <div class="kpi" style="--kc:#a78bfa"><div class="kpi-val">${f.filter(o=>o.team==='equipe1').length}</div><div class="kpi-lbl">Equipe 1</div></div>
    <div class="kpi" style="--kc:#f59e0b"><div class="kpi-val">${f.filter(o=>o.team==='equipe2').length}</div><div class="kpi-lbl">Equipe 2</div></div>
  </div>
  <div class="grid-2 mb14">
    <div class="card">
      <div class="card-title">Consolidado de materiais</div>
      <div id="relmensal-tbl-pro"></div>
    </div>
    <div class="card">
      <div class="card-title">Por dia</div>
      <div id="relmensal-byday-pro"></div>
    </div>
  </div>`;
  // ProTable — consolidado
  ProTable({
    containerId:'relmensal-tbl-pro',
    pageSize:12,
    exportName:`relatorio-mensal-${mes}`,
    defaultSort:3,
    columns:[
      { key:'material', label:'Material', sortType:'str' },
      { key:'e1', label:'E1', align:'r', sortType:'num' },
      { key:'e2', label:'E2', align:'r', sortType:'num' },
      { key:'total', label:'Total', align:'r', sortType:'num', render:r=>`<span style="color:var(--accent2);font-family:var(--mono)">${r.total}</span>` },
    ],
    data: keys.map(k=>({ material:k, e1:totals[k].e1, e2:totals[k].e2, total:totals[k].e1+totals[k].e2 })),
  });
  // ProTable — por dia
  const bydayRows = Object.entries(byDay).sort((a,b)=>a[0]>b[0]?-1:1).map(([dd,os])=>{
    const dt = getTotals(os);
    const keys2 = Object.keys(dt).filter(k=>dt[k].e1+dt[k].e2>0);
    const tot = keys2.reduce((s,k)=>s+dt[k].e1+dt[k].e2,0);
    const e1c = os.filter(o=>o.team==='equipe1').length;
    const e2c = os.filter(o=>o.team==='equipe2').length;
    return { data:dd, dataFmt:fmtDate(dd), os:os.length, e1:e1c, e2:e2c, materiais:tot };
  });
  ProTable({
    containerId:'relmensal-byday-pro',
    pageSize:15,
    exportName:`por-dia-${mes}`,
    defaultSort:0,
    columns:[
      { key:'dataFmt', label:'Data', sortType:'str', render:r=>`<span style="font-family:var(--mono);color:var(--accent);font-size:11px">${r.dataFmt}</span>` },
      { key:'os', label:'OS', align:'r', sortType:'num' },
      { key:'e1', label:'E1', align:'r', sortType:'num' },
      { key:'e2', label:'E2', align:'r', sortType:'num' },
      { key:'materiais', label:'Materiais', align:'r', sortType:'num', render:r=>`<span style="color:var(--accent2);font-family:var(--mono)">${r.materiais}</span>` },
    ],
    data: bydayRows,
  });
}

// ══════════════════════════════════════
// HISTÓRICO
// ══════════════════════════════════════
function renderHistorico() {
  const el = document.getElementById('hist-list');
  if(!orders.length) { el.innerHTML='<div class="empty">Nenhuma OS registrada.</div>'; return; }
  el.innerHTML = [...orders].reverse().map((o, idx) => buildOSItemHtml(o, idx, { anim: false })).join('');
}

function limparTudo() {
  if (useSupabase() && !DB.isMaster()) {
    appAlert('Apenas o usuário <strong>master</strong> pode apagar todos os dados.', 'warn', 'Sem permissão');
    return;
  }
  appConfirm(
    'Esta ação apagará <strong>todas as OS e entregas</strong> permanentemente.<br>Não poderá ser desfeita.',
    'Apagar todos os dados?',
    { danger: true, confirmLabel: 'Apagar tudo', cancelLabel: 'Cancelar' }
  ).then(async r => {
    if(r !== 'confirm') return;
    try {
      await deleteAllOrdersDB();
      entregas = [];
      if (!useSupabase()) try { localStorage.removeItem('os_v3_entregas'); } catch(e){}
      renderHistorico();
      renderDashboard();
      renderOrdens();
      renderControle();
      appAlert('Todos os dados foram apagados.', 'success', 'Dados apagados');
    } catch (e) {
      appAlert(e.message || 'Erro ao apagar dados.', 'error', 'Erro');
    }
  });
}

// ══════════════════════════════════════
// CONFIGURAÇÕES / KEYWORDS
// ══════════════════════════════════════
function renderConfig() {
  renderKwList();
  renderEquipCatalogList();
}

function renderEquipCatalogList() {
  const el = document.getElementById('equip-catalog-list');
  if (!el) return;
  const hideDel = useSupabase() && !DB.isMaster();
  el.innerHTML = equipamentosCatalogo.map((k, i) => `<div class="kw-item">
    <span class="kw-name">${escapeHtml(k)}</span>
    <button class="kw-del${hideDel ? ' hidden' : ''}" onclick="removeEquipCatalog(${i})" title="${hideDel ? 'Apenas master pode remover' : 'Remover'}">✕</button>
  </div>`).join('');
}

async function addEquipCatalog() {
  const v = document.getElementById('equip-catalog-input').value.trim().toUpperCase();
  if (!v || equipamentosCatalogo.includes(v)) return;
  try {
    if (useSupabase()) await DB.insertEquipamento(v);
    equipamentosCatalogo.push(v);
    saveEquipamentosCatalogo();
    renderEquipCatalogList();
    document.getElementById('equip-catalog-input').value = '';
  } catch (e) {
    appAlert(e.message || 'Erro ao adicionar equipamento.', 'error', 'Erro');
  }
}

async function removeEquipCatalog(i) {
  if (useSupabase() && !DB.isMaster()) {
    appAlert('Apenas o usuário <strong>master</strong> pode remover equipamentos da lista.', 'warn', 'Sem permissão');
    return;
  }
  const name = equipamentosCatalogo[i];
  try {
    if (useSupabase()) await DB.deleteEquipamentoByName(name);
    equipamentosCatalogo.splice(i, 1);
    saveEquipamentosCatalogo();
    renderEquipCatalogList();
  } catch (e) {
    appAlert(e.message || 'Erro ao remover equipamento.', 'error', 'Erro');
  }
}

function renderKwList() {
  const el = document.getElementById('kw-list');
  const hideDel = useSupabase() && !DB.isMaster();
  el.innerHTML = keywords.map((k,i) => `<div class="kw-item">
    <span class="kw-name">${k}</span>
    <button class="kw-del${hideDel ? ' hidden' : ''}" onclick="removeKw(${i})" title="${hideDel ? 'Apenas master pode remover' : 'Remover'}">✕</button>
  </div>`).join('');
  // update ins-tags
  document.getElementById('ins-tags').innerHTML = keywords.map(k=>`<span class="tag">${k}</span>`).join('');
}

async function addKw() {
  const v = document.getElementById('kw-input').value.trim().toUpperCase();
  if(!v || keywords.includes(v)) return;
  try {
    if (useSupabase()) await DB.insertKeyword(v);
    keywords.push(v);
    saveKeywords();
    renderKwList();
    document.getElementById('kw-input').value = '';
  } catch (e) {
    appAlert(e.message || 'Erro ao adicionar palavra-chave.', 'error', 'Erro');
  }
}

async function removeKw(i) {
  if (useSupabase() && !DB.isMaster()) {
    appAlert('Apenas o usuário <strong>master</strong> pode remover itens da lista.', 'warn', 'Sem permissão');
    return;
  }
  const name = keywords[i];
  try {
    if (useSupabase()) await DB.deleteKeywordByName(name);
    keywords.splice(i, 1);
    saveKeywords();
    renderKwList();
  } catch (e) {
    appAlert(e.message || 'Erro ao remover palavra-chave.', 'error', 'Erro');
  }
}

// ══════════════════════════════════════
// EXPORTAÇÃO
// ══════════════════════════════════════
function buildCSV(data) {
  const totals = getTotals(data);
  const keys = Object.keys(totals).filter(k=>totals[k].e1+totals[k].e2>0);
  const rows = [['Material','Equipe 1','Equipe 2','Total']];
  keys.forEach(k => rows.push([k, totals[k].e1, totals[k].e2, totals[k].e1+totals[k].e2]));
  return rows.map(r=>r.join(',')).join('\n');
}

function downloadCSV(content, filename) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = filename; a.click();
}

function buildPrintHTML(title, content) {
  return `<html><head><meta charset="UTF-8"><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;color:#111;padding:20px;}h1{color:#e60000;font-size:18px;margin-bottom:4px;}
  .sub{color:#666;font-size:12px;margin-bottom:18px;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{background:#f0f0f0;padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;}
  td{padding:7px 12px;border-bottom:1px solid #eee;}
  .total{font-weight:bold;background:#f9f9f9;}.brand{font-size:11px;color:#888;margin-top:24px;border-top:1px solid #ddd;padding-top:8px;}
  </style></head><body>${content}<div class="brand">Inforwnet Telecom — OS Manager v3.0 — Gerado em ${new Date().toLocaleString('pt-BR')}</div></body></html>`;
}

function exportarRelDiarioPDF() {
  const d = document.getElementById('rel-dia').value;
  const f = orders.filter(o=>o.date===d);
  if(!f.length) { appAlert('Sem dados para a data selecionada.', 'warn', 'Sem dados'); return; }
  const totals = getTotals(f); const keys = Object.keys(totals).filter(k=>totals[k].e1+totals[k].e2>0);
  let t1s=0,t2s=0,grand=0; keys.forEach(k=>{t1s+=totals[k].e1;t2s+=totals[k].e2;grand+=totals[k].e1+totals[k].e2;});
  const rows = keys.map(k=>`<tr><td>${k}</td><td>${totals[k].e1}</td><td>${totals[k].e2}</td><td>${totals[k].e1+totals[k].e2}</td></tr>`).join('');
  const html = buildPrintHTML(`Relatório Diário — ${fmtDate(d)}`,
    `<h1>Relatório Diário — Inforwnet Telecom</h1><div class="sub">${fmtDateLong(d)} &nbsp;|&nbsp; ${f.length} OS processadas</div>
    <table><thead><tr><th>Material</th><th>Equipe 1</th><th>Equipe 2</th><th>Total</th></tr></thead><tbody>${rows}
    <tr class="total"><td>TOTAL</td><td>${t1s}</td><td>${t2s}</td><td>${grand}</td></tr></tbody></table>`);
  const w = window.open('','_blank'); w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400);
}

function exportarRelDiarioExcel() {
  const d = document.getElementById('rel-dia').value;
  const f = orders.filter(o=>o.date===d);
  if(!f.length) { appAlert('Sem dados para a data selecionada.', 'warn', 'Sem dados'); return; }
  downloadCSV(buildCSV(f), `relatorio_diario_${d}.csv`);
}

function exportarRelMensalPDF() {
  const mes = document.getElementById('rel-mes').value;
  if(!mes) { appAlert('Selecione um mês antes de continuar.', 'warn', 'Mês não selecionado'); return; }
  const f = orders.filter(o=>o.date.startsWith(mes));
  if(!f.length) { appAlert('Sem dados para o mês selecionado.', 'warn', 'Sem dados'); return; }
  const totals = getTotals(f); const keys = Object.keys(totals).filter(k=>totals[k].e1+totals[k].e2>0);
  let t1s=0,t2s=0,grand=0; keys.forEach(k=>{t1s+=totals[k].e1;t2s+=totals[k].e2;grand+=totals[k].e1+totals[k].e2;});
  const rows = keys.map(k=>`<tr><td>${k}</td><td>${totals[k].e1}</td><td>${totals[k].e2}</td><td>${totals[k].e1+totals[k].e2}</td></tr>`).join('');
  const [y,mo] = mes.split('-');
  const nomeM = new Date(+y,+mo-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const html = buildPrintHTML(`Relatório Mensal — ${nomeM}`,
    `<h1>Relatório Mensal — Inforwnet Telecom</h1><div class="sub">${nomeM.charAt(0).toUpperCase()+nomeM.slice(1)} &nbsp;|&nbsp; ${f.length} OS processadas</div>
    <table><thead><tr><th>Material</th><th>Equipe 1</th><th>Equipe 2</th><th>Total</th></tr></thead><tbody>${rows}
    <tr class="total"><td>TOTAL</td><td>${t1s}</td><td>${t2s}</td><td>${grand}</td></tr></tbody></table>`);
  const w = window.open('','_blank'); w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400);
}

function exportarRelMensalExcel() {
  const mes = document.getElementById('rel-mes').value;
  if(!mes) { appAlert('Selecione um mês antes de continuar.', 'warn', 'Mês não selecionado'); return; }
  const f = orders.filter(o=>o.date.startsWith(mes));
  if(!f.length) { appAlert('Nenhum dado encontrado.', 'warn', 'Sem dados'); return; }
  downloadCSV(buildCSV(f), `relatorio_mensal_${mes}.csv`);
}

function exportarTudoPDF() {
  if(!orders.length) { appAlert('Nenhum dado encontrado.', 'warn', 'Sem dados'); return; }
  const totals = getTotals(orders); const keys = Object.keys(totals).filter(k=>totals[k].e1+totals[k].e2>0);
  let t1s=0,t2s=0,grand=0; keys.forEach(k=>{t1s+=totals[k].e1;t2s+=totals[k].e2;grand+=totals[k].e1+totals[k].e2;});
  const rows = keys.map(k=>`<tr><td>${k}</td><td>${totals[k].e1}</td><td>${totals[k].e2}</td><td>${totals[k].e1+totals[k].e2}</td></tr>`).join('');
  const html = buildPrintHTML('Relatório Geral — Inforwnet Telecom',
    `<h1>Relatório Geral — Inforwnet Telecom</h1><div class="sub">Todos os dados &nbsp;|&nbsp; ${orders.length} OS processadas</div>
    <table><thead><tr><th>Material</th><th>Equipe 1</th><th>Equipe 2</th><th>Total</th></tr></thead><tbody>${rows}
    <tr class="total"><td>TOTAL</td><td>${t1s}</td><td>${t2s}</td><td>${grand}</td></tr></tbody></table>`);
  const w = window.open('','_blank'); w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400);
}

function exportarTudoExcel() {
  if(!orders.length) { appAlert('Nenhum dado encontrado.', 'warn', 'Sem dados'); return; }
  downloadCSV(buildCSV(orders), 'inforwnet_relatorio_geral.csv');
}

function exportarJSON() {
  const data = JSON.stringify({ orders, keywords, equipamentos: equipamentosCatalogo }, null, 2);
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
  a.download = `inforwnet_backup_${todayStr()}.json`; a.click();
}

function importarJSON(input) {
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if(data.orders) orders = data.orders;
      if(data.keywords) keywords = data.keywords;
      if(data.equipamentos) equipamentosCatalogo = data.equipamentos;
      save(); renderKwList(); renderEquipCatalogList();
      appAlert('Backup importado com sucesso!<br><strong>' + orders.length + ' OS carregadas.</strong>', 'success', 'Importação concluída');
    } catch(err) { appAlert('O arquivo selecionado é inválido ou está corrompido.', 'error', 'Erro na importação'); }
  };
  reader.readAsText(file);
}

// ══════════════════════════════════════
// CONTROLE DIÁRIO DE MATERIAIS
// ══════════════════════════════════════
let entregas = [];
try { entregas = JSON.parse(localStorage.getItem('os_v3_entregas') || '[]'); } catch(e){}

function saveEntregas() {
  try { localStorage.setItem('os_v3_entregas', JSON.stringify(entregas)); } catch(e){}
}

async function saveEntregaDB(entrega) {
  if (useSupabase()) return;
  saveEntregas();
}

async function removerEntregaDB(id) {
  const item = entregas.find(e => e.id === id);
  if (item && !canEditRecord(item)) {
    appAlert('Você só pode apagar entregas que você registrou.', 'warn', 'Sem permissão');
    return false;
  }
  if (useSupabase()) {
    try {
      await DB.deleteEntrega(id);
    } catch (e) {
      appAlert(e.message || 'Erro ao apagar entrega.', 'error', 'Erro');
      return false;
    }
  }
  entregas = entregas.filter(e => e.id !== id);
  if (!useSupabase()) saveEntregas();
  return true;
}

function initControle() {
  const el = document.getElementById('ctrl-data');
  if(!el.value) el.value = todayStr();
  // Preenche select com palavras-chave + equipamentos do catálogo
  const sel = document.getElementById('ctrl-material');
  if(sel) {
    const todas = [...keywords, ...equipamentosCatalogo.filter(e => !keywords.includes(e))];
    const cur = sel.value;
    sel.innerHTML = '<option value="">Selecione o material...</option>'
      + todas.map(k => `<option value="${k}">${k}</option>`).join('');
    if(cur && todas.includes(cur)) sel.value = cur;
  }
}

async function adicionarEntrega() {
  const data = document.getElementById('ctrl-data').value || todayStr();
  const equipe = document.getElementById('ctrl-equipe').value;
  const material = document.getElementById('ctrl-material').value;
  const qtd = parseInt(document.getElementById('ctrl-qtd').value);
  const obs = document.getElementById('ctrl-obs').value.trim();
  const alertEl = document.getElementById('ctrl-alert');

  if(!material) { alertEl.className='alert err'; alertEl.textContent='Selecione o material.'; return; }
  if(!qtd || qtd < 1) { alertEl.className='alert err'; alertEl.textContent='Informe uma quantidade válida (mínimo 1).'; return; }

  const novaEntrega = { id: Date.now(), data, equipe, material, qtd, obs, hora: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) };
  if (useSupabase()) {
    try {
      const saved = await DB.insertEntrega(novaEntrega);
      entregas.push(saved);
    } catch (e) {
      alertEl.className = 'alert err';
      alertEl.textContent = e.message || 'Erro ao registrar entrega.';
      return;
    }
  } else {
    entregas.push(novaEntrega);
    await saveEntregaDB(novaEntrega);
  }

  alertEl.className='alert ok';
  alertEl.textContent=`✓ Entrega registrada: ${qtd}x ${material} → ${equipe==='equipe1'?'Equipe 1':'Equipe 2'}`;
  document.getElementById('ctrl-qtd').value = '';
  document.getElementById('ctrl-obs').value = '';
  const prevEl = document.getElementById('ctrl-preview-saldo');
  if(prevEl) prevEl.style.display='none';
  renderControle();
}

async function removerEntrega(id) {
  const ok = await removerEntregaDB(id);
  if (ok) renderControle();
}

function calcSaldoDiario(data) {
  const do_dia = entregas.filter(e => e.data === data);
  const entregue = {};
  do_dia.forEach(e => {
    if(!entregue[e.material]) entregue[e.material] = {e1:0, e2:0};
    if(e.equipe==='equipe1') entregue[e.material].e1 += e.qtd;
    else entregue[e.material].e2 += e.qtd;
  });
  const osDodia = orders.filter(o => o.date === data);
  const utilizadoTotals = getTotals(osDodia);
  const allMats = [...new Set([...Object.keys(entregue), ...Object.keys(utilizadoTotals).filter(k=>utilizadoTotals[k].e1+utilizadoTotals[k].e2>0)])];

  return { entregue, utilizadoTotals, allMats, do_dia, osDodia };
}

function atualizarPreviewSaldo() {
  const data = document.getElementById('ctrl-data')?.value || todayStr();
  const equipe = document.getElementById('ctrl-equipe').value;
  const material = document.getElementById('ctrl-material').value;
  const qtd = parseInt(document.getElementById('ctrl-qtd').value) || 0;
  const previewEl = document.getElementById('ctrl-preview-saldo');
  if(!material || qtd < 1) { previewEl.style.display='none'; return; }
  const { entregue, utilizadoTotals } = calcSaldoDiario(data);
  const eKey = equipe==='equipe1'?'e1':'e2';
  const atualEnt = entregue[material]?.[eKey]||0;
  const atualUtil = utilizadoTotals[material]?.[eKey]||0;
  const saldoAtual = atualEnt - atualUtil;
  const novoSaldo = saldoAtual + qtd;
  const eq = equipe==='equipe1'?'Equipe 1':'Equipe 2';
  const cor = novoSaldo >= 0 ? 'var(--success)' : 'var(--danger)';
  previewEl.style.display='block';
  previewEl.innerHTML = `
    <div style="margin-bottom:4px;color:var(--accent2)">Impacto em <strong>${material}</strong> — ${eq}</div>
    <div style="display:flex;gap:18px;flex-wrap:wrap;">
      <span>Entregue atual: <strong style="color:var(--text)">${atualEnt}</strong></span>
      <span>+ Novo recebimento: <strong style="color:var(--success)">+${qtd}</strong></span>
      <span>Utilizado: <strong style="color:var(--warn)">${atualUtil}</strong></span>
      <span>Saldo após registro: <strong style="color:${cor}">${novoSaldo >= 0 ? '+'+novoSaldo : novoSaldo}</strong></span>
    </div>`;
}

function renderEstoquePorEquipe(data) {
  const { entregue, utilizadoTotals, allMats } = calcSaldoDiario(data);
  const saldoColor = (v) => v > 0 ? 'var(--success)' : v < 0 ? 'var(--danger)' : 'var(--muted)';
  const saldoSign = (v) => v > 0 ? '+'+v : String(v);

  ['e1','e2'].forEach((eq, idx) => {
    const label = eq==='e1'?'equipe1':'equipe2';
    const innerEl = document.getElementById(`ctrl-estoque-${eq}-inner`);
    const statusEl = document.getElementById(`ctrl-e${idx+1}-status`);

    const matsEq = allMats.filter(m => (entregue[m]?.[eq]||0) > 0 || (utilizadoTotals[m]?.[eq]||0) > 0);
    if(!matsEq.length) {
      innerEl.innerHTML = `<div class="empty" style="padding:16px 0;">Nenhuma entrega registrada para ${eq==='e1'?'Equipe 1':'Equipe 2'}.</div>`;
      if(statusEl) statusEl.innerHTML='';
      return;
    }

    let temDeficit = false;
    const rows = matsEq.map((m, i) => {
      const ent = entregue[m]?.[eq]||0;
      const util = utilizadoTotals[m]?.[eq]||0;
      const saldo = ent - util;
      if(saldo < 0) temDeficit = true;
      const pct = ent > 0 ? Math.min(100, Math.round(util/ent*100)) : 0;
      const barColor = pct >= 100 ? 'var(--danger)' : pct >= 70 ? 'var(--warn)' : 'var(--success)';
      return `
        <div style="padding:9px 0;border-bottom:1px solid var(--border);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
            <span style="font-size:11px;color:var(--text);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%"><span class="dot" style="background:${COLORS[i%COLORS.length]}"></span>${m}</span>
            <span style="font-family:var(--sans);font-size:13px;font-weight:600;color:${saldoColor(saldo)};flex-shrink:0;-webkit-font-smoothing:antialiased;letter-spacing:0.01em;">${saldoSign(saldo)} restante</span>
          </div>
          <div style="display:flex;gap:14px;font-size:10px;font-family:var(--mono);color:var(--muted);margin-bottom:6px;">
            <span>Recebeu: <strong style="color:var(--text)">${ent}</strong></span>
            <span>Usou: <strong style="color:var(--warn)">${util}</strong></span>
          </div>
          <div style="background:rgba(255,255,255,0.06);border-radius:4px;height:6px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px;transition:width 0.6s ease;"></div>
          </div>
          <div style="font-size:9px;color:var(--muted);margin-top:3px;text-align:right;font-family:var(--mono)">${pct}% consumido</div>
        </div>`;
    }).join('');

    innerEl.innerHTML = rows;
    if(statusEl) statusEl.innerHTML = temDeficit
      ? '<span class="badge badge-red">⚠ Déficit</span>'
      : '<span class="badge badge-green">✓ OK</span>';
  });
}

function renderSaldoRapido(data) {
  const { entregue, utilizadoTotals, allMats } = calcSaldoDiario(data);
  const wrapEl = document.getElementById('ctrl-saldo-rapido');
  const innerEl = document.getElementById('ctrl-saldo-rapido-inner');
  if(!allMats.length) { wrapEl.style.display='none'; return; }
  wrapEl.style.display='block';

  const chips = allMats.map((m, i) => {
    const sE1 = (entregue[m]?.e1||0) - (utilizadoTotals[m]?.e1||0);
    const sE2 = (entregue[m]?.e2||0) - (utilizadoTotals[m]?.e2||0);
    const temEntregaE1 = (entregue[m]?.e1||0) > 0;
    const temEntregaE2 = (entregue[m]?.e2||0) > 0;
    let partes = [];
    if(temEntregaE1) partes.push(`<span style="color:${sE1<0?'var(--danger)':sE1===0?'var(--warn)':'var(--success)'}">E1: ${sE1>=0?'+':''}${sE1}</span>`);
    if(temEntregaE2) partes.push(`<span style="color:${sE2<0?'var(--danger)':sE2===0?'var(--warn)':'var(--success)'}">E2: ${sE2>=0?'+':''}${sE2}</span>`);
    if(!partes.length) return '';
    const qualquer = (temEntregaE1&&sE1<0)||(temEntregaE2&&sE2<0);
    const borderColor = qualquer ? 'rgba(248,113,113,0.3)' : 'rgba(34,197,94,0.2)';
    return `<div style="background:var(--bg4);border:1px solid ${borderColor};border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:10px;">
      <div style="color:var(--muted2);margin-bottom:4px;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;" title="${m}"><span class="dot" style="background:${COLORS[i%COLORS.length]};width:6px;height:6px;"></span>${m}</div>
      <div style="display:flex;gap:10px;">${partes.join('')}</div>
    </div>`;
  }).filter(Boolean).join('');

  innerEl.innerHTML = chips || '<span style="font-size:11px;color:var(--muted);">Nenhum material com entrega registrada.</span>';
}

function renderControle() {
  const data = document.getElementById('ctrl-data')?.value || todayStr();
  initControle();
  const do_dia = entregas.filter(e => e.data === data);

  // Badge de contagem de entregas
  const badgeEl = document.getElementById('ctrl-entregas-badge');
  if(badgeEl) badgeEl.textContent = do_dia.length ? `${do_dia.length} registro${do_dia.length>1?'s':''}` : '';

  // Lista de entregas
  const listaEl = document.getElementById('ctrl-entregas-list');
  if(!do_dia.length) {
    listaEl.innerHTML = '<div class="empty">Nenhuma entrega registrada nesta data.</div>';
  } else {
    listaEl.innerHTML = [...do_dia].reverse().map(e => `
      <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg4);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;">
        <span style="font-family:var(--mono);font-size:10px;color:var(--muted);flex-shrink:0;">${e.hora}</span>
        <span class="badge ${e.equipe==='equipe1'?'badge-blue':'badge-warn'}" style="flex-shrink:0;">${e.equipe==='equipe1'?'E1':'E2'}</span>
        <span style="font-size:12px;flex:1;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.material}</span>
        <span style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--success);flex-shrink:0;">+${e.qtd}</span>
        ${e.obs ? `<span style="font-size:10px;color:var(--muted);flex-shrink:0;">${e.obs}</span>` : ''}
        ${userBadge(e)}
        ${canEditRecord(e) ? `<button type="button" class="btn-del-record" onclick="removerEntrega(${e.id})" title="Apagar">✕</button>` : ''}
      </div>`).join('');
  }

  // Estoque por equipe
  renderEstoquePorEquipe(data);

  // Comparativo detalhado
  const { entregue, utilizadoTotals, allMats } = calcSaldoDiario(data);
  const compEl = document.getElementById('ctrl-comparativo');

  if(!allMats.length) {
    compEl.innerHTML='<div class="empty">Sem dados de entrega ou OS para esta data.</div>';
    return;
  }

  let totEntE1=0,totEntE2=0,totUtilE1=0,totUtilE2=0;
  allMats.forEach(m=>{
    totEntE1 += entregue[m]?.e1||0; totEntE2 += entregue[m]?.e2||0;
    totUtilE1 += utilizadoTotals[m]?.e1||0; totUtilE2 += utilizadoTotals[m]?.e2||0;
  });
  const saldoE1 = totEntE1 - totUtilE1;
  const saldoE2 = totEntE2 - totUtilE2;

  const saldoColor = (v) => v > 0 ? 'var(--success)' : v < 0 ? 'var(--danger)' : 'var(--muted)';
  const saldoSign = (v) => v > 0 ? '+'+v : String(v);

  compEl.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="tbl" style="table-layout:fixed;">
        <thead><tr>
          <th style="width:22%">Material</th>
          <th class="r" style="width:10%">Rec. E1</th>
          <th class="r" style="width:10%">Usou E1</th>
          <th class="r" style="width:10%;color:#a78bfa">Sobrou E1</th>
          <th class="r" style="width:10%">Rec. E2</th>
          <th class="r" style="width:10%">Usou E2</th>
          <th class="r" style="width:10%;color:#f59e0b">Sobrou E2</th>
          <th class="r" style="width:18%">Situação</th>
        </tr></thead>
        <tbody>
          ${allMats.map((m,i) => {
            const entE1 = entregue[m]?.e1||0, entE2 = entregue[m]?.e2||0;
            const utE1 = utilizadoTotals[m]?.e1||0, utE2 = utilizadoTotals[m]?.e2||0;
            const sE1 = entE1 - utE1, sE2 = entE2 - utE2;
            const semEntregaE1 = entE1===0, semEntregaE2 = entE2===0;
            const deficitE1 = sE1 < 0, deficitE2 = sE2 < 0;
            const ok = !deficitE1 && !deficitE2;
            const parcial = (deficitE1 || deficitE2) && !(deficitE1 && deficitE2);
            const badge = ok
              ? '<span class="badge badge-green">✓ OK</span>'
              : parcial
              ? '<span class="badge badge-warn">⚠ Parcial</span>'
              : '<span class="badge badge-red">✕ Déficit</span>';
            return `<tr>
              <td><span class="dot" style="background:${COLORS[i%COLORS.length]}"></span>${m}</td>
              <td class="r">${entE1||'—'}</td>
              <td class="r">${utE1||'—'}</td>
              <td class="r" style="font-weight:600;color:${semEntregaE1?'var(--muted)':saldoColor(sE1)};-webkit-font-smoothing:antialiased;">${semEntregaE1?'—':saldoSign(sE1)}</td>
              <td class="r">${entE2||'—'}</td>
              <td class="r">${utE2||'—'}</td>
              <td class="r" style="font-weight:600;color:${semEntregaE2?'var(--muted)':saldoColor(sE2)};-webkit-font-smoothing:antialiased;">${semEntregaE2?'—':saldoSign(sE2)}</td>
              <td class="r">${badge}</td>
            </tr>`;
          }).join('')}
          <tr class="total-row">
            <td>TOTAL</td>
            <td class="r">${totEntE1}</td>
            <td class="r">${totUtilE1}</td>
            <td class="r" style="color:${saldoColor(saldoE1)};font-weight:700;-webkit-font-smoothing:antialiased;">${saldoSign(saldoE1)}</td>
            <td class="r">${totEntE2}</td>
            <td class="r">${totUtilE2}</td>
            <td class="r" style="color:${saldoColor(saldoE2)};font-weight:700;-webkit-font-smoothing:antialiased;">${saldoSign(saldoE2)}</td>
            <td class="r"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <span class="badge badge-green">✓ OK = Entregue ≥ Utilizado</span>
      <span class="badge badge-warn">⚠ Parcial = Uma equipe com déficit</span>
      <span class="badge badge-red">✕ Déficit = Mais usado do que recebeu</span>
    </div>`;
}

function htmlEscape(v) {
  return String(v ?? '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}

function getComprovanteDevolucao(data, equipe) {
  const { entregue, utilizadoTotals, allMats } = calcSaldoDiario(data);
  const eKey = equipe === 'equipe1' ? 'e1' : 'e2';
  const rows = allMats
    .map(material => {
      const recebeu = entregue[material]?.[eKey] || 0;
      const usou = utilizadoTotals[material]?.[eKey] || 0;
      const saldo = recebeu - usou;
      return { material, recebeu, usou, saldo };
    })
    .filter(r => r.recebeu > 0 || r.usou > 0)
    .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo) || a.material.localeCompare(b.material));

  return {
    rows,
    devolver: rows.filter(r => r.saldo > 0),
    divergencias: rows.filter(r => r.saldo < 0),
    zerados: rows.filter(r => r.saldo === 0 && (r.recebeu > 0 || r.usou > 0))
  };
}

function exportarComprovanteDevolucao(equipe) {
  const data = document.getElementById('ctrl-data')?.value || todayStr();
  const label = equipe === 'equipe1' ? 'Equipe 1' : 'Equipe 2';
  const { rows, devolver, divergencias, zerados } = getComprovanteDevolucao(data, equipe);

  if(!rows.length) {
    appAlert(`Sem entrega ou uso registrado para <strong>${label}</strong> nesta data.`, 'warn', 'Sem dados');
    return;
  }

  const totalRecebido = rows.reduce((s, r) => s + r.recebeu, 0);
  const totalUsado = rows.reduce((s, r) => s + r.usou, 0);
  const totalDevolver = devolver.reduce((s, r) => s + r.saldo, 0);
  const totalDivergencia = divergencias.reduce((s, r) => s + Math.abs(r.saldo), 0);
  const hora = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  const codigo = `${data.replaceAll('-','')}-${equipe === 'equipe1' ? 'E1' : 'E2'}-H${hora.replace(':','')}`;

  const tabelaDevolver = devolver.length
    ? devolver.map(r => `<tr><td>${htmlEscape(r.material)}</td><td>${r.recebeu}</td><td>${r.usou}</td><td>${r.saldo}</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-line">SEM MATERIAL PARA DEVOLVER</td></tr>';

  const blocoDivergencia = divergencias.length
    ? `<div class="issue-card"><div class="issue-head">ATENCAO: FALTA CONFERIR</div>${divergencias.map(r => `<div class="issue-row"><span>${htmlEscape(r.material)}</span><strong>${Math.abs(r.saldo)}</strong></div>`).join('')}</div>`
    : '<div class="ok-card">CHECKLIST SEM FALTA</div>';

  const zeradosTexto = zerados.length
    ? `<div class="note">Itens conferidos e zerados: ${zerados.map(r => htmlEscape(r.material)).join(', ')}</div>`
    : '';

  document.getElementById('print-comprovante')?.remove();
  document.getElementById('print-comprovante-style')?.remove();

  const holder = document.createElement('div');
  holder.id = 'print-comprovante';
  holder.innerHTML = `<div class="receipt-v2">
    <div class="top-band">
      <div class="brand-row"><span>INFORWNET</span><b>${label}</b></div>
      <div class="doc-title">FECHAMENTO DE DEVOLUCAO</div>
    </div>

    <div class="doc-meta">
      <div><span>DATA</span><b>${fmtDate(data)}</b></div>
      <div><span>HORA</span><b>${hora}</b></div>
      <div><span>CODIGO</span><b>${codigo}</b></div>
    </div>

    <div class="summary-grid">
      <div><span>RECEBIDO</span><b>${totalRecebido}</b></div>
      <div><span>USADO</span><b>${totalUsado}</b></div>
      <div class="main"><span>DEVOLVER</span><b>${totalDevolver}</b></div>
    </div>

    <div class="section-label">MATERIAIS PARA DEVOLUCAO</div>
    <table class="items-table">
      <thead><tr><th>Material</th><th>Rec</th><th>Uso</th><th>Dev</th></tr></thead>
      <tbody>${tabelaDevolver}</tbody>
    </table>

    ${blocoDivergencia}
    ${zeradosTexto}

    <div class="confirm-row">
      <div>Conferido</div>
      <div>Checklist OK</div>
    </div>

    <div class="sign-block"><span>Assinatura do tecnico</span></div>
    <div class="sign-block"><span>Responsavel pelo recebimento</span></div>
    <div class="formula">Recebido - Usado = Devolver | Falta: ${totalDivergencia}</div>
  </div>`;

  const style = document.createElement('style');
  style.id = 'print-comprovante-style';
  style.textContent = `
    #print-comprovante{display:none;}
    @media print{
      @page{size:80mm auto;margin:3mm;}
      body *{visibility:hidden!important;}
      #print-comprovante,#print-comprovante *{visibility:visible!important;}
      #print-comprovante{display:block!important;position:absolute;left:0;top:0;width:74mm;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;}
      #print-comprovante *{box-sizing:border-box;}
      #print-comprovante .receipt-v2{width:74mm;margin:0 auto;padding:0 0 5mm;font-size:10px;}
      #print-comprovante .top-band{border:2px solid #111;padding:6px 7px;margin-bottom:7px;}
      #print-comprovante .brand-row{display:flex;justify-content:space-between;align-items:center;gap:8px;}
      #print-comprovante .brand-row span{font-size:18px;font-weight:900;color:#e60000;letter-spacing:.06em;}
      #print-comprovante .brand-row b{font-size:11px;border:1px solid #111;padding:2px 5px;white-space:nowrap;}
      #print-comprovante .doc-title{margin-top:5px;padding-top:5px;border-top:1px solid #111;text-align:center;font-size:11px;font-weight:800;letter-spacing:.04em;}
      #print-comprovante .doc-meta{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:7px 0;}
      #print-comprovante .doc-meta div{border:1px solid #d1d5db;padding:4px;min-height:26px;}
      #print-comprovante .doc-meta div:last-child{grid-column:1/-1;}
      #print-comprovante .doc-meta span,#print-comprovante .summary-grid span{display:block;font-size:7px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;}
      #print-comprovante .doc-meta b{font-size:10px;}
      #print-comprovante .summary-grid{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:4px;margin:7px 0;}
      #print-comprovante .summary-grid div{border:1px solid #111;padding:5px;text-align:center;}
      #print-comprovante .summary-grid b{font-size:16px;line-height:1;}
      #print-comprovante .summary-grid .main{background:#111;color:#fff;}
      #print-comprovante .summary-grid .main span{color:#e5e7eb;}
      #print-comprovante .section-label{background:#f3f4f6;border-left:5px solid #e60000;padding:6px;margin:8px 0 4px;font-weight:900;font-size:10px;}
      #print-comprovante .items-table{width:100%;border-collapse:collapse;font-size:9px;}
      #print-comprovante .items-table th{padding:4px 2px;text-align:left;border-bottom:2px solid #111;font-size:8px;text-transform:uppercase;}
      #print-comprovante .items-table td{padding:5px 2px;border-bottom:1px solid #e5e7eb;vertical-align:top;}
      #print-comprovante .items-table th:not(:first-child),#print-comprovante .items-table td:not(:first-child){text-align:right;width:11mm;}
      #print-comprovante .items-table td:last-child{font-size:12px;font-weight:900;}
      #print-comprovante .empty-line{text-align:center!important;color:#6b7280!important;font-size:9px!important;font-weight:700!important;padding:9px 0!important;}
      #print-comprovante .issue-card{border:2px solid #e60000;margin:9px 0 7px;padding:6px;color:#991b1b;}
      #print-comprovante .issue-head{font-size:11px;font-weight:900;margin-bottom:4px;}
      #print-comprovante .issue-row{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-top:1px solid #fecaca;font-size:9px;}
      #print-comprovante .issue-row strong{font-size:12px;}
      #print-comprovante .ok-card{border:1px solid #16a34a;color:#166534;text-align:center;margin:9px 0 7px;padding:7px;font-weight:900;}
      #print-comprovante .note{font-size:8.5px;color:#4b5563;line-height:1.35;margin:6px 0;}
      #print-comprovante .confirm-row{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:9px 0 14px;}
      #print-comprovante .confirm-row div{height:22px;border:1px solid #111;text-align:center;padding-top:5px;font-size:9px;}
      #print-comprovante .sign-block{border-top:1px solid #111;text-align:center;margin-top:20px;padding-top:4px;font-size:9px;}
      #print-comprovante .formula{text-align:center;color:#4b5563;font-size:8px;margin-top:10px;}
    }`;

  document.head.appendChild(style);
  document.body.appendChild(holder);
  const cleanup = () => {
    document.getElementById('print-comprovante')?.remove();
    document.getElementById('print-comprovante-style')?.remove();
  };
  window.addEventListener('afterprint', cleanup, { once:true });
  setTimeout(() => { window.print(); setTimeout(cleanup, 1500); }, 80);
}
function exportarComprovanteComoHTML(equipe) {
  const data = document.getElementById('ctrl-data')?.value || todayStr();
  const label = equipe === 'equipe1' ? 'Equipe 1' : 'Equipe 2';
  const { rows, devolver, divergencias, zerados } = getComprovanteDevolucao(data, equipe);

  if(!rows.length) {
    appAlert(`Sem entrega ou uso registrado para <strong>${label}</strong> nesta data.`, 'warn', 'Sem dados');
    return;
  }

  const totalRecebido = rows.reduce((s, r) => s + r.recebeu, 0);
  const totalUsado    = rows.reduce((s, r) => s + r.usou, 0);
  const totalDevolver = devolver.reduce((s, r) => s + r.saldo, 0);
  const totalDivergencia = divergencias.reduce((s, r) => s + Math.abs(r.saldo), 0);
  const hora   = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  const codigo = `${data.replaceAll('-','')}-${equipe==='equipe1'?'E1':'E2'}-H${hora.replace(':','')}`;

  const tabelaDevolver = devolver.length
    ? devolver.map(r=>`<tr><td>${htmlEscape(r.material)}</td><td>${r.recebeu}</td><td>${r.usou}</td><td>${r.saldo}</td></tr>`).join('')
    : '<tr><td colspan="4" class="empty-line">SEM MATERIAL PARA DEVOLVER</td></tr>';

  const blocoDivergencia = divergencias.length
    ? `<div class="issue-card"><div class="issue-head">ATENÇÃO: FALTA CONFERIR</div>${divergencias.map(r=>`<div class="issue-row"><span>${htmlEscape(r.material)}</span><strong>${Math.abs(r.saldo)}</strong></div>`).join('')}</div>`
    : '<div class="ok-card">CHECKLIST SEM FALTA</div>';

  const zeradosTexto = zerados.length
    ? `<div class="note">Itens conferidos e zerados: ${zerados.map(r=>htmlEscape(r.material)).join(', ')}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Comprovante ${label} — ${fmtDate(data)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4;margin:15mm 20mm;}
  body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111;font-size:11px;}
  .receipt{max-width:680px;margin:0 auto;padding:10px 0 30px;}

  /* Cabeçalho */
  .top-band{border:2.5px solid #111;padding:10px 14px;margin-bottom:12px;}
  .brand-row{display:flex;justify-content:space-between;align-items:center;}
  .brand-row .brand-name{font-size:26px;font-weight:900;color:#e60000;letter-spacing:.05em;}
  .brand-row .equipe-badge{font-size:13px;font-weight:800;border:2px solid #111;padding:4px 10px;}
  .doc-title{margin-top:8px;padding-top:8px;border-top:1.5px solid #111;text-align:center;font-size:14px;font-weight:900;letter-spacing:.05em;}

  /* Meta */
  .doc-meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:12px 0;}
  .meta-full{grid-column:1/-1;}
  .meta-box{border:1px solid #d1d5db;padding:6px 8px;}
  .meta-label{display:block;font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px;}
  .meta-value{font-size:12px;font-weight:700;}

  /* Totalizadores */
  .summary-grid{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:6px;margin:12px 0;}
  .sum-box{border:1px solid #111;padding:8px;text-align:center;}
  .sum-label{display:block;font-size:8px;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px;}
  .sum-value{font-size:22px;font-weight:900;line-height:1;}
  .sum-main{background:#111;color:#fff;}
  .sum-main .sum-label{color:#e5e7eb;}

  /* Seção */
  .section-label{background:#f3f4f6;border-left:6px solid #e60000;padding:7px 10px;margin:14px 0 6px;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:.04em;}

  /* Tabela */
  .items-table{width:100%;border-collapse:collapse;font-size:10px;}
  .items-table th{padding:6px 5px;text-align:left;border-bottom:2px solid #111;font-size:9px;text-transform:uppercase;letter-spacing:.05em;}
  .items-table td{padding:6px 5px;border-bottom:1px solid #e5e7eb;vertical-align:middle;}
  .items-table th:not(:first-child),.items-table td:not(:first-child){text-align:right;width:60px;}
  .items-table td:last-child{font-size:13px;font-weight:900;}
  .empty-line{text-align:center!important;color:#6b7280!important;font-style:italic;padding:12px 0!important;}

  /* Alertas */
  .issue-card{border:2px solid #e60000;margin:12px 0 8px;padding:10px 12px;color:#991b1b;}
  .issue-head{font-size:12px;font-weight:900;margin-bottom:6px;text-transform:uppercase;}
  .issue-row{display:flex;justify-content:space-between;padding:5px 0;border-top:1px solid #fecaca;font-size:10px;}
  .issue-row strong{font-size:13px;}
  .ok-card{border:2px solid #16a34a;color:#166534;text-align:center;margin:12px 0 8px;padding:10px;font-weight:900;font-size:12px;}
  .note{font-size:9px;color:#4b5563;line-height:1.5;margin:8px 0;}

  /* Confirmação */
  .confirm-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0 20px;}
  .confirm-box{height:26px;border:1.5px solid #111;text-align:center;padding-top:6px;font-size:10px;font-weight:600;}

  /* Assinaturas */
  .sign-block{border-top:1.5px solid #111;text-align:center;margin-top:28px;padding-top:5px;font-size:10px;color:#374151;}

  /* Fórmula / rodapé */
  .formula{text-align:center;color:#6b7280;font-size:9px;margin-top:16px;padding-top:8px;border-top:1px dashed #d1d5db;}
  .footer{text-align:center;color:#9ca3af;font-size:8.5px;margin-top:8px;}

  /* Separadores */
  .divider{height:1px;background:#e5e7eb;margin:10px 0;}

  @media print{
    body{background:#fff;}
    .no-print{display:none!important;}
    @page{margin:12mm 16mm;}
  }

  /* Botão de impressão (só na tela) */
  .print-btn{
    display:block;margin:0 auto 20px;padding:12px 32px;
    background:#e60000;color:#fff;border:none;border-radius:8px;
    font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;
    letter-spacing:.04em;
  }
  .print-btn:hover{background:#cc0000;}

/* ══════════════════════════════════════
   PRO TABLE ENGINE
   ══════════════════════════════════════ */

/* toolbar */
.tbl-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
.tbl-search{flex:1;min-width:160px;max-width:280px;position:relative;}
.tbl-search input{padding:7px 10px 7px 32px;font-size:11px;height:32px;background:var(--bg4);border:1px solid var(--border);border-radius:7px;color:var(--text);font-family:var(--mono);width:100%;outline:none;transition:border-color .2s,box-shadow .2s;}
.tbl-search input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,.1);}
.tbl-search svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;}
.tbl-info{font-size:10px;color:var(--muted);font-family:var(--mono);white-space:nowrap;margin-left:auto;}
.tbl-export-btn{display:inline-flex;align-items:center;gap:5px;background:var(--bg4);border:1px solid var(--border);border-radius:7px;color:var(--muted2);font-size:10px;font-family:var(--mono);padding:5px 10px;cursor:pointer;transition:all .2s;white-space:nowrap;height:32px;}
.tbl-export-btn:hover{border-color:var(--border2);color:var(--text);}
.tbl-export-btn svg{width:11px;height:11px;flex-shrink:0;}

/* sticky header */
.tbl-container{overflow:auto;max-height:420px;border-radius:8px;border:1px solid var(--border);}
.tbl-container table{width:100%;border-collapse:collapse;font-size:12px;}
.tbl-container thead th{
  position:sticky;top:0;z-index:2;
  background:var(--bg4);
  padding:9px 12px;
  color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em;
  border-bottom:1px solid var(--border2);font-weight:500;font-family:var(--mono);
  white-space:nowrap;user-select:none;
}
.tbl-container thead th.sortable{cursor:pointer;}
.tbl-container thead th.sortable:hover{color:var(--text);}
.tbl-container thead th .sort-icon{display:inline-block;margin-left:5px;opacity:.35;font-size:9px;transition:opacity .15s;}
.tbl-container thead th.asc .sort-icon::after{content:'▲';}
.tbl-container thead th.desc .sort-icon::after{content:'▼';}
.tbl-container thead th:not(.asc):not(.desc) .sort-icon::after{content:'⇅';}
.tbl-container thead th.asc .sort-icon,
.tbl-container thead th.desc .sort-icon{opacity:1;color:var(--accent);}
.tbl-container td{padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle;font-size:12px;}
.tbl-container tr:last-child td{border-bottom:none;}
.tbl-container tr:hover td{background:rgba(255,255,255,.025);}
.tbl-container .total-row td{color:var(--accent2);font-weight:600;border-top:1px solid var(--border2);background:rgba(34,211,238,.04);}
.tbl-container td.r,.tbl-container th.r{text-align:right;}

/* highlight search match */
mark.hl{background:rgba(59,130,246,.25);color:var(--text);border-radius:2px;padding:0 1px;}

/* pagination */
.tbl-pagination{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;flex-wrap:wrap;}
.tbl-page-info{font-size:10px;color:var(--muted);font-family:var(--mono);}
.tbl-page-btns{display:flex;gap:4px;}
.tbl-page-btn{background:var(--bg4);border:1px solid var(--border);border-radius:6px;color:var(--muted2);font-size:10px;font-family:var(--mono);padding:4px 9px;cursor:pointer;transition:all .15s;min-width:28px;text-align:center;}
.tbl-page-btn:hover:not(:disabled){border-color:var(--accent);color:var(--accent);}
.tbl-page-btn.active{background:rgba(59,130,246,.15);border-color:var(--accent);color:var(--accent);}
.tbl-page-btn:disabled{opacity:.3;cursor:not-allowed;}

/* row fade-in on render */
@keyframes rowIn{from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:none}}
.tbl-container tbody tr{animation:rowIn .18s ease both;}

</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>

<div class="receipt">

  <div class="top-band">
    <div class="brand-row">
      <span class="brand-name">INFORWNET</span>
      <span class="equipe-badge">${label.toUpperCase()}</span>
    </div>
    <div class="doc-title">FECHAMENTO DE DEVOLUÇÃO DE MATERIAIS</div>
  </div>

  <div class="doc-meta">
    <div class="meta-box">
      <span class="meta-label">Data</span>
      <span class="meta-value">${fmtDate(data)}</span>
    </div>
    <div class="meta-box">
      <span class="meta-label">Hora de emissão</span>
      <span class="meta-value">${hora}</span>
    </div>
    <div class="meta-box meta-full">
      <span class="meta-label">Código do comprovante</span>
      <span class="meta-value">${codigo}</span>
    </div>
  </div>

  <div class="summary-grid">
    <div class="sum-box">
      <span class="sum-label">Total recebido</span>
      <span class="sum-value">${totalRecebido}</span>
    </div>
    <div class="sum-box">
      <span class="sum-label">Total usado</span>
      <span class="sum-value">${totalUsado}</span>
    </div>
    <div class="sum-box sum-main">
      <span class="sum-label">A devolver</span>
      <span class="sum-value">${totalDevolver}</span>
    </div>
  </div>

  <div class="section-label">Materiais para devolução</div>
  <table class="items-table">
    <thead>
      <tr>
        <th>Material</th>
        <th>Recebido</th>
        <th>Usado</th>
        <th>Devolver</th>
      </tr>
    </thead>
    <tbody>
      ${tabelaDevolver}
    </tbody>
  </table>

  ${blocoDivergencia}
  ${zeradosTexto}

  <div class="divider"></div>

  <div class="confirm-row">
    <div class="confirm-box">☐ Conferido</div>
    <div class="confirm-box">☐ Checklist OK</div>
  </div>

  <div class="sign-block">
    <br>Assinatura do técnico responsável
  </div>
  <div class="sign-block">
    <br>Responsável pelo recebimento / Almoxarifado
  </div>

  <div class="formula">Fórmula: Recebido − Usado = Devolver &nbsp;|&nbsp; Falta/Divergência: ${totalDivergencia}</div>
  <div class="footer">Inforwnet Telecom — OS Manager — Gerado em ${new Date().toLocaleString('pt-BR')}</div>

</div>
</body>
</html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

function exportarControlePDF() {
  const data = document.getElementById('ctrl-data')?.value || todayStr();
  const do_dia = entregas.filter(e => e.data === data);
  const osDodia = orders.filter(o => o.date === data);
  const entregue = {};
  do_dia.forEach(e => {
    if(!entregue[e.material]) entregue[e.material] = {e1:0,e2:0};
    if(e.equipe==='equipe1') entregue[e.material].e1+=e.qtd; else entregue[e.material].e2+=e.qtd;
  });
  const ut = getTotals(osDodia);
  const allMats = [...new Set([...Object.keys(entregue), ...Object.keys(ut).filter(k=>ut[k].e1+ut[k].e2>0)])];
  if(!allMats.length) { appAlert('Sem dados para a data selecionada.', 'warn', 'Sem dados'); return; }
  const rows = allMats.map(m=>{
    const eE1=entregue[m]?.e1||0,eE2=entregue[m]?.e2||0,uE1=ut[m]?.e1||0,uE2=ut[m]?.e2||0;
    return `<tr><td>${m}</td><td>${eE1}</td><td>${uE1}</td><td style="color:${eE1-uE1<0?'#dc2626':'#16a34a'}">${eE1-uE1>=0?'+':''}${eE1-uE1}</td><td>${eE2}</td><td>${uE2}</td><td style="color:${eE2-uE2<0?'#dc2626':'#16a34a'}">${eE2-uE2>=0?'+':''}${eE2-uE2}</td></tr>`;
  }).join('');
  const html = buildPrintHTML(`Controle Diário — ${fmtDate(data)}`,
    `<h1>Controle Diário de Materiais — Inforwnet Telecom</h1><div class="sub">${fmtDateLong(data)}</div>
    <table><thead><tr><th>Material</th><th>Recebeu E1</th><th>Usou E1</th><th>Sobrou E1</th><th>Recebeu E2</th><th>Usou E2</th><th>Sobrou E2</th></tr></thead><tbody>${rows}</tbody></table>`);
  const w = window.open('','_blank'); w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400);
}

// ══════════════════════════════════════
// AUTENTICAÇÃO
// ══════════════════════════════════════
const AUTH_ERRORS = {
  'auth/invalid-email':           'E-mail inválido.',
  'auth/user-not-found':          'Usuário não encontrado.',
  'auth/wrong-password':          'Senha incorreta.',
  'auth/invalid-credential':      'E-mail ou senha incorretos.',
  'auth/too-many-requests':       'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed':  'Falha de rede. Verifique sua conexão.',
  'auth/user-disabled':           'Esta conta foi desativada.',
  'auth/email-already-in-use':    'Este e-mail já está cadastrado.',
  'auth/weak-password':           'Senha muito fraca. Use no mínimo 6 caracteres.',
  'auth/operation-not-allowed':   'Cadastro desativado. Contate o administrador.',
};

/** Remove contas locais antigas (só Supabase agora — várias contas no mesmo PC). */
function clearLegacyLocalAuth() {
  try {
    localStorage.removeItem('inforwnet_auth_account');
    localStorage.removeItem('inforwnet_auth_session');
  } catch (e) {}
}

function getSupabaseSetupHint() {
  if (typeof supabase === 'undefined') {
    return 'A biblioteca Supabase não carregou. Verifique sua internet e atualize a página (Ctrl+F5).';
  }
  if (window.__CONFIG_JS_MISSING) {
    return 'O arquivo config.js não foi encontrado. Ele deve ficar na mesma pasta que index.html. Use Live Server no VS Code (botão direito em index.html).';
  }
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    return 'Abra config.js na pasta do projeto e preencha SUPABASE_URL e SUPABASE_ANON_KEY (copie de config.example.js).';
  }
  return 'Configure o Supabase em config.js (URL até .co + chave anon do painel).';
}

function showAuthConfigError(customMsg) {
  const errEl = document.getElementById('login-err');
  if (errEl) {
    errEl.textContent = customMsg || getSupabaseSetupHint();
    errEl.classList.add('show');
  }
  document.querySelectorAll('#login-btn, #reg-btn, .login-tab').forEach(el => {
    if (el) el.disabled = true;
  });
}

function requireSupabase() {
  if (useSupabase()) return true;
  showAuthConfigError();
  return false;
}

const REG_BTN_HTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> Criar conta`;

function resetRegBtn() {
  const btn = document.getElementById('reg-btn');
  if (!btn) return;
  btn.disabled = false;
  btn.innerHTML = REG_BTN_HTML;
}

// ── Tab switcher ──
function setTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-register').classList.toggle('hidden', isLogin);
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  ['login-err', 'reg-err', 'reg-ok'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  if (!isLogin) resetRegBtn();
}

// ── Toggle olho senha ──
function toggleSenha(inputId, showId, hideId) {
  const input = document.getElementById(inputId);
  const show  = document.getElementById(showId);
  const hide  = document.getElementById(hideId);
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  show.style.display = isPass ? 'none' : '';
  hide.style.display = isPass ? '' : 'none';
}

// ── Força da senha ──
function checarForcaSenha() {
  const pass = document.getElementById('reg-pass').value;
  const wrapper = document.getElementById('senha-forca');
  const label   = document.getElementById('forca-label');
  const bars    = [1,2,3,4].map(i => document.getElementById('forca-b'+i));
  if(!pass) { wrapper.style.display='none'; return; }
  wrapper.style.display='block';
  let score = 0;
  if(pass.length >= 6)  score++;
  if(pass.length >= 10) score++;
  if(/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
  if(/[0-9]/.test(pass) && /[^a-zA-Z0-9]/.test(pass)) score++;
  const configs = [
    { color:'var(--danger)', text:'Muito fraca' },
    { color:'var(--warn)',   text:'Fraca' },
    { color:'#f59e0b',       text:'Razoável' },
    { color:'var(--success)',text:'Forte' },
  ];
  bars.forEach((b, i) => {
    b.style.background = i < score ? configs[score-1].color : 'var(--border)';
  });
  label.textContent = configs[Math.max(0,score-1)].text;
  label.style.color = configs[Math.max(0,score-1)].color;
}

// ── Login ──
async function fazerLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-err');
  errEl.classList.remove('show');

  if(!email) { errEl.textContent = 'Informe o e-mail.'; errEl.classList.add('show'); return; }
  if(!pass)  { errEl.textContent = 'Informe a senha.'; errEl.classList.add('show'); return; }

  btn.disabled = true;
  btn.innerHTML = '<div class="login-spinner"></div> Entrando...';

  try {
    if (!requireSupabase()) return;
    const user = await DB.signIn(email, pass);
    const data = await DB.loadAllData();
    orders = data.orders;
    keywords = data.keywords.length ? data.keywords : keywords;
    if (data.equipamentos && data.equipamentos.length) equipamentosCatalogo = data.equipamentos;
    entregas = data.entregas;
    await entrarNoApp(user);
  } catch (e) {
    errEl.textContent = DB.authErrorMessage(e);
    errEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Entrar`;
  }
}

// ── Cadastro ──
async function cadastrar() {
  const nome  = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const btn   = document.getElementById('reg-btn');
  const errEl = document.getElementById('reg-err');
  const okEl  = document.getElementById('reg-ok');
  errEl.classList.remove('show');
  okEl.classList.remove('show');

  if (!nome) {
    errEl.textContent = 'Informe seu nome.';
    errEl.classList.add('show');
    return;
  }
  if (!email) {
    errEl.textContent = 'Informe o e-mail.';
    errEl.classList.add('show');
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errEl.textContent = 'Informe um e-mail válido.';
    errEl.classList.add('show');
    return;
  }
  if (pass.length < 6) {
    errEl.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
    errEl.classList.add('show');
    return;
  }
  if (pass !== pass2) {
    errEl.textContent = 'As senhas não coincidem.';
    errEl.classList.add('show');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="login-spinner"></div> Criando conta...';

  try {
    if (!requireSupabase()) return;
    const user = await DB.signUp(nome, email, pass);
    const data = await DB.loadAllData();
    orders = data.orders;
    keywords = data.keywords.length ? data.keywords : keywords;
    if (data.equipamentos && data.equipamentos.length) equipamentosCatalogo = data.equipamentos;
    entregas = data.entregas;
    okEl.textContent = user.isMaster
      ? 'Conta master criada! Você tem acesso total ao sistema.'
      : 'Conta criada com sucesso! Entrando...';
    okEl.classList.add('show');
    setTimeout(() => entrarNoApp(user), 500);
  } catch (e) {
    errEl.textContent = DB.authErrorMessage(e);
    errEl.classList.add('show');
    resetRegBtn();
  }
}

function fazerLogout() {
  appConfirm('Deseja encerrar a sessão e sair do sistema?', 'Sair do sistema?',
    { confirmLabel: 'Sair', cancelLabel: 'Cancelar' }
  ).then(async r => {
    if(r !== 'confirm') return;
    if (useSupabase()) await DB.signOut();
    mostrarLogin();
  });
}

function formatNomeTopbar(nome) {
  const bruto = String(nome || '').trim();
  if (!bruto) return '—';
  const base = bruto.includes('@') ? bruto.split('@')[0] : bruto;
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

function setUsuarioUI(user) {
  if(!user) return;
  const nome  = user.displayName || user.email || '';
  const email = user.email || '';
  const initials = nome.substring(0, 2).toUpperCase();
  const el1 = document.getElementById('topbar-user-name');
  const el2 = document.getElementById('topbar-avatar');
  const el3 = document.getElementById('sidebar-user-email');
  const el4 = document.getElementById('sidebar-avatar-mini');
  if(el1) el1.textContent = formatNomeTopbar(nome);
  if(el2) el2.textContent = initials;
  if(el3) el3.textContent = email;
  if(el4) el4.textContent = initials;
  applyRoleUI();
}

async function entrarNoApp(user) {
  setUsuarioUI(user);
  const loginEl = document.getElementById('login-screen');
  loginEl.classList.add('hide');
  setTimeout(() => loginEl.style.display = 'none', 320);
  document.querySelector('.shell').style.display = 'flex';
  renderKwList();
  renderEquipCatalogList();
  initControle();
  renderDashboard();
  renderExtrasList();
}

function mostrarApp(user) {
  entrarNoApp(user);
}

function mostrarLogin() {
  const loginEl = document.getElementById('login-screen');
  loginEl.style.display = 'flex';
  loginEl.classList.remove('hide');
  document.querySelector('.shell').style.display = 'none';
  setTab('login');
  document.querySelectorAll('#login-btn, #reg-btn, .login-tab').forEach(el => {
    if (el) el.disabled = !useSupabase();
  });
  const btn = document.getElementById('login-btn');
  if (btn && useSupabase()) btn.disabled = false;
  btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Entrar`;
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value = '';
  ['reg-nome', 'reg-email', 'reg-pass', 'reg-pass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const forca = document.getElementById('senha-forca');
  if (forca) forca.style.display = 'none';
  resetRegBtn();
}

// ══ Handlers data-on* (antes do init) ══
(function migrateInlineHandlers() {
  const attrs = ['onclick', 'onchange', 'oninput', 'onsubmit', 'onkeyup', 'onkeydown', 'onfocus', 'onblur', 'onmouseover', 'onmouseout', 'onload'];
  function bind(el, attr) {
    const dataAttr = 'data-' + attr;
    const code = el.getAttribute(dataAttr);
    if (!code) return;
    el.removeAttribute(dataAttr);
    const eventName = attr.slice(2);
    el.addEventListener(eventName, function (event) {
      try {
        return Function.call(this, 'event', code).call(this, event);
      } catch (err) {
        console.error('Handler error [' + attr + ']:', code, err);
      }
    });
  }
  attrs.forEach(attr => {
    const dataAttr = 'data-' + attr;
    document.querySelectorAll('[' + dataAttr + ']').forEach(el => bind(el, attr));
  });
})();

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
async function bootApp() {
  clearLegacyLocalAuth();

  if (!useSupabase()) {
    mostrarLogin();
    showAuthConfigError();
    return;
  }

  const keyCheck = await DB.verifyApiKey();
  if (!keyCheck.ok) {
    mostrarLogin();
    showAuthConfigError(keyCheck.message);
    return;
  }

  try {
    const session = await DB.initSession();
    if (session?.user) {
      const data = await DB.loadAllData();
      orders = data.orders;
      keywords = data.keywords.length ? data.keywords : keywords;
      if (data.equipamentos && data.equipamentos.length) equipamentosCatalogo = data.equipamentos;
      entregas = data.entregas;
      await entrarNoApp(session.user);
      return;
    }
  } catch (e) {
    console.error('[App] Erro ao conectar Supabase:', e);
  }

  mostrarLogin();
  setTab('login');
}

bootApp();

// ── SERVICE WORKER REGISTRATION ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => {
        console.log('[App] Service Worker registrado:', reg.scope);

        // Verifica se há atualização disponível
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => console.warn('[App] Falha ao registrar Service Worker:', err));
  });
}

// ── PWA INSTALL PROMPT ──
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

window.addEventListener('appinstalled', () => {
  hideInstallBanner();
  deferredPrompt = null;
  console.log('[App] PWA instalado com sucesso!');
});

function showInstallBanner() {
  if (document.getElementById('install-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.style.cssText = `
    position:fixed;bottom:20px;right:20px;z-index:9999;
    background:#111827;border:1px solid rgba(230,0,0,0.35);border-radius:12px;
    padding:14px 18px;display:flex;align-items:center;gap:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.5);max-width:320px;
    font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:#e2e8f0;
    animation:slideUp 0.3s ease;
  `;
  banner.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 100 100" fill="none" style="flex-shrink:0">
      <path d="M50 8 A42 42 0 0 1 88 38" stroke="#e60000" stroke-width="7" stroke-linecap="round"/>
      <path d="M91 55 A42 42 0 0 1 62 91" stroke="#e60000" stroke-width="7" stroke-linecap="round"/>
      <path d="M38 92 A42 42 0 0 1 9 55" stroke="#e60000" stroke-width="7" stroke-linecap="round"/>
      <path d="M9 43 A42 42 0 0 1 38 10" stroke="#e60000" stroke-width="7" stroke-linecap="round"/>
      <circle cx="26" cy="34" r="5" fill="#e60000"/>
      <path d="M18 38 L30 72 L50 50 L70 72 L82 38" stroke="#e60000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
    <div style="flex:1">
      <div style="font-weight:600;margin-bottom:2px;">Instalar OS Manager</div>
      <div style="color:#64748b;font-size:11px;">Acesso rápido e modo offline</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <button onclick="installPWA()" style="background:#e60000;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:11px;cursor:pointer;font-family:inherit;font-weight:500;">Instalar</button>
      <button onclick="hideInstallBanner()" style="background:transparent;color:#64748b;border:none;font-size:11px;cursor:pointer;font-family:inherit;">Agora não</button>
    </div>
  `;
  document.body.appendChild(banner);
  const style = document.createElement('style');
  style.textContent = '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}';
  document.head.appendChild(style);
}

function hideInstallBanner() {
  const b = document.getElementById('install-banner');
  if (b) b.remove();
}

function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') console.log('[App] Usuário aceitou instalar o PWA');
    deferredPrompt = null;
    hideInstallBanner();
  });
}

function showUpdateBanner() {
  if (document.getElementById('update-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.style.cssText = `
    position:fixed;top:16px;right:16px;z-index:9999;
    background:#111827;border:1px solid rgba(59,130,246,0.4);border-radius:10px;
    padding:12px 16px;display:flex;align-items:center;gap:10px;
    font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:#e2e8f0;
    box-shadow:0 6px 20px rgba(0,0,0,0.4);
  `;
  banner.innerHTML = `
    <span style="color:#3b82f6;font-size:16px;">↻</span>
    <div style="flex:1"><div style="font-weight:600;">Atualização disponível</div><div style="color:#64748b;font-size:10px;">Recarregue para usar a nova versão</div></div>
    <button onclick="window.location.reload()" style="background:#3b82f6;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:11px;cursor:pointer;font-family:inherit;">Atualizar</button>
    <button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:#64748b;cursor:pointer;font-size:14px;">✕</button>
  `;
  document.body.appendChild(banner);
}


// ══════════════════════════════════════
// PRO TABLE ENGINE
// ══════════════════════════════════════
function ProTable(opts) {
  // opts: { containerId, columns, data, pageSize=10, searchable=true, exportName }
  // columns: [{key, label, align:'r'|'l', sortType:'num'|'str', render(row)=>html, noSort}]
  const PAGE_SIZE = opts.pageSize || 10;
  let state = {
    data: opts.data || [],
    filtered: opts.data || [],
    search: '',
    sortCol: opts.defaultSort ?? null,
    sortDir: 'desc',
    page: 0,
  };

  const container = document.getElementById(opts.containerId);
  if (!container) return { update };

  // ── Build structure ──
  container.innerHTML = `
    <div class="tbl-toolbar">
      ${opts.searchable !== false ? `
      <div class="tbl-search">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="${opts.containerId}-search" type="text" placeholder="Buscar…">
      </div>` : ''}
      <span class="tbl-info" id="${opts.containerId}-info"></span>

    </div>
    <div class="tbl-container">
      <table>
        <thead><tr>${opts.columns.map((c,i)=>`
          <th class="${c.noSort?'':'sortable'}${c.align==='r'?' r':''}" data-col="${i}">
            ${c.label}${c.noSort?'':'<span class="sort-icon"></span>'}
          </th>`).join('')}
        </tr></thead>
        <tbody id="${opts.containerId}-tbody"></tbody>
      </table>
    </div>
    <div class="tbl-pagination">
      <span class="tbl-page-info" id="${opts.containerId}-pginfo"></span>
      <div class="tbl-page-btns" id="${opts.containerId}-pgbtns"></div>
    </div>`;

  // ── Search ──
  const searchEl = document.getElementById(opts.containerId + '-search');
  if (searchEl) {
    searchEl.addEventListener('input', e => {
      state.search = e.target.value.trim().toLowerCase();
      state.page = 0;
      applyFilter();
      render();
    });
  }

  // ── Sort ──
  container.querySelectorAll('thead th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = +th.dataset.col;
      if (state.sortCol === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortCol = col; state.sortDir = 'desc'; }
      container.querySelectorAll('thead th').forEach(t => t.classList.remove('asc','desc'));
      th.classList.add(state.sortDir);
      applySort();
      render();
    });
    // set default sort indicator
    if (opts.defaultSort === +th.dataset.col) {
      th.classList.add('desc');
    }
  });

  // ── Export ──
  window['_ptExport_' + opts.containerId] = (type) => {
    const rows = state.filtered;
    if (type === 'csv') {
      const header = opts.columns.map(c => c.label).join(',');
      const lines = rows.map(row => opts.columns.map(c => {
        const v = row[c.key] ?? '';
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
      }).join(','));
      const csv = [header, ...lines].join('\n');
      const a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = (opts.exportName || 'tabela') + '.csv';
      a.click();
    } else if (type === 'copy') {
      const header = opts.columns.map(c => c.label).join('\t');
      const lines = rows.map(row => opts.columns.map(c => row[c.key] ?? '').join('\t'));
      navigator.clipboard.writeText([header, ...lines].join('\n'))
        .then(() => {
          const btn = container.querySelector('.tbl-export-btn:last-child');
          if (btn) { const orig = btn.innerHTML; btn.innerHTML = '✓ Copiado'; setTimeout(()=>btn.innerHTML=orig, 1500); }
        });
    }
  };

  function applyFilter() {
    if (!state.search) { state.filtered = [...state.data]; }
    else {
      state.filtered = state.data.filter(row =>
        opts.columns.some(c => String(row[c.key] ?? '').toLowerCase().includes(state.search))
      );
    }
    applySort();
  }

  function applySort() {
    if (state.sortCol === null) return;
    const col = opts.columns[state.sortCol];
    if (!col || col.noSort) return;
    state.filtered.sort((a, b) => {
      let va = a[col.key] ?? 0, vb = b[col.key] ?? 0;
      if (col.sortType === 'str') { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      else { va = +va || 0; vb = +vb || 0; }
      if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
      if (va > vb) return state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function highlight(text) {
    if (!state.search) return text;
    const esc = state.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text).replace(new RegExp('(' + esc + ')', 'gi'), '<mark class="hl">$1</mark>');
  }

  function render() {
    const total = state.filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (state.page >= totalPages) state.page = totalPages - 1;
    const start = state.page * PAGE_SIZE;
    const pageRows = state.filtered.slice(start, start + PAGE_SIZE);

    const infoEl = document.getElementById(opts.containerId + '-info');
    if (infoEl) infoEl.textContent = state.search
      ? `${total} de ${state.data.length} resultado${total !== 1 ? 's' : ''}`
      : `${total} registro${total !== 1 ? 's' : ''}`;

    const tbody = document.getElementById(opts.containerId + '-tbody');
    if (!pageRows.length) {
      tbody.innerHTML = `<tr><td colspan="${opts.columns.length}" class="empty" style="text-align:center;padding:24px;color:var(--muted);font-family:var(--mono);font-size:11px;">${state.search ? 'Nenhum resultado para "'+state.search+'"' : 'Sem dados.'}</td></tr>`;
    } else {
      tbody.innerHTML = pageRows.map((row, ri) => `<tr style="animation-delay:${ri*0.025}s">
        ${opts.columns.map(c => {
          const raw = row[c.key] ?? '';
          const rendered = c.render ? c.render(row) : highlight(String(raw));
          return `<td class="${c.align==='r'?'r':''}">${rendered}</td>`;
        }).join('')}
      </tr>`).join('');
    }

    // Pagination
    const pgbtns = document.getElementById(opts.containerId + '-pgbtns');
    const pginfo = document.getElementById(opts.containerId + '-pginfo');
    if (pginfo) pginfo.textContent = total ? `Pág. ${state.page+1} / ${totalPages}` : '';
    if (!pgbtns) return;
    const pages = buildPageNums(state.page, totalPages);
    pgbtns.innerHTML = `
      <button class="tbl-page-btn" onclick="window._ptPage_${opts.containerId}(${state.page-1})" ${state.page===0?'disabled':''}>‹</button>
      ${pages.map(p => p === '…' 
        ? `<span class="tbl-page-btn" style="cursor:default;opacity:.4">…</span>`
        : `<button class="tbl-page-btn${p===state.page?' active':''}" onclick="window._ptPage_${opts.containerId}(${p})">${p+1}</button>`
      ).join('')}
      <button class="tbl-page-btn" onclick="window._ptPage_${opts.containerId}(${state.page+1})" ${state.page>=totalPages-1?'disabled':''}>›</button>`;
  }

  function buildPageNums(cur, total) {
    if (total <= 7) return Array.from({length:total},(_,i)=>i);
    const pages = [];
    if (cur <= 3) { pages.push(0,1,2,3,4,'…',total-1); }
    else if (cur >= total-4) { pages.push(0,'…',total-5,total-4,total-3,total-2,total-1); }
    else { pages.push(0,'…',cur-1,cur,cur+1,'…',total-1); }
    return pages;
  }

  window['_ptPage_' + opts.containerId] = (p) => {
    const totalPages = Math.ceil(state.filtered.length / PAGE_SIZE);
    if (p < 0 || p >= totalPages) return;
    state.page = p;
    render();
    container.querySelector('.tbl-container').scrollTop = 0;
  };

  function update(newData) {
    state.data = newData;
    state.page = 0;
    applyFilter();
    applySort();
    render();
  }

  // initial render
  applyFilter();
  applySort();
  render();
  return { update };
}
