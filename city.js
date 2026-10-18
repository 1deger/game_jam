'use strict';
/* GİRNE şehir katmanı — veriler 'Afete Hazır — Girne' oyunundan alınmıştır (ekip yazımı). */
/* ---------- harita: üstten görünüm, gece haritası (kod ile üretilir) ---------- */
let _MAPC=null;
const ZONE_T={liman:'old',eskiliman:'old',carsi:'old',okul:'mid',konut:'mid',itfaiye:'mid',hastane:'mid',cami:'new',su:'new'};
const ZONE_PAL={old:['#e3a850','#d28f3d','#f0c46c','#c9873a'],mid:['#d9d47c','#c3c363','#e6e08f','#b3b659'],new:['#93dc8c','#7bcb7c','#a8e69a','#6dbd75']};
function cityMarkup(){
  if(_MAPC)return _MAPC;
  const W=1280,H=720;let sd=20261017;const rnd=()=>{sd=(sd+0x6D2B79F5)|0;let t=Math.imul(sd^(sd>>>15),1|sd);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
  const shore=x=>196+24*Math.sin(x/118)+13*Math.sin(x/47+1.3);
  const smooth=pts=>{let d='M'+pts[0][0]+' '+pts[0][1];for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
      d+='C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+' '+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+' '+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+' '+p2[0]+' '+p2[1];}return d;};
  const sample=pts=>{const out=[];for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
      for(let t=0;t<1;t+=.08){const t2=t*t,t3=t2*t;out.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}out.push(pts[pts.length-1]);return out;};
  const river=[[590,150],[612,250],[598,330],[606,410],[690,468],[770,520],[800,600],[836,740]];
  const roads=[
    [[-20,268],[200,255],[420,262],[640,248],[860,262],[1080,250],[1300,262]],
    [[-20,418],[210,404],[430,425],[660,410],[900,430],[1100,414],[1300,430]],
    [[-20,612],[240,596],[470,612],[700,598],[960,616],[1300,600]],
    [[150,170],[160,420],[140,740]],[[390,170],[400,430],[380,740]],[[860,170],[850,450],[880,740]],[[1090,170],[1080,450],[1100,740]]];
  const parks=[[180,330,52,34],[548,478,46,30],[930,606,62,34],[1188,262,48,34],[420,600,40,24]];
  const mask={};const mk=(x,y,r)=>{for(let a=-r;a<=r;a+=6)for(let b=-r;b<=r;b+=6)if(a*a+b*b<=r*r)mask[Math.round((x+a)/6)+','+Math.round((y+b)/6)]=1;};
  roads.forEach(r=>sample(r).forEach(p=>mk(p[0],p[1],11)));sample(river).forEach(p=>mk(p[0],p[1],27));
  const sites=SITES.map(s=>[s.x*W/100,s.y*H/100,s.id]);
  const zones={};SITES.forEach(s=>zones[s.id]=[]);
  for(let gy=shore(0)+14;gy<H+10;gy+=21)for(let gx=-4;gx<W+10;gx+=21){
    const ix=Math.round(gx/21),iy=Math.round(gy/21);if(ix%7===0||iy%6===0)continue;
    const x=gx+rnd()*6-3,y=gy+rnd()*6-3;if(y<shore(x)+12||mask[Math.round(x/6)+','+Math.round(y/6)])continue;
    if(parks.some(p=>((x-p[0])/p[2])**2+((y-p[1])/p[3])**2<1.15))continue;
    if((x<150&&y>620)||(x>1110&&y>630))continue;
    let best=null,bd=1e9;sites.forEach(s=>{const d=(s[0]-x)**2+(s[1]-y)**2;if(d<bd){bd=d;best=s[2];}});
    const w=10+rnd()*8,h=10+rnd()*8,pal=ZONE_PAL[ZONE_T[best]],c=pal[Math.floor(rnd()*pal.length)];
    zones[best].push('<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+c+'"/>');
  }
  let sea='M0 0H'+W+'V'+shore(W).toFixed(1);for(let x=W;x>=0;x-=10)sea+='L'+x+' '+shore(x).toFixed(1);sea+='Z';
  let rim='M0 '+shore(0).toFixed(1);for(let x=10;x<=W;x+=10)rim+='L'+x+' '+shore(x).toFixed(1);
  const trees=(x0,y0,x1,y1,n)=>{let s='';for(let i=0;i<n;i++){const x=x0+rnd()*(x1-x0),y=y0+rnd()*(y1-y0);s+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+(5+rnd()*6).toFixed(1)+'" fill="'+(rnd()<.5?'#2f6a47':'#3b7a52')+'"/>';}return s;};
  const roadSvg=roads.map(r=>{const d=smooth(r);return '<path d="'+d+'" class="rd-c"/><path d="'+d+'" class="rd-s"/><path d="'+d+'" class="rd-m"/>';}).join('');
  const rd=smooth(river),faultD='M-20 228L1300 604';
  _MAPC='<div class="scene-shell"><svg class="city-map landscape-map" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Girne mahalle haritası">'+
   '<defs><linearGradient id="seaG" x2="0" y2="1"><stop offset="0" stop-color="#14304f"/><stop offset="1" stop-color="#1f4d70"/></linearGradient>'+
   '<pattern id="seaW" width="90" height="34" patternUnits="userSpaceOnUse"><path d="M0 12q22-7 45 0t45 0M-22 29q22-7 45 0t45 0" fill="none" stroke="#9fd8ff" stroke-opacity=".12" stroke-width="2"/></pattern>'+
   '<filter id="glow"><feGaussianBlur stdDeviation="3"/></filter></defs>'+
   '<rect width="1280" height="720" fill="#363c4c"/>'+
   '<path d="'+sea+'" fill="url(#seaG)"/><path d="'+sea+'" fill="url(#seaW)"/><path d="'+rim+'" fill="none" stroke="#cdb98a" stroke-opacity=".55" stroke-width="5"/>'+
   '<g class="forest"><path d="M-10 640Q60 600 150 618L170 740H-10z" fill="#244f3a"/><path d="M1110 650Q1190 612 1290 628V740H1090z" fill="#244f3a"/>'+trees(0,626,150,725,22)+trees(1110,634,1280,725,24)+'</g>'+
   parks.map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="'+p[2]+'" ry="'+p[3]+'" fill="#2b5a40"/>'+trees(p[0]-p[2]*.7,p[1]-p[3]*.6,p[0]+p[2]*.7,p[1]+p[3]*.6,7)).join('')+
   '<g class="map-roads">'+roadSvg+'</g>'+
   '<path d="'+rd+'" fill="none" stroke="#2a6f9f" stroke-width="30" stroke-linecap="round" opacity=".9"/><path d="'+rd+'" fill="none" stroke="#5fb4ea" stroke-width="20" stroke-linecap="round" opacity=".85"/><path d="'+rd+'" fill="none" stroke="#9fd8ff" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round" opacity=".6"/>'+
   SITES.map(s=>'<g class="zone z-'+s.id+'" data-z="'+s.id+'">'+zones[s.id].join('')+'</g>').join('')+
   '<path id="faultP" d="'+faultD+'" fill="none" stroke="#ff6b5b" stroke-width="9" opacity=".25" filter="url(#glow)"/><path d="'+faultD+'" fill="none" stroke="#ff7a68" stroke-width="3.2" stroke-dasharray="14 9" stroke-linecap="round" opacity=".9"/>'+
   '<text class="fault-t" dy="-8"><textPath href="#faultP" startOffset="64%">FAY HATTI</textPath></text>'+
   '</svg></div>';
  return _MAPC;
}

  const SITES = [
    {id:"liman", name:"Liman", icon:"anchor", x:38, y:40, nb:["eskiliman","okul"], pop:900, steps:[
      {label:"Tahliye tabelaları", cost:2, fact:"Toplanma alanı binalardan, duvarlardan ve enerji hatlarından uzak seçilir."},
      {label:"Acil iskele onarım kiti", cost:3, fact:"Limanlar afet sonrası yardımın ulaştığı ilk kapıdır; kullanılabilir kalması kritiktir."},
      {label:"Deniz tahliye rotası", cost:4, fact:"Kıyıda deprem sonrası su çekilmesi veya yükselmesi için önceden rota belirlenir."}
    ]},
    {id:"eskiliman", name:"Eski Liman", icon:"wall", x:57, y:39, nb:["liman","hastane","carsi"], pop:800, steps:[
      {label:"Tarihi duvar desteği", cost:2, fact:"Yığma taş yapılar yatay sarsıntıya karşı en kırılgan yapı türlerindendir."},
      {label:"Dar sokak tahliye planı", cost:3, fact:"Dar sokaklarda düşen cephe parçaları tahliyeyi kapatır; alternatif çıkış şarttır."},
      {label:"Çok dilli yönlendirme", cost:4, fact:"Bölgeyi tanımayanlar için çok dilli işaretler afet anında hayat kurtarır."}
    ]},
    {id:"okul", name:"Okul", icon:"school", x:29, y:57, nb:["liman","konut","itfaiye"], pop:1100, steps:[
      {label:"Çök-Kapan-Tutun tatbikatı", cost:2, fact:"Sarsıntıda çök, başını ve enseni koru, tutun. Kapı eşiği güvenli bir yer değildir."},
      {label:"Dolap ve raf sabitleme", cost:3, fact:"Yaralanmaların büyük kısmı devrilen dolap ve düşen eşyalardan olur."},
      {label:"Veli teslim protokolü", cost:4, fact:"Önceden belirlenmiş teslim planı, okul çevresinde panikli kalabalığı önler."}
    ]},
    {id:"hastane", name:"Hastane", icon:"hospital", x:70, y:44, nb:["eskiliman","cami","carsi"], pop:700, steps:[
      {label:"Jeneratör ve yakıt", cost:2, fact:"Elektrik kesintisinde yoğun bakım ve ameliyathane yedek güce bağlıdır."},
      {label:"Triyaj alanı", cost:3, fact:"İlk saatler 'altın saatler'dir; yaralıların önceliklendirilmesi kayıpları azaltır."},
      {label:"Bina güçlendirme", cost:4, fact:"Hastaneler afet sonrası ayakta kalması gereken öncelikli yapılardır."}
    ]},
    {id:"cami", name:"Cami Meydanı", icon:"mosque", x:88, y:46, nb:["hastane","su"], pop:900, steps:[
      {label:"Toplanma alanı işareti", cost:2, fact:"Mahalle buluşma noktası önceden belirlenir ve herkes tarafından bilinir."},
      {label:"Minare güvenlik kontrolü", cost:3, fact:"Yüksek ve ince yapılar sarsıntıda ilk hasar görenlerdendir."},
      {label:"Mahalle anons sistemi", cost:4, fact:"Telefon şebekesi çöktüğünde yerel anons en hızlı bilgi kanalıdır."}
    ]},
    {id:"carsi", name:"Çarşı", icon:"shop", x:62, y:59, nb:["eskiliman","hastane","su","itfaiye"], pop:1500, steps:[
      {label:"Vitrin camı filmi", cost:2, fact:"Kırılan cam parçaları sarsıntı sonrası yaralanmaların önemli sebebidir."},
      {label:"Yumuşak kat güçlendirme", cost:3, fact:"Zemin katı vitrinlerle boşaltılmış binalar ('yumuşak kat') ilk yıkılanlardır."},
      {label:"Merkezi gaz kapama", cost:4, fact:"Deprem sonrası yangınların önemli bölümü gaz kaçağından çıkar."}
    ]},
    {id:"konut", name:"Konutlar", icon:"houses", x:19, y:73, nb:["okul","itfaiye"], pop:2400, steps:[
      {label:"Acil durum çantası", cost:2, fact:"Kişi başı 3 günlük su, bozulmayan gıda, el feneri, düdük ve ilk yardım malzemesi."},
      {label:"Aile afet planı", cost:3, fact:"Buluşma noktası ve şehir dışından bir irtibat kişisi önceden belirlenir."},
      {label:"Bina güçlendirme", cost:4, fact:"Mühendislik değerlendirmesiyle güçlendirme, göçme riskini belirgin azaltır."}
    ]},
    {id:"su", name:"Su Deposu", icon:"drop", x:78, y:71, nb:["cami","carsi","itfaiye"], pop:600, steps:[
      {label:"72 saatlik yedek depo", cost:2, fact:"Yardım ekiplerinin ulaşması günler sürebilir; en az 72 saatlik su ayrılır."},
      {label:"Dağıtım noktaları", cost:3, fact:"Önceden duyurulmuş ulaşılabilir dağıtım noktaları kuyrukta izdihamı önler."},
      {label:"Esnek boru bağlantısı", cost:4, fact:"Esnek bağlantılar zemin hareketinde boru kırılmalarını azaltır."}
    ]},
    {id:"itfaiye", name:"Afet Merkezi", icon:"firstaid", x:50, y:77, nb:["okul","carsi","konut","su"], pop:1100, steps:[
      {label:"İlk yardım eğitimi", cost:2, fact:"Kanama durdurmayı bilen bir komşu, ambulans gelmeden can kurtarır."},
      {label:"Gönüllü arama-kurtarma kiti", cost:3, fact:"Enkaz altında düdük sesi, bağırmaktan çok daha az enerji harcatır."},
      {label:"Alternatif ulaşım rotası", cost:4, fact:"Kapanan ana yol için işaretli yedek güzergâh önceden planlanır."}
    ]}
  ];

  /* Tehlike türleri — bir mahalleyi tutuşturduğunda adı ve bilgisi gösterilir. */
  /* Tehlike türleri — her birinin FARKLI bir mekanik kuralı var.
     Kural yalnızca metinde yazar; oyuncu okumadan önceliklendiremez.
     Her tehlikenin iki tepkisi vardır: pahalı tam çözüm, ucuz geçici önlem. */
  const HAZARDS = [
    {id:"yangin", name:"Deprem sonrası yangın riski", icon:"plug", spread:1,
     rule:"Önlem alınmazsa her tur bir komşu mahallede de aynı ihmal açığa çıkar.",
     fact:"Depremde devrilen ısıtıcılar, kopan kablolar ve dökülen yanıcı sıvılar artçı yangınlara yol açar. Isıtıcıyı sabitle, yanıcıyı alçağa koy, deprem şalteri tak.",
     responses:[
       {label:"Deprem güvenliği denetimi yap", cost:2, kind:"sondur", desc:"Riski tamamen kapatır."},
       {label:"Uyarı ve bilgilendirme yap", cost:1, kind:"tut", desc:"Riski kapatmaz ama bu tur komşuda yeni risk çıkmaz."}
     ]},
    {id:"gaz", name:"Deprem sonrası gaz riski", icon:"cylinder", spread:2,
     rule:"Önlem alınmazsa her tur İKİ komşuda birden aynı ihmal açığa çıkar.",
     fact:"Depremde devrilen tüp ve kopan hortum gaz kaçağına yol açar. Tüpü sabitle, hortumu sabunlu suyla kontrol et, deprem sensörlü otomatik gaz vanası tak.",
     responses:[
       {label:"Tüp ve tesisatı güvene al", cost:3, kind:"sondur", desc:"Riski tamamen kapatır."},
       {label:"Geçici sabitleme kayışı tak", cost:1, kind:"tut", desc:"Riski kapatmaz ama bu tur komşuda yeni risk çıkmaz."}
     ]},
    {id:"panik", name:"Depremde bilgi kirliliği", icon:"megaphone", spread:0, drain:1,
     rule:"Komşuya geçmez ama her tur bütçenden 1 ◆ götürür.",
     fact:"Depremin ne zaman olacağı önceden bilinemez; 'tahmin' mesajları söylentidir ve paniği büyütür. Resmî bilgi kanallarını önceden tanı, söylentiyi paylaşma.",
     responses:[
       {label:"Resmî bilgi kanalı kur", cost:2, kind:"sondur", desc:"Riski tamamen kapatır."},
       {label:"Mahalle temsilcileriyle bilgilendir", cost:1, kind:"yatistir", desc:"Riski kapatmaz ama bütçe kaybını kalıcı durdurur."}
     ]},
    {id:"yol", name:"Tıkalı tahliye yolu", icon:"barrier", spread:0, lock:true,
     rule:"Komşuya geçmez ama bu mahalleye yatırım yapılamaz.",
     fact:"Depremde düşen parçalar ve eşyalar çıkışları kapatır. Eşya, araç ve tezgâhla zaten tıkalı yollar tahliyeyi ve yardım ekiplerini geciktirir.",
     responses:[
       {label:"Tahliye yolunu temizle", cost:2, kind:"sondur", desc:"Riski tamamen kapatır."},
       {label:"Alternatif rota işaretle", cost:1, kind:"ac", desc:"Riski kapatmaz ama yatırım kilidini kalıcı açar."}
     ]},
    {id:"su", name:"Zayıf yapı riski", icon:"houses", spread:0, erode:true,
     rule:"Her tur bir komşunun kademesini 1 DÜŞÜRÜR.",
     fact:"Gevşek ya da dolgu zeminde, yanlış arsada veya düşük kaliteli malzemeyle yapılan binalar depremde çok daha fazla zarar görür. Zemin etüdü, kaliteli beton ve donatı, yapı denetimi ve ruhsat can kaybını azaltır.",
     responses:[
       {label:"Zemin etüdü + malzeme denetimi", cost:3, kind:"sondur", desc:"Riski tamamen kapatır."},
       {label:"İnşaatı geçici durdur", cost:1, kind:"tut", desc:"Riski kapatmaz ama bu tur komşu zarar görmez."}
     ]}
  ];

  /* Şehir görevleri — birkaç mahalleyi birden kapsar.
     Tamamlanınca kalıcı, şehir çapında bir etki verir. Yatırımları birbirine bağlar. */
  const MISSIONS = [
    {id:"koridor", name:"Tahliye Koridoru", need:2, sites:["liman","eskiliman","carsi"],
     perk:"Depremde can kaybı %15 azalır",
     fact:"Tahliye koridoru, yardım ekiplerinin şehre girip yaralıların çıkabildiği tek güvenli hattır."},
    {id:"haberlesme", name:"Haberleşme ve Bilgilendirme", need:2, sites:["cami","okul","itfaiye"],
     perk:"Her tur +2 bütçe",
     fact:"Şebeke çöktüğünde mahalleler arası haberleşme, koordinasyonun tamamını ayakta tutar."},
    {id:"saglik", name:"Su ve Sağlık Dayanıklılığı", need:3, sites:["su","hastane"],
     perk:"Açık riskleri giderme 2 ◆ ucuzlar",
     fact:"Su ve sağlık altyapısı ayakta kalırsa salgın ve susuzluk kaynaklı ikincil kayıplar önlenir."},
    {id:"konut", name:"Dayanıklı Konut Programı", need:3, sites:["konut","okul"],
     perk:"Depremde can kaybı %20 azalır",
     fact:"Can kayıplarının büyük bölümü konutlarda olur; yapısal güçlendirme en çok hayat kurtaran adımdır."}
  ];


/* =========================================================
   GİRNE — şehir katmanı. Tur tabanlı strateji; 72 SAAT ev oyununa bağlı:
   • Mahalleye "Eve gir" → ev tatbikatı (tehlikeleri gider, kademe kazan)
   • Gaz/yangın çıkınca "Kendin müdahale et" → ev içinde doğru sırayla müdahale
   • 8 tur sonunda deprem: şehir sonucu + bir ailenin evinde gerçek deprem
   ========================================================= */
const CT_MAX=5,CT_START=6,CT_INCOME=11,CT_POP=10000,CT_PUTOUT=2,CT_RISK=3,CT_SPARK=.5;
let CT=null;
const ctById={};SITES.forEach(s=>ctById[s.id]=s);
const $c=id=>document.getElementById(id);
const ctPick=a=>a[Math.floor(Math.random()*a.length)];
const MINI_L={
  prep:{name:'Ev tatbikatı',tag:'Tatbikat',sub:'',budget:45,slots:0,scn:'quake',aft:false,dark:false,hz:['boxes','shelf','tv','lamp','wardrobe'],decor:[],
    ppl:[{t:'mom',x:330},{t:'kid',x:985}],meds:false,pet:false,intro:'Tatbikat: 45 dk içinde en az 3 tehlikeyi gider. Kademe kazanırsın.',facts:null},
  gas:Object.assign({},LEVELS[3],{aft:false,name:'Gaz kaçağı müdahalesi',tag:'Müdahale'}),
  fire:Object.assign({},LEVELS[4],{aft:false,name:'Elektrik yangını müdahalesi',tag:'Müdahale'})
};

/* Acil risk havuzu: her tehlike türü için birden çok mahalle ve metin.
   Seçici (ctSpawnCrisis) aynı türü, aynı mahalleyi ve aynı metni tekrar etmemeye çalışır. */
const CRISIS_POOL={
  panik:[
    {site:'okul',t:'Okulda "deprem yarın" söylentisi: veliler okula akıyor'},
    {site:'cami',t:'Toplanma alanı yanlış biliniyor, söylenti yayılıyor'},
    {site:'carsi',t:'Çarşıda "bu gece büyük deprem" zincir mesajı: esnaf paniğe kapıldı'},
    {site:'konut',t:'Konutlarda sahte "deprem tahmini" mesajı dolaşıyor'},
    {site:'itfaiye',t:'Afet merkezinin hattı asılsız ihbarlarla tıkandı'}
  ],
  gaz:[
    {site:'hastane',t:'Hastane gaz tesisatında eski hortum bulundu'},
    {site:'konut',t:'Konutlarda sabitlenmemiş gaz tüpleri'},
    {site:'carsi',t:'Çarşıda lokanta tüpleri zincirsiz duruyor'},
    {site:'liman',t:'Liman lokantasında hortum çatlamış, tüp yerinden oynuyor'},
    {site:'eskiliman',t:'Eski Liman kafelerinde tüp hortumları eskimiş'}
  ],
  yangin:[
    {site:'carsi',t:'Çarşıda aşırı yüklü elektrik panosu'},
    {site:'liman',t:'Limanda yakıt depolama düzeni riskli'},
    {site:'hastane',t:'Hastane panosunda çoklu prizler aşırı yüklü'},
    {site:'okul',t:'Okul fen odasında yanıcı sıvılar rafta duruyor'},
    {site:'cami',t:'Cami Meydanı’ndaki eski kablolarda kaçak var'},
    {site:'su',t:'Su deposu pompa panosu aşırı ısınıyor'}
  ],
  yol:[
    {site:'eskiliman',t:'Tarihi sur dibindeki sokak eşyayla tıkalı'},
    {site:'itfaiye',t:'Afet merkezinin çıkış yolu eşyayla tıkalı'},
    {site:'carsi',t:'Çarşı çıkış sokağı tezgâh ve kasalarla daralmış'},
    {site:'okul',t:'Okul önündeki tahliye yolu araçlarla kapanmış'},
    {site:'liman',t:'Liman rıhtımına inen yol konteynerle tıkalı'},
    {site:'su',t:'Su deposunun servis yolu malzemeyle kapanmış'}
  ],
  su:[
    {site:'konut',t:'Konutlarda eski dere yatağının dolgusu üstüne blok yapılıyor'},
    {site:'okul',t:'Okul ek binası gevşek dolgu zeminde yükseliyor'},
    {site:'hastane',t:'Hastane ek binasında düşük kaliteli beton kullanılıyor'},
    {site:'carsi',t:'Çarşıda eski binaya ruhsatsız ek kat çıkılmış'},
    {site:'eskiliman',t:'Eski Liman’da çürümüş kerpiç duvarlı yapı çökme tehlikesinde'}
  ]
};
const HZ_SHORT={yangin:'KOMŞUDA DA VAR',gaz:'2 KOMŞUDA DA VAR',panik:'−1 ◆ / TUR',yol:'YATIRIM KİLİTLİ',su:'KADEME ↓'};
const CT_CRISIS_T=50;
let ctIv=null;
function ctReset(){
  CT={order:null,orderHistory:[],detours:0,turn:1,budget:CT_START,risk:0,lv:{},fire:{},plan:{spreads:[],ignite:null,erodes:[]},putOut:0,blocked:0,totalFires:0,doneMissions:{},
    resolving:false,over:false,visit:true,drillProof:{},family:[],familySeen:{},homeFixed:{},visits:0,minis:0,miniOk:0,res:null,
    mAct:[],mNew:null,mQ:['koridor','konut','haberlesme','saglik'],quakeTurn:3,fore:false,combo:0,crises:[],cid:0,clock:0,crisisQ:[],crisisOk:0,crisisFail:0,crisisHist:[],seen:{},varHist:[]};
  SITES.forEach(s=>CT.lv[s.id]=0);
}
function ctPrep(){let t=0;SITES.forEach(s=>t+=CT.lv[s.id]);return Math.round(t/(SITES.length*3)*100);}
function ctMProg(m){return m.sites.filter(id=>CT.lv[id]>=m.need).length;}
function ctMDone(m){return ctMProg(m)>=m.sites.length;}
function ctPerk(id){return !!(CT&&CT.doneMissions[id]);}
function ctIncome(){return CT_INCOME+(ctPerk('haberlesme')?2:0);}
function ctFireCount(){return Object.keys(CT.fire).length;}
function ctBurning(id){return !!CT.fire[id];}
function ctLocked(id){const f=CT.fire[id];return !!(f&&f.h.lock&&!f.opened);}
function ctSafe(id){return CT.lv[id]>=3;}
function ctNext(site){const l=CT.lv[site.id];return l<3?site.steps[l]:null;}

/* ---------- arayüz ---------- */
function cityUI(){
  return '<div id="cityroot"><div class="scene-shell-slot" id="mapSlot">'+cityMarkup()+'</div><div class="grade"></div><div class="alarm-frame"></div>'+
   '<div class="city-status" id="cityStatus" role="status"></div><div id="cityLife" aria-hidden="true"></div><aside class="family-note" id="familyNote" aria-label="Konutlar ailesinden haber"></aside><aside class="missions" id="missions"></aside>'+
   '<div class="hud"><div class="hud-stat"><small>TUR</small><b id="hudTurn">1</b></div><div class="hud-stat"><small>DEPREM</small><b class="timer" id="hudLeft">3. tur sonu</b></div>'+
   '<div class="hud-stat budget"><small>BÜTÇE</small><b id="hudBudget">4</b></div><div class="hud-stat"><small>TATBİKAT</small><b id="hudVisit">1</b></div><div class="hud-stat combo" id="hudCombo" style="display:none"><small>KOMBO</small><b id="hudComboN">×1</b></div>'+
   '<div class="prep-wrap"><div class="prep-top"><span>ŞEHİR HAZIRLIĞI</span><b id="hudPrepText">%0</b></div><div class="prep-track"><div class="prep-fill" id="hudPrepFill"></div></div></div>'+
   '<div class="hud-stat danger"><small>AÇIK RİSK</small><b id="hudFire">sakin</b></div>'+
   '<button class="end-turn" id="btnEndTurn">TURU BİTİR →</button><button class="icon-btn" data-act="menu" title="Menü">✕</button></div>'+
   '<div class="map-legend"><b>HARİTA</b><span><i style="background:#e3a850"></i>Eski, yoğun yapı</span><span><i style="background:#d9d47c"></i>Orta yoğunluk</span><span><i style="background:#93dc8c"></i>Yeni yapı</span><span><i style="background:#3fd2a8"></i>Hazırlanmış bölge</span><span><i style="background:#ff7a68;height:3px;vertical-align:3px"></i>Şematik fay izi</span><span>Oyun haritası · gerçek risk haritası değildir</span></div><div class="plan-bar" id="planBar"></div><div class="crisis-bar" id="crisisBar"></div><svg id="links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg><div id="layer"></div></div>'+chrome();
}
function ctRoot(){return $c('cityroot');}
function ctBind(){
  ctDrawLinks();ctBuildSites();ctOrderDraw();
  $c('btnEndTurn').addEventListener('click',e=>{e.stopPropagation();Sfx.init();ctEndTurn();});
  ctRoot().addEventListener('click',()=>ctClosePop());
  ctHud();ctPlanBar();
  if(CT.over)$c('btnEndTurn').disabled=true;
}
function ctDrawLinks(){
  const seen=new Set();let svg='';
  SITES.forEach(a=>a.nb.forEach(nid=>{
    const key=[a.id,nid].sort().join('-');if(seen.has(key))return;seen.add(key);
    const b=ctById[nid];svg+='<line data-link="'+key+'" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'"/>';
  }));
  $c('links').innerHTML=svg;
}
function ctBuildSites(){
  const layer=$c('layer');layer.innerHTML='';
  SITES.forEach(site=>{
    const el=document.createElement('button');el.type='button';el.className='site';el.dataset.site=site.id;el.style.left=site.x+'%';el.style.top=site.y+'%';
    el.innerHTML='<div class="site-ring"></div><div class="site-pill"><div class="site-dot">'+ico(site.icon)+'</div><div class="site-txt"><span class="site-tag">'+site.name+'</span><em class="site-risk"></em></div></div><div class="pips"><i class="pip"></i><i class="pip"></i><i class="pip"></i></div><div class="site-cost"></div>';
    el.addEventListener('click',e=>{e.stopPropagation();Sfx.init();ctOpenSite(site);});
    layer.appendChild(el);
  });
  ctPaint();
}
function ctSiteRisk(site,burning){
  const mult=(1+CT.risk*.008)*(ctPerk('koridor')?.85:1)*(ctPerk('konut')?.8:1)*(CT.drillProof.itfaiye?.95:1);
  return Math.round(Math.max(1,Math.min(75,.275*(1-CT.lv[site.id]/3*.85)*(burning?1.75:1)*mult*100)));
}
function ctPaint(){
  ctLife();
  const layer=$c('layer');if(!layer)return;
  const targets={};CT.plan.spreads.forEach(s=>targets[s.to]=true);if(CT.plan.ignite)targets[CT.plan.ignite]=true;
  SITES.forEach(site=>{
    const el=layer.querySelector('[data-site="'+site.id+'"]');if(!el)return;
    const lv=CT.lv[site.id],burning=ctBurning(site.id),step=ctNext(site);
    el.classList.remove('lv1','lv2','lv3','afford','maxed','fire','safe','incoming');
    el.querySelectorAll('.ember,.mark,.hz-badge,.crisis-badge').forEach(n=>n.remove());el.classList.remove('crisis');
    el.querySelectorAll('.pip').forEach((p,i)=>p.classList.toggle('on',i<lv));
    el.setAttribute('aria-label',site.name+', kademe '+lv+' / 3'+(burning?', açık risk: '+CT.fire[site.id].h.name:''));
    const rk=ctSiteRisk(site,burning),rke=el.querySelector('.site-risk');if(rke)rke.innerHTML='Kayıp ≈ <i class="rk '+(rk<=12?'g':rk<=22?'y':rk<=34?'o':'r')+'"></i>%'+rk;
    const zn=document.querySelector('#cityroot .zone.z-'+site.id);if(zn)zn.setAttribute('class','zone z-'+site.id+(burning?' fire':'')+(lv?' lv'+lv:''));
    if(burning){
      el.classList.add('fire');const f=CT.fire[site.id],em=document.createElement('div');em.className='ember';em.innerHTML=ico(f.h.icon);el.appendChild(em);
      el.querySelector('.site-cost').textContent=f.h.name.split(' ')[0].toUpperCase();
      const bd=document.createElement('div');bd.className='hz-badge hz-'+f.h.id;bd.innerHTML='<i>'+ico(f.h.icon)+'</i>'+(f.held?'BU TUR TUTULDU':(f.tamed&&f.h.drain)?'YATIŞTI':(f.opened&&f.h.lock)?'ROTA AÇIK':HZ_SHORT[f.h.id]);el.appendChild(bd);el.title=f.h.name+' — '+f.h.rule;
    }else{
      if(lv>0)el.classList.add('lv'+lv);if(lv>=3)el.classList.add('safe','maxed');
      if(step&&step.cost<=CT.budget)el.classList.add('afford');
      el.querySelector('.site-cost').textContent=step?(step.cost+' ◆'):'KORUMALI';
    }
    const cr=CT.crises.find(c=>c.site===site.id);
    if(cr){el.classList.add('crisis');const cb=document.createElement('div');cb.className='crisis-badge';cb.innerHTML='<span>'+ico('siren')+'</span><b>'+Math.ceil(cr.t)+'</b>';el.appendChild(cb);}
    if(targets[site.id]&&!burning){
      const mk=document.createElement('div');mk.className='mark';
      if(ctSafe(site.id))mk.innerHTML=ico('shield');else{el.classList.add('incoming');mk.innerHTML=ico('warn');}
      el.appendChild(mk);
    }
  });
  const threat={};CT.plan.spreads.forEach(s=>threat[[s.from,s.to].sort().join('-')]=true);
  ctCrisisBar();
  $c('links').querySelectorAll('line[data-link]').forEach(line=>{
    const key=line.dataset.link,ab=key.split('-');
    line.classList.toggle('hot',(ctBurning(ab[0])||ctBurning(ab[1]))&&!threat[key]);line.classList.toggle('threat',!!threat[key]);
  });
}
function ctPlanBar(){
  const bar=$c('planBar');if(!bar)return;
  if(CT.resolving||CT.over){bar.innerHTML='';return;}
  const chips=[];
  CT.plan.spreads.forEach(s=>{const to=ctById[s.to],from=ctById[s.from];
    chips.push(ctSafe(s.to)?'<span class="plan-chip safe">'+ico('shield')+' '+from.name+' → '+to.name+' · aynı risk burada yok</span>':'<span class="plan-chip">'+ico('hazard')+' '+from.name+' → '+to.name+' · aynı ihmal var</span>');});
  (CT.plan.erodes||[]).forEach(e=>chips.push('<span class="plan-chip">'+ico('drop')+' '+ctById[e.to].name+' kademesi düşecek</span>'));
  Object.keys(CT.fire).forEach(id=>{const f=CT.fire[id];if(f.held)return;
    if(f.h.drain&&!f.tamed)chips.push('<span class="plan-chip">'+ico('megaphone')+' '+ctById[id].name+' · −'+f.h.drain+' ◆ bütçe</span>');
    if(f.h.lock&&!f.opened)chips.push('<span class="plan-chip">'+ico('barrier')+' '+ctById[id].name+' · yatırım kilitli</span>');});
  if(CT.plan.ignite){const t=ctById[CT.plan.ignite];
    chips.push(ctSafe(t.id)?'<span class="plan-chip safe">'+ico('shield')+' '+t.name+' · yeni risk engellenecek</span>':'<span class="plan-chip">'+ico('bolt')+' Yeni risk: '+t.name+'</span>');}
  if(!chips.length)chips.push('<span class="plan-chip safe">'+ico('shield')+' Bu tur yeni tehdit yok</span>');
  bar.innerHTML=chips.join('');
}
function ctHud(){
  if(!$c('hudTurn'))return;
  $c('hudTurn').textContent=CT.turn;
  const lf=$c('hudLeft');lf.textContent=CT.fore?'YAKIN!':'3. tur sonu';lf.classList.toggle('low',!!CT.fore);
  const cb=$c('hudCombo');if(cb){cb.style.display=CT.combo>=1?'':'none';$c('hudComboN').textContent='×'+CT.combo;}
  $c('hudBudget').textContent=CT.budget+' ◆';$c('hudVisit').textContent=CT.visit?'1':'0';
  const p=ctPrep();$c('hudPrepText').textContent='%'+p;$c('hudPrepFill').style.width=p+'%';
  const f=ctFireCount();$c('hudFire').textContent=f===0?'sakin':f+' mahalle';
  ctRoot().style.setProperty('--alarm',Math.min(1,f/6).toFixed(2));
  ctMissions();ctFamilyUpdate();
  const status=$c('cityStatus');if(status)status.innerHTML='<span>'+ico('shield')+' Kalıcı görev ödülü: '+Object.keys(CT.doneMissions).length+'</span><span>'+ico('map')+' Rota avantajı: '+(CT.drillProof.itfaiye?'%5 · kalıcı':'henüz yok')+'</span><span>'+ico('siren')+' Bu turun acil riski: '+CT.crises.length+'</span><span class="failure-budget">Kaçırılan acil risk: '+(CT.crisisFail||0)+'/3 · 3 olursa oyun biter</span>';
}
function ctMissions(){
  if(CT.order){ctOrderUI();return;}
  const box=$c('missions');if(!box)return;
  const id=CT.mAct[0];if(!id){box.innerHTML='';return;}
  const m=MISSIONS.find(x=>x.id===id),done=ctPerk(m.id),nw=CT.mNew===id,got=ctMProg(m),all=m.sites.length;
  const chips=m.sites.map(sid=>{const s=ctById[sid],lv=CT.lv[sid],ok=lv>=m.need;
    return '<div class="mchip'+(ok?' ok':'')+'" data-site="'+sid+'"><span class="mi">'+ico(s.icon)+'</span><b>'+s.name+'</b><span class="mp">'+[1,2,3].map(n=>'<i class="'+(n<=lv?'on':'')+(n===m.need?' tgt':'')+'"></i>').join('')+'</span><em>'+(ok?'✓':'')+'</em></div>';}).join('');
  box.innerHTML='<div class="mission'+(done?' done':'')+(nw?' arrive':'')+'" data-mission="'+m.id+'">'+
    '<div class="m-tag">'+(done?'GÖREV TAMAM':'YENİ GÖREV')+'</div>'+
    '<div class="m-name">'+m.name+'</div>'+
    '<div class="m-goal">Şu mahalleleri <b>kademe '+m.need+'</b> yap ('+got+'/'+all+')</div>'+
    '<div class="m-chips">'+chips+'</div>'+
    '<div class="m-rew"><span>KALICI ÖDÜL</span>'+m.perk+'</div>'+
    (done?'<div class="m-stamp">✓</div>'+[...Array(10)].map((_,i)=>'<i class="spk" style="--a:'+(i*36)+'deg;--d:'+(46+(i%3)*14)+'px"></i>').join(''):'')+
  '</div>';
  const el=box.querySelector('.mission');
  el.addEventListener('mouseenter',()=>ctHighlight(m.sites));el.addEventListener('mouseleave',()=>ctHighlight([]));
  el.addEventListener('click',e=>{e.stopPropagation();ctHighlight(m.sites);ctToast(m.name+' · kademe '+m.need+'+',m.fact,false);});
}
/* Tek görev: gelir, titrer; bitince kutlanır, gider; sıradaki gelir */
function ctMissionArrive(){
  if(!CT||CT.over||!$c('missions')||CT.mAct.length>=1)return;
  const id=CT.mQ.find(i=>!ctPerk(i));
  if(!id)return;
  CT.mQ=CT.mQ.filter(i=>i!==id);CT.mAct=[id];CT.mNew=id;Sfx.warn();ctMissions();
  const cur=CT;setTimeout(()=>{if(CT===cur&&CT.mNew===id){CT.mNew=null;const el=document.querySelector('.mission[data-mission="'+id+'"]');if(el)el.classList.remove('arrive');}},2600);
}
function ctMissionDone(id){
  const cur=CT;
  if(CT.mAct[0]!==id){CT.mAct.forEach(x=>CT.mQ.unshift(x));CT.mQ=CT.mQ.filter(x=>x!==id);CT.mAct=[id];CT.mNew=null;}
  ctMissions();
  setTimeout(()=>{if(CT!==cur)return;const el=document.querySelector('.mission[data-mission="'+id+'"]');if(el)el.classList.add('leave');
    setTimeout(()=>{if(CT!==cur)return;CT.mAct=[];ctMissions();setTimeout(()=>{if(CT===cur)ctMissionArrive();},700);},450);},2600);
}
function ctHighlight(ids){const layer=$c('layer');if(!layer)return;layer.querySelectorAll('.site').forEach(el=>el.classList.toggle('hl',ids.indexOf(el.dataset.site)!==-1));}
let ctToastT=null;
function ctToast(title,text,bad){
  const root=ctRoot();if(!root)return;const old=root.querySelector('.ctoast');if(old)old.remove();
  const el=document.createElement('div');el.setAttribute('role','status');el.className='ctoast'+(bad?' bad':'');el.innerHTML='<b></b><span></span>';
  el.querySelector('b').textContent=title;el.querySelector('span').textContent=text;root.appendChild(el);
  clearTimeout(ctToastT);ctToastT=setTimeout(()=>el.remove(),4200);
}
function ctFloat(site,text,bad){
  const layer=$c('layer');if(!layer)return;const el=document.createElement('div');el.className='float'+(bad?' bad':'');
  el.style.left=site.x+'%';el.style.top=site.y+'%';el.textContent=text;layer.appendChild(el);setTimeout(()=>el.remove(),1100);
}
function ctClosePop(){const p=document.querySelector('#cityroot .pop');if(p)p.remove();}

/* ---------- mahalle balonu ---------- */
function ctOpenSite(site){
  if(!CT||CT.resolving||CT.over)return;
  ctOrderInspect(site);
  ctClosePop();
  const pop=document.createElement('div');pop.className='pop';pop.setAttribute('role','dialog');pop.setAttribute('aria-label',site.name+' önlemleri');
  pop.style.left=Math.max(14,Math.min(86,site.x))+'%';pop.style.top=Math.min(62,site.y+6)+'%';
  if(ctBurning(site.id)){
    const f=CT.fire[site.id],h=f.h;
    pop.innerHTML='<button class="pop-close" aria-label="Kapat">×</button><div class="pop-step">'+ico(h.icon)+' '+h.name.toUpperCase()+' · '+site.name+'</div><h3 class="hz-rule"></h3><p class="hz-fact"></p><div class="hz-opts"></div>';
    pop.querySelector('.hz-rule').textContent=h.rule;pop.querySelector('.hz-fact').textContent=h.fact+' Açık kalan risk, depremde bu mahallenin kayıp çarpanını 1,75 yapar ve adil şehir puanını düşürür. Geçici önlem riski kapatmaz.';
    const box=pop.querySelector('.hz-opts');
    h.responses.forEach(opt=>{
      if(opt.kind==='yatistir'&&f.tamed)return;if(opt.kind==='ac'&&f.opened)return;if(opt.kind==='tut'&&f.held)return;
      const cost=opt.kind==='sondur'?Math.max(0,opt.cost-(ctPerk('saglik')?2:0)):opt.cost;
      const b=document.createElement('button');b.className='hz-opt'+(opt.kind==='sondur'?' full':'');b.disabled=cost>CT.budget;
      b.innerHTML='<span class="hz-top"><b></b><i>'+(cost?cost+' ◆':'ÜCRETSİZ')+'</i></span><span class="hz-desc"></span>';
      b.querySelector('b').textContent=opt.label;b.querySelector('.hz-desc').textContent=opt.desc;
      b.addEventListener('click',e=>{e.stopPropagation();ctRespond(site,opt,cost);});box.appendChild(b);
    });
    if(!f.tried){
      const b=document.createElement('button');b.className='hz-opt visit';
      b.innerHTML='<span class="hz-top"><b>'+ico('game')+' Önlemi kendin uygula</b><i>ÜCRETSİZ</i></span><span class="hz-desc">Kısa bir mini oyun: doğru önlemi sen uygula. Başarırsan risk kapanır (+bonus ◆, KOMBO); başarısızsan şehir riski artar. Tek hak.</span>';
      b.addEventListener('click',e=>{e.stopPropagation();ctHazardMicro(site);});box.appendChild(b);
    }
  }else{
    const step=ctNext(site);
    if(step){
      pop.innerHTML='<button class="pop-close" aria-label="Kapat">×</button><div class="pop-step">KADEME '+(CT.lv[site.id]+1)+' / 3 · '+site.name+'</div><h3></h3><p></p><button class="pop-buy"><span class="buy-label"></span><span class="buy-cost"></span></button><button class="pop-visit"><span>'+ico((DRILL_LABEL[site.id]||['home'])[0])+' '+(DRILL_LABEL[site.id]||['','Git'])[1]+': '+(DRILL_LABEL[site.id]||['','','Tatbikat'])[2]+'</span><i>ÜCRETSİZ · turda 1 kez</i></button>';
      pop.querySelector('h3').textContent=step.label;
      pop.querySelector('p').textContent=step.fact+(CT.lv[site.id]===2?' Son kademe: bu mahalle yeni risklere tamamen kapanır.':'')+(CT.order?(ctOrderTarget()===site.id?' Keşif hazır: 8 dk ekip süresi, 1 ◆ indirim.':' Ekip başka işe yönlenecek: 12 dk ekip süresi ve '+Math.min(2,Math.max(0,10-CT.detours*2))+' puan yeniden planlama kaybı.'):'');
      const price=ctOrderCost(site,step);const btn=pop.querySelector('.pop-buy'),ok=price<=CT.budget&&ctOrderCanWork(site,false); btn.disabled=!ok;
      btn.querySelector('.buy-label').textContent=ok?'Uygula':price>CT.budget?'Bütçe yetersiz':'Ekip süresi yetersiz';btn.querySelector('.buy-cost').textContent=price+' ◆';
      btn.addEventListener('click',e=>{e.stopPropagation();ctBuy(site,step);});
      const v=pop.querySelector('.pop-visit');v.disabled=!CT.visit||!ctOrderCanWork(site,false);if(CT.visit&&!ctOrderCanWork(site,false))v.querySelector('i').textContent='Ekip süresi yetersiz';if(!CT.visit)v.querySelector('i').textContent='Bu tur kullanıldı';
      v.addEventListener('click',e=>{e.stopPropagation();ctVisit(site);});
    }else pop.innerHTML='<button class="pop-close" aria-label="Kapat">×</button><div class="pop-step">'+ico('shield')+' '+site.name+'</div><h3>Korumalı</h3><p>Bu mahalle tam hazır. Buradaki hazırlık, komşudaki ihmalin bu mahalleye de yansımasını engeller.</p>';
  }
  const crs=CT.crises.find(c=>c.site===site.id);
  if(crs){const cb=document.createElement('button');cb.className='hz-opt visit crisis-opt';cb.innerHTML='<span class="hz-top"><b>'+ico('siren')+' ACİL RİSK: '+crs.title+'</b><i>'+Math.ceil(crs.t)+' sn</i></span><span class="hz-desc">Şimdi önlemi uygula! Süre dolarsa burada risk açığa çıkar.</span>';
    cb.addEventListener('click',e=>{e.stopPropagation();ctStartCrisis(crs);});pop.insertBefore(cb,pop.querySelector('.pop-step').nextSibling);}
  pop.querySelector('.pop-close').addEventListener('click',e=>{e.stopPropagation();ctClosePop();});
  pop.addEventListener('click',e=>e.stopPropagation());ctRoot().appendChild(pop);pop.querySelector('button').focus({preventScroll:true});
  {const rt=ctRoot(),rr=rt.getBoundingClientRect(),pr=pop.getBoundingClientRect(),k=(rt.offsetHeight?rr.height/rt.offsetHeight:1)||1;
   if(pr.bottom>rr.bottom-10)pop.style.top=Math.max(70,pop.offsetTop-(pr.bottom-rr.bottom+10)/k)+'px';}
}
function ctLevelUp(site){
  ctOrderRecord(site);
  CT.lv[site.id]++;
  const completed=MISSIONS.filter(m=>ctMDone(m)&&!ctPerk(m.id)),jd=completed[0];
  completed.forEach(m=>{CT.doneMissions[m.id]=true;});
  if(CT.lv[site.id]>=3)Sfx.win();else Sfx.fix();
  ctFloat(site,CT.lv[site.id]>=3?'KORUMALI':'KADEME '+CT.lv[site.id]);
  if(jd){CT.doneMissions[jd.id]=true;Sfx.win();ctMissionDone(jd.id);return['✓ GÖREV TAMAMLANDI · '+jd.name,jd.fact+' Kazanılan: '+jd.perk+'.'];}
  return null;
}
function ctBuy(site,step){
  if(!CT||CT.resolving||CT.over||S.mode!=='cmap'||step!==ctNext(site)||ctOrderCost(site,step)>CT.budget)return;
  if(ctBurning(site.id)){const f=CT.fire[site.id];if(!(f.h.lock&&f.opened))return;}
  if(!ctOrderCanWork(site,true))return;
  CT.budget-=ctOrderCost(site,step);const m=ctLevelUp(site);
  ctClosePop();ctPaint();ctPlanBar();ctHud();
  if(m)ctToast(m[0],m[1],false);else ctToast(step.label,step.fact,false);
}
function ctRespond(site,opt,cost){
  const f=CT.fire[site.id];if(!f||cost>CT.budget)return;CT.budget-=cost;
  if(opt.kind==='sondur'){delete CT.fire[site.id];CT.putOut++;CT.plan.spreads=CT.plan.spreads.filter(x=>x.from!==site.id);CT.plan.erodes=(CT.plan.erodes||[]).filter(x=>x.from!==site.id);Sfx.fix();ctFloat(site,'ÇÖZÜLDÜ');ctToast('Risk giderildi · '+site.name,f.h.fact,false);}
  else if(opt.kind==='tut'){f.held=true;CT.plan.spreads=CT.plan.spreads.filter(x=>x.from!==site.id);CT.plan.erodes=(CT.plan.erodes||[]).filter(x=>x.from!==site.id);Sfx.safe();ctFloat(site,'BU TUR TUTULDU');ctToast('Geçici önlem · '+site.name,'Bu tur etkisiz. Ama risk duruyor: sonraki tur yine aynı kuralla işleyecek.',true);}
  else if(opt.kind==='yatistir'){f.tamed=true;Sfx.safe();ctFloat(site,'BÜTÇE KAYBI DURDU');ctToast('Bilgi akışı düzenlendi · '+site.name,'Bütçe kaybı durdu. Risk duruyor ve deprem anında hâlâ sayılacak.',true);}
  else if(opt.kind==='ac'){f.opened=true;Sfx.safe();ctFloat(site,'YATIRIM AÇILDI');ctToast('Alternatif rota işaretlendi · '+site.name,'Artık bu mahalleye yatırım yapabilirsin. Tıkalı yol duruyor.',true);}
  ctClosePop();ctPaint();ctPlanBar();ctHud();
}

/* ---------- tur akışı ---------- */
function ctIgnite(site,hazard){
  if(ctBurning(site.id))return;
  CT.fire[site.id]={h:hazard||ctPick(HAZARDS),held:false,tamed:false,opened:false,tried:false};CT.totalFires++;Sfx.warn();
}
function ctMakePlan(){
  const spreads=[],erodes=[];
  Object.keys(CT.fire).forEach(id=>{
    const f=CT.fire[id],from=ctById[id];if(f.held)return;
    const free=from.nb.filter(n=>!ctBurning(n));
    for(let k=0;k<(f.h.spread||0)&&free.length;k++){const t=free.splice(Math.floor(Math.random()*free.length),1)[0];spreads.push({from:id,to:t});}
    if(f.h.erode){const hd=from.nb.filter(n=>CT.lv[n]>0);if(hd.length)erodes.push({from:id,to:ctPick(hd)});}
  });
  const calm=SITES.filter(s=>!ctBurning(s.id)&&!spreads.some(sp=>sp.to===s.id));
  CT.plan={spreads,ignite:calm.length?ctPick(calm).id:null,erodes};
}
function ctStartTurn(){
  if(ctCheckGameOver())return;
  CT.budget+=ctIncome();CT.visit=true;ctMakePlan();if(CT.turn>=2)Sfx.safe();
  CT.clock=0;CT.crisisQ=[];
  // Eşit tur yükü: okuma hızından bağımsız, bütün acil riskler tur başında görünür.
  if(CT.turn>=2)for(let i=0;i<(CT.turn>=4?2:1);i++)ctSpawnCrisis();
  ctBuildOrder();
  if($c('btnEndTurn')){ctPaint();ctPlanBar();ctHud();$c('btnEndTurn').disabled=false;$c('btnEndTurn').textContent='TURU BİTİR →';
    if(CT.turn===CT.quakeTurn-1&&!CT.fore){CT.fore=true;ctForeshock();}
    if(CT.turn>=2)setTimeout(ctMissionArrive,900);}
}
function ctFly(from,to,done){
  const current=CT,hazard=CT.fire[from.id]&&CT.fire[from.id].h;
  const layer=$c('layer');if(!layer||!hazard){done();return;}
  const sp=document.createElement('div');sp.className='spark';sp.style.left=from.x+'%';sp.style.top=from.y+'%';sp.style.transitionDuration=CT_SPARK+'s';layer.appendChild(sp);Sfx.spark();
  requestAnimationFrame(()=>{sp.style.left=to.x+'%';sp.style.top=to.y+'%';});
  setTimeout(()=>{
    if(CT!==current||!$c('layer')){done();return;}
    sp.remove();
    if(ctBurning(to.id)){done();return;}
    if(ctSafe(to.id)){CT.blocked++;Sfx.safe();const el=document.createElement('div');el.className='blocked';el.style.left=to.x+'%';el.style.top=(to.y-6)+'%';el.textContent='ENGELLENDİ';layer.appendChild(el);setTimeout(()=>el.remove(),1200);
      ctToast('Zincir kırıldı · '+to.name,'Tam hazır mahallede aynı ihmal yok. Bir mahallenin hazırlığı komşusunu da korur.',false);}
    else{Sfx.warn();ctIgnite(to,hazard);ctToast('Komşuda da aynı ihmal · '+to.name,'Aynı eski tesisat ve alışkanlıklar burada da vardı; denetlenmediği için risk açığa çıktı.',true);}
    ctPaint();done();
  },CT_SPARK*1000);
}
function ctEndTurn(){
  if(!CT||S.paused||document.hidden||CT.resolving||CT.over||S.mode!=='cmap')return;
  if(CT.crises.length&&!CT.endWarn){CT.endWarn=true;Sfx.nope();ctToast('Acil risk var!','Önce önlemi uygula. Yine de turu bitirmek istersen tekrar bas: çözülmeyen acil risk açığa çıkar.',true);setTimeout(()=>{if(CT)CT.endWarn=false;},6000);return;}
  CT.endWarn=false;CT.crises.slice().forEach(ctCrisisFail);CT.crisisQ=[];
  if(ctCheckGameOver())return;
  const current=CT;CT.resolving=true;Sfx.click();ctClosePop();
  $c('btnEndTurn').disabled=true;$c('btnEndTurn').textContent='TUR İŞLENİYOR…';$c('planBar').innerHTML='';
  const queue=CT.plan.spreads.slice(),igniteId=CT.plan.ignite;let i=0;
  const next=()=>{
    if(CT!==current||S.mode!=='cmap')return;
    if(i<queue.length){const s=queue[i++];if(!ctBurning(s.from)){next();return;}ctFly(ctById[s.from],ctById[s.to],()=>setTimeout(next,160));return;}
    if(igniteId){const t=ctById[igniteId];
      if(ctSafe(igniteId)){CT.blocked++;ctFloat(t,'ENGELLENDİ');ctToast('Yeni risk engellendi · '+t.name,'Tam hazır mahalle riski daha doğmadan durdurdu.',false);}
      else{ctIgnite(t);ctFloat(t,'YENİ RİSK',true);ctToast('Yeni risk · '+t.name,CT.fire[t.id].h.fact,true);}
      ctPaint();setTimeout(ctFinish,700);return;}
    ctFinish();
  };
  setTimeout(next,250);
}
function ctFinish(){
  if(!CT||S.mode!=='cmap')return;
  Object.keys(CT.fire).forEach(id=>{const f=CT.fire[id];if(f.held)return;
    if(f.h.drain&&!f.tamed){CT.budget=Math.max(0,CT.budget-f.h.drain);ctToast(''+ctById[id].name,'Panik bütçeden '+f.h.drain+' ◆ götürdü.',true);}});
  (CT.plan.erodes||[]).forEach(e=>{if(!ctBurning(e.from)||CT.fire[e.from].held)return;
    if(CT.lv[e.to]>0){CT.lv[e.to]--;ctFloat(ctById[e.to],'KADEME −1',true);ctToast(''+ctById[e.to].name,'Su hattı patlağı bir kademeyi geri aldı.',true);}});
  Object.values(CT.fire).forEach(f=>{f.held=false;});
  CT.risk+=ctFireCount()*CT_RISK;CT.resolving=false;CT.turn++;
  if(CT.turn>CT.quakeTurn){ctQuake();return;}
  const cur=CT,done=CT.turn-1,root=ctRoot();
  if(!root||matchMedia('(prefers-reduced-motion: reduce)').matches){ctStartTurn();return;}
  CT.resolving=true;Sfx.win&&Sfx.win();
  const bn=document.createElement('div');bn.className='turn-banner';bn.setAttribute('role','status');
  bn.innerHTML='<small>'+(done===CT.quakeTurn-1?'DEPREM ÖNCESİ SON TUR':'TUR TAMAMLANDI')+'</small><h2>'+done+'. TUR BİTTİ</h2><p>'+(CT.turn>=CT.quakeTurn?'Son tur başlıyor · bu turun sonunda deprem olacak':CT.turn+'. tur başlıyor')+'</p>';
  root.appendChild(bn);
  setTimeout(()=>{bn.remove();if(CT!==cur||S.mode!=='cmap')return;CT.resolving=false;ctStartTurn();},2000);
}

/* ---------- mini oyunlar: mahalleye gir ---------- */
function ctVisit(site){
  if(!CT.visit||!ctOrderCanWork(site,true))return;ctClosePop();
  if(site.id!=='konut'){Sfx.click();drillOpen(site.id,site);return;}
  R=makeRun(-1,null,MINI_L.prep);R.mini={kind:'prep',site:site.id};S.level=-1;S.hover=null;S.hoverP=-1;S.hoverKey=null;S.conf=false;S.infoItem=false;S.shake=0;parts.length=0;
  go('prep');Sfx.calm(true);
}
function ctHazardMicro(site){
  const f=CT.fire[site.id];if(!f||f.tried)return;f.tried=true;ctClosePop();Sfx.click();
  drillOpen(ctDrillKey(f.h.id,ctPickVariant(f.h.id)),site,{hazard:f,title:f.h.name+' · '+site.name+' önlemi',icon:f.h.icon});
}
/* Mini oyun varyantı: klasik · :q bilgi sorusu · :o doğru sıra.
   Aynı tür+varyant ve art arda aynı varyant tekrar edilmez (havuz tükenene kadar). */
function ctPickVariant(hz){
  const h=CT.varHist||(CT.varHist=[]),vs=['','q','o'],n=f=>h.filter(f).length,last=h.length?h[h.length-1].v:null;
  const sc=vs.map(v=>({v,s:n(x=>x.hz===hz&&x.v===v)*10+n(x=>x.v===v)*3+(last===v?5:0)+Math.random()})).sort((a,b)=>a.s-b.s)[0];
  h.push({hz,v:sc.v});return sc.v;
}
function ctDrillKey(hz,v){return 'hz:'+hz+(v?':'+v:'');}
function ctStartCrisis(c){
  if(!c||!CT||S.mode!=='cmap'||CT.resolving)return;ctClosePop();Sfx.click();
  if(c.v===undefined)c.v=ctPickVariant(c.hz);drillOpen(ctDrillKey(c.hz,c.v),ctById[c.site],{crisis:c,title:c.title,icon:'siren'});
}
function ctSpawnCrisis(){
  const free=new Set(SITES.filter(s=>!ctBurning(s.id)&&!ctSafe(s.id)&&!CT.crises.some(c=>c.site===s.id)).map(s=>s.id));
  if(!free.size)return;
  const hist=CT.crisisHist||(CT.crisisHist=[]),live=CT.crises.map(c=>c.hz),cands=[];
  Object.keys(CRISIS_POOL).forEach(hz=>CRISIS_POOL[hz].forEach(e=>{if(free.has(e.site))cands.push({hz,site:e.site,t:e.t});}));
  if(!cands.length)return;
  // Tekrar cezaları: aynı metin >> aynı anda aynı tür >> daha önce görülen tür > aynı mahalle.
  const n=f=>hist.filter(f).length,last=hist.length?hist[hist.length-1].hz:null;
  cands.forEach(c=>{c.score=n(u=>u.t===c.t)*1000+(live.indexOf(c.hz)>=0?500:0)+(last===c.hz?250:0)+n(u=>u.hz===c.hz)*60+n(u=>u.site===c.site)*25+Math.random();});
  cands.sort((x,y)=>x.score-y.score);
  const pick=cands[0],site=ctById[pick.site];
  hist.push({hz:pick.hz,site:pick.site,t:pick.t});
  const limit=CT.cid===0?70:CT_CRISIS_T;
  CT.crises.push({id:++CT.cid,site:site.id,hz:pick.hz,title:pick.t,t:limit,max:limit});Sfx.warn();
  ctToast('ACİL RİSK · '+site.name,pick.t+' — '+limit+' sn içinde uyarıya tıkla. Mahalle penceresinde ve duraklatmada süre işlemez.',true);ctPaint();
}
function ctCrisisFail(c){
  CT.crises=CT.crises.filter(x=>x!==c);CT.combo=0;CT.crisisFail=(CT.crisisFail||0)+1;
  const site=ctById[c.site];
  if(!ctSafe(site.id)&&!ctBurning(site.id)){ctIgnite(site,HAZARDS.find(h=>h.id===c.hz));ctFloat(site,'ÖNLEM ALINMADI',true);}
  ctToast((CT.crisisFail===2?'SON ŞANS · ':'✗ Önleme yetişemedin · ')+site.name,c.title+' — risk açığa çıktı.'+(CT.crisisFail===2?' Bir acil risk daha kaçarsa oyun biter.':''),true);Sfx.fail();
  ctPaint();ctPlanBar();ctHud();
}
function ctCrisisBar(){
  const bar=$c('crisisBar');if(!bar)return;
  const sig=CT.crises.map(c=>c.id).join(',');
  if(bar.dataset.sig!==sig){bar.dataset.sig=sig;
    bar.innerHTML=CT.crises.map(c=>'<button class="cr-item" data-cr="'+c.id+'"><span>'+ico('siren')+'</span><div><b>'+ctById[c.site].name+'</b><small>'+c.title+'</small></div><i id="crT'+c.id+'">'+Math.ceil(c.t)+'</i></button>').join('');
    bar.querySelectorAll('.cr-item').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();ctStartCrisis(CT.crises.find(c=>c.id===+b.dataset.cr));}));}
  CT.crises.forEach(c=>{const t=$c('crT'+c.id);if(t){t.textContent=Math.ceil(c.t);t.parentNode.classList.toggle('urgent',c.t<8);}
    const nb=document.querySelector('#layer [data-site="'+c.site+'"] .crisis-badge b');if(nb)nb.textContent=Math.ceil(c.t);});
}
function ctTick(){
  if(!CT||S.mode!=='cmap'||S.paused||document.hidden||CT.resolving||CT.over||!$c('layer'))return;
  if(document.querySelector('#cityroot .pop'))return;
  CT.clock+=.1;
  CT.crises.forEach(c=>{c.t-=.1;});
  CT.crises.filter(c=>c.t<=0).forEach(ctCrisisFail);
  if(ctCheckGameOver())return;
  ctCrisisBar();
}
function ctDust(ms){const root=ctRoot();if(!root)return;let d=root.querySelector('.dust-fx');if(!d){d=document.createElement('div');d.className='dust-fx';root.appendChild(d);}
  requestAnimationFrame(()=>d.classList.add('on'));if(ms>0)setTimeout(()=>{d.classList.remove('on');setTimeout(()=>d.remove(),900);},ms);}
function ctForeshock(){
  const root=ctRoot();if(!root)return;ctDust(3200);
  root.classList.add('quaking');Sfx.rumble(true);Sfx.rumbleLevel(.35);setTimeout(()=>{Sfx.rumble(false);if(root)root.classList.remove('quaking');},1100);
  ctToast('ÖNCÜ SARSINTI!','Oyun uyarısı: hazırlığını tamamla, açık riskleri kapat! Gerçekte sarsıntılardan sonraki depremin zamanı bilinemez.',true);ctHud();
}
function ctMiniHazard(site){
  const f=CT.fire[site.id];if(!f)return;f.tried=true;ctClosePop();
  const kind=f.h.id==='gaz'?'gas':'fire';
  R=makeRun(-1,null,MINI_L[kind]);R.mini={kind,site:site.id};S.level=-1;S.shake=0;parts.length=0;
  R.q={t:13.2,evs:[],blackout:false,haze:0,ended:true,front:1400,creakT:0,endT:0};
  const slots=[470,436,504];R.people.forEach((p,i)=>{p.x=slots[i%3];p.tx=p.x;p.state='shelter';p.sheltered=true;p.spot=TABLE;});
  R.sel=0;startAfter();
}
function miniCheck(){
  const a=R.after,k=R.mini.kind;
  if(k==='gas'){if(R.sparked)return{ok:false,why:'Kıvılcım gazı tutuşturdu: ışığa/anahtara dokunmamalıydın.'};
    if(R.gasClosed&&R.winOpen)return{ok:true,why:'Pencereyi açıp vanayı kapattın, hiçbir anahtara dokunmadın: gaz kaçağı güvenle giderildi.'};
    if(a.t>=18)return{ok:false,why:'Süre doldu: gaz birikti. Önce havalandır, sonra vanayı kapat.'};}
  if(k==='fire'){if(R.bigFire)return{ok:false,why:'Yangın kontrolden çıktı: elektriği kesmeden müdahale etmek vakit kaybettirdi.'};
    if(a.extinguished)return{ok:true,why:R.shock?'Yangını söndürdün ama önce elektriği kesmeliydin (çarpılma riski).':'Önce şalteri indirip sonra söndürücüyü kullandın: doğru sıra!'};
    if(a.t>=18)return{ok:false,why:'Süre doldu: yangın büyüdü. Önce elektriği kes, sonra söndür.'};}
  return null;
}
function miniEnd(r){
  R.mini.done=true;const id=R.mini.site,site=ctById[id],f=CT.fire[id];CT.minis++;
  if(r.ok){CT.miniOk++;if(f){delete CT.fire[id];CT.putOut++;CT.plan.spreads=CT.plan.spreads.filter(x=>x.from!==id);CT.plan.erodes=(CT.plan.erodes||[]).filter(x=>x.from!==id);}Sfx.win();}
  else{CT.risk+=CT_RISK;Sfx.fail();}
  S.mres={ok:r.ok,title:r.ok?'Müdahale başarılı':'Müdahale başarısız',lines:[r.why,r.ok?site.name+' mahallesindeki tehlike ücretsiz giderildi.':'Tehlike mahallede duruyor ve şehir riski arttı.'],toast:null};
  go('minires');
}
function miniFinishPrep(){
  if(S.mode!=='prep'||!R.mini||R.mini.done)return;R.mini.done=true;
  const site=ctById[R.mini.site],keys=Object.keys(R.fixed),n=keys.length;
  CT.visit=false;CT.visits++;if(site.id==='konut')keys.forEach(k=>CT.homeFixed[k]=true);
  let lines=[],ok=n>=3,toast=null;
  if(!ok)ctOrderFailure(site);
  if(ok&&CT.lv[site.id]<3){toast=ctLevelUp(site);lines.push(n+' tehlikeyi giderdin: '+site.name+' bir kademe yükseldi (ücretsiz).');}
  else if(ok)lines.push('Bu mahalle zaten tam hazır.');
  else lines.push('Yalnızca '+n+' tehlikeyi gidermiştin; kademe için en az 3 gerekiyordu. Süreni en önemli tehlikelere harca.');
  if(site.id==='konut'&&n>0)lines.push('Konutlar mahallesindeki evde giderdiğin tehlikeler deprem anında da geçerli olacak.');
  S.mres={ok,title:ok?'Tatbikat başarılı':'Tatbikat yetersiz',lines,toast};go('minires');
}
function miniResUI(){
  const m=S.mres;
  const st=(m.stars!=null)?'<div class="mstars">'+'★'.repeat(m.stars)+'<i>'+'★'.repeat(3-m.stars)+'</i></div>':'';
  return chrome()+'<div class="dim"></div><div class="panel modal bridge" style="width:660px"><div class="kicker">'+(m.ok?'BAŞARILI':'OLMADI')+'</div><h2>'+m.title+'</h2>'+st+m.lines.map(l=>'<p class="lead">'+l+'</p>').join('')+
   (m.learn?'<p class="learn">'+ico('bulb')+' '+m.learn+'</p>':'')+
   '<div style="text-align:right;margin-top:14px"><button class="btn primary" style="font-size:16px;padding:10px 28px" data-act="minicont">Haritaya dön →</button></div></div>';
}
function miniBack(){
  const t=S.mres&&S.mres.toast;go('cmap');
  if(t)ctToast(t[0],t[1],false);
}
function miniPanelHTML(){
  const keys=R.L.hz,n=Object.keys(R.fixed).length;
  return '<h2>EV TATBİKATI <span>'+n+' / 3</span></h2><p style="margin:2px 0 8px;font-size:14px;line-height:1.45;color:#d6dcf5">Hedef: <b>45 dk</b> içinde en az <b>3 tehlikeyi</b> gider. Süre hepsine yetmez; en tehlikeli olanları seç.</p>'+
   '<div class="mlist">'+keys.map(k=>{const h=HZ[k],fx=R.fixed[k];return '<div class="mrow'+(fx?' on':'')+'"><span class="bx">'+(fx?'✓':'!')+'</span><b>'+h.n+'</b><i>'+(fx?'yapıldı':h.cost+' dk')+'</i></div>';}).join('')+'</div>'+
   '<button class="btn primary go" data-act="minifin" style="font-size:16px;padding:12px;margin-top:auto">TATBİKATI BİTİR</button>';
}

/* ---------- deprem ve şehir sonucu ---------- */
function ctQuake(){
  /* Deprem: şehir animasyonu ve ayrı sonuç ekranı yok. Sonuç sessizce hesaplanır,
     harita Konutlar mahallesine yakınlaşır, sonra doğrudan ev içi göreve geçilir. */
  const current=CT;CT.over=true;ctClosePop();$c('planBar').innerHTML='';$c('btnEndTurn').disabled=true;
  const mag=6.5+Math.random(),root=ctRoot();
  ctResults(mag,true);
  const c=ctCityData(),plan=campPlan(c);S.camp={city:c,plan};
  const home=ctById.konut,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('zooming','quaking');root.classList.add('quaking');ctDust(0);
  const org=home.x+'% '+home.y+'%',rc=root.getBoundingClientRect(),tx=((50-home.x)/100*rc.width).toFixed(0),ty=((50-home.y)/100*rc.height).toFixed(0);
  ['mapSlot','links','layer'].forEach(id=>{const el=$c(id);if(el){el.style.transformOrigin=org;el.style.setProperty('--zt','translate('+tx+'px,'+ty+'px) scale(3.4)');}});
  const cap=document.createElement('div');cap.className='zoom-cap';
  cap.innerHTML='<small>DEPREM · BÜYÜKLÜK '+mag.toFixed(1)+'</small><h1>Konutlar mahallesi</h1><p>'+plan.why+'</p>';root.appendChild(cap);
  Sfx.quakeStart();Sfx.rumble(true);Sfx.rumbleLevel(.12);
  requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('zoom-go')));
  setTimeout(()=>{Sfx.rumble(false);root.classList.remove('quaking');if(CT!==current||S.mode!=='cmap')return;
    root.classList.add('zoom-fade');
    setTimeout(()=>{if(CT!==current||S.mode!=='cmap')return;Sfx.click();startLevel(plan.li,plan.opts);},reduced?200:600);
  },reduced?900:2600);
}
/* Aynı tur sayısındaki bütçe ve ücretsiz tatbikat fırsatlarıyla ulaşılabilir
   nüfus ağırlıklı hazırlık. DP: harcama / kullanılan ücretsiz kademe. */
const ctReferenceCache={};
function ctReference(turn){
  if(ctReferenceCache[turn])return ctReferenceCache[turn];
  const cash=CT_START+CT_INCOME*(turn-1),free=turn;
  let dp=new Map([['0,0,0',0]]);
  SITES.forEach(site=>{
    const next=new Map();
    dp.forEach((value,key)=>{const [spent,used,built]=key.split(',').map(Number);
      for(let lv=0;lv<=3;lv++)for(let f=0;f<=Math.min(lv,free-used);f++){
        // Ücretsiz kademe en pahalı basamağı karşılar; bu iyimser bir üst sınırdır.
        const cost=site.steps.slice(0,lv-f).reduce((a,x)=>a+x.cost,0);
        if(spent+cost>cash||built+lv>turn*2)continue;
        const k=(spent+cost)+','+(used+f)+','+(built+lv),v=value+site.pop*.85*lv/3;
        if(v>(next.get(k)??-1))next.set(k,v);
      }
    });dp=next;
  });
  return ctReferenceCache[turn]=Math.max(...dp.values())/CT_POP;
}
function ctBaseScore(){
  const prevention=SITES.reduce((v,s)=>v+s.pop*.85*CT.lv[s.id]/3,0)/CT_POP;
  const exposed=SITES.reduce((v,s)=>v+(ctBurning(s.id)?s.pop*.18:0),0)/CT_POP;
  return Math.round(Math.max(0,Math.min(1,Math.min(1,prevention/ctReference(CT.quakeTurn))-(exposed+Math.min(.15,CT.risk*.002))/ctReference(CT.quakeTurn)))*100);
}
function ctResults(mag,quiet){
  const prep=ctPrep(),burning=ctFireCount(),severity=.20+(mag-6.5)*.15;
  let mult=1+CT.risk*.008;if(ctPerk('koridor'))mult*=.85;if(ctPerk('konut'))mult*=.80;if(CT.drillProof.itfaiye)mult*=.95;
  const rows=SITES.map(site=>{const lv=CT.lv[site.id],onFire=ctBurning(site.id);
    const rate=Math.max(.01,Math.min(.75,severity*(1-lv/3*.85)*(onFire?1.75:1)*mult));return{site,lv,onFire,rate,lost:Math.round(site.pop*rate)};});
  const lost=rows.reduce((a,r)=>a+r.lost,0),saved=CT_POP-lost,ratio=saved/CT_POP;
  const score=ctFairScore(),stars=score>=85?3:score>=68?2:score>=50?1:0,missions=MISSIONS.filter(m=>ctPerk(m.id)).length;
  CT.res={scoreParts:ctOrderScoring(),mag,prep,burning,rows,lost,saved,stars,missions,score};
  if(!quiet)go('cres');
}
function ctCityData(){
  const r=CT.res;ctFamilyUpdate();
  return{family:CT.family.map(x=>({...x})),drillProof:JSON.parse(JSON.stringify(CT.drillProof)),score:r.score,quakeTurn:CT.quakeTurn,prep:r.prep,saved:r.saved,lost:r.lost,stars:r.stars,mag:r.mag,pop:CT_POP,risk:CT.risk,burning:r.burning,burningHz:Object.keys(CT.fire).map(k=>CT.fire[k].h.id),
    perks:MISSIONS.filter(m=>ctPerk(m.id)).map(m=>m.id),missions:r.missions,lv:Object.assign({},CT.lv),putOut:CT.putOut,blocked:CT.blocked,
    rows:r.rows.map(x=>({id:x.site.id,name:x.site.name,icon:x.site.icon,pop:x.site.pop,lost:x.lost,lv:x.lv,onFire:x.onFire})),crisisOk:CT.crisisOk||0,crisisFail:CT.crisisFail||0,
    konutLost:((r.rows.find(x=>x.site.id==='konut'))||{}).lost||0,homeFixed:Object.keys(CT.homeFixed),visits:CT.visits,minis:CT.minis,miniOk:CT.miniOk};
}
function cresUI(){
  const r=CT.res,titles=['Şehir savunmasız kaldı.','Ağır hasar, ağır ders.','Girne ayakta kaldı.','Güçlü ve dayanıklı Girne.'];
  const sorted=r.rows.slice().sort((a,b)=>b.lost-a.lost),worst=sorted[0].lost||1;
  const stats=[['Şehir puanı','%'+r.score,'good'],['Deprem büyüklüğü',r.mag.toFixed(1),''],['Şehir hazırlığı','%'+r.prep,'good'],['Kurtulan',r.saved.toLocaleString('tr-TR'),'good'],['Can kaybı',r.lost.toLocaleString('tr-TR'),'bad'],
    ['Giderilen risk',String(CT.putOut),''],['Kırılan zincir',String(CT.blocked),'good'],['Tatbikat / önlem',CT.visits+' / '+CT.minis,'good'],['Acil risk',(CT.crisisOk||0)+' çözüldü / '+(CT.crisisFail||0)+' kaçtı',CT.crisisFail?'bad':'good'],['Deprem turu',String(CT.quakeTurn),''],['Deprem anında açık riskli',String(r.burning),r.burning?'bad':'']];
  return '<div id="cityroot" class="cres"><div class="scene-shell-slot" id="mapSlot">'+cityMarkup()+'</div><div class="grade"></div><div class="cres-scroll"><div class="res-card">'+
   '<p class="stars">'+'★'.repeat(r.stars)+'☆'.repeat(3-r.stars)+'</p><h1>'+titles[r.stars]+'</h1><p class="res-sub">'+r.mag.toFixed(1)+' büyüklüğündeki depremde '+r.saved.toLocaleString('tr-TR')+' kişi kurtuldu.</p>'+
   ctOrderResultUI()+ctEvidenceUI()+'<div class="res-grid">'+stats.map(x=>'<div class="res-stat '+x[2]+'"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>'+
   '<div class="breakdown"><div class="bd-head">MAHALLE BAZINDA KAYIP</div>'+sorted.slice(0,6).map(x=>{const pct=Math.round(x.lost/x.site.pop*100);
     return '<div class="bd-row"><span>'+ico(x.site.icon)+'</span><span class="bd-name">'+x.site.name+(x.onFire?' '+ico('hazard'):(x.lv>=3?' '+ico('shield'):''))+'</span><span class="bd-pop">'+x.site.pop.toLocaleString('tr-TR')+' kişi</span><span class="bd-bar"><span style="width:'+Math.round(x.lost/worst*100)+'%"></span></span><span class="bd-num">−'+x.lost.toLocaleString('tr-TR')+' <small style="opacity:.7;font-weight:600">%'+pct+'</small></span></div>';}).join('')+'</div>'+
   '<p class="lesson">Yıldızlar tur ve bütçe fırsatına göre hesaplandı; büyüklük puanı değiştirmez. Kişi sayıları oyun simülasyonudur. Şimdi: <b>bir ailenin evinde</b> ne oldu? Şehirde yaptığın hazırlık o evin şansını belirliyor.</p>'+
   '<div class="res-actions"><button class="btn-main" data-act="tobridge">Şimdi bir aileye bak: deprem anı →</button></div></div></div></div>'+chrome();
}
function startCampaign(){
  S.camp=null;Sfx.stopAll();Sfx.calm(true);ctReset();clearInterval(ctIv);ctIv=setInterval(ctTick,100);
  ctIgnite(ctPick(SITES));CT.budget=CT_START-ctIncome();ctStartTurn();
  go('cmap');showGuide();setTimeout(ctMissionArrive,1100);
  ctToast('Tur 1 · Girne hazırlanıyor','Oyun 3 tur sürer; 3. tur bitince deprem olur. Önlem al: mahalleye tıkla, ◆ ile güçlendir ya da gidip ücretsiz tatbikat yap. Açık riskleri kapat.',false);
}


/* Yaşayan mahalleler: yatırımla beliren çalışma ekipleri ve rota işaretleri. */
function ctRouteReady(){return !!(CT&&(ctPerk('koridor')||CT.drillProof.itfaiye));}
function ctLife(){
  const root=$c('cityLife');if(!root||!CT)return;
  const sig=SITES.map(s=>CT.lv[s.id]+':'+!!CT.drillProof[s.id]).join('|')+':'+ctRouteReady();
  if(root.dataset.sig===sig)return;root.dataset.sig=sig;
  let svg='<svg viewBox="0 0 1280 720" class="life-map">';
  [].forEach((site,i)=>{
    const lv=CT.lv[site.id];if(!lv)return;const x=site.x*12.8+46,y=site.y*7.2-54;
    svg+='<g class="life-work" data-work="'+site.id+'" transform="translate('+x+','+y+')"><circle r="24" fill="#101932" stroke="#91e4c6" stroke-opacity=".5"/><path d="M-15 13h30M-11 9V0M11 9V0" stroke="#ffd482" stroke-width="3"/>';
    for(let n=0;n<Math.min(lv,2);n++)svg+='<g class="life-worker" style="--delay:'+(-i-n)+'s" transform="translate('+(n*15-8)+',-6)"><circle cy="-7" r="4" fill="#f4c9a5"/><path d="M-5-9h10" stroke="#ffd482" stroke-width="3"/><path d="M0-2v10m0-7-6 4m6-4 6 4m-6 3-4 6m4-6 4 6" stroke="#91e4c6" stroke-width="3" stroke-linecap="round"/></g>';
    if(lv>=2)svg+='<path d="M-23-16h10v13h-10zM13-16h10v13H13z" fill="#91e4c6"/><path d="m-21-10 2 2 4-5m30 3 2 2 4-5" stroke="#102b2c" fill="none" stroke-width="2"/>';
    svg+='</g>';
  });
  if(ctRouteReady()){
    const d='M243 526L390 596L640 596L850 614L1088 430L1126 331';
    svg+='<path class="prepared-route" d="'+d+'"/><g class="route-sign" transform="translate(820 600)"><rect x="-17" y="-13" width="34" height="25" rx="4" fill="#91e4c6"/><path d="M-10 0h19m-6-6 6 6-6 6" stroke="#102b2c" stroke-width="3" fill="none"/></g>';
    for(let n=0;n<4;n++)svg+='<circle r="5" class="route-citizen" style="--delay:'+(-n*1.3)+'s;offset-path:path(\''+d+'\')"/>';
  }
  root.innerHTML=svg+'</svg>';
}
function ctFamilyUpdate(){
  if(!CT)return;
  const add=(key,who,text)=>{if(CT.familySeen[key])return;CT.familySeen[key]=true;CT.family.push({key,who,text,turn:Math.min(CT.turn,CT.quakeTurn)});};
  add('hello','Anne','Çocuğumla Konutlar mahallesindeyiz. Bizim evde de hazırlık yapacağız; bizi unutma.');
  if(CT.turn>=2)add('plan','Çocuk','Sarsıntıda koşmak yerine Çök–Kapan–Tutun yapacağım. Evdeki sağlam masayı birlikte seçelim.');
  if(CT.lv.konut>=1)add('bag','Anne','Mahallede çantaya ne koyacağımızı öğrendik. Evde su ve kuru gıdayı senin seçmen gerekiyor.');
  if(CT.lv.konut>=2)add('meeting','Anne','Aile afet planımızı konuştuk. Buluşma noktasını önceden belirlemek içimi rahatlattı.');
  if(CT.lv.okul>=1)add('whistle','Çocuk','Okuldaki tatbikatta düdüğün önemini öğrendim. Evde çantaya düdük koymayı unutmayalım.');
  if(Object.keys(CT.homeFixed).length)add('fixed','Anne','Ev tatbikatında aldığın önlemler duruyor. Sabitlediklerini depremde yerinde göreceksin.');
  const box=$c('familyNote');if(!box)return;const msg=CT.family[CT.family.length-1];
  if(box.dataset.key===msg.key)return;box.dataset.key=msg.key;
  box.innerHTML='<div><span class="family-avatar">'+person(msg.who==='Çocuk'?'kid':'adult',2)+'</span><b>'+msg.who+'<small>KONUTLAR · TUR '+msg.turn+'</small></b></div><p>'+msg.text+'</p>';
}
function ctQuakeWitness(){
  if(ctRouteReady())return 'İşaretlediğin tahliye koridoru açık. Sarsıntı bitince mahalleli bu yolu kullanacak.';
  if(CT.lv.okul>=2)return 'Okulda sabitlediğin dolaplar yerinde. Aldığın önlemler şimdi sınanıyor.';
  if(ctPrep()>0)return 'Güçlendirdiğin bölgeler haritada yeşil. Önlemlerin sonucu birazdan görülecek.';
  return 'Mahalleler hazırlıksız. Sarsıntıda korun; sonrasında açık yolu kontrol et.';
}
function ctEvidenceUI(){
  const cards=[];
  if(CT.lv.okul>=2)cards.push(proofCard('Okulda dolap sabitleme','shelf',true,'İkinci kademede rafları sabitledin. Okulun kayıp hesabı bu kademeyi içeriyor.'));
  else if(CT.lv.okul>=1)cards.push(proofCard('Okulda korunma tatbikatı','shelter',true,'Okulu hazırladın. Sarsıntıda korunma, bu mahallenin hazırlık kademesine yansıdı.'));
  if(ctRouteReady())cards.push(proofCard('Açtığın tahliye koridoru','route',true,CT.drillProof.itfaiye?'Çizdiğin rota haritada işaretli. Başarılı güzergâh tatbikatı şehir kayıplarını %5 azaltır; bir kez kazanılır.':'Tahliye Koridoru görevi tamamlandı; mevcut şehir kayıp çarpanı %15 azaldı.'));
  if(CT.drillProof.itfaiye&&cards.length){
    const routes=CT.drillProof.itfaiye.routes||[];
    if(routes.length){const miniature='<div class="route-memory"><svg viewBox="0 0 148 84" role="img" aria-label="Tatbikatta çizdiğin iki güzergâh">'+routes.map((route,i)=>'<path d="'+route.map((p,n)=>(n?'L':'M')+(14+p[0]*15)+' '+(10+p[1]*15)).join(' ')+'" fill="none" stroke="'+(i?'#ffd482':'#91e4c6')+'" stroke-width="3"/>').join('')+'</svg><span>Tatbikatta çizdiğin<br>A ve B güzergâhları</span></div>';
      const k=cards.length-1;cards[k]=cards[k].replace('</article>',miniature+'</article>');}
  }
  const other=SITES.filter(s=>CT.lv[s.id]>0&&s.id!=='okul').sort((a,b)=>b.pop-a.pop)[0];
  if(other&&cards.length<2)cards.push(proofCard(other.name+' için aldığın önlem','plan',true,'Kademe '+CT.lv[other.id]+' / 3: '+other.steps[CT.lv[other.id]-1].label+'. Bu hazırlık mahalle kaybını azalttı.'));
  if(!cards.length)cards.push(proofCard('Alınmamış önlemler','shelf',false,'Mahallelerde kademe alınmadı. Açık riskleri kapatmak ve ücretsiz tatbikat yapmak hazırlığa başlamak için iki yol.'));
  return '<section class="city-evidence"><div class="kicker">KARARIN → GÖRÜNÜR SONUCU</div><div class="proof-grid">'+cards.slice(0,2).join('')+'</div></section>';
}

function ctCheckGameOver(){
  if(!CT||CT.over||S.mode==='gameover'||(CT.crisisFail||0)<3)return false;
  endGame('city','Şehirde koordinasyon kaybedildi','Üç acil risk müdahale edilmeden açığa çıktı.','Acil risk sayaçlarını izle. Mahalleye girip önlemi tamamla; çözülmemiş kriz varken turu bitirmek de bir kayıp sayılır. Her görev hatası tek başına oyunu bitirmez.');return true;
}

/* Her tur: keşif → ana önlem → komşu önlem → ortak kontrol.
   Ekip süresi karar bütçesidir; duvar saati değildir. Acil müdahaleler muaftır. */
function ctBuildOrder(){CT.order=null;return;/* dakika/sıralı görev sistemi kaldırıldı: bütçe ile kademe al ya da ücretsiz tatbikat yap */
  const old=CT.orderHistory.find(p=>p.turn===CT.turn);if(old){CT.order=old;return;}
  const open=SITES.filter(s=>!ctBurning(s.id)&&!CT.crises.some(c=>c.site===s.id));
  const pool=open.length>=2?open:SITES;
  let pairs=[];for(const a of pool)for(const id of a.nb){const b=pool.find(s=>s.id===id);if(b)pairs.push([a,b]);}
  if(!pairs.length&&pool.length>=2)pairs=[[pool[0],pool[1]]];
  if(!pairs.length){CT.order=null;return;}
  // Tekrar önleme: önceki turlarda görev alan mahalleler (özellikle son tur) ve aynı ikili geri sayılır;
  // kademesi dolu mahalle işe yaramaz; ucuz basamak hafifçe tercih edilir.
  const hist=CT.orderHistory,uses=id=>hist.filter(p=>p.a===id||p.b===id).length,prev=hist[hist.length-1];
  const cost=s=>ctNext(s)?ctNext(s).cost:0;
  pairs.forEach(pr=>{const a=pr[0],b=pr[1];
    const same=hist.some(p=>(p.a===a.id&&p.b===b.id)||(p.a===b.id&&p.b===a.id));
    pr.score=(uses(a.id)+uses(b.id))*10+(same?100:0)+(prev&&(prev.a===a.id||prev.b===a.id||prev.a===b.id||prev.b===b.id)?8:0)+
      (uses(a.id)?4:0)+(ctSafe(a.id)?30:0)+(ctSafe(b.id)?30:0)+(cost(a)+cost(b))*.4+Math.random()*2;});
  pairs.sort((x,y)=>x.score-y.score);
  const pair=pairs[0],a=pair[0],b=pair[1];
  const p={turn:CT.turn,a:a.id,b:b.id,index:0,left:30,spent:0,detours:0,blocked:0,goals:{},labels:{}};
  for(const site of pair){const step=ctNext(site);p.goals[site.id]=Math.min(3,CT.lv[site.id]+1);p.labels[site.id]=step?step.label:'Mevcut önlemleri denetle';}
  CT.order=p;CT.orderHistory.push(p);
}
function ctOrderTarget(){const p=CT&&CT.order;return !p?null:p.index===1?p.a:p.index===2?p.b:null;}
function ctOrderMinutes(site){return !CT.order?0:ctOrderTarget()===site.id?8:12;}
function ctOrderCost(site,step){return Math.max(1,step.cost-(ctOrderTarget()===site.id?1:0));}
function ctOrderCanWork(site,notify){const p=CT.order,need=ctOrderMinutes(site);if(!p||p.left>=need)return true;if(notify){Sfx.nope();ctToast('Ekip süresi yetmiyor',need+' dk gerekiyor; '+p.left+' dk kaldı. Acil risklere müdahale edebilirsin veya turu bitirebilirsin.',true);}return false;}
function ctOrderSpend(minutes){const p=CT.order;p.left=Math.max(0,p.left-minutes);p.spent+=minutes;}
function ctOrderInspect(site){const p=CT.order;if(!p||p.index!==0||p.a!==site.id||p.left<4||CT.crises.some(c=>c.site===site.id))return;ctOrderSpend(4);p.index=1;Sfx.pick();ctMissions();}
function ctOrderRecord(site){const p=CT.order;if(!p)return;const ordered=ctOrderTarget()===site.id;ctOrderSpend(ordered?8:12);if(ordered){p.index++;ctFloat(site,'SIRALI ADIM · 8 dk');}else{p.detours++;CT.detours++;ctFloat(site,'YENİDEN PLANLAMA · 12 dk',true);}ctMissions();}
function ctOrderFailure(site){if(!CT.order)return;ctOrderSpend(ctOrderMinutes(site));ctMissions();}
function ctOrderStep(i){
  const p=CT.order;if(!p||p.index!==i||CT.over||CT.resolving||S.paused||document.hidden||S.mode!=='cmap')return;
  if(i===0){if(p.left<4){ctToast('Ekip süresi yetmiyor','Keşif için 4 dk gerekir; acil riskleri çöz veya turu bitir.',true);return;}ctOpenSite(ctById[p.a]);return;}
  if(i===1||i===2){const site=ctById[i===1?p.a:p.b];
    if(CT.lv[site.id]>=p.goals[site.id]){if(p.left<8){ctToast('Ekip süresi yetmiyor','Mevcut çalışmayı doğrulamak 8 dk gerektirir.',true);return;}ctOrderSpend(8);p.index++;Sfx.safe();ctMissions();ctHud();return;}
    ctOpenSite(site);return;}
  if(p.left<4){ctToast('Ekip süresi yetmiyor','Ortak kontrol için 4 dk gerekiyor.',true);return;}
  if([p.a,p.b].some(id=>CT.lv[id]<p.goals[id]||ctBurning(id))){ctToast('Hat henüz hazır değil','İki mahalledeki önlemleri tamamla ve açık riskleri gider.',true);return;}
  ctOrderSpend(4);p.index=4;
  const before=CT.plan.spreads.length+(CT.plan.erodes||[]).length+(CT.plan.ignite?1:0);
  CT.plan.spreads=CT.plan.spreads.filter(x=>![p.a,p.b].includes(x.to));CT.plan.erodes=(CT.plan.erodes||[]).filter(x=>![p.a,p.b].includes(x.to));if([p.a,p.b].includes(CT.plan.ignite))CT.plan.ignite=null;
  p.blocked=before-CT.plan.spreads.length-CT.plan.erodes.length-(CT.plan.ignite?1:0);CT.blocked+=p.blocked;
  Sfx.win();ctFloat(ctById[p.b],'GÜVENLİK HATTI TAMAM');ctOrderDraw();ctToast('Dört adım, tek güvenlik hattı',p.spent+' dk harcandı; '+p.left+' dk kaldı. '+(p.blocked?p.blocked+' yaklaşan risk engellendi.':'İki mahalledeki hazırlık ortak kontrolden geçti.'),false);ctPaint();ctPlanBar();ctHud();
}
function ctOrderUI(){
  const box=$c('missions'),p=CT.order;if(!box||!p)return;const a=ctById[p.a],b=ctById[p.b];
  const NM=[['Saha keşfi','Ana noktayı hazırla','Komşu bağlantısını hazırla','Ortak hattı test et'],['Durum değerlendirmesi','İlk mahalleyi güçlendir','İkinci mahalleyi güçlendir','Hattı birlikte doğrula'],['Gönüllü toplantısı','Merkez önlemini uygula','Yan mahalle önlemini uygula','Ortak tatbikat kontrolü']][(p.turn-1)%3],DS=[['ihtiyaçları belirle','','','iki mahalledeki önlemleri birlikte doğrula'],['riskleri haritala','','','önlemlerin birbirini tamamladığını doğrula'],['ekibi ve malzemeyi topla','','','hattı uçtan uca dene']][(p.turn-1)%3];
  const steps=[[NM[0],a.name+' · '+DS[0],4],[NM[1],a.name+' · '+p.labels[p.a],8],[NM[2],b.name+' · '+p.labels[p.b],8],[NM[3],DS[3].charAt(0).toUpperCase()+DS[3].slice(1),4]];
  box.innerHTML='<section class="turn-order"><div class="order-kicker">TUR '+p.turn+' · BAĞLI GÖREVLER</div><h3>'+a.name+' → '+b.name+'</h3><div class="order-clock"><b>'+p.left+' dk</b><span>EKİP SÜRESİ / 30 dk</span></div><div class="order-rule">Sıra dışı yatırım: 12 dk · Acil müdahale: muaf</div><ol>'+steps.map((s,i)=>'<li class="'+(i<p.index?'done':i===p.index?'active':'waiting')+'"><button data-order="'+i+'" '+(i!==p.index?'disabled':'')+'><em>'+(i<p.index?'✓':i+1)+'</em><span><strong>'+s[0]+'</strong><small>'+s[1]+'</small></span><i>'+s[2]+' dk</i></button></li>').join('')+'</ol><p class="order-hint">'+(p.index<4&&p.left<(p.index===0||p.index===3?4:8)?'Ekip süresi yetersiz. Acil riskleri çöz veya turu bitir.':p.index===4?'Hat tamamlandı · '+p.blocked+' risk engellendi':p.index===0?'Keşif, sonraki iki yatırımda 1 ◆ kazandırır.':p.index<3?'Önceki adım hazır: bu yatırım 1 ◆ indirimli.':'Son kontrol, bu tur hatta yönelen riskleri keser.')+'</p><div class="order-summary">'+p.index+'/4 adım · '+p.detours+' plansız yatırım · Koordinasyon %'+(p.index*25)+'</div></section>';
  box.querySelectorAll('[data-order]').forEach(el=>{el.addEventListener('click',e=>{e.stopPropagation();ctOrderStep(+el.dataset.order);});el.addEventListener('mouseenter',()=>ctHighlight([+el.dataset.order===2?p.b:p.a]));el.addEventListener('mouseleave',()=>ctHighlight([]));});
}
function ctOrderScoring(){const base=ctBaseScore(),hist=CT.orderHistory||[];if(!hist.length)return{base,coordination:100,penalty:0,score:base,active:false};const coordination=Math.round(hist.reduce((n,p)=>n+p.index,0)/(hist.length*4)*100),penalty=Math.min(10,CT.detours*2);return{base,coordination,penalty,score:Math.max(0,Math.round(base*.8+coordination*.2)-penalty),active:true};}
function ctFairScore(){return ctOrderScoring().score;}
function ctOrderResultUI(){const s=CT.res.scoreParts;if(!s||!s.active)return '';return '<div class="order-result"><b>PLANIN SONUCA ETKİSİ</b><p>Fiziksel hazırlık %'+s.base+' × 0,8 + sıralı plan %'+s.coordination+' × 0,2 − yeniden planlama '+s.penalty+' = <strong>%'+s.score+'</strong></p><small>Tamamlanan hatlar: '+CT.orderHistory.filter(p=>p.index===4).length+' / '+CT.orderHistory.length+' · Ekip süresi: '+CT.orderHistory.reduce((n,p)=>n+p.spent,0)+' dk</small></div>';}

function ctOrderDraw(){const links=$c('links'),p=CT&&CT.order;if(!links)return;links.querySelectorAll('.order-link').forEach(x=>x.remove());if(!p||p.index!==4)return;const a=ctById[p.a],b=ctById[p.b];links.insertAdjacentHTML('beforeend','<line class="order-link" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'"/>');}
