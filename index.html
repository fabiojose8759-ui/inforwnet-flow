<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#e60000">
<meta name="description" content="Sistema de análise de OS para técnicos de internet — Inforwnet Telecom">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="OS Manager">
<link rel="manifest" href="manifest.json">
<title>Inforwnet Telecom — OS Manager</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=10">
</head>
<body>
<!-- ══ MODAL SYSTEM ══ -->
<div class="modal-overlay" id="app-modal" data-onclick="modalOverlayClick(event)">
  <div class="modal-box" id="app-modal-box">
    <div class="modal-icon" id="modal-icon"></div>
    <div class="modal-title" id="modal-title"></div>
    <div class="modal-msg" id="modal-msg"></div>
    <div class="modal-actions" id="modal-actions"></div>
  </div>
</div>


<!-- ══ LOGIN SCREEN ══ -->
<div id="login-screen">
  <div class="login-card">
    <div class="login-logo">
      <div class="login-logo-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/>
          <path d="M10.54 16.1a6 6 0 0 1 2.92 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
      </div>
      <div class="login-logo-text">
        <div class="login-logo-brand">INFORWNET</div>
        <div class="login-logo-sub">TELECOM · OS MANAGER</div>
      </div>
    </div>

    <!-- Tab switcher -->
    <div class="login-tabs">
      <button id="tab-login" class="login-tab active" data-onclick="setTab('login')">Entrar</button>
      <button id="tab-register" class="login-tab" data-onclick="setTab('register')">Criar conta</button>
    </div>

    <!-- LOGIN FORM -->
    <div id="form-login" class="auth-form">
      <div class="login-title">Bem-vindo de volta</div>
      <div class="login-sub">Faça login para acessar o sistema de OS</div>

      <div class="login-field">
        <label>E-mail</label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <input type="email" id="login-email" placeholder="seu@email.com" autocomplete="email" data-onkeydown="if(event.key==='Enter')document.getElementById('login-pass').focus()">
        </div>
      </div>

      <div class="login-field">
        <label>Senha</label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="password" id="login-pass" placeholder="••••••••" autocomplete="current-password" data-onkeydown="if(event.key==='Enter')fazerLogin()">
          <button class="eye-btn" type="button" data-onclick="toggleSenha('login-pass','eye-show-l','eye-hide-l')">
            <svg id="eye-show-l" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg id="eye-hide-l" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>

      <button class="login-btn" id="login-btn" data-onclick="fazerLogin()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Entrar
      </button>
      <div class="login-err" id="login-err"></div>
    </div>

    <!-- REGISTER FORM -->
    <div id="form-register" class="auth-form hidden">
      <div class="login-title">Criar conta</div>
      <div class="login-sub">Preencha os dados para criar seu acesso</div>
      <div class="login-field">
        <label>Nome completo</label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <input type="text" id="reg-nome" placeholder="Seu nome" autocomplete="name" data-onkeydown="if(event.key==='Enter')document.getElementById('reg-email').focus()">
        </div>
      </div>

      <div class="login-field">
        <label>E-mail</label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <input type="email" id="reg-email" placeholder="seu@email.com" autocomplete="email" data-onkeydown="if(event.key==='Enter')document.getElementById('reg-pass').focus()">
        </div>
      </div>

      <div class="login-field">
        <label>Senha <span class="label-hint">(mínimo 6 caracteres)</span></label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="password" id="reg-pass" placeholder="••••••••" autocomplete="new-password" data-onkeydown="if(event.key==='Enter')document.getElementById('reg-pass2').focus()" data-oninput="checarForcaSenha()">
          <button class="eye-btn" type="button" data-onclick="toggleSenha('reg-pass','eye-show-r','eye-hide-r')">
            <svg id="eye-show-r" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg id="eye-hide-r" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <!-- Força da senha -->
        <div id="senha-forca">
          <div class="il-2">
            <div id="forca-b1"></div>
            <div id="forca-b2"></div>
            <div id="forca-b3"></div>
            <div id="forca-b4"></div>
          </div>
          <span id="forca-label"></span>
        </div>
      </div>

      <div class="login-field">
        <label>Confirmar senha</label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="password" id="reg-pass2" placeholder="••••••••" autocomplete="new-password" data-onkeydown="if(event.key==='Enter')cadastrar()">
        </div>
      </div>

      <button type="button" class="login-btn login-btn--register" id="reg-btn" data-onclick="cadastrar()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        Criar conta
      </button>
      <div class="login-err" id="reg-err"></div>
      <div class="login-err" id="reg-ok"></div>
    </div>

    <div class="login-footer">Inforwnet Telecom · Sistema interno</div>
  </div>
</div>
<div class="shell">
<div id="sidebar-overlay" class="sidebar-overlay" onclick="closeSidebarMobile()"></div>

<!-- ══ SIDEBAR ══ -->
<div class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M10.54 16.1a6 6 0 0 1 2.92 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
    </div>
    <div class="brand-text">
      <div class="brand-name">INFORWNET</div>
      <div class="brand-sub">OS Manager</div>
    </div>
  </div>

  <div class="nav-section">

    <!-- DASHBOARD -->
    <div class="nav-item active" data-onclick="nav('dashboard',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      <span class="label">Dashboard</span>
    </div>

    <!-- OPERAÇÕES -->
    <div class="nav-group-label label">Operações</div>
    <div class="nav-item nav-child" data-onclick="nav('inserir',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
      <span class="label">Inserir OS</span>
    </div>
    <div class="nav-item nav-child" data-onclick="nav('ordens',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span class="label">Ordens</span>
    </div>
    <div class="nav-item nav-child" data-onclick="nav('historico',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span class="label">Histórico</span>
    </div>

    <!-- RELATÓRIOS -->
    <div class="nav-group-label label">Relatórios</div>
    <div class="nav-item nav-child" data-onclick="nav('reldiario',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span class="label">Diário</span>
    </div>
    <div class="nav-item nav-child" data-onclick="nav('relmensal',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M8 18h.01M12 18h.01M16 14h.01"/></svg>
      <span class="label">Mensal</span>
    </div>
    <div class="nav-item nav-child" data-onclick="nav('equipe',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span class="label">Por Equipe</span>
    </div>

    <!-- ESTOQUE -->
    <div class="nav-group-label label">Estoque</div>
    <div class="nav-item nav-child" data-onclick="nav('analise',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      <span class="label">Materiais</span>
    </div>
    <div class="nav-item nav-child" data-onclick="nav('controle',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
      <span class="label">Controle Diário</span>
    </div>

    <!-- CHECKLIST -->
    <div class="nav-group-label label">Ferramentas</div>
    <div class="nav-item nav-child" data-onclick="nav('checklist',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <span class="label">Checklist</span>
    </div>

    <div class="nav-item nav-child" data-onclick="nav('checklist-historico',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      <span class="label">Histórico de Checklists</span>
    </div>

    <!-- SISTEMA -->
    <div class="nav-group-label label">Sistema</div>
    <div class="nav-item nav-child" data-onclick="nav('config',this)">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      <span class="label">Configurações</span>
    </div>

  </div>

  <div class="sidebar-footer">
    <div id="sidebar-user-info">
      <div id="sidebar-avatar-mini">IW</div>
      <div class="label">
        <div id="sidebar-user-email">—</div>
        <div class="il-3">Conectado</div>
      </div>
    </div>
    <div class="nav-item danger" data-onclick="fazerLogout()">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      <span class="label">Sair</span>
    </div>
  </div>
</div>

<!-- ══ MAIN ══ -->
<div class="main">
  <div class="topbar">
    <div class="topbar-left">
      <button class="toggle-btn" data-onclick="toggleSidebar()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div>
        <div class="page-title" id="page-title">Dashboard</div>
        <div class="page-crumb" id="page-crumb">Início › Dashboard</div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="topbar-meta">
        <div class="topbar-meta-item">
          <span class="topbar-meta-label">Data:</span>
          <span class="topbar-meta-value" id="top-date"></span>
        </div>
        <div class="topbar-meta-divider" aria-hidden="true"></div>
        <div class="topbar-meta-item">
          <span class="topbar-meta-label">Usuário:</span>
          <span class="topbar-meta-value" id="topbar-user-name">—</span>
        </div>
        <span class="role-pill topbar-meta-pill" id="topbar-role-pill" style="display:none">Master</span>
      </div>
      <div class="avatar" id="topbar-avatar">IW</div>
    </div>
  </div>

  <div class="content">

    <!-- ══ DASHBOARD ══ -->
    <div class="panel active" id="panel-dashboard">
      <div class="kpi-row kpi-row-dash">
        <div class="kpi kpi-anim"><div class="kpi-val" id="kpi-total-os">0</div><div class="kpi-lbl">Total de OS</div></div>
        <div class="kpi kpi-anim"><div class="kpi-val" id="kpi-total-mat">0</div><div class="kpi-lbl">Total de Materiais</div></div>
        <div class="kpi kpi-anim"><div class="kpi-val" id="kpi-e1">0</div><div class="kpi-lbl">OS Equipe 1</div></div>
        <div class="kpi kpi-anim"><div class="kpi-val" id="kpi-e2">0</div><div class="kpi-lbl">OS Equipe 2</div></div>
      </div>
      <div class="grid-2 mb14">
        <div class="card card-anim">
          <div class="card-title">Materiais mais usados <span class="il-5">pizza</span></div>
          <div class="chart-box">
            <canvas id="chart-pizza"></canvas>
          </div>
        </div>
        <div class="card card-anim">
          <div class="card-title">Consumo por equipe <span class="il-5">barras</span></div>
          <div class="chart-box">
            <canvas id="chart-barras"></canvas>
          </div>
        </div>
      </div>
      <div class="card full">
        <div class="card-title">Resumo de materiais
          <div class="pills" id="dash-pills">
            <span class="pill active" data-onclick="setDashPeriod('all',this)">Todos</span>
            <span class="pill" data-onclick="setDashPeriod('today',this)">Hoje</span>
            <span class="pill" data-onclick="setDashPeriod('week',this)">Semana</span>
            <span class="pill" data-onclick="setDashPeriod('month',this)">Mês</span>
          </div>
        </div>
        <div id="dash-tbl-pro"></div>
      </div>
    </div>

    <!-- ══ INSERIR OS ══ -->
    <div class="panel" id="panel-inserir">
      <div class="sec-hdr">
        <div><div class="sec-title">Inserir Ordem de Serviço</div><div class="sec-sub">Materiais vêm das palavras-chave no texto. Use <strong>Material extra</strong> para ONT, Roteador, ONU, Placa, etc.</div></div>
      </div>
      <div class="card">
        <div class="tags" id="ins-tags"></div>
        <input type="hidden" id="ins-num">

        <!-- Linha 1: Equipe + Tipo + Técnico + Materiais Extras -->
        <div class="frow">
          <div class="fg"><label class="flabel">Equipe</label>
            <select id="ins-equipe"><option value="equipe1">Equipe 1</option><option value="equipe2">Equipe 2</option></select>
          </div>
          <div class="fg"><label class="flabel">Tipo de OS</label>
            <select id="ins-tipo" data-onchange="onTipoOSChange()">
              <option value="corretiva">Corretiva</option>
              <option value="preventiva">Preventiva</option>
              <option value="instalacao_kit">Instalação de Kit</option>
              <option value="mudanca_endereco">Mudança de Endereço</option>
            </select>
          </div>
          <div class="fg"><label class="flabel">Técnico (opcional)</label>
            <input type="text" id="ins-tec" placeholder="Nome do técnico">
          </div>
          <div class="fg">
            <label class="flabel">
              <span class="il-6">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>
                Material Extra
              </span>
              <span id="extras-count">0 itens</span>
            </label>
            <div class="extras-field-row">
              <input type="text" id="extra-nome" placeholder="Nome" data-onkeydown="if(event.key==='Enter')document.getElementById('extra-qtd').focus()">
              <input type="number" id="extra-qtd" placeholder="Qtd" min="1" data-onkeydown="if(event.key==='Enter')adicionarExtra()">
              <button class="btn btn-primary extras-add-btn" data-onclick="adicionarExtra()" title="Adicionar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
            <!-- Chips dos extras adicionados -->
            <div id="extras-list"></div>
          </div>

        </div>

        <!-- Linha 2: Texto da OS -->
        <div class="fg"><label class="flabel">Texto da Ordem de Serviço</label>
          <textarea id="ins-texto" placeholder="Cole aqui o texto completo da OS...&#10;&#10;Exemplo (Instalação de Kit):&#10;ORDEM DE SERVIÇO — INSTALAÇÃO&#10;ONU: (1)&#10;ROTEADOR: (1)&#10;CABO LAN: (16)&#10;CONECTOR RJ45: (2)&#10;FIXA FIO: (7)&#10;METROS DE DROP: (80)&#10;SPLITTER: (1)&#10;ACOPLADOR: (1)" data-oninput="autoExtrairNumOS(this.value)"></textarea>
        </div>

        <div class="btn-row">
          <button class="btn btn-primary" data-onclick="processarOS()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            Processar Ordem de Serviço
          </button>
          <button class="btn btn-sec" data-onclick="limparInserir()">Limpar</button>
        </div>
        <div class="alert" id="ins-alert"></div>
      </div>
    </div>

    <!-- ══ ORDENS PROCESSADAS ══ -->
    <div class="panel" id="panel-ordens">
      <div class="sec-hdr">
        <div><div class="sec-title">Ordens Processadas</div><div class="sec-sub">Lista de todas as OS inseridas no sistema</div></div>
        <div class="pills">
          <span class="pill active" data-onclick="setOrdemFilter('all',this)">Todas</span>
          <span class="pill" data-onclick="setOrdemFilter('equipe1',this)">Equipe 1</span>
          <span class="pill" data-onclick="setOrdemFilter('equipe2',this)">Equipe 2</span>
        </div>
      </div>
      <div id="ordens-list"><div class="empty">Nenhuma OS registrada.</div></div>
    </div>

    <!-- ══ ANÁLISE DE MATERIAIS ══ -->
    <div class="panel" id="panel-analise">
      <div class="sec-hdr">
        <div><div class="sec-title">Análise de Materiais</div><div class="sec-sub">Totais por material com filtros de período</div></div>
      </div>
      <div class="date-filter-row">
        <div class="pills" id="analise-pills">
          <span class="pill active" data-onclick="setAnalisePeriod('all',this)">Todos</span>
          <span class="pill" data-onclick="setAnalisePeriod('today',this)">Hoje</span>
          <span class="pill" data-onclick="setAnalisePeriod('week',this)">Semana</span>
          <span class="pill" data-onclick="setAnalisePeriod('month',this)">Mês</span>
          <span class="pill" data-onclick="setAnalisePeriod('custom',this)">Personalizado</span>
        </div>
        <div id="custom-dates">
          <input type="date" id="date-from">
          <span class="il-7">até</span>
          <input type="date" id="date-to">
          <button class="btn btn-sec" data-onclick="applyCustomDate()">Aplicar</button>
        </div>
      </div>
      <div class="grid-2 mb14">
        <div class="card">
          <div class="card-title">Distribuição por material</div>
          <div id="analise-bars"></div>
        </div>
        <div class="card">
          <div class="card-title">Tabela detalhada</div>
          <div id="analise-tbl-pro"></div>
        </div>
      </div>
    </div>

    <!-- ══ ANÁLISE POR EQUIPE ══ -->
    <div class="panel" id="panel-equipe">
      <div class="sec-hdr"><div><div class="sec-title">Análise por Equipe</div><div class="sec-sub">Comparativo detalhado entre equipes</div></div></div>
      <div class="kpi-row">
        <div class="kpi"><div class="kpi-val" id="eq-kpi1">0</div><div class="kpi-lbl">Equipe 1 (itens)</div></div>
        <div class="kpi"><div class="kpi-val" id="eq-kpi2">0</div><div class="kpi-lbl">Equipe 2 (itens)</div></div>
      </div>
      <div class="grid-2 mb14">
        <div class="card">
          <div class="card-title">Equipe 1</div>
          <div id="eq1-bars"></div>
        </div>
        <div class="card">
          <div class="card-title">Equipe 2</div>
          <div id="eq2-bars"></div>
        </div>
      </div>
      <div class="card full">
        <div class="card-title">
          Comparativo direto
          <div class="pills" id="chart-type-pills">
            <span class="pill active" data-onclick="setChartType('bar',this)" title="Colunas">▬ Colunas</span>
            <span class="pill" data-onclick="setChartType('bar_h',this)" title="Barras">≡ Barras</span>
            <span class="pill" data-onclick="setChartType('line',this)" title="Linhas">∿ Linhas</span>
            <span class="pill" data-onclick="setChartType('doughnut',this)" title="Pizza">◎ Pizza</span>
            <span class="pill" data-onclick="setChartType('polarArea',this)" title="Torre">⊕ Torre</span>
          </div>
        </div>
        <div class="il-8">
          <canvas id="chart-compare"></canvas>
        </div>
      </div>
    </div>

    <!-- ══ RELATÓRIO DIÁRIO ══ -->
    <div class="panel" id="panel-reldiario">
      <div class="sec-hdr">
        <div><div class="sec-title">Relatório Diário</div><div class="sec-sub">Resumo completo de OS por data</div></div>
        <div class="il-9">
          <input type="date" id="rel-dia" data-onchange="renderRelDiario()">
          <button class="btn btn-warn" data-onclick="exportarRelDiarioPDF()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar PDF
          </button>
          <button class="btn btn-success" data-onclick="exportarRelDiarioExcel()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Excel
          </button>
        </div>
      </div>
      <div id="rel-diario-content"><div class="empty">Selecione uma data acima.</div></div>
    </div>

    <!-- ══ RELATÓRIO MENSAL ══ -->
    <div class="panel" id="panel-relmensal">
      <div class="sec-hdr">
        <div><div class="sec-title">Relatório Mensal</div><div class="sec-sub">Consolidado mensal de materiais e OS</div></div>
        <div class="il-9">
          <select id="rel-mes" data-onchange="renderRelMensal()">
            <option value="">Selecione o mês</option>
          </select>
          <button class="btn btn-warn" data-onclick="exportarRelMensalPDF()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar PDF
          </button>
          <button class="btn btn-success" data-onclick="exportarRelMensalExcel()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Excel
          </button>
        </div>
      </div>
      <div id="rel-mensal-content"><div class="empty">Selecione um mês acima.</div></div>
    </div>

    <!-- ══ CONTROLE DIÁRIO ══ -->
    <div class="panel" id="panel-controle">
      <div class="sec-hdr">
        <div><div class="sec-title">Controle Diário de Materiais</div><div class="sec-sub">Registre o que foi entregue a cada equipe e acompanhe o saldo em tempo real</div></div>
        <div class="il-9">
          <input type="date" id="ctrl-data" data-onchange="renderControle()">
          <button class="btn btn-warn" data-onclick="exportarControlePDF()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            PDF
          </button>
          <button class="btn btn-warn" data-onclick="exportarComprovanteComoHTML('equipe1')" title="Imprimir / Salvar PDF Equipe 1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir E1
          </button>
          <button class="btn btn-warn" data-onclick="exportarComprovanteComoHTML('equipe2')" title="Imprimir / Salvar PDF Equipe 2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir E2
          </button>
        </div>
      </div>


      <!-- ENTREGA FORM + ENTREGAS DO DIA -->
      <div class="grid-2 mb14">
        <div class="card">
          <div class="card-title">Registrar entrega de material</div>
          <div class="frow">
            <div class="fg">
              <label class="flabel">Equipe</label>
              <select id="ctrl-equipe" data-onchange="atualizarPreviewSaldo()">
                <option value="equipe1">Equipe 1</option>
                <option value="equipe2">Equipe 2</option>
              </select>
            </div>
            <div class="fg">
              <label class="flabel">Material</label>
              <select id="ctrl-material" data-onchange="atualizarPreviewSaldo()"></select>
            </div>
          </div>
          <div class="frow">
            <div class="fg">
              <label class="flabel">Quantidade entregue</label>
              <input type="number" id="ctrl-qtd" placeholder="0" min="1" data-oninput="atualizarPreviewSaldo()">
            </div>
            <div class="fg">
              <label class="flabel">Observação (opcional)</label>
              <input type="text" id="ctrl-obs" placeholder="Ex: manhã, tarde...">
            </div>
          </div>
          <!-- Preview de impacto no saldo -->
          <div id="ctrl-preview-saldo"></div>
          <div class="btn-row">
            <button class="btn btn-primary" data-onclick="adicionarEntrega()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Registrar Entrega
            </button>
          </div>
          <div class="alert" id="ctrl-alert"></div>
        </div>
        <div class="card">
          <div class="card-title">Entregas do dia <span id="ctrl-entregas-badge"></span></div>
          <div id="ctrl-entregas-list"><div class="empty">Nenhuma entrega registrada.</div></div>
        </div>
      </div>

      <!-- ESTOQUE DO DIA POR EQUIPE -->
      <div class="grid-2 mb14">
        <div class="card" id="ctrl-estoque-e1">
          <div class="card-title">
            <span>Estoque do dia — Equipe 1</span>
            <span id="ctrl-e1-status"></span>
          </div>
          <div id="ctrl-estoque-e1-inner"><div class="empty">Nenhuma entrega registrada para Equipe 1.</div></div>
        </div>
        <div class="card" id="ctrl-estoque-e2">
          <div class="card-title">
            <span>Estoque do dia — Equipe 2</span>
            <span id="ctrl-e2-status"></span>
          </div>
          <div id="ctrl-estoque-e2-inner"><div class="empty">Nenhuma entrega registrada para Equipe 2.</div></div>
        </div>
      </div>

      <!-- COMPARATIVO DETALHADO -->
      <div class="card full">
        <div class="card-title">Comparativo detalhado: Entregue vs Utilizado vs Saldo</div>
        <div id="ctrl-comparativo"><div class="empty">Selecione uma data e registre entregas para ver o comparativo.</div></div>
      </div>

    </div>

    <!-- ══ HISTÓRICO ══ -->
    <div class="panel" id="panel-historico">
      <div class="sec-hdr">
        <div><div class="sec-title">Histórico de OS</div></div>
        <button class="btn btn-danger" id="btn-limpar-tudo" data-onclick="limparTudo()">Limpar Tudo</button>
      </div>
      <div class="card"><div id="hist-list"><div class="empty">Nenhuma OS registrada.</div></div></div>
    </div>

    <!-- ══ CONFIGURAÇÕES ══ -->
    <div class="panel" id="panel-config">
      <div class="sec-hdr"><div><div class="sec-title">Configurações</div><div class="sec-sub">Gerencie palavras-chave e configurações do sistema</div></div></div>
      <div class="grid-2">
        <div class="card">
          
        <!-- KIT DE MATERIAIS -->
        <div class="card">
          <div class="card-title">Kit de Materiais das Equipes</div>
          <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Itens que aparecem automaticamente no Lançamento em Lote do Controle Diário.</p>
          <div id="kit-lista"></div>
          <div style="margin-top:14px;display:flex;gap:8px;align-items:center">
            <input type="text" id="kit-novo-nome" class="finput" placeholder="Nome do item (ex: CABO LAN)" style="flex:2;text-transform:uppercase">
            <input type="text" id="kit-novo-unidade" class="finput" placeholder="Unidade (ex: metros, un)" style="flex:1">
            <button class="btn btn-primary" data-onclick="adicionarItemKit()" style="white-space:nowrap">
              <i class="ti ti-plus"></i> Adicionar
            </button>
          </div>
        </div>

          <div class="card-title">Palavras-chave de materiais</div>
          <div class="il-10">Só consumíveis no texto da OS (ex: CABO LAN: (16)). Com quantidade no formato indicado.</div>
          <div id="kw-list"></div>
          <div class="il-11">
            <input type="text" id="kw-input" placeholder="Nova palavra-chave...">
            <button class="btn btn-primary" data-onclick="addKw()">Adicionar</button>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Equipamentos (ONT / roteador / ONU)</div>
          <div class="il-10">Lista para instalação manual — <strong>não</strong> lê do texto da OS.</div>
          <div id="equip-catalog-list"></div>
          <div class="il-11">
            <input type="text" id="equip-catalog-input" placeholder="Ex: ONT TP LINK XC220-G3v" data-onkeydown="if(event.key==='Enter')addEquipCatalog()">
            <button class="btn btn-primary btn-equip-add" data-onclick="addEquipCatalog()">Adicionar</button>
          </div>
        </div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title">Exportação de dados</div>
          <p class="il-12">Exporte todos os dados do sistema em diferentes formatos.</p>
          <div class="il-13">
            <button class="btn btn-warn" data-onclick="exportarTudoPDF()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar tudo em PDF
            </button>
            <button class="btn btn-success" data-onclick="exportarTudoExcel()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar tudo em Excel (.csv)
            </button>
            <button class="btn btn-sec" data-onclick="exportarJSON()">Exportar backup JSON</button>
          </div>
          <div class="divider"></div>
          <div class="card-title">Importar dados</div>
          <input type="file" id="import-file" accept=".json" data-onchange="importarJSON(this)">
          <p class="il-14">Importe um backup .json exportado anteriormente.</p>
        </div>
      </div>
    </div>


    <!-- ══ CHECKLIST ══ -->
    <div class="panel" id="panel-checklist">
      <div class="sec-hdr">
        <div>
          <div class="sec-title">Checklist de Conferência</div>
          <div class="sec-sub">Confira os materiais com a equipe e envie o resumo pelo WhatsApp</div>
        </div>
        <button class="btn btn-ghost" data-onclick="editarItensChecklist()">✎ Editar itens</button>
      </div>

      <div class="grid-2">
        <!-- Formulário -->
        <div class="card">
          <div class="card-title">Dados da equipe</div>
          <div class="fg" style="margin-bottom:12px;">
            <label class="flabel">Equipe</label>
            <select id="chk-equipe" onchange="renderChecklistPreview()">
              <option value="EQUIPE 01">Equipe 01</option>
              <option value="EQUIPE 02">Equipe 02</option>
            </select>
          </div>
          <div class="fg" style="margin-bottom:16px;">
            <label class="flabel">Técnico</label>
            <input type="text" id="chk-tecnico" placeholder="Nome do técnico" onblur="renderChecklistPreview()">
          </div>

          <div class="card-title" style="margin-bottom:10px;">Materiais</div>
          <div id="chk-itens-form"></div>
        </div>

        <!-- Preview -->
        <div class="card" style="display:flex;flex-direction:column;gap:12px;">
          <div class="card-title">Prévia da mensagem</div>
          <pre id="chk-preview" style="font-family:var(--mono);font-size:11px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px;white-space:pre-wrap;flex:1;overflow-y:auto;max-height:480px;"></pre>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-ghost" style="flex:1;" data-onclick="copiarChecklist()">Copiar texto</button>
            <button class="btn btn-primary" style="flex:1;" data-onclick="enviarChecklistWhatsApp()">Enviar WhatsApp</button>
          </div>
          <button class="btn" style="width:100%;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#4ade80;margin-top:4px;" data-onclick="salvarChecklist()">Salvar no Histórico</button>
          <div id="chk-wpp-hint" style="font-size:10px;color:var(--muted);text-align:center;display:none;">
            Link do grupo não configurado. <a href="#" data-onclick="nav('config',this)" style="color:var(--accent);">Configure nas Configurações</a>
          </div>
        </div>
      </div>
    </div>


    <!-- ══ HISTÓRICO DE CHECKLISTS ══ -->
    <div class="panel" id="panel-checklist-historico">
      <div class="sec-hdr">
        <div>
          <div class="sec-title">Histórico de Checklists</div>
          <div class="sec-sub">Todos os checklists salvos anteriormente</div>
        </div>
      </div>
      <div class="card">
        <div id="chk-historico-list"><div class="empty">Nenhum checklist salvo ainda.</div></div>
      </div>
    </div>

  </div><!-- /content -->
</div><!-- /main -->
</div><!-- /shell -->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js" onerror="window.__CONFIG_JS_MISSING=true"></script>
<!-- Se config.js não carregar (ex.: abrir HTML com duplo clique), usa estes valores: -->
<script>
window.SUPABASE_URL = window.SUPABASE_URL || 'https://cdqrweoqsjefyzowibjd.supabase.co';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcXJ3ZW9xc2plZnl6b3dpYmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzAwNjcsImV4cCI6MjA5NTI0NjA2N30.S7N6_D_SXAjnIBY3tbmN0cMzy5AvbIo3eIEGSo7p6Ss';
</script>
<script src="supabase-db.js?v=10"></script>
<script src="script.js?v=10"></script>
</body>
</html>
