# TierSlot β 開発ロードマップ・進捗【2026-10-08】

> **資料の性質：引き継ぎ時点の申告進捗**。リポジトリのソースを今回監査した結果ではない。

## プロジェクト
- Godot／GDScript、解像度1920×1080。
- コード化した画素データによるピクセルアート。
- Destiny Roll System、Machine Tier育成、MINING金策。
- 最終目標：10,000 Coin×666回＝6,660,000 Coin寄付。
- リリス6台最新構成：EXTEND、COUNTDOWN、TRINITY、ZERO-ONE 301、TEN、CHAIN。

## 実装状況（2026-10-08引き継ぎ時点）
| 項目 | 状態 |
|---|---|
| 共通GameScreen | 実装済み |
| 共通BET/COIN | 実装済み |
| 共通リール | 基本実装済み |
| Machine Tier | 実装済み |
| Shop→GameScreen | 接続済み |
| リリスShop | β用ビジュアル完成 |
| イヴShop | β用ビジュアル完成 |
| EXTEND | ロジック実装済み・演出未完成 |
| COUNTDOWN | ロジック実装済み・演出未完成 |
| TRINITY | ロジック実装済み・演出未完成 |
| ZERO-ONE 301 | ロジック実装済み・演出未完成 |
| TEN | 新規実装待ち |
| 新CHAIN | 旧仕様から置換待ち |
| MINING | 新規実装待ち |
| DONATION | 最終確認・実装待ち |
| SAVE/LOAD | 統合動作確認待ち |

「実装済み」は全機能の実機検証完了を意味しない。

## 推奨作業順
1. TEN実装
2. 新CHAIN実装
3. MINING実装
4. 各台MachineDisplay演出実装
5. DONATION実装・確認
6. SAVE/LOAD最終確認
7. 全台通しプレイ
8. バランス調整・バグ修正

## 未確定・要確認
1. TEN・CHAINのMT育成条件（TripleなしのDR6専用台）。
2. TEN演出詳細。
3. CHAIN演出詳細。
4. TRINITY通常画面。
5. 初期Coin：現行60,000、0開始案は未採用で60,000維持の方向。
6. MINING画面レイアウト。

## 開発方針
βは新案追加より**確定仕様の実装と完成**を優先。ゲームロジックとMachineDisplay演出は分離。既存実装を確認してから修正する。
