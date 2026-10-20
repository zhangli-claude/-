/* ==========================================================
   练了吗 · 目标肌群示意图（正面 / 背面人体图）
   根据动作的 muscles 字段高亮对应部位
   ========================================================== */
(function (global) {
  'use strict';

  /* 中文肌肉名 -> 区域 */
  function regionOf(name) {
    var n = String(name || '');
    if (/全身/.test(n)) return 'full';
    if (/腹直肌|腹横肌|核心/.test(n)) return 'abs';
    if (/腹斜肌/.test(n)) return 'obliques';
    if (/胸大肌|胸肌/.test(n)) return 'chest';
    if (/肱二头|肱肌/.test(n)) return 'biceps';
    if (/肱三头/.test(n)) return 'triceps';
    if (/三角肌|肩胛|肩部/.test(n)) return 'shoulders';
    if (/前臂|握力/.test(n)) return 'forearms';
    if (/背阔肌|菱形肌|斜方肌|上背/.test(n)) return 'back';
    if (/竖脊肌|下背|腰部/.test(n)) return 'lowerback';
    if (/臀大肌|臀中肌|臀部/.test(n)) return 'glutes';
    if (/股四头/.test(n)) return 'quads';
    if (/腘绳/.test(n)) return 'hamstrings';
    if (/小腿|腓肠/.test(n)) return 'calves';
    if (/髂腰肌|髋屈肌/.test(n)) return 'hipflexors';
    if (/下肢/.test(n)) return 'quads';
    if (/上肢/.test(n)) return 'biceps';
    return null;
  }

  function regionsFor(muscles) {
    var front = {}, back = {};
    (muscles || []).forEach(function (m) {
      var r = regionOf(m);
      if (!r) return;
      if (r === 'full') {
        ['chest', 'abs', 'obliques', 'shoulders', 'biceps', 'quads'].forEach(function (k) { front[k] = 1; });
        ['back', 'lats', 'lowerback', 'triceps', 'glutes', 'hamstrings'].forEach(function (k) { back[k] = 1; });
        return;
      }
      if (['abs', 'obliques', 'chest', 'biceps', 'shoulders', 'forearms', 'quads', 'calves', 'hipflexors'].indexOf(r) >= 0) front[r] = 1;
      if (['back', 'lowerback', 'triceps', 'glutes', 'hamstrings', 'calves', 'shoulders', 'forearms'].indexOf(r) >= 0) back[r] = 1;
    });
    return { front: front, back: back };
  }

  var BASE = '' +
    '<g class="mm-base">' +
    '<circle cx="60" cy="18" r="10"/>' +
    '<rect x="55" y="26" width="10" height="7" rx="3"/>' +
    '<rect x="44" y="31" width="32" height="50" rx="12"/>' +
    '<rect x="30" y="35" width="9" height="41" rx="4.5"/>' +
    '<rect x="81" y="35" width="9" height="41" rx="4.5"/>' +
    '<circle cx="34.5" cy="80" r="5"/>' +
    '<circle cx="85.5" cy="80" r="5"/>' +
    '<rect x="47" y="82" width="11" height="50" rx="5.5"/>' +
    '<rect x="62" y="82" width="11" height="50" rx="5.5"/>' +
    '<rect x="44" y="132" width="16" height="7" rx="3.5"/>' +
    '<rect x="60" y="132" width="16" height="7" rx="3.5"/>' +
    '</g>';

  var FRONT = {
    shoulders: '<circle cx="34.5" cy="38" r="6.5"/><circle cx="85.5" cy="38" r="6.5"/>',
    chest: '<path d="M47 36 h26 a7 7 0 0 1 0 14 h-26 a7 7 0 0 1 0 -14 z"/>',
    obliques: '<path d="M46 53 l5 5 v17 l-6 -3 z"/><path d="M74 53 l-5 5 v17 l6 -3 z"/>',
    abs: '<rect x="50" y="53" width="20" height="20" rx="5"/>',
    hipflexors: '<path d="M50 75 l8 0 0 7 -8 0 z"/><path d="M62 75 l8 0 0 7 -8 0 z" opacity="0.9"/>',
    biceps: '<rect x="30" y="42" width="9" height="15" rx="4.5"/><rect x="81" y="42" width="9" height="15" rx="4.5"/>',
    forearms: '<rect x="30" y="58" width="9" height="16" rx="4.5"/><rect x="81" y="58" width="9" height="16" rx="4.5"/>',
    quads: '<rect x="47" y="86" width="11" height="24" rx="5.5"/><rect x="62" y="86" width="11" height="24" rx="5.5"/>',
    calves: '<rect x="48" y="112" width="9" height="17" rx="4.5"/><rect x="63" y="112" width="9" height="17" rx="4.5"/>'
  };

  var BACK = {
    shoulders: '<circle cx="34.5" cy="38" r="6.5"/><circle cx="85.5" cy="38" r="6.5"/>',
    traps: '<path d="M50 31 h20 l4 9 h-28 z"/>',
    back: '<path d="M48 40 h24 l-2 24 -10 5 -10 -5 z"/>',
    lowerback: '<rect x="52" y="69" width="16" height="11" rx="4"/>',
    triceps: '<rect x="30" y="44" width="9" height="18" rx="4.5"/><rect x="81" y="44" width="9" height="18" rx="4.5"/>',
    forearms: '<rect x="30" y="62" width="9" height="12" rx="4.5"/><rect x="81" y="62" width="9" height="12" rx="4.5"/>',
    glutes: '<circle cx="53" cy="84" r="7"/><circle cx="67" cy="84" r="7"/>',
    hamstrings: '<rect x="47" y="92" width="11" height="20" rx="5.5"/><rect x="62" y="92" width="11" height="20" rx="5.5"/>',
    calves: '<rect x="48" y="114" width="9" height="17" rx="4.5"/><rect x="63" y="114" width="9" height="17" rx="4.5"/>'
  };

  function shapes(map, active) {
    var out = '';
    Object.keys(map).forEach(function (k) {
      var on = active && active[k];
      var s = map[k];
      // 给每个 shape 加上统一的 class
      out += s.replace(/<(path|rect|circle)/g, function (m) {
        return m + ' class="mm-m' + (on ? ' on' : '') + '"';
      });
    });
    return out;
  }

  function svg(view, active) {
    var map = view === 'front' ? FRONT : BACK;
    return '<svg viewBox="0 0 120 150" class="mm-svg">' + BASE + '<g>' + shapes(map, active) + '</g></svg>';
  }

  function html(muscles, opts) {
    opts = opts || {};
    var act = regionsFor(muscles);
    var showBack = Object.keys(act.back).length > 0;
    var showFront = Object.keys(act.front).length > 0;
    var cls = 'mm' + (opts.sm ? ' sm' : '');
    var out = '<div class="' + cls + '">';
    out += '<div class="mm-fig">' + svg('front', act.front) + '<span>正面</span></div>';
    out += '<div class="mm-fig">' + svg('back', act.back) + '<span>背面</span></div>';
    out += '</div>';
    return out;
  }

  global.MuscleMap = { html: html, regionsFor: regionsFor };
})(window);
