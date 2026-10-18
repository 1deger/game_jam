'use strict';
/* Tüm sesler WebAudio ile kodla üretilir; harici ses dosyası yoktur. */
const Sfx=(function(){
  let env=null,paused=false,low=false,sceneName="menu",age=0,padT=0,detailT=0,alarmClock=0,fireClock=0,alarmOn=false,level=0,voices=0,seed=72819;
  let ac=null,master=null,padG=null,bgG=null,beatT=2,noiseBuf=null,rum=null,hissN=null,fireN=null,fireLv=0,muted=false,chord=0,motClock=5;
  const R=(a,b)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return a+(seed/4294967296)*(b-a);};
  try{low=localStorage.getItem("g72lowAudio")==="1";}catch(e){}
  function track(source,nodes){voices++;source.onended=()=>{voices--;for(const n of [source,...nodes])try{n.disconnect();}catch(e){}};}
  function volume(){if(env)env.gain.setTargetAtTime(low?.34:1,ac.currentTime,.12);}
  try{muted=localStorage.getItem('g72mute')==='1';}catch(e){}
  function init(){
    if(ac){if(ac.state==='suspended'&&!(typeof S!=='undefined'&&S.paused))ac.resume().catch(()=>{});return;}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{
      ac=new AC();master=ac.createGain();master.gain.value=muted?0:.48;
      env=ac.createGain();env.gain.value=low?.34:1;env.connect(master);
      const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=8;comp.attack.value=.005;comp.release.value=.18;
      master.connect(comp);comp.connect(ac.destination);
      padG=ac.createGain();padG.gain.value=.7;padG.connect(env);
      const len=ac.sampleRate*2;noiseBuf=ac.createBuffer(1,len,ac.sampleRate);
      const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=R(-1,1);
      padT=0;buildBg();
    }catch(e){ac=null;}
  }
  /* Sürekli arka plan: alçak drone + yavaş süpüren karanlık siren (düşük seviyeli) */
  const BGLV={menu:.075,levels:.07,cmap:.07,drill:.065,prep:.06,quake:.10,after:.09,sim:.05,result:.05,camp:.05,gameover:.04,cres:.05,bridge:.05};
  function bgLevel(name){return BGLV[name]!==undefined?BGLV[name]:.06;}
  function buildBg(){
    bgG=ac.createGain();bgG.gain.value=0;bgG.connect(env);
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=230;lp.Q.value=.7;lp.connect(bgG);
    [[55,'sawtooth',.5],[55.45,'sawtooth',.5],[82.4,'triangle',.28]].forEach(a=>{const o=ac.createOscillator(),g=ac.createGain();o.type=a[1];o.frequency.value=a[0];g.gain.value=a[2];o.connect(g);g.connect(lp);o.start();});
    /* gerilim: yarım ses çatışan alçak katman + yavaş nefes alan tremolo (siren yok) */
    const dis=ac.createOscillator(),dg=ac.createGain();dis.type='sawtooth';dis.frequency.value=58.3;dg.gain.value=.16;dis.connect(dg);dg.connect(lp);dis.start();
    const tl=ac.createOscillator(),tg=ac.createGain();tl.frequency.value=.14;tg.gain.value=.012;tl.connect(tg);tg.connect(bgG.gain);tl.start();
    bgG.gain.setTargetAtTime(bgLevel(sceneName),ac.currentTime+.2,2.5);
  }
  /* Beethoven 5. Senfoni ana motifi (kamu malı) — yaylı benzeri sentez, sadece gerilim anlarında */
  const MOT_FREQ={G:392,Eb:311.1,F:349.2,D:293.7,C:261.6,Ab:415.3,Bb:233.1};
  function strNote(f,t,dur,vol){
    const g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.035);g.gain.setValueAtTime(vol,t+dur*.7);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    lp.connect(g);g.connect(env);
    [-1,0,1].forEach(dt=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=dt*7;
      const v=ac.createOscillator(),vg=ac.createGain();v.frequency.value=5.2;vg.gain.value=3;v.connect(vg);vg.connect(o.detune);
      const og=ac.createGain();og.gain.value=.33;o.connect(og);og.connect(lp);voices+=1;o.onended=()=>{voices--;try{o.disconnect();v.disconnect();}catch(e){}};
      o.start(t);v.start(t);o.stop(t+dur+.05);v.stop(t+dur+.05);});
  }
  function motif(vol,oct){
    if(!ac||paused||muted)return;const t=ac.currentTime+.05,e=.2,k=oct||1,v=vol||.05;
    [[ 'G',0,e],['G',e,e],['G',2*e,e],['Eb',3*e,1.6],['F',3*e+2.0,e],['F',4*e+2.0,e],['F',5*e+2.0,e],['D',6*e+2.0,2.2]].forEach(n=>{strNote(MOT_FREQ[n[0]]*k,t+n[1],n[2]+.1,v);strNote(MOT_FREQ[n[0]]*k/2,t+n[1],n[2]+.1,v*.8);});
    tone(65.4,.6,'sine',.12,0,50,true);tone(65.4,.6,'sine',.09,.2,50,true);tone(65.4,.6,'sine',.09,.4,50,true);tone(51.9,1.4,'sine',.12,.6,45,true);
  }
  function tone(f,dur,type,vol,delay,to,ambient){
    if(!ac||paused||muted||voices>100)return;const t=ac.currentTime+(delay||0);
    const o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';
    o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.15,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(ambient?env:master);track(o,[g]);o.start(t);o.stop(t+dur+.05);
  }
  function noise(dur,vol,freq,delay,type,q){
    if(!ac||paused||muted||voices>100)return;const t=ac.currentTime+(delay||0);
    const s=ac.createBufferSource();s.buffer=noiseBuf;s.playbackRate.value=R(.8,1.2);
    const f=ac.createBiquadFilter();f.type=type||'lowpass';f.frequency.value=freq||800;if(q)f.Q.value=q;
    const g=ac.createGain();g.gain.setValueAtTime(vol||.3,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(env);track(s,[f,g]);s.start(t,R(0,1));s.stop(t+dur+.05);
  }
  function loopNoise(freq,type,q){
    const s=ac.createBufferSource();s.buffer=noiseBuf;s.loop=true;
    const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;if(q)f.Q.value=q;
    const g=ac.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(env);track(s,[f,g]);s.start();return{s,g};
  }
  function stopLoop(l,tc){if(!l)return;const t=ac.currentTime;l.g.gain.setTargetAtTime(0,t,tc||.2);try{l.s.stop(t+(tc||.2)*8);}catch(e){}}
  function pad(){
    const ch=[[110,138.6,164.8],[87.3,110,130.8],[98,123.5,146.8],[82.4,103.8,123.5]];
    const c=ch[chord++%ch.length],t=ac.currentTime;
    c.forEach(f=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.022,t+1.6);g.gain.linearRampToValueAtTime(.0001,t+5.2);
      o.connect(g);g.connect(padG);track(o,[g]);o.start(t);o.stop(t+5.4);});
  }
  function rumble(on){
    if(!ac)return;
    if(on&&!rum){const n=loopNoise(150,'lowpass',0),o=ac.createOscillator(),og=ac.createGain();o.type='sine';o.frequency.value=41;og.gain.value=0;o.connect(og);og.connect(env);track(o,[og]);o.start();rum={n,o,og};}
    if(!on&&rum){const r=rum;rum=null;stopLoop(r.n,.3);r.og.gain.setTargetAtTime(0,ac.currentTime,.3);try{r.o.stop(ac.currentTime+2.5);}catch(e){}level=0;}
  }
  function hiss(on){
    if(!ac)return;
    if(on&&!hissN){hissN=loopNoise(5200,'bandpass',.7);hissN.g.gain.setTargetAtTime(.05,ac.currentTime,.3);}
    if(!on&&hissN){stopLoop(hissN,.2);hissN=null;}
  }
  function fire(on){
    if(!ac)return;
    if(on&&!fireN){fireN=loopNoise(1300,'bandpass',.5);fireN.g.gain.setTargetAtTime(.04+fireLv*.1,ac.currentTime,.3);
      fireClock=0;}
    if(!on&&fireN){stopLoop(fireN,.3);fireN=null;}
  }
  return{
    init,rumble,hiss,fire,
    pause(on){paused=on;if(ac){const result=on?ac.suspend():ac.resume();if(result&&result.catch)result.catch(()=>{});}},
    rumbleLevel(v){level=Math.max(0,Math.min(1,v));if(ac&&rum){rum.n.g.gain.setTargetAtTime(v*.75,ac.currentTime,.08);rum.og.gain.setTargetAtTime(v*.5,ac.currentTime,.08);}},
    fireLevel(v){fireLv=Math.max(0,Math.min(1,v));if(ac&&fireN)fireN.g.gain.setTargetAtTime(.04+fireLv*.1,ac.currentTime,.3);},
    calm(on){if(ac)padG.gain.setTargetAtTime(on?.7:0,ac.currentTime,.4);},
    scene(name){sceneName=name;age=0;detailT=.5;motClock=({menu:5,prep:7,cmap:25,drill:12,after:2.5})[name]||15;if(ac&&bgG)bgG.gain.setTargetAtTime(bgLevel(name),ac.currentTime,1.2);if(ac)padG.gain.setTargetAtTime(name==='quake'?0:name==='after'?.08:.7,ac.currentTime,.5);},
    tick(dt){
      if(!ac||paused||muted||ac.state!=='running')return;
      age+=dt;padT-=dt;detailT-=dt;beatT-=dt;
      if(beatT<=0){beatT=3.4;tone(46,.5,'sine',.07,0,36,true);tone(46,.5,'sine',.05,.32,36,true);}
      if(padT<=0){pad();padT=4.5;}
      motClock-=dt;if(motClock<=0){const M={menu:[44,.05],prep:[30,.045],cmap:[55,.04],drill:[42,.035],after:[999,.06]}[sceneName];
        if(M){motif(M[1],sceneName==='after'?.5:1);motClock=M[0];}else motClock=15;}
      if(alarmOn){alarmClock-=dt;if(alarmClock<=0){tone(880,.22,'triangle',.05);tone(660,.22,'triangle',.05,.24);alarmClock=1.3;}}
      if(fireN){fireClock-=dt;if(fireClock<=0){noise(R(.03,.09),.04+fireLv*.09,R(1500,4200),0,'bandpass',2);fireClock=R(.15,.45);}}
      if(detailT<=0){detailT=R(.65,1.5);
        if(rum&&level>.06){noise(.12,.025+level*.09, R(700,1900),0,'bandpass',2);if(R(0,1)<level)this.creak();}
        else if(sceneName==='after'&&age<12){noise(.3,.018,900);}
        else if(['menu','prep','sim','cmap'].includes(sceneName)){
          noise(1.8,.015,450,0,'lowpass');
          if(sceneName==='prep'){tone(1600,.025,'sine',.008,0,1200,true);}
        }
      }
    },
    intensity(){return low;},
    toggleIntensity(){low=!low;try{localStorage.setItem('g72lowAudio',low?'1':'0');}catch(e){}volume();return low;},
    diagnostics(){return {voices,paused,low,muted,scene:sceneName,state:ac?ac.state:'unavailable',environmentGain:env?env.gain.value:null};},
    secured(){noise(.18,.035,850,0,'bandpass',2);},
    impact(key){
      if(key==='lamp'){noise(.35,.18,2600,0,'bandpass',3);[740,1120,1830].forEach((f,i)=>tone(f,.35,'sine',.035,i*.03,undefined,true));}
      else if(key==='tv'){noise(.25,.23,1600,0,'bandpass',1);tone(95,.3,'sine',.13,0,45,true);noise(.3,.09,4200,0,'highpass');}
      else if(key==='boxes'){noise(.4,.17,480);noise(.15,.09,1500,.1,'bandpass');}
      else if(key==='ceil'){noise(.9,.28,650);noise(.5,.16,2400,.1,'bandpass');tone(60,.6,'sine',.2,0,32,true);}
      else {noise(.7,.32,550);tone(85,.55,'sine',.24,0,36,true);noise(.2,.15,1300,.08,'bandpass',2);}
    },
    alarm(on){alarmOn=on;alarmClock=.2;},
    quakeStart(){noise(1.1,.55,520,0,'lowpass');tone(95,1.1,'sine',.34,0,34,true);noise(.3,.3,2400,.05,'bandpass',1);
      if(ac&&!paused&&!muted){const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(820,t+.8);o.frequency.exponentialRampToValueAtTime(420,t+1.5);f.type='lowpass';f.frequency.value=1400;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.07,t+.25);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(f);f.connect(g);g.connect(env);track(o,[f,g]);o.start(t);o.stop(t+1.7);}},
    build(n,combo){noise(.12,.22,420);tone(180+n*26,.14,'triangle',.2,0,120);tone(300+n*38,.18,'triangle',.14,.06);
      if(combo>=3){for(let i=0;i<Math.min(4,combo-1);i++)tone(660+i*165+combo*20,.14,'sine',.09,.1+i*.05);}
      if(n%3===0)[523,659,784].forEach((f,i)=>tone(f,.3,'triangle',.12,.12+i*.07));},
    bad(){noise(.4,.4,650);tone(120,.32,'sawtooth',.15,0,55);tone(70,.4,'sine',.2,0,40,true);noise(.12,.2,2600,.04,'bandpass',2);},
    stopAll(){this.alarm(false);rumble(false);hiss(false);fire(false);},
    click(){tone(760,.05,'triangle',.13,0,520);noise(.02,.06,3200,0,'highpass');},
    pick(){tone(520,.08,'triangle',.18);tone(780,.1,'triangle',.15,.06);noise(.03,.05,2800,0,'highpass');},
    drop(){tone(420,.09,'triangle',.12,0,300);},
    fix(){noise(.06,.25,2500,0,'bandpass',3);tone(80,.18,'sine',.2,0,50);tone(523,.12,'triangle',.2,.04);tone(784,.2,'triangle',.2,.12);tone(1047,.3,'sine',.14,.2);tone(1568,.3,'sine',.07,.28);},
    nope(){tone(190,.22,'sawtooth',.13,0,100);tone(95,.25,'sine',.14,0,60);},
    crash(){noise(1,.5,850,0,'lowpass');noise(.22,.5,2600,0,'bandpass',1.1);tone(75,.7,'sine',.22,0,32,true);for(let i=0;i<6;i++)tone(R(1400,4200),.12,'triangle',.045,R(.05,.6),undefined,true);},
    glass(){noise(.6,.35,6500,0,'highpass');noise(.18,.3,3200,0,'bandpass',2);for(let i=0;i<10;i++)tone(R(2500,6800),.22,'sine',.045,R(0,.6),undefined,true);},
    creak(){
      if(!ac||paused||muted||voices>100)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();
      o.type='sawtooth';o.frequency.setValueAtTime(R(70,110),t);o.frequency.linearRampToValueAtTime(R(120,210),t+.6);
      f.type='bandpass';f.frequency.value=R(300,520);f.Q.value=5;
      g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.08,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+.7);
      o.connect(f);f.connect(g);g.connect(env);track(o,[f,g]);o.start(t);o.stop(t+.8);
    },
    hit(){tone(150,.26,'sine',.42,0,48);noise(.18,.33,500);tone(340,.15,'triangle',.07,.05,200);},
    safe(){tone(660,.1,'sine',.16);tone(990,.2,'sine',.13,.07);tone(1320,.25,'sine',.07,.15);},
    valve(){noise(.18,.2,1800,0,'bandpass',2);tone(300,.3,'triangle',.1,.05,190);noise(.5,.12,5000,.1,'bandpass',.8);},
    window(){this.creak();noise(.35,.12,1400,0,'bandpass',1);tone(480,.15,'triangle',.07,.2,300);},
    breaker(){tone(220,.08,'square',.12);tone(120,.18,'square',.1,.06);noise(.1,.18,1800,0,'bandpass',2);},
    ext(){noise(1.1,.26,3200,0,'highpass');noise(1.1,.1,900,0,'bandpass',.6);},
    spark(){for(let i=0;i<7;i++)noise(.04,.22,R(2500,6000),R(0,.35),'bandpass',3);tone(R(900,1800),.15,'sawtooth',.05,0,300);},
    explode(){noise(1.4,.7,700,0,'lowpass');tone(55,1.1,'sine',.28,0,26,true);noise(.3,.5,3200,0,'bandpass',.9);},
    warn(){tone(190,.6,'sawtooth',.1,0,110);tone(880,.12,'square',.06,.1);tone(880,.12,'square',.06,.35);tone(880,.12,'square',.06,.6);},
    win(){[523,659,784,1047].forEach((f,i)=>tone(f,.36,'triangle',.19,i*.11));[1319,1568,2093].forEach((f,i)=>tone(f,.4,'sine',.08,.5+i*.09));tone(131,.9,'sine',.16,.44,98,true);},
    fail(){[392,349,311,262].forEach((f,i)=>tone(f,.42,'triangle',.16,i*.2));tone(70,1,'sine',.24,.55,34,true);noise(.5,.14,300,.6);},
    mute(){muted=!muted;try{localStorage.setItem('g72mute',muted?'1':'0');}catch(e){}if(master)master.gain.setTargetAtTime(muted?0:.48,ac.currentTime,.025);return muted;},
    muted(){return muted;}
  };
})();
