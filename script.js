const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const ranks = ["F","E","D","C","B","A","AA","S","SS","SSS"];
const classData = {
  assassin:{name:"Ассасин",icon:"☠️",atk:30,def:11,hp:115,mana:105,skillCost:17,stats:{strength:12,health:15,defense:6,stamina:9,critDamage:30,critChance:10,agility:16,dodge:6},skill:"Смертельный удар",evo:[["Теневой убийца","Критический урон и шанс уклонения."],["Призрачный клинок","Высокая скорость атак и усиленный крит."]]},
  mage:{name:"Чародей",icon:"🔮",atk:28,def:10,hp:110,mana:160,skillCost:31,stats:{strength:10,health:15,defense:5,stamina:15,critDamage:31,critChance:8,agility:8,dodge:2.5},skill:"Разрыв маны",evo:[["Архимаг","Мощные заклинания и пробитие защиты."],["Повелитель Бездны","Тёмная магия с огромным уроном по площади."]]},
  paladin:{name:"Паладин",icon:"🛡️",atk:23,def:24,hp:330,mana:125,skillCost:21,stats:{strength:9,health:26,defense:15,stamina:15,critDamage:22,critChance:4,agility:6,dodge:1.5},skill:"Кара Света",evo:[["Святой страж","Щиты, защита и усиленное лечение."],["Рыцарь Апокалипсиса","Высокая защита превращается в силу атаки."]]},
  archer:{name:"Лучник",icon:"🏹",atk:28,def:13,hp:122,mana:118,skillCost:19,stats:{strength:11,health:17,defense:8,stamina:11,critDamage:28,critChance:8,agility:14,dodge:4},skill:"Залп стрел",evo:[["Охотник","Дальний критический урон и скорость."],["Небесный стрелок","Усиленные залпы и шанс двойной атаки."]]}
};

// 4 навыка на каждый класс: стартовый, 5, 10 и 20 уровень.
// Навык можно прочитать до открытия, но применить в бою — только после нужного уровня.
const classSkills = {
  assassin:[
    {name:"Теневой удар",mana:70,mult:1.55,level:1,desc:"Быстрая атака из тени с повышенным уроном."},
    {name:"Кровавая метка",mana:119,mult:2.00,level:5,desc:"Сильный удар по отмеченной цели."},
    {name:"Призрачный рывок",mana:175,mult:2.65,level:10,desc:"Молниеносная серия ударов с большим множителем урона."},
    {name:"Смертельная тень",mana:262,mult:3.85,level:20,desc:"Мощнейший приём ассасина с огромным разовым уроном."}
  ],
  mage:[
    {name:"Магический импульс",mana:105,mult:1.45,level:1,desc:"Сгусток магии, наносящий стабильный урон."},
    {name:"Огненный разрыв",mana:182,mult:2.15,level:5,desc:"Взрывная магическая атака с высоким уроном."},
    {name:"Грозовой поток",mana:273,mult:2.95,level:10,desc:"Мощный поток энергии, пробивающий защиту цели."},
    {name:"Падение Бездны",mana:402,mult:4.35,level:20,desc:"Предельное заклинание чародея с колоссальным уроном."}
  ],
  paladin:[
    {name:"Световой удар",mana:77,mult:1.40,level:1,desc:"Удар силой света, надёжный и экономный по мане."},
    {name:"Кара хранителя",mana:133,mult:1.90,level:5,desc:"Усиленная атака паладина, сочетающая силу и защиту."},
    {name:"Святое правосудие",mana:210,mult:2.60,level:10,desc:"Мощная кара против врага."},
    {name:"Небесный приговор",mana:315,mult:3.70,level:20,desc:"Высший приговор паладина, наносящий огромный урон."}
  ],
  archer:[
    {name:"Точный выстрел",mana:63,mult:1.50,level:1,desc:"Точный дальний удар с хорошим уроном за небольшую ману."},
    {name:"Шквал стрел",mana:112,mult:1.95,level:5,desc:"Серия быстрых попаданий по одной цели."},
    {name:"Пробивающий залп",mana:175,mult:2.70,level:10,desc:"Сильный залп с повышенным уроном."},
    {name:"Небесный град",mana:273,mult:3.90,level:20,desc:"Мощнейший залп лучника с огромным множителем."}
  ]
};

const dungeonTemplates = [
  ["Тёмный лес","🌲","F",1,120,400,12,24,200,350],
  ["Пещеры Эха","🕳️","E",1,420,900,38,60,450,700],
  ["Чёрная шахта","⛏️","D",1,900,1800,75,115,900,1350],
  ["Лабиринт крови","🩸","C",1,Math.floor(3200*Math.pow(2.15,0)),Math.floor(3200*Math.pow(2.15,0)*1.8),Math.floor(190*Math.pow(1.72,0)),Math.floor(190*Math.pow(1.72,0)*1.45),2200,3300],
  ["Город мёртвых","🏚️","B",1,Math.floor(3200*Math.pow(2.15,1)),Math.floor(3200*Math.pow(2.15,1)*1.8),Math.floor(190*Math.pow(1.72,1)),Math.floor(190*Math.pow(1.72,1)*1.45),Math.floor(2200*Math.pow(1.85,1)),Math.floor(2200*Math.pow(1.85,1)*1.5)],
  ["Небесная цитадель","🏯","A",1,Math.floor(3200*Math.pow(2.15,2)),Math.floor(3200*Math.pow(2.15,2)*1.8),Math.floor(190*Math.pow(1.72,2)),Math.floor(190*Math.pow(1.72,2)*1.45),Math.floor(2200*Math.pow(1.85,2)),Math.floor(2200*Math.pow(1.85,2)*1.5)],
  ["Земля великанов","🗻","AA",1,Math.floor(3200*Math.pow(2.15,3)),Math.floor(3200*Math.pow(2.15,3)*1.8),Math.floor(190*Math.pow(1.72,3)),Math.floor(190*Math.pow(1.72,3)*1.45),Math.floor(2200*Math.pow(1.85,3)),Math.floor(2200*Math.pow(1.85,3)*1.5)],
  ["Небесный разлом","☁️","S",1,Math.floor(3200*Math.pow(2.15,4)),Math.floor(3200*Math.pow(2.15,4)*1.8),Math.floor(190*Math.pow(1.72,4)),Math.floor(190*Math.pow(1.72,4)*1.45),Math.floor(2200*Math.pow(1.85,4)),Math.floor(2200*Math.pow(1.85,4)*1.5)],
  ["Предел хаоса","🌀","SS",1,Math.floor(3200*Math.pow(2.15,5)),Math.floor(3200*Math.pow(2.15,5)*1.8),Math.floor(190*Math.pow(1.72,5)),Math.floor(190*Math.pow(1.72,5)*1.45),Math.floor(2200*Math.pow(1.85,5)),Math.floor(2200*Math.pow(1.85,5)*1.5)],
  ["Врата апокалипсиса","☄️","SSS",1,Math.floor(3200*Math.pow(2.15,6)),Math.floor(3200*Math.pow(2.15,6)*1.8),Math.floor(190*Math.pow(1.72,6)),Math.floor(190*Math.pow(1.72,6)*1.45),Math.floor(2200*Math.pow(1.85,6)),Math.floor(2200*Math.pow(1.85,6)*1.5)]
];

const SAVE_KEY="rebirth_begin_save_v79";
const BACKUP_SAVE_KEY="rebirth_begin_save_backup";
const SAVE_VERSION=79;
const OLD_SAVE_KEY="rebirth_begin_save";
let saveReady=false;
let hadExistingSave=false;
const defaultStats = () => ({strength:0,health:0,defense:0,stamina:0,critDamage:0,critChance:0,agility:0,dodge:0});
let state = {
  playerClass:null,evolution:null,rebirth:false,rebirthName:"",classChangeCount:0,level:1,xp:0,coins:750,shadowCoins:0,rank:0,energy:100,maxEnergy:100,lastEnergyTick:Date.now(),premium:false,premiumUntil:0,premiumLastDaily:"",playerName:"Пробуждённый",
  hp:0,maxHp:0,atk:0,def:0,crit:0,critDamage:0,agility:0,dodge:0,stamina:0,maxMana:0,mana:null,
  statPoints:0,spentStats:defaultStats(),battle:null,selectedSkillId:0,healCooldown:0,inventory:[],equipped:{weapon:null,armor:null,amulet:null,artifact:null},bazaarLots:[],questCycleStart:0,questClaimed:false,quests:null,energyRestoreDay:"",energyRestoreCount:0,shards:0,arenaDay:"",arenaAttempts:0,arenaRating:1000,mail:[],farmKills:0,inventoryDismantleRarities:[],inventorySellRarities:[],inventoryBulkRarities:[],potions:{attack:0,heal:0,mana:0},worldBossSpawn:0,worldBossHp:0,worldBossAttempts:0,worldBossDamage:0,worldBossHistory:[],chatMessages:[],storyQuestIndex:0,storyQuestClaimed:{},worldProgress:[],dungeonProgress:[],achievementStats:{dungeons:0,kills:0,goldEarned:0,lootFound:0,rareLoot:0,upgrades:0},achievementsClaimed:{},loginDay:"",loginStreak:0,dailyChestDay:"",dungeonStreak:0,titlesUnlocked:[],selectedTitle:"",expedition:{active:false,type:null,startAt:0,endAt:0,rewardXp:0,rewardCoins:0,claimed:false},events:{wheelSpins:0,wheelDay:"",wheelLastPrize:"",rift:{active:false,wave:1,maxWaves:5,hp:0,maxHp:0,mana:0,maxMana:0,enemyHp:0,enemyMaxHp:0,enemyAtk:0,coins:0,shadow:0,xp:0,turn:0,lastSkillTurn:-99}},talents:{unlocked:[]},talentPoints:0,casino:{active:false,bet:10,round:0,potential:0,revealed:[],tiles:[],finished:false,lastResult:""},hiddenStarFound:false,notices:{inventory:false,equipment:false,quests:false,mail:false,skills:false,points:false,talents:false,daily:false,expedition:false,association:false,story:false,titles:false,achievements:false}
};
const $ = id => document.getElementById(id);
const SAVE_KEYS=[SAVE_KEY,BACKUP_SAVE_KEY,"rebirth_begin_save_v78","rebirth_begin_save_v77","rebirth_begin_save_v76","rebirth_begin_save_v74","rebirth_begin_save_v71","rebirth_begin_save_v70","rebirth_begin_save_v68","rebirth_begin_save_v65","rebirth_begin_save_v63","rebirth_begin_save_v62","rebirth_begin_save_v61","rebirth_begin_save_v60","rebirth_begin_save_v59","rebirth_begin_save_v58","rebirth_begin_save_v57","rebirth_begin_save_v56","rebirth_begin_save_v55","rebirth_begin_save_v54","rebirth_begin_save_v53","rebirth_begin_save_v52","rebirth_begin_save_v51","rebirth_begin_save_v50","rebirth_begin_save_v49","rebirth_begin_save_v47","rebirth_begin_save_v46","rebirth_begin_save_v45","rebirth_begin_save_v40","rebirth_begin_save_v39","rebirth_begin_save_v38","rebirth_begin_save_v21",OLD_SAVE_KEY];
function safeClone(value){try{return JSON.parse(JSON.stringify(value));}catch(e){return null;}}
function mergeSavedState(saved){
  if(!saved || typeof saved!=="object") return;
  const base=safeClone(state)||{};
  const merged={...base,...saved};
  const objectDefaults=["spentStats","equipped","notices","achievementStats","achievementsClaimed","potions","expedition","events","casino"];
  for(const key of objectDefaults){
    if(base[key] && typeof base[key]==="object" && !Array.isArray(base[key])) merged[key]={...base[key],...(saved[key]&&typeof saved[key]==="object"&&!Array.isArray(saved[key])?saved[key]:{})};
  }
  const arrayDefaults=["inventory","bazaarLots","mail","chatMessages","worldBossHistory","quests","titlesUnlocked","inventoryDismantleRarities","inventorySellRarities","dungeonProgress"];
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
let indexedWriteQueue=Promise.resolve();
let latestIndexedSavedAt=0;
function writeIndexedSave(payload){
  const snapshot=safeClone(payload);
  if(!snapshot) return indexedWriteQueue;
  indexedWriteQueue=indexedWriteQueue.then(async()=>{
    try{
      const stamp=Number(snapshot._savedAt||0);
      if(stamp<latestIndexedSavedAt) return;
      const db=await openSaveDB(); if(!db)return;
      await new Promise(resolve=>{
        const tx=db.transaction("saves","readwrite");
        tx.objectStore("saves").put(snapshot,"current");
        tx.oncomplete=()=>resolve(); tx.onerror=()=>resolve(); tx.onabort=()=>resolve();
      });
      if(stamp>=latestIndexedSavedAt) latestIndexedSavedAt=stamp;
    }catch(_){}
  });
  return indexedWriteQueue;
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
    purgeJunkLoot();
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
      purgeJunkLoot();
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
    const candidates=[];
    const readKey=(key)=>{
      try{
        const parsed=parseStoredSave(localStorage.getItem(key)||"");
        if(parsed) candidates.push(parsed);
      }catch(_){}
    };

    // Read all known local versions. Prefer a save that contains a real selected
    // class; this specifically recovers characters from a damaged/blank primary save.
    for(const key of SAVE_KEYS) readKey(key);

    candidates.sort((a,b)=>{
      const aClass=["assassin","mage","paladin","archer"].includes(a.playerClass)?1:0;
      const bClass=["assassin","mage","paladin","archer"].includes(b.playerClass)?1:0;
      if(aClass!==bClass) return bClass-aClass;
      return Number(b._savedAt||0)-Number(a._savedAt||0);
    });

    const s=candidates[0]||null;
    hadExistingSave=!!s;
    if(s){
      const hadNewStats=s.statPoints!==undefined || s.spentStats!==undefined;
      mergeSavedState(s);
      if(!hadNewStats) state.statPoints=Math.max(0,(state.level-1)*5);
      migrateOldSave();
      migrateEconomyAndBalance();
      migrateEquipmentSystem();
      ensureNotices();
      if(!Array.isArray(state.inventory)) state.inventory=[];
      if(!Array.isArray(state.mail)) state.mail=[];
      if(!Array.isArray(state.chatMessages)) state.chatMessages=[];
      if(!Array.isArray(state.worldBossHistory)) state.worldBossHistory=[];
      if(!Array.isArray(state.titlesUnlocked)) state.titlesUnlocked=[];
      if(typeof state.hiddenStarFound!=="boolean") state.hiddenStarFound=false;
      if(typeof state.rebirth!=="boolean") state.rebirth=false;
      if(typeof state.rebirthName!=="string") state.rebirthName="";
    }
  }catch(e){
    console.warn("[Rebirth] Ошибка загрузки сохранения",e);
  }
}
async function restoreNewestIndexedSave(){
  // IndexedDB is a backup, not a second authoritative save source.
  // Never overwrite a valid local save (especially a selected class) with an older/stale IDB snapshot.
  try{
    const localHasSave = !!hadExistingSave;
    const indexed = await readIndexedSave();
    if(!indexed || typeof indexed!=="object") return false;

    const indexedHasClass = ["assassin","mage","paladin","archer"].includes(indexed.playerClass);
    const localHasClass = ["assassin","mage","paladin","archer"].includes(state.playerClass);

    // If local storage already contains a valid character, it wins. This removes the
    // race where an old IndexedDB snapshot could restore playerClass:null on startup.
    if(localHasSave && localHasClass) return false;

    // If local storage exists but is an incomplete/blank character and IndexedDB has
    // a real character, recover the real character from IndexedDB.
    if(localHasSave && !localHasClass && !indexedHasClass) return false;
    if(!localHasSave && !indexedHasClass) return false;

    const indexedTime=Number(indexed._savedAt||0);
    const localTime=Number(state._savedAt||0);
    if(localHasSave && indexedTime<=localTime) return false;

    const hadNewStats=indexed.statPoints!==undefined || indexed.spentStats!==undefined;
    mergeSavedState(indexed);
    hadExistingSave=true;
    if(!hadNewStats) state.statPoints=Math.max(0,(state.level-1)*5);
    migrateOldSave(); migrateEconomyAndBalance(); migrateEquipmentSystem(); purgeJunkLoot(); ensureNotices(); ensureCollections(); if(typeof state.rebirth!=="boolean") state.rebirth=false; if(typeof state.rebirthName!=="string") state.rebirthName="";
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
 {id:"forgeMaster",icon:"⚒️",name:"Мастер кузни",desc:"Улучши снаряжение 25 раз",reward:{gold:15000,shadow:60},ok:()=>state.achievementStats.upgrades>=25},
 {id:"attention",icon:"✦",name:"Дохуя внимательный?",desc:"Найди скрытую звезду на экране Героя",reward:{gold:6000,shadow:100,xp:10000},ok:()=>state.hiddenStarFound===true}
];
function checkAchievements(){
  ensureAchievements();
  let changed=false;
  let rewardXP=0;
  for(const a of ACHIEVEMENTS){
    if(state.achievementsClaimed[a.id]||!a.ok())continue;
    state.achievementsClaimed[a.id]=Date.now();
    const actualGold=gainCoins(a.reward.gold||0); state.shadowCoins+=a.reward.shadow||0; rewardXP+=Number(a.reward.xp||0);
    state.mail=Array.isArray(state.mail)?state.mail:[];
    state.mail.push({id:"ach_"+a.id+"_"+Date.now(),from:"Достижения",text:`Получена награда за достижение «${a.name}»: ${actualGold.toLocaleString("ru-RU")} золота · ${a.reward.shadow} 🌑.`,time:Date.now(),read:false,type:"system"});
    state.notices.mail=true; showSystemNotice("НОВАЯ ПОЧТА","Получена награда за достижение.","mail"); changed=true;
  }
  if(rewardXP>0) addXP(rewardXP);
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
  const kills=Number(state.achievementStats?.kills||0);
  const dungeons=Number(state.achievementStats?.dungeons||0);
  const upgrades=Number(state.achievementStats?.upgrades||0);
  const arena=Number(state.arenaRating||1000);
  const streak=Number(state.dungeonStreak||0);
  if(state.level>=5) unlocked.add("Новичок");
  if(state.level>=10) unlocked.add("Пробуждённый");
  if(state.rank>=3) unlocked.add("Ветеран");
  if(upgrades>=10) unlocked.add("Кузнец");
  if(dungeons>=10) unlocked.add("Покоритель подземелий");
  if(streak>=5) unlocked.add("Без остановки");
  if(kills>=3000) unlocked.add("Кровавый след");
  if(dungeons>=20) unlocked.add("Искатель руин");
  if(upgrades>=30) unlocked.add("Мастер кузницы");
  if(arena>=1300) unlocked.add("Гладиатор");
  if(dungeons>=40) unlocked.add("Повелитель подземелий");
  if(streak>=10) unlocked.add("Безупречный");
  if(state.rebirth) unlocked.add("Перерождённый");
  if(arena>=1600) unlocked.add("Властелин арены");
  if(state.level>=80 && state.rank>=7) unlocked.add("Воля титана");
  if(state.level>=100 && state.rank>=8 && state.rebirth) unlocked.add("Вершина мира");
  state.titlesUnlocked=[...unlocked];
  const changed=before!==JSON.stringify(state.titlesUnlocked||[]);
  if(!state.selectedTitle && state.titlesUnlocked.length) state.selectedTitle=state.titlesUnlocked[0];
  if(changed && before!=="[]") { ensureNotices(); state.notices.titles=true; }
  if(changed) save();
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
  "Без остановки":{dodge:2,desc:"+2% к уклонению"},
  "Кровавый след":{atk:12,critDamage:2,desc:"+12 к атаке · +2% к критическому урону"},
  "Искатель руин":{health:150,dodge:1,desc:"+150 к максимальному HP · +1% к уклонению"},
  "Мастер кузницы":{def:10,critDamage:3,desc:"+10 к защите · +3% к критическому урону"},
  "Гладиатор":{atk:15,def:5,desc:"+15 к атаке · +5 к защите"},
  "Повелитель подземелий":{health:250,def:10,desc:"+250 к максимальному HP · +10 к защите"},
  "Безупречный":{dodge:4,critDamage:3,desc:"+4% к уклонению · +3% к критическому урону"},
  "Перерождённый":{health:150,atk:20,def:8,desc:"+150 к максимальному HP · +20 к атаке · +8 к защите"},
  "Властелин арены":{atk:25,def:10,critDamage:4,desc:"+25 к атаке · +10 к защите · +4% к критическому урону"},
  "Воля титана":{health:300,def:20,atk:20,desc:"+300 к максимальному HP · +20 к защите · +20 к атаке"},
  "Вершина мира":{health:500,atk:50,def:30,critDamage:6,dodge:3,desc:"+500 HP · +50 атаки · +30 защиты · +6% крит. урона · +3% уклонения"}
};
function getTitleBonusStats(){
  const b={atk:0,health:0,def:0,critDamage:0,dodge:0};
  const x=TITLE_BONUSES[state.selectedTitle];
  if(x) Object.keys(b).forEach(k=>b[k]+=Number(x[k]||0));
  return b;
}
const STORY_QUESTS=[
  {id:"awakening",title:"Пробуждение",desc:"Выбери свой класс и сделай первый шаг по пути перерождения.",icon:"story_quests",goal:"Выбери класс",check:()=>!!state.playerClass,reward:{gold:1000,xp:2500}},
  {id:"first_dungeon",title:"Первый след",desc:"Пройди первое подземелье и докажи, что ты готов идти дальше.",icon:"story_quests",goal:"Подземелья: 1",check:()=>state.achievementStats.dungeons>=1,reward:{gold:2000,xp:4000}},
  {id:"hunter",title:"След охотника",desc:"Победи 10 монстров и найди источник странной силы.",icon:"monster",goal:"Победы: 10",check:()=>state.achievementStats.kills>=10,reward:{gold:3500,xp:6000}},
  {id:"rank_d",title:"За пределами F",desc:"Получи ранг D. Первый настоящий барьер системы будет сломан.",icon:"rating",goal:"Ранг D",check:()=>state.rank>=2,reward:{gold:5000,xp:8000}},
  {id:"level10",title:"Пробуждённая сила",desc:"Достигни 10 уровня и почувствуй, как система раскрывает новые возможности.",icon:"skill",goal:"Уровень 10",check:()=>state.level>=10,reward:{gold:7000,xp:10000}},
  {id:"rare",title:"След редкости",desc:"Получи три редких сокровища Эпического ранга или выше.",icon:"artifact",goal:"Редкий лут: 3",check:()=>state.achievementStats.rareLoot>=3,reward:{gold:10000,xp:14000}},
  {id:"master",title:"Покоритель",desc:"Пройди 20 подземелий. Система начинает замечать твоё имя.",icon:"dungeons",goal:"Подземелья: 20",check:()=>state.achievementStats.dungeons>=20,reward:{gold:15000,xp:18000}},
  {id:"rank_a",title:"Путь к вершине",desc:"Получи ранг A и открой следующую главу истории.",icon:"titles",goal:"Ранг A",check:()=>state.rank>=5,reward:{gold:25000,xp:25000}}
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
  const actualGold=gainCoins(q.reward.gold); state.storyQuestClaimed[q.id]=true;addXP(q.reward.xp);state.storyQuestIndex++;save();render();openSubscreen("storyQuests");
  modal("ГЛАВА ПРОЙДЕНА",`«${q.title}»\n\nНаграда: ${actualGold.toLocaleString("ru-RU")} золота · ${q.reward.xp.toLocaleString("ru-RU")} XP.`);
}
function renderStoryQuests(){
  ensureStoryQuests();
  const current=STORY_QUESTS[state.storyQuestIndex];
  const doneCount=Object.values(state.storyQuestClaimed).filter(Boolean).length;
  const timeline=STORY_QUESTS.map((q,i)=>{const completed=!!state.storyQuestClaimed[q.id],active=i===state.storyQuestIndex;return `<div class="story-step ${completed?"done":""} ${active?"active":""}"><span>${completed?"✓":i+1}</span><div><b>${escapeHtml(q.title)}</b><small>${escapeHtml(q.goal)}</small></div></div>`}).join("");
  if(!current)return `<div class="story-panel"><div class="story-complete"><img src="img/icons/story_quests.png" alt=""><h2>ГЛАВА ЗАВЕРШЕНА</h2><p>Все доступные сюжетные задания пройдены. Ты дошёл до конца текущей главы.</p></div><div class="story-timeline">${timeline}</div></div>`;
  const ready=storyQuestDone(current);
  return `<div class="story-panel"><div class="story-hero"><img src="img/icons/${current.icon}.png" alt=""><div><small>ГЛАВА ${state.storyQuestIndex+1} / ${STORY_QUESTS.length}</small><h2>${escapeHtml(current.title)}</h2><p>${escapeHtml(current.desc)}</p></div></div><div class="story-objective"><span>ЦЕЛЬ</span><b>${escapeHtml(current.goal)}</b><em>${ready?"✓ ВЫПОЛНЕНО":"В ПРОЦЕССЕ"}</em></div><div class="story-reward"><span>НАГРАДА</span><b>🪙 ${Math.floor(current.reward.gold/2).toLocaleString("ru-RU")} · ✨ ${current.reward.xp.toLocaleString("ru-RU")} XP</b></div><button class="primary-btn story-claim" onclick="claimStoryQuest()" ${ready?"":"disabled"}>${ready?"ЗАБРАТЬ НАГРАДУ":"ПРОДОЛЖИТЬ ПУТЬ"}</button><div class="story-timeline">${timeline}</div><div class="story-progress">Пройдено: ${doneCount} / ${STORY_QUESTS.length}</div></div>`;
}
const TITLE_INFO={
  "Новичок":{how:"Достигни 5 уровня.",desc:"Первый титул героя, который только начинает свой путь.",stats:"+50 к максимальному HP"},
  "Пробуждённый":{how:"Достигни 10 уровня.",desc:"Система признала силу пробуждённого героя.",stats:"+5 к атаке"},
  "Ветеран":{how:"Достигни ранга C.",desc:"Титул за продвижение по боевым рангам.",stats:"+8 к защите"},
  "Кузнец":{how:"Улучши снаряжение 10 раз.",desc:"Титул мастера улучшений.",stats:"+3% к критическому урону"},
  "Покоритель подземелий":{how:"Пройди 10 подземелий.",desc:"Доказательство покорения опасных локаций.",stats:"+120 к максимальному HP"},
  "Без остановки":{how:"Пройди 5 подземелий подряд.",desc:"Для тех, кто продолжает путь без остановки.",stats:"+2% к уклонению"},
  "Кровавый след":{how:"Убей 3 000 монстров.",desc:"Титул охотника, который оставляет за собой след из поверженных врагов.",stats:"+12 к атаке · +2% к критическому урону"},
  "Искатель руин":{how:"Пройди 20 подземелий.",desc:"Ты исследовал десятки опасных мест и не свернул с пути.",stats:"+150 к максимальному HP · +1% к уклонению"},
  "Мастер кузницы":{how:"Улучши снаряжение 30 раз.",desc:"Настоящий мастер не просто находит силу — он создаёт её.",stats:"+10 к защите · +3% к критическому урону"},
  "Гладиатор":{how:"Достигни 1 300 рейтинга Арены.",desc:"Титул бойца, доказавшего себя в PvP-сражениях.",stats:"+15 к атаке · +5 к защите"},
  "Повелитель подземелий":{how:"Пройди 40 подземелий.",desc:"Ты стал хозяином самых опасных испытаний мира.",stats:"+250 к максимальному HP · +10 к защите"},
  "Безупречный":{how:"Пройди 10 подземелий подряд.",desc:"Десять испытаний без единого разрыва серии.",stats:"+4% к уклонению · +3% к критическому урону"},
  "Перерождённый":{how:"Соверши перерождение.",desc:"Ты оставил прошлую жизнь позади и начал новый путь.",stats:"+150 к максимальному HP · +20 к атаке · +8 к защите"},
  "Властелин арены":{how:"Достигни 1 600 рейтинга Арены.",desc:"Один из самых трудных титулов для тех, кто готов постоянно сражаться.",stats:"+25 к атаке · +10 к защите · +4% к критическому урону"},
  "Воля титана":{how:"Достигни 80 уровня и ранга S.",desc:"Сила героя уже выходит далеко за пределы обычных бойцов.",stats:"+300 к максимальному HP · +20 к защите · +20 к атаке"},
  "Вершина мира":{how:"Достигни 100 уровня, ранга SS и соверши перерождение.",desc:"Редчайший титул текущей версии игры. Его получение требует пройти почти весь путь развития героя.",stats:"+500 HP · +50 атаки · +30 защиты · +6% крит. урона · +3% уклонения"}
};
function renderTitles(){
  const all=Object.keys(TITLE_BONUSES), opened=all.filter(t=>(state.titlesUnlocked||[]).includes(t)), closed=all.filter(t=>!opened.includes(t));
  const card=t=>`<button class="title-card ${state.selectedTitle===t?'selected':''} ${opened.includes(t)?'':'locked'}" onclick="openTitleDetails('${t.replaceAll("'","\'")}')"><div class="title-card-top"><span>${opened.includes(t)?(state.selectedTitle===t?'✓':'◆'):'🔒'}</span><b>${escapeHtml(t)}</b></div></button>`;
  return `<div class="titles-panel"><div class="inventory-head"><div><b>🏷️ ТИТУЛЫ</b><small>Все титулы персонажа и условия их получения.</small></div><span>${opened.length}/${all.length}</span></div><div class="titles-group"><div class="titles-group-title">ОТКРЫТЫЕ <span>${opened.length}</span></div><div class="title-grid">${opened.length?opened.map(card).join(''):'<div class="inventory-empty"><div>🏷️</div><p>Пока нет открытых титулов.</p></div>'}</div></div><div class="titles-group"><div class="titles-group-title">ЗАКРЫТЫЕ <span>${closed.length}</span></div><div class="title-grid">${closed.map(card).join('')}</div></div></div>`;
}
function openTitleDetails(title){
  if(!TITLE_BONUSES[title])return;
  const info=TITLE_INFO[title]||{how:'Условие получения не указано.',desc:'Титул персонажа.',stats:TITLE_BONUSES[title].desc||'Без бонуса'};
  const unlocked=(state.titlesUnlocked||[]).includes(title);
  const text=`Статус: ${unlocked?'ОТКРЫТ':'ЗАКРЫТ'}

Описание
${info.desc}

Как получить
${info.how}

Характеристики
${info.stats}`;
  modal(title,text);
  const action=$("modalTitleAction");
  if(action && unlocked){
    action.textContent=state.selectedTitle===title?"СНЯТЬ":"НАДЕТЬ";
    action.classList.remove("hidden");
    action.onclick=()=>{
      state.selectedTitle=state.selectedTitle===title?"":title;
      save();
      $("modal").classList.add("hidden");
      action.classList.add("hidden");
      render();
      openSubscreen("titles");
    };
  }
}
function selectTitle(title){if(!(state.titlesUnlocked||[]).includes(title))return;state.selectedTitle=title;save();render();openSubscreen("titles");}
function renderAchievements(){
  ensureAchievements(); touchDailyStreak();
  const unlocked=ACHIEVEMENTS.filter(a=>state.achievementsClaimed[a.id]).length;
  const cards=ACHIEVEMENTS.map(a=>{const done=!!state.achievementsClaimed[a.id]; const goldText=a.id==="attention"?"6 000":""+Math.floor(a.reward.gold/2).toLocaleString("ru-RU"); const xpText=a.reward.xp?` · ${a.reward.xp.toLocaleString("ru-RU")} XP`:""; return `<div class="achievement-card ${done?"done":""}"><div class="achievement-icon">${a.icon}</div><div class="achievement-info"><b>${a.name}</b><small>${a.desc}</small><span>${done?"✓ НАГРАДА ПОЛУЧЕНА":`🎁 ${goldText} 🪙${xpText} · ${a.reward.shadow} 🌑`}</span></div><div class="achievement-state">${done?"✓":"🔒"}</div></div>`}).join("");
  return `<div class="achievements-head"><div><b>🏅 ДОСТИЖЕНИЯ</b><small>Открыто: ${unlocked}/${ACHIEVEMENTS.length}</small></div><div class="streak-badge">🔥 ${state.loginStreak} ДН.</div></div><div class="achievement-note">Награды выдаются автоматически. Серия входов увеличивается при первом запуске игры в новый день.</div><div class="achievement-list">${cards}</div>`;
}
function ensureNotices(){ state.notices={inventory:false,equipment:false,quests:false,mail:false,skills:false,points:false,talents:false,daily:false,expedition:false,association:false,story:false,titles:false,achievements:false,...(state.notices||{})}; }
function refreshActionableNotices(){
  ensureNotices();
  // Красная точка всегда отражает действие, которое игрок реально может выполнить прямо сейчас.
  state.notices.points=Number(state.statPoints||0)>0;
  state.notices.talents=Number(state.talentPoints||0)>=3;
  state.notices.mail=Array.isArray(state.mail)&&state.mail.some(m=>!m.read);
  try{ state.notices.quests=typeof allQuestsDone==="function" && allQuestsDone() && !state.questClaimed; }catch(_){ state.notices.quests=false; }
  try{ state.notices.story=typeof storyQuestDone==="function" && !!STORY_QUESTS?.[state.storyQuestIndex] && storyQuestDone(STORY_QUESTS[state.storyQuestIndex]); }catch(_){ state.notices.story=false; }
  try{ state.notices.daily=!dailyChestClaimed(); }catch(_){ state.notices.daily=false; }
  try{ state.notices.expedition=expeditionReady(); }catch(_){ state.notices.expedition=false; }
  try{ state.notices.association=state.rank<ranks.length-1 && state.level>=requiredLevel(state.rank+1) && state.coins>=rankCost(state.rank) && state.energy>=energyCostRank(); }catch(_){ state.notices.association=false; }
  // Эти уведомления являются одноразовыми: они ставятся при появлении нового контента
  // и снимаются при открытии соответствующего раздела. Не восстанавливаем их из
  // старого флага во время общего пересчёта, иначе точка появлялась снова.
  state.notices.skills=state.notices.skills===true;
  state.notices.inventory=state.notices.inventory===true;
  state.notices.titles=state.notices.titles===true;
}
function markNotice(key,value){ ensureNotices(); if(key in state.notices) state.notices[key]=value; save(); updateNoticeDots(); }
function updateNoticeDots(){
  ensureNotices(); refreshActionableNotices();
  const map={inventory:"notice-inventory",quests:"notice-quests",mail:"notice-mail",skills:"notice-skills",points:"notice-points",talents:"notice-talents",daily:"notice-daily",expedition:"notice-expedition",association:"notice-association",story:"notice-story",titles:"notice-titles"};
  const heroAny=!!(state.notices.points||state.notices.skills||state.notices.inventory||state.notices.talents);
  const moreAny=!!(state.notices.quests||state.notices.mail||state.notices.daily||state.notices.expedition||state.notices.story||state.notices.titles||state.notices.inventory);
  Object.entries(map).forEach(([k,id])=>{const el=$(id);if(el)el.classList.toggle("show",!!state.notices[k]);});
  const hero=$("notice-hero"); if(hero)hero.classList.toggle("show",heroAny);
  const more=$("notice-more"); if(more)more.classList.toggle("show",moreAny);
  const assoc=$("notice-association"); if(assoc)assoc.classList.toggle("show",!!state.notices.association);
}
let noticeTimer=null;
let noticeQueue=[];
let noticeBusy=false;
function flushSystemNotice(){
  const box=$("systemNotice"); if(!box||noticeBusy||!noticeQueue.length)return;
  const item=noticeQueue.shift(); noticeBusy=true;
  $("systemNoticeTitle").textContent=item.title;
  $("systemNoticeText").textContent=item.text;
  const btn=$("systemNoticeAction");
  btn.onclick=()=>{
    box.classList.add("hidden");
    clearTimeout(noticeTimer);
    noticeBusy=false;
    if(item.target) item.target();
    setTimeout(flushSystemNotice,120);
  };
  box.classList.remove("hidden");
  clearTimeout(noticeTimer);
  noticeTimer=setTimeout(()=>{
    box.classList.add("hidden");
    noticeBusy=false;
    setTimeout(flushSystemNotice,120);
  },4200);
}
function showSystemNotice(title,text,target){
  noticeQueue.push({title,text,target:typeof target==="function"?target:notifyTarget(target)});
  flushSystemNotice();
}
function notifyTarget(target){
  const targets={
    inventory:()=>openSubscreen("inventory"),
    quests:()=>openSubscreen("quests"),
    mail:()=>openSubscreen("mail"),
    skills:()=>openSkills(),
    points:()=>{showScreen("character"); document.getElementById("allocationPanel")?.scrollIntoView({behavior:"smooth",block:"center"});}
  };
  return targets[target]||null;
}
function openLevelUpPoints(){ const box=$("levelUpToast"); if(box)box.classList.add("hidden"); showScreen("character"); $("allocationPanel")?.scrollIntoView({behavior:"smooth",block:"center"}); state.notices.points=false; save(); updateNoticeDots(); }
function showLevelUpToast(level,points){
  const box=$("levelUpToast"); if(!box)return;
  $("levelUpTitle").textContent=`УРОВЕНЬ ${level}`;
  $("levelUpReward").textContent=`+${points} ОЧКОВ УЛУЧШЕНИЯ`;
  const energy=$("levelUpEnergy"); if(energy)energy.textContent=`ЭНЕРГИЯ ${Math.floor(state.energy)} / ${maxEnergy()} — ВОССТАНОВЛЕНА`;
  box.classList.remove("hidden");
  setTimeout(()=>box.classList.add("hidden"),1000);
}

function ensureWorldProgress(){
  const total=dungeonTemplates.length;
  if(!Array.isArray(state.worldProgress)) state.worldProgress=[];
  // Миграция старого мира: по 3 острова каждого ранга объединяются в один.
  if(state.worldProgress.length>=30){
    const old=state.worldProgress;
    state.worldProgress=Array.from({length:total},(_,rankIndex)=>{
      let best=0;
      for(let slot=0;slot<3;slot++) best=Math.max(best,Math.floor(Number(old[rankIndex*3+slot]?.runs)||0));
      return {runs:Math.max(0,Math.min(30,best))};
    });
  }
  for(let i=0;i<total;i++){
    const old=state.worldProgress[i];
    if(!old || typeof old!=="object") state.worldProgress[i]={runs:0};
    state.worldProgress[i].runs=Math.max(0,Math.min(30,Math.floor(Number(state.worldProgress[i].runs)||0)));
  }
  if(state.worldProgress.length>total) state.worldProgress.length=total;
}

const TALENTS = [
  {id:"root_attack",name:"Пробуждение силы",desc:"Атака +2%",icon:"attack",bonus:{atk:5},parent:null},
  {id:"attack_power",name:"Мощь клинка",desc:"Атака +3%",icon:"attack",bonus:{atk:10},parent:"root_attack"},
  {id:"vitality",name:"Жизненная сила",desc:"Здоровье +3%",icon:"health",bonus:{health:10},parent:"root_attack"},
  {id:"berserker",name:"Берсерк",desc:"Атака +2%",icon:"attack",bonus:{atk:8},parent:"attack_power"},
  {id:"precision",name:"Точность",desc:"Шанс крит. удара +2%",icon:"crit",bonus:{crit:5},parent:"attack_power"},
  {id:"iron_body",name:"Железное тело",desc:"Здоровье +2%",icon:"health",bonus:{health:8},parent:"vitality"},
  {id:"fortress",name:"Крепость",desc:"Защита +2%",icon:"defense",bonus:{def:8},parent:"vitality"},
  {id:"executioner",name:"Палач",desc:"Атака +3%",icon:"attack",bonus:{atk:12},parent:"berserker"},
  {id:"deadly_aim",name:"Смертельный прицел",desc:"Крит. урон +3%",icon:"crit",bonus:{critDamage:15},parent:"precision"},
  {id:"swift_step",name:"Быстрый шаг",desc:"Уклонение +2%",icon:"agility",bonus:{dodge:6},parent:"precision"},
  {id:"regeneration",name:"Регенерация",desc:"Здоровье +3%",icon:"health",bonus:{health:12},parent:"iron_body"},
  {id:"stone_skin",name:"Каменная кожа",desc:"Защита +3%",icon:"defense",bonus:{def:12},parent:"fortress"},
  {id:"mana_core",name:"Ядро энергии",desc:"Мана +3%",icon:"mana",bonus:{mana:10},parent:"iron_body"},
  {id:"predator",name:"Хищник",desc:"Атака +4%",icon:"attack",bonus:{atk:15},parent:"executioner"},
  {id:"apex",name:"Предел силы",desc:"Атака +5%",icon:"attack",bonus:{atk:20},parent:"predator"},
  {id:"critical_mastery",name:"Мастер критов",desc:"Крит. урон +4%",icon:"crit",bonus:{critDamage:20},parent:"deadly_aim"},
  {id:"evasion_mastery",name:"Тень",desc:"Уклонение +3%",icon:"agility",bonus:{dodge:8},parent:"swift_step"},
  {id:"immortal",name:"Несокрушимость",desc:"Здоровье +4%",icon:"health",bonus:{health:18},parent:"regeneration"},
  {id:"guardian",name:"Страж",desc:"Защита +4%",icon:"defense",bonus:{def:18},parent:"stone_skin"},
  {id:"arcane_reserve",name:"Запас маны",desc:"Мана +4%",icon:"mana",bonus:{mana:15},parent:"mana_core"}
];
function ensureTalents(){
  if(!state.talents || typeof state.talents!=="object") state.talents={unlocked:[]};
  if(!Array.isArray(state.talents.unlocked)) state.talents.unlocked=[];
  const valid=new Set(TALENTS.map(t=>t.id));
  state.talents.unlocked=[...new Set(state.talents.unlocked.filter(id=>valid.has(id)))];
  if(!Number.isFinite(Number(state.talentPoints))) state.talentPoints=Math.max(0,(Number(state.level)||1)-1-state.talents.unlocked.length);
  if(state.talents.unlocked.length===0 && Number(state.talentPoints)===0 && Number(state.level)>1) state.talentPoints=Math.max(0,Number(state.level)-1);
  state.talentPoints=Math.max(0,Math.floor(Number(state.talentPoints)||0));
}
function talentUnlocked(id){ensureTalents();return state.talents.unlocked.includes(id);}
function talentCanUnlock(id){
  ensureTalents();
  const t=TALENTS.find(x=>x.id===id);
  return !!t && !talentUnlocked(id) && state.talentPoints>=3 && (!t.parent || talentUnlocked(t.parent));
}
function unlockTalent(id){
  ensureTalents();
  const t=TALENTS.find(x=>x.id===id);
  if(!t)return;
  if(!talentCanUnlock(id)){modal("ДРЕВО ТАЛАНТОВ",t.parent&&!talentUnlocked(t.parent)?"Сначала открой предыдущий талант в этой ветке.":"Недостаточно очков талантов.");return;}
  state.talents.unlocked.push(id); state.talentPoints-=3; recalc(); save(); render(); openSubscreen("talents");
}
function talentBonuses(){
  ensureTalents();
  const out={atk:0,health:0,def:0,crit:0,critDamage:0,dodge:0,mana:0};
  for(const id of state.talents.unlocked){const t=TALENTS.find(x=>x.id===id);if(!t)continue;for(const [k,v] of Object.entries(t.bonus||{}))out[k]=(out[k]||0)+Number(v||0);}
  return out;
}
function renderTalents(){
  ensureTalents();
  const unlocked=new Set(state.talents.unlocked);
  const byId=new Map(TALENTS.map(t=>[t.id,t]));
  const children=new Map(TALENTS.map(t=>[t.id,[]]));
  TALENTS.forEach(t=>{if(t.parent && children.has(t.parent)) children.get(t.parent).push(t);});
  const levels=[];
  const walk=(ids)=>{
    levels.push(ids);
    const next=[];
    ids.forEach(id=>children.get(id).forEach(t=>next.push(t.id)));
    if(next.length) walk(next);
  };
  walk(TALENTS.filter(t=>!t.parent).map(t=>t.id));

  const node=(t)=>{
    const on=unlocked.has(t.id),can=talentCanUnlock(t.id),locked=!on&&!can;
    const next=children.get(t.id)||[];
    const nextText=next.length ? `Открывает: ${next.map(x=>x.name).join(' · ')}` : 'Финальный талант';
    return `<button class="talent-node ${on?'unlocked':''} ${can?'available':''} ${locked?'locked':''}" onclick="unlockTalent('${t.id}')" title="${t.desc}">
      <span class="talent-node-state">${on?'✓':can?'+1':'🔒'}</span>
      <img src="img/talents/${t.icon}.png" onerror="this.style.display='none'" alt="">
      <b>${t.name}</b><small>${t.desc}</small>
      <em>${nextText}</em>
    </button>`;
  };
  const tree=levels.map((ids,i)=>{
    const label=i===0?'ОСНОВА':i===1?'ПЕРВАЯ РАЗВИЛКА':`УРОВЕНЬ ВЕТКИ ${i}`;
    return `<div class="talent-level"><div class="talent-level-label">${label}</div><div class="talent-level-nodes">${ids.map(id=>node(byId.get(id))).join('')}</div></div>`;
  }).join('<div class="talent-connector"><span>↓</span><small>открывается после предыдущего узла</small></div>');
  const b=talentBonuses();
  return `<div class="talent-panel"><div class="talent-hero"><div class="talent-hero-art"><img src="img/talents/talents.png" onerror="this.style.display='none'" alt=""></div><div><span>РАЗВИТИЕ ПЕРСОНАЖА</span><h2>ДРЕВО ТАЛАНТОВ</h2><p>Каждый уровень даёт 1 очко. Каждый талант требует 3 очка. Сначала открой узел, затем выбирай доступную ветку.</p></div><div class="talent-points"><b>${state.talentPoints}</b><small>ОЧКОВ</small></div></div><div class="talent-stats"><span>⚔️ Атака +${b.atk}%</span><span>❤️ Здоровье +${b.health}%</span><span>🛡️ Защита +${b.def}%</span><span>🎯 Крит +${b.crit}%</span><span>💥 Крит. урон +${b.critDamage}%</span><span>💨 Уклонение +${b.dodge}%</span></div><div class="talent-legend"><span><i class="tl-dot tl-open"></i>доступно</span><span><i class="tl-dot tl-done"></i>изучено</span><span><i class="tl-dot tl-lock"></i>закрыто</span></div><div class="talent-tree-flow">${tree}</div><div class="talent-tip">Светящаяся карточка — следующий доступный выбор. Внутри карточки указано, какие таланты она открывает.</div></div>`;
}
function migrateOldSave(){
  ensureTalents();
  if(Number.isFinite(state.xp)) state.xp=Math.max(0,Math.min(Number(state.xp),Math.max(0,xpNeed(state.level)-1)));
  if(!Number.isFinite(state.selectedSkillId)) state.selectedSkillId=0;
  if(!Number.isFinite(state.healCooldown)) state.healCooldown=0;
  ensureStoryQuests();
  if(!state.equipped || typeof state.equipped!=="object") state.equipped={weapon:null,armor:null,amulet:null,artifact:null};
  if(!("artifact" in state.equipped)) state.equipped.artifact=null;
  if(!state.spentStats) state.spentStats=defaultStats();
  if(!state.potions||typeof state.potions!=="object") state.potions={attack:0,heal:0,mana:0};
  state.potions={attack:Math.max(0,Math.floor(Number(state.potions.attack)||0)),heal:Math.max(0,Math.floor(Number(state.potions.heal)||0)),mana:Math.max(0,Math.floor(Number(state.potions.mana)||0))};
  ensureNotices();
  if(state.playerClass && state.statPoints===undefined){ state.statPoints=Math.max(0,(state.level-1)*5); }
  if(state.playerClass && state.statPoints===0 && Object.values(state.spentStats).every(v=>!v)){
    // Old saves keep their class/level but receive the level-up points for the new system.
    state.statPoints=Math.max(0,(state.level-1)*5);
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
function upgradeCost(item){
  const u=Math.max(0,Number(item?.upgradeLevel)||0), lvl=Math.max(1,Number(item?.itemLevel)||1);
  const r=rarityByName(item?.rarity), rank=equipV5Rank(lvl);
  const typeMult={weapon:1,armor:1.12,amulet:1.28,artifact:1.40}[item?.type]||1;
  const step=u+1;
  const gold=Math.floor(700*Math.pow(lvl,1.25)*rank.mult*typeMult*Math.pow(step,1.15)*Math.max(.85,r.mult));
  const shards=Math.max(8,Math.floor((10+lvl*1.05)*rank.mult*typeMult*Math.pow(step,.9)*Math.max(.8,r.shards/8)));
  const chance=Math.max(5,100-u*5);
  return {shards,gold,chance,maxLevel:20};
}

function dismantleReward(item){
  const r=rarityByName(item?.rarity);
  return Math.max(1,Math.floor(r.shards*(1+(Number(item?.upgradeLevel)||0)*.25)+(Number(item?.itemLevel)||1)/10));
}
function itemRarityClass(item){return rarityByName(item?.rarity).cls;}

function ensureCollections(){
  ensureWorldProgress();
  if(!Array.isArray(state.inventory)) state.inventory=[];
  if(!state.equipped || typeof state.equipped!=="object") state.equipped={weapon:null,armor:null,amulet:null,artifact:null};
  if(!("weapon" in state.equipped)) state.equipped.weapon=null;
  if(!("armor" in state.equipped)) state.equipped.armor=null;
  if(!("amulet" in state.equipped)) state.equipped.amulet=null;
  if(!("artifact" in state.equipped)) state.equipped.artifact=null;
  state.inventory.forEach(item=>{
    if(item.type!=="material") {
      item.itemLevel=Math.max(1,Number(item.itemLevel)||Number(state.level)||1);
      if(item.type==="artifact") item.classKey="all";
      else if(!["assassin","mage","paladin","archer"].includes(item.classKey)) item.classKey=["assassin","mage","paladin","archer"][Math.floor(Math.random()*4)];
      if(!rarityByName(item.rarity)) item.rarity="Обычное";
      item.upgradeLevel=Math.max(0,Number(item.upgradeLevel)||0);
      if(!item.stats) item.stats=generateEquipmentStats(item.type,item.itemLevel,item.rarity,item.upgradeLevel);
      item.price=Math.max(10,Math.floor(item.itemLevel*item.itemLevel*1.8*rarityByName(item.rarity).mult*(1+item.upgradeLevel*.12)));
    } else item.classKey="all";
  });
  if(!Array.isArray(state.bazaarLots)) state.bazaarLots=[];
  if(!Array.isArray(state.quests)) state.quests=null;
  refreshQuestCycle(false);
  ensureStoryQuests();
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
  if(allQuestsDone() && !state.questClaimed){ ensureNotices(); state.notices.quests=true; showSystemNotice("ЗАДАНИЯ ГОТОВЫ","Есть выполненные задания с наградой.","quests"); }
  save(); updateNoticeDots();
}
function allQuestsDone(){return Array.isArray(state.quests)&&state.quests.length>0&&state.quests.every(q=>q.progress>=q.target);}
function claimQuestReward(){
  refreshQuestCycle(false);
  if(state.questClaimed){modal("ЗАДАНИЯ","Награда за этот цикл уже получена.");return;}
  if(!allQuestsDone()){modal("ЗАДАНИЯ", "Сначала выполни все задания.");return;}
  state.questClaimed=true;
  gainCoins(2000);
  addXP(10000);
  save(); render();
  modal("ЗАДАНИЯ ВЫПОЛНЕНЫ","Получено: 2 000 золота · 10 000 XP.");
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

function classAvatarPath(key){return `img/class_new/${colorsafeClass(key||"mage")}.png`;}
function classAvatarImg(key, cls="class-avatar-img"){return `<img class="${cls}" src="${classAvatarPath(key)}" alt="">`;}
function classUiIcon(key, cls="class-select-icon"){return `<img class="${cls}" src="img/class_new/${colorsafeClass(key)}.png" alt="">`;}
function colorsafeClass(key){return ["assassin","mage","paladin","archer"].includes(key)?key:"mage";}
function itemIconImg(item, cls="loot-img"){return `<img class="${cls}" src="${itemIconPath(item)}" alt="">`; }
function itemRankClass(item){const n=String(item?.itemRank||'F').toLowerCase().replace(/[^a-z0-9]+/g,'');return ['f','e','d','c','b','a','aa','s','ss','sss'].includes(n)?n:'f';}
function battleEnemyImg(){if(state.battle?.classKey&&classData[state.battle.classKey])return classAvatarImg(state.battle.classKey,"battle-enemy-class-img");const src=state.battle?.enemyImage||"img/icons/monster.png";return `<img class="battle-monster-img" src="${src}" alt="">`;}
const ICON_MAP={
  "❤":"health","❤️":"health","⚡":"energy","🪙":"gold","💰":"gold","🌑":"shadow","✨":"skill","💎":"shard","🎁":"daily","👑":"titles","👹":"monster","🧙":"mage","🔮":"mage","☠️":"assassin","🛡️":"paladin","🏹":"archer","🗡️":"assassin","🪄":"mage","⚔️":"paladin","🥷":"assassin","🔻":"assassin","✝️":"paladin","🪶":"archer","🌲":"dungeons","💀":"monster","🏰":"dungeons","🕳️":"dungeons","🕷️":"monster","⛏️":"inventory","🏛️":"dungeons","🩸":"boss","🔥":"skill","🏚️":"dungeons","🌋":"boss","🗿":"dungeons","🏯":"dungeons","🐉":"boss","🗻":"dungeons","😈":"boss","☁️":"dungeons","🗼":"dungeons","🐲":"boss","🌀":"skill","💥":"attack","📚":"inventory","☄️":"boss","🌌":"boss","🌅":"daily","🎒":"inventory","🔨":"equip_core_generic","📈":"rating","🏆":"rating","🌟":"daily","⚒️":"equip_core_generic","🏷️":"titles","🏅":"achievements","🔒":"settings","🗺️":"dungeons","📭":"mail","🗑️":"mail","📨":"mail","🌾":"farm","⚠️":"boss","◈":"stamina","💪":"strength","🛡":"defense","💥":"attack","⚔":"attack","🪙":"gold","💠":"equip_core_generic","✦":"skill","🔹":"shard","🔔":"mail","🛒":"shop","⚙️":"settings","👤":"settings","🧬":"settings","📜":"quests","⏱️":"energy","🎯":"rating","🗺️":"dungeons"
};
const EMOJI_RE=/\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;
function iconImgForToken(token,extraClass="inline-icon"){
  const key=ICON_MAP[token]||"skill";
  const file={
    dungeons:"nav_dungeons",health:"health",energy:"energy",gold:"gold",shadow:"shadow",skill:"skill",daily:"daily",titles:"titles",monster:"monster",mage:"mage",assassin:"assassin",paladin:"paladin",archer:"archer",attack:"attack",inventory:"inventory",boss:"boss",stamina:"stamina",strength:"strength",defense:"defense",rating:"rating",achievements:"achievements",settings:"settings",mail:"mail",farm:"farm",equip_core_generic:"shard",equip_amulet_assassin:"assassin",equip_amulet_paladin:"paladin",equip_amulet_archer:"archer",shard:"shard"
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

const ARTIFACTS=[
  {name:"Сердце Эфира",desc:"Древнее ядро, усиливающее тело и запас энергии.",stats:{health:1.35,stamina:1.0}},
  {name:"Око Бездны",desc:"Артефакт, который усиливает силу критических атак.",stats:{strength:1.0,critDamage:1.25}},
  {name:"Руна Бастиона",desc:"Руна древнего стража, повышающая выживаемость.",stats:{health:1.1,defense:1.2}},
  {name:"Искра Астрала",desc:"Сгусток астральной энергии, усиливающий ману и ловкость.",stats:{stamina:1.2,agility:1.0}}
];
function makeArtifact(){
  const rarity=rollRarity(); const baseIndex=rand(0,ARTIFACTS.length-1); const base=ARTIFACTS[baseIndex]; const lvl=Math.max(1,Math.min(100,state.level));
  const stats=generateEquipmentStats("artifact",lvl,rarity.name,0);
  for(const [k,m] of Object.entries(base.stats||{})) stats[k]=Math.max(1,Math.floor((stats[k]||0)*m));
  return {id:`artifact_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,name:base.name,type:"artifact",icon:"◈",rarity:rarity.name,rarityClass:rarity.cls,stats,itemLevel:lvl,upgradeLevel:0,iconKey:"artifact",variant:baseIndex,price:Math.max(50,Math.floor(lvl*lvl*5*rarity.mult)),classKey:"all",artifactDesc:base.desc};
}
function grantArtifactFromWorldBoss(pct){
  const chance=Math.min(75,15+Math.floor(pct*60));
  if(Math.random()*100>=chance)return null;
  const artifact=makeArtifact(); state.inventory.push(artifact); if(state.inventory.length>60)state.inventory.shift();
  ensureNotices();state.notices.inventory=true;state.achievementStats.lootFound++;showSystemNotice("НОВЫЙ АРТЕФАКТ","Новая награда добавлена в инвентарь.","inventory");
  if(["Эпическое","Легендарное","Реликтовое","Мифическое","Адское","Божественное"].includes(artifact.rarity))state.achievementStats.rareLoot++;
  return artifact;
}
function grantPotionDrop(){
  if(Math.random()>=0.10)return null;
  const type=["attack","heal","mana"][rand(0,2)]; state.potions[type]=(state.potions[type]||0)+1; return type;
}
function potionName(type){return {attack:"Зелье атаки",heal:"Зелье лечения",mana:"Зелье маны"}[type]||"Зелье";}
function usePotion(type){
  if(!state.battle||state.hp<=0||!state.potions?.[type])return;
  if(type==="attack"){state.battle.attackBuff=(state.battle.attackBuff||0)+0.35;state.potions.attack--;log("Зелье атаки: +35% к следующей атаке.","system");}
  else if(type==="heal"){const amount=Math.floor(state.maxHp*.30);state.hp=Math.min(state.maxHp,state.hp+amount);state.potions.heal--;log(`Зелье лечения: +${amount} HP.` ,"heal");}
  else {const amount=Math.floor(state.maxMana*.35);state.mana=Math.min(state.maxMana,state.mana+amount);state.potions.mana--;log(`Зелье маны: +${amount} маны.` ,"system");}
  save();updateBattle();
  if(state.battle) setTimeout(enemyTurn,250);
}
function addLootFromMob(){
  // 30% chance for a loot drop. The rarity table is rolled only when a drop happens.
  if(Math.random()>=0.30) return null;
  const loot=makeLoot();
  state.inventory.push(loot);
  if(state.inventory.length>60) state.inventory.shift();
  ensureNotices();
  state.notices.inventory=true;
  showSystemNotice("НОВЫЙ ПРЕДМЕТ",`${loot.name} · ${loot.rarity}`,"inventory");
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

// Обычная схема сохранения: при первом запуске выбирается класс,
// после этого сохранённый класс и весь прогресс загружаются автоматически.
let forcedFreshStart=false;

load();
async function bootGame(){
  if(!forcedFreshStart) await restoreNewestIndexedSave();
  ensureAchievements();
  touchDailyStreak();
  ensureCollections();
  ensureStoryQuests(); ensureWorldProgress();
  if(!hadExistingSave){
    state.mail=[{id:'welcome_'+Date.now(),from:'Система',text:'Добро пожаловать в «Перерождение: Начало»! Удачи в мире перерождения.',time:Date.now(),read:false,type:'system'}];
  }
  saveReady=true;
  ensureNotices();
  if(!hadExistingSave){ state.notices.mail=true; }
  checkAchievements();
  save();
  recalc();render();renderDungeons();
}
bootGame();
setInterval(updateEnergyCountdown,1000);

function xpNeed(level=state.level){ const l=Math.max(1,Math.min(100,Math.floor(Number(level)||1))); return Math.max(800,Math.floor(800*Math.pow(l,1.55))); }
function rankCost(rank=state.rank){ return Math.floor(1500*Math.pow(1.65,rank)*1.5); }
function requiredLevel(rank=state.rank){ const r=Math.max(0,Math.min(ranks.length-1,Number(rank)||0)); return r===0?1:r*10+1; }
function isPremiumActive(){
  if(!state.premium) return false;
  if(Number(state.premiumUntil||0)>0 && Date.now()>=Number(state.premiumUntil)){ state.premium=false; state.premiumUntil=0; return false; }
  return true;
}
function maxEnergy(){ return 100+(state.level-1)*2+(isPremiumActive()?100:0); }
function regenEnergy(){
  // Ровно +1 энергия каждые 60 секунд. Таймер продолжает идти даже при закрытой игре.
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
  const gain=Math.floor(elapsed/60000);
  if(gain<=0) return;
  const before=state.energy;
  state.energy=Math.min(max,state.energy+gain);
  // Не теряем остаток секунд: например, 45 секунд дают +1 и оставляют ещё 15 секунд.
  if(state.energy>=max) state.lastEnergyTick=now;
  else state.lastEnergyTick += gain*60000;
  if(state.energy!==before) save();
}
function premiumDaily(){
  if(!isPremiumActive()) return;
  const day=new Date().toISOString().slice(0,10);
  if(state.premiumLastDaily!==day){ state.premiumLastDaily=day; save(); }
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
function openSkills(){ if(!state.playerClass){modal("НАВЫКИ","Сначала выбери класс персонажа.");return;} state.notices.skills=false; save(); updateNoticeDots(); renderSkillsOverlay(); }
function closeSkills(){ $("skillsOverlay")?.classList.add("hidden"); }

function recalc(){
  if(!state.playerClass)return;
  const c=classData[state.playerClass], s=getStats();
  const levelBonus=state.level-1, rankBonus=state.rank;
  const eqBonus=equipmentBonusStats();
  const fs={}; for(const k of Object.keys(s)) fs[k]=(s[k]||0)+(eqBonus[k]||0);
  const titleBonus=getTitleBonusStats();
  const tb=talentBonuses();
  const baseAtk=Math.floor(c.atk + fs.strength*1.55 + fs.agility*.30 + levelBonus*1.55 + rankBonus*3 + titleBonus.atk);
  const hpClassMultiplier=(state.playerClass==="assassin"||state.playerClass==="mage"||state.playerClass==="archer")?.5:1;
  const baseHp=Math.floor((c.hp + fs.health*8 + fs.stamina*6.5 + levelBonus*6 + rankBonus*26 + titleBonus.health)*hpClassMultiplier);
  const baseDef=Math.floor(c.def + fs.defense*1.45 + fs.stamina*.30 + rankBonus*2.5 + titleBonus.def);
  const rebirthMult=state.rebirth?1.2:1;
  state.atk=Math.floor(baseAtk*(1+tb.atk/100)*rebirthMult);
  state.maxHp=Math.floor(baseHp*(1+tb.health/100)*rebirthMult);
  state.def=Math.floor(baseDef*(1+tb.def/100)*rebirthMult);
  state.stamina=fs.stamina*rebirthMult;
  state.critDamage=Math.min(250,(fs.critDamage + rankBonus*1.5 + (state.evolution?8:0) + titleBonus.critDamage)*(1+tb.critDamage/100))*rebirthMult;
  state.crit=(Math.min(60,fs.critChance + rankBonus*.5 + (state.evolution?4:0) + tb.crit))*rebirthMult;
  state.agility=fs.agility*rebirthMult;
  state.dodge=(Math.min(35,(fs.dodge + fs.agility*.12 + rankBonus*.25 + (state.evolution?2:0) + titleBonus.dodge)*(1+tb.dodge/100)))*rebirthMult;
  const baseMana=Math.floor(c.mana + fs.stamina*6 + levelBonus*1.5 + rankBonus*4);
  state.maxMana=Math.floor(baseMana*(1+tb.mana/100)*rebirthMult);
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
  if(!state.lastEnergyTick) return 60;
  const elapsed=Math.max(0,Date.now()-state.lastEnergyTick);
  return Math.max(1,60-Math.floor((elapsed%60000)/1000));
}
function updateEnergyCountdown(){
  regenEnergy();
  const text=state.energy>=maxEnergy()?"МАКС. ЭНЕРГИЯ":`+1 ЭНЕРГИЯ ЧЕРЕЗ ${energyRegenCountdown()} СЕК.`;
  ["energyTimer","heroEnergyTimer"].forEach(id=>{const el=$(id);if(el)el.textContent=text;});
}

function getOnlinePlayers(){
  // В текущем локальном режиме реального серверного онлайна нет; показываем текущую локальную сессию.
  return 1;
}

function rebirthRequirements(){
  return {level:state.level>=40,coins:state.coins>=500000,kills:(state.achievementStats?.kills||0)>=1500,rank:state.rank>=4};
}
function rebirthNameForClass(key=state.playerClass){
  return ({mage:"Владыка стихий",paladin:"Праведный страж",assassin:"Ночной жрец",archer:"Тень леса"}[key]||"Перерождённый");
}
function canRebirth(){
  if(!state.playerClass||state.rebirth)return false;
  const r=rebirthRequirements();
  return r.level&&r.coins&&r.kills&&r.rank;
}
function renderRebirthPanel(){
  const panel=$("rebirthPanel");
  if(!panel||!state.playerClass)return;
  // Перерождение появляется только с 40 уровня.
  if(state.level<40||state.rebirth){
    panel.innerHTML="";
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  const name=rebirthNameForClass();
  const r=rebirthRequirements();
  const rows=[
    [r.level,"📈","Уровень 40",`Текущий: ${state.level}`],
    [r.coins,"🪙","500 000 монет",`Текущие: ${state.coins.toLocaleString("ru-RU")}`],
    [r.kills,"👹","1 500 убийств монстров",`Убито: ${(state.achievementStats?.kills||0).toLocaleString("ru-RU")}`],
    [r.rank,"🏆","Ранг B",`Текущий: ${ranks[state.rank]||"F"}`]
  ].map(x=>`<div class="rebirth-req ${x[0]?"ok":"bad"}"><span>${x[1]}</span><div><b>${x[2]}</b><small>${x[3]}</small></div><strong>${x[0]?"✓":"🔒"}</strong></div>`).join("");
  panel.innerHTML=`<button type="button" class="rebirth-toggle" onclick="toggleRebirthPanel()"><span><b>✦ ПЕРЕРОЖДЕНИЕ</b><small>Особый путь развития персонажа</small></span><strong id="rebirthToggleIcon">⌄</strong></button><div class="rebirth-body hidden"><div class="rebirth-head"><div><div class="section-title">ПЕРЕРОЖДЕНИЕ</div><small>Твой новый путь: <b>${escapeHtml(name)}</b></small></div><span class="rebirth-mark">✦</span></div><div class="rebirth-reqs">${rows}</div><div class="rebirth-bonus">После перерождения: <b>+20%</b> к характеристикам персонажа.</div><button type="button" class="primary-btn rebirth-btn" onclick="doRebirth()" ${canRebirth()?"":"disabled"}>${canRebirth()?`ПЕРЕРОДИТЬСЯ · ${escapeHtml(name)}`:`ОТКРОЕТСЯ ПРИ ВЫПОЛНЕНИИ УСЛОВИЙ`}</button></div>`;
  panel.classList.toggle("locked",!canRebirth());
}
function toggleRebirthPanel(){
  const panel=$("rebirthPanel");
  if(!panel||state.rebirth)return;
  const body=panel.querySelector(".rebirth-body");
  const icon=$("rebirthToggleIcon");
  if(!body)return;
  const open=body.classList.toggle("hidden");
  panel.classList.toggle("expanded",!open);
  if(icon)icon.textContent=open?"⌄":"⌃";
}
function doRebirth(){
  if(state.rebirth){modal("ПЕРЕРОЖДЕНИЕ","Этот персонаж уже прошёл перерождение.");return;}
  const r=rebirthRequirements();
  if(!r.level||!r.coins||!r.kills||!r.rank){renderRebirthPanel();modal("ПЕРЕРОЖДЕНИЕ","Не выполнены все условия: уровень 40, 500 000 монет, 1 500 убийств монстров и ранг B.");return;}
  const name=rebirthNameForClass();
  state.coins-=500000;
  state.rebirth=true;
  state.rebirthName=name;
  state.evolution=name;
  recalc();
  state.hp=state.maxHp;
  state.mana=state.maxMana;
  save();
  render();
  modal("ПЕРЕРОЖДЕНИЕ",`Ты переродился!\n\n${classData[state.playerClass].name} → ${name}\n\n⚡ Все основные боевые характеристики увеличены на 20%.`);
}
function renderHeroProfile(){
  const panel=$("heroProfilePanel");
  if(!panel||!state.playerClass)return;
  const roleMap={assassin:"Критический урон · уклонение",mage:"Магия · критический урон",paladin:"HP · защита · выживаемость",archer:"Атака · ловкость · крит"};
  const power=Math.max(0,Math.floor((state.atk||0)+(state.maxHp||0)/10+(state.def||0)*2+(state.critDamage||0)*4+(state.crit||0)*8+(state.dodge||0)*5));
  $("profileRank").textContent=ranks[state.rank]||"F";
  $("combatPowerIndex").textContent=power.toLocaleString("ru-RU");
  $("profileAttack").textContent=Math.floor(state.atk||0).toLocaleString("ru-RU");
  $("profileDefense").textContent=Math.floor(state.def||0).toLocaleString("ru-RU");
  $("profileHealth").textContent=Math.floor(state.maxHp||0).toLocaleString("ru-RU");
  $("profileSpecialization").textContent=roleMap[state.playerClass]||"Универсальный стиль";
}
function render(){
  updateLevelGateButtons();
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
  if($("topGold"))$("topGold").textContent=state.coins.toLocaleString("ru-RU");
  if($("topShards"))$("topShards").textContent=(state.shards||0).toLocaleString("ru-RU");
  if($("onlinePlayers"))$("onlinePlayers").textContent=getOnlinePlayers().toLocaleString("ru-RU");
  if($("topShadowCoins"))$("topShadowCoins").textContent=state.shadowCoins.toLocaleString("ru-RU");
    
  $("level").textContent=state.level; $("associationRank").textContent=ranks[state.rank];
  $("xpText").textContent=state.xp.toLocaleString("ru-RU"); $("xpNeed").textContent=xpNeed().toLocaleString("ru-RU"); $("xpBar").style.width=Math.min(100,state.xp/xpNeed()*100)+"%";
  $("playerName").textContent=(isPremiumActive()?"👑 ":"")+(state.playerName||"Пробуждённый");
  if($("hiddenAttentionStar")) $("hiddenAttentionStar").style.display=state.hiddenStarFound?"none":"block";
  if($("activeTitle")) $("activeTitle").textContent=state.selectedTitle?`「${state.selectedTitle}」`:"Без титула";
  if(state.playerClass){
    const c=classData[state.playerClass]; $("className").textContent=c.name+(state.evolution?" · "+state.evolution:""); $("avatar").innerHTML=classAvatarImg(state.playerClass,"hero-avatar-img");
    $("allocationPanel").classList.remove("hidden"); $("heroProfilePanel").classList.remove("hidden"); $("heroSkillsButton").classList.remove("hidden"); if($("heroProgressLinks"))$("heroProgressLinks").classList.remove("hidden"); $("classSelection").classList.add("hidden"); renderStats(); renderHeroProfile(); renderRebirthPanel();
    $("battlePlayerSprite").innerHTML=classAvatarImg(state.playerClass,"battle-class-img");
    if(state.level>=20&&!state.evolution){$("evolutionPanel").classList.remove("hidden");renderEvos();} else $("evolutionPanel").classList.add("hidden");
  }
  renderAssociation();updateNoticeDots();if($("skillsOverlay")&&!$("skillsOverlay").classList.contains("hidden"))renderSkillsOverlay();
  queueMicrotask(replaceRenderedEmoji);
}
function findHiddenStar(){
  if(state.hiddenStarFound)return;
  state.hiddenStarFound=true;
  save();
  render();
  syncAchievementStats();
}
function addXP(amount){
  state.xp+=amount;
  if(typeof updateQuestProgress==="function") updateQuestProgress("xp",amount);
  let leveledUp=false;
  while(state.level<100&&state.xp>=xpNeed()){
    leveledUp=true;
    const oldLevel=state.level;
    state.xp-=xpNeed();
    state.level++;
    const points=5;
    state.statPoints+=points;
    ensureTalents();
    state.talentPoints+=1;
    recalc();
    state.energy=maxEnergy();
    state.lastEnergyTick=Date.now();
    ensureNotices();
    state.notices.points=true;
    const skills=getClassSkills();
    const newlyUnlocked=state.playerClass?skills.filter(sk=>sk.level>oldLevel&&sk.level<=state.level):[];
    if(newlyUnlocked.length){
      state.notices.skills=true;
      showSystemNotice("НОВЫЙ НАВЫК",`${newlyUnlocked[0].name} открыт на ${state.level} уровне.`,"skills");
    }
    showLevelUpToast(state.level,points);
  }
  if(state.level===100)state.xp=Math.min(state.xp,xpNeed());
  save();
  render();
  if(leveledUp) showSystemNotice("НОВЫЕ ОЧКИ",`Зачислено 5 очков улучшения. Всего: ${state.statPoints}.`,"points");
}
function selectClass(key){
  if(!classData[key]) return;

  // Class selection is a permanent state change. Write it immediately to the
  // synchronous primary storage before doing any UI work.
  state.playerClass=key;
  state.evolution=null;
  state.selectedSkillId=0;
  state.healCooldown=0;
  state.spentStats=defaultStats();
  state.statPoints=0;
  state.energy=maxEnergy();
  state.lastEnergyTick=Date.now();
  recalc();
  state.hp=state.maxHp;
  state.mana=state.maxMana;
  ensureNotices();
  hadExistingSave=true;

  const saved=save();
  if(!saved){
    // Keep the in-memory choice and retry through the normal autosave/backup path.
    console.warn("[Rebirth] Не удалось записать основной save при выборе класса");
  }

  render();
  modal("ПРОБУЖДЕНИЕ",`Выбран путь: ${classData[key].name}. Стартовые характеристики отличаются у каждого класса.`);
}
function renderEvos(){const c=classData[state.playerClass];$("evolutionChoices").innerHTML=c.evo.map(e=>`<div class="evo"><b>${e[0]}</b><small>${e[1]}</small><button onclick="evolve('${e[0].replaceAll("'","")}')">ВЫБРАТЬ</button></div>`).join("");}
function evolve(name){state.evolution=name;recalc();state.hp=state.maxHp;save();modal("ЭВОЛЮЦИЯ",`Класс эволюционировал в «${name}». Бонусы класса усилены.`);render();}
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function gainCoins(amount){
  const actual=Math.max(0,Math.floor((Number(amount)||0)/2));
  state.coins+=actual;
  state.achievementStats=state.achievementStats||{goldEarned:0};
  state.achievementStats.goldEarned=(state.achievementStats.goldEarned||0)+actual;
  return actual;
}
let worldSelectedLocation=0;
const worldMapView={x:0,y:0,scale:0.62};
const worldNodePositions=[
 [9,16],[29,13],[49,16],[69,13],[89,18],
 [18,45],[39,42],[61,45],[82,42],[50,76]
];
const worldArtSet=["forest","ice","volcano","grotto"];
const worldIconSet={
  F:["🌿","Лесные руины"],
  E:["❄️","Ледяные вершины"],
  D:["🔥","Вулканическая крепость"],
  C:["💠","Магический грот"],
  B:["🌲","Зелёные пустоши"],
  A:["☀️","Небесные земли"],
  AA:["🌌","Разлом бездны"],
  S:["🌀","Вечный разлом"],
  SS:["✨","Предел хаоса"],
  SSS:["👑","Последняя бездна"]
};
function dungeonArtFor(index){return `img/dungeons/${worldArtSet[index%worldArtSet.length]}.jpg`;}
function worldProgressFor(index){ensureWorldProgress();return state.worldProgress[index]||{runs:0};}
function worldLocationUnlocked(index){return ranks.indexOf(dungeonTemplates[index][2])<=state.rank;}
function worldLocationName(d){return d[0];}
function worldMobName(d,mob){
  const variants=["Страж","Охотник","Элитный страж"];
  return `${d[0]} · ${variants[mob-1]}`;
}
function worldPowerPreview(d,index){
  const p=worldProgressFor(index).runs;
  const scale=Math.pow(1.2,Math.min(30,p+1));
  return {
    hpMin:Math.max(1,Math.floor(d[4]*1.74*scale)),
    hpMax:Math.max(1,Math.floor(d[5]*1.74*scale)),
    atkMin:Math.max(1,Math.floor((d[6]*1.82+state.rank*7)*scale)),
    atkMax:Math.max(1,Math.floor((d[7]*1.82+state.rank*7)*scale))
  };
}
function worldRankIcon(rank){
  const map={F:"img/icons/farm.png",E:"img/icons/skill.png",D:"img/icons/boss.png",C:"img/icons/artifact.png",B:"img/icons/dungeons.png",A:"img/icons/rating.png",AA:"img/icons/shadow.png",S:"img/icons/skill.png",SS:"img/icons/artifact.png",SSS:"img/icons/titles.png"};
  return map[rank]||"img/icons/nav_dungeons.png";
}
function worldMobIcon(index){
  const icons=["monster.png","boss.png","skill.png","farm.png","artifact.png","shadow.png"];
  return `img/icons/${icons[index%icons.length]}`;
}
function worldLocationMultiplier(index){
  const p=worldProgressFor(index).runs;
  return Math.pow(1.2,Math.min(30,p+1));
}
function worldLocationCoords(i){const p=worldNodePositions[i%worldNodePositions.length];return {x:p[0],y:p[1]};}
function renderWorldNode(d,i){
  const unlocked=worldLocationUnlocked(i), progress=worldProgressFor(i).runs, completed=progress>=9;
  const c=worldLocationCoords(i); const art=dungeonArtFor(i);
  const selected=i===worldSelectedLocation; const mult=worldLocationMultiplier(i);
  return `<button class="world-node ${unlocked?'':'locked'} ${completed?'completed':''} ${selected?'selected':''}" data-world-index="${i}" style="left:${c.x}%;top:${c.y}%;--node-art:url('${art}')" onclick="openWorldLocation(${i})">
    <span class="world-node-island-base"></span><span class="world-node-art"></span><span class="world-node-shade"></span>
    <span class="world-node-particles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>
    <span class="world-node-rank"><img src="${worldRankIcon(d[2])}" alt="">${d[2]}</span>
    <span class="world-node-name">${d[0]}</span>
    <span class="world-node-meta">${progress>=30?`🔴 30/30 · ×${mult.toFixed(2)}`:completed?`🔴 ${Math.min(30,progress+1)}/30 · ×${mult.toFixed(2)}`:`${progress+1}/30 · ×${mult.toFixed(2)}`}</span>
    ${!unlocked?'<span class="world-node-lock">🔒</span>':''}
  </button>`;
}
function renderWorldInfo(index){
  const d=dungeonTemplates[index], p=worldProgressFor(index), unlocked=worldLocationUnlocked(index), danger=p.runs>=9, finished=p.runs>=30, mult=worldLocationMultiplier(index), power=worldPowerPreview(d,index);
  const mobs=[`${d[0]} · Страж`,`${d[0]} · Охотник`,`${d[0]} · Элитный страж`];
  const btn=finished?`ВОЙТИ · КРАСНЫЕ ВРАТА ×${mult.toFixed(2)}`:`ВОЙТИ В ЛОКАЦИЮ · ${Math.min(30,p.runs+1)}/30`;
  return `<aside class="world-info-panel ${danger?'danger':''}">
    <div class="world-info-cover" style="--info-art:url('${dungeonArtFor(index)}')"><span class="world-info-rank"><img src="${worldRankIcon(d[2])}" alt="">${d[2]}</span><div><b>${d[0]}</b><small>Локация · ${Math.min(30,p.runs)}/30 прохождений</small></div></div>
    <div class="world-info-body">
      <div class="world-info-tags"><span>ТРЕБУЕТСЯ РАНГ <b>${d[2]}</b></span><span>УСИЛЕНИЕ <b>×${mult.toFixed(2)}</b></span></div>
      <div class="world-info-section"><b>ВОЗМОЖНЫЕ МОБЫ</b><div class="world-mob-list">${mobs.map((m,j)=>`<div><img src="${worldMobIcon(j)}" alt=""><span>${m}</span></div>`).join('')}</div></div>
      <div class="world-info-stats"><span>HP <b>${power.hpMin.toLocaleString()}–${power.hpMax.toLocaleString()}</b></span><span>АТК <b>${power.atkMin.toLocaleString()}–${power.atkMax.toLocaleString()}</b></span></div>
      <div class="world-info-section"><b>НАГРАДЫ</b><small>Золото · XP · добыча · зелья. Награда за каждого моба снижена, чтобы 3 врага не давали x3 награду.</small></div>
      <div class="world-info-progress"><div><span>ПРОГРЕСС</span><strong>${p.runs}/30</strong></div><i><em style="width:${Math.min(100,p.runs/30*100)}%"></em></i></div>
      ${danger?`<div class="world-danger-note">🔴 КРАСНЫЕ ВРАТА. Следующее прохождение усилено до ×${mult.toFixed(2)}.</div>`:''}
      <button class="world-enter-btn" onclick="startWorldLocation(${index})" ${!unlocked?'disabled':''}>${!unlocked?'🔒 ТРЕБУЕТСЯ РАНГ '+d[2]:btn} →</button>
    </div>
  </aside>`;
}
function renderWorldMap(){
  ensureWorldProgress();
  const map=$('worldRanks')||$('dungeonRanks'); if(!map)return;
  const nodes=dungeonTemplates.map((d,i)=>renderWorldNode(d,i)).join('');
  const lines=dungeonTemplates.slice(0,-1).map((_,i)=>{const a=worldLocationCoords(i),b=worldLocationCoords(i+1);return `<line x1="${a.x}%" y1="${a.y}%" x2="${b.x}%" y2="${b.y}%" />`;}).join('');
  map.innerHTML=`<div class="world-map-shell">
    <div class="world-map-viewport" id="worldMapViewport">
      <div class="world-map-canvas" id="worldMapCanvas">
        <div class="world-map-art"></div>
        <div class="world-map-vignette"></div>
        <svg class="world-map-routes" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>
        <div class="world-map-nodes">${nodes}</div>
        <div class="world-map-compass"><span>N</span><small>МИР</small></div>
        <div class="world-map-stat"><b>10</b><small>ЛОКАЦИЙ</small><i></i><b>${dungeonTemplates.filter((_,i)=>worldLocationUnlocked(i)).length}</b><small>ОТКРЫТО</small></div>
      </div>
      <div class="world-info-overlay" id="worldInfoOverlay" onclick="closeWorldLocation(event)">
        <div class="world-info-dialog" onclick="event.stopPropagation()">
          <button class="world-info-close" type="button" onclick="closeWorldLocation()" aria-label="Закрыть">×</button>
          ${renderWorldInfo(worldSelectedLocation)}
        </div>
      </div>
    </div>
  </div>`;
  applyWorldMapTransform(); initWorldMapInteractions();
}
function ensureDungeonProgress(){
  const total=ranks.length*3;
  if(!Array.isArray(state.dungeonProgress)) state.dungeonProgress=[];
  while(state.dungeonProgress.length<total) state.dungeonProgress.push(0);
  if(state.dungeonProgress.length>total) state.dungeonProgress=state.dungeonProgress.slice(0,total);
}
function dungeonData(rankIndex,floor){
  const base=dungeonTemplates[rankIndex];
  const names=[
    [`${base[0]} · Внешний путь`,`img/dungeons/mobs/placeholder.png`],
    [`${base[0]} · Глубины`,`img/dungeons/mobs/placeholder.png`],
    [`${base[0]} · Сердце`,`img/dungeons/bosses/placeholder.png`]
  ];
  const scale=Math.pow(1.58,rankIndex)*Math.pow(1.32,floor);
  return {rank:ranks[rankIndex],floor,name:names[floor][0],image:names[floor][1],boss:floor===2,hpMin:Math.max(80,Math.floor(base[4]*scale*.72)),hpMax:Math.max(120,Math.floor(base[5]*scale*.72)),atkMin:Math.max(8,Math.floor(base[6]*scale*.72)),atkMax:Math.max(12,Math.floor(base[7]*scale*.72)),goldMin:Math.max(80,Math.floor(base[8]*Math.pow(1.48,rankIndex)*Math.pow(1.22,floor))),goldMax:Math.max(120,Math.floor(base[9]*Math.pow(1.48,rankIndex)*Math.pow(1.22,floor)))};
}
function dungeonXpPreview(rankIndex,floor){
  const base=0.055+rankIndex*0.006;
  const floorMult=1+floor*0.08;
  return Math.max(24,Math.floor(xpNeed(state.level)*base*floorMult*0.4));
}
function dungeonIndex(rankIndex,floor){return rankIndex*3+floor;}
function dungeonRuns(rankIndex,floor){
  ensureDungeonProgress();
  const idx=dungeonIndex(rankIndex,floor);
  const value=Number(state.dungeonProgress[idx]);
  if(!Number.isFinite(value) || value<0){state.dungeonProgress[idx]=0;return 0;}
  return Math.floor(value);
}
function dungeonUnlocked(rankIndex,floor){if(rankIndex>state.rank)return false;if(floor===0)return true;return dungeonRuns(rankIndex,floor-1)>=5;}
function renderDungeons(){
  ensureDungeonProgress();
  const root=$('dungeonRanks');if(!root)return;
  const selected=Math.min(Math.max(0,state.dungeonSelectedRank||0),ranks.length-1);
  const tabs=ranks.map((r,i)=>`<button class="dungeon-rank-tab ${i===selected?'active':''} ${i>state.rank?'locked':''}" onclick="selectDungeonRank(${i})" ${i>state.rank?'disabled':''}>${r}${i>state.rank?' 🔒':''}</button>`).join('');
  const dungeonCardArt=["forest","ice","volcano","grotto"];
  const cards=[0,1,2].map(f=>{
    const d=dungeonData(selected,f),runs=dungeonRuns(selected,f),open=dungeonUnlocked(selected,f);
    const need=f===0?'Открыто':`Нужно победить ${dungeonData(selected,f-1).name} ещё ${Math.max(0,5-dungeonRuns(selected,f-1))} раз`;
    const art=dungeonCardArt[selected%dungeonCardArt.length];
    return `<div class="dungeon-card ${open?'':'locked'} ${d.boss?'boss':''}"><div class="dungeon-card-art" style="--dungeon-bg:url('img/dungeons/${art}.jpg')"><div class="dungeon-card-bg"></div><img src="${d.image}" alt=""><span>${d.boss?'БОСС':'ПОДЗЕМЕЛЬЕ '+(f+1)}</span></div><div class="dungeon-card-body"><div class="dungeon-card-title"><b>${d.name}</b><small>${d.boss?'Главный босс ранга':'3 противника за один заход'}</small></div><div class="dungeon-rewards"><span>⚡ 5</span><span>🪙 ${d.goldMin.toLocaleString('ru-RU')}–${d.goldMax.toLocaleString('ru-RU')}</span><span>✨ ${dungeonXpPreview(selected,f).toLocaleString('ru-RU')} XP</span><span>🏰 Пройдено: ${runs}</span></div>${open?`<button class="primary-btn" onclick="startDungeonRun(${selected},${f})">ВОЙТИ</button>`:`<div class="dungeon-lock">🔒 ${need}</div>`}</div></div>`;
  }).join('');
  root.innerHTML=`<div class="dungeon-shell"><div class="dungeon-head"><div><span>ПОДЗЕМЕЛЬЯ</span><small>Спокойный PvE-фарм · каждый ранг открывает свою ветку</small></div><div class="dungeon-energy">⚡ ${Math.floor(state.energy)} / ${maxEnergy()}</div></div><div class="dungeon-ranks">${tabs}</div><div class="dungeon-list">${cards}</div></div>`;
}
function selectDungeonRank(index){if(index<0||index>=ranks.length||index>state.rank)return;state.dungeonSelectedRank=index;renderDungeons();}
function startDungeonRun(rankIndex,floor){
  ensureDungeonProgress();if(rankIndex>state.rank||!dungeonUnlocked(rankIndex,floor))return;
  if(state.energy<5){modal('НЕТ ЭНЕРГИИ','Для входа в подземелье нужно 5 энергии.');return;}
  const d=dungeonData(rankIndex,floor);state.energy-=5;
  state.battle={dungeonMode:true,dungeonRank:rankIndex,dungeonFloor:floor,dungeonWave:1,dungeonMobs:3,dungeonImage:d.image,dungeonBoss:d.boss,turn:0,lastSkillTurn:-99,name:d.name,enemyImage:d.image,dungeonArt:dungeonArtFor(rankIndex),maxHp:0,hp:0,atk:0,xp:0,reward:0};
  setupDungeonWave();save();showBattle(d.name);
}
function setupDungeonWave(){
  const b=state.battle;if(!b?.dungeonMode)return;const d=dungeonData(b.dungeonRank,b.dungeonFloor);const wave=Math.max(1,Number(b.dungeonWave)||1);const waveMult=1+(wave-1)*.12+(b.dungeonBoss?.08:0);const hp=Math.max(1,Math.floor(rand(d.hpMin,d.hpMax)*waveMult));const atk=Math.max(1,Math.floor(rand(d.atkMin,d.atkMax)*waveMult));const rankIndex=b.dungeonRank;const xp=Math.max(24,Math.floor(xpNeed(state.level)*(0.055+rankIndex*.006)*(1+(b.dungeonFloor||0)*.08)*(.92+wave*.06)*0.4));const gold=Math.max(1,Math.floor(rand(d.goldMin,d.goldMax)/3*(.9+wave*.08)));b.name=b.dungeonBoss?`${d.name} · Босс`:`${d.name} · Моб ${wave}/3`;b.enemyImage=b.dungeonBoss?'img/dungeons/bosses/placeholder.png':'img/dungeons/mobs/placeholder.png';b.maxHp=hp;b.hp=hp;b.atk=atk;b.xp=xp;b.reward=gold;if(!b.dungeonReward)b.dungeonReward={xp:0,gold:0,loot:[]};}
function grantDungeonSpecificLoot(){
  if(Math.random()>=0.20)return null;const loot=makeLoot();if(!loot)return null;state.inventory.push(loot);state.achievementStats.lootFound++;if(['Эпическое','Легендарное','Реликтовое','Мифическое','Адское','Божественное'].includes(loot.rarity))state.achievementStats.rareLoot++;ensureNotices();state.notices.inventory=true;showSystemNotice('НОВАЯ ДОБЫЧА',`${loot.name} · ${loot.rarity}`,'inventory');return loot;
}
function finishDungeonRun(){
  const b=state.battle;
  if(!b?.dungeonMode)return;
  ensureDungeonProgress();
  const idx=dungeonIndex(Number(b.dungeonRank),Number(b.dungeonFloor));
  const current=Number(state.dungeonProgress[idx]);
  state.dungeonProgress[idx]=(Number.isFinite(current)&&current>=0?Math.floor(current):0)+1;state.achievementStats.dungeons++;state.dungeonStreak=(state.dungeonStreak||0)+1;updateTitles();updateQuestProgress('dungeons',1);updateQuestProgress('kills',3);state.achievementStats.kills+=3;syncAchievementStats();const r=b.dungeonReward||{xp:0,gold:0,loot:[]};state.battle=null;state.hp=state.maxHp;state.mana=state.maxMana;save();render();showScreen('dungeons');const lootText=r.loot.length?`<br>🎁 ${r.loot.map(x=>`${x.name} · ${x.rarity}`).join(', ')}`:'';modal('ПОДЗЕМЕЛЬЕ ПРОЙДЕНО',`«${dungeonData(b.dungeonRank,b.dungeonFloor).name}» завершено.<br>+${r.xp.toLocaleString('ru-RU')} XP · +${r.gold.toLocaleString('ru-RU')} 🪙.${lootText}<br><br>Прогресс: ${state.dungeonProgress[idx]}/5 побед.`);
}
function dungeonBattleWin(){const b=state.battle;if(!b?.dungeonMode)return false;const r=b.dungeonReward||(b.dungeonReward={xp:0,gold:0,loot:[]});r.xp+=Math.floor(b.xp);r.gold+=Math.floor(b.reward);addXP(Math.floor(b.xp));gainCoins(Math.floor(b.reward));const loot=grantDungeonSpecificLoot();if(loot)r.loot.push(loot);if((b.dungeonWave||1)<3){b.dungeonWave++;state.hp=state.maxHp;state.mana=state.maxMana;setupDungeonWave();save();showBattle(dungeonData(b.dungeonRank,b.dungeonFloor).name,false);log(`Моб ${b.dungeonWave-1}/3 повержен. Следующий враг уже появился.`,'system');return true;}finishDungeonRun();return true;}

function openWorldLocation(index){
  if(index<0||index>=dungeonTemplates.length)return;
  worldSelectedLocation=index;
  const map=$("worldRanks"), overlay=$("worldInfoOverlay");
  if(map && overlay){
    map.querySelector(".world-node.selected")?.classList.remove("selected");
    map.querySelector(`.world-node[data-world-index="${index}"]`)?.classList.add("selected");
    const dialog=map.querySelector(".world-info-dialog");
    if(dialog) dialog.innerHTML=`<button class="world-info-close" type="button" onclick="closeWorldLocation()" aria-label="Закрыть">×</button>${renderWorldInfo(index)}`;
    requestAnimationFrame(()=>overlay.classList.add("show"));
    return;
  }
  renderWorldMap();
  requestAnimationFrame(()=>{const el=$("worldInfoOverlay");if(el)el.classList.add("show");});
}
function closeWorldLocation(e){
  if(e && e.target && e.target.id!=='worldInfoOverlay') return;
  const overlay=$('worldInfoOverlay');
  if(!overlay)return;
  overlay.classList.remove('show');
}
function worldZoom(delta){worldMapView.scale=Math.max(.45,Math.min(1.35,worldMapView.scale*delta));applyWorldMapTransform();}
function worldResetView(){worldMapView.x=0;worldMapView.y=0;worldMapView.scale=.62;applyWorldMapTransform();}
function applyWorldMapTransform(){const c=$('worldMapCanvas');if(c)c.style.transform=`translate(${worldMapView.x}px,${worldMapView.y}px) scale(${worldMapView.scale})`;}
function initWorldMapInteractions(){
  const vp=$('worldMapViewport'); if(!vp||vp.dataset.bound==='1')return; vp.dataset.bound='1';
  const pointers=new Map(); let startX=0,startY=0,baseX=0,baseY=0,drag=false,pinchStart=0,pinchScale=.62;
  vp.addEventListener('pointerdown',e=>{if(e.target.closest('.world-info-overlay,.world-zoom-controls'))return;pointers.set(e.pointerId,e);vp.setPointerCapture?.(e.pointerId);if(pointers.size===1){drag=true;startX=e.clientX;startY=e.clientY;baseX=worldMapView.x;baseY=worldMapView.y;}else if(pointers.size===2){const a=[...pointers.values()];pinchStart=Math.hypot(a[0].clientX-a[1].clientX,a[0].clientY-a[1].clientY);pinchScale=worldMapView.scale;drag=false;}});
  vp.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,e);if(pointers.size===2){const a=[...pointers.values()];const dist=Math.hypot(a[0].clientX-a[1].clientX,a[0].clientY-a[1].clientY);if(pinchStart)worldMapView.scale=Math.max(.45,Math.min(1.35,pinchScale*(dist/pinchStart)));applyWorldMapTransform();return;}if(drag){worldMapView.x=baseX+(e.clientX-startX);worldMapView.y=baseY+(e.clientY-startY);applyWorldMapTransform();}});
  const end=e=>{pointers.delete(e.pointerId);if(pointers.size===0)drag=false;}; vp.addEventListener('pointerup',end);vp.addEventListener('pointercancel',end);vp.addEventListener('wheel',e=>{if(e.target.closest('.world-info-overlay,.world-zoom-controls'))return;e.preventDefault();worldZoom(e.deltaY<0?1.08:.93)},{passive:false});
}
function startWorldLocation(i){
  ensureWorldProgress(); const d=dungeonTemplates[i]; if(!worldLocationUnlocked(i)){modal('МИР',`Для этой локации нужен ранг ${d[2]}.`);return;}
  const progress=worldProgressFor(i).runs; if(progress>=30){modal('КРАСНЫЕ ВРАТА',`30 прохождений завершено. Врата остаются красными и сохраняют усиление ×${worldLocationMultiplier(i).toFixed(2)}.`);return;} if(state.energy<energyCostDungeon()){modal('НЕТ ЭНЕРГИИ',`Для входа нужно ${energyCostDungeon()} энергии. Сейчас: ${Math.floor(state.energy)}.`);return;}
  state.energy-=energyCostDungeon(); const runNumber=Math.min(30,progress+1);
  state.battle={world:true,boss:false,turn:0,lastSkillTurn:-99,worldLocationIndex:i,worldRun:runNumber,worldMob:1,worldMobs:3,worldRunRewards:{gold:0,xp:0,loot:[],potions:[]},name:worldMobName(d,1),icon:d[1],dungeonArt:dungeonArtFor(i),maxHp:0,hp:0,atk:0,xp:0,reward:0}; setupWorldMob(); save(); showBattle(d[0]);
}
function setupWorldMob(){
  const b=state.battle;if(!b?.world)return; const d=dungeonTemplates[b.worldLocationIndex];
  const scale=worldLocationMultiplier(b.worldLocationIndex); const mobFactor=1+(Math.max(0,(b.worldMob||1)-1)*0.08);
  const hp=Math.max(1,Math.floor(rand(d[4],d[5])*1.25*scale*mobFactor)); const atk=Math.max(1,Math.floor((rand(d[6],d[7])*1.32+state.rank*5)*scale*mobFactor));
  const rankIndex=Math.max(0,ranks.indexOf(d[2]));
  b.name=worldMobName(d,b.worldMob||1);b.icon=d[1];b.dungeonArt=dungeonArtFor(b.worldLocationIndex);b.maxHp=hp;b.hp=hp;b.atk=atk; b.xp=Math.max(40,Math.floor(xpNeed(state.level)*(0.065+Math.min(0.04,rankIndex*0.004))*Math.min(1.35,1+(Math.max(0,(b.worldRun||1)-1)*0.03)))); b.reward=Math.max(1,Math.floor(rand(d[8],d[9])/18*scale));
}
function renderAssociation(){if(state.rank>=ranks.length-1){$("nextRankTitle").textContent="Достигнут максимальный ранг";$("rankRequirements").innerHTML=`<div class="req ok">SSS — максимальный ранг</div>`;$("rankUpBtn").disabled=true;return;}const next=ranks[state.rank+1],cost=rankCost(),lvlOk=state.level>=requiredLevel(state.rank+1),coinOk=state.coins>=cost,energyOk=state.energy>=energyCostRank();$("nextRankTitle").textContent="Следующий ранг: "+next;$("rankRequirements").innerHTML=`<div class="req"><span>Уровень</span><b class="${lvlOk?"ok":"bad"}">${state.level} / ${requiredLevel(state.rank+1)}</b></div><div class="req"><span>Монеты</span><b class="${coinOk?"ok":"bad"}">${state.coins.toLocaleString()} / ${cost.toLocaleString()}</b></div><div class="req"><span>Энергия</span><b class="${energyOk?"ok":"bad"}">${Math.floor(state.energy)} / ${energyCostRank()}</b></div><div class="req"><span>Испытание босса</span><b>Нужно победить</b></div>`;$("rankUpBtn").disabled=!(lvlOk&&coinOk&&energyOk);}
function rankUp(){const cost=rankCost(),need=requiredLevel(state.rank+1);if(state.level<need||state.coins<cost||state.energy<energyCostRank())return;state.coins-=cost;state.energy-=energyCostRank();ensureNotices();state.notices.association=false;save();updateNoticeDots();startBossTrial();}
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
  if(pct>=1){tier="S";reward={gold:60000,shards:100,loot:2};}
  else if(pct>=.75){tier="A";reward={gold:40000,shards:75,loot:1};}
  else if(pct>=.50){tier="B";reward={gold:25000,shards:50,loot:1};}
  else if(pct>=.25){tier="C";reward={gold:15000,shards:30,loot:1};}
  else if(pct>=.10){tier="D";reward={gold:8000,shards:18,loot:0};}
  else {tier="E";reward={gold:3000,shards:8,loot:0};}
  const actualGold=gainCoins(reward.gold); reward.gold=actualGold; state.shards+=reward.shards;
  const drops=[]; for(let i=0;i<reward.loot;i++){const loot=makeLoot(); if(loot){state.inventory.push(loot);drops.push(loot);}}
  if(drops.length) {ensureNotices();state.notices.inventory=true; state.achievementStats.lootFound+=drops.length; for(const d of drops)if(["Эпическое","Легендарное","Реликтовое","Мифическое","Адское","Божественное"].includes(d.rarity))state.achievementStats.rareLoot++; showSystemNotice("НОВАЯ ДОБЫЧА",`${drops.length} предмет${drops.length===1?"":"а"} добавлено в инвентарь.` ,"inventory");}
  return {tier,reward,pct,drops};
}
function finishWorldBossAttempt(){
  const b=state.battle; if(!b?.worldBoss)return;
  const damage=Math.max(0,Math.floor(b.maxHp-b.hp));
  const result=worldBossReward(damage,b.maxHp);
  const artifact=grantArtifactFromWorldBoss(result.pct);
  state.worldBossHistory.push({time:Date.now(),damage,maxHp:b.maxHp,pct:result.pct,tier:result.tier});
  state.worldBossDamage=Math.max(state.worldBossDamage,damage);
  state.battle=null; state.hp=state.maxHp; state.mana=state.maxMana; checkAchievements(); save(); render(); openSubscreen("worldBoss");
  const lootText=result.drops.length?` · 🎁 ${result.drops.map(x=>x.name+" ["+x.rarity+"]").join(", ")}`:"";
  const artifactText=artifact?` · ◈ Артефакт: ${artifact.name} [${artifact.rarity}]`:"";
  modal("МИРОВОЙ БОСС",`Урон: ${damage.toLocaleString("ru-RU")} / ${b.maxHp.toLocaleString("ru-RU")} (${Math.floor(result.pct*100)}%). Ранг награды: ${result.tier}. Получено: 🪙 ${result.reward.gold.toLocaleString("ru-RU")} · <img class="inline-icon" src="img/icons/shard.png" alt=""> ${result.reward.shards}${lootText}${artifactText}`);
}
function startWorldBoss(){
  const wb=worldBossState();
  if(!state.playerClass){modal("МИРОВОЙ БОСС","Сначала выбери класс персонажа.");return;}
  if(wb.attempts>=3){modal("МИРОВОЙ БОСС","На этот цикл уже использованы все 3 попытки. Новый босс появится через "+worldBossTimeLeft(wb.left)+".");return;}
  const hp=Math.max(1,Math.floor((wb.hp/1.3)*1.5));
  const atk=Math.max(1,Math.floor((((state.atk*.72+state.def*.24+state.rank*12)/1.3)*2)*1.5));
  state.battle={worldBoss:true,boss:false,turn:0,lastSkillTurn:-99,name:"Мировой босс",icon:"👑",maxHp:hp,hp,atk,xp:0,reward:0};
  state.worldBossAttempts++;
  save(); showBattle("МИРОВОЙ БОСС"); updateFarmBattleUI();
}
function renderWorldBoss(){
  const wb=worldBossState();
  const pct=state.worldBossHp?Math.floor((state.worldBossDamage/state.worldBossHp)*100):0;
  const history=(wb.history||[]).slice().reverse().map((x,i)=>`<div class="world-boss-history"><span>#${(wb.history.length-i)}</span><b>${x.damage.toLocaleString("ru-RU")} урона</b><small>${Math.floor(x.pct*100)}% · награда ${x.tier}</small></div>`).join("");
  return `<div class="world-boss-card"><div class="world-boss-icon">👑</div><h2>МИРОВОЙ БОСС</h2><p>Каждые 12 часов появляется новый босс с случайным запасом здоровья.</p><div class="world-boss-hp"><span>HP БОССА</span><b>${wb.hp.toLocaleString("ru-RU")}</b></div><div class="quest-bar"><div style="width:${Math.min(100,pct)}%"></div></div><div class="world-boss-stats"><span>⚔️ Попытки: <b>${wb.attempts}/3</b></span><span>⏱️ Новый босс: <b>${worldBossTimeLeft(wb.left)}</b></span></div><div class="world-boss-rewards"><b>🏆 НАГРАДА ПО УРОНУ</b><small>Чем больше % HP ты снимешь за попытку, тем выше награда.</small><span>E: 3 000 🪙 · D: 8 000 · C: 15 000 · B: 25 000 · A: 40 000 · S: 60 000 🪙 + лут</span></div><button class="primary-btn" onclick="startWorldBoss()" ${wb.attempts>=3?"disabled":""}>👑 СРАЖАТЬСЯ · ${3-wb.attempts} ПОПЫТ.</button></div><h3 class="world-boss-section">МОЙ РЕЙТИНГ УРОНА</h3>${history||'<div class="bazaar-empty">Попыток ещё не было.</div>'}`;
}
function startBossTrial(){const maxHp=Math.max(1,Math.floor(((state.maxHp*1.7+state.rank*800)/1.3)*1.5));const atk=Math.max(1,Math.floor(((state.atk*.58+state.def*.18)/1.3)*1.5));state.battle={boss:true,classKey:"paladin",turn:0,lastSkillTurn:-99,name:"Паладин · Страж "+ranks[state.rank]+" ранга",icon:"🛡️",maxHp,hp:maxHp,atk,xp:xpNeed()*1.2,reward:0};save();showBattle("ИСПЫТАНИЕ АССОЦИАЦИИ");}
function startDungeon(i){const d=dungeonTemplates[i];if(state.energy<energyCostDungeon()){modal("НЕТ ЭНЕРГИИ",`Для входа нужно ${energyCostDungeon()} энергии. Сейчас: ${Math.floor(state.energy)}.`);return;}state.energy-=energyCostDungeon();const enemyHp=Math.max(1,Math.floor(rand(d[4],d[5])*1.25)),enemyAtk=Math.max(1,Math.floor((rand(d[6],d[7])*1.32+state.rank*5)/1.28)),gold=Math.max(1,Math.floor(rand(d[8],d[9])*(1/6))),rankIndex=Math.max(0,ranks.indexOf(d[2])),xp=Math.max(40,Math.floor(xpNeed(state.level)*(0.075+Math.min(0.045,rankIndex*0.005))));state.battle={boss:false,turn:0,lastSkillTurn:-99,name:d[0],icon:d[1],dungeonArt:dungeonArtFor(i),dungeonIndex:i,maxHp:enemyHp,hp:enemyHp,atk:enemyAtk,xp,reward:gold};save();showBattle(d[0]);}
function startFarmZone(){
  if(!showLevelGate("farm")) return;
  const farmHp=Math.max(1,Math.floor((((state.maxHp*0.58)+state.atk*2.55)*1.15)/1.28));const farmAtk=Math.max(1,Math.floor(((state.def*0.92+state.atk*0.14)*1.22)/1.28));state.battle={boss:false,turn:0,lastSkillTurn:-99,farm:true,name:"Фарм-монстр #"+(Number(state.farmKills||0)+1),icon:"👹",maxHp:farmHp,hp:farmHp,atk:farmAtk,xp:500,reward:0};
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
  if(!showLevelGate("arena")) return;
  resetArenaDay();
  if(state.arenaAttempts>=5){modal('АРЕНА','Сегодня осталось 0 из 5 попыток.');return;}
  const opp=arenaOpponents().find(x=>x.id===id);if(!opp)return;
  state.arenaAttempts++;
  const c=classData[opp.classKey];
  const enemyMax=Math.floor(c.hp+opp.level*22+opp.rating*.35);
  const enemyAtk=Math.floor(c.atk+opp.level*2.2+opp.rating*.05);
  state.battle={arena:true,turn:0,lastSkillTurn:-99,opponent:opp,boss:false,name:opp.name,icon:c.icon,maxHp:enemyMax,hp:enemyMax,atk:enemyAtk,xp:0,reward:0};
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

function showBattle(title,resetResources=true){$("battleDungeonName").textContent=title;$("battleFloor").textContent=state.battle?.world?`${state.battle.worldMob||1}/${state.battle.worldMobs||3}`:state.battle?.dungeonMode?`${state.battle.dungeonWave||1}/3`:"1/1";const battleType=state.battle?.world?"dungeon":state.battle?.worldBoss?"worldboss":state.battle?.farm?"farm":state.battle?.arena?"arena":state.battle?.boss?"boss":"dungeon";const battleScreen=$("screen-battle");battleScreen.dataset.battleType=battleType;if(state.battle?.dungeonArt){battleScreen.style.setProperty("--battle-dungeon-art",`url("${state.battle.dungeonArt}")`);}else{battleScreen.style.removeProperty("--battle-dungeon-art");}$("screen-character").classList.remove("active");$("screen-dungeons").classList.remove("active");$("screen-association").classList.remove("active");$("screen-chat").classList.remove("active");$("screen-more").classList.remove("active");$("screen-sub").classList.remove("active");$("screen-battle").classList.add("active");window.scrollTo({top:0,left:0,behavior:"auto"});document.documentElement.scrollTop=0;document.body.scrollTop=0;document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));if(resetResources){state.hp=state.maxHp;state.mana=state.maxMana;state.healCooldown=0;}save();$("enemyName").textContent=state.battle.name;$("enemySprite").innerHTML=battleEnemyImg();const selected=getSelectedSkill();$("skillName").textContent=selected?`${selected.name} · ${selected.mana} МАНЫ`:"НАВЫК";$("battleLog").innerHTML="";log("Бой начался. "+state.battle.name+" появился!","system");updateBattle();updateFarmBattleUI();}
function updateBattle(){const b=state.battle;if(!b)return;$("battlePlayerHp").textContent=Math.max(0,Math.floor(state.hp));$("battlePlayerMaxHp").textContent=state.maxHp;$("playerHpBar").style.width=Math.max(0,state.hp/state.maxHp*100)+"%";$("battlePlayerMana").textContent=Math.max(0,Math.floor(state.mana));$("battlePlayerMaxMana").textContent=Math.floor(state.maxMana);$("battlePlayerManaBar").style.width=(state.maxMana?Math.max(0,state.mana/state.maxMana*100):0)+"%";$("enemyHp").textContent=Math.max(0,Math.floor(b.hp));$("enemyMaxHp").textContent=Math.floor(b.maxHp);$("enemyHpBar").style.width=Math.max(0,b.hp/b.maxHp*100)+"%";const selected=getSelectedSkill();if($("skillName")){const skillReady=!b || (Math.max(0,Number(b.turn)||0)-Number(b.lastSkillTurn??-99)>=2);$("skillName").textContent=selected?`${selected.name} · ${selected.mana} МАНЫ${skillReady?"":" · ЧЕРЕЗ ХОД"}`:"НАВЫК";const skillBtn=$("skillBtn");if(skillBtn)skillBtn.disabled=!skillReady;}if($("healBtn")){const ready=state.healCooldown<=0;$("healBtn").disabled=!ready;$("healBtn").classList.toggle("on-cooldown",!ready);$("healBtn").querySelector("span").textContent=ready?"ЛЕЧЕНИЕ · 200 МАНЫ":`ЛЕЧЕНИЕ · ${state.healCooldown} ХОД${state.healCooldown===1?"":"А"}`;}if($("manaText"))$("manaText").textContent=Math.floor(state.mana);if($("manaMax"))$("manaMax").textContent=Math.floor(state.maxMana);if($("manaBar"))$("manaBar").style.width=(state.maxMana?Math.max(0,state.mana/state.maxMana*100):0)+"%";if($("potionAttackCount"))$("potionAttackCount").textContent=state.potions?.attack||0;if($("potionHealCount"))$("potionHealCount").textContent=state.potions?.heal||0;if($("potionManaCount"))$("potionManaCount").textContent=state.potions?.mana||0;}
function battleFX(target,type="hit"){const el=$(target);if(!el)return;el.classList.remove("fx-hit","fx-attack","fx-heal","fx-skill");void el.offsetWidth;el.classList.add(type==="heal"?"fx-heal":type==="skill"?"fx-skill":type==="attack"?"fx-attack":"fx-hit");setTimeout(()=>el.classList.remove("fx-hit","fx-attack","fx-heal","fx-skill"),520);}
function log(t,type="hit"){const el=document.createElement("div");el.className="log-"+type;el.textContent=t;$("battleLog").appendChild(el);$("battleLog").scrollTop=$("battleLog").scrollHeight;}
function enemyTurn(){if(!state.battle||state.battle.hp<=0)return;const dodge=Math.random()<state.dodge/100;if(dodge){log("Ты уклонился от атаки!","system");save();return;}const raw=state.battle.atk*(.85+Math.random()*.3);const dmg=Math.max(1,Math.floor(raw-state.def*.38));state.hp=Math.max(0,state.hp-dmg);log(`${state.battle.name} наносит ${dmg} урона.`,"dmg");$("battlePlayerSprite").classList.remove("shake");void $("battlePlayerSprite").offsetWidth;$("battlePlayerSprite").classList.add("shake");battleFX("battlePlayerSprite","hit");if(state.hp<=0){log("Ты пал в бою.","dmg");setTimeout(()=>defeatBattle(),650);}save();}
function consumeBattleTurn(){ const b=state.battle;if(!b)return; b.turn=Math.max(0,Number(b.turn)||0)+1; state.healCooldown=Math.max(0,(Number(state.healCooldown)||0)-1); }
function playerAttack(mult=1){if(!state.battle||state.hp<=0)return;consumeBattleTurn();const crit=Math.random()*100<state.crit;let dmg=Math.floor(state.atk*(.9+Math.random()*.2)*mult);if(crit)dmg=Math.floor(dmg*(1+state.critDamage/100));state.battle.hp=Math.max(0,state.battle.hp-dmg);if(state.battle.worldBoss) state.battle.damageDealt=(state.battle.damageDealt||0)+dmg; state.battle.attackBuff=0;battleFX("battlePlayerSprite",mult>1?"skill":"attack");log(`Ты наносишь ${dmg}${crit?" КРИТИЧЕСКИЙ УДАР!":""} урона.`,"hit");$("enemySprite").classList.remove("hit");void $("enemySprite").offsetWidth;$("enemySprite").classList.add("hit");battleFX("enemySprite",crit?"hit":"attack");if(state.battle.hp<=0)winBattle();else setTimeout(enemyTurn,250);updateBattle();save();}
function skill(){if(!state.battle||state.hp<=0)return;const selected=getSelectedSkill();if(!selected)return;if(state.level<selected.level){openSkillInfo(state.selectedSkillId);return;}const turn=Math.max(0,Number(state.battle.turn)||0),last=Number(state.battle.lastSkillTurn??-99);if(turn-last<2){log("Навык можно использовать только через ход.","system");updateBattle();return;}if(state.mana<selected.mana){log(`Недостаточно маны. Нужно ${selected.mana}, доступно ${Math.floor(state.mana)}.`,"system");return;}state.mana-=selected.mana;state.battle.lastSkillTurn=turn+1;save();playerAttack(selected.mult); }
function heal(){if(!state.battle||state.hp<=0)return;if(state.healCooldown>0){log(`Лечение будет доступно через ${state.healCooldown} твоих хода.` ,"system");return;}const healManaCost=200;if(state.mana<healManaCost){log(`Недостаточно маны для лечения. Нужно ${healManaCost}, доступно ${Math.floor(state.mana)}.` ,"system");updateBattle();return;}consumeBattleTurn();state.mana-=healManaCost;const amount=Math.floor(state.maxHp*(.24+state.stamina*.003));state.hp=Math.min(state.maxHp,state.hp+amount);state.healCooldown=2;log(`Восстановлено ${amount} HP за ${healManaCost} маны. Следующее лечение доступно через 2 хода.`,`heal`);battleFX("battlePlayerSprite","heal");updateBattle();save();setTimeout(enemyTurn,250);}
function grantWorldMobRewards(b){
  const earnedXp=Math.floor(b.xp||0); const rawGold=Math.floor(b.reward||0); const gold=gainCoins(rawGold);
  addXP(earnedXp); state.achievementStats.kills++;
  updateQuestProgress('kills',1);
  const loot=addLootFromMob(); if(loot){ensureNotices();state.notices.inventory=true;state.achievementStats.lootFound++;showSystemNotice("НОВЫЙ ПРЕДМЕТ",`${loot.name} · ${loot.rarity}`,"inventory");if(["Эпическое","Легендарное","Реликтовое","Мифическое","Адское","Божественное"].includes(loot.rarity))state.achievementStats.rareLoot++;}
  const potionDrop=grantPotionDrop();
  const rr=b.worldRunRewards||(b.worldRunRewards={gold:0,xp:0,loot:[],potions:[]});
  rr.gold+=gold;rr.xp+=earnedXp;if(loot)rr.loot.push(loot);if(potionDrop)rr.potions.push(potionDrop);
  return {earnedXp,gold,loot,potionDrop};
}
function finishWorldRun(){
  const b=state.battle; const idx=b.worldLocationIndex; const p=worldProgressFor(idx);
  if(p.runs<30) p.runs=Math.min(30,p.runs+1); state.achievementStats.dungeons++; state.dungeonStreak=(state.dungeonStreak||0)+1; updateTitles(); updateQuestProgress('dungeons',1);
  const rr=b.worldRunRewards||{gold:0,xp:0,loot:[],potions:[]};
  const d=dungeonTemplates[idx]; state.battle=null;state.hp=state.maxHp;state.mana=state.maxMana;save();render();showScreen('world');
  const lootText=rr.loot.length?`<br>🎁 Добыча: ${rr.loot.map(x=>`${x.name} · ${x.rarity}`).join(', ')}`:'<br>🎁 Добыча: не выпала';
  const potionText=rr.potions.length?`<br>🧪 Зелья: ${rr.potions.map(potionName).join(', ')}`:'';
  modal(`ПРОХОЖДЕНИЕ ${p.runs}/30`,`«${d[0]}» завершено. Все 3 моба побеждены.<br>+${rr.xp.toLocaleString('ru-RU')} XP · +${rr.gold.toLocaleString('ru-RU')} золота.${lootText}${potionText}<br><br>${p.runs>=30?`🔴 Красные врата закреплены на усилении ×${worldLocationMultiplier(idx).toFixed(2)}.`:`Следующее прохождение будет сильнее в ×1.20.`}`);
}
function winBattle(){
  const b=state.battle;if(!b)return;
  if(b.dungeonMode){ if(dungeonBattleWin()) return; }
  if(b.world){
    const reward=grantWorldMobRewards(b);
    const mob=b.worldMob||1;
    if(mob<(b.worldMobs||3)){
      b.worldMob=mob+1;state.hp=state.maxHp;state.mana=state.maxMana;setupWorldMob();state.hp=state.maxHp;save();showBattle(dungeonTemplates[b.worldLocationIndex][0],false);log(`Моб ${mob}/${b.worldMobs} повержен. Следующий враг уже появился.`,'system');return;
    }
    finishWorldRun();return;
  }
  if(b.worldBoss){ b.hp=0; finishWorldBossAttempt(); return; }
  if(b.arena){ state.hp=state.maxHp; state.mana=state.maxMana; state.battle=null; arenaWin(); showScreen('more'); render(); openSubscreen('arena'); return; }
  if(b.farm){
    const earnedXp=Math.max(40,Math.floor(xpNeed(state.level)*0.07)), gold=rand(100,300);
    addXP(earnedXp); gainCoins(gold); state.achievementStats.kills++; state.farmKills=(state.farmKills||0)+1;
    const potionDrop=grantPotionDrop();
    updateQuestProgress('kills',1);
    const n=Number(state.farmKills||0)+1;
    const farmHp=Math.max(1,Math.floor((((state.maxHp*.58)+state.atk*2.55)*1.15)/1.28));const farmAtk=Math.max(1,Math.floor(((state.def*.92+state.atk*.14)*1.22)/1.28));state.battle={boss:false,turn:0,lastSkillTurn:-99,farm:true,name:'Фарм-монстр #'+n,icon:'👹',maxHp:farmHp,hp:farmHp,atk:farmAtk,xp:Math.max(40,Math.floor(xpNeed(state.level)*0.07)),reward:0};
    showBattle('ФАРМ-ЗОНА'); updateFarmBattleUI();
    save();
    modal('ФАРМ ЗАВЕРШЁН',`+${earnedXp.toLocaleString()} XP · +${gold} золота.${potionDrop?` ${potionName(potionDrop)} получено.`:""} Экипировка здесь не выпадает. Следующий моб уже ждёт.`);
    return;
  }
  if(b.boss){const old=ranks[state.rank];state.rank=Math.min(ranks.length-1,state.rank+1);state.battle=null;save();modal('РАНГ ПОВЫШЕН',`Ты победил испытание. Ранг ${old} → ${ranks[state.rank]}. Новые локации мира открыты.`);}
  else{const earnedXp=Math.floor(b.xp);addXP(earnedXp);gainCoins(b.reward);state.achievementStats.dungeons++;state.achievementStats.kills++;state.dungeonStreak=(state.dungeonStreak||0)+1;updateTitles();updateQuestProgress('dungeons',1);updateQuestProgress('kills',1);const loot=addLootFromMob();if(loot){ensureNotices();state.notices.inventory=true;state.achievementStats.lootFound++;showSystemNotice("НОВЫЙ ПРЕДМЕТ",`${loot.name} · ${loot.rarity}`,"inventory");if(["Эпическое","Легендарное","Реликтовое","Мифическое","Адское","Божественное"].includes(loot.rarity))state.achievementStats.rareLoot++;}const potionDrop=grantPotionDrop();syncAchievementStats();state.battle=null;save();const potionText=potionDrop?` Зелье: ${potionName(potionDrop)}.`:"";modal('ПРОЙДЕНО',loot?`Получено ${earnedXp.toLocaleString()} XP, ${Math.floor(b.reward/2).toLocaleString()} золота и добыча: ${loot.name} · ${loot.rarity}.${potionText}`:`Получено ${earnedXp.toLocaleString()} XP и ${b.reward.toLocaleString()} золота.${potionText}`);}
  showScreen('dungeons');render();
}
function defeatBattle(){const wasDungeon=!!state.battle?.dungeonMode;const wasWorld=!!state.battle?.world;const wasWorldBoss=!!state.battle?.worldBoss;const wasArena=!!state.battle?.arena;const wasFarm=!!state.battle?.farm;if(wasWorldBoss){finishWorldBossAttempt();return;}if(wasDungeon){state.battle=null;save();showScreen('dungeons');render();modal('ПОРАЖЕНИЕ','Ты проиграл. Прогресс побед этого захода не засчитан.');return;}if(wasWorld){state.battle=null;save();showScreen("world");render();modal("ПОРАЖЕНИЕ","Прохождение локации прервано. Прогресс этого захода не засчитан.");return;}state.battle=null;save();if(wasArena){arenaLose();showScreen("more");render();openSubscreen("arena");}else if(wasFarm){farmExit();modal("ФАРМ-ЗОНА","Ты остановил фарм. Награды за проигранный бой нет.");}else{showScreen("dungeons");render();modal("ПОРАЖЕНИЕ","Ты проиграл бой. Награда за это прохождение не получена.");}}
function leaveBattle(){const wasDungeon=!!state.battle?.dungeonMode;const wasWorld=!!state.battle?.world;const wasWorldBoss=!!state.battle?.worldBoss;const wasFarm=!!state.battle?.farm;const wasArena=!!state.battle?.arena;if(wasWorldBoss){finishWorldBossAttempt();return;}state.battle=null;save();if(wasDungeon){showScreen('dungeons');render();return;}if(wasWorld){showScreen("world");render();return;}if(wasFarm||wasArena){showScreen("more");render();openSubscreen(wasFarm?"farm":"arena");}else{showScreen("dungeons");render();}}
function dailyChestClaimed(){
  ensureAchievements();
  return state.dailyChestDay===new Date().toISOString().slice(0,10);
}
function claimDailyChest(){
  if(dailyChestClaimed()){ modal("СУНДУК ДНЯ","Сегодня ты уже забрал награду. Возвращайся завтра."); return; }
  const gold=1200+Math.floor(Math.random()*1801);
  state.dailyChestDay=new Date().toISOString().slice(0,10);
  const actualGold=gainCoins(gold);
  state.mail=Array.isArray(state.mail)?state.mail:[];
  state.mail.push({id:"daily_"+Date.now(),from:"Система",text:`Сундук дня открыт: ${actualGold.toLocaleString("ru-RU")} золота.`,time:Date.now(),read:false,type:"system"});
  ensureNotices(); state.notices.mail=true;
  save(); render(); openSubscreen("daily");
  modal("СУНДУК ДНЯ",`🎁 Награда получена! +${actualGold.toLocaleString("ru-RU")} золота`);
}
const CASINO_MULTIPLIERS=[1.25,1.55,1.9,2.35,2.9,3.6,4.5,5.6,7,8.75,10.9,13.6];
function ensureCasino(){
  if(!state.casino||typeof state.casino!=="object") state.casino={active:false,bet:10,round:0,potential:0,revealed:[],tiles:[],finished:false,lastResult:""};
  state.casino.bet=Math.max(10,Math.min(1000,Math.round((Number(state.casino.bet)||10)/10)*10));
  if(!Array.isArray(state.casino.revealed))state.casino.revealed=[];
  if(!Array.isArray(state.casino.tiles))state.casino.tiles=[];
}
function casinoMultiplier(round){return CASINO_MULTIPLIERS[Math.min(CASINO_MULTIPLIERS.length-1,Math.max(0,round-1))]||13.6;}
function casinoTilesForRound(round){
  const safe=round<=5?2:1;
  const tiles=[0,1,2].map(id=>({id,bomb:false,revealed:false}));
  let bombs=3-safe;
  while(bombs>0){const i=Math.floor(Math.random()*3);if(!tiles[i].bomb){tiles[i].bomb=true;bombs--;}}
  return tiles;
}
function casinoSetBet(delta){
  ensureCasino();if(state.casino.active)return;
  state.casino.bet=Math.max(10,Math.min(1000,Math.round((state.casino.bet+delta)/10)*10));
  save();render();openSubscreen("casino",true);
}
function casinoStart(){
  ensureCasino();if(state.casino.active)return;
  const bet=Math.max(10,Math.min(1000,Math.floor(state.casino.bet/10)*10));
  if(state.shadowCoins<bet){modal("НЕДОСТАТОЧНО",`Для игры нужно ${bet.toLocaleString("ru-RU")} 🌑 теневых монет.`);return;}
  state.shadowCoins-=bet;
  state.casino={active:true,bet,round:1,potential:Math.floor(bet*casinoMultiplier(1)),revealed:[],tiles:casinoTilesForRound(1),finished:false,lastResult:""};
  save();render();openSubscreen("casino");
}
function casinoReveal(tileId){
  ensureCasino();const c=state.casino;if(!c.active||c.finished)return;
  const tile=c.tiles.find(x=>x.id===tileId);if(!tile||tile.revealed)return;
  tile.revealed=true;c.revealed.push(tileId);
  if(tile.bomb){c.active=false;c.finished=true;c.lastResult="lose";c.potential=0;save();render();openSubscreen("casino");modal("ПРОИГРЫШ","Бомба! Ставка сгорела.");return;}
  c.round++;
  c.potential=Math.floor(c.bet*casinoMultiplier(c.round));
  c.revealed=[];c.tiles=casinoTilesForRound(c.round);
  save();render();openSubscreen("casino");
}
function casinoCashout(){
  ensureCasino();const c=state.casino;if(!c.active||c.round<2||c.potential<=0)return;
  const reward=c.potential;state.shadowCoins+=reward;c.active=false;c.finished=true;c.lastResult="win";
  save();render();openSubscreen("casino");modal("ВЫИГРЫШ",`Забрано ${reward.toLocaleString("ru-RU")} 🌑 теневых монет.`);
}
function renderCasino(){
  ensureCasino();const c=state.casino;
  if(c.active){
    const safeCount=c.round<=5?2:1,bombCount=3-safeCount;
    return `<div class="casino-panel active-casino"><div class="casino-hero"><div><span>ЭКОНОМИКА · ИГРА НА УДАЧУ</span><h2>КАЗИНО</h2><p>Открой пустую плитку — множитель растёт. Найдёшь бомбу — ставка потеряна.</p></div><img src="img/casino/casino.png" alt=""></div><div class="casino-stats"><div><small>СТАВКА</small><b>🌑 ${c.bet.toLocaleString("ru-RU")}</b></div><div><small>ЭТАП</small><b>${c.round}</b></div><div><small>ЗАБРАТЬ</small><b>🌑 ${c.potential.toLocaleString("ru-RU")}</b></div></div><div class="casino-rule">Этапы 1–5: ${safeCount} пустые · ${bombCount} ${bombCount>1?"бомбы":"бомба"}. С 6-го этапа: 1 пустая · 2 бомбы.</div><div class="casino-tiles">${c.tiles.map(t=>`<button class="casino-tile ${t.revealed?(t.bomb?"bomb":"safe"):""}" onclick="casinoReveal(${t.id})" ${t.revealed?"disabled":""}>${t.revealed?(t.bomb?'<img src="img/casino/bomba.png" alt="Бомба"><span>БОМБА</span>':'<img src="img/casino/pustaya.png" alt="Пусто"><span>ПУСТО</span>'):'<img src="img/casino/zakrytaya.png" alt="Закрытая плитка"><span>ОТКРЫТЬ</span>'}</button>`).join("")}</div><button class="primary-btn casino-cashout" onclick="casinoCashout()" ${c.round<2?"disabled":""}>ЗАБРАТЬ 🌑 ${c.potential.toLocaleString("ru-RU")}</button><div class="casino-hint">После каждого успешного открытия можно продолжить или забрать текущий выигрыш.</div></div>`;
  }
  const result=c.finished?(c.lastResult==='win'?'<div class="casino-result win">✓ Выигрыш забран. Можно сыграть ещё раз.</div>':'<div class="casino-result lose">✕ Игра окончена — попалась бомба.</div>'):'';
  return `<div class="casino-panel"><div class="casino-hero"><div><span>ЭКОНОМИКА · ТЕНЕВЫЕ МОНЕТЫ</span><h2>КАЗИНО</h2><p>Три закрытые плитки. Открывай пустые, повышай множитель и решай, когда остановиться.</p></div><img src="img/casino/casino.png" alt=""></div><div class="casino-balance">Твои теневые монеты <b>🌑 ${state.shadowCoins.toLocaleString("ru-RU")}</b></div><div class="casino-bet-box"><div><small>СТАВКА</small><strong>🌑 ${c.bet.toLocaleString("ru-RU")}</strong></div><div class="casino-bet-buttons"><button onclick="casinoSetBet(-100)" ${c.bet<=10?"disabled":""}>−100</button><button onclick="casinoSetBet(-10)" ${c.bet<=10?"disabled":""}>−10</button><button onclick="casinoSetBet(10)" ${c.bet>=1000?"disabled":""}>+10</button><button onclick="casinoSetBet(100)" ${c.bet>=1000?"disabled":""}>+100</button></div></div><div class="casino-limits"><span>МИН. 🌑 10</span><span>МАКС. 🌑 1 000</span></div>${result}<button class="primary-btn casino-start" onclick="casinoStart()" ${state.shadowCoins<c.bet?"disabled":""}>НАЧАТЬ ИГРУ · 🌑 ${c.bet.toLocaleString("ru-RU")}</button><div class="casino-preview"><div><b>1–5 ЭТАП</b><small>2 пустые · 1 бомба</small></div><div><b>6+ ЭТАП</b><small>1 пустая · 2 бомбы</small></div><div><b>ЦЕЛЬ</b><small>Забрать выигрыш вовремя</small></div></div></div>`;
}

const subScreens={
  inventory:["🎒 ИНВЕНТАРЬ","Предметы, снаряжение и добыча с мобов."],
  quests:["📜 ЗАДАНИЯ","Новый цикл заданий каждые 5 часов."],
  achievements:["🏅 ДОСТИЖЕНИЯ","Награды за важные достижения и серию входов."],
  titles:["🏷️ ТИТУЛЫ","Открывай титулы за прогресс, бонусы и выбирай активный."],
  storyQuests:["📖 СЮЖЕТ","Главы истории и награды за продвижение по пути перерождения."],
  shop:["🛒 МАГАЗИН","Теневые монеты и Премиум."],
  casino:["🎰 КАЗИНО","Сапёр на теневых монетах. Рискни и забери выигрыш."],
  bazaar:["🏪 БАЗАР","Выставляй свои предметы. Максимум 5 лотов."],
  mail:["📨 ПОЧТА","Системные уведомления и сообщения игроков."],
  farm:["🌾 ФАРМ-ЗОНА","Бесконечные мобы: 500 XP и 100–300 золота. Лут не выпадает."],
  rating:["🏆 РЕЙТИНГ","Игроки и рейтинг по уровню."],
  arena:["⚔️ АРЕНА","5 попыток в день против других игроков."],
  arenaRank:["🏆 РЕЙТИНГ АРЕНЫ","Рейтинг игроков на арене."],
  settings:["⚙️ НАСТРОЙКИ","Настройки персонажа и игры."],
  worldBoss:["👑 МИРОВОЙ БОСС","Общий мировой босс в офлайн-режиме. Новое появление каждые 12 часов, до 3 попыток за цикл."],
  daily:["🎁 СУНДУК ДНЯ","Ежедневная бесплатная награда за вход в игру."],
  expedition:["🧭 ЭКСПЕДИЦИЯ","Отправь персонажа в экспедицию и получи опыт и золото через 2, 4 или 6 часов."],
  talents:["🌳 ДРЕВО ТАЛАНТОВ","Развивай персонажа и выбирай собственную боевую специализацию."],
  events:["🎉 СОБЫТИЯ","Особые активности с уникальными наградами."],
  wheel:["🎡 КОЛЕСО УДАЧИ","Испытай удачу и получи одну из шести наград."],
  rift:["🌀 ТАИНСТВЕННЫЙ РАЗЛОМ","Пробейся через 5 волн и забери награды разлома."]
};
function equipItem(itemId){
  const item=state.inventory.find(x=>x.id===itemId);
  if(!item || !["weapon","armor","amulet","artifact"].includes(item.type)) return;
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
  const equipable=["weapon","armor","amulet","artifact"].includes(item.type);
  const equipped=!!equippedType || Object.values(state.equipped||{}).some(x=>x?.id===item.id);
  const r=itemRarityClass(item);
  const cost=upgradeCost(item), shards=dismantleReward(item);
  const sell=Math.max(5,Math.floor((item.price||10)*.5*(isPremiumActive()?1.10:1)));
  const title=escapeHtml(item.name||"Предмет");
  const className=escapeHtml(classData[item.classKey]?.name||"Общее");
  const typeName=item.type==="armor"?"Броня":item.type==="amulet"?"Амулет":item.type==="weapon"?"Снаряжение":item.type==="artifact"?"Артефакт":"Материал";
  const statHtml=itemStatLines(item).length?`<div class="detail-stats">${itemStatChips(item)}</div>`:`<div class="detail-empty-stats">Без дополнительных характеристик</div>`;
  const actions=[];
  if(equipped) actions.push(`<button class="detail-action secondary-btn" onclick="closeItemDetails();unequipItem('${equippedType||item.type}')">СНЯТЬ</button>`);
  else if(equipable) actions.push(`<button class="detail-action primary-btn" onclick="closeItemDetails();equipItem('${item.id}')">НАДЕТЬ</button>`);
  if(item.type!=="material"){
    if((Number(item.upgradeLevel)||0)<20){
      actions.push(`<div class="upgrade-forge-card"><div class="upgrade-forge-head"><div><span class="upgrade-kicker">КУЗНЯ</span><b>Заточка +${(Number(item.upgradeLevel)||0)+1}</b></div><div class="upgrade-chance ${cost.chance<=30?'danger':cost.chance<=60?'warn':'good'}"><strong>${cost.chance}%</strong><small>ШАНС</small></div></div><div class="upgrade-progress"><i style="width:${cost.chance}%"></i></div><div class="upgrade-cost-grid"><div><img class="inline-icon" src="img/icons/shard.png" alt=""><b>${cost.shards.toLocaleString("ru-RU")}</b><small>ОСКОЛКИ</small></div><div><span>🪙</span><b>${cost.gold.toLocaleString("ru-RU")}</b><small>МОНЕТЫ</small></div></div><button class="detail-action upgrade-main-btn" onclick="closeItemDetails();upgradeItem('${item.id}',false)"><span>⚒️ УЛУЧШИТЬ ДО +${(Number(item.upgradeLevel)||0)+1}</span><em>${cost.chance}% шанс</em></button><button class="detail-action upgrade-guarantee-btn" onclick="closeItemDetails();upgradeItem('${item.id}',true)"><span>🌑 ГАРАНТИЯ 100%</span><em>100 🌑 + обычные ресурсы</em></button></div>`);
    }else actions.push(`<div class="material-tag">МАКСИМАЛЬНАЯ ЗАТОЧКА +20</div>`);
  }
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
  const slots=["weapon","armor","amulet","artifact"];
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

function inventoryCharacterStage(){
  const slots=[
    ["weapon",state.equipped?.weapon],
    ["armor",state.equipped?.armor],
    ["amulet",state.equipped?.amulet],
    ["artifact",state.equipped?.artifact]
  ];
  const labels={weapon:"Оружие",armor:"Броня",amulet:"Амулет",artifact:"Артефакт"};
  const slotHtml=(type,item)=>equippedInventoryItem(type,item);
  return `<section class="equipped-panel inventory-character-card">
    <div class="inventory-character-top">
      <span class="inventory-character-kicker">ЭКИПИРОВКА</span>
      <button class="auto-equip-btn" type="button" onclick="autoEquipBest()">НАДЕТЬ ЛУЧШЕЕ</button>
    </div>
    <div class="equipped-grid inventory-four-slots">${slots.map(([type,item])=>slotHtml(type,item)).join("")}</div>
  </section>`;
}
function toggleSellRarity(rarity){
  const list=Array.isArray(state.inventorySellRarities)?state.inventorySellRarities:[];
  state.inventorySellRarities=list.includes(rarity)?list.filter(x=>x!==rarity):[...list,rarity];
  save();render();openSubscreen('inventory');
}
function sellSelectedRarities(){
  const selected=Array.isArray(state.inventorySellRarities)?state.inventorySellRarities:[];
  if(!selected.length){modal('МАССОВАЯ ПРОДАЖА','Сначала выбери хотя бы одну редкость.');return;}
  let total=0,count=0; const keep=[];
  for(const item of state.inventory||[]){
    const equipped=Object.values(state.equipped||{}).some(e=>e?.id===item.id);
    if(!equipped && item.type!=="material" && selected.includes(item.rarity)){
      total+=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*(isPremiumActive()?1.10:1)));
      count++;
    } else keep.push(item);
  }
  if(!count){modal('МАССОВАЯ ПРОДАЖА','Предметов выбранной редкости нет.');return;}
  state.inventory=keep;gainCoins(total);save();render();openSubscreen('inventory');
  modal('ПРЕДМЕТЫ ПРОДАНЫ',`Продано: ${count}. Получено 🪙 ${total.toLocaleString('ru-RU')}.`);
}

function toggleBulkRarity(rarity){
  const list=Array.isArray(state.inventoryBulkRarities)?state.inventoryBulkRarities:[];
  state.inventoryBulkRarities=list.includes(rarity)?list.filter(x=>x!==rarity):[...list,rarity];
  save();
  document.querySelectorAll('.bulk-single-panel .rarity-filter').forEach(btn=>{
    const label=btn.textContent.trim();
    btn.classList.toggle('selected',state.inventoryBulkRarities.includes(label));
  });
  const count=document.querySelector('.inventory-tools-summary strong');
  if(count) count.textContent=state.inventoryBulkRarities.length?state.inventoryBulkRarities.length+' редк.':'⌄';
}
function sellBulkSelected(){
  const selected=Array.isArray(state.inventoryBulkRarities)?state.inventoryBulkRarities:[];
  if(!selected.length){modal('МАССОВАЯ ПРОДАЖА','Сначала выбери хотя бы одну редкость.');return;}
  let total=0,count=0; const keep=[];
  for(const item of state.inventory||[]){
    const equipped=Object.values(state.equipped||{}).some(e=>e?.id===item.id);
    if(!equipped && item.type!=='material' && selected.includes(item.rarity)){
      total+=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*(isPremiumActive()?1.10:1))); count++;
    } else keep.push(item);
  }
  if(!count){modal('МАССОВАЯ ПРОДАЖА','Предметов выбранной редкости нет.');return;}
  state.inventory=keep;gainCoins(total);save();render();openSubscreen('inventory');
  modal('ПРЕДМЕТЫ ПРОДАНЫ',`Продано: ${count}. Получено 🪙 ${total.toLocaleString('ru-RU')}.`);
}
function dismantleBulkSelected(){
  const selected=Array.isArray(state.inventoryBulkRarities)?state.inventoryBulkRarities:[];
  if(!selected.length){modal('МАССОВЫЙ РАЗБОР','Сначала выбери хотя бы одну редкость.');return;}
  let gain=0,count=0; const keep=[];
  for(const item of state.inventory||[]){
    const equipped=Object.values(state.equipped||{}).some(e=>e?.id===item.id);
    if(!equipped && item.type!=='material' && selected.includes(item.rarity)){gain+=dismantleReward(item);count++;} else keep.push(item);
  }
  if(!count){modal('МАССОВЫЙ РАЗБОР','Предметов выбранной редкости нет.');return;}
  state.inventory=keep;state.shards+=gain;save();render();openSubscreen('inventory');
  modal('ПРЕДМЕТЫ РАЗОБРАНЫ',`Разобрано: ${count}. Получено осколков: ${gain}.`);
}

function renderInventoryItem(item){
  const r=itemRarityClass(item);
  const equipped=Object.values(state.equipped||{}).some(x=>x?.id===item.id);
  return `<button type="button" class="inventory-tile ${equipped?"is-equipped":""}" onclick="openItemDetails('${item.id}')"><span class="tile-icon rarity-${r} rank-${itemRankClass(item)}">${itemIconImg(item,"tile-img")}</span><span class="tile-name">${escapeHtml(item.name)}</span><span class="tile-rarity">${escapeHtml(item.rarity)}</span><span class="tile-level">Ур. ${item.itemLevel||1}${(item.upgradeLevel||0)?` · +${item.upgradeLevel}`:""}</span>${equipped?`<span class="tile-equipped">НАДЕТО</span>`:""}</button>`;
}
function equippedInventoryItem(type,item){
  if(!item)return `<button type="button" class="equipped-slot empty" onclick="modal('СЛОТ СВОБОДЕН', 'Здесь пока ничего не экипировано.')"><span class="equipped-empty-icon">+</span><div><b>${type==="weapon"?"Снаряжение":type==="armor"?"Броня":type==="amulet"?"Амулет":"Артефакт"}</b><small>Нажми, чтобы посмотреть слот</small></div></button>`;
  return `<button type="button" class="equipped-slot filled rarity-${itemRarityClass(item)}" onclick="openItemDetails('${item.id}','${type}')"><span class="loot-icon rarity-${itemRarityClass(item)} rank-${itemRankClass(item)}">${itemIconImg(item)}</span><div class="loot-info"><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.rarity)} · Ур. ${item.itemLevel} · Ул. ${item.upgradeLevel||0}</small></div><span class="equipped-open">›</span></button>`;
}
function renderInventory(){
  const items=state.inventory||[];
  const selectedB=Array.isArray(state.inventoryBulkRarities)?state.inventoryBulkRarities:[];
  const rarityControls=RARITIES.map(r=>`<button class="rarity-filter ${selectedB.includes(r.name)?"selected":""} rarity-${r.cls}" onclick="toggleBulkRarity('${r.name.replaceAll("'","\\'")}')">${r.name}</button>`).join("");
  const bulk=`<section class="inventory-tools-pro"><details><summary class="inventory-tools-summary"><span><b>МАССОВЫЕ ДЕЙСТВИЯ</b><small>Выбери редкость — затем продай или разбери всё выбранное.</small></span><strong>${selectedB.length?selectedB.length+' редк.':'⌄'}</strong></summary><div class="bulk-single-panel"><div class="rarity-filters">${rarityControls}</div><div class="bulk-action-row"><button class="item-action danger-btn" onclick="sellBulkSelected()">ПРОДАТЬ ВСЁ</button><button class="item-action secondary-btn" onclick="dismantleBulkSelected()">РАЗОБРАТЬ ВСЁ</button></div></div></details></section>`;
  const potionPanel=`<div class="potion-strip"><div class="potion-strip-head"><b>ЗЕЛЬЯ</b><small>10% шанс выпадения с монстров</small></div><div class="potion-list"><button onclick="modal('ЗЕЛЬЕ АТАКИ','Во время боя: +35% к следующей атаке.')"><img src="img/icons/potion_attack.png" alt=""><b>${state.potions?.attack||0}</b><span>АТАКА</span></button><button onclick="modal('ЗЕЛЬЕ ЛЕЧЕНИЯ','Во время боя: восстанавливает 30% максимального HP.')"><img src="img/icons/potion_heal.png" alt=""><b>${state.potions?.heal||0}</b><span>ЛЕЧЕНИЕ</span></button><button onclick="modal('ЗЕЛЬЕ МАНЫ','Во время боя: восстанавливает 35% максимальной маны.')"><img src="img/icons/potion_mana.png" alt=""><b>${state.potions?.mana||0}</b><span>МАНА</span></button></div></div>`;
  return `${inventoryCharacterStage()}${potionPanel}<div class="inventory-head"><div><b>ИНВЕНТАРЬ</b><small>Нажми на предмет, чтобы посмотреть описание, надеть, улучшить, продать или разобрать.</small></div></div>${bulk}${items.length?`<div class="loot-grid inventory-tiles">${items.slice().reverse().map(renderInventoryItem).join("")}</div>`:`<div class="inventory-empty"><div><img class="inline-icon" src="img/icons/inventory.png" alt=""></div><h2>Инвентарь пуст</h2><p>Снаряжение выпадает после побед над монстрами.</p></div>`}`;
}
function sellEquippedItem(type){
  const item=state.equipped?.[type]; if(!item)return;
  const value=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*(isPremiumActive()?1.10:1)));
  state.equipped[type]=null; gainCoins(value); recalc(); save(); render(); openSubscreen("inventory"); modal("ПРЕДМЕТ ПРОДАН",`${item.icon} ${item.name} продан за 🪙 ${value.toLocaleString("ru-RU")}.`);
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
  for(const item of items) total+=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*(isPremiumActive()?1.10:1)));
  state.inventory=[]; gainCoins(total); state.notices.inventory=false; save(); render(); openSubscreen("inventory");
  modal("ВСЁ ПРОДАНО",`Продано предметов: ${items.length}. Получено 🪙 ${total.toLocaleString("ru-RU")}.`);
}
function dismantleSelectedRarities(){
  const selected=Array.isArray(state.inventoryDismantleRarities)?state.inventoryDismantleRarities:[];
  if(!selected.length){modal("МАССОВЫЙ РАЗБОР","Сначала выбери хотя бы одну редкость.");return;}
  const keep=[]; let count=0,gain=0;
  for(const item of state.inventory||[]){
    const equipped=Object.values(state.equipped||{}).some(e=>e?.id===item.id);
    if(!equipped && item.type!=="material" && selected.includes(item.rarity)){gain+=dismantleReward(item);count++;} else keep.push(item);
  }
  state.inventory=keep; state.shards+=gain; save(); render(); openSubscreen("inventory");
  modal("МАССОВЫЙ РАЗБОР",count?`Разобрано предметов: ${count}. Получено <img class="inline-icon" src="img/icons/shard.png" alt=""> ${gain} осколков.`:"Под выбранные редкости ничего не найдено.");
}
function upgradeItem(itemId,guaranteed=false){
  const item=state.inventory.find(x=>x.id===itemId) || Object.values(state.equipped||{}).find(x=>x?.id===itemId);
  if(!item || item.type==="material"){modal("УЛУЧШЕНИЕ","Этот предмет нельзя улучшить.");return;}
  const current=Math.max(0,Number(item.upgradeLevel)||0);
  if(current>=20){modal("МАКСИМАЛЬНАЯ ЗАТОЧКА","Это снаряжение уже улучшено до +20.");return;}
  const cost=upgradeCost(item);
  if(state.shards<cost.shards || state.coins<cost.gold){modal("НЕДОСТАТОЧНО РЕСУРСОВ",`Для +${current+1} нужно <img class="inline-icon" src="img/icons/shard.png" alt=""> ${cost.shards} осколков и 🪙 ${cost.gold.toLocaleString("ru-RU")} монет.`);return;}
  if(guaranteed && state.shadowCoins<100){modal("НЕДОСТАТОЧНО ТЕНЕВЫХ МОНЕТ","Гарантированная заточка стоит 100 теневых монет. Обычные монеты и осколки при этом тоже тратятся.");return;}
  state.shards-=cost.shards;state.coins-=cost.gold;if(guaranteed)state.shadowCoins-=100;
  const success=guaranteed || Math.random()*100<cost.chance;
  if(success){
    item.upgradeLevel=current+1;state.achievementStats.upgrades++;item.stats=generateEquipmentStats(item.type,item.itemLevel,item.rarity,item.upgradeLevel);
    item.price=Math.max(10,Math.floor(item.itemLevel*item.itemLevel*2.4*rarityByName(item.rarity).mult*equipV5Rank(item.itemLevel).mult*(1+item.upgradeLevel*.1)));
    recalc();syncAchievementStats();save();render();openSubscreen("inventory");
    modal("ЗАТОЧКА УСПЕШНА",`${item.name} усилено до <b>+${item.upgradeLevel}</b>. ${guaranteed?"Использовано 100 теневых монет для гарантии.":`Шанс был ${cost.chance}%.`}`);
  }else{
    save();render();openSubscreen("inventory");
    modal("ЗАТОЧКА НЕ УДАЛАСЬ",`Снаряжение осталось на <b>+${current}</b>. Потрачено: 🪙 ${cost.gold.toLocaleString("ru-RU")} и <img class="inline-icon" src="img/icons/shard.png" alt=""> ${cost.shards}. Шанс был ${cost.chance}%.`);
  }
}

function dismantleItem(itemId){
  const i=state.inventory.findIndex(x=>x.id===itemId);if(i<0)return;
  const item=state.inventory[i];const gain=dismantleReward(item);state.inventory.splice(i,1);state.shards+=gain;save();render();openSubscreen("inventory");modal("ПРЕДМЕТ РАЗОБРАН",`${item.icon} ${item.name} разобран. Получено <img class="inline-icon" src="img/icons/shard.png" alt=""> ${gain} осколков.`);
}
function sellInventoryItem(itemId){
  const item=state.inventory.find(x=>x.id===itemId);
  if(!item) return;
  const saleMult=isPremiumActive()?1.10:1;
  const value=Math.max(5,Math.floor((item.price||item.itemLevel*item.itemLevel*2)*0.5*saleMult));
  state.inventory=state.inventory.filter(x=>x.id!==itemId);
  gainCoins(value);
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
    <h3 class="bazaar-section-title">ВЫСТАВИТЬ СНАРЯЖЕНИЕ</h3>${available.length?`<div class="loot-list bazaar-pick">${available.map(item=>`<div class="loot-item rarity-${itemRarityClass(item)}"><span class="loot-icon rarity-${itemRarityClass(item)} rank-${itemRankClass(item)}">${itemIconImg(item)}</span><div class="loot-info"><b>${item.name}</b><small>${item.rarity} · Ур. ${item.itemLevel} · ${classData[item.classKey]?.name||"Общее"}</small></div><button class="primary-btn bazaar-add" onclick="promptBazaarPrice('${item.id}')">ВЫСТАВИТЬ</button></div>`).join("")}</div>`:`<div class="bazaar-empty">В инвентаре нет снаряжения для выставления.</div>`}`;
}
function renderQuests(){
  ensureNotices();
  refreshQuestCycle(false);
  const done=allQuestsDone();
  const claimed=!!state.questClaimed;
  return `<div class="quest-cycle"><span>⏱️ Обновление через</span><b>${questTimeLeft()}</b></div>
    <div class="quest-list">${state.quests.map(q=>{const pct=Math.min(100,q.progress/q.target*100);const qDone=q.progress>=q.target;return `<div class="quest-item ${claimed?"claimed":""}"><div class="quest-row"><span>${q.icon}</span><div><b>${q.name}</b><small>${Math.floor(q.progress).toLocaleString("ru-RU")} / ${q.target.toLocaleString("ru-RU")}${qDone?" · ВЫПОЛНЕНО":""}</small></div></div><div class="quest-bar"><div style="width:${pct}%"></div></div></div>`}).join("")}</div>
    <div class="quest-reward ${claimed?"claimed":""}"><b>🏆 НАГРАДА ЗА ВСЕ ЗАДАНИЯ</b><span>🪙 2 000 · ✨ 10 000 XP</span></div>
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

const EXPEDITIONS={
  "2h":{id:"2h",title:"Короткая экспедиция",hours:2,ms:2*60*60*1000,xp:[20000,70000],coins:[2000,6000],bg:"img/expeditions/expedition_2h.jpg"},
  "4h":{id:"4h",title:"Долгая экспедиция",hours:4,ms:4*60*60*1000,xp:[70000,180000],coins:[6000,12000],bg:"img/expeditions/expedition_4h.jpg"},
  "6h":{id:"6h",title:"Великая экспедиция",hours:6,ms:6*60*60*1000,xp:[180000,250000],coins:[12000,18000],bg:"img/expeditions/expedition_6h.jpg"}
};
function expeditionState(){
  if(!state.expedition || typeof state.expedition!=="object") state.expedition={active:false,type:null,startAt:0,endAt:0,rewardXp:0,rewardCoins:0,claimed:false};
  return state.expedition;
}
function expeditionReady(){const e=expeditionState();return !!(e.active && Number(e.endAt)>0 && Date.now()>=Number(e.endAt));}
function expeditionTimeLeft(){const e=expeditionState();return Math.max(0,Number(e.endAt||0)-Date.now());}
function formatExpeditionTime(ms){let sec=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(sec/3600);sec%=3600;const m=Math.floor(sec/60);sec%=60;return `${String(h).padStart(2,"0")} : ${String(m).padStart(2,"0")} : ${String(sec).padStart(2,"0")}`;}
function expeditionRandom(min,max){return Math.floor(min+Math.random()*(max-min+1));}
function startExpedition(type){
  const e=expeditionState();
  if(e.active){modal("ЭКСПЕДИЦИЯ","Сначала дождись завершения текущей экспедиции.");return;}
  const cfg=EXPEDITIONS[type]; if(!cfg)return;
  const now=Date.now();
  state.expedition={active:true,type:cfg.id,startAt:now,endAt:now+cfg.ms,rewardXp:expeditionRandom(cfg.xp[0],cfg.xp[1]),rewardCoins:expeditionRandom(cfg.coins[0],cfg.coins[1]),claimed:false};
  save();render();openSubscreen("expedition");
  modal("ЭКСПЕДИЦИЯ НАЧАТА",`Персонаж отправлен: «${cfg.title}».\nВозвращайся через ${cfg.hours} ч.`);
}
function claimExpedition(){
  const e=expeditionState();
  if(!e.active)return;
  if(Date.now()<Number(e.endAt)){modal("ЭКСПЕДИЦИЯ ЕЩЁ ИДЁТ",`Осталось: ${formatExpeditionTime(expeditionTimeLeft())}`);return;}
  const xp=Math.max(0,Number(e.rewardXp)||0), coins=Math.max(0,Number(e.rewardCoins)||0);
  state.expedition={active:false,type:null,startAt:0,endAt:0,rewardXp:0,rewardCoins:0,claimed:true};
  const actualCoins=gainCoins(coins);
  addXP(xp);
  save();render();openSubscreen("expedition");
  modal("ЭКСПЕДИЦИЯ ЗАВЕРШЕНА",`Опыт: +${xp.toLocaleString("ru-RU")} XP\nМонеты: +${actualCoins.toLocaleString("ru-RU")} 🪙`);
}
function renderExpedition(){
  const e=expeditionState();
  const ready=expeditionReady();
  if(e.active){
    const cfg=EXPEDITIONS[e.type]||EXPEDITIONS["2h"];
    const progress=Math.max(0,Math.min(100,((Date.now()-Number(e.startAt))/(Number(e.endAt)-Number(e.startAt)))*100));
    return `<div class="expedition-panel expedition-active" style="--expedition-bg:url('${cfg.bg}')">
      <div class="expedition-art"><div class="expedition-overlay"></div><div class="expedition-badge">ЭКСПЕДИЦИЯ</div><div class="expedition-art-title">${cfg.title}</div></div>
      <div class="expedition-active-body"><div class="expedition-status">${ready?"ЭКСПЕДИЦИЯ ЗАВЕРШЕНА":"ПЕРСОНАЖ В ПУТИ"}</div><div class="expedition-timer">${ready?"ГОТОВО":formatExpeditionTime(expeditionTimeLeft())}</div><div class="expedition-progress"><span style="width:${progress}%"></span></div><div class="expedition-reward-preview"><span>✨ ${Number(e.rewardXp).toLocaleString("ru-RU")} XP</span><span>🪙 ${Math.floor(Number(e.rewardCoins||0)/2).toLocaleString("ru-RU")}</span></div><button class="primary-btn expedition-claim-btn" onclick="claimExpedition()">${ready?"ЗАБРАТЬ НАГРАДУ":"ЭКСПЕДИЦИЯ ИДЁТ"}</button></div>
    </div>`;
  }
  return `<div class="expedition-panel expedition-list-panel"><div class="expedition-hero"><div class="expedition-hero-glow"></div><img src="img/expeditions/expedition.png" alt=""><div><div class="expedition-kicker">ПУТЬ ИССЛЕДОВАТЕЛЯ</div><h2>ЭКСПЕДИЦИИ</h2><p>Отправь персонажа в путь. Время проходит даже когда игра закрыта.</p></div></div><div class="expedition-cards">${Object.values(EXPEDITIONS).map(cfg=>`<div class="expedition-card" style="--expedition-bg:url('${cfg.bg}')"><div class="expedition-card-art"><div class="expedition-card-shade"></div><b>${cfg.hours} ЧАСА</b></div><div class="expedition-card-body"><h3>${cfg.title}</h3><div class="expedition-rewards"><span>✨ ${cfg.xp[0].toLocaleString("ru-RU")}–${cfg.xp[1].toLocaleString("ru-RU")} XP</span><span>🪙 ${cfg.coins[0].toLocaleString("ru-RU")}–${cfg.coins[1].toLocaleString("ru-RU")}</span></div><button class="primary-btn" onclick="startExpedition('${cfg.id}')">ОТПРАВИТЬ</button></div></div>`).join("")}</div><div class="expedition-note">Награда определяется случайно при старте экспедиции и сохраняется вместе с прогрессом.</div></div>`;
}
function updateExpeditionTimer(){
  if(!document.getElementById("screen-sub")?.classList.contains("active"))return;
  const title=document.getElementById("subscreenTitle");
  if(!title?.textContent.includes("ЭКСПЕДИЦИЯ"))return;
  const e=expeditionState();
  if(!e.active)return;
  const timer=document.querySelector(".expedition-timer");
  const bar=document.querySelector(".expedition-progress span");
  const status=document.querySelector(".expedition-status");
  const btn=document.querySelector(".expedition-claim-btn");
  const left=expeditionTimeLeft();
  const ready=left<=0;
  const total=Math.max(1,Number(e.endAt)-Number(e.startAt));
  const progress=Math.max(0,Math.min(100,((Date.now()-Number(e.startAt))/total)*100));
  if(timer)timer.textContent=ready?"ГОТОВО":formatExpeditionTime(left);
  if(bar)bar.style.width=progress+"%";
  if(status)status.textContent=ready?"ЭКСПЕДИЦИЯ ЗАВЕРШЕНА":"ПЕРСОНАЖ В ПУТИ";
  if(btn)btn.textContent=ready?"ЗАБРАТЬ НАГРАДУ":"ЭКСПЕДИЦИЯ ИДЁТ";
}


const WHEEL_PRIZES=[
  {id:"premium",icon:"👑",name:"Премиум на 1 день",weight:8},
  {id:"shadow500",icon:"🌑",name:"500 теневых монет",weight:8},
  {id:"gold2000",icon:"🪙",name:"2 000 монет",weight:28},
  {id:"gold5000",icon:"💰",name:"5 000 монет",weight:20},
  {id:"shadow100",icon:"🌑",name:"100 теневых монет",weight:35},
  {id:"divine",icon:"✦",name:"Божественное снаряжение",weight:1}
];
function eventDay(){return new Date().toISOString().slice(0,10);}
function wheelUsedToday(){return state.events?.wheelDay===eventDay() && Number(state.events?.wheelSpins||0)>=1;}
function ensureEvents(){
  if(!state.events||typeof state.events!=="object")state.events={};
  state.events.wheelSpins=Number(state.events.wheelSpins)||0;
  state.events.wheelDay=state.events.wheelDay||"";
  state.events.wheelLastPrize=state.events.wheelLastPrize||"";
  if(!state.events.rift||typeof state.events.rift!=="object")state.events.rift={active:false,wave:1,maxWaves:5,hp:0,maxHp:0,mana:0,maxMana:0,enemyHp:0,enemyMaxHp:0,enemyAtk:0,coins:0,shadow:0,xp:0};
}
function rollWheelPrize(paid=false){
  ensureEvents();
  const day=eventDay();
  if(state.events.wheelDay!==day){state.events.wheelDay=day;state.events.wheelSpins=0;state.events.wheelLastPrize="";}
  if(paid){
    if(Number(state.shadowCoins||0)<100){modal("КОЛЕСО УДАЧИ","Для платной прокрутки нужно 100 теневых монет.");return;}
    state.shadowCoins-=100;
  } else if(state.events.wheelSpins>=1){
    modal("КОЛЕСО УДАЧИ","Сегодня бесплатное вращение уже использовано. Можно крутить за 100 теневых монет.");return;
  }
  const total=WHEEL_PRIZES.reduce((a,p)=>a+p.weight,0);let n=Math.random()*total, prize=WHEEL_PRIZES[WHEEL_PRIZES.length-1];
  for(const p of WHEEL_PRIZES){if(n<p.weight){prize=p;break;}n-=p.weight;}
  if(!paid)state.events.wheelSpins=1;state.events.wheelLastPrize=prize.id;
  let rewardText=prize.name;
  if(prize.id==="premium"){
    state.premium=true;state.premiumUntil=Math.max(Number(state.premiumUntil)||0,Date.now()+86400000);rewardText="Премиум активирован на 1 день";
  } else if(prize.id==="shadow500") state.shadowCoins+=500;
  else if(prize.id==="shadow100") state.shadowCoins+=100;
  else if(prize.id==="gold2000") gainCoins(2000);
  else if(prize.id==="gold5000") gainCoins(5000);
  else if(prize.id==="divine"){
    const item=makeDivineEventLoot();state.inventory.push(item);state.achievementStats.lootFound++;state.achievementStats.rareLoot++;ensureNotices();state.notices.inventory=true;rewardText=item.name+" · Божественное";
  }
  save();render();openSubscreen("wheel");modal("КОЛЕСО УДАЧИ",`${prize.icon} ${rewardText}`);
}
function makeDivineEventLoot(){
  const key=state.playerClass||"mage";const type=["weapon","armor","amulet"][rand(0,2)];
  const item={id:`event_divine_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,type,classKey:key,variant:0,itemLevel:Math.max(1,Math.min(100,state.level)),upgradeLevel:0,rarity:"Божественное"};
  normalizeV4(item);item.rarity="Божественное";item.rarityClass=rarityByName("Божественное").cls;item.stats=generateEquipmentStats(type,item.itemLevel,"Божественное",0);item.price=Math.max(100,item.itemLevel*item.itemLevel*20);return item;
}
function renderWheel(){ensureEvents();const used=wheelUsedToday();const shadow=Number(state.shadowCoins||0);return `<div class="event-wheel" style="--event-bg:url('img/events/wheel.jpg')"><div class="event-wheel-art"><img src="img/events/wheel.png" alt=""><div><span>СУДЬБА РЕШАЕТ</span><h2>КОЛЕСО УДАЧИ</h2><small>1 бесплатное вращение в день · платное вращение — 100 🌑 · Божественное снаряжение — 1%</small></div></div><div class="wheel-prizes">${WHEEL_PRIZES.map(p=>`<div class="wheel-prize ${p.id==='divine'?'divine-prize':''}"><span>${p.icon}</span><b>${p.name}</b><small>${p.id==='divine'?'1%':Math.round(p.weight)+'%'}</small></div>`).join("")}</div><div class="wheel-spin-actions"><button class="primary-btn wheel-spin-btn" onclick="rollWheelPrize()" ${used?'disabled':''}>${used?'✓ БЕСПЛАТНОЕ ВРАЩЕНИЕ ИСПОЛЬЗОВАНО':'🎡 БЕСПЛАТНОЕ ВРАЩЕНИЕ'}</button><button class="secondary-btn wheel-spin-btn" onclick="rollWheelPrize(true)" ${shadow<100?'disabled':''}>🌑 КРУТИТЬ ЗА 100 ТЕНЕВЫХ</button></div>${state.events.wheelLastPrize?`<div class="event-last-result">Последний результат: <b>${WHEEL_PRIZES.find(x=>x.id===state.events.wheelLastPrize)?.name||"Награда"}</b></div>`:""}</div>`;}
function riftConfig(){const l=Math.max(1,state.level),r=Math.max(0,state.rank);return {maxHp:Math.floor((900+l*70)*(1+r*.28)),atk:Math.floor((34+l*6)*(1+r*.22)),xp:Math.floor(xpNeed(l)*.055),coins:Math.floor(220+l*18),shadow:1+Math.floor(r*.6)};}
function startRift(){if(!showLevelGate("rift"))return;ensureEvents();const r=state.events.rift;if(r.active){openSubscreen("rift");return;}if(state.energy<25){modal("ТАИНСТВЕННЫЙ РАЗЛОМ","Для входа нужно 25 энергии.");return;}state.energy-=25;const c=riftConfig();state.events.rift={active:true,wave:1,maxWaves:5,hp:state.maxHp,maxHp:state.maxHp,mana:state.maxMana,maxMana:state.maxMana,enemyHp:c.maxHp,enemyMaxHp:c.maxHp,enemyAtk:c.atk,coins:0,shadow:0,xp:0,turn:0,lastSkillTurn:-99};save();openSubscreen("rift");}
function riftEnemyName(){return ["Осквернённый страж","Пожиратель света","Безликий охотник","Разоритель разлома","Хранитель бездны"][Math.max(0,Math.min(4,(state.events.rift.wave||1)-1))];}
function riftAttack(useSkill=false){
  ensureEvents();const r=state.events.rift;if(!r.active)return;
  const turn=Math.max(0,Number(r.turn)||0),last=Number(r.lastSkillTurn??-99);
  if(useSkill && turn-last<2)return;
  if(useSkill && r.mana<Math.floor(state.maxMana*.18))return;
  r.turn=turn+1;
  if(useSkill){r.mana=Math.max(0,r.mana-Math.floor(state.maxMana*.18));r.lastSkillTurn=turn+1;}
  let dmg=Math.floor(state.atk*(useSkill?1.65:1)*(0.9+Math.random()*.2));
  if(Math.random()*100<state.crit)dmg=Math.floor(dmg*(1+state.critDamage/100));
  r.enemyHp=Math.max(0,r.enemyHp-dmg);
  if(r.enemyHp<=0){
    r.xp+=Math.floor(riftConfig().xp*(1+(r.wave-1)*.35));r.coins+=Math.floor(riftConfig().coins*(1+(r.wave-1)*.28));r.shadow+=r.wave===5?5:1;
    if(r.wave>=r.maxWaves){finishRift(true);return;}
    r.wave++;const c=riftConfig();const mult=1+(r.wave-1)*.42;r.enemyMaxHp=Math.floor(c.maxHp*mult);r.enemyHp=r.enemyMaxHp;r.enemyAtk=Math.floor(c.atk*mult);save();render();openSubscreen("rift");return;
  }
  const incoming=Math.max(1,Math.floor(r.enemyAtk*(.88+Math.random()*.24)-state.def*.28));r.hp=Math.max(0,r.hp-incoming);
  if(r.hp<=0){finishRift(false);return;}save();openSubscreen("rift");
}
function finishRift(win){ensureEvents();const r=state.events.rift;if(!r.active)return;const xp=r.xp,coins=r.coins,shadow=r.shadow;if(win){gainCoins(coins);state.shadowCoins+=shadow;addXP(xp);if(Math.random()<.08){const loot=makeLoot();state.inventory.push(loot);ensureNotices();state.notices.inventory=true;state.achievementStats.lootFound++;}modal("РАЗЛОМ ПОКОРЁН",`5 волн пройдены. +${xp.toLocaleString("ru-RU")} XP · +${coins.toLocaleString("ru-RU")} 🪙 · +${shadow} 🌑`);}else modal("РАЗЛОМ ЗАКРЫЛСЯ",`Ты дошёл до ${Math.max(0,r.wave-1)} из ${r.maxWaves} волн. Накопленные награды потеряны.`);state.events.rift={active:false,wave:1,maxWaves:5,hp:0,maxHp:0,mana:0,maxMana:0,enemyHp:0,enemyMaxHp:0,enemyAtk:0,coins:0,shadow:0,xp:0};save();render();openSubscreen("rift");}
function renderRift(){ensureEvents();const r=state.events.rift;if(r.active){const hpPct=Math.max(0,Math.min(100,r.hp/r.maxHp*100)),ePct=Math.max(0,Math.min(100,r.enemyHp/r.enemyMaxHp*100));return `<div class="rift-battle event-rift" style="--event-bg:url('img/events/rift.jpg')"><div class="rift-header"><span>ТАИНСТВЕННЫЙ РАЗЛОМ</span><b>ВОЛНА ${r.wave} / ${r.maxWaves}</b></div><div class="rift-fighters"><div><div class="event-fighter-avatar">${classAvatarImg(state.playerClass,'event-class-img')}</div><b>${escapeHtml(state.playerName||'Пробуждённый')}</b><div class="event-bar"><i style="width:${hpPct}%"></i></div><small>${Math.floor(r.hp)} / ${r.maxHp} HP</small></div><strong>VS</strong><div><div class="event-fighter-avatar">🌀</div><b>${riftEnemyName()}</b><div class="event-bar enemy"><i style="width:${ePct}%"></i></div><small>${Math.floor(r.enemyHp)} / ${r.enemyMaxHp} HP</small></div></div><div class="rift-rewards">Накоплено: ✨ ${r.xp.toLocaleString("ru-RU")} XP · 🪙 ${r.coins.toLocaleString("ru-RU")} · 🌑 ${r.shadow}</div><div class="rift-actions"><button class="primary-btn" onclick="riftAttack(false)">⚔️ АТАКА</button><button class="secondary-btn" onclick="riftAttack(true)" ${r.mana<Math.floor(state.maxMana*.18)||((Number(r.turn)||0)-Number(r.lastSkillTurn??-99)<2)?'disabled':''}>✦ НАВЫК${((Number(r.turn)||0)-Number(r.lastSkillTurn??-99)<2)?' · ЧЕРЕЗ ХОД':''}</button><button class="ghost-btn" onclick="finishRift(false)">ПОКИНУТЬ</button></div></div>`;}return `<div class="event-rift event-rift-home" style="--event-bg:url('img/events/rift.jpg')"><div class="rift-home-art"><img src="img/events/rift.png" alt=""><div><span>АНОМАЛИЯ ОБНАРУЖЕНА</span><h2>ТАИНСТВЕННЫЙ РАЗЛОМ</h2><p>Пять волн врагов. Чем глубже ты заходишь, тем выше награда.</p></div></div><div class="rift-rules"><div>⚡ <b>25 энергии</b><small>за вход</small></div><div>⚔️ <b>5 волн</b><small>усложнение после каждой</small></div><div>🎁 <b>8%</b><small>шанс дополнительного лута</small></div></div><div class="rift-reward-preview">За прохождение: XP · золото · теневые монеты · шанс экипировки</div><button class="primary-btn" onclick="startRift()">🌀 ВОЙТИ В РАЗЛОМ</button></div>`;}
function renderEvents(){const riftOpen=levelGate("rift");return `<div class="events-hub"><div class="events-hero"><span>ВРЕМЕННЫЕ АКТИВНОСТИ</span><h2>СОБЫТИЯ</h2><p>Особые режимы с наградами, которых нет в обычном прохождении.</p></div><div class="events-grid"><button class="event-card wheel-event" onclick="openSubscreen('wheel')"><img src="img/events/wheel.png" alt=""><b>Колесо удачи</b><small>6 наград · 1 бесплатное вращение в день · 100 🌑 за дополнительное</small></button><button class="event-card rift-event" onclick="openSubscreen('rift')" ${riftOpen?"":'disabled'}><img src="img/events/rift.png" alt=""><b>Таинственный разлом</b><small>${riftOpen?"5 волн · бои · XP · золото · 🌑":levelGateText("rift")}</small></button></div></div>`;}
const LEVEL_GATES={rift:15,farm:10,arena:15,bazaar:10};
function levelGate(type){const need=LEVEL_GATES[type];return need?Number(state.level||1)>=need:true;}
function levelGateText(type){const need=LEVEL_GATES[type];return need?`Откроется с ${need} уровня`:"";}
function updateLevelGateButtons(){document.querySelectorAll("[data-level-gate]").forEach(btn=>{const need=Number(btn.dataset.levelGate||0),open=Number(state.level||1)>=need;btn.disabled=!open;const small=btn.querySelector("small");if(small){small.textContent=open?(btn.dataset.levelGate==="15"?"5 боёв в день · рейтинг":btn.dataset.levelGate==="10"?(btn.querySelector("b")?.textContent==="Базар"?"Продажа снаряжения и лута":"∞ мобы · XP · золото"):small.textContent):`Откроется с ${need} уровня`;}});}
function showLevelGate(type){const need=LEVEL_GATES[type];if(!need)return true;if(Number(state.level||1)>=need)return true;modal("ДОСТУП ЗАКРЫТ",`Этот раздел откроется с ${need} уровня. Сейчас у тебя ${Number(state.level||1)} уровень.`);return false;}
let subscreenReturnScreen="more";
function openHeroSubscreen(type){subscreenReturnScreen="character";openSubscreen(type);}
function openSubscreen(type,refreshOnly=false){
  if(!showLevelGate(type)) return;
  ensureNotices();
  if(["inventory","quests","mail","titles"].includes(type)) state.notices[type]=false;
  if(type==="talents" && Number(state.talentPoints||0)<3) state.notices.talents=false;
  if(type==="skills") state.notices.skills=false;
  updateNoticeDots();
  save();
  const data=subScreens[type];
  $("subscreenTitle").textContent=data[0];
  if(type==="talents") {
    $("subscreenContent").innerHTML=renderTalents();
  } else if(type==="expedition") {
    if(expeditionReady()) { /* render will expose the claim button */ }
    $("subscreenContent").innerHTML=renderExpedition();
  } else if(type==="events") {
    $("subscreenContent").innerHTML=renderEvents();
  } else if(type==="wheel") {
    $("subscreenContent").innerHTML=renderWheel();
  } else if(type==="rift") {
    $("subscreenContent").innerHTML=renderRift();
  } else if(type==="daily") {
    const claimed=dailyChestClaimed();
    $("subscreenContent").innerHTML=`<div class="daily-chest-card"><div class="daily-chest-icon">🎁</div><h2>СУНДУК ДНЯ</h2><p>Каждый день можно открыть один сундук.</p><div class="daily-reward-preview">🪙 1 200–3 000</div><button class="primary-btn" onclick="claimDailyChest()" ${claimed?"disabled":""}>${claimed?"✓ УЖЕ ОТКРЫТ СЕГОДНЯ":"ОТКРЫТЬ СУНДУК"}</button></div>`;
  } else if(type==="casino") {
    $("subscreenContent").innerHTML=renderCasino();
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
    const farmOpen=levelGate("farm");
    $("subscreenContent").innerHTML=`<div class="farm-panel"><div class="farm-icon">🌾</div><h2>БЕСКОНЕЧНАЯ ФАРМ-ЗОНА</h2><p>Каждый моб даёт ровно <b>500 XP</b> и случайно <b>100–300 золота</b>. Лут не выпадает.</p><div class="farm-rule">⚠️ Авто-бой здесь недоступен.</div><button class="primary-btn" onclick="startFarmZone()" ${farmOpen?"":'disabled'}>${farmOpen?"НАЧАТЬ ФАРМ":levelGateText("farm")}</button></div>`;
  } else if(type==="rating") {
    $("subscreenContent").innerHTML=renderRating();
  } else if(type==="arena") {
    const arenaOpen=levelGate("arena");
    $("subscreenContent").innerHTML=arenaOpen?renderArena():`<div class="farm-panel"><div class="farm-icon">⚔️</div><h2>АРЕНА</h2><p>Сражения с другими игроками, рейтинг и ежедневные попытки.</p><div class="farm-rule">🔒 ${levelGateText("arena")}</div><button class="primary-btn" disabled>${levelGateText("arena")}</button></div>`;
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
  queueMicrotask(replaceRenderedEmoji);
}
function closeSubscreen(){const target=subscreenReturnScreen||"more";subscreenReturnScreen="more";showScreen(target);render();}
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
  state.shadowCoins-=shadow; gainCoins(shadow*65); save(); render(); openSubscreen("shop");
  modal("ОБМЕН ВЫПОЛНЕН",`Получено 🪙 ${(shadow*65).toLocaleString("ru-RU")} за 🌑 ${shadow}.`);
}
/* Premium payment is intentionally disabled in the offline build. */
async function buyPremium(){
  modal("ПРЕМИУМ","Покупка Premium временно отключена в офлайн-версии.");
}

function autoBattle(){
  if(!isPremiumActive()){ modal("НУЖЕН ПРЕМИУМ","Авто-бой доступен только после покупки Премиума ⭐100."); return; }
  if(!state.battle) return;
  if(state.battle.farm){modal("ФАРМ-ЗОНА","Авто-бой здесь недоступен.");return;}
  const b=state.battle;
  let hp=state.maxHp, mana=state.maxMana, enemyHp=b.maxHp, turns=0, healCooldown=0,lastSkillTurn=-99;
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
    } else if(mana>=skillCost && enemyHp>state.atk*1.15 && turns-lastSkillTurn>=2){
      mana-=skillCost;
      lastSkillTurn=turns;
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
window.addEventListener("pagehide",()=>{if(saveReady){regenEnergy(); refreshActionableNotices(); save();}});
window.addEventListener("beforeunload",()=>{regenEnergy(); refreshActionableNotices(); save();});
window.addEventListener("error",()=>save());
window.addEventListener("unhandledrejection",()=>save());
function showScreen(name){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));const screen=$("screen-"+name);if(!screen)return;screen.classList.add("active");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));if(name==="dungeons"){try{renderDungeons();}catch(_){}}if(name==="world"){try{renderWorldMap();}catch(_){}}if(name==="character"){const p=$("allocationPanel");if(p){p.classList.add("collapsed");const a=$("allocationArrow");if(a)a.textContent="⌄";const h=p.querySelector(".allocation-head");if(h)h.setAttribute("aria-expanded","false");}}}
function showCurrencyInfo(type){
  const info={
    gold:{title:"МОНЕТЫ",icon:"🪙",text:"Основная валюта игры. Используется для улучшения снаряжения, покупок и различных игровых расходов.\n\nПолучить: за прохождение подземелий, задания, события, экспедиции, продажу снаряжения и другие игровые активности."},
    shards:{title:"ОСКОЛКИ",icon:"🔹",text:"Материал для улучшения и усиления снаряжения. Чем выше уровень улучшения, тем больше осколков может потребоваться.\n\nПолучить: из снаряжения и наград, при разборе ненужных предметов, в подземельях, событиях и других активностях."},
    shadow:{title:"ТЕНЕВЫЕ МОНЕТЫ",icon:"🌑",text:"Особая редкая валюта для магазина и специальных возможностей.\n\nПолучить: купить в магазине за Telegram Stars, получить в Колесе удачи, за достижения и прохождение Таинственного разлома, а также из других специальных игровых наград и событий."}
  }[type];
  if(!info)return;
  $("modalIcon").textContent=info.icon;
  modal(info.title,info.text);
}

function modal(title,text){$("modalTitle").textContent=title;$("modalText").innerHTML=String(text).replace(/\n/g,"<br>");const action=$("modalTitleAction");if(action){action.classList.add("hidden");action.onclick=null;}$("modal").classList.remove("hidden");}
$("modalClose").onclick=()=>{$("modal").classList.add("hidden");const action=$("modalTitleAction");if(action)action.classList.add("hidden");render();};
document.querySelectorAll(".class-card").forEach(b=>b.onclick=()=>selectClass(b.dataset.class));
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showScreen(b.dataset.screen));
const chatForm=$("chatForm"); if(chatForm){chatForm.addEventListener("submit",e=>{e.preventDefault();const input=$("chatInput");sendChatMessage(input.value);input.value="";input.focus();});}
ensureChat();
$("rankUpBtn").onclick=rankUp;$("attackBtn").onclick=()=>playerAttack(1);$("skillBtn").onclick=skill;$("healBtn").onclick=heal;$("leaveBattle").onclick=leaveBattle;
queueMicrotask(replaceRenderedEmoji);

setInterval(()=>{
  // Полный автосейв каждые 3 секунды. Пользовательские действия дополнительно
  // сохраняются сразу через saveAfterAction(), поэтому здесь именно страховочный снимок.
  if(saveReady){ refreshActionableNotices(); save(); }
},3000);
setInterval(()=>{regenEnergy();premiumDaily();resetArenaDay();updateEnergyCountdown();if(document.getElementById("screen-sub")?.classList.contains("active") && document.getElementById("subscreenTitle")?.textContent.includes("ЭКСПЕДИЦИЯ")) updateExpeditionTimer();},15000);
setInterval(()=>{updateEnergyCountdown();if(document.getElementById("screen-sub")?.classList.contains("active") && document.getElementById("subscreenTitle")?.textContent.includes("ЭКСПЕДИЦИЯ")) updateExpeditionTimer();},1000);

/* EQUIPMENT OVERHAUL v3 */
const EQUIP_V3_RANKS=[
 {name:"F",min:1,mult:.78},{name:"E",min:5,mult:.92},{name:"D",min:9,mult:1.08},{name:"C",min:13,mult:1.26},{name:"B",min:17,mult:1.48},
 {name:"A",min:21,mult:1.75},{name:"AA",min:25,mult:2.05},{name:"S",min:29,mult:2.40},{name:"SS",min:33,mult:2.85},{name:"SSS",min:37,mult:3.35}
];
const EQUIP_V3={
 weapon:{
  assassin:[
   ['Коготь Полуночи','Лёгкий клинок, созданный для стремительных атак из тени.',['strength','critChance']],
   ['Шёпот Тени','Беззвучное снаряжение для точных ударов и ловкости.',['strength','agility','critChance']],
   ['Лунный Клык','Тёмный клык, усиливающий критический урон охотника.',['strength','critDamage','dodge']],
   ['Призрачный Разрез','Эфирный клинок, который делает движения почти незаметными.',['strength','agility','dodge']],
   ['Клинок Ночного Ветра','Редкое оружие странников, сочетающее скорость и силу.',['strength','agility','critDamage']],
   ['Сердце Ассасина','Артефактный клинок для идеального ритма атак.',['strength','critChance','critDamage']],
   ['Предел Тени','Оружие мастера, концентрирующее силу в одном точном ударе.',['strength','critDamage','agility']],
   ['Эхо Полуночи','Легендарное снаряжение, наполненное холодной энергией ночи.',['strength','critChance','dodge']]
  ],
  mage:[
   ['Скипетр Астрала','Фокусирует энергию заклинаний и расширяет запас маны.',['strength','stamina','critDamage']],
   ['Жезл Лунного Потока','Стабилизирует магический поток и повышает точность чар.',['strength','stamina','critChance']],
   ['Кристальный Фокус','Чистый кристалл усиливает силу и критический урон магии.',['strength','critDamage','stamina']],
   ['Посох Звёздной Пыли','Древний посох, собравший энергию далёких звёзд.',['strength','stamina','agility']],
   ['Око Арканы','Магический фокус для точных и мощных заклинаний.',['strength','critChance','critDamage']],
   ['Сердце Эфира','Сгусток эфира, питающий силу мага в долгом бою.',['strength','stamina','health']],
   ['Венец Бездны','Мощный фокус, усиливающий разрушительную сторону магии.',['strength','critDamage','health']],
   ['Астральный Предел','Высшая форма магического фокуса, соединяющая силу и энергию.',['strength','stamina','critChance']]
  ],
  paladin:[
   ['Светоносный Символ','Укрепляет силу и стойкость защитника.',['strength','health','defense']],
   ['Молот Рассвета','Тяжёлое оружие хранителя света.',['strength','health','defense']],
   ['Клинок Бастиона','Сбалансированное снаряжение для долгих сражений.',['strength','defense','stamina']],
   ['Знак Храма','Священный фокус, укрепляющий тело и дух.',['strength','health','stamina']],
   ['Сердце Стража','Ядро защитника, усиливающее силу и выносливость.',['strength','health','defense']],
   ['Свет Небес','Редкое снаряжение, насыщенное энергией древнего храма.',['strength','health','critDamage']],
   ['Клятва Титана','Мощный символ паладина для максимальной стойкости.',['strength','defense','health']],
   ['Реликвия Рассвета','Высшее снаряжение стража, соединяющее мощь и защиту.',['strength','health','critDamage']]
  ],
  archer:[
   ['Звёздный Лук','Усиливает точность, ловкость и критический урон.',['strength','agility','critDamage']],
   ['Лук Серебряного Ветра','Лёгкое оружие быстрого и точного стрелка.',['strength','agility','critChance']],
   ['Крыло Сокола','Фокусирует скорость и силу точных атак.',['strength','critChance','agility']],
   ['Лук Небесной Дуги','Редкое снаряжение для дальних и точных атак.',['strength','critDamage','agility']],
   ['След Зари','Светящийся лук, ускоряющий реакцию стрелка.',['strength','agility','dodge']],
   ['Глаз Охотника','Фокус для идеальной концентрации и критического урона.',['strength','critChance','critDamage']],
   ['Ветер Рассвета','Мощный лук, соединяющий скорость и силу.',['strength','agility','critDamage']],
   ['Небесный Страж','Высшее снаряжение мастера дальнего боя.',['strength','critDamage','critChance']]
  ]
 },
 armor:{
  assassin:[
   ['Плащ Лунной Тени','Лёгкая защита, созданная для мобильности и уклонения.',['health','agility','dodge']],
   ['Покров Ночи','Тёмная ткань, скрывающая движения владельца.',['health','dodge','agility']],
   ['Доспех Призрачного Следа','Лёгкая броня для быстрых перемещений.',['health','agility','defense']],
   ['Мантия Тихого Ветра','Защита, не мешающая ловкости и реакции.',['health','dodge','critChance']],
   ['Кожа Лунного Охотника','Усиленная экипировка ночного странника.',['health','agility','defense']],
   ['Панцирь Тени','Редкая защита, сочетающая мобильность и стойкость.',['health','defense','dodge']],
   ['Плащ Безмолвия','Высококлассная защита мастера скрытности.',['health','agility','dodge']],
   ['Облачение Полуночи','Высшая форма лёгкой защиты ассасина.',['health','defense','agility']]
  ],
  mage:[
   ['Мантия Звёздного Потока','Стабилизирует поток энергии и защищает тело.',['health','stamina','defense']],
   ['Одеяние Лунной Арканы','Магическая ткань с высоким запасом энергии.',['health','stamina','critChance']],
   ['Мантия Эфира','Плотная эфирная защита для мага.',['health','stamina','agility']],
   ['Роба Астрального Круга','Защита, усиливающая устойчивость и поток маны.',['health','defense','stamina']],
   ['Покров Архимага','Продвинутая мантия для долгих сражений.',['health','stamina','critDamage']],
   ['Одеяние Бездонной Звезды','Редкая защита с мощным магическим ядром.',['health','stamina','defense']],
   ['Мантия Предела','Высокая защита, стабилизирующая энергию мага.',['health','defense','stamina']],
   ['Вуаль Астрального Короля','Высшее одеяние, наполненное чистой энергией.',['health','stamina','critDamage']]
  ],
  paladin:[
   ['Доспех Бастиона','Тяжёлая броня для долгого боя.',['health','defense','stamina']],
   ['Кираса Рассвета','Защита хранителя света.',['health','defense','strength']],
   ['Латы Храма','Надёжная броня для фронтового героя.',['health','defense','stamina']],
   ['Панцирь Стража','Усиленная защита с большим запасом здоровья.',['health','defense','strength']],
   ['Броня Небесной Воли','Священная защита, укрепляющая тело.',['health','defense','critDamage']],
   ['Кираса Титана','Редкие латы исключительной прочности.',['health','defense','stamina']],
   ['Бастион Вечности','Мощнейшая защита древнего стража.',['health','defense','strength']],
   ['Доспех Небесного Хранителя','Высшая броня паладина.',['health','defense','critDamage']]
  ],
  archer:[
   ['Мантия Небесного Охотника','Гибкая защита точного и мобильного стрелка.',['health','agility','critChance']],
   ['Куртка Серебряного Ветра','Лёгкая броня для быстрого движения.',['health','agility','dodge']],
   ['Покров Сокола','Защита, не мешающая концентрации.',['health','agility','critDamage']],
   ['Кожа Следопыта','Практичная броня опытного охотника.',['health','defense','agility']],
   ['Плащ Дальнего Взора','Мягкая защита с акцентом на точность.',['health','agility','critChance']],
   ['Броня Лесного Духа','Редкая экипировка ловкого стрелка.',['health','agility','dodge']],
   ['Мантия Небесной Дуги','Продвинутая защита мастера дальнего боя.',['health','agility','critDamage']],
   ['Покров Вечного Охотника','Высшая гибкая броня стрелка.',['health','defense','agility']]
  ]
 },
 amulet:{
  assassin:[
   ['Осколок Полуночи','Усиливает критические атаки и уклонение.',['critDamage','critChance','dodge']],
   ['Клык Тени','Тёмный талисман быстрого бойца.',['critChance','dodge','agility']],
   ['Око Ночной Луны','Собирает энергию для точных критических атак.',['critDamage','critChance','agility']],
   ['Сердце Призрака','Амулет, усиливающий реакцию и уклонение.',['dodge','agility','critChance']],
   ['Руна Тихого Шага','Древняя руна скрытного движения.',['dodge','critDamage','agility']],
   ['Печать Ночи','Редкий амулет мастера критических атак.',['critDamage','critChance','dodge']],
   ['Око Полуночного Ветра','Высокий фокус для стремительных атак.',['critChance','critDamage','agility']],
   ['Сердце Бездонной Тени','Высший амулет скрытного мастера.',['critDamage','dodge','critChance']]
  ],
  mage:[
   ['Око Архимага','Повышает точность и силу магических атак.',['stamina','critChance','critDamage']],
   ['Кристалл Астрала','Чистый магический камень для усиления энергии.',['stamina','critDamage','health']],
   ['Печать Эфира','Стабилизирует поток маны и концентрацию.',['stamina','critChance','agility']],
   ['Око Звёздной Пыли','Редкий фокус точности заклинаний.',['critChance','critDamage','stamina']],
   ['Сердце Арканы','Талисман для длительных магических боёв.',['stamina','health','critDamage']],
   ['Руна Архимага','Продвинутый магический амулет.',['stamina','critChance','critDamage']],
   ['Печать Бездны','Сильный фокус разрушительной энергии.',['critDamage','stamina','health']],
   ['Астральное Око','Высший магический амулет для концентрации.',['stamina','critDamage','critChance']]
  ],
  paladin:[
   ['Печать Небес','Древний талисман защитника.',['health','defense','critDamage']],
   ['Знак Рассвета','Священный символ стойкости.',['health','defense','stamina']],
   ['Сердце Храма','Амулет, укрепляющий тело и дух.',['health','stamina','defense']],
   ['Руна Стража','Защитная руна древнего ордена.',['defense','health','critDamage']],
   ['Медальон Воли','Усиливает запас здоровья и стойкость.',['health','defense','stamina']],
   ['Печать Титана','Редкий талисман великого защитника.',['health','defense','strength']],
   ['Сердце Рассвета','Мощный священный фокус.',['health','critDamage','defense']],
   ['Знак Вечного Хранителя','Высший амулет защитника.',['health','defense','critDamage']]
  ],
  archer:[
   ['Око Сокола','Амулет идеальной концентрации.',['critChance','critDamage','agility']],
   ['Перо Ветра','Талисман скорости и точности.',['agility','critChance','dodge']],
   ['Клык Небесного Охотника','Фокусирует силу дальних атак.',['critDamage','critChance','agility']],
   ['Сердце Сокола','Усиливает реакцию и точность.',['agility','critChance','health']],
   ['Руна Дальнего Взора','Древняя руна опытного стрелка.',['critChance','critDamage','agility']],
   ['Печать Ветра','Редкий талисман быстрого боя.',['agility','dodge','critDamage']],
   ['Око Небесной Дуги','Продвинутый фокус точного стрелка.',['critDamage','critChance','agility']],
   ['Сердце Вечного Сокола','Высший амулет мастера дальнего боя.',['critChance','critDamage','agility']]
  ]
 }
};
const EQUIP_V3_VARIANTS=[
 {suffix:'',factor:1.00},{suffix:' Эфира',factor:1.08},{suffix:' Ветра',factor:1.16},{suffix:' Звёзд',factor:1.25},
 {suffix:' Рассвета',factor:1.35},{suffix:' Бездны',factor:1.47},{suffix:' Вечности',factor:1.60},{suffix:' Предела',factor:1.75}
];
function equipV3Rank(lvl){let r=EQUIP_V3_RANKS[0];for(const x of EQUIP_V3_RANKS)if(lvl>=x.min)r=x;return r;}
function equipV3Def(type,key,v=0){const pool=EQUIP_V3[type]?.[key]||EQUIP_V3[type]?.mage;const idx=Math.max(0,Math.min(pool.length-1,Number(v)||0));const d=pool[idx],vv=EQUIP_V3_VARIANTS[idx]||EQUIP_V3_VARIANTS[0];return {name:d[0]+vv.suffix,desc:d[1],stats:d[2],factor:vv.factor};}
function equipV3Stats(type,lvl,rarity,upgrade,key,v){
 const rank=equipV3Rank(lvl), rm=rarityByName(rarity).mult, um=1+(Number(upgrade)||0)*.07, d=equipV3Def(type,key,v), s=rm*rank.mult*um*d.factor, L=Math.max(1,Number(lvl)||1);
 const b={strength:2+L*1.15,health:5+L*2.25,defense:1+L*.85,stamina:1+L*.48,critDamage:3+L*.55,critChance:1+L*.10,agility:1+L*.32,dodge:1+L*.08};
 const o={};for(const k of d.stats)o[k]=Math.max(1,Math.floor(b[k]*s));if(type==='weapon')o.strength=Math.floor((b.strength+L*.35)*s);if(type==='armor')o.health=Math.floor((b.health+L*.8)*s);return o;
}
function normalizeV3(item){
 if(!item||item.type==='material')return item;
 const type=['weapon','armor','amulet','artifact'].includes(item.type)?item.type:'weapon';
 if(type==='artifact'){item.description=item.artifactDesc||item.description||'Древний артефакт, усиливающий характеристики владельца.';item.itemRank=equipV3Rank(item.itemLevel||1).name;item.equipmentRevision=3;return item;}
 const key=['assassin','mage','paladin','archer'].includes(item.classKey)?item.classKey:(state.playerClass||'mage');
 const lvl=Math.max(1,Math.min(100,Number(item.itemLevel)||state.level||1)),v=Math.max(0,Math.min(7,Number.isFinite(Number(item.variant))?Number(item.variant):Math.floor(Math.random()*8))),rarity=rarityByName(item.rarity).name,rank=equipV3Rank(lvl),d=equipV3Def(type,key,v);
 item.type=type;item.classKey=key;item.itemLevel=lvl;item.variant=v;item.rarity=rarity;item.rarityClass=rarityByName(rarity).cls;item.itemRank=rank.name;item.description=d.desc;item.name=d.name;item.equipmentRevision=3;item.iconKey=`${type}_${key}_${v}`;item.stats=equipV3Stats(type,lvl,rarity,item.upgradeLevel||0,key,v);item.price=Math.max(10,Math.floor(lvl*lvl*2.2*rarityByName(rarity).mult*rank.mult*(1+(Number(item.upgradeLevel)||0)*.1)));return item;
}
/* ========================= EQUIPMENT V5 — 12 HAND-ILLUSTRATED ITEMS ========================= */
function equipV5Data(){
  return {
    mage:{
      weapon:{name:'Посох Бездны',desc:'Древний посох, в котором бушует сгусток бездонной магии.',stats:['stamina','strength','critDamage'],factor:1.10},
      armor:{name:'Мантия Архимага',desc:'Тёмно-синяя мантия, стабилизирующая поток маны и защищающая мага.',stats:['health','stamina','defense'],factor:1.03},
      amulet:{name:'Шаг Магии',desc:'Амулет, позволяющий чувствовать движение магической энергии ещё до заклинания.',stats:['stamina','critChance','critDamage'],factor:1.06}
    },
    archer:{
      weapon:{name:'Небесный Лук',desc:'Лук из зелёной древесины небесного леса. Стрелы из него летят почти бесшумно.',stats:['strength','agility','critDamage'],factor:1.08},
      armor:{name:'Лёгкие Доспехи Следопыта',desc:'Лёгкая зелёная броня, созданная для скорости, точности и бесшумного движения.',stats:['health','agility','dodge'],factor:1.02},
      amulet:{name:'Серьга Леса',desc:'Живая серьга-талисман, усиливающая чувство цели и реакцию стрелка.',stats:['critChance','agility','dodge'],factor:1.06}
    },
    paladin:{
      weapon:{name:'Светоносный Клинок',desc:'Двуручный меч, наполненный чистым светом и силой защитника.',stats:['strength','critDamage','health'],factor:1.03},
      armor:{name:'Крылья Веры',desc:'Тяжёлые доспехи святого стража. Их вес превращается в непробиваемую защиту.',stats:['health','defense','stamina'],factor:1.10},
      amulet:{name:'Сердце Света',desc:'Священный амулет, поддерживающий тело владельца и укрепляющий защиту.',stats:['health','defense','critDamage'],factor:1.05}
    },
    assassin:{
      weapon:{name:'Тени Близнецов',desc:'Пара кинжалов, созданных для стремительных атак и точных критических ударов.',stats:['strength','critChance','critDamage'],factor:1.10},
      armor:{name:'Капюшон Убийцы',desc:'Средние доспехи, скрывающие движения и позволяющие мгновенно менять позицию.',stats:['agility','dodge','defense'],factor:1.01},
      amulet:{name:'Кулон Убийцы',desc:'Фиолетовый талисман, усиливающий реакцию, точность и критический урон.',stats:['critChance','critDamage','agility'],factor:1.07}
    }
  };
}
function equipV5Rank(lvl){return equipV3Rank(Math.max(1,Number(lvl)||1));}
function equipV5Stats(type,lvl,rarity,upgrade,key){
  const rank=equipV5Rank(lvl), rm=rarityByName(rarity).mult;
  const L=Math.max(1,Number(lvl)||1), um=1+(Number(upgrade)||0)*.07;
  if(type==='artifact'){
    const s=(1+L*.10)*rm*rank.mult*um;
    return {
      strength:Math.max(1,Math.floor((2+L*.65)*s)),
      health:Math.max(1,Math.floor((3+L*1.2)*s)),
      stamina:Math.max(1,Math.floor((1+L*.08)*s)),
      critChance:Math.max(1,Math.floor((1+L*.055)*s))
    };
  }
  const d=equipV5Data()[key]?.[type] || equipV5Data().mage[type];
  const s=(1+L*.108)*rm*rank.mult*um*d.factor;
  const base={strength:4+L*.92,health:11+L*2.55,defense:4+L*1.18,stamina:3+L*.70,critDamage:2+L*.32,critChance:.85+L*.08,agility:2+L*.66,dodge:.65+L*.062};
  const out={}; for(const stat of d.stats)out[stat]=Math.max(1,Math.floor(base[stat]*s));
  return out;
}
function normalizeV4(item){
  if(!item)return item;
  if(item.type==='material')return item;
  if(item.type==='artifact'){
    item.description=item.artifactDesc||item.description||'Древний артефакт, усиливающий характеристики владельца.';
    item.itemRank=equipV5Rank(item.itemLevel||1).name;
    return item;
  }
  const types=['weapon','armor','amulet'];
  const key=['assassin','mage','paladin','archer'].includes(item.classKey)?item.classKey:(state.playerClass||'mage');
  const type=types.includes(item.type)?item.type:'weapon';
  const d=equipV5Data()[key][type];
  const lvl=Math.max(1,Math.min(100,Number(item.itemLevel)||state.level||1));
  const rarity=rarityByName(item.rarity).name;
  const rank=equipV5Rank(lvl);
  item.type=type; item.classKey=key; item.itemLevel=lvl; item.variant=0;
  item.rarity=rarity; item.rarityClass=rarityByName(rarity).cls; item.itemRank=rank.name;
  item.name=d.name; item.description=d.desc; item.equipmentRevision=5;
  item.iconKey=`${key}_${type}`;
  item.stats=equipV5Stats(type,lvl,rarity,item.upgradeLevel||0,key);
  item.price=Math.max(10,Math.floor(lvl*lvl*2.4*rarityByName(rarity).mult*rank.mult*(1+(Number(item.upgradeLevel)||0)*.1)*d.factor));
  return item;
}
function migrateEconomyAndBalance(){
  const v=Number(state._saveVersion||0);
  if(v<62){
    state.coins=Math.max(0,Math.floor((Number(state.coins)||0)/2));
    state.achievementStats=state.achievementStats||{};
    state.achievementStats.goldEarned=Math.floor((Number(state.achievementStats.goldEarned)||0)/2);
    for(const item of [...(state.inventory||[]),...Object.values(state.equipped||{}).filter(Boolean)]) item.upgradeLevel=Math.max(0,Math.min(20,Number(item.upgradeLevel)||0));
  }
}
function purgeJunkLoot(){
  const normalizeName=(value)=>String(value||"").toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ").trim();
  const junkNames=new Set(["кристалл маны","темный камень","ядро монстра","ядро энергии"]);
  const isJunkLoot=(item)=>{
    if(!item)return true;
    if(item.type==='material')return true;
    // Старые версии могли хранить мусор как обычное снаряжение.
    // Удаляем только явно бесполезные названия; артефакты с похожими названиями сохраняем.
    if(item.type==='artifact')return false;
    const name=normalizeName(item.name);
    if(junkNames.has(name))return true;
    return /^(кристалл маны|темный камень|ядро монстра|ядро энергии)$/.test(name);
  };
  state.inventory=(state.inventory||[]).filter(item=>!isJunkLoot(item));
  state.bazaarLots=(state.bazaarLots||[]).filter(lot=>!isJunkLoot(lot?.item));
  Object.keys(state.equipped||{}).forEach(slot=>{if(isJunkLoot(state.equipped[slot]))state.equipped[slot]=null;});
}
function migrateEquipmentSystem(){
  const savedVersion=Number(state._saveVersion||0);
  if(savedVersion<22) state.xp=Math.floor((Number(state.xp)||0)/3);
  if(state.equipmentRevision!==5){
    state.inventory=(state.inventory||[]).filter(item=>item&&(['material','artifact'].includes(item.type)));
    state.equipped={weapon:null,armor:null,amulet:null,artifact:state.equipped?.artifact||null};
    state.bazaarLots=(state.bazaarLots||[]).filter(lot=>lot?.item?.type==='material'||lot?.item?.type==='artifact');
    state.equipmentRevision=5;
  }
  (state.inventory||[]).forEach(item=>{
    if(item?.type==='artifact' && !Number.isFinite(Number(item.variant))){
      const idx=ARTIFACTS.findIndex(a=>a.name===item.name);
      item.variant=idx>=0?idx:0;
    }
  });
  Object.values(state.equipped||{}).forEach(item=>{
    if(item?.type==='artifact' && !Number.isFinite(Number(item.variant))){
      const idx=ARTIFACTS.findIndex(a=>a.name===item.name);
      item.variant=idx>=0?idx:0;
    }
  });
  (state.bazaarLots||[]).forEach(lot=>{
    const item=lot?.item;
    if(item?.type==='artifact' && !Number.isFinite(Number(item.variant))){
      const idx=ARTIFACTS.findIndex(a=>a.name===item.name);
      item.variant=idx>=0?idx:0;
    }
  });
  (state.inventory||[]).forEach(normalizeV4);
  Object.values(state.equipped||{}).forEach(normalizeV4);
  (state.bazaarLots||[]).forEach(x=>normalizeV4(x.item));
  if(!Number.isFinite(state.shards))state.shards=0;
  purgeJunkLoot();
}
function generateEquipmentStats(type,itemLevel,rarity='Обычное',upgradeLevel=0){
  return equipV5Stats(type,itemLevel,rarity,upgradeLevel,state.playerClass||'mage');
}
function itemIconPath(item){
  const type=item?.type||'material';
  if(type==='material')return'img/icons/inventory.png';
  if(type==='artifact')return`img/equipment/artifact_${Math.max(0,Math.min(3,Number(item?.variant)||0))}.png`;
  const key=['assassin','mage','paladin','archer'].includes(item?.classKey)?item.classKey:(state.playerClass||'mage');
  return`img/equipment_items/${key}_${type}.png`;
}
function makeLoot(){
  const roll=Math.random();
  const typeRoll=roll<.38?'weapon':roll<.76?'armor':'amulet';
  const classes=['assassin','mage','paladin','archer'];
  const key=Math.random()<.82?(state.playerClass||'mage'):classes[rand(0,3)];
  const lvl=Math.max(1,Math.min(100,(state.level||1)-rand(0,3)));
  const rarity=rollRarity();
  const item={id:`loot_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,type:typeRoll,classKey:key,variant:0,itemLevel:lvl,upgradeLevel:0,rarity:rarity.name};
  normalizeV4(item);
  return item;
}
