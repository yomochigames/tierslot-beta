# TierSlot Bunco 仕様

## 基本コンセプト

アメリカのダイスゲーム「Bunco」をベースとする。

本家の特徴である、

- 3D6
- ROUND 1～6
- ROUNDごとのターゲット数字
- 21ポイント
- ターゲットTriple＝BUNCO

を利用する。

TierSlot版では、非ターゲットTripleによるROUNDワープと、全ROUND完成時のALL BUNCO CHANCEを追加する。

## BET

100 / 500 / 1,000 / 3,000 / 5,000 / 10,000 Coin

Machine Tierに応じて順次解放する。

BET100を基準として、BETを上げた場合は通常報酬・ALL BUNCO報酬もBET比率に応じて増加する。

## BT

使用しない。

Machine Tierのみで期待値を上昇させる。

## ROUND

ROUND 1～6が存在する。

| ROUND | ターゲット数字 |
|---|---|
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 | 6 |

各ROUNDは独立したポイントを持つ。

初期状態はすべて、0 / 21 pt。

## 通常Rollのポイント

現在ROUNDのターゲット数字だけをカウントする。

例：ROUND 4で

- 1・4・6 → +1pt
- 4・4・2 → +2pt
- 1・2・5 → +0pt

ターゲット数字1個につき+1pt。

## 21pt到達

現在ROUNDが21ptに到達した場合、報酬はまだ獲得しない。

そのROUNDを21 / 21の完成状態で保持する。

その後、自動的に次のROUNDへ進む。

完成済みROUNDのポイントは、台を離れるまで保持される。

## 完成済みROUNDのスキップ

通常進行で次ROUNDへ移動した際、そのROUNDがすでに21/21なら自動的にスキップする。

次の未完成ROUNDまで進む。

全6ROUNDが21/21になった場合は、ALL BUNCO CHANCEへ移行する。

## 現在ROUNDと同じTriple

現在ROUNDと同じTripleを出した場合、BUNCO成立。

例：

- ROUND 3 → 333
- ROUND 5 → 555

BUNCO判定はポイント加算より優先する。

そのため、ROUND 4・18 / 21で444を出しても、18+3=21とは処理せず、BUNCO成立として扱う。

BUNCO成立時：

- 通常報酬を獲得
- そのROUNDのポイントを0/21へリセット
- 次ROUNDへ進む

## 非ターゲットTriple

現在ROUND以外のTripleを出した場合、そのTriple数字のROUNDへ即座にワープする。

例：現在ROUND 2 → 555成立 → ROUND 5へワープ

Tripleによるポイント加算は行わない。

ワープ前のROUNDポイントはそのまま保持する。

## ワープ先が未完成の場合

例：ROUND 2から555成立。

ROUND 5が13 / 21だった場合、ROUND 5の13/21からプレイを再開する。

## ワープ先が完成済みの場合

ワープ先がすでに21/21だった場合、即座に通常報酬を獲得する。

そのROUNDを0/21へリセット。

その後、次の未完成ROUNDへ進む。

## ALL BUNCO CHANCE

全6ROUNDが21 / 21になった場合に突入。

ALL BUNCO CHANCE中も通常どおりBETを支払ってRollする。

111 / 222 / 333 / 444 / 555 / 666 のどれかのTripleを成立させれば成功。

成功時、BET100基準で24,000 Coinを獲得。

その後、ROUND 1～6の全ポイントを0/21へリセットし、通常状態へ戻る。

ALL BUNCO報酬24,000 CoinはMachine Tierによって変化しない。

高BETではBET比率に応じて増加する。

## Machine Tier育成

プレイヤーが出したTripleはすべてMT育成カウント対象。

- BUNCOとなったTriple
- ROUNDワープとなったTriple
- ALL BUNCO CHANCE中のTriple

すべて含む。

## MT別通常報酬

BET100基準。

| MT | 通常報酬 | RTP目安 |
|---|---:|---:|
| MT0 | 3,600 Coin | 約90.5% |
| MT1 | 3,800 Coin | 約93.5% |
| MT2 | 3,900 Coin | 約95.0% |
| MT3 | 4,100 Coin | 約98.0% |
| MT4 | 4,300 Coin | 約101.0% |
| MT5 | 4,400 Coin | 約102.5% |
| MT6 | 4,600 Coin | 約105.5% |

ALL BUNCOの24,000 Coinは全MT共通。

## 高BET時の報酬

BET100を基準として比例させる。

例：BET500・MT0

通常報酬：3,600 × 5 ＝18,000 Coin

ALL BUNCO：24,000 × 5 ＝120,000 Coin

これによりBETを変更しても基本RTPを維持する。

## 台を離れた場合

台を離れた時点で、以下をすべてリセット。

- ROUND 1～6の全ポイント
- 現在ROUND
- ALL BUNCO CHANCE状態

次回プレイ時は初期状態から開始する。

## ゲームの基本ループ

BET
↓
Roll
↓
現在ROUNDのターゲット数字をカウント
↓
21ptを目指す
↓
21pt到達なら完成状態で保持して次ROUND
↓
現在ROUNDと同じTripleならBUNCO・即報酬
↓
別Tripleならその数字のROUNDへワープ
↓
完成済みROUNDへワープした場合は報酬獲得
↓
6ROUNDすべて完成
↓
ALL BUNCO CHANCE
↓
いずれかのTriple成立
↓
24,000 Coin獲得
↓
全ROUNDリセット
↓
再びROUND攻略

## Bunco台の特徴

本家Buncoの「6ROUND」「ROUNDごとのターゲット」「21ポイント」「BUNCO」をDestiny Roll Systemへ変換。

通常Rollでは各ROUNDを育成し、Tripleには、

- BUNCO
- ROUNDワープ
- 完成ROUND回収
- ALL BUNCO獲得
- MT育成

という複数の意味を持たせる。

通常RollでROUNDを育て、Tripleでゲーム展開を大きく動かす永久プレイ型。
