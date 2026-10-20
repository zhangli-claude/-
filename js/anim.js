/* ==========================================================
   练了吗 · 动作示意动画（纯本地 SVG，无外部资源）
   人形剪影：头 / 躯干 / 四肢带体积，关键帧插值
   说明：这是「动作轨迹示意」，不是解剖级或真人示范
   ========================================================== */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* 骨骼长度 */
  var L = { torso: 44, neck: 19, head: 12, ua: 25, fa: 23, th: 35, sh: 32 };
  /* 各部位粗细（描边宽度，圆头圆角形成体积感） */
  var W = { torso: 23, ua: 11, fa: 9, th: 17, sh: 13, foot: 8, hand: 5.5 };
  /* 配色 */
  var C = {
    near: '#c8ff3d',
    nearSoft: '#d9ff7a',
    far: 'rgba(150,196,52,.55)',
    farSoft: 'rgba(150,196,52,.40)',
    head: '#d9ff7a',
    gear: '#ffb37a'
  };
  var SEG = 640;

  function rad(a) { return a * Math.PI / 180; }
  function dir(a) { var r = rad(a); return { x: Math.sin(r), y: -Math.cos(r) }; }
  function step(p, a, len) { var d = dir(a); return { x: p.x + d.x * len, y: p.y + d.y * len }; }
  function rot90(v) { return { x: v.y, y: -v.x }; }

  /* ---------------- 姿势库 ----------------
     hx,hy 髋部坐标 | t 躯干角度 | ua/fa 上臂/前臂 | th/sh 大腿/小腿
     角度：0=正上，90=右，180=下，270=左
     equip: dumbbell
  ------------------------------------------ */
  var POSES = {
    stand: [{ hx: 122, hy: 132, t: 0, ua: 164, fa: 172, th: 177, sh: 182 }],

    march: [
      { hx: 122, hy: 132, t: 3, ua: 158, fa: 170, th: 158, sh: 198, th2: 192, sh2: 170 },
      { hx: 122, hy: 132, t: 3, ua: 188, fa: 176, th: 192, sh: 168, th2: 158, sh2: 198 }
    ],

    walk: [
      { hx: 122, hy: 132, t: 4, ua: 154, fa: 168, th: 150, sh: 200, th2: 198, sh2: 166 },
      { hx: 122, hy: 132, t: 4, ua: 196, fa: 178, th: 198, sh: 166, th2: 152, sh2: 200 }
    ],

    squat: [
      { hx: 122, hy: 132, t: 0, ua: 164, fa: 172, th: 177, sh: 182 },
      { hx: 118, hy: 172, t: 24, ua: 86, fa: 93, th: 118, sh: 211 }
    ],

    wallsit: [{ hx: 116, hy: 172, t: 2, ua: 86, fa: 92, th: 118, sh: 250 }],

    lunge: [
      { hx: 120, hy: 136, t: 4, ua: 164, fa: 172, th: 177, sh: 182, th2: 177, sh2: 182 },
      { hx: 116, hy: 166, t: 12, ua: 160, fa: 170, th: 96, sh: 186, th2: 228, sh2: 172 }
    ],

    hinge: [
      { hx: 122, hy: 136, t: 6, ua: 172, fa: 178, th: 176, sh: 182, equip: 'dumbbell' },
      { hx: 122, hy: 144, t: 74, ua: 186, fa: 183, th: 172, sh: 188, equip: 'dumbbell' }
    ],

    bridge: [
      { hx: 112, hy: 186, t: 112, ua: 268, fa: 268, th: 320, sh: 215 },
      { hx: 112, hy: 168, t: 128, ua: 272, fa: 270, th: 312, sh: 208 }
    ],

    clamshell: [
      { hx: 100, hy: 180, t: 92, ua: 178, fa: 182, th: 264, sh: 268 },
      { hx: 100, hy: 180, t: 92, ua: 178, fa: 182, th: 300, sh: 304 }
    ],

    quadruped: [
      { hx: 105, hy: 150, t: 85, ua: 184, fa: 184, th: 180, sh: 180 },
      { hx: 105, hy: 150, t: 68, ua: 184, fa: 184, th: 180, sh: 180 }
    ],

    birddog: [
      { hx: 105, hy: 150, t: 85, ua: 184, fa: 184, th: 180, sh: 180 },
      { hx: 105, hy: 150, t: 85, ua: 95, fa: 92, th: 265, sh: 268 }
    ],

    plank: [
      { hx: 100, hy: 158, t: 90, ua: 186, fa: 186, th: 268, sh: 274 },
      { hx: 100, hy: 155, t: 88, ua: 189, fa: 187, th: 266, sh: 272 }
    ],

    sideplank: [
      { hx: 108, hy: 150, t: 74, ua: 190, fa: 190, th: 250, sh: 255 },
      { hx: 108, hy: 147, t: 72, ua: 192, fa: 191, th: 248, sh: 253 }
    ],

    crunch: [
      { hx: 116, hy: 186, t: 90, ua: 75, fa: 330, th: 340, sh: 200 },
      { hx: 116, hy: 186, t: 65, ua: 65, fa: 320, th: 340, sh: 200 }
    ],

    legraise: [
      { hx: 116, hy: 188, t: 90, ua: 264, fa: 268, th: 268, sh: 270 },
      { hx: 116, hy: 188, t: 90, ua: 264, fa: 268, th: 320, sh: 325 }
    ],

    hollow: [
      { hx: 116, hy: 190, t: 78, ua: 95, fa: 92, th: 302, sh: 306 },
      { hx: 116, hy: 190, t: 74, ua: 100, fa: 96, th: 312, sh: 316 }
    ],

    deadbug: [
      { hx: 118, hy: 188, t: 90, ua: 0, fa: 0, th: 2, sh: 270 },
      { hx: 118, hy: 188, t: 90, ua: 55, fa: 60, th: 262, sh: 266 }
    ],

    pushup: [
      { hx: 100, hy: 156, t: 90, ua: 186, fa: 186, th: 268, sh: 274 },
      { hx: 100, hy: 146, t: 90, ua: 205, fa: 245, th: 268, sh: 274 }
    ],

    dip: [
      { hx: 118, hy: 148, t: 8, ua: 204, fa: 198, th: 96, sh: 172 },
      { hx: 118, hy: 162, t: 8, ua: 210, fa: 204, th: 96, sh: 172 }
    ],

    curl: [
      { hx: 122, hy: 132, t: 0, ua: 174, fa: 180, th: 177, sh: 182, equip: 'dumbbell' },
      { hx: 122, hy: 132, t: 0, ua: 168, fa: 95, th: 177, sh: 182, equip: 'dumbbell' }
    ],

    triceps: [
      { hx: 122, hy: 138, t: 10, ua: 172, fa: 178, th: 176, sh: 182, equip: 'dumbbell' },
      { hx: 122, hy: 138, t: 10, ua: 190, fa: 250, th: 176, sh: 182, equip: 'dumbbell' }
    ],

    raise: [
      { hx: 122, hy: 132, t: 0, ua: 174, fa: 180, th: 177, sh: 182, equip: 'dumbbell' },
      { hx: 122, hy: 132, t: 0, ua: 92, fa: 92, th: 177, sh: 182, equip: 'dumbbell' }
    ],

    row: [
      { hx: 122, hy: 144, t: 72, ua: 186, fa: 183, th: 174, sh: 186, equip: 'dumbbell' },
      { hx: 122, hy: 144, t: 72, ua: 208, fa: 118, th: 174, sh: 186, equip: 'dumbbell' }
    ],

    press: [
      { hx: 122, hy: 132, t: 0, ua: 132, fa: 246, th: 177, sh: 182, equip: 'dumbbell' },
      { hx: 122, hy: 132, t: 0, ua: 16, fa: 8, th: 177, sh: 182, equip: 'dumbbell' }
    ],

    calf: [
      { hx: 122, hy: 136, t: 0, ua: 164, fa: 172, th: 177, sh: 182 },
      { hx: 122, hy: 124, t: 0, ua: 164, fa: 172, th: 175, sh: 194 }
    ],

    jack: [
      { hx: 122, hy: 132, t: 0, ua: 172, fa: 178, th: 177, sh: 182, th2: 177, sh2: 182 },
      { hx: 122, hy: 132, t: 0, ua: 26, fa: 20, th: 152, sh: 172, th2: 208, sh2: 172 }
    ],

    boxing: [
      { hx: 120, hy: 134, t: 8, ua: 116, fa: 250, th: 164, sh: 194, th2: 196, sh2: 166 },
      { hx: 120, hy: 134, t: 8, ua: 90, fa: 92, th: 164, sh: 194, th2: 196, sh2: 166 }
    ],

    superman: [
      { hx: 110, hy: 194, t: 90, ua: 96, fa: 92, th: 266, sh: 268 },
      { hx: 110, hy: 194, t: 90, ua: 72, fa: 68, th: 288, sh: 290 }
    ],

    burpee: [
      { hx: 120, hy: 172, t: 24, ua: 86, fa: 93, th: 118, sh: 211 },
      { hx: 100, hy: 156, t: 90, ua: 186, fa: 186, th: 268, sh: 274 },
      { hx: 122, hy: 120, t: 0, ua: 18, fa: 12, th: 176, sh: 190 }
    ],

    stretchStand: [
      { hx: 122, hy: 132, t: 0, ua: 164, fa: 172, th: 177, sh: 182 },
      { hx: 122, hy: 132, t: -6, ua: 8, fa: 4, th: 177, sh: 182 }
    ],

    stretchFloor: [
      { hx: 120, hy: 180, t: 0, ua: 140, fa: 155, th: 268, sh: 270 },
      { hx: 120, hy: 180, t: 292, ua: 252, fa: 262, th: 268, sh: 270 }
    ],

    stretchQuad: [
      { hx: 105, hy: 150, t: 85, ua: 184, fa: 184, th: 180, sh: 180 },
      { hx: 105, hy: 150, t: 62, ua: 184, fa: 184, th: 180, sh: 180 }
    ],

    bike: [
      { hx: 118, hy: 152, t: 8, ua: 92, fa: 96, th: 58, sh: 178, th2: 122, sh2: 142 },
      { hx: 118, hy: 152, t: 8, ua: 92, fa: 96, th: 122, sh: 142, th2: 58, sh2: 178 }
    ]
  };

  /* ---------------- 关键帧序列 ---------------- */
  var seqCache = {};
  function seqOf(key) {
    if (seqCache[key]) return seqCache[key];
    var raw = POSES[key] || POSES.stand;
    var frames = raw.map(function (f) {
      var d = farDef(f);
      return {
        hx: f.hx, hy: f.hy, t: f.t, ua: f.ua, fa: f.fa, th: f.th, sh: f.sh,
        ua2: d.ua2, fa2: d.fa2, th2: d.th2, sh2: d.sh2, equip: f.equip
      };
    });
    // 站立类动作：手臂稍分开，避免和躯干糊成一片
    frames.forEach(function (f) {
      if (f.ua >= 165 && f.ua <= 185 && f.fa >= 170 && f.fa <= 190) {
        f.ua = 148;
        f.fa = 160;
      }
    });
    var seq = frames.slice();
    for (var i = frames.length - 2; i >= 0; i--) seq.push(frames[i]);
    if (seq.length < 2) seq = [frames[0], frames[0]];
    seqCache[key] = seq;
    return seq;
  }

  function farDef(f) {
    f = f || {};
    return {
      ua2: f.ua2 !== undefined ? f.ua2 : (f.ua || 172) - 7,
      fa2: f.fa2 !== undefined ? f.fa2 : (f.fa || 178) + 4,
      th2: f.th2 !== undefined ? f.th2 : (f.th || 177) + 6,
      sh2: f.sh2 !== undefined ? f.sh2 : (f.sh || 182) - 4
    };
  }

  function interp(a, b, u) {
    var fa = farDef(a), fb = farDef(b);
    var e = u * u * (3 - 2 * u);
    function mix(k, dk) {
      var av = a[k] !== undefined ? a[k] : dk;
      var bv = b[k] !== undefined ? b[k] : dk;
      return av + (bv - av) * e;
    }
    return {
      hx: mix('hx', 120), hy: mix('hy', 132), t: mix('t', 0),
      ua: mix('ua', 172), fa: mix('fa', 178), th: mix('th', 177), sh: mix('sh', 182),
      ua2: mix('ua2', fa.ua2), fa2: mix('fa2', fa.fa2),
      th2: mix('th2', fa.th2), sh2: mix('sh2', fa.sh2),
      equip: (e < 0.5 ? a : b).equip || a.equip || b.equip
    };
  }

  /* ---------------- 关节坐标 ---------------- */
  function joints(f) {
    var hip = { x: f.hx, y: f.hy };
    var hipF = { x: f.hx - 5, y: f.hy + 3 };
    var sh = step(hip, f.t, L.torso);
    var hd = step(sh, f.t, L.neck);
    var elbow = step(sh, f.ua, L.ua), wrist = step(elbow, f.fa, L.fa);
    var knee = step(hip, f.th, L.th), ankle = step(knee, f.sh, L.sh);
    var elbowF = step(hipF, f.t, L.torso), wristF = null;
    elbowF = step(elbowF, f.ua2, L.ua);
    wristF = step(elbowF, f.fa2, L.fa);
    var kneeF = step(hipF, f.th2, L.th), ankleF = step(kneeF, f.sh2, L.sh);
    return {
      hip: hip, hipF: hipF, sh: sh, hd: hd,
      elbow: elbow, wrist: wrist, knee: knee, ankle: ankle,
      elbowF: elbowF, wristF: wristF, kneeF: kneeF, ankleF: ankleF
    };
  }

  function bounds(seq) {
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    function add(p) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    function addPose(f) {
      var j = joints(f);
      [j.hip, j.sh, j.hd, j.elbow, j.wrist, j.knee, j.ankle,
        j.elbowF, j.wristF, j.kneeF, j.ankleF].forEach(add);
      add({ x: j.hd.x - L.head, y: j.hd.y - L.head });
      add({ x: j.hd.x + L.head, y: j.hd.y + L.head });
      add({ x: j.ankle.x + 12, y: j.ankle.y + 12 });
      add({ x: j.ankle.x - 12, y: j.ankle.y - 12 });
    }
    seq = seq || [];
    if (seq.length < 2) {
      if (seq.length === 1) addPose(seq[0]);
    } else {
      var steps = 24;
      for (var s = 0; s <= steps; s++) {
        var pos = (seq.length - 1) * s / steps;
        var i = Math.min(seq.length - 2, Math.floor(pos));
        addPose(interp(seq[i], seq[i + 1], pos - i));
      }
    }
    if (minX > maxX) return '20 40 200 185';
    var pad = 14;
    var w = Math.max(46, maxX - minX) + pad * 2;
    var h = Math.max(56, maxY - minY) + pad * 2;
    return (minX - pad).toFixed(1) + ' ' + (minY - pad).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1);
  }

  /* ---------------- DOM ---------------- */
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function segPath(a, b, c) {
    return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) +
      ' L' + b.x.toFixed(1) + ' ' + b.y.toFixed(1) +
      (c ? ' L' + c.x.toFixed(1) + ' ' + c.y.toFixed(1) : '');
  }

  function build(key, opts) {
    opts = opts || {};
    var frames = seqOf(key);
    var svg = el('svg', { viewBox: bounds(frames), class: 'demo-svg', 'aria-hidden': 'true' });

    // 地面参考线：让躺姿 / 撑姿更容易读懂
    var vb = (svg.getAttribute('viewBox') || '0 0 200 200').split(' ').map(Number);
    var floorY = vb[1] + vb[3] - 9;
    var floor = el('line', {
      x1: (vb[0] + 10).toFixed(1), y1: floorY.toFixed(1),
      x2: (vb[0] + vb[2] - 10).toFixed(1), y2: floorY.toFixed(1),
      stroke: 'rgba(255,255,255,.10)', 'stroke-width': 2.5, 'stroke-linecap': 'round'
    });
    svg.appendChild(floor);

    function line(w, color, cap) {
      return el('path', {
        d: 'M0 0', fill: 'none', stroke: color,
        'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        opacity: cap || 1
      });
    }

    var farThigh = line(W.th, C.far);
    var farCalf = line(W.sh, C.far);
    var farUA = line(W.ua, C.farSoft);
    var farFA = line(W.fa, C.farSoft);
    var farHand = el('circle', { r: W.hand - 1, fill: C.farSoft });

    var torso = line(W.torso, C.near);
    var nearThigh = line(W.th, C.near);
    var nearCalf = line(W.sh, C.near);
    var nearUA = line(W.ua, C.nearSoft);
    var nearFA = line(W.fa, C.nearSoft);

    var footL = line(W.foot, C.nearSoft);
    var footR = line(W.foot, C.farSoft);
    var hand = el('circle', { r: W.hand, fill: C.nearSoft });
    var head = el('circle', { r: L.head, fill: C.head });

    var db = el('g', { stroke: '#2b2115', 'stroke-width': 5, 'stroke-linecap': 'round' });
    var dbBar = el('line', {});
    var dbC1 = el('circle', { r: 5, fill: C.gear, stroke: 'none' });
    var dbC2 = el('circle', { r: 5, fill: C.gear, stroke: 'none' });
    db.appendChild(dbBar); db.appendChild(dbC1); db.appendChild(dbC2);

    // 绘制顺序：远侧 → 躯干 → 近侧 → 头 → 小部件
    [farThigh, farCalf, farUA, farFA, farHand, torso, nearThigh, nearCalf, nearUA, nearFA,
      footL, footR, head, hand, db].forEach(function (n) { svg.appendChild(n); });

    function draw(f) {
      var j = joints(f);
      var toe = { x: j.ankle.x + 11, y: j.ankle.y + 5 };
      var toeF = { x: j.ankleF.x + 10, y: j.ankleF.y + 5 };

      farThigh.setAttribute('d', segPath(j.hipF, j.kneeF));
      farCalf.setAttribute('d', segPath(j.kneeF, j.ankleF));
      farUA.setAttribute('d', segPath(j.sh, j.elbowF));
      farFA.setAttribute('d', segPath(j.elbowF, j.wristF));
      farHand.setAttribute('cx', j.wristF.x.toFixed(1));
      farHand.setAttribute('cy', j.wristF.y.toFixed(1));

      torso.setAttribute('d', segPath(j.hip, j.sh));
      nearThigh.setAttribute('d', segPath(j.hip, j.knee));
      nearCalf.setAttribute('d', segPath(j.knee, j.ankle));
      nearUA.setAttribute('d', segPath(j.sh, j.elbow));
      nearFA.setAttribute('d', segPath(j.elbow, j.wrist));

      footL.setAttribute('d', segPath(j.ankle, toe));
      footR.setAttribute('d', segPath(j.ankleF, toeF));
      hand.setAttribute('cx', j.wrist.x.toFixed(1));
      hand.setAttribute('cy', j.wrist.y.toFixed(1));
      head.setAttribute('cx', j.hd.x.toFixed(1));
      head.setAttribute('cy', j.hd.y.toFixed(1));

      if (f.equip === 'dumbbell') {
        db.style.display = '';
        var dx = j.wrist.x - j.elbow.x, dy = j.wrist.y - j.elbow.y;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var px = -dy / len * 7, py = dx / len * 7;
        dbBar.setAttribute('x1', (j.wrist.x - px).toFixed(1));
        dbBar.setAttribute('y1', (j.wrist.y - py).toFixed(1));
        dbBar.setAttribute('x2', (j.wrist.x + px).toFixed(1));
        dbBar.setAttribute('y2', (j.wrist.y + py).toFixed(1));
        dbC1.setAttribute('cx', (j.wrist.x - px).toFixed(1));
        dbC1.setAttribute('cy', (j.wrist.y - py).toFixed(1));
        dbC2.setAttribute('cx', (j.wrist.x + px).toFixed(1));
        dbC2.setAttribute('cy', (j.wrist.y + py).toFixed(1));
      } else {
        db.style.display = 'none';
      }
    }

    if (opts.static !== undefined) {
      var sq = seqOf(key);
      var idx = Math.max(0, Math.min(sq.length - 1, Math.round(opts.static * (sq.length - 1))));
      draw(sq[idx]);
      return svg;
    }

    var t0 = performance.now();
    function loop(now) {
      if (!svg.isConnected) return;
      var total = Math.max(SEG * 2, (frames.length - 1) * SEG * 2);
      var dt = now - t0;
      if (!isFinite(dt) || dt < 0) dt = 0;
      var p = (dt % total) / SEG;
      var i = Math.floor(p);
      if (!isFinite(i) || i < 0) i = 0;
      if (i > frames.length - 1) i = frames.length - 1;
      var frac = Math.max(0, Math.min(1, p - i));
      draw(interp(frames[i], frames[Math.min(i + 1, frames.length - 1)], frac));
      svg._raf = requestAnimationFrame(loop);
    }
    svg._raf = requestAnimationFrame(loop);
    return svg;
  }

  var reduced = false;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  function autoMount(root) {
    root = root || document;
    var slots = root.querySelectorAll('[data-demo]');
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      if (slot.getAttribute('data-demo-bound') === '1') continue;
      var key = slot.getAttribute('data-demo');
      slot.setAttribute('data-demo-bound', '1');
      slot.appendChild(build(key, reduced ? { static: 0.5 } : {}));
    }
  }

  function stop(root) {
    root = root || document;
    var svgs = root.querySelectorAll('.demo-svg');
    for (var i = 0; i < svgs.length; i++) {
      if (svgs[i]._raf) cancelAnimationFrame(svgs[i]._raf);
    }
  }

  global.Anim = { build: build, autoMount: autoMount, stop: stop, list: Object.keys(POSES) };
})(window);
