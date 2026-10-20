/* ==========================================================
   练了吗 · 状态与业务逻辑
   ========================================================== */
(function (global) {
  'use strict';

  var D = global.DATA;
  var KEY = 'movelog.v1';

  /* ---------------- 日期工具 ---------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function fromKey(k) {
    var p = String(k).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function addDays(d, n) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }
  function startOfWeek(d) {
    var x = new Date((d || new Date()).getFullYear(), (d || new Date()).getMonth(), (d || new Date()).getDate());
    var w = (x.getDay() + 6) % 7; // 周一 = 0
    return addDays(x, -w);
  }
  function mondayIndex(d) { return (d.getDay() + 6) % 7; }
  function weekdayCN(i) { return ['一', '二', '三', '四', '五', '六', '日'][i] || ''; }
  function fmtMD(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  function daysBetween(a, b) {
    var x = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    var y = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return Math.round((y - x) / 86400000);
  }
  function isSameDay(a, b) { return dateKey(a) === dateKey(b); }

  /* ---------------- 默认状态 ---------------- */
  function defaultState() {
    return {
      version: 1,
      onboarded: false,
      profile: {
        nickname: '',
        sex: 'f',
        age: 30,
        height: 165,
        weight: 70,
        targetWeight: 0,
        goal: 'fatloss',
        level: 1,
        focus: ['abs', 'arms', 'legs', 'glutes'],
        limits: []
      },
      settings: {
        weeklyDays: 4,
        sessionMin: 15,
        times: ['19:30'],
        coach: 'gentle',
        tts: true,
        sound: true,
        notify: false,
        weeklyTargetMin: 120,
        reminderRepeat: 20
      },
      plan: null,
      logs: {},
      weights: [],
      leaves: [],
      adapt: {},
      feedback: {},
      friends: [],
      createdAt: dateKey()
    };
  }

  var state = defaultState();

  /* ---------------- 读写 ---------------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var obj = JSON.parse(raw);
        state = normalize(obj);
        return state;
      }
    } catch (e) {
      console.warn('读取本地数据失败，使用默认状态', e);
    }
    state = normalize(defaultState());
    return state;
  }

  function normalize(obj) {
    var base = defaultState();
    if (!obj || typeof obj !== 'object') return base;
    var out = base;
    // 浅合并 + 类型保护
    ['onboarded', 'version'].forEach(function (k) {
      if (typeof obj[k] !== 'undefined') out[k] = obj[k];
    });
    if (obj.profile && typeof obj.profile === 'object') {
      Object.keys(base.profile).forEach(function (k) {
        if (typeof obj.profile[k] !== 'undefined' && obj.profile[k] !== null) out.profile[k] = obj.profile[k];
      });
    }
    if (obj.settings && typeof obj.settings === 'object') {
      Object.keys(base.settings).forEach(function (k) {
        if (typeof obj.settings[k] !== 'undefined' && obj.settings[k] !== null) out.settings[k] = obj.settings[k];
      });
    }
    if (!Array.isArray(out.profile.focus) || out.profile.focus.length === 0) out.profile.focus = base.profile.focus.slice();
    if (!Array.isArray(out.settings.times) || out.settings.times.length === 0) out.settings.times = base.settings.times.slice();
    if (obj.plan && obj.plan.days && obj.plan.days.length === 7) out.plan = obj.plan;
    if (obj.logs && typeof obj.logs === 'object') out.logs = obj.logs;
    if (Array.isArray(obj.weights)) out.weights = obj.weights;
    if (Array.isArray(obj.leaves)) out.leaves = obj.leaves.filter(function (k) { return typeof k === 'string'; });
    if (obj.adapt && typeof obj.adapt === 'object') out.adapt = obj.adapt;
    if (obj.feedback && typeof obj.feedback === 'object') out.feedback = obj.feedback;
    if (Array.isArray(obj.friends)) out.friends = obj.friends.filter(function (f) { return f && f.code; }).slice(0, 5);
    if (typeof obj.streakBest === 'number') out.streakBest = obj.streakBest;
    return out;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('保存失败', e);
    }
  }

  function get() { return state; }

  function set(patch) {
    state = normalize(Object.assign({}, state, patch));
    save();
    return state;
  }

  function updateProfile(patch) {
    Object.keys(patch).forEach(function (k) { state.profile[k] = patch[k]; });
    save();
    return state;
  }

  function updateSettings(patch) {
    Object.keys(patch).forEach(function (k) { state.settings[k] = patch[k]; });
    save();
    return state;
  }

  /* ---------------- 计划 ---------------- */
  function focusTypes(profile) {
    var focus = (profile.focus || []).filter(function (t) {
      return ['abs', 'arms', 'legs', 'glutes'].indexOf(t) >= 0;
    });
    if (!focus.length) focus = ['abs', 'legs', 'arms', 'glutes'];
    return focus;
  }

  function buildTypes(profile, weeklyDays) {
    var focus = focusTypes(profile);
    var types;
    if (weeklyDays <= 3) {
      types = ['full', 'full', 'full'];
    } else if (weeklyDays === 4) {
      types = focus.slice(0, 4);
      while (types.length < 4) types.push('full');
    } else if (weeklyDays === 5) {
      types = focus.concat(['cardio']);
    } else if (weeklyDays === 6) {
      types = focus.concat(['full', 'cardio']);
    } else {
      types = focus.concat(['full', 'cardio', 'mobility']);
    }
    return types.slice(0, 7);
  }

  function pickProgram(type, level, sessionMin, exclude) {
    var list = D.programs.filter(function (p) {
      return p.target === type && p.id !== exclude;
    });
    if (!list.length) return null;
    var under = list.filter(function (p) { return p.durationMin <= (sessionMin || 15); });
    var pool = under.length ? under : list.slice();
    pool.sort(function (a, b) {
      var la = Math.abs(a.level - level), lb = Math.abs(b.level - level);
      if (la !== lb) return la - lb;
      return a.durationMin - b.durationMin;
    });
    return pool[0].id;
  }

  function generatePlan(startDate) {
    var weeklyDays = Number(state.settings.weeklyDays) || 4;
    var trainingDays = D.weekTemplates[weeklyDays] || D.weekTemplates[4];
    var types = buildTypes(state.profile, weeklyDays);
    var sessionMin = Number(state.settings.sessionMin) || 15;
    var days = [];
    var k = 0;
    for (var i = 0; i < 7; i++) {
      if (trainingDays.indexOf(i) >= 0) {
        var type = types[k % types.length] || 'full';
        days.push({
          dow: i,
          rest: false,
          type: type,
          programId: pickProgram(type, levelFor(type), sessionMin, null)
        });
        k++;
      } else {
        days.push({ dow: i, rest: true, type: null, programId: null });
      }
    }
    state.plan = {
      startDate: dateKey(startOfWeek(startDate || new Date())),
      days: days,
      weeklyDays: weeklyDays,
      createdAt: dateKey()
    };
    save();
    return state.plan;
  }

  function todayPlan() {
    if (!state.plan) return null;
    var idx = mondayIndex(new Date());
    return state.plan.days[idx] || null;
  }

  function planForDate(d) {
    if (!state.plan) return null;
    return state.plan.days[mondayIndex(d)] || null;
  }

  function programById(id) {
    for (var i = 0; i < D.programs.length; i++) {
      if (D.programs[i].id === id) return D.programs[i];
    }
    return null;
  }
  function exerciseById(id) {
    for (var i = 0; i < D.exercises.length; i++) {
      if (D.exercises[i].id === id) return D.exercises[i];
    }
    return null;
  }

  /* ---------------- 体重趋势 / 好友监督 ---------------- */
  function weightSeries(limitDays) {
    var list = state.weights.slice();
    if (limitDays) {
      var from = dateKey(addDays(new Date(), -(limitDays - 1)));
      list = list.filter(function (w) { return w.date >= from; });
    }
    return list;
  }

  function lastLogDate() {
    var keys = Object.keys(state.logs).sort();
    return keys.length ? keys[keys.length - 1] : '';
  }

  function makeFriendCode() {
    var wk = weekMinutes(0);
    var total = totalStats();
    var obj = {
      v: 1,
      n: state.profile.nickname || '匿名',
      s: streak(),
      w: wk.minutes,
      t: total.sessions,
      m: total.totalMin,
      d: lastLogDate(),
      ts: Date.now()
    };
    return 'LX1-' + btoa(encodeURIComponent(JSON.stringify(obj)));
  }

  function parseFriendCode(code) {
    code = String(code || '').trim().replace(/\s+/g, '');
    if (code.indexOf('LX1-') !== 0) throw new Error('监督码格式不对（应以 LX1- 开头）');
    var json = decodeURIComponent(atob(code.slice(4)));
    var o = JSON.parse(json);
    if (!o || !o.n) throw new Error('监督码内容不完整');
    return o;
  }

  function addFriend(code) {
    var o = parseFriendCode(code);
    var code2 = String(code).trim().replace(/\s+/g, '');
    var existed = null;
    state.friends.forEach(function (f) { if (f.code === code2) existed = f; });
    if (existed) {
      existed.data = o;
      existed.name = o.n;
      existed.updated = Date.now();
      save();
      return existed;
    }
    if (state.friends.length >= 3) throw new Error('最多添加 3 位好友');
    var f = { name: o.n, code: code2, data: o, added: Date.now(), updated: Date.now() };
    state.friends.push(f);
    save();
    return f;
  }

  function removeFriend(i) {
    state.friends.splice(i, 1);
    save();
  }

  /* ---------------- 打卡 / 统计 ---------------- */
  function logKey() { return dateKey(new Date()); }
  function hasLogged(d) { return !!state.logs[dateKey(d || new Date())]; }
  function getLog(d) { return state.logs[dateKey(d || new Date())] || null; }

  function recordSession(program, minutes, kcal) {
    var key = logKey();
    var prev = state.logs[key];
    var log = {
      date: key,
      minutes: Math.max(1, Math.round(minutes)),
      kcal: Math.max(0, Math.round(kcal)),
      at: new Date().toISOString(),
      programIds: (prev && prev.programIds) ? prev.programIds.slice() : [],
      programNames: (prev && prev.programNames) ? prev.programNames.slice() : []
    };
    if (prev) {
      log.minutes += (prev.minutes || 0);
      log.kcal += (prev.kcal || 0);
    }
    if (program && program.id) {
      log.programIds.push(program.id);
      log.programNames.push(program.name);
    }
    state.logs[key] = log;
    save();
    return log;
  }

  function weekMinutes(offsetWeeks) {
    offsetWeeks = offsetWeeks || 0;
    var ws = addDays(startOfWeek(new Date()), offsetWeeks * 7);
    var total = 0, days = 0;
    for (var i = 0; i < 7; i++) {
      var k = dateKey(addDays(ws, i));
      if (state.logs[k]) {
        total += Number(state.logs[k].minutes) || 0;
        days++;
      }
    }
    return { minutes: total, days: days, start: ws };
  }

  function streak() {
    var n = 0;
    var d = new Date();
    // 今天没练也没请假 → 从昨天开始算
    if (!hasLogged(d) && !isOnLeave(d)) d = addDays(d, -1);
    var guard = 0;
    while (guard++ < 3650) {
      if (hasLogged(d)) n++;
      else if (!isOnLeave(d)) break; // 请假不断连击，但也不加分
      d = addDays(d, -1);
    }
    return n;
  }

  /* ---------------- 请假 / 欠账 ---------------- */
  function isOnLeave(d) {
    return state.leaves.indexOf(dateKey(d || new Date())) >= 0;
  }

  function setLeave(d, on) {
    var k = dateKey(d || new Date());
    var i = state.leaves.indexOf(k);
    if (on && i < 0) state.leaves.push(k);
    if (!on && i >= 0) state.leaves.splice(i, 1);
    state.leaves.sort();
    state.leaves = state.leaves.slice(-120);
    save();
    return isOnLeave(d);
  }

  /* 近 14 天：缺练 / 补练 / 欠账 */
  function missedStats() {
    var today = new Date();
    var from = addDays(today, -13);
    if (state.plan && state.plan.startDate) {
      var ps = fromKey(state.plan.startDate);
      if (ps > from && ps <= today) from = ps;
    }
    var missed = 0, makeups = 0, d = from, guard = 0;
    while (daysBetween(d, today) > 0 && guard++ < 400) {
      var p = planForDate(d);
      if (p) {
        if (!p.rest) {
          if (!hasLogged(d) && !isOnLeave(d)) missed++;
        } else if (hasLogged(d)) {
          makeups++; // 休息日加练算补练
        }
      }
      d = addDays(d, 1);
    }
    return { missed: missed, makeups: makeups, debt: Math.max(0, missed - makeups) };
  }

  /* ---------------- 难度自适应 ---------------- */
  function levelFor(target) {
    var base = Number(state.profile.level) || 1;
    var bias = Number(state.adapt[target]) || 0;
    var v = base + bias;
    if (v < 1) v = 1;
    if (v > 3) v = 3;
    return v;
  }

  function recordFeedback(program, kind) {
    if (!program || !program.target) return 0;
    var t = program.target;
    var a = Number(state.adapt[t]) || 0;
    if (kind === 'easy') a = Math.min(1, a + 1);
    else if (kind === 'hard') a = Math.max(-1, a - 1);
    state.adapt[t] = a;
    var f = state.feedback[program.id] || { easy: 0, ok: 0, hard: 0 };
    f[kind] = (Number(f[kind]) || 0) + 1;
    state.feedback[program.id] = f;
    save();
    return levelFor(t);
  }

  function plannedDaysBetween(from, to) {
    if (!state.plan) return 0;
    var n = 0, d = from;
    var guard = 0;
    while (daysBetween(d, to) >= 0 && guard < 400) {
      var p = planForDate(d);
      if (p && !p.rest) n++;
      d = addDays(d, 1);
      guard++;
    }
    return n;
  }

  function last7() {
    var arr = [];
    var today = new Date();
    for (var i = 6; i >= 0; i--) {
      var d = addDays(today, -i);
      var log = getLog(d);
      arr.push({
        date: d,
        key: dateKey(d),
        dow: mondayIndex(d),
        minutes: log ? log.minutes : 0,
        done: !!log
      });
    }
    return arr;
  }

  function totalStats() {
    var keys = Object.keys(state.logs);
    var totalMin = 0, sessions = 0;
    keys.forEach(function (k) {
      totalMin += Number(state.logs[k].minutes) || 0;
      sessions++;
    });
    return { totalMin: totalMin, sessions: sessions, days: keys.length };
  }

  function calcBMI() {
    var h = Number(state.profile.height) / 100;
    var w = Number(state.profile.weight);
    if (!h || !w) return null;
    return Math.round((w / (h * h)) * 10) / 10;
  }

  function bmiLabel(bmi) {
    if (bmi == null) return '';
    if (bmi < 18.5) return '偏轻';
    if (bmi < 24) return '正常';
    if (bmi < 28) return '超重';
    return '肥胖';
  }

  function estimateKcal(met, minutes) {
    var w = Number(state.profile.weight) || 70;
    return Math.round((met * 3.5 * w / 200) * minutes);
  }

  function programKcal(program) {
    if (!program) return 0;
    var total = 0;
    program.items.forEach(function (it) {
      var ex = exerciseById(it.exerciseId);
      if (!ex) return;
      var min;
      if (it.unit === 'sec') min = (it.amount * it.sets) / 60;
      else min = (it.amount * it.sets * 3.5) / 60; // 约 3.5 秒/次
      total += estimateKcal(ex.met, min);
    });
    return Math.round(total);
  }

  function addWeight(kg) {
    var k = dateKey();
    var list = state.weights.filter(function (w) { return w.date !== k; });
    list.push({ date: k, kg: Number(kg) });
    list.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    state.weights = list.slice(-180);
    save();
  }

  function weeklyTarget() {
    var t = Number(state.settings.weeklyTargetMin);
    if (!t || t < 30) t = (Number(state.settings.weeklyDays) || 4) * (Number(state.settings.sessionMin) || 15);
    return t;
  }

  function exportJSON() {
    return JSON.stringify(state, null, 2);
  }

  function importJSON(text) {
    var obj = JSON.parse(text);
    state = normalize(obj);
    save();
    return state;
  }

  function reset() {
    state = normalize(defaultState());
    save();
    return state;
  }

  function greeting(hour) {
    if (hour < 5) return '夜深了';
    if (hour < 11) return '早上好';
    if (hour < 13) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }

  global.Store = {
    KEY: KEY,
    load: load, save: save, get: get, set: set, reset: reset,
    updateProfile: updateProfile, updateSettings: updateSettings,
    generatePlan: generatePlan, todayPlan: todayPlan, planForDate: planForDate,
    programById: programById, exerciseById: exerciseById,
    dateKey: dateKey, fromKey: fromKey, addDays: addDays, startOfWeek: startOfWeek,
    mondayIndex: mondayIndex, weekdayCN: weekdayCN, fmtMD: fmtMD, daysBetween: daysBetween,
    isSameDay: isSameDay, parseKey: fromKey,
    hasLogged: hasLogged, getLog: getLog, recordSession: recordSession,
    isOnLeave: isOnLeave, setLeave: setLeave, missedStats: missedStats,
    levelFor: levelFor, recordFeedback: recordFeedback,
    weightSeries: weightSeries, lastLogDate: lastLogDate,
    makeFriendCode: makeFriendCode, parseFriendCode: parseFriendCode,
    addFriend: addFriend, removeFriend: removeFriend,
    weekMinutes: weekMinutes, streak: streak, last7: last7, totalStats: totalStats,
    calcBMI: calcBMI, bmiLabel: bmiLabel, estimateKcal: estimateKcal, programKcal: programKcal,
    addWeight: addWeight, weeklyTarget: weeklyTarget,
    exportJSON: exportJSON, importJSON: importJSON,
    greeting: greeting, pickProgram: pickProgram, plannedDaysBetween: plannedDaysBetween,
    logKey: logKey
  };
})(window);
