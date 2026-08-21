(() => {
  'use strict';
  const MATRIX_SPEED=3;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.getElementById('matrix');
  const stage = document.getElementById('stage');
  const copy = document.getElementById('copy');
  const operator = document.getElementById('operator');
  const ring = document.getElementById('cursorRing');
  const soundToggle = document.getElementById('soundToggle');
  const soundLabel = document.getElementById('soundLabel');
  let audio = null;
  let armed = false;
  let last = 0;
  let raf = 0;
  let drops = [];
  let width = 0;
  let height = 0;
  let dpr = 1;

  const ctx = canvas.getContext('2d', { alpha:true });
  const glyphs = '01<>/\\[]{}#@*+CTIHUNTVERIFYENRICHEXPLAIN';

  function resizeMatrix(){
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.floor(width*dpr);
    canvas.height = Math.floor(height*dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const cols = Math.ceil(width/18);
    drops = Array.from({length:cols},(_,i)=>({x:i*18,y:Math.random()*height,v:38+Math.random()*72}));
  }

  function drawMatrix(now){
    if(reduce.matches || document.hidden){ raf=requestAnimationFrame(drawMatrix); return; }
    const dt = Math.min((now-last)/1000 || .016,.04); last=now;
    ctx.fillStyle='rgba(2,5,10,.17)';
    ctx.fillRect(0,0,width,height);
    ctx.font='12px "Courier New",monospace';
    for(const d of drops){
      const ch = glyphs[(Math.random()*glyphs.length)|0];
      const bright = Math.random()>.91;
      ctx.fillStyle = bright ? 'rgba(190,249,255,.9)' : (Math.random()>.83 ? 'rgba(55,125,255,.52)' : 'rgba(87,229,255,.42)');
      ctx.fillText(ch,d.x,d.y);
      d.y += d.v*dt*MATRIX_SPEED;
      if(d.y>height+24){d.y=-20-Math.random()*height*.24;d.v=38+Math.random()*72;}
    }
    raf=requestAnimationFrame(drawMatrix);
  }

  function glitchFrame(){
    if(reduce.matches) return;
    copy.classList.add('glitchFrame');
    operator.classList.add('glitchFrame');
    cue(78,.025,.012);
    setTimeout(()=>{copy.classList.remove('glitchFrame');operator.classList.remove('glitchFrame');},115+Math.random()*90);
    setTimeout(glitchFrame,900+Math.random()*2200);
  }

  function initAudio(){
    if(audio) return audio;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if(!AudioContext) return null;
    audio = new AudioContext();
    return audio;
  }

  function cue(freq=130,duration=.035,gain=.018){
    if(!armed) return;
    const ac=initAudio();
    if(!ac) return;
    if(ac.state==='suspended') ac.resume();
    const osc=ac.createOscillator();
    const amp=ac.createGain();
    osc.type='square';
    osc.frequency.value=freq;
    amp.gain.setValueAtTime(gain,ac.currentTime);
    amp.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);
    osc.connect(amp).connect(ac.destination);
    osc.start();osc.stop(ac.currentTime+duration);
  }

  soundToggle.addEventListener('click',()=>{
    armed=!armed;
    soundToggle.setAttribute('aria-pressed',String(armed));
    soundLabel.textContent=armed?'SOUND // LIVE':'SOUND // ARM';
    if(armed){initAudio();cue(165,.05,.022);}
  });

  document.addEventListener('pointermove',e=>{
    const mx=(e.clientX/innerWidth-.5)*2;
    const my=(e.clientY/innerHeight-.5)*2;
    document.documentElement.style.setProperty('--mx',mx.toFixed(3));
    document.documentElement.style.setProperty('--my',my.toFixed(3));
    ring.style.left=`${e.clientX}px`; ring.style.top=`${e.clientY}px`;
  },{passive:true});

  stage.addEventListener('pointerover',e=>{
    if(e.target.closest('a,button')){ring.classList.add('hot');cue(240,.018,.008);}
  });
  stage.addEventListener('pointerout',e=>{if(e.target.closest('a,button')) ring.classList.remove('hot');});
  document.addEventListener('pointerdown',()=>cue(110,.03,.012),{passive:true});
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
  addEventListener('resize',resizeMatrix,{passive:true});
  reduce.addEventListener?.('change',()=>{last=performance.now();});
  resizeMatrix();
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(drawMatrix);
  setTimeout(glitchFrame,700);
})();
