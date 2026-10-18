'use strict';
/* 72 SAAT - veri: bölümler, tehlikeler, çanta eşyaları, bilgi kutuları */
const W=1280,H=720,FLOOR=560;
const TABLE={x0:400,x1:540,slots:[436,470,504],name:'Sağlam masa'};
const DESK={x0:1048,x1:1112,slots:[1066,1092],name:'Çalışma masası'};
/* tıklanabilir alanlar: [x,y,w,h] */
const SPOT={valve:[212,348,54,104],door:[150,380,92,185],win:[560,238,130,170],sw:[254,444,34,40],brk:[252,362,40,62],ext:[652,486,38,76]};

const PT={
  mom:{name:'Anne',sc:1,speed:125,skin:'#f0c29a',hair:'#3a2a24',top:'#2ec4b6',top2:'#1f9e92',bot:'#3d405b',acc:'#2ec4b6',desc:'Anne: hızlı ve güçlü. Çocuğunun yanında güvende olmasını ister.'},
  kid:{name:'Çocuk',sc:.72,speed:115,skin:'#f6d1ae',hair:'#e9a23b',top:'#ff6b6b',top2:'#e04f55',bot:'#4d6cfa',acc:'#ff6b6b',desc:'Çocuk: küçük ve hızlı ama çok korkuyor. Yönlendirmeye ihtiyacı var.'},
};

/* scn: quake | gas | fire | wild   aft: artçı sarsıntı var mı   dark: gece/karanlık   decor: tehlike olmayan ama çizilen eşyalar */
const LEVELS=[
  {name:'İlk Ev',tag:'Deprem',sub:'Anne ve çocuğu evde',budget:75,slots:8,scn:'quake',aft:false,dark:false,hz:['boxes','shelf','tv','lamp'],decor:[],
   ppl:[{t:'mom',x:610},{t:'kid',x:835}],meds:false,pet:false,
   intro:'Hazırlık süren (dk) sınırlı: hepsini yapamazsın. Kırmızı ünlemlere tıkla, çantana eşya seç, sonra "Hazırım" de.',facts:null},
  {name:'Artçı Sarsıntı',tag:'Deprem + artçı',sub:'Ana sarsıntıdan sonra artçı geliyor',budget:90,slots:8,scn:'quake',aft:true,dark:false,hz:['boxes','shelf','tv','lamp','wardrobe'],decor:[],
   ppl:[{t:'mom',x:330},{t:'kid',x:985}],meds:false,pet:false,
   intro:'Dikkat: ana sarsıntıdan sonra ARTÇI gelebilir, sığındığın yerden hemen çıkma. Çocuğu da erken yönlendir.',
   facts:['Artçı sarsıntılar saatlerce, günlerce sürebilir. Ana sarsıntı bitince hemen çıkma; önce çevreyi kontrol et.','Hasarlı binaya artçı sırasında geri dönme: eşyan için canını riske atma. Afet çantanı hazır tut.','Deprem anında doğru davranış: ÇÖK – KAPAN – TUTUN. Kapı eşiği artık güvenli sayılmıyor.']},
  {name:'Ağır Hasar',tag:'Deprem + artçı',sub:'Çok tehlikeli bir ev',budget:95,slots:8,scn:'quake',aft:true,dark:false,hz:['boxes','shelf','tv','lamp','wardrobe'],decor:[],
   ppl:[{t:'mom',x:345},{t:'kid',x:990}],meds:false,pet:false,
   intro:'Ev tehlikelerle dolu ve zaman kısıtlı. Önce en tehlikeli olanları gider; artçıya da hazırlıklı ol.',
   facts:['Çocuklar ve kronik hastalar için özel ihtiyaçlar (ilaç, bebek bezi, mama) çantaya eklenmeli.','Aile afet planı yap: buluşma noktasını ve haberleşme yöntemini önceden belirle. Telefonlar çalışmayabilir.','Artçı sarsıntılar günlerce sürebilir. Sığındığın yerden hemen çıkma.']},
  {name:'Gaz Kokusu',tag:'Gaz kaçağı',sub:'Deprem sonrası gaz kokuyor',budget:85,slots:8,scn:'gas',aft:true,dark:false,hz:['boxes','shelf','tv','lamp'],decor:['wardrobe'],
   ppl:[{t:'mom',x:340},{t:'kid',x:985}],meds:false,pet:false,
   intro:'Sarsıntıdan sonra evde gaz kokusu var! IŞIĞA, ANAHTARA ve ŞALTERE DOKUNMA: kıvılcım gazı tutuşturur. Pencereyi aç, vanayı kapat, çık.',
   facts:['Gaz kokusu varsa elektrik anahtarlarına, prizlere ve çakmağa dokunma: küçük bir kıvılcım patlamaya yol açabilir. Pencereleri aç, ana vanayı kapat ve binayı terk et.','Gaz kokusunu fark ettiğinde ışığı açma, cep telefonunu kullanma, evden uzaklaştıktan sonra yetkilileri ara.','Gaz vanasının yerini ve nasıl kapatıldığını bütün aile bilmeli.']},
  {name:'Kıvılcım',tag:'Elektrik yangını',sub:'Prizden yangın çıkıyor',budget:85,slots:8,scn:'fire',aft:true,dark:false,hz:['boxes','shelf','tv','lamp'],decor:['wardrobe'],
   ppl:[{t:'mom',x:560},{t:'kid',x:890}],meds:false,pet:false,
   intro:'Sarsıntıdan sonra prizden kıvılcım çıkıp yangın başlıyor. Sıra çok önemli: önce ELEKTRİĞİ KES, sonra söndür, sonra çık.',
   facts:['Elektrik yangınında önce elektriği kes; sonra uygun bir söndürücü kullan. Elektrikli yangını su ile söndürmeye çalışma.','Evde en az bir yangın söndürücü bulundur, yerini ve nasıl kullanıldığını bütün aile öğrensin.','Yangın büyüyorsa söndürmeye çalışmayı bırak; evden çık ve yetkilileri ara.']},
  {name:'Karanlık Gece',tag:'Gece depremi',sub:'Elektrik yok, fener şart',budget:90,slots:8,scn:'quake',aft:true,dark:true,hz:['boxes','shelf','lamp','wardrobe'],decor:['tv'],
   ppl:[{t:'mom',x:790},{t:'kid',x:860}],meds:false,pet:false,
   intro:'Gece 03:00. Sarsıntıyla elektrikler gidecek ve her yer kapkaranlık olacak. Çantanda el feneri varsa fare imlecin fener olur; yoksa neredeyse hiçbir şey göremezsin.',
   facts:['Çantandaki el feneri deprem gecesinde hayat kurtarır. Mum ve çakmak yerine fener kullan: gaz kaçağı riski var.','Yatağının yanına ayakkabı ve el feneri koy: karanlıkta cam kırıklarına basmamak için.','Yatağın üstünde ağır nesne asma ve yatağını camdan uzak yerleştir.']},
  {name:'Orman Yangını',tag:'Orman yangını',sub:'Alevler eve yaklaşıyor',budget:80,slots:8,scn:'wild',aft:false,dark:false,hz:['boxes','curtain','tube'],decor:['shelf','tv','lamp','wardrobe'],
   ppl:[{t:'mom',x:330},{t:'kid',x:985}],meds:false,pet:false,
   intro:'Yaz sıcağında orman yangını eve doğru geliyor! Hazırlıkta tüpü ve perdeyi güvene al, çantana MASKE koy. Yangın gelince herkesi sol taraftaki kapıya yönlendir: alevler sağdan geliyor.',
   facts:['Orman yangınında evin çevresindeki kuru otları, çalıları ve yanıcı malzemeleri temizlemek yangının eve ulaşmasını zorlaştırır.','Yangın yaklaşırken gaz tüpünün vanasını kapat, perdeleri indir, pencere ve kapıları kapat; yetkililer tahliye derse hemen çık.','Dumanda ağzını ve burnunu ıslak bezle kapat, yere yakın ilerle. Duman alevden önce zarar verebilir.','Kıbrıs\'ta yaz aylarında orman yangını riski yüksektir: açıkta ateş yakma, sigara izmaritini doğaya atma.']}
];

/* bb: [x,y,w,h] dünya koordinatı, zone: düşünce zarar verdiği yatay aralık, t: düşme anı (sn) */
const HZ={
  boxes:{n:'Çıkış yolundaki kutular',act:'Yolu aç',cost:10,bb:[203,484,76,76],w:10,zone:null,
    desc:'Çıkış yolu açık ve boş olmalı. Kutular, ayakkabılar ve eşyalar tahliyeyi geciktirir.',
    ok:'Çıkış yolu açıktı: tahliye hızlı oldu.'},
  shelf:{n:'Sabitlenmemiş kitaplık',act:'Duvara sabitle',cost:20,bb:[286,324,74,236],w:22,zone:[245,480],t:4.2,
    desc:'Devrilen mobilya, deprem yaralanmalarının ve kapanan yolların başlıca sebebi. Duvara sabitle.',
    ok:'Kitaplık duvara sabit olduğu için devrilmedi.',hit:'üzerine kitaplık devrildi'},
  tv:{n:'Sabitlenmemiş televizyon',act:'Sabitle',cost:15,bb:[543,446,86,114],w:15,zone:[505,665],t:3.0,
    desc:'Ağır cihazlar sarsıntıda ileri kayıp düşer. Sabitleme aparatıyla ya da yere yakın bir yere koyarak önlem al.',
    ok:'Televizyon sabit olduğu için düşmedi.',hit:'üzerine televizyon düştü'},
  lamp:{n:'Yatağın üstündeki avize',act:'Başka yere taşı',cost:15,bb:[795,140,84,142],w:18,zone:[755,915],t:5.4,
    desc:'Yatağın üstündeki ağır avize uyuyanın başına düşebilir. Yatak başlarının üstünde ağır nesne bırakma.',
    ok:'Avize yatağın üstünden kaldırıldığı için kimseye zarar vermedi.',hit:'üzerine avize düştü'},
  wardrobe:{n:'Sabitlenmemiş gardırop',act:'Duvara sabitle',cost:20,bb:[956,324,84,236],w:15,zone:[850,1042],t:6.4,
    desc:'Yüksek gardıroplar devrilir. Duvara L-bağlantıyla sabitle; ağır eşyaları alt raflara koy.',
    ok:'Gardırop sabit olduğu için devrilmedi.',hit:'üzerine gardırop devrildi'},
  curtain:{n:'Kolay tutuşan perde',act:'Perdeyi indir',cost:10,bb:[548,236,134,176],w:15,zone:[545,705],t:9.5,
    desc:'Yangın sırasında kor parçaları pencereden girip perdeyi tutuşturabilir. Perdeleri indir, pencereleri kapat.',
    ok:'Perde indirildiği için kor parçaları evi tutuşturmadı.',hit:'perde tutuştu; alev ve duman yaraladı'},
  tube:{n:'Gaz tüpü',act:'Güvene al',cost:15,bb:[660,474,32,86],w:20,zone:[590,725],t:14,
    desc:'Yangın yaklaşırken gaz tüpü patlayabilir. Vanayı kapat, tüpü evden uzak ve açık havaya çıkar.',
    ok:'Tüp güvene alındığı için patlama olmadı.',hit:'gaz tüpü patladı'}
};
const FIXED_EV=[
  {k:'glass',zone:[545,700],t:7.0,hit:'kırılan cam parçaları isabet etti',okt:'Cam kırıldı ama kimse pencere önünde değildi.'},
  {k:'ceil',zone:[150,1130],t:9.6,hit:'tavandan sıva ve parçalar düştü',okt:'Tavandan parçalar düştü ama herkes masa altında korunaklıydı.'}
];

/* Çanta eşyaları: w = 72 saatteki önemi */
const ITEMS=[
  {id:'su',n:'Su',w:18,tip:'Kişi başı günde yaklaşık 3-4 litre su gerekir. Şebeke suyu kesilebilir.',
   svg:'<rect x="17" y="11" width="14" height="29" rx="5" fill="#5bc0ff"/><rect x="20" y="5" width="8" height="7" rx="2" fill="#2a7fba"/><rect x="17" y="21" width="14" height="9" fill="#e8f7ff" opacity=".85"/>'},
  {id:'gida',n:'Kuru gıda',w:12,tip:'Pişirme gerektirmeyen, uzun ömürlü gıdalar: konserve, kuru meyve, bisküvi.',
   svg:'<ellipse cx="24" cy="14" rx="11" ry="3.5" fill="#cfd6e4"/><rect x="13" y="14" width="22" height="25" rx="3" fill="#ff9f43"/><rect x="13" y="20" width="22" height="12" fill="#ffd166"/>'},
  {id:'fener',n:'El feneri',w:12,tip:'Elektrik kesilince en değerli eşyalardan. Mum yerine fener kullan: gaz kaçağında mum tehlikelidir.',
   svg:'<g transform="rotate(-35 24 24)"><rect x="8" y="19" width="22" height="10" rx="3" fill="#3d405b"/><rect x="30" y="16" width="9" height="16" rx="2" fill="#ffd166"/></g><path d="M37 8l5-3M40 15l6-1M35 3l1-4" stroke="#ffd166" stroke-width="2" stroke-linecap="round"/>'},
  {id:'pil',n:'Powerbank/pil',w:9,tip:'Telefon ve fener için enerji. Şarj dolu, yedek pil hazır olsun.',
   svg:'<rect x="9" y="17" width="26" height="14" rx="3" fill="#2ec4b6"/><rect x="35" y="21" width="4" height="6" fill="#2ec4b6"/><path d="M25 19l-5 6h4l-1 5 6-7h-4z" fill="#fff"/>'},
  {id:'radyo',n:'Pilli radyo',w:8,tip:'Şebeke çökerse resmî duyuruları ve toplanma noktalarını radyodan öğrenirsin.',
   svg:'<line x1="34" y1="16" x2="40" y2="7" stroke="#ef476f" stroke-width="2.5" stroke-linecap="round"/><rect x="8" y="16" width="32" height="22" rx="4" fill="#ef476f"/><circle cx="19" cy="27" r="6" fill="#ffe3ea"/><rect x="28" y="22" width="8" height="2.5" fill="#ffe3ea"/><rect x="28" y="28" width="8" height="2.5" fill="#ffe3ea"/>'},
  {id:'ilkyardim',n:'İlk yardım',w:14,tip:'Pansuman, steril gazlı bez, yara bandı, antiseptik. Yaralıya ilk müdahale için.',
   svg:'<rect x="18" y="9" width="12" height="6" rx="2" fill="#e63946"/><rect x="8" y="14" width="32" height="24" rx="5" fill="#fff" stroke="#e63946" stroke-width="2.5"/><rect x="21.5" y="19" width="5" height="14" fill="#e63946"/><rect x="17" y="23.5" width="14" height="5" fill="#e63946"/>'},
  {id:'duduk',n:'Düdük',w:10,tip:'Enkaz altında bağırmak yerine düdük çal: enerjini korur, sesi uzağa gider.',
   svg:'<circle cx="19" cy="28" r="11" fill="#ffd166"/><rect x="26" y="20" width="15" height="9" rx="3" fill="#ffd166"/><circle cx="19" cy="28" r="4.5" fill="#fff3c4"/><path d="M8 14q4-5 9-3" stroke="#ffd166" stroke-width="2.5" fill="none" stroke-linecap="round"/>'},
  {id:'ilac',n:'Kişisel ilaçlar',w:3,tip:'Sürekli kullanılan ilaçlar ve reçete bilgisi hayati olabilir. Kronik hastalıkları olanlar için şart.',
   svg:'<rect x="13" y="7" width="22" height="8" rx="3" fill="#fff"/><rect x="15" y="14" width="18" height="27" rx="4" fill="#ff9f43"/><rect x="15" y="21" width="18" height="13" fill="#fff"/><rect x="22.2" y="23" width="3.6" height="9" fill="#e63946"/><rect x="19.5" y="25.7" width="9" height="3.6" fill="#e63946"/>'},
  {id:'belge',n:'Belge + nakit',w:8,tip:'Kimlik/tapu fotokopileri ve biraz nakit: kartlar ve bankamatikler çalışmayabilir.',
   svg:'<path d="M13 6h16l8 8v28H13z" fill="#fff"/><path d="M29 6v8h8z" fill="#cfd6e4"/><rect x="17" y="21" width="16" height="2.5" fill="#8d99ae"/><rect x="17" y="27" width="16" height="2.5" fill="#8d99ae"/><rect x="17" y="33" width="9" height="5" rx="1" fill="#5ee08a"/>'},
  {id:'battaniye',n:'Battaniye',w:9,tip:'Gece soğuğu ve şokta ısı kaybı için battaniye ya da termal örtü.',
   svg:'<rect x="8" y="15" width="32" height="22" rx="4" fill="#9b72cf"/><rect x="8" y="21" width="32" height="4" fill="#c7a9ee"/><rect x="8" y="30" width="32" height="3" fill="#c7a9ee"/>'},
  {id:'maske',n:'Maske / ıslak bez',w:4,tip:'Duman ve toz solunumu zehirler. N95 maske ya da ıslak bez ağzını ve burnunu korur.',
   svg:'<path d="M7 19q17-9 34 0v9q-17 13-34 0z" fill="#e8f1ff"/><path d="M7 24h-4M41 24h4" stroke="#8d99ae" stroke-width="2.5" stroke-linecap="round"/><path d="M12 24q12 5 24 0" stroke="#b8cae8" stroke-width="2" fill="none"/>'},
  {id:'konsol',n:'Oyun konsolu',w:0,junk:1,tip:'Eğlenceli ama hayatta kalmana yardım etmez. Çantada yer kaplar.',
   svg:'<rect x="5" y="15" width="38" height="21" rx="10" fill="#6c757d"/><rect x="12" y="21" width="3" height="9" fill="#fff"/><rect x="9" y="24" width="9" height="3" fill="#fff"/><circle cx="32" cy="23" r="2.5" fill="#ef476f"/><circle cx="37" cy="28" r="2.5" fill="#ffd166"/>'},
  {id:'parfum',n:'Parfüm seti',w:0,junk:1,tip:'Güzel kokar ama susuzluğu gidermez.',
   svg:'<rect x="20" y="8" width="8" height="8" rx="2" fill="#c9a227"/><rect x="13" y="16" width="22" height="24" rx="5" fill="#ffb3c6"/><rect x="17" y="22" width="14" height="10" rx="2" fill="#fff" opacity=".5"/>'},
  {id:'vazo',n:'Süs vazosu',w:0,junk:1,tip:'Kırılgan ve ağır. Afet çantasında işe yaramaz.',
   svg:'<path d="M18 7h12v9c9 4 11 14 4 25H14C7 30 9 20 18 16z" fill="#4cc9f0"/><path d="M19 22q5 4 10 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>'}
];

const FACTS=[
  'Deprem anında doğru davranış: ÇÖK – KAPAN – TUTUN. Kapı eşiği artık güvenli sayılmıyor.',
  'Sarsıntı sırasında balkona, merdivene ya da dışarı koşma; asansör kullanma. Sarsıntı bitene kadar korunaklı yerde kal.',
  'Afet çantan en az 72 saat yetecek şekilde hazırlanmalı ve çıkışa yakın, kolay ulaşılan bir yerde durmalı.',
  'Büyük mobilyaları duvara sabitlemek, yaralanmayı azaltmanın en ucuz yollarından biridir.',
  'Deprem sonrası gaz kokusu varsa kibrit ve çakmak yakma, elektrik düğmelerine dokunma. Pencereleri aç, gaz vanasını kapat ve binadan çık.',
  'Kıbrıs, Doğu Akdeniz\'deki aktif fay sistemlerinin yakınında. 6 Şubat 2023 depremleri adada da hissedildi.',
  'Enkaz altında kalırsan bağırmak yerine düdük çal ya da boruya vur. Enerjini ve nefesini korursun.',
  'Aile afet planı yap: buluşma noktasını ve haberleşme yöntemini önceden belirle. Telefonlar çalışmayabilir.',
  'Binanın depreme dayanıklılığı konusunda yetkili bir inşaat mühendisine danış. En iyi hazırlık sağlam yapıdır.',
  'Yaşlılar, çocuklar ve evcil hayvanlar için özel ihtiyaçlar (ilaç, mama, bebek bezi) çantaya eklenmeli.'
];
const STAR_AT=[45,68,90];
