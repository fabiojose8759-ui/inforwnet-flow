/**
 * Camada Supabase — Inforwnet OS Manager
 * Master: tudo | Usuário: edita/apaga só o que registrou | Todos leem tudo
 */
(function (global) {
  const TIPO_OS_LABELS = {
    corretiva: 'Corretiva',
    preventiva: 'Preventiva',
    instalacao_kit: 'Instalação de Kit',
    mudanca_endereco: 'Mudança de Endereço',
  };

  let client = null;
  let currentUser = null;

  function getConfig() {
    const url = String(global.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const key = String(global.SUPABASE_ANON_KEY || '').trim();
    return { url, key };
  }

  function isConfigured() {
    const { url, key } = getConfig();
    return !!(url && key && global.supabase);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) {
      const { url, key } = getConfig();
      client = global.supabase.createClient(url, key);
    }
    return client;
  }

  /** Testa se a chave API responde (evita “Invalid API key” sem explicação). */
  async function verifyApiKey() {
    const { url, key } = getConfig();
    if (!url || !key) return { ok: false, message: 'URL ou chave vazia no config.js' };
    try {
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (res.status === 200) return { ok: true };
      const body = await res.json().catch(() => ({}));
      if (res.status === 401 || body?.message === 'Invalid API key') {
        return {
          ok: false,
          message:
            'Chave API inválida. No Supabase: Settings → API Keys → copie de novo a chave anon (aba Legacy) OU a Publishable (se Legacy estiver desativada). Cole em config.js sem espaços.',
        };
      }
      return { ok: false, message: body?.message || body?.msg || `Erro HTTP ${res.status}` };
    } catch (e) {
      return { ok: false, message: 'Sem conexão com o Supabase. Verifique internet e a URL no config.js.' };
    }
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function fmtDate(s) {
    try {
      const [y, m, d] = s.split('-');
      return `${d}/${m}/${y}`;
    } catch (e) {
      return s;
    }
  }

  const TEXTO_OS_TIPO = '__texto_os';
  const EQUIP_TIPO = '__equip';

  function packExtrasForDb(order) {
    const items = [...(order.extras || [])].filter((e) => e && e.tipo !== TEXTO_OS_TIPO && e.tipo !== EQUIP_TIPO);
    const texto = String(order.textoOS || '').trim();
    if (texto) items.unshift({ tipo: TEXTO_OS_TIPO, conteudo: texto });
    return items;
  }

  function unpackExtrasFromDb(extras) {
    const list = Array.isArray(extras) ? extras : [];
    const textoEntry = list.find((e) => e && e.tipo === TEXTO_OS_TIPO);
    return {
      textoOS: (textoEntry && textoEntry.conteudo) ? String(textoEntry.conteudo) : '',
      extras: list.filter((e) => e && e.tipo !== TEXTO_OS_TIPO && e.tipo !== EQUIP_TIPO),
    };
  }

  function normalizeEquipList(list) {
    return (Array.isArray(list) ? list : [])
      .filter((e) => e && (e.nome || e.name))
      .map((e) => ({ nome: String(e.nome || e.name).trim(), qtd: parseInt(e.qtd, 10) || 1 }));
  }

  function unpackEquipamentosFromDb(row, extrasList) {
    const col = normalizeEquipList(row.equipamentos);
    if (col.length) return col;
    return (extrasList || [])
      .filter((e) => e && e.tipo === EQUIP_TIPO)
      .map((e) => ({ nome: e.nome, qtd: parseInt(e.qtd, 10) || 1 }));
  }

  function packEquipamentosFallbackInExtras(order) {
    return normalizeEquipList(order.equipamentos).map((e) => ({
      tipo: EQUIP_TIPO,
      nome: e.nome,
      qtd: e.qtd,
    }));
  }

  function mapOrder(row) {
    const tipo = row.tipo || 'corretiva';
    const unpacked = unpackExtrasFromDb(row.extras);
    const textoCol = (row.texto_os && String(row.texto_os).trim()) || '';
    return {
      id: row.id,
      date: row.os_date,
      dateLabel: fmtDate(row.os_date),
      team: row.team,
      tecnico: row.tecnico || '—',
      tipo,
      tipoLabel: TIPO_OS_LABELS[tipo] || 'Corretiva',
      numOS: row.num_os || '—',
      textoOS: textoCol || unpacked.textoOS,
      extracted: row.extracted || {},
      extras: unpacked.extras,
      equipamentos: unpackEquipamentosFromDb(row, row.extras),
      createdBy: row.created_by,
      createdByName: row.created_by_name,
    };
  }

  function mapEntrega(row) {
    return {
      id: row.id,
      data: row.data,
      equipe: row.equipe,
      material: row.material,
      qtd: row.qtd,
      obs: row.obs || '',
      hora: row.hora || '',
      createdBy: row.created_by,
      createdByName: row.created_by_name,
    };
  }

  async function fetchProfile(userId) {
    const sb = getClient();
    const { data, error } = await sb
      .from('profiles')
      .select('id, display_name, email, role')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  function buildAppUser(profile) {
    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      role: profile.role,
      isMaster: profile.role === 'master',
    };
  }

  async function initSession() {
    if (!isConfigured()) return null;
    const sb = getClient();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) return null;
    try {
      const profile = await fetchProfile(session.user.id);
      currentUser = buildAppUser(profile);
      return { user: currentUser, session };
    } catch (e) {
      console.error('[DB] Perfil não encontrado:', e);
      return null;
    }
  }

  async function loadAllData() {
    const sb = getClient();
    const [ordersRes, kwRes, entRes, equipRes] = await Promise.all([
      sb.from('orders').select('*').order('created_at', { ascending: true }),
      sb.from('keywords').select('name, sort_order').order('sort_order', { ascending: true }),
      sb.from('entregas').select('*').order('created_at', { ascending: true }),
      sb.from('equipamentos').select('name, sort_order').order('sort_order', { ascending: true }),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (kwRes.error) throw kwRes.error;
    if (entRes.error) throw entRes.error;

    const equipamentos = equipRes.error
      ? []
      : (equipRes.data || []).map((k) => k.name);

    return {
      orders: (ordersRes.data || []).map(mapOrder),
      keywords: (kwRes.data || []).map((k) => k.name),
      equipamentos,
      entregas: (entRes.data || []).map(mapEntrega),
    };
  }

  async function signUp(nome, email, password) {
    const sb = getClient();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: nome } },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Cadastro não concluído. Verifique o e-mail se a confirmação estiver ativa.');

    await new Promise((r) => setTimeout(r, 500));
    const profile = await fetchProfile(data.user.id);
    currentUser = buildAppUser(profile);
    return currentUser;
  }

  async function signIn(email, password) {
    const sb = getClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await fetchProfile(data.user.id);
    currentUser = buildAppUser(profile);
    return currentUser;
  }

  async function signOut() {
    const sb = getClient();
    await sb.auth.signOut();
    currentUser = null;
  }

  function getUser() {
    return currentUser;
  }

  function isMaster() {
    return currentUser?.isMaster === true;
  }

  function canModify(record) {
    if (!record || !currentUser) return false;
    if (isMaster()) return true;
    return record.createdBy === currentUser.id;
  }

  function userBadgeHtml(name, opts = {}) {
    const n = name || 'Usuário';
    const master = opts.role === 'master' || opts.isMaster;
    const cls = master ? 'user-badge user-badge--master' : 'user-badge';
    const label = master ? `${n} · Master` : n;
    return `<span class="${cls}" title="Registrado por ${n}">${label}</span>`;
  }

  function authErrorMessage(err) {
    const msg = err?.message || err?.msg || String(err);
    const map = {
      'Invalid login credentials': 'E-mail ou senha incorretos. No Supabase é outra conta — use Criar conta ou a senha cadastrada lá.',
      'User already registered': 'Este e-mail já está cadastrado. Use a aba Entrar.',
      'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
      'Email not confirmed': 'Confirme seu e-mail antes de entrar (verifique a caixa de entrada).',
      'Invalid API key': 'Chave API inválida no config.js. Copie de novo no Supabase (Settings → API Keys).',
    };
    if (/invalid api key/i.test(msg)) return map['Invalid API key'];
    return map[msg] || msg || 'Erro de autenticação.';
  }

  async function insertOrder(order) {
    const sb = getClient();
    const u = currentUser;
    const equips = normalizeEquipList(order.equipamentos);
    const base = {
      created_by: u.id,
      created_by_name: u.displayName,
      os_date: order.date,
      team: order.team,
      tecnico: order.tecnico,
      tipo: order.tipo,
      num_os: order.numOS,
      extracted: order.extracted,
      extras: packExtrasForDb(order),
    };
    let res = await sb.from('orders').insert({ ...base, equipamentos: equips }).select().single();
    if (res.error && /equipamentos|schema cache/i.test(res.error.message || '')) {
      res = await sb.from('orders').insert({
        ...base,
        extras: [...base.extras, ...packEquipamentosFallbackInExtras(order)],
      }).select().single();
    }
    if (res.error) throw res.error;
    return mapOrder(res.data);
  }


  async function updateOrder(order) {
    const sb = getClient();
    const equips = normalizeEquipList(order.equipamentos);
    const base = {
      os_date: order.date,
      team: order.team,
      tecnico: order.tecnico,
      tipo: order.tipo,
      num_os: order.numOS,
      extracted: order.extracted,
      extras: packExtrasForDb(order),
    };
    let res = await sb.from('orders').update({ ...base, equipamentos: equips }).eq('id', order.id).select().single();
    if (res.error && /equipamentos|schema cache/i.test(res.error.message || '')) {
      res = await sb.from('orders').update({
        ...base,
        extras: [...base.extras, ...packEquipamentosFallbackInExtras(order)],
      }).eq('id', order.id).select().single();
    }
    if (res.error) throw res.error;
    return mapOrder(res.data);
  }

  async function deleteAllOrders() {
    if (!isMaster()) throw new Error('Apenas o usuário master pode apagar todos os dados.');
    const sb = getClient();
    const { error: e1 } = await sb.from('orders').delete().neq('id', 0);
    const { error: e2 } = await sb.from('entregas').delete().neq('id', 0);
    if (e1) throw e1;
    if (e2) throw e2;
  }

  async function deleteOrder(id) {
    const sb = getClient();
    const { error } = await sb.from('orders').delete().eq('id', id);
    if (error) throw error;
  }

  async function insertEntrega(entrega) {
    const sb = getClient();
    const u = currentUser;
    const row = {
      created_by: u.id,
      created_by_name: u.displayName,
      data: entrega.data,
      equipe: entrega.equipe,
      material: entrega.material,
      qtd: entrega.qtd,
      obs: entrega.obs || null,
      hora: entrega.hora,
    };
    const { data, error } = await sb.from('entregas').insert(row).select().single();
    if (error) throw error;
    return mapEntrega(data);
  }

  async function deleteEntrega(id) {
    const sb = getClient();
    const { error } = await sb.from('entregas').delete().eq('id', id);
    if (error) throw error;
  }

  async function insertKeyword(name) {
    const sb = getClient();
    const { error } = await sb.from('keywords').insert({ name, sort_order: 999 });
    if (error) {
      if (error.code === '23505') return;
      throw error;
    }
  }

  async function deleteKeywordByName(name) {
    if (!isMaster()) throw new Error('Apenas o master pode remover palavras-chave da lista.');
    const sb = getClient();
    const { error } = await sb.from('keywords').delete().eq('name', name);
    if (error) throw error;
  }

  async function reloadKeywords() {
    const sb = getClient();
    const { data, error } = await sb.from('keywords').select('name').order('sort_order');
    if (error) throw error;
    return (data || []).map((k) => k.name);
  }

  async function insertEquipamento(name) {
    const sb = getClient();
    const { error } = await sb.from('equipamentos').insert({ name, sort_order: 999 });
    if (error) {
      if (error.code === '23505') return;
      throw error;
    }
  }

  async function deleteEquipamentoByName(name) {
    if (!isMaster()) throw new Error('Apenas o master pode remover equipamentos da lista.');
    const sb = getClient();
    const { error } = await sb.from('equipamentos').delete().eq('name', name);
    if (error) throw error;
  }

  async function reloadEquipamentos() {
    const sb = getClient();
    const { data, error } = await sb.from('equipamentos').select('name').order('sort_order');
    if (error) throw error;
    return (data || []).map((k) => k.name);
  }

  global.DB = {
    isConfigured,
    verifyApiKey,
    initSession,
    loadAllData,
    signUp,
    signIn,
    signOut,
    getUser,
    isMaster,
    canModify,
    userBadgeHtml,
    authErrorMessage,
    insertOrder,
    updateOrder,
    deleteAllOrders,
    deleteOrder,
    insertEntrega,
    deleteEntrega,
    insertKeyword,
    deleteKeywordByName,
    reloadKeywords,
    insertEquipamento,
    deleteEquipamentoByName,
    reloadEquipamentos,
    setCurrentUser: (u) => { currentUser = u; },
  };
})(window);
