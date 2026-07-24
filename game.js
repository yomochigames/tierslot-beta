"use strict";

const BOSS_HP = [60,120,180,240,300,360,420,480,540,666,777,888,999];
const TILE_NAMES = [
  "一萬","二萬","三萬","四萬","五萬","六萬","七萬","八萬","九萬",
  "一筒","二筒","三筒","四筒","五筒","六筒","七筒","八筒","九筒",
  "一索","二索","三索","四索","五索","六索","七索","八索","九索",
  "東","南","西","北","白","發","中"
];

const state = {
  machine:null, rolls:60, bonusTier:1, coins:0, finalReward:0, remainingPoints:0,
  bossTier:1, bossHp:60, defeatedBosses:0, tripleCount:0, singleMultiplier:1,
  spinning:false, finished:false, awaitingChoice:false,
  reelValues:[1,1,1], reelStopped:[true,true,true], reelTimers:[null,null,null],
  mahjongGame:1, mahjongRolls:12, mahjongTotalScore:0, mahjongGameScore:0,
  mahjongHand:[], openPonTiles:[], redTiles:[], doraTiles:[], currentRedIndex:-1,
  pendingTriple:false, skipPonMode:false
};

const $ = id => document.getElementById(id);
const els = {
  machineName:$("machineName"), rollsLabel:$("rollsLabel"), rollsValue:$("rollsValue"),
  tierLabel:$("tierLabel"), tierValue:$("tierValue"), progressLabel:$("progressLabel"),
  progressValue:$("progressValue"), subLabel:$("subLabel"), subValue:$("subValue"),
  rewardLabel:$("rewardLabel"), rewardValue:$("rewardValue"),
  resultTitle:$("resultTitle"), resultMessage:$("resultMessage"),
  rollButton:$("rollButton"), retireButton:$("retireButton"), restartButton:$("restartButton"),
  machineButtons:[...document.querySelectorAll(".machine-button")],
  stopButtons:[...document.querySelectorAll(".stop-button")],
  reels:[$("reel0"),$("reel1"),$("reel2")],
  ruleButton:$("ruleButton"), ruleDialog:$("ruleDialog"), ruleTitle:$("ruleTitle"),
  ruleContent:$("ruleContent"), closeRuleButton:$("closeRuleButton"),
  mahjongInfo:$("mahjongInfo"), mahjongGameValue:$("mahjongGameValue"),
  doraList:$("doraList"), handList:$("handList"), mahjongScoreValue:$("mahjongScoreValue"),
  tileChoicePanel:$("tileChoicePanel"), tileChoiceButtons:[...document.querySelectorAll(".tile-choice-button")],
  ponActions:$("ponActions"), ponButton:$("ponButton"), skipPonButton:$("skipPonButton")
};

const rules = {
  white:{name:"白台（ATタイプ）",html:"<h3>白台</h3><p>連番でTier+1。左中央ペアで数字の積を獲得。トリプルで+20ロール、Tier×10コイン、Tier+1。終了時：獲得コイン×Tier×100。</p>"},
  blue:{name:"青台（Aタイプ）",html:"<h3>青台</h3><p>連番でTier+1。トリプルまたは60ロール消化で終了。報酬：Tier×残りロール×1000。リタイア報酬なし。</p>"},
  yellow:{name:"黄台（301）",html:"<h3>黄台 301</h3><p>合計値またはペアでない牌の数字をダメージ。連番はTier+1のみ。トリプル100。ちょうど0でクリア、超過はBURST。報酬：Tier×10,000。</p>"},
  red:{name:"赤台（501）",html:"<h3>赤台 501</h3><p>301と同じ。開始501、報酬：Tier×100,000。</p>"},
  brown:{name:"茶台（666）",html:"<h3>茶台 666</h3><p>301と同じ。開始666、報酬：Tier×1,000,000。</p>"},
  purple:{name:"紫台（BOSS RUSH）",html:"<h3>紫台</h3><p>ボスHPをちょうど0にして撃破。超過ダメージはBURST。撃破で+60ロール。トリプル6回ごとにSingle倍率+1。Tier13撃破で完全クリア。</p>"},
  mahjong:{name:"魔界雀",html:`
    <h3>基本</h3><p>全5ゲーム。各ゲームは雀頭2枚から開始し、12ロール分の牌を集めます。初期ドラとポン追加ドラは全5ゲーム共通です。</p>
    <h3>選択</h3><p>3牌停止後、1枚を選択。左右ペア時は中央牌がそのロール限定の赤ドラになります。</p>
    <h3>トリプル</h3><p>「鳴く」で3枚取得・3ロール消費・ポン扱い・その牌を追加ドラにします。「鳴かない」なら1枚選択・1ロール消費です。</p>
    <h3>得点</h3><p>役とドラの合計翻数×1,000点。ドラだけでは0点。役満は13翻扱いです。</p>
    <h3>動作確認版の採用役</h3><p>門前清自摸、タンヤオ、役牌、平和、一盃口、七対子、対々和、三暗刻、三色同順、一気通貫、混全帯幺九、純全帯幺九、混老頭、小三元、混一色、清一色、国士無双、四暗刻、大三元、字一色、清老頭、小四喜、大四喜。</p>`}
};

function fmt(n){ return Number(n).toLocaleString("ja-JP"); }
function randomDie(){ return Math.floor(Math.random()*6)+1; }
function randomTile(){ return Math.floor(Math.random()*34); }
function tileName(i){ return TILE_NAMES[i] ?? "?"; }
function isMahjong(){ return state.machine === "mahjong"; }
function setMessage(title,msg){ els.resultTitle.textContent=title; els.resultMessage.textContent=msg; }

function resetLabels(){
  els.rollsLabel.textContent="残りロール"; els.tierLabel.textContent="Bonus Tier";
  els.progressLabel.textContent="獲得コイン"; els.subLabel.textContent="補助情報";
  els.rewardLabel.textContent="最終報酬";
}

function updateDisplay(){
  resetLabels();
  if(isMahjong()){
    els.rollsLabel.textContent="ゲーム残りロール";
    els.tierLabel.textContent="現在ゲーム";
    els.progressLabel.textContent="合計得点";
    els.subLabel.textContent="手牌枚数";
    els.rewardLabel.textContent="最終得点";
    els.rollsValue.textContent=fmt(state.mahjongRolls);
    els.tierValue.textContent=`${state.mahjongGame}/5`;
    els.progressValue.textContent=fmt(state.mahjongTotalScore);
    els.subValue.textContent=`${state.mahjongHand.length}/14`;
    els.rewardValue.textContent=fmt(state.finished?state.mahjongTotalScore:0);
    renderMahjong();
  } else {
    els.rollsValue.textContent=fmt(state.rolls);
    els.tierValue.textContent=fmt(state.bonusTier);
    if(["yellow","red","brown"].includes(state.machine)){
      els.progressLabel.textContent="残りポイント"; els.progressValue.textContent=fmt(state.remainingPoints);
      els.subLabel.textContent="獲得コイン"; els.subValue.textContent=fmt(state.coins);
    } else if(state.machine==="purple"){
      els.progressLabel.textContent=`Boss Tier ${state.bossTier}`; els.progressValue.textContent=fmt(state.bossHp);
      els.subLabel.textContent="Single倍率 / Triple"; els.subValue.textContent=`×${state.singleMultiplier} / ${state.tripleCount}`;
    } else {
      els.progressValue.textContent=fmt(state.coins); els.subValue.textContent="-";
    }
    els.rewardValue.textContent=fmt(state.finalReward);
  }

  const blocked=state.spinning||state.finished||state.awaitingChoice;
  els.rollButton.disabled=!state.machine||blocked||(isMahjong()?state.mahjongRolls<=0:state.rolls<=0);
  els.retireButton.disabled=!state.machine||state.spinning||state.finished;
  els.restartButton.disabled=!state.machine;
  els.stopButtons.forEach((b,i)=>b.disabled=!state.spinning||state.reelStopped[i]);
}

function renderMahjong(){
  els.mahjongInfo.classList.toggle("hidden",!isMahjong());
  if(!isMahjong()) return;
  els.mahjongGameValue.textContent=`${state.mahjongGame} / 5`;
  els.mahjongScoreValue.textContent=fmt(state.mahjongGameScore);
  renderTileList(els.doraList,state.doraTiles.map((t,i)=>({tile:t,open:i>0,red:false})));
  const openCount=state.openPonTiles.length*3;
  const handData=state.mahjongHand.map((t,i)=>({tile:t,open:i<openCount,red:state.redTiles.includes(i)}));
  renderTileList(els.handList,handData);
}

function renderTileList(container,data){
  container.innerHTML="";
  data.forEach(item=>{
    const span=document.createElement("span");
    span.className="tile-chip"+(item.open?" open":"")+(item.red?" red":"");
    span.textContent=tileName(item.tile); container.appendChild(span);
  });
}

function selectMachine(machine){
  stopAllTimers();
  Object.assign(state,{
    machine,rolls:60,bonusTier:1,coins:0,finalReward:0,remainingPoints:0,
    bossTier:1,bossHp:60,defeatedBosses:0,tripleCount:0,singleMultiplier:1,
    spinning:false,finished:false,awaitingChoice:false,reelValues:[1,1,1],reelStopped:[true,true,true],
    mahjongGame:1,mahjongRolls:12,mahjongTotalScore:0,mahjongGameScore:0,
    mahjongHand:[],openPonTiles:[],redTiles:[],doraTiles:[],currentRedIndex:-1,pendingTriple:false,skipPonMode:false
  });
  if(machine==="yellow") state.remainingPoints=301;
  if(machine==="red") state.remainingPoints=501;
  if(machine==="brown") state.remainingPoints=666;
  if(machine==="mahjong"){
    state.doraTiles=[randomTile()];
    startMahjongGame();
  }
  els.machineName.textContent=rules[machine].name;
  els.machineButtons.forEach(b=>b.classList.toggle("selected",b.dataset.machine===machine));
  els.reels.forEach((r,i)=>{r.textContent=isMahjong()?tileName(state.reelValues[i]):state.reelValues[i];r.classList.toggle("tile-mode",isMahjong());r.classList.remove("spinning","red-dora");});
  hideChoice();
  setMessage("ゲーム開始",`${rules[machine].name}を選択しました。ROLLを押してください。`);
  updateDisplay();
}

function startMahjongGame(){
  state.mahjongRolls=12; state.mahjongGameScore=0; state.openPonTiles=[]; state.redTiles=[];
  const head=randomTile(); state.mahjongHand=[head,head];
  setMessage(`第${state.mahjongGame}ゲーム`,`雀頭は ${tileName(head)}・${tileName(head)}。12ロールで手牌を完成させてください。`);
}

function startRoll(){
  if(!state.machine||state.spinning||state.finished||state.awaitingChoice) return;
  if(isMahjong()){
    if(state.mahjongRolls<=0) return;
  } else {
    if(state.rolls<=0) return;
    state.rolls--;
  }
  state.spinning=true; state.reelStopped=[false,false,false]; state.finalReward=0; state.currentRedIndex=-1;
  els.reels.forEach((reel,index)=>{
    reel.classList.add("spinning"); reel.classList.remove("red-dora");
    state.reelTimers[index]=setInterval(()=>{
      const v=isMahjong()?randomTile():randomDie(); state.reelValues[index]=v;
      reel.textContent=isMahjong()?tileName(v):v;
    },70+index*12);
  });
  setMessage("回転中","3つのSTOPボタンを押してください。"); updateDisplay();
}

function stopReel(index){
  if(!state.spinning||state.reelStopped[index]) return;
  clearInterval(state.reelTimers[index]); state.reelTimers[index]=null;
  const v=isMahjong()?randomTile():randomDie(); state.reelValues[index]=v; state.reelStopped[index]=true;
  els.reels[index].textContent=isMahjong()?tileName(v):v; els.reels[index].classList.remove("spinning");
  if(state.reelStopped.every(Boolean)){state.spinning=false;judgeResult();}
  updateDisplay();
}

function stopAllTimers(){state.reelTimers.forEach((t,i)=>{if(t!==null){clearInterval(t);state.reelTimers[i]=null;}});}

function isSequence(v,target){return [...v].sort((a,b)=>a-b).join("")===target;}
function pairDamage(l,c,r){if(l===c)return r;if(l===r)return c;if(c===r)return l;return null;}

function judgeResult(){
  if(isMahjong()){ prepareMahjongChoice(); return; }
  const [l,c,r]=state.reelValues;
  const triple=l===c&&c===r, seq=isSequence(state.reelValues,"123")||isSequence(state.reelValues,"456");
  if(state.machine==="white") judgeWhite(l,c,r,triple,seq);
  else if(state.machine==="blue") judgeBlue(triple,seq);
  else if(["yellow","red","brown"].includes(state.machine)) judgeZeroOne(l,c,r,triple,seq);
  else if(state.machine==="purple") judgeBoss(l,c,r,triple,seq);
  if(!state.finished&&state.rolls<=0) finishGame("60ロール終了");
}

function judgeWhite(l,c,r,triple,seq){
  if(triple){const g=state.bonusTier*10;state.coins+=g;state.rolls+=20;state.bonusTier++;setMessage("トリプル！",`+20ロール、${fmt(g)}コイン、Bonus Tier +1`);}
  else if(seq){state.bonusTier++;setMessage("連番！","Bonus Tier +1");}
  else if(l===c){const g=l*r;state.coins+=g;setMessage("左・中央ペア",`${l} × ${r} = ${fmt(g)}コイン獲得`);}
  else setMessage("ハズレ","変化なし");
}
function judgeBlue(triple,seq){
  if(triple){finishGame("トリプル成立");}
  else if(seq){state.bonusTier++;setMessage("連番！","Bonus Tier +1");}
  else setMessage("ハズレ","変化なし");
}
function applyExactDamage(damage,clearCallback){
  if(damage>state.remainingPoints){setMessage("BURST",`${damage}ダメージは残りポイントを超えるため無効`);return;}
  state.remainingPoints-=damage;
  if(state.remainingPoints===0) clearCallback(); else setMessage("ダメージ",`${damage}ダメージ｜残り ${fmt(state.remainingPoints)}`);
}
function judgeZeroOne(l,c,r,triple,seq){
  if(seq){state.bonusTier++;setMessage("連番！","Bonus Tier +1（ダメージなし）");return;}
  const pd=pairDamage(l,c,r); const damage=triple?100:(pd??l+c+r);
  applyExactDamage(damage,()=>finishGame("ちょうど0でクリア"));
}
function judgeBoss(l,c,r,triple,seq){
  if(seq){state.bonusTier++;setMessage("連番！","Bonus Tier +1（ダメージなし）");return;}
  let role="シングル"; let damage;
  if(triple){damage=100;role="トリプル";state.tripleCount++;state.singleMultiplier=1+Math.floor(state.tripleCount/6);}
  else {const pd=pairDamage(l,c,r);if(pd!==null){damage=pd;role="ペア";}else damage=(l+c+r)*state.singleMultiplier;}
  if(damage>state.bossHp){setMessage("BURST",`${damage}ダメージはBoss HPを超えるため無効`);return;}
  state.bossHp-=damage;
  if(state.bossHp===0) defeatBoss(damage,role); else setMessage(role,`${damage}ダメージ｜Boss HP ${fmt(state.bossHp)}`);
}
function defeatBoss(damage,role){
  state.defeatedBosses++;
  if(state.bossTier>=13){state.finalReward=state.defeatedBosses*state.bonusTier*6000;state.finished=true;setMessage("完全クリア！",`Tier13撃破｜報酬 ${fmt(state.finalReward)}コイン`);return;}
  state.bossTier++;state.bossHp=BOSS_HP[state.bossTier-1];state.rolls+=60;
  setMessage("ボス撃破！",`${role} ${damage}ダメージ｜+60ロール｜次はTier ${state.bossTier}`);
}

function prepareMahjongChoice(){
  const [a,b,c]=state.reelValues;
  state.pendingTriple=a===b&&b===c;
  state.currentRedIndex=(a===c&&a!==b)?1:-1;
  els.reels.forEach((r,i)=>r.classList.toggle("red-dora",i===state.currentRedIndex));
  state.awaitingChoice=true; state.skipPonMode=false;
  els.tileChoicePanel.classList.remove("hidden");
  els.ponActions.classList.toggle("hidden",!state.pendingTriple);
  els.tileChoiceButtons.forEach((btn,i)=>{
    btn.textContent=tileName(state.reelValues[i])+(i===state.currentRedIndex?"（赤）":"");
    btn.classList.toggle("red",i===state.currentRedIndex);
    btn.disabled=state.pendingTriple;
  });
  setMessage(state.pendingTriple?"トリプル！":"牌を選択",state.pendingTriple?"鳴くか、鳴かないを選択してください。":"取得する牌を1枚選んでください。");
}
function hideChoice(){els.tileChoicePanel.classList.add("hidden");els.ponActions.classList.add("hidden");state.awaitingChoice=false;}

function chooseTile(index){
  if(!state.awaitingChoice||state.pendingTriple&&!state.skipPonMode) return;
  const tile=state.reelValues[index];
  const handIndex=state.mahjongHand.length;
  state.mahjongHand.push(tile);
  if(index===state.currentRedIndex) state.redTiles.push(handIndex);
  state.mahjongRolls-=1;
  hideChoice();
  setMessage("牌を取得",`${tileName(tile)}${index===state.currentRedIndex?"（赤ドラ）":""}を取得しました。`);
  afterMahjongAcquire();
}
function choosePon(){
  if(!state.awaitingChoice||!state.pendingTriple||state.mahjongRolls<3) return;
  const tile=state.reelValues[0];
  state.openPonTiles.push(tile);
  state.mahjongHand.unshift(tile,tile,tile);
  state.doraTiles.push(tile);
  state.mahjongRolls-=3;
  hideChoice();
  setMessage("ポン！",`${tileName(tile)}を3枚取得し、追加ドラにしました。`);
  afterMahjongAcquire();
}
function skipPon(){
  state.skipPonMode=true;
  els.ponActions.classList.add("hidden");
  els.tileChoiceButtons.forEach(b=>b.disabled=false);
  setMessage("鳴かない","通常通り1枚選択してください。");
}
function afterMahjongAcquire(){
  if(state.mahjongRolls<=0||state.mahjongHand.length>=14){
    while(state.mahjongHand.length>14) state.mahjongHand.pop();
    scoreMahjongGame();
  }
  updateDisplay();
}

function countTiles(tiles){const c=Array(34).fill(0);tiles.forEach(t=>c[t]++);return c;}
function isHonor(t){return t>=27;}
function isTerminal(t){return t<27&&t%9===0||t<27&&t%9===8;}
function isYaochu(t){return isHonor(t)||isTerminal(t);}
function suitOf(t){return t<9?0:t<18?1:t<27?2:3;}
function rankOf(t){return t%9+1;}

function findStandardDecompositions(tiles){
  const results=[]; const counts=countTiles(tiles);
  for(let p=0;p<34;p++){
    if(counts[p]<2) continue;
    counts[p]-=2;
    const melds=[];
    searchMelds(counts,melds,results,p);
    counts[p]+=2;
  }
  return results;
}
function searchMelds(counts,melds,results,pair){
  let i=counts.findIndex(v=>v>0);
  if(i===-1){results.push({pair,melds:[...melds]});return;}
  if(counts[i]>=3){
    counts[i]-=3;melds.push({type:"triplet",tile:i});searchMelds(counts,melds,results,pair);melds.pop();counts[i]+=3;
  }
  if(i<27&&rankOf(i)<=7&&counts[i+1]>0&&counts[i+2]>0&&suitOf(i)===suitOf(i+2)){
    counts[i]--;counts[i+1]--;counts[i+2]--;melds.push({type:"sequence",tile:i});
    searchMelds(counts,melds,results,pair);melds.pop();counts[i]++;counts[i+1]++;counts[i+2]++;
  }
}
function isChiitoi(tiles){const c=countTiles(tiles);return c.filter(x=>x===2).length===7;}
function isKokushi(tiles){
  const req=[0,8,9,17,18,26,27,28,29,30,31,32,33],c=countTiles(tiles);
  return req.every(i=>c[i]>=1)&&req.some(i=>c[i]>=2)&&tiles.every(i=>req.includes(i));
}
function allTilesFromDecomp(d){return [d.pair,d.pair,...d.melds.flatMap(m=>m.type==="triplet"?[m.tile,m.tile,m.tile]:[m.tile,m.tile+1,m.tile+2])];}

function evaluateDecomp(d,closed){
  const y=[]; let han=0; const tiles=allTilesFromDecomp(d);
  const seq=d.melds.filter(m=>m.type==="sequence"), tri=d.melds.filter(m=>m.type==="triplet");
  const allSimple=tiles.every(t=>!isYaochu(t));
  if(closed){y.push(["門前清自摸",1]);han++;}
  if(allSimple){y.push(["タンヤオ",1]);han++;}
  const yakuhai=tri.filter(m=>m.tile>=31).length;
  if(yakuhai){y.push([`役牌×${yakuhai}`,yakuhai]);han+=yakuhai;}
  if(seq.length===4&&closed&&!isYaochu(d.pair)){
    y.push(["平和",1]);han++;
  }
  if(closed){
    const starts=seq.map(m=>m.tile);
    let iipei=false;
    for(const s of starts) if(starts.filter(x=>x===s).length>=2) iipei=true;
    if(iipei){y.push(["一盃口",1]);han++;}
  }
  if(tri.length===4){y.push(["対々和",2]);han+=2;}
  if(closed&&tri.length>=3){y.push(["三暗刻",2]);han+=2;}
  for(let r=0;r<=6;r++){
    if([0,9,18].every(base=>seq.some(m=>m.tile===base+r))){y.push(["三色同順",closed?2:1]);han+=closed?2:1;break;}
  }
  for(const base of [0,9,18]){
    if([base,base+3,base+6].every(s=>seq.some(m=>m.tile===s))){y.push(["一気通貫",closed?2:1]);han+=closed?2:1;break;}
  }
  const everyGroupYaochu=d.melds.every(m=>m.type==="triplet"?isYaochu(m.tile):(rankOf(m.tile)===1||rankOf(m.tile)===7))&&isYaochu(d.pair);
  if(everyGroupYaochu){
    const hasHonor=tiles.some(isHonor),hasSeq=seq.length>0;
    if(hasSeq&&!hasHonor){y.push(["純全帯幺九",closed?3:2]);han+=closed?3:2;}
    else if(hasSeq){y.push(["混全帯幺九",closed?2:1]);han+=closed?2:1;}
  }
  if(tiles.every(isYaochu)&&tri.length===4){y.push(["混老頭",2]);han+=2;}
  if(tri.filter(m=>m.tile>=31).length===2&&d.pair>=31){y.push(["小三元",2]);han+=2;}
  const suits=new Set(tiles.filter(t=>t<27).map(suitOf)),hasHonor=tiles.some(isHonor);
  if(suits.size===1){
    if(hasHonor){y.push(["混一色",closed?3:2]);han+=closed?3:2;}
    else{y.push(["清一色",closed?6:5]);han+=closed?6:5;}
  }
  return {han,y};
}
function yakumanCheck(tiles,decomps,closed){
  const c=countTiles(tiles),ys=[];
  if(isKokushi(tiles)) ys.push("国士無双");
  if(c[31]>=3&&c[32]>=3&&c[33]>=3) ys.push("大三元");
  if(tiles.every(isHonor)) ys.push("字一色");
  if(tiles.every(isTerminal)) ys.push("清老頭");
  if(c.slice(27,31).filter(x=>x>=3).length===4) ys.push("大四喜");
  else if(c.slice(27,31).filter(x=>x>=3).length===3&&c.slice(27,31).some(x=>x===2)) ys.push("小四喜");
  if(closed&&decomps.some(d=>d.melds.every(m=>m.type==="triplet"))) ys.push("四暗刻");
  return ys;
}
function scoreMahjongHand(){
  const tiles=[...state.mahjongHand].sort((a,b)=>a-b);
  const closed=state.openPonTiles.length===0;
  const decomps=findStandardDecompositions(tiles);
  const yakuman=yakumanCheck(tiles,decomps,closed);
  if(yakuman.length) return {han:13*yakuman.length,yaku:yakuman.map(x=>[x,13]),yakuman:true};
  let best={han:0,yaku:[]};
  if(closed&&isChiitoi(tiles)) best={han:2+(closed?1:0),yaku:[["七対子",2],["門前清自摸",1]]};
  for(const d of decomps){const r=evaluateDecomp(d,closed);if(r.han>best.han)best=r;}
  const yakuHan=best.han;
  if(yakuHan===0) return {han:0,yaku:[],yakuman:false};
  let dora=0;
  for(const t of tiles) dora+=state.doraTiles.filter(d=>d===t).length;
  dora+=state.redTiles.length;
  const yaku=[...best.yaku];
  if(dora>0)yaku.push([`ドラ・赤ドラ`,dora]);
  return {han:yakuHan+dora,yaku,yakuman:false};
}
function scoreMahjongGame(){
  const result=scoreMahjongHand();
  state.mahjongGameScore=result.han*1000;
  state.mahjongTotalScore+=state.mahjongGameScore;
  const list=result.yaku.length?result.yaku.map(([n,h])=>`${n} ${h}翻`).join("、"):"役なし";
  setMessage(`第${state.mahjongGame}ゲーム終了`,`${list}\n${result.han}翻 × 1,000 = ${fmt(state.mahjongGameScore)}点`);
  if(state.mahjongGame>=5){
    state.finished=true;state.finalReward=state.mahjongTotalScore;
    setMessage("魔界雀 終了",`${list}\n5ゲーム合計 ${fmt(state.mahjongTotalScore)}点`);
  } else {
    state.mahjongGame++;
    window.setTimeout(()=>{startMahjongGame();updateDisplay();},1200);
  }
}

function finishGame(reason){
  stopAllTimers();state.spinning=false;state.finished=true;
  if(state.machine==="white")state.finalReward=state.coins*state.bonusTier*100;
  else if(state.machine==="blue")state.finalReward=state.bonusTier*state.rolls*1000;
  else if(state.machine==="yellow")state.finalReward=state.remainingPoints===0?state.bonusTier*10000:0;
  else if(state.machine==="red")state.finalReward=state.remainingPoints===0?state.bonusTier*100000:0;
  else if(state.machine==="brown")state.finalReward=state.remainingPoints===0?state.bonusTier*1000000:0;
  else if(state.machine==="purple")state.finalReward=state.defeatedBosses*state.bonusTier*6000;
  setMessage("ゲーム終了",`${reason}｜最終報酬 ${fmt(state.finalReward)}コイン`);updateDisplay();
}
function retire(){if(!state.machine||state.finished)return;if(state.machine==="blue"||isMahjong()){state.finalReward=0;state.finished=true;setMessage("リタイア","報酬なし");updateDisplay();}else finishGame("リタイア");}
function openRules(){const r=rules[state.machine]||{name:"ルール",html:"<p>先に台を選択してください。</p>"};els.ruleTitle.textContent=r.name;els.ruleContent.innerHTML=r.html;els.ruleDialog.showModal();}
function closeRules(){els.ruleDialog.close();}

els.machineButtons.forEach(b=>{b.disabled=false;b.addEventListener("click",()=>selectMachine(b.dataset.machine));});
els.rollButton.addEventListener("click",startRoll);
els.stopButtons.forEach((b,i)=>b.addEventListener("click",()=>stopReel(i)));
els.retireButton.addEventListener("click",retire);
els.restartButton.addEventListener("click",()=>state.machine&&selectMachine(state.machine));
els.ruleButton.addEventListener("click",openRules);
els.closeRuleButton.addEventListener("click",closeRules);
els.ruleDialog.addEventListener("click",e=>{if(e.target===els.ruleDialog)closeRules();});
els.tileChoiceButtons.forEach((b,i)=>b.addEventListener("click",()=>chooseTile(i)));
els.ponButton.addEventListener("click",choosePon);
els.skipPonButton.addEventListener("click",skipPon);
updateDisplay();
