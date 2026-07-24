"use strict";

const state = {
  machine: null,
  rolls: 60,
  bonusTier: 1,
  coins: 0,
  finalReward: 0,
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
  coinsValue: document.getElementById("coinsValue"),
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
    html: `
      <h3>基本</h3>
      <ul><li>初期60ロール</li><li>Bonus Tierは1から開始</li><li>残りロール0で終了</li></ul>
      <h3>123・456（順不同）</h3><p>Bonus Tier +1</p>
      <h3>左・中央ペア</h3><p>ペアの数字 × 右の数字を獲得。ほかのペアはハズレ。</p>
      <h3>トリプル</h3><p>残りロール+20、現在Tier×10コイン、計算後にTier+1。</p>
      <h3>最終報酬</h3><p>獲得コイン × Bonus Tier × 100</p>`
  },
  blue: {
    name: "青台（Aタイプ）",
    html: `
      <h3>基本</h3>
      <ul><li>初期60ロール</li><li>Bonus Tierは1から開始</li><li>トリプルまたは60ロール消化で終了</li></ul>
      <h3>123・456（順不同）</h3><p>Bonus Tier +1</p>
      <h3>シングル・ペア</h3><p>ハズレ。</p>
      <h3>トリプル</h3><p>その場でゲーム終了。</p>
      <h3>最終報酬</h3><p>Bonus Tier × 残りロール × 1000</p>
      <p>リタイア報酬はありません。</p>`
  }
};

function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function updateDisplay() {
  els.rollsValue.textContent = state.rolls.toLocaleString("ja-JP");
  els.tierValue.textContent = state.bonusTier.toLocaleString("ja-JP");
  els.coinsValue.textContent = state.coins.toLocaleString("ja-JP");
  els.rewardValue.textContent = state.finalReward.toLocaleString("ja-JP");

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
  const sorted = [...values].sort((a, b) => a - b).join("");
  return sorted === target;
}

function judgeResult() {
  const [left, center, right] = state.reelValues;
  const isTriple = left === center && center === right;
  const is123 = isSequence(state.reelValues, "123");
  const is456 = isSequence(state.reelValues, "456");

  if (state.machine === "white") {
    judgeWhite(left, center, right, isTriple, is123 || is456);
  } else {
    judgeBlue(isTriple, is123 || is456);
  }

  if (!state.finished && state.rolls <= 0) {
    finishGame("60ロール終了");
  }
}

function judgeWhite(left, center, right, isTriple, isSequenceRole) {
  if (isTriple) {
    const gained = state.bonusTier * 10;
    state.coins += gained;
    state.rolls += 20;
    state.bonusTier += 1;
    setMessage("トリプル！", `+20ロール、${gained.toLocaleString("ja-JP")}コイン、Bonus Tier +1`);
    return;
  }

  if (isSequenceRole) {
    state.bonusTier += 1;
    setMessage("連番！", "Bonus Tier +1");
    return;
  }

  if (left === center) {
    const gained = left * right;
    state.coins += gained;
    setMessage("左・中央ペア", `${left} × ${right} = ${gained.toLocaleString("ja-JP")}コイン獲得`);
    return;
  }

  setMessage("ハズレ", "コイン・Tierの変化なし");
}

function judgeBlue(isTriple, isSequenceRole) {
  if (isTriple) {
    setMessage("トリプル！", "ゲーム終了です。");
    finishGame("トリプル成立");
    return;
  }

  if (isSequenceRole) {
    state.bonusTier += 1;
    setMessage("連番！", "Bonus Tier +1");
    return;
  }

  setMessage("ハズレ", "コイン・Tierの変化なし");
}

function finishGame(reason) {
  stopAllTimers();
  state.spinning = false;
  state.finished = true;

  if (state.machine === "white") {
    state.finalReward = state.coins * state.bonusTier * 100;
  } else {
    state.finalReward = state.bonusTier * state.rolls * 1000;
  }

  setMessage(
    "ゲーム終了",
    `${reason}｜最終報酬 ${state.finalReward.toLocaleString("ja-JP")}コイン`
  );
  updateDisplay();
}

function retireGame() {
  if (!state.machine || state.finished || state.spinning) return;

  if (state.machine === "blue") {
    state.finalReward = 0;
    state.finished = true;
    setMessage("リタイア", "青台は途中終了の報酬なしです。");
    updateDisplay();
    return;
  }

  finishGame("リタイア");
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
