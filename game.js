'use strict';
/* FAYT - oyun mantığı, arayüz ve ana döngü */
const stage=document.getElementById('stage'),ui=document.getElementById('ui');
const ITEM_COST=5;
const ORDER=['su','konsol','ilkyardim','fener','parfum','gida','duduk','radyo','vazo','battaniye','ilac','belge','pil','maske'];
const NL=LEVELS.length;
const S={camp:null,t:0,mode:'menu',paused:false,level:0,hover:null,hoverP:-1,hoverKey:null,mouse:null,conf:false,infoItem:false,how:false,shake:0,prog:loadProg()};
let R=null,camT=CAMS.menu,toastT=null,sigRoster='',pauseFocus=null;
const FRONT_V=54;

function loadProg(){
  let o=null;try{o=JSON.parse(localStorage.getItem('g72p'));}catch(e){}
  if(!o||!Array.isArray(o.stars)||!Array.isArray(o.best))o={stars:[],best:[]};o.campBest=Math.max(0,Math.min(100,o.campBest|0));o.campStars=Math.max(0,Math.min(3,o.campStars|0));
  if(o.scoreVersion!==3){o.campLegacyBest=Math.max(o.campLegacyBest|0,o.campBest);o.campBest=0;o.campStars=0;o.scoreVersion=3;}
  for(let i=0;i<NL;i++){o.stars[i]=Math.max(0,Math.min(3,o.stars[i]|0));o.best[i]=Math.max(0,Math.min(100,o.best[i]|0));}
  return o;
}
function saveProg(){try{localStorage.setItem('g72p',JSON.stringify(S.prog));S.storageOK=true;}catch(e){S.storageOK=false;}}
function fit(){
  const k=Math.min(innerWidth/W,innerHeight/H);
  stage.style.transform='scale('+k+')';stage.style.left=((innerWidth-W*k)/2)+'px';stage.style.top=((innerHeight-H*k)/2)+'px';
  QK=Math.max(1,Math.min(2,k*(window.devicePixelRatio||1)));cv.width=Math.round(W*QK);cv.height=Math.round(H*QK);cv2.width=cv.width;cv2.height=cv.height;
}
addEventListener('resize',fit);fit();

/* ---------- koşu (run) ---------- */
function makeRun0(li,Lo){
  const L=Lo||LEVELS[li];
  return{li,L,left:L.budget,fixed:{},bag:[],sel:-1,q:null,after:null,sim:null,gasClosed:false,winOpen:false,breakerOff:false,sparked:false,sparkT:0,shock:false,bigFire:false,
    exitDelayed:false,evlog:[],impacts:[],prevented:[],score:null,autoGo:0,
    people:spreadPeople(L.ppl.map((d,i)=>({id:i,type:d.t,def:PT[d.t],x:clamp(d.x+rnd(-22,22),195,1085),dir:1,state:'idle',tx:0,hits:0,down:false,sheltered:false,spot:null,ph:Math.random()*6,hidden:false,alpha:1,evac:false,exitGo:false,fade:false,exited:false,rescued:false,stranded:false,smk:0,exitWait:0})))};
}
/* Doğuşta kişiler en az 64 px arayla durur: aksi halde biri diğerinin üstüne biner ve tıklanamaz. */
function spreadPeople(P){
  for(let pass=0;pass<8;pass++){let moved=false;
    const o=P.slice().sort((a,b)=>a.x-b.x);
    for(let i=1;i<o.length;i++){const gap=o[i].x-o[i-1].x;if(gap<64){const d=(64-gap)/2;o[i-1].x-=d;o[i].x+=d;moved=true;}}
    P.forEach(p=>{p.x=clamp(p.x,195,1085);});
    if(!moved)break;}
  return P;
}
function makeRun(li,opts,Lo){
  const r=makeRun0(li,Lo);r.opts=opts||null;
  if(opts){
    r.left+=opts.min||0;
    (opts.fix||[]).forEach(k=>{if(r.L.hz.indexOf(k)>=0)r.fixed[k]=true;});
  }
  return r;
}
R=makeRun(0);
function nameList(a){const n=a.map(p=>p.def.name);return n.length<2?n.join(''):n.slice(0,-1).join(', ')+' ve '+n[n.length-1];}
function has(id){return R.bag.indexOf(id)>=0;}
const isWild=()=>R.L.scn==='wild';

/* ---------- arayüz yardımcıları ---------- */
const audioIntensity=()=>'<button class="btn sm audio-intensity" data-act="intensity" title="Ortam ve sarsıntı seslerini azaltır; görev uyarıları açık kalır" aria-pressed="'+Sfx.intensity()+'">'+(Sfx.intensity()?'Yoğunluk: Düşük':'Yoğunluk: Normal')+'</button>';
const chrome=()=>'<div class="toast" id="toast" role="status"></div><button class="btn sm pause-toggle" data-act="pause" aria-label="Oyunu duraklat">Esc · Duraklat</button><button class="btn sm mute" data-act="mute" id="mutebtn">'+(Sfx.muted()?'Ses: Kapalı':'Ses: Açık')+'</button>'+audioIntensity();
function toast(m){const el=document.getElementById('toast');if(!el)return;el.textContent=m;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),2600);}
function shakeEl(id){const e=document.getElementById(id);if(!e)return;e.classList.remove('shake');void e.offsetWidth;e.classList.add('shake');}
function go(mode){
  cancelCinema();
  closePause();S.mode=mode;Sfx.scene(mode);S.how=false;ui.dataset.mode=mode;
  if(mode!=='drill'&&typeof drillStop==='function')drillStop();
  camT=mode==='prep'?CAMS.prep:(mode==='quake'||mode==='after')?CAMS.quake:CAMS.menu;
  if(mode!=='quake'&&mode!=='after'){Sfx.stopAll();S.shake=0;}
  if(mode==='menu')ui.innerHTML=menuUI();
  else if(mode==='levels')ui.innerHTML=levelsUI();
  else if(mode==='prep'){ui.innerHTML=prepUI();renderBag();updateBudget();refreshInfo();}
  else if(mode==='quake'){sigRoster='';ui.innerHTML=quakeUI();}
  else if(mode==='after'){sigRoster='';ui.innerHTML=afterUI();renderChecks();}
  else if(mode==='sim')ui.innerHTML=simUI();
  else if(mode==='result')ui.innerHTML=resultUI();
  else if(mode==='drill'){ui.innerHTML=drillUI();drillMount();}
  else if(mode==='cmap'){ui.innerHTML=cityUI();ctBind();}
  else if(mode==='cres')ui.innerHTML=cresUI();
  else if(mode==='minires')ui.innerHTML=miniResUI();
  else if(mode==='bridge')ui.innerHTML=bridgeUI();
  else if(mode==='camp')ui.innerHTML=campUI();
  else if(mode==='gameover'){ui.innerHTML=gameOverUI();document.getElementById('overTitle').focus();}
  if(['prep','quake','after'].includes(mode))mountHomeControls();
  if(mode==='quake'||mode==='after'){ui.insertAdjacentHTML('beforeend','<aside id="protectionFeed" class="protection-feed" aria-label="İşe yarayan önlemler"></aside>');renderProtectionFeed();}
  if(mode==='prep')mountInheritedProof();
}
function bestChip(){return '';}
function seisPath(){
  /* Tek, düzgün ve simetrik sismograf izi (genişlik 1280): sakin taban, ortada P→S dalgası, iki yana sönümlenir */
  let pts=[];const y0=30;
  for(let x=0;x<=1280;x+=2){const d=Math.abs(x-640);
    const env=24*Math.exp(-Math.pow(d/135,2)),tremor=1.1*Math.sin(d*.9)+.7*Math.sin(d*.37);
    const y=y0-(env*Math.sin(d*.42+.6)*(1+.25*Math.sin(d*.09))+tremor*(.5+env/24));
    pts.push((x===0?'M':'L')+x+' '+y.toFixed(1));}
  return pts.join(' ');
}
function menuUI(){
  const b=S.prog.campBest|0,st=S.prog.campStars|0,sp=seisPath();
  const best=b?'<div class="mn-best"><small>EN YÜKSEK SKOR</small><b>%'+b+'</b><span>'+'★'.repeat(st)+'☆'.repeat(3-st)+'</span><em>Şehir %'+(S.prog.campCity|0)+' · Ev %'+(S.prog.campHouse|0)+'</em></div>':'<div class="mn-best empty"><small>EN YÜKSEK SKOR</small><em>Henüz yok</em></div>';
  const wave='<svg viewBox="0 0 1280 60" width="1280" height="60" preserveAspectRatio="none"><path class="tr" pathLength="1" d="'+sp+'"/><circle class="pen" r="4" cy="30"/></svg>';
  const pulse='<svg viewBox="0 0 28 18" width="28" height="18" aria-hidden="true"><polyline points="0,9 6,9 8,3 11,15 14,6 16,9 28,9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  return chrome()+'<div class="mn">'+
   '<i class="mn-c tl"></i><i class="mn-c tr"></i><i class="mn-c bl"></i><i class="mn-c br"></i>'+
   '<div class="mn-side l" aria-hidden="true"><span>DEPREM GELMEDEN ÖNCE</span></div><div class="mn-side r" aria-hidden="true"><span>DEPREM GELMEDEN ÖNCE</span></div>'+
   '<div class="mn-top"><span class="pl">'+pulse+'</span><span>Civil Game Jam 2026 · KKTC</span><span class="pr">'+pulse+'</span></div>'+
   '<div class="mn-main"><div class="mn-rings" aria-hidden="true"><i></i><i></i><i></i></div>'+
   '<h1 class="mn-title"><span class="m1">GİRNE · AFETE HAZIRLIK</span><span class="m2">FAYT</span></h1>'+
   '<div class="mn-seis" aria-hidden="true">'+wave+'</div>'+
   '<p class="mn-tag">Deprem gelmeden önce hazırlan.</p><p class="mn-sub">Önce Girne\'yi, sonra bir ailenin evini koru.</p>'+
   '<div class="mn-btns"><button class="btn primary" data-act="camp">Oyna<kbd>Enter</kbd></button><button class="btn" data-act="how">Nasıl oynanır?</button></div>'+best+'</div>'+
   '<ol class="mn-flow"><li><i></i><b>Şehri hazırla</b><span>3 tur boyunca önlem al, mahallelerde tatbikat yap.</span></li><li><i></i><b>Deprem</b><span>3. tur bitince olur; öncü sarsıntı uyarır, harita eve yakınlaşır.</span></li><li><i></i><b>Bir ailenin evi</b><span>Evde hayatta kal. Şehir ve ev puanı birleşir.</span></li></ol>'+
   '<div class="mn-foot">ODTÜ KALTEV · 16–18 Ekim 2026 · Afete hazırlık ve farkındalık</div></div>';
}
function howUI(){return '<div class="dim" data-act="closehow"></div><div class="panel modal how"><h2>Nasıl oynanır?</h2>'+
 '<div class="row"><div class="n">★</div><p><b>Girne:</b> Tek afet var: <b>deprem</b>. <b>3. tur bitince</b> olur; öncü sarsıntı 2. turda uyarır. Depremi engelleyemezsin ama zararını <b>önceden alacağın önlemlerle</b> azaltabilirsin. Mahalleleri ◆ ile güçlendir ya da <b>mahalleye git</b>: okulda korunma ve tahliye, çarşıda deprem öncesi güvenlik denetimi, afet merkezinde tahliye güzergâhı… Başarırsan kademe ücretsiz. Şehir yıldızları, o tur sayısındaki bütçe ve tatbikat fırsatına göre hesaplanır; deprem büyüklüğü puanı değiştirmez. Haritada açılan <b>açık risklerin</b> (yangın, gaz, söylenti, tıkalı yol, eski boru) önlemini uygula; <b>acil risk</b> uyarısına süre dolmadan yetiş, art arda başarılarda KOMBO bonusu kazan.</p></div>'+
 '<div class="row"><div class="n">1</div><p><b>Evi hazırla.</b> Şehir bittikten sonra bir ailenin evine gelirsin. Kırmızı <b>!</b> işaretli deprem tehlikelerine (devrilecek dolap, düşecek avize…) tıkla. Her işlem hazırlık süreni (dk) harcar, hepsine yetmez. Sağdaki <b>afet çantasına</b> sınırlı sayıda eşya seç.</p></div>'+
 '<div class="row"><div class="n">2</div><p><b>Deprem anı.</b> Bir kişiyi seç, sonra yere tıkla: oraya gider. <b>Sağlam masanın altına</b> sakla (çök-kapan-tutun). Kapı eşiği güvenli değildir.</p></div>'+
 '<div class="row"><div class="n">3</div><p><b>Sonrası.</b> <b>Artçı sarsıntı</b> uyarısında hemen sığın. Gaz kokusunda ışığa, elektrik anahtarına ve şaltere dokunma; güvenliyse havalandır, vanayı kapat ve dışarı çık. Karanlıkta fener şart.</p></div>'+
 '<div class="row"><div class="n">4</div><p><b>72 saat.</b> Çantan, toplanma alanındaki ilk üç günü nasıl geçireceğini belirler. Şehir ve ev puanın birleşir; <b>en yüksek skorun</b> kaydedilir.</p></div>'+
 '<div style="text-align:right;margin-top:14px"><button class="btn primary" style="font-size:16px;padding:10px 26px" data-act="closehow">Anladım</button></div></div>';}
function levelsUI(){
  let c='';
  LEVELS.forEach((L,i)=>{const lock=i>0&&S.prog.stars[0]<1,st=S.prog.stars[i];
    c+='<button class="card'+(lock?' lock':'')+'" data-act="lvl" data-i="'+i+'"><div class="no">'+(i+1)+'</div><span class="tg">'+L.tag+'</span><h3>'+L.name+'</h3><p>'+L.sub+'<br>'+L.ppl.length+' kişi · '+L.budget+' dk · '+L.slots+' çanta yeri</p><div class="stars">'+'★'.repeat(st)+'<i>'+'★'.repeat(3-st)+'</i></div><div class="best">'+(lock?'Kilitli: 1. bölümde en az 1 yıldız al':(S.prog.best[i]?'En iyi: %'+S.prog.best[i]:'Henüz oynanmadı'))+'</div></button>';});
  return chrome()+'<div class="title2"><h2>Ev senaryoları</h2><p>Yedi farklı gece, yedi farklı tehlike. Oyundaki evi burada tek tek çalış.</p></div><div class="cards">'+c+'</div><button class="btn abs" style="left:70px;top:652px" data-act="back">← Menüye dön</button>';
}
function prepUI(){
  return chrome()+'<div class="panel top"><div class="lv"><b>'+(R.mini?'GİRNE':'BÖLÜM '+(R.li+1))+'</b> · '+R.L.name+' <span class="tg2">'+R.L.tag+'</span></div><div class="phase">HAZIRLIK</div><div class="sp"></div><div class="clock"><svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#ffd166" stroke-width="2.4"/><path d="M12 6v6l4 2" stroke="#ffd166" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg><div class="bar" id="barwrap"><i id="barfill"></i></div><span id="left" style="min-width:56px"></span></div>'+(R.mini?'<button class="btn sm" data-act="miniquit">Vazgeç</button>':'<button class="btn sm" data-act="menu">Menü</button>')+'</div>'+
  '<div class="panel" id="bag"></div><div class="panel" id="info"></div>';
}
function goLabel(){return isWild()?'HAZIRIM — YANGIN GELSİN':R.L.scn==='quake'?'HAZIRIM — DEPREM ÇIKSIN':'HAZIRIM — DEPREM ÇIKSIN';}
function renderBag(){
  const el=document.getElementById('bag');if(!el)return;
  if(R.mini){el.innerHTML=miniPanelHTML();return;}
  let sl='';for(let i=0;i<R.L.slots;i++){const id=R.bag[i];const it=id&&ITEMS.find(x=>x.id===id);sl+='<div class="slot'+(it?' f':'')+'">'+(it?'<svg viewBox="0 0 48 48">'+it.svg+'</svg>':'')+'</div>';}
  let items='';ORDER.forEach(id=>{const it=ITEMS.find(x=>x.id===id),on=has(id),dis=!on&&(R.bag.length>=R.L.slots||R.left<ITEM_COST);
    items+='<button class="item'+(on?' on':'')+(dis?' dis':'')+'" data-act="item" data-id="'+id+'"><svg viewBox="0 0 48 48">'+it.svg+'</svg><b>'+it.n+'</b><i>'+(ITEM_COST+' dk')+'</i></button>';});
  el.innerHTML='<h2>AFET ÇANTASI <span>'+R.bag.length+' / '+R.L.slots+'</span></h2><div class="slots">'+sl+'</div><div class="items">'+items+'</div><button class="btn primary go" data-act="start" id="gobtn" style="font-size:16px;padding:12px">'+(S.conf?'Emin misin? Geri dönüş yok':goLabel())+'</button><p class="survival-rule" role="status">'+suppliesWarning()+'</p>';
}
function updateBudget(){
  const l=document.getElementById('left'),b=document.getElementById('barfill');
  if(l)l.textContent=R.left+' dk';if(b)b.style.width=Math.min(100,R.left/(R.L.budget+(R.opts?R.opts.min||0:0))*100)+'%';
}
function setInfo(t,p,chips){const el=document.getElementById('info');if(el)el.innerHTML='<h3>'+t+'</h3><p>'+p+'</p>'+(chips?'<div class="chips">'+chips+'</div>':'');}
const MISC={
  valve:['Doğalgaz vanası','Sarsıntıdan sonra yapacağın ilk işlerden biri gazı kesmek. Yerini şimdiden bil: gaz kaçağı yangına ve patlamaya yol açar.','Gaz kokusunda'],
  brk:['Elektrik panosu','Elektrik yangınında önce şalteri indir. Yerini ve nasıl kapatıldığını şimdiden bil. (Ama gaz kokusu varken kıvılcım çıkarabilir!)','Elektrik yangınında ilk adım'],
  sw:['Işık anahtarı','Gaz kokusu varken anahtarlara, prizlere ve şaltere dokunma: küçük bir kıvılcım patlamaya yol açabilir.','Gaz kokusunda DOKUNMA'],
  ext:['Yangın söndürücü','Elektrik yangınında önce elektriği kes, sonra söndürücüyü kullan. Yerini ve kullanımını bütün aile bilmeli.','Elektrikten sonra']
};
function refreshInfo(){
  if(S.mode!=='prep')return;
  const k=S.hover;
  if(k&&MISC[k]){const m=MISC[k];return setInfo(m[0],m[1],'<span class="chip y">'+m[2]+'</span>');}
  if(k){const h=HZ[k],fx=R.fixed[k];return setInfo(h.n,h.desc,'<span class="chip y">'+h.act+' · '+h.cost+' dk</span>'+(fx?'<span class="chip g">Yapıldı ✓</span>':(R.left<h.cost?'<span class="chip r">Süren yetmiyor</span>':'<span class="chip r">Tehlikeli</span>')));}
  if(S.hoverP>=0){const p=R.people[S.hoverP];return setInfo(p.def.name,p.def.desc,'');}
  setInfo('Hazırlık zamanı',R.L.intro,'<span class="chip y">Bütçe: '+(R.L.budget+(R.opts?R.opts.min||0:0))+' dk</span>'+(R.mini?'':'<span class="chip">Çanta: '+R.L.slots+' eşya</span>'));
}
function quakeUI(){
  if(isWild())return chrome()+'<div class="banner"><h2>ORMAN YANGINI!</h2><p>Kişiyi seç, SOLDAKİ kapıya tıkla · alevler sağdan geliyor</p><div class="qbar"><i id="qfill"></i></div></div><div class="panel" id="roster"></div>';
  return chrome()+'<div class="banner"><h2>'+(R.L.dark?'DEPREM! (KARANLIK)':'DEPREM!')+'</h2><p>ÇÖK – KAPAN – TUTUN · Kişiyi seç, sonra sağlam masanın altına tıkla</p><div class="qbar"><i id="qfill"></i></div></div><div class="panel" id="roster"></div>';
}
function afterUI(){
  const p={quake:'Sakin ol ve sırayla yap',gas:'Gaz kokusu var! Dikkatli ol',fire:'Yangın çıktı! Sıra çok önemli'}[R.L.scn];
  return chrome()+'<div class="banner"><h2 class="amber" id="bnh">SARSINTI DURDU</h2><p id="bnp">'+p+'</p></div><div class="panel checks" id="checks"></div><div class="panel" id="roster"></div>';
}
function setBanner(h,p,cls){const e=document.getElementById('bnh'),f=document.getElementById('bnp');if(e){e.textContent=h;e.className=cls||'amber';}if(f)f.textContent=p;}
const TASKL={window:'Pencereyi aç (havalandır)',gas:'Gaz vanasını kapat',breaker:'Elektrik panosundan şalteri indir',ext:'Yangın söndürücüyle söndür',exit:'Kapıdan çık'};
function renderChecks(){
  const el=document.getElementById('checks');if(!el||!R.after)return;
  const a=R.after,scn=R.L.scn,st={window:R.winOpen,gas:R.gasClosed,breaker:R.breakerOff,ext:a.extinguished,exit:a.exiting};
  let h='<h3>SIRAYLA</h3>';
  a.tasks.forEach((k,i)=>{h+='<div class="'+(st[k]?'done':'')+'"><span class="bx">'+(st[k]?'✓':(i+1))+'</span>'+TASKL[k]+'</div>';});
  if(scn==='gas')h+='<div class="warn">'+ico('warn')+' Işığa, anahtara, şaltere DOKUNMA!</div><div class="mt">Gaz yoğunluğu</div><div class="qbar" style="width:100%;margin:2px 0 0"><i class="gas" id="mfill"></i></div>';
  if(scn==='fire')h+='<div class="mt">Yangın şiddeti</div><div class="qbar" style="width:100%;margin:2px 0 0"><i class="fire" id="mfill"></i></div>';
  h+='<div class="mt">Kalan süre</div><div class="qbar" style="width:100%;margin:2px 0 0"><i id="afill"></i></div>';
  h+='<small id="exitClock" class="exit-clock"></small><section id="rescuePanel" class="rescue-panel" hidden><h4>'+ico('firstaid')+' YARDIM GEREKİYOR</h4><p></p><button class="btn sm" data-act="homehelp"></button><small>Bu bir oyun simülasyonu; gerçek acil çağrı yapılmaz.</small></section>';
  el.innerHTML=h;updateRescueUI();
}
function rosterHTML(){
  const act=S.mode==='quake'||S.mode==='after';
  return R.people.map((p,i)=>{
    const st=p.stranded?'Yardım bekliyor':p.rescued?'Ekip desteğiyle çıktı':p.hidden?'Güvende ✓':p.down?'Ağır yaralı · yürüyemez':p.evac&&S.mode==='after'?'Çıkıyor…':p.hits?(p.state==='shelter'?'Korunuyor (yaralı)':'Yaralı'):p.state==='shelter'?'Korunuyor ✓':p.state==='walk'?(isWild()?'Kaçıyor…':'Koşuyor…'):'Komut bekliyor';
    const cls=(i===R.sel&&act&&!p.hidden?' sel':'')+(!p.stranded&&(p.hidden||(p.state==='shelter'&&!p.hits))?' ok':'')+(p.stranded||p.hits&&!p.hidden?' bad':'');
    return '<button class="rc'+cls+'" data-act="pick" data-i="'+i+'"><span class="av" style="background:'+p.def.acc+'">'+p.def.name[0]+'</span><span><b>'+p.def.name+'</b><i>'+st+'</i></span></button>';}).join('');
}
function updateRoster(){updateShelterUI();updateRescueUI();const el=document.getElementById('roster');if(!el)return;const s=rosterHTML();if(s!==sigRoster){sigRoster=s;el.innerHTML=s;}}
function simUI(){
  const days=R.sim.days;
  return chrome()+'<div class="panel hours abs" id="hrs"></div><div class="panel" id="days">'+days.map((d,i)=>'<div class="day" id="day'+i+'"><h4>GÜN '+(i+1)+' · '+d.title+'</h4>'+d.lines.map((l,j)=>'<div class="ln'+(l.ok?'':' x')+'" id="ln'+i+'_'+j+'">'+l.text+'</div>').join('')+'</div>').join('')+'</div><button class="btn abs" style="left:20px;bottom:20px" data-act="skip" id="skipbtn">Atla ▶</button>';
}
function resultUI(){
  const sc=R.score,L=R.L,next=false;
  const grade=sc.total>=85?'Afete hazır!':sc.total>=68?'Neredeyse hazır':sc.total>=45?'Yarı yolda':'Daha çok hazırlık gerek';
  const m=(n,v,mx)=>'<div class="meter"><div><span>'+n+'</span><span>'+Math.round(v)+' / '+mx+'</span></div><div class="b"><i style="width:'+(v/mx*100)+'%"></i></div></div>';
  return chrome()+'<div class="dim"></div><div class="panel modal res"><div><div class="kicker">BÖLÜM '+(R.li+1)+' · '+L.name.toUpperCase()+'</div><div class="big">%'+sc.total+'</div><div class="st">'+'★'.repeat(sc.stars)+'<i>'+'★'.repeat(3-sc.stars)+'</i></div><p style="margin:6px 0 14px;font-weight:800;font-size:20px">'+grade+'</p>'+(sc.stranded?'<p class="score-limit">'+sc.stranded+' kişi güvenli alana ulaşamadı. Tahliye ve toplam puan sınırı uygulandı.</p>':'')+m('Ev hazırlığı',sc.home,25)+m('Afet anı',sc.quake,35)+m(isWild()?'Tahliye':'Sonrası',sc.after,15)+m('72 saat çantası',sc.bag,25)+'</div>'+
   '<div><div class="kicker" style="margin-bottom:6px">NE OLDU?</div><div class="log">'+R.log.map(l=>'<div class="'+(l.ok?'':'bad')+'">'+l.text+'</div>').join('')+'</div><div class="fact"><b>BİLİYOR MUYDUN?</b><br>'+R.fact+'</div></div>'+
   '<div class="acts"><button class="btn" data-act="share" id="sharebtn">Skoru kopyala</button><button class="btn" data-act="menu">Menü</button>'+(R.opts?'<button class="btn" data-act="campsum">Oyun sonucu →</button>':'')+(next?'<button class="btn" data-act="next">Sonraki bölüm →</button>':'')+'<button class="btn primary" style="font-size:16px;padding:10px 26px" data-act="retry">Tekrar dene</button></div></div>';
}

/* ---------- hazırlık ---------- */
function startLevel(i,opts){S.level=i;R=makeRun(i,opts);S.hover=null;S.hoverP=-1;S.hoverKey=null;S.conf=false;S.infoItem=false;S.shake=0;parts.length=0;go('prep');Sfx.calm(true);}
function afterAction(){if(R.mini)return;if(R.left<=0&&!R.autoGo){R.autoGo=1.6;toast('Hazırlık süren bitti! Afet geliyor…');}}
function fixHazard(k){
  const h=HZ[k];if(R.fixed[k])return;
  if(R.left<h.cost){Sfx.nope();toast('Yeterli hazırlık süren yok ('+h.cost+' dk gerekli)');shakeEl('barwrap');return;}
  R.fixed[k]=true;R.left-=h.cost;Sfx.fix();const b=h.bb;
  sparkle(b[0]+b[2]/2,b[1]+b[3]/2,10);ftext(b[0]+b[2]/2,b[1]-10,'−'+h.cost+' dk','#ffd166');if(k==='boxes')dust(b[0]+b[2]/2,b[1]+b[3]-10,8,30);
  updateBudget();renderBag();refreshInfo();afterAction();
}
function toggleItem(id){
  const i=R.bag.indexOf(id);
  if(i>=0){R.bag.splice(i,1);R.left+=ITEM_COST;R.autoGo=0;S.conf=false;Sfx.drop();}
  else{
    if(R.bag.length>=R.L.slots){Sfx.nope();toast('Çanta dolu! En fazla '+R.L.slots+' eşya sığar.');return;}
    if(R.left<ITEM_COST){Sfx.nope();toast('Yeterli hazırlık süren yok');shakeEl('barwrap');return;}
    R.bag.push(id);R.left-=ITEM_COST;Sfx.pick();
  }
  updateBudget();renderBag();afterAction();
}
function hitPerson(m){
  /* Üst üste binen kişilerde listedeki ilk değil, tıklamaya EN YAKIN kişi seçilir. */
  let best=-1,bd=1e9;
  for(let i=0;i<R.people.length;i++){const p=R.people[i];if(p.hidden||p.fade)continue;const dog=p.type==='dog',sc=p.def.sc;
    const dx=Math.abs(m.wx-p.x);
    if(dx<(dog?36:24*sc+8)&&m.wy>FLOOR-(dog?70:130*sc)-12&&m.wy<FLOOR+12&&dx<bd){bd=dx;best=i;}}
  return best;
}
const inR=(m,r)=>m.wx>=r[0]&&m.wx<=r[0]+r[2]&&m.wy>=r[1]&&m.wy<=r[1]+r[3];
const VALVE_HIT=[216,344,40,56];
function hitMisc(m){
  if(inR(m,SPOT.sw))return'sw';
  if(inR(m,SPOT.brk))return'brk';
  if(R.L.scn==='fire'&&inR(m,SPOT.ext))return'ext';
  if(inR(m,VALVE_HIT))return'valve';
  return null;
}
function hitHazard(m){
  const mk=hitMisc(m);if(mk)return mk;
  for(const k of R.L.hz){const b=HZ[k].bb;if(m.wx>=b[0]-6&&m.wx<=b[0]+b[2]+6&&m.wy>=b[1]-22&&m.wy<=b[1]+b[3]+6)return k;}
  return null;
}

/* ---------- afet anı ---------- */
function buildEvents(){
  const evs=[],scn=R.L.scn;
  for(const k of R.L.hz){const h=HZ[k];if(h.zone&&!R.fixed[k])evs.push({k,zone:h.zone,t:h.t+rnd(-.35,.35),hit:h.hit,fall:true,done:false,started:false});}
  if(scn!=='wild')FIXED_EV.forEach(e=>{if(scn==='gas'&&e.k==='glass')return;if(e.k==='ceil'&&R.opts&&R.opts.noCeil)return;evs.push({k:e.k,zone:e.zone,t:e.t+rnd(-.2,.2),hit:e.hit,okt:e.okt,fall:false,done:false,started:false});});
  evs.sort((a,b)=>a.t-b.t);return evs;
}
function quakeFlash(){Sfx.quakeStart();const old=document.getElementById('qflash');if(old)old.remove();ui.insertAdjacentHTML('beforeend','<div id="qflash" aria-hidden="true"><b>DEPREM!</b><span>ÇÖK · KAPAN · TUTUN</span></div>');setTimeout(()=>{const e=document.getElementById('qflash');if(e)e.remove();},1700);S.shake=Math.max(S.shake||0,8);}
function startQuake(){
  const wild=isWild();
  R.q={t:0,evs:buildEvents(),blackout:!!R.L.dark,haze:0,ended:false,front:1400,creakT:1,endT:0};R.autoGo=0;
  R.sel=0;R.people.forEach(p=>{p.state='idle';p.dir=1;});parts.length=0;S.shake=0;
  Sfx.calm(false);
  if(wild){Sfx.fire(true);Sfx.fireLevel(.25);}else{Sfx.alarm(true);Sfx.rumble(true);}
  go('quake');
  if(!wild)quakeFlash();
}
function hurt(p){
  if(p.down||p.hidden||p.fade)return;
  const wild=isWild();if(wild&&p.hits>=2)return;
  p.hits++;Sfx.hit();ftext(p.x,FLOOR-(p.type==='dog'?80:132*p.def.sc),p.hits>1?'Ağır yaralı!':'Yaralandı!','#ff6f91');dust(p.x,FLOOR-20,5,14);sparkle(p.x,FLOOR-60,6,'#ff6f91');
  if(p.hits>=2&&!wild){p.down=true;p.state='idle';p.sheltered=false;p.spot=null;}
}
function onFallStart(ev){
  if(ev.k==='glass'){shards(620,320,30);Sfx.glass();}
  if(ev.k==='ceil'){R.q.haze=1;chunks(640,170,40,['#d9d2c4','#bfb7a8','#e8e2d6'],480);Sfx.impact('ceil');}
  if(ev.k==='curtain'){Sfx.spark();for(let i=0;i<16;i++)P({k:'ember',x:600+rnd(-50,60),y:300+rnd(-30,80),vx:rnd(-60,60),vy:rnd(-120,-20),g:60,life:rnd(.6,1.4),max:1.4,s:3});}
  if(ev.k==='tube')Sfx.warn();
}
function applyEvent(ev){
  const q=R.q;
  if(ev.k==='shelf'){dust(420,545,16,70);chunks(420,540,14,['#e63946','#f4a261','#2a9d8f','#e9c46a','#6a4c93'],60);}
  if(ev.k==='tv'){dust(520,550,12,40);for(let i=0;i<10;i++)P({k:'star',x:520+rnd(-30,30),y:540+rnd(-10,10),vx:rnd(-80,80),vy:rnd(-160,-40),g:500,life:.6,max:.6,s:rnd(4,8),c:'#fff6a8'});}
  if(ev.k==='lamp'){dust(835,500,14,60);shards(835,500,14);}
  if(ev.k==='wardrobe'){dust(900,545,18,80);chunks(900,540,8,['#7b5b8f','#8f6fa5'],60);}
  if(ev.k==='ceil'){q.blackout=true;}
  if(ev.k==='tube'){Sfx.explode();dust(676,520,16,50,'255,170,90');chunks(676,520,16,['#d9482b','#ff8a3d','#444'],40);for(let i=0;i<24;i++)P({k:'ember',x:676+rnd(-40,40),y:520+rnd(-30,20),vx:rnd(-200,200),vy:rnd(-260,-40),g:300,life:rnd(.6,1.4),max:1.4,s:3});}
  else if(ev.k==='curtain'){for(let i=0;i<14;i++)P({k:'smoke',x:610+rnd(-50,50),y:360+rnd(-40,20),vx:rnd(-20,20),vy:rnd(-60,-20),life:rnd(1.2,2.2),max:2.2,s:rnd(10,18)});}
  else if(ev.k!=='glass'&&ev.k!=='ceil')Sfx.impact(ev.k);
  const hurtL=[];
  for(const p of R.people){if(p.hidden||p.fade)continue;if(p.x>=ev.zone[0]&&p.x<=ev.zone[1]&&!p.sheltered){const before=p.hits;hurt(p);if(p.hits>before)hurtL.push(p);}}
  R.impacts.push({key:ev.k,people:hurtL.map(p=>p.def.name)});
  if(hurtL.length)R.evlog.push({ok:false,text:nameList(hurtL)+': '+ev.hit+'.'});
  else if(ev.k==='curtain')R.evlog.push({ok:true,text:'Perde tutuştu ama kimse yakınında değildi.'});
  else if(ev.k==='tube')R.evlog.push({ok:true,text:'Gaz tüpü patladı ama herkes uzaktaydı. Tüpü evden uzaklaştırmak yine de şart!'});
  else if(ev.fall)R.evlog.push({ok:true,text:HZ[ev.k].n+' düştü ama kimse zarar görmedi.'});
  else R.evlog.push({ok:true,text:ev.okt});
}
function orderMove(p,wx){
  if(p.down||p.hidden||p.fade)return false;
  const wild=isWild();
  let spot=null,tx=clamp(wx,190,1100);
  if(wild){if(wx<228){tx=185;p.exitGo=true;}}
  else for(const sp of[TABLE,DESK]){
    if(wx>=sp.x0-14&&wx<=sp.x1+14){
      spot=sp;const taken=R.people.filter(o=>o!==p&&o.spot===sp).map(o=>o.tx);let best=null;
      for(const s of sp.slots){if(!taken.some(t=>Math.abs(t-s)<12)){if(best===null||Math.abs(s-wx)<Math.abs(best-wx))best=s;}}
      if(best===null){Sfx.nope();toast(sp.name+' dolu. Diğer masayı seç.');return false;}
      tx=best;
    }
  }
  p.exitGo=wild&&wx<228;p.evac=false;
  p.spot=spot;p.sheltered=false;p.tx=tx;
  if(Math.abs(tx-p.x)<1){p.state=spot?'shelter':'idle';p.sheltered=!!spot;if(p.exitGo){p.fade=true;p.exitWait=R.fixed.boxes?0:1.2;}}else p.state='walk';
  Sfx.click();updateShelterUI();return true;
}
function movePeople(dt){
  for(const p of R.people){
    if(p.down||p.hidden||p.fade||p.evac||p.state!=='walk')continue;
    const d=p.tx-p.x,s=p.def.speed*(p.hits?.7:1),step=Math.sign(d)*Math.min(Math.abs(d),s*dt);
    p.x+=step;if(d)p.dir=Math.sign(d);
    if(Math.abs(p.tx-p.x)<1){
      p.x=p.tx;
      if(p.exitGo){p.state='idle';p.fade=true;p.exitWait=R.fixed.boxes?0:1.2;}
      else if(p.spot){p.state='shelter';p.sheltered=true;Sfx.safe();ftext(p.x,FLOOR-110,'Çök-Kapan-Tut','#7dffb0');}
      else p.state='idle';
    }
  }
}
function selectNext(){
  const n=R.people.length;
  for(let k=1;k<=n;k++){const i=(R.sel+k)%n,p=R.people[i];if(p.state==='idle'&&!p.down&&!p.hidden&&!p.fade){R.sel=i;return;}}
}
function updateQuake(dt){
  const q=R.q;q.t+=dt;
  if(isWild()){updateWild(dt);return;}
  const i=qi(q.t);S.shake=i;Sfx.rumbleLevel(i*.5);
  q.creakT-=dt;if(q.creakT<=0&&i>.3){Sfx.creak();q.creakT=rnd(1.4,2.6);}
  if(q.t<13&&Math.random()<dt*4*i)dust(rnd(200,1100),150,1,10);
  runEvents(q);
  for(const key of R.L.hz){const h=HZ[key];if(R.fixed[key]&&h.t&&q.t>=h.t&&!R.prevented.includes(key)){R.prevented.push(key);Sfx.secured();}}
  renderProtectionFeed();
  q.haze=Math.max(0,q.haze-dt*.3);
  movePeople(dt);
  const f=document.getElementById('qfill');if(f)f.style.width=clamp(q.t/13*100,0,100)+'%';
  updateRoster();
  if(q.t>=13.2&&!q.ended){q.ended=true;S.shake=0;startAfter();}
}
function runEvents(q){
  for(const ev of q.evs){
    if(!ev.started&&q.t>=ev.t){ev.started=true;onFallStart(ev);}
    if(!ev.done&&q.t>=ev.t+.45){ev.done=true;applyEvent(ev);}
  }
}

/* ---------- orman yangını ---------- */
function updateWild(dt){
  const q=R.q;S.shake=0;q.front=1400-q.t*FRONT_V;
  Sfx.fireLevel(clamp(.25+q.t/28,0,1));
  runEvents(q);
  movePeople(dt);
  const mask=has('maske');
  for(const p of R.people){
    if(p.hidden)continue;
    if(p.fade){
      if(p.exitWait>0)p.exitWait-=dt;
      else{p.alpha-=dt*3;if(p.alpha<=0){p.hidden=true;p.exited=true;Sfx.safe();}}
      continue;
    }
    if(p.x>q.front-30){
      p.smk+=dt*(mask?.5:1);
      if(Math.random()<dt*10)P({k:'smoke',x:p.x+rnd(-14,14),y:FLOOR-rnd(40,110),vx:rnd(-20,20),vy:rnd(-50,-20),life:1.1,max:1.1,s:rnd(8,14)});
      if(p.smk>=1){p.smk=0;hurt(p);}
    }
  }
  if(Math.random()<dt*14)P({k:'ember',x:rnd(200,1150),y:rnd(120,300),vx:rnd(-90,-30),vy:rnd(10,60),g:20,life:rnd(1.2,2.4),max:2.4,s:3});
  const f=document.getElementById('qfill');if(f)f.style.width=clamp((1400-q.front)/1210*100,0,100)+'%';
  updateRoster();
  const all=R.people.every(p=>p.hidden);
  if(all||q.t>=40){
    q.endT+=dt;
    if(q.endT>.8&&!q.ended){q.ended=true;finishWild();}
  }
}
function finishWild(){
  const caught=R.people.filter(p=>!p.hidden);
  caught.forEach(p=>{if(p.hits<2)p.hits=2;});
  const ok=R.people.filter(p=>p.exited&&p.hits===0),hurtE=R.people.filter(p=>p.exited&&p.hits>0);
  if(ok.length)R.evlog.push({ok:true,text:nameList(ok)+' alevler ulaşmadan güvenle tahliye edildi.'});
  if(hurtE.length)R.evlog.push({ok:false,text:nameList(hurtE)+' tahliye edildi ama dumandan etkilendi'+(has('maske')?' (maske zararı azalttı).':'. Maske çantada olsaydı daha az etkilenirdi.')});
  if(caught.length)R.evlog.push({ok:false,text:nameList(caught)+' alevlere yakalandı: yangın hızlı yayılır, geç kalmamak gerekir.'});
  Sfx.stopAll();startSim();
}

/* ---------- sarsıntı sonrası ---------- */
function startAfter(){
  const scn=R.L.scn;
  const sh=R.people.filter(p=>p.sheltered&&p.hits===0&&!p.down);
  if(sh.length)R.evlog.push({ok:true,text:nameList(sh)+' çök-kapan-tut yaptı ve korunaklı kaldı.'});
  R.after={t:0,lim:scn==='quake'?14:20,exiting:false,delay:0,gas:0,gasLvl:scn==='gas'?12:0,
    tasks:{quake:['gas','exit'],gas:['window','gas','exit'],fire:['breaker','ext','exit']}[scn],
    fire:scn==='fire',fireLvl:scn==='fire'?12:0,extinguished:false,as:0,asT:0,aftAt:R.L.aft?rnd(3,4.5):999,forceT:0,evacT:0,helpCalled:false,helpT:0,done:false};
  if(R.mini)R.after.tasks=R.after.tasks.filter(k=>k!=='exit');
  R.people.forEach(p=>{if(p.state==='walk'){p.state='idle';}});
  Sfx.alarm(false);Sfx.rumble(false);Sfx.calm(true);
  if(scn==='gas')Sfx.hiss(true);
  if(scn==='fire'){Sfx.fire(true);Sfx.fireLevel(.2);}
  go('after');
}
function closeGas(){R.gasClosed=true;Sfx.valve();Sfx.hiss(false);sparkle(239,400,10,'#9bf0b8');ftext(239,330,'Gaz kapandı','#7dffb0');renderChecks();}
function openWindow(){R.winOpen=true;Sfx.window();sparkle(620,320,8,'#bfe6ff');ftext(620,230,'Havalandırıyor','#9bf0ff');renderChecks();}
function ignite(src){
  if(R.sparked)return;const a=R.after;
  R.sparked=true;R.sparkT=1;Sfx.hiss(false);Sfx.spark();Sfx.explode();Sfx.fire(true);Sfx.fireLevel(.9);
  dust(420,500,14,220,'255,190,120');sparkle(420,480,14,'#ffb44a');
  const hl=[];R.people.forEach(p=>{if(!p.hidden&&!p.fade){hurt(p);hl.push(p);}});
  R.evlog.push({ok:false,text:(src==='switch'?'Işık/şalter kıvılcımı gazı tutuşturdu':'Biriken gaz tutuştu')+(hl.length?': '+nameList(hl)+' yaralandı.':'.')});
  renderChecks();
}
function breakerClick(){
  const scn=R.L.scn,a=R.after;
  if(scn==='gas'){if(a.gasLvl>=8){ftext(272,350,'KIVILCIM!','#ff8da6');ignite('switch');}else toast('Gaz dağıldı ama şalterle yine de uğraşma.');return;}
  if(scn==='fire'){
    if(R.breakerOff){toast('Elektrik zaten kesik.');return;}
    R.breakerOff=true;Sfx.breaker();ftext(270,350,'Elektrik kesildi','#7dffb0');sparkle(270,390,8,'#9bf0b8');renderChecks();return;
  }
  toast('Şimdi elektrik panosuyla uğraşmana gerek yok.');
}
function switchClick(){
  const scn=R.L.scn,a=R.after;
  if(scn==='gas'){if(a.gasLvl>=8){ftext(272,430,'KIVILCIM!','#ff8da6');ignite('switch');}else toast('Gaz dağıldı ama anahtarlarla oynama.');return;}
  toast(R.L.dark?'Elektrik yok, anahtar çalışmıyor.':'Şimdi ışıkla uğraşma; asıl iş başka yerde.');Sfx.nope();
}
function extClick(){
  const a=R.after;
  if(a.extinguished)return;
  if(!R.breakerOff){
    R.shock=true;a.fireLvl=Math.min(100,a.fireLvl+12);Sfx.spark();Sfx.nope();toast('Önce elektriği kes! Elektrik açıkken müdahale çarpılma riski taşır.');
    ftext(676,470,'Önce elektriği kes!','#ff8da6');R.evlog.push({ok:false,text:'Elektriği kesmeden söndürmeye çalıştın: çarpılma ve yangının büyümesi riski.'});
    return;
  }
  a.extinguished=true;a.fire=false;a.fireLvl=0;Sfx.ext();Sfx.fire(false);
  for(let i=0;i<30;i++)P({k:'foam',x:600+rnd(-40,40),y:520+rnd(-50,20),vx:rnd(-90,-20),vy:rnd(-60,20),life:rnd(.7,1.4),max:1.4,s:rnd(6,12)});
  R.evlog.push({ok:true,text:'Elektriği kestikten sonra yangını söndürücüyle söndürdün: doğru sıra.'});
  ftext(610,400,'Söndü!','#7dffb0');renderChecks();
}
/* Tahliye bir oyun simülasyonudur; ağır yaralıya sivil taşıma komutu verilmez. */
function startExit(force){
  const a=R.after;if(!a||a.done)return;
  if(a.as===1||a.as===2){if(!force){toast('Artçı sürüyor! Korun, sarsıntı durunca çık.');Sfx.nope();}return;}
  if(!a.exiting){
    a.exiting=true;a.delay=R.fixed.boxes?0:3.2;R.exitDelayed=!R.fixed.boxes;
    if(R.exitDelayed){ftext(250,460,'Çıkış kutularla kapalı!','#ff8da6');dust(240,540,10,34);}
    if(exitDark()){R.darkExit=true;toast('Fenerin yok! Karanlıkta yalnız yanındakileri görüyorsun, yavaş ilerliyorsunuz.');}
  }
  R.people.forEach(p=>{if(p.hidden||p.down)return;p.spot=null;p.sheltered=false;p.state='idle';p.evac=true;});
  Sfx.click();renderChecks();
}
function requestRescue(){
  const a=R.after;if(S.mode!=='after'||S.paused||!a||a.helpCalled||a.done)return;
  const heavy=R.people.filter(p=>p.down&&!p.exited&&!p.stranded);
  if(!heavy.length)return;
  if(!R.people.some(p=>p.exited&&p.type!=='dog')){toast('Önce yürüyebilenler güvenli alana çıksın; dışarıdan yardım iste.');Sfx.nope();return;}
  a.helpCalled=true;a.helpT=0;
  R.evlog.push({ok:true,text:'Güvenli alandan yardım istedin; '+nameList(heavy)+' için uzman ekip beklendi. Ağır yaralıyı kendin taşımadın.'});
  Sfx.safe();renderChecks();
}
function updateEvacuation(dt){
  const a=R.after;if(!a.exiting||a.done)return;
  if(a.as===1||a.as===2)return;
  a.evacT+=dt;
  if(a.delay>0)a.delay=Math.max(0,a.delay-dt);
  else for(const p of R.people){
    if(p.hidden||p.down||!p.evac)continue;
    p.tx=190;p.state='walk';const d=p.tx-p.x,speed=p.def.speed*1.1*(p.hits?.65:1)*(exitDark()?.8:1);
    p.x+=Math.sign(d)*Math.min(Math.abs(d),speed*dt);p.dir=-1;
    if(Math.abs(p.tx-p.x)<3){p.alpha=Math.max(0,p.alpha-dt*3);if(p.alpha===0){p.hidden=true;p.exited=true;p.evac=false;}}
  }
  if(a.helpCalled&&(!R.L.aft||a.as===3)){
    a.helpT+=dt;
    if(a.helpT>=6){
      const rescued=R.people.filter(p=>p.down&&!p.exited&&!p.stranded);
      rescued.forEach(p=>{p.rescued=true;p.exited=true;p.hidden=true;p.evac=false;});
      if(rescued.length){R.evlog.push({ok:true,text:nameList(rescued)+' oyunda uzman ekip desteğiyle güvenli alana alındı; yaralanma durumu sürüyor.'});Sfx.safe();}
    }
  }
  if(a.evacT>=32){
    const left=R.people.filter(p=>!p.exited&&!p.stranded);
    left.forEach(p=>{p.stranded=true;p.hidden=true;p.evac=false;});
    if(left.length)R.evlog.push({ok:false,text:nameList(left)+' oyun süresi içinde güvenli alana alınamadı. Yardım ihtiyacı devam ediyor.'});
  }
  if(R.people.every(p=>p.exited||p.stranded)&&!R.mini){a.done=true;startSim();}
}
function updateRescueUI(){
  if(S.mode!=='after'||!R.after)return;
  const a=R.after,box=document.getElementById('rescuePanel'),clock=document.getElementById('exitClock');
  if(clock)clock.textContent=a.exiting?'Tahliye oyun süresi: '+Math.max(0,Math.ceil(32-a.evacT))+' sn · '+R.people.filter(p=>p.exited).length+' / '+R.people.length+' kişi dışarıda':'Çıkış komutuyla 32 sn’lik tahliye değerlendirmesi başlar.';
  if(!box)return;
  const n=R.people.filter(p=>p.down&&!p.exited&&!p.stranded).length;
  box.hidden=n===0;
  if(!n)return;
  const canCall=R.people.some(p=>p.exited&&p.type!=='dog'),status=box.querySelector('p'),button=box.querySelector('button');
  status.textContent=a.helpCalled?'Uzman ekip bekleniyor: '+Math.max(0,Math.ceil(6-a.helpT))+' sn (oyun süresi).':n+' ağır yaralı yürüyemiyor. Önce güvenli alana çık; yaralıyı hareket ettirmeden yardım iste.';
  button.disabled=a.helpCalled||!canCall;
  button.textContent=a.helpCalled?'Yardım istendi':canCall?'Güvenli alandan yardım iste':'Önce yürüyebilenleri çıkar';
}
function aftershockImpact(){
  Sfx.crash();chunks(640,170,24,['#d9d2c4','#bfb7a8','#e8e2d6'],480);dust(rnd(300,1000),200,10,200);R.q.haze=Math.max(R.q.haze,.6);
  const hl=[],ok=[];
  for(const p of R.people){if(p.hidden)continue;if(p.sheltered&&p.state==='shelter')ok.push(p);else if(!p.fade){const before=p.hits;hurt(p);if(p.hits>before)hl.push(p);}}
  R.impacts.push({key:'aftershock',people:hl.map(p=>p.def.name)});
  if(hl.length)R.evlog.push({ok:false,text:'Artçı sarsıntıda '+nameList(hl)+' korunmasızdı ve yaralandı.'});
  else if(R.people.some(p=>!p.hidden&&!p.sheltered&&p.down))R.evlog.push({ok:false,text:'Artçı sırasında korunmasız ağır yaralılar vardı; önceki yaralanmaları sürüyor.'});
  else R.evlog.push({ok:true,text:'Artçı sarsıntıda herkes korunaklıydı ya da dışarıdaydı.'});
}
function updateAfter(dt){
  const a=R.after,scn=R.L.scn;a.t+=dt;S.shake=0;
  if(R.mini){if(R.mini.done)return;const mr=miniCheck();if(mr){miniEnd(mr);return;}}
  R.sparkT=Math.max(0,R.sparkT-dt);
  R.q.haze=Math.max(0,R.q.haze-dt*.3);
  /* gaz */
  if(!R.gasClosed&&(scn==='quake'||scn==='gas')){a.gas-=dt;if(a.gas<=0){a.gas=.12;P({k:'gas',x:239+rnd(-6,6),y:404,vx:rnd(-14,14),vy:rnd(-30,-10),life:rnd(1.2,2),max:2,s:rnd(8,14)});}}
  if(scn==='gas'&&!R.sparked){
    if(!R.gasClosed)a.gasLvl+=(R.winOpen?2.8:5.4)*dt;else a.gasLvl-=(R.winOpen?4:1)*dt;
    a.gasLvl=clamp(a.gasLvl,0,100);
    if(a.gasLvl>=100)ignite('auto');
  }
  /* yangın */
  if((scn==='fire'&&a.fire)||R.sparked){
    if(scn==='fire'&&a.fire){
      a.fireLvl=Math.min(100,a.fireLvl+(R.breakerOff?1.2:3.2)*dt*(a.exiting?.6:1));
      Sfx.fireLevel(a.fireLvl/100);
      if(a.fireLvl>=100&&!R.bigFire){
        R.bigFire=true;Sfx.explode();const hl=[];R.people.forEach(p=>{if(!p.hidden&&!p.fade){hurt(p);hl.push(p);}});
        R.evlog.push({ok:false,text:'Yangın kontrolden çıktı'+(hl.length?': '+nameList(hl)+' yaralandı.':'.')});
      }
    }
    if(Math.random()<dt*9)P({k:'smoke',x:scn==='fire'?610+rnd(-30,30):rnd(250,620),y:scn==='fire'?420:400,vx:rnd(-15,15),vy:rnd(-60,-30),life:rnd(1.4,2.4),max:2.4,s:rnd(12,22)});
  }
  /* artçı */
  if(R.L.aft&&a.as<3){
    if(a.as===0&&a.t>=a.aftAt){a.as=1;a.asT=0;Sfx.warn();Sfx.rumble(true);setBanner('ARTÇI SARSINTI!','Hemen sığın! Korunmasızları masanın altına gönder','red');}
    else if(a.as===1){
      a.asT+=dt;S.shake=.25+.75*clamp(a.asT/2.6,0,1);Sfx.rumbleLevel(S.shake*.5);
      if(Math.random()<dt*6)dust(rnd(200,1100),150,1,10);
      if(a.asT>=2.6){a.as=2;a.asT=0;aftershockImpact();}
    }else if(a.as===2){
      a.asT+=dt;S.shake=Math.max(0,1-a.asT/1.8);Sfx.rumbleLevel(S.shake*.5);
      if(a.asT>=1.8){a.as=3;S.shake=0;Sfx.rumble(false);setBanner('SARSINTI DURDU','Artçı bitti, devam et');}
    }
  }
  /* göstergeler */
  const f=document.getElementById('afill');if(f)f.style.width=clamp(100-(a.exiting?a.evacT/32:a.t/a.lim)*100,0,100)+'%';
  const mf=document.getElementById('mfill');if(mf)mf.style.width=(scn==='gas'?a.gasLvl:a.fireLvl)+'%';
  if(a.t>=a.lim&&!a.exiting&&a.as!==1&&a.as!==2)startExit(true);
  movePeople(dt);
  updateEvacuation(dt);if(S.mode!=='after')return;
  updateRoster();
}

/* ---------- puan ---------- */
function itemW(it){
  if(it.id==='ilac')return R.L.meds?14:3;
  if(it.id==='petfood')return R.L.pet?12:0;
  if(it.id==='fener')return R.L.dark?18:12;
  if(it.id==='maske')return isWild()?12:3;
  return it.w;
}
function computeScore(){
  const L=R.L,scn=L.scn,totW=L.hz.reduce((a,k)=>a+HZ[k].w,0),fixW=L.hz.reduce((a,k)=>a+(R.fixed[k]?HZ[k].w:0),0);
  const home=25*fixW/totW;
  let ps=0;R.people.forEach(p=>{ps+=p.hits===0?1:p.hits===1?.5:0;});
  const quake=35*ps/R.people.length;
  const a=R.after;
  let after=0;
  if(scn==='quake')after=(R.gasClosed?8:0)+(R.fixed.boxes?7:2);
  else if(scn==='gas'){after=(R.winOpen?4:0)+(R.gasClosed?6:0)+(R.fixed.boxes?5:1);if(R.sparked)after*=.25;}
  else if(scn==='fire'){after=(R.breakerOff?6:0)+(a&&a.extinguished?5:0)+(R.fixed.boxes?4:1);if(R.shock)after=Math.max(0,after-3);if(R.bigFire)after*=.5;}
  else if(scn==='wild')after=15*R.people.filter(p=>p.exited).length/R.people.length;
  const ws=ITEMS.map(itemW).sort((x,y)=>y-x),max=ws.slice(0,L.slots).reduce((x,y)=>x+y,0);
  const got=R.bag.reduce((x,id)=>x+itemW(ITEMS.find(v=>v.id===id)),0);
  const bag=25*Math.min(1,got/max);
  const escaped=R.people.filter(p=>p.exited).length,stranded=R.people.filter(p=>p.stranded).length;
  if(a&&a.done)after*=escaped/R.people.length;
  const total=Math.min(a&&a.done?(escaped===0?35:stranded?67:100):100,Math.round(home+quake+after+bag));
  const stars=total>=STAR_AT[2]?3:total>=STAR_AT[1]?2:total>=STAR_AT[0]?1:0;
  return{home,quake,after,bag,total,stars,rawTotal:Math.round(home+quake+after+bag),evacuated:escaped,stranded};
}
function buildDays(){
  const L=R.L,hu=R.people.some(p=>p.hits>0),d1=[],d2=[],d3=[];
  const left=R.people.filter(p=>p.stranded);
  if(left.length===R.people.length)return[{title:'TAHLİYE TAMAMLANAMADI',lines:[{ok:0,text:'Aileden kimse toplanma alanına ulaşamadı. Yardım ihtiyacı devam ediyor.'}]},{title:'72 SAAT BAŞLAYAMADI',lines:[{ok:0,text:'Çanta hazır olsa bile güvenli alana ulaşılamadığı için kullanımı bu oyunda değerlendirilemedi.'}]},{title:'ÖNCE HAZIRLIK',lines:[{ok:0,text:'Mobilyaları sabitle, sarsıntıda korun, sonrasında yürüyebilenleri güvenle çıkar ve dışarıdan uzman yardım iste.'}]}];
  if(left.length)d1.push({ok:0,text:nameList(left)+' toplanma alanına ulaşamadı; aşağıdaki çanta sonuçları yalnız dışarı çıkanlar içindir.'});
  d1.push(has('fener')?{ok:1,text:'El feneri geceyi aydınlattı; elektrik yokken yön bulmak ve aileye bakmak kolaylaştı.'}:{ok:0,text:'Elektrik yoktu ve fener de yoktu. Karanlıkta hareket etmek tehlikeliydi.'});
  d1.push(has('ilkyardim')?{ok:1,text:'İlk yardım çantasıyla yaralar temizlenip sarıldı.'}:{ok:0,text:hu?'Yaralanan aile üyeleri için müdahale malzemesi yoktu.':'Küçük yaralara müdahale edecek malzeme yoktu.'});
  d1.push(has('battaniye')?{ok:1,text:'Battaniye geceyi sıcak geçirmeni sağladı.'}:{ok:0,text:'Soğuk gecede hepiniz üşüdünüz.'});
  if(L.scn==='wild')d1.push(has('maske')?{ok:1,text:'Maske dumanı süzdü; nefes almak kolaylaştı.'}:{ok:0,text:'Maske yoktu; duman ciğerlerini yaktı, öksürük geçmedi.'});
  d2.push(has('su')?{ok:1,text:'Su stoğun sayesinde susuz kalmadın.'}:{ok:0,text:'Şebeke suyu kesikti; içecek su bulmak büyük sorun oldu.'});
  d2.push(has('gida')?{ok:1,text:'Pişirme gerektirmeyen yiyecekler karnınızı doyurdu.'}:{ok:0,text:'Yiyecek bulmak zorlaştı; aç kaldınız.'});
  d3.push(has('radyo')||has('pil')?{ok:1,text:'Radyo/powerbank sayesinde resmî duyuruları ve toplanma noktalarını öğrendin.'}:{ok:0,text:'Haber alamadın; yardımın nerede toplandığını bilemedin.'});
  d3.push(has('duduk')?{ok:1,text:'Düdükle yardım ekiplerine kendini duyurabildin.'}:{ok:0,text:'Düdük yoktu; sesini uzaklara duyurmak zordu.'});
  d3.push(has('belge')?{ok:1,text:'Kimlik kopyaları ve nakit işlemleri hızlandırdı.'}:{ok:0,text:'Kimlik ve nakit olmadan işlemler zorlaştı.'});
  const junk=R.bag.map(id=>ITEMS.find(x=>x.id===id)).filter(x=>x.junk);
  if(junk.length)d3.push({ok:0,text:'Çantadaki "'+junk[0].n+'" hayatta kalmana yardım etmedi; yerine su ya da ilaç olabilirdi.'});
  return[{title:'İLK GECE',lines:d1},{title:'SU VE YİYECEK',lines:d2},{title:'HABERLEŞME',lines:d3}];
}
function buildLog(){
  const L=R.L,scn=L.scn,a=R.after,log=R.evlog.slice();
  for(const k of L.hz){if(R.fixed[k]&&k!=='boxes')log.push({ok:true,text:HZ[k].ok});}
  log.push(R.fixed.boxes?{ok:true,text:HZ.boxes.ok}:{ok:false,text:scn==='wild'?'Çıkış yolu kutularla kapalıydı; kaçış gecikti.':'Çıkış yolu kutularla kapalıydı; tahliye gecikti ve herkes tökezledi.'});
  if(scn==='quake')log.push(R.gasClosed?{ok:true,text:'Gaz vanasını kapattın: kaçak ve yangın riski önlendi.'}:{ok:false,text:'Gaz vanası açık kaldı: gaz kaçağı yangın ve patlama riski yarattı.'});
  if(scn==='gas'){
    log.push(R.winOpen?{ok:true,text:'Pencereyi açıp havalandırdın: gaz birikimi yavaşladı.'}:{ok:false,text:'Pencereyi açmadın: gaz hızla birikti.'});
    log.push(R.gasClosed?{ok:true,text:'Gaz vanasını kapattın.'}:{ok:false,text:'Gaz vanası açık kaldı.'});
    if(!R.sparked)log.push({ok:true,text:'Işığa, anahtara ve şaltere dokunmadın: kıvılcım çıkmadı. Doğru!'});
  }
  if(scn==='fire'){
    log.push(R.breakerOff?{ok:true,text:'Önce şalteri indirdin: elektrik yangını büyümedi ve müdahale güvenli oldu.'}:{ok:false,text:'Şalteri indirmedin: elektrik kesilmediği için yangın daha hızlı büyüdü.'});
    if(a&&!a.extinguished&&!R.bigFire)log.push({ok:false,text:'Yangını söndürmeden çıktın: söndürücü ilk dakikalarda en etkilidir.'});
  }
  if(scn==='wild'&&has('maske'))log.push({ok:true,text:'Maske çantandaydı: duman daha az zarar verdi.'});
  if(!L.dark&&R.darkExit)log.push({ok:false,text:'Çantada el feneri yoktu: tahliye karanlıkta, yalnız yan yana duran kişilerin çevresi görünerek ve daha yavaş yapıldı.'});
  if(!L.dark&&!R.darkExit&&has('fener')&&L.scn!=='wild')log.push({ok:true,text:'El feneri çantandaydı: tahliyede ışığa ihtiyaç kalmadı, herkes rahatça çıktı.'});
  if(L.dark&&!has('fener'))log.push({ok:false,text:'El feneri olmadan karanlıkta yön bulmak çok zordu.'});
  if(L.dark&&has('fener'))log.push({ok:true,text:'El feneri sayesinde karanlıkta herkesi görebildin.'});
  const left=R.people.filter(p=>p.stranded);if(left.length)log.push({ok:false,text:nameList(left)+' toplanma alanına ulaşamadı; yardım bekliyor.'});
  const junk=R.bag.map(id=>ITEMS.find(x=>x.id===id)).filter(x=>x.junk);
  if(junk.length)log.push({ok:false,text:'Çantada "'+junk[0].n+'" yer kaplıyordu.'});
  if(R.bag.length<L.slots)log.push({ok:false,text:'Çantada '+(L.slots-R.bag.length)+' boş yer kaldı: hazırlık süreni daha iyi dağıtabilirdin.'});
  return log;
}

/* ---------- 72 saat ve sonuç ---------- */
function startSim(){if(R.after&&R.after.done&&!R.mini&&!R.people.some(p=>p.type!=='dog'&&p.exited)){endGame('house','Tahliye tamamlanamadı','Aileden kimse güvenli alana ulaşamadı.','Çıkış yolunu aç, sarsıntıda korun ve dışarı çıkan bir kişiyle ağır yaralılar için ekip desteği iste.');return;}R.sim={t:0,dur:12,days:buildDays(),shown:{}};go('sim');Sfx.calm(true);if(suppliesFail()){toast('KRİTİK EKSİK: 72 saat planı sürdürülemeyecek. Sonuçta eksik malzemeleri göreceksin.');Sfx.warn();}}
function updateSim(dt){
  const s=R.sim;s.t=Math.min(s.dur+3,s.t+dt);
  const c=campClock(),h=Math.floor(Math.min(72,c.hrs)),hh=Math.floor(c.clock),mm=Math.floor((c.clock%1)*60);
  const el=document.getElementById('hrs');
  if(el){const w='<small>GEÇEN SÜRE</small>'+h+' / 72 saat<small style="margin-top:4px">'+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+'</small>';if(s.w!==w){s.w=w;el.innerHTML=w;}}
  s.days.forEach((d,i)=>{
    const dt0=i*4,de=document.getElementById('day'+i);if(de&&s.t>=dt0)de.classList.add('show');
    d.lines.forEach((l,j)=>{const le=document.getElementById('ln'+i+'_'+j);if(le&&s.t>=dt0+.6+j*.9)le.classList.add('show');});
  });
  if(s.t>=8&&suppliesFail()){suppliesGameOver();return;}
  if(s.t>=s.dur&&!s.done){s.done=true;const b=document.getElementById('skipbtn');if(b){b.textContent='Sonucu gör ▶';b.classList.add('primary');b.style.fontSize='16px';}}
  if(s.t>=s.dur+3)toResult();
}
function toResult(){
  if(S.mode==='result'||S.mode==='gameover'||S.mode==='camp')return;
  if(R.sim&&suppliesFail()){suppliesGameOver();return;}
  R.score=computeScore();R.log=buildLog();
  const fl=R.L.facts||FACTS;R.fact=fl[Math.floor(Math.random()*fl.length)];
  if(!R.opts){const i=R.li;if(R.score.stars>S.prog.stars[i])S.prog.stars[i]=R.score.stars;if(R.score.total>S.prog.best[i])S.prog.best[i]=R.score.total;saveProg();}
  if(R.opts&&S.camp){campFinal();go('camp');if(S.camp.fin.stars>0)Sfx.win();else Sfx.fail();return;}
  go('result');if(R.score.stars>0)Sfx.win();else Sfx.fail();
}
function shareScore(campaign){
  const sc=R.score,f=campaign?campFinal():null;
  const t='FAYT · '+(f?'Girne oyunu: %'+f.total+' (Şehir %'+f.cityPct+' + Ev %'+sc.total+')':R.L.name+': %'+sc.total)+' hazırlık skoru '+'★'.repeat(f?f.stars:sc.stars)+' — #CivilGameJam';
  const done=()=>{const b=document.getElementById('sharebtn');if(b)b.textContent='Kopyalandı ✓';};
  const fallback=()=>{
    const old=document.getElementById('shareText');if(old)old.remove();
    const ta=document.createElement('textarea');ta.id='shareText';ta.className='share-text';ta.setAttribute('aria-label','Skor metni: Ctrl+C ile kopyala');ta.value=t;ui.appendChild(ta);ta.focus();ta.select();
    let ok=false;try{ok=document.execCommand('copy');}catch(e){}
    if(ok){done();ta.remove();}else toast('Metin seçildi. Ctrl+C ile kopyalayabilirsin.');
  };
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,fallback);else fallback();}catch(e){fallback();}
}


/* ---------- Girne oyunu: şehir (iframe) → hane (72 SAAT) → birleşik sonuç ---------- */
function campPlan(c){
  const hz=c.burningHz||[];let li=0,why='Şehir ayakta kaldı. Şimdi Konutlar mahallesinde bir ailenin ilk 72 saati başlıyor: deprem bu evde de olacak.';
  if(c.burning>=3){li=2;why='Şehirde '+c.burning+' mahallede önlem alınmamış risk vardı ve deprem hepsini birden vurdu. Konutlar mahallesindeki bir anne ve çocuğu depremi yaşıyor.';}
  else if(hz.indexOf('su')>=0){li=5;why='Zayıf zeminde ve düşük kaliteli malzemeyle yapılan binalar riski giderilmemişti: yapılar ağır hasar gördü, elektrik kesildi. Konutlar mahallesinde bir aile depremi gece, karanlıkta yaşıyor.';}
  else if(hz.indexOf('gaz')>=0||hz.indexOf('yangin')>=0){li=1;why='Gaz ve elektrik riski önceden giderilmemişti. Konutlar mahallesindeki bir anne ve çocuğu depremi yaşıyor; artçı sarsıntılar da gelecek.';}
  const lv=c.lv||{},perks=c.perks||[],b=[],o={min:0,fix:[],noCeil:false};
  const m=Math.min(25,Math.round(c.prep*0.25));
  if(m>0){o.min+=m;b.push('Şehir hazırlığın %'+c.prep+': evde +'+m+' dk hazırlık süresi');}
  if(lv.konut>=2){o.min+=10;b.push('Konutlar · Aile afet planı: +10 dk');}
  if(lv.konut>=3){o.noCeil=true;b.push('Konutlar · Bina güçlendirme: tavan sıvası düşmeyecek');}
  if(perks.indexOf('haberlesme')>=0){o.min+=8;b.push('Haberleşme Ağı görevi: +8 dk');}
  if(perks.indexOf('koridor')>=0){o.fix.push('boxes');b.push('Tahliye Koridoru görevi: çıkış yolu açık');}
  if(perks.indexOf('konut')>=0){o.fix.push('shelf','tv');b.push('Dayanıklı Konut Programı: mobilyalar sabit');}
  (c.homeFixed||[]).forEach(k=>{if(o.fix.indexOf(k)<0)o.fix.push(k);});if((c.homeFixed||[]).length)b.push('Konutlar tatbikatı: evde '+c.homeFixed.length+' tehlike önceden giderildi');
  return{li,why,opts:o,bonuses:b};
}
function bridgeUI(){
  const c=S.camp.city,p=S.camp.plan,L=LEVELS[p.li];
  const bon=p.bonuses.length?'<ul class="bon">'+p.bonuses.map(t=>'<li>'+t+'</li>').join('')+'</ul>':'<p class="lead">Şehir hazırlığın düşük kaldı: bu aile kendi başının çaresine bakacak.</p>';
  return chrome()+'<div class="dim"></div><div class="panel modal bridge"><div class="kicker">GİRNE OYUNU · 2. AŞAMA</div><h2>Şehirden eve</h2>'+
   '<p class="lead"><b>'+c.mag.toFixed(1)+'</b> büyüklüğündeki depremde Girne\'de <b>'+c.saved.toLocaleString('tr-TR')+'</b> kişi kurtuldu ('+'★'.repeat(c.stars)+'☆'.repeat(3-c.stars)+'). Şimdi bir ailenin hikâyesine odaklanıyoruz.</p>'+
   familyBridgeUI(c)+'<div class="sc"><b>'+L.name+(L.tag.toLocaleLowerCase('tr')===L.name.toLocaleLowerCase('tr')?'':' · '+L.tag)+'</b><br>'+p.why+'</div>'+
   '<h3>Şehir hazırlığın bu eve şöyle yansıdı</h3>'+bon+'<p class="bag-empty-note">Çantan boş başlar. Su, gıda ve diğer tüm malzemeleri kendin seçersin.</p>'+
   '<p class="joint"><b>ORTAK SKOR</b>: oyun puanın yarısı şehirden, yarısı bu evden gelir. Evdeki puan 0–100 arasında yükseldikçe Konutlar kaybı +%25 ile −%25 arasında değişir; %50 ev puanı kaybı değiştirmez. Kayıp sayıları oyun modelidir. Şehir puanına ev katkısı ise kayıp sayısından bağımsız −2 ile +2 puandır; deprem büyüklüğü bu katkıyı değiştirmez.</p>'+'<p class="hint">Gerçek hayatta da böyledir: mahalle ölçeğindeki hazırlık, tek bir ailenin hayatta kalma şansını doğrudan artırır.</p>'+
   '<div style="text-align:right;margin-top:14px"><button class="btn primary" style="font-size:17px;padding:12px 32px" data-act="tohouse">Eve gir →</button></div></div>';
}
function campFinal(){
  if(S.camp.fin&&S.camp.finR===R)return S.camp.fin;
  const c=S.camp.city,sc=R.score;
  /* iki yönlü bağ: evdeki başarı Konutlar mahallesindeki kaybı ±%25 değiştirir (komşulara örnek olur) */
  const kl=c.konutLost||0,fac=1.25-.5*sc.total/100,newKL=Math.round(kl*fac),savedAdj=c.saved+(kl-newKL);
  const cityBase=c.score,cityPct=clamp(Math.round(cityBase+(sc.total-50)*.04),0,100);
  const left=R.people.filter(p=>p.stranded).length;
  const rawTotal=Math.round(cityPct*.5+sc.total*.5),total=Math.min(left?(left===R.people.length?49:67):100,rawTotal);
  const stars=total>=85?3:total>=68?2:total>=50?1:0;
  const prev=S.prog.campBest|0,rec=total>prev;
  if(rec){S.prog.campBest=total;S.prog.campStars=stars;S.prog.campCity=cityPct;S.prog.campHouse=sc.total;saveProg();}
  S.camp.fin={cityPct,cityBase,total,rawTotal,stars,prev,rec,savedAdj,kl,newKL};S.camp.finR=R;return S.camp.fin;
}
function campUI(){
  const c=S.camp.city,sc=R.score,f=campFinal(),L=R.L,tr=n=>n.toLocaleString('tr-TR');
  const grade=f.total>=85?'Girne afete hazır!':f.total>=68?'Güçlü bir oyun':f.total>=50?'Yarı yolda':'Daha çok hazırlık gerek';
  const lostAdj=c.lost-(f.kl-f.newKL),stat=(l,v,t)=>'<div class="fr-stat '+(t||'')+'"><small>'+l+'</small><b>'+v+'</b></div>';
  const rows=(c.rows||[]).map(x=>x.id==='konut'?Object.assign({},x,{lost:f.newKL,home:true}):x).sort((a,b)=>b.lost-a.lost),worst=Math.max(1,rows[0]?rows[0].lost:1);
  const left=R.people.filter(p=>p.stranded).length,ppl=R.people.map(p=>{
    const st=p.stranded?['Açıkta kaldı','bad']:p.rescued?['Ekip desteğiyle çıktı','ok']:p.hits>0?['Yaralandı','bad']:['Güvende','ok'];
    return '<div class="fr-p '+st[1]+'"><b>'+p.def.name+'</b><span>'+st[0]+'</span></div>';}).join('');
  return chrome()+'<div class="dim"></div><div class="panel modal fres">'+
   '<div class="fr-top"><div class="kicker">GİRNE OYUNU · SONUÇ</div><div class="st">'+'★'.repeat(f.stars)+'<i>'+'★'.repeat(3-f.stars)+'</i></div><h2>'+grade+'</h2>'+
   '<p class="fr-sub">'+c.mag.toFixed(1)+' büyüklüğündeki depremde Girne\'de <b>'+tr(f.savedAdj)+'</b> kişi kurtuldu, <b>'+tr(lostAdj)+'</b> kişi can verdi. Evdeki aile: '+(left?'<b class="bad">'+left+' kişi açıkta kaldı</b>':'<b class="ok">herkes güvende</b>')+'.</p>'+
   '<div class="fr-big"><small>TOPLAM SKOR</small><b>%'+f.total+'</b><span class="fr-best">'+(f.rec?'<em class="rec-badge">YENİ REKOR!'+(f.prev?' (önceki %'+f.prev+')':'')+'</em>':'En yüksek skorun: <b>%'+S.prog.campBest+'</b>')+'</span></div>'+
   (S.storageOK===false?'<p class="save-warning">Tarayıcı kaydı engelliyor; rekor yalnız bu oturumda korunur.</p>':'')+
   '<div class="joint"><b>ORTAK SKOR</b> = Şehir %'+f.cityPct+' × ½ + Ev %'+sc.total+' × ½ = <b>%'+f.rawTotal+'</b>'+(f.total<f.rawTotal?' → tamamlanmayan tahliye sınırı: <b>%'+f.total+'</b>':'')+'</div></div>'+
   '<div class="fr-head">ŞEHİR · GİRNE</div><div class="fr-grid">'+stat('Şehir puanı','%'+f.cityPct,'good')+stat('Deprem büyüklüğü',c.mag.toFixed(1))+stat('Şehir hazırlığı','%'+c.prep,'good')+stat('Kurtulan',tr(f.savedAdj),'good')+stat('Can kaybı',tr(lostAdj),'bad')+
     stat('Giderilen risk',String(c.putOut))+stat('Kırılan zincir',String(c.blocked),'good')+stat('Tatbikat / önlem',(c.visits||0)+' / '+(c.minis||0),'good')+stat('Acil risk',(c.crisisOk||0)+' çözüldü / '+(c.crisisFail||0)+' kaçtı',c.crisisFail?'bad':'good')+stat('Deprem anında açık riskli',String(c.burning),c.burning?'bad':'')+'</div>'+
   '<div class="fr-head">MAHALLE BAZINDA KAYIP</div><p class="fr-leg">Rakam kaybedilen kişi sayısı, yüzde ise mahalle nüfusuna oranı: <i class="g"></i>%10 ve altı düşük · <i class="y"></i>%11–25 orta · <i class="r"></i>%25 üstü yüksek kayıp.</p><div class="fr-bd">'+rows.map(x=>{const pct=Math.round(x.lost/x.pop*100),tier=pct<=10?'g':pct<=25?'y':'r';
     return '<div class="fr-row"><span class="fr-ic">'+ico(x.icon)+'</span><span class="fr-nm">'+x.name+(x.home?' <em>· ev etkisi dahil</em>':(x.onFire?' '+ico('hazard'):(x.lv>=3?' '+ico('shield'):'')))+'</span><span class="fr-pop">'+tr(x.pop)+' kişi</span><span class="fr-bar"><i class="'+tier+'" style="width:'+Math.round(x.lost/worst*100)+'%"></i></span><span class="fr-num '+tier+'">−'+tr(x.lost)+'<em>%'+pct+'</em></span></div>';}).join('')+'</div>'+
   '<div class="fr-head">EVDE · '+L.name.toUpperCase()+'</div><div class="fr-home"><div class="fr-hs"><b>%'+sc.total+'</b><span>'+'★'.repeat(sc.stars)+'☆'.repeat(3-sc.stars)+'</span></div><div class="fr-pp">'+ppl+'</div></div>'+
   '<div class="log fr-log">'+
   (S.camp.plan&&S.camp.plan.bonuses&&S.camp.plan.bonuses.length?'<div class="ok">Şehirden eve taşıdıkların: '+S.camp.plan.bonuses.map(x=>x.replace(/^[^:]*·\s*/,'')).slice(0,4).join('; ')+'.</div>':'<div class="bad">Şehirden eve avantaj taşıyamadın: ev hazırlığı sıfırdan başladı.</div>')+
   '<div class="'+(f.newKL<=f.kl?'':'bad')+'">Evdeki başarı Konutlar mahallesine yansıdı: o mahalledeki kayıp '+tr(f.kl)+' → '+tr(f.newKL)+' kişi ('+(f.newKL<=f.kl?'ev iyi hazırlandı, komşular da örnek aldı':'ev zayıf kaldı, mahalle de zarar gördü')+').</div>'+
   decisionStory().map(l=>'<div class="'+(l.ok?'':'bad')+'">'+l.text+'</div>').join('')+'</div>'+homeEvidenceUI()+
   '<div class="aft-warn" role="note"><b>⚠ Artçı uyarısı</b><span>Her depremden sonra artçı sarsıntılar gelir. Ana sarsıntı bitti diye hemen eve dönme ya da yerinden ayrılma: açık ve güvenli bir alanda kal, çök–kapan–tutun için hazır ol.</span></div>'+
   '<div class="fact"><b>BU OYUNDAN ÜÇ DERS</b><ol>'+campaignLessons().map(x=>'<li>'+x+'</li>').join('')+'</ol></div>'+
   '<div class="acts"><button class="btn" data-act="sharecamp" id="sharebtn">Skoru kopyala</button><button class="btn" data-act="menu">Menü</button><button class="btn primary" style="font-size:16px;padding:10px 26px" data-act="camp">Yeni oyun</button></div></div>';
}

/* ---------- girdi ---------- */
ui.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-act]');if(!b||b.disabled)return;
  Sfx.init();const a=b.dataset.act;
  if(S.paused&&!['resume','mute','intensity','menu'].includes(a))return;
  if(CIN&&!['cinemaskip','pause','resume','mute','intensity','menu'].includes(a))return;
  if(a==='cinemaskip'){finishCinema();return;}
  if(a==='intensity'){Sfx.toggleIntensity();document.querySelectorAll('[data-act="intensity"]').forEach(el=>{el.textContent=Sfx.intensity()?'Yoğunluk: Düşük':'Yoğunluk: Normal';el.setAttribute('aria-pressed',String(Sfx.intensity()));});}
  else if(a==='pause')togglePause();
  else if(a==='resume')closePause();
  else if(a==='homefix')fixHazard(b.dataset.id);
  else if(a==='homecover'){const p=R.people[R.sel];if(p&&orderMove(p,b.dataset.id==='desk'?1080:470))selectNext();updateShelterUI();}
  else if(a==='homegas')closeGas();
  else if(a==='homeexit')startExit();
  else if(a==='homehelp')requestRescue();
  else if(a==='guideNext')guideNext();
  else if(a==='guideSkip')finishGuide();
  else if(a==='sharecamp')shareScore(true);
  else if(a==='play'){Sfx.click();go('levels');}
  else if(a==='how'){Sfx.click();S.how=true;ui.insertAdjacentHTML('beforeend','<div id="howwrap" role="dialog" aria-modal="true" aria-label="Nasıl oynanır">'+howUI()+'</div>');document.querySelector('#howwrap button').focus();}
  else if(a==='closehow'){const h=document.getElementById('howwrap');if(h)h.remove();S.how=false;Sfx.click();}
  else if(a==='back'){Sfx.click();go('menu');}
  else if(a==='lvl'){const i=+b.dataset.i;if(i>0&&S.prog.stars[0]<1){Sfx.nope();return;}Sfx.click();startLevel(i);}
  else if(a==='item')toggleItem(b.dataset.id);
  else if(a==='start'){
    if(R.left<=0||S.conf){startQuake();}
    else{S.conf=true;renderBag();clearTimeout(S.confT);S.confT=setTimeout(()=>{S.conf=false;if(S.mode==='prep')renderBag();},3000);}
  }
  else if(a==='pick'){const i=+b.dataset.i,p=R.people[i];if((S.mode==='quake'||S.mode==='after')&&!p.down&&!p.hidden&&!p.fade){R.sel=i;Sfx.click();sigRoster='';}}
  else if(a==='mute'){const m=Sfx.mute();b.textContent=m?'Ses: Kapalı':'Ses: Açık';}
  else if(a==='menu'){Sfx.stopAll();Sfx.calm(true);S.camp=null;CT=null;R=makeRun(0);go('menu');}
  else if(a==='camp'){Sfx.click();startCampaign();}
  else if(a==='tobridge'){Sfx.click();const c=ctCityData();S.camp={city:c,plan:campPlan(c)};R=makeRun(S.camp.plan.li,S.camp.plan.opts);go('bridge');}
  else if(a==='drillgo'){Sfx.click();drillBegin();}
  else if(a==='drillquit'){drillQuit();}
  else if(a==='minifin'){Sfx.click();miniFinishPrep();}
  else if(a==='miniquit'||a==='minicont'){Sfx.click();miniBack();}
  else if(a==='tohouse'){Sfx.click();startLevel(S.camp.plan.li,S.camp.plan.opts);}
  else if(a==='tohouse2'){Sfx.click();startLevel(S.camp.plan.li,S.camp.plan.opts);}
  else if(a==='campsum'){Sfx.click();go('camp');}
  else if(a==='retryover'){const phase=S.over.phase;S.over=null;if(phase==='city')startCampaign();else startLevel(R.li,R.opts);}
  else if(a==='retry'){Sfx.click();startLevel(R.li,R.opts);}
  else if(a==='next'){Sfx.click();startLevel(R.li+1);}
  else if(a==='share')shareScore();
  else if(a==='skip'){if(R.sim.t<R.sim.dur-.01)R.sim.t=R.sim.dur;else toResult();}
});
ui.addEventListener('mouseover',e=>{
  if(S.mode!=='prep')return;
  const it=e.target.closest&&e.target.closest('.item');
  if(it){const x=ITEMS.find(v=>v.id===it.dataset.id);S.infoItem=true;setInfo(x.n,x.tip,'<span class="chip y">'+ITEM_COST+' dk</span>'+(x.junk?'<span class="chip r">Gereksiz</span>':''));}
  else if(S.infoItem&&!(e.target.closest&&e.target.closest('#info'))){S.infoItem=false;refreshInfo();}
});
function toWorld(e){const r=cv.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*W,sy=(e.clientY-r.top)/r.height*H;return{sx,sy,wx:(sx-cam.tx)/cam.s,wy:(sy-cam.ty)/cam.s};}
cv.addEventListener('mousemove',e=>{
  const m=toWorld(e);S.mouse=m;
  if(S.mode==='prep'){
    const hk=hitHazard(m),hp=hk?-1:hitPerson(m);S.hover=hk;S.hoverP=hp;
    const key=hk||('p'+hp);if(key!==S.hoverKey){S.hoverKey=key;S.infoItem=false;refreshInfo();}
    cv.style.cursor=hk?'pointer':'default';
  }else if(S.mode==='after'||S.mode==='quake'){cv.style.cursor='pointer';}
  else cv.style.cursor='default';
});
function prepClick(m){
  const k=hitHazard(m);if(!k)return;
  if(MISC[k]){Sfx.click();toast(k==='valve'?'Gaz vanasının yerini aklında tut.':k==='sw'?'Gaz kokusunda bu anahtara DOKUNMA — aklında tut.':k==='brk'?'Elektrik yangınında ilk durak burası — aklında tut.':'Söndürücüyü ancak elektrik kesildikten sonra kullan.');return;}
  fixHazard(k);
}
function floorOrder(m,lo){
  const sel=R.people[R.sel];
  if(!sel||sel.down||sel.hidden||sel.fade){toast('Önce bir kişiyi seç');return;}
  if(orderMove(sel,m.wx))selectNext();sigRoster='';updateShelterUI();
}
function inShelterZone(m){return !isWild()&&[TABLE,DESK].some(sp=>m.wx>=sp.x0-14&&m.wx<=sp.x1+14);}
function selActive(){const p=R.people[R.sel];return !!p&&!p.hidden&&!p.down&&!p.fade;}
/* Tıklama kişiyi mi seçsin, seçili kişiye komut mu versin?
   - Seçili kişiye tekrar tıklamak seçim değiştirmez (yerinde oynatıp seçimi kaydırıyordu).
   - Masa/çalışma masası bölgesinde, o masaya zaten atanmış biri varsa tıklama KOMUT sayılır
     (yürüyen/oturan kişi komutu yutmasın); masaya atanmamış kişi yine tıklanarak seçilebilir. */
function clickSelects(m,hi){
  if(hi<0||hi===R.sel)return false;
  const p=R.people[hi];
  if(!selActive())return true;
  if(inShelterZone(m)&&p.spot)return false;
  return true;
}
function quakeClick(m){
  const hi=hitPerson(m),sel=R.people[R.sel],wild=isWild();
  if(hi>=0&&hi===R.sel&&!(inShelterZone(m)&&selActive()))return;
  if(clickSelects(m,hi)&&!R.people[hi].down&&(!sel||R.people[hi].state!=='shelter'||!inShelterZone(m))){R.sel=hi;Sfx.click();sigRoster='';return;}
  if(m.wy>300&&m.wy<600&&m.wx>(wild?150:165)&&m.wx<1115){
    if(!wild&&m.wx<225&&m.wy>400){toast('Sarsıntı sırasında dışarı koşma! Korunaklı yerde kal.');Sfx.nope();return;}
    floorOrder(m);
  }
}
function afterClick(m){
  const a=R.after,scn=R.L.scn;
  if(inR(m,SPOT.sw)){switchClick();return;}
  if(inR(m,SPOT.brk)){breakerClick();return;}
  if(scn==='fire'&&inR(m,SPOT.ext)){extClick();return;}
  if(inR(m,SPOT.win)&&m.wy<420&&hitPerson(m)<0){
    if(scn==='gas'){if(!R.winOpen)openWindow();}else{toast('Şimdi pencereyle uğraşma.');}
    return;
  }
  if(inR(m,VALVE_HIT)){
    if(scn==='fire'){toast('Gaz sorunu yok; yangına odaklan.');return;}
    if(!R.gasClosed)closeGas();return;
  }
  const hi=hitPerson(m);
  if(hi>=0&&((hi===R.sel&&!(inShelterZone(m)&&selActive()))||clickSelects(m,hi))){if(hi!==R.sel){R.sel=hi;Sfx.click();sigRoster='';}return;}
  if(m.wx>=150&&m.wx<=242&&m.wy>=380&&m.wy<=565){startExit();return;}
  if(m.wy>440&&m.wy<600&&m.wx>245&&m.wx<1115)floorOrder(m);
}
function onCanvasClick(m){
  if(S.paused||document.hidden||CIN)return;
  if(S.mode==='prep')prepClick(m);
  else if(S.mode==='quake')quakeClick(m);
  else if(S.mode==='after')afterClick(m);
}
cv.addEventListener('click',e=>{Sfx.init();onCanvasClick(toWorld(e));});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();if(S.how){document.querySelector('[data-act=closehow]').click();return;}togglePause();return;}
  if(S.paused){if(e.key==='Tab')trapFocus(e,document.getElementById('pausewrap'));return;}
  if(S.how){if(e.key==='Tab')trapFocus(e,document.getElementById('howwrap'));return;}
  if(e.target.matches('textarea,input'))return;
  if(e.key.toLowerCase()==='m'){const b=document.getElementById('mutebtn');if(b)b.click();return;}
  if(CIN){if(e.key==='Tab')trapFocus(e,CIN.el);if(e.key==='Enter'){e.preventDefault();finishCinema();}return;}
  if(e.target.matches('button,textarea,input')&&['Enter',' '].includes(e.key))return;
  if(S.mode==='menu'&&!S.how&&e.key==='Enter'){const b=document.querySelector('[data-act=camp]');if(b){e.preventDefault();b.click();return;}}
  if((S.mode==='quake'||S.mode==='after')&&['q','e'].includes(e.key.toLowerCase())){e.preventDefault();const b=document.querySelector('.shelter-dock [data-id="'+(e.key.toLowerCase()==='q'?'table':'desk')+'"]');if(b&&!b.disabled)b.click();return;}
  if(S.mode==='drill'&&DR){if(!DR.running&&!DR.micro&&e.key==='Enter'){e.preventDefault();Sfx.click();drillBegin();return;}if(DR.def.key&&DR.running&&!DR.done)DR.def.key(DR,e);return;}
  if(e.key.toLowerCase()==='m'){const b=document.getElementById('mutebtn');if(b)b.click();return;}
  if(S.mode==='cmap'&&e.key===' '){e.preventDefault();ctEndTurn();}
  if(S.mode==='quake'||S.mode==='after'){const i=parseInt(e.key,10)-1;if(i>=0&&i<R.people.length&&!R.people[i].down&&!R.people[i].hidden){R.sel=i;sigRoster='';}}
  if(e.key==='m'||e.key==='M'){const m=Sfx.mute();const b=document.getElementById('mutebtn');if(b)b.textContent=m?'Ses: Kapalı':'Ses: Açık';}
});

/* ---------- döngü ---------- */
function update(dt){
  if(S.paused||document.hidden)return;
  Sfx.tick(dt);
  if(CIN){updateCinema(dt);return;}
  const k=1-Math.exp(-dt*4);cam.s+=(camT.s-cam.s)*k;cam.tx+=(camT.tx-cam.tx)*k;cam.ty+=(camT.ty-cam.ty)*k;
  updateParts(dt);
  const m=S.mode;
  if(m!=='quake'&&m!=='after')S.shake=0;
  if(m==='prep'){if(R.autoGo>0){R.autoGo-=dt;if(R.autoGo<=0)startQuake();}}
  else if(m==='quake')updateQuake(dt);
  else if(m==='after')updateAfter(dt);
  else if(m==='sim')updateSim(dt);
}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;S.t+=dt;try{update(dt);render();if(CIN)drawCinema();}catch(err){console.error(err);}requestAnimationFrame(frame);}
go('menu');requestAnimationFrame(frame);
window.G72={S,get R(){return R;},startLevel,startQuake,go,fixHazard,toggleItem,orderMove,closeGas,startExit,toResult,click:(wx,wy)=>onCanvasClick({wx,wy,sx:0,sy:0}),ignite,openWindow};


/* Duraklatma DOM'u korur: tatbikat ve ev durumunu yeniden kurmaz. */
function trapFocus(e,root){
  const nodes=[...root.querySelectorAll('button:not(:disabled),textarea,[tabindex="0"]')].filter(x=>x.getClientRects().length);
  if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
}
function togglePause(){
  if(S.paused){closePause();return;}
  if(!CIN&&S.mode==='cmap'&&CT&&(CT.resolving||CT.over)){toast('Tur işlemi tamamlanınca duraklatabilirsin.');return;}
  pauseFocus=document.activeElement;S.paused=true;Sfx.pause(true);
  [...ui.children].forEach(x=>{x.inert=true;});
  ui.insertAdjacentHTML('beforeend','<div id="pausewrap" role="dialog" aria-modal="true" aria-labelledby="pauseTitle"><div class="dim"></div><div class="panel modal pause-panel"><div class="kicker">FAYT · ARA</div><h2 id="pauseTitle">Zaman senin elinde.</h2><p>Oyun ve tatbikat süreleri durdu.</p><button class="btn primary" data-act="resume">Devam et <kbd>Esc</kbd></button><button class="btn" data-act="mute">'+(Sfx.muted()?'Ses: Kapalı':'Ses: Açık')+'</button>'+audioIntensity()+'<button class="btn" data-act="menu">Ana menü</button></div></div>');
  document.querySelector('[data-act=resume]').focus();
}
function closePause(){
  const p=document.getElementById('pausewrap');if(p)p.remove();
  [...ui.children].forEach(x=>{x.inert=false;});
  if(S.paused){S.paused=false;Sfx.pause(false);if(DR)DR.last=performance.now();last=performance.now();}
  const m=document.getElementById('mutebtn');if(m)m.textContent=Sfx.muted()?'Ses: Kapalı':'Ses: Açık';
  if(pauseFocus&&pauseFocus.isConnected)pauseFocus.focus({preventScroll:true});pauseFocus=null;
}
addEventListener('visibilitychange',()=>{if(document.hidden&&!S.paused)togglePause();if(DR)DR.last=performance.now();last=performance.now();});
function campaignLessons(){
  const c=S.camp.city;
  return [c.burning?c.burning+' mahallede açık risk kaldı. Kademenin yanında tesisat, sabitleme ve açık tahliye yolu da gerekir.':c.putOut+' açık riski kapattın. Önlem almak, depremden sonra müdahaleye yetişmeye çalışmaktan önce gelir.',
    R.people.every(p=>!p.hits&&!p.stranded)?'Aile sarsıntıda korundu. Çök–Kapan–Tutun; sarsıntı sırasında dışarıya veya merdivene koşma.':'Ailede yaralanma oldu. Mobilyaları önceden sabitle; sarsıntıda başını ve enseni koruyup tutun.',
    has('su')&&has('gida')?'Su ve gıda çantadaydı. En az 72 saatlik çantayı ilaç, fener ve aileye özel ihtiyaçlarla tamamla.':'Çantada su veya gıda eksikti. En az 72 saatlik ihtiyaçları önceden, kolay ulaşılacak yerde hazırla.'];
}
let guideStep=0;
function showGuide(){
  let seen=false;try{seen=localStorage.getItem('g72guide')==='1';}catch(e){}
  if(seen)return;guideStep=0;drawGuide();
}
function drawGuide(){
  const old=document.getElementById('firstGuide');if(old)old.remove();
  const steps=[['Girne için ilk kararın','Haritadaki bir mahalleye tıkla veya Tab ile seçip Enter’a bas. Önlem penceresi açılır.'],['Bütçeyi önleme ayır','◆ ile kademe al. Tur başına bir ücretsiz tatbikat hakkın var; başarılı olunca kademe kazanırsın.'],['Hazırlan, sonra turu bitir','Açık riskleri kapat. Turu bitirince yeni bütçe gelir; deprem 3. tur bitince gelir. Acil riskte uyarıya tıkla; Esc süreyi durdurur.']];
  const t=steps[guideStep];const box=document.createElement('aside');box.id='firstGuide';box.className='first-guide';box.setAttribute('aria-label','İlk oyun rehberi');
  box.innerHTML='<small>İLK 60 SANİYE · '+(guideStep+1)+' / 3</small><h3>'+t[0]+'</h3><p>'+t[1]+'</p><div><button class="btn sm" data-act="guideSkip">Rehberi geç</button><button class="btn sm primary" data-act="guideNext">'+(guideStep===2?'Hazırım':'Devam →')+'</button></div>';
  ui.appendChild(box);
}
function guideNext(){if(++guideStep>2)finishGuide();else drawGuide();}
function finishGuide(){const g=document.getElementById('firstGuide');if(g)g.remove();try{localStorage.setItem('g72guide','1');}catch(e){}}

function mountHomeControls(){
  if(S.mode==='prep'){
    return;
  }
  ui.insertAdjacentHTML('beforeend','<aside class="shelter-dock" aria-label="Aileyi koru"><div class="kicker">ÖNCE KİŞİ · SONRA MASA</div><b id="selectedPerson"></b><p id="shelterOrder"></p><button data-act="homecover" data-id="table" class="shelter-choice"><span>Sağlam masa</span><small></small></button><button data-act="homecover" data-id="desk" class="shelter-choice"><span>Çalışma masası</span><small></small></button><small class="dock-tip">Kişiler: 1–4 · Masalar: Q / E</small>'+(S.mode==='after'?'<div class="after-dock-actions"><button class="btn sm" data-act="homegas">Gazı kapat</button><button class="btn sm" data-act="homeexit">Çıkışa yönlendir</button></div>':'')+'</aside>');updateShelterUI();
}
function shelterAssigned(sp){return R.people.filter(p=>!p.hidden&&!p.down&&!p.fade&&p.spot===sp);}
function updateShelterUI(){
  const selected=document.getElementById('selectedPerson');if(!selected)return;
  const p=R.people[R.sel],active=p&&!p.hidden&&!p.down&&!p.fade;
  const dock=document.querySelector('.shelter-dock');if(dock){dock.classList.toggle('needs-help',!!(p&&p.down&&!p.hidden));dock.querySelector('.kicker').textContent=p&&p.down&&!p.hidden?'AĞIR YARALI · ÖNCE GÜVENLİK':'ÖNCE KİŞİ · SONRA MASA';}
  selected.textContent=active?p.def.name+' seçili':p&&p.down&&!p.hidden?p.def.name+' · yardım gerekiyor':'Alttan bir kişi seç';
  const order=document.getElementById('shelterOrder');
  order.textContent=!active?(p&&p.down&&!p.hidden?'Ağır yaralı yürüyemez. Soldaki yardım adımını izle.':'Dışarıdaki kişi yeniden yönlendirilemez.'):p.spot?(p.sheltered?'Korunuyor: ':'Gidiyor: ')+p.spot.name:'Bir masaya yönlendir; sarsıntıda dışarı koşma.';
  for(const [id,sp] of [['table',TABLE],['desk',DESK]]){
    const b=document.querySelector('.shelter-dock [data-id="'+id+'"]');if(!b)continue;
    const assigned=shelterAssigned(sp),free=sp.slots.length-assigned.length;
    b.disabled=!active||(free===0&&p.spot!==sp);
    b.classList.toggle('chosen',!!active&&p.spot===sp);
    b.querySelector('small').textContent=(free?'Boş yer: '+free:'DOLU')+' / '+sp.slots.length+(assigned.length?' · '+assigned.map(x=>x.def.name).join(', '):'');
  }
}
function mountInheritedProof(){
  if(!R.opts||R.mini)return;
  const fixed=(R.opts.fix||[]).filter(k=>R.L.hz.includes(k));
  const labels=fixed.map(k=>HZ[k].n+' hazır');
  if(R.opts.noCeil)labels.push('Bina güçlendirmesi hazır');
  if(!labels.length)return;
  ui.insertAdjacentHTML('beforeend','<div class="inherited-proof">'+ico('shield')+' <span><b>ŞEHİRDEN BU EVE</b>'+labels.join(' · ')+'</span></div>');
}
function renderProtectionFeed(){
  const el=document.getElementById('protectionFeed');if(!el)return;
  const keys=R.prevented.slice(-2),sig=keys.join();if(el.dataset.sig===sig)return;el.dataset.sig=sig;
  el.innerHTML=keys.length?'<b>ÖNLEMİN İŞE YARADI</b>'+keys.map(k=>'<span>'+ico('shield')+' '+HZ[k].ok+'</span>').join(''):'';
}
/* Şematik önce/sonra çizimleri; yeni hazır görsel kullanılmaz. */
function proofDrawing(kind,safe){
  const color=safe?'#91e4c6':'#ef9b85';let shapes='';
  if(kind==='route')shapes='<path d="M15 66H145" stroke="#8394af" stroke-width="15"/>'+(safe?'<path d="M18 65h120m-12-8 12 8-12 8" stroke="'+color+'" fill="none" stroke-width="3"/>':'<rect x="62" y="40" width="30" height="30" fill="#9b7659"/><rect x="86" y="49" width="20" height="20" fill="#bb9c72"/>');
  else if(kind==='shelter')shapes='<path d="M40 49h80M46 49v27m68-27v27" stroke="#d6a575" stroke-width="7"/><circle cx="'+(safe?78:26)+'" cy="'+(safe?62:40)+'" r="7" fill="#f4c9a5"/><path d="M'+(safe?'78 69v7m0-5 12 5':'26 47v22m0-15 12 4')+'" stroke="'+color+'" stroke-width="5"/>';
  else if(kind==='lamp')shapes=safe?'<path d="M55 70h40m-20 0V48" stroke="#d6a575" stroke-width="4"/><path d="M58 49h34l-8-17H66z" fill="#ffd482"/><path d="M113 62h30v16h-30z" fill="#5a6e94"/>':'<path d="M80 10v22" stroke="#b5c2d4" stroke-width="3"/><path d="M60 53h40l-8-15H68z" fill="#ffd482"/><path d="m65 70 5-5m25 5 5-5" stroke="#ef9b85" stroke-width="3"/>';
  else if(kind==='tv')shapes='<rect x="44" y="'+(safe?'30':'45')+'" width="65" height="36" rx="3" fill="#1e304f" stroke="'+color+'" stroke-width="3"/><path d="M35 78h85" stroke="#d6a575" stroke-width="5"/>'+(safe?'<path d="M48 30v48m56-48v48" stroke="#91e4c6" stroke-width="3"/>':'');
  else if(kind==='shelf')shapes='<g transform="'+(safe?'':'rotate(22 95 78)')+'"><rect x="58" y="20" width="45" height="58" rx="3" fill="#976b49"/><path d="M63 38h35m-35 19h35" stroke="#d8ac7d" stroke-width="3"/>'+[0,1,2,3].map(n=>'<rect x="'+(65+n*8)+'" y="25" width="5" height="12" fill="'+['#f5cc7e','#91e4c6','#829fe5','#da9bba'][n]+'"/>').join('')+'</g>'+(safe?'<path d="M100 22h13v18M100 60h13v13" stroke="'+color+'" stroke-width="4" fill="none"/>':'');
  else shapes='<rect x="48" y="22" width="65" height="56" rx="4" fill="#203351" stroke="'+color+'"/><path d="M60 38h38M60 49h38M60 60h20" stroke="#bacbe2" stroke-width="3"/>';
  return '<svg viewBox="0 0 160 90" aria-hidden="true"><path d="M10 80h140" stroke="#667d98"/>'+shapes+(safe?'<path d="m125 31 5 5 12-13" stroke="'+color+'" stroke-width="4" fill="none"/>':'<path d="m127 24 12 12m0-12-12 12" stroke="'+color+'" stroke-width="3"/>')+'</svg>';
}
function proofCard(title,kind,ready,text){
  return '<article class="proof-card'+(ready?' ready':' missed')+'"><h3>'+title+'</h3><div class="proof-pair"><div>'+proofDrawing(kind,false)+'<small>ÖNCE</small></div><span>→</span><div>'+proofDrawing(kind,ready)+'<small>'+(ready?'ALDIĞIN ÖNLEM':'ÖNLEM EKSİK')+'</small></div></div><p>'+text+'</p></article>';
}
function familyBridgeUI(c){
  const msgs=(c.family||[]);if(!msgs.length)return '';
  const picked=[msgs[0],...msgs.slice(1).slice(-1)];
  return '<div class="family-thread"><div class="kicker">HARİTADAKİ AİLE, ŞİMDİ KARŞINDA</div>'+picked.map(m=>'<p><b>'+m.who+' · Tur '+m.turn+'</b> “'+m.text+'”</p>').join('')+'</div>';
}
function decisionStory(){
  const lines=[],city=S.camp&&S.camp.city;
  if(city){
    if(city.perks.includes('koridor'))lines.push({ok:true,text:'Tamamladığın Tahliye Koridoru görevi şehir kayıp çarpanını %15 azalttı. Açık yol, aileler ve yardım ekipleri için hazırdı.'});
    else if(city.drillProof&&city.drillProof.itfaiye)lines.push({ok:true,text:'Afet Merkezi tatbikatında güvenli rotayı çizdin; bu plan şehir kayıp çarpanını %5 azalttı.'});
    if((city.lv.okul||0)>=2)lines.push({ok:true,text:'Okuldaki rafları sabitledin. Bu yatırım, Okul mahallesinin deprem hazırlık kademesine yansıdı.'});
  }
  for(const hit of R.impacts.filter(x=>x.people.length).slice(0,2)){
    const h=HZ[hit.key];lines.push({ok:false,text:hit.people.join(', ')+': '+(h?h.hit:hit.key==='glass'?'cam parçaları isabet etti':hit.key==='aftershock'?'artçı sarsıntıda korunmasız kaldı':'tavandan parça düştü')+'.'+(h?' '+h.act+' önlemi alınmamıştı.':'')});
  }
  if(R.prevented.length){const h=HZ[R.prevented[0]];lines.push({ok:true,text:h.ok+' '+((R.opts&&R.opts.fix||[]).includes(R.prevented[0])?'Bu önlem şehirden eve taşınmıştı.':'Evde hazırlık süreni bu önleme ayırdın.')});}
  const left=R.people.filter(p=>p.stranded),assisted=R.people.filter(p=>p.rescued);
  if(left.length)lines.push({ok:false,text:nameList(left)+' güvenli alana alınamadı; yardım ihtiyacı sürüyor.'});
  if(assisted.length)lines.push({ok:true,text:nameList(assisted)+' uzman ekip desteğiyle çıktı; ağır yaralanma puanı silinmedi.'});
  const safe=R.people.filter(p=>p.hits===0&&!p.stranded);
  lines.push({ok:safe.length===R.people.length,text:safe.length===R.people.length?'Ailenin tamamı depremi yaralanmadan atlattı.':safe.length+' / '+R.people.length+' aile üyesi yaralanmadan çıktı.'});
  lines.push({ok:!!R.fixed.boxes,text:R.fixed.boxes?'Çıkış yolunu önceden açtın; kutular yüzünden tahliye gecikmedi.':'Çıkıştaki kutular kaldı; tahliye '+(R.exitDelayed?'gecikti.':'için açık yol hazırlanmamıştı.')});
  return lines.slice(0,6);
}
function homeEvidenceUI(){
  const key=R.prevented[0]||R.L.hz.find(k=>HZ[k].zone&&!R.fixed[k]),ready=!!(key&&R.prevented.includes(key));
  return '<div class="home-evidence">'+proofCard(ready?'Evde işe yarayan kararın':'Evde açık kalan risk',key==='boxes'?'route':key==='lamp'?'lamp':key==='tv'?'tv':'shelf',ready,ready?HZ[key].ok:(key?HZ[key].n+' için önlem alınmadı. Bir sonraki oyunda hazırlık süreni buna da ayırabilirsin.':'Hazırlık ve korunma kararların ailenin sonucuna yansıdı.'))+'</div>';
}

/* ---------- Görünür kaybetme kuralları; gerçek yaşam tahmini değildir. ---------- */
function suppliesFail(){
  if(!R||R.mini)return false;
  const injured=R.people.some(p=>p.type!=='dog'&&p.exited&&p.hits>0);
  return !has('su')&&(!has('gida')||(injured&&!has('ilkyardim')));
}
function suppliesWarning(){
  return 'Oyun kuralı: su ve gıdanın ikisi de yoksa veya yaralılarla su ve ilk yardımın ikisi de yoksa 72 saat planı başarısız olur. Tahliyede hiç kimse çıkamazsa oyun biter.';
}
function suppliesGameOver(){endGame('house','72 saat planı sürdürülemedi',!has('gida')?'Çantada hem su hem gıda eksikti.':'Yaralılar için hem su hem ilk yardım malzemesi eksikti.','Hazırlıkta suyu önceliklendir; gıda ve ilk yardım malzemesi ayır. Bu bir oyun eşiğidir; gerçek hayatta ölüm veya dayanma süresi tahmini değildir.');}
function endGame(phase,title,why,lesson){
  if(S.mode==='gameover')return;
  S.over={phase,title,why,lesson};
  if(CT){CT.over=true;CT.resolving=false;ctClosePop();}
  Sfx.stopAll();go('gameover');Sfx.calm(false);Sfx.fail();
}
function gameOverUI(){const o=S.over;return chrome()+'<div class="over-backdrop"></div><section class="game-over" role="dialog" aria-labelledby="overTitle"><div class="kicker">GAME OVER · OYUN BİTTİ</div><h1 id="overTitle" tabindex="-1">'+o.title+'</h1><p class="over-cause">'+o.why+'</p><div class="over-lesson"><b>BİR SONRAKİ DENEMENDE</b><p>'+o.lesson+'</p></div><p class="over-record">En yüksek oyun skoru: <strong>%'+(S.prog.campBest|0)+'</strong> · Önceki rekorun korunuyor.</p><div class="over-actions"><button class="btn primary" data-act="retryover">'+(o.phase==='city'?'Şehri':'Ev aşamasını')+' tekrar dene</button><button class="btn" data-act="menu">Ana menü</button></div></section>';}
