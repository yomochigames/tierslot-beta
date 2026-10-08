# Destiny Roll System研究資料 — Sic Bo（大小・骰宝）研究から得た知見

> **資料区分：研究記録**。Sic BoそのもののTierSlot化は保留。以下は原文の研究内容・仮説を記録したもので、追加検証による変更は行っていない。

## 1. 研究目的

Sic BoをTierSlotへそのまま移植することではなく、「Sic Boが3D6＝216通りの結果をどのように分類し、ゲームとして成立させているのか」を研究し、Destiny Roll System（DR）の設計知識として蓄積することを目的とした。

## 2. Sic Boの基本構造

Sic BoはD6を3個使用するダイスゲーム。

賭け方を選択 → 3D6を1回振る → 結果判定 → 配当。

全結果は6 × 6 × 6 = **216通り**。この216通りをさまざまに分類することで多数の賭け方を成立させている。

## 3. Sic Boで利用される主な分類

### 合計値
3個の合計は3～18。中央ほど成立しやすく、両端ほど成立しにくい自然な確率分布を持つ。

### Big / Small
合計値を大きな集合へ分類。代表例はSmall＝4～10、Big＝11～17。ただしTripleを除外するルールが一般的。

### Odd / Even
合計値の奇数／偶数。ルールによってTripleが除外される。

### Specific Number
特定数字を含むか（例：6）。出現個数によって6／66／666と段階化できる。

### Double
特定数字が2個以上存在する。Double 2なら221、224、252、422、222など。

### Triple
3個がすべて同じ数字（111、222、333、444、555、666）。Specific Tripleは数字指定、Any Tripleは数字不問。

### Two-number Combination
異なる特定数字2種類を両方含む（例：2＋5なら225、125、256など）。位置・順番不問。

### Three-number Combination
異なる特定3数字を指定。1・3・5なら135、153、315、351、513、531を同一条件として扱う。

### Pair + Single指定
Pairの数字と余り数字の両方を指定。2・2・4なら224、242、422のみ成立。

## 4. Sic Boの重要な設計思想

Sic Boは216種類の出目を216種類として扱うのではなく、**1回の3D6から複数の特徴を同時に抽出する**。

例：2・2・5には次の属性が同時に存在する。
- Sum = 9
- Small
- Odd
- Pair
- Pair Number = 2
- Unmatched Number = 5
- Contains 2
- Contains 5
- Combination 2+5

**1つの出目＝1つの意味**ではなく、**1つの出目＝複数属性の集合**。

## 5. 「216通りしかない」のではない

3D6の入力空間は216通りだが、ゲームデザイン上重要なのは入力パターン数よりも抽出できる特徴量の種類。

216通りを増やさず、合計・大小・奇偶・重複・特定数字・出現個数・数字集合・組み合わせ等の異なる「見方」を重ねることでゲーム空間を拡張できる。

## 6. Destiny Roll Systemへ持ち帰る分類体系

| 特徴量 | 内容・例 |
|---|---|
| **Raw Value** | 3個の出目そのもの。例：2 / 2 / 5 |
| **Sum** | 3個の合計（3～18） |
| **Range** | Sumの範囲分類。Low / Middle / High、Small / Big |
| **Parity** | Odd / Even。合計値または各ダイス単位 |
| **Multiplicity** | Single（All Different）/ Pair / Triple。TierSlot既存の主要分類 |
| **Pair Number** | Pairの数字。225なら2 |
| **Unmatched Number** | Pair以外の数字。225なら5 |
| **Count** | 特定数字の出現個数。Count(6)＝0～3 |
| **Contains** | 特定数字が含まれるか。Contains(6) |
| **Combination** | 位置を無視した数字の組み合わせ。123・456順不同 |
| **Position** | Left / Center / Right。Pair位置もLeft+Center、Left+Right、Center+Right等 |
| **Min / Max** | 最小値／最大値 |
| **Spread** | 最大値－最小値。225なら5－2＝3。まとまり・散らばり |
| **Sequence** | 123、234、345、456等の連番。順不同扱いも可能 |
| **Difference** | Left－Center、Center－Right、Left－Right等の位置間の差 |

## 7. 特徴量は組み合わせられる

AND / OR / NOTを利用できる。

例：
- Pair AND Odd
- Pair AND Small
- Contains 6 AND Big
- Single AND Even
- Sequence AND NOT Triple

新しい乱数を追加せず、役の成立確率を細かく設計できる。

## 8. 同時成立と優先成立

1回のDRで複数条件が成立する場合、ゲームごとに処理方式を変えられる。

- **同時成立型：** 成立した条件をすべて適用。
- **優先成立型：** 優先順位を設定（例：Triple → Pair → Sequence → Single）、最上位だけを適用。
- **混合型：** メイン役と補助属性を分離。例：Pair→メインイベント、Odd→効果補正、Contains 6→ボーナス判定。

表面上は単純なルールでも内部では複雑な判定が可能。

## 9. Sic Boとルーレットの共通点

ルーレットの「17」は、17、赤、奇数、1～18、Dozen、Column等の複数集合に同時所属する。Sic Boも同様。

共通する本質は、**有限の結果空間を、重なり合う複数の集合へ切り分け、それぞれに異なる確率と価値を与える**こと。

## 10. Sic BoをそのままTierSlot化しない理由

Sic Boは賭け方選択 → Roll → 判定 → 再び賭け方選択を基本とし、毎Roll前の裁量がTierSlotの「Roll → 即判定 → 次Roll」のテンポを損なう可能性がある。

**Sic Boそのものの移植は現時点で保留。** 出目分類の設計思想をDRへ持ち帰る。

## 11. Sic BoとDestiny Rollの違い

- **Sic Bo：** 多数の出目分類をプレイヤーに提示し、どの集合に賭けるかを選択させる。**分類 → 賭け方**。
- **Destiny Roll：** 分類をゲームデザイナーが利用し、このゲームで何を意味するかを決める。**分類 → ゲームルール**。

## 12. DR設計時の新しい考え方

新ゲームを設計する際、「Single／Pair／Tripleを何にするか」だけでなく、**このゲームでは3D6のどの特徴量を使うか**から考える。

候補：Multiplicity、Sum、Range、Parity、Count、Contains、Combination、Position、Pair Number、Unmatched Number、Min / Max、Spread、Sequence、Difference。

その後、**特徴量 → テーマ上の意味**へ変換する。

## 13. ゲームの複雑度も制御できる

- **シンプル：** Multiplicityのみ（Single / Pair / Triple）。
- **中程度：** Multiplicity ＋ Sum。
- **高度：** Multiplicity ＋ Sum ＋ Position ＋ Combination ＋ 複合条件。

内部で利用する特徴量の数と、プレイヤーが覚えるルールの数は別。内部が複雑でも表示する結果は簡単にできる。

## 14. Destiny Roll Systemの再定義候補

**研究以前：**
> 1～6の3出目を共通入力として、その結果を各ゲーム固有のルールへ変換するシステム。

**研究後：**
> 1～6の3出目を共通入力とし、3D6から複数の特徴量を抽出・組み合わせ、それらを各ゲーム固有の意味へ変換するゲームシステム。

処理構造：

```text
D6 × 3
  ↓
Feature Extraction
  Value / Sum / Range / Parity / Multiplicity
  Count / Contains / Combination / Position / etc.
  ↓
Condition Logic
  AND / OR / NOT / Priority / Simultaneous
  ↓
Game Interpretation
  攻撃 / 得点 / ヒット / アウト / ゴール
  ボーナス / カード / レース結果 / Tier上昇 / etc.
  ↓
Game Result
```

## 15. Sic Bo研究の最大の収穫

DRの強みは単に216通りを使い回すことではない。

**216通りの各結果から多数の特徴量を決定論的に抽出し、採用する特徴量・組み合わせ方・意味を変えることで異なるゲームを構築できること。**

Sic Boはこれを**賭け方の多様性**に利用し、DRは**ゲームジャンルの多様性**に利用できる。

## 16. 今後のDR研究への保存事項

新ゲーム設計時の確認事項：

1. 使用するDR特徴量は何か
2. 位置を区別するか
3. 順番を区別するか
4. 複数条件を同時成立させるか
5. 役に優先順位を設定するか
6. AND / OR / NOT条件を使うか
7. 3D6本来の確率分布をレアリティとして利用できないか
8. 新しい乱数を追加せずDRから情報を抽出できないか
9. 内部判定の複雑さをプレイヤーへそのまま見せる必要があるか
10. 毎Rollの裁量でテンポを損なっていないか

## 研究結論

Sic BoそのもののTierSlot化は現時点で保留。

ただし**「同一の3D6を複数の重なり合う集合として解釈する」**という設計思想はDRとの親和性が非常に高い。

今後のDR研究では「出目を何の役にするか」に加え、**「出目からどんな特徴量を取り出せるか」**を正式に設計手法へ追加する。

Sic Bo研究はDestiny Roll Systemの「3D6からゲームを作る」仕組みを体系的に説明するための重要な研究成果として保存する。
