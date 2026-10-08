# TierSlot 6店舗計画：中国・エジプト周辺ゲーム研究 持ち帰り資料

- **作成時点：2026-08-16**
- **資料区分：候補探索・初期仕様検討（当時の記録）**
- **注意：** 本資料の「未定」「候補」「未確定」は作成時点の記載。後日決定された個別仕様を上書きするものではない。

## 目的・基本方針

TierSlot / Destiny Roll System（DR）を利用した36台構想のうち、中国／リンリンとエジプト周辺／イシスの候補探索・初期仕様検討を実施。

- 1～3個のD6で成立するゲームを優先
- Roll → 即判定 → 次Roll のテンポを重視
- 振り直し中心のゲームは避ける
- 毎Rollプレイヤーに複雑な選択を要求しない
- カード／牌ゲームでは自動処理を積極的に使用
- 元ゲームの特徴をできるだけ残す
- ルール不明の古代ゲームを勝手に「復元」しない

## Destiny Roll Systemで追加された設計資産

### DR6
従来のDestiny Roll。3リールの結果から1～6の均等な結果を生成し、ゲーム固有の意味へ変換する。

### DR4 ★今回追加
3D6の全216通りを以下へ分類。

| DR4 | 対応数 | 確率 |
|---|---:|---:|
| 1 | 54通り | 25% |
| 2 | 54通り | 25% |
| 3 | 54通り | 25% |
| 4 | 54通り | 25% |

番攤（Fan-Tan）など4結果が必要なゲーム向け。四季、東西南北、4属性、4陣営、4択ゲームにも転用可能。

## 共通設計思想：「リール ≠ カード / 牌」

イヴ台のポーカーの考え方を展開する。

**リール：** Destiny Roll、Triple、123 / 456、Machine Tier、その他TierSlot固有判定を担当。

**カード・麻雀牌・中国骨牌：** ゲーム内部の独立RNG。必要なら有限Deckとし、Drawしたカード／牌はDeckから除外。

リール出目をカードに変換する必要はなく、ポーカー、牌九、中国式麻雀、Basra、Estimation等で本来のDeck構造を維持できる。

---

# 中国／リンリン候補

**当時の8候補：** 中国式麻雀、天九ダイス、456、番攤（Fan-Tan）、牌九（Pai Gow）、相十副（Xiang Shi Fu）、過五関（Guo Wu Guan）、K'ap Tái Shap 2人版。8候補から最終6台を選定予定。

## 中国式麻雀

ヨウコの日本式麻雀（リーチ・一発・ツモ・役満・当たり待ち）と差別化し、**Hand Building × Chinese Scoring Pattern × Flower Collection** を中核にする。

固定Roll制。牌はリールで生成せず内部牌山からDraw。

Roll → 麻雀牌Draw → 手牌へ自動追加 → 自動整理 → 次Roll。

4面子＋1雀頭を基本和了形として自動判定。捨て牌、鳴き、牌交換の選択を求めず、ゲーム側が最適Handを自動構築。

**中国式番種候補：** 碰碰和、清一色、混一色、七対、清龍、三色系、大三元、字牌系。採用番種・Scoreは未確定。

### 花牌システム ★重要
123 / 456（順不同）は通常のBT+1ではなく「花牌獲得イベント」。

- 123：四季牌（春・夏・秋・冬）
- 456：四君子牌（梅・蘭・菊・竹）

123または456：12 / 216 = 1 / 18 ≒ 5.56%。

花牌は通常手牌に入れず専用Collectionに表示。

**Bonus初期案：** 1枚で小Bonus／Score、春夏秋冬完成でSEASON BONUS、梅蘭菊竹完成でFLOWER BONUS、8花完成で超上位Bonus。

**未確定：** 重複の可否、ゲーム間持ち越し、1枚ごとの具体的報酬。

Triple（111～666）は共通MT育成。中国麻雀固有Triple効果は未確定。

## 牌九 / Pai Gow

中国骨牌32枚の伝統ゲーム。

本家はPlayer／Bankerが各4牌をLow Hand（2牌）とHigh Hand（2牌）に分割。Low vs Low、High vs Highを比較。

- 2勝：WIN
- 1勝1敗：PUSH
- 0勝：LOSE

Pair、Wong、Gong、0～9 Point、Gee Joon、牌固有ランキング等が存在。

**TierSlot初期案：** リール ≠ 骨牌。内部32牌有限Deck。Roll 1～4で双方へ各4牌を配り、Roll 5でSHOWDOWN、8牌一斉OPEN。CPUがHouse Way等を利用してLow／Highへ自動分割。LOW BATTLE → HIGH BATTLE → 最終結果。プレイヤーは分割しない。

**個性：** LowとHighの両方を勝たせるDual-Hand Battle。

## K'ap Tái Shap / K'ap Shap

中国骨牌を使うラミー系。2人版K'ap Shapを中心に検討。

**完成Hand：** 8牌＝眼×1組＋10／20 Pair×3組。

眼＝完全に同一の牌2枚。残りは2牌合計が10または20になるCombination。

例：8+2、7+3、6+4、5+5＝10。12+8、11+9、10+10＝20。[4-2]牌には特殊扱いが存在。

**TierSlot初期案：** 複数Rollで骨牌獲得。CPUが最適Pair構成を自動探索。

```text
眼　　[COMPLETE]
十　　[COMPLETE]
十　　[COMPLETE]
二十　[----]
```

固定Roll終了時、完成8牌Handまたは完成Pair数で報酬。

**個性：** Complement Pair Building。「あと3が来れば10」という直感的な待ち。中国式麻雀とは別のHand Building。

## 番攤 / Fan-Tan

大量の物体を4個ずつ除去し、最後に残る1／2／3／4を結果とする伝統賭博。

**TierSlot案：** DR4で1～4を完全25%ずつ出力 → 番攤結果 → 報酬判定。DR4という共通システム導入のきっかけ。

## 相十副 / Xiang Shi Fu

中国骨牌32枚を使うソリティア系。原作の目的は32牌をTriplet×10＋Pair×1へ整理すること。

**TierSlot初期案：** 固定Rollで骨牌獲得 → CPUが最適Set形成 → Set完成で報酬 → 最終完成Set数でFinish Bonus。

中核：Multi-Set Completion / Collection。具体仕様未確定。

## 過五関 / Guo Wu Guan

関羽の「五関を過ぎ六将を斬る」をモチーフにした中国骨牌ソリティア系。

**TierSlot案：** 第一関 → 第二関 → 第三関 → 第四関 → 第五関 → 将軍戦、というProgression型。テーマ性は高いがMartinetti等の順次攻略ゲームとの構造重複に注意。

## 天九ダイス

中国骨牌のランキング文化を2D6へ落とした候補。左右リール等の2D6で判定、中央リールをCoin／倍率等に使う案あり。Civil／Militaryと特殊Rankを利用。詳細仕様は当時未確定。

## 456

3D6によるシンプルなRank Battle。チンチロと似るがルールが単純で3D6と好相性。

**当時の方針：** Player／CPU対戦。双方目なし→DRAW、片方のみ目なし→目なし側LOSE。詳細Score／Rankは別途検討。

---

# エジプト周辺／イシス候補

探索範囲：古代・近世・近代エジプト、スーダン、北アフリカ、レバント、中東。古代エジプトでは詳細ルールが残らないゲームが多いため地域・時代を拡張。

**当時の有力5候補：** Senet、Tâb、Basra、Egyptian Mancala、Estimation。6枠目は当時未定。

**却下：** Hyena Game。

**予備／保留：** Seega、Tarneeb、Ronda、Kanjafa、Royal Game of Ur / Twenty Squares、Kharbga、Hand。

## Senet

古代エジプトを代表する盤ゲーム。イシス看板候補。古代の完全なルールは残らず現代ルールは復元案である点に注意。

Roll → 駒移動 → 盤面攻略 → Goal、というRace／Board Game。当時の詳細TierSlot仕様は未確定。

## Tâb

19世紀エジプト等に詳細記録があるRunning-fight game。単なるレースではない。

**原作の核心：** 相手駒へぴったり着地するとCAPTURE（永久除去）。自分の駒同士が重なるとSTACKして一部隊として移動。相手軍全滅が勝利条件。

Movement + Stack + Capture + Elimination。

**TierSlot初期案：** Player軍 vs CPU軍。Roll → 移動値決定 → AIが移動駒を自動選択 → MOVE → Stack／Capture判定 → 次Roll。

**報酬案：** 敵1体CAPTUREで小～中報酬／報酬抽選。敵残数12→11→…→0、全滅でANNIHILATION BONUS。途中Capture報酬＋全滅大Bonusの二段階。

Senet＝Goal、Tâb＝Elimination。

## Basra

エジプトを含む中東のFishing系トランプゲーム。52枚Deck。

**原作の核心：** 表向きの場札を、手札から同Rankまたは数値合計でCapture（場2・3に対しPlayer5なら2+3=5で両方Capture）。取れないカードは場に残る。

**BASRA：** 1枚で場札をすべてCaptureして空にするとBonus。Jackは場札全Sweepの特殊カードだが通常はBASRA Bonusと別扱い。エジプト版ではDiamond 7にも特殊Sweep能力あり。

**TierSlot初期案：** リール ≠ カード。内部52枚有限Deck。場札OPEN → Roll → Playerカード自動Play → 最適Capture自動判定 → Captureまたは場へ追加 → CPU処理 → 次Roll。

**報酬案：** 通常Capture＝獲得カードに応じたCoin、特殊カードCapture＝Special Bonus、場札全消し＝BASRA BONUS、最終獲得枚数＝Finish Bonus。

中核：Fishing + Sum Combination + Sweep。

## Egyptian Mancala

古代エジプト起源とは断定しない。19世紀エジプトにはEdward William Laneによる具体的記録がある。

**盤面：** 2列×6穴＝12穴。

**原作の核心：** 1穴の石をすべて取り、隣から1個ずつ撒く（Sowing）。条件によりCAPTURE。ルールによっては最後の穴から石を拾い直してSOWを繰り返すMultiple Lap／Chainがある。

**TierSlot初期案 ★相性が良い：** DR6をPlayer側6穴の番号にする。

DR6=4 → 4番穴を強制選択 → 石を全部取る → 自動Sowing → Chain判定 → Capture判定 → 報酬。

プレイヤーは穴を選択しない。

**報酬案：** Capture石→Coin、Chain数→倍率、最終獲得石数またはPlayer vs CPU勝敗→Finish Bonus。

中核：Position Selection + Distribution + Chain + Capture。

## Estimation

現代エジプトで人気のTrick-taking Card Game。

**原作の核心：** Round前に獲得Trick数を予想。TARGET=3なら3 TrickでSUCCESS、2でも4でもFAIL。勝ちすぎても失敗する。

**TierSlotアレンジ案 ★候補入り決定：** Bidやカード選択を簡略化。固定6 Trick程度を想定。

GAME START → TARGET決定（例：3） → TRICK 1 Player WIN（1/3） → TRICK 2 CPU WIN（1/3） → … → TRICK 6 → 最終Trick数判定。

- 3/3：ESTIMATION SUCCESS
- 2/3：UNDER / FAIL
- 4/3：OVER / FAIL

カードは自動Playが基本。

**TARGET：** DR6等で自動決定する案。6 TrickでTARGET 0～6は成功確率が異なるためTARGET別配当が必要。

例：TARGET 3＝成功しやすい／低配当、TARGET 0＝全敗／高配当、TARGET 6＝全勝／高配当。

中核：Target Setting + Multiple Battle + Exact Match。「勝ちすぎても失敗」が最大の個性。

## Seega（予備）

19世紀エジプトで記録のある挟み取り型戦争ゲーム。5×5版等。

`● ○ ●` のように自軍で敵を挟むとCapture。

中核：Placement + Movement + Sandwich Capture。

配置や移動の裁量が大きく、DR／AIによる自動行動が必要。Tâbと戦闘系で若干重複するため予備。

## Kanjafa（予備）

中世マムルーク朝エジプトで賭博に使用されたカード文化。現存カードから52枚・4 SuitのDeck構成が知られる。

Suit：Coins、Cups、Swords、Polo-sticks。各Suit＝数字1～10＋3 Courtで13枚。

ビジュアル・歴史性は高いが当時の具体的ゲームルールはほぼ失われている。「Kanjafaというゲームを再現」とは言えない。Ganjifa等の後世ルールを利用したオリジナルゲームは可能だが、「元ゲームの本質を残す」研究方針では優先度を下げる。

## イシス候補・当時のまとめ

1. Senet — Race / Goal
2. Tâb — Running Combat / Stack / Elimination
3. Basra — Fishing / Sum Capture / Sweep
4. Egyptian Mancala — Sowing / Chain / Capture
5. Estimation — Exact Trick Target
6. 未定

予備：Seega、Tarneeb、Ronda、Kanjafa、Royal Game of Ur / Twenty Squares、Kharbga、Hand。

却下：Hyena Game。

## 今後の研究優先事項（2026-08-16時点）

**リンリン：** 8候補から6台を選定。牌九、K'ap Tái Shap、中国式麻雀は初期仕様まで発展。番攤からDR4が誕生。

**イシス：** 5候補確保。6台目をエジプト・北アフリカ・スーダン・レバント・中東から継続探索。既存5台と重複しないDR利用、勝利条件、ゲームジャンルを優先。

## 重要な設計思想

原作の操作をすべて再現する必要はない。ただし原作の勝敗構造・特徴・気持ちよさは可能な限り残す。

プレイヤー裁量がテンポを壊す場合は、DRによる自動選択、AI最適処理、固定Roll化、有限Deckの独立RNG、自動Hand Building等を利用する。

**目標：** Roll → 即ゲーム状態変化 → 視覚的な結果 → 次Roll。

共通テンポを維持しつつ36台それぞれに異なるDestiny Rollの使い方を与える。
