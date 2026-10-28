(function(){
  /* hero 照片：先讀 images/hero.jpg，沒有就用 Flickr 原圖，都失敗就顯示插畫雪景 */
  var heroImg = document.getElementById('heroImg');
  function heroFail(){
    var fb = heroImg.getAttribute('data-fallback');
    if (fb) { heroImg.removeAttribute('data-fallback'); heroImg.src = fb; }
    else heroImg.remove();
  }
  if (heroImg) {
    heroImg.addEventListener('error', heroFail);
    // 圖片可能在這支 JS 執行前就已經載入失敗
    if (heroImg.complete && heroImg.naturalWidth === 0) heroFail();
  }
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var M = function(q){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); };
  var store = {
    get: function(k){ try { return JSON.parse(localStorage.getItem(k)) || {}; } catch(e){ return {}; } },
    set: function(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  };
  var PIN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var CAR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 16h14v-4l-2-5H7l-2 5zM5 12h14"/><circle cx="8" cy="16.5" r="1.6"/><circle cx="16" cy="16.5" r="1.6"/></svg>';
  var TICK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------- snow ---------- */
  function makeSnow(el, n, seed){
    var rnd = function(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var html = '';
    for (var i = 0; i < n; i++) {
      var s = (2 + rnd() * 5).toFixed(1);
      html += '<div class="flake" style="left:' + (rnd()*100).toFixed(1) + '%;animation-duration:' + (8 + rnd()*10).toFixed(1) + 's;animation-delay:' + (-rnd()*18).toFixed(1) + 's;opacity:' + (0.55 + rnd()*0.45).toFixed(2) + '"><span style="width:' + s + 'px;height:' + s + 'px;animation-delay:' + (-rnd()*4).toFixed(1) + 's"></span></div>';
    }
    el.innerHTML = html;
  }
  var narrow = window.matchMedia('(max-width:600px)').matches;
  makeSnow($('heroSnow'), narrow ? 30 : 56, 7);
  makeSnow($('packSnow'), narrow ? 16 : 28, 11);
  $('snowBtn').addEventListener('click', function(){
    var on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', on);
    this.querySelector('span').textContent = on ? '停止下雪' : '下點雪';
    $('heroSnow').hidden = !on; $('packSnow').hidden = !on;
  });

  /* ---------- flights ---------- */
  var flights = [
    { code:'IT 260', dir:'去程', cls:'sky', date:'11/5（四）', from:'KHH', fromName:'高雄', to:'CTS', toName:'札幌（新千歲）', dep:'08:45', arr:'13:40', dur:'3 小時 55 分' },
    { code:'IT 261', dir:'回程', cls:'sakura', date:'11/10（二）', from:'CTS', fromName:'札幌（新千歲）', to:'KHH', toName:'高雄', dep:'13:55', arr:'18:05', dur:'5 小時 10 分' }
  ];
  $('flightList').innerHTML = flights.map(function(f){
    var chip = f.cls === 'sky' ? 'background:var(--sky-bg);color:var(--sky-ink2)' : 'background:var(--sakura-bg);color:var(--sakura-ink)';
    return '<article class="flight">' +
      '<div class="f-top"><div><span class="chip" style="' + chip + '">' + f.dir + '</span><span class="f-code">' + f.code + '</span></div><span class="f-date">' + f.date + '</span></div>' +
      '<div class="f-mid">' +
        '<div><div class="f-city">' + f.fromName + '</div><div class="f-time">' + f.dep + '</div><div class="f-iata">' + f.from + '</div></div>' +
        '<div class="f-path"><div class="f-line" aria-hidden="true"><svg class="plane" width="22" height="22" viewBox="0 0 24 24" fill="#5A86A3"><path d="M21 15.5v-1.8l-8-5V3.2a1.5 1.5 0 0 0-3 0v5.5l-8 5v1.8l8-2.5v5.4l-2 1.5V21l3.5-1 3.5 1v-1.6l-2-1.5V13z" transform="rotate(90 12 12)"/></svg></div><span class="f-dur">' + f.dur + '</span></div>' +
        '<div style="text-align:right"><div class="f-city">' + f.toName + '</div><div class="f-time">' + f.arr + '</div><div class="f-iata">' + f.to + '</div></div>' +
      '</div>' +
    '</article>';
  }).join('');

  /* ---------- itinerary data ---------- */
  var TAGS = { spot:['景點','sky'], food:['餐食','sakura'], sweet:['甜點','sakura'], shop:['購物','matcha'], flight:['機場','gray'], car:['租還車','gray'], todo:['行程','gray'] };
  var TAGC = { sky:'background:var(--sky-bg);color:var(--sky-ink2)', sakura:'background:var(--sakura-bg);color:var(--sakura-ink)', matcha:'background:var(--matcha-bg);color:var(--matcha-ink)', gray:'background:var(--gray-bg);color:var(--gray-ink)' };
  var S = function(k, title, o){ var r = o || {}; r.k = k; r.title = title; return r; };
  var D = function(txt, note){ return { drive:true, title:txt, note:note }; };
  var C = function(label, q){ return { label:label, q:q }; };
  var days = [
    { date:'11/5', wd:'四', route:'新千歲 → 登別 → 洞爺湖', short:'新千歲・登別・洞爺湖',
      stay:{ name:'洞爺湖鶴雅度假村', type:'飯店', bf:'含早餐', ok:true, q:'洞爺湖 鶴雅 リゾート' },
      tip:'入境後先租車，路上找點東西吃。\n晚餐成吉思汗烤肉，或當下找。',
      items:[ S('flight','抵達新千歲機場',{ t:'13:40', note:'IT260 從高雄出發，08:45 起飛', q:'新千歲機場' }), S('todo','入境、領行李',{ t:'13:40–14:40' }), S('car','租車',{ t:'14:40–15:40', note:'路上找點東西吃' }), D('約 1 小時 40 分'), S('spot','地獄谷',{ note:'登別溫泉', q:'登別地獄谷' }), D('約 50 分'), S('spot','洞爺湖',{ q:'洞爺湖' }), S('food','晚餐：成吉思汗烤肉',{ note:'或當下找', q:'洞爺湖 ジンギスカン' }) ] },
    { date:'11/6', wd:'五', route:'洞爺湖 → 小樽 → 札幌', short:'洞爺湖・小樽・札幌',
      stay:{ name:'Airbnb（手稻）', type:'小樽獨棟樓中樓', bf:'早餐要準備', ok:false },
      tip:'出發前確認小樽水族館的園區開放時間。\n晚上住 Airbnb，記得買隔天早餐。',
      items:[ S('todo','飯店出發'), D('約 2 小時 15 分'), S('spot','小樽水族館',{ note:'要看園區時間', q:'おたる水族館' }), D('約 10 分'), S('spot','手宮公園',{ note:'賞楓、俯瞰小樽港', q:'手宮公園 小樽' }), S('food','小樽午餐'), S('spot','小樽運河',{ q:'小樽運河', chips:[C('堺町通商店街','堺町通り商店街 小樽'), C('LeTAO','LeTAO 本店 小樽'), C('六花亭','六花亭 小樽運河店'), C('北菓樓','北菓楼 小樽本館')] }), S('food','晚餐',{ note:'小樽找或札幌市區找', chips:[C('根室花丸','回転寿司 根室花まる 札幌'), C('一夜干','小樽 一夜干し')] }), D('約 20 分','前往手稻 Airbnb') ] },
    { date:'11/7', wd:'六', route:'札幌 → 旭川', short:'札幌・旭川',
      stay:{ name:'Airbnb（旭川）', type:'獨棟房屋', bf:'不用準備早餐', ok:true },
      tip:'白色戀人公園 10:00 開園，可以悠閒出發。\n18:00 吃銀ねこ。',
      items:[ S('todo','民宿出發',{ note:'白色戀人公園 10:00 開園，可悠閒出發' }), D('約 20 分'), S('sweet','白色戀人公園',{ t:'10:00', q:'白い恋人パーク' }), S('food','午餐：Toriton 圓山店',{ q:'回転寿し トリトン 円山店' }), S('spot','北海道大學',{ t:'15:40', q:'北海道大學' }), S('spot','北海道神宮',{ q:'北海道神宮' }), D('約 2 小時','札幌出發到旭川'), S('todo','抵達旭川 Airbnb',{ note:'可休息或逛旭川市區' }), S('food','晚餐：銀ねこ',{ t:'18:00', note:"Yakitori Professional Gin'neko", q:"Yakitori Professional Gin'neko 旭川" }) ] },
    { date:'11/8', wd:'日', route:'旭川 → 美瑛 → 富良野', short:'旭川・美瑛・富良野',
      stay:{ name:'富良野小木屋', type:'小木屋，離森林精靈露台 5 分鐘', bf:'早餐要準備', ok:false },
      tip:'炭燒俱樂部記得確認公休日。\n小木屋要準備隔天早餐。',
      items:[ D('約 20 分','先吃早午餐'), S('food','早午餐：山惠鹿肉漢堡排',{ q:'山惠 鹿肉 ハンバーグ 旭川' }), D('約 1 小時 20 分'), S('spot','白金青池',{ q:'白金青い池' }), S('spot','白鬚瀑布',{ q:'白ひげの滝' }), S('sweet','菓子工廠／布丁工房',{ q:'富良野 布丁 菓子工房' }), S('spot','森林精靈露台',{ q:'ニングルテラス' }), S('food','晚餐',{ note:'三個選項，看當天狀況', chips:[C('森林精靈露台找吃的','ニングルテラス'), C('超商煮'), C('炭燒俱樂部（確認公休）','炭燒俱樂部 富良野')] }), D('約 5 分','從森林精靈露台到小木屋') ] },
    { date:'11/9', wd:'一', route:'富良野 → 札幌', short:'富良野・札幌',
      stay:{ name:'Airbnb（札幌）', type:'市區獨棟房屋', bf:'早餐要準備', ok:false },
      tip:'吃完早餐再出發。\n有時間可以逛薄野。',
      items:[ S('todo','吃完早餐再出發'), D('約 2 小時 10 分'), S('shop','Stellar Place',{ q:'札幌ステラプレイス' }), S('spot','大通公園',{ q:'大通公園 札幌' }), S('food','狸小路附近吃飯'), S('shop','狸小路',{ q:'狸小路商店街' }), S('food','二條市場',{ note:'大磯海鮮丼', q:'二条市場 大磯' }), S('spot','薄野',{ note:'有時間可逛', q:'すすきの 札幌' }), S('food','晚餐（自由安排）') ] },
    { date:'11/10', wd:'二', route:'札幌 → 新千歲 → 高雄', short:'札幌・新千歲・高雄',
      stay:null,
      tip:'10:30 前一定要完成還車。\n退稅品要先給海關確認，IT261 13:55 起飛，提早到機場。',
      items:[ S('todo','早餐自行處理'), D('約 1 小時','前往機場'), S('car','還車',{ t:'09:30–10:00', note:'10:30 前完成還車' }), S('todo','接駁車前往機場',{ note:'提前抵達' }), S('flight','新千歲機場',{ q:'新千歲機場', chips:[C('海關確認退稅品（提前排隊）'), C('購買伴手禮'), C('辦理登機')] }), S('flight','搭乘 IT261 返程',{ t:'13:55', note:'18:05 抵達高雄' }) ] }
  ];

  /* ---------- tabs + day panel ---------- */
  var current = 0;
  $('tabs').innerHTML = days.map(function(d, i){
    return '<button class="tab" role="tab" type="button" id="tab' + i + '" aria-controls="dayPanel" data-day="' + i + '"><span class="t1"><b>DAY ' + (i+1) + '</b><span>' + d.date + '（' + d.wd + '）</span></span><span class="t2">' + d.short + '</span></button>';
  }).join('');
  function chipHtml(c){ return c.q ? '<a href="' + M(c.q) + '" target="_blank" rel="noopener">' + esc(c.label) + ' <span aria-hidden="true" style="font-size:12px">↗</span></a>' : '<span>' + esc(c.label) + '</span>'; }
  function renderDay(i){
    current = i;
    var d = days[i];
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function(b, j){ b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
    $('dayPanel').setAttribute('aria-labelledby', 'tab' + i);
    var items = d.items.map(function(it){
      var rail = '<div class="rail" aria-hidden="true">' + (it.drive ? '' : '<div class="dot' + (it.k === 'food' || it.k === 'sweet' ? ' warm' : '') + '"></div>') + '</div>';
      var body;
      if (it.drive) {
        body = '<span class="drive">' + CAR + '車程 ' + esc(it.title) + '</span>' + (it.note ? '<p class="note">' + esc(it.note) + '</p>' : '');
      } else {
        var tag = TAGS[it.k] || TAGS.todo;
        body = '<div class="title-row"><span class="chip" style="font-size:12px;padding:3px 10px;' + TAGC[tag[1]] + '">' + tag[0] + '</span><span class="title">' + esc(it.title) + '</span></div>' +
          (it.note ? '<p class="note">' + esc(it.note) + '</p>' : '') +
          (it.chips ? '<div class="chips">' + it.chips.map(chipHtml).join('') + '</div>' : '') +
          (it.q ? '<a class="maplink" href="' + M(it.q) + '" target="_blank" rel="noopener">' + PIN + 'Google Maps</a>' : '');
      }
      return '<li><div class="time">' + esc(it.t || '') + '</div>' + rail + '<div class="body">' + body + '</div></li>';
    }).join('');
    var stay = d.stay ? '<div class="stay-card"><div class="k">TONIGHT</div><div class="n">' + esc(d.stay.name) + '</div><div class="ty">' + esc(d.stay.type) + '</div><span class="bf ' + (d.stay.ok ? 'ok' : 'no') + '">' + d.stay.bf + '</span>' + (d.stay.q ? '<div><a href="' + M(d.stay.q) + '" target="_blank" rel="noopener">在 Google Maps 開啟 ↗</a></div>' : '') + '</div>' : '';
    $('dayPanel').innerHTML =
      '<div class="day rise">' +
        '<div class="panel day-main"><div class="day-head"><div class="day-no">0' + (i+1) + '</div><div><div class="sub" style="margin:0">' + d.date + '（' + d.wd + '）</div><div class="day-route">' + d.route + '</div></div></div><ol class="tl">' + items + '</ol></div>' +
        '<aside class="day-aside">' + stay +
          '<div class="tip"><h3>今天記得</h3><p>' + esc(d.tip) + '</p></div>' +
          '<div class="daynav"><button type="button" data-go="-1"' + (i === 0 ? ' disabled' : '') + '>← 前一天</button><button type="button" class="next" data-go="1"' + (i === days.length - 1 ? ' disabled' : '') + '>下一天 →</button></div>' +
        '</aside>' +
      '</div>';
    var sel = $('tab' + i);
    if (sel && sel.scrollIntoView && window.matchMedia('(max-width:1000px)').matches) {
      var box = $('tabs'); box.scrollTo({ left: sel.offsetLeft - 16, behavior: 'smooth' });
    }
  }
  $('tabs').addEventListener('click', function(e){ var b = e.target.closest('.tab'); if (b) renderDay(+b.dataset.day); });
  $('tabs').addEventListener('keydown', function(e){
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var n = (current + (e.key === 'ArrowRight' ? 1 : -1) + days.length) % days.length;
    renderDay(n); $('tab' + n).focus(); e.preventDefault();
  });
  $('dayPanel').addEventListener('click', function(e){
    var b = e.target.closest('[data-go]'); if (!b) return;
    renderDay(Math.min(days.length - 1, Math.max(0, current + (+b.dataset.go))));
    $('days').scrollIntoView({ behavior: 'smooth' });
  });
  renderDay(0);

  /* ---------- route ---------- */
  var stopList = [['新千歲',1],['登別',1],['洞爺湖',1],['小樽',2],['札幌',3],['旭川',3],['美瑛',4],['富良野',4],['札幌',5],['新千歲',6]];
  $('stopList').innerHTML = stopList.map(function(s){ return '<li><button class="stop" type="button" data-day="' + (s[1]-1) + '"><small>D' + s[1] + '</small>' + s[0] + '</button></li>'; }).join('');
  $('stopList').addEventListener('click', function(e){ var b = e.target.closest('.stop'); if (!b) return; renderDay(+b.dataset.day); $('days').scrollIntoView({ behavior:'smooth' }); });
  var routeQ = ['新千歲機場','登別地獄谷','洞爺湖','小樽運河','札幌','旭川','美瑛','富良野','札幌','新千歲機場'];
  $('routeLink').href = 'https://www.google.com/maps/dir/' + routeQ.map(encodeURIComponent).join('/');

  /* ---------- stays ---------- */
  $('stayList').innerHTML = days.map(function(d, i){
    if (!d.stay) return '';
    return '<div class="stay"><div class="night">第 ' + (i+1) + ' 晚・' + d.date + '（' + d.wd + '）</div><div class="n">' + esc(d.stay.name) + '</div><div class="ty">' + esc(d.stay.type) + '</div><span class="bf ' + (d.stay.ok ? 'ok' : 'no') + '">' + d.stay.bf + '</span></div>';
  }).join('');

  /* ---------- checkbox lists (saved in this browser) ---------- */
  function checkHtml(key, label, hint, done){
    return '<button class="check" type="button" role="checkbox" aria-checked="' + !!done + '" data-key="' + key + '"><span class="box" aria-hidden="true">' + TICK + '</span><span class="lbl"><span class="t">' + esc(label) + '</span>' + (hint ? '<span class="h">' + esc(hint) + '</span>' : '') + '</span></button>';
  }
  function bindChecks(container, storeKey, onChange){
    container.addEventListener('click', function(e){
      var b = e.target.closest('.check'); if (!b) return;
      var st = store.get(storeKey); var k = b.dataset.key;
      st[k] = !st[k]; store.set(storeKey, st);
      b.setAttribute('aria-checked', !!st[k]);
      if (onChange) onChange();
    });
  }
  var preChecks = ['確認 IT260／IT261 起降時間與行李額度','確認小樽水族館當天的園區開放時間','確認炭燒俱樂部公休日（Day 4 晚餐）','準備早餐：手稻 Airbnb、富良野小木屋、札幌 Airbnb','Day 6 在 10:30 前完成還車','退稅品放隨身行李，出境時給海關確認（新制）'];
  var cs = store.get('hk-checks');
  $('checkList').innerHTML = preChecks.map(function(l, i){ return checkHtml('c' + i, l, '', cs['c' + i]); }).join('');
  bindChecks($('checkList'), 'hk-checks');

  var I = function(label, hint){ return [label, hint || '']; };
  var groups = [
    { en:'DOCUMENTS', title:'證件・文件', items:[ I('護照','效期要涵蓋回程日 11/10 之後'), I('台灣駕照正本','租車時要和譯本一起出示'), I('駕照日文譯本','到監理站申請，沒有就不能開車'), I('電子機票','IT260 去程／IT261 回程'), I('住宿訂單','鶴雅、3 間 Airbnb、富良野小木屋'), I('租車預約確認單'), I('Visit Japan Web 入境 QR Code','出發前先填好，截圖存手機'), I('旅遊保險資料'), I('護照影本、大頭照 2 張','護照遺失時補辦用，和正本分開放'), I('收據夾','退稅收據留到退款入帳') ] },
    { en:'MONEY', title:'錢包', items:[ I('日幣現金','部分小店、市場只收現金'), I('信用卡 2 張','最好是不同發卡組織'), I('零錢包','日本硬幣多，很好用'), I('一點台幣','回程從小港機場回家用') ] },
    { en:'GADGETS', title:'3C 用品', note:'日本插座和台灣一樣，不需要轉接頭。', items:[ I('手機、充電線'), I('行動電源','只能放隨身行李，不能託運'), I('網卡或 eSIM'), I('車用手機架','導航用'), I('車用 USB 充電線'), I('多孔充電頭','一個插座充好幾台'), I('耳機') ] },
    { en:'CLOTHES', title:'衣物', note:'洋蔥式穿法：室內暖氣很強，戶外很冷。', items:[ I('羽絨外套'), I('發熱衣、發熱褲'), I('毛衣或刷毛上衣'), I('毛帽、圍巾、手套'), I('防滑防水鞋','可能遇到結冰路面'), I('厚襪子'), I('換洗衣物 6 天份'), I('睡衣') ] },
    { en:'TOILETRIES', title:'盥洗・保養', note:'隨身行李的液體每瓶 100ml 以內，其他放託運。', items:[ I('牙刷、牙膏','Airbnb 不一定有提供'), I('洗面乳'), I('洗髮精、潤髮乳、沐浴乳','旅行用小瓶'), I('化妝水、乳液','北海道很乾燥，保濕要加強'), I('護唇膏、護手霜'), I('防曬'), I('隱形眼鏡、藥水／眼鏡'), I('刮鬍刀'), I('梳子、髮圈'), I('毛巾','確認 Airbnb 和小木屋有沒有提供') ] },
    { en:'MEDICINE', title:'藥品', items:[ I('感冒藥、退燒止痛藥'), I('腸胃藥'), I('暈車藥','山路車程長'), I('個人常備處方藥'), I('OK 繃') ] },
    { en:'OTHERS', title:'其他', items:[ I('暖暖包','日本超商也買得到'), I('太陽眼鏡','雪地反光，開車很需要'), I('折疊傘'), I('環保購物袋'), I('保溫瓶'), I('折疊行李袋','回程裝伴手禮') ] }
  ];
  function renderPack(){
    var st = store.get('hk-pack'); var done = 0, total = 0;
    $('groups').innerHTML = groups.map(function(g, gi){
      var gd = 0;
      var rows = g.items.map(function(it, ii){ var k = gi + '-' + ii; if (st[k]) gd++; return checkHtml(k, it[0], it[1], st[k]); }).join('');
      done += gd; total += g.items.length;
      return '<section class="group" aria-label="' + g.title + '"><div class="g-head"><div><div class="label">' + g.en + '</div><h2>' + g.title + '</h2></div><span class="cnt" data-cnt="' + gi + '">' + gd + ' / ' + g.items.length + '</span></div>' + (g.note ? '<p class="g-note">' + g.note + '</p>' : '') + rows + '</section>';
    }).join('');
    updatePack();
  }
  function updatePack(){
    var st = store.get('hk-pack'); var done = 0, total = 0;
    groups.forEach(function(g, gi){
      var gd = 0; g.items.forEach(function(_, ii){ if (st[gi + '-' + ii]) gd++; });
      done += gd; total += g.items.length;
      var c = document.querySelector('[data-cnt="' + gi + '"]'); if (c) c.textContent = gd + ' / ' + g.items.length;
    });
    $('pkDone').textContent = done; $('pkTotal').textContent = total;
    $('pkBar').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  }
  renderPack();
  bindChecks($('groups'), 'hk-pack', updatePack);
  $('pkReset').addEventListener('click', function(){ store.set('hk-pack', {}); renderPack(); });

  /* ---------- live weather (Open-Meteo, 免 API key) ---------- */
  var WX = [
    { name:'洞爺湖', lat:42.5636, lon:140.8197 },
    { name:'小樽',   lat:43.1907, lon:140.9947 },
    { name:'旭川',   lat:43.7706, lon:142.3650 },
    { name:'富良野', lat:43.3420, lon:142.3832 },
    { name:'札幌',   lat:43.0621, lon:141.3544 },
    { name:'新千歲', lat:42.7752, lon:141.6923 }
  ];
  var WX_ICONS = {
    sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    part:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.5v1.5M3.5 8H5M4.8 4.8l1 1M11.2 4.8l-1 1"/><path d="M5.6 10.6A3.5 3.5 0 1 1 11.4 7"/><path d="M8 19h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A2.8 2.8 0 0 0 8 19z"/></svg>',
    cloud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.2 3.2 0 0 0 7 18z"/></svg>',
    fog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9h16M3 13h18M5 17h14"/></svg>',
    rain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.2 3.2 0 0 0 7 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></svg>',
    snow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.2 3.2 0 0 0 7 13z"/><path d="M8 16.5v.01M12 18v.01M16 16.5v.01M10 20.5v.01M14 20.5v.01" stroke-width="2.4"/></svg>',
    storm:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.8A3.2 3.2 0 0 0 7 13z"/><path d="M12.5 14.5l-2 3.5h3l-2 3.5"/></svg>'
  };
  function wxInfo(c){
    if (c === 0) return ['晴', 'sun'];
    if (c === 1) return ['晴時多雲', 'part'];
    if (c === 2) return ['多雲', 'part'];
    if (c === 3) return ['陰', 'cloud'];
    if (c === 45 || c === 48) return ['霧', 'fog'];
    if (c >= 51 && c <= 57) return ['毛毛雨', 'rain'];
    if (c >= 61 && c <= 67) return ['下雨', 'rain'];
    if (c >= 71 && c <= 77) return ['下雪', 'snow'];
    if (c >= 80 && c <= 82) return ['陣雨', 'rain'];
    if (c === 85 || c === 86) return ['陣雪', 'snow'];
    if (c >= 95) return ['雷雨', 'storm'];
    return ['—', 'cloud'];
  }
  var wxData = null, wxSel = 0, wxTripDay = -1, wxPhase = 'before', wxCountdown = 0;
  function jpToday(){
    var p = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Tokyo', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
    return Math.round((Date.parse(p) - Date.parse('2026-11-05')) / 864e5);
  }
  (function(){
    var off = jpToday();
    if (off < 0) { wxPhase = 'before'; wxCountdown = -off; wxSel = 0; }
    else if (off > 5) { wxPhase = 'after'; wxSel = 5; }
    else { wxPhase = 'during'; wxTripDay = off; wxSel = off; }
  })();
  var r1 = function(v){ return (v == null || isNaN(v)) ? '—' : String(Math.round(v)).replace('-0','0'); };
  function renderWx(){
    var w = WX[wxSel], d = wxData && wxData[wxSel];
    var st;
    if (wxSel === wxTripDay) st = '今天 DAY ' + (wxSel + 1) + '・' + w.name;
    else if (wxPhase === 'before' && wxSel === 0) st = '距離出發還有 ' + wxCountdown + ' 天・先看 DAY 1 ' + w.name;
    else st = 'DAY ' + (wxSel + 1) + '・' + w.name + ' 現在的天氣';
    if (wxData === false) st = '目前抓不到即時天氣，稍後會自動重試';
    $('wxStatus').textContent = st;
    $('wxPlace').textContent = w.name + (d ? '・' + wxInfo(d.code)[0] : '');
    $('wxTemp').textContent = d ? r1(d.temp) : '—';
    $('wxIcon').innerHTML = WX_ICONS[d ? wxInfo(d.code)[1] : 'cloud'];
    $('wxSub').textContent = d ? ('體感 ' + r1(d.feel) + '°　最高 ' + r1(d.max) + '° / 最低 ' + r1(d.min) + '°') : '';
    $('wxTime').textContent = d ? ('更新於 ' + d.time.slice(11, 16) + '（日本時間）・資料來源 Open-Meteo') : '';
    $('wxDays').innerHTML = WX.map(function(x, i){
      var t = wxData && wxData[i] ? r1(wxData[i].temp) + '°' : '—';
      return '<li><button type="button" class="wx-day" data-wx="' + i + '" aria-pressed="' + (i === wxSel) + '">' +
        '<span class="d">DAY ' + (i + 1) + '</span><span class="n">' + x.name + '</span><span class="t">' + t + '</span>' +
        (i === wxTripDay ? '<span class="today">今天</span>' : '') + '</button></li>';
    }).join('');
  }
  $('wxDays').addEventListener('click', function(e){ var b = e.target.closest('.wx-day'); if (!b) return; wxSel = +b.dataset.wx; renderWx(); });
  function loadWx(){
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + WX.map(function(x){ return x.lat; }).join(',') +
      '&longitude=' + WX.map(function(x){ return x.lon; }).join(',') +
      '&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=1';
    fetch(url).then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); }).then(function(j){
      var arr = Array.isArray(j) ? j : [j];
      wxData = arr.map(function(o){ return { temp:o.current.temperature_2m, feel:o.current.apparent_temperature, code:o.current.weather_code, time:o.current.time, max:o.daily.temperature_2m_max[0], min:o.daily.temperature_2m_min[0] }; });
      renderWx();
    }).catch(function(){ if (!wxData) { wxData = false; renderWx(); } });
  }
  renderWx(); loadWx();
  setInterval(loadWx, 15 * 60 * 1000);

  /* ---------- routing: #packing = 必帶清單，其他 = 行程 ---------- */
  var menuBtn = $('menuBtn'), links = $('navLinks');
  function closeMenu(){ links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', '開啟選單'); }
  menuBtn.addEventListener('click', function(){
    var open = !links.classList.contains('open');
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  });
  links.addEventListener('click', closeMenu);
  function route(){
    var h = (location.hash || '').slice(1);
    var pack = h === 'packing';
    $('viewTrip').hidden = pack; $('viewPack').hidden = !pack;
    $('packLink').setAttribute('aria-current', pack ? 'page' : 'false');
    if (pack) { window.scrollTo(0, 0); return; }
    var t = h && document.getElementById(h);
    if (t) requestAnimationFrame(function(){ t.scrollIntoView(); });
    else if (!h || h === 'top') window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
