# 北海道自駕手冊

2026.11.05 — 11.10　北海道 6 天 5 夜自駕旅遊手冊（RWD，手機／電腦都能看）。

- 北海道即時天氣（依行程日期顯示當天地區，資料來源 Open-Meteo，免 API key）
- 航班資訊（IT260 高雄 → 新千歲／IT261 新千歲 → 高雄）
- 自駕路線與 Google Maps 連結
- 每日行程（DAY 1–6 分頁）
- 住宿與早餐
- 出發前確認清單
- 出國必帶清單（網址加上 `#packing`）

打勾的項目會存在各自瀏覽器的 localStorage，不會跨裝置同步。

## 檔案結構

```
hokkaido-trip/
├── index.html      # 頁面結構
├── css/style.css   # 樣式（色票都在最上方 :root）
├── js/main.js      # 行程資料與互動
├── images/         # 放 hero.jpg
├── .nojekyll       # 讓 GitHub Pages 直接輸出靜態檔
└── README.md
```

不需要任何建置工具，直接打開 `index.html` 就能看。

## Hero 照片

把照片存成 `images/hero.jpg` 即可。
沒有放的話，會自動改用 Flickr 原圖；兩者都載不到時，會顯示插畫雪景。

## 發布到 GitHub Pages

```bash
cd hokkaido-trip
git init
git add .
git commit -m "北海道自駕手冊"
git branch -M main
git remote add origin https://github.com/<你的帳號>/hokkaido-trip.git
git push -u origin main
```

接著到 GitHub repo：**Settings → Pages → Build and deployment**
Source 選 **Deploy from a branch**，Branch 選 **main / (root)**，按 Save。
約 1 分鐘後網址會是：`https://<你的帳號>.github.io/hokkaido-trip/`

## 修改行程

行程、航班、住宿、清單都寫在 `js/main.js` 裡的資料陣列：

| 要改的內容 | 搜尋 |
| --- | --- |
| 天氣地區與座標 | `var WX` |
| 航班 | `var flights` |
| 每日行程、住宿 | `var days` |
| 路線站點 | `var stopList` |
| 出發前確認 | `var preChecks` |
| 必帶清單 | `var groups` |

## 字體

Quicksand（英數）＋ jf open 粉圓 Huninn（中文）＋ Zen Maru Gothic（備用），皆為開源字體，經 Google Fonts 載入。
