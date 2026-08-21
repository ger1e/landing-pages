(()=>{
  const HERO_PAYLOAD='assets/rotund-operator-4k.b64';
  const cat=document.getElementById('catHero');
  fetch(HERO_PAYLOAD,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('hero '+r.status);return r.text()}).then(t=>{
    const b64=t.replace(/\s+/g,'');const raw=atob(b64);const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([bytes],{type:'image/avif'}));cat.src=url;
    cat.addEventListener('load',()=>document.documentElement.classList.add('hero-ready'),{once:true});
  }).catch(()=>document.documentElement.classList.add('hero-error'));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root=document.documentElement,hero=document.getElementById('hero-card');
  if(!reduce){
    addEventListener('pointermove',e=>{
      root.style.setProperty('--mx',((e.clientX/innerWidth)-.5).toFixed(3));
      root.style.setProperty('--my',((e.clientY/innerHeight)-.5).toFixed(3));
      root.style.setProperty('--px',e.clientX+'px');root.style.setProperty('--py',e.clientY+'px');
    },{passive:true});
    const glitch=()=>{hero.classList.remove('glitching');void hero.offsetWidth;hero.classList.add('glitching');setTimeout(()=>hero.classList.remove('glitching'),190);setTimeout(glitch,650+Math.random()*1450)};setTimeout(glitch,650);
    let lastSpark=0;
    addEventListener('pointermove',e=>{const now=performance.now();if(now-lastSpark<70)return;lastSpark=now;const s=document.createElement('i');s.className='cursor-spark';s.style.left=(e.clientX+8)+'px';s.style.top=(e.clientY+4)+'px';s.style.setProperty('--sx',(-7+Math.random()*14)+'px');s.style.setProperty('--sy',(8+Math.random()*14)+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),450)},{passive:true});
  }

  const c=document.getElementById('matrix'),ctx=c.getContext('2d',{alpha:true});if(!ctx||reduce)return;
  const glyphs='01<>/\\[]{}$#@*+アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  const MATRIX_SPEED=3;
  let w=0,h=0,dpr=1,font=15,cols=[],last=0;
  function seed(i,old){const depth=old?.depth??(.38+Math.random()*.62);return{y:old?.y??Math.random()*-h,v:old?.v??(105+Math.random()*185),a:old?.a??(.10+Math.random()*.28),depth};}
  function resize(){dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);const n=Math.ceil(w/font);cols=Array.from({length:n},(_,i)=>seed(i,cols[i]));}
  function draw(t){
    if(document.hidden){last=t;requestAnimationFrame(draw);return}
    if(t-last<22){requestAnimationFrame(draw);return}
    const dt=Math.min((t-last)/1000,.05)||.016;last=t;
    ctx.fillStyle='rgba(2,4,10,.15)';ctx.fillRect(0,0,w,h);ctx.textAlign='center';
    for(let i=0;i<cols.length;i++){
      const p=cols[i],size=10+font*p.depth*.7,ch=glyphs[(Math.random()*glyphs.length)|0],r=Math.random();
      ctx.font=size+'px '+getComputedStyle(root).getPropertyValue('--mono');
      const alpha=p.a*(.54+p.depth*.68);
      ctx.fillStyle=r<.045?`rgba(215,251,255,${Math.min(1,alpha*2.2)})`:r<.62?`rgba(89,232,255,${alpha})`:`rgba(52,124,255,${alpha*.82})`;
      ctx.shadowBlur=p.depth>.78?5:0;ctx.shadowColor='rgba(89,232,255,.28)';ctx.fillText(ch,i*font+font/2,p.y);
      p.y+=p.v*p.depth*dt*MATRIX_SPEED;
      if(p.y>h+50){cols[i]=seed(i,{depth:.38+Math.random()*.62});cols[i].y=-Math.random()*h*.8;cols[i].v=105+Math.random()*185;cols[i].a=.10+Math.random()*.28;}
    }
    ctx.shadowBlur=0;requestAnimationFrame(draw);
  }
  resize();addEventListener('resize',resize,{passive:true});requestAnimationFrame(draw);
})();
