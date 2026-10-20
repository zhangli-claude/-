/* ==========================================================
   练了吗 · 界面与交互
   ========================================================== */
(function (global) {
  'use strict';

  var D = global.DATA;
  var S = global.Store;

  /* ---------------- 小工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pct(a, b) { return b > 0 ? Math.max(0, Math.min(1, a / b)) : 0; }
  function fmtSec(s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m > 0 ? m + ':' + pad(r) : String(r);
  }
  function targetById(id) {
    for (var i = 0; i < D.targets.length; i++) if (D.targets[i].id === id) return D.targets[i];
    return { id: id, label: id, icon: '·', desc: '' };
  }
  function levelCN(n) { return ['', '入门', '进阶', '强化'][n] || '入门'; }
  function demoKey(ex) {
    if (!ex) return 'stand';
    if (D.anim && D.anim[ex.id]) return D.anim[ex.id];
    var t = (ex.targets && ex.targets[0]) || 'full';
    if (t === 'cardio') return 'walk';
    if (t === 'mobility') return 'stretchStand';
    if (t === 'legs') return 'squat';
    if (t === 'glutes') return 'bridge';
    if (t === 'abs') return 'crunch';
    return 'squat';
  }  function dosage(it) {
    if (it.sets <= 1 && it.unit === 'sec') {
      return it.amount >= 60 ? Math.round(it.amount / 60) + ' 分钟' : it.amount + ' 秒';
    }
    if (it.unit === 'sec') return it.sets + ' × ' + it.amount + ' 秒';
    return it.sets + ' × ' + it.amount + ' 次';
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  /* ---------------- 全局 UI 状态 ---------------- */
  var route = 'today';
  var ui = {
    filter: 'all',
    search: '',
    sheet: null,
    workout: null,
    wkTimer: null,
    toastTimer: null,
    reminded: {},
    onboard: { sex: 'f', goal: 'fatloss', focus: ['abs', 'arms', 'legs', 'glutes'], weeklyDays: 4, sessionMin: 15, time: '19:30' }
  };

  /* ---------------- 声音 / 语音 ---------------- */
  var audioCtx = null;
  function beep(freq, dur) {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = freq || 660;
      o.connect(g); g.connect(audioCtx.destination);
      var t = audioCtx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.16));
      o.start(t); o.stop(t + (dur || 0.16) + 0.03);
    } catch (e) { /* 静默失败 */ }
  }
  function speak(text) {
    var st = S.get();
    if (!st.settings.tts) return;
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      var c = D.coaches[st.settings.coach] || D.coaches.gentle;
      u.rate = c.voice.rate;
      u.pitch = c.voice.pitch;
      window.speechSynthesis.speak(u);
    } catch (e) { /* 静默失败 */ }
  }
  function coach() { return D.coaches[S.get().settings.coach] || D.coaches.gentle; }
  function coachSay(kind) {
    var c = coach();
    var line = pick(c[kind] || c.mid);
    speak(line);
    return line;
  }

  /* ---------------- toast ---------------- */
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(ui.toastTimer);
    ui.toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------------- 路由 ---------------- */
  function go(r) {
    route = r;
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    var app = $('#app');
    if (!app) return;
    var st = S.get();
    var html;
    var tabbar = document.getElementById('tabbar');
    if (tabbar) tabbar.style.display = st.onboarded ? '' : 'none';
    if (!st.onboarded) {
      html = welcomeView();
      setTabs('');
      app.innerHTML = html;
      return;    }
    if (route === 'welcome') route = 'today';
    if (route === 'today') html = todayView();
    else if (route === 'plan') html = planView();
    else if (route === 'library') html = libraryView();
    else if (route === 'stats') html = statsView();
    else if (route === 'friend') html = friendView();
    else if (route === 'me') html = meView();
    else html = todayView();
    app.innerHTML = html;
    setTabs(route);
    if (global.Anim) global.Anim.autoMount(app);
    renderSheet();
  }

  function setTabs(r) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('on', tabs[i].getAttribute('data-route') === r);
    }
  }

  /* ---------------- 通用片段 ---------------- */
  function ringSVG(progress, label, big) {
    var r = 50, c = 2 * Math.PI * r;
    var off = c * (1 - clamp(progress, 0, 1));
    return '<div class="ring">' +
      '<svg width="116" height="116" viewBox="0 0 116 116">' +
      '<circle cx="58" cy="58" r="' + r + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="9"/>' +
      '<circle cx="58" cy="58" r="' + r + '" fill="none" stroke="url(#ringGrad)" stroke-width="9" stroke-linecap="round" ' +
      'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>' +
      '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#c8ff3d"/><stop offset="100%" stop-color="#3ddad7"/></linearGradient></defs>' +
      '</svg>' +
      '<div class="val"><b>' + big + '</b><span>' + label + '</span></div></div>';
  }

  function programPreview(program) {
    var rows = [];
    program.items.forEach(function (it, i) {
      var ex = S.exerciseById(it.exerciseId);
      if (!ex) return;
      rows.push('<div class="li"><span class="idx">' + pad(i + 1) + '</span>' +
        '<span class="nm">' + esc(ex.name) + '</span>' +
        '<span class="dos">' + dosage(it) + '</span></div>');
    });
    return rows.join('');
  }

  /* ---------------- 欢迎页 ---------------- */
  function welcomeView() {
    var o = ui.onboard;
    var focusChips = ['abs', 'arms', 'legs', 'glutes'].map(function (id) {
      var t = targetById(id);
      return '<button class="chip' + (o.focus.indexOf(id) >= 0 ? ' on' : '') + '" data-action="ob-focus" data-id="' + id + '">' + t.icon + ' ' + t.label + '</button>';
    }).join('');
    return '' +
      '<div class="welcome">' +
      '<div class="logo">⚡</div>' +
      '<h1>每天<em>动一下</em><br>让坚持变容易</h1>' +
      '<p class="lead">30 秒填完，我帮你排好每周训练、挑好动作组合，还会像私人教练一样每天提醒你。</p>' +
      '<div class="steps">' +
      '<div class="step"><span class="n">1</span><div><div class="t">按目标选动作组合</div><div class="s">腹、手臂、腿、臀，各有一套科学搭配</div></div></div>' +
      '<div class="step"><span class="n">2</span><div><div class="t">跟着计时器练</div><div class="s">组数、休息、语音提示，不用自己记</div></div></div>' +
      '<div class="step"><span class="n">3</span><div><div class="t">教练每天提醒打卡</div><div class="s">连击、周目标，偷懒会被点名</div></div></div>' +
      '</div>' +
      '<div class="card">' +
      '<div class="field"><label>怎么称呼你（可留空）</label><input class="input" id="ob-nick" placeholder="比如：小圆" maxlength="12"></div>' +
      '<div class="field"><label>性别</label>' + welcomeSeg([{ id: 'f', label: '女' }, { id: 'm', label: '男' }], o.sex, 'ob-sex') + '</div>' +
      '<div class="grid3">' +
      '<div class="field"><label>年龄</label><input class="input" id="ob-age" type="number" inputmode="numeric" min="12" max="99" value="30"></div>' +
      '<div class="field"><label>身高 cm</label><input class="input" id="ob-height" type="number" inputmode="numeric" min="120" max="220" value="165"></div>' +
      '<div class="field"><label>体重 kg</label><input class="input" id="ob-weight" type="number" inputmode="decimal" min="30" max="250" value="70"></div>' +
      '</div>' +
      '<div class="field"><label>主要目标</label>' + welcomeSeg(D.goals.map(function (g) { return { id: g.id, label: g.label }; }), o.goal, 'ob-goal') + '<div class="tiny dim mt8" id="ob-goal-desc">' + esc(goalDesc(o.goal)) + '</div></div>' +
      '<div class="field"><label>想重点练哪里（可多选）</label><div class="chips">' + focusChips + '</div></div>' +
      '<div class="grid2">' +
      '<div class="field"><label>每周练几天</label>' + welcomeSeg([{ id: 3, label: '3 天' }, { id: 4, label: '4 天' }, { id: 5, label: '5 天' }], o.weeklyDays, 'ob-days') + '</div>' +
      '<div class="field"><label>每次时长</label>' + welcomeSeg([{ id: 10, label: '10 分' }, { id: 15, label: '15 分' }, { id: 20, label: '20 分' }], o.sessionMin, 'ob-min') + '</div>' +
      '</div>' +
      '<div class="field"><label>每天几点提醒你</label><input class="input" id="ob-time" type="time" value="' + esc(o.time) + '"></div>' +
      '<button class="btn primary block" data-action="onboard">生成我的训练计划 →</button>' +
      '<p class="tiny dim center mt12">数据只保存在你的设备上 · 本工具不替代医疗建议</p>' +
      '</div></div>';
  }

  function goalDesc(id) {
    for (var i = 0; i < D.goals.length; i++) if (D.goals[i].id === id) return D.goals[i].desc;
    return '';
  }

  function welcomeSeg(items, value, action) {
    return '<div class="seg">' + items.map(function (it) {
      return '<button data-action="' + action + '" data-id="' + esc(it.id) + '" class="' + (String(it.id) === String(value) ? 'on' : '') + '">' + esc(it.label) + '</button>';
    }).join('') + '</div>';
  }

  /* ---------------- 今日 ---------------- */
  function coachLineForToday() {
    var c = coach();
    var st = S.get();
    if (S.hasLogged()) return pick(c.finish);
    if (S.isOnLeave()) {
      var lines = {
        gentle: '今天请假了，安心休息，连击我帮你留着。',
        strict: '请假可以，明天别找借口。',
        funny: '请假条已收，连击帮你续上了。'
      };
      return lines[st.settings.coach] || lines.gentle;
    }
    var tp = S.todayPlan();
    var now = new Date();
    if (tp && tp.rest) return pick(c.restDay);
    var hm = pad(now.getHours()) + ':' + pad(now.getMinutes());
    var times = st.settings.times || [];
    if (times.length && hm > times[0]) return pick(c.missed);
    var s = S.streak();
    if (s >= 3) return (c.streak[0] || '').replace('{n}', s);
    return pick(c.greet);
  }

  function todayView() {
    var st = S.get();
    var now = new Date();
    var wk = S.weekMinutes(0);
    var target = S.weeklyTarget();
    var tp = S.todayPlan();
    var log = S.getLog();
    var leave = S.isOnLeave();
    var ms = S.missedStats();
    var nickname = st.profile.nickname ? '，' + esc(st.profile.nickname) : '';
    var coachC = coach();

    var strip = '';
    var ws = S.startOfWeek(now);
    for (var i = 0; i < 7; i++) {
      var d = S.addDays(ws, i);
      var dayLog = S.getLog(d);
      var dayLeave = S.isOnLeave(d);
      var pd = S.planForDate(d);
      var isToday = S.isSameDay(d, now);
      var missed = !dayLog && !dayLeave && pd && !pd.rest && S.daysBetween(d, now) > 0;
      var cls = 'daycell';
      if (isToday) cls += ' today';
      if (dayLog) cls += ' done';
      else if (dayLeave) cls += ' leave';
      else if (pd && pd.rest) cls += ' rest';
      else if (missed) cls += ' miss';
      var mark = dayLog ? '✓' : dayLeave ? '假' : (pd && pd.rest ? '·' : (isToday ? '今' : (missed ? '!' : '')));
      strip += '<div class="' + cls + '">' +
        '<div class="dow">' + S.weekdayCN(i) + '</div>' +
        '<div class="dot">' + mark + '</div>' +
        '</div>';
    }

    var main;
    if (!S.get().plan) {
      main = '<div class="card"><h3 style="font-size:18px">还没有训练计划</h3><p class="muted small mt8">根据你的目标生成一份每周计划吧。</p>' +
        '<button class="btn primary block mt16" data-action="regen">生成训练计划</button></div>';
    } else if (!tp || tp.rest) {
      main = '<div class="card">' +
        '<div class="row between"><div><div class="kicker tiny" style="color:var(--teal);letter-spacing:.16em;font-weight:800">休息日</div>' +
        '<h3 style="font-size:21px;font-weight:800;margin-top:4px">今天让身体恢复</h3></div><div style="font-size:34px">🌙</div></div>' +
        '<p class="muted small mt8">肌肉是在休息时长出来的。想动一动的话，来一组轻一点的。</p>' +
        '<div class="row mt16" style="gap:10px"><button class="btn primary grow" data-action="extra">今天加练一组</button>' +
        '<button class="btn ghost grow" data-action="start" data-id="mobility-l1-a">做拉伸</button></div></div>';
    } else {
      var program = S.programById(tp.programId);
      if (!program) {
        main = '<div class="card"><p class="muted">今天的训练组合找不到了，请重新生成计划。</p><button class="btn primary block mt12" data-action="regen">重新生成</button></div>';
      } else {
        var t = targetById(program.target);
        var doneBadge = log ? '<div class="notice ok mb12">✓ 今天已完成 ' + log.minutes + ' 分钟 · 消耗约 ' + log.kcal + ' kcal</div>' : '';
        main = '<div class="card program">' +
          '<div class="kicker">' + t.icon + ' 今日训练 · ' + esc(t.label) + '</div>' +
          '<h3>' + esc(program.name) + '</h3>' +
          '<p class="muted small mt8">' + esc(program.desc) + '</p>' +
          '<div class="meta"><span><b>' + program.durationMin + '</b> 分钟</span><span>约 <b>' + S.programKcal(program) + '</b> kcal</span><span>' + levelCN(program.level) + '</span><span>' + program.items.length + ' 个动作</span></div>' +
          doneBadge +
          '<div class="exlist">' + programPreview(program) + '</div>' +
          '<div class="row mt16" style="gap:10px">' +
          '<button class="btn primary grow" data-action="start" data-id="' + esc(program.id) + '">' + (log ? '再练一次' : '开始训练') + '</button>' +
          '<button class="btn ghost" data-action="swap" data-id="' + esc(program.id) + '">换一套</button>' +
          '</div>' +
          '<button class="btn ghost block sm mt8" data-action="start-lite" data-id="' + esc(program.id) + '">没状态？先做 5 分钟保底版</button>' +
          (!log ? (leave
            ? '<div class="notice ok mt12">今天已请假，连击保护中 · <button class="link" data-action="cancel-leave">取消请假</button></div>'
            : '<div class="row mt8" style="justify-content:center"><button class="btn sm ghost" data-action="take-leave">今天有事？请假（不断连击）</button></div>') : '') +
          '</div>';
      }
    }

    return '' +
      '<div class="view-head"><div><div class="date">' + S.fmtMD(now) + ' · 周' + S.weekdayCN(S.mondayIndex(now)) + '</div>' +
      '<h1>' + S.greeting(now.getHours()) + nickname + '</h1>' +
      '<div class="sub">' + (log ? '今天已经动过了，很棒' : leave ? '今天已请假 · 连击保护中' : '今天也要动一下') + '</div></div>' +
      '<button class="iconbtn" data-route="me" aria-label="设置">⚙</button></div>' +

      '<div class="card tight coach mb12" style="margin-bottom:14px">' +
      '<div class="coach"><div class="avatar">' + coachC.emoji + '</div>' +
      '<div class="bubble"><span class="name">' + esc(coachC.name) + ' · ' + esc(coachC.label) + '</span>' + esc(coachLineForToday()) + '</div></div></div>' +

      '<div class="card hero">' +
      ringSVG(wk.minutes / target, '本周分钟', wk.minutes) +
      '<div class="hero-meta grow"><h2>本周目标 ' + target + ' 分钟</h2>' +
      '<p>' + (wk.minutes >= target ? '目标达成，保持住！' : '还差 ' + (target - wk.minutes) + ' 分钟，继续加油') + '</p>' +
      '<div class="pills"><span class="tag lime">🔥 连击 ' + S.streak() + ' 天</span><span class="tag teal">训练 ' + wk.days + ' 天</span></div></div></div>' +

      '<div class="section"><div class="section-head"><h2>本周节奏</h2><button class="link" data-route="plan">调整计划</button></div>' +
      '<div class="card tight"><div class="daystrip">' + strip + '</div></div>' +
      (ms.debt > 0 ? '<div class="card tight mt12" style="border-color:rgba(255,122,69,.35)"><div class="row between" style="gap:10px"><div><div class="tiny" style="color:var(--orange);font-weight:800">欠账 ' + ms.debt + ' 次</div><div class="tiny dim mt4">近 14 天缺练 ' + ms.missed + ' 次，休息日加练可补上</div></div><button class="btn sm warm" data-action="extra">加练一次</button></div></div>' : '') +
      '</div>' +

      '<div class="section">' + main + '</div>' +

      '<div class="section"><div class="section-head"><h2>小提醒</h2><span class="hint">安全第一</span></div>' +
      '<div class="card tight"><div class="tiny dim">' + esc(pick(D.safety)) + '</div></div></div>';
  }

  /* ---------------- 计划 ---------------- */
  function planView() {
    var st = S.get();
    if (!st.plan) {
      return '<div class="view-head"><div><h1>本周计划</h1><div class="sub">还没有计划</div></div></div>' +
        '<div class="card"><p class="muted">生成一份根据你目标排好的每周计划。</p><button class="btn primary block mt16" data-action="regen">生成训练计划</button></div>';
    }
    var now = new Date();
    var rows = '';
    for (var i = 0; i < 7; i++) {
      var d = S.addDays(S.startOfWeek(now), i);
      var p = st.plan.days[i];
      var isToday = S.isSameDay(d, now);
      var log = S.getLog(d);
      var leave = S.isOnLeave(d);
      var missedDay = !log && !leave && p && !p.rest && S.daysBetween(d, now) > 0;
      var label, sub, right;
      if (!p || p.rest) {
        label = '休息日';
        sub = leave ? '今天请假' : '恢复 · 拉伸 · 散步';
        right = '<button class="btn sm ghost" data-action="unrest" data-dow="' + i + '">安排训练</button>';
      } else {
        var prog = S.programById(p.programId);
        var t = targetById(p.type);
        label = prog ? prog.name : '待安排';
        sub = t.icon + ' ' + t.label + (prog ? ' · ' + prog.durationMin + ' 分钟' : '');
        right = '<button class="btn sm ghost" data-action="swap-dow" data-dow="' + i + '">换一套</button>';
      }
      var statusTag = leave ? '<span class="tag teal" style="margin-left:6px">请假</span>'
        : missedDay ? '<span class="tag orange" style="margin-left:6px">欠账</span>'
          : (isToday ? '<span class="tag lime" style="margin-left:6px">今天</span>' : '');
      rows += '<div class="li-row" style="' + (isToday ? 'border-color:rgba(200,255,61,.4)' : '') + '">' +
        '<div class="thumb" style="' + (log ? 'background:rgba(200,255,61,.16);color:var(--lime)' : leave ? 'background:rgba(61,218,215,.12);color:var(--teal)' : '') + '">' + (log ? '✓' : leave ? '假' : '<span style="font-size:11px;color:var(--dim)">' + S.weekdayCN(i) + '</span>') + '</div>' +
        '<div class="body"><div class="t">' + esc(label) + statusTag + '</div>' +
        '<div class="s">' + esc(sub) + '</div></div>' +
        (log ? '<span class="tag lime">' + log.minutes + ' 分</span>' : right) + '</div>';
    }
    var target = S.weeklyTarget();
    return '<div class="view-head"><div><div class="date">周计划</div><h1>这周怎么练</h1><div class="sub">每周 ' + st.settings.weeklyDays + ' 天 · 每次约 ' + st.settings.sessionMin + ' 分钟</div></div>' +
      '<button class="iconbtn" data-action="regen" aria-label="重新生成">↻</button></div>' +
      '<div class="card tight mb12"><div class="row between"><div><div class="tiny dim">每周目标</div><div style="font-size:22px;font-weight:800">' + target + ' <small class="small muted">分钟</small></div></div>' +
      '<div class="tiny dim" style="text-align:right">同一肌群<br>间隔 48 小时</div></div></div>' +
      '<div class="list">' + rows + '</div>' +
      '<p class="tiny dim center mt16">点「换一套」可以替换成同部位的其他组合</p>';
  }

  /* ---------------- 动作库 ---------------- */
  function libraryView() {
    var filters = [{ id: 'all', label: '全部' }].concat(D.targets.map(function (t) { return { id: t.id, label: t.icon + ' ' + t.label }; }));
    var chips = filters.map(function (f) {
      return '<button class="chip' + (ui.filter === f.id ? ' on' : '') + '" data-action="filter" data-id="' + f.id + '">' + esc(f.label) + '</button>';
    }).join('');
    var list = D.exercises.filter(function (ex) {
      if (ui.filter !== 'all' && ex.targets.indexOf(ui.filter) < 0) return false;
      if (ui.search) {
        var q = ui.search.toLowerCase();
        var hay = (ex.name + ' ' + ex.en + ' ' + ex.muscles.join(' ')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var rows = list.map(function (ex) {
      var t = targetById(ex.targets[0]);
      return '<button class="li-row" data-action="open-ex" data-id="' + esc(ex.id) + '">' +
        '<div class="thumb">' + t.icon + '</div>' +
        '<div class="body"><div class="t">' + esc(ex.name) + '</div>' +
        '<div class="s">' + esc(ex.muscles.join(' / ')) + ' · ' + levelCN(ex.level) + ' · ' + equipCN(ex.equipment) + '</div></div>' +
        '<span class="chev">›</span></button>';
    }).join('');
    return '<div class="view-head"><div><div class="date">动作库</div><h1>' + D.exercises.length + ' 个动作</h1><div class="sub">按部位挑选，看懂要点再做</div></div></div>' +
      '<div class="field"><input class="input" id="lib-search" placeholder="搜索动作 / 肌肉…" value="' + esc(ui.search) + '"></div>' +
      '<div class="chips mb12">' + chips + '</div>' +
      '<div class="list">' + (rows || '<div class="empty"><span class="e">🔍</span>没有找到匹配的动作</div>') + '</div>';
  }

  function equipCN(e) {
    return { none: '无器械', dumbbell: '哑铃', band: '弹力带', chair: '椅子', mat: '瑜伽垫' }[e] || '无器械';
  }

  function exerciseSheet(ex) {
    var t = targetById(ex.targets[0]);
    var srcs = (ex.refs || []).map(function (k) {
      var r = D.refs[k];
      return r ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + '</a>' : '';
    }).filter(Boolean).join(' · ');
    return '<div class="sheet">' +
      '<div class="grab"></div>' +
      '<button class="iconbtn close" data-action="close-sheet" aria-label="关闭">✕</button>' +
      '<div class="demo-wrap lg" data-demo="' + esc(demoKey(ex)) + '"><span class="demo-hint">示意动画</span></div>' +
      '<div class="row" style="gap:10px">' +
      '<div><h2>' + esc(ex.name) + '</h2><div class="tiny dim">' + esc(ex.en) + ' · ' + esc(ex.muscles.join(' / ')) + '</div></div></div>' +
      '<div class="row wrap mt12" style="gap:6px"><span class="tag lime">' + esc(t.label) + '</span><span class="tag">' + levelCN(ex.level) + '</span><span class="tag">' + equipCN(ex.equipment) + '</span><span class="tag ' + (ex.impact === 'low' ? 'teal' : ex.impact === 'high' ? 'orange' : '') + '">' + (ex.impact === 'low' ? '低冲击' : ex.impact === 'high' ? '高冲击' : '中等冲击') + '</span></div>' +
      '<div class="card tight mt12" style="background:rgba(255,255,255,.02)"><div class="row" style="gap:18px;align-items:center">' +
      MuscleMap.html(ex.muscles) +
      '<div><div class="tiny dim">主要锻炼</div><div class="strong" style="color:var(--lime);font-size:15px">' + esc(ex.muscles.join(' · ')) + '</div>' +
      '<div class="tiny dim mt8">高亮部位为本次动作的主要发力肌群</div></div></div></div>' +
      '<div class="divider"></div>' +
      '<div class="section-head"><h2 style="font-size:14px">动作要点</h2></div>' +
      '<ul style="display:grid;gap:6px">' + ex.cues.map(function (c) { return '<li class="small" style="display:flex;gap:8px"><span style="color:var(--lime)">·</span><span>' + esc(c) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="section-head" style="margin-top:14px"><h2 style="font-size:14px">常见错误</h2></div>' +
      '<ul style="display:grid;gap:6px">' + ex.mistakes.map(function (c) { return '<li class="small" style="display:flex;gap:8px"><span style="color:var(--orange)">×</span><span>' + esc(c) + '</span></li>'; }).join('') + '</ul>' +
      '<div class="grid2 mt16" style="gap:10px"><div class="card tight"><div class="tiny dim">降级版</div><div class="small mt8">' + esc(ex.easier) + '</div></div>' +
      '<div class="card tight"><div class="tiny dim">进阶版</div><div class="small mt8">' + esc(ex.harder) + '</div></div></div>' +
      (ex.caution ? '<div class="notice mt12">⚠ ' + esc(ex.caution) + '</div>' : '') +
      '<p class="tiny dim mt16">参考：' + (srcs || '通用训练原则') + '</p>' +
      '</div>';
  }

  /* ---------------- 体重趋势 / 报告 / 好友 ---------------- */
  function weightChart() {
    var list = S.weightSeries(90);
    if (!list.length) return '<div class="chart-empty">记录第一次体重后，这里会开始画趋势</div>';
    var W = 320, H = 150, PL = 30, PR = 12, PT = 12, PB = 24;
    var vals = list.map(function (w) { return Number(w.kg); });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (max - min < 1.5) { min -= 0.8; max += 0.8; }
    var tw = Number(S.get().profile.targetWeight) || 0;
    if (tw > 0 && Math.abs(tw - vals[vals.length - 1]) <= 8) {
      min = Math.min(min, tw);
      max = Math.max(max, tw);
    }
    var pad = (max - min) * 0.12;
    min -= pad; max += pad;
    var t0 = S.fromKey(list[0].date).getTime();
    var t1 = S.fromKey(list[list.length - 1].date).getTime();
    if (t1 === t0) t1 = t0 + 86400000;
    function X(t) { return PL + (W - PL - PR) * (t - t0) / (t1 - t0); }
    function Y(v) { return PT + (H - PT - PB) * (max - v) / (max - min); }
    var pts = list.map(function (w) {
      return { x: X(S.fromKey(w.date).getTime()), y: Y(Number(w.kg)), v: Number(w.kg) };
    });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
    var baseline = (H - PB).toFixed(1);
    var area = line + ' L' + pts[pts.length - 1].x.toFixed(1) + ' ' + baseline + ' L' + pts[0].x.toFixed(1) + ' ' + baseline + ' Z';
    var grid = '';
    for (var g = 0; g < 3; g++) {
      var gy = PT + (H - PT - PB) * g / 2;
      grid += '<line x1="' + PL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + gy.toFixed(1) + '" stroke="rgba(255,255,255,.06)" stroke-width="1"/>';
    }
    var dots = pts.map(function (p) {
      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="2.3" fill="#c8ff3d"/>';
    }).join('');
    var lastP = pts[pts.length - 1];
    var goal = '';
    if (tw > min && tw < max) {
      var gy2 = Y(tw);
      goal = '<line x1="' + PL + '" y1="' + gy2.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + gy2.toFixed(1) + '" stroke="rgba(255,122,69,.5)" stroke-width="1.2" stroke-dasharray="4 4"/>' +
        '<text x="' + (W - PR) + '" y="' + (gy2 - 4).toFixed(1) + '" text-anchor="end" font-size="9" fill="#ff9a63">目标 ' + tw + '</text>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" aria-label="体重趋势">' +
      '<defs><linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(200,255,61,.30)"/><stop offset="100%" stop-color="rgba(200,255,61,0)"/>' +
      '</linearGradient></defs>' + grid + goal +
      '<path d="' + area + '" fill="url(#wGrad)"/>' +
      '<path d="' + line + '" fill="none" stroke="#c8ff3d" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots +
      '<circle cx="' + lastP.x.toFixed(1) + '" cy="' + lastP.y.toFixed(1) + '" r="5" fill="#c8ff3d" opacity=".25"/>' +
      '<text x="' + PL + '" y="' + (H - 6) + '" font-size="9" fill="#5f6d7e">' + S.fmtMD(S.fromKey(list[0].date)) + '</text>' +
      '<text x="' + (W - PR) + '" y="' + (H - 6) + '" text-anchor="end" font-size="9" fill="#5f6d7e">' + S.fmtMD(S.fromKey(list[list.length - 1].date)) + '</text>' +
      '<text x="' + (PL - 6) + '" y="' + (PT + 4) + '" text-anchor="end" font-size="9" fill="#5f6d7e">' + max.toFixed(1) + '</text>' +
      '<text x="' + (PL - 6) + '" y="' + (H - PB) + '" text-anchor="end" font-size="9" fill="#5f6d7e">' + min.toFixed(1) + '</text>' +
      '</svg>';
  }

  function reportData(days) {
    var today = new Date();
    var from = S.addDays(today, -(days - 1));
    var sessions = 0, minutes = 0, kcal = 0, logs = [];
    var planned = 0;
    for (var i = 0; i < days; i++) {
      var d = S.addDays(from, i);
      var l = S.getLog(d);
      if (l) { sessions++; minutes += Number(l.minutes) || 0; kcal += Number(l.kcal) || 0; logs.push({ d: d, l: l }); }
      var p = S.planForDate(d);
      if (p && !p.rest) planned++;
    }
    var ws = S.weightSeries(days);
    var w0 = ws.length ? ws[0] : null;
    var w1 = ws.length ? ws[ws.length - 1] : null;
    var wDelta = (w0 && w1 && ws.length > 1) ? (Number(w1.kg) - Number(w0.kg)) : null;
    var counts = {};
    logs.forEach(function (x) {
      (x.l.programIds || []).forEach(function (pid) {
        var p = S.programById(pid);
        if (p) counts[p.target] = (counts[p.target] || 0) + 1;
      });
    });
    var topTarget = null, best = 0;
    Object.keys(counts).forEach(function (k) { if (counts[k] > best) { best = counts[k]; topTarget = k; } });
    return {
      days: days, from: from, today: today, sessions: sessions, minutes: minutes, kcal: kcal,
      planned: planned, completion: planned ? sessions / planned : 0,
      w0: w0, w1: w1, wDelta: wDelta, topTarget: topTarget, streak: S.streak()
    };
  }

  function reportComment(r) {
    if (r.sessions === 0) return '这段时间还没有打卡记录。明天先做 5 分钟保底版，把节奏找回来。';
    if (r.completion >= 0.8) return pick(['计划完成得很稳，继续保持这个节奏。', '状态很好，记得给身体留够恢复日。', '这段时间的执行力可以打高分。']);
    if (r.completion >= 0.5) return '已经在坚持了，再把每周的节奏稳一点，效果会更明显。';
    return '这段有点松。别急着补强度，先把「每天都动一下」找回来。';
  }

  function reportSheet(days) {
    var r = reportData(days);
    var c = coach();
    var title = days <= 7 ? '本周报告' : (days + ' 天报告');
    var period = S.fmtMD(r.from) + ' - ' + S.fmtMD(r.today);
    var targetName = r.topTarget ? targetById(r.topTarget).label : '—';
    var wText = r.wDelta === null ? '记录不足' : (r.wDelta > 0 ? '+' : '') + r.wDelta.toFixed(1) + ' kg';
    var comment = reportComment(r);
    var text = [
      '【练了吗 · ' + title + '】',
      period,
      '训练 ' + r.sessions + ' 次 · 共 ' + r.minutes + ' 分钟 · 约 ' + r.kcal + ' kcal',
      '计划完成率 ' + Math.round(r.completion * 100) + '% · 连续打卡 ' + r.streak + ' 天',
      '最常练：' + targetName,
      r.wDelta === null ? '体重：记录不足' : '体重：' + (r.w0 ? r.w0.kg : '—') + ' → ' + (r.w1 ? r.w1.kg : '—') + ' kg（' + wText + '）',
      '教练说：' + comment
    ].join('\n');
    ui.lastReport = text;
    ui.sheet = '<div class="sheet">' +
      '<div class="grab"></div>' +
      '<button class="iconbtn close" data-action="close-sheet" aria-label="关闭">✕</button>' +
      '<h2>' + esc(title) + '</h2>' +
      '<div class="tiny dim">' + esc(period) + '</div>' +
      '<div class="grid3 mt16">' +
      '<div class="wk-stat"><b>' + r.sessions + '</b><span>训练次数</span></div>' +
      '<div class="wk-stat"><b>' + r.minutes + '</b><span>总分钟</span></div>' +
      '<div class="wk-stat"><b>' + Math.round(r.completion * 100) + '%</b><span>计划完成率</span></div>' +
      '</div>' +
      '<div class="card tight mt16"><div class="toggle-lines">' +
      '<div class="line"><span class="muted">消耗估算</span><span class="strong">约 ' + r.kcal + ' kcal</span></div>' +
      '<div class="line"><span class="muted">连续打卡</span><span class="strong">' + r.streak + ' 天</span></div>' +
      '<div class="line"><span class="muted">最常练</span><span class="strong">' + esc(targetName) + '</span></div>' +
      '<div class="line"><span class="muted">体重变化</span><span class="strong">' + esc(wText) + '</span></div>' +
      '</div></div>' +
      '<div class="card tight coach mt16"><div class="coach"><div class="avatar">' + c.emoji + '</div>' +
      '<div class="bubble"><span class="name">' + esc(c.name) + '</span>' + esc(comment) + '</div></div></div>' +
      '<div class="row mt16" style="gap:10px">' +
      '<button class="btn ghost grow" data-action="copy-report">复制报告</button>' +
      '<button class="btn primary grow" data-action="close-sheet">完成</button>' +
      '</div>' +
      '</div>';
    renderSheet();
  }

  function timeAgo(ts) {
    if (!ts) return '未知';
    var diff = Date.now() - Number(ts);
    var min = Math.round(diff / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return min + ' 分钟前';
    var h = Math.round(min / 60);
    if (h < 24) return h + ' 小时前';
    return Math.round(h / 24) + ' 天前';
  }

  function friendView() {
    var st = S.get();
    var code = S.makeFriendCode();
    var rows = st.friends.map(function (f, i) {
      var d = f.data || {};
      var last = d.d ? S.fromKey(d.d) : null;
      var gap = last ? S.daysBetween(last, new Date()) : null;
      var status, cls;
      if (gap === null) { status = '还没有打卡'; cls = 'tag'; }
      else if (gap === 0) { status = '今天已打卡'; cls = 'tag lime'; }
      else if (gap >= 3) { status = '已 ' + gap + ' 天没打卡'; cls = 'tag orange'; }
      else { status = gap + ' 天前打卡'; cls = 'tag teal'; }
      return '<div class="card tight">' +
        '<div class="row between"><div class="row" style="gap:10px">' +
        '<div class="mini-avatar">' + esc(String(f.name || '友').slice(0, 1)) + '</div>' +
        '<div><div class="strong">' + esc(f.name || '好友') + '</div>' +
        '<div class="tiny dim">连续 ' + (d.s || 0) + ' 天 · 本周 ' + (d.w || 0) + ' 分钟 · 累计 ' + (d.t || 0) + ' 次</div></div></div>' +
        '<span class="' + cls + '">' + esc(status) + '</span></div>' +
        '<div class="row between mt8"><div class="tiny dim">更新于 ' + esc(timeAgo(f.updated)) + '</div>' +
        '<button class="btn sm ghost" data-action="remove-friend" data-idx="' + i + '">删除</button></div>' +
        '</div>';
    }).join('');
    return '<div class="view-head"><div><div class="date">好友监督</div><h1>互相盯着练</h1><div class="sub">离线互看 · 数据不经过服务器</div></div>' +
      '<button class="iconbtn" data-route="stats" aria-label="返回">←</button></div>' +

      '<div class="section"><div class="section-head"><h2>我的监督码</h2><span class="hint">发给好友</span></div>' +
      '<div class="card"><p class="tiny muted">好友在他的 App 里粘贴这串码，就能看到你的连续天数、本周分钟和最近打卡。</p>' +
      '<div class="cmd-box" id="my-code">' + esc(code) + '</div>' +
      '<button class="btn sm primary block mt8" data-action="copy-friend-code">复制监督码</button>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>添加好友</h2><span class="hint">粘贴对方的码</span></div>' +
      '<div class="card"><textarea class="input" id="friend-code" rows="3" placeholder="粘贴好友的监督码（LX1- 开头）"></textarea>' +
      '<button class="btn sm ghost block mt8" data-action="import-friend">导入好友</button>' +
      '<p class="tiny dim mt8">监督码只是一次快照；好友更新数据后，需要重新发码并导入。双方都需要安装同一个 App。</p>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>我的好友</h2><span class="hint">' + st.friends.length + ' 位</span></div>' +
      '<div class="list">' + (rows || '<div class="empty"><span class="e">👥</span>还没有好友，把你的监督码发给对方换一下</div>') + '</div></div>';
  }

  /* ---------------- 数据 ---------------- */
  function statsView() {
    var st = S.get();
    var total = S.totalStats();
    var wk = S.weekMinutes(0);
    var target = S.weeklyTarget();
    var week = S.last7();
    var maxMin = Math.max.apply(null, week.map(function (d) { return d.minutes; }).concat([target / 5, 10]));
    var bars = week.map(function (d) {
      var h = Math.round((d.minutes / maxMin) * 100);
      var lbl = ['一', '二', '三', '四', '五', '六', '日'][d.dow];
      return '<div class="b' + (d.minutes ? '' : ' zero') + '">' +
        '<div class="vl">' + (d.minutes || '') + '</div>' +
        '<div class="fill" style="height:' + Math.max(d.minutes ? 8 : 3, h) + '%"></div>' +
        '<div class="lb">' + lbl + '</div></div>';
    }).join('');

    // 28 天热力
    var heat = '';
    var today = new Date();
    for (var i = 27; i >= 0; i--) {
      var d = S.addDays(today, -i);
      var l = S.getLog(d);
      var m = l ? l.minutes : 0;
      var lv = m === 0 ? '' : m < 10 ? 'l1' : m < 20 ? 'l2' : 'l3';
      heat += '<i class="' + lv + (i === 0 ? ' today' : '') + '" title="' + S.dateKey(d) + ' ' + m + '分钟"></i>';
    }

    var bmi = S.calcBMI();
    var w = st.weights.length ? st.weights[st.weights.length - 1] : null;
    var firstW = st.weights.length ? st.weights[0] : null;
    var delta = (w && firstW && st.weights.length > 1) ? (w.kg - firstW.kg) : 0;

    return '<div class="view-head"><div><div class="date">数据</div><h1>你做到了什么</h1><div class="sub">记录会留在这台设备上</div></div></div>' +
      '<div class="tiles">' +
      '<div class="tile"><div class="k">连续打卡</div><div class="v">' + S.streak() + '<small>天</small></div><div class="f">' + (S.streak() >= 3 ? '保持住 🔥' : '从今天开始') + '</div></div>' +
      '<div class="tile"><div class="k">本周训练</div><div class="v">' + wk.minutes + '<small>/' + target + ' 分</small></div><div class="f">完成 ' + Math.round(pct(wk.minutes, target) * 100) + '%</div></div>' +
      '<div class="tile"><div class="k">累计训练</div><div class="v">' + total.sessions + '<small>次</small></div><div class="f">' + total.days + ' 个打卡日</div></div>' +
      '<div class="tile"><div class="k">累计时长</div><div class="v">' + total.totalMin + '<small>分钟</small></div><div class="f">' + (total.totalMin >= 60 ? '约 ' + Math.round(total.totalMin / 60) + ' 小时' : '继续累积') + '</div></div>' +
      '</div>' +
      (function () {
        var ms = S.missedStats();
        return '<div class="card tight mt12"><div class="row between"><div><div class="tiny dim">近 14 天缺练 / 补练</div><div class="small strong">' + ms.missed + ' 次 / ' + ms.makeups + ' 次</div></div>' +
          '<div style="text-align:right"><div class="tiny dim">当前欠账</div><div class="small strong" style="color:' + (ms.debt ? 'var(--orange)' : 'var(--lime)') + '">' + ms.debt + ' 次</div></div></div></div>';
      })() +

      '<div class="section"><div class="section-head"><h2>最近 7 天</h2><span class="hint">分钟</span></div>' +
      '<div class="card"><div class="bars">' + bars + '</div></div></div>' +

      '<div class="section"><div class="section-head"><h2>最近 28 天</h2><span class="hint">颜色越亮练得越久</span></div>' +
      '<div class="card"><div class="heat">' + heat + '</div></div></div>' +

      '<div class="section"><div class="section-head"><h2>体重趋势</h2><span class="hint">最近 90 天</span></div>' +
      '<div class="card">' + weightChart() + '</div></div>' +

      '<div class="section"><div class="section-head"><h2>身体数据</h2></div>' +
      '<div class="card">' +
      '<div class="row between"><div><div class="tiny dim">当前体重</div><div style="font-size:24px;font-weight:800">' + (w ? w.kg : (st.profile.weight || '—')) + ' <small class="small muted">kg</small></div></div>' +
      '<div style="text-align:right"><div class="tiny dim">BMI</div><div style="font-size:18px;font-weight:800">' + (bmi || '—') + ' <small class="small muted">' + S.bmiLabel(bmi) + '</small></div></div></div>' +
      (st.weights.length > 1 ? '<div class="tiny ' + (delta <= 0 ? 'muted' : 'muted') + ' mt8">较初始 ' + (delta > 0 ? '+' : '') + delta.toFixed(1) + ' kg</div>' : '') +
      '<div class="row mt12" style="gap:8px"><input class="input" id="weight-input" type="number" inputmode="decimal" step="0.1" placeholder="今天的体重 kg"><button class="btn sm primary" data-action="record-weight">记录</button></div>' +
      '<p class="tiny dim mt8">BMI 只是参考，不能替代体脂率与医生判断。</p>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>阶段报告</h2><span class="hint">可复制分享</span></div>' +
      '<div class="card"><p class="tiny muted">把这段时间的训练、体重、完成率整理成一份报告，也可以发给朋友。</p>' +
      '<div class="row mt12" style="gap:8px">' +
      '<button class="btn sm primary grow" data-action="open-report" data-days="7">本周报告</button>' +
      '<button class="btn sm ghost grow" data-action="open-report" data-days="28">28 天报告</button>' +
      '</div></div></div>' +

      '<div class="section"><div class="section-head"><h2>好友监督</h2><span class="hint">离线互看</span></div>' +
      '<div class="card"><div class="row between" style="gap:10px"><div><div class="small strong">互相看打卡，断签互相催</div>' +
      '<div class="tiny dim">用「监督码」复制粘贴交换，不需要服务器</div></div>' +
      '<span class="tag lime">' + S.get().friends.length + ' 位</span></div>' +
      '<button class="btn sm ghost block mt12" data-action="go-friend">管理好友 / 我的监督码</button></div></div>';
  }

  /* ---------------- 我的 / 设置 ---------------- */
  function meView() {
    var st = S.get();
    var p = st.profile;
    var s = st.settings;
    var bmi = S.calcBMI();
    var focusChips = ['abs', 'arms', 'legs', 'glutes'].map(function (id) {
      var t = targetById(id);
      return '<button class="chip' + (p.focus.indexOf(id) >= 0 ? ' on' : '') + '" data-action="toggle-focus" data-id="' + id + '">' + t.icon + ' ' + t.label + '</button>';
    }).join('');
    var times = s.times.map(function (t, i) {
      return '<div class="row" style="gap:8px;margin-bottom:8px"><input class="input" type="time" value="' + esc(t) + '" data-time="' + i + '">' +
        '<button class="iconbtn" data-action="remove-time" data-idx="' + i + '" aria-label="删除">✕</button></div>';
    }).join('');
    var coaches = Object.keys(D.coaches).map(function (k) {
      var c = D.coaches[k];
      return '<button class="li-row" data-action="set-coach" data-id="' + k + '" style="' + (s.coach === k ? 'border-color:rgba(200,255,61,.5);background:rgba(200,255,61,.06)' : '') + '">' +
        '<div class="thumb">' + c.emoji + '</div><div class="body"><div class="t">' + esc(c.name) + ' · ' + esc(c.label) + '</div><div class="s">' + esc(c.desc) + '</div></div>' +
        '<span class="chev">' + (s.coach === k ? '✓' : '') + '</span></button>';
    }).join('');

    return '<div class="view-head"><div><div class="date">我的</div><h1>设置</h1><div class="sub">调整后会自动更新计划</div></div></div>' +

      '<div class="card">' +
      '<div class="row between"><div><div class="tiny dim">当前身份</div><div style="font-size:18px;font-weight:800">' + (esc(p.nickname) || '未命名') + '</div></div>' +
      '<div style="text-align:right"><div class="tiny dim">BMI</div><div class="small strong">' + (bmi || '—') + ' ' + S.bmiLabel(bmi) + '</div></div></div>' +
      '<div class="grid3 mt12">' +
      '<div class="field" style="margin:0"><label>年龄</label><input class="input" data-profile="age" type="number" value="' + p.age + '"></div>' +
      '<div class="field" style="margin:0"><label>身高 cm</label><input class="input" data-profile="height" type="number" value="' + p.height + '"></div>' +
      '<div class="field" style="margin:0"><label>体重 kg</label><input class="input" data-profile="weight" type="number" step="0.1" value="' + p.weight + '"></div>' +
      '</div>' +
      '<div class="field mt12"><label>昵称</label><input class="input" data-profile="nickname" maxlength="12" value="' + esc(p.nickname) + '"></div>' +
      '<div class="field"><label>目标体重 kg（可选，用于体重曲线）</label><input class="input" data-profile="targetWeight" type="number" step="0.1" min="0" max="300" value="' + (p.targetWeight || '') + '"></div>' +
      '<div class="field"><label>主要目标</label>' + welcomeSeg(D.goals.map(function (g) { return { id: g.id, label: g.label }; }), p.goal, 'set-goal') + '</div>' +
      '<div class="field"><label>训练水平</label>' + welcomeSeg([{ id: 1, label: '入门' }, { id: 2, label: '进阶' }, { id: 3, label: '强化' }], p.level, 'set-level') + '</div>' +
      '<div class="field" style="margin-bottom:0"><label>重点部位</label><div class="chips">' + focusChips + '</div></div>' +
      '</div>' +

      '<div class="section"><div class="section-head"><h2>训练节奏</h2></div><div class="card">' +
      '<div class="field"><label>每周训练天数</label>' + welcomeSeg([{ id: 3, label: '3 天' }, { id: 4, label: '4 天' }, { id: 5, label: '5 天' }, { id: 6, label: '6 天' }], s.weeklyDays, 'set-days') + '</div>' +
      '<div class="field"><label>每次训练时长</label>' + welcomeSeg([{ id: 10, label: '10 分' }, { id: 15, label: '15 分' }, { id: 20, label: '20 分' }, { id: 30, label: '30 分' }], s.sessionMin, 'set-min') + '</div>' +
      '<div class="field" style="margin:0"><label>每周总时长目标（分钟）</label><input class="input" data-setting="weeklyTargetMin" type="number" inputmode="numeric" min="30" max="1200" value="' + S.weeklyTarget() + '"></div>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>提醒</h2><span class="hint">页面内 + 系统级</span></div><div class="card">' +
      '<div class="field"><label>每天提醒时间（可加多个）</label>' + times +
      '<button class="btn sm ghost block" data-action="add-time">+ 添加时间</button></div>' +
      '<div class="setting-row"><div class="b"><div class="t">系统通知</div><div class="s" id="notify-state">' + notifyStateText() + '</div></div>' +
      '<button class="btn sm primary" data-action="enable-notify">开启</button></div>' +
      '<div class="setting-row"><div class="b"><div class="t">语音教练</div><div class="s">训练与提醒时朗读</div></div>' +
      '<label class="switch"><input type="checkbox" data-toggle="tts"' + (s.tts ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<div class="setting-row"><div class="b"><div class="t">提示音</div><div class="s">组间休息结束响铃</div></div>' +
      '<label class="switch"><input type="checkbox" data-toggle="sound"' + (s.sound ? ' checked' : '') + '><span class="track"></span></label></div>' +
      '<button class="btn ghost block mt12" data-action="test-reminder">测试一次提醒</button>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>页面关闭也能提醒</h2><span class="hint">Windows</span></div><div class="card">' +
      '<p class="tiny muted">浏览器完全关闭后无法弹通知。运行一次下面的命令，系统会在每天 ' + esc(s.times[0] || '19:30') + ' 自动打开 App，到时 App 会自己弹提醒。</p>' +
      '<div class="cmd-box">' + esc(installCommand()) + '</div>' +
      '<button class="btn sm primary block mt8" data-action="copy-install">复制命令</button>' +
      '<p class="tiny dim mt8">在 PowerShell 里粘贴并回车即可；不想要了就运行 <span class="kbd">tools\\设置系统提醒.ps1 -Remove</span>。</p>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>你的教练</h2></div><div class="list">' + coaches + '</div></div>' +

      '<div class="section"><div class="section-head"><h2>安装到手机 / 电脑</h2><span class="hint">PWA</span></div><div class="card">' +
      '<p class="tiny muted">把 App 部署到 HTTPS 网址后，可以像原生 App 一样安装到桌面，离线也能打开。</p>' +
      '<div class="toggle-lines mt8">' +
      '<div class="line"><span class="muted">Android Chrome</span><span class="small">菜单 → 安装应用 / 添加到主屏幕</span></div>' +
      '<div class="line"><span class="muted">iPhone Safari</span><span class="small">分享 → 添加到主屏幕</span></div>' +
      '<div class="line"><span class="muted">Windows Edge</span><span class="small">右上角 … → 应用 → 安装此站点为应用</span></div>' +
      '</div>' +
      '<p class="tiny dim mt8">用 file:// 直接打开时无法安装，需要先按 docs/发布与安装.md 部署到网上。</p>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>数据</h2></div><div class="card">' +
      '<div class="row" style="gap:10px"><button class="btn ghost grow" data-action="export-data">导出备份</button>' +
      '<label class="btn ghost grow" for="import-file" style="cursor:pointer">导入备份</label></div>' +
      '<input type="file" id="import-file" accept=".json,application/json" style="display:none">' +
      '<button class="btn danger block mt8" data-action="reset-data">清空数据</button>' +
      '<p class="tiny dim mt12">版本 0.6 · 内容参考 WHO / CDC / ACSM 等公开指南，不构成医疗建议。</p>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2>内容依据</h2><span class="hint">公开指南</span></div><div class="card">' +
      '<p class="tiny dim">训练剂量与动作要点参考以下公开资料，仅作一般健身参考，不能替代医生或教练的个体化建议。</p>' +
      '<div class="row wrap mt12" style="gap:12px 16px">' + refLinks(['who', 'acsm', 'cn', 'cdc', 'met']) + '</div>' +
      '</div></div>';
  }

  function refLinks(keys) {
    return keys.map(function (k) {
      var r = D.refs[k];
      if (!r) return '';
      return '<a class="small" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + ' ↗</a>';
    }).join('');
  }

  function notifyStateText() {
    if (!('Notification' in window)) return '当前浏览器不支持';
    if (Notification.permission === 'granted') return '已开启';
    if (Notification.permission === 'denied') return '已被浏览器拒绝，请在站点设置里允许';
    return '未开启';
  }

  /* ---------------- 弹层 ---------------- */
  function renderSheet() {
    var root = $('#modal-root');
    if (!root) return;
    if (ui.sheet) {
      root.innerHTML = '<div class="sheet-wrap" data-action="sheet-backdrop">' + ui.sheet + '</div>';
    } else if (!ui.workout) {
      root.innerHTML = '';
    }
    if (global.Anim) global.Anim.autoMount(root);
  }

  function openExercise(id) {
    var ex = S.exerciseById(id);
    if (!ex) return;
    ui.sheet = exerciseSheet(ex);
    renderSheet();
  }

  function closeSheet() {
    if (ui.workout) return;
    ui.sheet = null;
    renderSheet();
  }

  /* ---------------- 训练播放器 ---------------- */
  function startWorkout(programId, lite) {
    var p = S.programById(programId);
    if (!p) { toast('找不到这套训练'); return; }
    var items = [];
    p.items.forEach(function (it) {
      var ex = S.exerciseById(it.exerciseId);
      if (!ex) return;
      items.push({ ex: ex, sets: it.sets, amount: it.amount, unit: it.unit, rest: it.rest || ex.rest || 45 });
    });
    if (lite) {
      items = items.slice(0, 3).map(function (it) {
        return { ex: it.ex, sets: 1, amount: it.amount, unit: it.unit, rest: 30 };
      });
    }
    if (!items.length) { toast('这套训练暂无可用动作'); return; }
    var total = 0;
    items.forEach(function (it) { total += it.sets; });
    ui.workout = {
      program: p, lite: !!lite, items: items, idx: 0, set: 1, phase: 'work',
      remaining: items[0].unit === 'sec' ? items[0].amount : 0,
      running: true, doneSets: 0, totalSets: total,
      started: Date.now(), elapsed: 0, done: null, lastSetSpoken: false
    };
    speak(pick(coach().pre));
    beep(720, 0.12);
    if (ui.wkTimer) clearInterval(ui.wkTimer);
    ui.wkTimer = setInterval(wkTick, 1000);
    renderWorkout();
  }

  function wkTick() {
    var w = ui.workout;
    if (!w || w.done) return;
    w.elapsed++;
    var timed = (w.phase === 'rest') || (w.phase === 'work' && w.items[w.idx].unit === 'sec');
    if (timed && w.running) {
      w.remaining--;
      if (w.remaining <= 0) {
        if (w.phase === 'rest') nextSet();
        else completeSet();
        return;
      }
    }
    updateTickUI();
  }

  function updateTickUI() {
    var w = ui.workout;
    if (!w || w.done) return;
    var el = document.getElementById('wk-count');
    if (el) {
      if (w.phase === 'rest') el.textContent = fmtSec(w.remaining);
      else if (w.items[w.idx].unit === 'sec') el.innerHTML = fmtSec(w.remaining) + '<small>秒</small>';
    }
    var bar = document.getElementById('wk-progress');
    if (bar) bar.style.width = Math.round((w.doneSets / w.totalSets) * 100) + '%';
  }

  function completeSet() {
    var w = ui.workout;
    if (!w || w.done) return;
    var it = w.items[w.idx];
    w.doneSets++;
    beep(880, 0.14);
    if (w.set >= it.sets) {
      w.idx++;
      if (w.idx >= w.items.length) { finishWorkout(); return; }
      w.set = 1;
    } else {
      w.set++;
    }
    w.phase = 'rest';
    w.remaining = it.rest || 40;
    w.running = true;
    var isLast = (w.idx === w.items.length - 1 && w.set === w.items[w.idx].sets);
    if (isLast && !w.lastSetSpoken) {
      w.lastSetSpoken = true;
      speak(pick(coach().lastSet));
    } else {
      speak(pick(coach().mid));
    }
    w.lastSetSpoken = false;
    renderWorkout();
  }

  function nextSet() {
    var w = ui.workout;
    if (!w) return;
    w.phase = 'work';
    var it = w.items[w.idx];
    w.remaining = it.unit === 'sec' ? it.amount : 0;
    w.running = true;
    beep(980, 0.12);
    renderWorkout();
  }

  function skipRest() {
    var w = ui.workout;
    if (!w) return;
    w.remaining = 0;
    nextSet();
  }

  function finishWorkout() {
    var w = ui.workout;
    if (!w) return;
    if (ui.wkTimer) { clearInterval(ui.wkTimer); ui.wkTimer = null; }
    var minutes = Math.max(1, Math.round(w.elapsed / 60));
    var kcal = S.programKcal(w.program);
    var log = S.recordSession(w.program, minutes, kcal);
    w.done = { minutes: minutes, kcal: kcal, log: log, streak: S.streak() };
    speak(pick(coach().finish));
    beep(1180, 0.2);
    setTimeout(function () { beep(1480, 0.22); }, 180);
    renderWorkout();
  }

  function closeWorkout() {
    if (ui.wkTimer) { clearInterval(ui.wkTimer); ui.wkTimer = null; }
    ui.workout = null;
    $('#modal-root').innerHTML = '';
    route = 'today';
    render();
    window.scrollTo(0, 0);
  }

  function renderWorkout() {
    var root = $('#modal-root');
    var w = ui.workout;
    if (!root) return;
    if (!w) { root.innerHTML = ''; return; }

    if (w.done) {
      var d = w.done;
      root.innerHTML = '<div class="workout"><div class="wk-body">' +
        '<div class="wk-summary">' +
        '<div class="big-emoji">🎉</div>' +
        '<h2>训练完成</h2>' +
        '<p class="muted small mt8">' + esc(pick(coach().finish)) + '</p>' +
        '<div class="grid3"><div class="wk-stat"><b>' + d.minutes + '</b><span>分钟</span></div>' +
        '<div class="wk-stat"><b>' + d.kcal + '</b><span>kcal</span></div>' +
        '<div class="wk-stat"><b>' + d.streak + '</b><span>连击天数</span></div></div>' +
        '<div class="mt20"><div class="tiny dim mb8">这次强度怎么样？（用于调整下次难度）</div>' +
        '<div class="row" style="gap:8px">' +
        ['easy:太轻松', 'ok:刚好', 'hard:太难'].map(function (s) {
          var kv = s.split(':');
          var on = w.feedback === kv[0];
          return '<button class="btn sm grow ' + (on ? 'primary' : 'ghost') + '" data-action="feedback" data-kind="' + kv[0] + '">' + kv[1] + '</button>';
        }).join('') +
        '</div></div>' +
        '<button class="btn primary block mt20" data-action="close-workout">完成打卡</button>' +
        '<p class="tiny dim mt12">' + esc(w.program.name) + ' · 记得补水和拉伸</p>' +
        '</div></div></div>';
      if (global.Anim) global.Anim.autoMount(root);
      return;
    }

    var it = w.items[w.idx];
    var ex = it.ex;
    var progress = Math.round((w.doneSets / w.totalSets) * 100);
    var isRest = w.phase === 'rest';
    var body, actions;

    if (isRest) {
      var nxtItem = w.items[w.idx];
      var nextEx = nxtItem.ex;
      body = '<div class="wk-body wk-rest">' +
        '<div class="wk-kicker">休息</div>' +
        '<div class="wk-count">' + fmtSec(w.remaining) + '</div>' +
        '<div class="wk-label">' + (w.running ? '放松呼吸' : '已暂停') + '</div>' +
        '<p class="wk-next mt12">下一组 · ' + esc(nextEx.name) + ' · 第 ' + w.set + '/' + nxtItem.sets + ' 组</p>' +
        '</div>';
      actions = '<div class="wk-actions"><div class="row">' +
        '<button class="btn ghost grow" data-action="wk-skip-rest">跳过休息</button>' +
        '<button class="btn warm grow" data-action="wk-toggle">' + (w.running ? '暂停' : '继续') + '</button>' +
        '</div><button class="btn ghost block" data-action="wk-exit">结束训练</button></div>';
    } else {
      var rest = it.rest || 45;
      body = '<div class="wk-body">' +
        '<div class="demo-wrap sm" data-demo="' + esc(demoKey(ex)) + '"><span class="demo-hint">示意动画</span></div>' +
        '<div class="wk-kicker">动作 ' + (w.idx + 1) + ' / ' + w.items.length + '</div>' +
        '<div class="wk-name">' + esc(ex.name) + '</div>' +
        '<p class="wk-cue">' + esc(ex.cues[0] || '') + '</p>' +
        (it.unit === 'sec'
          ? '<div class="wk-count" id="wk-count">' + fmtSec(w.remaining) + '<small>秒</small></div>'
          : '<div class="wk-count" id="wk-count">' + it.amount + '<small>次</small></div>') +
        '<div class="wk-label">第 ' + w.set + ' / ' + it.sets + ' 组 · 组间休息 ' + rest + ' 秒</div>' +
        '<div class="wk-setdots">' + dots(it.sets, w.set) + '</div>' +
        '<div class="wk-muscle">' + MuscleMap.html(ex.muscles, { sm: true }) +
        '<div class="wk-muscle-txt"><div class="tiny dim">主要锻炼</div><div class="v">' + esc(ex.muscles.join(' · ')) + '</div></div></div>' +
        '</div>';
      actions = '<div class="wk-actions">' +
        (it.unit === 'sec' ? '<div class="row"><button class="btn warm grow" data-action="wk-toggle">' + (w.running ? '暂停' : '继续') + '</button>' +
          '<button class="btn primary grow" data-action="wk-set-done">完成本组</button></div>'
          : '<button class="btn primary block" data-action="wk-set-done">完成本组</button>' +
          '<div class="row"><button class="btn ghost grow" data-action="wk-skip">跳过这个动作</button></div>') +
        '<button class="btn ghost block" data-action="wk-exit">结束训练</button>' +
        '</div>';
    }

    root.innerHTML = '<div class="workout">' +
      '<div class="wk-top"><div class="tiny dim">' + esc(w.program.name) + (w.lite ? ' · 5 分钟版' : '') + '</div>' +
      '<button class="iconbtn" data-action="wk-exit" aria-label="退出">✕</button></div>' +
      '<div class="wk-progress"><i id="wk-progress" style="width:' + progress + '%"></i></div>' +
      body + actions + '</div>';
    if (global.Anim) global.Anim.autoMount(root);
  }

  function dots(total, current) {
    var out = '';
    for (var i = 1; i <= total; i++) {
      out += '<i class="' + (i < current ? 'on' : i === current ? 'cur' : '') + '"></i>';
    }
    return out;
  }

  /* ---------------- 提醒引擎 ---------------- */
  function notifyEnabled() {
    return ('Notification' in window) && Notification.permission === 'granted';
  }

  function checkReminders(silent) {
    var st = S.get();
    if (!st.onboarded) return;
    if (S.hasLogged()) return;
    if (S.isOnLeave()) return; // 请假当天不打扰
    var now = new Date();
    var hh = pad(now.getHours()), mm = pad(now.getMinutes());
    var cur = hh + ':' + mm;
    var today = S.dateKey(now);
    var times = st.settings.times || [];
    for (var i = 0; i < times.length; i++) {
      var t = times[i];
      var key = today + '@' + t;
      if (ui.reminded[key]) continue;
      if (!isTimeWithin(t, cur, 240)) continue;
      ui.reminded[key] = true;
      fireReminder(t);
      if (!silent) return;
    }
  }

  function minutesOf(hhmm) {
    var p = String(hhmm).split(':');
    return (Number(p[0]) || 0) * 60 + (Number(p[1]) || 0);
  }
  function isTimeWithin(t, cur, windowMin) {
    var a = minutesOf(t), b = minutesOf(cur);
    var diff = b - a;
    return diff >= 0 && diff <= windowMin;
  }

  function fireReminder(time) {
    var c = coach();
    var msg = pick(c.missed);
    showBanner(msg, time);
    speak(msg);
    if (notifyEnabled()) {
      try {
        new Notification('该运动啦 · 练了吗', { body: msg, tag: 'movelog', silent: false });
      } catch (e) { /* ignore */ }
    }
    beep(640, 0.18);
  }

  function showBanner(msg, time) {
    var old = $('#reminder-banner');
    if (old) old.remove();
    var el = document.createElement('div');
    el.id = 'reminder-banner';
    el.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:95;width:min(94vw,480px);' +
      'background:linear-gradient(135deg,#1c2530,#141b24);border:1px solid rgba(200,255,61,.4);border-radius:18px;' +
      'padding:14px 16px;box-shadow:0 18px 44px rgba(0,0,0,.5);display:flex;gap:12px;align-items:flex-start;';
    el.innerHTML = '<div style="font-size:24px">' + coach().emoji + '</div>' +
      '<div style="flex:1;min-width:0"><div style="font-size:11px;color:var(--lime);font-weight:800;letter-spacing:.08em">' + esc(time) + ' · 训练提醒</div>' +
      '<div style="font-size:13px;margin-top:3px">' + esc(msg) + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
      '<button data-action="banner-start" style="flex:1;min-height:36px;border-radius:999px;background:#c8ff3d;color:#10160a;font-weight:800;font-size:13px">现在开始</button>' +
      '<button data-action="banner-later" style="min-height:36px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);color:#8d9caf;font-size:13px">稍后</button>' +
      '</div></div>';
    document.body.appendChild(el);
  }

  function hideBanner() {
    var el = $('#reminder-banner');
    if (el) el.remove();
  }

  /* ---------------- 系统级提醒 ---------------- */
  function installCommand() {
    var time = (S.get().settings.times[0] || '19:30');
    var file = '';
    try {
      if (location.protocol === 'file:') {
        file = decodeURIComponent(location.pathname || '');
        if (file.charAt(0) === '/') file = file.slice(1);
        file = file.replace(/\//g, '\\');
      }
    } catch (e) { }
    if (!file) file = 'E:\\运动提醒APP\\index.html';
    var script = file.replace(/index\.html$/i, 'tools\\设置系统提醒.ps1');
    return 'powershell -ExecutionPolicy Bypass -File "' + script + '" -Time ' + time;
  }

  function copyText(text, okMsg) {
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast(okMsg || '已复制');
      } catch (e) {
        toast('复制失败，请手动选中命令');
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg || '已复制'); }, fallback);
    } else {
      fallback();
    }
  }

  function copyInstallCommand() {
    copyText(installCommand(), '安装命令已复制');
  }

  /* ---------------- 数据导出 ---------------- */
  function exportData() {
    try {
      var blob = new Blob([S.exportJSON()], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'movelog-backup-' + S.dateKey() + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast('已导出备份文件');
    } catch (e) {
      toast('导出失败：' + e.message);
    }
  }

  /* ---------------- 事件 ---------------- */
  function closestAction(el) {
    while (el && el !== document) {
      if (el.getAttribute && el.getAttribute('data-action')) return el;
      el = el.parentNode;
    }
    return null;
  }

  function onClick(e) {
    // 弹层背景点击关闭
    var backdrop = e.target.closest ? e.target.closest('[data-action="sheet-backdrop"]') : null;
    if (backdrop && e.target.getAttribute && e.target.getAttribute('data-action') === 'sheet-backdrop') {
      closeSheet();
      return;
    }
    var nav = e.target.closest ? e.target.closest('[data-route]') : null;
    if (nav && !nav.getAttribute('data-action')) {
      go(nav.getAttribute('data-route'));
      return;
    }
    var el = closestAction(e.target);
    if (!el) return;
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');
    var st = S.get();

    switch (action) {
      /* 欢迎页 */
      case 'ob-sex':
        ui.onboard.sex = id;
        markSeg(el);
        break;
      case 'ob-goal':
        ui.onboard.goal = id;
        markSeg(el);
        var gd = $('#ob-goal-desc');
        if (gd) gd.textContent = goalDesc(id);
        break;
      case 'ob-days':
        ui.onboard.weeklyDays = Number(id);
        markSeg(el);
        break;
      case 'ob-min':
        ui.onboard.sessionMin = Number(id);
        markSeg(el);
        break;
      case 'ob-focus':
        toggleInArray(ui.onboard.focus, id);
        el.classList.toggle('on');
        break;
      case 'onboard':
        doOnboard();
        break;

      /* 导航 / 通用 */
      case 'regen':
        S.generatePlan();
        toast('已按你的设置生成新计划');
        go('today');
        break;
      case 'start':
        startWorkout(id);
        break;
      case 'start-lite':
        startWorkout(id, true);
        break;
      case 'extra':
        startExtra();
        break;
      case 'take-leave':
        S.setLeave(null, true);
        toast('今天已请假，连击保护中');
        render();
        break;
      case 'cancel-leave':
        S.setLeave(null, false);
        toast('已取消请假，今天还是练一下吧');
        render();
        break;
      case 'feedback':
        if (ui.workout && ui.workout.program) {
          var kind = el.getAttribute('data-kind');
          var newLv = S.recordFeedback(ui.workout.program, kind);
          ui.workout.feedback = kind;
          var tips = {
            easy: '已记录，下次同部位会加一点难度（目标 ' + ['', '入门', '进阶', '强化'][newLv] + '）',
            ok: '已记录，下次保持这个强度',
            hard: '已记录，下次同部位会换轻松一点的组合'
          };
          toast(tips[kind] || '已记录');
          renderWorkout();
        }
        break;
      case 'copy-install':
        copyInstallCommand();
        break;
      case 'go-friend':
        go('friend');
        break;
      case 'open-report':
        reportSheet(Number(el.getAttribute('data-days')) || 7);
        break;
      case 'copy-report':
        copyText(ui.lastReport || '', '报告已复制');
        break;
      case 'copy-friend-code':
        var mc = document.getElementById('my-code');
        copyText(mc ? mc.textContent : S.makeFriendCode(), '监督码已复制');
        break;
      case 'import-friend':
        var fc = document.getElementById('friend-code');
        if (!fc || !fc.value.trim()) { toast('先粘贴好友的监督码'); break; }
        try {
          S.addFriend(fc.value);
          toast('已添加好友');
          render();
        } catch (err) {
          toast(err.message || '监督码无法识别');
        }
        break;
      case 'remove-friend':
        S.removeFriend(Number(el.getAttribute('data-idx')));
        toast('已删除好友');
        render();
        break;
      case 'swap':
        swapToday(id);
        break;
      case 'swap-dow':
        swapDow(Number(el.getAttribute('data-dow')));
        break;
      case 'unrest':
        unrest(Number(el.getAttribute('data-dow')));
        break;
      case 'filter':
        ui.filter = id;
        render();
        break;
      case 'open-ex':
        openExercise(id);
        break;
      case 'close-sheet':
        closeSheet();
        break;

      /* 设置 */
      case 'set-sex':
        S.updateProfile({ sex: id }); render(); break;
      case 'set-goal':
        S.updateProfile({ goal: id }); render(); break;
      case 'set-level':
        S.updateProfile({ level: Number(id) }); S.generatePlan(); render(); break;
      case 'toggle-focus':
        var f = st.profile.focus.slice();
        toggleInArray(f, id);
        if (!f.length) f = [id];
        S.updateProfile({ focus: f });
        S.generatePlan();
        render();
        break;
      case 'set-coach':
        S.updateSettings({ coach: id });
        var c = D.coaches[id];
        toast(c.name + '：' + pick(c.greet));
        speak(pick(c.greet));
        render();
        break;
      case 'set-days':
        S.updateSettings({ weeklyDays: Number(id) });
        recalcTarget();
        S.generatePlan();
        render();
        break;
      case 'set-min':
        S.updateSettings({ sessionMin: Number(id) });
        recalcTarget();
        S.generatePlan();
        render();
        break;
      case 'add-time':
        var ts = st.settings.times.slice();
        if (ts.length >= 4) { toast('最多设置 4 个提醒时间'); break; }
        ts.push('20:30');
        S.updateSettings({ times: ts });
        render();
        break;
      case 'remove-time':
        var idx = Number(el.getAttribute('data-idx'));
        var ts2 = st.settings.times.slice();
        ts2.splice(idx, 1);
        if (!ts2.length) ts2 = ['19:30'];
        S.updateSettings({ times: ts2 });
        render();
        break;
      case 'enable-notify':
        requestNotify();
        break;
      case 'test-reminder':
        fireReminder(st.settings.times[0] || '19:30');
        toast('提醒效果已触发');
        break;
      case 'record-weight':
        var wi = $('#weight-input');
        var kg = wi ? parseFloat(wi.value) : NaN;
        if (!kg || kg < 20 || kg > 300) { toast('请输入有效体重'); break; }
        S.addWeight(kg);
        S.updateProfile({ weight: kg });
        toast('已记录：' + kg + ' kg');
        render();
        break;
      case 'export-data':
        exportData();
        break;
      case 'reset-data':
        if (window.confirm('确定清空所有训练记录和设置吗？此操作不可撤销。')) {
          S.reset();
          ui.onboard = { sex: 'f', goal: 'fatloss', focus: ['abs', 'arms', 'legs', 'glutes'], weeklyDays: 4, sessionMin: 15, time: '19:30' };
          route = 'today';
          render();
          toast('已清空');
        }
        break;

      /* 训练播放器 */
      case 'wk-toggle':
        if (ui.workout) { ui.workout.running = !ui.workout.running; renderWorkout(); }
        break;
      case 'wk-set-done':
        completeSet();
        break;
      case 'wk-skip':
        skipExercise();
        break;
      case 'wk-skip-rest':
        skipRest();
        break;
      case 'wk-exit':
        if (window.confirm('结束本次训练？已完成的会记录。')) {
          if (ui.workout && !ui.workout.done && ui.workout.doneSets > 0) {
            finishWorkout();
          } else {
            closeWorkout();
          }
        }
        break;
      case 'close-workout':
        closeWorkout();
        break;

      /* 提醒横幅 */
      case 'banner-start':
        hideBanner();
        var tp = S.todayPlan();
        if (tp && tp.programId) startWorkout(tp.programId);
        else go('today');
        break;
      case 'banner-later':
        hideBanner();
        break;
    }
  }

  function markSeg(btn) {
    var seg = btn.parentNode;
    if (!seg) return;
    var kids = seg.querySelectorAll('button');
    for (var i = 0; i < kids.length; i++) kids[i].classList.remove('on');
    btn.classList.add('on');
  }

  function toggleInArray(arr, v) {
    var i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(v);
  }

  function recalcTarget() {
    var st = S.get();
    var days = Number(st.settings.weeklyDays) || 4;
    var min = Number(st.settings.sessionMin) || 15;
    S.updateSettings({ weeklyTargetMin: days * min });
  }

  function doOnboard() {
    var nick = ($('#ob-nick') || {}).value || '';
    var age = parseInt(($('#ob-age') || {}).value, 10) || 30;
    var height = parseFloat(($('#ob-height') || {}).value) || 165;
    var weight = parseFloat(($('#ob-weight') || {}).value) || 70;
    var time = ($('#ob-time') || {}).value || '19:30';
    var o = ui.onboard;
    S.updateProfile({
      nickname: nick.trim(),
      sex: o.sex,
      age: clamp(age, 12, 99),
      height: clamp(height, 120, 220),
      weight: clamp(weight, 30, 250),
      goal: o.goal,
      level: 1,
      focus: o.focus.length ? o.focus.slice() : ['abs', 'arms', 'legs', 'glutes']
    });
    S.updateSettings({
      weeklyDays: o.weeklyDays,
      sessionMin: o.sessionMin,
      times: [time],
      weeklyTargetMin: o.weeklyDays * o.sessionMin,
      coach: S.get().settings.coach || 'gentle'
    });
    S.set({ onboarded: true });
    S.generatePlan();
    route = 'today';
    render();
    toast('计划已生成，今晚就开始吧');
    setTimeout(function () { speak(pick(coach().greet)); }, 600);
  }

  function startExtra() {
    var st = S.get();
    var focus = (st.profile.focus && st.profile.focus[0]) || 'abs';
    var pid = S.pickProgram(focus, S.levelFor(focus), st.settings.sessionMin, null);
    if (!pid) return;
    startWorkout(pid);
  }

  function swapToday(excludeId) {
    var st = S.get();
    var idx = S.mondayIndex(new Date());
    var p = st.plan.days[idx];
    if (!p || p.rest) { toast('今天是休息日'); return; }
    var nid = S.pickProgram(p.type, S.levelFor(p.type), st.settings.sessionMin, excludeId);
    if (!nid) { toast('没有更多可选组合了'); return; }
    p.programId = nid;
    S.save();
    render();
    toast('已换一套：' + (S.programById(nid) || {}).name);
  }

  function swapDow(dow) {
    var st = S.get();
    var p = st.plan.days[dow];
    if (!p || p.rest) return;
    var nid = S.pickProgram(p.type, S.levelFor(p.type), st.settings.sessionMin, p.programId);
    if (!nid) { toast('没有更多可选组合了'); return; }
    p.programId = nid;
    S.save();
    render();
    toast('已换一套');
  }

  function unrest(dow) {
    var st = S.get();
    var types = ['legs', 'abs', 'arms', 'glutes', 'full'];
    var type = types[dow % types.length];
    var pid = S.pickProgram(type, S.levelFor(type), st.settings.sessionMin, null);
    if (!pid) return;
    st.plan.days[dow] = { dow: dow, rest: false, type: type, programId: pid };
    S.save();
    render();
    toast('已安排：' + targetById(type).label);
  }

  function skipExercise() {
    var w = ui.workout;
    if (!w) return;
    w.doneSets += Math.max(0, w.items[w.idx].sets - w.set + 1);
    w.idx++;
    if (w.idx >= w.items.length) { finishWorkout(); return; }
    w.set = 1;
    w.phase = 'rest';
    w.remaining = 30;
    w.running = true;
    renderWorkout();
  }

  function requestNotify() {
    if (!('Notification' in window)) { toast('当前浏览器不支持系统通知'); return; }
    if (Notification.permission === 'granted') { toast('通知已开启'); return; }
    if (Notification.permission === 'denied') { toast('已被拒绝，请在浏览器设置中允许'); return; }
    Notification.requestPermission().then(function (p) {
      S.updateSettings({ notify: p === 'granted' });
      if (p === 'granted') {
        toast('通知已开启');
        try { new Notification('练了吗', { body: '通知已开启，我会按时提醒你。' }); } catch (e) { }
      } else {
        toast('未开启通知，仍会显示页面内提醒');
      }
      render();
    }).catch(function () { toast('无法请求通知权限'); });
  }

  /* ---------------- 输入事件 ---------------- */
  function onChange(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    if (t.id === 'import-file' && t.files && t.files[0]) {
      var file = t.files[0];
      var reader = new FileReader();
      reader.onload = function () {
        try {
          S.importJSON(String(reader.result));
          toast('已导入备份');
          render();
        } catch (err) {
          toast('备份文件无法解析');
        }
      };
      reader.readAsText(file);
      return;
    }
    var setting = t.getAttribute('data-setting');
    var prof = t.getAttribute('data-profile');
    var timeIdx = t.getAttribute('data-time');
    var toggle = t.getAttribute('data-toggle');

    if (setting) {
      var v = Number(t.value);
      if (isNaN(v)) return;
      var patch = {};
      patch[setting] = clamp(v, 30, 1200);
      S.updateSettings(patch);
      toast('已保存');
      render();
      return;
    }
    if (prof) {
      var pv = t.value;
      var num = parseFloat(pv);
      var p = {};
      if (prof === 'nickname') p.nickname = String(pv).slice(0, 12);
      else if (!isNaN(num)) {
        if (prof === 'age') p.age = clamp(Math.round(num), 12, 99);
        else if (prof === 'height') p.height = clamp(num, 120, 220);
        else p[prof] = clamp(num, 30, 250);
      }
      S.updateProfile(p);
      toast('已保存');
      if (prof === 'height' || prof === 'weight') render();
      return;
    }
    if (timeIdx != null) {
      var st = S.get();
      var times = st.settings.times.slice();
      times[Number(timeIdx)] = t.value || '19:30';
      S.updateSettings({ times: times });
      toast('提醒时间已更新');
      return;
    }
    if (toggle) {
      var val = !!t.checked;
      var o = {};
      o[toggle] = val;
      S.updateSettings(o);
      toast(val ? '已开启' : '已关闭');
      if (toggle === 'tts' && val) speak('语音已开启');
      return;
    }
  }

  var searchTimer = null;
  function onInput(e) {
    var t = e.target;
    if (!t || !t.id) return;
    if (t.id === 'lib-search') {
      ui.search = t.value.trim();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        var pos = window.scrollY;
        render();
        window.scrollTo(0, pos);
        var inp = $('#lib-search');
        if (inp) {
          inp.focus();
          try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) { }
        }
      }, 220);
    }
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    S.load();
    // 恢复 session 内的提醒状态
    try {
      var raw = sessionStorage.getItem('movelog.reminded');
      if (raw) ui.reminded = JSON.parse(raw);
    } catch (e) { }
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    render();
    // 提醒轮询
    setTimeout(function () { checkReminders(true); }, 1500);
    setInterval(function () {
      checkReminders(true);
      try { sessionStorage.setItem('movelog.reminded', JSON.stringify(ui.reminded)); } catch (e) { }
    }, 20000);
    // 训练中提示音的音频上下文解锁
    document.addEventListener('pointerdown', function once() {
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx && !audioCtx) audioCtx = new Ctx();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      } catch (e) { }
    }, { once: true });
    // 键盘快捷键（桌面）
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (ui.workout && !ui.workout.done) return; if (ui.sheet) closeSheet(); else hideBanner(); }
    });
  }

  global.UI = { render: render, boot: boot, go: go, startWorkout: startWorkout };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
