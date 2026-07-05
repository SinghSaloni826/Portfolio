/* ================= COSMIC BACKGROUND ================= */
  const canvas = document.getElementById('cosmic-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, stars = [], comets = [];
  let mouse = { x: 0, y: 0 };
  let parX = 0, parY = 0;

  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  function initStars(){
    stars = [];
    const count = Math.min(240, Math.floor((w*h)/9000));
    for(let i=0;i<count;i++){
      stars.push({ x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.4+0.3, phase:Math.random()*Math.PI*2, speed:0.01+Math.random()*0.02 });
    }
  }
  initStars(); window.addEventListener('resize', initStars);

  const sun = { x: () => w*0.82, y: () => h*0.2, r: 34 };

  const planets = [
    { rx:0.30, ry:0.16, angle:Math.random()*6.28, speed:0.0016, size:6, color:'124,92,255', ring:false },
    { rx:0.42, ry:0.24, angle:Math.random()*6.28, speed:0.0011, size:9, color:'59,108,255', ring:true },
    { rx:0.55, ry:0.32, angle:Math.random()*6.28, speed:0.0008, size:5, color:'255,207,122', ring:false },
    { rx:0.68, ry:0.40, angle:Math.random()*6.28, speed:0.0006, size:7, color:'124,92,255', ring:false },
    { rx:0.82, ry:0.48, angle:Math.random()*6.28, speed:0.00045, size:4, color:'255,207,122', ring:false },
  ];

  window.addEventListener('mousemove', (e)=>{
    mouse.x = e.clientX; mouse.y = e.clientY;
  });

  function spawnComet(){
    const fromLeft = Math.random() > 0.5;
    comets.push({
      x: fromLeft ? -20 : w+20,
      y: Math.random()*h*0.5,
      vx: (fromLeft ? 1:-1) * (5+Math.random()*3),
      vy: 2+Math.random()*1.5,
      life: 0
    });
  }
  setInterval(()=>{ if(Math.random() < 0.5) spawnComet(); }, 4500);

  function tick(t){
    ctx.clearRect(0,0,w,h);

    parX += ((mouse.x - w/2)/w*24 - parX) * 0.04;
    parY += ((mouse.y - h/2)/h*24 - parY) * 0.04;

    // deep star layer (more parallax)
    ctx.save();
    ctx.translate(parX*1.4, parY*1.4);
    for(const s of stars){
      const tw = (Math.sin(t*s.speed + s.phase)+1)/2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${0.25+tw*0.65})`;
      ctx.fill();
    }
    ctx.restore();

    // sun (less parallax)
    ctx.save();
    ctx.translate(parX*0.4, parY*0.4);
    const sx = sun.x(), sy = sun.y();
    const pulse = (Math.sin(t*0.0012)+1)/2;
    const grad = ctx.createRadialGradient(sx,sy,0,sx,sy, sun.r*3.4+pulse*10);
    grad.addColorStop(0, 'rgba(255,230,179,0.9)');
    grad.addColorStop(0.35, 'rgba(255,207,122,0.35)');
    grad.addColorStop(1, 'rgba(255,207,122,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(sx,sy, sun.r*3.4+pulse*10, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.arc(sx,sy, sun.r*0.55, 0, Math.PI*2);
    ctx.fillStyle = '#fff3d6'; ctx.fill();

    // orbit guides + planets
    for(const p of planets){
      p.angle += p.speed;
      const orbRx = w*p.rx, orbRy = h*p.ry;

      ctx.beginPath();
      ctx.ellipse(sx, sy, orbRx, orbRy, 0, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const px = sx + Math.cos(p.angle)*orbRx;
      const py = sy + Math.sin(p.angle)*orbRy;

      if(p.ring){
        ctx.save();
        ctx.translate(px,py);
        ctx.rotate(0.6);
        ctx.beginPath();
        ctx.ellipse(0,0, p.size*2.1, p.size*0.7, 0, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(${p.color},0.5)`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }

      const glow = ctx.createRadialGradient(px,py,0,px,py,p.size*3);
      glow.addColorStop(0, `rgba(${p.color},0.55)`);
      glow.addColorStop(1, `rgba(${p.color},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(px,py,p.size*3,0,Math.PI*2); ctx.fill();

      ctx.beginPath(); ctx.arc(px,py,p.size,0,Math.PI*2);
      ctx.fillStyle = `rgba(${p.color},0.95)`;
      ctx.fill();
    }
    ctx.restore();

    // comets
    for(let i=comets.length-1;i>=0;i--){
      const c = comets[i];
      c.x += c.vx; c.y += c.vy; c.life++;
      ctx.beginPath();
      const gradC = ctx.createLinearGradient(c.x, c.y, c.x - c.vx*8, c.y - c.vy*8);
      gradC.addColorStop(0, 'rgba(255,255,255,0.9)');
      gradC.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = gradC;
      ctx.lineWidth = 1.6;
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx*8, c.y - c.vy*8);
      ctx.stroke();
      if(c.life > 160 || c.x < -50 || c.x > w+50 || c.y > h+50) comets.splice(i,1);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ================= SCROLL REVEAL ================= */
  const revealEls = document.querySelectorAll('.reveal, .timeline');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el=>io.observe(el));

  /* ================= MAGNETIC BUTTONS ================= */
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('mousemove', (e)=>{
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      el.style.transform = `translate(${x*0.28}px, ${y*0.35}px)`;
    });
    el.addEventListener('mouseleave', ()=>{ el.style.transform = 'translate(0,0)'; });
  });

  /* ================= 3D TILT ON PROJECT CARDS ================= */
  document.querySelectorAll('.tilt').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x*7}deg) rotateX(${-y*7}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateY(0)'; });
  });

  /* ================= REDUCED MOTION ================= */
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.hero-tag,.hero h1,.hero p.sub,.hero-ctas,.scroll-cue').forEach(el=>{ el.style.animation='none'; el.style.opacity='1'; });
    revealEls.forEach(el=>el.classList.add('in'));
  }
