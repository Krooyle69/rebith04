const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const ranks = ["F","E","D","C","B","A","AA","S","SS","SSS"];
const classData = {
  assassin:{name:"Ассасин",icon:"☠️",atk:32,def:16,hp:300,mana:120,skillCost:25,stats:{strength:14,health:20,defense:9,stamina:12,critDamage:30,critChance:10,agility:16,dodge:5},skill:"Смертельный удар",evo:[["Теневой убийца","Критический урон и шанс уклонения."],["Призрачный клинок","Высокая скорость атак и усиленный крит."]]},
  mage:{name:"Чародей",icon:"🔮",atk:36,def:14,hp:280,mana:150,skillCost:45,stats:{strength:15,health:20,defense:8,stamina:13,critDamage:32,critChance:8,agility:11,dodge:3},skill:"Разрыв маны",evo:[["Архимаг","Мощные заклинания и пробитие защиты."],["Повелитель Бездны","Тёмная магия с огромным уроном по площади."]]},
  paladin:{name:"Паладин",icon:"🛡️",atk:30,def:24,hp:340,mana:140,skillCost:30,stats:{strength:12,health:27,defense:14,stamina:16,critDamage:27,critChance:6,agility:8,dodge:2},skill:"Кара Света",evo:[["Святой страж","Щиты, защита и усиленное лечение."],["Рыцарь Апокалипсиса","Высокая защита превращается в силу атаки."]]},
  archer:{name:"Лучник",icon:"🏹",atk:34,def:17,hp:300,mana:125,skillCost:28,stats:{strength:13,health:21,defense:10,stamina:12,critDamage:30,critChance:9,agility:15,dodge:4},skill:"Залп стрел",evo:[["Охотник","Дальний критический урон и скорость."],["Небесный стрелок","Усиленные залпы и шанс двойной атаки."]]}
};

// 4 навыка на каждый класс: стартовый, 5, 10 и 20 уровень.
// Навык можно прочитать до открытия, но применить в бою — только после нужного уровня.
const classSkills = {
  assassin:[
    {name:"Теневой удар",mana:20,mult:1.65,level:1,desc:"Быстрая атака из тени с повышенным уроном."},
    {name:"Кровавая метка",mana:34,mult:2.15,level:5,desc:"Сильный удар по отмеченной цели."},
    {name:"Призрачный рывок",mana:50,mult:2.85,level:10,desc:"Молниеносная серия ударов с большим множителем урона."},
    {name:"Смертельная тень",mana:75,mult:4.10,level:20,desc:"Мощнейший приём ассасина с огромным разовым уроном."}
  ],
  mage:[
    {name:"Магический импульс",mana:30,mult:1.55,level:1,desc:"Сгусток магии, наносящий стабильный урон."},
    {name:"Огненный разрыв",mana:52,mult:2.30,level:5,desc:"Взрывная магическая атака с высоким уроном."},
    {name:"Грозовой поток",mana:78,mult:3.20,level:10,desc:"Мощный поток энергии, пробивающий защиту цели."},
    {name:"Падение Бездны",mana:115,mult:4.85,level:20,desc:"Предельное заклинание чародея с колоссальным уроном."}
  ],
  paladin:[
    {name:"Световой удар",mana:22,mult:1.45,level:1,desc:"Удар силой света, надёжный и экономный по мане."},
    {name:"Кара хранителя",mana:38,mult:2.00,level:5,desc:"Усиленная атака паладина, сочетающая силу и защиту."},
    {name:"Святое правосудие",mana:60,mult:2.75,level:10,desc:"Мощная кара против врага."},
    {name:"Небесный приговор",mana:90,mult:3.90,level:20,desc:"Высший приговор паладина, наносящий огромный урон."}
  ],
  archer:[
    {name:"Точный выстрел",mana:18,mult:1.60,level:1,desc:"Точный дальний удар с хорошим уроном за небольшую ману."},
    {name:"Шквал стрел",mana:32,mult:2.05,level:5,desc:"Серия быстрых попаданий по одной цели."},
    {name:"Пробивающий залп",mana:50,mult:2.90,level:10,desc:"Сильный залп с повышенным уроном."},
    {name:"Небесный град",mana:78,mult:4.20,level:20,desc:"Мощнейший залп лучника с огромным множителем."}
  ]
};

const dungeonTemplates = [
  ["Тёмный лес","🌲","F",1,120,400,12,24,200,350],
  ["Забытый склеп","💀","F",2,180,520,18,32,240,420],
  ["Башня испытаний","🏰","F",3,240,680,24,42,280,500],
  ["Пещеры Эха","🕳️","E",1,420,900,38,60,450,700],
  ["Гнездо пауков","🕷️","E",2,520,1100,45,72,500,800],
  ["Руины магов","🔮","E",3,650,1350,52,86,600,950],
  ["Чёрная шахта","⛏️","D",1,900,1800,75,115,900,1350],
  ["Проклятый храм","🏛️","D",2,1100,2200,88,130,1050,1550],
  ["Кладбище титанов","💀","D",3,1350,2700,100,150,1200,1800]
];


// Additional 3 dungeons for every higher rank.
const extraDungeonSets = {
  C:[["Лабиринт крови","🩸"],["Огненная крепость","🔥"],["Лес проклятых","🌲"]],
  B:[["Город мёртвых","🏚️"],["Пасть вулкана","🌋"],["Храм бездны","🗿"]],
  A:[["Небесная цитадель","🏯"],["Драконий некрополь","🐉"],["Зал титанов","⚔️"]],
  AA:[["Земля великанов","🗻"],["Сердце бездны","🕳️"],["Трон демона","😈"]],
  S:[["Небесный разлом","☁️"],["Башня вечности","🗼"],["Проклятие драконов","🐲"]],
  SS:[["Предел хаоса","🌀"],["Мир разрушения","💥"],["Архив древних","📚"]],
  SSS:[["Врата апокалипсиса","☄️"],["Божественный дворец","👑"],["Последняя бездна","🌌"]]
};
for(const [rank,names] of Object.entries(extraDungeonSets)){
  const ri=ranks.indexOf(rank), hpBase=Math.floor(3200*Math.pow(2.15,ri-3));
  names.forEach(([name,icon],slot)=>{
    const hpMin=Math.floor(hpBase*(1+slot*.18)), hpMax=Math.floor(hpMin*1.8);
    const atkMin=Math.floor(190*Math.pow(1.72,ri-3)+slot*25), atkMax=Math.floor(atkMin*1.45);
    const goldMin=Math.floor(2200*Math.pow(1.85,ri-3)+slot*350), goldMax=Math.floor(goldMin*1.5);
    dungeonTemplates.push([name,icon,rank,slot+1,hpMin,hpMax,atkMin,atkMax,goldMin,goldMax]);
  });
}

const SAVE_KEY="rebirth_begin_save_v51";
const BACKUP_SAVE_KEY="rebirth_begin_save_backup";
const SAVE_VERSION=52;
const OLD_SAVE_KEY="rebirth_begin_save";
let saveReady=false;
let hadExistingSave=false;
const defaultStats = () => ({strength:0,health:0,defense:0,stamina:0,critDamage:0,critChance:0,agility:0,dodge:0});
let state = {
  playerClass:null,evolution:null,classChangeCount:0,level:1,xp:0,coins:1500,shadowCoins:0,rank:0,energy:100,maxEnergy:100,lastEnergyTick:Date.now(),premium:false,premiumLastDaily:"",playerName:"Пробуждённый",
  hp:0,maxHp:0,atk:0,def:0,crit:0,critDamage:0,agility:0,dodge:0,stamina:0,maxMana:0,mana:null,
  statPoints:0,spentStats:defaultStats(),battle:null,selectedSkillId:0,healCooldown:0,inventory:[],equipped:{weapon:null,armor:null,amulet:null},bazaarLots:[],questCycleStart:0,questClaimed:false,quests:null,energyRestoreDay:"",energyRestoreCount:0,shards:0,arenaDay:"",arenaAttempts:0,arenaRating:1000,mail:[],farmKills:0,inventoryDismantleRarities:[],worldBossSpawn:0,worldBossHp:0,worldBossAttempts:0,worldBossDamage:0,worldBossHistory:[],chatMessages:[],chests:{common:0,rare:0,epic:0,legendary:0,mythic:0},storyQuestIndex:0,storyQuestClaimed:{},achievementStats:{dungeons:0,kills:0,goldEarned:0,lootFound:0,rareLoot:0,upgrades:0},achievementsClaimed:{},loginDay:"",loginStreak:0,dailyChestDay:"",dungeonStreak:0,titlesUnlocked:[],selectedTitle:"",notices:{inventory:false,equipment:false,quests:false,mail:false}
};
const $ = id => document.getElementById(id);
const SAVE_KEYS=[SAVE_KEY,BACKUP_SAVE_KEY,"rebirth_begin_save_v50","rebirth_begin_save_v49","rebirth_begin_save_v47","rebirth_begin_save_v46","rebirth_begin_save_v45","rebirth_begin_save_v40","rebirth_begin_save_v39","rebirth_begin_save_v38","rebirth_begin_save_v21",OLD_SAVE_KEY];
function safeClone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
function mergeSavedState(saved){
  if(!saved || typeof saved!=="object") return;
  const base=safeClone(state)||{};
  const merged={...base,...saved};
  const objectDefaults=["spentStats","equipped","notices","achievementStats","achievementsClaimed"];
  for(const key of objectDefaults){
    if(base[key] && typeof base[key]==="object" && !Array.isArray(base[key])) merged[key]={...base[key],...(saved[key]&&typeof saved[key]==="object"&&!Array.isArray(saved[key])?saved[key]:{})};
  }
  const arrayDefaults=["inventory","bazaarLots","mail","chatMessages","worldBossHistory","quests","titlesUnlocked"];
  for(const key of arrayDefaults){ if(!Array.isArray(merged[key])) merged[key]=Array.isArray(base[key])?base[key].slice():[]; }
  state=merged;
}
function storageSignature(obj){
  try{
    const raw=JSON.stringify(obj);
    let h=2166136261;
    for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619);}
    return (h>>>0).toString(16);
  }catch(e){return "";}
}
let idbPromise=null;
function openSaveDB(){
  if(idbPromise)return idbPromise;
  idbPromise=new Promise(resolve=>{
    try{
      if(!window.indexedDB){resolve(null);return;}
      const req=indexedDB.open("rebirth_begin_save_db",1);
      req.onupgradeneeded=()=>{try{req.result.createObjectStore("saves");}catch(_) {}};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
    }catch(_){resolve(null);}
  });
  return idbPromise;
}
async function writeIndexedSave(payload){
  try{
    const db=await openSaveDB(); if(!db)return;
    await new Promise(resolve=>{
      const tx=db.transaction("saves","readwrite");
      tx.objectStore("saves").put(payload,"current");
      tx.oncomplete=()=>resolve(); tx.onerror=()=>resolve(); tx.onabort=()=>resolve();
    });
  }catch(_){ }
}
async function readIndexedSave(){
  try{
    const db=await openSaveDB(); if(!db)return null;
    return await new Promise(resolve=>{
      const tx=db.transaction("saves","readonly");
      const req=tx.objectStore("saves").get("current");
      req.onsuccess=()=>resolve(req.result&&typeof req.result==="object"?req.result:null);
      req.onerror=()=>resolve(null);
    });
  }catch(_){return null;}
}
function parseStoredSave(raw){
  try{
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=="object")return null;
    if(parsed._saveSignature && parsed._saveSignature!==storageSignature({...parsed,_saveSignature:undefined})) return null;
    return parsed;
  }catch(_){return null;}
}
function save(){
  if(!saveReady) return false;
  try{
    const cloned=safeClone(state);
    if(!cloned || typeof cloned!=="object") throw new Error("state clone failed");
    const payload={...cloned,_saveVersion:SAVE_VERSION,_savedAt:Date.now()};
    state._savedAt=payload._savedAt;
    payload._saveSignature=storageSignature({...payload,_saveSignature:undefined});
    const json=JSON.stringify(payload);
    localStorage.setItem(SAVE_KEY,json);
    localStorage.setItem(BACKUP_SAVE_KEY,json);
    localStorage.setItem("rebirth_begin_save_v50_time",String(payload._savedAt));
    const ok=localStorage.getItem(SAVE_KEY)===json;
    // IndexedDB is an additional persistent backup for WebViews where localStorage can be flaky.
    writeIndexedSave(payload);
    return ok;
  }catch(e){
    try{
      const cloned=safeClone(state);
      if(cloned&&typeof cloned==="object"){
        const payload={...cloned,_saveVersion:SAVE_VERSION,_savedAt:Date.now()};
        state._savedAt=payload._savedAt;
        payload._saveSignature=storageSignature({...payload,_saveSignature:undefined});
        localStorage.setItem(BACKUP_SAVE_KEY,JSON.stringify(payload));
        writeIndexedSave(payload);
      }
    }catch(_){ }
    return false;
  }
}
function load(){
  try{
    // Current v50 save is authoritative. Backup is only a fallback if the primary is missing/corrupt.
    const current=parseStoredSave(localStorage.getItem(SAVE_KEY)||"");
    const backup=parseStoredSave(localStorage.getItem(BACKUP_SAVE_KEY)||"");
    let s=current||backup||null;
    if(!s){
      const legacyKeys=["rebirth_begin_save_v50","rebirth_begin_save_v49","rebirth_begin_save_v47","rebirth_begin_save_v46","rebirth_begin_save_v45","rebirth_begin_save_v40","rebirth_begin_save_v39","rebirth_begin_save_v38","rebirth_begin_save_v21",OLD_SAVE_KEY];
      const legacy=[];
      for(const key of legacyKeys){
        try{const parsed=parseStoredSave(localStorage.getItem(key)||"");if(parsed)legacy.push(parsed);}catch(_){}
      }
      legacy.sort((a,b)=>Number(b._savedAt||0)-Number(a._savedAt||0));
      s=legacy[0]||null;
    }
    hadExistingSave=!!s;
    if(s){
      const hadNewStats=s.statPoints!==undefined || s.spentStats!==undefined;
      mergeSavedState(s);
      if(!hadNewStats) state.statPoints=Math.max(0,(state.level-1)*3);
      migrateOldSave();
      migrateEquipmentSystem();
      ensureNotices();
      if(!Array.isArray(state.inventory)) state.inventory=[];
      if(!Array.isArray(state.mail)) state.mail=[];
      if(!Array.isArray(state.chatMessages)) state.chatMessages=[];
      if(!Array.isArray(state.worldBossHistory)) state.worldBossHistory=[];
      if(!Array.isArray(state.titlesUnlocked)) state.titlesUnlocked=[];
    }
  }catch(e){}
}
async function restoreNewestIndexedSave(){
  try{
    const indexed=await readIndexedSave();
    if(!indexed||typeof indexed!=="object")return false;
    const indexedTime=Number(indexed._savedAt||0);
    const localTime=Number(state._savedAt||0);
    if(indexedTime<=localTime)return false;
    const hadNewStats=indexed.statPoints!==undefined || indexed.spentStats!==undefined;
    mergeSavedState(indexed);
    hadExistingSave=true;
    if(!hadNewStats) state.statPoints=Math.max(0,(state.level-1)*3);
    migrateOldSave(); migrateEquipmentSystem(); ensureNotices(); ensureCollections();
    return true;
  }catch(_){return false;}
}

function ensureAchievements(){
  state.achievementStats={dungeons:0,kills:0,goldEarned:0,lootFound:0,rareLoot:0,upgrades:0,...(state.achievementStats||{})};
  if(!state.achievementsClaimed||typeof state.achievementsClaimed!=="object") state.achievementsClaimed={};
  if(!state.loginDay) state.loginDay="";
  if(!Number.isFinite(state.loginStreak)) state.loginStreak=0;
  if(typeof state.dailyChestDay!=="string") state.dailyChestDay="";
}
function touchDailyStreak(){
  ensureAchievements();
  const today=new Date().toISOString().slice(0,10);
  if(state.loginDay===today)return;
  const prev=new Date(); prev.setDate(prev.getDate()-1);
  const yesterday=prev.toISOString().slice(0,10);
  state.loginStreak=state.loginDay===yesterday?state.loginStreak+1:1;
  state.loginDay=today;
}
const ACHIEVEMENTS=[
 {id:"awakening",icon:"🌅",name:"Первое пробуждение",desc:"Выбери класс персонажа",reward:{gold:500,shadow:5},ok:()=>!!state.playerClass},
 {id:"firstDungeon",icon:"⚔️",name:"Первый шаг",desc:"Пройди первое подземелье",reward:{gold:1000,shadow:5},ok:()=>state.achievementStats.dungeons>=1},
 {id:"monsterHunter",icon:"👹",name:"Охотник",desc:"Победи 25 монстров",reward:{gold:3000,shadow:15},ok:()=>state.achievementStats.kills>=25},
 {id:"treasure",icon:"💰",name:"Кладоискатель",desc:"Заработай 10 000 золота",reward:{gold:2000,shadow:20},ok:()=>state.achievementStats.goldEarned>=10000},
 {id:"collector",icon:"🎒",name:"Коллекционер",desc:"Получи 20 предметов",reward:{gold:5000,shadow:25},ok:()=>state.achievementStats.lootFound>=20},
 {id:"rareHunter",icon:"💎",name:"Охота за редкостями",desc:"Получи 3 предмета редкости Эпическое или выше",reward:{gold:7500,shadow:35},ok:()=>state.achievementStats.rareLoot>=3},
 {id:"forge",icon:"🔨",name:"Кузнец",desc:"Улучши снаряжение 10 раз",reward:{gold:6000,shadow:30},ok:()=>state.achievementStats.upgrades>=10},
 {id:"level10",icon:"📈",name:"Пробуждённый",desc:"Достигни 10 уровня",reward:{gold:5000,shadow:25},ok:()=>state.level>=10},
 {id:"rankC",icon:"🏆",name:"Сила ранга",desc:"Достигни ранга C",reward:{gold:10000,shadow:40},ok:()=>state.rank>=3},
 {id:"worldDamage",icon:"👑",name:"Удар по титану",desc:"Сними за одну попытку 20% HP мирового босса",reward:{gold:12000,shadow:50},ok:()=>Number(state.worldBossHistory?.some(x=>x.pct>=.2))===true},
 {id:"streak3",icon:"🔥",name:"Не останавливайся",desc:"Зайди в игру 3 дня подряд",reward:{gold:3000,shadow:20},ok:()=>state.loginStreak>=3},
 {id:"streak7",icon:"🌟",name:"Верность пути",desc:"Зайди в игру 7 дней подряд",reward:{gold:15000,shadow:75},ok:()=>state.loginStreak>=7},
 {id:"dungeonMaster",icon:"🏰",name:"Мастер подземелий",desc:"Пройди 10 подземелий",reward:{gold:12000,shadow:50},ok:()=>state.achievementStats.dungeons>=10},
 {id:"forgeMaster",icon:"⚒️",name:"Мастер кузни",desc:"Улучши снаряжение 25 раз",reward:{gold:15000,shadow:60},ok:()=>state.achievementStats.upgrades>=25}
];
function checkAchievements(){
  ensureAchievements();
  let changed=false;
  for(const a of ACHIEVEMENTS){
    if(state.achievementsClaimed[a.id]||!a.ok())continue;
    state.achievementsClaimed[a.id]=Date.now();
    state.coins+=a.reward.gold||0; state.shadowCoins+=a.reward.shadow||0;
    state.mail=Array.isArray(state.mail)?state.mail:[];
    state.mail.push({id:"ach_"+a.id+"_"+Date.now(),from:"Достижения",text:`Получена награда за достижение «${a.name}»: ${a.reward.gold.toLocaleString("ru-RU")} золота · ${a.reward.shadow} 🌑.`,time:Date.now(),read:false,type:"system"});
    state.notices.mail=true; changed=true;
  }
  if(changed)save();
  return changed;
}
function syncAchievementStats(){
  ensureAchievements();
  // Восстанавливаем прогресс для старых сохранений, если игрок уже прокачивал предметы.
  const upgradeLevels=(state.inventory||[]).reduce((n,x)=>n+(Number(x.upgradeLevel)||0),0) + Object.values(state.equipped||{}).reduce((n,x)=>n+(Number(x?.upgradeLevel)||0),0);
  if(upgradeLevels>state.achievementStats.upgrades) state.achievementStats.upgrades=upgradeLevels;
  // Старые сохранения могли не иметь счётчика подземелий. Любой уже заработанный XP/уровень
  // после создания персонажа означает, что игрок начал прохождение контента.
  if(state.achievementStats.dungeons<1 && (state.level>1 || state.rank>0)) state.achievementStats.dungeons=1;
  checkAchievements();
}

function updateTitles(){
  const before=JSON.stringify(state.titlesUnlocked||[]);
  const unlocked=new Set(Array.isArray(state.titlesUnlocked)?state.titlesUnlocked:[]);
  if(state.level>=5) unlocked.add("Новичок");
  if(state.level>=10) unlocked.add("Пробуждённый");
  if(state.rank>=3) unlocked.add("Ветеран");
  if((state.achievementStats?.upgrades||0)>=10) unlocked.add("Кузнец");
  if((state.achievementStats?.dungeons||0)>=10) unlocked.add("Покоритель подземелий");
  if((state.dungeonStreak||0)>=5) unlocked.add("Без остановки");
  state.titlesUnlocked=[...unlocked];
  if(!state.selectedTitle && state.titlesUnlocked.length) state.selectedTitle=state.titlesUnlocked[0];
  if(before!==JSON.stringify(state.titlesUnlocked||[])) save();
}
function ensureChat(){
  if(!Array.isArray(state.chatMessages)) state.chatMessages=[];
  if(state.chatMessages.length===0){
    state.chatMessages=[
      {id:'system_welcome',name:'Система',text:'Добро пожаловать в общий чат. Сейчас он работает локально — позже сюда подключатся реальные игроки.',time:Date.now(),system:true},
      {id:'system_hint',name:'Система',text:'Будь уважителен к другим игрокам. Не отправляй личные данные.',time:Date.now()+1,system:true}
    ];
  }
}
function renderChat(){
  ensureChat();
  const box=$("chatMessages"); if(!box)return;
  box.innerHTML=state.chatMessages.slice(-80).map(m=>{
    const cls=m.system?'chat-message system':'chat-message';
    const time=new Date(m.time).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    return `<div class="${cls}"><div class="chat-meta"><b>${escapeHtml(m.name)}</b><span>${time}</span></div><div class="chat-text">${escapeHtml(m.text)}</div></div>`;
  }).join('');
  box.scrollTop=box.scrollHeight;
}
function sendChatMessage(text){
  const clean=String(text||'').trim().slice(0,180);
  if(!clean)return;
  ensureChat();
  state.chatMessages.push({id:'msg_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),name:state.playerName||'Пробуждённый',text:clean,time:Date.now(),system:false});
  if(state.chatMessages.length>120) state.chatMessages=state.chatMessages.slice(-120);
  save(); renderChat();
}


const TITLE_BONUSES={
  "Новичок":{health:50,desc:"+50 к максимальному HP"},
  "Пробуждённый":{atk:5,desc:"+5 к атаке"},
  "Ветеран":{def:8,desc:"+8 к защите"},
  "Кузнец":{critDamage:3,desc:"+3% к критическому урону"},
  "Покоритель подземелий":{health:120,desc:"+120 к максимальному HP"},
  "Без остановки":{dodge:2,desc:"+2% к уклонению"}
};
function getTitleBonusStats(){
  const b={atk:0,health:0,def:0,critDamage:0,dodge:0};
  const x=TITLE_BONUSES[state.selectedTitle];
  if(x) Object.keys(b).forEach(k=>b[k]+=Number(x[k]||0));
  return b;
}
function ensureChests(){
  const base={common:0,rare:0,epic:0,legendary:0,mythic:0};
  state.chests={...base,...(state.chests&&typeof state.chests==="object"?state.chests:{})};
  Object.keys(base).forEach(k=>state.chests[k]=Math.max(0,Math.floor(Number(state.chests[k])||0)));
}
const CHEST_DATA={
  common:{name:"Обычный сундук",icon:"chest",gold:[500,1500],shadow:[0,2],shards:[2,6],loot:.35},
  rare:{name:"Редкий сундук",icon:"chest_rare",gold:[1200,3000],shadow:[1,4],shards:[5,12],loot:.55},
  epic:{name:"Эпический сундук",icon:"chest_epic",gold:[2500,6000],shadow:[3,7],shards:[10,25],loot:.70},
  legendary:{name:"Легендарный сундук",icon:"chest_legendary",gold:[5000,12000],shadow:[6,15],shards:[20,50],loot:.85},
  mythic:{name:"Мифический сундук",icon:"chest_mythic",gold:[10000,25000],shadow:[12,30],shards:[40,90],loot:.95}
};
function chestTierForRank(rank){
  // Любой сундук может выпасть из любого подземелья. Ранг влияет только на содержимое сундука, а не на его тип.
  const roll=Math.random();
  if(roll<0.05)return"mythic";
  if(roll<0.15)return"legendary";
  if(roll<0.30)return"epic";
  if(roll<0.55)return"rare";
  return"common";
}
function grantDungeonChest(rank=state.rank){ensureChests();const tier=chestTierForRank(rank);state.chests[tier]++;return tier;}
function chestIcon(tier,cls="chest-img"){const file=CHEST_DATA[tier]?.icon||"chest";return `<img class="${cls}" src="img/icons/${file}.png" alt="">`;}
function openChest(tier){
  ensureChests();const data=CHEST_DATA[tier];
  if(!data||state.chests[tier]<=0){modal("СУНДУКИ","Такого сундука сейчас нет.");return;}
  state.chests[tier]--;
  const gold=rand(data.gold[0],data.gold[1]); const shadow=rand(data.shadow[0],data.shadow[1]); const shards=rand(data.shards[0],data.shards[1]);
  state.coins+=gold; state.shadowCoins+=shadow; state.shards+=shards;
  const rewards=[`🪙 ${gold.toLocaleString("ru-RU")} золота`,`🌑 ${shadow} теневых монет`,`🔹 ${shards} осколков`];
  let loot=null;
  if(Math.random()<data.loot){loot=makeLoot();state.inventory.push(loot);state.achievementStats.lootFound++;if(["Эпическое","Легендарное","Реликтовое","Мифическое","Адское","Божественное"].includes(loot.rarity))state.achievementStats.rareLoot++;ensureNotices();state.notices.inventory=true;rewards.push(`💎 ${loot.name} · ${loot.rarity}`);}
  save();render();openSubscreen("chests");modal(data.name,rewards.join(" · "));
}
function renderChests(){
  ensureChests();
  const cards=Object.entries(CHEST_DATA).map(([tier,d])=>`<div class="chest-card chest-${tier}">${chestIcon(tier)}<div class="chest-info"><b>${d.name}</b><small>В наличии: ${state.chests[tier]}</small><span>Золото · осколки · шанс добычи</span></div><button class="primary-btn" onclick="openChest('${tier}')" ${state.chests[tier]>0?"":"disabled"}>ОТКРЫТЬ</button></div>`).join("");
  const total=Object.values(state.chests).reduce((a,b)=>a+b,0);
  return `<div class="chests-panel"><div class="chests-hero"><div>${chestIcon("mythic","chest-hero-img")}</div><div><b>ХРАНИЛИЩЕ СУНДУКОВ</b><small>Всего накоплено: ${total}. Сундук выдаётся за успешное прохождение подземелья.</small></div></div><div class="chest-list">${cards}</div></div>`;
}
const STORY_QUESTS=[
  {id:"awakening",title:"Пробуждение",desc:"Выбери свой класс и сделай первый шаг по пути перерождения.",icon:"story_quests",goal:"Выбери класс",check:()=>!!state.playerClass,reward:{gold:1000,shadow:5,xp:2500}},
  {id:"first_dungeon",title:"Первый след",desc:"Пройди первое подземелье и докажи, что ты готов идти дальше.",icon:"story_quests",goal:"Подземелья: 1",check:()=>state.achievementStats.dungeons>=1,reward:{gold:2000,shadow:8,xp:4000}},
  {id:"hunter",title:"След охотника",desc:"Победи 10 монстров и найди источник странной силы.",icon:"monster",goal:"Победы: 10",check:()=>state.achievementStats.kills>=10,reward:{gold:3500,shadow:10,xp:6000}},
  {id:"rank_d",title:"За пределами F",desc:"Получи ранг D. Первый настоящий барьер системы будет сломан.",icon:"rating",goal:"Ранг D",check:()=>state.rank>=2,reward:{gold:5000,shadow:15,xp:8000}},
  {id:"level10",title:"Пробуждённая сила",desc:"Достигни 10 уровня и почувствуй, как система раскрывает новые возможности.",icon:"skill",goal:"Уровень 10",check:()=>state.level>=10,reward:{gold:7000,shadow:20,xp:10000}},
  {id:"rare",title:"След редкости",desc:"Получи три редких сокровища Эпического ранга или выше.",icon:"chest_epic",goal:"Редкий лут: 3",check:()=>state.achievementStats.rareLoot>=3,reward:{gold:10000,shadow:25,xp:14000}},
  {id:"master",title:"Покоритель",desc:"Пройди 20 подземелий. Система начинает замечать твоё имя.",icon:"dungeons",goal:"Подземелья: 20",check:()=>state.achievementStats.dungeons>=20,reward:{gold:15000,shadow:35,xp:18000}},
  {id:"rank_a",title:"Путь к вершине",desc:"Получи ранг A и открой следующую главу истории.",icon:"titles",goal:"Ранг A",check:()=>state.rank>=5,reward:{gold:25000,shadow:50,xp:25000}}
];
function ensureStoryQuests(){
  if(!Number.isFinite(state.storyQuestIndex))state.storyQuestIndex=0;
  if(!state.storyQuestClaimed||typeof state.storyQuestClaimed!=="object")state.storyQuestClaimed={};
  state.storyQuestIndex=Math.max(0,Math.min(STORY_QUESTS.length,Math.floor(state.storyQuestIndex)));
}
function storyQuestDone(q){return !!q?.check?.();}
function claimStoryQuest(){
  ensureStoryQuests();const q=STORY_QUESTS[state.storyQuestIndex];
  if(!q){modal("СЮЖЕТ","Все сюжетные главы завершены. Продолжение будет добавлено в следующем обновлении.");return;}
  if(!storyQuestDone(q)){modal("СЮЖЕТНЫЙ КВЕСТ",`Условие ещё не выполнено:\n${q.goal}`);return;}
  if(state.storyQuestClaimed[q.id]){state.storyQuestIndex++;save();render();openSubscreen("storyQuests");return;}
  state.storyQuestClaimed[q.id]=true;state.coins+=q.reward.gold;state.shadowCoins+=q.reward.shadow;addXP(q.reward.xp);state.storyQuestIndex++;save();render();openSubscreen("storyQuests");
  modal("ГЛАВА ПРОЙДЕНА",`«${q.title}»\n\nНаграда: ${q.reward.gold.toLocaleString("ru-RU")} золота · ${q.reward.shadow} 🌑 · ${q.reward.xp.toLocaleString("ru-RU")} XP.`);
}
function renderStoryQuests(){
  ensureStoryQuests();
  const current=STORY_QUESTS[state.storyQuestIndex];
  const doneCount=Object.values(state.storyQuestClaimed).filter(Boolean).length;
  const timeline=STORY_QUESTS.map((q,i)=>{const completed=!!state.storyQuestClaimed[q.id],active=i===state.storyQuestIndex;return `<div class="story-step ${completed?"done":""} ${active?"active":""}"><span>${completed?"✓":i+1}</span><div><b>${escapeHtml(q.title)}</b><small>${escapeHtml(q.goal)}</small></div></div>`}).join("");
  if(!current)return `<div class="story-panel"><div class="story-complete"><img src="img/icons/story_quests.png" alt=""><h2>ГЛАВА ЗАВЕРШЕНА</h2><p>Все доступные сюжетные задания пройдены. Ты дошёл до конца текущей главы.</p></div><div class="story-timeline">${timeline}</div></div>`;
  const ready=storyQuestDone(current);
  return `<div class="story-panel"><div class="story-hero"><img src="img/icons/${current.icon}.png" alt=""><div><small>ГЛАВА ${state.storyQuestIndex+1} / ${STORY_QUESTS.length}</small><h2>${escapeHtml(current.title)}</h2><p>${escapeHtml(current.desc)}</p></div></div><div class="story-objective"><span>ЦЕЛЬ</span><b>${escapeHtml(current.goal)}</b><em>${ready?"✓ ВЫПОЛНЕНО":"В ПРОЦЕССЕ"}</em></div><div class="story-reward"><span>НАГРАДА</span><b>🪙 ${current.reward.gold.toLocaleString("ru-RU")} · 🌑 ${current.reward.shadow} · ✨ ${current.reward.xp.toLocaleString("ru-RU")} XP</b></div><button class="primary-btn story-claim" onclick="claimStoryQuest()" ${ready?"":"disabled"}>${ready?"ЗАБРАТЬ НАГРАДУ":"ПРОДОЛЖИТЬ ПУТЬ"}</button><div class="story-timeline">${timeline}</div><div class="story-progress">Пройдено: ${doneCount} / ${STORY_QUESTS.length}</div></div>`;
}
function renderTitles(){
  updateTitles();
  const names=state.titlesUnlocked||[];
  return `<div class="titles-panel"><div class="inventory-head"><div><b>🏷️ ТИТУЛЫ</b><small>Каждый активный титул даёт постоянный бонус персонажу.</small></div><span>${names.length} открыто</span></div><div class="title-grid">${names.length?names.map(t=>{const bonus=TITLE_BONUSES[t];return `<button class="title-card ${state.selectedTitle===t?'selected':''}" onclick="selectTitle('${t.replaceAll("'","\\'")}')"><div class="title-card-top"><span>${state.selectedTitle===t?'✓':''}</span><b>${escapeHtml(t)}</b></div><small>${escapeHtml(bonus?.desc||'Без бонуса')}</small></button>`}).join(''):`<div class="inventory-empty"><div>🏷️</div><p>Новые титулы откроются по мере развития.</p></div>`}</div></div>`;
}
function selectTitle(title){if(!(state.titlesUnlocked||[]).includes(title))return;state.selectedTitle=title;save();render();openSubscreen("titles");}
function renderAchievements(){
  ensureAchievements(); touchDailyStreak();
  const unlocked=ACHIEVEMENTS.filter(a=>state.achievementsClaimed[a.id]).length;
  const cards=ACHIEVEMENTS.map(a=>{const done=!!state.achievementsClaimed[a.id]; return `<div class="achievement-card ${done?"done":""}"><div class="achievement-icon">${a.icon}</div><div class="achievement-info"><b>${a.name}</b><small>${a.desc}</small><span>${done?"✓ НАГРАДА ПОЛУЧЕНА":`🎁 ${a.reward.gold.toLocaleString("ru-RU")} 🪙 · ${a.reward.shadow} 🌑`}</span></div><div class="achievement-state">${done?"✓":"🔒"}</div></div>`}).join("");
  return `<div class="achievements-head"><div><b>🏅 ДОСТИЖЕНИЯ</b><small>Открыто: ${unlocked}/${ACHIEVEMENTS.length}</small></div><div class="streak-badge">🔥 ${state.loginStreak} ДН.</div></div><div class="achievement-note">Награды выдаются автоматически. Серия входов увеличивается при первом запуске игры в новый день.</div><div class="achievement-list">${cards}</div>`;
}
function ensureNotices(){ state.notices={inventory:false,equipment:false,quests:false,mail:false,...(state.notices||{})}; }
function markNotice(key,value){ ensureNotices(); if(key in state.notices) state.notices[key]=value; save(); updateNoticeDots(); }
function updateNoticeDots(){ ensureNotices(); const map={inventory:"notice-inventory",quests:"notice-quests",mail:"notice-mail"}; const any=Object.values(state.notices).some(Boolean); Object.entries(map).forEach(([k,id])=>{const el=$(id);if(el)el.classList.toggle("show",!!state.notices[k]);}); const more=$("notice-more"); if(more)more.classList.toggle("show",any); }
function showLevelUpToast(level,points){ const box=$("levelUpToast"); if(!box)return; $("levelUpTitle").textContent=`УРОВЕНЬ ${level}`; $("levelUpReward").textContent=`+${points} очка улучшения характеристик зачислено`; box.classList.remove("hidden"); setTimeout(()=>box.classList.add("hidden"),2600); }

function migrateOldSave(){
  if(!Number.isFinite(state.selectedSkillId)) state.selectedSkillId=0;
  if(!Number.isFinite(state.healCooldown)) state.healCooldown=0;
  ensureChests(); ensureStoryQuests();
  if(!state.spentStats) state.spentStats=defaultStats();
  ensureNotices();
  if(state.playerClass && state.statPoints===undefined){ state.statPoints=Math.max(0,(state.level-1)*3); }
  if(state.playerClass && state.statPoints===0 && Object.values(state.spentStats).every(v=>!v)){
    // Old saves keep their class/level but receive the level-up points for the new system.
    state.statPoints=Math.max(0,(state.level-1)*3);
  }
}
const RARITIES = [
  {name:"Обычное", chance:30, mult:1.00, shards:1, cls:"common"},
  {name:"Необычное", chance:30, mult:1.15, shards:2, cls:"uncommon"},
  {name:"Редкое", chance:20, mult:1.35, shards:4, cls:"rare"},
  {name:"Эпическое", chance:10, mult:1.70, shards:8, cls:"epic"},
  {name:"Легендарное", chance:6, mult:2.10, shards:14, cls:"legendary"},
  // Реликтовое оставлено редчайшим промежуточным тиром между легендарным и мифическим.
  {name:"Реликтовое", chance:0.5, mult:2.70, shards:22, cls:"relic"},
  {name:"Мифическое", chance:2.5, mult:3.20, shards:32, cls:"mythic"},
  {name:"Адское", chance:0.5, mult:8.00, shards:55, cls:"hell"},
  {name:"Божественное", chance:0.5, mult:12.80, shards:80, cls:"divine"}
];
// The supplied probabilities total 99.5% once a 0.5% Relic tier is included.
// The remaining 0.5% is assigned to Divine so every drop always resolves to a rarity.
RARITIES[8].chance=1.0;
function rarityByName(name){return RARITIES.find(r=>r.name===name)||RARITIES[0];}
function rollRarity(){
  let n=Math.random()*100;
  for(const r of RARITIES){ if(n<r.chance)return r; n-=r.chance; }
  return RARITIES[RARITIES.length-1];
}
function migrateEquipmentSystem(){
  const savedVersion=Number(state._saveVersion||0);
  const normalizeItem=(item)=>{
    if(!item || item.type==="material") return;
    item.itemLevel=Math.max(1,Math.min(40,Number(item.itemLevel)||Number(state.level)||1));
    if(!["assassin","mage","paladin","archer"].includes(item.classKey)) item.classKey=["assassin","mage","paladin","archer"][Math.floor(Math.random()*4)];
    if(!rarityByName(item.rarity)) item.rarity="Обычное";
    item.upgradeLevel=Math.max(0,Number(item.upgradeLevel)||0);
    if(savedVersion<23 || !item.stats) item.stats=generateEquipmentStats(item.type,item.itemLevel,item.rarity,item.upgradeLevel);
    item.price=Math.max(10,Math.floor(item.itemLevel*item.itemLevel*1.8*rarityByName(item.rarity).mult*(1+item.upgradeLevel*.12)));
  };
  (state.inventory||[]).forEach(normalizeItem);
  Object.values(state.equipped||{}).forEach(normalizeItem);
  (state.bazaarLots||[]).forEach(l=>normalizeItem(l.item));
  if(savedVersion<22){ state.xp=Math.floor((Number(state.xp)||0)/3); }
  if(!Number.isFinite(state.shards)) state.shards=0;
}
function generateEquipmentStats(type,itemLevel,rarity="Обычное",upgradeLevel=0){
  const lvl=Math.max(1,Number(itemLevel)||1);
  const rm=rarityByName(rarity).mult;
  const um=1+Math.max(0,Number(upgradeLevel)||0)*0.08;
  const r=(n)=>Math.max(1,Math.floor(n*rm*um));
  if(type==="weapon") return {strength:r(2+lvl*1.15),critChance:Math.max(1,Math.floor((lvl/8)+1)*Math.max(1,rm>=3.2?2:1))};
  if(type==="armor") return {health:r(5+lvl*2.25),defense:r(1+lvl*.85),stamina:Math.max(1,Math.floor((lvl/10)+1)*Math.max(1,rm>=3.2?2:1))};
  if(type==="amulet") return {critDamage:r(3+lvl*.55),critChance:Math.max(1,Math.floor((lvl/10)+1)*Math.max(1,rm>=3.2?2:1)),dodge:Math.max(1,Math.floor((lvl/12)+1)*Math.max(1,rm>=3.2?2:1))};
  return {};
}
function upgradeCost(item){
  const u=Number(item?.upgradeLevel)||0;
  const r=rarityByName(item?.rarity);
  return {shards:Math.max(2,Math.floor((u+1)*r.shards*.75)),gold:Math.max(30,Math.floor((item.itemLevel||1)*(u+1)*18*r.mult))};
}
function dismantleReward(item){
  const r=rarityByName(item?.rarity);
  return Math.max(1,Math.floor(r.shards*(1+(Number(item?.upgradeLevel)||0)*.25)+(Number(item?.itemLevel)||1)/10));
}
function itemRarityClass(item){return rarityByName(item?.rarity).cls;}

function ensureCollections(){
  if(!Array.isArray(state.inventory)) state.inventory=[];
  if(!state.equipped || typeof state.equipped!=="object") state.equipped={weapon:null,armor:null};
  if(!("weapon" in state.equipped)) state.equipped.weapon=null;
  if(!("armor" in state.equipped)) state.equipped.armor=null;
  if(!("amulet" in state.equipped)) state.equipped.amulet=null;
  state.inventory.forEach(item=>{
    if(item.type!=="material") {
      item.itemLevel=Math.max(1,Number(item.itemLevel)||Number(state.level)||1);
      if(!["assassin","mage","paladin","archer"].includes(item.classKey)) item.classKey=["assassin","mage","paladin","archer"][Math.floor(Math.random()*4)];
      if(!rarityByName(item.rarity)) item.rarity="Обычное";
      item.upgradeLevel=Math.max(0,Number(item.upgradeLevel)||0);
      if(!item.stats) item.stats=generateEquipmentStats(item.type,item.itemLevel,item.rarity,item.upgradeLevel);
      item.price=Math.max(10,Math.floor(item.itemLevel*item.itemLevel*1.8*rarityByName(item.rarity).mult*(1+item.upgradeLevel*.12)));
    } else item.classKey="all";
  });
  if(!Array.isArray(state.bazaarLots)) state.bazaarLots=[];
  if(!Array.isArray(state.quests)) state.quests=null;
  refreshQuestCycle(false);
  ensureChests(); ensureStoryQuests();
}
function newQuestCycle(){
  ensureNotices(); state.notices.quests=false;
  state.questCycleStart=Date.now();
  state.questClaimed=false;
  state.quests=[
    {id:"dungeons",name:"Пройти подземелья",icon:"⚔️",target:3,progress:0},
    {id:"kills",name:"Победить монстров",icon:"👹",target:5,progress:0},
    {id:"xp",name:"Получить опыт",icon:"✨",target:5000,progress:0}
  ];
}
function refreshQuestCycle(saveIt=true){
  const now=Date.now();
  if(!state.questCycleStart || !Array.isArray(state.quests)) newQuestCycle();
  else if(now-state.questCycleStart>=5*60*60*1000) newQuestCycle();
  if(saveIt) save();
}
function questTimeLeft(){
  const left=Math.max(0,5*60*60*1000-(Date.now()-state.questCycleStart));
  const h=Math.floor(left/3600000),m=Math.floor((left%3600000)/60000),sec=Math.floor((left%60000)/1000);
  return `${h}ч ${String(m).padStart(2,"0")}м ${String(sec).padStart(2,"0")}с`;
}
function updateQuestProgress(id,amount=1){
  refreshQuestCycle(false);
  const q=state.quests?.find(x=>x.id===id);
  if(!q)return;
  q.progress=Math.min(q.target,q.progress+amount);
  if(allQuestsDone() && !state.questClaimed){ ensureNotices(); state.notices.quests=true; }
  save(); updateNoticeDots();
}
function allQuestsDone(){return Array.isArray(state.quests)&&state.quests.length>0&&state.quests.every(q=>q.progress>=q.target);}
function claimQuestReward(){
  refreshQuestCycle(false);
  if(state.questClaimed){modal("ЗАДАНИЯ","Награда за этот цикл уже получена.");return;}
  if(!allQuestsDone()){modal("ЗАДАНИЯ", "Сначала выполни все задания.");return;}
  state.questClaimed=true;
  state.coins+=2000;
  state.shadowCoins+=20;
  addXP(10000);
  save(); render();
  modal("ЗАДАНИЯ ВЫПОЛНЕНЫ","Получено: 2 000 золота · 20 теневых монет · 10 000 XP.");
}
function itemStatLines(item){
  if(!item?.stats) return [];
  const labels={strength:"Сила",health:"Здоровье",defense:"Защита",stamina:"Выносливость",critDamage:"Крит. урон",critChance:"Шанс крита",agility:"Ловкость",dodge:"Уклонение"};
  return Object.entries(item.stats).filter(([,v])=>v).map(([k,v])=>`${labels[k]||k} +${v}${["critDamage","critChance","dodge"].includes(k)?"%":""}`);
}
function itemStatsText(item){return itemStatLines(item).join(" · ")||"Без характеристик";}
function itemStatChips(item){return itemStatLines(item).map(x=>`<span>${x}</span>`).join("");}
function equipmentBonusStats(){
  const out=defaultStats();
  for(const item of Object.values(state.equipped||{})) if(item?.stats) for(const [k,v] of Object.entries(item.stats)) out[k]=(out[k]||0)+v;
  return out;
}

function classAvatarPath(key){return `img/icons/avatar_${key||"mage"}.png`;}
function classAvatarImg(key, cls="class-avatar-img"){return `<img class="${cls}" src="${classAvatarPath(key)}" alt="">`;}
function classUiIcon(key, cls="class-select-icon"){return `<img class="${cls}" src="img/icons/avatar_${colorsafeClass(key)}.png" alt="">`;}
function itemIconPath(item){
  const type=item?.type||"material", key=item?.classKey||state.playerClass||"mage";
  if(type==="armor") return `img/icons/equip_armor_${colorsafeClass(key)}.png`;
  if(type==="amulet") return `img/icons/equip_amulet_${colorsafeClass(key)}.png`;
  if(type==="weapon") return `img/icons/equip_core_${colorsafeClass(key)}.png`;
  return "img/icons/equip_core_generic.png";
}
function colorsafeClass(key){return ["assassin","mage","paladin","archer"].includes(key)?key:"mage";}
function itemIconImg(item, cls="loot-img"){return `<img class="${cls}" src="${itemIconPath(item)}" alt="">`;}
function battleEnemyImg(){return `<img class="battle-monster-img" src="img/icons/monster.png" alt="">`;}
const ICON_MAP={
  "❤":"health","❤️":"health","⚡":"energy","🪙":"gold","💰":"gold","🌑":"shadow","✨":"skill","💎":"equip_core_generic","🎁":"daily","👑":"titles","👹":"monster","🧙":"mage","🔮":"mage","☠️":"assassin","🛡️":"paladin","🏹":"archer","🗡️":"equip_core_generic","🪄":"equip_core_generic","⚔️":"attack","🥷":"assassin","🔻":"equip_amulet_assassin","✝️":"equip_amulet_paladin","🪶":"equip_amulet_archer","🌲":"dungeons","💀":"monster","🏰":"dungeons","🕳️":"dungeons","🕷️":"monster","⛏️":"inventory","🏛️":"dungeons","🩸":"boss","🔥":"skill","🏚️":"dungeons","🌋":"boss","🗿":"dungeons","🏯":"dungeons","🐉":"boss","🗻":"dungeons","😈":"boss","☁️":"dungeons","🗼":"dungeons","🐲":"boss","🌀":"skill","💥":"attack","📚":"inventory","☄️":"boss","🌌":"boss","🌅":"daily","🎒":"inventory","🔨":"equip_core_generic","📈":"rating","🏆":"rating","🌟":"daily","⚒️":"equip_core_generic","🏷️":"titles","🏅":"achievements","🔒":"settings","🗺️":"dungeons","📭":"mail","🗑️":"mail","📨":"mail","🌾":"farm","⚠️":"boss","◈":"stamina","💪":"strength","🛡":"defense","💥":"attack","⚔":"attack","🪙":"gold","💠":"equip_core_generic","✦":"skill","🔹":"shard","🔔":"mail","🛒":"shop","⚙️":"settings","👤":"settings","🧬":"settings","📜":"quests","⏱️":"energy","🎯":"rating","🗺️":"dungeons"
};
const EMOJI_RE=/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
function iconImgForToken(token,extraClass="inline-icon"){
  const key=ICON_MAP[token]||"skill";
  const file={
    dungeons:"nav_dungeons",health:"health",energy:"energy",gold:"gold",shadow:"shadow",skill:"skill",daily:"daily",titles:"titles",monster:"monster",mage:"mage",assassin:"assassin",paladin:"paladin",archer:"archer",attack:"attack",inventory:"inventory",boss:"boss",stamina:"stamina",strength:"strength",defense:"defense",rating:"rating",achievements:"achievements",settings:"settings",mail:"mail",farm:"farm",equip_core_generic:"equip_core_generic",equip_amulet_assassin:"equip_amulet_assassin",equip_amulet_paladin:"equip_amulet_paladin",equip_amulet_archer:"equip_amulet_archer",shard:"shard"
  }[key]||key;
  return `<img class="${extraClass}" src="img/icons/${file}.png" alt="">`;
}
function replaceRenderedEmoji(){
  const root=document.body;
  if(!root||replaceRenderedEmoji.running)return;
  replaceRenderedEmoji.running=true;
  try{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
      const p=n.parentElement;
      if(!p||["SCRIPT","STYLE","TEXTAREA","INPUT","OPTION"].includes(p.tagName)||p.closest("script,style,textarea,input,option")) return NodeFilter.FILTER_REJECT;
      EMOJI_RE.lastIndex=0; return EMOJI_RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }});
    const nodes=[]; let n; while((n=walker.nextNode())) nodes.push(n);
    for(const node of nodes){
      const text=node.nodeValue; const frag=document.createDocumentFragment(); let last=0;
      text.replace(EMOJI_RE,(m,offset)=>{ if(offset>last)frag.appendChild(document.createTextNode(text.slice(last,offset))); const wrap=document.createElement("span"); wrap.innerHTML=iconImgForToken(m); frag.appendChild(wrap.firstElementChild); last=offset+m.length; return m; });
      if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode?.replaceChild(frag,node);
    }
  }finally{replaceRenderedEmoji.running=false;}
}

function makeLoot(){
  const typeRoll=Math.random();
  const type=typeRoll<0.38?"weapon":typeRoll<0.76?"armor":typeRoll<0.94?"amulet":"material";
  const classes=["assassin","mage","paladin","archer"];
  const c=classes[rand(0,classes.length-1)];
  const lvl=Math.max(1,Math.min(40,state.level));
  const rarity=rollRarity();
  const names={
    weapon:{assassin:["Кинжал тени","Клинок убийцы","Призрачный нож"],mage:["Посох маны","Жезл бездны","Кристальный посох"],paladin:["Молот света","Меч стража","Священный клинок"],archer:["Лук охотника","Лук ветра","Небесный лук"]},
    armor:{assassin:["Теневая броня","Плащ убийцы","Доспех призрака"],mage:["Мантия мага","Одеяние бездны","Арканная мантия"],paladin:["Броня стража","Святая кираса","Доспех паладина"],archer:["Кожаная броня","Броня охотника","Доспех следопыта"]},
    amulet:{assassin:["Амулет тени","Клык убийцы","Око убийцы"],mage:["Амулет маны","Кристалл архимага","Око бездны"],paladin:["Амулет света","Знак стража","Сердце храма"],archer:["Амулет ветра","Клык охотника","Око сокола"]},
    material:["Кристалл маны","Тёмный камень","Ядро монстра"]
  };
  const icons={weapon:{assassin:"🗡️",mage:"🪄",paladin:"⚔️",archer:"🏹"},armor:{assassin:"🥷",mage:"🧙",paladin:"🛡️",archer:"🏹"},amulet:{assassin:"🔻",mage:"🔮",paladin:"✝️",archer:"🪶"}};
  const stats=type==="material"?{}:generateEquipmentStats(type,lvl,rarity.name,0);
  const name=type==="material"?names.material[rand(0,2)]:names[type][c][rand(0,2)];
  const icon=type==="material"?"💎":icons[type][c];
  const iconKey=type==="material"?"material":type;
  return {id:`loot_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name,type,icon,rarity:rarity.name,rarityClass:rarity.cls,stats,itemLevel:lvl,upgradeLevel:0,iconKey,price:Math.max(10,Math.floor(lvl*lvl*1.8*rarity.mult)),classKey:type==="material"?"all":c};
}
function addLootFromMob(){
  // 70% chance for a loot drop. The rarity table is rolled only when a drop happens.
  if(Math.random()>0.70) return null;
  const loot=makeLoot();
  state.inventory.push(loot);
  if(state.inventory.length>60) state.inventory.shift();
  return loot;
}
function removeInventoryItem(id){const i=state.inventory.findIndex(x=>x.id===id);if(i<0)return null;return state.inventory.splice(i,1)[0];}
function createBazaarLot(itemId,price){
  if(state.bazaarLots.length>=5){modal("БАЗАР","Можно одновременно выставлять максимум 5 лотов.");return;}
  const item=removeInventoryItem(itemId); if(!item)return;
  const p=Math.max(1,Math.floor(Number(price)||0));
  state.bazaarLots.push({id:`lot_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,item,price:p,createdAt:Date.now()});
  save(); openSubscreen("bazaar"); render();
}
function cancelBazaarLot(lotId){const i=state.bazaarLots.findIndex(x=>x.id===lotId);if(i<0)return;const lot=state.bazaarLots.splice(i,1)[0];state.inventory.push(lot.item);save();openSubscreen("bazaar");render();}

load();
async function bootGame(){
  await restoreNewestIndexedSave();
  ensureAchievements();
  touchDailyStreak();
  ensureCollections();
  ensureChests(); ensureStoryQuests();
  if(!hadExistingSave){
    state.shadowCoins += 100;
    state.mail=[{id:'welcome_'+Date.now(),from:'Система',text:'Добро пожаловать в «Перерождение: Начало»! За регистрацию ты получил 100 теневых монет.',time:Date.now(),read:false,type:'system',reward:100}];
  }
  saveReady=true;
  ensureNotices();
  if(!hadExistingSave){ state.notices.mail=true; }
  checkAchievements();
  save();
  recalc();render();
}
bootGame();
setInterval(updateEnergyCountdown,1000);

function xpNeed(level=state.level){ const raw=level<=3?Math.floor(12000*Math.pow(1.4,level-1)):Math.floor(12000*Math.pow(1.4,2)*Math.pow(2.5,level-3)); return Math.max(1000,Math.floor(raw/7.5)); }
function rankCost(rank=state.rank){ return Math.floor(1500*Math.pow(1.65,rank)); }
function requiredLevel(rank=state.rank){ return 1+rank*3; }
function maxEnergy(){ return 100+(state.level-1)*2+(state.premium?100:0); }
function regenEnergy(){
  // Ровно +1 энергия каждые 30 секунд. Таймер продолжает идти даже при закрытой игре.
  const now=Date.now();
  const max=maxEnergy();
  if(!Number.isFinite(state.lastEnergyTick) || state.lastEnergyTick<=0){
    state.lastEnergyTick=now;
    return;
  }
  state.energy=Math.max(0,Math.min(Number(state.energy)||0,max));
  if(state.energy>=max){
    // Пока шкала полная, не копим старое время. После траты энергии отсчёт начинается заново.
    state.lastEnergyTick=now;
    return;
  }
  const elapsed=Math.max(0,now-state.lastEnergyTick);
  const gain=Math.floor(elapsed/30000);
  if(gain<=0) return;
  const before=state.energy;
  state.energy=Math.min(max,state.energy+gain);
  // Не теряем остаток секунд: например, 45 секунд дают +1 и оставляют ещё 15 секунд.
  if(state.energy>=max) state.lastEnergyTick=now;
  else state.lastEnergyTick += gain*30000;
  if(state.energy!==before) save();
}
function premiumDaily(){
  if(!state.premium) return;
  const day=new Date().toISOString().slice(0,10);
  if(state.premiumLastDaily!==day){ state.shadowCoins+=20; state.premiumLastDaily=day; save(); }
}
function energyCostDungeon(){ return 5; }
function energyCostRank(){ return 50; }
function totalSpent(){ return Object.values(state.spentStats).reduce((a,b)=>a+b,0); }
function getStats(){
  if(!state.playerClass)return defaultStats();
  const base=classData[state.playerClass].stats;
  const s={}; for(const k of Object.keys(base)) s[k]=base[k]+(state.spentStats[k]||0);
  return s;
}
function getClassSkills(){ return classSkills[state.playerClass] || []; }
function getSelectedSkill(){
  const skills=getClassSkills();
  const index=Math.max(0,Math.min(skills.length-1,Number(state.selectedSkillId)||0));
  return skills[index] || skills[0] || null;
}
function selectSkill(index){
  const skills=getClassSkills(), skill=skills[Number(index)];
  if(!skill)return;
  if(state.level<skill.level){ openSkillInfo(index); return; }
  state.selectedSkillId=Number(index);
  save(); closeSkills(); render();
}
function openSkillInfo(index){
  const skill=getClassSkills()[Number(index)];
  if(!skill)return;
  closeSkills();
  const unlocked=state.level>=skill.level;
  modal(skill.name,`${unlocked?"НАВЫК ОТКРЫТ":"НАВЫК ЗАКРЫТ"}\n\nОткрывается на ${skill.level} уровне.\nРасход маны: ${skill.mana}.\nУрон: примерно ${Math.round(skill.mult*100)}% от базовой атаки.\n\n${skill.desc}`);
}
function renderSkillsOverlay(){
  const overlay=$("skillsOverlay");
  if(!overlay||!state.playerClass)return;
  const skills=getClassSkills();
  overlay.innerHTML=`<div class="skills-window"><div class="skills-window-head"><div><b>НАВЫКИ — ${escapeHtml(classData[state.playerClass].name)}</b><small>Выбирай открытый навык для боя</small></div><button class="skills-close" type="button" onclick="closeSkills()">×</button></div><div class="skills-list">${skills.map((skill,i)=>{
    const unlocked=state.level>=skill.level, selected=unlocked&&Number(state.selectedSkillId)===i;
    return `<button type="button" class="skill-card ${unlocked?"unlocked":"locked"} ${selected?"selected":""}" onclick="${unlocked?`selectSkill(${i})`:`openSkillInfo(${i})`}"><span class="skill-card-icon"><img src="img/icons/skill.png" alt=""></span><span class="skill-card-main"><b>${escapeHtml(skill.name)}</b><small>Ур. ${skill.level} · ${skill.mana} маны · ×${skill.mult.toFixed(2)}</small><em>${escapeHtml(skill.desc)}</em></span><strong>${unlocked?(selected?"ВЫБРАН":"ВЫБРАТЬ"):"🔒"}</strong></button>`;
  }).join("")}</div><div class="skills-window-foot">Нажми на закрытый навык, чтобы прочитать его описание.</div></div>`;
  overlay.classList.remove("hidden");
}
function openSkills(){ if(!state.playerClass){modal("НАВЫКИ","Сначала выбери класс персонажа.");return;} renderSkillsOverlay(); }
function closeSkills(){ $("skillsOverlay")?.classList.add("hidden"); }

function recalc(){
  if(!state.playerClass)return;
  const c=classData[state.playerClass], s=getStats();
  const levelBonus=state.level-1, rankBonus=state.rank;
  const eqBonus=equipmentBonusStats();
  const fs={}; for(const k of Object.keys(s)) fs[k]=(s[k]||0)+(eqBonus[k]||0);
  const titleBonus=getTitleBonusStats();
  state.atk=Math.floor(c.atk + fs.strength*1.9 + fs.agility*.35 + levelBonus*2 + rankBonus*4 + titleBonus.atk);
  state.maxHp=Math.floor(c.hp + fs.health*10 + fs.stamina*8 + levelBonus*8 + rankBonus*35 + titleBonus.health);
  state.def=Math.floor(c.def + fs.defense*1.7 + fs.stamina*.35 + rankBonus*3 + titleBonus.def);
  state.stamina=fs.stamina;
  state.critDamage=Math.min(250,fs.critDamage + rankBonus*1.5 + (state.evolution?8:0) + titleBonus.critDamage);
  state.crit=Math.min(60,fs.critChance + rankBonus*.5 + (state.evolution?4:0));
  state.agility=fs.agility;
  state.dodge=Math.min(35,fs.dodge + fs.agility*.12 + rankBonus*.25 + (state.evolution?2:0) + titleBonus.dodge);
  state.maxMana=Math.floor(c.mana + fs.stamina*8 + levelBonus*2 + rankBonus*5);
  if(state.mana===null || !Number.isFinite(state.mana)) state.mana=state.maxMana;
  if(state.mana>state.maxMana) state.mana=state.maxMana;
  if(state.hp<=0||state.hp>state.maxHp)state.hp=state.maxHp;
  // Не сбрасываем таймер энергии при каждом recalc/render: иначе 60-секундный цикл никогда не набирается.
  state.maxEnergy=maxEnergy();
  if(!state.lastEnergyTick) state.lastEnergyTick=Date.now();
  regenEnergy();
  state.energy=Math.min(state.energy ?? maxEnergy(),maxEnergy());
  premiumDaily();
}
function primaryStatForClass(key=state.playerClass){
  return ({assassin:"agility",mage:"strength",paladin:"health",archer:"agility"}[key]||"strength");
}
function statIconFile(key){
  return ({strength:"strength",health:"health",defense:"defense",stamina:"stamina",critDamage:"crit",critChance:"crit",agility:"agility",dodge:"dodge"}[key]||"skill");
}
function statEffectText(key){
  const effects={
    strength:"+1 к Силе и +1.9 к Атаке.",
    health:"+1 к Здоровью и +10 к максимальному HP.",
    defense:"+1 к Защите и +1.7 к итоговой защите.",
    stamina:"+1 к Выносливости, +8 к HP, +8 к мане и +0.35 к защите.",
    critDamage:"+1% к Критическому урону.",
    critChance:"+0.5% к Шансу критического удара.",
    agility:"+1 к Ловкости, +0.35 к Атаке и +0.12% к уклонению.",
    dodge:"+0.25% к Уклонению."
  };
  return effects[key]||"Улучшает характеристику персонажа.";
}
function statRoleText(key){
  const primary=primaryStatForClass();
  if(key===primary)return "КЛЮЧЕВАЯ ДЛЯ КЛАССА";
  const secondary=({assassin:["strength","critChance","critDamage"],mage:["stamina","critDamage"],paladin:["defense","stamina"],archer:["strength","critChance","critDamage"]}[state.playerClass]||[]);
  return secondary.includes(key)?"ПОЛЕЗНАЯ ДЛЯ КЛАССА":"";
}
function openStatDetails(key){
  const labels={strength:"Сила",health:"Здоровье",defense:"Защита",stamina:"Выносливость",critDamage:"Крит. урон",critChance:"Шанс крита",agility:"Ловкость",dodge:"Уклонение"};
  const s=getStats();
  const role=statRoleText(key);
  const roleLine=role?`\n${role}`:"";
  modal(labels[key]||key,`Текущее значение: ${s[key]??0}\n\n${statEffectText(key)}${roleLine}\n\nНажми «+», чтобы вложить 1 очко в эту характеристику.`);
}
function statRow(key,label,value,step,percent=false){
  const can=state.statPoints>0;
  const primary=primaryStatForClass()===key;
  const role=statRoleText(key);
  const icon=statIconFile(key);
  return `<div class="stat-row ${primary?"stat-primary":""} ${role==="ПОЛЕЗНАЯ ДЛЯ КЛАССА"?"stat-secondary":""}" role="button" tabindex="0" onclick="openStatDetails('${key}')"><div class="stat-row-info"><span><img class="stat-mini-icon" src="img/icons/${icon}.png" alt=""> ${label}${role?`<em>${role}</em>`:""}</span><b>${value}${percent?"%":""}</b><small>+${step}${percent?"%":""} за очко</small></div><button class="stat-plus" ${can?"":"disabled"} onclick="event.stopPropagation();upgradeStat('${key}')">+</button></div>`;
}
function renderStats(){
  if(!state.playerClass)return;
  const s=getStats();
  $("statPoints").textContent=state.statPoints;
  $("statAtk").textContent=state.atk;
  $("statHp").textContent=state.maxHp;
  $("statDef").textContent=state.def;
  $("statStamina").textContent=s.stamina;
  $("flatStats").innerHTML=[
    statRow("strength","Сила",s.strength,1),statRow("health","Здоровье",s.health,1),statRow("defense","Защита",s.defense,1),statRow("stamina","Выносливость",s.stamina,1),statRow("agility","Ловкость",s.agility,1)
  ].join("");
  $("percentStats").innerHTML=[
    statRow("critDamage","Крит. урон",state.critDamage,1,true),statRow("critChance","Шанс крита",state.crit,0.5,true),statRow("dodge","Уклонение",state.dodge,0.25,true)
  ].join("");
}
function toggleAllocation(){
  const panel=$("allocationPanel");
  const collapsed=panel.classList.toggle("collapsed");
  const arrow=$("allocationArrow");
  if(arrow) arrow.textContent=collapsed?"⌄":"⌃";
  const head=panel.querySelector(".allocation-head");
  if(head) head.setAttribute("aria-expanded",collapsed?"false":"true");
}
function upgradeStat(key){
  if(state.statPoints<=0)return;
  state.spentStats[key]=(state.spentStats[key]||0)+1; state.statPoints--; recalc(); save(); render();
}
function energyRegenCountdown(){
  if(state.energy>=maxEnergy()) return 0;
  if(!state.lastEnergyTick) return 30;
  const elapsed=Math.max(0,Date.now()-state.lastEnergyTick);
  return Math.max(1,30-Math.floor((elapsed%30000)/1000));
}
function updateEnergyCountdown(){
  regenEnergy();
  const text=state.energy>=maxEnergy()?"МАКС. ЭНЕРГИЯ":`+1 ЭНЕРГИЯ ЧЕРЕЗ ${energyRegenCountdown()} СЕК.`;
  ["energyTimer","heroEnergyTimer"].forEach(id=>{const el=$(id);if(el)el.textContent=text;});
}

function render(){
  updateTitles();
  recalc();
  if($("coins"))$("coins").textContent=state.coins.toLocaleString("ru-RU");
  if($("energy"))$("energy").textContent=Math.floor(state.energy);
  if($("energyMax"))$("energyMax").textContent=maxEnergy();
  if($("heroEnergy"))$("heroEnergy").textContent=Math.floor(state.energy);
  if($("heroEnergyMax"))$("heroEnergyMax").textContent=maxEnergy();
  updateEnergyCountdown();
  if($("manaText"))$("manaText").textContent=Math.floor(state.mana);
  if($("manaMax"))$("manaMax").textContent=Math.floor(state.maxMana);
  if($("manaBar"))$("manaBar").style.width=(state.maxMana?Math.max(0,state.mana/state.maxMana*100):0)+"%";
  if($("heroGold"))$("heroGold").textContent=state.coins.toLocaleString("ru-RU");
  if($("shadowCoins"))$("shadowCoins").textContent=state.shadowCoins.toLocaleString("ru-RU");
    if($("moreGold"))$("moreGold").textContent=state.coins.toLocaleString("ru-RU");
  if($("moreShadowCoins"))$("moreShadowCoins").textContent=state.shadowCoins.toLocaleString("ru-RU");
  $("level").textContent=state.level; $("rankName").textContent=ranks[state.rank]; $("associationRank").textContent=ranks[state.rank];
  $("xpText").textContent=state.xp.toLocaleString("ru-RU"); $("xpNeed").textContent=xpNeed().toLocaleString("ru-RU"); $("xpBar").style.width=Math.min(100,state.xp/xpNeed()*100)+"%";
  $("playerName").textContent=(state.premium?"👑 ":"")+(state.playerName||"Пробуждённый");
  if($("activeTitle")) $("activeTitle").textContent=state.selectedTitle?`「${state.selectedTitle}」`:"Без титула";
  if(state.playerClass){
    const c=classData[state.playerClass]; $("className").textContent=c.name+(state.evolution?" · "+state.evolution:""); $("avatar").innerHTML=classAvatarImg(state.playerClass,"hero-avatar-img");
    $("statsPanel").classList.remove("hidden"); $("allocationPanel").classList.remove("hidden"); $("currencyPanel").classList.remove("hidden"); $("classSelection").classList.add("hidden"); renderStats();
    $("battlePlayerSprite").innerHTML=classAvatarImg(state.playerClass,"battle-class-img");
    if(state.level>=20&&!state.evolution){$("evolutionPanel").classList.remove("hidden");renderEvos();} else $("evolutionPanel").classList.add("hidden");
  }
  renderDungeons();renderAssociation();updateNoticeDots();if($("skillsOverlay")&&!$("skillsOverlay").classList.contains("hidden"))renderSkillsOverlay();save();
  queueMicrotask(replaceRenderedEmoji);
}
function addXP(amount){
  state.xp+=amount;
  if(typeof updateQuestProgress==="function") updateQuestProgress("xp",amount);
  while(state.level<40&&state.xp>=xpNeed()){
    state.xp-=xpNeed();state.level++;state.statPoints+=state.premium?3:2;recalc();
    // Новый уровень полностью восстанавливает энергию.
    state.energy=maxEnergy();
    state.lastEnergyTick=Date.now();
    showLevelUpToast(state.level,state.premium?3:2);
  }
  if(state.level===40)state.xp=Math.min(state.xp,xpNeed()); render();
}
function selectClass(key){
  state.playerClass=key; state.evolution=null; state.selectedSkillId=0; state.healCooldown=0; state.spentStats=defaultStats(); state.statPoints=0; state.energy=maxEnergy(); state.lastEnergyTick=Date.now(); recalc(); state.hp=state.maxHp; state.mana=state.maxMana;
  save(); modal("ПРОБУЖДЕНИЕ",`Выбран путь: ${classData[key].name}. Стартовые характеристики отличаются у каждого класса.`);render();
}
function renderEvos(){const c=classData[state.playerClass];$("evolutionChoices").innerHTML=c.evo.map(e=>`<div class="evo"><b>${e[0]}</b><small>${e[1]}</small><button onclick="evolve('${e[0].replaceAll("'","")}')">ВЫБРАТЬ</button></div>`).join("");}
function evolve(name){state.evolution=name;recalc();state.hp=state.maxHp;save();modal("ЭВОЛЮЦИЯ",`Класс эволюционировал в «${name}». Бонусы класса усилены.`);render();}
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
let selectedDungeonRank=null;
function renderDungeons(){
  if(selectedDungeonRank===null || selectedDungeonRank>state.rank) selectedDungeonRank=state.rank;
  const rankTabs=ranks.map((r,i)=>{const locked=i>state.rank;return `<button class="dungeon-rank-tab ${i===selectedDungeonRank?"active":""} ${locked?"locked":""}" ${locked?"disabled":""} onclick="selectDungeonRank(${i})">${locked?"🔒 ":""}${r}</button>`;}).join("");
  $("dungeonRanks").innerHTML=rankTabs;
  const selected=ranks[selectedDungeonRank];
  const items=dungeonTemplates.map((d,i)=>({d,i})).filter(x=>x.d[2]===selected);
  if(!items.length){
    $("dungeonList").innerHTML=`<div class="panel dungeon-empty"><div>🗺️</div><b>Подземелья ранга ${selected}</b><small>Контент этого ранга будет доступен после его открытия.</small></div>`;
    return;
  }
  $("dungeonList").innerHTML=items.map(({d,i})=>{
    const energyOk=state.energy>=energyCostDungeon();
    const previewHpMin=Math.max(1,Math.floor(d[4]*1.74));
    const previewHpMax=Math.max(previewHpMin,Math.floor(d[5]*1.74));
    const previewAtkMin=Math.max(1,Math.floor(d[6]*1.82)+state.rank*7);
    const previewAtkMax=Math.max(previewAtkMin,Math.floor(d[7]*1.82)+state.rank*7);
    const previewGoldMin=Math.max(1,Math.floor(d[8]/6));
    const previewGoldMax=Math.max(previewGoldMin,Math.floor(d[9]/6));
    const previewXpMin=previewHpMin;
    const previewXpMax=previewHpMax*2;
    return `<div class="dungeon"><div class="dungeon-row"><span class="dungeon-icon-emoji">${d[1]}</span><div class="dungeon-info"><h3>${d[0]}</h3><p>HP: ${previewHpMin}–${previewHpMax} · ⚔️ АТК: ${previewAtkMin}–${previewAtkMax}</p><p>🪙 ${previewGoldMin}–${previewGoldMax} золота · ✨ XP: ${previewXpMin}–${previewXpMax}</p></div><div class="dungeon-rank">${d[2]} · ${d[3]}</div></div><button ${energyOk?"":"disabled"} onclick="startDungeon(${i})">${energyOk?"ВОЙТИ · ⚡ 5":"НЕТ ЭНЕРГИИ"}</button></div>`;
  }).join("");
}
function selectDungeonRank(index){if(index>state.rank)return;selectedDungeonRank=index;renderDungeons();}
function renderAssociation(){if(state.rank>=ranks.length-1){$("nextRankTitle").textContent="Достигнут максимальный ранг";$("rankRequirements").innerHTML=`<div class="req ok">SSS — максимальный ранг</div>`;$("rankUpBtn").disabled=true;return;}const next=ranks[state.rank+1],cost=rankCost(),lvlOk=state.level>=requiredLevel(state.rank+1),coinOk=state.coins>=cost,energyOk=state.energy>=energyCostRank();$("nextRankTitle").textContent="Следующий ранг: "+next;$("rankRequirements").innerHTML=`<div class="req"><span>Уровень</span><b class="${lvlOk?"ok":"bad"}">${state.level} / ${requiredLevel(state.rank+1)}</b></div><div class="req"><span>Монеты</span><b class="${coinOk?"ok":"bad"}">${state.coins.toLocaleString()} / ${cost.toLocaleString()}</b></div><div class="req"><span>Энергия</span><b class="${energyOk?"ok":"bad"}">${Math.floor(state.energy)} / ${energyCostRank()}</b></div><div class="req"><span>Испытание босса</span><b>Нужно победить</b></div>`;$("rankUpBtn").disabled=!(lvlOk&&coinOk&&energyOk);}
function rankUp(){const cost=rankCost(),need=requiredLevel(state.rank+1);if(state.level<need||state.coins<cost||state.energy<energyCostRank())return;state.coins-=cost;state.energy-=energyCostRank();save();startBossTrial();}
function worldBossState(){
  const cycle=12*60*60*1000;
  const now=Date.now();
  if(!state.worldBossSpawn || now-state.worldBossSpawn>=cycle){
    state.worldBossSpawn=now;
    state.worldBossHp=rand(56000,210000);
    state.worldBossAttempts=0; state.worldBossDamage=0; state.worldBossHistory=[]; save();
  }
  if(!state.worldBossHp) state.worldBossHp=rand(56000,210000);
  return {hp:state.worldBossHp,attempts:state.worldBossAttempts||0,history:state.worldBossHistory||[],left:Math.max(0,cycle-(now-state.worldBossSpawn))};
}
function worldBossTimeLeft(ms){const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000);return `${h}ч ${String(m).padStart(2,"0")}м ${String(s).padStart(2,"0")}с`; }
function worldBossReward(damage,maxHp){
  const pct=Math.max(0,Math.min(1,damage/Math.max(1,maxHp)));
  let tier,reward;
  if(pct>=1){tier="S";reward={gold:60000,shadow:150,shards:100,loot:2};}
  else if(pct>=.75){tier="A";reward={gold:40000,shadow:110,shards:75,loot:1};}
  else if(pct>=.50){tier="B";reward={gold:25000,shadow:70,shards:50,loot:1};}
  else if(pct>=.25){tier="C";reward={gold:15000,shadow:45,shards:30,loot:1};}
  else if(pct>=.10){tier="D";reward={gold:8000,shadow:25,shards:18,loot:0};}
  else {tier="E";reward={gold:3000,shadow:10,shards:8,loot:0};}
  state.coins+=reward.gold; state.shadowCoins+=reward.shadow; state.shards+=reward.shards; state.achievementStats.goldEarned+=reward.gold;
  const drops=[]; for(let i=0;i<reward.loot;i++){const loot=makeLoot(); if(loot){state.inventory.push(loot);drops.push(loot);}}
  if(drops.length) {ensureNotices();state.notices.inventory=true; state.achievementStats.lootFound+=drops.length; for(const d of drops)if(["Эпическое","Легендарное","Реликтовое","Мифическое","Адское","Божественное"].includes(d.rarity))state.achievementStats.rareLoot++;}
  return {tier,reward,pct,drops};
}
function finishWorldBossAttempt(){
  const b=state.battle; if(!b?.worldBoss)return;
  const damage=Math.max(0,Math.floor(b.maxHp-b.hp));
  const result=worldBossReward(damage,b.maxHp);
  state.worldBossHistory.push({time:Date.now(),damage,maxHp:b.maxHp,pct:result.pct,tier:result.tier});
  state.worldBossDamage=Math.max(state.worldBossDamage,damage);
  state.battle=null; state.hp=state.maxHp; state.mana=state.maxMana; checkAchievements(); save(); render(); openSubscreen("worldBoss");
  const lootText=result.drops.length?` · 🎁 ${result.drops.map(x=>x.name+" ["+x.rarity+"]").join(", ")}`:"";
  modal("МИРОВОЙ БОСС",`Урон: ${damage.toLocaleString("ru-RU")} / ${b.maxHp.toLocaleString("ru-RU")} (${Math.floor(result.pct*100)}%). Ранг награды: ${result.tier}. Получено: 🪙 ${result.reward.gold.toLocaleString("ru-RU")} · 🌑 ${result.reward.shadow} · <img class="inline-icon" src="img/icons/shard.png" alt=""> ${result.reward.shards}${lootText}`);
}
function startWorldBoss(){
  const wb=worldBossState();
  if(!state.playerClass){modal("МИРОВОЙ БОСС","Сначала выбери класс персонажа.");return;}
  if(wb.attempts>=3){modal("МИРОВОЙ БОСС","На этот цикл уже использованы все 3 попытки. Новый босс появится через "+worldBossTimeLeft(wb.left)+".");return;}
  const hp=Math.max(1,Math.floor(wb.hp/1.3));
  const atk=Math.max(1,Math.floor((state.atk*.72+state.def*.24+state.rank*12)/1.3));
  state.battle={worldBoss:true,boss:false,name:"Мировой босс",icon:"👑",maxHp:hp,hp,atk,xp:0,reward:0};
  state.worldBossAttempts++;
  save(); showBattle("МИРОВОЙ БОСС"); updateFarmBattleUI();
}
function renderWorldBoss(){
  const wb=worldBossState();
  const pct=state.worldBossHp?Math.floor((state.worldBossDamage/state.worldBossHp)*100):0;
  const history=(wb.history||[]).slice().reverse().map((x,i)=>`<div class="world-boss-history"><span>#${(wb.history.length-i)}</span><b>${x.damage.toLocaleString("ru-RU")} урона</b><small>${Math.floor(x.pct*100)}% · награда ${x.tier}</small></div>`).join("");
  return `<div class="world-boss-card"><div class="world-boss-icon">👑</div><h2>МИРОВОЙ БОСС</h2><p>Каждые 12 часов появляется новый босс с случайным запасом здоровья.</p><div class="world-boss-hp"><span>HP БОССА</span><b>${wb.hp.toLocaleString("ru-RU")}</b></div><div class="quest-bar"><div style="width:${Math.min(100,pct)}%"></div></div><div class="world-boss-stats"><span>⚔️ Попытки: <b>${wb.attempts}/3</b></span><span>⏱️ Новый босс: <b>${worldBossTimeLeft(wb.left)}</b></span></div><div class="world-boss-rewards"><b>🏆 НАГРАДА ПО УРОНУ</b><small>Чем больше % HP ты снимешь за попытку, тем выше награда.</small><span>E: 3 000 🪙 + 10 🌑 · D: 8 000 + 25 🌑 · C: 15 000 + 45 🌑 · B: 25 000 + 70 🌑 · A: 40 000 + 110 🌑 · S: 60 000 + 150 🌑 + лут</span></div><button class="primary-btn" onclick="startWorldBoss()" ${wb.attempts>=3?"disabled":""}>👑 СРАЖАТЬСЯ · ${3-wb.attempts} ПОПЫТ.</button></div><h3 class="world-boss-section">МОЙ РЕЙТИНГ УРОНА</h3>${history||'<div class="bazaar-empty">Попыток ещё не было.</div>'}`;
}
function startBossTrial(){const maxHp=Math.max(1,Math.floor((state.maxHp*1.7+state.rank*800)/1.3));const atk=Math.max(1,Math.floor((state.atk*.58+state.def*.18)/1.3));state.battle={boss:true,name:"Страж "+ranks[state.rank]+" ранга",icon:"👹",maxHp,hp:maxHp,atk,xp:xpNeed()*1.2,reward:0};save();showBattle("ИСПЫТАНИЕ АССОЦИАЦИИ");}
function startDungeon(i){const d=dungeonTemplates[i];if(state.energy<energyCostDungeon()){modal("НЕТ ЭНЕРГИИ",`Для входа нужно ${energyCostDungeon()} энергии. Сейчас: ${Math.floor(state.energy)}.`);return;}state.energy-=energyCostDungeon();const enemyHp=Math.max(1,Math.floor(rand(d[4],d[5])*1.74/1.3)),enemyAtk=Math.max(1,Math.floor((rand(d[6],d[7])*1.82+state.rank*7)/1.3)),gold=Math.max(1,Math.floor(rand(d[8],d[9])*(1/6))),xp=Math.max(5,Math.floor(enemyHp*rand(1,2)*1.5));state.battle={boss:false,name:d[0],icon:d[1],maxHp:enemyHp,hp:enemyHp,atk:enemyAtk,xp,reward:gold};save();showBattle(d[0]);}
function startFarmZone(){
  const farmHp=Math.max(1,Math.floor((((state.maxHp*0.62)+state.atk*3)*1.2)/1.3));const farmAtk=Math.max(1,Math.floor(((state.def*0.95+state.atk*0.16)*1.3)/1.3));state.battle={boss:false,farm:true,name:"Фарм-монстр #"+(Number(state.farmKills||0)+1),icon:"👹",maxHp:farmHp,hp:farmHp,atk:farmAtk,xp:500,reward:0};
  save();
  showBattle("ФАРМ-ЗОНА");
  updateFarmBattleUI();
}
function updateFarmBattleUI(){
  const isFarm=!!state.battle?.farm;
  const auto=document.querySelector('.actions .secondary-btn');
  if(auto){auto.disabled=isFarm;auto.classList.toggle('disabled',isFarm);auto.textContent=isFarm?'⚡ АВТО-БОЙ НЕДОСТУПЕН':'⚡ АВТО-БОЙ';}
}
function resetArenaDay(){const day=new Date().toISOString().slice(0,10);if(state.arenaDay!==day){state.arenaDay=day;state.arenaAttempts=0;save();}}
function arenaOpponents(){
  const base=Math.max(1,state.level);
  return [
    {id:'p1',name:'ТёмныйКлинок',level:Math.max(1,base-1),classKey:'assassin',rating:1120},
    {id:'p2',name:'ArcaneFox',level:base+1,classKey:'mage',rating:1185},
    {id:'p3',name:'СвятойСтраж',level:base+2,classKey:'paladin',rating:1240},
    {id:'p4',name:'SkyHunter',level:base,classKey:'archer',rating:1065},
    {id:'p5',name:'NightCore',level:base+3,classKey:'assassin',rating:1320}
  ];
}
function arenaBattle(id){
  resetArenaDay();
  if(state.arenaAttempts>=5){modal('АРЕНА','Сегодня осталось 0 из 5 попыток.');return;}
  const opp=arenaOpponents().find(x=>x.id===id);if(!opp)return;
  state.arenaAttempts++;
  const c=classData[opp.classKey];
  const enemyMax=Math.floor(c.hp+opp.level*22+opp.rating*.35);
  const enemyAtk=Math.floor(c.atk+opp.level*2.2+opp.rating*.05);
  state.battle={arena:true,opponent:opp,boss:false,name:opp.name,icon:c.icon,maxHp:enemyMax,hp:enemyMax,atk:enemyAtk,xp:0,reward:0};
  save();
  showBattle('АРЕНА');
  updateFarmBattleUI();
}
function arenaWin(){state.arenaRating+=18;save();modal('ПОБЕДА НА АРЕНЕ',`Рейтинг +18. Теперь: ${state.arenaRating}.`);}
function arenaLose(){state.arenaRating=Math.max(0,state.arenaRating-12);save();modal('ПОРАЖЕНИЕ НА АРЕНЕ',`Рейтинг -12. Теперь: ${state.arenaRating}.`);}
function renderMail(){
  if(!Array.isArray(state.mail)||!state.mail.length) state.mail=[];
  if(!state.mail.length) return `<div class="inventory-empty"><div>📭</div><h2>Почта пуста</h2><p>Новые системные сообщения и награды появятся здесь.</p></div>`;
  return `<div class="mail-toolbar"><button class="item-action secondary-btn" onclick="deleteReadMail()">🗑️ УДАЛИТЬ ПРОЧИТАННЫЕ</button><button class="item-action danger-btn" onclick="deleteAllMail()">🗑️ ОЧИСТИТЬ ПОЧТУ</button></div><div class="mail-list">${state.mail.slice().reverse().map(m=>`<div class="mail-item ${m.read?'read':''}" onclick="readMail('${m.id}')"><div class="mail-icon">${m.type==='system'?'<img class="inline-icon" src="img/icons/mail.png" alt="">':'<img class="inline-icon" src="img/icons/mail.png" alt="">'}</div><div class="mail-body"><b>${escapeHtml(m.from)}</b><small>${new Date(m.time||Date.now()).toLocaleString('ru-RU')}</small><p>${escapeHtml(m.text)}</p></div><button class="mail-delete" onclick="event.stopPropagation();deleteMail('${m.id}')">✕</button></div>`).join('')}</div><div class="mail-note">📨 Письма хранятся локально на этом устройстве.</div>`;
}
function readMail(id){const m=(state.mail||[]).find(x=>x.id===id);if(!m)return;m.read=true;state.notices.mail=(state.mail||[]).some(x=>!x.read);save();render();openSubscreen('mail');}
function deleteMail(id){const i=(state.mail||[]).findIndex(x=>x.id===id);if(i<0)return;state.mail.splice(i,1);state.notices.mail=(state.mail||[]).some(x=>!x.read);save();render();openSubscreen('mail');}
function deleteReadMail(){state.mail=(state.mail||[]).filter(x=>!x.read);state.notices.mail=(state.mail||[]).some(x=>!x.read);save();render();openSubscreen('mail');}
function deleteAllMail(){state.mail=[];state.notices.mail=false;save();render();openSubscreen('mail');}
function farmExit(){state.battle=null;save();showScreen('more');render();}
function syntheticPlayerStats(p){
  const c=classData[p.classKey];
  const lvl=Math.max(1,Number(p.level)||1);
  const spent=Math.max(0,(lvl-1)*2);
  const strength=Math.floor(c.stats.strength+spent*0.72+lvl*1.15);
  const health=Math.floor(c.stats.health+spent*0.5+lvl*.7);
  const defense=Math.floor(c.stats.defense+spent*.35+lvl*.35);
  const critChance=Math.min(60,Math.floor(c.stats.critChance+lvl*.25));
  const atk=Math.floor(c.atk+strength*1.9+(lvl-1)*2);
  const hp=Math.floor(c.hp+health*10+lvl*8);
  const def=Math.floor(c.def+defense*1.7+lvl*.8);
  const power=Math.floor(atk+hp*.22+def*2+strength*2.2+critChance*2);
  return {strength,health,defense,critChance,atk,hp,def,power};
}
function currentPlayerRatingStats(){
  return {strength:getStats().strength+(equipmentBonusStats().strength||0),health:getStats().health+(equipmentBonusStats().health||0),defense:getStats().defense+(equipmentBonusStats().defense||0),critChance:state.crit,atk:state.atk,hp:state.maxHp,def:state.def,power:Math.floor(state.atk+state.maxHp*.22+state.def*2+(getStats().strength+(equipmentBonusStats().strength||0))*2.2+state.crit*2)};
}
function playerProfile(id,from='rating'){
  if(id==='me'){openSubscreen('settings');return;}
  const p=arenaOpponents().find(x=>x.id===id);if(!p)return;
  const c=classData[p.classKey], st=syntheticPlayerStats(p);
  const gear=`<div class="profile-gear"><div>⚔️ Оружие: ${c.name==='Ассасин'?'Кинжал тени':c.name==='Чародей'?'Посох маны':c.name==='Паладин'?'Меч света':'Лук охотника'}</div><div>🛡️ Броня: ${c.name} комплект</div><div>🔮 Амулет: ${c.name} амулет</div></div>`;
  $('subscreenTitle').textContent='ПРОФИЛЬ ИГРОКА';
  $('subscreenContent').innerHTML=`<div class="player-profile"><div class="profile-avatar">${classAvatarImg(p.classKey,"profile-avatar-img")}</div><h2>${escapeHtml(p.name)}</h2><div class="profile-class">${c.name} · Ур. ${p.level} · Боевая сила ${st.power}</div><div class="derived-grid"><div><span>💪 СИЛА</span><b>${st.strength}</b></div><div><span>⚔ АТАКА</span><b>${st.atk}</b></div><div><span>❤ HP</span><b>${st.hp}</b></div><div><span>🛡 ЗАЩИТА</span><b>${st.def}</b></div><div><span>💥 КРИТ</span><b>${st.critChance}%</b></div></div><h3>ЭКИПИРОВКА</h3>${gear}<button class="primary-btn" onclick="openSubscreen('${from}')">← НАЗАД</button></div>`;
  showScreen('sub');
}
function renderRating(){
  const me={id:'me',name:state.playerName||'Пробуждённый',level:state.level,classKey:state.playerClass||'mage',self:true,stats:currentPlayerRatingStats()};
  const players=[me,...arenaOpponents().map(p=>({...p,stats:syntheticPlayerStats(p)}))];
  players.sort((a,b)=>b.stats.power-a.stats.power);
  return `<div class="rating-head"><div><b>🏆 РЕЙТИНГ ПО БОЕВОЙ СИЛЕ</b><span>Сила и экипировка учитываются</span></div><span>Твоя сила: ${me.stats.power}</span></div><div class="rating-list">${players.map((p,i)=>`<button class="rating-row ${p.self?'self':''}" onclick="${p.self?'openSubscreen(\'settings\')':`playerProfile('`+p.id+`','rating')`}"><span>#${i+1}</span><span class="rating-avatar">${classAvatarImg(p.classKey,"rating-avatar-img")}</span><span class="rating-name"><b>${escapeHtml(p.name)}</b><small>${classData[p.classKey].name} · Ур. ${p.level} · 💪 ${p.stats.strength}</small></span><strong>⚡ ${p.stats.power}</strong></button>`).join('')}</div>`;
}

function renderArena(){
  resetArenaDay();
  const opponents=arenaOpponents();
  return `<div class="arena-head"><div><b>⚔️ АРЕНА</b><small>Попытки сегодня: ${state.arenaAttempts}/5 · Рейтинг: ${state.arenaRating}</small></div><button class="ghost-btn" onclick="openSubscreen('arenaRank')">🏆 РЕЙТИНГ</button></div><div class="arena-list">${opponents.map(p=>`<div class="arena-row"><span class="rating-avatar">${classAvatarImg(p.classKey,"rating-avatar-img")}</span><div class="rating-name"><b>${escapeHtml(p.name)}</b><small>${classData[p.classKey].name} · Ур. ${p.level} · ${p.rating}</small></div><button class="primary-btn arena-fight-btn" onclick="arenaBattle('${p.id}')" ${state.arenaAttempts>=5?'disabled':''}>БИТЬСЯ</button></div>`).join('')}</div>`;
}
function renderArenaRank(){
  const list=[{name:state.playerName||'Пробуждённый',rating:state.arenaRating,self:true},...arenaOpponents().map(x=>({name:x.name,rating:x.rating}))].sort((a,b)=>b.rating-a.rating);
  return `<div class="rating-head"><b>🏆 РЕЙТИНГ АРЕНЫ</b><span>Попытки: ${state.arenaAttempts}/5</span></div><div class="rating-list">${list.map((p,i)=>`<div class="rating-row ${p.self?'self':''}"><span>#${i+1}</span><span>⚔️</span><span class="rating-name"><b>${escapeHtml(p.name)}</b></span><strong>${p.rating}</strong></div>`).join('')}</div><button class="primary-btn" onclick="openSubscreen('arena')">← В АРЕНУ</button>`;
}

function showBattle(title){$("battleDungeonName").textContent=title;$("screen-character").classList.remove("active");$("screen-dungeons").classList.remove("active");$("screen-association").classList.remove("active");$("screen-chat").classList.remove("active");$("screen-more").classList.remove("active");$("screen-sub").classList.remove("active");$("screen-battle").classList.add("active");document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));state.hp=state.maxHp;state.mana=state.maxMana;state.healCooldown=0;save();$("enemyName").textContent=state.battle.name;$("enemySprite").innerHTML=battleEnemyImg();const selected=getSelectedSkill();$("skillName").textContent=selected?`${selected.name} · ${selected.mana} МАНЫ`:"НАВЫК";$("battleLog").innerHTML="";log("Бой начался. "+state.battle.name+" появился!","system");updateBattle();updateFarmBattleUI();}
function updateBattle(){const b=state.battle;if(!b)return;$("battlePlayerHp").textContent=Math.max(0,Math.floor(state.hp));$("battlePlayerMaxHp").textContent=state.maxHp;$("playerHpBar").style.width=Math.max(0,state.hp/state.maxHp*100)+"%";$("battlePlayerMana").textContent=Math.max(0,Math.floor(state.mana));$("battlePlayerMaxMana").textContent=Math.floor(state.maxMana);$("battlePlayerManaBar").style.width=(state.maxMana?Math.max(0,state.mana/state.maxMana*100):0)+"%";$("enemyHp").textContent=Math.max(0,Math.floor(b.hp));$("enemyMaxHp").textContent=Math.floor(b.maxHp);$("enemyHpBar").style.width=Math.max(0,b.hp/b.maxHp*100)+"%";const selected=getSelectedSkill();if($("skillName"))$("skillName").textContent=selected?`${selected.name} · ${selected.mana} МАНЫ`:"НАВЫК";if($("healBtn")){const ready=state.healCooldown<=0;$("healBtn").disabled=!ready;$("healBtn").classList.toggle("on-cooldown",!ready);$("healBtn").querySelector("span").textContent=ready?"ЛЕЧЕНИЕ":`ЛЕЧЕНИЕ · ${state.healCooldown} ХОД${state.healCooldown===1?"":"А"}`;}if($("manaText"))$("manaText").textContent=Math.floor(state.mana);if($("manaMax"))$("manaMax").textContent=Math.floor(state.maxMana);if($("manaBar"))$("manaBar").style.width=(state.maxMana?Math.max(0,state.mana/state.maxMana*100):0)+"%";}
function log(t,type="hit"){const el=document.createElement("div");el.className="log-"+type;el.textContent=t;$("battleLog").appendChild(el);$("battleLog").scrollTop=$("battleLog").scrollHeight;}
function enemyTurn(){if(!state.battle||state.battle.hp<=0)return;const dodge=Math.random()<state.dodge/100;if(dodge){log("Ты уклонился от атаки!","system");save();return;}const raw=state.battle.atk*(.85+Math.random()*.3);const dmg=Math.max(1,Math.floor(raw-state.def*.38));state.hp=Math.max(0,state.hp-dmg);log(`${state.battle.name} наносит ${dmg} урона.`,"dmg");$("battlePlayerSprite").classList.remove("shake");void $("battlePlayerSprite").offsetWidth;$("battlePlayerSprite").classList.add("shake");if(state.hp<=0){log("Ты пал в бою.","dmg");setTimeout(()=>defeatBattle(),650);}save();}
function consumeBattleTurn(){ state.healCooldown=Math.max(0,(Number(state.healCooldown)||0)-1); }
function playerAttack(mult=1){if(!state.battle||state.hp<=0)return;const crit=Math.random()*100<state.crit;let dmg=Math.floor(state.atk*(.9+Math.random()*.2)*mult);if(crit)dmg=Math.floor(dmg*(1+state.critDamage/100));state.battle.hp=Math.max(0,state.battle.hp-dmg);if(state.battle.worldBoss) state.battle.damageDealt=(state.battle.damageDealt||0)+dmg;consumeBattleTurn();log(`Ты наносишь ${dmg}${crit?" КРИТИЧЕСКИЙ УДАР!":""} урона.`,"hit");$("enemySprite").classList.remove("hit");void $("enemySprite").offsetWidth;$("enemySprite").classList.add("hit");if(state.battle.hp<=0)winBattle();else setTimeout(enemyTurn,250);updateBattle();save();}
function skill(){if(!state.battle||state.hp<=0)return;const selected=getSelectedSkill();if(!selected)return;if(state.level<selected.level){openSkillInfo(state.selectedSkillId);return;}if(state.mana<selected.mana){log(`Недостаточно маны. Нужно ${selected.mana}, доступно ${Math.floor(state.mana)}.`,"system");return;}state.mana-=selected.mana;save();playerAttack(selected.mult);}
function heal(){if(!state.battle||state.hp<=0)return;if(state.healCooldown>0){log(`Лечение будет доступно через ${state.healCooldown} твоих хода.` ,"system");return;}const amount=Math.floor(state.maxHp*(.24+state.stamina*.003));state.hp=Math.min(state.maxHp,state.hp+amount);state.healCooldown=2;log(`Восстановлено ${amount} HP. Лечение снова будет доступно после 2 твоих ходов.`,`heal`);updateBattle();save();setTimeout(enemyTurn,250);}
function winBattle(){
  const b=state.battle;if(!b)return;
  if(b.worldBoss){ b.hp=0; finishWorldBossAttempt(); return; }
  if(b.arena){ state.hp=state.maxHp; state.mana=state.maxMana; state.battle=null; arenaWin(); showScreen('more'); render(); openSubscreen('arena'); return; }
  if(b.farm){
    const earnedXp=500, gold=rand(100,300);
    addXP(earnedXp); state.coins+=gold; state.achievementStats.kills++; state.achievementStats.goldEarned+=gold; state.farmKills=(state.farmKills||0)+1;
    updateQuestProgress('kills',1);
    const n=Number(state.farmKills||0)+1;
    const farmHp=Math.max(1,Math.floor((((state.maxHp*.62)+state.atk*3)*1.2)/1.3));const farmAtk=Math.max(1,Math.floor(((state.def*.95+state.atk*.16)*1.3)/1.3));state.battle={boss:false,farm:true,name:'Фарм-монстр #'+n,icon:'👹',maxHp:farmHp,hp:farmHp,atk:farmAtk,xp:500,reward:0};
    showBattle('ФАРМ-ЗОНА'); updateFarmBattleUI();
    save();
    modal('ФАРМ ЗАВЕРШЁН',`+500 XP · +${gold} золота. Лут здесь не выпадает. Следующий моб уже ждёт.`);
    return;
  }
  if(b.boss){const old=ranks[state.rank];state.rank=Math.min(ranks.length-1,state.rank+1);selectedDungeonRank=state.rank;state.battle=null;save();modal('РАНГ ПОВЫШЕН',`Ты победил испытание. Ранг ${old} → ${ranks[state.rank]}. Новые подземелья открыты.`);}else{const earnedXp=Math.floor(b.xp);addXP(earnedXp);state.coins+=b.reward;state.achievementStats.dungeons++;state.achievementStats.kills++;state.dungeonStreak=(state.dungeonStreak||0)+1;updateTitles();state.achievementStats.goldEarned+=b.reward;updateQuestProgress('dungeons',1);updateQuestProgress('kills',1);const loot=addLootFromMob(); if(loot){ensureNotices();state.notices.inventory=true;state.achievementStats.lootFound++;if(["Эпическое","Легендарное","Реликтовое","Мифическое","Адское","Божественное"].includes(loot.rarity))state.achievementStats.rareLoot++;} const chestTier=grantDungeonChest(state.rank); syncAchievementStats(); state.battle=null;save();modal('ПОДЗЕМЕЛЬЕ ПРОЙДЕНО',loot?`Получено ${earnedXp.toLocaleString()} XP, ${b.reward.toLocaleString()} золота, сундук: ${CHEST_DATA[chestTier].name} и добыча: ${loot.name} · ${loot.rarity}.`:`Получено ${earnedXp.toLocaleString()} XP, ${b.reward.toLocaleString()} золота и ${CHEST_DATA[chestTier].name}. Лут не выпал.`);}showScreen('dungeons');render();
}
function defeatBattle(){const wasWorldBoss=!!state.battle?.worldBoss;const wasArena=!!state.battle?.arena;const wasFarm=!!state.battle?.farm;if(wasWorldBoss){finishWorldBossAttempt();return;}state.battle=null;save();if(wasArena){arenaLose();showScreen("more");render();openSubscreen("arena");}else if(wasFarm){farmExit();modal("ФАРМ-ЗОНА","Ты остановил фарм. Награды за проигранный бой нет.");}else{showScreen("dungeons");render();modal("ПОРАЖЕНИЕ","Ты проиграл бой. Награда за это прохождение не получена.");}}
function leaveBattle(){const wasWorldBoss=!!state.battle?.worldBoss;const wasFarm=!!state.battle?.farm;const wasArena=!!state.battle?.arena;if(wasWorldBoss){finishWorldBossAttempt();return;}state.battle=null;save();if(wasFarm||wasArena){showScreen("more");render();openSubscreen(wasFarm?"farm":"arena");}else{showScreen("dungeons");render();}}
function dailyChestClaimed(){
  ensureAchievements();
  return state.dailyChestDay===new Date().toISOString().slice(0,10);
}
function claimDailyChest(){
  if(dailyChestClaimed()){ modal("СУНДУК ДНЯ","Сегодня ты уже забрал награду. Возвращайся завтра."); return; }
  const gold=1200+Math.floor(Math.random()*1801);
  const shadow=5+(state.loginStreak>=3?3:0);
  state.dailyChestDay=new Date().toISOString().slice(0,10);
  state.coins+=gold; state.shadowCoins+=shadow;
  state.mail=Array.isArray(state.mail)?state.mail:[];
  state.mail.push({id:"daily_"+Date.now(),from:"Система",text:`Сундук дня открыт: ${gold.toLocaleString("ru-RU")} золота · ${shadow} 🌑.`,time:Date.now(),read:false,type:"system"});
  ensureNotices(); state.notices.mail=true;
  save(); render(); openSubscreen("daily");
  modal("СУНДУК ДНЯ",`🎁 Награда получена! +${gold.toLocaleString("ru-RU")} золота · +${shadow} 🌑`);
}
const subScreens={
  inventory:["🎒 ИНВЕНТАРЬ","Предметы, снаряжение и добыча с мобов."],
  quests:["📜 ЗАДАНИЯ","Новый цикл заданий каждые 5 часов."],
  achievements:["🏅 ДОСТИЖЕНИЯ","Награды за важные достижения и серию входов."],
  titles:["🏷️ ТИТУЛЫ","Открывай титулы за прогресс, бонусы и выбирай активный."],
  chests:["🎁 СУНДУКИ","Открывай сундуки, полученные за успешные подземелья."],
  storyQuests:["📖 СЮЖЕТ","Главы истории и награды за продвижение по пути перерождения."],
  shop:["🛒 МАГАЗИН","Теневые монеты и Премиум."],
  bazaar:["🏪 БАЗАР","Выставляй свои предметы. Максимум 5 лотов."],
  mail:["📨 ПОЧТА","Системные уведомления и сообщения игроков."],
  farm:["🌾 ФАРМ-ЗОНА","Бесконечные мобы: 500 XP и 100–300 золота. Лут не выпадает."],
  rating:["🏆 РЕЙТИНГ","Игроки и рейтинг по уровню."],
  arena:["⚔️ АРЕНА","5 попыток в день против других игроков."],
  arenaRank:["🏆 РЕЙТИНГ АРЕНЫ","Рейтинг игроков на арене."],
  settings:["⚙️ НАСТРОЙКИ","Настройки персонажа и игры."],
  worldBoss:["👑 МИРОВОЙ БОСС","Общий мировой босс в офлайн-режиме. Новое появление каждые 12 часов, до 3 попыток за цикл."],
  daily:["🎁 СУНДУК ДНЯ","Ежедневная бесплатная награда за вход в игру."]
};
function equipItem(itemId){
  const item=state.inventory.find(x=>x.id===itemId);
  if(!item || !["weapon","armor","amulet"].includes(item.type)) return;
  if(item.classKey!=="all" && item.classKey!==state.playerClass){modal("ЭКИПИРОВКА",`Этот предмет предназначен для класса «${classData[item.classKey]?.name||"другого класса"}.`);return;}
  if(Number(item.itemLevel||1)>Number(state.level)){modal("ЭКИПИРОВКА",`Предмет требует ${item.itemLevel} уровня. Твой уровень: ${state.level}.`);return;}
  const old=state.equipped[item.type];
  state.inventory=state.inventory.filter(x=>x.id!==itemId);
  if(old) state.inventory.push(old);
  state.equipped[item.type]=item;
  recalc(); save(); render(); openSubscreen("inventory");
}
function unequipItem(type){
  const item=state.equipped?.[type]; if(!item)return;
  state.inventory.push(item); state.equipped[type]=null; recalc(); save(); render(); openSubscreen("inventory");
}
function openItemDetails(itemId, equippedType=null){
  const item=equippedType ? state.equipped?.[equippedType] : state.inventory.find(x=>x.id===itemId);
  if(!item)return;
  const equipable=["weapon","armor","amulet"].includes(item.type);
  const equipped=!!equippedType || Object.values(state.equipped||{}).some(x=>x?.id===item.id);
  const r=itemRarityClass(item);
  const cost=upgradeCost(item), shards=dismantleReward(item);
  const sell=Math.max(5,Math.floor((item.price||10)*.5*(state.premium?1.10:1)));
  const title=escapeHtml(item.name||"Предмет");
  const className=escapeHtml(classData[item.classKey]?.name||"Общее");
  const typeName=item.type==="armor"?"Броня":item.type==="amulet"?"Амулет":item.type==="weapon"?"Снаряжение":"Материал";
  const statHtml=itemStatLines(item).length?`<div class="detail-stats">${itemStatChips(item)}</div>`:`<div class="detail-empty-stats">Без дополнительных характеристик</div>`;
  const actions=[];
  if(equipped) actions.push(`<button class="detail-action secondary-btn" onclick="closeItemDetails();unequipItem('${equippedType||item.type}')">СНЯТЬ</button>`);
  else if(equipable) actions.push(`<button class="detail-action primary-btn" onclick="closeItemDetails();equipItem('${item.id}')">НАДЕТЬ</button>`);
  if(item.type!=="material") actions.push(`<button class="detail-action secondary-btn" onclick="closeItemDetails();upgradeItem('${item.id}')">УЛУЧШИТЬ <span><img class="inline-icon" src="img/icons/shard.png" alt=""> ${cost.shards}</span></button>`);
  actions.push(`<button class="detail-action ghost-btn" onclick="closeItemDetails();dismantle${equipped?`EquippedItem('${equippedType||item.type}')`:`Item('${item.id}')`}">РАЗОБРАТЬ <span><img class="inline-icon" src="img/icons/shard.png" alt=""> ${shards}</span></button>`);
  actions.push(`<button class="detail-action danger-btn" onclick="closeItemDetails();${equipped?`sellEquippedItem('${equippedType||item.type}')`:`sellInventoryItem('${item.id}')`}">ПРОДАТЬ <span>🪙 ${sell.toLocaleString("ru-RU")}</span></button>`);
  $("itemDetailTitle").textContent=item.name||"Предмет";
  $("itemDetailContent").innerHTML=`<div class="item-detail-icon rarity-${r}">${itemIconImg(item,"detail-img")}</div><div class="item-detail-meta"><span class="rarity-text">${escapeHtml(item.rarity)}</span><span>${typeName}</span><span>Ур. ${item.itemLevel||1}</span><span>Ул. ${item.upgradeLevel||0}</span><span>${className}</span></div>${statHtml}<div class="detail-actions">${actions.join("")}</div>`;
  $("itemDetailModal").classList.remove("hidden");
}
function closeItemDetails(){ $("itemDetailModal").classList.add("hidden"); }
function equipmentScore(item,key=state.playerClass){
  if(!item || !item.stats || item.type==="material") return -Infinity;
  if(item.classKey!=="all" && item.classKey!==key) return -Infinity;
  const weights={
    assassin:{strength:2,health:.6,defense:.6,stamina:1,critDamage:2.5,critChance:3,agility:3,dodge:1.8},
    mage:{strength:3,health:1,defense:.5,stamina:2.6,critDamage:2.5,critChance:1.5,agility:1,dodge:.5},
    paladin:{strength:1.5,health:3,defense:3,stamina:2.6,critDamage:1,critChance:.7,agility:.6,dodge:.5},
    archer:{strength:2,health:.7,defense:.7,stamina:1.2,critDamage:2.2,critChance:3,agility:3,dodge:1.6}
  }[key]||{};
  let score=0;
  for(const [stat,val] of Object.entries(item.stats||{})) score+=(Number(val)||0)*(weights[stat]||.2);
  score+=(Number(item.upgradeLevel)||0)*2;
  score+=(Number(item.itemLevel)||0)*.15;
  return score;
}
function autoEquipBest(){
  const key=state.playerClass;
  if(!key){modal("НЕТ КЛАССА","Сначала выбери класс персонажа.");return;}
  const slots=["weapon","armor","amulet"];
  let changed=0;
  for(const slot of slots){
    const current=state.equipped?.[slot]||null;
    const candidates=(state.inventory||[]).filter(x=>x.type===slot && (x.classKey==="all" || x.classKey===key));
    let best=current;
    let bestScore=equipmentScore(current,key);
    for(const item of candidates){
      const score=equipmentScore(item,key);
      if(score>bestScore+0.001){best=item;bestScore=score;}
    }
    if(best && best!==current){
      state.inventory=state.inventory.filter(x=>x.id!==best.id);
      if(current)state.inventory.push(current);
      state.equipped[slot]=best;
      changed++;
    }
  }
  if(!changed){modal("ЛУЧШЕЕ СНАРЯЖЕНИЕ","Сейчас на персонаже уже надеты лучшие доступные предметы для класса «"+classData[key].name+"».");return;}
  recalc();save();render();openSubscreen("inventory");
  modal("ЛУЧШЕЕ НАДЕТО","Автоматически экипировано: "+changed+" предмета. Подбор выполнен с учётом твоего класса и характеристик.");
}
window.autoEquipBest=autoEquipBest;

function renderInventoryItem(item){
  const r=itemRarityClass(item);
  const equipped=Object.values(state.equipped||{}).some(x=>x?.id===item.id);
  return `<button type="button" class="inventory-tile rarity-${r} ${equipped?"is-equipped":""}" onclick="openItemDetails('${item.id}')"><span class="tile-icon">${itemIconImg(item,"tile-img")}</span><span class="tile-name">${escapeHtml(item.name)}</span><span class="tile-rarity">${escapeHtml(item.rarity)}</span><span class="tile-level">Ур. ${item.itemLevel||1}${(item.upgradeLevel||0)?` · +${item.upgradeLevel}`:""}</span>${equipped?`<span class="tile-equipped">НАДЕТО</span>`:""}</button>`;
}
function equippedInventoryItem(type,item){
  if(!item)return `<button type="button" class="equipped-slot empty" onclick="modal('СЛОТ СВОБОДЕН', 'Здесь пока ничего не экипировано.')"><span class="equipped-empty-icon">+</span><div><b>${type==="weapon"?"Снаряжение":type==="armor"?"Броня":"Амулет"}</b><small>Нажми, чтобы посмотреть слот</small></div></button>`;
  return `<button type="button" class="equipped-slot filled rarity-${itemRarityClass(item)}" onclick="openItemDetails('${item.id}','${type}')"><span class="loot-icon">${itemIconImg(item)}</span><div class="loot-info"><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.rarity)} · Ур. ${item.itemLevel} · Ул. ${item.upgradeLevel||0}</small></div><span class="equipped-open">›</span></button>`;
}
function renderInventory(){
  const items=state.inventory||[];
  const selected=Array.isArray(state.inventoryDismantleRarities)?state.inventoryDismantleRarities:[];
  const rarityControls=RARITIES.map(r=>`<button class="rarity-filter ${selected.includes(r.name)?"selected":""} rarity-${r.cls}" onclick="toggleDismantleRarity('${r.name.replaceAll("'","\\'")}')">${r.name}</button>`).join("");
  const bulk=`<details class="inventory-tools"><summary>МАССОВЫЕ ДЕЙСТВИЯ <span>${selected.length?`Выбрано: ${selected.length}`:""}</span></summary><div class="inventory-bulk"><div class="bulk-top"><div><b>ФИЛЬТР РЕДКОСТИ</b><small>Выбери редкости для массового разбора</small></div></div><div class="rarity-filters">${rarityControls}</div><div class="bulk-actions"><button class="item-action danger-btn" onclick="sellAllInventory()">ПРОДАТЬ ВСЁ</button><button class="item-action secondary-btn" onclick="dismantleSelectedRarities()">РАЗОБРАТЬ ВЫБРАННОЕ</button></div></div></details>`;
  const equipped=`<div class="equipped-panel"><div class="inventory-head"><div><b>ЭКИПИРОВАНО</b><small>Нажми на слот, чтобы открыть действия</small></div><div class="equipped-head-actions"><button type="button" class="auto-equip-btn" onclick="autoEquipBest()">НАДЕТЬ ЛУЧШЕЕ</button><span>+${Object.values(equipmentBonusStats()).reduce((a,b)=>a+b,0)} статов</span></div></div><div class="equipped-grid">${equippedInventoryItem("weapon",state.equipped?.weapon)}${equippedInventoryItem("armor",state.equipped?.armor)}${equippedInventoryItem("amulet",state.equipped?.amulet)}</div></div>`;
  return `${equipped}<div class="inventory-head"><div><b>ИНВЕНТАРЬ</b><small>Нажми на предмет, чтобы посмотреть описание и действия</small></div><span><img class="inline-icon" src="img/icons/shard.png" alt=""> ${state.shards||0}</span></div>${bulk}${items.length?`<div class="loot-grid inventory-tiles">${items.slice().reverse().map(renderInventoryItem).join("")}</div>`:`<div class="inventory-empty"><div><img class="inline-icon" src="img/icons/inventory.png" alt=""></div><h2>Инвентарь пуст</h2><p>Снаряжение выпадает после побед над монстрами.</p></div>`}`;
}
function sellEquippedItem(type){
  const item=state.equipped?.[type]; if(!item)return;
  const value=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*(state.premium?1.10:1)));
  state.equipped[type]=null; state.coins+=value; recalc(); save(); render(); openSubscreen("inventory"); modal("ПРЕДМЕТ ПРОДАН",`${item.icon} ${item.name} продан за 🪙 ${value.toLocaleString("ru-RU")}.`);
}
function dismantleEquippedItem(type){
  const item=state.equipped?.[type]; if(!item)return; const gain=dismantleReward(item); state.equipped[type]=null; state.shards+=gain; recalc(); save(); render(); openSubscreen("inventory"); modal("ПРЕДМЕТ РАЗОБРАН",`${item.icon} ${item.name} разобран. Получено <img class="inline-icon" src="img/icons/shard.png" alt=""> ${gain} осколков.`);
}

function toggleDismantleRarity(rarity){
  const list=Array.isArray(state.inventoryDismantleRarities)?state.inventoryDismantleRarities:[];
  state.inventoryDismantleRarities=list.includes(rarity)?list.filter(x=>x!==rarity):[...list,rarity];
  save();render();openSubscreen("inventory");
}
function sellAllInventory(){
  const items=(state.inventory||[]).filter(x=>!Object.values(state.equipped||{}).some(e=>e?.id===x.id));
  if(!items.length){modal("МАССОВАЯ ПРОДАЖА","В инвентаре нет предметов для продажи.");return;}
  let total=0;
  for(const item of items) total+=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*(state.premium?1.10:1)));
  state.inventory=[]; state.coins+=total; state.notices.inventory=false; save(); render(); openSubscreen("inventory");
  modal("ВСЁ ПРОДАНО",`Продано предметов: ${items.length}. Получено 🪙 ${total.toLocaleString("ru-RU")}.`);
}
function dismantleSelectedRarities(){
  const selected=Array.isArray(state.inventoryDismantleRarities)?state.inventoryDismantleRarities:[];
  if(!selected.length){modal("МАССОВЫЙ РАЗБОР","Сначала выбери хотя бы одну редкость.");return;}
  const keep=[]; let count=0,gain=0;
  for(const item of state.inventory||[]){
    const equipped=Object.values(state.equipped||{}).some(e=>e?.id===item.id);
    if(!equipped && selected.includes(item.rarity)){gain+=dismantleReward(item);count++;} else keep.push(item);
  }
  state.inventory=keep; state.shards+=gain; state.inventoryDismantleRarities=[]; save(); render(); openSubscreen("inventory");
  modal("МАССОВЫЙ РАЗБОР",count?`Разобрано предметов: ${count}. Получено <img class="inline-icon" src="img/icons/shard.png" alt=""> ${gain} осколков.`:"Под выбранные редкости ничего не найдено.");
}
function upgradeItem(itemId){
  const item=state.inventory.find(x=>x.id===itemId) || Object.values(state.equipped||{}).find(x=>x?.id===itemId);
  if(!item || item.type==="material"){modal("УЛУЧШЕНИЕ","Этот предмет нельзя улучшить.");return;}
  const cost=upgradeCost(item);
  if(state.shards<cost.shards || state.coins<cost.gold){modal("НЕДОСТАТОЧНО РЕСУРСОВ",`Нужно <img class="inline-icon" src="img/icons/shard.png" alt=""> ${cost.shards} осколков и 🪙 ${cost.gold.toLocaleString("ru-RU")} золота.`);return;}
  state.shards-=cost.shards;state.coins-=cost.gold;item.upgradeLevel=(Number(item.upgradeLevel)||0)+1;state.achievementStats.upgrades++;item.stats=generateEquipmentStats(item.type,item.itemLevel,item.rarity,item.upgradeLevel);item.price=Math.max(10,Math.floor(item.itemLevel*item.itemLevel*1.8*rarityByName(item.rarity).mult*(1+item.upgradeLevel*.12)));recalc();syncAchievementStats();save();render();openSubscreen("inventory");
}
function dismantleItem(itemId){
  const i=state.inventory.findIndex(x=>x.id===itemId);if(i<0)return;
  const item=state.inventory[i];const gain=dismantleReward(item);state.inventory.splice(i,1);state.shards+=gain;save();render();openSubscreen("inventory");modal("ПРЕДМЕТ РАЗОБРАН",`${item.icon} ${item.name} разобран. Получено <img class="inline-icon" src="img/icons/shard.png" alt=""> ${gain} осколков.`);
}
function sellInventoryItem(itemId){
  const item=state.inventory.find(x=>x.id===itemId);
  if(!item) return;
  const saleMult=state.premium?1.10:1;
  const value=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*saleMult));
  state.inventory=state.inventory.filter(x=>x.id!==itemId);
  state.coins+=value;
  save(); render(); openSubscreen("inventory");
  modal("ПРЕДМЕТ ПРОДАН",`${item.icon} ${item.name} продан за 🪙 ${value.toLocaleString("ru-RU")}.`);
}
function promptBazaarPrice(itemId){
  if(state.bazaarLots.length>=5){modal("БАЗАР","Лимит 5 лотов уже достигнут.");return;}
  const item=state.inventory.find(x=>x.id===itemId);if(!item)return;
  const price=window.prompt(`Цена за «${item.name}» в золоте:`,String(item.price));
  if(price===null)return;
  if(!Number.isFinite(Number(price))||Number(price)<=0){modal("БАЗАР","Укажи положительную цену в золоте.");return;}
  createBazaarLot(itemId,Number(price));
}
function renderBazaar(){
  const lots=state.bazaarLots||[];
  const myLots=lots;
  const available=(state.inventory||[]).filter(x=>x.type!=="material");
  const lotHtml=(lot)=>`<div class="loot-item rarity-${itemRarityClass(lot.item)}"><span class="loot-icon">${itemIconImg(lot.item)}</span><div class="loot-info"><b>${escapeHtml(lot.item.name)}</b><small>${lot.item.rarity} · Ур. ${lot.item.itemLevel} · ${classData[lot.item.classKey]?.name||"Общее"}</small></div><strong class="lot-price">🪙 ${lot.price.toLocaleString("ru-RU")}</strong><button class="ghost-btn loot-sell" onclick="cancelBazaarLot('${lot.id}')">СНЯТЬ</button></div>`;
  return `<div class="sub-balance">🏪 <b>${lots.length}</b> / 5 лотов · 🪙 ${state.coins.toLocaleString("ru-RU")}</div>
    <div class="bazaar-note">🏪 Офлайн-базар: лоты сохраняются только на этом устройстве и не видны другим игрокам.</div>
    <h3 class="bazaar-section-title">МОИ ЛОТЫ</h3>${myLots.length?`<div class="loot-list">${myLots.map(lotHtml).join("")}</div>`:`<div class="bazaar-empty">Пока ничего не выставлено.</div>`}
    <h3 class="bazaar-section-title">ВЫСТАВИТЬ СНАРЯЖЕНИЕ</h3>${available.length?`<div class="loot-list bazaar-pick">${available.map(item=>`<div class="loot-item rarity-${itemRarityClass(item)}"><span class="loot-icon">${itemIconImg(item)}</span><div class="loot-info"><b>${item.name}</b><small>${item.rarity} · Ур. ${item.itemLevel} · ${classData[item.classKey]?.name||"Общее"}</small></div><button class="primary-btn bazaar-add" onclick="promptBazaarPrice('${item.id}')">ВЫСТАВИТЬ</button></div>`).join("")}</div>`:`<div class="bazaar-empty">В инвентаре нет снаряжения для выставления.</div>`}`;
}
function renderQuests(){
  ensureNotices();
  refreshQuestCycle(false);
  const done=allQuestsDone();
  const claimed=!!state.questClaimed;
  return `<div class="quest-cycle"><span>⏱️ Обновление через</span><b>${questTimeLeft()}</b></div>
    <div class="quest-list">${state.quests.map(q=>{const pct=Math.min(100,q.progress/q.target*100);const qDone=q.progress>=q.target;return `<div class="quest-item ${claimed?"claimed":""}"><div class="quest-row"><span>${q.icon}</span><div><b>${q.name}</b><small>${Math.floor(q.progress).toLocaleString("ru-RU")} / ${q.target.toLocaleString("ru-RU")}${qDone?" · ВЫПОЛНЕНО":""}</small></div></div><div class="quest-bar"><div style="width:${pct}%"></div></div></div>`}).join("")}</div>
    <div class="quest-reward ${claimed?"claimed":""}"><b>🏆 НАГРАДА ЗА ВСЕ ЗАДАНИЯ</b><span>🪙 2 000 · 🌑 20 · ✨ 10 000 XP</span></div>
    <button class="primary-btn quest-claim-btn ${claimed?"claimed-btn":""}" onclick="claimQuestReward()" ${done&&!claimed?"":"disabled"}>${claimed?"✓ НАГРАДА УЖЕ ПОЛУЧЕНА":done?"ЗАБРАТЬ НАГРАДУ":"ВЫПОЛНИ ВСЕ ЗАДАНИЯ"}</button>`;
}
function renderSettings(){
  const current=state.playerClass?classData[state.playerClass].name:"Не выбран";
  const firstFree=Number(state.classChangeCount||0)===0;
  const cost=firstFree?0:100;
  const currentIcon=state.playerClass?classUiIcon(state.playerClass):classUiIcon("mage");
  const options=Object.entries(classData).map(([key,c])=>`<button type="button" class="class-option ${key===state.playerClass?"selected":""}" data-class-key="${key}">${classUiIcon(key)}<span><b>${c.name}</b><small>${key===state.playerClass?"ТЕКУЩИЙ":"Выбрать класс"}</small></span>${key===state.playerClass?'<strong>✓</strong>':''}</button>`).join("");
  return `<div class="settings-list">
    <div class="settings-card"><div><b>Имя персонажа</b><small>${escapeHtml(state.playerName||"Пробуждённый")}</small></div><button class="ghost-btn" onclick="changePlayerName()">ИЗМЕНИТЬ</button></div>
    <div class="settings-card class-change-card"><div><b>Класс персонажа</b><small>${current} · ${firstFree?"первая смена бесплатно":"следующая смена — 100 теневых монет"}</small></div><div class="settings-class-controls"><button type="button" class="class-picker" data-selected="${state.playerClass||"mage"}" >${currentIcon}<span>${current}</span><i>⌄</i></button><button class="ghost-btn" onclick="changeCharacterClass()">СМЕНИТЬ</button></div><div id="classPickerMenu" class="class-picker-menu">${options}</div></div>
    <div class="settings-note">Смена класса сохраняет уровень, ранг и опыт. Вложенные очки возвращаются в запас для повторного распределения. Несовместимая экипировка снимается.</div>
    <div class="class-change-cost"><span>Стоимость следующей смены</span><b>${cost===0?"БЕСПЛАТНО":`<img src="img/icons/shadow.png" alt=""> ${cost}`}</b></div>
  </div>`;
}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
function changePlayerName(){
  const next=window.prompt("Новое имя персонажа:",state.playerName||"Пробуждённый");
  if(next===null)return;
  const name=next.trim().slice(0,24);
  if(!name){modal("ИМЯ","Имя не может быть пустым.");return;}
  state.playerName=name;save();render();openSubscreen("settings");
}
function classPickerClose(){
  const picker=document.getElementById("classPickerMenu");
  if(!picker)return;
  picker.classList.remove("open");
  const host=document.querySelector(".class-change-card");
  if(host && picker.parentElement!==host) host.appendChild(picker);
}
function classPickerPosition(){
  const picker=document.getElementById("classPickerMenu");
  const trigger=document.querySelector(".class-picker");
  if(!picker||!trigger)return;
  const r=trigger.getBoundingClientRect();
  const gap=7;
  const menuW=Math.min(220,Math.max(180,window.innerWidth-24));
  picker.style.width=`${menuW}px`;
  picker.style.maxWidth=`calc(100vw - 24px)`;
  const menuH=Math.min(picker.scrollHeight+12,Math.min(340,window.innerHeight-24));
  let left=Math.min(Math.max(12,r.right-menuW),window.innerWidth-menuW-12);
  let top=r.bottom+gap;
  if(top+menuH>window.innerHeight-12) top=Math.max(12,r.top-menuH-gap);
  picker.style.left=`${left}px`;
  picker.style.top=`${top}px`;
}
function selectClassOption(key){
  if(!classData[key])return;
  const picker=document.getElementById("classPickerMenu");
  const trigger=document.querySelector(".class-picker");
  if(trigger){
    trigger.dataset.selected=key;
    trigger.innerHTML=classUiIcon(key)+`<span>${classData[key].name}</span><i>⌄</i>`;
  }
  document.querySelectorAll(".class-option").forEach(btn=>btn.classList.toggle("selected",btn.dataset.classKey===key));
  classPickerClose();
}
function toggleClassPicker(e){
  if(e){e.preventDefault();e.stopPropagation();}
  const picker=document.getElementById("classPickerMenu");
  const trigger=document.querySelector(".class-picker");
  if(!picker||!trigger)return;
  if(picker.classList.contains("open")){classPickerClose();return;}
  // Move the menu out of the settings card so no parent overflow/stacking context can clip it.
  document.body.appendChild(picker);
  picker.classList.add("open");
  classPickerPosition();
}
window.toggleClassPicker=toggleClassPicker;
window.selectClassOption=selectClassOption;
window.changeCharacterClass=changeCharacterClass;
window.addEventListener("resize",()=>{
  const picker=document.getElementById("classPickerMenu");
  if(picker?.classList.contains("open"))classPickerPosition();
});
document.addEventListener("pointerdown",e=>{
  const option=e.target.closest?.(".class-option");
  if(option){
    e.preventDefault();e.stopPropagation();
    const key=option.dataset.classKey;
    if(key)selectClassOption(key);
    return;
  }
  const trigger=e.target.closest?.(".class-picker");
  if(trigger){
    e.preventDefault();e.stopPropagation();
    toggleClassPicker(e);
    return;
  }
  const picker=document.getElementById("classPickerMenu");
  if(picker?.classList.contains("open") && !e.target.closest?.("#classPickerMenu"))classPickerClose();
},{passive:false});

function changeCharacterClass(){
  const key=document.querySelector(".class-picker")?.dataset.selected || state.playerClass;
  if(!key||key===state.playerClass){modal("КЛАСС","Выбери другой класс.");return;}
  const cost=Number(state.classChangeCount||0)>0?100:0;
  if(cost>0 && state.shadowCoins<cost){modal("НЕДОСТАТОЧНО","Для следующей смены класса нужно 100 теневых монет.");return;}
  if(cost>0) state.shadowCoins-=cost;
  state.classChangeCount=Number(state.classChangeCount||0)+1;
  state.statPoints += totalSpent();
  state.spentStats=defaultStats();
  if(state.equipped?.weapon && state.equipped.weapon.classKey!==key){ state.inventory.push(state.equipped.weapon); state.equipped.weapon=null; }
  if(state.equipped?.armor && state.equipped.armor.classKey!==key){ state.inventory.push(state.equipped.armor); state.equipped.armor=null; }
  if(state.equipped?.amulet && state.equipped.amulet.classKey!==key){ state.inventory.push(state.equipped.amulet); state.equipped.amulet=null; }
  state.playerClass=key;
  state.evolution=null;
  state.inventory.forEach(item=>{if(item.classKey===undefined) item.classKey=item.type==="material"?"all":key;});
  recalc();
  state.hp=state.maxHp;
  state.mana=state.maxMana;
  save();render();openSubscreen("settings");
  modal("КЛАСС ИЗМЕНЁН",`Теперь твой персонаж — ${classData[key].name}. ${cost===0?"Первая смена была бесплатной.":"Потрачено 100 теневых монет."}`);
}

function showSystemScan(){
  updateTitles();
  const power=Math.max(0,Math.floor((state.atk||0)+(state.def||0)*1.35+(state.maxHp||0)/18+(state.crit||0)*4+(state.critDamage||0)*1.5+(state.level||1)*12));
  const nextXp=Math.max(0,(state.xpNeed||0)-(state.xp||0));
  const title=state.selectedTitle||"Без титула";
  modal("СКАНИРОВАНИЕ СИСТЕМЫ",`🏷️ Титул: ${title}\n⚔️ Боевая мощь: ${power.toLocaleString("ru-RU")}\n📈 Уровень: ${state.level} · Ранг: ${ranks[state.rank]||"F"}\n⚡ Энергия: ${Math.floor(state.energy)}/${maxEnergy()}\n🎯 До следующего уровня: ${nextXp.toLocaleString("ru-RU")} XP`);
}
function openSubscreen(type,refreshOnly=false){
  ensureNotices();
  if(["inventory","quests","mail"].includes(type)) state.notices[type]=false;
  const data=subScreens[type];
  $("subscreenTitle").textContent=data[0];
  if(type==="daily") {
    const claimed=dailyChestClaimed();
    $("subscreenContent").innerHTML=`<div class="daily-chest-card"><div class="daily-chest-icon">🎁</div><h2>СУНДУК ДНЯ</h2><p>Каждый день можно открыть один сундук.</p><div class="daily-reward-preview">🪙 1 200–3 000 · 🌑 5${state.loginStreak>=3?" + 3 за серию входов":""}</div><button class="primary-btn" onclick="claimDailyChest()" ${claimed?"disabled":""}>${claimed?"✓ УЖЕ ОТКРЫТ СЕГОДНЯ":"ОТКРЫТЬ СУНДУК"}</button></div>`;
  } else if(type==="shop") {
    $("subscreenContent").innerHTML=`<div class="sub-shop-balance">🌑 <b>${state.shadowCoins.toLocaleString("ru-RU")}</b></div><div class="shop-items">
      <div class="shop-item"><div class="shop-item-icon">🌑</div><div class="shop-item-info"><b>100 теневых монет</b><small>Премиальная валюта · ⭐ Stars</small></div><button onclick="buyShadowCoins(100,10)">⭐ 10</button></div>
      <div class="shop-item"><div class="shop-item-icon">🌑</div><div class="shop-item-info"><b>550 теневых монет</b><small>Бонусный пакет · ⭐ Stars</small></div><button onclick="buyShadowCoins(550,50)">⭐ 50</button></div>
      <div class="shop-item"><div class="shop-item-icon">🌑</div><div class="shop-item-info"><b>1200 теневых монет</b><small>Большой пакет · ⭐ Stars</small></div><button onclick="buyShadowCoins(1200,100)">⭐ 100</button></div>
      <div class="shop-item"><div class="shop-item-icon">🪙</div><div class="shop-item-info"><b>65 обычных монет</b><small>1 🌑 = 65 🪙</small></div><button onclick="buyGoldForShadow(1)">🌑 1</button></div>
      <div class="shop-item"><div class="shop-item-icon">🪙</div><div class="shop-item-info"><b>650 обычных монет</b><small>10 🌑 = 650 🪙</small></div><button onclick="buyGoldForShadow(10)">🌑 10</button></div>
      <div class="shop-item"><div class="shop-item-icon">🪙</div><div class="shop-item-info"><b>6 500 обычных монет</b><small>100 🌑 = 6 500 🪙</small></div><button onclick="buyGoldForShadow(100)">🌑 100</button></div>
      <div class="shop-item energy-buy"><div class="shop-item-icon">⚡</div><div class="shop-item-info"><b>Восстановить 100 энергии</b><small>80 🌑 · максимум 10 раз в день</small></div><button onclick="restoreEnergyForShadow()">🌑 80</button></div>
      <div class="premium-card compact-premium"><b>👑 ПРЕМИУМ</b><small>В офлайн-версии покупка через Telegram Stars отключена. Бонусы Premium остаются в системе и будут доступны после подключения оплаты.</small></div>
    </div>`;
  } else if(type==="quests") {
    $("subscreenContent").innerHTML=renderQuests();
  } else if(type==="titles") {
    $("subscreenContent").innerHTML=renderTitles();
  } else if(type==="chests") {
    $("subscreenContent").innerHTML=renderChests();
  } else if(type==="storyQuests") {
    $("subscreenContent").innerHTML=renderStoryQuests();
  } else if(type==="achievements") {
    $("subscreenContent").innerHTML=renderAchievements();
  } else if(type==="inventory") {
    $("subscreenContent").innerHTML=renderInventory();
  } else if(type==="bazaar") {
    $("subscreenContent").innerHTML=renderBazaar();
  } else if(type==="mail") {
    $("subscreenContent").innerHTML=renderMail();
  } else if(type==="farm") {
    $("subscreenContent").innerHTML=`<div class="farm-panel"><div class="farm-icon">🌾</div><h2>БЕСКОНЕЧНАЯ ФАРМ-ЗОНА</h2><p>Каждый моб даёт ровно <b>500 XP</b> и случайно <b>100–300 золота</b>. Лут не выпадает.</p><div class="farm-rule">⚠️ Авто-бой здесь недоступен.</div><button class="primary-btn" onclick="startFarmZone()">НАЧАТЬ ФАРМ</button></div>`;
  } else if(type==="rating") {
    $("subscreenContent").innerHTML=renderRating();
  } else if(type==="arena") {
    $("subscreenContent").innerHTML=renderArena();
  } else if(type==="arenaRank") {
    $("subscreenContent").innerHTML=renderArenaRank();
  } else if(type==="worldBoss") {
    $("subscreenContent").innerHTML=renderWorldBoss();
  } else if(type==="settings") {
    $("subscreenContent").innerHTML=renderSettings();
  } else {
    $("subscreenContent").innerHTML=`<div class="sub-big-icon">${data[0].slice(0,2)}</div><h2>${data[0].replace(/^\S+ /,"")}</h2><p>${data[1]}</p>`;
  }
  showScreen("sub");
}
function closeSubscreen(){showScreen("more");render();}
function openShop(){openSubscreen("shop");}
function restoreEnergyForShadow(){
  const day=new Date().toISOString().slice(0,10);
  if(state.energyRestoreDay!==day){state.energyRestoreDay=day;state.energyRestoreCount=0;}
  if((state.energyRestoreCount||0)>=10){modal("МАГАЗИН","Сегодня уже использовано 10 восстановлений энергии.");return;}
  if(state.shadowCoins<80){modal("НЕДОСТАТОЧНО","Нужно 80 теневых монет.");return;}
  state.shadowCoins-=80;state.energy=Math.min(state.energy+100,maxEnergy());state.energyRestoreCount=(state.energyRestoreCount||0)+1;save();render();openSubscreen("shop");
  modal("ЭНЕРГИЯ ВОССТАНОВЛЕНА","+100 энергии. Использовано сегодня: "+state.energyRestoreCount+"/10.");
}
function buyShadowCoins(amount,stars){modal("МАГАЗИН","Покупка теневых монет за Stars отключена в офлайн-версии.");}
function buyGoldForShadow(shadow){
  shadow=Math.max(1,Math.floor(Number(shadow)||0));
  if(state.shadowCoins<shadow){modal("НЕДОСТАТОЧНО","Нужно 🌑 "+shadow+" теневых монет.");return;}
  state.shadowCoins-=shadow; state.coins+=shadow*65; save(); render(); openSubscreen("shop");
  modal("ОБМЕН ВЫПОЛНЕН",`Получено 🪙 ${(shadow*65).toLocaleString("ru-RU")} за 🌑 ${shadow}.`);
}
/* Premium payment is intentionally disabled in the offline build. */
async function buyPremium(){
  modal("ПРЕМИУМ","Покупка Premium временно отключена в офлайн-версии.");
}

function autoBattle(){
  if(!state.premium){ modal("НУЖЕН ПРЕМИУМ","Авто-бой доступен только после покупки Премиума ⭐100."); return; }
  if(!state.battle) return;
  if(state.battle.farm){modal("ФАРМ-ЗОНА","Авто-бой здесь недоступен.");return;}
  const b=state.battle;
  let hp=state.maxHp, mana=state.maxMana, enemyHp=b.maxHp, turns=0, healCooldown=0;
  const selected=getSelectedSkill();
  const skillCost=selected?.mana||classData[state.playerClass].skillCost;
  const skillMult=selected?.mult||1.5;
  log("🤖 Авто-бой начал сражение по тактике игрока.","system");
  while(hp>0 && enemyHp>0 && turns<250){
    turns++;
    const healAmount=Math.floor(state.maxHp*(.24+state.stamina*.003));
    let didHeal=false;
    if(hp/state.maxHp<0.42 && hp<state.maxHp && healCooldown<=0){
      hp=Math.min(state.maxHp,hp+healAmount);
      healCooldown=2;
      didHeal=true;
    } else if(mana>=skillCost && enemyHp>state.atk*1.15){
      mana-=skillCost;
      let dmg=Math.floor(state.atk*(.9+Math.random()*.2)*skillMult);
      if(Math.random()*100<state.crit)dmg=Math.floor(dmg*(1+state.critDamage/100));
      enemyHp=Math.max(0,enemyHp-dmg);
    } else {
      let dmg=Math.floor(state.atk*(.9+Math.random()*.2));
      if(Math.random()*100<state.crit)dmg=Math.floor(dmg*(1+state.critDamage/100));
      enemyHp=Math.max(0,enemyHp-dmg);
    }
    if(healCooldown>0 && !didHeal) healCooldown=Math.max(0,healCooldown-1);
    if(enemyHp<=0) break;
    if(Math.random()>=state.dodge/100){
      const raw=b.atk*(.85+Math.random()*.3);
      hp=Math.max(0,hp-Math.max(1,Math.floor(raw-state.def*.38)));
    }
  }
  state.hp=hp; state.mana=mana; state.healCooldown=healCooldown; b.hp=Math.max(0,enemyHp); updateBattle();
  if(enemyHp<=0){ b.hp=0; winBattle(); } else { defeatBattle(); }
}


// HARD SAVE: persist immediately after every user action and before the WebView is hidden/closed.
// The microtask runs after the action handler has finished changing state, so the newest state is saved.
function saveAfterAction(){ queueMicrotask(()=>save()); }
document.addEventListener("click",saveAfterAction,{capture:false});
document.addEventListener("change",saveAfterAction,{capture:false});
document.addEventListener("input",saveAfterAction,{capture:false});
document.addEventListener("submit",saveAfterAction,{capture:false});
document.addEventListener("keyup",e=>{ if(e.key==="Enter" || e.key==="Escape") saveAfterAction(); },{capture:false});
document.addEventListener("visibilitychange",()=>{regenEnergy(); save(); if(!document.hidden) render();});
window.addEventListener("pagehide",()=>{regenEnergy(); save();});
window.addEventListener("beforeunload",()=>{regenEnergy(); save();});
window.addEventListener("error",()=>save());
window.addEventListener("unhandledrejection",()=>save());
function showScreen(name){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$("screen-"+name).classList.add("active");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));}
function modal(title,text){$("modalTitle").textContent=title;$("modalText").innerHTML=String(text).replace(/\n/g,"<br>");$("modal").classList.remove("hidden");}
$("modalClose").onclick=()=>{$("modal").classList.add("hidden");render();};
document.querySelectorAll(".class-card").forEach(b=>b.onclick=()=>selectClass(b.dataset.class));
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));
const chatForm=$("chatForm"); if(chatForm){chatForm.addEventListener("submit",e=>{e.preventDefault();const input=$("chatInput");sendChatMessage(input.value);input.value="";input.focus();});}
ensureChat();
$("rankUpBtn").onclick=rankUp;$("attackBtn").onclick=()=>playerAttack(1);$("skillBtn").onclick=skill;$("healBtn").onclick=heal;$("leaveBattle").onclick=leaveBattle;
const iconObserver=new MutationObserver(()=>queueMicrotask(replaceRenderedEmoji));
iconObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
queueMicrotask(replaceRenderedEmoji);

setInterval(()=>{save();},500);
setInterval(()=>{regenEnergy();premiumDaily();resetArenaDay();render();},15000);
