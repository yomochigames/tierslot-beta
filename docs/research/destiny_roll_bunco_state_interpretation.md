# Destiny Roll System研究資料 — Bunco（バンコ）研究から得た知見

> **資料種別：研究資料**。Buncoの原典ルール、TierSlotへの応用、DRの一般化仮説を区別して記録する。

## 1. 研究目的

BuncoをTierSlotへそのまま移植することではなく、「同じ3D6の結果でも、現在のゲーム状態によって価値や意味をどのように変化させられるのか」を研究し、Destiny Roll System（DR）の設計知識として蓄積することを目的とした。

前回のSic Bo研究は「1回のRollから何を読み取れるか」という **Feature Extraction**。今回のBunco研究は「抽出したFeatureを、現在のGame Stateによってどう解釈するか」という構造を研究した。

## 2. Buncoの基本構造

BuncoはD6を3個使用するダイスゲーム。基本的にRound 1 → 2 → 3 → 4 → 5 → 6と進行する。

**現在のRound番号そのものがTarget Numberになる。**

| Round | Target |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 6 |

同じ3D6でも現在のRoundによって得点が変化する。

## 3. 基本的な得点構造

現在のTargetをTとすると、一般的なBuncoでは：

- Targetが1個 → 1点
- Targetが2個 → 2点
- Targetが3個 → BUNCO → 21点
- Targetではない数字のTriple → 特殊得点（一般的なルールでは5点）
- その他 → 0点

小成功（Target×1）→ 中成功（Target×2）→ 特殊役（Non-Target Triple）→ 大成功（Target Triple / BUNCO）という自然な役の階層が存在する。

## 4. 3D6の確率

全結果：6 × 6 × 6 = **216通り**。

特定Targetについて：

| 結果 | 通り数 | 確率 |
|---|---:|---:|
| Target 0個 | 125/216 | 約57.87% |
| Target 1個 | 75/216 | 約34.72% |
| Target 2個 | 15/216 | 約6.94% |
| Target 3個 | 1/216 | 約0.463% |

Non-Target Tripleを特殊得点として分離すると：

| 得点分類 | 通り数 | 確率 |
|---|---:|---:|
| 0点 | 120/216 | 約55.56% |
| Target ×1 | 75/216 | 約34.72% |
| Target ×2 | 15/216 | 約6.94% |
| Non-Target Triple | 5/216 | 約2.315% |
| BUNCO | 1/216 | 約0.463% |

## 5. Buncoの重要な特徴

Roundが変わっても3D6の確率分布は一切変化しない。Round 1の111、Round 2の222、…、Round 6の666はいずれも1/216。

**変化しているのは確率ではなく、216通りの結果のうち現在どこに価値を与えるか。**

## 6. 同じRollでもStateによって意味が変わる

例：Roll＝**2・2・5**。

Featureは固定：
- Count(2) = 2
- Count(5) = 1
- Multiplicity = Pair
- Pair Number = 2
- Unmatched Number = 5

しかし、
- Round 1 / Target 1 → 0点
- Round 2 / Target 2 → 2点
- Round 5 / Target 5 → 1点

**Raw RollもFeatureも同じなのに、Game StateによってGame Resultが変化する。**

## 7. Sic Bo研究との違い

Sic Bo研究：**Feature Extraction**＝「このRollから何を読み取れるか」。

3D6から抽出できるもの：
- Raw Value
- Sum
- Range
- Parity
- Multiplicity
- Pair Number
- Unmatched Number
- Count
- Contains
- Combination
- Position
- Min / Max
- Spread
- Sequence
- Difference

AND / OR / NOT / Priority / SimultaneousでFeatureを組み合わせられる。

Bunco研究：**State-dependent Interpretation**＝「そのFeatureは、今のゲーム状態では何を意味するのか」。

- Sic Bo：Roll → Feature
- Bunco：Roll → Feature → State → Interpretation

## 8. 新しい設計概念：Game State / Context

Roll由来Featureとは別に **State-derived Parameter** を持てる。

例：Current Round / Current Target / Current Stage / Current Phase / Current Objective。

BuncoではCurrent Round = 4 → Current Target = 4として、固定の `Count(4)` ではなく動的な `Count(CurrentTarget)` を参照できる。

## 9. Destiny Roll Systemの構造拡張

Sic Bo研究段階：

```text
3D6
↓
Feature Extraction
↓
Condition Logic
↓
Game Interpretation
↓
Game Result
```

Bunco研究による拡張案：

```text
3D6
↓
Feature Extraction
↓
Game State / Context
↓
State-dependent Condition Logic
↓
Game Interpretation
↓
Game Result
```

**Game Stateを変更しても3D6そのものを変更する必要がない。**

## 10. Stateによって変更できるもの

Buncoは主にTargetを変更するが、DRへの一般化ではTarget / Threshold / Multiplier / Priority / Meaning / Objectiveなども候補。

同じFeatureでもStateにより参照対象・成立条件・価値・意味を変更できる可能性がある。

## 11. BuncoとTierSlotのテンポ面での相性

Buncoには基本的にダイスLOCK、一部振り直し、毎Rollの役選択、毎RollのTarget選択がない。

**Roll → 即判定 → 次Roll** を維持でき、Round 1 → 2 → 3…というState変更も自動化可能。

プレイヤーの操作量を増やさずゲーム状況だけを変化させられる。TierSlotのシンプルなRoll判定とも一致する。

関連資料：`TierSlot設計思想.txt`。

## 12. Buncoのスロット的に優れている部分

Round 4なら「4が来い」という期待が自然に生まれる。

Target×1 → 小成功、Target×2 → より強い成功、Target×3 → BUNCO。

リールを順番に停止すると **4 → 44 → 444** の「期待 → リーチ → 大当たり」に近い段階を作れる。

TierSlotのリール停止時の高揚を重視する感情設計とも一致する。

関連資料：`TierSlot感情の設計書.txt`。

## 13. 「6」というTierSlotテーマとの親和性

Buncoは3D6、Target 1～6、Round 1～6を持ち、最終RoundのBUNCOは666。

Round 1 → 111、Round 2 → 222、Round 3 → 333、Round 4 → 444、Round 5 → 555、Round 6 → 666。

666を無理に特殊役として追加せず、Buncoの原理から最終Targetが666になる。

## 14. 新概念候補：Cyclic State

**Bunco原典そのものではなく、DRへの応用可能性として発見した概念。**

通常のStage Progression：1 → 2 → 3 → 4 → 5 → 6 → END。

Cyclic State：**1 → 2 → 3 → 4 → 5 → 6 → 1へ戻る**。

3D6の確率空間を変えず、Stateだけを循環させ、Targetを永久に変化させ続けられる。

## 15. Buncoの弱点

- 意思決定が少なく、純粋な1人用ゲームでは単調になりやすい。
- Round 1でも6でもTarget成立確率は同じ。**Round Progression ≠ Difficulty Progression**。
- 原典の面白さにはチーム、対戦、テーブル移動、パートナー変更、BUNCO時の盛り上がりといったSocial Game要素も大きい。

**完成ゲームとしてのBunco**と**State-dependent Dice Interpretationという設計技術**は分離して評価する。

## 16. Sic Bo研究とBunco研究を統合したDR理解

Sic Bo：Feature Extraction＝「1回のRollには、見た目以上に大量の情報が存在する。」

Bunco：State-dependent Interpretation＝「その情報の価値や意味は固定である必要がない。」

統合すると、3D6という小さな乱数空間から多数のFeatureを抽出し、Game Stateによって意味を動的に変更できる。

## 17. Destiny Roll Systemへの持ち帰り

**State / Context：** 現在のゲーム状態を判定へ入力。

**State Parameter：** Current Target、Current Round、Current Stage、Current Phase、Current Objective。

**State-dependent Condition：** 固定値ではなくStateを参照する条件。
- `Contains(CurrentTarget)`
- `Count(CurrentTarget)`
- `TripleNumber == CurrentTarget`

**State-dependent Interpretation：** 同じRoll／FeatureでもStateによって異なるGame Resultへ変換。

**Cyclic State：** Stateを循環させ、同じ3D6でゲーム状況を永久に変化させる。

## 18. 現時点でのDestiny Roll System仮説

> 1～6の3出目を共通入力とし、3D6から複数の特徴量を抽出・組み合わせ、現在のゲーム状態を加味して、それらを各ゲーム固有の意味へ変換するゲームシステム。

処理モデル：

```text
3D6 / Raw Roll
↓
Feature Extraction
↓
Game State / Context
↓
Condition Logic
↓
Game Interpretation
↓
Game Result
```

## 19. Bunco研究の結論

本質はTargetが1～6に変わること自体ではなく、**同じ乱数空間・同じRoll・同じFeatureでもGame Stateによって価値と意味を変化させられる**こと。

Sic Boは3D6を「空間的」に広げる研究、Buncoは「状態・進行方向」に広げる研究。

State変更は追加操作を必要とせず、**Roll → 即判定 → 次Roll** のテンポを維持できる。

## 研究成果まとめ

**Sic Bo：** 3D6 → 多数のFeatureを抽出 → 「Rollをどう読むか」

**Bunco：** Feature ＋ Game State → 意味を動的に変更 → 「今、そのRollをどう読むか」

**Destiny Roll System：**

> Rollには多数の読み方があり、その読み方の価値さえGame Stateによって変化させられる。

これをBunco研究からDRへ持ち帰る主要成果とする。
