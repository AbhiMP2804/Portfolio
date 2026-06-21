/* ==========================================================
   1. NODE-GRAPH BACKGROUND (signature element)
   ========================================================== */
   (function netCanvas(){
    const canvas = document.getElementById('net-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(70, Math.floor((w * h) / 22000));
      nodes = Array.from({length: count}, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6
      }));
    }
  
    const mouse = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  
    function step(){
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes){
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++){
        for (let j = i + 1; j < nodes.length; j++){
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 140){
            ctx.strokeStyle = `rgba(79,209,165,${0.14 * (1 - dist/140)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dxm = a => a; // noop guard
        const dmx = n.x - mouse.x, dmy = n.y - mouse.y;
        const mdist = Math.sqrt(dmx*dmx + dmy*dmy);
        if (mdist < 160){
          ctx.strokeStyle = `rgba(111,168,220,${0.22 * (1 - mdist/160)})`;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      for (const n of nodes){
        ctx.fillStyle = 'rgba(232,236,241,0.55)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(step);
    }
  
    window.addEventListener('resize', resize);
    resize();
    step();
  })();
  
  /* ==========================================================
     2. CUSTOM CURSOR
     ========================================================== */
  (function cursor(){
    const dot = document.getElementById('cursorDot');
    if (!dot || window.matchMedia('(hover:none)').matches) return;
    window.addEventListener('mousemove', e => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    });
    document.querySelectorAll('a, button, .project, [data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('is-active'));
      el.addEventListener('mouseleave', () => dot.classList.remove('is-active'));
    });
  })();
  
  /* ==========================================================
     3. SCROLL PROGRESS BAR
     ========================================================== */
  (function scrollProgress(){
    const bar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = scrolled + '%';
    });
  })();
  
  /* ==========================================================
     4. NAV: scroll state + mobile toggle
     ========================================================== */
  (function nav(){
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
  
    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    });
  
    toggle.addEventListener('click', () => {
      links.classList.toggle('is-open');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('is-open')));
  })();
  
  /* ==========================================================
     5. TYPED ROLE TEXT IN TERMINAL
     ========================================================== */
  (function typed(){
    const el = document.getElementById('typedRole');
    if (!el) return;
    const roles = [
      'role --is "Software Development Engineer"',
      'stack --backend "Spring Boot, Java, GraphQL"',
      'focus --area "Distributed Systems, AI/ML"',
      'status --current "Open to opportunities"'
    ];
    let r = 0, c = 0, deleting = false;
  
    function loop(){
      const full = roles[r];
      el.textContent = deleting ? full.slice(0, c--) : full.slice(0, c++);
  
      let delay = deleting ? 28 : 45;
      if (!deleting && c === full.length + 1) { delay = 1400; deleting = true; }
      if (deleting && c < 0) { deleting = false; c = 0; r = (r + 1) % roles.length; delay = 400; }
  
      setTimeout(loop, delay);
    }
    setTimeout(loop, 120);
  })();
  
  /* ==========================================================
     6. COUNT-UP STATS
     ========================================================== */
  (function countUp(){
    const stats = document.querySelectorAll('.stat__num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isDecimal = el.dataset.decimal === 'true';
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
  
        function tick(now){
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          let value = target * eased;
          el.textContent = isDecimal ? (value / 100).toFixed(2) : Math.floor(value) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = isDecimal ? (target / 100).toFixed(2) : target + suffix;
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
  
    stats.forEach(s => observer.observe(s));
  })();
  
  /* ==========================================================
     7. SCROLL REVEALS (sections, cards, skill bars)
     ========================================================== */
  (function reveals(){
    const targets = document.querySelectorAll(
      '.section__head, .about__text, .about__card, .timeline__item, .project, .skill-card, .edu__card, .contact__inner'
    );
    targets.forEach(t => t.classList.add('reveal'));
  
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('timeline__item')) entry.target.classList.add('is-active');
        }
      });
    }, { threshold: 0.15 });
  
    targets.forEach(t => io.observe(t));
  
    // skill rings
    const rings = document.querySelectorAll('.ring');
    const CIRC = 2 * Math.PI * 34; // r=34
    rings.forEach(r => { r.querySelector('.ring__fg').style.strokeDasharray = CIRC; });
    const ringIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const ring = entry.target;
          const pct = parseFloat(ring.dataset.pct) / 100;
          const offset = CIRC * (1 - pct);
          ring.querySelector('.ring__fg').style.strokeDashoffset = offset;
          ringIo.unobserve(ring);
        }
      });
    }, { threshold: 0.4 });
    rings.forEach(r => ringIo.observe(r));
  
  })();
  
  /* ==========================================================
     8. TIMELINE PROGRESS LINE
     ========================================================== */
  (function timelineProgress(){
    const wrap = document.querySelector('.timeline');
    const progress = document.getElementById('timelineProgress');
    if (!wrap || !progress) return;
  
    function update(){
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const visible = Math.min(Math.max(vh * 0.7 - rect.top, 0), total);
      progress.style.height = (visible / total * 100) + '%';
    }
    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();
  })();
  
  /* ==========================================================
     10. MICRO NODE-GRAPH ICON FOR FEATURED PROJECT
     ========================================================== */
  (function microNodes(){
    document.querySelectorAll('.micro-nodes').forEach(container => {
      const count = parseInt(container.dataset.nodes, 10) || 8;
      const w = 400, h = 280;
      const pts = Array.from({length: count}, () => ({
        x: Math.random() * w,
        y: Math.random() * h
      }));
      let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">`;
      for (let i = 0; i < pts.length; i++){
        for (let j = i + 1; j < pts.length; j++){
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 130){
            svg += `<line x1="${pts[i].x}" y1="${pts[i].y}" x2="${pts[j].x}" y2="${pts[j].y}" stroke="rgba(79,209,165,0.25)" stroke-width="1"/>`;
          }
        }
      }
      pts.forEach((p, idx) => {
        svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${idx % 3 === 0 ? '#4fd1a5' : '#6fa8dc'}" opacity="0.85">
          <animate attributeName="r" values="4;6;4" dur="${2 + Math.random()*2}s" repeatCount="indefinite"/>
        </circle>`;
      });
      svg += `</svg>`;
      container.innerHTML = svg;
    });
  })();
  
  /* ==========================================================
     10b. CONSISTENT-HASHING RING DIAGRAM NODES
     ========================================================== */
  (function ringDiagram(){
    document.querySelectorAll('.diagram--ring .ring-nodes').forEach(g => {
      const cx = 160, cy = 70, r = 50, count = 7;
      let html = '';
      for (let i = 0; i < count; i++){
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        html += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5">
          <animate attributeName="r" values="5;7;5" dur="${2 + i * 0.2}s" repeatCount="indefinite"/>
        </circle>`;
      }
      g.innerHTML = html;
    });
  })();
  
  
  /* ==========================================================
     11. SMOOTH ANCHOR SCROLL OFFSET (account for fixed nav)
     ========================================================== */
  (function anchorScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  })();
  
  /* ==========================================================
     12. FOOTER YEAR
     ========================================================== */
  document.getElementById('year').textContent = new Date().getFullYear();