(() => {
  'use strict';
  const MATRIX_SPEED=3;
  const HERO_SIZE=112347;
  const HERO_SHA256='bf857c01b3083c8d27be9218c4a1437cb51af9b64b1ecbb8b309ba9135f47558';
  const HERO_CACHE='rotund-operator-4k-avif-v1';
  const HERO_REPO='ger1e/learning-bash-scripting-3212393';
  const HERO_SHAS=[
    '8e287ce159702931c9a0a75cff970761b7ddf9b2','30d21f3779df7c59e2b0f66cb9d05d065a43c773','a916a0a1cb0f8e3344bb1efdee61ef40c4fd9951',
    '20cd56986372b435baf1176e27d4502aa88fa502','c166dd56763fc4bdecbf07dc58fa45035b13ba6c','33a8c292781c43227540ab14d1ac5ea5b67ab56a',
    '5a8225fdc6dc431ca737a308898169bf43610c97','da72abbd999b09cb979e4b27f4cd94e3e51917f0','031e20833a91c25832ddd53b9cd0badd73e6955d'
  ];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.getElementById('matrix');
  const stage=document.getElementById('stage');
  const copy=document.getElementById('copy');
  const operator=document.getElementById('operator');
  const operatorImage=document.getElementById('operatorImage');
  const ring=document.getElementById('cursorRing');
  const soundToggle=document.getElementById('soundToggle');
  const soundLabel=document.getElementById('soundLabel');
  let audio=null,armed=false,last=0,raf=0,drops=[],width=0,height=0,dpr=1;
  const ctx=canvas.getContext('2d',{alpha:true});
  const glyphs='01<>/\\[]{}#@*+CTIHUNTVERIFYENRICHEXPLAIN';

  const hex=buf=>[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  const asciiFromBase64=b64=>atob(b64.replace(/\s+/g,''));
  const bytesFromBase64=b64=>{const bin=atob(b64.replace(/\s+/g,''));const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return bytes;};

  async function verifiedHeroBytes(encoded){
    const bytes=bytesFromBase64(encoded);
    if(bytes.length!==HERO_SIZE)throw new Error('hero-size');
    if(String.fromCharCode(...bytes.slice(4,8))!=='ftyp')throw new Error('hero-format');
    const digest=hex(await crypto.subtle.digest('SHA-256',bytes));
    if(digest!==HERO_SHA256)throw new Error('hero-digest');
    return bytes;
  }

  async function fetchHeroBase64(){
    try{const cached=localStorage.getItem(HERO_CACHE);if(cached)return cached;}catch{}
    const fragments=await Promise.all(HERO_SHAS.map(async sha=>{
      const r=await fetch(`https://api.github.com/repos/${HERO_REPO}/git/blobs/${sha}`,{headers:{Accept:'application/vnd.github+json'}});
      if(!r.ok)throw new Error(`hero-source-${r.status}`);
      const obj=await r.json();
      return asciiFromBase64(obj.content).trim();
    }));
    const encoded=fragments.join('');
    try{localStorage.setItem(HERO_CACHE,encoded);}catch{}
    return encoded;
  }

  async function loadHero(){
    try{
      const encoded=await fetchHeroBase64();
      const bytes=await verifiedHeroBytes(encoded);
      const url=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));
      operatorImage.addEventListener('load',()=>{operator.classList.remove('loading','asset-failed');operator.classList.add('loaded');operator.setAttribute('aria-busy','false');},{once:true});
      operatorImage.src=url;
      addEventListener('pagehide',()=>URL.revokeObjectURL(url),{once:true});
    }catch(err){
      console.warn('4K operator asset unavailable',err);
      operator.classList.remove('loading');operator.classList.add('asset-failed');operator.setAttribute('aria-busy','false');
      setTimeout(loadHero,3500);
    }
  }

  function resizeMatrix(){dpr=Math.min(devicePixelRatio||1,1.6);width=innerWidth;height=innerHeight;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;ctx.setTransform(dpr,0,0,dpr,0,0);const cols=Math.ceil(width/18);drops=Array.from({length:cols},(_,i)=>({x:i*18,y:Math.random()*height,v:38+Math.random()*72}));}
  function drawMatrix(now){if(reduce.matches||document.hidden){raf=requestAnimationFrame(drawMatrix);return;}const dt=Math.min((now-last)/1000||.016,.04);last=now;ctx.fillStyle='rgba(2,5,10,.17)';ctx.fillRect(0,0,width,height);ctx.font='12px "Courier New",monospace';for(const d of drops){const ch=glyphs[(Math.random()*glyphs.length)|0],bright=Math.random()>.91;ctx.fillStyle=bright?'rgba(190,249,255,.9)':(Math.random()>.83?'rgba(55,125,255,.52)':'rgba(87,229,255,.42)');ctx.fillText(ch,d.x,d.y);d.y+=d.v*dt*MATRIX_SPEED;if(d.y>height+24){d.y=-20-Math.random()*height*.24;d.v=38+Math.random()*72;}}raf=requestAnimationFrame(drawMatrix);}
  function glitchFrame(){if(reduce.matches)return;copy.classList.add('glitchFrame');operator.classList.add('glitchFrame');cue(78,.025,.012);setTimeout(()=>{copy.classList.remove('glitchFrame');operator.classList.remove('glitchFrame');},115+Math.random()*90);setTimeout(glitchFrame,900+Math.random()*2200);}
  function initAudio(){if(audio)return audio;const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return null;audio=new AudioContext();return audio;}
  function cue(freq=130,duration=.035,gain=.018){if(!armed)return;const ac=initAudio();if(!ac)return;if(ac.state==='suspended')ac.resume();const osc=ac.createOscillator(),amp=ac.createGain();osc.type='square';osc.frequency.value=freq;amp.gain.setValueAtTime(gain,ac.currentTime);amp.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);osc.connect(amp).connect(ac.destination);osc.start();osc.stop(ac.currentTime+duration);}
  soundToggle.addEventListener('click',()=>{armed=!armed;soundToggle.setAttribute('aria-pressed',String(armed));soundLabel.textContent=armed?'SOUND // LIVE':'SOUND // ARM';if(armed){initAudio();cue(165,.05,.022);}});
  document.addEventListener('pointermove',e=>{const mx=(e.clientX/innerWidth-.5)*2,my=(e.clientY/innerHeight-.5)*2;document.documentElement.style.setProperty('--mx',mx.toFixed(3));document.documentElement.style.setProperty('--my',my.toFixed(3));ring.style.left=`${e.clientX}px`;ring.style.top=`${e.clientY}px`;},{passive:true});
  stage.addEventListener('pointerover',e=>{if(e.target.closest('a,button')){ring.classList.add('hot');cue(240,.018,.008);}});stage.addEventListener('pointerout',e=>{if(e.target.closest('a,button'))ring.classList.remove('hot');});document.addEventListener('pointerdown',()=>cue(110,.03,.012),{passive:true});document.addEventListener('visibilitychange',()=>{last=performance.now();});addEventListener('resize',resizeMatrix,{passive:true});reduce.addEventListener?.('change',()=>{last=performance.now();});
  resizeMatrix();raf=requestAnimationFrame(drawMatrix);setTimeout(glitchFrame,700);loadHero();
})();
