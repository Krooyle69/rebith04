const characters = {
  gon: {
    name: "Гон Фрикс", class: "Боец", rank: "Аспирант", level: 1, xp: 0, xpMax: 180,
    profile: "img/profile/gon.jpg",
    primary: { strength: 13, health: 170, defense: 9, mana: 60 }
  },
  killua: {
    name: "Киллуа Золдик", class: "Убийца", rank: "Аспирант", level: 1, xp: 0, xpMax: 180,
    profile: "img/profile/killua.jpg",
    primary: { strength: 20, health: 115, defense: 6, mana: 65 }
  },
  hisoka: {
    name: "Хисока Мороу", class: "Маг", rank: "Аспирант", level: 1, xp: 0, xpMax: 180,
    profile: "img/profile/hisoka.jpg",
    primary: { strength: 21, health: 90, defense: 5, mana: 85 }
  },
  kurapika: {
    name: "Курапика", class: "Маг-боец", rank: "Аспирант", level: 1, xp: 0, xpMax: 180,
    profile: "img/profile/kurapika.jpg",
    primary: { strength: 18, health: 130, defense: 8, mana: 75 }
  }
};

const RANK_ENEMY_MULTIPLIER = 1.0; // update0.6: итоговая сложность задаётся целевой аурой

// Баланс процентных боевых характеристик. Значения на предметах могут складываться,
// но в бою используется эффективное значение с мягким капом и жёстким пределом.
const PERCENT_STAT_LIMITS = {
  critChance: { soft: 32, hard: 55 },
  critDamage: { soft: 90, hard: 165 },
  vampirism: { soft: 16, hard: 30 },
  evasion: { soft: 30, hard: 45 }
};
function effectivePercentStat(raw, key){
  const v=Math.max(0,Number(raw)||0);
  const cfg=PERCENT_STAT_LIMITS[key];
  if(!cfg) return v;
  if(v<=cfg.soft) return v;
  return Math.min(cfg.hard, cfg.soft+(v-cfg.soft)*0.35);
}
function getEffectivePercentStats(stats={}){
  return {
    critChance: effectivePercentStat(stats.critChance ?? stats.crit ?? 0,'critChance'),
    critDamage: effectivePercentStat(stats.critDamage ?? 0,'critDamage'),
    vampirism: effectivePercentStat(stats.vampirism ?? 0,'vampirism'),
    evasion: effectivePercentStat(stats.evasion ?? 0,'evasion')
  };
}
const RANK_ENEMY_STRENGTH_MULTIPLIER = 1.15; // update0.6: небольшой атакующий уклон без перекоса Силы/Защиты
const RANK_TITLES = ["Аспирант", "Хантер-новичок", "Однозвёздочный Хантер", "Двухзвёздочный Хантер", "Трехзвёздочный Хантер"];
const RANK_TRIALS = [
  {level:15,title:"Хантер-новичок",name:"Испытание Хантера",area:"Экзаменационная арена",desc:"Первое испытание. Победи экзаменатора и докажи, что готов перейти от аспиранта к настоящему Хантеру.",enemy:"Экзаменатор Зверь",aura:1578,xp:[280,420],jenny:[260,390],folder:"exam_15_hunter"},
  {level:30,title:"Однозвёздочный Хантер",name:"Испытание первой звезды",area:"Зал первой звезды",desc:"Проверка силы, контроля Нэн и выносливости против усиленного стража.",enemy:"Страж первой звезды",aura:3900,xp:[850,1200],jenny:[650,950],folder:"exam_30_one_star"},
  {level:50,title:"Двухзвёздочный Хантер",name:"Испытание двух звёзд",area:"Крепость двух звёзд",desc:"Элитное испытание против хранителя с высокой концентрацией Нэн.",enemy:"Элитный хранитель",aura:9000,xp:[2200,3000],jenny:[1500,2200],folder:"exam_50_two_star"},
  {level:70,title:"Трехзвёздочный Хантер",name:"Испытание трёх звёзд",area:"Предел охотников",desc:"Высшее испытание текущей системы рангов. Победа открывает третий ранг Хантера.",enemy:"Повелитель ауры",aura:18000,xp:[5200,7200],jenny:[3400,5000],folder:"exam_70_three_star"}
];
function rankIndex(title){const i=RANK_TITLES.indexOf(title);return i<0?0:i;}
function getTitleBonusMultiplier(c){return 1 + rankIndex(c?.rank || "Аспирант") * 0.07;}
function isRankUnlocked(){return Number(characters[activeCharacter]?.level || 0) >= 15;}
function getRankTrial(i){return RANK_TRIALS[i] || null;}
function getRankTrialEnemyAura(trial){
  const lv=Math.max(1,Number(trial?.level)||1);
  const index=Math.max(0,RANK_TRIALS.indexOf(trial));
  const expected=expectedPlayerAtLevel(lv);
  const challenge=[1.08,1.18,1.30,1.45][index]||1.25;
  return Math.max(1,Math.round(calculateCombatAura(expected)*challenge));
}
function getEnemySkill(seed, maxMana){
  const types=[
    {name:"Усиленный удар",power:1.34,ratio:.24,cooldown:2,desc:"Сильная атака аурой."},
    {name:"Разряд ауры",power:1.48,ratio:.30,cooldown:3,desc:"Плотный выброс Нэн."},
    {name:"Сокрушительная техника",power:1.62,ratio:.36,cooldown:3,desc:"Тяжёлая техника противника."},
    {name:"Охотничий приём",power:1.42,ratio:.27,cooldown:2,desc:"Специальный боевой приём."},
    {name:"Всплеск Нэн",power:1.55,ratio:.33,cooldown:3,desc:"Всплеск ауры наносит повышенный урон."}
  ];
  const t=types[Math.abs(Number(seed)||0)%types.length];
  const mana=Math.max(1,Math.round(Number(maxMana||0)));
  return {...t,cost:Math.max(8,Math.round(mana*t.ratio))};
}
function rankEnemyStats(trial){
  const lv=Math.max(1,Number(trial?.level)||1), idx=Math.max(0,RANK_TRIALS.indexOf(trial));
  const base=expectedPlayerAtLevel(lv), difficulty=[1.02,1.07,1.13,1.20][idx]||1.10;
  const maxMana=Math.max(20,Math.round(base.mana*(1.00+idx*.04)));
  return {
    strength:Math.max(1,Math.round(base.strength*difficulty*(1.03+idx*.015))),
    health:Math.max(20,Math.round(base.health*(1.12+idx*.10))),
    defense:Math.max(1,Math.round(base.defense*(.82+idx*.035))),
    mana:maxMana,
    critChance:Math.min(28,7+idx*4.5),
    critDamage:Math.min(82,32+idx*12),
    evasion:Math.min(22,4+idx*4),
    vampirism:Math.min(8,idx*2),
    enemySkill:getEnemySkill(lv+idx,maxMana)
  };
}
function calculateCombatAura(entity){
  if(!entity)return 0;
  const strength=Math.max(0,Number(entity.strength)||0), health=Math.max(0,Number(entity.health)||0), defense=Math.max(0,Number(entity.defense)||0), mana=Math.max(0,Number(entity.mana)||0);
  // update0.6: единая сравнительная аура. Сила важнее Защиты, HP отражает выживаемость,
  // а вторичные проценты имеют вес, но не могут перекрыть основные характеристики.
  const primary=(strength*4.8 + health*0.27 + defense*3.4 + mana*0.55)*1.5;
  const secondary=Number(effectivePercentStat(entity.critChance,'critChance')||0)*6.5
    + Number(effectivePercentStat(entity.critDamage,'critDamage')||0)*1.55
    + Number(effectivePercentStat(entity.vampirism,'vampirism')||0)*10
    + Number(effectivePercentStat(entity.evasion,'evasion')||0)*8.5;
  return Math.max(0,Math.round((primary+secondary)*10));
}
function rankEnemyAura(e){return calculateCombatAura(e);}

function tuneRankEnemyToAura(stats,target){
  const source={...stats};
  const strengthBias=RANK_ENEMY_STRENGTH_MULTIPLIER/RANK_ENEMY_MULTIPLIER;
  let low=.01,high=20,best={...source};
  for(let i=0;i<36;i++){
    const factor=(low+high)/2;
    const test={...source,
      strength:Math.max(1,Math.round(source.strength*factor*strengthBias)),
      health:Math.max(1,Math.round(source.health*factor)),
      defense:Math.max(1,Math.round(source.defense*factor)),
      mana:Math.max(1,Math.round(source.mana*factor))
    };
    best=test;
    if(rankEnemyAura(test)<target) low=factor; else high=factor;
  }
  return best;
}
function renderRank(){
  const screen=$("#rankScreen"); if(!screen)return;
  const c=characters[activeCharacter], level=Number(c?.level||0), current=rankIndex(c?.rank||"Аспирант");
  $("#rankCurrentTitle").textContent=c?.rank||"Аспирант";
  $("#rankCurrentBonus").textContent=`+${current*7}% к базовым характеристикам`;
  const lock=$("#rankLock"), list=$("#rankTrials");
  const unlocked=level>=15;
  lock?.classList.toggle("hidden",unlocked);
  if(!unlocked){ list.innerHTML=""; return; }
  list.innerHTML=RANK_TRIALS.map((t,i)=>{
    const completed=current>i, available=!completed && level>=t.level && current===i, locked=level<t.level;
    const enemyPreview=tuneRankEnemyToAura(rankEnemyStats(t),getRankTrialEnemyAura(t));
    const enemyAura=rankEnemyAura(enemyPreview);
    const state=completed?`<span class="rank-state done">✓ ТИТУЛ ПОЛУЧЕН</span>`:available?`<button type="button" data-rank-trial="${i}">ПРОЙТИ ИСПЫТАНИЕ</button>`:`<span class="rank-state">🔒 ОТКРОЕТСЯ НА ${t.level} УРОВНЕ</span>`;
    return `<article class="rank-trial-card ${available?'available':''} ${locked?'locked':''} ${completed?'completed':''}">
      <div class="rank-trial-art"><img src="img/rank/${t.folder}/background.jpg" alt=""><span class="rank-level">${t.level} УРОВЕНЬ</span><span class="rank-aura">✦ ${formatNumber(enemyAura)} АУРЫ</span></div>
      <div class="rank-trial-body"><span class="section-kicker">${t.area}</span><h3>${t.name}</h3><p>${t.desc}</p><div class="rank-enemy"><img src="img/rank/${t.folder}/enemy.png" alt=""><div><small>ПРОТИВНИК</small><b>${t.enemy}</b><span>Аура: ${formatNumber(enemyAura)}</span></div></div><div class="rank-reward"><span>НАГРАДА</span><b>${t.title}</b><small>После победы: +${(i+1)*7}% к базовым характеристикам</small></div><div class="rank-action">${state}</div></div>
    </article>`;
  }).join("");
  list.querySelectorAll("[data-rank-trial]").forEach(btn=>btn.addEventListener("click",()=>startRankBattle(Number(btn.dataset.rankTrial))));
}
function startRankBattle(index){
  if(showExpeditionBattleBlock()) return;
  const t=getRankTrial(index), c=characters[activeCharacter];
  if(!t||!c||Number(c.level||0)<t.level||rankIndex(c.rank)!==index)return;
  const enemy=tuneRankEnemyToAura(rankEnemyStats(t),getRankTrialEnemyAura(t));
  battleState={mode:"rank",rankTrialIndex:index,player:playerBattleStats(),enemy:{name:t.enemy,level:t.level,maxHp:enemy.health,hp:enemy.health,maxMana:enemy.mana,mana:enemy.mana,strength:enemy.strength,defense:enemy.defense,critChance:enemy.critChance,critDamage:enemy.critDamage,evasion:enemy.evasion,vampirism:enemy.vampirism,damageMultiplier:1.12,image:`img/rank/${t.folder}/enemy.png`,aura:rankEnemyAura(enemy),enemySkill:enemy.enemySkill,enemySkillCd:0},skillCd:{},healCd:0,defendCd:0,defending:false,damageBuff:1,enemyDebuff:1,enemyDebuffTurns:0,playerEvasionBuff:0,enemyBleed:0,enemyBleedTurns:0,enemyMarked:false,nextAttackBonus:1,ended:false,busy:false,playerTurnReady:false};
  $("#battleDungeonName").textContent=`${t.name} • ${t.title}`; $("#battleResultCloseBtn").textContent="Вернуться к рангу"; $("#battleLog").innerHTML=""; $("#battleShell").style.backgroundImage=`url("img/rank/${t.folder}/background.jpg")`; $("#battleScreen").classList.add("visible"); $("#battleScreen").setAttribute("aria-hidden","false"); addBattleLog(`Испытание началось. Аура противника: ${formatNumber(battleState.enemy.aura)}.` ,"info"); beginBattleTurnFlow("Вы перехватили инициативу.",`${t.enemy} действует первым.`);
}
function battleRankWin(){
  const s=battleState,t=getRankTrial(s.rankTrialIndex),c=characters[activeCharacter]; if(!s||!t||!c)return;
  c.rank=t.title;
  const req=Math.max(1,xpRequiredForLevel(Math.min(99,t.level)));
  const xp=randInt(Math.round(req*.09),Math.round(req*.13));
  const j=randInt(Math.round(180+t.level*t.level*2.2),Math.round(260+t.level*t.level*3.0));
  const awardedXp=gainExperience(xp); const awardedJenny=creditJenny(j); saveGameState(); renderCurrencies(); renderAll(); renderRank();
  showBattleResult({win:true,mode:"rank",enemy:t.enemy,xp:awardedXp,jenny:awardedJenny,title:t.title,aura:rankEnemyAura(s.enemy)});
}
const primaryMeta = [
  ["strength", "Сила", "strength.png"],
  ["health", "Здоровье", "health.png"],
  ["defense", "Защита", "defense.png"],
  ["mana", "Мана", "mana.png"]
];

const SKILLS = {
  gon: [
    {id:"gon_stone", name:"Джаджанкен (Камень)", icon:"◆", cost:32, cooldown:3, power:30, desc:"Мощный ближний удар. Чем выше Сила, тем сильнее техника.", type:"damage", tags:["СИЛЬНЫЙ"]},
    {id:"gon_paper", name:"Джаджанкен (Бумага)", icon:"✦", cost:22, cooldown:2, power:21, desc:"Дальний выброс ауры, игнорирует 30% Защиты цели.", type:"pierce", tags:["ДАЛЬНИЙ"]},
    {id:"gon_scissors", name:"Джаджанкен (Ножницы)", icon:"✂", cost:24, cooldown:2, power:18, desc:"Режущая атака: получает +35% шанса крита именно для этого удара.", type:"crit", tags:["КРИТ"]},
    {id:"gon_aura", name:"Аура усиления", icon:"✦", cost:26, cooldown:3, power:0, desc:"Концентрирует Нэн: следующая наносящая урон атака усилена на 30%.", type:"buff", tags:["УСИЛЕНИЕ"]}
  ],
  killua: [
    {id:"killua_claw", name:"Коготь", icon:"⌁", cost:20, cooldown:1, power:16, desc:"Быстрая серия ударов. Накладывает контролируемое кровотечение на 3 хода.", type:"bleed", tags:["КРОВОТЕЧЕНИЕ"]},
    {id:"killua_instant", name:"Мгновенный удар", icon:"⚡", cost:28, cooldown:2, power:23, desc:"Молниеносная атака и +35% уклонения от следующей атаки противника.", type:"evasion", tags:["СКОРОСТЬ"]},
    {id:"killua_throw", name:"Меткий бросок", icon:"➤", cost:20, cooldown:2, power:19, desc:"Точный удар наносит метку: следующая ваша атака по цели получает +30% урона.", type:"mark", tags:["ТОЧНОСТЬ"]},
    {id:"killua_stealth", name:"Скрытность", icon:"◌", cost:25, cooldown:3, power:0, desc:"Скрывает Киллуа до следующей атаки врага: +45% уклонения и +30% к следующей атаке.", type:"stealth", tags:["УКЛОНЕНИЕ"]}
  ],
  hisoka: [
    {id:"hisoka_mind", name:"Игры разума", icon:"♠", cost:24, cooldown:2, power:14, desc:"Психологическая атака: следующие 2 атаки цели наносят на 25% меньше урона.", type:"mind", tags:["КОНТРОЛЬ"]},
    {id:"hisoka_deception", name:"Обман", icon:"♦", cost:22, cooldown:2, power:18, desc:"Финт: +35% уклонения от следующей атаки и +15% к следующему удару.", type:"deception", tags:["ФИНТ"]},
    {id:"hisoka_cards", name:"Смертельные карты", icon:"🂡", cost:28, cooldown:1, power:27, desc:"Дальний бросок карт. Игнорирует 30% Защиты цели.", type:"pierce", tags:["ДАЛЬНИЙ"]},
    {id:"hisoka_cleave", name:"Клевец", icon:"♣", cost:40, cooldown:3, power:34, desc:"Тяжёлый добивающий удар. +50% урона по цели ниже 35% HP.", type:"execute", tags:["ДОБИВАНИЕ"]}
  ],
  kurapika: [
    {id:"kura_chains", name:"Цепи", icon:"⛓", cost:24, cooldown:2, power:22, desc:"Связывает цель: -35% её урона на следующую атаку.", type:"chain", tags:["СВЯЗЬ"]},
    {id:"kura_eyes", name:"Глаза", icon:"◉", cost:20, cooldown:1, power:14, desc:"Анализирует слабые места: атака игнорирует 15% Защиты цели.", type:"reveal", tags:["РАСКРЫТИЕ"]},
    {id:"kura_submit", name:"Подчинение", icon:"◇", cost:28, cooldown:2, power:20, desc:"Подавляет волю цели: -30% урона её следующей атаки.", type:"control", tags:["ПОДАВЛЕНИЕ"]},
    {id:"kura_death", name:"Смертельный приговор", icon:"✦", cost:45, cooldown:3, power:37, desc:"Запретная техника. Наносит ещё +45% урона цели ниже 35% HP.", type:"execute", tags:["КАЗНЬ"]}
  ]
};

const SKILL_UNLOCK_LEVELS = [1, 5, 15, 30];
const SKILL_MAX_LEVEL = 10;
const skillState = {};

function ensureSkillState(id) {
  if (!skillState[id]) skillState[id] = { selected: {}, levels: {} };
  const list = SKILLS[id] || [];
  list.forEach((_, index) => {
    if (!Number.isFinite(skillState[id].levels[index])) skillState[id].levels[index] = 1;
  });
  const selected = list.reduce((sum, _, index) => sum + (skillState[id].selected && skillState[id].selected[index] ? 1 : 0), 0);
  if (selected > 2) {
    skillState[id].selected = {};
    list.forEach((_, index) => { if (index < 2) skillState[id].selected[index] = true; });
  }
}
function getSkillLevel(id, index) { ensureSkillState(id); return Math.max(1, Math.min(SKILL_MAX_LEVEL, Number(skillState[id].levels[index]) || 1)); }
function isSkillUnlocked(index) { return characters[activeCharacter].level >= SKILL_UNLOCK_LEVELS[index]; }
function isSkillSelected(index) { ensureSkillState(activeCharacter); return Boolean(skillState[activeCharacter].selected[index]); }
function getSkillUpgradeCost(index) {
  const level=getSkillLevel(activeCharacter,index);
  const charLevel=Math.max(1,Number(characters[activeCharacter]?.level||1));
  return Math.round((280+index*180+charLevel*22)*Math.pow(1.50,level-1));
}
function getSkillPower(skill, index) {
  const level=getSkillLevel(activeCharacter,index);
  return Math.round(skill.power*Math.pow(1.09,level-1));
}
function getSkillManaCost(skill, index) {
  const level=getSkillLevel(activeCharacter,index);
  return Math.max(5,Math.round(skill.cost*Math.pow(1.055,level-1)));
}
function toggleSkillSelection(index) {
  ensureSkillState(activeCharacter);
  if (!isSkillUnlocked(index)) return;
  const selected = Boolean(skillState[activeCharacter].selected[index]);
  if (selected) {
    delete skillState[activeCharacter].selected[index];
  } else {
    const count = Object.values(skillState[activeCharacter].selected).filter(Boolean).length;
    if (count >= 2) return;
    skillState[activeCharacter].selected[index] = true;
  }
  saveGameState();
  renderSkills();
}
function upgradeSkill(index) {
  ensureSkillState(activeCharacter);
  if (!isSkillUnlocked(index)) return;
  const level = getSkillLevel(activeCharacter, index);
  if (level >= SKILL_MAX_LEVEL) return;
  const cost = getSkillUpgradeCost(index);
  const current = Number(localStorage.getItem('hxh_jenny') || 0);
  if (current < cost) {
    renderSkills();
    return;
  }
  localStorage.setItem('hxh_jenny', String(current - cost));
  skillState[activeCharacter].levels[index] = level + 1;
  saveGameState();
  renderSkills();
  renderCurrencies();
  renderAll();
}
function getSkillList() { return SKILLS[activeCharacter] || []; }
function getSkillIconPath(characterId, skillIndex) {
  const skill = (SKILLS[characterId] || [])[skillIndex];
  return skill ? `img/${characterId}_skill/${skill.id}.jpg` : "";
}
function getActiveSkillIndexes() {
  ensureSkillState(activeCharacter);
  return Object.keys(skillState[activeCharacter].selected).filter(i => skillState[activeCharacter].selected[i]).map(Number).sort((a,b) => a-b);
}
function renderActiveSkillSlots() {
  const wrap = $('#activeSkillSlots');
  if (!wrap) return;
  const active = getActiveSkillIndexes();
  wrap.innerHTML = [0,1].map(slot => {
    const index = active[slot];
    if (index === undefined) return `<div class="active-skill-slot empty"><span class="active-skill-plus">+</span><small>Свободный слот</small></div>`;
    const skill = SKILLS[activeCharacter][index];
    return `<div class="active-skill-slot filled" title="${skill.name}"><img src="${getSkillIconPath(activeCharacter,index)}" alt="${skill.name}"><div><b>${skill.name}</b><small>Слот ${slot+1} • Ур. ${getSkillLevel(activeCharacter,index)}</small></div></div>`;
  }).join('');
}
function renderSkills() {
  const c = characters[activeCharacter];
  if (!c) return;
  ensureSkillState(activeCharacter);
  $('#skillsTitle').textContent = `Навыки — ${c.name}`;
  $('#skillsSubtitle').textContent = `${c.class} • выбери до двух активных техник`;
  const selectedCount = Object.values(skillState[activeCharacter].selected).filter(Boolean).length;
  $('#selectedSkillsCount').textContent = `${selectedCount} / 2`;
  renderActiveSkillSlots();
  const grid = $('#skillsGrid');
  if (!grid) return;
  grid.innerHTML = getSkillList().map((skill, index) => {
    const unlocked = isSkillUnlocked(index);
    const selected = isSkillSelected(index);
    const level = getSkillLevel(activeCharacter, index);
    const maxed = level >= SKILL_MAX_LEVEL;
    const cost = getSkillUpgradeCost(index);
    const jenny = Number(localStorage.getItem('hxh_jenny') || 0);
    const power = getSkillPower(skill, index);
    const mana = getSkillManaCost(skill, index);
    const unlock = SKILL_UNLOCK_LEVELS[index];
    const tags = Array.isArray(skill.tags) ? skill.tags.join(' • ') : '';
    return `<article class="skill-card ${unlocked ? '' : 'locked'} ${selected ? 'selected' : ''}">
      <button class="skill-select" data-skill-select="${index}" type="button" ${unlocked ? '' : 'disabled'} aria-label="${selected ? 'Снять выбор' : 'Выбрать навык'}">
        <span class="skill-icon"><img src="${getSkillIconPath(activeCharacter,index)}" alt=""></span>
        <span class="skill-main">
          <span class="skill-title"><b>${skill.name}</b><em>Ур. ${level}</em></span>
          <span class="skill-desc">${unlocked ? skill.desc : `Откроется на ${unlock} уровне персонажа`}</span>
          <span class="skill-footer"><span>${unlocked ? `${tags} • ${power} силы` : `🔒 Уровень ${unlock}`}</span><strong>${selected ? 'НАДЕТ' : unlocked ? 'НАДЕТЬ' : 'ЗАКРЫТ'}</strong></span>
        </span>
      </button>
      <div class="skill-upgrade">
        <div class="skill-upgrade-meta"><span>${unlocked ? `Эффект: ${power} • Мана: ${mana} • Перезарядка: ${skill.cooldown} хода` : 'Навык недоступен'}</span><span>${maxed ? 'МАКС.' : `${formatNumber(cost)} Дженни`}</span></div>
        <button class="skill-upgrade-btn" data-skill-upgrade="${index}" type="button" ${(!unlocked || maxed || jenny < cost) ? 'disabled' : ''}>${maxed ? 'Максимум' : 'Улучшить'}</button>
      </div>
    </article>`;
  }).join('');
  grid.querySelectorAll('[data-skill-select]').forEach(btn => btn.addEventListener('click', () => toggleSkillSelection(Number(btn.dataset.skillSelect))));
  grid.querySelectorAll('[data-skill-upgrade]').forEach(btn => btn.addEventListener('click', () => upgradeSkill(Number(btn.dataset.skillUpgrade))));
}
function setupSkills() {
  $('#openSkillsBtn')?.addEventListener('click', () => {
    $('#skillsScreen').classList.add('visible');
    $('#skillsScreen').setAttribute('aria-hidden', 'false');
    renderSkills();
  });
  $('#closeSkillsBtn')?.addEventListener('click', () => {
    $('#skillsScreen').classList.remove('visible');
    $('#skillsScreen').setAttribute('aria-hidden', 'true');
  });
}

let activeCharacter = localStorage.getItem("hxh_selected_character") || "gon";
let nickname = localStorage.getItem("hxh_nickname") || "Hunter";
let firstEntry = true;
let pendingCharacter = activeCharacter;
let settingsPendingCharacter = activeCharacter;
const SAVE_KEY = "hxh_game_save_v23";

const $ = selector => document.querySelector(selector);
const formatNumber = value => { const n=Number(value); if(!Number.isFinite(n)) return "0"; return Math.ceil(n).toLocaleString("ru-RU"); };

function xpRequiredForLevel(level) {
  // update0.6: long-term progression. Even with perfect energy usage, 1→100
  // requires thousands of successful hunts instead of a few days of farming.
  if (level >= 100) return 0;
  const n=Math.max(1,Math.min(99,Math.floor(Number(level)||1)));
  return Math.round(140*Math.pow(n,1.85)+40);
}

const BASE_PRIMARY_STATS = {
  gon: { strength: 13, health: 170, defense: 9, mana: 60 },
  killua: { strength: 20, health: 115, defense: 6, mana: 65 },
  hisoka: { strength: 21, health: 90, defense: 5, mana: 85 },
  kurapika: { strength: 18, health: 130, defense: 8, mana: 75 }
};
const CLASS_GROWTH = {
  // Сила, HP и Защита растут независимо. Защита намеренно медленнее Силы:
  // это убирает старую ситуацию, когда две характеристики визуально становились почти одинаковыми.
  gon:      { strength:.0355, health:.0400, defense:.0280, mana:3.6 },
  killua:   { strength:.0390, health:.0345, defense:.0235, mana:3.8 },
  hisoka:   { strength:.0400, health:.0310, defense:.0220, mana:4.5 },
  kurapika: { strength:.0370, health:.0360, defense:.0265, mana:4.2 }
};
function getLevelScaledBaseStats(id, level){
  const base=BASE_PRIMARY_STATS[id]||BASE_PRIMARY_STATS.gon;
  const g=CLASS_GROWTH[id]||CLASS_GROWTH.gon;
  const lv=Math.max(1,Math.min(100,Number(level)||1)), n=lv-1;
  return {
    strength:Math.max(1,Math.round(base.strength*Math.pow(1+g.strength,n))),
    health:Math.max(1,Math.round(base.health*Math.pow(1+g.health,n))),
    defense:Math.max(1,Math.round(base.defense*Math.pow(1+g.defense,n))),
    mana:Math.max(1,Math.round(base.mana+g.mana*n))
  };
}
function migratePrimaryToCurrentGrowth(id,c){
  if(!c)return;
  c.primary=getLevelScaledBaseStats(id,c.level);
}

function saveCharacterState(id = activeCharacter) {
  const c = characters[id];
  localStorage.setItem(`hxh_character_${id}`, JSON.stringify({
    level: c.level,
    xp: c.xp,
    xpMax: c.xpMax,
    primary: c.primary,
    rank: c.rank || "Аспирант"
  }));
}

function loadCharacterStates() {
  Object.entries(characters).forEach(([id, c]) => {
    const saved = localStorage.getItem(`hxh_character_${id}`);
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (Number.isFinite(state.level)) c.level = state.level;
      if (Number.isFinite(state.xp)) c.xp = state.xp;
      if (Number.isFinite(state.xpMax)) c.xpMax = state.xpMax;
      c.level = Math.min(100, Math.max(1, Math.floor(c.level)));
      c.xpMax = xpRequiredForLevel(c.level);
      if (c.level >= 100) c.xp = 0;
      if (typeof state.rank === "string" && RANK_TITLES.includes(state.rank)) c.rank = state.rank;
      migratePrimaryToCurrentGrowth(id,c);
    } catch (_) {}
  });
}

function hasLegacySavedProgress() {
  const selected = localStorage.getItem("hxh_selected_character");
  const characterSaved = Object.keys(characters).some(id => localStorage.getItem(`hxh_character_${id}`));
  const inventorySaved = Object.keys(characters).some(id => localStorage.getItem(`hxh_inventory_${id}`));
  return Boolean(selected && (characterSaved || inventorySaved));
}

function saveGameState() {
  Object.keys(SKILLS).forEach(ensureSkillState);
  const characterStates = {};
  Object.entries(characters).forEach(([id, c]) => {
    characterStates[id] = {
      level: c.level,
      xp: c.xp,
      xpMax: c.xpMax,
      primary: { ...c.primary },
      rank: c.rank || "Аспирант"
    };
    saveCharacterState(id);
  });

  const payload = {
    version: 37,
    activeCharacter,
    nickname,
    nenGems: Number(localStorage.getItem("hxh_nen_gems") || 0),
    characters: characterStates,
    skills: skillState
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  localStorage.setItem("hxh_selected_character", activeCharacter);
  localStorage.setItem("hxh_nickname", nickname);
}

function loadGameState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      const state = JSON.parse(raw);
      if (state && typeof state === "object") {
        if (characters[state.activeCharacter]) activeCharacter = state.activeCharacter;
        if (typeof state.nickname === "string" && state.nickname.trim()) nickname = state.nickname;
        if (Number.isFinite(Number(state.nenGems))) {
          localStorage.setItem("hxh_nen_gems", String(Math.max(0, Number(state.nenGems))));
        }
        if (state.skills && typeof state.skills === "object") {
          Object.entries(state.skills).forEach(([id, saved]) => {
            if (!SKILLS[id] || !saved) return;
            skillState[id] = { selected: {}, levels: {} };
            if (saved.selected && typeof saved.selected === "object") {
              Object.entries(saved.selected).forEach(([index, value]) => { if (value) skillState[id].selected[index] = true; });
            }
            if (saved.levels && typeof saved.levels === "object") {
              Object.entries(saved.levels).forEach(([index, value]) => {
                const n = Number(value);
                if (Number.isFinite(n)) skillState[id].levels[index] = Math.max(1, Math.min(SKILL_MAX_LEVEL, Math.floor(n)));
              });
            }
            ensureSkillState(id);
          });
        }
        if (state.characters && typeof state.characters === "object") {
          Object.entries(state.characters).forEach(([id, saved]) => {
            if (!characters[id] || !saved) return;
            if (Number.isFinite(saved.level)) characters[id].level = saved.level;
            if (Number.isFinite(saved.xp)) characters[id].xp = saved.xp;
            characters[id].xpMax = xpRequiredForLevel(characters[id].level);
            if (characters[id].level >= 100) characters[id].xp = 0;
            if (typeof saved.rank === "string" && RANK_TITLES.includes(saved.rank)) characters[id].rank = saved.rank;
            migratePrimaryToCurrentGrowth(id,characters[id]);
          });
        }
        localStorage.setItem("hxh_selected_character", activeCharacter);
        localStorage.setItem("hxh_nickname", nickname);
        return true;
      }
    } catch (_) {}
  }

  // Миграция старого сохранения v0.21: ничего не теряем.
  if (hasLegacySavedProgress()) {
    return true;
  }
  return false;
}

function getEquippedStatBonuses() {
  const bonuses = { strength: 0, health: 0, defense: 0, mana: 0, critDamage: 0, critChance: 0, vampirism: 0, evasion: 0 };
  Object.values(equipped || {}).forEach(item => {
    if (!item) return;
    // Используем те же итоговые значения, что и окно экипировки (уровень + улучшения).
    const stats = getUpgradedStats(item);
    Object.entries(stats).forEach(([rawKey, value]) => {
      const key = rawKey === 'crit' ? 'critChance' : rawKey;
      if (key in bonuses) bonuses[key] += Number(value || 0);
    });
  });
  return bonuses;
}

function getEffectivePrimaryStats(c) {
  const bonuses = getEquippedStatBonuses();
  const titleMultiplier = getTitleBonusMultiplier(c);
  return {
    strength: Number(c.primary.strength || 0) * titleMultiplier + bonuses.strength,
    health: Number(c.primary.health || 0) * titleMultiplier + bonuses.health,
    defense: Number(c.primary.defense || 0) * titleMultiplier + bonuses.defense,
    mana: Number(c.primary.mana || 0) * titleMultiplier + bonuses.mana,
    ...getEffectivePercentStats(bonuses)
  };
}

function getAllNumericStats(c) {
  const stats = getEffectivePrimaryStats(c);
  return ['strength','health','defense','mana'].reduce((sum,key) => sum + Number(stats[key] || 0), 0);
}

function getSkillAuraBonus(characterId = activeCharacter) {
  ensureSkillState(characterId);
  return Object.values(skillState[characterId]?.levels || {}).reduce((sum, level) => {
    const lv = Math.max(1, Math.min(SKILL_MAX_LEVEL, Number(level) || 1));
    return sum + Math.max(0, lv - 1) * 12;
  }, 0);
}

function calculateAura(c) {
  if(!c)return 0;
  const stats=getEffectivePrimaryStats(c);
  return Math.max(0,Math.round(calculateCombatAura(stats)+getSkillAuraBonus(activeCharacter)*10));
}

// update0.6: у каждого класса независимый рост Силы / HP / Защиты / Маны.
function applyLevelUp(c) {
  const id=Object.keys(characters).find(key=>characters[key]===c)||activeCharacter;
  c.primary=getLevelScaledBaseStats(id,c.level);
}

function gainExperience(amount) {
  const c = characters[activeCharacter];
  if (!c || !Number.isFinite(amount) || amount <= 0) return 0;
  amount=Math.max(1,Math.round(amount*getXpMultiplier()));
  if (c.level >= 100) return 0;
  c.xp += amount;
  while (c.level < 100 && c.xp >= xpRequiredForLevel(c.level)) {
    c.xp -= xpRequiredForLevel(c.level);
    c.level += 1;
    applyLevelUp(c);
    c.xpMax = xpRequiredForLevel(c.level);
  }
  if (c.level >= 100) {
    c.level = 100;
    c.xp = 0;
    c.xpMax = 0;
  }
  saveCharacterState(activeCharacter);
  renderAll();
  return amount;
}

function renderPrimaryStats(c) {
  const stats = getEffectivePrimaryStats(c);
  $("#primaryStats").innerHTML = primaryMeta.map(([key, name, icon, percent]) => {
    const value = Number(stats[key] || 0);
    return `
      <div class="primary-stat stat-${key}">
        <div class="primary-top">
          <div class="stat-icon"><img src="img/icon/${icon}" alt=""></div>
          <b>${formatNumber(value)}${percent ? "%" : ""}</b>
        </div>
        <div class="stat-name">${name}</div>
      </div>`;
  }).join("");
}

function renderSecondaryStats(c) {
  const el=$("#secondaryStats"); if(!el)return;
  const st=getEffectivePrimaryStats(c);
  const data=[
    ["critDamage","Крит. Урон","crit-damage.png"],
    ["critChance","Шанс Крит. Удара","crit-chance.png"],
    ["vampirism","Вампиризм","vampirism.png"],
    ["evasion","Уклонение","evasion.png"]
  ];
  el.innerHTML=data.map(([key,name,icon])=>`<div class="secondary-stat"><span><img src="img/icons/${icon}" alt="">${name}</span><b>${formatNumber(st[key]||0)}%</b></div>`).join("");
}

function updateRankUnlockBadge(){
  const badge=document.querySelector('.rank-unlock-badge');
  if(badge) badge.hidden=isRankUnlocked();
}
function renderAll() {
  const c = characters[activeCharacter] || characters.gon;
  activeCharacter = characters[activeCharacter] ? activeCharacter : "gon";
  $("#characterPortrait").src = c.profile;
  $("#characterPortrait").alt = c.name;
  $("#nicknameDisplay").textContent = nickname;
  $("#characterClass").textContent = c.class;
  $("#characterRank").textContent = c.rank || "Аспирант";
  $("#levelValue").textContent = c.level;
  $("#xpCurrent").textContent = formatNumber(c.xp);
  $("#xpMax").textContent = formatNumber(c.xpMax);
  const xpPercent = c.level >= 100 || !c.xpMax ? 100 : Math.min(Math.round(c.xp / c.xpMax * 100), 100);
  $("#xpFill").style.width = `${xpPercent}%`;
  $("#auraValue").textContent = formatNumber(calculateAura(c));

  renderPrimaryStats(c);
  renderSecondaryStats(c);
  updateRankUnlockBadge();
  renderPremiumUi();
}

function renderMorePage(){
 const screen=$('#moreScreen'); if(!screen)return;
 screen.classList.add('visible'); screen.setAttribute('aria-hidden','false');
}
function hasUsedNicknameChange(){return localStorage.getItem('hxh_nickname_change_used')==='1';}
function hasUsedCharacterChange(){return localStorage.getItem('hxh_character_change_used')==='1';}
function renderSettings(){
 const input=$('#settingsNickname'); if(input)input.value=nickname;
 const nickPrice=$('#nicknameChangePrice'); if(nickPrice)nickPrice.innerHTML=hasUsedNicknameChange()?'50 <img src="img/icon/nen-gem.png" alt=""> Камней Нэн':'Первая смена бесплатно';
 settingsPendingCharacter=characters[settingsPendingCharacter]?settingsPendingCharacter:activeCharacter;
 const cur=characters[activeCharacter], img=$('#settingsCharacterCurrentImage'), name=$('#settingsCharacterCurrentName'); if(img)img.src=cur.profile;if(name)name.textContent=cur.name;
 const price=$('#characterChangePrice');if(price)price.innerHTML=hasUsedCharacterChange()?'100 <img src="img/icon/nen-gem.png" alt=""> Камней Нэн':'Первая смена бесплатно';
 const picker=$('#settingsCharacterPicker');if(picker){picker.innerHTML=Object.entries(characters).map(([id,c])=>`<button type="button" class="settings-character-option ${settingsPendingCharacter===id?'selected':''}" data-settings-character="${id}"><img src="${c.profile}" alt=""><span><b>${c.name}</b><small>${c.class}</small></span></button>`).join('');picker.querySelectorAll('[data-settings-character]').forEach(btn=>btn.addEventListener('click',()=>{settingsPendingCharacter=btn.dataset.settingsCharacter;renderSettings();$('#settingsCharacterPicker').hidden=false;}));}
 const confirm=$('#settingsCharacterConfirm');if(confirm)confirm.disabled=settingsPendingCharacter===activeCharacter;
}
function openSettings(){const modal=$('#settingsModal');if(!modal)return;settingsPendingCharacter=activeCharacter;renderSettings();$('#settingsNicknameHint').textContent='';$('#settingsCharacterHint').textContent='';$('#settingsCharacterPicker').hidden=true;modal.classList.add('visible');modal.setAttribute('aria-hidden','false');}
function closeSettings(){const modal=$('#settingsModal');if(!modal)return;modal.classList.remove('visible');modal.setAttribute('aria-hidden','true');}
function changeNicknameFromSettings(){
 const input=$('#settingsNickname'),hint=$('#settingsNicknameHint'); if(!input)return;
 const next=input.value.trim().replace(/\s+/g,' ');
 if(!next)return hint.textContent='Введите новый ник.';
 if(next===nickname)return hint.textContent='Это уже ваш текущий ник.';
 const gems=Number(localStorage.getItem('hxh_nen_gems')||0), cost=hasUsedNicknameChange()?50:0;
 if(gems<cost){hint.textContent=`Недостаточно Камней Нэн. Нужно ${cost}, у вас ${formatNumber(gems)}.`;return;}
 if(cost)localStorage.setItem('hxh_nen_gems',String(gems-cost)); nickname=next; localStorage.setItem('hxh_nickname',nickname); localStorage.setItem('hxh_nickname_change_used','1'); saveGameState(); renderAll(); renderCurrencies(); renderSettings(); hint.textContent=cost?'Ник изменён за 50 Камней Нэн.':'Первая смена ника выполнена бесплатно.';
}
function changeCharacterFromSettings(){
 const hint=$('#settingsCharacterHint'), next=settingsPendingCharacter;if(!characters[next]||next===activeCharacter)return;
 const gems=Number(localStorage.getItem('hxh_nen_gems')||0), cost=hasUsedCharacterChange()?100:0;if(gems<cost){hint.textContent=`Недостаточно Камней Нэн. Нужно ${cost}, у вас ${formatNumber(gems)}.`;return;}
 const oldId=activeCharacter, old=characters[oldId], target=characters[next];
 const carried={level:old.level,xp:old.xp,rank:old.rank};
 const oldInventory=[...inventory];const oldEquipped={...equipped};Object.values(oldEquipped).filter(Boolean).forEach(item=>{if(item.classId!=='all'&&item.classId!==next&&oldInventory.length<getInventoryCapacity())oldInventory.unshift(item);});
 const nextEquipped={weapon:null,armor:null,amulet:null,ring:null,artifact1:null,artifact2:null,artifact3:null};Object.entries(oldEquipped).forEach(([slot,item])=>{if(item&&(item.classId==='all'||item.classId===next))nextEquipped[slot]=item;});
 target.level=carried.level;target.xp=carried.xp;target.xpMax=xpRequiredForLevel(target.level);target.rank=carried.rank;migratePrimaryToCurrentGrowth(next,target);
 activeCharacter=next;inventory=oldInventory.slice(0,getInventoryCapacity());equipped=nextEquipped;localStorage.setItem('hxh_selected_character',next);localStorage.setItem(inventoryStorageKey(next),JSON.stringify({inventory,equipped,seeded:true}));if(cost)localStorage.setItem('hxh_nen_gems',String(gems-cost));localStorage.setItem('hxh_character_change_used','1');saveGameState();renderAll();renderInventory();renderCurrencies();renderRank();renderSettings();hint.textContent=cost?'Персонаж изменён за 100 Камней Нэн.':'Первая смена персонажа выполнена бесплатно.';
}
const CHAT_STORAGE_KEY = "hxh_chat_messages_v1";
let chatAttachedItem = null;
let chatPickerType = "all";
function getChatEquipmentPool(){
  const all=[...(Array.isArray(inventory)?inventory:[]),...Object.values(equipped||{}).filter(Boolean)];
  const seen=new Set(); return all.filter(x=>{if(!x||seen.has(x.id))return false;seen.add(x.id);return true;}).filter(getInventoryClassAllowed);
}
function chatTypeName(type){return ({weapon:"Оружие",armor:"Броня",amulet:"Амулет",ring:"Кольцо",artifact:"Артефакт"}[type]||type||"Снаряжение");}
function chatRarityClass(r){return ({Обычный:"ordinary",Редкий:"rare",Легендарный:"legendary",Мифический:"mythic"}[r]||"ordinary");}
function getChatItemById(id){return getChatEquipmentPool().find(x=>x.id===id)||null;}
function openChatEquipmentPicker(){
 const modal=$("#chatEquipmentPicker"); if(!modal)return;
 chatPickerType="all"; renderChatEquipmentPicker(); modal.classList.add("visible"); modal.setAttribute("aria-hidden","false");
}
function closeChatEquipmentPicker(){const m=$("#chatEquipmentPicker");if(!m)return;m.classList.remove("visible");m.setAttribute("aria-hidden","true");}
function renderChatEquipmentPicker(){
 const tabs=$("#chatPickerTabs"),grid=$("#chatPickerGrid"); if(!tabs||!grid)return;
 const types=[["all","Все"],["weapon","Оружие"],["armor","Броня"],["amulet","Амулеты"],["ring","Кольца"],["artifact","Артефакты"]];
 tabs.innerHTML=types.map(([id,label])=>`<button type="button" class="${chatPickerType===id?'active':''}" data-chat-type="${id}">${label}</button>`).join("");
 tabs.querySelectorAll("[data-chat-type]").forEach(b=>b.addEventListener("click",()=>{chatPickerType=b.dataset.chatType;renderChatEquipmentPicker();}));
 const items=getChatEquipmentPool().filter(x=>chatPickerType==='all'||x.type===chatPickerType);
 grid.innerHTML=items.length?items.map(item=>`<button class="chat-pick-item rank-${chatRarityClass(item.rarity)}" data-chat-pick="${escapeHtml(item.id)}" type="button"><img src="${getEquipmentImage(item)}" alt=""><b>${escapeHtml(item.name)}</b><small>${chatTypeName(item.type)} • <span class="chat-pick-rarity">${escapeHtml(item.rarity)}</span></small></button>`).join(""):`<div class="chat-picker-empty">В этой категории нет снаряжения.</div>`;
 grid.querySelectorAll("[data-chat-pick]").forEach(b=>b.addEventListener("click",()=>{const item=getChatItemById(b.dataset.chatPick);if(item){chatAttachedItem={id:item.id,name:item.name,type:item.type,rarity:item.rarity,image:getEquipmentImage(item)};renderChatAttachment();closeChatEquipmentPicker();$("#chatInput")?.focus();}}));
}
function renderChatAttachment(){
 const box=$("#chatAttachedItem");if(!box)return;
 if(!chatAttachedItem){box.hidden=true;box.innerHTML="";return;}
 box.hidden=false;box.innerHTML=`<b>${escapeHtml(chatAttachedItem.name)}</b><button class="chat-attached-remove" id="chatAttachedRemove" type="button">×</button>`;
 $("#chatAttachedRemove")?.addEventListener("click",()=>{chatAttachedItem=null;renderChatAttachment();});
}
function findEquippedForType(type){
 if(type==='artifact') return Object.values(equipped||{}).filter(x=>x?.type==='artifact').sort((a,b)=>getEquipmentPowerScore(b)-getEquipmentPowerScore(a))[0]||null;
 return equipped?.[type]||null;
}
function getComparableStats(item){
 const st=getUpgradedStats(item||{}); return {Сила:Number(st.strength||0),Здоровье:Number(st.health||0),Защита:Number(st.defense||0),Мана:Number(st.mana||0),"Шанс крита":Number(st.critChance||st.crit||0),"Крит. урон":Number(st.critDamage||0),Вампиризм:Number(st.vampirism||0),Уклонение:Number(st.evasion||0)};
}
function openChatItemCompare(item){
 const modal=$("#chatItemCompare"),grid=$("#chatCompareGrid");if(!modal||!grid||!item)return;
 const current=findEquippedForType(item.type), a=getComparableStats(item), b=getComparableStats(current);
 const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>(a[k]||0)!==0||(b[k]||0)!==0);
 const statRows=keys.map(k=>{const av=a[k]||0,bv=b[k]||0,d=av-bv;const cls=d>0?'better':d<0?'worse':'';return `<div class="chat-compare-stat"><span>${k}</span><b class="${cls}">${av}${k.includes('Шанс')||k.includes('Крит')||k.includes('Вамп')||k.includes('Уклон')?'%':''}</b></div>`}).join('');
 const currentRows=current?keys.map(k=>{const v=b[k]||0;return `<div class="chat-compare-stat"><span>${k}</span><b>${v}${k.includes('Шанс')||k.includes('Крит')||k.includes('Вамп')||k.includes('Уклон')?'%':''}</b></div>`}).join(''):`<div class="chat-compare-note">В этом слоте сейчас ничего не надето.</div>`;
 grid.innerHTML=`<div class="chat-compare-card selected"><h4>Выбранное</h4><div class="chat-compare-item"><img src="${getEquipmentImage(item)}" alt=""><div><b>${escapeHtml(item.name)}</b><small>${chatTypeName(item.type)} • ${escapeHtml(item.rarity)} • Ур. ${item.itemLevel||item.level||1}</small></div></div><div class="chat-compare-stats">${statRows}</div></div><div class="chat-compare-card"><h4>Сейчас надето</h4>${current?`<div class="chat-compare-item"><img src="${getEquipmentImage(current)}" alt=""><div><b>${escapeHtml(current.name)}</b><small>${chatTypeName(current.type)} • ${escapeHtml(current.rarity)} • Ур. ${current.itemLevel||current.level||1}</small></div></div><div class="chat-compare-stats">${currentRows}</div>`:currentRows}</div>`;
 modal.classList.add("visible");modal.setAttribute("aria-hidden","false");
}
function closeChatItemCompare(){const m=$("#chatItemCompare");if(!m)return;m.classList.remove("visible");m.setAttribute("aria-hidden","true");}
function getChatMessages(){
  try{ const raw=localStorage.getItem(CHAT_STORAGE_KEY); const data=raw?JSON.parse(raw):[]; return Array.isArray(data)?data:[]; }catch(e){ return []; }
}
function saveChatMessages(messages){ localStorage.setItem(CHAT_STORAGE_KEY,JSON.stringify(messages.slice(-80))); }
function renderChat(){
  const count=$("#chatOnlineCount"); if(count) count.textContent=navigator.onLine ? "1" : "0";
  const avatar=$("#chatAvatar"); const c=characters[activeCharacter]; if(avatar&&c) avatar.src=c.profile;
  const box=$("#chatMessages"); if(!box)return; const messages=getChatMessages();
  if(!messages.length){ box.innerHTML=`<div class="chat-empty"><div class="chat-empty-icon">✦</div><b>Добро пожаловать в общий чат</b><span>Здесь появятся сообщения охотников. Напиши первым.</span></div>`; return; }
  box.innerHTML=messages.map((m,i)=>`<div class="chat-message ${m.mine?'mine':''}"><img class="chat-message-avatar" src="${m.avatar||'img/profile/gon.jpg'}" alt=""><div class="chat-message-content"><div class="chat-message-head"><b>${escapeHtml(m.name||'Охотник')}</b><time>${escapeHtml(m.time||'')}</time></div>${m.item?`<button type="button" class="chat-shared-text rank-${chatRarityClass(m.item.rarity)}" data-chat-shared="${i}">${escapeHtml(m.item.name)}</button>`:''}<div class="chat-message-bubble">${escapeHtml(m.text||'')}</div></div></div>`).join("");
  box.querySelectorAll("[data-chat-shared]").forEach(el=>el.addEventListener("click",()=>{const m=messages[Number(el.dataset.chatShared)];if(m?.item){const item=getChatItemById(m.item.id);if(item)openChatItemCompare(item);else openChatItemCompare(m.item);}}));
  box.scrollTop=box.scrollHeight;
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
function sendChatMessage(){
  const input=$("#chatInput"); if(!input)return; const text=input.value.trim(); if(!text&&!chatAttachedItem)return;
  const c=characters[activeCharacter],now=new Date(),time=now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),messages=getChatMessages();
  messages.push({name:nickname||c?.name||'Охотник',avatar:c?.profile||'img/profile/gon.jpg',text,time,mine:true,item:chatAttachedItem?{...chatAttachedItem}:null});
  saveChatMessages(messages); input.value=""; chatAttachedItem=null; renderChatAttachment(); const cc=$("#chatCharCount");if(cc)cc.textContent="0 / 180"; renderChat();
}
function setupChat(){
  const input=$("#chatInput"),send=$("#chatSendBtn");
  input?.addEventListener("input",()=>{const cc=$("#chatCharCount");if(cc)cc.textContent=`${input.value.length} / 180`;});
  input?.addEventListener("keydown",e=>{if(e.key==='Enter'){e.preventDefault();sendChatMessage();}}); send?.addEventListener("click",sendChatMessage);
  $("#chatInventoryBtn")?.addEventListener("click",openChatEquipmentPicker); $("#chatPickerClose")?.addEventListener("click",closeChatEquipmentPicker); $("#chatCompareClose")?.addEventListener("click",closeChatItemCompare);
  $("#chatEquipmentPicker")?.addEventListener("click",e=>{if(e.target.id==='chatEquipmentPicker')closeChatEquipmentPicker();}); $("#chatItemCompare")?.addEventListener("click",e=>{if(e.target.id==='chatItemCompare')closeChatItemCompare();});
  window.addEventListener("online",renderChat); window.addEventListener("offline",renderChat);
}
/* Legacy navigation removed in update0.5; unified handler is defined near Hunt. */


function renderSelectCharacter() {
  const box = $("#selectCharacter");
  box.innerHTML = Object.entries(characters).map(([id, c]) => `
    <button class="select-character-card ${id === pendingCharacter ? "active" : ""}" data-select-character="${id}" type="button">
      <img src="${c.profile}" alt="${c.name}">
      <strong class="select-card-name">${c.name}</strong>
      <div class="select-card-class">${c.class}</div>
      <div class="select-card-stats">
        <span>Сила <b>${c.primary.strength}</b></span>
        <span>Здор. <b>${c.primary.health}</b></span>
        <span>Защ. <b>${c.primary.defense}</b></span>
        <span>Мана <b>${c.primary.mana}</b></span>
      </div>
    </button>`).join("");

  box.querySelectorAll("[data-select-character]").forEach(btn => btn.addEventListener("click", () => {
    pendingCharacter = btn.dataset.selectCharacter;
    renderSelectCharacter();
    renderSelectPreview();
    resetSelectionState();
  }));
}

function renderSelectPreview() {
  const c = characters[pendingCharacter];
  $("#selectPreview").innerHTML = `
    <img src="${c.profile}" alt="${c.name}">
    <div class="select-info">
      <span class="section-kicker">${c.class}</span>
      <h3>${c.name}</h3>
      <div class="select-rank">Аспирант</div>
      <div class="select-stat-grid">
        <span>Сила <b>${c.primary.strength}</b></span>
        <span>Здоровье <b>${c.primary.health}</b></span>
        <span>Защита <b>${c.primary.defense}</b></span>
        <span>Мана <b>${c.primary.mana}</b></span>
      </div>
    </div>`;
}

function resetSelectionState() {
  $("#selectBtn").disabled = false;
  $("#selectBtn").classList.remove("selected");
  $("#selectBtn").textContent = "Выбрать";
  $("#confirmBtn").disabled = true;
  $("#cancelSelectBtn").disabled = true;
}

function setupFirstEntry() {
  const screen = $("#characterSelectScreen");
  if (!firstEntry) {
    screen.classList.add("hidden");
    return;
  }

  renderSelectCharacter();
  renderSelectPreview();
  resetSelectionState();

  $("#selectBtn").addEventListener("click", () => {
    const value = $("#firstNickname").value.trim().replace(/\s+/g, " ");
    if (!value) {
      $("#firstNickname").focus();
      return;
    }
    $("#selectBtn").classList.add("selected");
    $("#selectBtn").textContent = "Выбор подтверждён";
    $("#confirmBtn").disabled = false;
    $("#cancelSelectBtn").disabled = false;
  });

  $("#cancelSelectBtn").addEventListener("click", () => {
    resetSelectionState();
    renderSelectCharacter();
    renderSelectPreview();
  });

  $("#firstNickname").addEventListener("input", () => {
    $("#selectBtn").disabled = !$("#firstNickname").value.trim();
    $("#confirmBtn").disabled = true;
  });

  $("#confirmBtn").addEventListener("click", () => {
    const value = $("#firstNickname").value.trim().replace(/\s+/g, " ");
    if (!value) return;
    activeCharacter = pendingCharacter;
    nickname = value;
    localStorage.setItem("hxh_selected_character", activeCharacter);
    localStorage.setItem("hxh_nickname", nickname);
    saveCharacterState(activeCharacter);
    firstEntry = false;
    screen.classList.add("hidden");
    loadInventoryState();
    renderAll();
    renderInventory();
  });
}

/* ===== INVENTORY / EQUIPMENT v31 ===== */
const inventorySlots = ["weapon", "armor", "amulet", "ring", "artifact1", "artifact2", "artifact3"];
const inventorySlotNames = { weapon:"Оружие", armor:"Броня", amulet:"Амулет", ring:"Кольцо", artifact1:"Артефакт", artifact2:"Артефакт", artifact3:"Артефакт" };
const EQUIPMENT = [{"id":"gon_weapon_1","name":"Клинок Дикого Охотника","type":"weapon","rarity":"Обычный","level":1,"icon":"✦","stats":{"strength":7,"crit":1},"description":"Клинок Дикого Охотника — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/weapon/gon_weapon_1.jpg"},{"id":"gon_weapon_2","name":"Разрушитель Двойной Ауры","type":"weapon","rarity":"Редкий","level":1,"icon":"✦","stats":{"strength":13,"crit":2},"description":"Разрушитель Двойной Ауры — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/weapon/gon_weapon_2.jpg"},{"id":"gon_weapon_3","name":"Джаджанкен — Камень","type":"weapon","rarity":"Легендарный","level":1,"icon":"✦","stats":{"strength":22,"crit":4},"description":"Джаджанкен — Камень — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/weapon/gon_weapon_3.jpg"},{"id":"gon_armor_1","name":"Куртка Юного Охотника","type":"armor","rarity":"Обычный","level":1,"icon":"✦","stats":{"health":35,"defense":3},"description":"Куртка Юного Охотника — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/armor/gon_armor_1.jpg"},{"id":"gon_armor_2","name":"Доспехи Усиленной Ауры","type":"armor","rarity":"Редкий","level":1,"icon":"✦","stats":{"health":65,"defense":7},"description":"Доспехи Усиленной Ауры — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/armor/gon_armor_2.jpg"},{"id":"gon_armor_3","name":"Мантия Дикого Нэна","type":"armor","rarity":"Легендарный","level":1,"icon":"✦","stats":{"health":105,"defense":11},"description":"Мантия Дикого Нэна — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/armor/gon_armor_3.jpg"},{"id":"gon_amulet_1","name":"Кулон Первой Ауры","type":"amulet","rarity":"Обычный","level":1,"icon":"✦","stats":{"mana":10},"description":"Кулон Первой Ауры — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/amulet/gon_amulet_1.jpg"},{"id":"gon_amulet_2","name":"Кристалл Джаджанкен","type":"amulet","rarity":"Редкий","level":1,"icon":"✦","stats":{"mana":22,"strength":3},"description":"Кристалл Джаджанкен — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/amulet/gon_amulet_2.jpg"},{"id":"gon_amulet_3","name":"Сердце Большой Ауры","type":"amulet","rarity":"Легендарный","level":1,"icon":"✦","stats":{"mana":38,"strength":6},"description":"Сердце Большой Ауры — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/amulet/gon_amulet_3.jpg"},{"id":"gon_ring_1","name":"Кольцо Упорства","type":"ring","rarity":"Обычный","level":1,"icon":"✦","stats":{"defense":3},"description":"Кольцо Упорства — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/ring/gon_ring_1.jpg"},{"id":"gon_ring_2","name":"Кольцо Сильной Воли","type":"ring","rarity":"Редкий","level":1,"icon":"✦","stats":{"defense":6,"crit":2},"description":"Кольцо Сильной Воли — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/ring/gon_ring_2.jpg"},{"id":"gon_ring_3","name":"Кольцо Неукротимого Нэна","type":"ring","rarity":"Легендарный","level":1,"icon":"✦","stats":{"defense":10,"crit":4},"description":"Кольцо Неукротимого Нэна — специализированное снаряжение класса Боец.","classId":"gon","className":"Боец","upgradeLevel":1,"image":"img/equipment/gon_eq/ring/gon_ring_3.jpg"},{"id":"killua_weapon_1","name":"Когти Золдика","type":"weapon","rarity":"Обычный","level":1,"icon":"✦","stats":{"strength":6,"crit":3},"description":"Когти Золдика — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/weapon/killua_weapon_1.jpg"},{"id":"killua_weapon_2","name":"Иглы Бесшумного Убийцы","type":"weapon","rarity":"Редкий","level":1,"icon":"✦","stats":{"strength":12,"crit":5},"description":"Иглы Бесшумного Убийцы — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/weapon/killua_weapon_2.jpg"},{"id":"killua_weapon_3","name":"Молниеносные Когти Грома","type":"weapon","rarity":"Легендарный","level":1,"icon":"✦","stats":{"strength":20,"crit":8},"description":"Молниеносные Когти Грома — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/weapon/killua_weapon_3.jpg"},{"id":"killua_armor_1","name":"Тёмный Костюм Убийцы","type":"armor","rarity":"Обычный","level":1,"icon":"✦","stats":{"health":28,"defense":4},"description":"Тёмный Костюм Убийцы — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/armor/killua_armor_1.jpg"},{"id":"killua_armor_2","name":"Костюм Скорости","type":"armor","rarity":"Редкий","level":1,"icon":"✦","stats":{"health":50,"defense":7},"description":"Костюм Скорости — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/armor/killua_armor_2.jpg"},{"id":"killua_armor_3","name":"Доспех Белой Молнии","type":"armor","rarity":"Легендарный","level":1,"icon":"✦","stats":{"health":82,"defense":11},"description":"Доспех Белой Молнии — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/armor/killua_armor_3.jpg"},{"id":"killua_amulet_1","name":"Кристалл Скорости","type":"amulet","rarity":"Обычный","level":1,"icon":"✦","stats":{"mana":12},"description":"Кристалл Скорости — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/amulet/killua_amulet_1.jpg"},{"id":"killua_amulet_2","name":"Знак Электрической Ауры","type":"amulet","rarity":"Редкий","level":1,"icon":"✦","stats":{"mana":25,"crit":3},"description":"Знак Электрической Ауры — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/amulet/killua_amulet_2.jpg"},{"id":"killua_amulet_3","name":"Сердце Бурной Молнии","type":"amulet","rarity":"Легендарный","level":1,"icon":"✦","stats":{"mana":42,"crit":6},"description":"Сердце Бурной Молнии — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/amulet/killua_amulet_3.jpg"},{"id":"killua_ring_1","name":"Кольцо Тихого Шага","type":"ring","rarity":"Обычный","level":1,"icon":"✦","stats":{"defense":2,"crit":2},"description":"Кольцо Тихого Шага — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/ring/killua_ring_1.jpg"},{"id":"killua_ring_2","name":"Кольцо Убийцы","type":"ring","rarity":"Редкий","level":1,"icon":"✦","stats":{"defense":5,"crit":4},"description":"Кольцо Убийцы — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/ring/killua_ring_2.jpg"},{"id":"killua_ring_3","name":"Кольцо Бесшумного Грома","type":"ring","rarity":"Легендарный","level":1,"icon":"✦","stats":{"defense":8,"crit":7},"description":"Кольцо Бесшумного Грома — специализированное снаряжение класса Убийца.","classId":"killua","className":"Убийца","upgradeLevel":1,"image":"img/equipment/killua_eq/ring/killua_ring_3.jpg"},{"id":"hisoka_weapon_1","name":"Карты Трикстера","type":"weapon","rarity":"Обычный","level":1,"icon":"✦","stats":{"strength":6,"crit":2},"description":"Карты Трикстера — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/weapon/hisoka_weapon_1.jpg"},{"id":"hisoka_weapon_2","name":"Клинок Банджи Гам","type":"weapon","rarity":"Редкий","level":1,"icon":"✦","stats":{"strength":11,"crit":4},"description":"Клинок Банджи Гам — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/weapon/hisoka_weapon_2.jpg"},{"id":"hisoka_weapon_3","name":"Колода Красного Джокера","type":"weapon","rarity":"Легендарный","level":1,"icon":"✦","stats":{"strength":18,"crit":7},"description":"Колода Красного Джокера — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/weapon/hisoka_weapon_3.jpg"},{"id":"hisoka_armor_1","name":"Плащ Фокусника","type":"armor","rarity":"Обычный","level":1,"icon":"✦","stats":{"health":24,"defense":4},"description":"Плащ Фокусника — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/armor/hisoka_armor_1.jpg"},{"id":"hisoka_armor_2","name":"Костюм Магической Схемы","type":"armor","rarity":"Редкий","level":1,"icon":"✦","stats":{"health":45,"defense":7},"description":"Костюм Магической Схемы — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/armor/hisoka_armor_2.jpg"},{"id":"hisoka_armor_3","name":"Мантия Трансмутации","type":"armor","rarity":"Легендарный","level":1,"icon":"✦","stats":{"health":75,"defense":10},"description":"Мантия Трансмутации — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/armor/hisoka_armor_3.jpg"},{"id":"hisoka_amulet_1","name":"Кулон Иллюзий","type":"amulet","rarity":"Обычный","level":1,"icon":"✦","stats":{"mana":18},"description":"Кулон Иллюзий — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/amulet/hisoka_amulet_1.jpg"},{"id":"hisoka_amulet_2","name":"Око Трикстера","type":"amulet","rarity":"Редкий","level":1,"icon":"✦","stats":{"mana":32,"crit":2},"description":"Око Трикстера — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/amulet/hisoka_amulet_2.jpg"},{"id":"hisoka_amulet_3","name":"Сердце Трансмутации","type":"amulet","rarity":"Легендарный","level":1,"icon":"✦","stats":{"mana":52,"crit":5},"description":"Сердце Трансмутации — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/amulet/hisoka_amulet_3.jpg"},{"id":"hisoka_ring_1","name":"Кольцо Фокуса","type":"ring","rarity":"Обычный","level":1,"icon":"✦","stats":{"defense":2,"crit":2},"description":"Кольцо Фокуса — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/ring/hisoka_ring_1.jpg"},{"id":"hisoka_ring_2","name":"Кольцо Обманщика","type":"ring","rarity":"Редкий","level":1,"icon":"✦","stats":{"defense":5,"crit":4},"description":"Кольцо Обманщика — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/ring/hisoka_ring_2.jpg"},{"id":"hisoka_ring_3","name":"Кольцо Непредсказуемости","type":"ring","rarity":"Легендарный","level":1,"icon":"✦","stats":{"defense":8,"crit":7},"description":"Кольцо Непредсказуемости — специализированное снаряжение класса Маг.","classId":"hisoka","className":"Маг","upgradeLevel":1,"image":"img/equipment/hisoka_eq/ring/hisoka_ring_3.jpg"},{"id":"kurapika_weapon_1","name":"Клинок Алой Цепи","type":"weapon","rarity":"Обычный","level":1,"icon":"✦","stats":{"strength":7,"crit":1},"description":"Клинок Алой Цепи — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/weapon/kurapika_weapon_1.jpg"},{"id":"kurapika_weapon_2","name":"Клинок Алых Глаз","type":"weapon","rarity":"Редкий","level":1,"icon":"✦","stats":{"strength":12,"crit":3},"description":"Клинок Алых Глаз — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/weapon/kurapika_weapon_2.jpg"},{"id":"kurapika_weapon_3","name":"Императорская Цепь","type":"weapon","rarity":"Легендарный","level":1,"icon":"✦","stats":{"strength":19,"crit":6},"description":"Императорская Цепь — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/weapon/kurapika_weapon_3.jpg"},{"id":"kurapika_armor_1","name":"Плащ Охотника Цепей","type":"armor","rarity":"Обычный","level":1,"icon":"✦","stats":{"health":32,"defense":4},"description":"Плащ Охотника Цепей — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/armor/kurapika_armor_1.jpg"},{"id":"kurapika_armor_2","name":"Доспех Красных Глаз","type":"armor","rarity":"Редкий","level":1,"icon":"✦","stats":{"health":58,"defense":8},"description":"Доспех Красных Глаз — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/armor/kurapika_armor_2.jpg"},{"id":"kurapika_armor_3","name":"Мантия Императора Нэна","type":"armor","rarity":"Легендарный","level":1,"icon":"✦","stats":{"health":94,"defense":12},"description":"Мантия Императора Нэна — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/armor/kurapika_armor_3.jpg"},{"id":"kurapika_amulet_1","name":"Кулон Алой Ауры","type":"amulet","rarity":"Обычный","level":1,"icon":"✦","stats":{"mana":15},"description":"Кулон Алой Ауры — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/amulet/kurapika_amulet_1.jpg"},{"id":"kurapika_amulet_2","name":"Кристалл Императора","type":"amulet","rarity":"Редкий","level":1,"icon":"✦","stats":{"mana":28,"strength":3},"description":"Кристалл Императора — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/amulet/kurapika_amulet_2.jpg"},{"id":"kurapika_amulet_3","name":"Сердце Красных Глаз","type":"amulet","rarity":"Легендарный","level":1,"icon":"✦","stats":{"mana":46,"strength":6},"description":"Сердце Красных Глаз — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/amulet/kurapika_amulet_3.jpg"},{"id":"kurapika_ring_1","name":"Кольцо Цепи","type":"ring","rarity":"Обычный","level":1,"icon":"✦","stats":{"defense":3,"crit":1},"description":"Кольцо Цепи — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/ring/kurapika_ring_1.jpg"},{"id":"kurapika_ring_2","name":"Кольцо Правосудия","type":"ring","rarity":"Редкий","level":1,"icon":"✦","stats":{"defense":6,"crit":3},"description":"Кольцо Правосудия — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/ring/kurapika_ring_2.jpg"},{"id":"kurapika_ring_3","name":"Кольцо Абсолютной Цепи","type":"ring","rarity":"Легендарный","level":1,"icon":"✦","stats":{"defense":10,"crit":5},"description":"Кольцо Абсолютной Цепи — специализированное снаряжение класса Маг-боец.","classId":"kurapika","className":"Маг-боец","upgradeLevel":1,"image":"img/equipment/kurapika_eq/ring/kurapika_ring_3.jpg"},{"id":"artifact_sky_cup","name":"Кубок «Вершина небес»","type":"artifact","rarity":"Мифический","level":1,"icon":"✦","stats":{"crit":6,"health":32,"strength":9},"description":"Редкий реликт охотников. Усиливает шанс критического удара и общую мощь.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_sky_cup.jpg"},{"id":"artifact_nen_core","name":"Ядро Первозданного Нэна","type":"artifact","rarity":"Мифический","level":1,"icon":"✦","stats":{"mana":55,"defense":6,"crit":4},"description":"Концентрированное ядро Нэна, стабилизирующее ауру владельца.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_nen_core.jpg"},{"id":"artifact_hunter_seal","name":"Печать Звёздного Охотника","type":"artifact","rarity":"Легендарный","level":1,"icon":"✦","stats":{"strength":7,"health":45,"crit":4},"description":"Знак признания мастеров охоты, наполненный плотной аурой.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_hunter_seal.jpg"},{"id":"artifact_red_chain","name":"Осколок Алой Цепи","type":"artifact","rarity":"Легендарный","level":1,"icon":"✦","stats":{"mana":30,"defense":9,"crit":3},"description":"Фрагмент цепи с аурой контроля.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_red_chain.jpg"},{"id":"artifact_lightning","name":"Сердце Белой Молнии","type":"artifact","rarity":"Легендарный","level":1,"icon":"✦","stats":{"strength":8,"mana":28,"crit":5},"description":"Реликвия, в которой застыла стремительная электрическая аура.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_lightning.jpg"},{"id":"artifact_bungee","name":"Ядро Банджи Гам","type":"artifact","rarity":"Легендарный","level":1,"icon":"✦","stats":{"health":38,"mana":34,"crit":4},"description":"Странный артефакт с эластичной, меняющейся аурой.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_bungee.jpg"},{"id":"artifact_jajanken","name":"Камень Нэна «Джаджанкен»","type":"artifact","rarity":"Легендарный","level":1,"icon":"✦","stats":{"strength":11,"health":42,"defense":4},"description":"Плотный камень ауры, заточенный под прямую силу.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_jajanken.jpg"},{"id":"artifact_assassin","name":"Маска Беззвучного Убийцы","type":"artifact","rarity":"Легендарный","level":1,"icon":"✦","stats":{"crit":7,"defense":7,"health":24},"description":"Реликвия скрытного движения и точного удара.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_assassin.jpg"},{"id":"artifact_emperor","name":"Око Императора","type":"artifact","rarity":"Мифический","level":1,"icon":"✦","stats":{"crit":5,"strength":8,"mana":45,"defense":5},"description":"Артефакт абсолютной концентрации и контроля Нэна.","classId":"all","className":"Все классы","upgradeLevel":1,"image":"img/equipment/artifacts/artifact_emperor.jpg"}];
const equipmentById = Object.fromEntries(EQUIPMENT.map(item => [item.id,item]));
const EQUIPMENT_CLASS = { gon:"Боец", killua:"Убийца", hisoka:"Маг", kurapika:"Маг-боец" };
let inventory = [];
let equipped = { weapon:null, armor:null, amulet:null, ring:null, artifact1:null, artifact2:null, artifact3:null };
let inventoryMassMode = false;
let inventorySelected = new Set();
let inventorySeeded = false;
let selectedInventoryItemId = null;

const PREMIUM_STORAGE_KEY='hxh_premium_until_v1';
function premiumUntil(){return Math.max(0,Number(localStorage.getItem(PREMIUM_STORAGE_KEY)||0));}
function isPremiumActive(){return premiumUntil()>Date.now();}
function getXpMultiplier(){return isPremiumActive()?1.10:1;}
function getJennyMultiplier(){return isPremiumActive()?1.10:1;}
function getInventoryCapacity(){return isPremiumActive()?125:100;}
function getMarketLotLimit(){return isPremiumActive()?10:5;}
function creditJenny(amount,{premium=true}={}){const base=Math.max(0,Number(amount)||0),add=Math.max(0,Math.round(base*(premium?getJennyMultiplier():1)));const now=Math.max(0,Number(localStorage.getItem('hxh_jenny')||0));localStorage.setItem('hxh_jenny',String(Math.floor(now+add)));return add;}
function grantPremiumDays(days){const now=Date.now(),wasActive=isPremiumActive(),from=Math.max(now,premiumUntil()),until=from+Math.max(1,Number(days)||1)*86400000;localStorage.setItem(PREMIUM_STORAGE_KEY,String(until));if(!wasActive){const energy=getHuntEnergyState();energy.value=Math.min(getHuntEnergyMax(),energy.value+50);saveHuntEnergyState(energy);}renderPremiumUi();renderEnergyCurrency();renderInventory();return until;}
function syncServerPremiumUntil(untilSeconds){const next=Math.max(0,Number(untilSeconds)||0)*1000;if(!next)return premiumUntil();const wasActive=isPremiumActive(),prev=premiumUntil();if(next>prev)localStorage.setItem(PREMIUM_STORAGE_KEY,String(next));if(!wasActive&&next>Date.now()){const energy=getHuntEnergyState();energy.value=Math.min(getHuntEnergyMax(),energy.value+50);saveHuntEnergyState(energy);}renderPremiumUi();renderEnergyCurrency();renderInventory();return Math.max(prev,next);}
function renderPremiumUi(){const active=isPremiumActive(),badge=$('#premiumBadge'),hero=document.querySelector('.hero-card');if(badge){badge.hidden=!active;badge.textContent='PREMIUM';}hero?.classList.toggle('premium-profile',active);const status=$('#premiumStatusText');if(status){if(active){const left=premiumUntil()-Date.now(),days=Math.max(1,Math.ceil(left/86400000));status.textContent=`Premium активен • ${days} дн.`;}else status.textContent='Premium не активен';}const commission=$('#marketCommissionText');if(commission)commission.textContent=isPremiumActive()?'Комиссия 3% с Premium':'Комиссия 5% при продаже';}

function inventoryStorageKey(id = activeCharacter){ return `hxh_inventory_${id}`; }
function saveInventoryState(){ localStorage.setItem(inventoryStorageKey(), JSON.stringify({inventory,equipped,seeded:true})); if(typeof saveGameState==='function'&&!firstEntry) saveGameState(); }
function cloneEquipment(item){ return item ? JSON.parse(JSON.stringify(item)) : null; }
function getInventoryClassAllowed(item){ return !item || (item.classId==='all' || item.classId===activeCharacter) && Number(item.itemLevel||item.level||1) <= Number(characters[activeCharacter]?.level||1); }
function getUpgradeCost(item){
  const up=Math.max(1,Number(item.upgradeLevel||1));
  const lv=Math.max(1,Number(item.itemLevel||item.level||1));
  const base={"Обычный":180,"Редкий":520,"Легендарный":1400,"Мифический":3600}[item.rarity]||180;
  return Math.round(base*(1+lv*.035)*Math.pow(1.55,up-1));
}
function getUpgradeMultiplier(item){ return 1 + Math.max(0,Number(item.upgradeLevel||1)-1)*0.04; }
function getEquipmentLevelMultiplier(item){ return 1; }
function getUpgradedStats(item){ const m=getUpgradeMultiplier(item)*getEquipmentLevelMultiplier(item); return Object.fromEntries(Object.entries(item.stats||{}).map(([k,v])=>[k,Math.round(Number(v)*m)])); }
function getEquipmentImage(item){ return item?.image || ''; }
function getRankClass(r){ return ({"Обычный":"ordinary","Редкий":"rare","Легендарный":"legendary","Мифический":"mythic"}[r]||'ordinary'); }
function formatEquipmentStats(item){ const st=getUpgradedStats(item); const names={strength:'Сила',health:'Здоровье',defense:'Защита',mana:'Мана',crit:'Шанс крита',critChance:'Шанс крита',critDamage:'Крит. урон',vampirism:'Вампиризм',evasion:'Уклонение'}; return Object.entries(st).map(([k,v])=>`+${v}${['crit','critChance','critDamage','vampirism','evasion'].includes(k)?'%':''} ${names[k]||k}`).join(' • '); }
function loadInventoryState(){
  const saved=localStorage.getItem(inventoryStorageKey());
  if(saved){ try{ const state=JSON.parse(saved); inventory=Array.isArray(state.inventory)?state.inventory.slice(0,getInventoryCapacity()).map(normalizeEquipment):[]; equipped={...equipped,...(state.equipped||{})}; Object.keys(equipped).forEach(k=>equipped[k]=normalizeEquipment(equipped[k])); inventorySeeded=Boolean(state.seeded);
      // Удаляем только тестовые стартовые предметы, которые ранее автоматически выдавались проектом.
      const starterIds=new Set(["starter_blade","starter_guard","starter_amulet","starter_ring","starter_artifact_1","starter_artifact_2","starter_artifact_3","gon_weapon_1","killua_weapon_1","hisoka_weapon_1","kurapika_weapon_1"]);
      // Remove legacy test/starter gear from both inventory and equipped slots.
      inventory=inventory.filter(item=>!starterIds.has(item?.id) && !item?.testStarter);
      Object.keys(equipped).forEach(k=>{ if(equipped[k]?.testStarter || starterIds.has(equipped[k]?.id)) equipped[k]=null; });
      // Persist the cleaned state immediately so removed test gear cannot return after reload.
      localStorage.setItem(inventoryStorageKey(), JSON.stringify({inventory,equipped,seeded:true}));
      saveInventoryState();
      return; }catch(_){} }
  // Новым персонажам больше не выдаём тестовое стартовое снаряжение. Дроп будет приходить из охоты.
  inventory=[]; equipped={weapon:null,armor:null,amulet:null,ring:null,artifact1:null,artifact2:null,artifact3:null}; inventorySeeded=true; saveInventoryState();
}
function rebalanceEquipmentPercentStats(item){
  if(!item?.stats)return item;
  const caps={critChance:8,critDamage:20,vampirism:5,evasion:7};
  Object.entries(caps).forEach(([k,cap])=>{if(item.stats[k]!=null)item.stats[k]=Math.max(1,Math.min(cap,Math.round(Number(item.stats[k])||1)));});
  return item;
}
function normalizeEquipment(item){
  if(!item)return null;
  const base=equipmentById[item.id];
  const merged=base?{...cloneEquipment(base),...item}:{...item,classId:item.classId||activeCharacter,className:item.className||EQUIPMENT_CLASS[activeCharacter]||'Все классы',image:item.image||''};
  merged.itemLevel=Math.max(1,Math.min(100,Number(item.itemLevel||item.level||base?.level||1)));
  merged.level=merged.itemLevel; merged.upgradeLevel=Math.max(1,Math.min(10,Number(item.upgradeLevel||1))); merged.rarity=merged.rarity||base?.rarity||'Обычный';
  if(!merged.equipmentBalanceV6){merged.stats=rollEquipmentStats(base||merged,merged.classId||'all',merged.type,merged.itemLevel,merged.rarity);merged.equipmentBalanceV5=1;merged.equipmentBalanceV6=1;}
  if(merged.stats?.crit!=null&&merged.stats.critChance==null){merged.stats.critChance=merged.stats.crit;delete merged.stats.crit;}
  rebalanceEquipmentPercentStats(merged); return merged;
}
const EQUIPMENT_BONUS_POOLS = {
  gon: { weapon:[['strength',5,11],['critChance',1,2],['critDamage',2,4],['vampirism',1,2]], armor:[['health',25,55],['defense',3,7],['evasion',1,2]], amulet:[['mana',6,14],['strength',2,5],['critDamage',2,4]], ring:[['defense',2,5],['critChance',1,2],['vampirism',1,2]] },
  killua: { weapon:[['strength',4,9],['critChance',1,2],['evasion',1,2],['vampirism',1,2]], armor:[['health',20,45],['defense',2,6],['evasion',1,2]], amulet:[['mana',6,14],['critChance',1,2],['evasion',1,2]], ring:[['defense',1,4],['critChance',1,2],['evasion',1,2]] },
  hisoka: { weapon:[['strength',5,10],['critChance',1,2],['critDamage',2,5],['vampirism',1,2]], armor:[['health',18,42],['defense',2,5],['evasion',1,2]], amulet:[['mana',9,18],['critDamage',2,4],['critChance',1,2]], ring:[['defense',1,4],['critDamage',2,4],['evasion',1,2]] },
  kurapika: { weapon:[['strength',5,10],['critChance',1,2],['critDamage',2,4],['vampirism',1,2]], armor:[['health',24,50],['defense',3,7],['evasion',1,2]], amulet:[['mana',8,16],['strength',2,5],['critChance',1,2]], ring:[['defense',2,5],['critChance',1,2],['critDamage',2,4]] }
};
const RARITY_BONUS_COUNT = { 'Обычный':1, 'Редкий':1, 'Легендарный':2, 'Мифический':3 };
const RARITY_LEVEL_MULT = { 'Обычный':0.84, 'Редкий':1.13, 'Легендарный':1.47, 'Мифический':1.86 };
const EQUIPMENT_LEVEL_GROWTH = 0;
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function getEquipmentRollSignature(item){
  if(!item) return '';
  const stats=Object.entries(item.stats||{}).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}:${v}`).join('|');
  return [item.name,item.classId,item.type,item.rarity,item.itemLevel||item.level||1,stats].join('::');
}
function getExistingEquipmentRolls(){
  const list=[...(Array.isArray(inventory)?inventory:[]),...Object.values(equipped||{})].filter(Boolean);
  return new Set(list.map(getEquipmentRollSignature));
}

function getEquipmentReferenceStats(classId,level){
  const lv=Math.max(1,Math.min(100,Number(level)||1));
  if(classId&&classId!=='all'&&BASE_PRIMARY_STATS[classId]) return getLevelScaledBaseStats(classId,lv);
  const all=Object.keys(BASE_PRIMARY_STATS).map(id=>getLevelScaledBaseStats(id,lv));
  return {strength:all.reduce((s,x)=>s+x.strength,0)/all.length,health:all.reduce((s,x)=>s+x.health,0)/all.length,defense:all.reduce((s,x)=>s+x.defense,0)/all.length,mana:all.reduce((s,x)=>s+x.mana,0)/all.length};
}
function equipmentSecondaryRoll(classId,type,level,rarity){
  const tier={"Обычный":0,"Редкий":1,"Легендарный":2,"Мифический":3}[rarity]||0;
  const lvl=Math.max(1,Number(level)||1), pool=(EQUIPMENT_BONUS_POOLS[classId]?.[type]||EQUIPMENT_BONUS_POOLS.gon[type]||[]).map(x=>x[0]);
  const unique=[...new Set(pool.filter(k=>['critChance','critDamage','vampirism','evasion'].includes(k)))];
  const count=Math.min(RARITY_BONUS_COUNT[rarity]||1,unique.length); const out={};
  unique.sort(()=>Math.random()-.5).slice(0,count).forEach(key=>{
    if(key==='critChance') out[key]=randInt(1,Math.max(1,2+tier+Math.floor(lvl/45)));
    if(key==='critDamage') out[key]=randInt(3,Math.max(4,6+tier*3+Math.floor(lvl/30)));
    if(key==='vampirism') out[key]=randInt(1,Math.max(1,1+tier+Math.floor(lvl/70)));
    if(key==='evasion') out[key]=randInt(1,Math.max(1,2+tier+Math.floor(lvl/50)));
  });
  return out;
}
function rollEquipmentStats(template,classId,type,level,rarity){
  const lv=Math.max(1,Math.min(100,Number(level)||1));
  const ref=getEquipmentReferenceStats(classId,lv), r=RARITY_LEVEL_MULT[rarity]||1;
  const stats={};
  // Экипировка усиливает специализацию, но не заменяет развитие персонажа.
  if(type==='weapon') stats.strength=Math.max(1,Math.round(ref.strength*.060*r*randInt(94,106)/100));
  else if(type==='armor'){
    stats.health=Math.max(2,Math.round(ref.health*.080*r*randInt(94,107)/100));
    stats.defense=Math.max(1,Math.round(ref.defense*.036*r*randInt(94,106)/100));
  } else if(type==='amulet'){
    stats.mana=Math.max(2,Math.round(ref.mana*.082*r*randInt(94,107)/100));
    stats.strength=Math.max(1,Math.round(ref.strength*.014*r));
  } else if(type==='ring') stats.defense=Math.max(1,Math.round(ref.defense*.040*r*randInt(94,107)/100));
  else if(type==='artifact'){
    stats.strength=Math.max(1,Math.round(ref.strength*.013*r));
    stats.health=Math.max(2,Math.round(ref.health*.017*r));
    stats.defense=Math.max(1,Math.round(ref.defense*.012*r));
    stats.mana=Math.max(1,Math.round(ref.mana*.014*r));
  }
  const affinity={gon:{weapon:'strength',armor:'health'},killua:{weapon:'critChance',ring:'evasion'},hisoka:{amulet:'critDamage',weapon:'critChance'},kurapika:{amulet:'mana',ring:'defense'}}[classId]?.[type];
  if(affinity==='strength') stats.strength=Math.round((stats.strength||0)+ref.strength*.012*r);
  if(affinity==='health') stats.health=Math.round((stats.health||0)+ref.health*.018*r);
  if(affinity==='mana') stats.mana=Math.round((stats.mana||0)+ref.mana*.026*r);
  if(affinity==='defense') stats.defense=Math.round((stats.defense||0)+ref.defense*.014*r);
  if(affinity==='critChance') stats.critChance=(stats.critChance||0)+Math.max(1,Math.round(r));
  if(affinity==='critDamage') stats.critDamage=(stats.critDamage||0)+Math.max(2,Math.round(r*3));
  if(affinity==='evasion') stats.evasion=(stats.evasion||0)+Math.max(1,Math.round(r*.8));
  Object.entries(equipmentSecondaryRoll(classId==='all'?'gon':classId,type,lv,rarity)).forEach(([k,v])=>stats[k]=(stats[k]||0)+v);
  const normalized={stats};rebalanceEquipmentPercentStats(normalized);return normalized.stats;
}
function getRarityEquipmentTemplate(classId,type,rarity){
  if(!classId || !type) return null;
  const tier={Обычный:1,Редкий:2,Легендарный:3,Мифический:3}[rarity]||1;
  const candidates=EQUIPMENT.filter(x=>x.classId===classId&&x.type===type);
  if(!candidates.length)return null;
  // Обычный оставляем базовым предметом. Редкий/Легендарный берут соответствующий
  // более сильный шаблон, поэтому редкость всегда ощущается не только рамкой.
  return candidates.sort((a,b)=>Number(a.level||1)-Number(b.level||1))[Math.min(tier-1,candidates.length-1)];
}
function generateEquipmentDrop(classId,type,itemLevel,rarity='Обычный',templateId=null){
  const template = templateId ? equipmentById[templateId] : getRarityEquipmentTemplate(classId,type,rarity);
  if(!template) return null;
  const level=Math.max(1,Number(itemLevel)||1);
  const existing=getExistingEquipmentRolls();
  let stats={};
  let signature='';
  for(let attempt=0;attempt<40;attempt++){
    stats=rollEquipmentStats(template,classId,type,level,rarity);
    const preview={name:template.name,classId,type,rarity,itemLevel:level,stats};
    signature=getEquipmentRollSignature(preview);
    if(!existing.has(signature)) break;
  }
  const item=cloneEquipment(template);
  item.id=`drop_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
  item.itemLevel=level; item.level=level; item.upgradeLevel=1; item.rarity=rarity; item.stats=stats;
  item.rollId=`roll_${Date.now()}_${Math.random().toString(36).slice(2,10)}`; item.manaBalanceV2=1; item.equipmentBalanceV5=1; item.equipmentBalanceV6=1;
  item.description=template.description||`${template.name} — снаряжение, пропитанное Нэн.`;
  return item;
}
function generateRandomEquipmentDrop(classId=activeCharacter,type='weapon',itemLevel=Math.max(1,characters[activeCharacter]?.level||1),rarity='Обычный'){ return generateEquipmentDrop(classId,type,itemLevel,rarity); }

function getEquipmentPowerScore(item){
  if(!item) return -Infinity;
  const st=getUpgradedStats(item);
  return Number(st.strength||0)*7.2 + Number(st.health||0)*.405 + Number(st.defense||0)*5.1 + Number(st.mana||0)*.825
    + Number(st.critChance||st.crit||0)*6.5 + Number(st.critDamage||0)*1.55 + Number(st.vampirism||0)*10 + Number(st.evasion||0)*8.5;
}
function autoEquipBest(){
  if(inventoryMassMode)return;
  const playerLevel=Number(characters[activeCharacter]?.level||1);
  const allowed=inventory.filter(item=>item && getInventoryClassAllowed(item));
  const changed=[];
  ['weapon','armor','amulet','ring'].forEach(type=>{
    const candidates=allowed.filter(x=>x.type===type).sort((a,b)=>getEquipmentPowerScore(b)-getEquipmentPowerScore(a));
    const best=candidates[0]; if(!best)return;
    const current=equipped[type];
    if(!current || getEquipmentPowerScore(best)>getEquipmentPowerScore(current)){
      const idx=inventory.findIndex(x=>x.id===best.id); if(idx<0)return;
      const previous=equipped[type]; equipped[type]=best; inventory.splice(idx,1); if(previous)inventory.unshift(previous); changed.push(best.name);
    }
  });
  const artifacts=allowed.filter(x=>x.type==='artifact').sort((a,b)=>getEquipmentPowerScore(b)-getEquipmentPowerScore(a));
  if(artifacts.length){
    const currentArtifacts=inventorySlots.filter(s=>s.startsWith('artifact')).map(s=>equipped[s]).filter(Boolean);
    artifacts.slice(0,3).forEach(best=>{
      const worstSlot=inventorySlots.filter(s=>s.startsWith('artifact')).sort((a,b)=>getEquipmentPowerScore(equipped[a])-getEquipmentPowerScore(equipped[b]))[0];
      if(!worstSlot)return;
      const worst=equipped[worstSlot];
      if(!worst || getEquipmentPowerScore(best)>getEquipmentPowerScore(worst)){
        const idx=inventory.findIndex(x=>x.id===best.id); if(idx<0)return;
        equipped[worstSlot]=best; inventory.splice(idx,1); if(worst)inventory.unshift(worst); changed.push(best.name);
      }
    });
  }
  if(changed.length){saveInventoryState();renderInventory();renderAll();setInventoryHint(`Надето лучшее: ${changed.length} предмет(а)`);}else setInventoryHint('Лучшее снаряжение уже надето');
}
function getInventorySlotForItem(item){ if(!item)return null; if(item.type==='artifact') return ['artifact1','artifact2','artifact3'].find(slot=>!equipped[slot])||null; return item.type; }
function equipItem(itemId){
  if(inventoryMassMode)return toggleInventorySelection(itemId);
  const index=inventory.findIndex(x=>x.id===itemId); if(index<0)return;
  const item=inventory[index];
  if(!getInventoryClassAllowed(item)){ const itemLevel=Number(item.itemLevel||item.level||1); const playerLevel=Number(characters[activeCharacter]?.level||1); if(itemLevel>playerLevel) setInventoryHint(`Нельзя надеть: уровень снаряжения ${itemLevel}, ваш уровень ${playerLevel}`); else setInventoryHint(`Это снаряжение предназначено для класса «${item.className}»`); return; }
  const slot=getInventorySlotForItem(item); if(!slot){ setInventoryHint('Все 3 слота артефактов заняты'); return; }
  const previous=equipped[slot]; equipped[slot]=item; inventory.splice(index,1); if(previous)inventory.unshift(previous); inventorySelected.delete(itemId); saveInventoryState(); renderInventory(); renderAll();
}
function unequipItem(slot){ const item=equipped[slot]; if(!item)return; if(inventory.length>=getInventoryCapacity()){setInventoryHint(`Инвентарь заполнен: ${getInventoryCapacity()} / ${getInventoryCapacity()}`);return;} inventory.push(item); equipped[slot]=null; saveInventoryState(); renderInventory(); renderAll(); }
function setInventoryHint(text){ const label=$('#inventorySelectedLabel'); if(!label)return; label.textContent=text; clearTimeout(setInventoryHint.timer); setInventoryHint.timer=setTimeout(()=>{label.textContent='Нажми на предмет, чтобы открыть описание';},2200); }
function getAllUnequippedItems(){return inventory.filter(Boolean);}
function deleteInventoryItems(ids){const set=new Set(ids);inventory=inventory.filter(x=>!set.has(x.id));ids.forEach(id=>inventorySelected.delete(id));saveInventoryState();renderInventory();}
function dismantleInventoryItems(ids){const set=new Set(ids);const count=inventory.filter(x=>set.has(x.id)).length;if(!count)return;inventory=inventory.filter(x=>!set.has(x.id));inventorySelected.clear();const cur=Number(localStorage.getItem('hxh_nen_gems')||0);localStorage.setItem('hxh_nen_gems',String(cur+count*2));renderCurrencies();saveInventoryState();renderInventory();setInventoryHint(`Разобрано: +${count*2} Камней Нэн`);}
function renderCurrencies(){const j=Number(localStorage.getItem('hxh_jenny')||0);const je=$('#jennyValue');if(je)je.textContent=formatNumber(j);const g=Number(localStorage.getItem('hxh_nen_gems')||0);const ge=$('#nenGemValue');if(ge)ge.textContent=formatNumber(g);if(typeof renderEnergyCurrency==='function')renderEnergyCurrency();}
function renderEquipmentSlot(slot){
  const button=document.querySelector(`[data-equip-slot="${slot}"]`); if(!button)return; const item=equipped[slot]; button.classList.toggle('filled',Boolean(item)); button.className=`equipment-slot ${slot.includes('artifact')?'artifact-slot':''} ${item?'filled':''} ${item?'rank-'+getRankClass(item.rarity):''}`;
  if(!item){button.innerHTML=`<span class="slot-icon">${slot==='weapon'?'⚔':slot==='armor'?'◈':slot==='amulet'?'◇':slot==='ring'?'○':'✦'}</span><small>${inventorySlotNames[slot]}</small>`;button.title='Пустой слот';return;}
  button.innerHTML=`<img src="${getEquipmentImage(item)}" alt="${item.name}"><small>${inventorySlotNames[slot]}</small>`;button.title=`${item.name} • ${item.rarity} • Ур. ${item.upgradeLevel||1}`;
}
function getEquipmentLore(item){
  if(!item)return 'Снаряжение, пропитанное Нэн.';
  const original=String(item.description||'').trim();
  const artificial=/сгенер|случайн|находка охотника|специализированное снаряжение|свойства соответствуют редкости/i.test(original);
  if(original && !artificial) return original;
  const type=String(item.type||'');
  const cls=String(item.className||'охотника');
  const rarity=String(item.rarity||'');
  if(type==='weapon') return rarity==='Мифический'?'Оружие, о котором среди Хантеров говорят вполголоса: его Нэн будто отвечает на решимость владельца.':`Оружие школы «${cls}», сохранившее следы Нэн прежних владельцев.`;
  if(type==='armor') return `Защитное снаряжение школы «${cls}». Плотная аура в материале смягчает удары и удерживает форму в бою.`;
  if(type==='amulet') return `Амулет, настроенный на поток Нэн. При концентрации его поверхность едва заметно отзывается на ауру владельца.`;
  if(type==='ring') return `Кольцо Хантера, созданное для тонкого контроля Нэн и сохранения концентрации в затяжном бою.`;
  if(type==='artifact') return `Редкая реликвия Нэн. Её происхождение неизвестно, но заключённая внутри аура остаётся необычно плотной.`;
  return 'Снаряжение, пропитанное Нэн.';
}
function openEquipmentModal(itemId){ const item=inventory.find(x=>x.id===itemId)||Object.values(equipped).find(x=>x?.id===itemId); if(!item)return; selectedInventoryItemId=item.id; renderEquipmentModal(item); $('#equipmentModal').classList.add('visible'); $('#equipmentModal').setAttribute('aria-hidden','false'); }
function closeEquipmentModal(){ $('#equipmentModal')?.classList.remove('visible'); $('#equipmentModal')?.setAttribute('aria-hidden','true'); selectedInventoryItemId=null; }
function renderEquipmentModal(item){
  const st=getUpgradedStats(item), allowed=getInventoryClassAllowed(item), equippedNow=Object.values(equipped).some(x=>x?.id===item.id), cost=getUpgradeCost(item), jenny=Number(localStorage.getItem('hxh_jenny')||0), max=(item.upgradeLevel||1)>=10;
  $('#equipmentModalContent').innerHTML=`<div class="equipment-detail rank-${getRankClass(item.rarity)}"><div class="equipment-detail-top"><div class="equipment-detail-image"><img src="${getEquipmentImage(item)}" alt="${item.name}"></div><div class="equipment-detail-info"><h3>${item.name}</h3><p>${getEquipmentLore(item)}</p><div class="equipment-detail-row"><span>Ранг</span><b>${item.rarity||'Обычный'}</b></div><div class="equipment-detail-row"><span>Класс</span><b>${item.className}</b></div><div class="equipment-detail-row"><span>Уровень снаряжения</span><b>${item.itemLevel||item.level||1}</b></div><div class="equipment-detail-row"><span>Улучшение</span><b>${item.upgradeLevel||1} / 10</b></div></div></div><div class="equipment-benefits"><b>ДАЁТ ПРИ ЭКИПИРОВКЕ</b><span>${Object.keys(st).length?formatEquipmentStats(item):'Нет бонусов'}</span></div><div class="equipment-detail-actions"><button type="button" id="equipmentEquipBtn" ${!allowed?'disabled':''}>${equippedNow?'Снять':'Надеть'}</button><button type="button" id="equipmentUpgradeBtn" ${max||jenny<cost?'disabled':''}>${max?'МАКС.':`Улучшить • ${formatNumber(cost)} Дженни`}</button></div><div class="equipment-restriction">${allowed?'Подходит текущему персонажу':(Number(item.itemLevel||item.level||1)>Number(characters[activeCharacter]?.level||1)?'Нельзя надеть: уровень снаряжения выше вашего':'Нельзя надеть: нужен класс «'+item.className+'»')}</div></div>`;
  $('#equipmentEquipBtn')?.addEventListener('click',()=>{ if(equippedNow){const slot=Object.keys(equipped).find(k=>equipped[k]?.id===item.id);if(slot)unequipItem(slot);}else equipItem(item.id);closeEquipmentModal(); });
  $('#equipmentUpgradeBtn')?.addEventListener('click',()=>upgradeEquipment(item.id));
}
function upgradeEquipment(itemId){
  const item=inventory.find(x=>x.id===itemId)||Object.values(equipped).find(x=>x?.id===itemId); if(!item)return; if((item.upgradeLevel||1)>=10)return; const cost=getUpgradeCost(item);const cur=Number(localStorage.getItem('hxh_jenny')||0);if(cur<cost)return;localStorage.setItem('hxh_jenny',String(cur-cost));item.upgradeLevel=(item.upgradeLevel||1)+1;item.level=item.itemLevel||item.level||1;saveInventoryState();renderCurrencies();renderInventory();renderAll();openEquipmentModal(item.id);
}
function renderInventory(){
 const grid=$('#inventoryGrid');if(!grid)return;const items=getAllUnequippedItems();$('#inventoryCapacity').textContent=`${items.length} / ${getInventoryCapacity()}`;document.querySelectorAll('[data-equip-slot]').forEach(btn=>renderEquipmentSlot(btn.dataset.equipSlot));
 const portrait=$('#inventoryCharacterPortrait'),c=characters[activeCharacter]||characters.gon;if(portrait)portrait.src=c.profile;
 grid.classList.toggle('mass-mode',inventoryMassMode);
 grid.innerHTML=items.length?items.map(item=>`<button class="inventory-item ${inventorySelected.has(item.id)?'selected':''} rank-${getRankClass(item.rarity)}" data-inventory-id="${item.id}" type="button" title="${item.name} • ${item.rarity}"><span class="inventory-check"></span><span class="item-icon"><img src="${getEquipmentImage(item)}" alt="${item.name}"></span><span class="item-name">${item.name}</span><span class="item-level">Ур. ${formatNumber(item.itemLevel||item.level||1)}</span></button>`).join(''):`<div class="inventory-empty">Инвентарь пуст.<br><span>Снаряжение появится здесь после получения добычи.</span></div>`;
 grid.querySelectorAll('[data-inventory-id]').forEach(btn=>btn.addEventListener('click',()=>inventoryMassMode?toggleInventorySelection(btn.dataset.inventoryId):openEquipmentModal(btn.dataset.inventoryId)));
 $('#inventoryMassCount').textContent=`Выбрано: ${inventorySelected.size}`;$('#massToolbar').classList.toggle('visible',inventoryMassMode);$('#inventoryMassBtn').textContent=inventoryMassMode?'Готово':'Выбрать';
}
function toggleInventorySelection(id){if(inventorySelected.has(id))inventorySelected.delete(id);else inventorySelected.add(id);renderInventory();}
function setInventoryMassMode(enabled){inventoryMassMode=enabled;if(!enabled)inventorySelected.clear();renderInventory();}
function setupInventory(){
 loadInventoryState();renderCurrencies();renderInventory();
 $('#openInventoryBtn')?.addEventListener('click',()=>{$('#inventoryScreen').classList.add('visible');$('#inventoryScreen').setAttribute('aria-hidden','false');setInventoryMassMode(false);});
 $('#closeInventoryBtn')?.addEventListener('click',()=>{$('#inventoryScreen').classList.remove('visible');$('#inventoryScreen').setAttribute('aria-hidden','true');setInventoryMassMode(false);});
 document.querySelectorAll('[data-equip-slot]').forEach(button=>button.addEventListener('click',()=>{ const item=equipped[button.dataset.equipSlot]; if(item) openEquipmentModal(item.id); }));
 $('#inventoryBestBtn')?.addEventListener('click',autoEquipBest);
 $('#inventoryMassBtn')?.addEventListener('click',()=>setInventoryMassMode(!inventoryMassMode));
 $('#inventorySelectAllBtn')?.addEventListener('click',()=>{const all=getAllUnequippedItems();const yes=all.length&&all.every(x=>inventorySelected.has(x.id));inventorySelected=new Set(yes?[]:all.map(x=>x.id));renderInventory();});
 $('#inventoryDeleteSelectedBtn')?.addEventListener('click',()=>{if(!inventorySelected.size)return setInventoryHint('Сначала выбери предметы');deleteInventoryItems([...inventorySelected]);});
  $('#equipmentModalClose')?.addEventListener('click',closeEquipmentModal);$('#equipmentModal')?.addEventListener('click',e=>{if(e.target.id==='equipmentModal')closeEquipmentModal();});
}
const originalRenderAll = renderAll;
renderAll = function() {
  originalRenderAll();
  renderCurrencies();
  if (document.querySelector("#inventoryScreen")?.classList.contains("visible")) renderInventory();
};


/* ===== HUNT + TURN BATTLE v38 ===== */
const HUNT_ZONES = [
  {level:1, area:'Лес экзамена', intro:'Плотный лес у места экзамена. Первые маршруты охотника, где опасность растёт постепенно.', aura:86, dungeons:[
    {name:'Тропа ученика',desc:'Короткая лесная тропа у места экзамена. Мелкие звери, без ловушек. Первая охота для Нэн 1.',enemy:'Лесной кабан',xp:[15,35],jenny:[12,23],drop:25},
    {name:'Гнездо лис-медведей',desc:'Густая чаща, где хищники защищают своё логово. Нужно следить за быстрыми атаками.',enemy:'Лис-медведь',xp:[22,45],jenny:[18,31],drop:28},
    {name:'Болото экзаменаторов',desc:'Сырая низина с вязкой водой и неожиданными засадами. Здесь охотник учится держать темп.',enemy:'Болотный клыкач',xp:[28,55],jenny:[22,38],drop:30}
  ]},
  {level:12,area:'Скалистые земли',intro:'Каменные перевалы и хищники, привыкшие к ауре охотников.',aura:180,dungeons:[
    {name:'Каменный перевал',desc:'Узкая тропа между скал. Ветер глушит шаги хищников.',enemy:'Каменный волк',xp:[95,145],jenny:[70,110],drop:32},{name:'Грот хищных ящеров',desc:'Тёплая пещера, где стая ящеров охраняет редкие кристаллы Нэна.',enemy:'Пещерный ящер',xp:[115,170],jenny:[82,125],drop:35},{name:'Разлом охотников',desc:'Глубокий разлом с обрывами и нестабильной аурой.',enemy:'Разломный жук',xp:[135,195],jenny:[95,145],drop:38}]},
  {level:22,area:'Пещеры охотников',intro:'Подземные маршруты, где обычной силы уже недостаточно.',aura:360,dungeons:[
    {name:'Пещера паучьего клана',desc:'Сеть тоннелей, перекрытая липкими нитями.',enemy:'Паук-охотник',xp:[260,360],jenny:[190,280],drop:40},{name:'Зал каменных стражей',desc:'Древний зал с неподвижными стражами, пробуждающимися от ауры.',enemy:'Каменный страж',xp:[300,410],jenny:[220,320],drop:43},{name:'Глубокий рудник',desc:'Заброшенный рудник с агрессивным существом в глубине.',enemy:'Шахтный людоед',xp:[340,460],jenny:[250,360],drop:46}]},
  {level:38,area:'Башня испытаний',intro:'Вертикальный комплекс испытаний. Каждый этаж проверяет отдельную сторону Нэна.',aura:650,dungeons:[
    {name:'Лестница сотни испытаний',desc:'Длинный подъём, где противник становится сильнее с каждым пролётом.',enemy:'Клинковый монах',xp:[620,820],jenny:[440,620],drop:48},{name:'Зал ловушек',desc:'Механизмы и ложные проходы заставляют сражаться расчётливо.',enemy:'Ловчий капканов',xp:[700,920],jenny:[500,700],drop:51},{name:'Верхний ярус',desc:'Высота и плотная аура превращают каждый промах в опасность.',enemy:'Страж верхнего яруса',xp:[780,1020],jenny:[560,790],drop:54}]},
  {level:50,area:'Пустоши Нэна',intro:'Выжженные земли, где аура сохранилась даже после исчезновения цивилизации.',aura:1050,dungeons:[
    {name:'Красная пустошь',desc:'Открытое поле без укрытий. Здесь решает первый точный удар.',enemy:'Пепельный зверь',xp:[1000,1350],jenny:[720,980],drop:55},{name:'Кратер Нэна',desc:'Воронка с концентрированной аурой, искажающей привычные техники.',enemy:'Ядровый голем',xp:[1150,1500],jenny:[800,1100],drop:58},{name:'Долина зверей',desc:'Дикая долина с несколькими стаями редких существ.',enemy:'Пустошный хищник',xp:[1300,1700],jenny:[900,1250],drop:61}]},
  {level:60,area:'Руины древних охотников',intro:'Заброшенные комплексы старых мастеров Нэна.',aura:1650,dungeons:[
    {name:'Затонувший архив',desc:'Залы знаний, ушедшие под воду и наполненные аурой старых печатей.',enemy:'Архивный призрак',xp:[1700,2250],jenny:[1200,1650],drop:62},{name:'Храм старых охотников',desc:'Святилище с испытаниями, созданными мастерами прошлого.',enemy:'Хранитель храма',xp:[1950,2550],jenny:[1350,1850],drop:65},{name:'Подземный экзекутор',desc:'Последний страж руин, который не признаёт права на ошибку.',enemy:'Подземный экзекутор',xp:[2200,2850],jenny:[1500,2050],drop:68}]},
  {level:70,area:'Грозовой хребет',intro:'Горный массив, где природная энергия смешалась с Нэном.',aura:2550,dungeons:[
    {name:'Грозовой лес',desc:'Деревья проводят разряды, а существа чувствуют движение по ауре.',enemy:'Грозовой волк',xp:[2800,3600],jenny:[1950,2700],drop:68},{name:'Штормовой утёс',desc:'Узкий утёс над пропастью. Один неверный шаг решает исход боя.',enemy:'Штормовой великан',xp:[3200,4100],jenny:[2200,3000],drop:71},{name:'Разрядная впадина',desc:'Центр грозовой зоны с плотным электрическим Нэном.',enemy:'Разрядный хищник',xp:[3600,4650],jenny:[2450,3350],drop:74}]},
  {level:80,area:'Безлунный каньон',intro:'Территория без естественного света, где охотник полагается на чувство Нэна.',aura:3900,dungeons:[
    {name:'Каньон без луны',desc:'Глубокие стены скрывают врага до последнего момента.',enemy:'Теневой зверь',xp:[4500,5800],jenny:[3000,4200],drop:74},{name:'Чёрная тропа',desc:'Маршрут, на котором следы исчезают через несколько секунд.',enemy:'Каньонный охотник',xp:[5100,6500],jenny:[3350,4650],drop:77},{name:'Разлом тени',desc:'Трещина, где аура ведёт себя непредсказуемо.',enemy:'Безлунный палач',xp:[5700,7200],jenny:[3700,5100],drop:80}]},
  {level:90,area:'Земли Красной Ауры',intro:'Зона с экстремальной концентрацией Нэна. Здесь обычные техники становятся опасными.',aura:5900,dungeons:[
    {name:'Красная цитадель',desc:'Крепость, окружённая плотной алой аурой.',enemy:'Алый зверь',xp:[7000,9000],jenny:[4600,6300],drop:80},{name:'Алый лабиринт',desc:'Сложная сеть коридоров, где противник меняет дистанцию.',enemy:'Страж цитадели',xp:[7800,10000],jenny:[5100,7000],drop:83},{name:'Сердце ауры',desc:'Источник красной энергии, охраняемый самым опасным существом зоны.',enemy:'Сердцеед',xp:[8600,11200],jenny:[5600,7700],drop:86}]},
  {level:100,area:'Предел Нэна',intro:'Последняя известная граница испытаний. Сюда приходят охотники, которым уже мало обычной силы.',aura:8800,dungeons:[
    {name:'Предел испытания',desc:'Последний маршрут перед абсолютным пределом.',enemy:'Пределец',xp:[10500,13500],jenny:[6800,9300],drop:86},{name:'Врата абсолютного Нэна',desc:'Врата, выдержать которые способен только мастер контроля ауры.',enemy:'Абсолютный страж',xp:[12000,15500],jenny:[7600,10400],drop:89},{name:'Бездна охотников',desc:'Бездна без известных карт. Здесь заканчиваются обычные правила охоты.',enemy:'Охотник бездны',xp:[14000,18000],jenny:[8500,11600],drop:92}]}
];
const ENEMY_NAMES = Object.fromEntries(HUNT_ZONES.flatMap((z,zi)=>z.dungeons.map((d,di)=>[`${z.level}+_${di}`,d.enemy])));
const BATTLE_ENEMY_RARITY = ['Обычный','Обычный','Редкий','Редкий','Редкий','Легендарный','Легендарный','Мифический','Мифический','Мифический'];
const BATTLE_RARITY_TABLE = [
 [{rare:0,legendary:0,mythic:0},{rare:0,legendary:0,mythic:0},{rare:0,legendary:0,mythic:0}],
 [{rare:3,legendary:0,mythic:0},{rare:9,legendary:0,mythic:0},{rare:15,legendary:0,mythic:0}],
 [{rare:30,legendary:0,mythic:0},{rare:45,legendary:0,mythic:0},{rare:55,legendary:0,mythic:0}],
 [{rare:60,legendary:3,mythic:0},{rare:70,legendary:7,mythic:0},{rare:78,legendary:12,mythic:0}],
 [{rare:80,legendary:8,mythic:0},{rare:85,legendary:12,mythic:0},{rare:88,legendary:18,mythic:0}],
 [{rare:82,legendary:15,mythic:.5},{rare:84,legendary:15,mythic:1},{rare:86,legendary:12,mythic:2}],
 [{rare:78,legendary:20,mythic:2},{rare:80,legendary:22,mythic:3},{rare:82,legendary:25,mythic:5}],
 [{rare:72,legendary:25,mythic:4},{rare:75,legendary:30,mythic:5},{rare:78,legendary:35,mythic:7}],
 [{rare:64,legendary:30,mythic:7},{rare:67,legendary:34,mythic:9},{rare:70,legendary:38,mythic:12}],
 [{rare:55,legendary:33,mythic:12},{rare:58,legendary:36,mythic:15},{rare:62,legendary:38,mythic:18}]
];
function rollDropRarity(zoneIndex,dungeonIndex){
  const z=Math.max(0,Math.min(9,zoneIndex)), d=Math.max(0,Math.min(2,dungeonIndex));
  const mythic=Math.max(0,(z-5)*.9+d*.7);
  const legendary=Math.max(0,(z-2)*2.6+d*2.2);
  const rare=Math.min(55,12+z*4+d*5);
  const r=Math.random()*100;
  if(r<mythic)return 'Мифический'; if(r<mythic+legendary)return 'Легендарный'; if(r<mythic+legendary+rare)return 'Редкий'; return 'Обычный';
}
function getDropClass(){if(Math.random()<.85)return activeCharacter;const others=Object.keys(characters).filter(id=>id!==activeCharacter);return others[randInt(0,others.length-1)];}

// Артефакты выпадают только из редкости Редкий / Легендарный / Мифический.
// Шанс постепенно растёт вместе со сложностью охоты, поэтому в первых зонах
// артефакты остаются редкими, а на высоких уровнях становятся заметнее.
const ARTIFACT_DROP_CHANCE_BY_ZONE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10];
const ARTIFACT_RARITY_TABLE = [
  null,
  {rare:100, legendary:0, mythic:0},
  {rare:88, legendary:12, mythic:0},
  {rare:78, legendary:22, mythic:0},
  {rare:70, legendary:28, mythic:2},
  {rare:62, legendary:34, mythic:4},
  {rare:55, legendary:38, mythic:7},
  {rare:48, legendary:42, mythic:10},
  {rare:40, legendary:45, mythic:15},
  {rare:32, legendary:48, mythic:20}
];
function rollArtifactRarity(zoneIndex){
  const t=ARTIFACT_RARITY_TABLE[zoneIndex]||ARTIFACT_RARITY_TABLE[1];
  const r=Math.random()*100;
  if(r<t.mythic+t.legendary+t.rare){
    if(r<t.mythic)return 'Мифический';
    if(r<t.mythic+t.legendary)return 'Легендарный';
    return 'Редкий';
  }
  return 'Редкий';
}
function generateArtifactDrop(itemLevel,rarity){
  const candidates=EQUIPMENT.filter(x=>x.type==='artifact'&&x.rarity===rarity);
  if(!candidates.length)return null;
  const template=candidates[randInt(0,candidates.length-1)];
  const level=Math.max(1,Number(itemLevel)||1);
  const stats=rollEquipmentStats(template,'gon','artifact',level,rarity);
  const item=cloneEquipment(template);
  item.id=`drop_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
  item.itemLevel=level; item.level=level; item.upgradeLevel=1; item.rarity=rarity; item.stats=stats;
  item.rollId=`roll_${Date.now()}_${Math.random().toString(36).slice(2,10)}`; item.manaBalanceV2=1; item.equipmentBalanceV5=1; item.equipmentBalanceV6=1;
  item.description=template.description||`${template.name} — снаряжение, пропитанное Нэн.`;
  return item;
}

let selectedHuntZone = 0, selectedDungeonIndex = null;
let battleState = null;
function huntZoneUnlocked(i){ const c=characters[activeCharacter]; return c && c.level>=HUNT_ZONES[i].level; }
function getDungeonEnemyAura(zoneIndex,dungeonIndex){return Math.max(1,Number(enemyForDungeon(zoneIndex,dungeonIndex)?.aura)||1);}
function getDungeonAura(zoneIndex,dungeonIndex){
  // Требование чуть ниже фактической ауры врага: игрок может зайти на грани силы,
  // но значение противника в карточке/бою больше не расходится с его реальными статами.
  return Math.max(1,Math.round(getDungeonEnemyAura(zoneIndex,dungeonIndex)*.92));
}
function isDungeonUnlocked(zoneIndex,dungeonIndex){
 const c=characters[activeCharacter]; if(!c)return false;
 const z=HUNT_ZONES[zoneIndex];
 return c.level>=z.level && calculateAura(c)>=getDungeonAura(zoneIndex,dungeonIndex);
}
function getDungeonRarityChances(zoneIndex,dungeonIndex){
  const drop=getDungeonDropChance(zoneIndex,dungeonIndex),z=Math.max(0,zoneIndex),d=Math.max(0,dungeonIndex);
  const mythic=Math.max(0,(z-5)*.9+d*.7),legendary=Math.max(0,(z-2)*2.6+d*2.2),rare=Math.min(55,12+z*4+d*5);
  const ordinaryShare=Math.max(0,100-rare-legendary-mythic);
  return {ordinary:+(drop*ordinaryShare/100).toFixed(1),rare:+(drop*rare/100).toFixed(1),legendary:+(drop*legendary/100).toFixed(1),mythic:+(drop*mythic/100).toFixed(1)};
}
function getDungeonDropChance(zoneIndex,dungeonIndex){
  return Math.min(48,18+zoneIndex*2.5+dungeonIndex*4);
}
function getDungeonRewardRanges(zoneIndex,dungeonIndex){
  const c=characters[activeCharacter],lv=Math.max(1,Number(c?.level||1)),z=HUNT_ZONES[zoneIndex];
  const req=Math.max(1,xpRequiredForLevel(Math.min(99,lv)));
  const age=Math.max(0,lv-Number(z.level||1)),efficiency=Math.max(.35,1-age*.035);
  const ratios=lv<12?[.042,.053,.066]:lv<30?[.025,.032,.039]:lv<60?[.0145,.018,.022]:[.009,.012,.015];
  const ratio=ratios[dungeonIndex]||ratios[1];
  const center=req*ratio*efficiency;
  const jCenter=(80+Math.pow(lv,1.52)*7.5)*(1+dungeonIndex*.18)*efficiency;
  return {xp:[Math.max(3,Math.round(center*.86)),Math.max(5,Math.round(center*1.14))],jenny:[Math.max(8,Math.round(jCenter*.84)),Math.max(10,Math.round(jCenter*1.16))]};
}
function renderHuntDetailModal(){
 const modal=$('#huntDetailModal'), content=$('#huntDetailModalContent');
 if(!modal||!content||selectedDungeonIndex===null)return;
 const c=characters[activeCharacter],z=HUNT_ZONES[selectedHuntZone],d=z.dungeons[selectedDungeonIndex];
 const reqAura=getDungeonAura(selectedHuntZone,selectedDungeonIndex),enemyAura=getDungeonEnemyAura(selectedHuntZone,selectedDungeonIndex),locked=!isDungeonUnlocked(selectedHuntZone,selectedDungeonIndex),ch=getDungeonRarityChances(selectedHuntZone,selectedDungeonIndex);
 content.innerHTML=`<div class="dungeon-detail modal-dungeon-detail"><div class="dungeon-detail-media" style="background-image:url('img/dungeon/${z.level}+/dungeon_${selectedDungeonIndex+1}.jpg')"><div class="detail-media-shade"></div><div class="detail-media-title"></div></div><div class="dungeon-detail-info"><h3 class="modal-dungeon-title">${d.name}</h3><p>${d.desc}</p><div class="reward-grid"><div><span>XP</span><b>${formatNumber(getDungeonRewardRanges(selectedHuntZone,selectedDungeonIndex).xp[0])}–${formatNumber(getDungeonRewardRanges(selectedHuntZone,selectedDungeonIndex).xp[1])}</b></div><div><span>Дженни</span><b><img src="img/icon/jenny.png" alt="">${formatNumber(getDungeonRewardRanges(selectedHuntZone,selectedDungeonIndex).jenny[0])}–${formatNumber(getDungeonRewardRanges(selectedHuntZone,selectedDungeonIndex).jenny[1])}</b></div><div><span>Обычный</span><b>${formatNumber(ch.ordinary)}%</b></div><div><span>Редкий</span><b>${formatNumber(ch.rare)}%</b></div><div><span>Легендарный</span><b>${formatNumber(ch.legendary)}%</b></div><div><span>Мифический</span><b>${formatNumber(ch.mythic)}%</b></div></div><div class="aura-req compact-aura"><span>Противник <b>${formatNumber(enemyAura)}</b></span><span>Вход от <b>${formatNumber(reqAura)}</b></span><span>Твоя: ${formatNumber(calculateAura(c))}</span></div><button class="hunt-start" id="startDungeonBtn" type="button" ${locked?'disabled':''}>${locked?'НУЖНО БОЛЬШЕ СИЛЫ':`НАЧАТЬ ОХОТУ <span class="hunt-energy-cost">(5 <img src="img/icon/energy.png" alt="">)</span>`}</button></div></div>`;
 modal.classList.add('visible'); modal.setAttribute('aria-hidden','false'); $('#huntScreen')?.classList.add('hunt-modal-open');
 $('#startDungeonBtn')?.addEventListener('click',startDungeonBattle);
}
function closeHuntDetailModal(){const modal=$('#huntDetailModal');if(!modal)return;modal.classList.remove('visible');modal.setAttribute('aria-hidden','true');$('#huntScreen')?.classList.remove('hunt-modal-open');}
function renderHunt(){
 const c=characters[activeCharacter]; if(!c)return;
 const levels=$('#huntLevels');
 if(levels) levels.innerHTML=HUNT_ZONES.map((z,i)=>`<button type="button" class="hunt-level-btn ${i===selectedHuntZone?'active':''} ${huntZoneUnlocked(i)?'':'locked'}" data-hunt-level="${i}" ${huntZoneUnlocked(i)?'':'disabled'}>${z.level}+</button>`).join('');
 const z=HUNT_ZONES[selectedHuntZone];
 const area=$('#huntArea');
 if(area) area.innerHTML=`<div class="hunt-area-title"><div><span class="section-kicker">${z.level}+ • МЕСТНОСТЬ</span><h3>${z.area}</h3></div><p>${z.intro}</p></div>`;
 $('#huntDungeons').innerHTML=z.dungeons.map((d,i)=>{
   const aura=getDungeonEnemyAura(selectedHuntZone,i),open=isDungeonUnlocked(selectedHuntZone,i);
   return `<button type="button" class="dungeon-card ${i===selectedDungeonIndex?'active':''} ${open?'':'locked'}" data-dungeon="${i}"><img src="img/dungeon/${z.level}+/dungeon_${i+1}.jpg" alt=""><div class="dungeon-card-body"><b>${d.name}</b><small>Аура врага ${formatNumber(aura)}</small></div></button>`;
 }).join('');
 levels?.querySelectorAll('[data-hunt-level]').forEach(b=>b.addEventListener('click',()=>{selectedHuntZone=Number(b.dataset.huntLevel);selectedDungeonIndex=null;closeHuntDetailModal();renderHunt();}));
 $('#huntDungeons')?.querySelectorAll('[data-dungeon]').forEach(b=>b.addEventListener('click',()=>{selectedDungeonIndex=Number(b.dataset.dungeon);renderHunt();renderHuntDetailModal();}));
}
function enemyForDungeon(zoneIndex,dungeonIndex){
  const z=HUNT_ZONES[zoneIndex],d=z.dungeons[dungeonIndex],lv=Math.max(1,Number(z.level)||1),expected=expectedPlayerAtLevel(lv);
  const zonePressure=1+zoneIndex*.022, diff=([.76,.92,1.09][dungeonIndex]||.92)*zonePressure;
  const hp=Math.max(20,Math.round(expected.health*(1.12+dungeonIndex*.20)*(1+zoneIndex*.012)));
  const strength=Math.max(4,Math.round(expected.strength*.76*diff));
  const defense=Math.max(2,Math.round(expected.defense*(.55+dungeonIndex*.055)*(1+zoneIndex*.010)));
  const maxMana=Math.max(20,Math.round(expected.mana*(.72+dungeonIndex*.035)));
  const enemySkill=getEnemySkill(zoneIndex*3+dungeonIndex+1,maxMana);
  const enemy={name:d.enemy,level:lv,maxHp:hp,hp,maxMana,mana:maxMana,strength,defense,critChance:Math.min(27,4+zoneIndex*1.35+dungeonIndex*1.35),critDamage:Math.min(64,24+zoneIndex*2.4+dungeonIndex*2.2),evasion:Math.min(19,2+zoneIndex*.82+dungeonIndex*.75),vampirism:Math.min(8,zoneIndex*.42),damageMultiplier:1,image:`img/dungeon/${lv}+/enemy${lv}+/enemy_${dungeonIndex+1}.png`,rarity:BATTLE_ENEMY_RARITY[zoneIndex],enemySkill,enemySkillCd:0};
  enemy.aura=calculateCombatAura(enemy);return enemy;
}
function playerBattleStats(){ const c=characters[activeCharacter], st=getEffectivePrimaryStats(c), pct=getEffectivePercentStats(st); return {name:c.name,level:c.level,maxHp:Math.max(1,Math.round(st.health)),hp:Math.max(1,Math.round(st.health)),maxMana:Math.max(0,Math.round(st.mana)),mana:Math.max(0,Math.round(st.mana)),strength:st.strength,defense:st.defense,...pct}; }
function addBattleLog(text,cls='info'){const el=$('#battleLog');if(!el)return;el.insertAdjacentHTML('beforeend',`<div class="${cls}">${text}</div>`);el.scrollTop=el.scrollHeight;}
function clampBattle(v,max){return Math.max(0,Math.min(max,v));}
function calcDamage(attacker,defender,mult=1,ignoreDefense=0){let raw=(attacker.strength*1.62+10)*mult; const def=Math.max(0,defender.defense*(1-ignoreDefense)); const mitigation=115/(115+Math.sqrt(def)*8.6); let dmg=Math.max(1,Math.round(raw*mitigation)); const critChance=effectivePercentStat(attacker.critChance,'critChance'); const critDamage=effectivePercentStat(attacker.critDamage,'critDamage'); const crit=Math.random()*100<critChance; if(crit)dmg=Math.round(dmg*(1.5+critDamage/100)); return {damage:dmg,crit};}
function applyBattleDamage(target,amount){target.hp=clampBattle(target.hp-amount,target.maxHp);}
function battleFxBurst(fighter,kind){
 if(!fighter)return;fighter.querySelector('.battle-fx-burst')?.remove();const fx=document.createElement('span');fx.className=`battle-fx-burst ${kind}`;
 for(let i=0;i<12;i++){const p=document.createElement('i');p.style.setProperty('--n',i);fx.appendChild(p);}fighter.appendChild(fx);setTimeout(()=>fx.remove(),900);
}
function battleFloatText(fighter,text,kind='damage'){if(!fighter)return;const el=document.createElement('b');el.className=`battle-float-text ${kind}`;el.textContent=text;fighter.appendChild(el);setTimeout(()=>el.remove(),950);}
function battleAnim(kind){
 const pf=$('#battlePlayerImage'),ef=$('#battleEnemyImage'),pfw=pf?.closest('.battle-fighter'),efw=ef?.closest('.battle-fighter');if(!pf||!ef)return;
 const cls={playerAttack:'battle-player-attack',playerSkill:'battle-player-skill',enemyAttack:'battle-enemy-attack',playerHit:'battle-player-hit',enemyHit:'battle-enemy-hit',heal:'battle-heal',defend:'battle-defend'}[kind];
 const owner=(kind==='enemyAttack'||kind==='enemyHit')?ef:pf;owner?.classList.remove(cls);void owner?.offsetWidth;owner?.classList.add(cls);
 if(kind==='playerAttack'||kind==='playerSkill'){ef.classList.remove('battle-enemy-hit');void ef.offsetWidth;ef.classList.add('battle-enemy-hit');battleFxBurst(efw,kind==='playerSkill'?'skill':'hit');}
 if(kind==='enemyAttack'){pf.classList.remove('battle-player-hit');void pf.offsetWidth;pf.classList.add('battle-player-hit');battleFxBurst(pfw,'enemy-hit');}
 if(kind==='heal'&&pfw){pfw.classList.remove('battle-heal');void pfw.offsetWidth;pfw.classList.add('battle-heal');battleFxBurst(pfw,'heal');}
 if(kind==='defend'&&pfw){pfw.classList.add('battle-shield','battle-defend');battleFxBurst(pfw,'shield');}
 setTimeout(()=>{owner?.classList.remove(cls);pf.classList.remove('battle-player-hit');ef.classList.remove('battle-enemy-hit');if(kind==='heal')pfw?.classList.remove('battle-heal');if(kind==='defend')pfw?.classList.remove('battle-defend');},760);
}

function battleHealPlayer(){const s=battleState; const amount=Math.round(s.player.maxHp*.16);s.player.hp=clampBattle(s.player.hp+amount,s.player.maxHp);battleAnim('heal');battleFloatText($('#battlePlayerImage')?.closest('.battle-fighter'),`+${amount}`,'heal');addBattleLog(`Вы восстановили ${amount} HP.`,'good');}
function renderBattle(){const s=battleState;if(!s)return;const p=s.player,e=s.enemy;const set=(id,v)=>{const el=$(id);if(el)el.textContent=v};set('#battlePlayerName',p.name);set('#battlePlayerAura',`✦ ${formatNumber(calculateAura(characters[activeCharacter]))} ауры`);set('#battlePlayerHp',`${p.hp}/${p.maxHp}`);set('#battlePlayerMana',`${p.mana}/${p.maxMana}`);set('#battleEnemyName',e.name);set('#battleEnemyAura',`✦ ${formatNumber(e.aura||calculateCombatAura(e))} ауры`);set('#battleEnemyHp',`${e.hp}/${e.maxHp}`);set('#battleEnemyMana',`${e.mana}/${e.maxMana}`);set('#battleTurnLabel',s.busy?'Ход противника':'Ваш ход');$('#battlePlayerImage').src=`img/dungeon/me_klass/${activeCharacter}.png`;$('#battleEnemyImage').src=e.image;$('#battlePlayerHpFill').style.width=`${p.hp/p.maxHp*100}%`;$('#battlePlayerManaFill').style.width=`${p.mana/p.maxMana*100}%`;$('#battleEnemyHpFill').style.width=`${e.hp/e.maxHp*100}%`;$('#battleEnemyManaFill').style.width=`${e.mana/e.maxMana*100}%`;renderBattleActions();}
function battleCanUseSkill(index){const s=battleState;if(!s||s.busy)return false;const skill=SKILLS[activeCharacter]?.[index];if(!skill||!isSkillUnlocked(index)||!isSkillSelected(index))return false;return s.player.mana>=getSkillManaCost(skill,index)&&(s.skillCd[index]||0)<=0;}
function renderBattleActions(){const s=battleState,wrap=$('#battleActions');if(!s||!wrap)return;const active=getActiveSkillIndexes();let html=`<button class="battle-action attack" data-battle-action="attack"><img src="img/icon/strength.png"><b>Атака</b><small>Обычный удар</small></button>`;active.forEach((idx,slot)=>{const skill=SKILLS[activeCharacter][idx],cost=getSkillManaCost(skill,idx),cd=s.skillCd[idx]||0;html+=`<button class="battle-action skill ${cd?'on-cooldown':''}" data-battle-skill="${idx}" ${battleCanUseSkill(idx)?'':'disabled'}><span class="battle-action-image"><img src="${getSkillIconPath(activeCharacter,idx)}">${cd?`<i class="battle-cd">${cd}</i>`:''}</span><b>${skill.name}</b><small>${cost} маны</small></button>`;});while(active.length+1<3){html+=`<button class="battle-action skill" disabled><img src="img/icon/skills.png"><b>Пустой слот</b><small>Навык не надет</small></button>`;active.push(-1);}html+=`<button class="battle-action heal ${s.healCd?'on-cooldown':''}" data-battle-action="heal" ${s.player.mana<15||s.healCd>0?'disabled':''}><span class="battle-action-image"><img src="img/icon/health.png">${s.healCd?`<i class="battle-cd">${s.healCd}</i>`:''}</span><b>Лечение</b><small>15 маны</small></button><button class="battle-action defend ${s.defendCd?'on-cooldown':''}" data-battle-action="defend" ${s.defendCd>0?'disabled':''}><span class="battle-action-image"><img src="img/icon/defense.png">${s.defendCd?`<i class="battle-cd">${s.defendCd}</i>`:''}</span><b>Защита</b><small>40% блока</small></button>`;wrap.innerHTML=html;wrap.querySelectorAll('[data-battle-action]').forEach(b=>b.addEventListener('click',()=>battlePlayerAction(b.dataset.battleAction)));wrap.querySelectorAll('[data-battle-skill]').forEach(b=>b.addEventListener('click',()=>battlePlayerAction('skill',Number(b.dataset.battleSkill))));}
function reduceCooldowns(){const s=battleState;if(!s)return;Object.keys(s.skillCd).forEach(k=>s.skillCd[k]=Math.max(0,s.skillCd[k]-1));s.healCd=Math.max(0,s.healCd-1);s.defendCd=Math.max(0,s.defendCd-1);}
function beginBattleTurnFlow(playerFirstText,enemyFirstText){
  const s=battleState;if(!s)return;
  const playerFirst=Math.random()<.5;
  s.playerTurnReady=false;
  if(playerFirst){s.busy=false;addBattleLog(playerFirstText||'Вы действуете первым.','info');renderBattle();}
  else{s.busy=true;addBattleLog(enemyFirstText||`${s.enemy.name} перехватывает первый ход.`,'bad');renderBattle();setTimeout(enemyTurn,650);}
}
function battlePlayerAction(action,index){
 const s=battleState;if(!s||s.busy||s.ended)return;if(!s.playerTurnReady){reduceCooldowns();s.playerTurnReady=true;}let performed=false;
 const lifesteal=damage=>{const heal=Math.floor(damage*effectivePercentStat(s.player.vampirism,'vampirism')/100);if(heal){s.player.hp=clampBattle(s.player.hp+heal,s.player.maxHp);addBattleLog(`Вампиризм: +${heal} HP.`,'good');}};
 if(action==='attack'){
   battleAnim('playerAttack');let mult=1;if(s.damageBuff){mult*=s.damageBuff;s.damageBuff=1;}if(s.nextAttackBonus!==1){mult*=s.nextAttackBonus;s.nextAttackBonus=1;}if(s.enemyMarked){mult*=1.30;s.enemyMarked=false;addBattleLog('Метка сработала: удар усилен на 30%.','info');}
   const r=calcDamage(s.player,s.enemy,mult);applyBattleDamage(s.enemy,r.damage);battleFloatText($('#battleEnemyImage')?.closest('.battle-fighter'),`-${r.damage}`,r.crit?'crit':'damage');addBattleLog(`Вы нанесли ${r.damage} урона${r.crit?' — КРИТ!':''} ${s.enemy.name}.`,'good');lifesteal(r.damage);performed=true;
 } else if(action==='heal'&&s.player.mana>=15&&s.healCd<=0){s.player.mana-=15;battleHealPlayer();s.healCd=3;performed=true;
 } else if(action==='defend'&&s.defendCd<=0){s.defending=true;const pfw=$('#battlePlayerImage')?.closest('.battle-fighter');battleAnim('defend');s.defendCd=2;addBattleLog('Защитная стойка: следующий входящий удар снижен на 40%.','info');performed=true;
 } else if(action==='skill'&&battleCanUseSkill(index)){
   battleAnim('playerSkill');const skill=SKILLS[activeCharacter][index],cost=getSkillManaCost(skill,index);s.player.mana-=cost;let r={damage:0,crit:false};
   if(skill.type==='buff'){s.damageBuff=1.30;addBattleLog(`${skill.name}: следующая атака усилена на 30%.`,'info');}
   else if(skill.type==='stealth'){s.playerEvasionBuff=45;s.nextAttackBonus=1.30;addBattleLog(`${skill.name}: +45% уклонения от следующей атаки и +30% к следующему удару.`,'info');}
   else {
     let pierce=skill.type==='pierce'?0.30:skill.type==='reveal'?0.15:0;
     let skillMult=1+getSkillPower(skill,index)/100;
     const attacker={...s.player}; if(skill.type==='crit')attacker.critChance=Number(attacker.critChance||0)+35;
     r=calcDamage(attacker,s.enemy,skillMult,pierce);
     if(skill.type==='execute'&&s.enemy.hp/s.enemy.maxHp<.35){const bonus=skill.id==='hisoka_cleave'?1.50:1.45;r.damage=Math.round(r.damage*bonus);}
     if(s.nextAttackBonus!==1){r.damage=Math.round(r.damage*s.nextAttackBonus);s.nextAttackBonus=1;}
     if(s.damageBuff){r.damage=Math.round(r.damage*s.damageBuff);s.damageBuff=1;}
     applyBattleDamage(s.enemy,r.damage);battleFloatText($('#battleEnemyImage')?.closest('.battle-fighter'),`-${r.damage}`,r.crit?'crit':'damage');addBattleLog(`Вы использовали «${skill.name}» и нанесли ${r.damage}${r.crit?' — КРИТ!':''} урона.`,'good');
     if(skill.type==='chain'){s.enemyDebuff=.65;s.enemyDebuffTurns=1;} if(skill.type==='control'){s.enemyDebuff=.70;s.enemyDebuffTurns=1;} if(skill.type==='mind'){s.enemyDebuff=.75;s.enemyDebuffTurns=2;}
     if(skill.type==='bleed'){const pct=s.mode==='boss'?.006:.018;s.enemyBleed=Math.max(1,Math.min(Math.round(s.enemy.maxHp*pct),Math.round(s.player.strength*.85)));s.enemyBleedTurns=3;addBattleLog(`Кровотечение: ${s.enemyBleed} урона ещё 3 хода.`,'bad');}
     if(skill.type==='mark'){s.enemyMarked=true;addBattleLog('Метка нанесена: следующая атака по цели усилена на 30%.','info');}
     if(skill.type==='evasion'){s.playerEvasionBuff=Math.max(s.playerEvasionBuff||0,35);addBattleLog('Скорость Киллуа: +35% уклонения от следующей атаки.','info');}
     if(skill.type==='deception'){s.playerEvasionBuff=35;s.nextAttackBonus=1.15;addBattleLog('Обман: +35% уклонения и +15% к следующей атаке.','info');}
     lifesteal(r.damage);
   }
   s.skillCd[index]=Math.max(1,Number(skill.cooldown)||1);performed=true;
 }
 if(!performed)return;if(s.mode==='boss')persistBossBattleProgress(false);s.playerTurnReady=false;if(s.enemy.hp<=0)return battleWin();s.busy=true;renderBattle();setTimeout(enemyTurn,650);
}
function enemyTurn(){const s=battleState;if(!s||s.ended)return;if(s.enemyBleed>0&&s.enemyBleedTurns>0){const bleed=s.enemyBleed;applyBattleDamage(s.enemy,bleed);s.enemyBleedTurns--;addBattleLog(`Кровотечение наносит ${bleed} урона ${s.enemy.name}${s.enemyBleedTurns?` • ещё ${s.enemyBleedTurns} х.`:''}.`,'bad');if(s.enemyBleedTurns<=0)s.enemyBleed=0;}if(s.enemy.hp<=0)return battleWin();
 let attackMult=s.enemyDebuff||1;if((s.enemyDebuffTurns||0)>0){s.enemyDebuffTurns--;if(s.enemyDebuffTurns<=0)s.enemyDebuff=1;}else{s.enemyDebuff=1;}
 // Уникальные механики рейдовых боссов.
 if(s.mode==='boss'){
   s.bossTurns=(s.bossTurns||0)+1; const id=s.bossId, lost=1-(s.enemy.hp/s.enemy.maxHp);
   if(id==='hisoka') s.enemy.evasion=Math.min(35,18+lost*18);
   if(id==='uvogin') attackMult*=1.28;
   if(id==='feitan') attackMult*=1+lost*.95;
   if(id==='razor') attackMult*=1.22;
   if(id==='pitou'&&s.bossTurns%3===0){const heal=Math.round(s.enemy.maxHp*.012);s.enemy.hp=clampBattle(s.enemy.hp+heal,s.enemy.maxHp);const efw=$('#battleEnemyImage')?.closest('.battle-fighter');battleFxBurst(efw,'heal');battleFloatText(efw,`+${heal}`,'heal');addBattleLog(`Доктор Блайт восстанавливает ${formatNumber(heal)} HP.`,'bad');}
   if(id==='youpi') attackMult*=1+Math.min(.75,s.bossTurns*.055);
   if(id==='pouf'){s.enemy.evasion=Math.min(32,20+s.bossTurns*.5);attackMult*=1.12;}
   if(id==='meruem') attackMult*=1+Math.min(1.15,s.bossTurns*.07);
 }
 const es=s.enemy.enemySkill;
 const canSkill=!!es&&s.enemy.mana>=es.cost&&s.enemy.enemySkillCd<=0;
 const useSkill=canSkill&&(Math.random()<0.48||s.enemy.mana>=Math.round(s.enemy.maxMana*.72));
 if(useSkill){
   s.enemy.mana=Math.max(0,s.enemy.mana-es.cost);
   s.enemy.enemySkillCd=es.cooldown;
   let atk={...s.enemy}; atk.evasion=0;
   const playerEv=effectivePercentStat(Number(s.player.evasion||0)+Number(s.playerEvasionBuff||0),'evasion');
   if(Math.random()*100<playerEv){addBattleLog(`${s.enemy.name} использовал «${es.name}», но вы уклонились.`,'info');}
   else{battleAnim('enemyAttack');let r=calcDamage(atk,s.player,es.power*attackMult);const variance=0.82+Math.random()*0.40;r.damage=Math.max(1,Math.round(r.damage*variance*(s.enemy.damageMultiplier||1)));if(s.defending){r.damage=Math.round(r.damage*.6);s.defending=false;$('#battlePlayerImage')?.closest('.battle-fighter')?.classList.remove('battle-shield');}applyBattleDamage(s.player,r.damage);battleFloatText($('#battlePlayerImage')?.closest('.battle-fighter'),`-${r.damage}`,r.crit?'crit':'damage');addBattleLog(`${s.enemy.name} использовал «${es.name}» и нанёс ${r.damage}${r.crit?' — КРИТ!':''} урона.`,'bad');const heal=Math.floor(r.damage*effectivePercentStat(s.enemy.vampirism,'vampirism')/100);if(heal){s.enemy.hp=clampBattle(s.enemy.hp+heal,s.enemy.maxHp);const efw=$('#battleEnemyImage')?.closest('.battle-fighter');battleFxBurst(efw,'heal');battleFloatText(efw,`+${heal}`,'heal');addBattleLog(`${s.enemy.name} восстановил ${heal} HP.`,'bad');}}
 } else {
   let atk={...s.enemy};atk.evasion=0;const playerEv=effectivePercentStat(Number(s.player.evasion||0)+Number(s.playerEvasionBuff||0),'evasion');if(Math.random()*100<playerEv){addBattleLog(`${s.enemy.name} атаковал, но вы уклонились.`,'info');}else{battleAnim('enemyAttack');let r=calcDamage(atk,s.player,attackMult);const variance=0.82+Math.random()*0.40;r.damage=Math.max(1,Math.round(r.damage*variance*(s.enemy.damageMultiplier||1)));if(s.defending){r.damage=Math.round(r.damage*.6);s.defending=false;$('#battlePlayerImage')?.closest('.battle-fighter')?.classList.remove('battle-shield');}applyBattleDamage(s.player,r.damage);battleFloatText($('#battlePlayerImage')?.closest('.battle-fighter'),`-${r.damage}`,r.crit?'crit':'damage');addBattleLog(`${s.enemy.name} нанёс вам ${r.damage}${r.crit?' — КРИТ!':''} урона.`,'bad');const heal=Math.floor(r.damage*effectivePercentStat(s.enemy.vampirism,'vampirism')/100);if(heal){s.enemy.hp=clampBattle(s.enemy.hp+heal,s.enemy.maxHp);const efw=$('#battleEnemyImage')?.closest('.battle-fighter');battleFxBurst(efw,'heal');battleFloatText(efw,`+${heal}`,'heal');addBattleLog(`${s.enemy.name} восстановил ${heal} HP.`,'bad');}}
 }
 if(s.enemy.enemySkillCd>0)s.enemy.enemySkillCd--;
 s.playerEvasionBuff=0;s.busy=false;if(s.player.hp<=0)return battleLose();renderBattle();}
function showBattleResult(result){
 const modal=$('#battleResultModal'); if(!modal)return;
 modal.classList.add('visible'); modal.setAttribute('aria-hidden','false');
 const icon=$('#battleResultIcon'); const title=$('#battleResultTitle'); const subtitle=$('#battleResultSubtitle'); const rewards=$('#battleResultRewards');
 if(result.win){
   icon.textContent='✓'; title.textContent='ПОБЕДА'; subtitle.textContent=`Вы победили: ${result.enemy}`;
   rewards.innerHTML=`<div class="result-reward-grid"><div class="result-reward"><span>Опыт</span><b>+${formatNumber(result.xp)} XP</b></div><div class="result-reward"><span>Дженни</span><b><img src="img/icon/jenny.png" alt="">+${formatNumber(result.jenny)}</b></div></div>${result.drop?`<div class="result-equipment"><span>Снаряжение</span><div class="result-item rank-${getRankClass(result.drop.rarity)}"><img src="${getEquipmentImage(result.drop)}" alt=""><div><b>${result.drop.name}</b><small>${result.drop.rarity} • ${result.drop.className} • Ур. ${formatNumber(result.drop.itemLevel||result.drop.level||1)}</small></div></div></div>`:'<div class="result-no-drop">Снаряжение не выпало</div>'}`;
 } else {
   icon.textContent='×'; title.textContent='ПОРАЖЕНИЕ'; subtitle.textContent=`Вы проиграли: ${result.enemy}`;
   rewards.innerHTML='<div class="result-no-drop">Опыт и Дженни за этот бой не начислены.</div>';
 }
}
function closeBattleResult(){const modal=$('#battleResultModal');if(!modal)return;modal.classList.remove('visible');modal.setAttribute('aria-hidden','true');closeBattle();}
function battleWin(){
 const s=battleState;if(!s||s.ended)return;s.ended=true;
 if(s.mode==='rank') return battleRankWin();
 if(s.mode==='boss') return battleBossWin();
 const z=HUNT_ZONES[selectedHuntZone],d=z.dungeons[selectedDungeonIndex],rewards=getDungeonRewardRanges(selectedHuntZone,selectedDungeonIndex),xp=randInt(rewards.xp[0],rewards.xp[1]),j=randInt(rewards.jenny[0],rewards.jenny[1]);
 const awardedXp=gainExperience(xp);const awardedJenny=creditJenny(j);
 let drop=null;
 if(Math.random()*100<getDungeonDropChance(selectedHuntZone,selectedDungeonIndex)){
   const playerLevel=Math.max(1,Number(characters[activeCharacter].level||1));
   const itemLevel=randInt(Math.max(1,playerLevel-1),Math.min(100,playerLevel+1));
   const artifactChance=ARTIFACT_DROP_CHANCE_BY_ZONE[selectedHuntZone]||0;
   // На 1-й зоне артефакты ещё не выпадают; начиная с 12+
   // они получают отдельный шанс внутри обычного дропа экипировки.
   if(artifactChance>0 && Math.random()*100<artifactChance){
     const artifactRarity=rollArtifactRarity(selectedHuntZone);
     drop=generateArtifactDrop(itemLevel,artifactRarity);
   }
   if(!drop){
     const rarity=rollDropRarity(selectedHuntZone,selectedDungeonIndex);
     const types=['weapon','armor','amulet','ring'];
     const dropClass=getDropClass();
     drop=generateEquipmentDrop(dropClass,types[randInt(0,3)],itemLevel,rarity);
   }
   if(drop){inventory.unshift(drop);inventory=inventory.slice(0,getInventoryCapacity());saveInventoryState();}
 }
 renderCurrencies();renderAll();renderBattle();
 showBattleResult({win:true,enemy:d.enemy,xp:awardedXp,jenny:awardedJenny,drop});
}
function battleLose(){const s=battleState;if(!s||s.ended)return;s.ended=true;if(s.mode==='boss')return battleBossLose();renderBattle();showBattleResult({win:false,enemy:s.enemy.name,xp:0,jenny:0,drop:null});}

function startDungeonBattle(){if(showExpeditionBattleBlock())return;if(selectedDungeonIndex===null)return;const z=HUNT_ZONES[selectedHuntZone],d=z.dungeons[selectedDungeonIndex];if(!isDungeonUnlocked(selectedHuntZone,selectedDungeonIndex))return;if(!spendHuntEnergy(HUNT_ENERGY_COST)){openEnergyModal();return;}closeHuntDetailModal();const enemy=enemyForDungeon(selectedHuntZone,selectedDungeonIndex);battleState={mode:'hunt',player:playerBattleStats(),enemy,skillCd:{},healCd:0,defendCd:0,defending:false,damageBuff:1,enemyDebuff:1,enemyDebuffTurns:0,playerEvasionBuff:0,enemyBleed:0,enemyBleedTurns:0,enemyMarked:false,nextAttackBonus:1,ended:false,busy:false,playerTurnReady:false};$('#battleDungeonName').textContent=d.name;$('#battleResultCloseBtn').textContent='Вернуться к охоте';$('#battleLog').innerHTML='';$('#battleScreen').classList.add('visible');$('#battleScreen').setAttribute('aria-hidden','false');$('#battleShell').style.backgroundImage=`url("img/dungeon/${z.level}+/dungeon_${selectedDungeonIndex+1}.jpg")`;addBattleLog(`Вы вошли в «${d.name}». Аура противника: ${formatNumber(enemy.aura)}.`,'info');beginBattleTurnFlow('Вы атакуете первым.',`${enemy.name} атакует первым.`);}
function closeBattle(){const mode=battleState?.mode;if(mode==='boss'&&battleState&&!battleState.ended)persistBossBattleProgress(true);battleState=null;$('#battleScreen').classList.remove('visible');$('#battleScreen').setAttribute('aria-hidden','true');if(mode==='rank')renderRank();else if(mode==='boss')renderBoss();else renderHunt();}
function setupHunt(){renderHunt();$('#battleCloseBtn')?.addEventListener('click',closeBattle);$('#battleResultCloseBtn')?.addEventListener('click',closeBattleResult);$('#battleResultModal')?.addEventListener('click',e=>{if(e.target.id==='battleResultModal')closeBattleResult();});$('#huntDetailModalClose')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeHuntDetailModal();});$('#huntDetailModal')?.addEventListener('click',e=>{if(e.target.id==='huntDetailModal')closeHuntDetailModal();});}
function setupNavigation(){
  const titles={hunter:"Хантер",hunt:"Охота",rank:"Ранг",chat:"Чаты",more:"Ещё"};
  const setTabBackground=tab=>{document.body.classList.remove("tab-hunter","tab-hunt","tab-rank","tab-chat","tab-more");document.body.classList.add(`tab-${tab}`);};
  setTabBackground("hunter");
  document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>{
    const tab=btn.dataset.tab;
    // До 15 уровня Ранг полностью неактивен: не меняем вкладку, фон или активную кнопку.
    if(tab==="rank" && !isRankUnlocked()) return;
    // Любой переход по нижнему бару закрывает отдельные экраны мира.
    $("#bossScreen")?.classList.remove("visible");
    $("#bossScreen")?.setAttribute("aria-hidden","true");
    $("#expeditionScreen")?.classList.remove("visible");
    $("#expeditionScreen")?.setAttribute("aria-hidden","true");
    closeEconomyScreens();
    document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));btn.classList.add("active");setTabBackground(tab);
    $("#inventoryScreen")?.classList.remove("visible");$("#skillsScreen")?.classList.remove("visible");$("#equipmentModal")?.classList.remove("visible");
    closeHuntDetailModal();closeSettings();inventoryMassMode=false;inventorySelected.clear();
    const hunt=tab==="hunt",more=tab==="more",rank=tab==="rank",chat=tab==="chat";
    $("#hunterPage").style.display=tab==="hunter"?"block":"none";
    $("#huntScreen").classList.toggle("visible",hunt);$("#huntScreen").setAttribute("aria-hidden",hunt?"false":"true");
    $("#rankScreen").classList.toggle("visible",rank);$("#rankScreen").setAttribute("aria-hidden",rank?"false":"true");
    $("#chatScreen").classList.toggle("visible",chat);$("#chatScreen").setAttribute("aria-hidden",chat?"false":"true");
    $("#moreScreen").classList.toggle("visible",more);$("#moreScreen").setAttribute("aria-hidden",more?"false":"true");
    $("#placeholderPage").classList.toggle("visible",!['hunter','hunt','rank','chat','more'].includes(tab));
    $("#placeholderTitle").textContent=titles[tab]||tab;$("#placeholderKicker").textContent=(titles[tab]||tab).toUpperCase();
    if(hunt)renderHunt();if(more)renderMorePage();if(rank)renderRank();if(chat)renderChat();
  }));
  $("#openSettingsBtn")?.addEventListener("click",openSettings);$("#settingsCloseBtn")?.addEventListener("click",closeSettings);$("#settingsModal")?.addEventListener("click",e=>{if(e.target.id==="settingsModal")closeSettings();});$("#changeNicknameBtn")?.addEventListener("click",changeNicknameFromSettings);$("#settingsCharacterToggle")?.addEventListener("click",()=>{const p=$("#settingsCharacterPicker");if(p)p.hidden=!p.hidden;});$("#settingsCharacterConfirm")?.addEventListener("click",changeCharacterFromSettings);
}

/* ===== update0.3 — Raid Bosses ===== */
const BOSS_STORAGE_KEY='hxh_boss_raid_v1';
const BOSS_ROTATION_MS=12*60*60*1000;
const BOSS_DEFS=[
 {id:'hisoka',name:'Хисока Мороу',level:15,area:'Арена Небесной Башни',desc:'Непредсказуемый фокусник превращает бой в игру нервов. Высокий крит и уклонение.',mechanic:'Банджи Гам',auraMult:2.10,hpMult:12,xp:1.0,jenny:1.0,artifact:'Карты фокусника'},
 {id:'uvogin',name:'Увогин',level:25,area:'Окраины Йоркнью',desc:'Чистая физическая мощь Призрачной труппы. Огромное здоровье и сокрушительные удары.',mechanic:'Big Bang Impact',auraMult:2.25,hpMult:15,xp:1.3,jenny:1.25,artifact:'Осколок ярости'},
 {id:'feitan',name:'Фейтан Портор',level:35,area:'Подземный квартал Йоркнью',desc:'Чем сильнее его ранят, тем опаснее становится ответная атака.',mechanic:'Pain Packer',auraMult:2.40,hpMult:16,xp:1.55,jenny:1.5,artifact:'Зонт Фейтана'},
 {id:'razor',name:'Рейзор',level:45,area:'Грид-Айленд',desc:'Мастер эмиссии с чудовищной мощью броска. Его тяжёлые атаки пробивают защиту.',mechanic:'14 дьяволов',auraMult:2.55,hpMult:18,xp:1.85,jenny:1.8,artifact:'Мяч Рейзора'},
 {id:'pitou',name:'Неферпиту',level:60,area:'Дворец Восточного Горто',desc:'Королевский страж с пугающей аурой, скоростью и способностью восстанавливаться.',mechanic:'Доктор Блайт',auraMult:2.75,hpMult:20,xp:2.2,jenny:2.15,artifact:'Кукла Питу'},
 {id:'youpi',name:'Ментутуюпи',level:70,area:'Дворец Короля',desc:'Его ярость постоянно нарастает. Затяжной бой становится всё опаснее.',mechanic:'Взрыв ярости',auraMult:2.95,hpMult:22,xp:2.55,jenny:2.5,artifact:'Ядро ярости'},
 {id:'pouf',name:'Шаяпуф',level:80,area:'Небо над дворцом',desc:'Коварный Королевский страж ослабляет противника и избегает прямых атак.',mechanic:'Духовное послание',auraMult:3.15,hpMult:23,xp:2.9,jenny:2.85,artifact:'Чешуя Поуфа'},
 {id:'meruem',name:'Меруэм',level:100,area:'Дворец Короля',desc:'Король химер. Вершина эволюции и финальная рейдовая цель. В долгом бою анализирует противника и становится сильнее.',mechanic:'Эволюция Короля',auraMult:3.35,hpMult:28,xp:3.8,jenny:3.7,artifact:'Аура Короля'}
];
function expectedPlayerAtLevel(level){
  const lv=Math.max(1,Math.min(100,Number(level)||1));
  const ids=Object.keys(BASE_PRIMARY_STATS),all=ids.map(id=>getLevelScaledBaseStats(id,lv));
  const avg={strength:all.reduce((s,x)=>s+x.strength,0)/all.length,health:all.reduce((s,x)=>s+x.health,0)/all.length,defense:all.reduce((s,x)=>s+x.defense,0)/all.length,mana:all.reduce((s,x)=>s+x.mana,0)/all.length};
  const rank=lv>=70?4:lv>=50?3:lv>=30?2:lv>=15?1:0,title=1+rank*.07;
  // Закладываем постепенный рост качества экипировки, но не подстраиваем врага под фактического игрока.
  const gear=1.07+Math.min(.33,lv*.0033);
  return {strength:avg.strength*title*gear,health:avg.health*title*gear,defense:avg.defense*title*(1+.20*Math.min(1,lv/100)),mana:avg.mana*title*(1+Math.min(.15,lv*.0015)),critChance:Math.min(24,4+lv*.14),critDamage:Math.min(72,18+lv*.42),evasion:Math.min(21,2+lv*.13),vampirism:Math.min(11,lv*.075)};
}
function expectedPlayerAuraAtLevel(level){return calculateCombatAura(expectedPlayerAtLevel(level));}
function bossTemplate(def){
  const base=expectedPlayerAtLevel(def.level),idx=Math.max(0,BOSS_DEFS.indexOf(def));
  const hpMult=[3.0,3.4,3.9,4.5,5.4,6.2,7.0,8.5][idx]||4;
  const offense=1.05+idx*.05, defense=.92+idx*.032;
  const best={strength:Math.round(base.strength*offense),health:Math.round(base.health*hpMult),defense:Math.round(base.defense*defense),mana:Math.round(base.mana*1.35),critChance:Math.min(32,10+idx*2.4),critDamage:Math.min(95,42+idx*6),evasion:Math.min(28,6+idx*2.3),vampirism:Math.min(10,2+idx*.9)};
  return {...best,aura:calculateCombatAura(best),offenseTargetAura:calculateCombatAura(base)*offense};
}
function getBossState(){try{return JSON.parse(localStorage.getItem(BOSS_STORAGE_KEY)||'null')}catch(e){return null}}
function saveBossState(v){if(v)localStorage.setItem(BOSS_STORAGE_KEY,JSON.stringify(v));else localStorage.removeItem(BOSS_STORAGE_KEY)}
function bossRotationId(){return Math.floor(Date.now()/BOSS_ROTATION_MS)}
function availableBossDefs(){const lv=Number(characters[activeCharacter]?.level||1);return BOSS_DEFS.filter(b=>lv>=b.level)}
function createBossState(){const available=availableBossDefs(),rid=bossRotationId();if(!available.length)return null;const def=available[randInt(0,available.length-1)],t=bossTemplate(def);const s={rotationId:rid,bossId:def.id,maxHp:t.health,hp:t.health,attempts:3,damage:0,claimed:false,balanceVersion:7,createdAt:Date.now()};saveBossState(s);return s}
function ensureBossState(){const rid=bossRotationId();let s=getBossState(),def=s&&BOSS_DEFS.find(b=>b.id===s.bossId);if(!s||s.rotationId!==rid||!def||s.balanceVersion!==7||Number(characters[activeCharacter]?.level||1)<def.level)s=createBossState();if(!s)return null;s.maxHp=Math.max(1,Number(s.maxHp)||1);s.hp=Math.max(0,Math.min(s.maxHp,Number(s.hp)));s.attempts=Math.max(0,Math.min(3,Number(s.attempts)));s.damage=Math.max(0,Number(s.damage)||0);saveBossState(s);return s}
function currentBossDef(){const s=ensureBossState();return (s&&BOSS_DEFS.find(b=>b.id===s.bossId))||BOSS_DEFS[0]}
function bossTimeLeft(){return BOSS_ROTATION_MS-(Date.now()%BOSS_ROTATION_MS)}
function formatBossTime(ms){const sec=Math.max(0,Math.floor(ms/1000)),h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function bossRewardCaps(def){
  const req=Math.max(1,xpRequiredForLevel(Math.min(99,def.level))), idx=Math.max(0,BOSS_DEFS.indexOf(def));
  return {xp:Math.round(req*(.13+idx*.012)),jenny:Math.round((260+Math.pow(def.level,1.58)*9)*(1+idx*.08))};
}
function renderBoss(){const screen=$('#bossScreen');if(!screen)return;const lv=Number(characters[activeCharacter]?.level||1),locked=lv<15,state=locked?null:ensureBossState(),def=state?(BOSS_DEFS.find(b=>b.id===state.bossId)||BOSS_DEFS[0]):BOSS_DEFS[0],t=bossTemplate(def);$('#bossLock')?.classList.toggle('hidden',!locked);const content=$('#bossContent');if(content)content.hidden=locked;if(locked)return;const pct=Math.max(0,Math.min(100,state.hp/state.maxHp*100));const caps=bossRewardCaps(def),xp=caps.xp,j=caps.jenny;content.innerHTML=`<article class="boss-hero" style="background-image:linear-gradient(90deg,rgba(4,5,7,.95) 0%,rgba(4,5,7,.64) 48%,rgba(4,5,7,.18) 100%),url('img/boss/bg/${def.id}.jpg')"><div class="boss-copy"><span class="section-kicker">ОСОБО ОПАСНАЯ ЦЕЛЬ • ${def.area}</span><h3>${def.name}</h3><p>${def.desc}</p><div class="boss-mechanic">Уникальная техника: <b>${def.mechanic}</b></div><div class="boss-hp"><div><b>HP ${formatNumber(Math.round(state.hp))} / ${formatNumber(Math.round(state.maxHp))}</b><span>${pct.toFixed(1)}%</span></div><i><em style="width:${pct}%"></em></i></div><div class="boss-meta"><span>✦ Аура <b>${formatNumber(t.aura)}</b></span><span>⚔ Попытки <b>${state.attempts}/3</b></span><span>◷ Смена через <b id="bossTimer">${formatBossTime(bossTimeLeft())}</b></span></div><div class="boss-rewards"><span>За рейд</span><b>до ${formatNumber(xp)} XP • ${formatNumber(j)} Дженни</b><small>Награда зависит от нанесённого урона. Убийство даёт максимальную награду и повышенный шанс снаряжения. Уникальный артефакт: ${def.artifact} (2,5%).</small></div><button class="boss-start" id="startBossBtn" ${state.attempts<=0||state.hp<=0?'disabled':''}>${state.hp<=0?'БОСС ПОБЕЖДЁН':state.attempts<=0?'ПОПЫТКИ ИСЧЕРПАНЫ':'ВСТУПИТЬ В БОЙ'}</button></div><img class="boss-png" src="img/boss/png/${def.id}.png" alt=""></article>`;$('#startBossBtn')?.addEventListener('click',startBossBattle);}
function openBoss(){if(Number(characters[activeCharacter]?.level||1)<15){}$('#moreScreen')?.classList.remove('visible');$('#moreScreen')?.setAttribute('aria-hidden','true');$('#bossScreen')?.classList.add('visible');$('#bossScreen')?.setAttribute('aria-hidden','false');renderBoss()}
function closeBoss(){$('#bossScreen')?.classList.remove('visible');$('#bossScreen')?.setAttribute('aria-hidden','true');$('#moreScreen')?.classList.add('visible');$('#moreScreen')?.setAttribute('aria-hidden','false')}
function startBossBattle(){if(showExpeditionBattleBlock())return;const state=ensureBossState();if(!state)return;const def=BOSS_DEFS.find(b=>b.id===state.bossId)||BOSS_DEFS[0];if(state.attempts<=0||state.hp<=0)return;const t=bossTemplate(def);state.attempts--;saveBossState(state);const enemy={name:def.name,level:def.level,maxHp:state.maxHp,hp:state.hp,maxMana:t.mana,mana:t.mana,strength:t.strength,defense:t.defense,critChance:t.critChance,critDamage:t.critDamage,evasion:t.evasion,vampirism:t.vampirism,image:`img/boss/png/${def.id}.png`,aura:t.aura,enemySkill:getEnemySkill(def.level+19,t.mana),enemySkillCd:0};battleState={mode:'boss',bossId:def.id,bossStartHp:state.hp,player:playerBattleStats(),enemy,skillCd:{},healCd:0,defendCd:0,defending:false,damageBuff:1,enemyDebuff:1,enemyDebuffTurns:0,playerEvasionBuff:0,enemyBleed:0,enemyBleedTurns:0,enemyMarked:false,nextAttackBonus:1,ended:false,busy:false,playerTurnReady:false};$('#battleDungeonName').textContent=`Рейд • ${def.name}`;$('#battleResultCloseBtn').textContent='Вернуться к боссу';$('#battleLog').innerHTML='';$('#battleShell').style.backgroundImage=`url("img/boss/bg/${def.id}.jpg")`;$('#battleScreen').classList.add('visible');$('#battleScreen').setAttribute('aria-hidden','false');addBattleLog(`Рейд начался. Осталось попыток: ${state.attempts}.`,'info');beginBattleTurnFlow('Вы начинаете рейдовую атаку.',`${def.name} действует первым.`)}
function persistBossBattleProgress(commitDamage=true){const s=battleState;if(!s||s.mode!=='boss')return ensureBossState();let state=getBossState();if(!state||state.rotationId!==bossRotationId()||state.bossId!==s.bossId){state={rotationId:bossRotationId(),bossId:s.bossId,maxHp:Math.max(1,Number(s.enemy.maxHp)||1),hp:Math.max(0,Number(s.enemy.hp)||0),attempts:Math.max(0,Number(state?.attempts??0)),damage:Math.max(0,Number(state?.damage)||0),claimed:false,createdAt:Date.now()}}const previousSavedHp=Math.max(0,Math.min(state.maxHp,Number(state.hp)||state.maxHp));const currentHp=Math.max(0,Math.min(state.maxHp,Math.round(Number(s.enemy.hp)||0)));const newlySaved=Math.max(0,previousSavedHp-currentHp);state.damage=Math.max(0,Number(state.damage)||0)+newlySaved;state.hp=currentHp;saveBossState(state);return state}
function bossBattleReward(win){
 const s=battleState,def=BOSS_DEFS.find(b=>b.id===s.bossId)||BOSS_DEFS[0],state=persistBossBattleProgress(true),dealt=Math.max(0,Math.round((s.bossStartHp||state.maxHp)-s.enemy.hp));
 const ratio=Math.min(1,dealt/state.maxHp),kill=state.hp<=0,caps=bossRewardCaps(def),rewardScale=kill?1:Math.max(.025,Math.min(.45,ratio*1.8));
 const xp=Math.max(1,Math.round(caps.xp*rewardScale)),j=Math.max(1,Math.round(caps.jenny*rewardScale));const awardedXp=gainExperience(xp);const awardedJenny=creditJenny(j);
 let drop=null;if(kill&&Math.random()<.025){drop=generateArtifactDrop(Math.max(1,Number(characters[activeCharacter].level||1)),'Мифический');if(drop){drop.name=def.artifact;drop.description=`Уникальный трофей рейдового босса ${def.name}.`;}}
 else if((kill&&Math.random()<.42)||Math.random()<ratio*.35){const rr=Math.random(),rarity=def.level>=80?(rr<.10?'Мифический':rr<.48?'Легендарный':'Редкий'):(rr<.28?'Легендарный':'Редкий');drop=generateEquipmentDrop(activeCharacter,['weapon','armor','amulet','ring'][randInt(0,3)],Math.max(1,Number(characters[activeCharacter].level||1)),rarity);}
 if(drop&&inventory.length<getInventoryCapacity()){inventory.unshift(drop);saveInventoryState()}renderCurrencies();renderAll();renderBoss();showBattleResult({win:true,enemy:def.name,xp:awardedXp,jenny:awardedJenny,drop});if(!kill){$('#battleResultTitle').textContent='ПОПЫТКА ЗАВЕРШЕНА';$('#battleResultIcon').textContent='⚔';}$('#battleResultSubtitle').textContent=kill?`${def.name} повержен. Рейд завершён.`:`Нанесено ${formatNumber(dealt)} урона. HP босса сохранено до следующей попытки.`;
}
function battleBossWin(){bossBattleReward(true)}
function battleBossLose(){bossBattleReward(false)}
function setupBoss(){$('#openBossBtn')?.addEventListener('click',openBoss);$('#bossBackBtn')?.addEventListener('click',closeBoss);setInterval(()=>{const el=$('#bossTimer');if(el)el.textContent=formatBossTime(bossTimeLeft())},1000)}

function initializeGame() {
  loadCharacterStates();
  const hadSavedGame = loadGameState();
  firstEntry = !hadSavedGame;
  pendingCharacter = activeCharacter;

  loadInventoryState();
  Object.keys(SKILLS).forEach(ensureSkillState);
  renderAll();
  renderCurrencies();
  setupNavigation();
  setupFirstEntry();
  setupSkills();
  setupInventory();
  setupHunt();
  setupChat();
  setupExpedition();
  setupBoss();
  setupEnergy();
  setupCommerce();

  // Если это старое сохранение, создаём единый стабильный сейв update0.6.
  if (hadSavedGame && !localStorage.getItem(SAVE_KEY)) saveGameState();
}

window.addEventListener("beforeunload", saveGameState);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveGameState();
});

/* ===== v4.15 — Expeditions ===== */
const EXPEDITION_STORAGE_KEY='hxh_expedition_v1';
const EXPEDITION_ROUTES=[
 {hours:1,name:'След по тропе экзаменаторов',area:'Окрестности Зебила',desc:'Короткое поручение Ассоциации: проверить старые маршруты экзамена и собрать сведения о необычной активности Нэн.',xp:1.0,jenny:1.0,drop:18},
 {hours:2,name:'Разведка у горы Кукуро',area:'Земли Золдик',desc:'Охотник обследует дороги у подножия Кукуро, где торговцы всё чаще пропадают вместе с редкими находками.',xp:2.15,jenny:2.1,drop:30},
 {hours:4,name:'Контракт Йоркнью',area:'Йоркнью-Сити',desc:'Задание среди подпольных аукционов и охотников за реликвиями. Риск выше, но и ценные трофеи встречаются чаще.',xp:4.7,jenny:4.6,drop:48},
 {hours:8,name:'Маршрут острова Жадности',area:'Граница Грид-Айленда',desc:'Долгая разведка территории, связанной с легендарной игрой охотников. Здесь особенно ценятся выдержка и контроль Нэн.',xp:10.2,jenny:10.0,drop:68},
 {hours:12,name:'След к Тёмному континенту',area:'Экспедиционный коридор',desc:'Самое долгое поручение: сбор данных для будущих экспедиций Ассоциации. Опасный маршрут с лучшими шансами на редкую находку.',xp:16.5,jenny:16.0,drop:84}
];
let selectedExpeditionIndex=0,expeditionTimerHandle=null;
function getExpeditionState(){try{return JSON.parse(localStorage.getItem(EXPEDITION_STORAGE_KEY)||'null')}catch(_){return null}}
function saveExpeditionState(s){if(s)localStorage.setItem(EXPEDITION_STORAGE_KEY,JSON.stringify(s));else localStorage.removeItem(EXPEDITION_STORAGE_KEY)}
function expeditionCharacterName(state=getExpeditionState()){return characters[state?.characterId||activeCharacter]?.name||characters[activeCharacter]?.name||'Охотник'}
function isExpeditionActive(){const s=getExpeditionState();return !!(s&&s.status==='active'&&Number(s.endAt)>Date.now())}
function expeditionBaseRewards(route,level){
  const lv=Math.max(10,Math.min(99,Number(level)||10)),req=Math.max(1,xpRequiredForLevel(lv));
  const hourFactor={1:.011,2:.024,4:.050,8:.105,12:.165}[route.hours]||.011;
  const center=req*hourFactor, jCenter=(120+Math.pow(lv,1.5)*7)*Math.pow(route.hours,.86);
  return {xp:[Math.round(center*.88),Math.round(center*1.12)],jenny:[Math.round(jCenter*.85),Math.round(jCenter*1.15)]};
}
function expeditionRarity(route){const h=route.hours,r=Math.random()*100;if(h>=12&&r<8)return'Мифический';if(h>=8&&r<4)return'Мифический';if(h>=4&&r<(h>=12?34:h>=8?27:18))return'Легендарный';if(h>=2&&r<(h>=12?75:h>=8?68:h>=4?58:43))return'Редкий';return'Обычный'}
function expeditionRewardPreview(route,level){const r=expeditionBaseRewards(route,level);return {xp:`${formatNumber(r.xp[0])}–${formatNumber(r.xp[1])} XP`,jenny:`${formatNumber(r.jenny[0])}–${formatNumber(r.jenny[1])}`,drop:`${route.drop}%`}}
function formatExpeditionTime(ms){const t=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function renderExpedition(){const screen=$('#expeditionScreen');if(!screen)return;const c=characters[activeCharacter],level=Number(c?.level||1),state=getExpeditionState();$('#expeditionLock')?.classList.toggle('hidden',level>=10||!!state);const content=$('#expeditionContent'),active=$('#expeditionActive');if(level<10&&!state){if(content)content.hidden=true;if(active)active.hidden=true;return;}if(state&&state.status==='active'){if(content)content.hidden=true;if(active){active.hidden=false;const route=EXPEDITION_ROUTES[state.routeIndex]||EXPEDITION_ROUTES[0];active.innerHTML=`<div class="expedition-active-art"><div><span class="section-kicker">${route.area}</span><h3>${escapeHtml(state.characterName||expeditionCharacterName(state))} в экспедиции</h3><p>${route.name}</p><div class="expedition-timer" id="expeditionTimer">${formatExpeditionTime(Number(state.endAt)-Date.now())}</div></div></div><div class="expedition-active-note">Во время экспедиции персонаж не может участвовать в боях. Можно закрыть игру — время продолжит идти.</div>`;}startExpeditionTimer();return;}if(state&&state.status==='ready'){if(content)content.hidden=true;if(active){active.hidden=false;active.innerHTML=`<div class="expedition-active-art"><div><span class="section-kicker">ЗАДАНИЕ ЗАВЕРШЕНО</span><h3>${escapeHtml(state.characterName||expeditionCharacterName(state))} вернулся</h3><p>Награды готовы к получению.</p><button class="expedition-start" id="expeditionCollectBtn" type="button">Посмотреть результат</button></div></div>`;$('#expeditionCollectBtn')?.addEventListener('click',showExpeditionResult);}return;}if(content)content.hidden=false;if(active)active.hidden=true;const routes=$('#expeditionRoutes');if(routes){routes.innerHTML=EXPEDITION_ROUTES.map((r,i)=>`<button class="expedition-route ${i===selectedExpeditionIndex?'active':''}" data-exp-route="${i}" type="button">${r.hours} ${r.hours===1?'час':r.hours<5?'часа':'часов'}</button>`).join('');routes.querySelectorAll('[data-exp-route]').forEach(b=>b.addEventListener('click',()=>{selectedExpeditionIndex=Number(b.dataset.expRoute);renderExpedition();}));}const route=EXPEDITION_ROUTES[selectedExpeditionIndex],pr=expeditionRewardPreview(route,level),detail=$('#expeditionDetail');if(detail){detail.innerHTML=`<div class="expedition-hero"><div class="expedition-hero-copy"><span class="expedition-duration">${route.hours} ${route.hours===1?'ЧАС':route.hours<5?'ЧАСА':'ЧАСОВ'}</span><span class="section-kicker">${route.area}</span><h3>${route.name}</h3><p>${route.desc}</p></div></div><div class="expedition-rewards"><div class="expedition-reward"><span>Опыт</span><b>${pr.xp}</b></div><div class="expedition-reward"><span>Дженни</span><b>${pr.jenny}</b></div><div class="expedition-reward"><span>Шанс снаряжения</span><b>${pr.drop}</b></div></div><button class="expedition-start" id="startExpeditionBtn" type="button">Начать экспедицию</button>`;$('#startExpeditionBtn')?.addEventListener('click',startExpedition);}}
function openExpedition(){const level=Number(characters[activeCharacter]?.level||1);$('#moreScreen')?.classList.remove('visible');$('#moreScreen')?.setAttribute('aria-hidden','true');$('#expeditionScreen')?.classList.add('visible');$('#expeditionScreen')?.setAttribute('aria-hidden','false');renderExpedition();if(level<10&&!getExpeditionState())return;}
function closeExpedition(){$('#expeditionScreen')?.classList.remove('visible');$('#expeditionScreen')?.setAttribute('aria-hidden','true');$('#moreScreen')?.classList.add('visible');$('#moreScreen')?.setAttribute('aria-hidden','false');}
function startExpedition(){const c=characters[activeCharacter],level=Number(c?.level||1);if(level<10)return;if(getExpeditionState())return;const route=EXPEDITION_ROUTES[selectedExpeditionIndex];const state={status:'active',routeIndex:selectedExpeditionIndex,hours:route.hours,characterId:activeCharacter,characterName:c.name,levelAtStart:level,startedAt:Date.now(),endAt:Date.now()+route.hours*60*60*1000};saveExpeditionState(state);renderExpedition();}
function finishExpeditionIfDue(){const state=getExpeditionState();if(!state||state.status!=='active'||Date.now()<Number(state.endAt))return false;const route=EXPEDITION_ROUTES[state.routeIndex]||EXPEDITION_ROUTES[0],ranges=expeditionBaseRewards(route,state.levelAtStart),xp=randInt(ranges.xp[0],ranges.xp[1]),jenny=randInt(ranges.jenny[0],ranges.jenny[1]);let drop=null;if(Math.random()*100<route.drop){const rarity=expeditionRarity(route),types=['weapon','armor','amulet','ring'],lvl=Math.max(1,Math.min(100,randInt(Math.max(1,state.levelAtStart-1),Math.min(100,state.levelAtStart+1))));drop=generateEquipmentDrop(state.characterId,types[randInt(0,3)],lvl,rarity);}state.status='ready';state.reward={xp,jenny,drop};saveExpeditionState(state);return true;}
function startExpeditionTimer(){clearInterval(expeditionTimerHandle);const tick=()=>{if(finishExpeditionIfDue()){clearInterval(expeditionTimerHandle);renderExpedition();return;}const s=getExpeditionState(),el=$('#expeditionTimer');if(el&&s)el.textContent=formatExpeditionTime(Number(s.endAt)-Date.now());};tick();expeditionTimerHandle=setInterval(tick,1000);}
function showExpeditionResult(){finishExpeditionIfDue();const s=getExpeditionState();if(!s||s.status!=='ready')return;const r=s.reward||{},box=$('#expeditionResultRewards');$('#expeditionResultText').textContent=`${s.characterName||expeditionCharacterName(s)} успешно завершил маршрут.`;if(box)box.innerHTML=`<div class="result-reward-grid"><div class="result-reward"><span>Опыт</span><b>+${formatNumber(r.xp||0)} XP</b></div><div class="result-reward"><span>Дженни</span><b>+${formatNumber(r.jenny||0)}</b></div></div>${r.drop?`<div class="expedition-result-item"><img src="${getEquipmentImage(r.drop)}" alt=""><div><b>${escapeHtml(r.drop.name)}</b><small>${escapeHtml(r.drop.rarity)} • ${r.drop.itemLevel||r.drop.level} ур.</small></div></div>`:'<div class="result-no-drop">Снаряжение в этой экспедиции не найдено.</div>'}`;$('#expeditionResultModal')?.classList.add('visible');$('#expeditionResultModal')?.setAttribute('aria-hidden','false');}
function collectExpeditionResult(){const s=getExpeditionState();if(!s||s.status!=='ready')return;const r=s.reward||{};gainExperience(Number(r.xp)||0);creditJenny(Number(r.jenny)||0);if(r.drop){if(inventory.length>=getInventoryCapacity()){$('#expeditionResultText').textContent='Инвентарь заполнен. Освободите место, чтобы забрать найденное снаряжение.';return;}inventory.unshift(r.drop);saveInventoryState();}saveExpeditionState(null);renderCurrencies();renderAll();$('#expeditionResultModal')?.classList.remove('visible');$('#expeditionResultModal')?.setAttribute('aria-hidden','true');renderExpedition();}
function showExpeditionBattleBlock(){finishExpeditionIfDue();const s=getExpeditionState();if(!s||s.status!=='active')return false;$('#expeditionBlockText').textContent=`${s.characterName||expeditionCharacterName(s)} в экспедиции. Дождитесь его возвращения.`;$('#expeditionBlockModal')?.classList.add('visible');$('#expeditionBlockModal')?.setAttribute('aria-hidden','false');return true;}
function setupExpedition(){finishExpeditionIfDue();$('#openExpeditionBtn')?.addEventListener('click',openExpedition);$('#expeditionBackBtn')?.addEventListener('click',closeExpedition);$('#expeditionResultClose')?.addEventListener('click',collectExpeditionResult);$('#expeditionBlockClose')?.addEventListener('click',()=>{$('#expeditionBlockModal')?.classList.remove('visible');$('#expeditionBlockModal')?.setAttribute('aria-hidden','true');});if(isExpeditionActive())startExpeditionTimer();}


/* ===== update0.4 — Hunt Energy ===== */
const HUNT_ENERGY_STORAGE_KEY='hxh_hunt_energy_v1';
const HUNT_ENERGY_BASE_MAX=100;
function getHuntEnergyMax(){return HUNT_ENERGY_BASE_MAX+(isPremiumActive()?50:0);}
const HUNT_ENERGY_COST=0;
const HUNT_ENERGY_REGEN_MS=3*60*1000;
let energyUiTimer=null;
function getHuntEnergyState(){
  const now=Date.now();let state=null;
  try{state=JSON.parse(localStorage.getItem(HUNT_ENERGY_STORAGE_KEY)||'null')}catch(_){state=null}
  if(!state||!Number.isFinite(Number(state.value))||!Number.isFinite(Number(state.lastTick))){state={value:getHuntEnergyMax(),lastTick:now}}
  state.value=Math.max(0,Math.min(getHuntEnergyMax(),Math.floor(Number(state.value))));state.lastTick=Number(state.lastTick)||now;
  if(state.value>=getHuntEnergyMax()){state.value=getHuntEnergyMax();state.lastTick=now}
  else if(now>state.lastTick){const gained=Math.floor((now-state.lastTick)/HUNT_ENERGY_REGEN_MS);if(gained>0){state.value=Math.min(getHuntEnergyMax(),state.value+gained);state.lastTick+=gained*HUNT_ENERGY_REGEN_MS;if(state.value>=getHuntEnergyMax())state.lastTick=now}}
  localStorage.setItem(HUNT_ENERGY_STORAGE_KEY,JSON.stringify(state));return state;
}
function saveHuntEnergyState(state){localStorage.setItem(HUNT_ENERGY_STORAGE_KEY,JSON.stringify(state))}
function spendHuntEnergy(cost=HUNT_ENERGY_COST){const state=getHuntEnergyState(),amount=Math.max(0,Math.floor(Number(cost)||0));if(state.value<amount)return false;const wasFull=state.value>=getHuntEnergyMax();state.value-=amount;if(wasFull)state.lastTick=Date.now();saveHuntEnergyState(state);renderEnergyCurrency();return true}
function huntEnergyFullMs(state=getHuntEnergyState()){if(state.value>=getHuntEnergyMax())return 0;const now=Date.now(),elapsed=Math.max(0,now-state.lastTick),untilNext=Math.max(1,HUNT_ENERGY_REGEN_MS-(elapsed%HUNT_ENERGY_REGEN_MS));return untilNext+Math.max(0,getHuntEnergyMax()-state.value-1)*HUNT_ENERGY_REGEN_MS}
function formatEnergyTime(ms){if(ms<=0)return'Полная';const sec=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h>0?`${h} ч ${String(m).padStart(2,'0')} мин ${String(s).padStart(2,'0')} сек`:`${m} мин ${String(s).padStart(2,'0')} сек`}
function renderEnergyCurrency(){const state=getHuntEnergyState(),value=$('#energyValue');if(value)value.textContent=`${state.value}/${getHuntEnergyMax()}`;const mv=$('#energyModalValue');if(mv)mv.textContent=`${state.value} / ${getHuntEnergyMax()}`;const fill=$('#energyProgressFill');if(fill)fill.style.width=`${state.value/getHuntEnergyMax()*100}%`;const time=$('#energyFullTime');if(time)time.textContent=formatEnergyTime(huntEnergyFullMs(state));}
function openEnergyModal(){$('#energyModal')?.classList.add('visible');$('#energyModal')?.setAttribute('aria-hidden','false');renderEnergyCurrency()}
function closeEnergyModal(){$('#energyModal')?.classList.remove('visible');$('#energyModal')?.setAttribute('aria-hidden','true')}
function setupEnergy(){renderEnergyCurrency();$('#energyCurrencyBtn')?.addEventListener('click',openEnergyModal);$('#energyModalClose')?.addEventListener('click',closeEnergyModal);$('#energyModal')?.addEventListener('click',e=>{if(e.target.id==='energyModal')closeEnergyModal()});clearInterval(energyUiTimer);energyUiTimer=setInterval(renderEnergyCurrency,1000)}


/* ===== update0.6 — Shop / Premium / Black Market ===== */
const STAR_PRODUCTS={
  nen_100:{title:'100 Камней Нэн',stars:49,gems:100},
  nen_260:{title:'260 Камней Нэн',stars:99,gems:260},
  nen_600:{title:'600 Камней Нэн',stars:199,gems:600},
  nen_1400:{title:'1 400 Камней Нэн',stars:399,gems:1400},
  nen_3200:{title:'3 200 Камней Нэн',stars:799,gems:3200},
  premium_30:{title:'Hunter Premium — 30 дней',stars:299,premiumDays:30}
};
const SHOP_ROTATION_MS=2*60*60*1000, SHOP_STORAGE_KEY='hxh_shop_stock_v1', PENDING_STAR_ORDER_KEY='hxh_pending_star_order_v1';
let shopTimerHandle=null,shopRenderedRotation=-1,selectedMarketItemId=null,marketTab='all',marketOnline=false,marketCache=[];
function closeEconomyScreens(){['shopScreen','marketScreen'].forEach(id=>{$(`#${id}`)?.classList.remove('visible');$(`#${id}`)?.setAttribute('aria-hidden','true');});$('#marketPickerModal')?.classList.remove('visible');}
function openShop(){closeEconomyScreens();$('#moreScreen')?.classList.remove('visible');$('#shopScreen')?.classList.add('visible');$('#shopScreen')?.setAttribute('aria-hidden','false');renderShop();const pending=localStorage.getItem(PENDING_STAR_ORDER_KEY);if(pending&&window.Telegram?.WebApp?.initData)claimStarsOrder(pending,true);}
function closeShop(){$('#shopScreen')?.classList.remove('visible');$('#shopScreen')?.setAttribute('aria-hidden','true');$('#moreScreen')?.classList.add('visible');}
function shopRotationId(){return Math.floor(Date.now()/SHOP_ROTATION_MS)}
function shopTimeLeft(){return SHOP_ROTATION_MS-(Date.now()%SHOP_ROTATION_MS)}
function formatShortTimer(ms){const t=Math.max(0,Math.floor(ms/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),sec=t%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
function shopRarityForLevel(lv){const r=Math.random()*100;if(lv>=80){if(r<4)return'Мифический';if(r<25)return'Легендарный';if(r<70)return'Редкий';return'Обычный';}if(lv>=50){if(r<2)return'Мифический';if(r<17)return'Легендарный';if(r<62)return'Редкий';return'Обычный';}if(lv>=20){if(r<8)return'Легендарный';if(r<48)return'Редкий';return'Обычный';}if(r<2)return'Легендарный';if(r<25)return'Редкий';return'Обычный';}
function getShopItemPrice(item){const lv=Math.max(1,Number(item.itemLevel||1)),base=80+Math.pow(lv,1.52)*7.5,m={Обычный:7,Редкий:12,Легендарный:22,Мифический:40}[item.rarity]||6;return Math.max(180,Math.round(base*m/10)*10);}
function createShopStock(){const lv=Math.max(1,Number(characters[activeCharacter]?.level||1)),classes=Object.keys(characters),types=['weapon','armor','amulet','ring'];const items=[];for(let i=0;i<6;i++){const cls=classes[randInt(0,classes.length-1)],type=types[randInt(0,types.length-1)],ilv=Math.max(1,Math.min(100,randInt(Math.max(1,lv-2),Math.min(100,lv+2)))),rarity=shopRarityForLevel(lv),item=generateEquipmentDrop(cls,type,ilv,rarity);if(item){item.shopId=`shop_${shopRotationId()}_${i}`;item.price=getShopItemPrice(item);items.push(item);}}const state={rotationId:shopRotationId(),level:lv,items,bought:[]};localStorage.setItem(SHOP_STORAGE_KEY,JSON.stringify(state));return state;}
function getShopStock(){let s=null;try{s=JSON.parse(localStorage.getItem(SHOP_STORAGE_KEY)||'null')}catch(_){s=null}if(!s||s.rotationId!==shopRotationId()||!Array.isArray(s.items))s=createShopStock();return s;}
function saveShopStock(st){localStorage.setItem(SHOP_STORAGE_KEY,JSON.stringify(st));}
function renderShop(){renderPremiumUi();const packs=$('#nenPackGrid');if(packs)packs.innerHTML=Object.entries(STAR_PRODUCTS).filter(([id])=>id.startsWith('nen_')).map(([id,p])=>`<button class="nen-pack" data-stars-product="${id}" type="button"><span><img src="img/icon/nen-gem.png" alt=""><b>${formatNumber(p.gems)}</b></span><strong>${p.stars} ⭐</strong></button>`).join('');document.querySelectorAll('[data-stars-product]').forEach(b=>b.addEventListener('click',()=>buyStarsProduct(b.dataset.starsProduct)));const st=getShopStock(),j=Number(localStorage.getItem('hxh_jenny')||0),grid=$('#shopEquipmentGrid');if(grid)grid.innerHTML=st.items.map(item=>{const sold=st.bought.includes(item.shopId),can=j>=item.price&&!sold&&inventory.length<getInventoryCapacity();return `<article class="shop-item rank-${getRankClass(item.rarity)}"><div class="shop-item-art"><img src="${getEquipmentImage(item)}" alt=""></div><div class="shop-item-copy"><span>${escapeHtml(item.rarity)} • ${escapeHtml(item.className)}</span><b>${escapeHtml(item.name)}</b><small>Ур. ${item.itemLevel} • ${formatEquipmentStats(item)}</small></div><button data-shop-buy="${item.shopId}" ${can?'':'disabled'}>${sold?'КУПЛЕНО':`<img src="img/icon/jenny.png" alt=""> ${formatNumber(item.price)}`}</button></article>`}).join('');grid?.querySelectorAll('[data-shop-buy]').forEach(b=>b.addEventListener('click',()=>buyShopItem(b.dataset.shopBuy)));const timer=$('#shopRotationTimer');if(timer)timer.textContent=formatShortTimer(shopTimeLeft());shopRenderedRotation=shopRotationId();}
function buyShopItem(id){const st=getShopStock(),item=st.items.find(x=>x.shopId===id),hint=$('#shopHint');if(!item||st.bought.includes(id))return;const cap=getInventoryCapacity();if(inventory.length>=cap){if(hint)hint.textContent=`Инвентарь заполнен (${cap}/${cap}).`;return;}const j=Number(localStorage.getItem('hxh_jenny')||0);if(j<item.price){if(hint)hint.textContent='Недостаточно Дженни.';return;}localStorage.setItem('hxh_jenny',String(j-item.price));const bought=cloneEquipment(item);delete bought.shopId;delete bought.price;inventory.unshift(bought);st.bought.push(id);saveShopStock(st);saveInventoryState();renderCurrencies();renderInventory();renderAll();renderShop();if(hint)hint.textContent=`Куплено: ${item.name}.`;}
async function buyStarsProduct(id){const p=STAR_PRODUCTS[id],hint=$('#shopHint');if(!p)return;const tg=window.Telegram?.WebApp;if(!tg||!tg.initData){if(hint)hint.textContent='Покупка за Telegram Stars доступна только внутри Telegram Mini App.';return;}try{if(hint)hint.textContent='Создаём счёт Telegram Stars…';const r=await fetch('backend/stars_invoice.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({initData:tg.initData,product:id})});const data=await r.json();if(!r.ok||!data.invoice_link)throw new Error(data.error||'invoice');localStorage.setItem(PENDING_STAR_ORDER_KEY,String(data.order_id));tg.openInvoice(data.invoice_link,async status=>{if(status!=='paid'){if(hint)hint.textContent=status==='cancelled'?'Покупка отменена.':'Оплата не завершена.';return;}if(hint)hint.textContent='Платёж подтверждён Telegram. Получаем покупку…';await claimStarsOrder(data.order_id);});}catch(e){if(hint)hint.textContent='Не удалось открыть оплату. Проверь backend и настройки Telegram-бота.';}}
async function claimStarsOrder(orderId,quiet=false){const tg=window.Telegram?.WebApp,hint=$('#shopHint');try{const r=await fetch('backend/stars_claim.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({initData:tg.initData,order_id:orderId})});const d=await r.json();if(!r.ok||!d.reward)throw new Error(d.error||'claim');const wallet=d.wallet||{};if(Number.isFinite(Number(wallet.gems_total))){const total=Math.max(0,Number(wallet.gems_total)||0),applied=Math.max(0,Number(localStorage.getItem('hxh_server_gems_applied_v1')||0)),delta=Math.max(0,total-applied);if(delta>0){const cur=Number(localStorage.getItem('hxh_nen_gems')||0);localStorage.setItem('hxh_nen_gems',String(cur+delta));}localStorage.setItem('hxh_server_gems_applied_v1',String(total));}else if(d.reward.gems&&d.first_claim){const cur=Number(localStorage.getItem('hxh_nen_gems')||0);localStorage.setItem('hxh_nen_gems',String(cur+Number(d.reward.gems)));}if(Number(wallet.premium_until)>0)syncServerPremiumUntil(Number(wallet.premium_until));else if(d.reward.premiumDays&&d.first_claim)grantPremiumDays(Number(d.reward.premiumDays));localStorage.removeItem(PENDING_STAR_ORDER_KEY);renderCurrencies();renderAll();renderShop();if(hint)hint.textContent='Покупка успешно начислена.';return true;}catch(e){if(!quiet&&hint)hint.textContent='Платёж оплачен, но подтверждение ещё обрабатывается. Магазин автоматически повторит проверку при следующем открытии.';return false;}}

const LOCAL_MARKET_KEY='hxh_black_market_local_v2';
function marketSellerId(){return `local:${nickname}`;}
function loadLocalMarket(){let x=null;try{x=JSON.parse(localStorage.getItem(LOCAL_MARKET_KEY)||'null')}catch(_){x=null}return x&&Array.isArray(x.listings)?x:{listings:[],demoEpoch:-1};}
function saveLocalMarket(x){localStorage.setItem(LOCAL_MARKET_KEY,JSON.stringify(x));}
function seedDemoMarket(state){const epoch=shopRotationId();if(state.demoEpoch===epoch)return state;state.listings=state.listings.filter(x=>!x.demo);const names=['Leorio_77','ZoldyckFan','Yorknew','NenHunter','Bisky','GreedPlayer','Exam_287'];const lv=Math.max(1,Number(characters[activeCharacter]?.level||1)),classes=Object.keys(characters),types=['weapon','armor','amulet','ring'];for(let i=0;i<7;i++){const rarity=shopRarityForLevel(lv),item=generateEquipmentDrop(classes[randInt(0,3)],types[randInt(0,3)],Math.max(1,Math.min(100,randInt(Math.max(1,lv-3),Math.min(100,lv+3)))),rarity);if(item)state.listings.push({id:`demo_${epoch}_${i}`,seller:names[i%names.length],sellerId:`demo:${i}`,item,price:Math.round(getShopItemPrice(item)*(0.82+Math.random()*.42)),status:'active',demo:true,createdAt:Date.now()-randInt(1,6500000)});}state.demoEpoch=epoch;saveLocalMarket(state);return state;}
function openMarket(){closeEconomyScreens();$('#moreScreen')?.classList.remove('visible');$('#marketScreen')?.classList.add('visible');$('#marketScreen')?.setAttribute('aria-hidden','false');selectedMarketItemId=null;renderMarketPickerSelection();refreshMarket();}
function closeMarket(){$('#marketScreen')?.classList.remove('visible');$('#marketScreen')?.setAttribute('aria-hidden','true');$('#moreScreen')?.classList.add('visible');}
function renderMarketPickerSelection(){const item=inventory.find(x=>x.id===selectedMarketItemId),el=$('#marketSelectedItemText');if(el)el.textContent=item?`${item.name} • ${item.rarity} • Ур. ${item.itemLevel||item.level}`:'Выбрать предмет из инвентаря';}
function openMarketPicker(){const modal=$('#marketPickerModal'),grid=$('#marketPickerGrid');if(!modal||!grid)return;grid.innerHTML=inventory.length?inventory.map(item=>`<button class="market-pick rank-${getRankClass(item.rarity)}" data-market-pick="${escapeHtml(item.id)}" type="button"><img src="${getEquipmentImage(item)}" alt=""><span><b>${escapeHtml(item.name)}</b><small>${item.rarity} • Ур. ${item.itemLevel||item.level}</small></span></button>`).join(''):'<div class="market-empty">В инвентаре нет предметов для продажи.</div>';grid.querySelectorAll('[data-market-pick]').forEach(b=>b.addEventListener('click',()=>{selectedMarketItemId=b.dataset.marketPick;renderMarketPickerSelection();closeMarketPicker();}));modal.classList.add('visible');modal.setAttribute('aria-hidden','false');}
function closeMarketPicker(){$('#marketPickerModal')?.classList.remove('visible');$('#marketPickerModal')?.setAttribute('aria-hidden','true');}
async function refreshMarket(){
 const mode=$('#marketMode');marketOnline=false;
 try{
   const tg=window.Telegram?.WebApp;
   if(tg?.initData&&location.protocol!=='file:'){
     try{
       const claim=await fetch('backend/market_api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'claim_proceeds',initData:tg.initData})});
       if(claim.ok){const cd=await claim.json();if(Number(cd.proceeds)>0){creditJenny(Number(cd.proceeds),{premium:false});renderCurrencies();const hint=$('#marketSellHint');if(hint)hint.textContent=`Получено ${formatNumber(cd.proceeds)} Дженни с проданных лотов (после комиссии).`;}}
     }catch(_){}
     const r=await fetch(`backend/market_api.php?action=list&initData=${encodeURIComponent(tg.initData)}`,{cache:'no-store'});
     if(r.ok){const d=await r.json();if(Array.isArray(d.listings)){if(Number(d.premium_until)>0)syncServerPremiumUntil(Number(d.premium_until));marketCache=d.listings;marketOnline=true;if(mode){mode.textContent='Онлайн';mode.classList.add('online');}renderMarket();return;}}
   }
 }catch(_){}
 const st=seedDemoMarket(loadLocalMarket());marketCache=st.listings;if(mode){mode.textContent='Локальный режим';mode.classList.remove('online');}renderMarket();
}
function isOwnMarketListing(x){return Boolean(x?.isMine)||x?.sellerId===marketSellerId();}
function renderMarket(){const mine=marketCache.filter(x=>isOwnMarketListing(x)&&x.status==='active').length,limit=getMarketLotLimit(),slots=$('#marketSlotsText');if(slots)slots.textContent=`${mine} / ${limit} лотов${isPremiumActive()?' • Premium':''}`;document.querySelectorAll('[data-market-tab]').forEach(b=>b.classList.toggle('active',b.dataset.marketTab===marketTab));const list=$('#marketList'),visible=marketCache.filter(x=>x.status==='active'&&(marketTab==='all'||isOwnMarketListing(x)));if(list)list.innerHTML=visible.length?visible.sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).map(l=>{const own=isOwnMarketListing(l),item=l.item||{},canBuy=!own&&Number(localStorage.getItem('hxh_jenny')||0)>=Number(l.price||0)&&inventory.length<getInventoryCapacity();return `<article class="market-lot rank-${getRankClass(item.rarity)}"><img src="${getEquipmentImage(item)}" alt=""><div class="market-lot-copy"><span>${escapeHtml(l.seller||'Охотник')} • ${escapeHtml(item.rarity||'Обычный')}</span><b>${escapeHtml(item.name||'Снаряжение')}</b><small>${escapeHtml(item.className||'')} • Ур. ${item.itemLevel||item.level||1}<br>${formatEquipmentStats(item)}</small></div><div class="market-lot-action"><strong><img src="img/icon/jenny.png" alt="">${formatNumber(l.price)}</strong>${own?`<button data-market-cancel="${l.id}" type="button">Снять</button>`:`<button data-market-buy="${l.id}" type="button" ${canBuy?'':'disabled'}>Купить</button>`}</div></article>`}).join(''):'<div class="market-empty">Активных лотов пока нет.</div>';list?.querySelectorAll('[data-market-buy]').forEach(b=>b.addEventListener('click',()=>buyMarketListing(b.dataset.marketBuy)));list?.querySelectorAll('[data-market-cancel]').forEach(b=>b.addEventListener('click',()=>cancelMarketListing(b.dataset.marketCancel)));}
async function createMarketListing(){const hint=$('#marketSellHint'),item=inventory.find(x=>x.id===selectedMarketItemId),price=Math.floor(Number($('#marketPriceInput')?.value||0));if(!item){if(hint)hint.textContent='Сначала выбери предмет.';return;}if(!Number.isFinite(price)||price<50){if(hint)hint.textContent='Минимальная цена — 50 Дженни.';return;}const mine=marketCache.filter(x=>isOwnMarketListing(x)&&x.status==='active').length;if(mine>=getMarketLotLimit()){if(hint)hint.textContent=`Достигнут лимит: ${getMarketLotLimit()} лотов.`;return;}if(marketOnline){try{const tg=window.Telegram?.WebApp,r=await fetch('backend/market_api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',initData:tg.initData,item,price,nickname})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'create');inventory=inventory.filter(x=>x.id!==item.id);saveInventoryState();selectedMarketItemId=null;renderMarketPickerSelection();await refreshMarket();if(hint)hint.textContent='Лот выставлен на общий рынок.';return;}catch(e){if(hint)hint.textContent='Сервер рынка недоступен. Переключаюсь в локальный режим.';marketOnline=false;}}
 const st=seedDemoMarket(loadLocalMarket());const listing={id:`local_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,seller:nickname,sellerId:marketSellerId(),item:cloneEquipment(item),price,status:'active',demo:false,createdAt:Date.now()};st.listings.push(listing);saveLocalMarket(st);inventory=inventory.filter(x=>x.id!==item.id);saveInventoryState();selectedMarketItemId=null;renderMarketPickerSelection();marketCache=st.listings;renderInventory();renderMarket();if(hint)hint.textContent='Лот выставлен. В локальном режиме его видишь только ты.';}
async function buyMarketListing(id){const hint=$('#marketSellHint'),listing=marketCache.find(x=>x.id===id&&x.status==='active');if(!listing||isOwnMarketListing(listing))return;const price=Number(listing.price||0),j=Number(localStorage.getItem('hxh_jenny')||0);if(j<price){if(hint)hint.textContent='Недостаточно Дженни.';return;}if(inventory.length>=getInventoryCapacity()){if(hint)hint.textContent='Инвентарь заполнен.';return;}if(marketOnline&&!String(id).startsWith('demo_')){try{const tg=window.Telegram?.WebApp,r=await fetch('backend/market_api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'buy',initData:tg.initData,listing_id:id})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'buy');localStorage.setItem('hxh_jenny',String(j-price));inventory.unshift(normalizeEquipment(d.item||listing.item));saveInventoryState();renderCurrencies();renderInventory();await refreshMarket();return;}catch(e){if(hint)hint.textContent='Покупка не подтверждена сервером.';return;}}
 localStorage.setItem('hxh_jenny',String(j-price));inventory.unshift(normalizeEquipment(cloneEquipment(listing.item)));const st=seedDemoMarket(loadLocalMarket()),hit=st.listings.find(x=>x.id===id);if(hit)hit.status='sold';saveLocalMarket(st);marketCache=st.listings;saveInventoryState();renderCurrencies();renderInventory();renderMarket();}
async function cancelMarketListing(id){const hint=$('#marketSellHint'),listing=marketCache.find(x=>x.id===id&&x.status==='active');if(!listing)return;if(inventory.length>=getInventoryCapacity()){if(hint)hint.textContent='Освободи место в инвентаре перед снятием лота.';return;}if(marketOnline){try{const tg=window.Telegram?.WebApp,r=await fetch('backend/market_api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'cancel',initData:tg.initData,listing_id:id})});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'cancel');inventory.unshift(normalizeEquipment(d.item||listing.item));saveInventoryState();renderInventory();await refreshMarket();return;}catch(e){if(hint)hint.textContent='Не удалось снять лот с сервера.';return;}}
 const st=seedDemoMarket(loadLocalMarket()),hit=st.listings.find(x=>x.id===id&&x.sellerId===marketSellerId());if(!hit)return;hit.status='cancelled';inventory.unshift(normalizeEquipment(hit.item));saveLocalMarket(st);marketCache=st.listings;saveInventoryState();renderInventory();renderMarket();}
function setupCommerce(){
 $('#openShopBtn')?.addEventListener('click',openShop);$('#shopBackBtn')?.addEventListener('click',closeShop);$('#buyPremiumBtn')?.addEventListener('click',()=>buyStarsProduct('premium_30'));
 $('#openBlackMarketBtn')?.addEventListener('click',openMarket);$('#marketBackBtn')?.addEventListener('click',closeMarket);$('#marketItemPickerBtn')?.addEventListener('click',openMarketPicker);$('#marketPickerClose')?.addEventListener('click',closeMarketPicker);$('#marketPickerModal')?.addEventListener('click',e=>{if(e.target.id==='marketPickerModal')closeMarketPicker();});$('#marketCreateListingBtn')?.addEventListener('click',createMarketListing);document.querySelectorAll('[data-market-tab]').forEach(b=>b.addEventListener('click',()=>{marketTab=b.dataset.marketTab;renderMarket();}));
 clearInterval(shopTimerHandle);shopTimerHandle=setInterval(()=>{if(!$('#shopScreen')?.classList.contains('visible'))return;const timer=$('#shopRotationTimer');if(timer)timer.textContent=formatShortTimer(shopTimeLeft());if(shopRenderedRotation!==shopRotationId())renderShop();},1000);renderPremiumUi();
}

initializeGame();
