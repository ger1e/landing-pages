(()=>{
  const root=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero=document.getElementById('hero-card');
  const cat=document.getElementById('catHero');
  const audioToggle=document.getElementById('audioToggle');
  const audioState=document.getElementById('audioState');

  if(cat){
    const ready=()=>root.classList.add('hero-ready');
    if(cat.complete&&cat.naturalWidth) ready();
    else cat.addEventListener('load',ready,{once:true});
    cat.addEventListener('error',()=>root.classList.add('hero-error'),{once:true});
  }

  // Real local audio assets. Browsers require a user gesture before playback;
  // first pointer/keyboard interaction arms the layer, and the visible control can mute it again.
  const audio={armed:false,muted:false,ambient:null,ui:null,glitch:null};
  const make=(src,volume,loop=false)=>{const a=new Audio(src);a.preload='auto';a.volume=volume;a.loop=loop;return a};
  const pulse=()=>{root.classList.remove('audio-pulse');void root.offsetWidth;root.classList.add('audio-pulse');setTimeout(()=>root.classList.remove('audio-pulse'),240)};
  const playCue=kind=>{
    if(!audio.armed||audio.muted)return;
    const src=audio[kind];if(!src)return;
    try{src.currentTime=0;const p=src.play();if(p&&p.catch)p.catch(()=>{});pulse()}catch(_){ }
  };
  async function armAudio(withCue=true){
    if(!audio.armed){
      audio.ambient=make('assets/audio/ambient.mp3',.22,true);
      audio.ui=make('assets/audio/ui.mp3',.24,false);
      audio.glitch=make('assets/audio/glitch.mp3',.13,false);
      audio.armed=true;audio.muted=false;
      root.classList.add('audio-armed');root.classList.remove('audio-muted');
      audioToggle?.setAttribute('aria-pressed','true');
      if(audioState)audioState.textContent='AUDIO // ON';
      try{await audio.ambient.play()}catch(_){
        audio.armed=false;root.classList.remove('audio-armed');audioToggle?.setAttribute('aria-pressed','false');if(audioState)audioState.textContent='AUDIO // ARM';return;
      }
      if(withCue)playCue('ui');
      return;
    }
    if(audio.muted){
      audio.muted=false;root.classList.add('audio-armed');root.classList.remove('audio-muted');audioToggle?.setAttribute('aria-pressed','true');if(audioState)audioState.textContent='AUDIO // ON';
      try{await audio.ambient.play()}catch(_){ }
      if(withCue)playCue('ui');
    }
  }
  function muteAudio(){
    if(!audio.armed||audio.muted)return;
    audio.muted=true;audio.ambient?.pause();root.classList.remove('audio-armed');root.classList.add('audio-muted');audioToggle?.setAttribute('aria-pressed','false');if(audioState)audioState.textContent='AUDIO // OFF';
  }
  audioToggle?.addEventListener('click',e=>{e.stopPropagation();if(audio.armed&&!audio.muted)muteAudio();else armAudio(true)});
  // Arm on the first genuine interaction so the page never pretends audio is playing when it is not.
  const firstGesture=e=>{if(e?.target?.closest?.('#audioToggle'))return;armAudio(false)};
  addEventListener('pointerdown',firstGesture,{once:true,capture:true,passive:true});
  addEventListener('keydown',firstGesture,{once:true,capture:true});
  document.querySelectorAll('a,.btn').forEach(el=>el.addEventListener('pointerdown',()=>playCue('ui'),{passive:true}));

  if(!reduce){
    addEventListener('pointermove',e=>{
      root.style.setProperty('--mx',((e.clientX/innerWidth)-.5).toFixed(3));
      root.style.setProperty('--my',((e.clientY/innerHeight)-.5).toFixed(3));
      root.style.setProperty('--px',e.clientX+'px');root.style.setProperty('--py',e.clientY+'px');
    },{passive:true});
    const glitch=()=>{
      hero?.classList.remove('glitching');void hero?.offsetWidth;hero?.classList.add('glitching');
      if(Math.random()>.46)playCue('glitch');
      setTimeout(()=>hero?.classList.remove('glitching'),190);
      setTimeout(glitch,560+Math.random()*1280);
    };setTimeout(glitch,620);
    let lastSpark=0;
    addEventListener('pointermove',e=>{const now=performance.now();if(now-lastSpark<58)return;lastSpark=now;const s=document.createElement('i');s.className='cursor-spark';s.style.left=(e.clientX+8)+'px';s.style.top=(e.clientY+4)+'px';s.style.setProperty('--sx',(-8+Math.random()*16)+'px');s.style.setProperty('--sy',(8+Math.random()*16)+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),450)},{passive:true});
  }

  const c=document.getElementById('matrix'),ctx=c?.getContext('2d',{alpha:true});if(!ctx||reduce)return;
  const glyphs='01<>/\\[]{}$#@*+アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  const MATRIX_SPEED=3;
  let w=0,h=0,dpr=1,font=15,cols=[],last=0;
  function seed(i,old){const depth=old?.depth??(.34+Math.random()*.66);return{y:old?.y??Math.random()*-h,v:old?.v??(112+Math.random()*205),a:old?.a??(.10+Math.random()*.31),depth};}
  function resize(){dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);const n=Math.ceil(w/font);cols=Array.from({length:n},(_,i)=>seed(i,cols[i]));}
  function draw(t){
    if(document.hidden){last=t;requestAnimationFrame(draw);return}
    if(t-last<21){requestAnimationFrame(draw);return}
    const dt=Math.min((t-last)/1000,.05)||.016;last=t;
    ctx.fillStyle='rgba(2,4,10,.13)';ctx.fillRect(0,0,w,h);ctx.textAlign='center';
    for(let i=0;i<cols.length;i++){
      const p=cols[i],size=9+font*p.depth*.78,ch=glyphs[(Math.random()*glyphs.length)|0],r=Math.random();
      ctx.font=size+'px '+getComputedStyle(root).getPropertyValue('--mono');
      const alpha=p.a*(.50+p.depth*.74);
      ctx.fillStyle=r<.042?`rgba(220,253,255,${Math.min(1,alpha*2.25)})`:r<.66?`rgba(89,232,255,${alpha})`:`rgba(52,124,255,${alpha*.84})`;
      ctx.shadowBlur=p.depth>.76?6:0;ctx.shadowColor='rgba(89,232,255,.30)';ctx.fillText(ch,i*font+font/2,p.y);
      if(Math.random()<.075){ctx.fillStyle=`rgba(89,232,255,${alpha*.22})`;ctx.fillRect(i*font+font/2-.5,p.y+4,1,12+34*p.depth)}
      p.y+=p.v*p.depth*dt*MATRIX_SPEED;
      if(p.y>h+58){cols[i]=seed(i,{depth:.34+Math.random()*.66});cols[i].y=-Math.random()*h*.9;cols[i].v=112+Math.random()*205;cols[i].a=.10+Math.random()*.31;}
    }
    ctx.shadowBlur=0;requestAnimationFrame(draw);
  }
  resize();addEventListener('resize',resize,{passive:true});requestAnimationFrame(draw);
})();
