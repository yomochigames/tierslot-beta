"use strict";

const BOSS_HP = [60, 120, 180, 240, 300, 360, 420, 480, 540, 666, 777, 888, 999];

const state = {
  machine: null,
  rolls: 60,
  bonusTier: 1,
  coins: 0,
  finalReward: 0,
  remainingPoints: 0,
  bossTier: 1,
  bossHp: 60,
  defeatedBosses: 0,
  tripleCount: 0,
  singleMultiplier: 1,
  spinning: false,
  finished: false,
  reelValues: [1, 1, 1],
  reelStopped: [true, true, true],
  reelTimers: [null, null, null]
};

const els = {
  machineName: document.getElementById("machineName"),
  rollsValue: document.getElementById("rollsValue"),
  tierValue: document.getElementById("tierValue"),
  progressLabel: document.getElementById("progressLabel"),
  progressValue: document.getElementById("progressValue"),
  subLabel: document.getElementById("subLabel"),
  subValue: document.getElementById("subValue"),
  rewardValue: document.getElementById("rewardValue"),
  resultTitle: document.getElementById("resultTitle"),
  resultMessage: document.getElementById("resultMessage"),
  rollButton: document.getElementById("rollButton"),
  retireButton: document.getElementById("retireButton"),
  restartButton: document.getElementById("restartButton"),
  machineButtons: [...document.querySelectorAll(".machine-button")],
  stopButtons: [...document.querySelectorAll(".stop-button")],
  reels: [
    document.getElementById("reel0"),
    document.getElementById("reel1"),
    document.getElementById("reel2")
  ],
  ruleButton: document.getElementById("ruleButton"),
  ruleDialog: document.getElementById("ruleDialog"),
  ruleTitle: document.getElementById("ruleTitle"),
  ruleContent: document.getElementById("ruleContent"),
  closeRuleButton: document.getElementById("closeRuleButton")
};

const rules = {
  white: {
    name: "白台（ATタイプ）",
    html: `<h3>基本</h3><p>60ロール、Bonus Tier 1で開始。残りロール0で終了。</p>
      <h3>123・456</h3><p>Bonus Tier +1。</p>
      <h3>左・中央ペア</h3><p>ペア数字 × 右数字のコインを獲得。</p>
      <h3>トリプル</h3><p>+20ロール、現在Tier×10コイン、その後Tier+1。</p>
      <h3>報酬</h3><p>獲得コイン × Bonus Tier ×100。</p>`
  },
  blue: {
    name: "青台（Aタイプ）",
    html: `<h3>基本</h3><p>60ロール、Bonus Tier 1で開始。トリプルまたはロール0で終了。</p>
      <h3>123・456</h3><p>Bonus Tier +1。</p>
      <h3>トリプル</h3><p>即ゲーム終了。</p>
      <h3>報酬</h3><p>Bonus Tier × 残りロール ×1000。リタイア報酬なし。</p>`
  },
  yellow: {
    name: "黄台（301）",
    html: zeroOneRuleHtml(301, "10,000")
  },
  red: {
    name: "赤台（501）",
    html: zeroOneRuleHtml(501, "100,000")
  },
  brown: {
    name: "茶台（666）",
    html: zeroOneRuleHtml(666, "1,000,000")
  },
  purple: {
    name: "紫台（BOSS RUSH）",
    html: `<h3>基本</h3><p>60ロールで開始。ボス撃破ごとに+60ロール。Tier13撃破で完全クリア。</p>
      <h3>ダメージ</h3><p>シングルは合計×Single倍率。ペアはペアでない数字。123・456はTier+1でダメージなし。トリプルは100。</p>
      <h3>成長</h3><p>トリプル6回ごとにSingle倍率+1。</p>
      <h3>報酬</h3><p>撃破Tier数 × Bonus Tier ×6,000コイン。</p>`
  }
};

function zeroOneRuleHtml(points, reward) {
  return `<h3>基本</h3><p>60ロール、残り${points}ポイント。ちょうど0でクリア。超過ダメージはバースト。</p>
    <h3>ダメージ</h3><p>シングルは3リール合計。ペアはペアでない数字。123・456はTier+1でダメージなし。トリプルは100。</p>
    <h3>報酬</h3><p>Bonus Tier × ${reward}コイン。</p>`;
}

function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function formatNumber(value) {
  return Number(value).toLocaleString("ja-JP");
}

function updateDisplay() {
  els.rollsValue.textContent = formatNumber(state.rolls);
  els.tierValue.textContent = formatNumber(state.bonusTier);
  els.rewardValue.textContent = formatNumber(state.finalReward);

  if (state.machine === "white") {
    els.progressLabel.textContent = "獲得コイン";
    els.progressValue.textContent = formatNumber(state.coins);
    els.subLabel.textContent = "終了条件";
    els.subValue.textContent = "ロール0";
  } else if (["yellow", "red", "brown"].includes(state.machine)) {
    els.progressLabel.textContent = "残りポイント";
    els.progressValue.textContent = formatNumber(state.remainingPoints);
    els.subLabel.textContent = "クリア条件";
    els.subValue.textContent = "ちょうど0";
  } else if (state.machine === "purple") {
    els.progressLabel.textContent = `Boss Tier ${state.bossTier}`;
    els.progressValue.textContent = state.finished && state.defeatedBosses >= 13 ? "CLEAR" : `${formatNumber(state.bossHp)} HP`;
    els.subLabel.textContent = `Triple ${state.tripleCount}`;
    els.subValue.textContent = `Single ×${state.singleMultiplier}`;
  } else if (state.machine === "blue") {
    els.progressLabel.textContent = "トリプル";
    els.progressValue.textContent = "即終了";
    els.subLabel.textContent = "終了条件";
    els.subValue.textContent = "ロール0";
  } else {
    els.progressLabel.textContent = "獲得コイン";
    els.progressValue.textContent = "0";
    els.subLabel.textContent = "補助情報";
    els.subValue.textContent = "-";
  }

  els.rollButton.disabled = !state.machine || state.spinning || state.finished;
  els.retireButton.disabled = !state.machine || state.spinning || state.finished;
  els.restartButton.disabled = !state.machine;
  els.stopButtons.forEach((button, index) => {
    button.disabled = !state.spinning || state.reelStopped[index];
  });
}

function setMessage(title, message) {
  els.resultTitle.textContent = title;
  els.resultMessage.textContent = message;
}

function selectMachine(machine) {
  stopAllTimers();
  state.machine = machine;
  state.rolls = 60;
  state.bonusTier = 1;
  state.coins = 0;
  state.finalReward = 0;
  state.remainingPoints = machine === "yellow" ? 301 : machine === "red" ? 501 : machine === "brown" ? 666 : 0;
  state.bossTier = 1;
  state.bossHp = BOSS_HP[0];
  state.defeatedBosses = 0;
  state.tripleCount = 0;
  state.singleMultiplier = 1;
  state.spinning = false;
  state.finished = false;
  state.reelValues = [1, 1, 1];
  state.reelStopped = [true, true, true];

  els.machineName.textContent = rules[machine].name;
  els.machineButtons.forEach(button => {
    button.classList.toggle("selected", button.dataset.machine === machine);
  });
  els.reels.forEach((reel, index) => {
    reel.textContent = state.reelValues[index];
    reel.classList.remove("spinning");
  });

  setMessage("ゲーム開始", `${rules[machine].name}を選択しました。ROLLを押してください。`);
  updateDisplay();
}

function startRoll() {
  if (!state.machine || state.spinning || state.finished || state.rolls <= 0) return;

  state.rolls -= 1;
  state.spinning = true;
  state.reelStopped = [false, false, false];
  state.finalReward = 0;

  els.reels.forEach((reel, index) => {
    reel.classList.add("spinning");
    state.reelTimers[index] = window.setInterval(() => {
      const value = randomDie();
      state.reelValues[index] = value;
      reel.textContent = value;
    }, 70 + index * 12);
  });

  setMessage("回転中", "3つのSTOPボタンを押してください。");
  updateDisplay();
}

function stopReel(index) {
  if (!state.spinning || state.reelStopped[index]) return;

  clearInterval(state.reelTimers[index]);
  state.reelTimers[index] = null;
  state.reelValues[index] = randomDie();
  state.reelStopped[index] = true;
  els.reels[index].textContent = state.reelValues[index];
  els.reels[index].classList.remove("spinning");

  if (state.reelStopped.every(Boolean)) {
    state.spinning = false;
    judgeResult();
  }

  updateDisplay();
}

function stopAllTimers() {
  state.reelTimers.forEach((timer, index) => {
    if (timer !== null) {
      clearInterval(timer);
      state.reelTimers[index] = null;
    }
  });
}

function isSequence(values, target) {
  return [...values].sort((a, b) => a - b).join("") === target;
}

function getPairDamage(left, center, right) {
  if (left === center && center !== right) return right;
  if (left === right && left !== center) return center;
  if (center === right && center !== left) return left;
  return null;
}

function judgeResult() {
  const [left, center, right] = state.reelValues;
  const isTriple = left === center && center === right;
  const isSequenceRole = isSequence(state.reelValues, "123") || isSequence(state.reelValues, "456");
  const pairDamage = getPairDamage(left, center, right);

  switch (state.machine) {
    case "white":
      judgeWhite(left, center, right, isTriple, isSequenceRole);
      break;
    case "blue":
      judgeBlue(isTriple, isSequenceRole);
      break;
    case "yellow":
    case "red":
    case "brown":
      judgeZeroOne(left + center + right, pairDamage, isTriple, isSequenceRole);
      break;
    case "purple":
      judgePurple(left + center + right, pairDamage, isTriple, isSequenceRole);
      break;
  }

  if (!state.finished && state.rolls <= 0) {
    finishGame("残りロール0");
  }
}

function judgeWhite(left, center, right, isTriple, isSequenceRole) {
  if (isTriple) {
    const gained = state.bonusTier * 10;
    state.coins += gained;
    state.rolls += 20;
    state.bonusTier += 1;
    setMessage("トリプル！", `+20ロール、${formatNumber(gained)}コイン、Bonus Tier +1`);
  } else if (isSequenceRole) {
    state.bonusTier += 1;
    setMessage("連番！", "Bonus Tier +1");
  } else if (left === center) {
    const gained = left * right;
    state.coins += gained;
    setMessage("左・中央ペア", `${left} × ${right} = ${formatNumber(gained)}コイン獲得`);
  } else {
    setMessage("ハズレ", "コイン・Tierの変化なし");
  }
}

function judgeBlue(isTriple, isSequenceRole) {
  if (isTriple) {
    finishGame("トリプル成立");
  } else if (isSequenceRole) {
    state.bonusTier += 1;
    setMessage("連番！", "Bonus Tier +1");
  } else {
    setMessage("ハズレ", "Tierの変化なし");
  }
}

function judgeZeroOne(singleDamage, pairDamage, isTriple, isSequenceRole) {
  if (isSequenceRole) {
    state.bonusTier += 1;
    setMessage("連番！", "Bonus Tier +1、ダメージなし");
    return;
  }

  const damage = isTriple ? 100 : pairDamage !== null ? pairDamage : singleDamage;
  const roleName = isTriple ? "トリプル" : pairDamage !== null ? "ペア" : "シングル";
  applyZeroOneDamage(damage, roleName);
}

function applyZeroOneDamage(damage, roleName) {
  if (damage > state.remainingPoints) {
    setMessage("バースト！", `${roleName} ${damage}ダメージは無効`);
    return;
  }

  state.remainingPoints -= damage;
  if (state.remainingPoints === 0) {
    finishGame(`${roleName}でちょうど0`);
  } else {
    setMessage(roleName, `${damage}ダメージ｜残り${formatNumber(state.remainingPoints)}ポイント`);
  }
}

function judgePurple(singleTotal, pairDamage, isTriple, isSequenceRole) {
  if (isSequenceRole) {
    state.bonusTier += 1;
    setMessage("連番！", "Bonus Tier +1、ダメージなし");
    return;
  }

  let damage;
  let roleName;

  if (isTriple) {
    damage = 100;
    roleName = "トリプル";
    state.tripleCount += 1;
    const newMultiplier = 1 + Math.floor(state.tripleCount / 6);
    if (newMultiplier > state.singleMultiplier) {
      state.singleMultiplier = newMultiplier;
      roleName += `｜Single ×${state.singleMultiplier}へ成長`;
    }
  } else if (pairDamage !== null) {
    damage = pairDamage;
    roleName = "ペア";
  } else {
    damage = singleTotal * state.singleMultiplier;
    roleName = `シングル ×${state.singleMultiplier}`;
  }

  state.bossHp -= damage;
  if (state.bossHp <= 0) {
    defeatBoss(damage, roleName);
  } else {
    setMessage(roleName, `${damage}ダメージ｜Boss HP ${formatNumber(state.bossHp)}`);
  }
}

function defeatBoss(damage, roleName) {
  state.defeatedBosses = state.bossTier;

  if (state.bossTier >= 13) {
    state.bossHp = 0;
    finishGame(`Tier13撃破！ ${roleName}で${damage}ダメージ`);
    return;
  }

  const defeatedTier = state.bossTier;
  state.rolls += 60;
  state.bossTier += 1;
  state.bossHp = BOSS_HP[state.bossTier - 1];
  setMessage(
    `Boss Tier ${defeatedTier} 撃破！`,
    `+60ロール｜次はTier ${state.bossTier}・HP ${formatNumber(state.bossHp)}`
  );
}

function calculateFinalReward() {
  switch (state.machine) {
    case "white":
      return state.coins * state.bonusTier * 100;
    case "blue":
      return state.bonusTier * state.rolls * 1000;
    case "yellow":
      return state.remainingPoints === 0 ? state.bonusTier * 10000 : 0;
    case "red":
      return state.remainingPoints === 0 ? state.bonusTier * 100000 : 0;
    case "brown":
      return state.remainingPoints === 0 ? state.bonusTier * 1000000 : 0;
    case "purple":
      return state.defeatedBosses * state.bonusTier * 6000;
    default:
      return 0;
  }
}

function finishGame(reason) {
  stopAllTimers();
  state.spinning = false;
  state.finished = true;
  state.finalReward = calculateFinalReward();
  setMessage("ゲーム終了", `${reason}｜最終報酬 ${formatNumber(state.finalReward)}コイン`);
  updateDisplay();
}

function retireGame() {
  if (!state.machine || state.finished || state.spinning) return;

  if (state.machine === "white" || state.machine === "purple") {
    finishGame("リタイア");
  } else {
    state.finalReward = 0;
    state.finished = true;
    setMessage("リタイア", "途中終了の報酬はありません。");
    updateDisplay();
  }
}

function openRules() {
  const machine = state.machine || "white";
  els.ruleTitle.textContent = rules[machine].name;
  els.ruleContent.innerHTML = rules[machine].html;
  els.ruleDialog.showModal();
}

els.machineButtons.forEach(button => {
  button.addEventListener("click", () => selectMachine(button.dataset.machine));
});

els.rollButton.addEventListener("click", startRoll);
els.stopButtons.forEach((button, index) => {
  button.addEventListener("click", () => stopReel(index));
});
els.retireButton.addEventListener("click", retireGame);
els.restartButton.addEventListener("click", () => selectMachine(state.machine));
els.ruleButton.addEventListener("click", openRules);
els.closeRuleButton.addEventListener("click", () => els.ruleDialog.close());

els.ruleDialog.addEventListener("click", event => {
  if (event.target === els.ruleDialog) els.ruleDialog.close();
});

updateDisplay();
