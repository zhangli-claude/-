/* ==========================================================
   练了吗 · 内容数据层
   动作库 / 训练组合 / 教练人格 / 计划模板
   说明：MET 为估算值，热量 = MET × 3.5 × 体重(kg) ÷ 200 × 分钟
   ========================================================== */
(function (global) {
  'use strict';

  var REFS = {
    who:  { name: 'WHO 身体活动指南（2020）', url: 'https://www.who.int/news/item/25-11-2020-every-move-counts-towards-better-health-says-who' },
    cdc:  { name: 'CDC 成人身体活动指南', url: 'https://www.cdc.gov/physical-activity-basics/guidelines/index.html' },
    acsm: { name: 'ACSM 运动剂量立场声明', url: 'https://pubmed.ncbi.nlm.nih.gov/21694556/' },
    cn:   { name: '《中国人群身体活动指南（2021）》解读', url: 'https://www.chinanutri.cn/xwzx_238/xyxw/202112/t20211230_255285.html' },
    exrx: { name: 'ExRx 动作库', url: 'https://exrx.net/' },
    nasm: { name: 'NASM 美国国家运动医学会', url: 'https://www.nasm.org/' },
    ace:  { name: 'ACE 动作库', url: 'https://www.acefitness.org/resources/everyone/exercise-library/' },
    nhs:  { name: 'NHS 运动与健身', url: 'https://www.nhs.uk/live-well/exercise/' },
    sport:{ name: '国家体育总局《全民健身指南》', url: 'https://www.sport.gov.cn/n20001280/n20745751/n20767239/c21622733/content.html' },
    met:  { name: 'Compendium of Physical Activities', url: 'https://pacompendium.com/' }
  };

  var TARGETS = [
    { id: 'abs',      label: '腹部', icon: '🎯', color: 'lime',   desc: '核心稳定 · 腹直肌 / 腹斜肌' },
    { id: 'arms',     label: '手臂', icon: '💪', color: 'orange', desc: '肱二头 / 肱三头 / 肩' },
    { id: 'legs',     label: '腿',   icon: '🦵', color: 'teal',   desc: '股四头 / 腘绳 / 小腿' },
    { id: 'glutes',   label: '臀',   icon: '🍑', color: 'violet', desc: '臀大肌 / 臀中肌' },
    { id: 'full',     label: '全身', icon: '🔥', color: 'lime',   desc: '多关节复合 · 提升代谢' },
    { id: 'cardio',   label: '有氧', icon: '🏃', color: 'orange', desc: '心肺 · 燃脂' },
    { id: 'mobility', label: '拉伸', icon: '🧘', color: 'teal',   desc: '活动度 · 恢复' }
  ];

  var GOALS = [
    { id: 'fatloss', label: '减脂', desc: '降低体脂，改善体态' },
    { id: 'shape',   label: '塑形', desc: '腰腹 / 手臂 / 腿臀线条' },
    { id: 'health',  label: '健康', desc: '心肺 + 力量基础' }
  ];

  /* ------------------------- 动作库 ------------------------- */
  /* equipment: none | dumbbell | band | chair | mat
     unit: reps | sec   impact: low | medium | high */
  var EX = [
    /* ---------------- 腹部 ---------------- */
    { id: 'dead-bug', name: '死虫式', en: 'Dead Bug', targets: ['abs'], muscles: ['腹直肌', '腹横肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 10, rest: 45, met: 2.5, impact: 'low',
      cues: ['仰卧，手臂垂直向上，髋膝各 90°', '对侧手脚缓慢下放，腰背始终贴地', '呼气下放，吸气收回'],
      mistakes: ['腰部拱起离地', '动作太快靠惯性'], easier: '只做下肢，双手放身体两侧', harder: '手持轻物或双腿伸直下放', caution: '腰部不适时减小幅度', refs: ['acsm', 'exrx'] },
    { id: 'crunch', name: '卷腹', en: 'Crunch', targets: ['abs'], muscles: ['腹直肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 12, rest: 40, met: 3.8, impact: 'low',
      cues: ['下背贴地，肩胛骨离地即可', '呼气收紧腹部，想象肋骨压向骨盆', '双手轻放耳侧，不拉扯脖子'],
      mistakes: ['抱头用力拉颈', '起身幅度过大变成仰卧起坐'], easier: '半程卷腹，幅度减小', harder: '双腿抬起 90° 做卷腹', caution: '颈椎不适时用手托头', refs: ['exrx', 'ace'] },
    { id: 'reverse-crunch', name: '反向卷腹', en: 'Reverse Crunch', targets: ['abs'], muscles: ['腹直肌下部'], equipment: 'mat', level: 1, unit: 'reps', amount: 12, rest: 40, met: 3.8, impact: 'low',
      cues: ['仰卧屈膝，小腿平行地面', '用腹部把骨盆卷向胸口', '下放时缓慢控制，不让腰离地'],
      mistakes: ['用腿部甩动', '下放太快腰部代偿'], easier: '双脚踩地做骨盆后倾', harder: '双腿伸直做举腿卷腹', caution: '腰部不适时垫高臀部', refs: ['exrx'] },
    { id: 'plank', name: '平板支撑', en: 'Plank', targets: ['abs', 'full'], muscles: ['腹横肌', '腹直肌'], equipment: 'mat', level: 1, unit: 'sec', amount: 25, rest: 45, met: 3.3, impact: 'low',
      cues: ['肘在肩正下方，身体成一条直线', '收紧腹部和臀部，不塌腰', '均匀呼吸，不憋气'],
      mistakes: ['塌腰翘臀', '耸肩、憋气'], easier: '膝盖着地或手撑墙', harder: '延长到 45-60 秒或加抬腿', caution: '腰痛时改做死虫式', refs: ['acsm', 'ace'] },
    { id: 'side-plank', name: '侧平板支撑', en: 'Side Plank', targets: ['abs'], muscles: ['腹斜肌', '腹横肌'], equipment: 'mat', level: 2, unit: 'sec', amount: 20, rest: 40, met: 3.0, impact: 'low',
      cues: ['手肘在肩下，身体侧向一条直线', '髋部抬高，不要前后倾', '两侧各做一组'],
      mistakes: ['髋部下沉', '身体前倾或后仰'], easier: '屈膝跪姿侧平板', harder: '抬起上侧腿', caution: '肩部不适时减小支撑时间', refs: ['exrx'] },
    { id: 'bird-dog', name: '鸟狗式', en: 'Bird Dog', targets: ['abs'], muscles: ['腹横肌', '竖脊肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 8, rest: 40, met: 2.5, impact: 'low',
      cues: ['四点支撑，背部平直', '对侧手脚同时伸直，保持 2 秒', '收紧腹部，骨盆不晃动'],
      mistakes: ['腰部下塌', '抬腿过高失去稳定'], easier: '只抬手或只抬腿', harder: '伸直后画小圈', caution: '腕部不适时用拳撑', refs: ['acsm'] },
    { id: 'mountain-climber', name: '登山跑', en: 'Mountain Climber', targets: ['abs', 'cardio'], muscles: ['腹直肌', '髂腰肌'], equipment: 'mat', level: 2, unit: 'sec', amount: 30, rest: 45, met: 8.0, impact: 'medium',
      cues: ['高平板姿势，肩在手腕正上方', '交替快速收膝向胸口', '保持核心稳定，臀部不上下弹'],
      mistakes: ['塌腰', '速度过快导致肩前冲'], easier: '慢速交替提膝', harder: '加快节奏或加交叉收膝', caution: '手腕 / 肩不适者改做原地提膝', refs: ['ace'] },
    { id: 'bicycle-crunch', name: '自行车卷腹', en: 'Bicycle Crunch', targets: ['abs'], muscles: ['腹斜肌', '腹直肌'], equipment: 'mat', level: 2, unit: 'reps', amount: 20, rest: 40, met: 4.0, impact: 'low',
      cues: ['肩胛离地，对侧肘膝相触', '转动来自躯干，不是手拉脖子', '节奏稳定，左右各算一次'],
      mistakes: ['只动肘不动躯干', '速度过快'], easier: '双脚踩地做交替转体', harder: '双腿伸直抬高', caution: '腰部不适时减小转幅', refs: ['ace'] },
    { id: 'leg-raise', name: '仰卧举腿', en: 'Leg Raise', targets: ['abs'], muscles: ['腹直肌下部'], equipment: 'mat', level: 2, unit: 'reps', amount: 10, rest: 45, met: 3.8, impact: 'low',
      cues: ['仰卧，双手放臀下或身体两侧', '双腿并拢缓慢抬起至垂直', '下放时控制，腰不离地'],
      mistakes: ['下放时腰部拱起', '借助惯性甩腿'], easier: '屈膝举腿', harder: '抬腿后向上卷腹', caution: '腰痛者改做反向卷腹', refs: ['exrx'] },
    { id: 'russian-twist', name: '俄罗斯转体', en: 'Russian Twist', targets: ['abs'], muscles: ['腹斜肌'], equipment: 'none', level: 2, unit: 'reps', amount: 20, rest: 40, met: 4.0, impact: 'low',
      cues: ['坐姿屈膝，上身后倾约 45°', '双手交握左右转体，转体到位停一下', '保持背部挺直'],
      mistakes: ['含胸驼背', '只用手臂摆动'], easier: '双脚踩地，双手扶膝转体', harder: '双脚离地或手持重物', caution: '腰椎间盘问题者避免', refs: ['ace'] },
    { id: 'hollow-hold', name: '空心支撑', en: 'Hollow Hold', targets: ['abs'], muscles: ['腹直肌', '腹横肌'], equipment: 'mat', level: 3, unit: 'sec', amount: 20, rest: 45, met: 3.5, impact: 'low',
      cues: ['仰卧，下背压地', '肩和腿同时离地，身体呈浅碗状', '手臂伸向脚的方向'],
      mistakes: ['下背离地', '憋气'], easier: '屈膝、手臂放身体两侧', harder: '手臂过头伸直', caution: '腰部不适立即停止', refs: ['acsm'] },
    { id: 'v-up', name: 'V 字两头起', en: 'V-Up', targets: ['abs'], muscles: ['腹直肌'], equipment: 'mat', level: 3, unit: 'reps', amount: 8, rest: 50, met: 4.0, impact: 'low',
      cues: ['仰卧伸展，手脚同时向上抬起', '指尖尽量触碰脚尖', '缓慢下放，不砸地'],
      mistakes: ['靠惯性甩起', '下放失控'], easier: '屈膝做半程', harder: '手持轻物增加负荷', caution: '腰部不适者改为卷腹', refs: ['exrx'] },
    { id: 'plank-shoulder-tap', name: '平板摸肩', en: 'Plank Shoulder Tap', targets: ['abs'], muscles: ['腹横肌', '腹斜肌'], equipment: 'mat', level: 2, unit: 'reps', amount: 16, rest: 40, met: 3.5, impact: 'low',
      cues: ['高平板，双脚略分开', '交替用手摸对侧肩膀', '臀部保持稳定不左右晃'],
      mistakes: ['臀部左右摇摆', '塌腰'], easier: '跪姿做', harder: '双脚并拢增加不稳定', caution: '手腕不适改做死虫式', refs: ['ace'] },
    { id: 'pallof-press', name: '帕洛夫推', en: 'Pallof Press', targets: ['abs'], muscles: ['腹斜肌', '腹横肌'], equipment: 'band', level: 2, unit: 'reps', amount: 10, rest: 45, met: 3.5, impact: 'low',
      cues: ['弹力带固定在与胸同高，侧对固定点', '双手向前推出，抵抗旋转', '推出停 1 秒再收回'],
      mistakes: ['身体被带转', '推得太快'], easier: '减轻弹力带阻力', harder: '加大阻力或加转体', caution: '确保固定点牢固', refs: ['nasm'] },
    { id: 'flutter-kick', name: '仰卧交替踢腿', en: 'Flutter Kick', targets: ['abs'], muscles: ['腹直肌下部'], equipment: 'mat', level: 2, unit: 'sec', amount: 30, rest: 40, met: 3.5, impact: 'low',
      cues: ['仰卧，双手放臀下', '双腿伸直小幅上下交替', '下背始终贴地'],
      mistakes: ['腰离地', '幅度过大'], easier: '屈膝小幅踢', harder: '腿放低增加难度', caution: '腰痛时停止', refs: ['exrx'] },

    /* ---------------- 手臂 ---------------- */
    { id: 'wall-pushup', name: '靠墙俯卧撑', en: 'Wall Push-Up', targets: ['arms'], muscles: ['胸大肌', '肱三头肌'], equipment: 'none', level: 1, unit: 'reps', amount: 10, rest: 40, met: 3.0, impact: 'low',
      cues: ['双手扶墙略宽于肩', '屈肘让身体靠近墙面', '推起时肩胛稳定，不耸肩'],
      mistakes: ['塌腰', '只动手肘不动肩'], easier: '离墙更近', harder: '离墙更远或改跪姿俯卧撑', caution: '手腕不适可握拳撑墙', refs: ['acsm', 'exrx'] },
    { id: 'knee-pushup', name: '跪姿俯卧撑', en: 'Knee Push-Up', targets: ['arms', 'full'], muscles: ['胸大肌', '肱三头肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 10, rest: 45, met: 3.8, impact: 'low',
      cues: ['膝盖着地，身体从头到膝一条直线', '屈肘下放至胸部接近地面', '推起时呼气'],
      mistakes: ['撅臀', '下放不够'], easier: '手撑高一点（椅子）', harder: '减少膝盖支撑改标准俯卧撑', caution: '手腕 / 肩不适时停止', refs: ['acsm'] },
    { id: 'pushup', name: '标准俯卧撑', en: 'Push-Up', targets: ['arms', 'full'], muscles: ['胸大肌', '肱三头肌', '三角肌前束'], equipment: 'mat', level: 2, unit: 'reps', amount: 10, rest: 50, met: 4.0, impact: 'low',
      cues: ['双手略宽于肩，身体成直线', '下放至肘约 90°，胸口接近地面', '核心收紧，臀部不塌不翘'],
      mistakes: ['塌腰或撅臀', '幅度不足'], easier: '跪姿或手撑高', harder: '脚垫高或加停顿', caution: '腕部不适改用俯卧撑架', refs: ['acsm', 'exrx'] },
    { id: 'diamond-pushup', name: '钻石俯卧撑', en: 'Diamond Push-Up', targets: ['arms'], muscles: ['肱三头肌', '胸大肌内侧'], equipment: 'mat', level: 3, unit: 'reps', amount: 8, rest: 50, met: 4.5, impact: 'low',
      cues: ['双手拇指食指相触成菱形', '肘贴近身体下放', '推起时集中收缩肱三头'],
      mistakes: ['肘外展', '手腕压力过大'], easier: '跪姿钻石俯卧撑', harder: '脚抬高', caution: '手腕痛改做窄距跪姿', refs: ['exrx'] },
    { id: 'close-grip-pushup', name: '窄距俯卧撑', en: 'Close-Grip Push-Up', targets: ['arms'], muscles: ['肱三头肌', '胸大肌'], equipment: 'mat', level: 2, unit: 'reps', amount: 10, rest: 50, met: 4.2, impact: 'low',
      cues: ['双手与肩同宽或略窄', '肘部贴近身体', '身体保持直线'],
      mistakes: ['肘外展变成普通俯卧撑', '腰部下塌'], easier: '跪姿', harder: '脚抬高', caution: '肩前侧不适时停止', refs: ['exrx'] },
    { id: 'biceps-curl', name: '哑铃弯举', en: 'Dumbbell Curl', targets: ['arms'], muscles: ['肱二头肌'], equipment: 'dumbbell', level: 1, unit: 'reps', amount: 12, rest: 45, met: 3.5, impact: 'low',
      cues: ['站直，肘固定在身体两侧', '弯举时呼气，下放时缓慢控制', '手腕保持中立'],
      mistakes: ['身体前后晃动借力', '下放太快'], easier: '用更轻的重量或弹力带', harder: '增加重量或做离心慢放', caution: '肘部疼痛时停止', refs: ['exrx', 'ace'] },
    { id: 'hammer-curl', name: '锤式弯举', en: 'Hammer Curl', targets: ['arms'], muscles: ['肱肌', '肱二头肌'], equipment: 'dumbbell', level: 1, unit: 'reps', amount: 12, rest: 45, met: 3.5, impact: 'low',
      cues: ['掌心相对握哑铃', '保持肘部固定', '上举到位停一下'],
      mistakes: ['耸肩', '借力甩动'], easier: '减轻重量', harder: '交替慢速做', caution: '肘部不适时停止', refs: ['exrx'] },
    { id: 'concentration-curl', name: '集中弯举', en: 'Concentration Curl', targets: ['arms'], muscles: ['肱二头肌'], equipment: 'dumbbell', level: 2, unit: 'reps', amount: 10, rest: 45, met: 3.5, impact: 'low',
      cues: ['坐姿，肘部抵住大腿内侧', '缓慢弯举并顶峰收缩', '下放到接近伸直'],
      mistakes: ['肘部离开大腿', '速度过快'], easier: '空手做意念练习', harder: '增加重量', caution: '肘部疼痛时停止', refs: ['exrx'] },
    { id: 'band-curl', name: '弹力带弯举', en: 'Band Curl', targets: ['arms'], muscles: ['肱二头肌'], equipment: 'band', level: 1, unit: 'reps', amount: 15, rest: 40, met: 3.0, impact: 'low',
      cues: ['双脚踩住弹力带，双手握两端', '肘部固定，向上弯举', '下放时对抗弹力'],
      mistakes: ['身体后仰借力', '弹力带滑脱'], easier: '换更轻的带子', harder: '缩短带子增加阻力', caution: '检查弹力带是否老化', refs: ['ace'] },
    { id: 'triceps-kickback', name: '俯身臂屈伸', en: 'Triceps Kickback', targets: ['arms'], muscles: ['肱三头肌'], equipment: 'dumbbell', level: 1, unit: 'reps', amount: 12, rest: 40, met: 3.0, impact: 'low',
      cues: ['俯身，上臂贴紧身体', '肘伸直，向后伸展前臂', '顶端停 1 秒再收回'],
      mistakes: ['上臂晃动', '耸肩'], easier: '用更轻重量或空手', harder: '增加重量并放慢', caution: '腰部不适时扶椅背支撑', refs: ['exrx'] },
    { id: 'overhead-triceps-extension', name: '颈后臂屈伸', en: 'Overhead Triceps Extension', targets: ['arms'], muscles: ['肱三头肌'], equipment: 'dumbbell', level: 1, unit: 'reps', amount: 12, rest: 40, met: 3.0, impact: 'low',
      cues: ['双手握哑铃举过头顶', '屈肘下放至颈后', '上臂保持垂直不动'],
      mistakes: ['肘部外展', '腰部反弓'], easier: '单臂轻重量', harder: '增加重量', caution: '肩部活动度不足时改做臂屈伸', refs: ['exrx'] },
    { id: 'chair-dip', name: '椅上臂屈伸', en: 'Chair Dip', targets: ['arms', 'full'], muscles: ['肱三头肌', '胸大肌'], equipment: 'chair', level: 2, unit: 'reps', amount: 10, rest: 50, met: 3.8, impact: 'low',
      cues: ['背对椅子，双手撑住椅边', '屈肘下放至肘约 90°', '推起时不要耸肩'],
      mistakes: ['肩部耸起', '下放过深压肩'], easier: '屈膝、脚靠近身体', harder: '双腿伸直或脚垫高', caution: '肩部不适者改做墙推', refs: ['exrx'] },
    { id: 'lateral-raise', name: '哑铃侧平举', en: 'Lateral Raise', targets: ['arms'], muscles: ['三角肌中束'], equipment: 'dumbbell', level: 1, unit: 'reps', amount: 12, rest: 40, met: 3.0, impact: 'low',
      cues: ['微屈肘，向两侧抬起至肩高', '小指略高于拇指', '下放缓慢'],
      mistakes: ['耸肩', '甩动借力'], easier: '空手或弹力带', harder: '增加重量', caution: '肩部弹响伴痛时停止', refs: ['exrx', 'ace'] },
    { id: 'front-raise', name: '哑铃前平举', en: 'Front Raise', targets: ['arms'], muscles: ['三角肌前束'], equipment: 'dumbbell', level: 1, unit: 'reps', amount: 12, rest: 40, met: 3.0, impact: 'low',
      cues: ['手臂伸直向前抬至肩高', '身体不后仰', '缓慢下放'],
      mistakes: ['腰部代偿后仰', '抬得过高'], easier: '空手做', harder: '增加重量', caution: '肩部不适时停止', refs: ['exrx'] },
    { id: 'reverse-fly', name: '俯身反向飞鸟', en: 'Reverse Fly', targets: ['arms', 'full'], muscles: ['三角肌后束', '菱形肌'], equipment: 'dumbbell', level: 2, unit: 'reps', amount: 12, rest: 45, met: 3.2, impact: 'low',
      cues: ['俯身，背部挺直', '双臂向两侧打开，肩胛收紧', '顶端停 1 秒'],
      mistakes: ['弓背', '用斜方肌耸肩'], easier: '空手或弹力带', harder: '增加重量', caution: '腰部不适时改坐姿', refs: ['exrx', 'nasm'] },
    { id: 'shoulder-press', name: '哑铃肩上推举', en: 'Shoulder Press', targets: ['arms', 'full'], muscles: ['三角肌', '肱三头肌'], equipment: 'dumbbell', level: 2, unit: 'reps', amount: 10, rest: 50, met: 3.5, impact: 'low',
      cues: ['坐或站姿，哑铃在肩两侧', '向上推举至手臂接近伸直', '核心收紧，不塌腰'],
      mistakes: ['腰部反弓', '推举时耸肩'], easier: '单臂推或减轻重量', harder: '增加重量或站姿', caution: '肩部疼痛时停止', refs: ['exrx', 'acsm'] },

    /* ---------------- 腿 ---------------- */
    { id: 'chair-squat', name: '椅子深蹲', en: 'Chair Squat', targets: ['legs', 'glutes'], muscles: ['股四头肌', '臀大肌'], equipment: 'chair', level: 1, unit: 'reps', amount: 12, rest: 45, met: 3.5, impact: 'low',
      cues: ['双脚与肩同宽，身后放椅子', '髋部向后坐，轻触椅面再站起', '膝盖与脚尖方向一致'],
      mistakes: ['膝盖内扣', '弯腰驼背'], easier: '椅面高一点', harder: '去掉椅子做徒手深蹲', caution: '膝痛时减小下蹲幅度', refs: ['acsm', 'nhs'] },
    { id: 'squat', name: '徒手深蹲', en: 'Bodyweight Squat', targets: ['legs', 'glutes'], muscles: ['股四头肌', '臀大肌'], equipment: 'none', level: 1, unit: 'reps', amount: 15, rest: 50, met: 5.0, impact: 'low',
      cues: ['双脚与肩同宽，脚尖略外展', '髋部向后向下坐，胸口挺起', '蹲到大腿接近平行，脚跟发力站起'],
      mistakes: ['膝盖内扣', '脚跟离地', '弓背'], easier: '扶椅背或半程深蹲', harder: '加快节奏或负重', caution: '膝 / 腰不适时减小幅度', refs: ['acsm', 'exrx'] },
    { id: 'sumo-squat', name: '相扑深蹲', en: 'Sumo Squat', targets: ['legs', 'glutes'], muscles: ['臀大肌', '大腿内收肌'], equipment: 'none', level: 1, unit: 'reps', amount: 15, rest: 50, met: 5.0, impact: 'low',
      cues: ['双脚宽于肩，脚尖外展 45°', '下蹲时膝盖对准脚尖', '站起时夹紧臀部'],
      mistakes: ['膝盖内扣', '上身过度前倾'], easier: '扶椅背半程', harder: '手持重物', caution: '髋部不适时缩小站距', refs: ['exrx'] },
    { id: 'reverse-lunge', name: '后撤弓步', en: 'Reverse Lunge', targets: ['legs', 'glutes'], muscles: ['股四头肌', '臀大肌'], equipment: 'none', level: 1, unit: 'reps', amount: 12, rest: 50, met: 4.0, impact: 'low',
      cues: ['一脚向后撤，前腿膝盖对准脚尖', '下蹲至前腿大腿接近平行', '前脚发力站回'],
      mistakes: ['前膝内扣', '身体前倾过多'], easier: '扶椅背或减小步幅', harder: '手持重物', caution: '膝痛时改为静态弓步', refs: ['exrx'] },
    { id: 'forward-lunge', name: '前弓步', en: 'Forward Lunge', targets: ['legs', 'glutes'], muscles: ['股四头肌', '臀大肌'], equipment: 'none', level: 2, unit: 'reps', amount: 10, rest: 50, met: 4.0, impact: 'low',
      cues: ['向前迈步，双膝约 90°', '前膝不超过脚尖太多', '后腿膝盖接近地面'],
      mistakes: ['步幅太小', '膝盖内扣'], easier: '原地分腿蹲或扶墙', harder: '负重或加跳跃', caution: '膝痛时改静态', refs: ['exrx'] },
    { id: 'lateral-lunge', name: '侧弓步', en: 'Lateral Lunge', targets: ['legs', 'glutes'], muscles: ['臀中肌', '股四头肌'], equipment: 'none', level: 2, unit: 'reps', amount: 10, rest: 50, met: 4.0, impact: 'low',
      cues: ['向侧方迈一大步', '屈膝侧蹲，另一腿伸直', '脚跟发力推回'],
      mistakes: ['膝盖内扣', '上身过度前倾'], easier: '减小步幅', harder: '手持重物', caution: '膝关节不稳时扶墙', refs: ['exrx', 'nasm'] },
    { id: 'curtsy-lunge', name: '交叉弓步', en: 'Curtsy Lunge', targets: ['legs', 'glutes'], muscles: ['臀中肌', '臀大肌'], equipment: 'none', level: 2, unit: 'reps', amount: 10, rest: 50, met: 4.0, impact: 'low',
      cues: ['一脚向后交叉迈步', '下蹲时保持骨盆稳定', '前脚发力站回'],
      mistakes: ['膝盖内扣', '身体旋转'], easier: '扶椅背、减小幅度', harder: '负重', caution: '膝内侧不适时停止', refs: ['nasm'] },
    { id: 'step-up', name: '登阶', en: 'Step-Up', targets: ['legs', 'glutes'], muscles: ['股四头肌', '臀大肌'], equipment: 'chair', level: 2, unit: 'reps', amount: 10, rest: 50, met: 5.0, impact: 'low',
      cues: ['一只脚踩上稳固台阶', '脚跟发力把身体推起', '下落时缓慢控制'],
      mistakes: ['用后腿蹬地借力', '膝盖内扣'], easier: '降低台阶高度', harder: '增加高度或负重', caution: '台阶必须稳固', refs: ['exrx'] },
    { id: 'bulgarian-split-squat', name: '保加利亚分腿蹲', en: 'Bulgarian Split Squat', targets: ['legs', 'glutes'], muscles: ['股四头肌', '臀大肌'], equipment: 'chair', level: 3, unit: 'reps', amount: 8, rest: 60, met: 5.0, impact: 'low',
      cues: ['后脚搭在椅子上，前脚站稳', '垂直下蹲，前膝对准脚尖', '前脚发力站起'],
      mistakes: ['前脚离椅子太近', '身体过度前倾'], easier: '降低椅子高度或扶墙', harder: '手持重物', caution: '平衡差时扶墙', refs: ['exrx'] },
    { id: 'wall-sit', name: '靠墙静蹲', en: 'Wall Sit', targets: ['legs'], muscles: ['股四头肌'], equipment: 'none', level: 2, unit: 'sec', amount: 30, rest: 50, met: 4.0, impact: 'low',
      cues: ['背贴墙，膝盖约 90°', '膝盖不超过脚尖', '均匀呼吸'],
      mistakes: ['膝盖内扣', '憋气'], easier: '蹲浅一点或时间缩短', harder: '延长时间或单腿', caution: '膝痛时停止', refs: ['exrx', 'nhs'] },
    { id: 'calf-raise', name: '站姿提踵', en: 'Calf Raise', targets: ['legs'], muscles: ['小腿三头肌'], equipment: 'none', level: 1, unit: 'reps', amount: 18, rest: 35, met: 3.0, impact: 'low',
      cues: ['双脚与肩同宽，踮起脚跟', '顶端停 1 秒', '缓慢下放到最低'],
      mistakes: ['弹跳借力', '幅度不足'], easier: '扶墙做', harder: '单腿提踵或负重', caution: '跟腱不适时减小幅度', refs: ['exrx'] },
    { id: 'single-leg-calf-raise', name: '单腿提踵', en: 'Single-Leg Calf Raise', targets: ['legs'], muscles: ['小腿三头肌'], equipment: 'none', level: 2, unit: 'reps', amount: 12, rest: 40, met: 3.5, impact: 'low',
      cues: ['单脚站立，扶墙保持平衡', '踮起脚跟到最高', '缓慢下放'],
      mistakes: ['身体倾斜', '速度过快'], easier: '双脚提踵', harder: '手持重物', caution: '平衡差时扶稳', refs: ['exrx'] },
    { id: 'romanian-deadlift', name: '罗马尼亚硬拉', en: 'Romanian Deadlift', targets: ['legs', 'glutes'], muscles: ['腘绳肌', '臀大肌'], equipment: 'dumbbell', level: 2, unit: 'reps', amount: 12, rest: 55, met: 4.0, impact: 'low',
      cues: ['双脚与髋同宽，哑铃在大腿前', '髋部向后推，背部保持平直', '感受大腿后侧拉伸后站起'],
      mistakes: ['弓背', '膝盖过度弯曲变成深蹲'], easier: '空手做髋铰链练习', harder: '增加重量', caution: '腰椎不适时停止', refs: ['acsm', 'exrx'] },
    { id: 'side-lying-leg-raise', name: '侧卧抬腿', en: 'Side-Lying Leg Raise', targets: ['legs', 'glutes'], muscles: ['臀中肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 12, rest: 35, met: 2.8, impact: 'low',
      cues: ['侧卧，下侧腿微屈', '上侧腿伸直向上抬起', '脚尖朝前，不向后翻'],
      mistakes: ['身体后倒借力', '抬得过高'], easier: '减小幅度', harder: '加弹力带', caution: '髋部不适时停止', refs: ['exrx'] },

    /* ---------------- 臀 ---------------- */
    { id: 'glute-bridge', name: '臀桥', en: 'Glute Bridge', targets: ['glutes', 'legs'], muscles: ['臀大肌', '腘绳肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 15, rest: 40, met: 3.0, impact: 'low',
      cues: ['仰卧屈膝，脚跟靠近臀部', '脚跟发力顶髋，臀部夹紧', '顶端停 1-2 秒'],
      mistakes: ['用腰部顶起', '膝盖内扣'], easier: '减小幅度', harder: '单腿或加负重', caution: '腰部不适时减小幅度', refs: ['acsm', 'exrx'] },
    { id: 'hip-thrust', name: '臀推', en: 'Hip Thrust', targets: ['glutes'], muscles: ['臀大肌'], equipment: 'chair', level: 2, unit: 'reps', amount: 15, rest: 50, met: 3.5, impact: 'low',
      cues: ['上背靠椅，双脚踩地', '顶髋至躯干与大腿成直线', '下巴微收，顶端夹臀'],
      mistakes: ['腰部过伸', '脚离身体太远'], easier: '做臀桥', harder: '单腿臀推或负重', caution: '椅子要稳固', refs: ['exrx', 'nasm'] },
    { id: 'single-leg-glute-bridge', name: '单腿臀桥', en: 'Single-Leg Glute Bridge', targets: ['glutes'], muscles: ['臀大肌'], equipment: 'mat', level: 2, unit: 'reps', amount: 10, rest: 45, met: 3.5, impact: 'low',
      cues: ['一脚踩地，另一腿伸直抬起', '顶髋时骨盆保持水平', '缓慢下放'],
      mistakes: ['骨盆旋转', '腰部代偿'], easier: '双脚臀桥', harder: '脚垫高', caution: '腰部不适时停止', refs: ['exrx'] },
    { id: 'clamshell', name: '蚌式开合', en: 'Clamshell', targets: ['glutes'], muscles: ['臀中肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 15, rest: 35, met: 2.8, impact: 'low',
      cues: ['侧卧屈膝，双脚并拢', '保持骨盆稳定，上侧膝盖打开', '缓慢合拢'],
      mistakes: ['骨盆后倒', '幅度过大'], easier: '靠墙做', harder: '加弹力带', caution: '髋部不适时停止', refs: ['nasm'] },
    { id: 'fire-hydrant', name: '消防栓式', en: 'Fire Hydrant', targets: ['glutes'], muscles: ['臀中肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 12, rest: 35, met: 2.8, impact: 'low',
      cues: ['四点支撑，膝屈 90°', '一侧膝盖向侧上方抬起', '骨盆保持水平'],
      mistakes: ['身体侧倾', '塌腰'], easier: '减小幅度', harder: '加弹力带', caution: '手腕不适时用拳撑', refs: ['nasm'] },
    { id: 'donkey-kick', name: '驴踢', en: 'Donkey Kick', targets: ['glutes'], muscles: ['臀大肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 12, rest: 35, met: 2.8, impact: 'low',
      cues: ['四点支撑，膝屈 90°', '脚掌向上顶，脚跟朝天花板', '腰部不塌'],
      mistakes: ['腰部下塌', '甩腿'], easier: '减小幅度', harder: '顶端停 2 秒', caution: '腰痛时停止', refs: ['exrx'] },
    { id: 'band-lateral-walk', name: '弹力带侧向走', en: 'Band Lateral Walk', targets: ['glutes'], muscles: ['臀中肌'], equipment: 'band', level: 1, unit: 'reps', amount: 12, rest: 40, met: 3.5, impact: 'low',
      cues: ['弹力带套在膝上或踝部', '半蹲姿势侧向小步移动', '保持膝盖对准脚尖'],
      mistakes: ['身体上下起伏', '膝盖内扣'], easier: '减轻阻力', harder: '加大阻力或加宽步幅', caution: '膝痛时停止', refs: ['nasm'] },
    { id: 'frog-pump', name: '青蛙泵', en: 'Frog Pump', targets: ['glutes'], muscles: ['臀大肌'], equipment: 'mat', level: 1, unit: 'reps', amount: 20, rest: 40, met: 3.0, impact: 'low',
      cues: ['仰卧，脚掌相对、膝盖打开', '脚跟相触发力顶髋', '顶端夹紧臀部'],
      mistakes: ['腰部代偿', '幅度不足'], easier: '减小幅度', harder: '顶端停 2 秒', caution: '髋部不适时停止', refs: ['ace'] },

    /* ---------------- 全身 / 背胸 ---------------- */
    { id: 'dumbbell-row', name: '哑铃划船', en: 'Dumbbell Row', targets: ['full'], muscles: ['背阔肌', '菱形肌', '肱二头肌'], equipment: 'dumbbell', level: 1, unit: 'reps', amount: 12, rest: 45, met: 3.5, impact: 'low',
      cues: ['俯身，背部平直，一手扶椅', '肘贴近身体向后拉', '肩胛骨收紧停 1 秒'],
      mistakes: ['弓背', '用腰部甩动'], easier: '坐姿弹力带划船', harder: '增加重量', caution: '腰部不适时改坐姿', refs: ['acsm', 'exrx'] },
    { id: 'inverted-row', name: '反向划船', en: 'Inverted Row', targets: ['full'], muscles: ['背阔肌', '菱形肌'], equipment: 'chair', level: 2, unit: 'reps', amount: 8, rest: 50, met: 4.0, impact: 'low',
      cues: ['仰卧在稳固桌子 / 横杆下方', '身体成直线，拉起身体', '胸口接近横杆'],
      mistakes: ['塌腰', '幅度不足'], easier: '身体更直立', harder: '脚放低让身体更水平', caution: '确保支撑物稳固', refs: ['acsm'] },
    { id: 'superman', name: '小燕飞', en: 'Superman', targets: ['full'], muscles: ['竖脊肌', '臀大肌'], equipment: 'mat', level: 1, unit: 'sec', amount: 20, rest: 35, met: 3.0, impact: 'low',
      cues: ['俯卧，手臂向前伸展', '同时抬起手臂和双腿', '保持颈部中立'],
      mistakes: ['抬头过度', '憋气'], easier: '只抬上身或只抬腿', harder: '延长时间', caution: '腰痛时减小幅度', refs: ['acsm'] },
    { id: 'farmer-carry', name: '农夫行走', en: "Farmer's Carry", targets: ['full'], muscles: ['前臂', '斜方肌', '核心'], equipment: 'dumbbell', level: 1, unit: 'sec', amount: 40, rest: 45, met: 4.0, impact: 'low',
      cues: ['双手提重物，自然站立', '肩胛下沉，核心收紧', '小步稳定行走'],
      mistakes: ['耸肩', '身体侧倾'], easier: '减轻重量', harder: '增加重量或延长时间', caution: '握力不足时降低重量', refs: ['acsm'] },
    { id: 'bear-crawl', name: '熊爬', en: 'Bear Crawl', targets: ['full'], muscles: ['核心', '肩', '股四头肌'], equipment: 'mat', level: 2, unit: 'sec', amount: 30, rest: 45, met: 5.0, impact: 'low',
      cues: ['四点支撑，膝盖离地', '对侧手脚同时向前移动', '背部保持平直'],
      mistakes: ['臀部过高', '塌腰'], easier: '原地撑住不动', harder: '增加距离', caution: '手腕不适时停止', refs: ['ace'] },
    { id: 'squat-to-press', name: '深蹲推举', en: 'Squat to Press', targets: ['full'], muscles: ['臀腿', '肩'], equipment: 'dumbbell', level: 2, unit: 'reps', amount: 12, rest: 55, met: 5.5, impact: 'low',
      cues: ['持哑铃于肩前，下蹲', '起身同时向上推举', '核心收紧不塌腰'],
      mistakes: ['推举时腰部反弓', '动作脱节'], easier: '分开做深蹲和推举', harder: '增加重量', caution: '肩部不适时去掉推举', refs: ['acsm'] },
    { id: 'dumbbell-swing', name: '哑铃摆荡', en: 'Dumbbell Swing', targets: ['full'], muscles: ['臀大肌', '腘绳肌', '核心'], equipment: 'dumbbell', level: 3, unit: 'reps', amount: 15, rest: 60, met: 6.0, impact: 'medium',
      cues: ['双脚略宽，双手握哑铃', '髋部铰链发力，把哑铃摆到胸高', '手臂放松，靠髋部驱动'],
      mistakes: ['用肩部硬拉', '弓背'], easier: '空手髋铰链练习', harder: '增加重量', caution: '腰椎不适或新手先学髋铰链', refs: ['acsm', 'exrx'] },
    { id: 'burpee', name: '波比跳', en: 'Burpee', targets: ['full', 'cardio'], muscles: ['全身'], equipment: 'mat', level: 3, unit: 'reps', amount: 8, rest: 60, met: 8.0, impact: 'high',
      cues: ['下蹲撑地，双脚后跳成平板', '收腿起身向上跳', '落地缓冲'],
      mistakes: ['塌腰', '落地膝盖锁死'], easier: '去掉跳跃，改为走步后撤', harder: '加俯卧撑', caution: '膝 / 腰 / 体重较大者建议用低冲击版本', refs: ['ace'] },
    { id: 'kettlebell-swing', name: '壶铃摆荡', en: 'Kettlebell Swing', targets: ['full'], muscles: ['臀大肌', '腘绳肌'], equipment: 'dumbbell', level: 3, unit: 'reps', amount: 15, rest: 60, met: 9.8, impact: 'medium',
      cues: ['壶铃 / 哑铃放在身前', '髋部铰链，摆到胸高', '顶端夹臀，核心收紧'],
      mistakes: ['用腰发力', '蹲得太深'], easier: '先做罗马尼亚硬拉', harder: '增加重量', caution: '腰不适者避免', refs: ['acsm'] },

    /* ---------------- 有氧 ---------------- */
    { id: 'brisk-walk', name: '快走', en: 'Brisk Walk', targets: ['cardio'], muscles: ['下肢', '心肺'], equipment: 'none', level: 1, unit: 'sec', amount: 300, rest: 30, met: 4.3, impact: 'low',
      cues: ['抬头挺胸，摆臂自然', '速度到「能说话但唱不了歌」', '脚跟先着地再过渡到脚尖'],
      mistakes: ['驼背', '步幅过大'], easier: '慢走', harder: '加速或加坡度', caution: '膝 / 足不适时穿缓震鞋', refs: ['who', 'cdc'] },
    { id: 'march-in-place', name: '原地踏步', en: 'March in Place', targets: ['cardio'], muscles: ['下肢', '心肺'], equipment: 'none', level: 1, unit: 'sec', amount: 180, rest: 30, met: 3.5, impact: 'low',
      cues: ['原地抬膝至髋部高度', '摆臂配合', '保持呼吸'],
      mistakes: ['幅度太小', '含胸'], easier: '慢速小幅度', harder: '加快节奏', caution: '平衡差时扶椅背', refs: ['cdc'] },
    { id: 'step-touch', name: '侧点步', en: 'Step Touch', targets: ['cardio'], muscles: ['下肢', '心肺'], equipment: 'none', level: 1, unit: 'sec', amount: 180, rest: 30, met: 4.0, impact: 'low',
      cues: ['左右交替侧移点地', '手臂自然摆动', '膝盖微屈缓冲'],
      mistakes: ['动作僵硬', '幅度过大'], easier: '放慢节奏', harder: '加大幅度或加快', caution: '膝痛时减小幅度', refs: ['cdc'] },
    { id: 'low-impact-jack', name: '低冲击开合', en: 'Low-Impact Jumping Jack', targets: ['cardio'], muscles: ['全身', '心肺'], equipment: 'none', level: 2, unit: 'sec', amount: 45, rest: 30, met: 5.0, impact: 'low',
      cues: ['一脚侧迈同时双手上举', '交替进行，不跳跃', '落地轻柔'],
      mistakes: ['手臂举太高耸肩', '节奏过快'], easier: '只做手臂', harder: '加跳跃变成开合跳', caution: '肩部不适时手臂放低', refs: ['cdc'] },
    { id: 'shadow-boxing', name: '空击拳', en: 'Shadow Boxing', targets: ['cardio'], muscles: ['上肢', '核心', '心肺'], equipment: 'none', level: 2, unit: 'sec', amount: 60, rest: 40, met: 6.0, impact: 'low',
      cues: ['双脚前后站，膝盖微屈', '出拳时转髋转肩', '保持核心收紧'],
      mistakes: ['手臂伸直锁死', '憋气'], easier: '放慢出拳', harder: '加闪避和步法', caution: '肩部不适时减小幅度', refs: ['ace'] },
    { id: 'stair-climb', name: '爬楼梯', en: 'Stair Climbing', targets: ['cardio'], muscles: ['臀腿', '心肺'], equipment: 'none', level: 2, unit: 'sec', amount: 180, rest: 45, met: 6.0, impact: 'medium',
      cues: ['全脚掌踩实台阶', '身体略前倾，扶扶手保持平衡', '匀速上下'],
      mistakes: ['跨两级', '下楼梯时膝盖锁死'], easier: '只上楼梯，坐电梯下', harder: '加快速度', caution: '膝痛者减小强度', refs: ['cdc'] },
    { id: 'stationary-bike', name: '固定单车', en: 'Stationary Bike', targets: ['cardio'], muscles: ['下肢', '心肺'], equipment: 'none', level: 1, unit: 'sec', amount: 300, rest: 30, met: 5.5, impact: 'low',
      cues: ['座椅高度让膝盖微屈', '匀速踩踏，保持呼吸', '上身放松'],
      mistakes: ['座椅过低', '阻力过大'], easier: '降低阻力', harder: '增加阻力或间歇冲刺', caution: '膝痛时调高座椅', refs: ['cdc'] },
    { id: 'jump-rope', name: '跳绳', en: 'Jump Rope', targets: ['cardio'], muscles: ['小腿', '心肺'], equipment: 'none', level: 3, unit: 'sec', amount: 60, rest: 60, met: 10.0, impact: 'high',
      cues: ['前脚掌着地，膝盖微屈', '手腕摇绳，跳起幅度小', '保持节奏'],
      mistakes: ['跳太高', '全脚掌重落地'], easier: '无绳原地小跳', harder: '加速或双摇', caution: '体重较大 / 膝踝不适者不建议', refs: ['ace'] },
    { id: 'dance', name: '跟练舞蹈', en: 'Dance Workout', targets: ['cardio'], muscles: ['全身', '心肺'], equipment: 'none', level: 2, unit: 'sec', amount: 180, rest: 30, met: 5.0, impact: 'low',
      cues: ['跟着节奏动起来', '膝盖保持微屈', '量力而行，不必追求幅度'],
      mistakes: ['动作过猛', '憋气'], easier: '只做上肢动作', harder: '加大幅度', caution: '膝踝不适时减小跳跃', refs: ['who'] },

    /* ---------------- 拉伸 / 恢复 ---------------- */
    { id: 'cat-cow', name: '猫牛式', en: 'Cat-Cow', targets: ['mobility'], muscles: ['脊柱', '核心'], equipment: 'mat', level: 1, unit: 'sec', amount: 40, rest: 15, met: 2.0, impact: 'low',
      cues: ['四点支撑，吸气塌腰抬头', '呼气拱背低头', '缓慢跟随呼吸'],
      mistakes: ['动作过快', '幅度过猛'], easier: '减小幅度', harder: '配合侧向移动', caution: '腕部不适用拳撑', refs: ['ace'] },
    { id: 'child-pose', name: '婴儿式', en: "Child's Pose", targets: ['mobility'], muscles: ['背部', '髋部'], equipment: 'mat', level: 1, unit: 'sec', amount: 40, rest: 10, met: 1.8, impact: 'low',
      cues: ['跪坐，臀部坐向脚跟', '手臂向前伸展，额头贴地', '深呼吸放松'],
      mistakes: ['耸肩', '憋气'], easier: '膝盖下垫枕', harder: '侧向伸展', caution: '膝痛时垫软垫', refs: ['ace'] },
    { id: 'cobra', name: '眼镜蛇式', en: 'Cobra', targets: ['mobility'], muscles: ['腹部', '脊柱'], equipment: 'mat', level: 1, unit: 'sec', amount: 30, rest: 10, met: 2.0, impact: 'low',
      cues: ['俯卧，手掌撑地', '缓慢抬起胸口，肩膀下沉', '髋部贴地'],
      mistakes: ['手臂用力过猛', '耸肩'], easier: '肘撑地', harder: '抬得更高', caution: '腰痛时减小幅度', refs: ['ace'] },
    { id: 'chest-stretch', name: '胸部拉伸', en: 'Chest Stretch', targets: ['mobility'], muscles: ['胸大肌'], equipment: 'none', level: 1, unit: 'sec', amount: 30, rest: 10, met: 1.8, impact: 'low',
      cues: ['扶墙或门框，手臂向后打开', '身体微微前倾', '保持 30 秒，正常呼吸'],
      mistakes: ['耸肩', '弹震式拉伸'], easier: '减小幅度', harder: '换不同角度', caution: '肩部刺痛时停止', refs: ['ace'] },
    { id: 'hip-flexor-stretch', name: '髋屈肌拉伸', en: 'Hip Flexor Stretch', targets: ['mobility'], muscles: ['髂腰肌'], equipment: 'mat', level: 1, unit: 'sec', amount: 30, rest: 10, met: 2.0, impact: 'low',
      cues: ['弓步跪姿，后腿膝盖着地', '骨盆后倾，身体微前移', '感受髋前侧拉伸'],
      mistakes: ['腰部反弓', '幅度过大'], easier: '垫软垫', harder: '加手臂上举', caution: '膝痛时垫厚垫', refs: ['ace'] },
    { id: 'hamstring-stretch', name: '腘绳肌拉伸', en: 'Hamstring Stretch', targets: ['mobility'], muscles: ['腘绳肌'], equipment: 'mat', level: 1, unit: 'sec', amount: 30, rest: 10, met: 1.8, impact: 'low',
      cues: ['坐姿一腿伸直，身体前倾', '背部挺直，从髋部折叠', '保持 30 秒'],
      mistakes: ['弓背硬压', '弹震'], easier: '屈膝', harder: '勾脚尖加深', caution: '腰部不适时减小幅度', refs: ['ace'] },
    { id: 'quad-stretch', name: '股四头肌拉伸', en: 'Quad Stretch', targets: ['mobility'], muscles: ['股四头肌'], equipment: 'none', level: 1, unit: 'sec', amount: 30, rest: 10, met: 2.0, impact: 'low',
      cues: ['站立扶墙，一手抓脚踝', '脚跟拉向臀部', '膝盖并拢，骨盆中立'],
      mistakes: ['腰部反弓', '膝盖外翻'], easier: '扶墙保持平衡', harder: '加深拉伸', caution: '膝痛时停止', refs: ['ace'] },
    { id: 'glute-stretch', name: '臀部拉伸', en: 'Figure-4 Stretch', targets: ['mobility'], muscles: ['臀大肌'], equipment: 'mat', level: 1, unit: 'sec', amount: 30, rest: 10, met: 2.0, impact: 'low',
      cues: ['仰卧，一腿搭成「4」字', '双手抱大腿后侧拉向胸口', '保持呼吸'],
      mistakes: ['用力过猛', '憋气'], easier: '减小幅度', harder: '坐姿版本', caution: '髋部刺痛时停止', refs: ['ace'] },
    { id: 'calf-stretch', name: '小腿拉伸', en: 'Calf Stretch', targets: ['mobility'], muscles: ['小腿三头肌'], equipment: 'none', level: 1, unit: 'sec', amount: 30, rest: 10, met: 1.8, impact: 'low',
      cues: ['弓步扶墙，后腿伸直', '脚跟踩实地面', '身体前倾加深'],
      mistakes: ['后脚跟离地', '弹震'], easier: '减小前倾', harder: '屈膝拉伸比目鱼肌', caution: '跟腱痛时减小幅度', refs: ['ace'] },
    { id: 'thoracic-rotation', name: '胸椎旋转', en: 'Thoracic Rotation', targets: ['mobility'], muscles: ['胸椎', '核心'], equipment: 'mat', level: 1, unit: 'reps', amount: 8, rest: 15, met: 2.0, impact: 'low',
      cues: ['四点支撑，一手放头后', '肘部向天花板旋转打开', '缓慢回位'],
      mistakes: ['腰部代偿', '速度过快'], easier: '手放肩上', harder: '加幅度', caution: '眩晕时停止', refs: ['ace'] },
    { id: 'neck-roll', name: '颈肩放松', en: 'Neck & Shoulder Roll', targets: ['mobility'], muscles: ['斜方肌', '颈部'], equipment: 'none', level: 1, unit: 'sec', amount: 30, rest: 10, met: 1.8, impact: 'low',
      cues: ['肩膀向后绕环', '头部缓慢左右侧倾', '不要快速转圈'],
      mistakes: ['用力过猛', '快速甩头'], easier: '减小幅度', harder: '配合呼吸加深', caution: '颈椎不适时咨询医生', refs: ['ace'] }
  ];

  /* ------------------------- 训练组合 ------------------------- */
  /* target 与 level、时长、热身/冷身 */
  var PROGRAMS = [
    /* 腹部 */
    { id: 'abs-l1-a', name: '核心唤醒 · 入门', target: 'abs', level: 1, durationMin: 12, warmupSec: 180, cooldownSec: 120,
      desc: '零基础友好，唤醒深层核心，保护腰椎。', frequency: '每周 2-3 次，间隔至少 48 小时',
      items: [
        { exerciseId: 'dead-bug', sets: 3, amount: 10, unit: 'reps', rest: 45 },
        { exerciseId: 'crunch', sets: 3, amount: 12, unit: 'reps', rest: 40 },
        { exerciseId: 'plank', sets: 3, amount: 20, unit: 'sec', rest: 45 },
        { exerciseId: 'bird-dog', sets: 2, amount: 8, unit: 'reps', rest: 40 }
      ], refs: ['acsm', 'ace'] },
    { id: 'abs-l2-a', name: '核心进阶 · 抗旋转', target: 'abs', level: 2, durationMin: 15, warmupSec: 180, cooldownSec: 120,
      desc: '加入侧向与抗旋转训练，兼顾腰腹线条和稳定。', frequency: '每周 2-3 次',
      items: [
        { exerciseId: 'reverse-crunch', sets: 3, amount: 12, unit: 'reps', rest: 40 },
        { exerciseId: 'bicycle-crunch', sets: 3, amount: 20, unit: 'reps', rest: 40 },
        { exerciseId: 'side-plank', sets: 3, amount: 20, unit: 'sec', rest: 40 },
        { exerciseId: 'mountain-climber', sets: 3, amount: 30, unit: 'sec', rest: 45 },
        { exerciseId: 'plank-shoulder-tap', sets: 3, amount: 16, unit: 'reps', rest: 40 }
      ], refs: ['acsm', 'ace'] },
    { id: 'abs-l3-a', name: '核心强化 · 燃脂', target: 'abs', level: 3, durationMin: 18, warmupSec: 180, cooldownSec: 120,
      desc: '强度更高，适合已有训练基础的人。', frequency: '每周 2 次，注意恢复',
      items: [
        { exerciseId: 'leg-raise', sets: 3, amount: 10, unit: 'reps', rest: 45 },
        { exerciseId: 'russian-twist', sets: 3, amount: 20, unit: 'reps', rest: 40 },
        { exerciseId: 'hollow-hold', sets: 3, amount: 20, unit: 'sec', rest: 45 },
        { exerciseId: 'v-up', sets: 3, amount: 8, unit: 'reps', rest: 50 },
        { exerciseId: 'flutter-kick', sets: 3, amount: 30, unit: 'sec', rest: 40 }
      ], refs: ['acsm', 'exrx'] },

    /* 手臂 */
    { id: 'arms-l1-a', name: '手臂唤醒 · 入门', target: 'arms', level: 1, durationMin: 12, warmupSec: 150, cooldownSec: 120,
      desc: '从推和弯举开始，建立上肢基础力量。', frequency: '每周 2-3 次',
      items: [
        { exerciseId: 'wall-pushup', sets: 3, amount: 10, unit: 'reps', rest: 40 },
        { exerciseId: 'biceps-curl', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'triceps-kickback', sets: 3, amount: 12, unit: 'reps', rest: 40 },
        { exerciseId: 'lateral-raise', sets: 3, amount: 12, unit: 'reps', rest: 40 }
      ], refs: ['acsm', 'exrx'] },
    { id: 'arms-l2-a', name: '手臂塑形 · 进阶', target: 'arms', level: 2, durationMin: 15, warmupSec: 150, cooldownSec: 120,
      desc: '二头、三头、肩后束全覆盖，改善手臂松垮。', frequency: '每周 2-3 次',
      items: [
        { exerciseId: 'knee-pushup', sets: 3, amount: 10, unit: 'reps', rest: 45 },
        { exerciseId: 'hammer-curl', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'overhead-triceps-extension', sets: 3, amount: 12, unit: 'reps', rest: 40 },
        { exerciseId: 'chair-dip', sets: 3, amount: 10, unit: 'reps', rest: 50 },
        { exerciseId: 'reverse-fly', sets: 3, amount: 12, unit: 'reps', rest: 45 }
      ], refs: ['acsm', 'nasm'] },
    { id: 'arms-l3-a', name: '手臂力量 · 强化', target: 'arms', level: 3, durationMin: 18, warmupSec: 180, cooldownSec: 120,
      desc: '自重推类为主，提升上肢力量与线条。', frequency: '每周 2 次',
      items: [
        { exerciseId: 'pushup', sets: 3, amount: 10, unit: 'reps', rest: 50 },
        { exerciseId: 'diamond-pushup', sets: 3, amount: 8, unit: 'reps', rest: 50 },
        { exerciseId: 'concentration-curl', sets: 3, amount: 10, unit: 'reps', rest: 45 },
        { exerciseId: 'close-grip-pushup', sets: 3, amount: 10, unit: 'reps', rest: 50 },
        { exerciseId: 'shoulder-press', sets: 3, amount: 10, unit: 'reps', rest: 50 }
      ], refs: ['acsm', 'exrx'] },

    /* 腿 */
    { id: 'legs-l1-a', name: '腿部唤醒 · 入门', target: 'legs', level: 1, durationMin: 12, warmupSec: 180, cooldownSec: 150,
      desc: '低冲击练腿，兼顾膝盖友好和基础力量。', frequency: '每周 2-3 次',
      items: [
        { exerciseId: 'chair-squat', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'glute-bridge', sets: 3, amount: 15, unit: 'reps', rest: 40 },
        { exerciseId: 'calf-raise', sets: 3, amount: 18, unit: 'reps', rest: 35 },
        { exerciseId: 'wall-sit', sets: 3, amount: 25, unit: 'sec', rest: 45 }
      ], refs: ['acsm', 'nhs'] },
    { id: 'legs-l2-a', name: '腿部塑形 · 进阶', target: 'legs', level: 2, durationMin: 16, warmupSec: 180, cooldownSec: 150,
      desc: '深蹲 + 弓步 + 硬拉，覆盖大腿前后侧。', frequency: '每周 2 次，间隔 48 小时',
      items: [
        { exerciseId: 'squat', sets: 3, amount: 15, unit: 'reps', rest: 50 },
        { exerciseId: 'reverse-lunge', sets: 3, amount: 12, unit: 'reps', rest: 50 },
        { exerciseId: 'step-up', sets: 3, amount: 10, unit: 'reps', rest: 50 },
        { exerciseId: 'romanian-deadlift', sets: 3, amount: 12, unit: 'reps', rest: 55 },
        { exerciseId: 'calf-raise', sets: 3, amount: 18, unit: 'reps', rest: 35 }
      ], refs: ['acsm', 'exrx'] },
    { id: 'legs-l3-a', name: '腿部力量 · 强化', target: 'legs', level: 3, durationMin: 18, warmupSec: 180, cooldownSec: 150,
      desc: '单腿为主，提升力量与稳定性。', frequency: '每周 2 次',
      items: [
        { exerciseId: 'sumo-squat', sets: 3, amount: 15, unit: 'reps', rest: 50 },
        { exerciseId: 'bulgarian-split-squat', sets: 3, amount: 8, unit: 'reps', rest: 60 },
        { exerciseId: 'forward-lunge', sets: 3, amount: 10, unit: 'reps', rest: 50 },
        { exerciseId: 'single-leg-calf-raise', sets: 3, amount: 12, unit: 'reps', rest: 40 },
        { exerciseId: 'wall-sit', sets: 3, amount: 40, unit: 'sec', rest: 50 }
      ], refs: ['acsm', 'exrx'] },

    /* 臀 */
    { id: 'glutes-l1-a', name: '臀部激活 · 入门', target: 'glutes', level: 1, durationMin: 12, warmupSec: 150, cooldownSec: 150,
      desc: '久坐人群先激活臀肌，改善骨盆前倾与塌臀。', frequency: '每周 3 次，可每天做',
      items: [
        { exerciseId: 'glute-bridge', sets: 3, amount: 15, unit: 'reps', rest: 40 },
        { exerciseId: 'clamshell', sets: 3, amount: 15, unit: 'reps', rest: 35 },
        { exerciseId: 'fire-hydrant', sets: 3, amount: 12, unit: 'reps', rest: 35 },
        { exerciseId: 'donkey-kick', sets: 3, amount: 12, unit: 'reps', rest: 35 },
        { exerciseId: 'frog-pump', sets: 3, amount: 20, unit: 'reps', rest: 40 }
      ], refs: ['nasm', 'ace'] },
    { id: 'glutes-l2-a', name: '臀部塑形 · 进阶', target: 'glutes', level: 2, durationMin: 16, warmupSec: 180, cooldownSec: 150,
      desc: '臀推 + 单腿 + 侧向，兼顾翘度与宽度。', frequency: '每周 2-3 次',
      items: [
        { exerciseId: 'hip-thrust', sets: 3, amount: 15, unit: 'reps', rest: 50 },
        { exerciseId: 'single-leg-glute-bridge', sets: 3, amount: 10, unit: 'reps', rest: 45 },
        { exerciseId: 'sumo-squat', sets: 3, amount: 15, unit: 'reps', rest: 50 },
        { exerciseId: 'band-lateral-walk', sets: 3, amount: 12, unit: 'reps', rest: 40 },
        { exerciseId: 'curtsy-lunge', sets: 3, amount: 10, unit: 'reps', rest: 50 }
      ], refs: ['nasm', 'exrx'] },
    { id: 'glutes-l3-a', name: '臀部力量 · 强化', target: 'glutes', level: 3, durationMin: 18, warmupSec: 180, cooldownSec: 150,
      desc: '髋主导 + 单腿，进阶臀部力量。', frequency: '每周 2 次',
      items: [
        { exerciseId: 'romanian-deadlift', sets: 3, amount: 12, unit: 'reps', rest: 55 },
        { exerciseId: 'bulgarian-split-squat', sets: 3, amount: 8, unit: 'reps', rest: 60 },
        { exerciseId: 'hip-thrust', sets: 3, amount: 20, unit: 'reps', rest: 55 },
        { exerciseId: 'single-leg-glute-bridge', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'fire-hydrant', sets: 3, amount: 15, unit: 'reps', rest: 35 }
      ], refs: ['nasm', 'acsm'] },

    /* 全身 */
    { id: 'full-l1-a', name: '全身唤醒 · 入门', target: 'full', level: 1, durationMin: 15, warmupSec: 180, cooldownSec: 150,
      desc: '一次练到全身，适合刚开始运动的你。', frequency: '每周 2 次',
      items: [
        { exerciseId: 'chair-squat', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'wall-pushup', sets: 3, amount: 10, unit: 'reps', rest: 40 },
        { exerciseId: 'dumbbell-row', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'glute-bridge', sets: 3, amount: 15, unit: 'reps', rest: 40 },
        { exerciseId: 'farmer-carry', sets: 3, amount: 40, unit: 'sec', rest: 45 }
      ], refs: ['acsm', 'who'] },
    { id: 'full-l2-a', name: '全身循环 · 进阶', target: 'full', level: 2, durationMin: 18, warmupSec: 180, cooldownSec: 150,
      desc: '上下肢交替，提升心率与代谢。', frequency: '每周 2-3 次',
      items: [
        { exerciseId: 'squat', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'knee-pushup', sets: 3, amount: 10, unit: 'reps', rest: 45 },
        { exerciseId: 'dumbbell-row', sets: 3, amount: 12, unit: 'reps', rest: 45 },
        { exerciseId: 'reverse-lunge', sets: 3, amount: 10, unit: 'reps', rest: 50 },
        { exerciseId: 'superman', sets: 3, amount: 20, unit: 'sec', rest: 40 }
      ], refs: ['acsm', 'who'] },
    { id: 'full-l3-a', name: '全身燃脂 · 强化', target: 'full', level: 3, durationMin: 20, warmupSec: 180, cooldownSec: 150,
      desc: '高强度全身循环，建议有基础后再做。', frequency: '每周 2 次',
      items: [
        { exerciseId: 'burpee', sets: 3, amount: 8, unit: 'reps', rest: 60 },
        { exerciseId: 'dumbbell-swing', sets: 3, amount: 15, unit: 'reps', rest: 60 },
        { exerciseId: 'pushup', sets: 3, amount: 12, unit: 'reps', rest: 50 },
        { exerciseId: 'bulgarian-split-squat', sets: 3, amount: 8, unit: 'reps', rest: 60 },
        { exerciseId: 'bear-crawl', sets: 3, amount: 30, unit: 'sec', rest: 50 }
      ], refs: ['acsm', 'ace'] },

    /* 有氧 */
    { id: 'cardio-l1-a', name: '有氧起步 · 快走', target: 'cardio', level: 1, durationMin: 22, warmupSec: 0, cooldownSec: 180,
      desc: '最容易坚持的有氧，边走边听歌。', frequency: '每周 3-5 次，累计 150 分钟以上',
      items: [
        { exerciseId: 'march-in-place', sets: 1, amount: 180, unit: 'sec', rest: 30 },
        { exerciseId: 'brisk-walk', sets: 1, amount: 600, unit: 'sec', rest: 60 },
        { exerciseId: 'brisk-walk', sets: 1, amount: 600, unit: 'sec', rest: 60 }
      ], refs: ['who', 'cdc'] },
    { id: 'cardio-l2-a', name: '有氧燃脂 · 间歇', target: 'cardio', level: 2, durationMin: 18, warmupSec: 0, cooldownSec: 180,
      desc: '低冲击间歇，宅家也能完成。', frequency: '每周 3 次',
      items: [
        { exerciseId: 'low-impact-jack', sets: 3, amount: 45, unit: 'sec', rest: 30 },
        { exerciseId: 'step-touch', sets: 3, amount: 60, unit: 'sec', rest: 30 },
        { exerciseId: 'shadow-boxing', sets: 3, amount: 60, unit: 'sec', rest: 40 },
        { exerciseId: 'march-in-place', sets: 3, amount: 60, unit: 'sec', rest: 30 }
      ], refs: ['who', 'cdc'] },
    { id: 'cardio-l3-a', name: '有氧挑战 · 拳击', target: 'cardio', level: 3, durationMin: 20, warmupSec: 0, cooldownSec: 180,
      desc: '节奏更快，挑战心肺上限。', frequency: '每周 2-3 次',
      items: [
        { exerciseId: 'shadow-boxing', sets: 4, amount: 90, unit: 'sec', rest: 40 },
        { exerciseId: 'low-impact-jack', sets: 3, amount: 60, unit: 'sec', rest: 30 },
        { exerciseId: 'stair-climb', sets: 3, amount: 60, unit: 'sec', rest: 45 },
        { exerciseId: 'mountain-climber', sets: 3, amount: 30, unit: 'sec', rest: 45 }
      ], refs: ['who', 'ace'] },

    /* 拉伸 */
    { id: 'mobility-l1-a', name: '睡前舒缓 · 放松', target: 'mobility', level: 1, durationMin: 10, warmupSec: 0, cooldownSec: 0,
      desc: '睡前或久坐后做，缓解酸痛、改善睡眠。', frequency: '每天都可以',
      items: [
        { exerciseId: 'cat-cow', sets: 1, amount: 40, unit: 'sec', rest: 10 },
        { exerciseId: 'child-pose', sets: 1, amount: 40, unit: 'sec', rest: 10 },
        { exerciseId: 'hip-flexor-stretch', sets: 1, amount: 30, unit: 'sec', rest: 10 },
        { exerciseId: 'hamstring-stretch', sets: 1, amount: 30, unit: 'sec', rest: 10 },
        { exerciseId: 'glute-stretch', sets: 1, amount: 30, unit: 'sec', rest: 10 },
        { exerciseId: 'chest-stretch', sets: 1, amount: 30, unit: 'sec', rest: 10 }
      ], refs: ['ace', 'nhs'] },
    { id: 'mobility-l1-b', name: '久坐解救 · 颈肩腰', target: 'mobility', level: 1, durationMin: 8, warmupSec: 0, cooldownSec: 0,
      desc: '办公室 / 刷手机后做，打开僵硬的肩颈和髋。', frequency: '每坐 1 小时做一次',
      items: [
        { exerciseId: 'neck-roll', sets: 1, amount: 30, unit: 'sec', rest: 10 },
        { exerciseId: 'cat-cow', sets: 1, amount: 30, unit: 'sec', rest: 10 },
        { exerciseId: 'thoracic-rotation', sets: 1, amount: 8, unit: 'reps', rest: 10 },
        { exerciseId: 'chest-stretch', sets: 1, amount: 30, unit: 'sec', rest: 10 },
        { exerciseId: 'hip-flexor-stretch', sets: 1, amount: 30, unit: 'sec', rest: 10 }
      ], refs: ['ace', 'nhs'] }
  ];

  /* ------------------------- 示意动画映射 ------------------------- */
  /* 每个动作对应一段本地骨架动画（见 js/anim.js），不是解剖级示范 */
  var ANIM = {
    /* 腹部 */
    'dead-bug': 'deadbug', 'crunch': 'crunch', 'reverse-crunch': 'crunch',
    'plank': 'plank', 'side-plank': 'sideplank', 'bird-dog': 'birddog',
    'mountain-climber': 'plank', 'bicycle-crunch': 'crunch', 'leg-raise': 'legraise',
    'russian-twist': 'crunch', 'hollow-hold': 'hollow', 'v-up': 'hollow',
    'plank-shoulder-tap': 'plank', 'pallof-press': 'row', 'flutter-kick': 'legraise',
    /* 手臂 */
    'wall-pushup': 'pushup', 'knee-pushup': 'pushup', 'pushup': 'pushup',
    'diamond-pushup': 'pushup', 'close-grip-pushup': 'pushup',
    'biceps-curl': 'curl', 'hammer-curl': 'curl', 'concentration-curl': 'curl', 'band-curl': 'curl',
    'triceps-kickback': 'triceps', 'overhead-triceps-extension': 'triceps', 'chair-dip': 'dip',
    'lateral-raise': 'raise', 'front-raise': 'raise', 'reverse-fly': 'row', 'shoulder-press': 'press',
    /* 腿 */
    'chair-squat': 'squat', 'squat': 'squat', 'sumo-squat': 'squat',
    'reverse-lunge': 'lunge', 'forward-lunge': 'lunge', 'lateral-lunge': 'lunge',
    'curtsy-lunge': 'lunge', 'step-up': 'lunge', 'bulgarian-split-squat': 'lunge',
    'wall-sit': 'wallsit', 'calf-raise': 'calf', 'single-leg-calf-raise': 'calf',
    'romanian-deadlift': 'hinge', 'side-lying-leg-raise': 'clamshell',
    /* 臀 */
    'glute-bridge': 'bridge', 'hip-thrust': 'bridge', 'single-leg-glute-bridge': 'bridge',
    'clamshell': 'clamshell', 'fire-hydrant': 'quadruped', 'donkey-kick': 'quadruped',
    'band-lateral-walk': 'walk', 'frog-pump': 'bridge',
    /* 全身 */
    'dumbbell-row': 'row', 'inverted-row': 'row', 'superman': 'superman',
    'farmer-carry': 'walk', 'bear-crawl': 'quadruped', 'squat-to-press': 'press',
    'dumbbell-swing': 'hinge', 'burpee': 'burpee', 'kettlebell-swing': 'hinge',
    /* 有氧 */
    'brisk-walk': 'walk', 'march-in-place': 'march', 'step-touch': 'march',
    'low-impact-jack': 'jack', 'shadow-boxing': 'boxing', 'stair-climb': 'march',
    'stationary-bike': 'bike', 'jump-rope': 'jack', 'dance': 'march',
    /* 拉伸 */
    'cat-cow': 'stretchQuad', 'child-pose': 'stretchFloor', 'cobra': 'superman',
    'chest-stretch': 'stretchStand', 'hip-flexor-stretch': 'stretchQuad',
    'hamstring-stretch': 'stretchFloor', 'quad-stretch': 'stretchQuad',
    'glute-stretch': 'stretchFloor', 'calf-stretch': 'stretchStand',
    'thoracic-rotation': 'stretchQuad', 'neck-roll': 'stretchStand'
  };

  /* ------------------------- 教练人格 ------------------------- */
  var COACHES = {
    gentle: {
      id: 'gentle', name: '小练', emoji: '🌱', label: '温柔陪练', desc: '轻声细语，允许你偶尔偷懒，但会一直在',
      voice: { rate: 1.0, pitch: 1.15 },
      greet: ['今天也来动一动吧，哪怕只有 10 分钟，也算数。', '不着急，慢慢来，我们先从最简单的开始。', '能开始就已经赢过昨天的自己了。'],
      pre: ['准备好了吗？累了就放慢，不用硬撑。', '我们一组一组来，做不动随时可以停。', '先深呼吸三次，然后我们开始。'],
      mid: ['很好，保持呼吸，不要憋气。', '你已经做得很棒了，再坚持一下下。', '动作慢一点没关系，做对更重要。'],
      lastSet: ['最后一组了，给自己一点掌声。', '收尾了，稳住节奏。'],
      finish: ['今天也完成了，真为你高兴。', '打卡成功！记得喝点水，拉伸一下。', '你看，坚持没有想象中那么难。'],
      missed: ['今天还没动哦，要不要现在花 10 分钟？', '没关系，现在开始也来得及。'],
      restDay: ['今天是休息日，好好放松，明天再战。', '休息也是训练的一部分，别内疚。'],
      streak: ['连续 {n} 天了，这份稳定很珍贵。']
    },
    strict: {
      id: 'strict', name: '铁哥', emoji: '🔥', label: '铁血教练', desc: '不留情面，但会在你想放弃时推你一把',
      voice: { rate: 1.05, pitch: 0.95 },
      greet: ['别找借口，今天练什么自己心里清楚。', '计划摆在这儿，执行。', '想变好看？那就动起来。'],
      pre: ['热身做足，动作做标准，别糊弄。', '今天的目标必须完成，做完再休息。', '注意力集中，感受目标肌肉。'],
      mid: ['还有力气，别停。', '呼吸稳住，动作别变形。', '这点强度就想放弃？再来。'],
      lastSet: ['最后一组，榨干它。', '坚持住，完成了才算数。'],
      finish: ['完成。今天的你比昨天强一点。', '打卡。记住这种感觉，明天继续。', '不错，但别骄傲，明天照常。'],
      missed: ['今天的训练还没完成，别拖到明天。', '现在立刻，10 分钟也行，别破功。'],
      restDay: ['休息日，好好睡，明天继续。', '休息不是放纵，别熬夜。'],
      streak: ['连续 {n} 天，保持住，别断。']
    },
    funny: {
      id: 'funny', name: '阿动', emoji: '😎', label: '幽默搭子', desc: '用段子陪你练，笑一笑就做完了',
      voice: { rate: 1.08, pitch: 1.05 },
      greet: ['脂肪在看你，它有点慌。', '今天也是和沙发分手的一天。', '来，我们用 15 分钟换一个好心情。'],
      pre: ['先活动活动，别一上来就闪了腰。', '深呼吸，假装自己是个运动博主。', '手机放下，我们开始。'],
      mid: ['表情管理一下，虽然没人看。', '再坚持 10 秒，我请你喝…… 白开水。', '你的腹肌正在赶来路上。'],
      lastSet: ['最后一组，冲鸭！', '马上就能发朋友圈了。'],
      finish: ['搞定！今天的你闪闪发光。', '打卡完成，奖励自己一个大大的懒腰。', '看，运动也没那么可怕嘛。'],
      missed: ['喂，今天的运动额度还没花呢。', '脂肪已经在开派对了，快去打断它。'],
      restDay: ['休息日，允许你躺平，但别躺太久。', '今天不动，是为了明天动得更好。'],
      streak: ['连续 {n} 天，这毅力可以去考公了。']
    }
  };

  /* ------------------------- 计划模板 ------------------------- */
  /* 每周训练天数 -> 7 天中哪几天训练（0=周一） */
  var WEEK_TEMPLATES = {
    2: [1, 4],
    3: [0, 2, 4],
    4: [0, 2, 4, 5],
    5: [0, 1, 3, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 1, 2, 3, 4, 5, 6]
  };

  var SAFETY_TIPS = [
    'WHO 建议：成年人每周累计 150–300 分钟中等强度有氧，并至少 2 天做力量训练。',
    '开始前先热身 3-5 分钟，结束后拉伸 2-3 分钟。',
    '动作过程中出现尖锐疼痛、头晕、胸闷，请立刻停止。',
    '同一肌群的力量训练间隔 48 小时，让肌肉恢复。',
    '体重较大时优先选择低冲击动作（快走、单车、水中运动），保护膝踝。',
    '局部减脂不成立：练腹不会只瘦肚子，减脂靠整体热量缺口 + 有氧 + 力量。',
    '训练不是越疼越好，循序渐进比一次练狠更有效；每周增幅别超过 10%。',
    '体重不降不代表失败，腰围、体脂、力量和精力都是进步的证据。',
    '如有高血压、心脏病、关节伤病或处于孕期，请先咨询医生。',
    '运动前后适量饮水，不要空腹做高强度训练。'
  ];

  global.DATA = {
    refs: REFS,
    targets: TARGETS,
    goals: GOALS,
    exercises: EX,
    programs: PROGRAMS,
    coaches: COACHES,
    weekTemplates: WEEK_TEMPLATES,
    safety: SAFETY_TIPS,
    anim: ANIM,
    version: 1
  };
})(window);
