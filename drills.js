/* =========================================================
   drills.js — mahalleye özel tatbikatlar + tehlike mikro oyunları
   DOM tabanlı, kendi kendine yeten mini oyunlar (kütüphane yok).
   city.js'den sonra, game.js'den önce yüklenir.
   Site tatbikatı:  drillOpen('okul', site)           → 0-3 yıldız → ücretsiz kademe
   Tehlike mikro:   drillOpen('hz:gaz', site, {...})  → başarı/başarısız → haritaya dön
   ========================================================= */
let DR=null;
const DRILLS={};
const $e=(tag,cls,html)=>{if(tag==='div'&&['cs-it','ok-kid','lm-b','if-c','cm-c'].some(c=>cls&&(cls===c||cls.startsWith(c+' '))))tag='button';const e=document.createElement(tag);if(tag==='button')e.type='button';if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const drShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;};
const drR=(a,b)=>a+Math.random()*(b-a);
const drClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* Tekrar önleme: havuzdan n öğe seç; bu kampanyada daha önce gösterilmemişleri önceler.
   Havuz tükenirse en eski görülenlerden devam eder. */
function drFresh(key,pool,n){
  const seen=(typeof CT==='object'&&CT)?(CT.seen||(CT.seen={})):{};
  const hist=seen[key]||(seen[key]=[]);
  let pick=drShuf(pool.map((_,i)=>i).filter(i=>hist.indexOf(i)<0)).slice(0,n);
  if(pick.length<n)pick=pick.concat(hist.filter(i=>pick.indexOf(i)<0).slice(0,n-pick.length));
  seen[key]=hist.filter(i=>pick.indexOf(i)<0).concat(pick);
  return drShuf(pick.map(i=>pool[i]));
}
const DRILL_LABEL={
  okul:['school','Okula git','Tahliye tatbikatı'],eskiliman:['wall','Tarihi duvara git','Duvar güvenlik taraması'],hastane:['hospital','Hastaneye git','Hastane hazırlık planı'],
  carsi:['shop','Çarşıya git','Dükkân güvenlik turu'],itfaiye:['firstaid','Merkeze git','Tahliye güzergâhı planı'],su:['drop','Depoya git','Hat izolasyonu'],
  cami:['mosque','Meydana git','Toplanma alanı kurulumu'],liman:['anchor','Limana git','Öncelikli tahliye'],konut:['home','Eve gir','Ev tatbikatı']
};

/* ---------- çerçeve ---------- */
function drillOpen(key,site,opts){
  const def=DRILLS[key];if(!def)return;
  const d={key,def,site,opts:opts||{},micro:key.indexOf('hz:')===0,t:0,limit:def.limit,running:false,done:false,timers:[],iv:null,s:{},stage:null,last:0};
  d.hint=(t,bad)=>{const e=document.getElementById('dhint');if(e){e.textContent=t;e.classList.toggle('bad',!!bad);}};
  d.info=t=>{const e=document.getElementById('drScore');if(e)e.innerHTML=t;};
  d.clock=0;d.jobs=[];
  d.later=(ms,fn)=>{d.jobs.push({at:d.clock+ms/1000,fn});};
  d.pop=(el,text,good)=>{const st=d.stage;if(!st||!el)return;const sr=st.getBoundingClientRect(),er=el.getBoundingClientRect(),k=(st.offsetWidth?sr.width/st.offsetWidth:1)||1;
    const f=$e('div','dr-float'+(good?' good':' bad'),text);f.style.left=((er.left+er.width/2-sr.left)/k)+'px';f.style.top=((er.top-sr.top)/k)+'px';st.appendChild(f);setTimeout(()=>f.remove(),900);};
  d.shake=()=>{const s=d.stage;if(!s)return;s.classList.remove('shk');void s.offsetWidth;s.classList.add('shk');};
  d.finish=()=>drillComplete(d);
  DR=d;S.hover=null;go('drill');
}
function drillStop(){if(!DR)return;clearInterval(DR.iv);DR.timers.forEach(clearTimeout);DR.stopped=true;DR=null;}
function drillUI(){
  const d=DR,def=d.def,title=d.opts.title||def.title,icon=d.opts.icon||def.icon;
  const kick=d.micro?(d.opts.crisis?'ACİL RİSK':'ÖNLEM'):'TATBİKAT';
  const intro=d.micro?'':'<div class="dr-intro" id="drIntro"><div class="drp"><div class="kicker">'+kick+' · '+d.site.name.toUpperCase()+'</div><h2>'+ico(icon)+' '+title+'</h2><p class="lead">'+def.sub+'</p><ol>'+def.rules.map(r=>'<li>'+r+'</li>').join('')+'</ol>'+
    '<p class="drnote">Süre: <b>'+def.limit+' sn</b> · Hedef: en az <b>2 yıldız</b> → '+d.site.name+' bir kademe yükselir (ücretsiz).</p>'+
    '<div class="dr-go"><button class="btn" data-act="drillquit">Vazgeç</button><button class="btn primary" data-act="drillgo">Başla</button></div></div></div>';
  return chrome()+'<div id="drill"><div class="dr-top"><div class="dr-ti"><div class="kicker">'+kick+' · '+d.site.name.toUpperCase()+'</div><h2>'+ico(icon)+' '+title+'</h2></div>'+
    '<div class="dr-time"><div class="dr-bar"><i id="drBar"></i></div><b id="drSec">'+d.limit+' sn</b></div><div class="dr-score" id="drScore"></div>'+(d.micro?'':'<button class="btn sm" data-act="drillquit">Vazgeç</button>')+'</div>'+
    '<div id="dstage"></div><div id="dhint"></div>'+intro+'</div>';
}
function drillMount(){
  const d=DR;d.stage=document.getElementById('dstage');d.def.build(d,d.stage);d.hint(d.def.hint||'');
  if(d.micro)drillBegin();
}
function drillBegin(){
  const d=DR;if(!d||d.running||d.done)return;
  d.running=true;d.last=performance.now();const it=document.getElementById('drIntro');if(it)it.remove();
  d.iv=setInterval(drillTick,50);if(d.def.start)d.def.start(d);
}
function drillTick(){
  const d=DR;if(!d)return;
  const now=performance.now(),dt=Math.min(.12,(now-d.last)/1000);d.last=now;
  if(S.paused||document.hidden)return;
  d.clock+=dt;const due=d.jobs.filter(j=>j.at<=d.clock);d.jobs=d.jobs.filter(j=>j.at>d.clock);
  for(const j of due){if(DR!==d)return;j.fn();}
  if(DR!==d||!d.running||d.done)return;d.t+=dt;
  const left=Math.max(0,d.limit-d.t),bar=document.getElementById('drBar'),sec=document.getElementById('drSec');
  if(bar){bar.style.width=(left/d.limit*100)+'%';bar.classList.toggle('low',left<d.limit*.25);}
  if(sec)sec.textContent=Math.ceil(left)+' sn';
  if(d.def.tick)d.def.tick(d,dt);
  // Hedef tamamlanınca kalan süreyi tüketme; geçiş tek kez sonuçlandırılır.
  if(DR!==d||d.done)return;
  if(d.def.complete&&d.def.complete(d)){d.hint('Görev tamamlandı.');drillComplete(d);return;}
  if(d.t>=d.limit)drillComplete(d);
}
function drillComplete(d){if(!d||d.done)return;const r=d.def.score(d);drillFinish(d,r.ratio,r.lines,r.ok);}
function drillQuit(){
  const d=DR;if(!d||d.done)return;
  if(d.micro&&!d.done){drillFinish(d,0,['Önlemi yarıda bıraktın.'],false);return;}
  Sfx.click();go('cmap');
}
function drillFlash(text,cls){const dr=document.getElementById('drill');if(!dr)return;const f=$e('div','dr-flash '+(cls||''),text);dr.appendChild(f);}
function drillFinish(d,ratio,lines,ok){
  if(DR!==d||d.done)return;d.done=true;d.running=false;d.jobs=[];if(!d.micro)clearInterval(d.iv);
  ratio=drClamp(ratio,0,1);if(ok===true)ratio=Math.max(.6,ratio);const stars=ratio>=.85?3:ratio>=.6?2:ratio>=.35?1:0;
  if(ok===undefined)ok=stars>=2;
  if(d.micro)return drillMicroEnd(d,ratio,ok,lines);
  const site=d.site;if(!ok)ctOrderFailure(site);CT.visit=false;CT.visits++;
  const out=(lines||[]).slice();let toast=null;
  if(ok){CT.drillProof[site.id]={stars};if(site.id==='itfaiye')CT.drillProof[site.id].routes=d.s.routes||[];if(CT.lv[site.id]<3){toast=ctLevelUp(site);out.push('Tatbikat başarılı: '+site.name+' bir kademe yükseldi (ücretsiz).');}else out.push('Bu mahalle zaten tam hazır.');}
  else out.push('Kademe için en az 2 yıldız gerekiyordu. Kuralları dikkatle uygulayıp tekrar dene.');
  if(ok&&site.id==='itfaiye')out.push('Güvenli rota hazır: şehir kayıpları %5 azalır. Kalıcıdır; tekrar başarı bonusu katlamaz.');
  if(stars===3){CT.budget+=2;out.push('Kusursuz tatbikat: +2 ◆ bütçe.');}
  S.mres={ok,stars,title:ok?'Tatbikat başarılı':'Tatbikat yetersiz',lines:out,toast,learn:d.def.learn};
  if(ok)Sfx.win();else Sfx.fail();
  go('minires');
}
function drillMicroEnd(d,ratio,ok,lines){
  const site=d.site,o=d.opts;let bonus=0,msg='';CT.minis++;
  if(ok){
    CT.miniOk++;CT.combo=(CT.combo||0)+1;
    if(o.hazard&&CT.fire[site.id]){delete CT.fire[site.id];CT.putOut++;CT.plan.spreads=CT.plan.spreads.filter(x=>x.from!==site.id);CT.plan.erodes=(CT.plan.erodes||[]).filter(x=>x.from!==site.id);}
    if(o.crisis){CT.crises=CT.crises.filter(c=>c!==o.crisis);CT.crisisOk=(CT.crisisOk||0)+1;}
    if(ratio>=.5)bonus+=1;if(CT.combo>=2)bonus+=Math.min(2,CT.combo-1);
    CT.budget+=bonus;
    msg='RİSK KAPANDI ✓'+(bonus?'  +'+bonus+' ◆':'')+(CT.combo>=2?'  · KOMBO ×'+CT.combo:'');Sfx.win();
  }else{
    CT.combo=0;
    if(o.hazard)CT.risk+=CT_RISK;
    if(o.crisis){CT.crisisFail++;CT.crises=CT.crises.filter(c=>c!==o.crisis);const hz=HAZARDS.find(h=>h.id===o.crisis.hz);ctIgnite(site,hz);}
    msg='BAŞARISIZ ✗';Sfx.fail();
  }
  drillFlash(msg,ok?'good':'bad');
  d.later(1250,()=>{if(DR!==d||S.mode!=='drill')return;go('cmap');if(ctCheckGameOver())return;
    const why=(lines&&lines[0])||'';
    if(ok)ctFloat(site,'ÖNLEM ✓');
    ctToast(ok?'✓ '+site.name+' · önlem uygulandı':'✗ '+site.name+' · önlem başarısız',why+(ok&&bonus?' (+'+bonus+' ◆)':'')+(!ok?(o.crisis?' Risk açığa çıktı.':' Şehir riski arttı.'):''),!ok);});
}

/* =========================================================
   MAHALLE TATBİKATLARI
   ========================================================= */

/* ---------- OKUL: tahliye ---------- */
DRILLS.okul={icon:'school',title:'Tahliye tatbikatı',limit:56,
  sub:'Alarm çaldı! Sınıfta 8 öğrenci var. Önce sarsıntıda korun, sonra düzenli tahliye et.',
  rules:['<b>Sarsıntı:</b> her öğrenciye tıkla veya 1–8 → çök-kapan-tutun (sıranın altına).','Panikleyip koşmak isteyen <b>!</b> işaretli öğrenciyi hemen durdur (tıkla).','Sarsıntı bitince <b>kapıya en yakından başlayarak</b> sırayla çıkar. Sıra bozulursa izdiham olur.'],
  learn:'Sarsıntı sırasında koşmak en sık yaralanma sebebidir. Önce çök-kapan-tutun, sarsıntı durunca sakin ve sırayla tahliye.',
  build(d,st){
    st.innerHTML='<div class="ok-room"><div class="ok-door">'+ico('door')+'<small>ÇIKIŞ</small></div><div class="ok-grid" id="okGrid"></div><div class="ok-assembly"><small>TOPLANMA ALANI</small><div id="okOut"></div><b id="okCount">0 / 8</b></div></div>';
    const g=st.querySelector('#okGrid'),face=[0,1,2,3,4,5,6,7].map(i=>person('kid',i)),kids=[];
    for(let r=0;r<2;r++)for(let c=0;c<4;c++){
      const k={c,r,dist:c+r*.5,covered:false,panic:false,out:false,el:$e('div','ok-kid','<span class="kf">'+face[kids.length]+'</span><i class="dk"></i><em>!</em>')};
      k.el.setAttribute('role','button');k.el.tabIndex=0;k.el.setAttribute('aria-label','Öğrenci '+(kids.length+1));k.el.insertAdjacentHTML('beforeend','<small class="kid-number">'+(kids.length+1)+'</small>');
      k.el.style.gridColumn=c+1;k.el.style.gridRow=r+1;g.appendChild(k.el);kids.push(k);
      k.el.addEventListener('click',()=>okClick(d,k));
    }
    d.s={kids,phase:'cover',uncovered:0,runners:0,wrong:0,out:0,order:kids.slice().sort((a,b)=>a.dist-b.dist),nxt:0};
  },
  start(d){
    d.hint('SARSINTI! Her öğrenciye tıkla: çök-kapan-tutun');d.info('Korunan: <b>0 / 8</b>');
    [2.2,5.4].forEach(t=>d.later(t*1000,()=>okPanic(d)));d.later(10000,()=>okEvac(d));
  },
  key(d,e){if(/^[1-8]$/.test(e.key)){e.preventDefault();okClick(d,d.s.kids[+e.key-1]);}},
  score(d){const s=d.s;if(s.phase==='cover')s.uncovered=s.kids.filter(k=>!k.covered).length;const a=(8-s.uncovered)/8,b=s.out/8-.14*s.wrong;
    return{ratio:.35*Math.max(0,a-.12*s.runners)+.65*Math.max(0,b),lines:['Çök-kapan-tutun: '+(8-s.uncovered)+' / 8 öğrenci korundu.',s.runners?s.runners+' öğrenci panikleyip koştu.':'Kimse paniklemedi.',s.wrong?s.wrong+' kez sıra bozuldu (izdiham).':'Tahliye düzenliydi.','Toplanma alanında: '+s.out+' / 8']};}
};
function okClick(d,k){
  const s=d.s;if(!d.running||d.done||k.out)return;
  if(s.phase==='cover'){
    if(k.panic){k.panic=false;k.el.classList.remove('panic');d.pop(k.el,'Sakinleşti','good');Sfx.safe();}
    if(!k.covered){k.covered=true;k.el.classList.add('cov');Sfx.pick();
      d.info('Korunan: <b>'+s.kids.filter(x=>x.covered).length+' / 8</b>');}
  }else{
    const want=s.order[s.nxt];
    if(k===want){k.out=true;s.nxt++;s.out++;k.el.classList.add('gone');
      const o=$e('span','',k.el.querySelector('.kf').innerHTML);document.getElementById('okOut').appendChild(o);
      document.getElementById('okCount').textContent=s.out+' / 8';Sfx.fix();d.info('Tahliye: <b>'+s.out+' / 8</b>');
      if(s.out>=8)d.later(500,()=>d.finish());
    }else{s.wrong++;d.shake();d.pop(k.el,'İZDİHAM!',false);Sfx.nope();}
  }
}
function okPanic(d){
  const s=d.s;if(s.phase!=='cover')return;
  const pool=s.kids.filter(k=>!k.covered&&!k.panic);
  const kk=pool.length?pool[Math.floor(Math.random()*pool.length)]:s.kids[Math.floor(Math.random()*8)];
  kk.panic=true;kk.el.classList.add('panic');Sfx.warn();d.hint('Biri panikledi! "!" işaretli öğrenciyi durdur!',true);
  d.later(1900,()=>{if(kk.panic){kk.panic=false;kk.el.classList.remove('panic');s.runners++;d.pop(kk.el,'Koştu!',false);Sfx.nope();}});
}
function okEvac(d){
  const s=d.s;s.phase='evac';s.uncovered=s.kids.filter(k=>!k.covered).length;
  s.kids.forEach(k=>{k.panic=false;k.el.classList.remove('panic','cov');});Sfx.safe();
  d.hint('SARSINTI BİTTİ — Numara sırası: 1 → 5 → 2 → 6 → 3 → 7 → 4 → 8. Fare veya 1–8 tuşları.');d.info('Tahliye: <b>0 / 8</b>');
}

/* ---------- ESKİ LİMAN: tarihi duvar ---------- */
DRILLS.eskiliman={icon:'wall',title:'Sur denetimi ve tahliye',limit:60,
  complete(d){const s=d.s;return s.stones.every(o=>!o.loose||o.prop)&&s.tour.every(t=>t.safe||t.hurt);},
  sub:'Eski Liman surunda denetim yapıldı: bazı taşlar çatlak. Deprem gelmeden gevşek taşları payandayla destekle ve duvar dibindeki turistleri açık alana yönlendir.',
  rules:['<b>Ok tuşları / WASD</b> ile yürü. <b>Çatlaklı taşın hemen altında</b> dur, <b>Boşluk</b>a bas ve 1 sn kıpırdama: payanda kurulur.','Bir <b>turistin yanında</b> Boşluk: onu sağdaki <b>açık alana</b> yönlendirir.','Taşın üstünde <b>kırmızı uyarı</b> yanıyorsa o taş düşmek üzeredir: altından çık ya da hemen payanda kur.'],
  learn:'Tarihi yapılar sarsıntıda ilk hasar görenlerdendir. Çatlak ve gevşek taşlar önceden tespit edilip payandayla desteklenir, duvar dibi boşaltılır, insanlar açık alana yönlendirilir.',
  build(d,st){
    const W=12,H=4,C=64;
    st.innerHTML='<div class="es"><div class="es-board" id="esB" style="width:'+W*C+'px;height:'+H*C+'px"><div class="es-safe"><small>AÇIK ALAN</small></div></div><div class="es-keys"><span><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> yürü</span><span><kbd>Boşluk</kbd> payanda kur / turisti yönlendir</span></div></div>';
    const bd=st.querySelector('#esB');
    const cols=drShuf([1,2,3,4,5,6,7,8,9]);let loose=[];for(const c of cols){if(loose.every(l=>Math.abs(l-c)>1))loose.push(c);if(loose.length>=4)break;}
    while(loose.length<4){const c=cols.find(x=>loose.indexOf(x)<0);loose.push(c);}
    const stones=[];
    for(let c=0;c<W;c++){
      const isL=loose.indexOf(c)>=0,el=$e('div','es-st'+(isL?' lo':''),isL?'<svg viewBox="0 0 40 30"><polyline points="'+(8+Math.random()*6)+',0 '+(16+Math.random()*6)+',10 '+(11+Math.random()*6)+',18 '+(24+Math.random()*8)+',30"/></svg><em>ÇATLAK</em>':(Math.random()<.3?'<span class="moss"></span>':''));
      el.style.left=c*C+'px';el.style.top='0px';el.style.width=C+'px';el.style.height=C+'px';el.style.background='hsl('+(28+Math.floor(Math.random()*12))+',22%,'+(44+Math.floor(Math.random()*10))+'%)';
      bd.appendChild(el);stones.push({el,col:c,loose:isL,prop:false});
    }
    const me=$e('div','es-me',person('adult',5)),pb=$e('div','es-pb','<i></i>');me.appendChild(pb);bd.appendChild(me);
    const spots=[];
    loose.slice(0,2).forEach(c=>spots.push([c,1+Math.floor(Math.random()*2)]));
    const free=drShuf([0,1,2,3,4,5,6,7,8,9]).filter(c=>spots.every(p=>p[0]!==c));
    while(spots.length<4){spots.push([free.shift(),1+Math.floor(Math.random()*3)]);}
    const tour=spots.map((p,i)=>{const el=$e('div','es-tr',person('tourist',i+1));bd.appendChild(el);return{el,x:p[0],y:p[1],safe:false,hurt:false,go:false,tx:10+(i%2),ty:1+Math.floor(i/2)};});
    d.s={W,H,C,bd,stones,me,pb,px:5,py:3,tour,found:0,safe:0,hurt:0,work:null,warns:[],fi:0,fallAt:[13,24,35],stun:0,C:C};
    esDraw(d);
    for(let y=1;y<H;y++)for(let x=0;x<W;x++){const b=$e('button','es-cell','');b.style.left=x*C+'px';b.style.top=y*C+'px';b.setAttribute('aria-label','Sokak '+(x+1)+', sıra '+y);bd.appendChild(b);b.addEventListener('click',()=>{if(!d.running||d.done||d.s.stun>0)return;if(Math.abs(d.s.px-x)+Math.abs(d.s.py-y)>1)return;d.s.px=x;d.s.py=y;d.s.work=null;d.s.pb.classList.remove('on');esDraw(d);});}
    const act=$e('button','btn es-action','Payanda / yönlendir');st.querySelector('.es').appendChild(act);act.addEventListener('click',()=>esAct(d));
  },
  start(d){d.hint('Çatlaklı bir taşın altına yürü, Boşluk ile payanda kur. Turistleri açık alana gönder.');esInfo(d);},
  key(d,e){const s=d.s,k=e.key.toLowerCase(),m={arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1]}[k];
    if(m){e.preventDefault();if(s.stun>0)return;s.px=drClamp(s.px+m[0],0,s.W-1);s.py=drClamp(s.py+m[1],1,s.H-1);if(s.work){s.work=null;s.pb.classList.remove('on');}esDraw(d);}
    else if(k===' '){e.preventDefault();esAct(d);}},
  tick(d,dt){const s=d.s;
    if(s.stun>0){s.stun-=dt;s.me.classList.toggle('stun',s.stun>0);}
    if(s.work){s.work.t+=dt;const i=s.pb.firstChild;if(i)i.style.width=Math.min(100,s.work.t*100)+'%';
      if(s.work.t>=1){const o=s.work.o;o.prop=true;o.el.classList.add('tp');o.el.querySelector('em').textContent='PAYANDA';s.found++;s.work=null;s.pb.classList.remove('on');Sfx.fix();d.pop(o.el,'Payanda kuruldu','good');
        s.warns=s.warns.filter(w=>{if(w.o===o){o.el.classList.remove('warn');d.pop(o.el,'Düşme önlendi!','good');return false;}return true;});esInfo(d);}}
    s.tour.forEach(t=>{if(!t.go)return;const dx=t.tx-t.x,dy=t.ty-t.y,dist=Math.hypot(dx,dy),st=3.4*dt;
      if(dist<=st){t.x=t.tx;t.y=t.ty;t.go=false;t.safe=true;s.safe++;t.el.classList.remove('go');t.el.classList.add('ok');Sfx.safe();esInfo(d);}
      else{t.x+=dx/dist*st;t.y+=dy/dist*st;}
      t.el.style.transform='translate('+t.x*s.C+'px,'+(t.y*s.C)+'px)';});
    if(s.fi<s.fallAt.length&&d.t>=s.fallAt[s.fi]){s.fi++;const open=s.stones.filter(o=>o.loose&&!o.prop&&!s.warns.some(w=>w.o===o));
      if(open.length){const o=open[Math.floor(Math.random()*open.length)];o.el.classList.add('warn');s.warns.push({o,t:1.8});Sfx.warn();d.hint('Kırmızı uyarılı taş düşmek üzere! Altından çık ya da payanda kur.',true);}}
    for(let i=s.warns.length-1;i>=0;i--){const w=s.warns[i];w.t-=dt;if(w.t>0)continue;s.warns.splice(i,1);
      const o=w.o;o.el.classList.remove('warn');o.el.classList.add('fall');o.loose=false;o.prop=true;o.fallen=true;Sfx.crash();d.shake();
      if(s.px===o.col&&s.py<=2){s.stun=.9;d.t+=2.5;d.pop(s.me,'Taş çarptı! −2.5 sn',false);if(s.work){s.work=null;s.pb.classList.remove('on');}}
      s.tour.forEach(t=>{if(t.safe||t.hurt)return;if(Math.abs(t.x-o.col)<.6&&t.y<=2.5){t.hurt=true;t.go=false;s.hurt++;t.el.innerHTML=ico('bandage');t.el.classList.remove('go');d.pop(t.el,'Turist yaralandı!',false);}});
      esInfo(d);}
  },
  score(d){const s=d.s;return{ratio:Math.min(s.found===4&&s.safe===4?1:.84,s.found/4*.5+s.safe/4*.5-s.hurt*.1),lines:['Payandayla desteklenen taş: '+s.found+' / 4.','Açık alana alınan turist: '+s.safe+' / 4'+(s.hurt?' ('+s.hurt+' turist taş altında kaldı).':'.'),s.found>=4?'Tüm çatlak taşlar desteklendi.':s.stones.filter(o=>o.fallen).length+' taş düştü; '+s.stones.filter(o=>o.loose&&!o.prop).length+' çatlak taş hâlâ desteksiz.']};}
};
function esDraw(d){const s=d.s;s.me.style.transform='translate('+s.px*s.C+'px,'+s.py*s.C+'px)';
  s.tour.forEach(t=>{if(!t.go)t.el.style.transform='translate('+t.x*s.C+'px,'+t.y*s.C+'px)';});}
function esInfo(d){const s=d.s;d.info('Payanda: <b>'+s.found+' / 4</b> · Turist: <b>'+s.safe+' / 4</b>');}
function esAct(d){
  const s=d.s;if(!d.running||d.done||s.stun>0)return;
  const t=s.tour.find(t=>!t.safe&&!t.hurt&&!t.go&&Math.abs(t.x-s.px)<=1&&Math.abs(t.y-s.py)<=1);
  if(t){t.go=true;t.el.classList.add('go');Sfx.pick();d.pop(t.el,'Açık alana!','good');return;}
  const o=s.stones[s.px];
  if(s.py===1&&o&&o.loose&&!o.prop){s.work={o,t:0};s.pb.classList.add('on');Sfx.click();return;}
  Sfx.nope();d.hint('Önce çatlaklı bir taşın hemen altına (en üst sokak sırasına) ya da bir turistin yanına git.',true);
}

/* ---------- HASTANE: deprem öncesi süreklilik planı ---------- */
DRILLS.hastane={icon:'hospital',title:'Hastane hazırlık planı',limit:60,
  sub:'Sarsıntı gelmeden hastanenin yedek gücünü, açık değerlendirme alanını ve tıbbi gaz güvenliğini hazırla.',
  rules:['Her denetim kartını oku; üç seçenekten güvenli önlemi seç. Fareyle tıkla veya <b>1–3</b> tuşlarını kullan.',
    'Bu bir <b>deprem öncesi planlama</b> tatbikatıdır. Hastaya tanı koymaz veya tedavi yapmazsın.',
    'Altı denetim var. Yanlış seçimde açıklamayı oku ve yeniden dene; her hata puanı azaltır.'],
  learn:'Hastane hazırlığı depremden önce yapılır: yedek güç kontrolü, güvenli ve ulaşılabilir değerlendirme alanı, sabit tıbbi gaz tüpleri ve açık çıkış yolları.',
  build(d,st){
    d.s={i:0,right:0,wrong:0,locked:false,cards:drShuf([
      {ic:'bolt',t:'Şebeke kesilirse kritik cihazlar nasıl çalışacak?',a:['Jeneratör ve yedek güç testini planla','Elektrik kesilince karar ver','Uzatma kablosuyla tüm yükü tek prize bağla'],why:'Yedek güç ve bakım planı depremden önce kontrol edilir.'},
      {ic:'cylinder',t:'Tıbbi gaz tüpleri koridorda serbest duruyor.',a:['Tüpleri uygun bağlantıyla sabitle','Yüksek rafa kaldır','Çıkış kapısının arkasına koy'],why:'Devrilen tüp hem yaralar hem bağlantıları koparabilir.'},
      {ic:'map',t:'Deprem sonrası değerlendirme alanı nerede planlanmalı?',a:['Bina ve enerji hatlarından uzak, erişilebilir açık alanda','Hasarlı cephenin hemen dibinde','Ambulans yolunu kapatacak yerde'],why:'Alan güvenli olmalı; acil ulaşım yolu açık kalmalı.'},
      {ic:'door',t:'Tahliye koridorunda sedye ve malzeme birikmiş.',a:['Koridoru aç, depolamayı ayrı yerde düzenle','Sadece kapıyı kilitle','Eşyaların üstüne çıkış tabelası koy'],why:'Tabelalar tek başına yetmez; tahliye yolu fiziksel olarak açık tutulur.'},
      {ic:'lock',t:'Ağır tıbbi cihazlar hareketli ve sabitlenmemiş.',a:['Uygun sabitlemeyi ve teker kilitlerini kontrol et','Cam önüne taşı','Daha yüksek dolaba koy'],why:'Cihazların kayması ve devrilmesi önceden alınan uygun sabitleme önlemleriyle azaltılır.'},
      {ic:'clipboard',t:'Kesinti sırasında ekipler birbirine nasıl ulaşacak?',a:['Yedek haberleşme ve görev planını tatbikatla dene','Yalnız sosyal medya mesajlarına güven','Planı depremden sonraya bırak'],why:'Görev ve haberleşme planı önceden bilinir ve tatbikatla denenir.'}
    ])};
    st.innerHTML='<div class="hp"><div class="hp-plan"><span>'+ico('hospital')+'</span><h3>ÖNCE HAZIRLIK</h3><p>Yedek güç<br>Güvenli alan<br>Sabit ekipman</p><div id="hpProgress"></div></div><div class="hp-main"><div id="hpCard"></div><div id="hpChoices"></div></div></div>';hpShow(d);
  },
  start(d){d.hint('Kartı oku → güvenli önlemi seç. Fare veya 1–3.');},
  key(d,e){if(/^[1-3]$/.test(e.key)){e.preventDefault();const b=document.querySelectorAll('#hpChoices button')[+e.key-1];if(b)b.click();}},
  score(d){const s=d.s;return{ratio:s.right/6-Math.min(.5,s.wrong*.08),lines:[s.right+' / 6 hazırlık denetimi tamamlandı.',s.wrong?s.wrong+' yanlış seçim: açıklamalarla güvenli önlemi yeniden değerlendirdin.':'Tüm önlemler doğru seçildi.']};}
};
function hpShow(d){
  const s=d.s,c=s.cards[s.i];if(!c)return;
  document.getElementById('hpCard').innerHTML='<div class="kicker">DENETİM '+(s.i+1)+' / 6</div><span>'+ico(c.ic)+'</span><h3>'+c.t+'</h3>';
  document.getElementById('hpProgress').innerHTML=s.cards.map((_,i)=>'<i class="'+(i<s.i?'done':'')+'">'+(i<s.i?'✓':i+1)+'</i>').join('');
  const box=document.getElementById('hpChoices');box.innerHTML='';
  drShuf(c.a.map((t,i)=>({t,ok:i===0}))).forEach((a,i)=>{const b=$e('button','hp-choice','<kbd>'+(i+1)+'</kbd><b>'+a.t+'</b>');box.appendChild(b);b.addEventListener('click',()=>{
    if(!d.running||d.done||s.locked)return;
    if(a.ok){s.right++;s.locked=true;b.classList.add('correct');d.hint(c.why);Sfx.fix();d.info('Hazır: <b>'+s.right+' / 6</b>');d.later(1000,()=>{s.i++;s.locked=false;if(s.i>=6)d.finish();else hpShow(d);});}
    else{s.wrong++;b.disabled=true;d.hint(c.why,true);Sfx.nope();}
  });});
}

/* ---------- ÇARŞI: dükkân turu ---------- */
DRILLS.carsi={icon:'shop',title:'Dükkân güvenlik turu',limit:55,
  sub:'Çarşıda 5 dükkân var. Her dükkânda deprem sonrası yangına yol açabilecek TEK bir risk saklı: onu bul ve gider.',
  rules:['Her dükkânda büyük üç kart var: <b>tüp</b>, <b>kablo</b>, <b>çıkış kapısı</b>. Yalnız biri tehlikeli: <b>sızan tüp</b> (gaz buğusu), <b>kıvılcımlı kablo</b> ya da <b>kutuyla kapanmış çıkış</b>.','Tehlikeli karta tıkla: önlem uygulanır ve sıradaki dükkâna geçersin. Sağlam karta tıklamak zaman kaybettirir.','5 dükkânın en az 4’ünü güvenli hâle getir.'],
  learn:'Deprem sonrası yangınların büyük bölümü gaz kaçağı ve hasarlı elektrikten çıkar; önceden alınan önlemler bunları engeller. Çıkış yolları kapalı kalırsa kalabalık içeride mahsur kalır.',
  build(d,st){
    const names=drShuf([['meat','Kasap'],['cup','Kafe'],['leaf','Manav'],['spool','Terzi'],['scissors','Berber'],['cart','Market']]).slice(0,5);
    let prev=-1;const shops=names.map(n=>{let j;do{j=Math.floor(Math.random()*3);}while(j===prev);prev=j;return{ic:n[0],name:n[1],bad:j};});
    st.innerHTML='<div class="cs2"><div class="cs2-top"><b id="cs2N"></b><span id="cs2D"></span></div><div class="cs2-row" id="cs2R"></div><p class="cs2-note" id="cs2T"></p></div>';
    d.s={shops,i:0,fixed:0,missed:0,wrong:0,lock:false};
  },
  start(d){csShow(d);},
  score(d){const s=d.s,ok=s.fixed>=4;return{ok,ratio:ok?drClamp(.5+s.fixed*.08-d.t/d.limit*.15-s.wrong*.06,.5,1):s.fixed/5*.45,lines:['Güvenli hâle gelen dükkân: '+s.fixed+' / 5.',s.wrong?s.wrong+' sağlam öğeye boşuna dokundun.':'Gereksiz hamle yok.',ok?'Çarşı deprem öncesi güvenli hâle geldi.':'Çarşıdaki bazı riskler giderilemedi.']};}
};
const CS_KINDS=[{ic:'cylinder',n:'Gaz tüpü',cls:'gas',fix:'Tüp vanası kapatıldı, tüp zincirle sabitlendi',msg:'Gaz sızıntısı gideriliyor…'},{ic:'plug',n:'Elektrik kablosu',cls:'spk',fix:'Kablo prizden çekildi, yalıtıldı',msg:'Elektrik kesiliyor…'},{ic:'door',n:'Çıkış kapısı',cls:'blk',fix:'Çıkışı kapatan kutular kaldırıldı',msg:'Yol açılıyor…'}];
function csShow(d){
  const s=d.s,sh=s.shops[s.i];if(!sh)return;s.lock=false;
  document.getElementById('cs2N').innerHTML=ico(sh.ic)+' '+sh.name+' <small>· dükkân '+(s.i+1)+' / 5</small>';
  document.getElementById('cs2D').innerHTML=s.shops.map((x,i)=>'<i class="'+(i<s.i?(x.ok?'ok':'no'):i===s.i?'cur':'')+'"></i>').join('');
  document.getElementById('cs2T').textContent='Hangisi tehlikeli? Büyük kartlardan birine tıkla.';
  const R=document.getElementById('cs2R');R.innerHTML='';
  CS_KINDS.forEach((k,j)=>{const bad=j===sh.bad;
    const el=$e('button','cs2-c'+(bad?' hz '+k.cls:''),'<div class="cs2-ic">'+ico(k.ic)+'<span class="fxw"></span></div><b>'+k.n+'</b><div class="cs2-bar"><i></i></div>');
    R.appendChild(el);el.addEventListener('click',()=>csPick(d,el,k,bad));});
  d.info('Güvenli dükkân: <b>'+s.fixed+' / 5</b>');
}
function csPick(d,el,k,bad){
  const s=d.s;if(!d.running||d.done||s.lock)return;
  if(!bad){s.wrong++;d.t+=1.5;d.shake();Sfx.nope();d.pop(el,'Sağlam! −1.5 sn',false);d.hint(k.n+' bu dükkânda güvenli görünüyor; diğer kartlara bak.',true);return;}
  s.lock=true;el.classList.add('fixing');document.getElementById('cs2T').textContent=k.msg;Sfx.valve();
  d.later(850,()=>{s.shops[s.i].ok=true;s.fixed++;el.classList.remove('fixing');el.classList.add('fixed');Sfx.fix();d.pop(el,'Giderildi',true);d.hint(k.fix+'.',false);d.info('Güvenli dükkân: <b>'+s.fixed+' / 5</b>');
    d.later(900,()=>{s.i++;if(s.i>=s.shops.length)d.finish();else csShow(d);});});
}

/* ---------- İTFAİYE: rota planı ---------- */
DRILLS.itfaiye={icon:'firstaid',title:'Tahliye güzergâhı planı',limit:60,
  sub:'Konutlar mahallesindeki ailelerin iki toplanma alanına güvenli rotasını çiz. Başarılı tatbikat şehir kayıplarını kalıcı %5 azaltır; bonus birikmez.',
  rules:['<b>Ok tuşları</b> ya da <b>W A S D</b> ile yürü. Geçtiğin yol, mahalleye duyurulacak güzergâh olur. (Fareyle yandaki hücreye tıklamak da çalışır.)','<b>Çatlak bina</b> ve <b>elektrik direği</b> geçilemez: deprem anında üzerine düşebilir.','Önce <b>Toplanma Alanı A</b>, sonra <b>B</b>. Geri almak için <b>Z</b>, baştan başlamak için <b>R</b>. Yol ne kadar kısa olursa puan o kadar yüksek.'],
  learn:'Tahliye güzergâhları depremden ÖNCE belirlenir: yıkılabilecek yapılardan ve elektrik direklerinden uzak, en kısa ve açık yol seçilir; mahalleye duyurulur ve tatbikatla denenir.',
  build(d,st){
    const W=9,H=5,start=[0,4],T=[[8,0],[8,4]];let blocked,opt;
    const bfs=(a,b,bl)=>{const q=[[a[0],a[1],0]],seen={};seen[a[0]+','+a[1]]=1;while(q.length){const [x,y,n]=q.shift();if(x===b[0]&&y===b[1])return n;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=W||ny>=H||seen[k]||bl[k])return;seen[k]=1;q.push([nx,ny,n+1]);});}return -1;};
    for(let tr=0;tr<80;tr++){
      blocked={};let c=0;while(c<14){const x=Math.floor(Math.random()*W),y=Math.floor(Math.random()*H),k=x+','+y;
        if(blocked[k]||(x===0&&y===4)||(x===8&&y===0)||(x===8&&y===4)||(x===0&&y===3)||(x===7&&y===0)||(x===7&&y===4))continue;blocked[k]=1;c++;}
      opt=[bfs(start,T[0],blocked),bfs(start,T[1],blocked)];if(opt[0]>0&&opt[1]>0&&opt[0]>=11&&opt[1]>=9)break;
    }
    if(!(opt[0]>0&&opt[1]>0)){blocked={};opt=[bfs(start,T[0],blocked),bfs(start,T[1],blocked)];}
    st.innerHTML='<div class="if-wrap"><div class="if-grid" id="ifG"></div><div class="if-side"><div class="if-t" id="ifT"></div></div></div>';
    const g=st.querySelector('#ifG'),cells={};
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const k=x+','+y,isB=!!blocked[k],pole=isB&&((x+y)%3===0),el=$e('div','if-c'+(isB?' bl'+(pole?' pl':' cr'):' fr'),isB?ico(pole?'pole':'wall')+'<small>'+(pole?'DİREK':'ÇATLAK')+'</small>':'');
      if(x===0&&y===4){el.className='if-c stn';el.innerHTML=ico('houses')+'<small>BAŞLA</small>';}
      if(x===8&&y===0){el.className='if-c tgt';el.innerHTML=ico('tent')+'<em>A</em><small>TOPLANMA</small>';}
      if(x===8&&y===4){el.className='if-c tgt';el.innerHTML=ico('tent')+'<em>B</em><small>TOPLANMA</small>';}
      el.style.gridColumn=x+1;el.style.gridRow=y+1;g.appendChild(el);cells[k]=el;el.addEventListener('click',()=>ifClick(d,x,y));
    }
    const me=$e('div','if-me',person('adult',3));g.appendChild(me);
    d.s={W,H,blocked,cells,me,path:[[0,4]],T,cur:0,opt,len:[0,0],done:[false,false]};
    ifInfo(d);
  },
  start(d){d.hint('Ok tuşlarıyla yürü: önce Toplanma Alanı A\'ya ulaş. Enkazdan ve direklerden kaç.');},
  key(d,e){const k=e.key.toLowerCase(),m={arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0],arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1]}[k];
    if(m){e.preventDefault();const h=d.s.path[d.s.path.length-1];ifClick(d,h[0]+m[0],h[1]+m[1]);}
    else if(k==='z'||k==='backspace'){e.preventDefault();ifUndo(d);}
    else if(k==='r'){e.preventDefault();ifResetPath(d);}},
  score(d){const s=d.s,r=[0,1].map(i=>s.done[i]?Math.min(1,s.opt[i]/s.len[i]):0),rel=(r[0]+r[1])/2;
    return{ratio:rel*(.86+.14*(1-d.t/d.limit)),lines:['Toplanma Alanı A: '+(s.done[0]?'ulaşıldı · '+s.len[0]+' adım (en kısa '+s.opt[0]+')':'ulaşılamadı'),'Toplanma Alanı B: '+(s.done[1]?'ulaşıldı · '+s.len[1]+' adım (en kısa '+s.opt[1]+')':'ulaşılamadı')]};}
};
function ifInfo(d){const s=d.s,t=document.getElementById('ifT');if(!t)return;
  const row=(i,n)=>'<div class="if-tr'+(s.done[i]?' ok':s.cur===i?' on':'')+'">'+ico('tent')+'<b>Toplanma Alanı '+n+'</b><i>'+(s.done[i]?s.len[i]+' adım'+(s.len[i]===s.opt[i]?' · en kısa!':''):s.cur===i?(s.path.length-1)+' adım':'—')+'</i></div>';
  t.innerHTML=row(0,'A')+row(1,'B')+'<div class="if-keys"><div><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> yürü</div><div><kbd>Z</kbd> geri al <kbd>R</kbd> sıfırla</div></div>';
  s.T.forEach((p,i)=>s.cells[p[0]+','+p[1]].classList.toggle('act',s.cur===i));}
function ifRedraw(d){
  const s=d.s;Object.keys(s.cells).forEach(k=>s.cells[k].classList.remove('pt'));
  s.path.forEach(p=>s.cells[p[0]+','+p[1]].classList.add('pt'));
  const h=s.path[s.path.length-1];s.me.style.gridColumn=h[0]+1;s.me.style.gridRow=h[1]+1;ifInfo(d);
}
function ifUndo(d){const s=d.s;if(!d.running||d.done||s.cur>1||s.path.length<2)return;s.path.pop();ifRedraw(d);Sfx.click();}
function ifResetPath(d){const s=d.s;if(!d.running||d.done||s.cur>1||s.path.length<2)return;s.path=[[0,4]];ifRedraw(d);Sfx.click();}
function ifClick(d,x,y){
  const s=d.s;if(!d.running||d.done||s.cur>1)return;if(x<0||y<0||x>=s.W||y>=s.H)return;const k=x+','+y;
  const last=s.path[s.path.length-1];
  if(last[0]===x&&last[1]===y&&s.path.length>1){ifUndo(d);return;}
  if(s.path.length>1){const pv=s.path[s.path.length-2];if(pv[0]===x&&pv[1]===y){ifUndo(d);return;}}
  if(Math.abs(last[0]-x)+Math.abs(last[1]-y)!==1)return;
  if(s.blocked[k]){Sfx.nope();d.shake();d.pop(s.cells[k],'Geçilemez!',false);return;}
  if(s.path.some(p=>p[0]===x&&p[1]===y)){Sfx.nope();return;}
  s.path.push([x,y]);Sfx.pick();ifRedraw(d);
  const T=s.T[s.cur];
  if(x===T[0]&&y===T[1]){s.done[s.cur]=true;s.len[s.cur]=s.path.length-1;if(!s.routes)s.routes=[];s.routes[s.cur]=s.path.map(p=>p.slice());d.pop(s.cells[k],s.len[s.cur]===s.opt[s.cur]?'EN KISA!':s.len[s.cur]+' adım','good');Sfx.ext();
    s.cells[k].classList.add('ok');s.cur++;
    if(s.cur>1){ifInfo(d);d.later(700,()=>d.finish());}
    else{d.later(500,()=>{s.path=[[0,4]];ifRedraw(d);d.hint('Şimdi Toplanma Alanı B\'ye giden en kısa yolu bul.');});}}
}

/* ---------- SU DEPOSU: hat izolasyonu ---------- */
DRILLS.su={icon:'drop',title:'Hat izolasyon tatbikatı',limit:55,
  sub:'Deprem öncesi bir şebeke tatbikatındasın: senaryoda depo su kaybediyor. Örnek hasarlı hattı bul ve YALNIZCA onu kapat; sağlam mahalleler susuz kalmasın.',
  rules:['Fare veya <b>Tab + Enter</b> ile her hatta <b>Basınç ölç</b> (1 sn): düşük basınç = kaçak var. Aynı anda tek ölçüm.','Kaçaklı hattın <b>vanasını kapat</b>. Sağlam bir vanayı kapatırsan o mahalle susuz kalır.','Depo boşalmadan bitir: ne kadar su kalırsa o kadar iyi.'],
  learn:'Kırılan şebeke hem susuzluk hem zemin oyulması riski yaratır. Hasarlı hat izole edilir, sağlam hatlar çalışmaya devam eder; bu yüzden vanaların yeri bilinmelidir.',
  build(d,st){
    const dist=[['houses','Konutlar'],['hospital','Hastane'],['school','Okul'],['shop','Çarşı']],leak=Math.floor(Math.random()*4);
    st.innerHTML='<div class="su"><div class="su-tank"><div class="su-lv"><i id="suLv"></i></div><b id="suTxt">%100</b><small>DEPO</small></div><div class="su-cols" id="suC"></div></div>';
    const c=st.querySelector('#suC'),br=[];
    dist.forEach((dd,i)=>{
      const el=$e('div','su-br','<div class="su-v"><button class="su-valve on">'+ico('valve')+' AÇIK</button></div><div class="su-pipe"><i></i></div><div class="su-d">'+ico(dd[0])+'<b>'+dd[1]+'</b></div><button class="su-pb">'+ico('search')+' Basınç ölç</button><div class="su-r"></div>');
      c.appendChild(el);const o={el,leak:i===leak,open:true,probed:false};br.push(o);
      el.querySelector('.su-valve').addEventListener('click',()=>suValve(d,o));
      el.querySelector('.su-pb').addEventListener('click',()=>suProbe(d,o));
    });
    d.s={br,tank:100,dry:0,measuring:false,closeT:0};
  },
  start(d){d.hint('Depo boşalıyor! Hasarlı hattı bulmak için basınç ölç.',true);},
  tick(d,dt){
    const s=d.s,lk=s.br.find(b=>b.leak);
    if(lk.open)s.tank-=dt*3.3;
    s.br.forEach(b=>{if(!b.leak&&!b.open)s.dry+=dt;});
    const lv=document.getElementById('suLv');if(lv)lv.style.height=Math.max(0,s.tank)+'%';const tx=document.getElementById('suTxt');if(tx)tx.textContent='%'+Math.round(Math.max(0,s.tank));
    if(s.tank<=0){s.tank=0;d.finish();return;}
    const done=!lk.open&&s.br.every(b=>b.leak||b.open);
    if(done){s.closeT+=dt;if(s.closeT>.9)d.finish();}else s.closeT=0;
  },
  score(d){const s=d.s,lk=s.br.find(b=>b.leak),sealed=!lk.open;
    return{ratio:sealed?(s.tank/100*.62+Math.max(0,1-s.dry/16)*.38):s.tank/100*.2,ok:sealed&&s.tank>=40&&s.br.every(b=>b.leak||b.open),lines:[sealed?'Hasarlı hat izole edildi, depoda %'+Math.round(s.tank)+' su kaldı.':'Hasarlı hat kapatılamadı; depo boşaldı.',s.dry>.5?'Sağlam mahalleler toplam '+Math.round(s.dry)+' mahalle-saniye susuz kaldı.':'Sağlam mahalleler hiç susuz kalmadı.']};}
};
function suProbe(d,o){
  const s=d.s;if(!d.running||d.done||s.measuring||o.probed)return;s.measuring=true;const r=o.el.querySelector('.su-r');r.textContent='ölçülüyor…';Sfx.click();
  d.later(1100,()=>{s.measuring=false;o.probed=true;r.innerHTML=o.leak?'<b class="bad">DÜŞÜK BASINÇ</b>':'<b class="ok">Normal ✓</b>';
    if(o.leak){o.el.classList.add('lk');Sfx.warn();d.hint('Kaçak bulundu! Bu hattın vanasını kapat.');}else Sfx.safe();});
}
function suValve(d,o){
  if(!d.running||d.done)return;o.open=!o.open;const v=o.el.querySelector('.su-valve');v.classList.toggle('on',o.open);v.innerHTML=ico(o.open?'valve':'cross')+(o.open?' AÇIK':' KAPALI');o.el.classList.toggle('cl',!o.open);Sfx.valve();
  if(!o.open&&!o.leak)d.hint('Sağlam hattı kapattın! Mahalle susuz — tekrar aç.',true);
}

/* ---------- CAMİ MEYDANI: toplanma alanı ---------- */
DRILLS.cami={icon:'mosque',title:'Toplanma alanı kurulumu',limit:70,
  sub:'Meydan, depremden sonra mahalle halkının toplanacağı güvenli alan olacak. Çadırı, suyu, ilk yardımı ve kayıp aile noktasını doğru yerlere kur.',
  rules:['Önce sağdaki listeden bir <b>eşya seç</b> (ya da <b>1–4</b> tuşları), sonra meydanda bir hücreye tıkla (ya da <b>ok tuşlarıyla</b> gez, <b>Boşluk</b> ile yerleştir). Yerleştirilmişe tekrar basınca geri alınır.','<b>Kırmızı taralı</b> hücreler tehlikeli: <b>minare düşme alanı</b> ve <b>elektrik hattı</b>. Oraya kurma.','Seçili eşya için <b>yeşil noktalı</b> hücreler uygundur. <b>İlk yardım</b> yola bitişik sütuna, <b>çadırlar</b> birbirine değmeyecek şekilde kurulur. Bitince <b>Enter</b>.'],
  learn:'Toplanma alanı yüksek yapılardan, elektrik hatlarından ve enkaz düşme alanından uzak, yola yakın ve geniş olmalı. Çadırlar arası boşluk yangın ve izdiham riskini azaltır; ilk yardım ve su noktası ambulansın ulaşabileceği yerde olmalıdır.',
  build(d,st){
    const W=8,H=5,danger={},bld={},road={};
    [[0,1],[1,1],[0,2],[1,2],[0,3],[1,3]].forEach(p=>bld[p[0]+','+p[1]]=1);
    [[2,1],[2,2],[2,3]].forEach(p=>danger[p[0]+','+p[1]]=1);
    [[4,0],[5,0]].forEach(p=>danger[p[0]+','+p[1]]=1);
    for(let y=0;y<H;y++)road[7+','+y]=1;
    st.innerHTML='<div class="cm"><div class="cm-grid" id="cmG"></div><div class="cm-tray" id="cmT"></div></div>';
    const g=st.querySelector('#cmG'),cells={};
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const k=x+','+y;let cls='cm-c',txt='';
      if(bld[k]){cls+=' bd';txt=(x===0&&y===2)?ico('mosque')+'<small>CAMİ</small>':'';}
      else if(danger[k]){cls+=' dg';txt=(k==='4,0')?ico('bolt')+'<small>ELEKTRİK</small>':(k==='2,2')?ico('minaret')+'<small>MİNARE</small>':'';}
      else if(road[k]){cls+=' rd';txt=y===2?'YOL':'';}
      const el=$e('div',cls,txt);el.style.gridColumn=x+1;el.style.gridRow=y+1;g.appendChild(el);cells[k]=el;el.addEventListener('click',()=>{d.s.cx=x;d.s.cy=y;cmClick(d,x,y);});
    }
    const items=[{id:'tent',ic:ico('tent'),n:'Çadır',c:3,w:'birbirine değmesin'},{id:'water',ic:ico('tap'),n:'Su noktası',c:1,w:'tehlikeden uzak'},{id:'aid',ic:ico('firstaid'),n:'İlk yardım',c:1,w:'yola bitişik'},{id:'lost',ic:ico('clipboard'),n:'Kayıp aile noktası',c:1,w:'görünür yer'}];
    d.s={W,H,danger,bld,road,cells,items,sel:'tent',placed:{},wrong:0,cx:3,cy:2};
    cmTray(d);cmHints(d);
  },
  start(d){d.hint('Çadır seçili. Yeşil noktalı hücrelerden birine tıkla.');cmInfo(d);},
  key(d,e){const s=d.s,k=e.key.toLowerCase(),m={arrowleft:[-1,0],arrowright:[1,0],arrowup:[0,-1],arrowdown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]}[k];
    if(m){e.preventDefault();s.cx=drClamp(s.cx+m[0],0,s.W-1);s.cy=drClamp(s.cy+m[1],0,s.H-1);cmHints(d);}
    else if(k===' '){e.preventDefault();cmClick(d,s.cx,s.cy);}
    else if(k==='enter'){e.preventDefault();if(d.running&&!d.done)d.finish();}
    else if(k>='1'&&k<='4'){const it=s.items[+k-1];if(it&&cmLeft(d,it.id)>0){s.sel=it.id;Sfx.click();cmTray(d);cmHints(d);}}},
  score(d){
    const s=d.s,pl=Object.keys(s.placed).map(k=>({k,x:+k.split(',')[0],y:+k.split(',')[1],id:s.placed[k]})),n=pl.length;
    const aid=pl.find(p=>p.id==='aid'),aidOk=aid&&aid.x===6;
    const tents=pl.filter(p=>p.id==='tent');let iso=0;tents.forEach(t=>{if(!tents.some(o=>o!==t&&Math.abs(o.x-t.x)<=1&&Math.abs(o.y-t.y)<=1))iso++;});
    const tOk=tents.length?iso/Math.max(3,tents.length):0;
    return{ratio:n/6*.4+(aidOk?.3:0)+tOk*.3-.07*s.wrong,lines:['Yerleştirilen: '+n+' / 6 eşya.',aid?(aidOk?'İlk yardım yola yakın ✓':'İlk yardım yoldan uzak: ulaşım zor olur.'):'İlk yardım noktası kurulmadı.',tents.length?'Birbirinden ayrık çadır: '+iso+' / '+tents.length+'.':'Çadır kurulmadı.',s.wrong?s.wrong+' kez tehlikeli/uygunsuz hücreye kurmayı denedin.':'Hiç tehlikeli hücreye kurmadın.']};}
};
function cmLeft(d,id){const s=d.s,it=s.items.find(i=>i.id===id);return it.c-Object.keys(s.placed).filter(k=>s.placed[k]===id).length;}
function cmChecks(d){
  const s=d.s,pl=Object.keys(s.placed).map(k=>({x:+k.split(',')[0],y:+k.split(',')[1],id:s.placed[k]}));
  const tents=pl.filter(p=>p.id==='tent'),apart=tents.length>=3&&tents.every(t=>!tents.some(o=>o!==t&&Math.abs(o.x-t.x)<=1&&Math.abs(o.y-t.y)<=1));
  const aid=pl.find(p=>p.id==='aid');
  return[[tents.length+' / 3 çadır, birbirine değmiyor',apart],['İlk yardım yola bitişik',!!aid&&aid.x===6],['Su noktası kuruldu',pl.some(p=>p.id==='water')],['Kayıp aile noktası kuruldu',pl.some(p=>p.id==='lost')]];
}
function cmTray(d){
  const s=d.s,t=document.getElementById('cmT');if(!t)return;
  const ck=cmChecks(d),all=Object.keys(s.placed).length>=6;
  t.innerHTML='<h4>EŞYALAR</h4>'+s.items.map((i,n)=>'<button class="cm-it'+(s.sel===i.id?' sel':'')+'" data-i="'+i.id+'"'+(cmLeft(d,i.id)<=0?' disabled':'')+'><span>'+i.ic+'</span><b>'+i.n+'<small>'+i.w+'</small></b><kbd>'+(n+1)+'</kbd><i>×'+Math.max(0,cmLeft(d,i.id))+'</i></button>').join('')+
    '<h4 style="margin-top:6px">GÖREV LİSTESİ</h4><ul class="cm-ck">'+ck.map(c=>'<li class="'+(c[1]?'ok':'')+'"><span>'+(c[1]?'✓':'○')+'</span>'+c[0]+'</li>').join('')+'</ul>'+
    '<button class="btn primary cm-done'+(all?' ready':'')+'" id="cmDone">KURULUMU BİTİR <kbd>Enter</kbd></button>';
  t.querySelectorAll('.cm-it').forEach(b=>b.addEventListener('click',()=>{if(!d.running||d.done)return;s.sel=b.dataset.i;Sfx.click();cmTray(d);cmHints(d);}));
  t.querySelector('#cmDone').addEventListener('click',()=>{if(d.running&&!d.done)d.finish();});
}
function cmHints(d){
  const s=d.s;Object.keys(s.cells).forEach(k=>{const c=s.cells[k];c.classList.remove('good','near','best','cur');});
  const tents=Object.keys(s.placed).filter(k=>s.placed[k]==='tent').map(k=>k.split(',').map(Number));
  for(let y=0;y<s.H;y++)for(let x=0;x<s.W;x++){const k=x+','+y,c=s.cells[k];if(s.bld[k]||s.road[k]||s.danger[k]||s.placed[k])continue;
    if(!s.sel)continue;
    if(s.sel==='tent'&&tents.some(t=>Math.abs(t[0]-x)<=1&&Math.abs(t[1]-y)<=1))c.classList.add('near');
    else if(s.sel==='aid'&&x===6)c.classList.add('best');else c.classList.add('good');}
  const cc=s.cells[s.cx+','+s.cy];if(cc)cc.classList.add('cur');
}
function cmInfo(d){d.info('Yerleştirilen: <b>'+Object.keys(d.s.placed).length+' / 6</b>');}
function cmClick(d,x,y){
  const s=d.s;if(!d.running||d.done)return;const k=x+','+y,el=s.cells[k];
  if(s.placed[k]){delete s.placed[k];el.innerHTML='';el.classList.remove('pl');Sfx.drop();cmTray(d);cmInfo(d);cmHints(d);return;}
  if(!s.sel){d.hint('Önce sağdan bir eşya seç.',true);return;}
  if(s.bld[k]||s.road[k]){Sfx.nope();d.pop(el,'Buraya kurulmaz',false);return;}
  if(s.danger[k]){s.wrong++;d.shake();d.pop(el,'TEHLİKELİ ALAN!',false);d.hint('Kırmızı taralı alan: minare düşebilir, elektrik hattı var.',true);Sfx.nope();return;}
  const it=s.items.find(i=>i.id===s.sel);if(cmLeft(d,it.id)<=0){Sfx.nope();return;}
  if(it.id==='aid'&&x!==6)d.hint('İlk yardım yola bitişik sütunda (yeşil işaretli) olursa ambulans hemen ulaşır.',true);else d.hint('');
  s.placed[k]=it.id;el.innerHTML=it.ic;el.classList.add('pl');Sfx.pick();
  if(cmLeft(d,s.sel)<=0){const nx=s.items.find(i=>cmLeft(d,i.id)>0);s.sel=nx?nx.id:null;}
  cmTray(d);cmInfo(d);cmHints(d);
  if(Object.keys(s.placed).length>=6)d.hint('Hepsi kuruldu. Görev listesini kontrol et, sonra KURULUMU BİTİR (Enter).');
}

/* ---------- LİMAN: öncelikli tahliye sırası ----------
   Herkese yer var (9 kişi, 3 tekne × 3 yer): kimse açıkta kalmaz.
   Puan kaç kişinin bindiğine değil, SIRANIN doğruluğuna bağlıdır:
   yaralı → çocuk/yaşlı → sağlıklı. Her tekne dolunca kalkar; ilk kalkan ilk kurtulur. */
const LM_T={inj:{ty:'injured',n:'Yaralı',w:3},kid:{ty:'kid',n:'Çocuk',w:2},old:{ty:'old',n:'Yaşlı',w:2},ok:{ty:'adult',n:'Sağlıklı',w:1}};
const LM_N=9;
DRILLS.liman={icon:'anchor',title:'Öncelikli tahliye sırası',limit:55,
  sub:'Rıhtımdaki 9 kişinin hepsine yer var: 3 tekne × 3 yer. Sorun yer değil, SIRA: önce kim kalkmalı? Puan kaç kişinin bindiğine değil, önceliği doğru uygulayıp uygulamadığına göre verilir.',
  rules:['Önce bir <b>tekne seç</b>, sonra bekleyen kişilere tıkla: tekneye biner. Binmiş kişiye tıklarsan iner (tekne kalkmadıysa).','Sıra: <b>yaralı → çocuk ve yaşlı → sağlıklı</b>. Tekne <b>dolunca kalkar</b>; önce kalkan, önce kurtulur.','Herkes sonunda tahliye edilir. Bu oyun basitleştirilmiş bir plandır; gerçek tahliyede yetkililerin yönlendirmesini izle.'],
  learn:'Tahliyede önce yaralılara, sonra çocuklara ve yaşlılara öncelik verilir; sağlıklı kişiler en son çıkar. Amaç kimseyi geride bırakmamaktır: sakin ve kurallı bindirme hem hız hem güvenliktir.',
  build(d,st){
    st.innerHTML='<div class="lm"><div class="lm-quay"><small>İSKELE · 9 KİŞİ</small><div class="lm-ppl" id="lmP"></div></div><div class="lm-sea" id="lmB"></div></div>';
    const nInj=2+Math.floor(Math.random()*2),nKid=1+Math.floor(Math.random()*2),nOld=1+Math.floor(Math.random()*2);
    const types=drShuf([].concat(Array(nInj).fill('inj'),Array(nKid).fill('kid'),Array(nOld).fill('old'),Array(LM_N-nInj-nKid-nOld).fill('ok'))),ppl=[];
    const P=st.querySelector('#lmP');
    types.forEach((t,ti)=>{const p={t,boat:-1,el:$e('button','lm-p','<span>'+person(LM_T[t].ty,ti)+'</span><small>'+LM_T[t].n+'</small>')};P.appendChild(p.el);ppl.push(p);p.el.addEventListener('click',()=>lmClick(d,p));});
    const B=st.querySelector('#lmB'),boats=[];
    for(let i=0;i<3;i++){const b={i,left:false,order:-1,el:$e('div','lm-b','<div class="lm-hull">'+ico('boat')+'</div><div class="lm-seats"></div><small>Tekne '+(i+1)+' · 3 kişilik</small>')};B.appendChild(b.el);boats.push(b);b.el.addEventListener('click',()=>{if(!d.running||d.done||b.left)return;d.s.sel=i;lmBoats(d);Sfx.click();});}
    d.s={ppl,boats,sel:0,dep:0};lmBoats(d);
  },
  start(d){d.hint('Tekne seç → önce yaralıları bindir. Tekne dolunca kalkar.');d.info('Binen: <b>0 / '+LM_N+'</b>');},
  score(d){
    const s=d.s,idx=new Map();
    // Süre dolduysa kalanlar boş yerlere sırayla bindirilir (kimse açıkta kalmaz); sıra hatası olarak sayılır.
    const rem=s.boats.filter(b=>!b.left).map(b=>({b,n:s.ppl.filter(p=>p.boat===b.i).length})).sort((x,y)=>y.n-x.n||x.b.i-y.b.i);
    const cap={};rem.forEach((r,j)=>{r.b.tmp=s.dep+j;cap[r.b.i]=3-r.n;});
    s.ppl.forEach(p=>{if(p.boat>=0){const b=s.boats[p.boat];idx.set(p,b.left?b.order:b.tmp);}});
    const waiting=s.ppl.filter(p=>p.boat<0);
    waiting.forEach(p=>{const r=rem.find(x=>cap[x.b.i]>0);if(r){cap[r.b.i]--;idx.set(p,r.b.tmp);}else idx.set(p,s.dep+3);});
    let viol=0,pairs=0;
    for(let i=0;i<s.ppl.length;i++)for(let j=i+1;j<s.ppl.length;j++){
      const a=s.ppl[i],b=s.ppl[j],wa=LM_T[a.t].w,wb=LM_T[b.t].w;if(wa===wb)continue;pairs++;
      const hi=wa>wb?a:b,lo=wa>wb?b:a;if(idx.get(hi)>idx.get(lo))viol++;
    }
    const acc=pairs?1-viol/pairs:1,ratio=drClamp((acc-.5)/.5,0,1);
    const injLate=s.ppl.filter(p=>p.t==='inj'&&idx.get(p)>0).length;
    const midLate=s.ppl.filter(p=>LM_T[p.t].w===2&&s.ppl.some(q=>q.t==='ok'&&idx.get(q)<idx.get(p))).length;
    return{ratio,lines:[
      'Öncelik doğruluğu: %'+Math.round(acc*100)+(viol?' · '+viol+' sıra hatası':' · sıra bozulmadı ✓'),
      injLate?injLate+' yaralı ilk kalkan tekneye alınmadı; önce yaralılar kurtarılmalıydı.':'Yaralıların hepsi ilk kalkan teknedeydi ✓',
      midLate?midLate+' çocuk/yaşlı, sağlıklı bir yolcudan sonra kalktı.':'Çocuk ve yaşlılar sağlıklılardan önce kalktı ✓',
      waiting.length?'Süre doldu: bekleyenler sırayla bindirildi (kimse açıkta bırakılmaz).':'Herkes tahliye edildi: puan kişi sayısına değil, öncelik sırasına göre verilir.']};}
};
function lmBoats(d){
  const s=d.s;s.boats.forEach(b=>{
    const seats=b.el.querySelector('.lm-seats');seats.innerHTML='';
    s.ppl.filter(p=>p.boat===b.i).forEach(p=>seats.appendChild(p.el));
    for(let k=seats.children.length;k<3;k++)seats.appendChild($e('i','lm-seat',''));
    b.el.classList.toggle('sel',s.sel===b.i&&!b.left);b.el.classList.toggle('gone',b.left);
    b.el.querySelector(':scope > small').textContent='Tekne '+(b.i+1)+' · '+(b.left?(b.order+1)+'. kalkış':'3 kişilik');
  });
  s.ppl.filter(p=>p.boat<0).forEach(p=>document.getElementById('lmP').appendChild(p.el));
  const n=s.ppl.filter(p=>p.boat>=0).length;d.info('Binen: <b>'+n+' / '+LM_N+'</b>');
}
function lmClick(d,p){
  const s=d.s;if(!d.running||d.done)return;
  if(p.boat>=0){const b=s.boats[p.boat];if(b.left){Sfx.nope();return;}p.boat=-1;Sfx.drop();lmBoats(d);return;}
  let b=s.boats[s.sel];if(b.left||s.ppl.filter(q=>q.boat===b.i).length>=3){b=s.boats.find(x=>!x.left&&s.ppl.filter(q=>q.boat===x.i).length<3);if(!b){Sfx.nope();return;}s.sel=b.i;}
  p.boat=b.i;Sfx.pick();lmBoats(d);
  if(s.ppl.filter(q=>q.boat===b.i).length>=3){
    if(b.departing)return;b.departing=true;
    d.later(500,()=>{b.departing=false;const crew=s.ppl.filter(q=>q.boat===b.i);if(crew.length<3||b.left)return;
      b.left=true;b.order=s.dep++;b.el.classList.add('gone');Sfx.win();
      const top=Math.max.apply(null,s.ppl.filter(q=>!(q.boat>=0&&s.boats[q.boat].left)).map(q=>LM_T[q.t].w).concat([0])),mine=Math.min.apply(null,crew.map(q=>LM_T[q.t].w));
      if(top>mine&&crew.some(q=>LM_T[q.t].w<top))d.hint('Bu tekne kalktı ama içinde daha düşük öncelikli biri vardı; bekleyen daha öncelikli kişiler var.',true);
      else d.hint('Doğru sıra: tekne kalktı.');
      const nb=s.boats.find(x=>!x.left);if(nb)s.sel=nb.i;lmBoats(d);
      if(s.boats.every(x=>x.left))d.later(500,()=>d.finish());});
  }
}

/* =========================================================
   ÖNLEM MİNİ OYUNLARI (12-24 sn) — açık kalan riski kapatan doğru önlemi uygula
   Hiçbiri söndürme/müdahale değil: hepsi deprem ÖNCESİ hazırlık.
   ========================================================= */

/* ---------- deprem sonrası yangın riski: devrilen ısıtıcı, dökülen yanıcı, elektrik ---------- */
DRILLS['hz:yangin']={icon:'plug',title:'Deprem sonrası yangın önlemi',limit:28,
  hint:'Depremde devrilip yangın çıkaracak riskli öğeleri bul ve önlemini uygula. Sağlam öğelere dokunma.',
  build(d,st){
    const risky=drFresh('yf-risk',[['Duvara sabitlenmemiş elektrikli ısıtıcı','flame','Duvara sabitlendi'],['Rafta duran yanıcı sıvılar','cup','Alt rafa indirildi'],['Deprem şalteri olmayan pano','cable','Otomatik şalter takıldı'],['Prize yığılmış uzatma kabloları','plug','Yük dağıtıldı'],['Isı kaynağı yanında sprey kutuları','cylinder','Güvenli dolaba kondu'],['Sabitlenmemiş yakıt bidonu','fuel','Bidon sabitlendi']],3);
    const safe=drFresh('yf-safe',[['Alçak, sabitlenmiş kitaplık','brick'],['Yerinde yangın söndürücü','extinguisher'],['Duvara monte sabit lamba','bulb'],['Metal kapaklı sigorta kutusu','lock'],['Topraklı tek cihaz prizi','plug'],['Kapalı, sabit yakıt dolabı','shield']],3);
    st.innerHTML='<div class="mz"><div class="tg" id="tgG"></div><div id="tgQ"></div></div>';
    const G=st.querySelector('#tgG'),items=[];
    drShuf(risky.map(r=>({n:r[0],ic:r[1],fix:r[2],bad:true})).concat(safe.map(s=>({n:s[0],ic:s[1],bad:false})))).forEach(o=>{
      o.el=$e('button','tg-t'+(o.bad?' risk':''),'<span class="ti">'+ico(o.ic)+'</span><b>'+o.n+'</b><small>'+(o.bad?'riskli':'sağlam')+'</small>'+(o.bad?'<i class="ov">'+ico('bolt')+'</i>':''));
      G.appendChild(o.el);items.push(o);o.el.addEventListener('click',()=>yfClick(d,o));});
    d.s={items,fixed:0,wrong:0,det:false,phase:1};
  },
  start(d){d.info('Giderilen: <b>0 / 3</b>');},
  score(d){const s=d.s,ok=s.fixed>=3&&s.det;return{ok,ratio:ok?drClamp(1-d.t/d.limit*.6-s.wrong*.1,.2,1):s.fixed/3*.3,lines:[ok?'Üç riski giderdin ve deprem sonrası elektriği doğru kesmeyi öğrendin.':s.fixed<3?'Süre doldu: '+s.fixed+' / 3 risk giderildi.':'Elektriği doğru kesemedin: deprem sonrası önce ana şalter kapatılır.',s.wrong?s.wrong+' yanlış hamle yaptın.':'Hiç gereksiz müdahale yok.']};}
};
function yfClick(d,o){
  const s=d.s;if(!d.running||d.done||s.phase!==1||o.done)return;
  if(o.bad){o.done=true;s.fixed++;o.el.classList.add('fx');o.el.querySelector('small').textContent=o.fix;const ov=o.el.querySelector('.ov');if(ov)ov.remove();d.pop(o.el,'Giderildi','good');Sfx.fix();d.info('Giderilen: <b>'+s.fixed+' / 3</b>');
    if(s.fixed>=3)d.later(450,()=>yfPhase2(d));}
  else{s.wrong++;d.t+=1.5;d.shake();d.pop(o.el,'Sağlam! −1.5 sn',false);Sfx.nope();}
}
function yfPhase2(d){
  const s=d.s;s.phase=2;const g=document.getElementById('tgG'),q=document.getElementById('tgQ');if(!g||!q)return;g.style.display='none';
  d.hint('Son soru: depremden sonra elektriği nasıl kesersin?');
  q.innerHTML='<h3 class="tg-q">Depremden sonra elektriği nasıl kesersin?</h3><div class="tg-opts"></div>';
  [['Ana şalterden, kuru elle','Tek hamleyle tüm evin elektriği kesilir.',true],['Tüm cihazları tek tek çekerek','Çok yavaş; hasarlı kabloya yaklaşırsın.',false],['Hasarlı kabloyu elle kontrol ederek','Elektrik çarpar!',false]].forEach(o=>{
    const b=$e('button','tg-o','<span>'+ico('bolt')+'</span><b>'+o[0]+'</b>');q.querySelector('.tg-opts').appendChild(b);
    b.addEventListener('click',()=>{if(!d.running||d.done)return;if(o[2]){s.det=true;b.classList.add('ok');Sfx.fix();d.later(450,()=>d.finish());}else{s.wrong++;d.shake();Sfx.nope();d.pop(b,o[1],false);b.disabled=true;}});});
}

/* ---------- gaz riski: tüp ve tesisat güvenliği ---------- */
DRILLS['hz:gaz']={icon:'cylinder',title:'Deprem sonrası gaz önlemi',limit:40,
  hint:'Depremde tüp devrilir, hortum kopar. Sırayla: kaçağı güvenli ara, onar, sabitle, otomatik vana tak. Açık alev yok!',
  build(d,st){
    st.innerHTML='<div class="mz"><div class="mz-gas"><small>GÜVENLİK SEVİYESİ</small><div class="gas-bar"><i class="sf" id="mzG" style="width:0%"></i></div></div><div class="mz-steps" id="mzS"></div><div class="mz-btns" id="mzB"></div></div>';
    const boom=drShuf([['Çakmak yakarak kaçak ara','flame',-1],['Kibrit çakarak kaçak ara','flame',-1]])[0];
    const decoys=drFresh('gz-decoy',[['Tüpü yüksek rafa kaldır','box',-2],['Hortumu eski haliyle bırak','cross',-3],['Tüpü kapalı dolaba kilitle','lock',-4],['Sızıntıyı bez parçasıyla sar','spool',-5]],2);
    const acts=[['Hortumu sabunlu suyla kontrol et','drop',0],['Çatlak hortumu yenisiyle değiştir','wrench',1],['Tüpü zincirle duvara sabitle (devrilmesin)','lock',2],['Deprem sensörlü otomatik gaz vanası tak','valve',3],boom].concat(decoys);
    const why={'-2':'Yüksekteki tüp devrilirse daha tehlikeli.','-3':'Eski hortum depremde çatlayıp sızdırır.','-4':'Kapalı dolapta gaz birikir; havalandırma şart.','-5':'Bez sızıntıyı kapatmaz; hortum değişmeli.'};
    d.s={step:0,wrong:0,boom:false};
    const B=st.querySelector('#mzB');
    drShuf(acts).forEach(a=>{const b=$e('button','mz-b','<span>'+ico(a[1])+'</span><b>'+a[0]+'</b>');B.appendChild(b);b.addEventListener('click',()=>{
      if(!d.running||d.done)return;
      if(a[2]===d.s.step){d.s.step++;b.classList.add('ok');b.disabled=true;Sfx.pick();gzSteps(d);if(d.s.step>=4){Sfx.safe();d.finish();}}
      else if(a[2]===-1){d.s.boom=true;Sfx.explode();d.pop(b,'Açık alev gazı tutuşturur!',false);d.later(150,()=>d.finish());}
      else{d.s.wrong++;d.t+=1.5;d.shake();Sfx.nope();d.pop(b,a[2]<0?why[String(a[2])]:'Yanlış sıra!',false);}
    });});
    gzSteps(d);
  },
  score(d){const s=d.s,ok=s.step>=4&&!s.boom;return{ok,ratio:ok?drClamp(1-d.t/d.limit*.6-s.wrong*.1,.2,1):s.step/4*.3,lines:[s.boom?'Gaz kaçağı asla çakmakla aranmaz: sabunlu su köpürerek kaçağı gösterir.':ok?'Kontrol et, onar, sabitle, otomatik vana tak: depreme karşı doğru önlem sırası.':'Süre doldu: gaz güvenliği tamamlanmadı.']};}
};
function gzSteps(d){const e=document.getElementById('mzS'),g=document.getElementById('mzG');if(g)g.style.width=(d.s.step/4*100)+'%';
  if(e)e.innerHTML=['KONTROL','ONAR','SABİTLE','VANA'].map((t,i)=>'<span class="'+(i<d.s.step?'on':'')+'">'+(i+1)+' '+t+'</span>').join('');}

/* ---------- bilgi kirliliği riski: resmî kaynak mı, söylenti mi? ---------- */
const NW_OK=[['Belediye: Toplanma alanı haritası resmî sayfada yayımlandı.','Belediye · resmî sayfa'],['Sivil Savunma: Aile afet planı rehberi resmî sayfadan indirilebilir.','Sivil Savunma · örnek duyuru'],['Elektrik idaresi: Planlı kesinti duyuruları yalnız resmî kanaldan yapılır.','Elektrik idaresi · örnek duyuru'],['Sivil Savunma: Toplanma alanları belediyenin duyurduğu noktalardır.','Sivil Savunma · resmî duyuru'],['Belediye: Su dağıtım noktaları resmî sayfada yayımlandı.','Belediye · resmî sayfa'],['Eğitim yetkilileri: Okullar güvenlik değerlendirmesinden sonra açılacak.','Eğitim yetkilileri · örnek duyuru'],['Sağlık yetkilileri: Acil olmayan durumlarda acil hattı meşgul etmeyin.','Sağlık yetkilileri · resmî duyuru'],['Deprem izleme birimi: Artçı sarsıntılar olağandır, bültenleri izleyin.','Deprem izleme birimi · bülten']];
const NW_BAD=[['Su şebekesine zehir karıştırıldı, musluktan su içmeyin!','Kaynak: isimsiz paylaşım'],['Bu gece 03:00’te ikinci büyük deprem kesin!','Kaynak: yok'],['Hayvanlar kaçıyor, bu bir deprem işareti: hemen evi terk edin!','Kaynak: sosyal medya videosu'],['Bu mesajı 10 kişiye ilet, deprem durur!','Kaynak: zincir mesaj'],['Bir medyum bu gece daha büyüğünün geleceğini söyledi.','Kaynak: sosyal medya videosu'],['Adanın yarısı sular altında kalacak, hemen kaçın!','Kaynak: yok'],['Barajlar çatladı! Arkadaşımın kuzeni söyledi.','Kaynak: "bir tanıdık"'],['Resmî kurum yazıyor: Yarın saat 15:00 büyük deprem!','Kaynak: bağlantı ve tarih yok']];
DRILLS['hz:panik']={icon:'megaphone',title:'Deprem söylentisi ayıklama',limit:36,
  hint:'Bunlar kurmaca örnek mesajlardır. Depremin zamanı önceden bilinemez. Kaynağa bak: resmî kanal mı, söylenti mi?',
  build(d,st){
    st.innerHTML='<div class="mz nw"><div class="nw-prog" id="nwP"></div><div class="nw-card" id="nwC"></div><div class="nw-btns"><button class="nw-b ok" data-v="1">'+ico('shield')+' Resmî kaynak</button><button class="nw-b no" data-v="0">'+ico('warn')+' Asılsız / doğrulanmamış</button></div></div>';
    const cards=drShuf(drFresh('nw-ok',NW_OK,4).map(c=>({t:c[0],s:c[1],ok:true})).concat(drFresh('nw-bad',NW_BAD,4).map(c=>({t:c[0],s:c[1],ok:false}))));
    d.s={cards,i:0,right:0,wrong:0};
    st.querySelectorAll('.nw-b').forEach(b=>b.addEventListener('click',()=>nwAnswer(d,b)));
    nwShow(d);
  },
  score(d){const s=d.s,ok=s.right>=6;return{ok,ratio:s.right/8,lines:[s.right+' / 8 mesajı doğru ayırdın.',ok?'Resmî kaynakları söylentilerden ayırdın. Unutma: depremin zamanı önceden bilinemez.':'Doğrulanmamış "deprem tahmini" mesajları paniği büyütür: kaynağı kontrol etmeden paylaşma.']};}
};
function nwShow(d){
  const s=d.s,c=document.getElementById('nwC'),p=document.getElementById('nwP');if(!c)return;
  p.innerHTML=s.cards.map((x,i)=>'<i class="'+(i<s.i?(x.res?'ok':'no'):i===s.i?'cur':'')+'"></i>').join('');
  const k=s.cards[s.i];c.innerHTML=k?'<span class="nw-ic">'+ico('phone')+'</span><p>'+k.t+'</p><small>'+k.s+'</small>':'';
  d.info('Doğru: <b>'+s.right+'</b> / 8');
}
function nwAnswer(d,b){
  const s=d.s;if(!d.running||d.done)return;const k=s.cards[s.i];if(!k)return;
  const right=(b.dataset.v==='1')===k.ok;k.res=right;
  if(right){s.right++;Sfx.fix();d.pop(document.getElementById('nwC'),'Doğru','good');}else{s.wrong++;Sfx.nope();d.pop(document.getElementById('nwC'),k.ok?'Bu resmî kaynaktı':'Bu söylentiydi',false);}
  s.i++;if(s.i>=s.cards.length){nwShow(d);d.later(400,()=>d.finish());}else nwShow(d);
}

/* ---------- tıkalı tahliye yolu: engelleri kaldır, acil ekipmana dokunma ---------- */
DRILLS['hz:yol']={icon:'barrier',title:'Tahliye yolunu aç',limit:25,
  hint:'Deprem tahliyesi için yolu aç: tıkayan eşyayı kaldır. Tabela, söndürücü ve dolap gibi acil durum ekipmanı yerinde KALMALI.',
  build(d,st){
    st.innerHTML='<div class="mz"><div class="cr-road" id="crR"></div><p class="mz-note">Acil durum ekipmanı yola değil, duvara aittir: onları yerinde bırak.</p></div>';
    const blockers=drFresh('yl-block',[['Kutular','box'],['Park halindeki araç','truck'],['Seyyar tezgâh','cart'],['Beton saksı','brick'],['Eski dolap','box'],['Moloz torbaları','rubble'],['Devrik büfe','shop'],['Motosiklet sırası','truck'],['İnşaat çuvalları','brick']],4);
    const keep=drFresh('yl-keep',[['Çıkış tabelası','door'],['Yangın söndürücü','extinguisher'],['İlk yardım dolabı','firstaid'],['Toplanma alanı yön tabelası','map']],3);
    const items=drShuf(blockers.map(b=>({n:b[0],ic:b[1],block:true})).concat(keep.map(k=>({n:k[0],ic:k[1],block:false}))));
    const R=st.querySelector('#crR');
    items.forEach(o=>{o.el=$e('button','cr-i'+(o.block?' bl':' kp'),'<span>'+ico(o.ic)+'</span><b>'+o.n+'</b><small>'+(o.block?'yolu tıkıyor':'acil ekipman')+'</small>');R.appendChild(o.el);
      o.el.addEventListener('click',()=>{
        if(!d.running||d.done||o.gone)return;
        if(o.block){o.gone=true;o.el.classList.add('gone');d.s.cleared++;Sfx.pick();crInfo(d);if(d.s.cleared>=4)d.later(450,()=>d.finish());}
        else{d.s.wrong++;d.t+=1.5;d.shake();Sfx.nope();d.pop(o.el,'Acil ekipman yerinde kalmalı! −1.5 sn',false);}});});
    d.s={items,cleared:0,wrong:0};
  },
  start(d){crInfo(d);},
  score(d){const s=d.s,ok=s.cleared>=4;return{ok,ratio:ok?drClamp(1-d.t/d.limit*.6-s.wrong*.1,.2,1):s.cleared/4*.3,lines:[ok?'Tahliye yolu açıldı: engeller kaldırıldı, acil ekipman yerinde.':'Süre doldu: yolda '+(4-s.cleared)+' engel kaldı.',s.wrong?s.wrong+' kez acil ekipmana dokundun.':'Acil ekipmana dokunmadın.']};}
};
function crInfo(d){d.info('Kalan engel: <b>'+(4-d.s.cleared)+'</b>');}

/* ---------- zayıf yapı: BETON LABORATUVARI — doğru reçete + hava boşluklarını sıkıştır ---------- */
DRILLS['hz:su']={icon:'houses',title:'Beton laboratuvarı',limit:56,
  hint:'1) Kum kaynağını ve reçeteyi ayarla: DAYANIM göstergesi yeşile girip sabit kalsın. 2) Dökülen betondaki hava boşluklarını vibratörle sıkıştır.',
  build(d,st){
    st.innerHTML='<div class="lab"><div class="lab-st" id="labSt"><span class="on">1 · Reçeteyi ayarla</span><span>2 · Vibratörle sıkıştır</span></div>'+
      '<div class="lab-mix" id="labMix"><div class="lab-drum"><div class="drum" id="labD"><i></i><i></i><i></i></div><b>BETON KARIŞTIRICI</b></div>'+
      '<div class="lab-ctl"><div class="lab-sand"><b>KUM KAYNAĞI</b><button class="on" data-s="sea">Deniz kumu<small>tuzlu, ucuz</small></button><button data-s="river">Yıkanmış dere kumu<small>temiz, tuzsuz</small></button></div>'+
      '<label>ÇİMENTO <output id="labCo">250</output> kg/m³<input type="range" id="labC" min="200" max="500" step="10" value="250"></label>'+
      '<label>SU <output id="labWo">220</output> L/m³<input type="range" id="labW" min="100" max="260" step="5" value="220"></label>'+
      '<div class="lab-wc" id="labWc"></div></div>'+
      '<div class="lab-gauge"><b>DAYANIM</b><div class="gz"><i class="band"></i><i class="fill" id="labF"></i></div><span id="labS">0</span><small id="labT"></small></div></div>'+
      '<div class="lab-slab" id="labSlab" hidden><p>Beton döküldü! İçinde hava boşlukları var: vibratörü (fareyi) her boşluğun üstünde bir an tut.</p><div class="slab" id="labP"></div></div></div>';
    const s={sand:'sea',c:250,w:220,hold:0,phase:1,bubbles:[],px:-99,py:-99,popped:0,total:9,str:0,sandMiss:true,wcFinal:0};d.s=s;
    st.querySelectorAll('.lab-sand button').forEach(b=>b.addEventListener('click',()=>{if(!d.running||d.done||s.phase!==1)return;s.sand=b.dataset.s;st.querySelectorAll('.lab-sand button').forEach(x=>x.classList.toggle('on',x===b));Sfx.pick();if(s.sand==='river')s.sandMiss=false;}));
    const cI=st.querySelector('#labC'),wI=st.querySelector('#labW');
    cI.addEventListener('input',()=>{s.c=+cI.value;st.querySelector('#labCo').textContent=s.c;});wI.addEventListener('input',()=>{s.w=+wI.value;st.querySelector('#labWo').textContent=s.w;});
    const P=st.querySelector('#labP');
    P.addEventListener('pointermove',e=>{const p=dxPt(P,e);s.px=p.x;s.py=p.y;});P.addEventListener('pointerleave',()=>{s.px=-99;s.py=-99;});
  },
  start(d){labGauge(d);},
  tick(d,dt){
    const s=d.s;if(s.phase===1){
      labGauge(d);
      const good=s.str>=88;s.hold=good?s.hold+dt:Math.max(0,s.hold-dt*2);
      const dm=document.getElementById('labD');if(dm)dm.style.animationDuration=(2.2-Math.min(1.5,s.str/70))+'s';
      if(s.hold>=1.4){s.phase=2;s.wcFinal=s.w/s.c;Sfx.win();d.hint('Reçete onaylandı! Şimdi betonu sıkıştır.',false);
        document.getElementById('labMix').hidden=true;document.getElementById('labSlab').hidden=false;document.querySelectorAll('#labSt span').forEach((e,i)=>{e.classList.toggle('done',i===0);e.classList.toggle('on',i===1);});
        const P=document.getElementById('labP'),W=P.offsetWidth,H=P.offsetHeight;
        for(let i=0;i<s.total;i++){let x,y,ok;let n=0;do{x=40+Math.random()*(W-80);y=40+Math.random()*(H-80);ok=s.bubbles.every(b=>Math.hypot(b.x-x,b.y-y)>80);n++;}while(!ok&&n<60);
          const el=$e('div','bub','<i></i>');el.style.left=x+'px';el.style.top=y+'px';P.appendChild(el);s.bubbles.push({x,y,el,p:0,done:false});}
        d.info('Boşluk: <b>0 / '+s.total+'</b>');}
    }else{
      const P=document.getElementById('labP');
      let any=false;for(const b of s.bubbles){if(b.done)continue;
        if(Math.hypot(b.x-s.px,b.y-s.py)<46){b.p+=dt/.55;any=true;b.el.style.setProperty('--p',Math.min(1,b.p));b.el.classList.add('vib');
          if(b.p>=1){b.done=true;s.popped++;b.el.classList.remove('vib');b.el.classList.add('pop');Sfx.build(s.popped,Math.min(4,s.popped));d.pop(b.el,'Sıkıştı',true);d.info('Boşluk: <b>'+s.popped+' / '+s.total+'</b>');
            if(s.popped>=s.total){d.hint('Beton sıkıştırıldı: yoğun, boşluksuz, dayanıklı.',false);d.later(900,()=>d.finish());}}}
        else{b.p=Math.max(0,b.p-dt*.8);b.el.style.setProperty('--p',b.p);b.el.classList.remove('vib');}}
    }
  },
  score(d){const s=d.s,ok=s.phase===2&&s.popped>=s.total;
    return{ok,ratio:ok?drClamp(.55+.35*(1-d.t/d.limit)+.1,.55,1):s.phase===2?s.popped/s.total*.35:.1,lines:[s.phase>=2?'Su/çimento oranı '+s.wcFinal.toFixed(2)+': beton için ideal oran 0,40–0,55.':'Doğru reçete bulunamadı: fazla su betonu zayıflatır.',s.sandMiss?'Deniz kumunu kullanma: tuz donatıyı çürütür.':'Yıkanmış kum seçtin: tuz ve kil içermez.',s.phase===2?s.popped+' / '+s.total+' hava boşluğu sıkıştırıldı.':'Beton henüz dökülemedi.',ok?'Kaliteli beton: doğru reçete, temiz kum, sıkıştırma.':'Betonun kalitesi tamamlanamadı.']};}
};
function labGauge(d){
  const s=d.s,wc=s.w/s.c;let f=Math.min(1,s.c/340);
  if(wc>.55)f*=Math.max(.15,1-(wc-.55)*2.3);else if(wc<.38)f*=Math.max(.4,1-(.38-wc)*3);
  if(s.sand==='sea')f=Math.min(f,.42);
  s.str=Math.round(f*100);
  const F=document.getElementById('labF'),T=document.getElementById('labS'),W=document.getElementById('labWc'),M=document.getElementById('labT');if(!F)return;
  F.style.setProperty('--h',s.str+'%');F.classList.toggle('ok',s.str>=88);T.textContent=s.str;
  W.innerHTML='Su/çimento oranı: <b class="'+(wc>.55?'bad':wc<.38?'warn':'ok')+'">'+wc.toFixed(2)+'</b> <small>(ideal 0,40–0,55)</small>';
  M.textContent=s.sand==='sea'?'Tuzlu kum donatıyı çürütür: dayanım sınırlı.':wc>.55?'Çok su: beton gevşek ve gözenekli olur.':s.c<320?'Çimento az: dayanım düşük.':wc<.38?'Su az: beton işlenemez.':'Reçete iyi: sabit tut!';
  d.info('Dayanım: <b>'+s.str+'</b>');
}


/* =========================================================
   ACİL RİSK VARYANTLARI — her tehlike türü 3 farklı mini oyunla gelir:
   (klasik) · :q bilgi sorusu (3 soru) · :o doğru sırayı kur
   Seçici (ctPickVariant) aynı türü/varyantı kampanyada tekrarlamamaya çalışır.
   ========================================================= */
const QZ_POOL={
  panik:[
    {q:'Telefonuna "bu gece büyük deprem olacak" mesajı geldi. Ne yaparsın?',o:['Resmî kurum sayfasından doğrularım, iletmem','Hemen 10 kişiye iletirim','Evden çıkıp sabaha kadar dışarıda beklerim'],why:'Depremin zamanı önceden bilinemez; doğrulanmamış mesaj paniği büyütür.'},
    {q:'Depremin ne zaman olacağı önceden bilinebilir mi?',o:['Hayır, bilinemez','Evet, hayvanların davranışı gösterir','Evet, bazı kişiler kesin tarih verebilir'],why:'Bilimsel olarak deprem zamanı önceden kesin söylenemez.'},
    {q:'Resmî duyuruları nereden takip edersin?',o:['Belediye ve Sivil Savunma\'nın resmî kanallarından','Tanıdığın birinin paylaşımından','Kaynağı belirsiz videolardan'],why:'Resmî kanallar doğrulanmış bilgi verir.'},
    {q:'Bir mesajın güvenilir olduğunu en iyi ne gösterir?',o:['Kaynağı, tarihi ve resmî bağlantısı olması','Çok kez paylaşılmış olması','Büyük harflerle yazılmış olması'],why:'Çok paylaşılması doğruluk kanıtı değildir.'}],
  gaz:[
    {q:'Evde gaz kokusu aldın. İlk hamlen ne olmalı?',o:['Pencereleri açıp vanayı kapatır, binayı terk ederim','Işığı açıp kokunun yerini ararım','Çakmak yakıp kaçağı ararım'],why:'Kıvılcım gazı tutuşturabilir: ışığa ve anahtara dokunma.'},
    {q:'Gaz kaçağı yeri nasıl aranır?',o:['Sabunlu suyla; köpürme kaçağı gösterir','Çakmak alevi yaklaştırarak','Hortuma yüzünü yaklaştırarak'],why:'Açık alevle kaçak aranmaz; sabunlu su güvenlidir.'},
    {q:'Gaz vanasının yerini kim bilmeli?',o:['Evdeki herkes ve nasıl kapatılacağını','Yalnız evin büyüğü','Kimsenin bilmesine gerek yok'],why:'Acil durumda en yakın kişi vanayı kapatabilmeli.'},
    {q:'Gaz kokusu varken cep telefonuyla arama yapmak için en doğrusu?',o:['Evden uzaklaştıktan sonra aramak','Hemen içeride aramak','Kokuyu tam anlamak için içeride beklemek'],why:'Elektronik cihazlar kıvılcım çıkarabilir; önce uzaklaş.'}],
  yangin:[
    {q:'Elektrik yangınında önce ne yaparsın?',o:['Elektriği keserim','Üzerine su dökerim','Prize elle dokunup bakarım'],why:'Önce elektriği kes; sonra uygun söndürücü kullan.'},
    {q:'Elektrikli cihaz yangınına su dökmek…',o:['Yapılmaz: elektrik çarpabilir','Güvenlidir','Yangını en hızlı söndürür'],why:'Su elektriği iletir ve çarpılma riski yaratır.'},
    {q:'Yangın büyüyor. Ne yaparsın?',o:['Söndürmeyi bırakır, çıkar ve yetkilileri ararım','Tek başıma söndürmeye devam ederim','Odaya kapanıp beklerim'],why:'Büyüyen yangında can güvenliği her şeyden önce gelir.'},
    {q:'Yangın söndürücü nerede bulunmalı?',o:['Kolay ulaşılır yerde; herkes kullanmayı bilmeli','Dolabın en dibinde','Kilitli odada'],why:'Söndürücü ancak ulaşılırsa ve kullanmayı bilirsen işe yarar.'}],
  yol:[
    {q:'Çıkış yolunda eşya var. Ne yaparsın?',o:['Kaldırır, yolu açık tutarım','Üzerinden atlayıp geçerim','Görmezden gelirim'],why:'Tıkalı yol tahliyeyi ve yardım ekiplerini geciktirir.'},
    {q:'Acil çıkış tabelasının önüne dolap konabilir mi?',o:['Hayır; tabela görünür, çıkış açık kalmalı','Evet, geçici ise olur','Evet, güzel görünüyorsa'],why:'Çıkış işaretleri ve yolları her zaman açık olmalı.'},
    {q:'Kalabalık tahliyede nasıl hareket edilir?',o:['Sakin ve sırayla','Koşarak ve iterek','Herkesten önce çıkmaya çalışarak'],why:'İzdiham yaralanmaların başlıca sebebidir.'},
    {q:'Deprem sonrası binadan çıkarken asansör?',o:['Kullanılmaz; merdiven tercih edilir','Hızlı olduğu için kullanılır','Yalnız kalabalıksa kullanılır'],why:'Elektrik kesilirse asansörde mahsur kalırsın.'}],
  su:[
    {q:'Bir bina için en güvenli zemin hangisidir?',o:['Sağlam, sıkı zemin (kaya, sıkı çakıl-kil)','Eski dere yatağı dolgusu','Gevşek kum ve yüksek yeraltı suyu'],why:'Gevşek ve dolgu zeminler sarsıntıyı büyütür, binayı oturtur.'},
    {q:'Betonda kullanılan kum neden temiz ve yıkanmış olmalı?',o:['Tuz ve kil betonu zayıflatır, donatıyı paslandırır','Sadece renk için','Önemi yoktur'],why:'Deniz kumu ve kil betonun dayanımını düşürür.'},
    {q:'Deprem yönetmeliğine uygun binada hangisi doğrudur?',o:['Etriyeler sık aralıklı ve kancalı olur','Salon büyüsün diye kolon kesilir','Ruhsatsız ek kat çıkılır'],why:'Sık etriye kolonu sarar ve çökmeyi geciktirir.'},
    {q:'Yapı denetimi ve ruhsat neden önemlidir?',o:['Zemin ve malzeme kalitesini bağımsız olarak kontrol eder','Sadece vergi toplamak içindir','Sadece dış görünüş içindir'],why:'Denetimsiz yapı gizli kusurlarla depreme girer.'}]
};
const OR_POOL={
  gaz:[{t:'Gaz kokusunda doğru sıra',s:['Pencereleri aç','Ana gaz vanasını kapat','Anahtara dokunmadan binayı terk et','Uzaklaşınca yetkilileri ara']},{t:'Tüp güvenliği sırası',s:['Hortumu sabunlu suyla kontrol et','Çatlak hortumu değiştir','Tüpü duvara sabitle','Otomatik gaz vanası tak']}],
  yangin:[{t:'Elektrik yangını sırası',s:['Ana şalterden elektriği kes','Uygun söndürücüyü hazırla','Küçükse söndürmeyi dene','Büyürse çık ve yetkilileri ara']},{t:'Yangın önleme sırası',s:['Priz yükünü azalt','Isıtıcıyı sabitle','Yanıcıları alt rafa koy','Deprem şalteri tak']}],
  panik:[{t:'Söylenti ayıklama sırası',s:['Mesajın kaynağına bak','Resmî kanaldan doğrula','Doğrulanmadıysa paylaşma','Doğru bilgiyi çevrene ilet']},{t:'Aile iletişim planı sırası',s:['Aile afet planı yap','Buluşma noktasını belirle','Pilli radyo hazırla','Resmî kanalları not al']}],
  yol:[{t:'Yolu açma sırası',s:['Yolu tıkayanları belirle','Ağır eşyayı birlikte kaldır','Yolu tamamen boşalt','Acil ekipmanı yerinde bırak']},{t:'Tahliye planı sırası',s:['Alternatif çıkışı belirle','Rota işaretlerini as','Aileyle yolu birlikte yürü','Tatbikatı tekrarla']}],
  su:[{t:'Güvenli yapı için doğru sıra',s:['Zemin etüdü yaptır','Zemine uygun proje çiz','Kaliteli beton ve donatı kullan','Yapı denetimiyle inşa et']},{t:'Eski yapıyı güçlendirme sırası',s:['Binanın riskini ölçtür','Güçlendirme projesi hazırlat','Uzman ekiple uygula','Denetle ve belgele']}]
};
const HZ_ICON={panik:'megaphone',gaz:'cylinder',yangin:'plug',yol:'barrier',su:'houses'};
const HZ_NAME={panik:'Deprem söylentisi',gaz:'Gaz güvenliği',yangin:'Yangın güvenliği',yol:'Tahliye yolu',su:'Yapı güvenliği'};

Object.keys(QZ_POOL).forEach(hz=>{
  DRILLS['hz:'+hz+':q']={icon:HZ_ICON[hz],title:HZ_NAME[hz]+': bilgi sorusu',limit:40,
    hint:'3 soruyu yanıtla; en az 2 doğru yeterli. Yanlış cevap 1,5 sn götürür.',
    build(d,st){
      const qs=drFresh('qz-'+hz,QZ_POOL[hz],3).map(q=>({q:q.q,why:q.why,opts:drShuf(q.o.map((t,i)=>({t,ok:i===0})))}));
      st.innerHTML='<div class="mz qz"><div class="qz-prog" id="qzP"></div><h3 class="tg-q" id="qzQ"></h3><div class="tg-opts qz-opts" id="qzO"></div></div>';
      d.s={qs,i:0,right:0,wrong:0};qzShow(d);
    },
    score(d){const s=d.s,ok=s.right>=2;return{ok,ratio:ok?drClamp(.55+s.right/3*.45-d.t/d.limit*.2,.55,1):s.right/3*.4,lines:[s.right+' / 3 soruyu doğru yanıtladın.',ok?'Doğru bilgi, acil durumda doğru kararı verir.':'Bu konuda bilgini tazele: yanlış bilgi riski büyütür.']};}
  };
  DRILLS['hz:'+hz+':o']={icon:HZ_ICON[hz],title:HZ_NAME[hz]+': doğru sıra',limit:36,
    hint:'Adımları doğru sırayla seç: 1 → 4. Yanlış adım 1,5 sn götürür.',
    build(d,st){
      const sc=drFresh('or-'+hz,OR_POOL[hz],1)[0];
      st.innerHTML='<div class="mz or"><h3 class="tg-q">'+sc.t+'</h3><div class="or-prog" id="orP"></div><div class="or-list" id="orL"></div></div>';
      const L=st.querySelector('#orL'),steps=sc.s.map((t,i)=>({t,i,el:null}));
      drShuf(steps).forEach(o=>{o.el=$e('button','or-b','<em>?</em><b>'+o.t+'</b>');L.appendChild(o.el);o.el.addEventListener('click',()=>orClick(d,o));});
      d.s={steps,next:0,wrong:0};orInfo(d);
    },
    score(d){const s=d.s,ok=s.next>=4;return{ok,ratio:ok?drClamp(1-d.t/d.limit*.5-s.wrong*.1,.4,1):s.next/4*.4,lines:[s.next+' / 4 adımı doğru sırayla yaptın.',s.wrong?s.wrong+' kez yanlış sırada seçtin.':'Hiç yanlış adım yok.',ok?'Doğru sıra, hem hız hem güvenliktir.':'Süre doldu: sıra tamamlanmadı.']};}
  };
});
function qzShow(d){
  const s=d.s,q=s.qs[s.i];if(!q)return;
  document.getElementById('qzP').innerHTML=s.qs.map((x,i)=>'<i class="'+(i<s.i?(x.res?'ok':'no'):i===s.i?'cur':'')+'"></i>').join('');
  document.getElementById('qzQ').textContent=q.q;
  const O=document.getElementById('qzO');O.innerHTML='';
  q.opts.forEach(o=>{const b=$e('button','tg-o qz-o','<b>'+o.t+'</b>');O.appendChild(b);b.addEventListener('click',()=>qzPick(d,q,o,b));});
  d.info('Doğru: <b>'+s.right+'</b> / 3');
}
function qzPick(d,q,o,b){
  const s=d.s;if(!d.running||d.done||q.locked)return;q.locked=true;q.res=o.ok;
  if(o.ok){s.right++;b.classList.add('ok');Sfx.fix();d.pop(b,'Doğru','good');}
  else{s.wrong++;d.t+=1.5;b.classList.add('no');d.shake();Sfx.nope();d.pop(b,q.why,false);}
  d.later(o.ok?500:1300,()=>{s.i++;if(s.i>=s.qs.length)d.finish();else qzShow(d);});
}
function orInfo(d){const s=d.s,p=document.getElementById('orP');if(p)p.innerHTML=s.steps.map((x,i)=>'<i class="'+(i<s.next?'ok':i===s.next?'cur':'')+'"></i>').join('');d.info('Sıra: <b>'+s.next+' / 4</b>');}
function orClick(d,o){
  const s=d.s;if(!d.running||d.done||o.done)return;
  if(o.i===s.next){o.done=true;s.next++;o.el.classList.add('ok');o.el.querySelector('em').textContent=s.next;o.el.disabled=true;Sfx.pick();orInfo(d);if(s.next>=4)d.later(450,()=>d.finish());}
  else{s.wrong++;d.t+=1.5;d.shake();Sfx.nope();d.pop(o.el,'Henüz sırası değil! −1.5 sn',false);}
}


/* =========================================================
   GÖRSEL / UYGULAMALI ACİL RİSK OYUNLARI
   · hz:yangin:o  Yangın söndürücü atölyesi (şalter → pim → alevin tabanı)
   · hz:su:q      Yapı denetçisi: mercekle gizli kusurları bul
   · hz:su:o      Arsa sondajı: zemini tara, sağlam yere inşa et
   ========================================================= */
function dxPt(el,e){const r=el.getBoundingClientRect(),k=(el.offsetWidth?r.width/el.offsetWidth:1)||1;return{x:(e.clientX-r.left)/k,y:(e.clientY-r.top)/k};}

/* ---------- Yangın söndürücü ---------- */
DRILLS['hz:yangin:o']={icon:'extinguisher',title:'Yangın söndürücü atölyesi',limit:46,
  hint:'Elektrik yangını! Önce ŞALTERİ indir, sonra söndürücüyü al, pimi çek ve alevin TABANINA doğru basılı tutarak sağa-sola süpür.',
  build(d,st){
    st.innerHTML='<div class="fxroot"><div class="fx-steps" id="fxS"><span class="on">1 · Şalteri indir</span><span>2 · Söndürücüyü al</span><span>3 · Pimi çek</span><span>4 · Tabana nişan al, süpür</span></div>'+
      '<div class="fx-scene" id="fxSc"><div class="fx-wall"></div><div class="fx-floor"></div>'+
      '<button class="fx-br" id="fxBr" aria-label="Ana şalter"><i class="lv"></i><b>ANA ŞALTER</b><small>AÇIK</small></button>'+
      '<div class="fx-outlet" id="fxOut"><i></i><i></i></div>'+
      '<div class="fx-flame" id="fxFl"><b></b><b></b><b></b><u></u></div>'+
      '<button class="fx-ext" id="fxEx" aria-label="Yangın söndürücü"><span class="pin" id="fxPin"></span><span class="tank"></span><span class="hose"></span><small>SÖNDÜRÜCÜ</small></button>'+
      '<div class="fx-gauge"><i id="fxG"></i><b>YANGIN</b></div></div></div>';
    const sc=st.querySelector('#fxSc'),s={sc,step:0,power:true,pin:false,press:false,px:0,py:0,lx:0,sw:0,size:1,shocks:0,aimMiss:0,lastWarn:0,out:false};
    d.s=s;
    st.querySelector('#fxBr').addEventListener('click',()=>{if(!d.running||d.done||!s.power)return;s.power=false;s.step=Math.max(s.step,1);const b=st.querySelector('#fxBr');b.classList.add('off');b.querySelector('small').textContent='KAPALI';Sfx.breaker();d.pop(b,'Elektrik kesildi!',true);d.hint('Şimdi söndürücüyü al.');fxSteps(d);});
    st.querySelector('#fxEx').addEventListener('click',e=>{if(!d.running||d.done)return;
      if(e.target.id==='fxPin'){if(s.step<2){Sfx.nope();d.hint('Önce söndürücüyü ve şalteri hazırla.',true);return;}s.pin=true;s.step=3;st.querySelector('#fxPin').classList.add('gone');Sfx.pick();d.pop(e.target,'Pim çekildi',true);d.hint('Basılı tut ve alevin TABANINA doğru sağa-sola süpür.');fxSteps(d);return;}
      if(s.step<2){if(s.power){Sfx.nope();d.t+=1;d.hint('Elektrik hâlâ açık! Önce ana şalteri indir.',true);return;}s.step=2;st.querySelector('#fxEx').classList.add('held');Sfx.pick();d.pop(st.querySelector('#fxEx'),'Söndürücü alındı',true);d.hint('Şimdi pimi çek (kırmızı halka).');fxSteps(d);}});
    sc.addEventListener('pointerdown',e=>{const p=dxPt(sc,e);s.px=p.x;s.py=p.y;s.lx=p.x;s.press=true;});
    sc.addEventListener('pointermove',e=>{const p=dxPt(sc,e);s.px=p.x;s.py=p.y;});
    window.addEventListener('pointerup',()=>{s.press=false;},{once:false});
  },
  start(d){fxSteps(d);fxGauge(d);},
  tick(d,dt){
    const s=d.s,fl=document.getElementById('fxFl');if(!fl||s.out)return;
    const sc=s.sc,W=sc.offsetWidth,H=sc.offsetHeight,fx=W*.5,fb=H-150,fh=150*s.size+30;
    if(s.power&&s.step<3&&s.size<1.55)s.size+=dt*.035;
    const sw=Math.abs(s.px-s.lx)/Math.max(.016,dt);s.lx=s.px;s.sw+=(sw-s.sw)*Math.min(1,dt*6);
    if(s.press&&s.pin){
      for(let i=0;i<3;i++){const p=$e('i','fx-p','');const ox=W-120,oy=H-110;p.style.left=ox+'px';p.style.top=oy+'px';sc.appendChild(p);
        requestAnimationFrame(()=>{p.style.transform='translate('+(s.px-ox+(Math.random()*30-15))+'px,'+(s.py-oy+(Math.random()*30-15))+'px)';p.style.opacity='0';});setTimeout(()=>p.remove(),320);}
      const baseHit=Math.abs(s.px-fx)<70*s.size+30&&s.py>fb-60&&s.py<fb+40,topHit=Math.abs(s.px-fx)<90&&s.py<fb-60&&s.py>fb-fh;
      if(baseHit){
        if(s.power){s.shocks++;d.t+=2.5;s.press=false;Sfx.spark();d.shake();d.pop(fl,'Elektrik açık: çarpılma riski! −2.5 sn',false);}
        else{s.size-=dt*(.16+Math.min(.32,s.sw*.0016));if(Math.random()<.2)Sfx.secured();}
      }else if(topHit&&d.clock-s.lastWarn>2.2){s.lastWarn=d.clock;s.aimMiss++;d.hint('Alevin tepesine değil, TABANINA nişan al!',true);}
    }
    if(s.size<=.04){s.out=true;fl.classList.add('out');Sfx.win();d.hint('Alev söndü! Önce elektriği kesmek ve tabana nişan almak hayat kurtarır.');d.later(1100,()=>d.finish());return;}
    fl.style.transform='translateX(-50%) scale('+Math.max(.05,s.size).toFixed(2)+')';
    fxGauge(d);
  },
  score(d){const s=d.s,ok=s.out;
    return{ok,ratio:ok?drClamp(1-d.t/d.limit*.5-s.shocks*.15-s.aimMiss*.03,.4,1):drClamp(1-s.size,0,.3),lines:[ok?'Alevi söndürdün.':'Alev kontrol altına alınamadı.',s.shocks?'Elektrik açıkken müdahale ettin ('+s.shocks+' kez): önce şalteri indirmelisin.':'Önce şalteri indirip elektriği kestin: doğru sıra.',s.aimMiss?'Alevin tepesine sıktın ('+s.aimMiss+' kez): söndürücü alevin tabanına tutulur.':'Alevin tabanına nişan aldın.']};}
};
function fxSteps(d){const s=d.s,sp=document.querySelectorAll('#fxS span');sp.forEach((e,i)=>{e.classList.toggle('done',i<s.step);e.classList.toggle('on',i===s.step);});}
function fxGauge(d){const g=document.getElementById('fxG');if(g)g.style.width=Math.min(100,Math.max(0,d.s.size/1.55*100))+'%';d.info('Yangın: <b>%'+Math.round(Math.max(0,d.s.size)*100)+'</b>');}

/* ---------- Yapı denetçisi: mercek ile kusur avı ---------- */
const INS_BAD=[['Paslı donatı','Pas, demirin taşıma gücünü bitirir'],['Seyrek etriye','Etriye seyrekse kolon sarsıntıda patlar'],['Çatlak kolon','Kolondaki çatlak taşıyıcı sistemin zayıfladığını gösterir'],['Boşluklu beton','Boşluklu (arıza) beton dayanım vermez'],['Kesik kolon','Kolon kesmek yumuşak kat yaratır'],['Deniz kumlu beton','Tuz donatıyı çürütür'],['Düz yüzeyli demir','Nervürsüz demir betona kenetlenmez'],['Nem sızıntısı','Sızıntı donatıyı paslandırır']];
const INS_OK=[['Nervürlü donatı','Doğru: nervürlü demir betona kenetlenir'],['Sık etriye','Doğru: sık etriye kolonu sarar'],['Sağlam kolon','Doğru: kolon kesintisiz'],['Yoğun beton','Doğru: boşluksuz beton'],['Temiz agrega','Doğru: temiz kum ve çakıl'],['Sağlam bağ kirişi','Doğru: bağ kirişi duvarı tutar']];
DRILLS['hz:su:q']={icon:'search',title:'Yapı denetçisi: gizli kusurları bul',limit:44,
  hint:'Fareyi gezdir: mercek sıvanın altını gösterir. KUSURLU yerleri tıkla, sağlam olanlara dokunma!',
  build(d,st){
    st.innerHTML='<div class="ins" id="insS"><div class="ins-b"><div class="ins-grid"></div></div><div class="ins-x" id="insX"></div><div class="ins-lens" id="insL"></div><div class="ins-tag">KAT PLANI · RÖNTGEN MERCEĞİ</div></div>';
    const sc=st.querySelector('#insS'),X=st.querySelector('#insX');
    const bad=drFresh('ins-bad',INS_BAD,6),ok=drFresh('ins-ok',INS_OK,5);
    const marks=drShuf(bad.map(b=>({n:b[0],why:b[1],bad:true})).concat(ok.map(b=>({n:b[0],why:b[1],bad:false}))));
    const cols=4,rows=3;
    marks.forEach((m,i)=>{const c=i%cols,r=Math.floor(i/cols);m.fx=(c+.5)/cols+(Math.random()-.5)*.08;m.fy=(r+.5)/rows+(Math.random()-.5)*.1;
      m.el=$e('div','ins-m',ico(m.bad?'warn':'check')+'<b>'+m.n+'</b>');m.el.style.left=(m.fx*100)+'%';m.el.style.top=(m.fy*100)+'%';X.appendChild(m.el);});
    d.s={sc,X,marks,found:0,wrong:0,need:5,mx:-300,my:-300};
    const mv=e=>{const p=dxPt(sc,e);d.s.mx=p.x;d.s.my=p.y;sc.style.setProperty('--mx',p.x+'px');sc.style.setProperty('--my',p.y+'px');const L=st.querySelector('#insL');L.style.left=p.x+'px';L.style.top=p.y+'px';};
    sc.addEventListener('pointermove',mv);sc.addEventListener('pointerdown',mv);
    sc.addEventListener('click',e=>{if(!d.running||d.done)return;const p=dxPt(sc,e),W=sc.offsetWidth,H=sc.offsetHeight;
      let best=null,bd=1e9;d.s.marks.forEach(m=>{if(m.done)return;const dx=m.fx*W-p.x,dy=m.fy*H-p.y,dd=Math.hypot(dx,dy);if(dd<bd){bd=dd;best=m;}});
      if(!best||bd>58){return;}
      best.done=true;best.el.classList.add(best.bad?'found':'wrong');
      if(best.bad){d.s.found++;Sfx.fix();d.pop(best.el,'KUSUR! '+best.n,true);d.hint(best.why,false);}
      else{d.s.wrong++;d.t+=1.5;d.shake();Sfx.nope();d.pop(best.el,'Sağlam! −1.5 sn',false);d.hint(best.why,true);}
      insInfo(d);if(d.s.found>=d.s.need){Sfx.win();d.later(700,()=>d.finish());}});
  },
  start(d){insInfo(d);},
  score(d){const s=d.s,ok=s.found>=s.need;
    return{ok,ratio:ok?drClamp(.55+.35*(1-d.t/d.limit)-s.wrong*.08,.35,1):s.found/s.need*.3,lines:[s.found+' / '+s.need+' gizli kusuru buldun.',s.wrong?s.wrong+' sağlam elemana kusurlu dedin: denetçi dikkatli olmalı.':'Sağlam elemanlara dokunmadın.',ok?'Kusurlu yapı denetimden geçmedi: depremde çökebilecek binalar önceden yakalandı.':'Bazı kusurlar gözden kaçtı: bağımsız yapı denetimi bu yüzden zorunludur.']};}
};
function insInfo(d){const s=d.s;d.info('Kusur: <b>'+s.found+' / '+s.need+'</b>');}

/* ---------- Arsa sondajı: zemini tara, sağlam yere inşa et ---------- */
const TR_T={rock:{n:'Kaya',q:3,good:true,c:'#8d8f95',why:'Sağlam kaya: deprem dalgasını az büyütür.'},clay:{n:'Sıkı kil/çakıl',q:2,good:true,c:'#a08a6a',why:'Sıkı zemin: bina için güvenlidir.'},sand:{n:'Gevşek kum',q:0,good:false,c:'#d8c27a',why:'Gevşek kum sallanınca sıvılaşabilir.'},fill:{n:'Dolgu zemin',q:0,good:false,c:'#7a5d4a',why:'Dolgu oturur, bina eğilir.'},river:{n:'Dere yatağı',q:0,good:false,c:'#4a8fb8',why:'Eski dere yatağında zemin su doludur, zayıftır.'},fault:{n:'Fay hattı',q:0,good:false,c:'#c0463d',why:'Fay hattı üstüne yapı kurulmaz: yer kırığı oluşur.'}};
DRILLS['hz:su:o']={icon:'rock',title:'Arsa sondajı: sağlam zemini bul',limit:44,
  hint:'Bir kareye tıkla: SONDAJ (en çok 8) zemini gösterir. Sağlam zemin bulunca "İNŞA ET" de. Dere, yamaç ve fay hattından kaçın!',
  build(d,st){
    const C=8,R=5,cell=[];
    const fc=1+Math.floor(Math.random()*3),flip=Math.random()<.5,rv=3+Math.floor(Math.random()*3),fx=Math.floor(Math.random()*3);
    for(let r=0;r<R;r++){cell.push([]);for(let c=0;c<C;c++){let t=(c+r)%2?'clay':'rock';
      if(Math.abs(c-(flip?C-1-r*1.6-fc:r*1.6+fc))<.7)t='fault';
      else if(Math.abs(c-(rv+Math.sin(r*1.2)*1.1))<.55)t='river';
      else if(c>=fx&&c<fx+3&&r>=R-2)t='fill';
      else if(c>=C-2&&r<=1&&Math.random()<.7)t='sand';
      cell[r].push(t);}}
    st.innerHTML='<div class="tr"><div class="tr-map" id="trM"></div><div class="tr-side"><b>SONDAJ HAKKI</b><div class="tr-p" id="trP"></div><div class="tr-leg"></div><button class="btn primary" id="trB" disabled>İNŞA ET</button><p id="trN">Bir kare seç, sondaj yap.</p></div></div>';
    const M=st.querySelector('#trM');M.style.gridTemplateColumns='repeat('+C+',1fr)';
    const s={cell,C,R,probes:8,sel:null,built:false,res:null,els:[]};d.s=s;
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){const el=$e('button','tr-c'+(c>0&&Math.abs(c-(rv+Math.sin(r*1.2)*1.1))<.55?' wet':''),'<span>?</span>');el.dataset.r=r;el.dataset.c=c;M.appendChild(el);s.els.push(el);
      el.addEventListener('click',()=>trClick(d,r,c,el));}
    st.querySelector('#trB').addEventListener('click',()=>trBuild(d));
    const leg=st.querySelector('.tr-leg');leg.innerHTML=Object.keys(TR_T).map(k=>'<span><i style="background:'+TR_T[k].c+'"></i>'+TR_T[k].n+'</span>').join('');
    trP(d);
  },
  start(d){d.info('Sondaj: <b>'+d.s.probes+'</b>');},
  score(d){const s=d.s,r=s.res;
    return{ok:!!(r&&r.good),ratio:r&&r.good?drClamp(.55+(s.probes/8)*.2+(1-d.t/d.limit)*.25,.5,1):.1,lines:[r?'Seçtiğin zemin: '+r.n+'.':'Süre doldu: arsa seçilemedi.',r?r.why:'Zemin etüdü olmadan yapıya başlanmaz.',s.probes<8?(8-s.probes)+' sondaj yaptın: yapıdan önce zemin etüdü yapılır.':'Hiç sondaj yapmadan karar verdin: riskli!']};}
};
function trP(d){const e=document.getElementById('trP');if(e)e.innerHTML=Array.from({length:8},(_,i)=>'<i class="'+(i<d.s.probes?'on':'')+'"></i>').join('');d.info('Sondaj: <b>'+d.s.probes+'</b>');}
function trClick(d,r,c,el){
  const s=d.s;if(!d.running||d.done||s.built)return;const t=s.cell[r][c],T=TR_T[t];
  if(!el.dataset.rev){
    if(s.probes<=0){Sfx.nope();d.hint('Sondaj hakkın bitti: bildiğin karelerden birine inşa et.',true);return;}
    s.probes--;el.dataset.rev='1';el.classList.add('rev');el.style.background=T.c;el.innerHTML='<span>'+T.n+'</span>';Sfx.valve();trP(d);
    d.hint(T.n+': '+T.why,!T.good);
  }
  s.sel=el;s.els.forEach(x=>x.classList.toggle('sel',x===el));const b=document.getElementById('trB');if(b){b.disabled=false;}document.getElementById('trN').textContent=(el.dataset.rev?'Seçili: '+T.n:'Sondajsız seçim');
}
function trBuild(d){
  const s=d.s;if(!s.sel||s.built||!d.running||d.done)return;
  const r=+s.sel.dataset.r,c=+s.sel.dataset.c,t=s.cell[r][c],T=TR_T[t];s.built=true;s.res=T;
  s.sel.classList.add('rev');s.sel.style.background=T.c;s.sel.innerHTML='<span>'+T.n+'</span>';
  if(T.good){Sfx.win();d.pop(s.sel,'Sağlam zemin! Bina yükseliyor',true);d.hint('Doğru karar: '+T.why,false);}
  else{Sfx.bad();d.shake();d.pop(s.sel,'Riskli zemin!',false);d.hint('Yanlış zemin: '+T.why,true);}
  d.later(1400,()=>d.finish());
}
