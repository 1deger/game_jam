'use strict';
/* Tüm görseller kodla çizilir (canvas). Harici görsel/yazı tipi yok. */
const cv=document.getElementById('cv'),cv2=document.getElementById('cv2');let ctx=cv.getContext('2d');const ctxMain=ctx,ctxTop=cv2.getContext('2d');
let QK=1;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a);
const easeIn=t=>t*t;
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function fillRR(x,y,w,h,r,f){rr(x,y,w,h,r);ctx.fillStyle=f;ctx.fill();}
function lg(x0,y0,x1,y1,st){const g=ctx.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g;}
function rg(x,y,r0,r1,st){const g=ctx.createRadialGradient(x,y,r0,x,y,r1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g;}
function glow(x,y,r,rgb,a){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=rg(x,y,0,r,[[0,'rgba('+rgb+','+a+')'],[1,'rgba('+rgb+',0)']]);ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();}
function mixc(a,b,t){return[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];}
const rgbs=a=>'rgb('+(a[0]|0)+','+(a[1]|0)+','+(a[2]|0)+')';
function txt(s,x,y,size,color,align,weight){ctx.font=(weight||'700')+' '+Math.max(12,size)+'px Barlow,"Segoe UI",system-ui,Arial,sans-serif';ctx.fillStyle=color;ctx.textAlign=align||'center';ctx.textBaseline='middle';ctx.fillText(s,x,y);}

/* ---------- kamera ---------- */
const CAMS={menu:{s:.72,tx:432,ty:96},prep:{s:.85,tx:-107.5,ty:31},quake:{s:.95,tx:32,ty:40}};
const cam={s:.72,tx:432,ty:96};
function qi(t){if(t<1.2)return t/1.2;if(t<10.5)return 1;if(t<13)return 1-(t-10.5)/2.5;return 0;}

/* ---------- parçacıklar ---------- */
const parts=[];
function P(o){if(parts.length>700)parts.shift();parts.push(Object.assign({x:0,y:0,vx:0,vy:0,g:0,life:1,max:1,s:4,rot:0,vr:0,c:'#fff',k:'dust'},o));}
function dust(x,y,n,spread,c){for(let i=0;i<n;i++)P({k:'dust',x:x+rnd(-spread,spread),y:y+rnd(-10,10),vx:rnd(-40,40),vy:rnd(-60,-10),g:20,life:rnd(.8,1.7),max:1.7,s:rnd(8,22),c:c||'214,204,188'});}
function chunks(x,y,n,cols,spread){for(let i=0;i<n;i++)P({k:'chunk',x:x+rnd(-spread,spread),y:y+rnd(-20,10),vx:rnd(-160,160),vy:rnd(-260,-40),g:900,life:rnd(1.2,2.4),max:2.4,s:rnd(4,11),rot:rnd(0,6),vr:rnd(-9,9),c:cols[i%cols.length]});}
function shards(x,y,n){for(let i=0;i<n;i++)P({k:'shard',x:x+rnd(-30,30),y:y+rnd(-50,50),vx:rnd(-140,140),vy:rnd(-120,40),g:800,life:rnd(1.2,2.2),max:2.2,s:rnd(5,12),rot:rnd(0,6),vr:rnd(-12,12),c:'rgba(200,236,255,.85)'});}
function sparkle(x,y,n,c){for(let i=0;i<n;i++)P({k:'star',x:x+rnd(-26,26),y:y+rnd(-26,26),vx:rnd(-40,40),vy:rnd(-90,-20),g:60,life:rnd(.5,1),max:1,s:rnd(4,9),c:c||'#ffd166'});}
function ftext(x,y,s,c){P({k:'txt',x,y,vy:-38,life:1.5,max:1.5,s:s,c:c||'#fff'});}
function updateParts(dt){
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}
    p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    if((p.k==='chunk'||p.k==='shard')&&p.y>FLOOR-2){p.y=FLOOR-2;p.vy*=-.25;p.vx*=.6;p.vr*=.5;}}
}
function drawParts(){
  for(const p of parts){const a=clamp(p.life/p.max,0,1);
    if(p.k==='dust'){const r=p.s*(1+(1-a)*1.3);ctx.fillStyle='rgba('+p.c+','+(a*.45)+')';ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill();}
    else if(p.k==='gas'){const r=p.s*(1+(1-a)*2);ctx.fillStyle='rgba(180,255,120,'+(a*.28)+')';ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill();}
    else if(p.k==='smoke'){const r=p.s*(1+(1-a)*2.2);ctx.fillStyle='rgba(45,45,52,'+(a*.45)+')';ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill();}
    else if(p.k==='foam'){ctx.fillStyle='rgba(245,245,255,'+(a*.85)+')';ctx.beginPath();ctx.arc(p.x,p.y,p.s*(1+(1-a)*.6),0,7);ctx.fill();}
    else if(p.k==='ember'){ctx.fillStyle='rgba(255,170,50,'+a+')';ctx.fillRect(p.x-1.5,p.y-1.5,3,3);}
    else if(p.k==='chunk'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s*.3,p.s,p.s*.6);ctx.restore();}
    else if(p.k==='shard'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.beginPath();ctx.moveTo(0,-p.s);ctx.lineTo(p.s*.6,p.s*.5);ctx.lineTo(-p.s*.6,p.s*.4);ctx.closePath();ctx.fill();ctx.restore();}
    else if(p.k==='star'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=a;ctx.fillStyle=p.c;const s=p.s;ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.28,-s*.28);ctx.lineTo(s,0);ctx.lineTo(s*.28,s*.28);ctx.lineTo(0,s);ctx.lineTo(-s*.28,s*.28);ctx.lineTo(-s,0);ctx.lineTo(-s*.28,-s*.28);ctx.closePath();ctx.fill();ctx.restore();}
    else if(p.k==='txt'){ctx.globalAlpha=clamp(a*2,0,1);txt(p.s,p.x,p.y,20,p.c);ctx.globalAlpha=1;}
  }
}

/* ---------- gökyüzü ve şehir ---------- */
const STARS=[];for(let i=0;i<110;i++)STARS.push({x:rnd(0,W),y:rnd(0,H*.6),r:Math.random()<.2?2.2:1.2,a:rnd(.3,1),f:rnd(.6,2.2),p:rnd(0,6)});
function mkCity(hmin,hmax,wmin,wmax){const a=[];let x=-260;while(x<W+260){const w=rnd(wmin,wmax),h=rnd(hmin,hmax);const cols=Math.max(1,Math.floor(w/11)),rows=Math.max(1,Math.floor(h/15)),wins=[];for(let c=0;c<cols;c++)for(let r=0;r<rows;r++)if(Math.random()<.2)wins.push([4+c*11,6+r*15]);a.push({x,w,h,wins});x+=w+rnd(-6,10);}return a;}
const CITY1=mkCity(70,230,34,70),CITY2=mkCity(40,130,40,90);
function skyline(arr,gy,col,wcol,par){ctx.fillStyle=col;const off=cam.tx*par;for(const b of arr){const bx=b.x+off;if(bx>W||bx+b.w<0)continue;ctx.fillRect(bx,gy-b.h,b.w,b.h);}
  ctx.fillStyle=wcol;for(const b of arr){const bx=b.x+off;if(bx>W||bx+b.w<0)continue;for(const w of b.wins)ctx.fillRect(bx+w[0],gy-b.h+w[1],5,7);}}
function drawBackdrop(){
  const gy=cam.ty+600*cam.s;
  ctx.fillStyle=lg(0,0,0,H,[[0,'#070b1e'],[.4,'#1c2761'],[.7,'#6d4a92'],[.9,'#f08a6e'],[1,'#ffc47e']]);ctx.fillRect(0,0,W,H);
  for(const s of STARS){ctx.globalAlpha=s.a*(.55+.45*Math.sin(S.t*s.f+s.p));ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,s.r,s.r);}ctx.globalAlpha=1;
  glow(1130,110,130,'255,240,200',.2);ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.arc(1130,110,34,0,7);ctx.fill();
  ctx.fillStyle='rgba(215,200,150,.55)';[[1120,100,8],[1142,118,6],[1124,124,5]].forEach(c=>{ctx.beginPath();ctx.arc(c[0],c[1],c[2],0,7);ctx.fill();});
  skyline(CITY2,gy,'#2a2562','rgba(255,214,140,.45)',.05);
  skyline(CITY1,gy,'#17143f','rgba(255,214,140,.7)',.11);
  ctx.fillStyle=lg(0,gy,0,H,[[0,'#26402f'],[.08,'#1d2f2c'],[1,'#0a1018']]);ctx.fillRect(0,gy,W,H-gy);
  ctx.fillStyle='#3b6b4a';ctx.fillRect(0,gy,W,5);
  const wl=wildLevel();
  if(wl>0){
    const g=ctx.createLinearGradient(W,0,W*.2,0);g.addColorStop(0,'rgba(255,90,20,'+(.6*wl)+')');g.addColorStop(1,'rgba(255,90,20,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const g2=ctx.createLinearGradient(0,0,0,H*.6);g2.addColorStop(0,'rgba(30,20,22,'+(.7*wl)+')');g2.addColorStop(1,'rgba(30,20,22,0)');
    ctx.fillStyle=g2;ctx.fillRect(W*.35,0,W*.65,H*.7);
    const n=Math.floor(10+wl*16);
    for(let i=0;i<n;i++){const x=W+20-i*34+Math.sin(S.t*3+i)*5,h=(36+((i*37)%46))*wl*(1-i/(n+6));ctx.fillStyle='rgba(255,'+(100+(i%4)*28)+',30,'+(.6*wl)+')';ctx.beginPath();ctx.moveTo(x-20,gy+4);ctx.quadraticCurveTo(x+Math.sin(S.t*5+i)*6,gy-h*1.5,x+20,gy+4);ctx.fill();}
  }
}

/* ---------- yardımcılar ---------- */
function isFixed(k){return !!(R&&R.fixed[k]);}
function hasHz(k){return !!(R&&R.L.hz.indexOf(k)>=0);}
function showHz(k){return hasHz(k)||!!(R&&R.L.decor&&R.L.decor.indexOf(k)>=0);}
function evOf(k){return R&&R.q?R.q.evs.find(e=>e.k===k):null;}
function fpOf(k){const e=evOf(k);if(!e)return 0;return clamp((R.q.t-e.t)/.45,0,1);}
function wob(k,ph){const q=R&&R.q;if(!q||q.t>13||fpOf(k)>0||R.L.scn==='wild')return 0;return Math.sin(S.t*28+ph)*(isFixed(k)?.002:.013)*qi(q.t);}
function hatch(x,y,w,h){
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle='#d4cdc0';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(90,80,70,.24)';ctx.lineWidth=1;ctx.beginPath();for(let i=-h;i<w;i+=9){ctx.moveTo(x+i,y+h);ctx.lineTo(x+i+h,y);}ctx.stroke();ctx.restore();
  ctx.strokeStyle='#4a443c';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
}
function rebarH(x0,x1,y){ctx.fillStyle='#5b5348';for(let x=x0;x<x1;x+=22){ctx.beginPath();ctx.arc(x,y,2.1,0,7);ctx.fill();}}
function rebarV(x,y0,y1){ctx.fillStyle='#5b5348';for(let y=y0;y<y1;y+=22){ctx.beginPath();ctx.arc(x,y,2.1,0,7);ctx.fill();}}
function bracket(x,y,w,h){fillRR(x,y,w,h,2,'#aab4c0');ctx.fillStyle='#6b7480';ctx.beginPath();ctx.arc(x+3,y+h/2,1.4,0,7);ctx.arc(x+w-3,y+h/2,1.4,0,7);ctx.fill();}

/* ---------- ev ---------- */
function drawRoof(){
  fillRR(930,40,46,70,3,'#7a5a52');fillRR(926,36,54,10,3,'#5d433e');
  ctx.beginPath();ctx.moveTo(104,142);ctx.lineTo(640,42);ctx.lineTo(1176,142);ctx.closePath();
  ctx.fillStyle=lg(0,42,0,142,[[0,'#d8644a'],[1,'#8e2f33']]);ctx.fill();
  ctx.save();ctx.clip();ctx.strokeStyle='rgba(0,0,0,.16)';ctx.lineWidth=2;ctx.beginPath();for(let y=60;y<142;y+=14){ctx.moveTo(0,y);ctx.lineTo(W,y);}ctx.stroke();ctx.restore();
  ctx.strokeStyle='#5a1f25';ctx.lineWidth=4;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(104,142);ctx.lineTo(640,42);ctx.lineTo(1176,142);ctx.stroke();
}
function drawInterior(){
  ctx.fillStyle=lg(0,140,0,560,[[0,'#f9e9cc'],[1,'#f0d3a6']]);ctx.fillRect(150,140,536,420);
  ctx.fillStyle=lg(0,140,0,560,[[0,'#dfe6fb'],[1,'#c2cff2']]);ctx.fillRect(698,140,432,420);
  ctx.fillStyle='rgba(255,255,255,.18)';for(let x=160;x<680;x+=36)ctx.fillRect(x,140,14,380);
  ctx.fillStyle='rgba(255,255,255,.22)';for(let x=710;x<1124;x+=36)ctx.fillRect(x,140,14,380);
  ctx.fillStyle='rgba(120,80,50,.16)';ctx.fillRect(150,520,536,40);ctx.fillRect(698,520,432,40);
  ctx.fillStyle='#fff9ee';ctx.fillRect(150,516,536,5);ctx.fillRect(698,516,432,5);
  ctx.fillStyle=lg(0,560,0,574,[[0,'#b57a49'],[1,'#8f5c34']]);ctx.fillRect(150,560,980,13);
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1;ctx.beginPath();for(let x=170;x<1130;x+=64){ctx.moveTo(x,560);ctx.lineTo(x,573);}ctx.stroke();
  fillRR(320,557,250,4,2,'#d1495b');fillRR(760,557,200,4,2,'#4d6cfa');
}
function drawShell(){
  hatch(136,126,14,474);hatch(1130,126,14,474);hatch(136,126,1008,14);hatch(136,573,1008,27);hatch(686,140,12,250);
  rebarH(150,1130,133);rebarH(150,1130,586);rebarV(143,140,590);rebarV(1137,140,590);rebarV(692,148,390);
  fillRR(678,386,28,8,2,'#6b4a35');
}
function drawFrame(x,y,w,h,tilt,c1,c2){
  ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(tilt);fillRR(-w/2,-h/2,w,h,3,'#5b3a29');fillRR(-w/2+4,-h/2+4,w-8,h-8,2,'#fdf6e3');
  ctx.save();rr(-w/2+7,-h/2+7,w-14,h-14,1);ctx.clip();ctx.fillStyle=lg(0,-h/2,0,h/2,[[0,c1],[1,c2]]);ctx.fillRect(-w/2,-h/2,w,h);ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(w*.12,-h*.12,h*.1,0,7);ctx.fill();ctx.fillStyle='rgba(30,60,50,.55)';ctx.beginPath();ctx.moveTo(-w/2,h/2);ctx.lineTo(-w*.1,h*.02);ctx.lineTo(w*.2,h/2);ctx.fill();ctx.restore();ctx.restore();
}
function drawWindow(){
  const x=575,y=250,w=90,h=140,ev=evOf('glass');
  const open=!!R.winOpen,broken=!!(ev&&R.q.t>=ev.t),cracking=!!(ev&&R.q.t>ev.t-1.6&&!broken);
  const ce=evOf('curtain'),burnt=!!(ce&&R.q.t>=ce.t+.45&&!isFixed('curtain')),noCurt=hasHz('curtain')&&isFixed('curtain');
  fillRR(x-9,y-9,w+18,h+18,6,'#f6f0e4');
  ctx.save();rr(x,y,w,h,3);ctx.clip();ctx.fillStyle=lg(0,y,0,y+h,[[0,'#16205a'],[1,'#7a4f95']]);ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.arc(x+62,y+36,11,0,7);ctx.fill();
  if(!broken&&!open){ctx.fillStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(x,y+h*.6);ctx.lineTo(x+w*.5,y);ctx.lineTo(x+w*.78,y);ctx.lineTo(x,y+h*.95);ctx.fill();}
  if(cracking){ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+30,y+20);ctx.lineTo(x+50,y+60);ctx.lineTo(x+44,y+98);ctx.moveTo(x+50,y+60);ctx.lineTo(x+78,y+74);ctx.stroke();}
  ctx.restore();
  if(open){ctx.fillStyle='rgba(246,240,228,.95)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+18,y+9);ctx.lineTo(x+18,y+h-11);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(200,230,255,.4)';ctx.beginPath();ctx.moveTo(x+3,y+5);ctx.lineTo(x+15,y+11);ctx.lineTo(x+15,y+h-13);ctx.lineTo(x+3,y+h-5);ctx.closePath();ctx.fill();}
  else if(!broken){ctx.fillStyle='#f6f0e4';ctx.fillRect(x+w/2-2,y,4,h);ctx.fillRect(x,y+h/2-2,w,4);}
  else{ctx.fillStyle='#f6f0e4';[[x,y],[x+w-12,y],[x,y+h-18],[x+w-12,y+h-18]].forEach(c=>{ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(c[0]+12,c[1]+6);ctx.lineTo(c[0]+4,c[1]+18);ctx.closePath();ctx.fill();});}
  fillRR(x-14,y+h+8,w+28,8,3,'#e8dcc6');
  if(!noCurt){
    const sw=Math.sin(S.t*2)*1.5+Math.sin(S.t*20)*3*(S.shake||0)+(open?Math.sin(S.t*3)*7+9:0);
    const c1=burnt?'#4a3030':'#e07a5f',c2=burnt?'#2e2020':'#c75d45';
    ctx.fillStyle=lg(x-24,0,x+4,0,[[0,c1],[1,c2]]);ctx.beginPath();ctx.moveTo(x-22,y-14);ctx.lineTo(x+6+sw,y-14);ctx.quadraticCurveTo(x+14+sw,y+70,x+4+sw,y+h+6);ctx.lineTo(x-24,y+h+6);ctx.quadraticCurveTo(x-14,y+60,x-22,y-14);ctx.fill();
    ctx.fillStyle=lg(x+w-4,0,x+w+24,0,[[0,c2],[1,c1]]);ctx.beginPath();ctx.moveTo(x+w+22,y-14);ctx.lineTo(x+w-6-sw,y-14);ctx.quadraticCurveTo(x+w-14-sw,y+70,x+w-4-sw,y+h+6);ctx.lineTo(x+w+24,y+h+6);ctx.quadraticCurveTo(x+w+14,y+60,x+w+22,y-14);ctx.fill();
  }
  fillRR(x-30,y-22,w+60,7,3,'#8a5a36');
}
function drawDecor(){
  const qn=S.shake||0,tl=Math.sin(S.t*20)*.05*qn;
  drawFrame(410,240,54,70,tl,'#7ec8e3','#cfeaf5');drawFrame(486,262,40,32,-tl,'#ffd6a5','#ffadad');
  ctx.save();ctx.translate(1010,262);fillRR(-20,-20,40,40,20,'#fff');ctx.strokeStyle='#3d405b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,20,0,7);ctx.stroke();ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-12);ctx.moveTo(0,0);ctx.lineTo(8,4);ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(748,250);ctx.rotate(tl);fillRR(-22,-22,44,60,5,'#3d405b');ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(0,0,10,0,7);ctx.fill();ctx.fillStyle='#3d405b';ctx.beginPath();ctx.arc(4,-3,9,0,7);ctx.fill();ctx.fillStyle='#fff';[[-12,14],[10,18],[-4,26]].forEach(s=>{ctx.beginPath();ctx.arc(s[0],s[1],1.6,0,7);ctx.fill();});ctx.restore();
  fillRR(372,528,22,32,4,'#c26a4a');ctx.fillStyle='#3e9b5f';[[-30,-.5],[-10,0],[12,.5]].forEach(l=>{ctx.save();ctx.translate(383,530);ctx.rotate(l[1]);ctx.beginPath();ctx.ellipse(0,-14,5,15,0,0,7);ctx.fill();ctx.restore();});
  const lit=!(R&&R.q&&R.q.blackout);
  ctx.strokeStyle='#3d405b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(420,140);ctx.lineTo(420,176);ctx.stroke();
  ctx.fillStyle=lit?'#ffe9b0':'#a89c82';ctx.beginPath();ctx.moveTo(406,190);ctx.lineTo(434,190);ctx.lineTo(428,174);ctx.lineTo(412,174);ctx.closePath();ctx.fill();
  if(lit)glow(420,196,170,'255,214,150',.2*(R&&R.q&&Math.random()<.12*qn?.3:1));
}
function drawTable(){
  const hint=S.mode==='quake';
  fillRR(402,468,136,12,4,'#c98e55');fillRR(402,468,136,4,2,'#e1aa73');
  fillRR(410,480,10,80,2,'#a8703c');fillRR(520,480,10,80,2,'#a8703c');fillRR(420,490,100,5,2,'#9a6535');
  fillRR(440,452,14,16,3,'#fff');fillRR(500,440,16,28,4,'#6aa84f');
  if(hint){ctx.fillStyle='rgba(94,224,138,.9)';fillRR(424,406,92,18,9,'rgba(20,60,40,.88)');txt('SAĞLAM MASA',470,415,10.5,'#9bf0b8');}
}
function drawDesk(){
  const hint=S.mode==='quake';
  fillRR(1046,470,84,12,4,'#b98a5a');fillRR(1046,470,84,4,2,'#d2a577');
  fillRR(1050,482,8,78,2,'#9a6d44');fillRR(1104,482,24,78,3,'#a9784a');fillRR(1108,494,16,24,2,'#8a5d37');fillRR(1108,526,16,24,2,'#8a5d37');
  fillRR(1072,452,22,18,2,'#3d405b');fillRR(1074,454,18,12,1,'#7ec8e3');
  if(hint){fillRR(1022,406,108,18,9,'rgba(20,60,40,.88)');txt('ÇALIŞMA MASASI',1076,415,10.5,'#9bf0b8');}
}
function drawBed(){
  fillRR(750,545,10,15,2,'#7b5b3a');fillRR(930,545,10,15,2,'#7b5b3a');
  fillRR(748,520,194,26,6,'#8d6a47');fillRR(756,500,176,24,10,'#f4f0ff');
  fillRR(820,500,112,24,10,'#f4a261');ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(835,500,5,24);ctx.fillRect(862,500,5,24);ctx.fillRect(889,500,5,24);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(784,498,22,10,-.1,0,7);ctx.fill();
  fillRR(942,468,12,78,4,'#6b4b2f');fillRR(742,484,10,62,4,'#6b4b2f');
  fillRR(706,505,44,55,4,'#a07850');fillRR(712,512,32,18,2,'#8d6a47');
  if(isFixed('lamp')&&hasHz('lamp')){fillRR(722,478,12,5,2,'#3d405b');ctx.fillStyle='#ffd166';ctx.beginPath();ctx.moveTo(716,478);ctx.lineTo(740,478);ctx.lineTo(734,462);ctx.lineTo(722,462);ctx.closePath();ctx.fill();glow(728,474,90,'255,214,150',.2);}
}
function drawLamp(){
  if(!showHz('lamp')||(hasHz('lamp')&&isFixed('lamp')))return;
  const fp=fpOf('lamp'),e=easeIn(fp),fell=fp>=1,blackout=R.q&&R.q.blackout;
  fillRR(827,138,16,8,3,'#8d99ae');
  ctx.save();ctx.translate(835,142);ctx.rotate(fp===0?wob('lamp',3)*4:0);ctx.translate(-835,-142);
  ctx.strokeStyle='#3d405b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(835,146);ctx.lineTo(835,fp>0?186:205);ctx.stroke();
  ctx.restore();
  if(!fell&&!blackout)glow(835,240,130,'255,214,150',.2*(R.q&&Math.random()<.1?.3:1));
  const y=205+262*e;ctx.save();ctx.translate(835,y+16);ctx.rotate(fell?.35:0);ctx.translate(-835,-y-16);
  ctx.fillStyle=lg(0,y,0,y+34,[[0,'#ffd166'],[1,'#f4a261']]);ctx.beginPath();ctx.moveTo(806,y+32);ctx.lineTo(864,y+32);ctx.lineTo(852,y);ctx.lineTo(818,y);ctx.closePath();ctx.fill();
  ctx.fillStyle=fell||blackout?'#c9bfa0':'#fff6c8';ctx.beginPath();ctx.ellipse(835,y+33,14,6,0,0,7);ctx.fill();ctx.restore();
}
function drawShelf(){
  if(!showHz('shelf'))return;
  const fp=fpOf('shelf'),ang=easeIn(fp)*1.12+wob('shelf',1);
  ctx.save();ctx.translate(360,560);ctx.rotate(ang);ctx.translate(-360,-560);
  fillRR(286,324,74,236,6,'#8a5a36');fillRR(292,330,62,224,3,'#5e3b21');
  const BC=['#e63946','#f4a261','#2a9d8f','#264653','#e9c46a','#8d99ae','#6a4c93','#e76f51'];
  for(let r=0;r<5;r++){const y=330+r*46;let x=295,i=0;while(x<348&&i<10){const bw=5+((r*7+i*3)%5),bh=26+((r*5+i*11)%14);ctx.fillStyle=BC[(r*3+i)%BC.length];ctx.fillRect(x,y+43-bh,bw,bh);x+=bw+1;i++;}fillRR(290,y+43,66,5,1,'#a8714a');}
  if(isFixed('shelf')){bracket(354,334,16,7);bracket(354,430,16,7);}
  ctx.restore();
  if(fp>=1){const cs=['#e63946','#f4a261','#2a9d8f','#e9c46a','#6a4c93'];[[372,552,.2],[392,556,-.1],[430,553,.3],[455,557,0],[480,555,-.25]].forEach((b,i)=>{ctx.save();ctx.translate(b[0],b[1]);ctx.rotate(b[2]);ctx.fillStyle=cs[i%5];ctx.fillRect(-9,-3,18,6);ctx.restore();});}
}
function drawTV(){
  if(!showHz('tv'))return;
  fillRR(545,500,82,60,4,'#6b4a35');fillRR(551,508,34,46,2,'#5a3d2b');fillRR(589,508,32,46,2,'#5a3d2b');
  const fp=fpOf('tv'),e=easeIn(fp);
  ctx.save();ctx.translate(553-62*e,498+62*e);ctx.rotate(-1.2*e+wob('tv',2));ctx.translate(-553,-498);
  fillRR(553,456,66,42,4,'#14161f');
  if(fp<1){const sc=lg(0,460,0,494,[[0,'#1b5e8f'],[1,'#0f2a4a']]);fillRR(557,460,58,34,2,sc);ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(560+((S.t*26)%40),486,14,3);ctx.fillRect(560,470,30,3);ctx.fillStyle='#ef476f';ctx.beginPath();ctx.arc(565,465,2.4,0,7);ctx.fill();}
  else{fillRR(557,460,58,34,2,'#0b0c12');ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(586,460);ctx.lineTo(580,478);ctx.lineTo(594,494);ctx.moveTo(580,478);ctx.lineTo(560,484);ctx.stroke();}
  ctx.restore();
  if(isFixed('tv')){ctx.fillStyle='#d9a441';ctx.fillRect(560,456,3,50);ctx.fillRect(609,456,3,50);}
}
function drawWardrobe(){
  if(!showHz('wardrobe'))return;
  const fp=fpOf('wardrobe'),ang=-easeIn(fp)*1.25+wob('wardrobe',5);
  ctx.save();ctx.translate(956,560);ctx.rotate(ang);ctx.translate(-956,-560);
  fillRR(956,324,84,236,5,'#7b5b8f');fillRR(960,334,38,218,3,'#8f6fa5');fillRR(1000,334,36,218,3,'#8f6fa5');
  fillRR(990,432,3,26,1.5,'#f2d68a');fillRR(1004,432,3,26,1.5,'#f2d68a');fillRR(952,316,92,12,3,'#5f4573');
  if(isFixed('wardrobe')){bracket(1030,326,16,7);}
  ctx.restore();
}
function drawBoxes(){
  if(!hasHz('boxes')||isFixed('boxes'))return;
  fillRR(205,518,42,42,2,'#c69463');ctx.fillStyle='#e8d3a8';ctx.fillRect(224,518,4,42);
  fillRR(247,508,32,52,2,'#b9854f');ctx.fillStyle='#e8d3a8';ctx.fillRect(260,508,4,52);
  fillRR(213,478,36,40,2,'#d3a06b');ctx.fillStyle='#e8d3a8';ctx.fillRect(228,478,4,40);
  ctx.fillStyle='#3d405b';ctx.beginPath();ctx.ellipse(266,555,9,4,0,0,7);ctx.ellipse(286,556,9,4,.3,0,7);ctx.fill();
}
function drawDoor(){
  const open=R.after&&R.after.exiting;
  fillRR(156,400,64,160,3,'#4a2f1c');fillRR(162,406,52,154,2,open?'#ffe2a8':'#8a5a36');
  if(!open){fillRR(168,414,40,56,2,'#7a4d2d');fillRR(168,478,40,74,2,'#7a4d2d');ctx.fillStyle='#e8c15a';ctx.beginPath();ctx.arc(204,490,3.5,0,7);ctx.fill();}
  else glow(188,480,90,'255,226,160',.5);
  fillRR(163,374,50,19,3,'#1faa59');txt('ÇIKIŞ',188,384,11,'#fff');
  fillRR(160,556,58,4,2,'#b04a3a');
}
function drawValve(){
  const closed=R.gasClosed;
  fillRR(236,140,6,230,0,'#8d99ae');
  fillRR(224,356,30,38,4,'#d9a441');ctx.fillStyle='#fff7da';ctx.beginPath();ctx.arc(239,372,9,0,7);ctx.fill();ctx.strokeStyle='#3d405b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(239,372);ctx.lineTo(244,367);ctx.stroke();
  fillRR(236,394,6,50,0,'#8d99ae');fillRR(230,410,18,14,3,'#6b7480');
  if(closed)fillRR(236,396,6,34,3,'#ef476f');else fillRR(220,414,38,6,3,'#ef476f');
}
function drawSwitch(){
  fillRR(260,452,18,28,3,'#f4efe4');fillRR(266,457,6,10,2,'#cfc8b8');fillRR(266,468,6,8,2,'#e6dfd0');
  if(R.sparkT>0)glow(269,466,50+R.sparkT*60,'255,240,160',Math.min(1,R.sparkT*1.6));
}
function drawBreaker(){
  const off=R.breakerOff;
  fillRR(254,366,34,54,3,'#8d99ae');fillRR(258,370,26,46,2,'#aab4c0');
  for(let i=0;i<3;i++){const x=262+i*8,down=(i===0&&off);fillRR(x,376,5,28,2,'#5b6573');fillRR(x-.5,down?390:378,6,12,2,down?'#ef476f':'#5ee08a');}
  ctx.fillStyle='#ffd166';ctx.beginPath();ctx.moveTo(268,412);ctx.lineTo(272,405);ctx.lineTo(276,412);ctx.closePath();ctx.fill();
}
function drawExt(){
  if(R.L.scn!=='fire')return;
  const used=R.after&&R.after.extinguished;
  fillRR(666,500,20,58,8,used?'#a52a35':'#d62839');fillRR(670,490,12,12,3,'#222');
  ctx.strokeStyle='#222';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(682,494);ctx.quadraticCurveTo(696,498,692,520);ctx.stroke();
  fillRR(669,514,14,14,2,'#fff');txt('ABC',676,521,7,'#d62839');
}
function drawTube(){
  if(!hasHz('tube')||isFixed('tube'))return;
  const ev=evOf('tube');
  if(ev&&R.q.t>=ev.t+.45){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(676,558,26,5,0,0,7);ctx.fill();return;}
  const sh=ev&&R.q.t>ev.t-1.6?Math.sin(S.t*45)*1.4:0;
  ctx.save();ctx.translate(sh,0);fillRR(664,492,26,68,11,'#d9482b');fillRR(668,484,18,10,3,'#8d99ae');fillRR(674,476,6,9,2,'#444');ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(669,502,4,50);ctx.restore();
}
function tear(cx,by,w,h,sway,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx-w/2,by);ctx.quadraticCurveTo(cx-w/2,by-h*.55,cx+sway,by-h);ctx.quadraticCurveTo(cx+w/2,by-h*.55,cx+w/2,by);ctx.closePath();ctx.fill();}
function flame(x,by,s,seed){
  const t=S.t*8+seed,fl=1+Math.sin(t*1.7)*.12,sw=Math.sin(t)*s*.12;
  glow(x,by-s*.6,s*2.2,'255,140,40',.2);
  tear(x,by,s*.9,s*1.5*fl,sw,'#ff5a14');tear(x,by,s*.62,s*1.15*fl,sw*.8,'#ffa526');tear(x,by,s*.34,s*.72*fl,sw*.5,'#fff0a0');
}
function drawFires(){
  const a=R.after,scn=R.L.scn;
  if(scn==='fire'&&a&&a.fire){const lv=a.fireLvl/100,n=1+Math.floor(lv*6);for(let i=0;i<n;i++){const off=(i===0?0:(i%2?1:-1)*Math.ceil(i/2)*30);flame(610+off,560,24+lv*34-i*1.5,i*2.3);}}
  if(R.sparked&&a){[250,330,420,520,610].forEach((x,i)=>flame(x,560,44+Math.sin(S.t*3+i)*5,i));glow(420,470,380,'255,130,40',.25);}
  const ce=evOf('curtain');if(ce&&R.q.t>=ce.t+.45&&R.q.t<ce.t+9){flame(606,404,40,1);flame(650,392,34,2);}
  const te=evOf('tube');if(te&&R.q.t>=te.t+.45&&R.q.t<te.t+4){const k=1-(R.q.t-te.t-.45)/3.5;flame(676,548,70*k+10,3);flame(650,552,40*k+6,4);}
}
function wildLevel(){
  if(!R||R.L.scn!=='wild')return 0;
  if(S.mode==='quake'&&R.q)return .25+clamp(R.q.t/8,0,1)*.75;
  if(S.mode==='prep')return .2;
  return 0;
}
function drawWildFront(){
  if(!R.q||R.L.scn!=='wild')return;
  const f=R.q.front;if(f>1300)return;
  ctx.save();ctx.beginPath();ctx.rect(150,140,980,420);ctx.clip();
  const g=ctx.createLinearGradient(f-170,0,f+40,0);g.addColorStop(0,'rgba(70,50,48,0)');g.addColorStop(1,'rgba(88,52,40,.78)');
  ctx.fillStyle=g;ctx.fillRect(f-170,140,210,420);
  if(f<1130){ctx.fillStyle='rgba(88,52,40,.78)';ctx.fillRect(f+40,140,1130-f,420);}
  glow(f,470,300,'255,110,30',.35);
  for(let x=f;x<1160;x+=52)flame(x+Math.sin(x)*8,560,34+((x*7)%20),x*.01);
  ctx.restore();
}
function afterHints(){
  const a=R.after,t=a.tasks,out=[];
  if(t.indexOf('window')>=0&&!R.winOpen)out.push({r:SPOT.win,l:'PENCEREYİ AÇ'});
  if(t.indexOf('gas')>=0&&!R.gasClosed)out.push({r:SPOT.valve,l:'GAZ VANASI'});
  if(t.indexOf('breaker')>=0&&!R.breakerOff)out.push({r:SPOT.brk,l:'ELEKTRİK PANOSU'});
  else if(t.indexOf('ext')>=0&&!a.extinguished&&a.fire)out.push({r:SPOT.ext,l:'SÖNDÜRÜCÜ'});
  const st={gas:R.gasClosed,window:R.winOpen,breaker:R.breakerOff,ext:a.extinguished||!a.fire};
  const pend=t.some(k=>k!=='exit'&&!st[k]);
  const stay=a.exiting&&R.people.some(p=>!p.hidden&&!p.evac);
  if(!pend&&(!a.exiting||stay))out.push({r:SPOT.door,l:'ÇIK'});
  return out;
}

/* ---------- insanlar ---------- */
function drawHead(d,type,hy,mode,hits){
  if(type==='mom'){fillRR(-18.5,hy-8,37,24,11,d.hair);}
  if(type==='gran'){ctx.fillStyle=d.hair;ctx.beginPath();ctx.arc(0,hy-17,8,0,7);ctx.fill();}
  if(type==='kid'){ctx.fillStyle=d.hair;ctx.beginPath();ctx.arc(-18,hy+2,6,0,7);ctx.arc(18,hy+2,6,0,7);ctx.fill();}
  ctx.fillStyle=d.skin;ctx.beginPath();ctx.arc(0,hy,16,0,7);ctx.fill();
  ctx.fillStyle=d.hair;ctx.beginPath();ctx.arc(0,hy-2,16.5,Math.PI,0,false);ctx.quadraticCurveTo(4,hy-9,-16.5,hy-2);ctx.fill();
  ctx.fillStyle='rgba(255,120,120,.35)';ctx.beginPath();ctx.arc(-10,hy+6,3.6,0,7);ctx.arc(10,hy+6,3.6,0,7);ctx.fill();
  ctx.strokeStyle='#2b2d42';ctx.fillStyle='#2b2d42';ctx.lineWidth=1.8;ctx.lineCap='round';
  if(mode==='scared'){
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-6,hy+1,3.8,0,7);ctx.arc(6,hy+1,3.8,0,7);ctx.fill();
    ctx.fillStyle='#2b2d42';ctx.beginPath();ctx.arc(-6,hy+1.5,1.9,0,7);ctx.arc(6,hy+1.5,1.9,0,7);ctx.fill();
    ctx.beginPath();ctx.moveTo(-10,hy-6);ctx.lineTo(-3,hy-8);ctx.moveTo(10,hy-6);ctx.lineTo(3,hy-8);ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,hy+9,2.6,3.4,0,0,7);ctx.fill();
  }else if(mode==='closed'){
    ctx.beginPath();ctx.arc(-6,hy+2,3,Math.PI*1.1,Math.PI*1.9);ctx.arc(6,hy+2,3,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-3,hy+9);ctx.lineTo(3,hy+9);ctx.stroke();
  }else{
    ctx.beginPath();ctx.arc(-6,hy+1,2,0,7);ctx.arc(6,hy+1,2,0,7);ctx.fill();
    ctx.beginPath();ctx.arc(0,hy+5,4.2,Math.PI*.15,Math.PI*.85);ctx.stroke();
  }
  if(type==='gran'){ctx.strokeStyle='#444';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-6,hy+1,4.8,0,7);ctx.moveTo(10.8,hy+1);ctx.arc(6,hy+1,4.8,0,7);ctx.moveTo(-1.2,hy+1);ctx.lineTo(1.2,hy+1);ctx.stroke();}
  if(hits>0){ctx.save();ctx.translate(8,hy-9);ctx.rotate(.5);ctx.fillStyle='#fff';ctx.fillRect(-7,-3.5,14,7);ctx.fillStyle='#e63946';ctx.fillRect(-1,-3,2,6);ctx.fillRect(-3,-1,6,2);ctx.restore();}
}
function drawPerson(p,oy){
  if(p.type==='dog'){drawDog(p,oy);return;}
  const d=p.def,sc=d.sc,t=S.t,y0=oy==null?FLOOR:oy;
  const qn=(S.mode==='quake'||S.mode==='after')?(S.shake||0):0;
  const cr=p.state==='shelter',walk=p.state==='walk',sit=p.pose==='sit';
  ctx.save();ctx.globalAlpha=p.alpha==null?1:p.alpha;
  let x=p.x;if(!walk&&!cr&&qn>0)x+=Math.sin(t*55+p.ph)*1.8*qn;
  ctx.translate(x,y0);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,1,24*sc,5*sc,0,0,7);ctx.fill();
  if(p.down){ctx.translate(20*sc,-8*sc);ctx.rotate(-Math.PI/2*.96);}
  ctx.scale(sc,sc);
  const sw=walk?Math.sin(t*14+p.ph):0,bob=walk?Math.abs(Math.sin(t*14+p.ph))*3:Math.sin(t*2+p.ph)*.8;
  const scared=(S.mode==='quake'||S.mode==='after')&&!sit&&!p.down&&!cr;
  ctx.lineCap='round';ctx.lineJoin='round';
  if(!cr){
    ctx.strokeStyle=d.bot;ctx.lineWidth=10;
    for(const s of[-1,1]){const fx=s*7+(s>0?sw:-sw)*9;ctx.beginPath();ctx.moveTo(s*6,-42-bob);ctx.lineTo(fx,-4);ctx.stroke();ctx.fillStyle='#2b2d42';ctx.beginPath();ctx.ellipse(fx+s*2,-2,8,4.5,0,0,7);ctx.fill();}
    ctx.fillStyle=lg(-16,-88,16,-40,[[0,d.top],[1,d.top2]]);rr(-16,-88-bob,32,50,12);ctx.fill();
    ctx.strokeStyle=d.top2;ctx.lineWidth=8;
    for(const s of[-1,1]){let hx,hy;if(scared){hx=s*17;hy=-100-bob;}else if(walk){hx=s*20+(s>0?-sw:sw)*7;hy=-52-bob;}else{hx=s*21;hy=-52-bob;}
      ctx.beginPath();ctx.moveTo(s*15,-82-bob);ctx.quadraticCurveTo(s*(scared?26:24),-66-bob,hx,hy);ctx.stroke();
      ctx.fillStyle=d.skin;ctx.beginPath();ctx.arc(hx,hy,5,0,7);ctx.fill();}
    drawHead(d,p.type,-104-bob,p.down?'closed':scared?'scared':'ok',p.hits);
  }else{
    ctx.fillStyle='#2b2d42';ctx.beginPath();ctx.ellipse(-9,-3,9,5,0,0,7);ctx.ellipse(9,-3,9,5,0,0,7);ctx.fill();
    ctx.fillStyle=d.bot;ctx.beginPath();ctx.ellipse(0,-13,19,11,0,0,7);ctx.fill();
    ctx.fillStyle=lg(-17,-42,17,-10,[[0,d.top],[1,d.top2]]);ctx.beginPath();ctx.ellipse(0,-25,17,17,0,0,7);ctx.fill();
    drawHead(d,p.type,-46,sit?'ok':'closed',p.hits);
    ctx.strokeStyle=d.top2;ctx.lineWidth=8;
    for(const s of[-1,1]){let hx=s*5,hy=-67;if(sit){hx=s*12;hy=-16;}
      ctx.beginPath();ctx.moveTo(s*13,-34);ctx.quadraticCurveTo(s*22,sit?-20:-54,hx,hy);ctx.stroke();ctx.fillStyle=d.skin;ctx.beginPath();ctx.arc(hx,hy,5,0,7);ctx.fill();}
  }
  ctx.restore();
}
function drawDog(p,oy){
  const t=S.t,y0=oy==null?FLOOR:oy,walk=p.state==='walk',lie=p.state==='shelter'||p.down||p.pose==='sit';
  const scared=(S.mode==='quake'||S.mode==='after')&&!lie,dir=p.dir||1;
  ctx.save();ctx.globalAlpha=p.alpha==null?1:p.alpha;ctx.translate(p.x+(scared&&!walk?Math.sin(t*50+p.ph)*1.5:0),y0);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,1,30,5,0,0,7);ctx.fill();
  ctx.scale(dir,1);
  const sw=walk?Math.sin(t*18+p.ph):0,by=lie?-14:-26;
  ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-24,by-4);ctx.quadraticCurveTo(-36,by-14-Math.sin(t*(walk?20:9))*5,-34,by-24);ctx.stroke();
  if(!lie){ctx.strokeStyle='#ececec';ctx.lineWidth=7;[[-16,1],[-8,-1],[12,-1],[20,1]].forEach(l=>{ctx.beginPath();ctx.moveTo(l[0],by+6);ctx.lineTo(l[0]+sw*l[1]*6,-3);ctx.stroke();});}
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,by,28,lie?11:14,0,0,7);ctx.fill();
  ctx.fillStyle='#d9a066';ctx.beginPath();ctx.ellipse(-8,by-4,9,6,0,0,7);ctx.fill();
  const hx=26,hy=lie?-18:-40;
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hx,hy,13,0,7);ctx.fill();
  ctx.fillStyle='#f4f4f4';ctx.beginPath();ctx.ellipse(hx+10,hy+4,8,6,0,0,7);ctx.fill();
  ctx.fillStyle='#222';ctx.beginPath();ctx.arc(hx+16,hy+2,3.2,0,7);ctx.fill();
  ctx.fillStyle='#b9773c';ctx.beginPath();ctx.ellipse(hx-6,hy-2+(scared?4:0),6,11,.3+(scared?.5:0),0,7);ctx.fill();
  ctx.fillStyle='#222';ctx.beginPath();ctx.arc(hx+4,hy-3,2.2,0,7);ctx.fill();
  if(p.hits>0){ctx.fillStyle='#fff';ctx.fillRect(hx-2,hy-12,10,5);ctx.fillStyle='#e63946';ctx.fillRect(hx+2,hy-12,2,5);}
  ctx.restore();
}
function drawTag(p){
  const d=p.def,h=p.type==='dog'?60:(p.state==='shelter'?84:128)*d.sc+(p.type==='dog'?0:6);
  const y=FLOOR-(p.type==='dog'?66:(p.state==='shelter'?86*d.sc+8:122*d.sc+8));
  ctx.font='700 12px "Segoe UI",Arial,sans-serif';const w=ctx.measureText(d.name).width+16;
  fillRR(p.x-w/2,y-20,w,18,9,'rgba(8,12,34,.82)');txt(d.name,p.x,y-11,12,'#fff');
}

/* ---------- dünya ---------- */
function drawWorld(){
  ctx.fillStyle='#1f4d33';ctx.beginPath();ctx.arc(70,540,60,0,7);ctx.arc(30,560,48,0,7);ctx.fill();fillRR(62,560,10,40,2,'#4a3322');
  fillRR(1196,470,6,130,2,'#2b2f45');fillRR(1180,462,40,8,4,'#2b2f45');glow(1200,468,120,'255,214,150',.35);
  drawRoof();drawInterior();drawDecor();drawWindow();drawBed();drawDoor();drawValve();drawSwitch();drawBreaker();drawExt();
  drawBoxes();drawShelf();drawTV();drawLamp();drawWardrobe();drawTube();
  if(R.q&&R.q.blackout){ctx.fillStyle='rgba(6,10,30,.42)';ctx.fillRect(150,140,980,420);}
  for(const p of R.people){if(!p.hidden)drawPerson(p);}
  drawTable();drawDesk();
  if(R.after&&R.L.scn==='gas'&&R.after.gasLvl>0){ctx.fillStyle='rgba(170,255,120,'+(R.after.gasLvl/100*.2)+')';ctx.fillRect(150,140,536,420);}
  if(R.q&&R.q.haze>0){ctx.fillStyle='rgba(205,195,178,'+(R.q.haze*.42)+')';ctx.fillRect(150,140,980,420);}
  drawWildFront();
  drawShell();
  drawParts();
}
function drawOverlays(){
  const m=S.mode,t=S.t;
  if(m==='prep'){
    for(const k of R.L.hz){const h=HZ[k],b=h.bb,fx=isFixed(k),cx=b[0]+b[2]/2,cy=b[1]-16+Math.sin(t*3+b[0])*3;
      if(S.hover===k&&h.zone&&!fx){ctx.fillStyle='rgba(239,71,111,.28)';ctx.fillRect(h.zone[0],516,h.zone[1]-h.zone[0],44);ctx.strokeStyle='rgba(239,71,111,.9)';ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(h.zone[0],516,h.zone[1]-h.zone[0],44);ctx.setLineDash([]);txt('DÜŞME BÖLGESİ',(h.zone[0]+h.zone[1])/2,500,12,'#ff8da6');}
      if(S.hover===k){ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.setLineDash([7,5]);rr(b[0]-6,b[1]-6,b[2]+12,b[3]+12,10);ctx.stroke();ctx.setLineDash([]);}
      if(fx){if(k==='boxes')continue;ctx.fillStyle='#2eb872';ctx.beginPath();ctx.arc(cx,cy,12,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-5,cy);ctx.lineTo(cx-1,cy+4);ctx.lineTo(cx+6,cy-4);ctx.stroke();}
      else{const pr=1+Math.sin(t*5+b[0])*.12;ctx.fillStyle='rgba(239,71,111,.28)';ctx.beginPath();ctx.arc(cx,cy,19*pr,0,7);ctx.fill();ctx.fillStyle='#ef476f';ctx.beginPath();ctx.arc(cx,cy,12,0,7);ctx.fill();txt('!',cx,cy+1,16,'#fff','center','900');}}
    const sp={valve:SPOT.valve,brk:SPOT.brk,sw:SPOT.sw,ext:SPOT.ext}[S.hover];
    if(sp){ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.setLineDash([7,5]);rr(sp[0]-4,sp[1]-4,sp[2]+8,sp[3]+8,10);ctx.stroke();ctx.setLineDash([]);}
    if(S.hoverP>=0){drawTag(R.people[S.hoverP]);}
  }
  if(m==='quake'||m==='after'){
    if(!isWild())drawShelterTargets();
    for(const p of R.people){if(!p.hidden&&!p.down)drawTag(p);}
    const sp=R.people[R.sel];
    if(sp&&!sp.hidden&&!sp.down){
      ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sp.x,FLOOR+2,30,8,0,0,7);ctx.stroke();
      ctx.fillStyle='#ffd166';const ay=FLOOR-(sp.type==='dog'?96:140*sp.def.sc)+Math.sin(t*8)*4;ctx.beginPath();ctx.moveTo(sp.x-9,ay-12);ctx.lineTo(sp.x+9,ay-12);ctx.lineTo(sp.x,ay);ctx.closePath();ctx.fill();
      const mo=S.mouse;
      if(mo&&mo.wy>(m==='after'?440:300)&&mo.wy<600&&mo.wx>165&&mo.wx<1115){
        const mx=mo.wx,wild=R.L.scn==='wild';
        const good=wild?mx<228:((mx>=TABLE.x0-14&&mx<=TABLE.x1+14)||(mx>=DESK.x0-14&&mx<=DESK.x1+14));
        ctx.strokeStyle=good?'#5ee08a':'rgba(255,255,255,.6)';ctx.lineWidth=2.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.ellipse(mx,FLOOR+2,20,6,0,0,7);ctx.stroke();ctx.setLineDash([]);
      }
    }
    if(m==='after'){
      for(const h of afterHints()){const r=h.r;ctx.save();ctx.globalAlpha=.55+.45*Math.sin(t*6);ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.setLineDash([6,5]);rr(r[0],r[1],r[2],r[3],10);ctx.stroke();ctx.restore();txt(h.l,r[0]+r[2]/2,r[1]-12,12,'#ffd166');}
    }
  }
}
const dk=document.createElement('canvas');dk.width=W;dk.height=H;const dctx=dk.getContext('2d');
function spot(x,y,r,a){const gr=dctx.createRadialGradient(x,y,r*.15,x,y,r);gr.addColorStop(0,'rgba(0,0,0,'+a+')');gr.addColorStop(1,'rgba(0,0,0,0)');dctx.fillStyle=gr;dctx.beginPath();dctx.arc(x,y,r,0,7);dctx.fill();}
function drawDark(){
  dctx.globalCompositeOperation='source-over';dctx.clearRect(0,0,W,H);dctx.fillStyle='rgba(3,5,16,.94)';dctx.fillRect(0,0,W,H);
  dctx.globalCompositeOperation='destination-out';
  const fl=R.bag.indexOf('fener')>=0,sp=R.people[R.sel];
  const ex=exitDark();
  let mx=W/2,my=H/2;
  if(ex){/* fenersiz tahliye: yalnız kişilerin çevresi aydınlık */}else if(S.mouse){mx=S.mouse.sx;my=S.mouse.sy;}else if(sp){mx=cam.tx+sp.x*cam.s;my=cam.ty+(FLOOR-40)*cam.s;}
  if(!ex)spot(mx,my,fl?230:85,fl?1:.8);
  for(const p of R.people){if(p.hidden)continue;spot(cam.tx+p.x*cam.s,cam.ty+(FLOOR-45)*cam.s,(ex?62:75)*cam.s,ex?.9:.85);}
  ctx.drawImage(dk,0,0,W,H);
  if(fl&&!ex)glow(mx,my,160,'255,224,150',.12);
}
/* El feneri olmadan tahliye: ev (orman yangını hariç) karanlık */
function exitDark(){return !!(R&&S.mode==='after'&&R.after&&R.after.exiting&&!R.after.done&&!R.L.dark&&R.L.scn!=='wild'&&R.bag.indexOf('fener')<0);}
/* ---------- 72 saat: toplanma alanı ---------- */
const SKYK=[[0,[8,12,34],[30,26,80]],[.1,[40,40,100],[255,140,100]],[.2,[90,150,230],[255,210,160]],[.32,[96,170,240],[190,225,255]],[.58,[96,170,240],[190,225,255]],[.68,[70,90,190],[255,150,100]],[.76,[24,24,70],[120,70,120]],[.86,[8,12,34],[30,26,80]],[1,[8,12,34],[30,26,80]]];
function skyAt(ph){for(let i=1;i<SKYK.length;i++){if(ph<=SKYK[i][0]){const a=SKYK[i-1],b=SKYK[i],u=(ph-a[0])/(b[0]-a[0]);return{top:mixc(a[1],b[1],u),bot:mixc(a[2],b[2],u)};}}const l=SKYK[SKYK.length-1];return{top:l[1],bot:l[2]};}
function campClock(){const T=R.sim.t/R.sim.dur,hrs=T*72,clock=(16.2+hrs)%24;return{hrs,clock,ph:((clock-3+24)%24)/24};}
function hasItem(id){return R.bag.indexOf(id)>=0;}
function drawCamp(){
  const c=campClock(),ph=c.ph,sk=skyAt(ph),nf=clamp(1-((sk.top[1]+sk.top[2])/2-30)/110,0,1);
  ctx.fillStyle=lg(0,0,0,520,[[0,rgbs(sk.top)],[1,rgbs(sk.bot)]]);ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=nf;for(const s of STARS){ctx.globalAlpha=nf*s.a*(.55+.45*Math.sin(S.t*s.f+s.p));ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,s.r,s.r);}ctx.globalAlpha=1;
  if(ph>=.1&&ph<=.72){const u=(ph-.1)/.62;const sx=140+u*1000,sy=470-Math.sin(Math.PI*u)*340;glow(sx,sy,150,'255,220,140',.5);ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(sx,sy,34,0,7);ctx.fill();}
  else{const u=((ph-.72+1)%1)/.38,mx=140+u*1000,my=470-Math.sin(Math.PI*u)*300;glow(mx,my,120,'255,240,200',.25);ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.arc(mx,my,28,0,7);ctx.fill();}
  skyline(CITY2,520,mixc([70,90,150],[18,18,50],nf).map(v=>v|0).join(',').replace(/^/,'rgb(')+')','rgba(255,214,140,'+(.15+nf*.5)+')',0);
  skyline(CITY1,520,'rgb('+(40-nf*26|0)+','+(50-nf*32|0)+','+(100-nf*60|0)+')','rgba(255,214,140,'+(.1+nf*.5)+')',0);
  ctx.fillStyle=lg(0,520,0,H,[[0,'#2c4a37'],[1,'#0d1a14']]);ctx.fillRect(0,520,W,H-520);
  ctx.fillStyle='#3b6b4a';ctx.fillRect(0,520,W,4);
  [[200,'#e8a55a'],[900,'#6fb7c9']].forEach(tt=>{ctx.fillStyle=tt[1];ctx.beginPath();ctx.moveTo(tt[0]-70,548);ctx.lineTo(tt[0],440);ctx.lineTo(tt[0]+70,548);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.moveTo(tt[0]-18,548);ctx.lineTo(tt[0],486);ctx.lineTo(tt[0]+18,548);ctx.fill();});
  fillRR(1070,420,6,130,2,'#3d405b');fillRR(1016,418,114,40,6,'#1faa59');txt('TOPLANMA',1073,430,12,'#fff');txt('ALANI',1073,446,12,'#fff');
  fillRR(470,548,320,10,4,hasItem('battaniye')?'#9b72cf':'#8c7a5a');
  const base=[540,600,660,720];R.people.forEach((p,i)=>{if(p.stranded){p.hidden=true;return;}p.x=p.type==='dog'?770:base[i%4];p.state='shelter';p.pose='sit';p.alpha=1;p.hidden=false;p.dir=-1;});
  if(hasItem('fener')&&nf>.2&&R.people.some(p=>!p.stranded)){const gx=R.people.find(p=>!p.stranded).x+16;ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=lg(gx,500,gx+380,520,[[0,'rgba(255,240,170,'+(.45*nf)+')'],[1,'rgba(255,240,170,0)']]);ctx.beginPath();ctx.moveTo(gx,512);ctx.lineTo(gx+420,420);ctx.lineTo(gx+420,600);ctx.closePath();ctx.fill();ctx.restore();}
  for(const p of R.people){if(!p.stranded)drawPerson(p,566);}
  if(hasItem('su')){fillRR(810,528,12,26,4,'#5bc0ff');fillRR(826,532,12,22,4,'#5bc0ff');}
  if(hasItem('ilkyardim')){fillRR(846,538,24,18,3,'#fff');ctx.fillStyle='#e63946';ctx.fillRect(856,541,4,12);ctx.fillRect(852,545,12,4);}
  if(hasItem('radyo')){fillRR(884,534,26,20,3,'#ef476f');ctx.strokeStyle='#ef476f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(904,534);ctx.lineTo(912,522);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,'+(.4+.4*Math.sin(S.t*6))+')';ctx.beginPath();ctx.arc(912,522,6,-1,0.4);ctx.stroke();}
  if(!hasItem('fener')&&nf>.4){ctx.fillStyle='rgba(0,0,12,'+(.35*nf)+')';ctx.fillRect(0,0,W,H);}
}

/* ---------- ana çizim ---------- */

/* ---------- Girne gecesi: menü, bölüm seçimi ve tatbikat arka planı ---------- */
function mul32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let GIR=null;
const GSEA=470;
function girneData(){
  const r=mul32(72),T=x=>GSEA-72*Math.max(0,1-x/820),bl=[],wins=[];
  const rows=[{off:-40,c:'#2a2d68',lit:.22},{off:-18,c:'#1d1f55',lit:.3},{off:2,c:'#13143c',lit:.4}];
  rows.forEach((row,ri)=>{
    let x=-14-ri*9;
    while(x<905){
      const w=34+r()*44,base=T(x+w/2)+row.off,h=38+r()*84*(1-Math.min(.6,x/1500))+(ri===0?20:0);
      bl.push({x,w,h,base,c:row.c,roof:r()<.35});
      const cols=Math.max(1,Math.floor((w-8)/13)),rws=Math.max(1,Math.floor((h-10)/17));
      for(let i=0;i<cols;i++)for(let j=0;j<rws;j++){
        if(r()<row.lit)wins.push({x:x+6+i*13,y:base-h+9+j*17,ri,ph:r()*6.28,fl:r()<.12,a:.55+r()*.4});
      }
      x+=w+2+r()*5;
    }
  });
  const boats=[];for(let i=0;i<8;i++)boats.push({x:560+r()*640,y:508+r()*150,s:.7+r()*.7,ph:r()*6.28,lamp:r()<.7});
  return{bl,wins,boats,T};
}
/* Giriş ekranı: sol yarıyı sağa aynalar (simetrik şehir), ortada dev ay ve hale */
function drawMenuSym(){
  ctx.save();ctx.translate(W,0);ctx.scale(-1,1);ctx.drawImage(ctx.canvas,0,0,ctx.canvas.width/2,ctx.canvas.height,0,0,W/2,H);ctx.restore();
  const t=S.t;glow(640,250,330,'255,236,190',.16+.03*Math.sin(t*.8));
  ctx.fillStyle='rgba(255,243,207,.12)';ctx.beginPath();ctx.arc(640,250,150,0,7);ctx.fill();
  ctx.strokeStyle='rgba(255,243,207,.16)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(640,250,172,0,7);ctx.stroke();
}
function drawGirne(dim){
  if(!GIR)GIR=girneData();
  const t=S.t,G=GIR;
  ctx.fillStyle=lg(0,0,0,GSEA+10,[[0,'#060a1e'],[.45,'#18225a'],[.75,'#5c4189'],[.93,'#c8706f'],[1,'#f2a878']]);ctx.fillRect(0,0,W,GSEA+10);
  for(const s of STARS){if(s.y>GSEA-90)continue;ctx.globalAlpha=s.a*(.55+.45*Math.sin(t*s.f+s.p));ctx.fillStyle='#fff';ctx.fillRect(s.x,s.y,s.r,s.r);}ctx.globalAlpha=1;
  glow(1120,120,170,'255,236,190',.22);ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.arc(1120,120,36,0,7);ctx.fill();
  ctx.fillStyle='rgba(215,200,150,.5)';[[1108,110,9],[1134,130,7],[1112,138,5]].forEach(c=>{ctx.beginPath();ctx.arc(c[0],c[1],c[2],0,7);ctx.fill();});
  /* Beşparmak dizisi */
  const ridge=(pts,fill,rim)=>{ctx.beginPath();ctx.moveTo(0,GSEA);pts.forEach(p=>ctx.lineTo(p[0],p[1]));ctx.lineTo(W,GSEA);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(rim){ctx.strokeStyle=rim;ctx.lineWidth=1.5;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}};
  ridge([[0,340],[90,300],[160,318],[250,262],[318,296],[410,236],[480,282],[560,258],[640,300],[760,270],[860,312],[980,338],[1100,352],[1280,392]],lg(0,230,0,GSEA,[[0,'#3a4096'],[.6,'#2d2c72'],[1,'#3a2f6d']]),'rgba(255,205,170,.5)');
  ridge([[0,392],[140,356],[260,380],[380,340],[520,378],[700,356],[860,386],[1000,402],[1280,424]],lg(0,330,0,GSEA,[[0,'#262a73'],[1,'#241f55']]),'rgba(255,190,150,.22)');
  /* kasaba */
  G.bl.forEach(b=>{const y=b.base-b.h;ctx.fillStyle=b.c;ctx.fillRect(b.x,y,b.w,b.h+GSEA-b.base+2);if(b.roof){ctx.fillRect(b.x+b.w*.2,y-6,b.w*.3,6);}ctx.fillStyle='rgba(255,200,140,.08)';ctx.fillRect(b.x,y,b.w,2);});
  /* minare */
  const mx=680,mb=G.T(mx)-30;ctx.fillStyle='#262968';ctx.fillRect(mx-5,mb-120,10,120);ctx.fillRect(mx-8,mb-92,16,5);
  ctx.beginPath();ctx.moveTo(mx-6,mb-120);ctx.lineTo(mx,mb-144);ctx.lineTo(mx+6,mb-120);ctx.fill();
  ctx.beginPath();ctx.arc(mx-34,mb-2,22,Math.PI,0);ctx.fill();ctx.fillRect(mx-56,mb-2,44,16);
  /* kale */
  const kc='#38357f';ctx.fillStyle=kc;ctx.fillRect(908,424,188,46);ctx.fillRect(962,372,74,52);
  ctx.fillRect(884,392,44,78);ctx.fillRect(1070,402,40,68);
  [[884,392,44],[1070,402,40],[962,372,74],[908,424,188]].forEach(c=>{for(let x=c[0];x<c[0]+c[2]-5;x+=10)ctx.fillRect(x,c[1]-6,6,6);});
  ctx.fillStyle='rgba(255,236,190,.25)';ctx.fillRect(908,424,188,2);ctx.fillRect(962,372,74,2);ctx.fillStyle='rgba(255,208,130,.9)';[[978,386],[1002,386],[1020,386],[930,440],[1050,440],[896,410],[1082,420]].forEach(w=>{ctx.fillRect(w[0],w[1],5,9);});
  /* deniz */
  ctx.fillStyle=lg(0,GSEA,0,H,[[0,'#101a4a'],[.4,'#0a1236'],[1,'#050818']]);ctx.fillRect(0,GSEA,W,H-GSEA);
  ctx.fillStyle='rgba(255,200,150,.12)';ctx.fillRect(0,GSEA,W,2);
  /* mendirek ve fener */
  ctx.strokeStyle='#0b0c2c';ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1090,GSEA+2);ctx.quadraticCurveTo(1200,GSEA+8,1250,GSEA+62);ctx.stroke();
  const pl=.6+.4*Math.sin(t*2.2);glow(1250,GSEA+56,46,'255,180,80',.7*pl);ctx.fillStyle='#ffc86a';ctx.beginPath();ctx.arc(1250,GSEA+56,3.4,0,7);ctx.fill();
  /* pencere yansımaları */
  G.wins.forEach(w=>{if(w.ri<2||w.y<GSEA-70)return;const dy=GSEA-w.y;const a=.14*(.6+.4*Math.sin(t*1.7+w.ph));ctx.fillStyle='rgba(255,196,120,'+a+')';ctx.fillRect(w.x+Math.sin(t*1.3+w.ph)*2,GSEA+dy*.5,3,Math.min(60,dy)*.9);});
  for(let i=0;i<9;i++){const y=GSEA+12+i*i*3.2,w=60-i*5;ctx.fillStyle='rgba(255,243,207,'+(.22-i*.02)+')';ctx.fillRect(1120-w/2+Math.sin(t*1.5+i)*4,y,w,2);}
  /* tekneler */
  G.boats.slice().sort((a,b)=>a.y-b.y).forEach(b=>{const k=b.s,bob=Math.sin(t*1.2+b.ph)*2.2*k;ctx.save();ctx.translate(b.x,b.y+bob);ctx.rotate(Math.sin(t*.9+b.ph)*.03);ctx.scale(k,k);
    ctx.fillStyle='#0a0b28';ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(30,0);ctx.lineTo(22,12);ctx.lineTo(-24,12);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,190,100,.55)';ctx.fillRect(-26,3,52,2);
    ctx.fillStyle='#0a0b28';ctx.fillRect(-1,-46,2,46);ctx.fillStyle='rgba(205,208,240,.4)';ctx.beginPath();ctx.moveTo(3,-44);ctx.lineTo(24,-6);ctx.lineTo(3,-6);ctx.fill();
    if(b.lamp){glow(0,-48,16,'255,190,90',.6);ctx.fillStyle='#ffd98a';ctx.fillRect(-1.5,-50,3,3);}
    ctx.restore();ctx.fillStyle='rgba(255,190,100,.1)';ctx.fillRect(b.x-18*k+Math.sin(t+b.ph)*3,b.y+14*k,36*k,2);});
  /* yanan pencereler */
  G.wins.forEach(w=>{let a=w.a;if(w.fl)a*=(Math.sin(t*(1.1+w.ph*.2)+w.ph*9)>.35?1:.12);ctx.fillStyle='rgba(255,206,128,'+a+')';ctx.fillRect(w.x,w.y,5,8);});
  glow(0,GSEA-60,300,'255,170,90',.05);
  if(dim){ctx.fillStyle='rgba(5,8,26,'+dim+')';ctx.fillRect(0,0,W,H);}
}
/* ---------- gri tema: sis / toz / buğu + kızıl alarm ---------- */
const FOG={lv:0,last:0,blobs:[]};
for(let i=0;i<16;i++)FOG.blobs.push({x:(i*197)%1500,y:60+((i*131)%620),r:150+((i*53)%150),v:(i%2?1:-1)*(10+(i*7)%22),ph:i*1.7});
function fogTarget(m){
  if(m==='quake'){const q=R.q;return clamp(.5+(S.shake||0)*.5,0,1)*(q&&q.t<14?1:.7);}
  if(m==='after'){const a=R.after;if(!a)return .15;
    if(R.L.aft&&(a.as===1||a.as===2))return clamp(.45+(S.shake||0)*.5,0,1);   /* artçı */
    return clamp(.38-a.t*.012,.1,.38);}                                        /* ana depremin ardından çöken toz */
  return 0;
}
function drawAtmos(m){
  const now=performance.now()/1000,dt=Math.min(.1,now-(FOG.last||now));FOG.last=now;
  const tg=fogTarget(m);FOG.lv+=(tg-FOG.lv)*Math.min(1,dt*(tg>FOG.lv?2.2:.6));
  const L=FOG.lv;if(L<.015)return;
  /* genel buğu perdesi: kontrastı düşürür */
  ctx.fillStyle='rgba(128,129,133,'+(L*.06)+')';ctx.fillRect(0,0,W,H);
  for(const b of FOG.blobs){
    const x=((b.x+now*b.v*3)%(W+400)+(W+400))%(W+400)-200,y=b.y+Math.sin(now*.6+b.ph)*26,r=b.r*(1.2+L*.6),a=L*.6*(.2+.12*Math.sin(now*.9+b.ph));
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(176,177,181,'+a+')');g.addColorStop(.35,'rgba(176,177,181,'+(a*.7)+')');g.addColorStop(.7,'rgba(176,177,181,'+(a*.25)+')');g.addColorStop(1,'rgba(176,177,181,0)');
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  /* yerden kalkan toz bulutu */
  const g2=ctx.createLinearGradient(0,H,0,H*.45);g2.addColorStop(0,'rgba(160,160,164,'+(L*.5)+')');g2.addColorStop(1,'rgba(160,160,164,0)');ctx.fillStyle=g2;ctx.fillRect(0,H*.45,W,H*.55);
}
/* kızıl alarm: gri dünyada yalnızca acil durumda kırmızı belirir */
let _alarmLast=-1;
function alarmUpdate(m){
  const el=document.getElementById('alarmfx');if(!el)return;
  let v=0;
  if(m==='quake'||m==='after'){
    const a=R&&R.after;v=(S.shake||0)*.85;
    if(a&&R.L.scn==='fire'&&a.fire)v=Math.max(v,.35+.35*Math.sin(S.t*6)*.5+.15);
    if(a&&R.L.scn==='gas'&&a.gasLvl>55)v=Math.max(v,.3);
    if(a&&R.L.aft&&a.as===1)v=Math.max(v,.55+.25*Math.sin(S.t*14));
  }
  v=clamp(v,0,1);if(Math.abs(v-_alarmLast)>.02){_alarmLast=v;el.style.opacity=(v*.4).toFixed(2);}
}
function render(){
  ctx=ctxMain;ctx.setTransform(QK,0,0,QK,0,0);
  ctxTop.setTransform(QK,0,0,QK,0,0);ctxTop.clearRect(0,0,W,H);
  const m=S.mode;alarmUpdate(m);
  if(m==='cmap'||m==='cres'){ctx.fillStyle='#070a0e';ctx.fillRect(0,0,W,H);return;}
  if(m==='menu'||m==='levels'||m==='drill'||m==='gameover'){drawGirne(m==='menu'?0:m==='levels'?.35:.6);if(m==='menu')drawMenuSym();ctx.fillStyle=rg(W/2,H/2,H*.35,H*.95,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.45)']]);ctx.fillRect(0,0,W,H);return;}
  if(m==='sim'||m==='result'||(m==='camp'&&R.sim)){drawCamp();}
  else{
    const qn=matchMedia('(prefers-reduced-motion: reduce)').matches?0:(S.shake||0);
    const sh=qn>0?{r:(Math.random()-.5)*qn*.007,x:(Math.random()-.5)*qn*7,y:(Math.random()-.5)*qn*7*.7}:null;
    const shake=c=>{if(sh){c.translate(W/2,H/2);c.rotate(sh.r);c.translate(-W/2+sh.x,-H/2+sh.y);}};
    ctx.save();shake(ctx);
    drawBackdrop();
    ctx.save();ctx.translate(cam.tx,cam.ty);ctx.scale(cam.s,cam.s);drawWorld();ctx.restore();
    if((R.L.dark&&(m==='quake'||m==='after'))||exitDark())drawDark();
    ctx.restore();
    if(m==='quake'||m==='after')drawAtmos(m);
    /* renkli işlevsel katman (yangın, işaretler, seçim): gri filtreden etkilenmez */
    ctx=ctxTop;ctx.save();shake(ctx);ctx.save();ctx.translate(cam.tx,cam.ty);ctx.scale(cam.s,cam.s);
    if(m==='prep'||m==='quake'||m==='after')drawFires();
    if(m!=='menu'&&m!=='levels')drawOverlays();
    ctx.restore();ctx.restore();ctx=ctxMain;
    if(qn>0){ctx.fillStyle='rgba(239,71,111,'+(.06*qn)+')';ctx.fillRect(0,0,W,H);}
    if(R.L.scn==='wild'&&m==='quake'){ctx.fillStyle='rgba(255,90,30,.05)';ctx.fillRect(0,0,W,H);}
  }
  ctx.fillStyle=rg(W/2,H/2,H*.35,H*.95,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.5)']]);ctx.fillRect(0,0,W,H);
}


function drawShelterTargets(){
  for(const sp of [TABLE,DESK]){
    const assigned=shelterAssigned(sp),free=sp.slots.length-assigned.length;
    const mid=(sp.x0+sp.x1)/2;
    fillRR(mid-69,431,138,23,5,'#101932');
    txt((sp===TABLE?'Q':'E')+' · '+(free?free+' BOŞ YER':'DOLU'),mid,443,14,free?'#91e4c6':'#ffd482');
    for(const slot of sp.slots){
      const p=assigned.find(p=>p.tx===slot),sel=p&&p.id===R.sel;
      ctx.beginPath();ctx.ellipse(slot,553,10,4,0,0,Math.PI*2);
      ctx.fillStyle=p?'#ffd482':'#91e4c655';ctx.fill();ctx.strokeStyle=sel?'#fff':p?'#ffd482':'#91e4c6';ctx.lineWidth=2;ctx.stroke();
    }
  }
  for(const p of R.people){
  if(p.spot&&!p.down&&!p.hidden&&p.state==='walk'){
    ctx.save();ctx.strokeStyle='#ffe0a1';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p.x,541);ctx.lineTo(p.tx,541);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.moveTo(p.tx-5,532);ctx.lineTo(p.tx,541);ctx.lineTo(p.tx+5,532);ctx.strokeStyle='#ffe0a1';ctx.lineWidth=2;ctx.stroke();
  }
  }
}

/* Tam ekran, özgün Canvas deprem sekansı. Oyun saati bu sırada ilerlemez. */
let CIN=null;
function cancelCinema(){if(!CIN)return;CIN=null;const el=document.getElementById('cinema');if(el)el.remove();}
function startCinema(kind,done){
  cancelCinema();if(kind!=='city')Object.assign(cam,CAMS[kind==='arrival'?'prep':'quake']);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el=document.createElement('section');el.id='cinema';el.setAttribute('role','dialog');el.setAttribute('aria-label','Deprem geçiş sahnesi');
  el.innerHTML='<canvas width="1280" height="720" aria-hidden="true"></canvas><div class="cinema-bars"></div><div class="cinema-heading"><span>FAYT</span><i>GİRNE · '+(kind==='city'?'ŞEHİR':kind==='arrival'?'ŞEHİRDEN EVE':'EVİN İÇİ')+'</i></div><div class="cinema-copy" aria-live="polite"><small></small><h1></h1><p></p></div><div class="cinema-bottom"><span>ESC · DURAKLAT &nbsp; M · SES</span><button class="btn sm" data-act="cinemaskip">Sahneyi geç · Enter →</button></div><div class="cinema-progress"><i></i></div>';
  ui.appendChild(el);
  CIN={kind,done,t:0,dur:reduced?2.4:kind==='city'?7.6:kind==='arrival'?3.8:4.6,reduced,el,ctx:el.querySelector('canvas').getContext('2d'),phase:-1,buildings:[]};
  for(let z=8;z>=0;z--)for(let x=0;x<11;x++){const n=z*11+x,site=SITES[(Math.floor(z/3)*3+Math.floor(x/4))%SITES.length];CIN.buildings.push({x:(x-5)*92,z:z*100-170,w:42+(n*7%23),h:65+(n*37%150),site,n});}
  if(kind!=='arrival'){Sfx.calm(false);Sfx.rumble(true);Sfx.rumbleLevel(.04);}
  el.querySelector('button').focus();updateCinema(0);
}
function finishCinema(){if(!CIN)return;const c=CIN,fn=c.done;cancelCinema();if(c.kind==='city')Sfx.rumble(false);else if(c.kind==='house')Sfx.rumbleLevel(.04);if(fn)fn();else{const target=document.querySelector(S.mode==='prep'?'#bag button:not(:disabled)':'.shelter-dock button:not(:disabled)');if(target)target.focus();}}
function updateCinema(dt){
  const c=CIN;if(!c)return;c.t+=dt;if(c.t>=c.dur){finishCinema();return;}
  const u=c.t/c.dur,phase=u<.23?0:u<.61?1:2;
  if(c.kind!=='arrival')Sfx.rumbleLevel(c.reduced?.08:phase===0?.04:phase===1?.42:.12);
  c.el.querySelector('.cinema-progress i').style.width=(u*100)+'%';
  if(c.phase===phase)return;c.phase=phase;c.el.dataset.phase=phase;
  const prepared=c.kind==='city'?SITES.filter(s=>CT.lv[s.id]>=2&&!ctBurning(s.id)).length:R.L.hz.filter(k=>R.fixed[k]&&k!=='boxes').length;
  const lines=c.kind==='arrival'?[['GİRNE','BİR ŞEHİRDEN…','Verdiğin kararların izini takip ediyoruz.'],['KONUTLAR MAHALLESİ','…BİR EVİN İÇİNE.','Şimdi bu ailenin hazırlığı sana emanet.'],['SIFIRDAN HAZIRLIK','ÇANTAN BOŞ. KARAR SENİN.','Malzemelerini seç. Eşyaları kontrol et. Aileni koru.']]:c.kind==='city'?[
    ['BİRKAÇ SANİYE ÖNCE','ŞEHİR NEFES ALIYORDU.','Sonra bütün ışıklar kesildi.'],
    ['SARSINTI','HER ŞEY AYNI ANDA DEĞİŞTİ.','Sarsıntı sırasında çök · kapan · tutun.'],
    ['KARANLIĞIN İÇİNDE',prepared?'SENİN ÖNLEMLERİN DEVREDE.':'IŞIKLAR GERİ GELMEDİ.',prepared?prepared+' bölgede aldığın önlemler şimdi fark yaratıyor.':'Hazırlık eksikliği bütün şehri etkiliyor.']
  ]:[['EVİN İÇİNDE','SON SAKİN SANİYE.',R.bag.length?'Çantanı kendin hazırladın. Şimdi kararların sınanacak.':'Çantan boş. Şimdi evdeki kararların sınanacak.'],['SARSINTI BAŞLIYOR','YER AYAĞININ ALTINDAN KAYIYOR.','Sahne bitince aileni sağlam masaların altına yönlendir.'],['KONTROL SANA GEÇİYOR','ŞİMDİ SENİN SIRAN.',prepared?prepared+' eşya için önlem aldın. Aileni koru.':'Sabitlenmeyen eşyalar tehlikeli. Aileni koru.']];
  const line=lines[phase],copy=c.el.querySelector('.cinema-copy');copy.querySelector('small').textContent=line[0];copy.querySelector('h1').textContent=line[1];copy.querySelector('p').textContent=line[2];
  if(phase===1&&!c.reduced&&c.kind!=='arrival')Sfx.impact('ceil');
}
function drawCinema(){
  const c=CIN;if(!c)return;const g=c.ctx,t=c.t,u=t/c.dur,shake=c.reduced||c.phase!==1||c.kind==='arrival'?0:Math.sin(t*59)*5;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1280,720);g.save();g.translate(shake,Math.sin(t*71)*shake*.45);
  if(c.kind==='house'||c.kind==='arrival'&&u>=.5){
    g.fillStyle='#03080e';g.fillRect(-20,-20,1320,760);
    const zoom=c.reduced?1:c.kind==='arrival'?1.45-(u-.5)*.7:1.04+u*.24;g.save();g.translate(820,390);g.scale(zoom,zoom);g.drawImage(cv,-820,-390,1280,720);g.restore();
    g.fillStyle=c.phase===1&&c.kind==='house'?'#02060bc9':'#02060b50';g.fillRect(-20,-20,1320,760);
    if(c.phase===2){const beam=g.createRadialGradient(760,390,20,760,390,650);beam.addColorStop(0,'#fcebd130');beam.addColorStop(1,'#02070bef');g.fillStyle=beam;g.fillRect(0,0,1280,720);}
  }else{
    const renderPhase=c.kind==='arrival'?2:c.phase;
    const sky=g.createLinearGradient(0,0,0,720);sky.addColorStop(0,'#030b20');sky.addColorStop(.48,'#6b5356');sky.addColorStop(1,'#061826');g.fillStyle=sky;g.fillRect(-20,-20,1320,760);
    g.fillStyle='#e8e8dc';g.beginPath();g.arc(1040,125,31,0,Math.PI*2);g.fill();
    const angle=c.reduced?.12:.12+u*.12,ca=Math.cos(angle),sa=Math.sin(angle),camera=c.reduced?900:1080-u*260;
    const P=(x,y,z)=>{const xx=x*ca-z*sa,zz=z*ca+x*sa,k=850/Math.max(160,zz+camera);return[640+xx*k,235+(210-y)*k];};
    const poly=(pts,col)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=col;g.fill();};
    poly([P(-900,0,-350),P(900,0,-350),P(900,0,1500),P(-900,0,1500)],'#091725');
    for(let x=-550;x<=550;x+=92){g.strokeStyle='#7fa8ba20';g.lineWidth=10;g.beginPath();g.moveTo(...P(x-15,0,-300));g.lineTo(...P(x-15,0,1100));g.stroke();}
    for(const b of c.buildings){
      const ready=CT&&CT.lv[b.site.id]>=2&&!ctBurning(b.site.id),on=renderPhase===0||renderPhase===2&&ready;
      const j=c.reduced||renderPhase!==1?0:Math.sin(t*25+b.n)*3,xx=b.x+j,z=b.z,w=b.w,h=b.h;
      poly([P(xx,0,z),P(xx+w,0,z),P(xx+w,h,z),P(xx,h,z)],ready&&renderPhase===2?'#274e5a':'#253142');
      poly([P(xx+w,0,z),P(xx+w,0,z+w),P(xx+w,h,z+w),P(xx+w,h,z)],'#101f30');
      poly([P(xx,h,z),P(xx+w,h,z),P(xx+w,h,z+w),P(xx,h,z+w)],ready&&renderPhase===2?'#81b8b3':'#45556a');
      for(let y=15;y<h-10;y+=22)for(let x=7;x<w-6;x+=14)poly([P(xx+x,y,z-.2),P(xx+x+6,y,z-.2),P(xx+x+6,y+11,z-.2),P(xx+x,y+11,z-.2)],on?(ready&&renderPhase===2?'#a7ffe0':'#e3bc78'):'#0b1524');
      if(renderPhase===2&&ready){const q=P(xx+w/2,h,z);g.save();g.globalAlpha=.17;poly([[q[0]-30,q[1]],[q[0]+30,q[1]],[q[0]+100,0],[q[0]-100,0]],'#a4ffe2');g.restore();}
    }
    if(renderPhase===1&&!c.reduced){g.strokeStyle='#ffc58f';g.lineWidth=3;g.beginPath();for(let i=0;i<12;i++){const q=P(-600+i*110,1,Math.sin(i*2)*90);if(i)g.lineTo(...q);else g.moveTo(...q);}g.stroke();}
    if(renderPhase===2&&ctRouteReady()){g.strokeStyle='#9bffe0';g.lineWidth=7;g.shadowColor='#67ffd3';g.shadowBlur=15;g.beginPath();g.moveTo(...P(-400,1,-210));g.lineTo(...P(-250,1,60));g.lineTo(...P(450,1,60));g.stroke();g.shadowBlur=0;}
  }
  if(!c.reduced&&c.phase!==0){for(let i=0;i<100;i++){const x=(i*139+t*(8+i%7))%1320,y=(i*83-t*(5+i%13)+1440)%760;g.fillStyle='rgba(236,219,190,'+(.08+(i%4)*.035)+')';g.beginPath();g.arc(x,y,1+i%4,0,Math.PI*2);g.fill();}}
  if(c.kind==='arrival'&&!c.reduced&&Math.abs(u-.5)<.09){g.fillStyle='rgba(2,6,12,'+(1-Math.abs(u-.5)/.09)+')';g.fillRect(0,0,1280,720);}
  const shade=g.createLinearGradient(0,0,0,720);shade.addColorStop(0,'#02071190');shade.addColorStop(.35,'#02071100');shade.addColorStop(1,'#020711f5');g.fillStyle=shade;g.fillRect(0,0,1280,720);g.restore();
}
