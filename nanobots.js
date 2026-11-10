'use strict';
// Nanobots: a swarm of fine dust particles that builds the page. On load they scatter like dust and
// assemble the header; then they gather into a slowly turning 3D sphere at the right edge and stream
// out to build each block as it scrolls into view. Content is only clipped (never removed), so it stays
// readable by screen readers and search engines.
(() => {
  const root = document.documentElement;
  const canvas = document.querySelector('#nano-field');
  const ctx = canvas && canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const unboot = () => root.classList.remove('nano-boot');
  if (!ctx || reduce.matches) {
    if (canvas) canvas.hidden = true;
    unboot();
    return;
  }

  const INTRO = ['.mast .brand', '.mast-label', '.mast-actions', '.hero h1', '.hero .role', '.hero .lead', '.hero .actions', '.dock'];
  const ON_SCROLL = ['.skill-ticker', '#work .section-head', '.work-grid .index', '.work-grid .case-copy',
    '#experience > div:first-child', '.timeline article', '#skills > div:first-child', '.skill-list > div',
    '#contact > div:first-child', '.contact-links a', '.footer'];
  const COLORS = ['#f4eefb', '#c89afa', '#8a63d2'];
  const STEP = 1000 / 60;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const ease = k => k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  const collect = list => [...new Set(list.flatMap(s => [...document.querySelectorAll(s)]))];

  // --- Hide every target until the swarm builds it --------------------------------
  const pending = new Set();
  const hide = el => { el.style.clipPath = 'inset(0 100% 0 0)'; el.dataset.nano = 'pending'; pending.add(el); };
  const introEls = collect(INTRO);
  const scrollEls = collect(ON_SCROLL).filter(el => !introEls.includes(el));
  introEls.forEach(hide);
  scrollEls.forEach(hide);
  unboot();

  let W = 0, H = 0, clock = 0, lastTime, remainder = 0, frame;
  let introDone = false, leaving = false, leaveAt = 0, nextStart = 0;
  let hiveX = 0, hiveY = 0, unit = 0;

  function resize() {
    W = innerWidth;
    H = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    // Size the creeper to the page gutter (same formula as --gutter) so it stays beside the text.
    // clientWidth leaves out the scrollbar; keep the whole head on screen even on phones.
    const pageW = root.clientWidth || W;
    const gutter = clamp(pageW * .04, 17, 68);
    unit = clamp(gutter / 7, 4.2, 8.5);
    hiveX = pageW - Math.max(gutter * .5, unit * 5);
    hiveY = H * .5;
  }
  resize();

  // --- The swarm -------------------------------------------------------------------
  // The hive is a creeper-style head: an 8x8x8 voxel cube in the site palette with the face cut in
  // dark pixels. Each texture pixel is split 2x2, and every sub-pixel is one particle's seat.
  // Units are texture pixels centred on the cube; y points down and the face looks along +z.
  const HEAD = ['#c89afa', '#a77be6', '#dcc0ff', '#8a63d2', '#1c1428'];
  const FACE_INK = 4;
  const FACE = ['........', '........', '.XX..XX.', '.XX..XX.', '...XX...', '..XXXX..', '..XXXX..', '..X..X..'];
  const seats = [];
  for (let a = .25; a < 8; a += .5) {
    for (let b = .25; b < 8; b += .5) {
      const p = a - 4, q = b - 4;
      const face = FACE[Math.floor(b)][Math.floor(a)] === 'X';
      seats.push([p, q, 4, face], [p, q, -4, false]);   // front (face) and back
      seats.push([-4, q, p, false], [4, q, p, false]);  // sides
      seats.push([p, -4, q, false], [p, 4, q, false]);  // top and bottom
    }
  }

  const N = seats.length;
  const bots = [];
  for (const [sx, sy, sz, face] of seats) {
    const x = Math.random() * W, y = Math.random() * H;
    bots.push({x, y, vx: 0, vy: 0, restX: x, restY: y, sx, sy, sz,
      seat: face ? FACE_INK : Math.floor(Math.random() * 4),
      tone: Math.random() < .66 ? 0 : Math.random() < .7 ? 1 : 2,
      size: .7 + Math.random() ** 2 * 1.5, s: 1, depth: .35 + Math.random() * .65,
      twinkle: Math.random() * 6.3, born: Math.random() * 700, a: 0, flash: 0, hz: 0,
      job: null, u: 0, v: 0});
  }

  function hiveSeat(b) {
    // Mostly faces the visitor, turning a little toward the page and back.
    const spin = -.32 + .34 * Math.sin(clock * .00045), tilt = .14;
    const cs = Math.cos(spin), sn = Math.sin(spin), ct = Math.cos(tilt), st = Math.sin(tilt);
    const x = b.sx * cs + b.sz * sn;
    let z = -b.sx * sn + b.sz * cs;
    const y = b.sy * ct - z * st;
    z = b.sy * st + z * ct;
    const scale = unit / (1 - z / 7 * .12);
    b.hz = clamp(z / 7, -1, 1);
    return [hiveX + x * scale, hiveY + (y + Math.sin(clock * .0016) * .25) * scale];
  }

  // --- Build jobs ----------------------------------------------------------------------
  const jobs = [], queue = [];

  function schedule(el, at) {
    if (!pending.has(el) || jobs.some(j => j.el === el)) return;
    jobs.push({el, startAt: at, phase: 'wait', bots: [], t0: 0, dur: 0, p: 0, edge: 0, top: 0, span: 0, left: 0, width: 0});
  }

  function start(job) {
    const r = job.el.getBoundingClientRect();
    // Nothing to watch if it is empty or the visitor has already scrolled away from it.
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > H) return finish(job);
    const visible = r.width * (Math.min(r.bottom, H) - Math.max(r.top, 0));
    const want = Math.round(clamp(visible / 240, 50, 380) * N / 1400);
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    job.bots = bots.filter(b => !b.job)
      .sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))
      .slice(0, want);
    for (const b of job.bots) {
      b.job = job;
      b.u = Math.random();
      b.v = Math.random();
    }
    job.dur = clamp(r.width * .9, 500, 1150);
    job.phase = job.bots.length ? 'gather' : 'build';
    job.t0 = clock;
  }

  function reveal(el) {
    el.style.clipPath = '';
    el.removeAttribute('data-nano');
    pending.delete(el);
  }

  function release(b) {
    b.job = null;
    b.flash = 1;
    b.vx += -1.5 - Math.random() * 2.5;
    b.vy += (Math.random() - .5) * 3;
    b.restX = b.x + (Math.random() - .5) * 140;
    b.restY = b.y + (Math.random() - .5) * 90;
  }

  function finish(job) {
    reveal(job.el);
    job.bots.filter(b => b.job === job).forEach(release);
    jobs.splice(jobs.indexOf(job), 1);
    if (!introDone && introEls.every(el => !pending.has(el))) {
      introDone = true;
      queue.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
        .forEach(enqueue);
      queue.length = 0;
    }
  }

  function enqueue(el) {
    if (!introDone) { if (!queue.includes(el)) queue.push(el); return; }
    nextStart = Math.max(clock, nextStart + 160);
    schedule(el, nextStart);
  }

  // IntersectionObserver treats a fully clipped element as invisible, so check positions directly.
  const seen = new Set();
  function watchViewport() {
    for (const el of scrollEls) {
      if (!pending.has(el) || seen.has(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.top < H * .92 && r.bottom > H * .04) { seen.add(el); enqueue(el); }
    }
  }

  function updateJob(job) {
    const r = job.el.getBoundingClientRect();
    job.top = Math.max(r.top, -10);
    job.span = Math.max(Math.min(r.bottom, H + 10) - job.top, 4);
    job.left = r.left;
    job.width = r.width;
    if (job.phase === 'gather') {
      const arrived = job.bots.filter(b => Math.abs(b.tx - b.x) + Math.abs(b.ty - b.y) < 16).length;
      if (arrived >= job.bots.length * .72 || clock - job.t0 > 950) { job.phase = 'build'; job.t0 = clock; }
      job.edge = r.left;
      return;
    }
    const k = Math.min(1, (clock - job.t0) / job.dur);
    job.p = ease(k);
    job.edge = r.left + job.p * r.width;
    job.el.style.clipPath = `inset(0 ${((1 - job.p) * 100).toFixed(2)}% 0 0)`;
    for (const b of job.bots) if (b.job === job && b.u <= job.p) release(b);
    if (k >= 1) finish(job);
  }

  // --- Simulation ------------------------------------------------------------------------
  function step() {
    clock += STEP;
    watchViewport();
    for (const job of jobs.slice()) {
      if (job.phase === 'wait') { if (clock >= job.startAt) start(job); }
      else updateJob(job);
    }
    if (introDone && !leaving && !pending.size && !jobs.length) { leaving = true; leaveAt = clock; }
    const fadeOut = leaving ? clamp(1 - (clock - leaveAt) / 1600, 0, 1) : 1;

    for (const b of bots) {
      let tx, ty, pull, alpha;
      const job = b.job;
      if (job) {
        tx = job.left + b.u * job.width;
        ty = job.top + b.v * job.span;
        pull = .011 + b.depth * .008;
        alpha = .55 + b.depth * .45;
        b.tx = tx;
        b.ty = ty;
      } else if (introDone) {
        [tx, ty] = hiveSeat(b);
        if (leaving) {
          const spread = 1 + (clock - leaveAt) / 500;
          tx = hiveX + (tx - hiveX) * spread;
          ty = hiveY + (ty - hiveY) * spread;
        }
        pull = .02 + b.depth * .012;
        alpha = (b.seat === FACE_INK ? 1 : .5 + .5 * (b.hz + 1) / 2) * fadeOut;
      } else {
        tx = b.restX + Math.sin(clock * .0011 + b.twinkle) * 6;
        ty = b.restY + Math.cos(clock * .0009 + b.twinkle) * 6;
        pull = .006;
        alpha = .25 + b.depth * .45;
      }
      b.vx = b.vx * .86 + (tx - b.x) * pull;
      b.vy = b.vy * .86 + (ty - b.y) * pull;
      const speed = Math.hypot(b.vx, b.vy);
      if (speed > 16) { b.vx *= 16 / speed; b.vy *= 16 / speed; }
      b.x += b.vx;
      b.y += b.vy;
      const born = clamp((clock - b.born) / 600, 0, 1);
      b.a += (alpha * born - b.a) * .12;
      // Seated particles grow into solid voxels; flying ones shrink back to dust.
      const seated = introDone && !b.job;
      b.s += ((seated ? unit * .42 * (.85 + .3 * (b.hz + 1) / 2) : b.size) - b.s) * .1;
      b.seated = seated && Math.abs(b.x - tx) + Math.abs(b.y - ty) < unit * 3;
      b.flash *= .9;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const job of jobs) {
      if (job.phase !== 'build') continue;
      ctx.fillStyle = COLORS[1];
      ctx.globalAlpha = .08;
      ctx.fillRect(job.edge - 3, job.top, 6, job.span);
      ctx.globalAlpha = .7;
      ctx.fillRect(job.edge, job.top, 1, job.span);
    }
    // Flying dust uses its own tone; particles seated in the head take their pixel's colour.
    // Back-facing voxels are drawn first so the front ones cover them.
    const seated = bots.filter(b => b.seated).sort((a, b) => a.hz - b.hz);
    for (const b of bots) {
      if (b.seated) continue;
      const alpha = b.a * (.78 + .22 * Math.sin(clock * .004 + b.twinkle)) + b.flash * .5;
      if (alpha < .02) continue;
      const s = b.s * (1 + b.flash * .8);
      ctx.fillStyle = COLORS[b.tone];
      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.fillRect(b.x - s / 2, b.y - s / 2, s, s);
    }
    for (const b of seated) {
      if (b.a < .02) continue;
      ctx.fillStyle = HEAD[b.seat];
      ctx.globalAlpha = b.a;
      ctx.fillRect(b.x - b.s / 2, b.y - b.s / 2, b.s, b.s);
    }
    ctx.globalAlpha = 1;
  }

  function tick(time) {
    frame = undefined;
    try {
      remainder += lastTime === undefined ? STEP : Math.min(time - lastTime, 50);
      lastTime = time;
      while (remainder >= STEP) { step(); remainder -= STEP; }
      draw();
    } catch (error) {
      revealAll();
      throw error;
    }
    if (leaving && clock - leaveAt > 1700) { canvas.hidden = true; return; }
    frame = requestAnimationFrame(tick);
  }

  function revealAll() {
    [...pending].forEach(reveal);
    jobs.length = 0;
    canvas.hidden = true;
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  introEls.forEach((el, i) => schedule(el, 650 + i * 260));

  // Keyboard users must never land inside something that is still hidden.
  document.addEventListener('focusin', event => {
    const el = event.target.closest && event.target.closest('[data-nano="pending"]');
    if (!el) return;
    const job = jobs.find(j => j.el === el);
    if (job) finish(job); else reveal(el);
  });
  reduce.addEventListener('change', () => { if (reduce.matches) revealAll(); });
  document.addEventListener('visibilitychange', () => { lastTime = undefined; });
  addEventListener('resize', resize);
  frame = requestAnimationFrame(tick);
})();
