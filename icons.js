/* =========================================================
   icons.js — oyun içi SVG ikon seti (emoji yerine)
   ico('flame') → <svg class="ic ic-flame">…</svg>  (renk: currentColor / CSS)
   person('kid'|'adult'|'old'|'injured'|'baby'|'tourist', seed) → çizilmiş küçük karakter
   face('scared'|'neutral'|'calm', seed) → çizilmiş yüz
   Tüm çizimler ekibin AI destekli üretimidir (bkz. KAYNAKLAR.md).
   ========================================================= */
const ICO={
  anchor:'<circle cx="12" cy="5" r="2.3"/><path d="M12 7.3V21M7.5 11H16.5M4 14c.6 4 4 7 8 7s7.4-3 8-7"/><path d="M2.6 12.6L4 14.2l1.6-1.6M18.4 12.6L20 14.2l1.4-1.6"/>',
  wall:'<path class="f" d="M3 21V8h3v2h2V8h3v2h2V8h3v2h2V8h3v13z"/><path d="M10 21v-4.5a2 2 0 014 0V21M6 14h.01M18 14h.01"/>',
  school:'<path class="f" d="M3 21V10l9-5 9 5v11z"/><path d="M9 21v-6h6v6M12 5V2.2l4 1.4-4 1.4"/><circle cx="12" cy="11" r="1.4"/>',
  hospital:'<rect class="f" x="4" y="3.5" width="16" height="17.5" rx="2"/><path d="M12 7.5v6M9 10.5h6M10 21v-3.5h4V21"/>',
  mosque:'<path class="f" d="M3 21v-6c0-3.3 2.7-6 6-6s6 2.7 6 6v6z"/><path d="M9 9V6M7.6 6h2.8"/><path class="f" d="M18 21V10l1.5-3.5L21 10v11z"/><path d="M19.5 6.5V4"/>',
  shop:'<path class="f" d="M4 11v10h16V11"/><path d="M3 10l2-6h14l2 6c0 1.5-1.3 2.6-2.5 2.6S16 11.5 16 10c0 1.500-1.300 2.600-2 2.600S12 11.500 12 10c0 1.500-1.300 2.600-2 2.600S8 11.500 8 10c0 1.500-1.300 2.600-2.500 2.600S3 11.500 3 10z"/><path d="M10 21v-5h4v5"/>',
  houses:'<path class="f" d="M2.5 21v-8L8 8.500l5.500 4.500v8z"/><path d="M13.500 21v-6.500L17.500 11l4 3.500V21M8 21v-4"/>',
  drop:'<path class="f" d="M12 3s6 6.500 6 11a6 6 0 01-12 0c0-4.500 6-11 6-11z"/><path d="M9.500 15a2.500 2.500 0 002.500 2.500"/>',
  truck:'<rect class="f" x="2" y="9.500" width="14" height="7.500" rx="1"/><path d="M16 11.500h3.500l2.500 3V17h-6M4.500 9.500l7-4.500"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  ambulance:'<rect class="f" x="2" y="8" width="14" height="9" rx="1"/><path d="M16 10.500h3.500l2.500 3.500V17h-6M9 10.500v4M7 12.500h4"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  flame:'<path class="f" d="M12 2.500c1 4.500 5.500 6 5.500 11a5.500 5.500 0 01-11 0c0-2 1-3.500 2.200-4.500.3 1.600 1 2.300 2 2.600C10.200 8.800 10.500 5.500 12 2.500z"/><path d="M12 21a2.600 2.600 0 01-2.600-2.600c0-1.600 1.300-2.300 2.600-3.700 1.300 1.400 2.600 2.100 2.600 3.700A2.600 2.600 0 0112 21z"/>',
  gas:'<path class="f" d="M7 16a4 4 0 01-.6-7.900A5.500 5.500 0 0117 8.500 3.800 3.800 0 0117.500 16z"/><path d="M5 19.500c1.500-1 2.500 1 4 0s2.500-1 4 0 2.500 1 4 0 1.500-.5 2-.3"/>',
  megaphone:'<path class="f" d="M3 10v4h4l8 4V6L7 10z"/><path d="M18 9a4 4 0 010 6M7 14l1.200 6h3L10 15"/>',
  barrier:'<path d="M4 21V8M20 21V8"/><rect class="f" x="2" y="6.500" width="20" height="5" rx="1"/><rect class="f" x="2" y="13" width="20" height="4" rx="1"/><path d="M6 6.500l-3 5M11 6.500l-3 5M16 6.500l-3 5M21 6.500l-3 5"/>',
  siren:'<path class="f" d="M6 18v-5a6 6 0 0112 0v5z"/><path d="M4 21h16M12 2.500v2M3.500 6l1.500 1.200M20.500 6L19 7.200M10 13a2 2 0 012-2"/>',
  shield:'<path class="f" d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500 5-5"/>',
  warn:'<path class="f" d="M12 3l10 18H2z"/><path d="M12 10v5M12 17.800v.4"/>',
  bolt:'<path class="f" d="M13 2L4 14h6l-1 8 9-12h-6z"/>',
  door:'<rect class="f" x="6" y="3" width="12" height="18" rx="1.200"/><path d="M15 12v.01M3 21h18"/>',
  bandage:'<g transform="rotate(-40 12 12)"><rect class="f" x="2" y="8" width="20" height="8" rx="4"/><rect x="9" y="8" width="6" height="8"/><path d="M11 11h.01M13 11h.01M11 13h.01M13 13h.01"/></g>',
  fuel:'<rect class="f" x="4" y="3.500" width="9" height="17.500" rx="1.200"/><path d="M13 9h2.500a1.500 1.500 0 011.500 1.500V16a1.500 1.500 0 003 0V8L17 5M7 8h3"/>',
  lock:'<rect class="f" x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3M12 15v2"/>',
  brick:'<rect class="f" x="3" y="6" width="18" height="12" rx="1"/><path d="M3 12h18M9 6v6M15 12v6"/>',
  rock:'<path class="f" d="M3.500 17.500l2.500-7 5-4.500 6 2 3.500 6.500-2 5.500H6.500z"/><path d="M11 6l1 5.500-3.500 3M17 8l-5 3.500"/>',
  search:'<circle class="f" cx="10.500" cy="10.500" r="6"/><path d="M15 15l6 6"/>',
  valve:'<path d="M2 18h7M15 18h7M12 15V8M7 8h10"/><circle class="f" cx="12" cy="18" r="3.200"/>',
  pole:'<path d="M12 3v18M5 7h14M7 11.500h10"/><path class="f" d="M10 21h4l-.5-3h-3z"/>',
  minaret:'<path class="f" d="M10 21l1-13h2l1 13z"/><path d="M12 8V3M10.500 11h3"/>',
  tent:'<path class="f" d="M2 20L12 4l10 16z"/><path d="M12 4v16M9 20l3-6 3 6"/>',
  tap:'<path d="M4 8h8a3 3 0 013 3v1M15 12h3M7 8V5h5v3"/><path class="f" d="M17.500 15s2.200 2.300 2.200 3.800a2.200 2.200 0 01-4.400 0c0-1.500 2.200-3.800 2.200-3.800z"/>',
  firstaid:'<rect class="f" x="3" y="7" width="18" height="13" rx="2"/><path d="M8.500 7V5h7v2M12 10.500v6M9 13.500h6"/>',
  clipboard:'<rect class="f" x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.500 12h7M8.500 16h5"/>',
  boat:'<path class="f" d="M3 16h18l-3 4.500H6z"/><path d="M12 3v12.500M12 4l6 9.500h-6M10.500 6.500L6 13.500h4.500"/>',
  extinguisher:'<rect class="f" x="8" y="8" width="8" height="13" rx="2.200"/><path d="M10 8V5h4v3M14 5h3.500l2.500 2M12 12.500v4.500"/>',
  pin:'<circle class="f" cx="9" cy="12" r="5"/><path d="M14 12h7.500M3 12h1"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  sweep:'<path d="M3 12h18M17 8l4 4-4 4M7 8l-4 4 4 4"/>',
  window:'<rect class="f" x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/>',
  wrench:'<path class="f" d="M14.500 6.500a4 4 0 00-5 5L3 18l3 3 6.500-6.500a4 4 0 005-5L15 12l-2.500-.5L12 9z"/>',
  bulb:'<path class="f" d="M12 2.500a6 6 0 00-3.500 10.900c.5.400.5 1.100.5 1.600h6c0-.5 0-1.200.5-1.600A6 6 0 0012 2.500z"/><path d="M9 18h6M10 21h4"/>',
  phone:'<rect class="f" x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18.500h2"/>',
  cable:'<path d="M3 6c6 0 4 11 10 11"/><path class="f" d="M13 14.500h4v6h-4z"/><path d="M15 14.500v-2M20 4l-3 4h3l-3 4"/>',
  box:'<path class="f" d="M3 8l9-5 9 5v9l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/>',
  cylinder:'<rect class="f" x="7" y="7" width="10" height="14" rx="4"/><path d="M10 7V4h4v3M9 13h6"/>',
  meat:'<path class="f" d="M14 4a6 6 0 11-2 11.600L7 21l-3-3 5.400-5A6 6 0 0114 4z"/>',
  cup:'<path class="f" d="M4 8h12v6a5 5 0 01-5 5H9a5 5 0 01-5-5z"/><path d="M16 9.500h2a2.500 2.500 0 010 5h-2M7 3v2M11 3v2"/>',
  leaf:'<path class="f" d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15z"/><path d="M5 19l8-8"/>',
  spool:'<rect class="f" x="6" y="3" width="12" height="18" rx="2"/><path d="M6 8h12M6 16h12M9 11l6 2"/>',
  scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.500 8l12 10M8.500 16L20.500 6"/>',
  cart:'<path class="f" d="M5 7h16l-2 8H8z"/><path d="M2 3h3l3 12h11"/><circle cx="9" cy="19.500" r="1.500"/><circle cx="18" cy="19.500" r="1.500"/>',
  plug:'<path class="f" d="M8 8h8v4a4 4 0 01-8 0z"/><path d="M10 8V3M14 8V3M12 16v5"/>',
  map:'<path class="f" d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  home:'<path class="f" d="M3 11l9-7.500 9 7.500v10H3z"/><path d="M9.500 21v-6h5v6"/>',
  game:'<rect class="f" x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.500v4M5 12.500h4M16 11.500h.01M18.500 13.500h.01"/>',
  bulb2:'<circle class="f" cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v5"/>',
  check:'<path d="M4 12.500l5 5L20 6.500"/>',
  cross:'<path d="M5 5l14 14M19 5L5 19"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  rubble:'<path class="f" d="M2 20l4-8 4 3 3-6 4 5 5 6z"/><path d="M5 20l3-3M13 20l2-3"/>',
  fault:'<path d="M3 20l5-6 3 3 5-8 5-4"/>',
  hazard:'<path class="f" d="M12 3l9.500 17H2.500z"/><path d="M12 9.500v5M12 17.300v.4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.500 2"/>',
  coin:'<path class="f" d="M12 2.500l9 9.500-9 9.500L3 12z"/>',
  turn:'<path d="M4 12a8 8 0 0114-5.300M20 12a8 8 0 01-14 5.300M18 3v4h-4M6 21v-4h4"/>'
};
function ico(n,cls){return '<svg class="ic ic-'+n+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICO[n]||ICO.warn)+'</svg>';}

/* ---------- çizilmiş insanlar ve yüzler ---------- */
const SKIN=['#f1c9a5','#e0a77d','#c98a5e','#8d5a3b','#f6d6bd'],HAIR=['#2a1d18','#5a3825','#b5762c','#1c1c24','#8c8c96'];
const SHIRT=['#3ccfb0','#ff8a5c','#7a8cff','#ffd23f','#ff6f91','#5cc8ff','#9be08a','#c792ea'];
function person(type,seed){
  seed=seed||0;const sk=SKIN[seed%SKIN.length],hr=HAIR[(seed*3+1)%HAIR.length],sh=SHIRT[(seed*5+2)%SHIRT.length];
  const kid=type==='kid',baby=type==='baby',old=type==='old',inj=type==='injured',tour=type==='tourist';
  const s=baby?.62:kid?.78:1,hy=baby?17:kid?14:11;
  let svg='<svg class="pp pp-'+type+'" viewBox="0 0 40 48" aria-hidden="true"><g transform="translate(20 48) scale('+s+') translate(-20 -48)">';
  svg+='<path d="M7 47c0-9 5-15 13-15s13 6 13 15z" fill="'+(old?'#9aa5d1':sh)+'"/>';
  if(inj)svg+='<path d="M13 36l-5 8" stroke="#eef1ff" stroke-width="3.500" stroke-linecap="round"/><path d="M27 34l2 11" stroke="#ff5d5d" stroke-width="3" stroke-linecap="round" opacity=".85"/>';
  svg+='<rect x="17" y="27" width="6" height="6" rx="2" fill="'+sk+'"/><circle cx="20" cy="'+(hy+8)+'" r="9" fill="'+sk+'"/>';
  if(old)svg+='<path d="M11 '+(hy+7)+'a9 9 0 0118 0c-2-4-5-5-9-5s-7 1-9 5z" fill="#d8dcec"/><path d="M30 38v10" stroke="#8d6b3a" stroke-width="2.500" stroke-linecap="round"/>';
  else if(tour)svg+='<path d="M9 '+(hy+6)+'h22M12 '+(hy+6)+'a8 5 0 0116 0z" fill="#ffd23f" stroke="#c9a017" stroke-width="1"/><rect x="26" y="37" width="9" height="6" rx="1.500" fill="#2a2d44"/><circle cx="30.500" cy="40" r="1.700" fill="#9aa5d1"/>';
  else svg+='<path d="M11 '+(hy+8)+'a9 9.500 0 0118 0c0-2-3-6-9-6s-9 4-9 6z" fill="'+hr+'"/>';
  if(inj)svg+='<rect x="11.500" y="'+(hy+1)+'" width="17" height="4.500" rx="2" fill="#eef1ff"/><path d="M22 '+(hy+1)+'v4.500" stroke="#ff5d5d" stroke-width="1.500"/>';
  svg+='<circle cx="16.500" cy="'+(hy+9)+'" r="1.200" fill="#1a1630"/><circle cx="23.500" cy="'+(hy+9)+'" r="1.200" fill="#1a1630"/><path d="M17.500 '+(hy+13)+'q2.500 1.700 5 0" stroke="#1a1630" stroke-width="1.100" fill="none" stroke-linecap="round"/>';
  return svg+'</g></svg>';
}
function face(mood,seed){
  seed=seed||0;const sk=SKIN[seed%SKIN.length],hr=HAIR[(seed*3+1)%HAIR.length],bg={scared:'#ff5d5d',neutral:'#7a8cff',calm:'#3ccfb0'}[mood]||'#7a8cff';
  let m,e;
  if(mood==='scared'){e='<circle cx="15" cy="19" r="2.600" fill="#fff"/><circle cx="25" cy="19" r="2.600" fill="#fff"/><circle cx="15" cy="19.400" r="1.200" fill="#1a1630"/><circle cx="25" cy="19.400" r="1.200" fill="#1a1630"/><path d="M11.500 13.500l5 1.500M28.500 13.500l-5 1.500" stroke="#1a1630" stroke-width="1.400" stroke-linecap="round"/>';m='<ellipse cx="20" cy="28" rx="3.200" ry="4" fill="#1a1630"/><path d="M33 9v5M6 12l-3 3" stroke="#9fd8ff" stroke-width="1.800" stroke-linecap="round"/>';}
  else if(mood==='calm'){e='<path d="M12.500 19q2.500-2.500 5 0M22.500 19q2.500-2.500 5 0" stroke="#1a1630" stroke-width="1.500" fill="none" stroke-linecap="round"/>';m='<path d="M14.500 26q5.500 4.500 11 0" stroke="#1a1630" stroke-width="1.500" fill="none" stroke-linecap="round"/>';}
  else{e='<circle cx="15" cy="19" r="1.500" fill="#1a1630"/><circle cx="25" cy="19" r="1.500" fill="#1a1630"/>';m='<path d="M15.500 27h9" stroke="#1a1630" stroke-width="1.500" stroke-linecap="round"/>';}
  return '<svg class="fc fc-'+mood+'" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="'+bg+'" opacity=".22"/><circle cx="20" cy="21" r="12.500" fill="'+sk+'"/><path d="M7.500 19a12.500 13 0 0125 0c-2-6-6-8-12.500-8S9.500 13 7.500 19z" fill="'+hr+'"/>'+e+m+'</svg>';
}
