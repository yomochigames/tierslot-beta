# TierSlot / イシス台 Floos（Money）初期プロット

> **ステータス：初期プロット。未確定事項は未確定のまま保持する。**

## モチーフ

- ゲーム名：Floos（فلوس / Money）
- 地域：エジプト
- ジャンル：カード / Match / Collection

TierSlotでの中核：

> 数字札を交互に公開し、同じ数字が連続したらMATCH。MATCH成立時にMoney Cardを獲得し、ゲーム終了時にMoneyを得点化する。

## 原作から残す要素

原作Floosでは、
- 数字札を裏向きの山札から順番に公開
- プレイヤーは出す数字札を選択しない
- Player / Opponentが交互にカードを出す
- 直前の数字札と同じ数字が出るとMATCH
- MATCHした側が場札を獲得
- K / Q / Jは「Money」として扱われる

という構造を持つ。

TierSlot版では「MATCHによる場札Capture」を「MATCHによるMoney Card獲得」へ変換する。

## 使用カード

カード抽選はリールとは独立。「リール ≠ カード」方式を採用。

### 数字札Deck

- A～10の数字札を使用。
- Player / CPU用の数字札Deckを用意する。
- 数字札は基本的に山札上から強制Draw。
- プレイヤーによるカード選択なし。

### Money Deck

Player / CPU共通の有限Deck。

初期案：
- Q ×4
- K ×4
- J ×4

合計12枚。

Money価値：
- Q = 5 MONEY
- K = 10 MONEY
- J = 15 MONEY

※原作Floosで確認されるMoney価値の一例をベースとする。

## 基本ゲーム進行

GAME START
↓
数字札Deckをシャッフル
↓
共通Money Deckをシャッフル
↓
数字札を交互にOPEN
↓
場札のTOPと比較
↓
一致しなければ場へ追加
↓
次のカードをOPEN
↓
同じ数字が連続したらMATCH！
↓
MATCHを成立させた側が共通Money Deckから1枚DRAW
↓
獲得したMoney Cardを保存
↓
場札をRESET
↓
次の数字札から再開
↓
規定Roll / 規定カード数終了
↓
獲得Moneyを精算
↓
PAYOUT

## MATCH判定

判定対象は「直前に公開された数字札」と「今回公開された数字札」。

例：3 → 8 → 2 → 6 → 6

最後の **6 → 6** でMATCH成立。

過去の場札の中に同じ数字が存在するだけではMATCHにならない。

## Money Card獲得

MATCH成立時、共通Money DeckからMoney Cardを1枚DRAW。

例：MATCH！ → Money Deck DRAW → J → +15 MONEY

獲得したMoney CardはPlayer / CPUそれぞれの獲得エリアへ移動。

画面イメージ：

```text
PLAYER MONEY

[Q] [J] [K] [J]

5 + 15 + 10 + 15

= 45 MONEY
```

## 共通Money Deck

Money DeckはPlayer / CPU共通の有限Deck。

開始時：Q Q Q Q / K K K K / J J J J、合計12枚。

PlayerがJを獲得した場合、残りはQ ×4 / K ×4 / J ×3となる。

そのためゲーム進行によってMoney Deckの期待値が変化する。

Money Deck残数をプレイヤーへ表示するかは未確定。

## 場札

MATCHしない限り、数字札は場へ蓄積する。

例：[3] → [3][8] → [3][8][2] → [3][8][2][6] → 6 → **6 → 6 MATCH！**

MATCH成立後、場札をRESET。

原作ではMATCHしたプレイヤーが場札をすべてCaptureする。

TierSlot版では場札そのものを直接Coin化するのではなく、**MATCH → Money Card獲得**という形へ変換する。

## 場札枚数の扱い

初期仕様では「場札枚数 × Money」は採用しない。

理由：
- RTPが大きく暴れる可能性
- Money Card Drawだけでも二段階抽選として成立する
- 初期仕様をシンプルに保つ

将来の調整候補として「場札枚数 × Money Card」による倍率方式は残しておく。

例：場札8枚 × K = 10 → 80 SCORE

ただし初期プロットでは未採用。

## 最終得点

規定Roll終了時、Playerが獲得したMoney Cardを合計。

例：Q / J / K / J → 5 + 15 + 10 + 15 = **45 MONEY**

45 MONEYを基礎として最終PAYOUTを計算。

具体的なMONEY → Coin変換倍率、BET補正、Machine Tier補正については未確定。

## CPU

CPUもPlayerと同じルールで数字札をOPENする。

CPU側でMATCHした場合、CPUがMoney Cardを獲得。

例：
- Player：[Q][K]
- CPU：[J][Q][J]

双方がMoneyを蓄積する。

最終的に「Player Money vs CPU Money」で勝敗を決める方式も検討可能。

ただし「Playerが獲得したMoneyをそのまま払い出す」方式も候補。

**勝敗制にするか、獲得報酬制にするかは未確定。**

## Destiny Rollとの関係

カード抽選とリールは独立。

リールは通常のDestiny Roll判定を担当。

- Triple：111～666 → Machine Tier育成対象。
- 123 / 456：Floos固有効果を設定するかは未確定。

Floos本体はカードゲームとして成立するため、DRを無理にカードRankへ変換しない。

## プレイヤー裁量

基本的になし。

- 数字札：山札TOPから強制Draw。
- Money Card：共通DeckからランダムDraw。

したがって基本操作は **ROLLのみ**。

ゲーム進行：Roll → Card OPEN → MATCH判定 → Money Draw → 次Roll

TierSlotの基本テンポを維持する。

## ゲームの期待ポイント

- 通常時：「次のカードがTOPと一致するか？」
- MATCH：「Money Cardを引ける！」
- Money Draw：「Qか？ Kか？ Jか？」
- ゲーム終盤：「どれだけMoneyを集められたか？」

二段階の期待構造を持つ。

**MATCH → MONEY DRAW** の流れをゲームの主要演出とする。

## 現時点で未確定

- BET
- 規定Roll数
- Player / CPUの数字札Deck構成
- Money Deckを12枚有限にするか
- Money Deck枯渇時の処理
- Player / CPU対戦形式にするか
- 獲得Money直接払い出し形式にするか
- MONEY → Coin換算
- Machine Tier補正
- 123 / 456の固有効果
- Tripleの固有効果
- 場札枚数を報酬へ利用するか
- Money CardのCollection Bonus
- Q/K/Jの最終Score

## 初期設計方針

Floos原作の、
- 「カードを選べない」
- 「数字札を交互にOPEN」
- 「同じ数字が連続するとMATCH」
- 「K/Q/JがMoneyとして存在する」

という特徴を利用する。

TierSlot版では原作の **MATCH → 場札Capture** を **MATCH → Money Card Draw** へ変換。

これにより **Match × Finite Money Deck × Collection** を中核とする。

## イシス6台構想

1. Senet — Race / Goal
2. Tâb — Running Combat / Elimination
3. Basra — Fishing / Sum Capture / Sweep
4. Egyptian Mancala — Sowing / Chain / Capture
5. Estimation — Exact Trick Target
6. Floos — Match / Money Draw / Collection

6台すべて異なるゲーム構造を持たせる方向。
