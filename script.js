/* Theme toggle - dark (blue) / light (white) */
(function() {
  const toggle = document.querySelector('.js-theme-toggle');
  if (!toggle) return;

  const STORAGE_KEY = 'jk-theme';

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function initTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light') setTheme('light');
    } catch (_) {}
  }

  toggle.addEventListener('click', function() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  initTheme();
})();

/* Perlin noise (improved) - perlin2 API */
class Noise {
  constructor(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = ((seed || 0) * 2147483647) % 2147483647;
    if (s <= 0) s += 2147483646;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v) * 0.5;
  }

  perlin2(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const p = this.perm;
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    return this.lerp(
      this.lerp(this.grad(p[A], x, y), this.grad(p[B], x - 1, y), u),
      this.lerp(this.grad(p[A + 1], x, y - 1), this.grad(p[B + 1], x - 1, y - 1), u),
      v
    );
  }
}

/* a-waves custom element */
class AWaves extends HTMLElement {
  connectedCallback() {
    this.svg = this.querySelector('.js-svg');
    this.mouse = {
      x: -10,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
      set: false,
    };
    this.lines = [];
    this.paths = [];
    this.noise = new Noise(Math.random());

    this.setSize();
    this.setLines();
    this.bindEvents();
    requestAnimationFrame(this.tick.bind(this));
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.addEventListener('touchmove', this.onTouchMove.bind(this));
  }

  onResize() {
    this.setSize();
    this.setLines();
  }

  onMouseMove(e) {
    this.updateMousePosition(e.pageX, e.pageY);
  }

  onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.updateMousePosition(touch.clientX, touch.clientY);
  }

  updateMousePosition(x, y) {
    const { mouse } = this;
    mouse.x = x - this.bounding.left;
    mouse.y = y - this.bounding.top + window.scrollY;

    if (!mouse.set) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.set = true;
    }
  }

  setSize() {
    this.bounding = this.getBoundingClientRect();
    const { width, height } = this.bounding;
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
  }

  setLines() {
    const { width, height } = this.bounding;
    this.lines = [];

    this.paths.forEach((path) => path.remove());
    this.paths = [];

    const xGap = 10;
    const yGap = 32;
    const verticalOverflow = 80;
    const totalLines = Math.ceil(width / xGap) + 24;
    const totalPoints = Math.ceil((height + verticalOverflow * 2) / yGap);

    const xStart = 0;
    const yStart = -verticalOverflow;

    for (let i = 0; i <= totalLines; i++) {
      const points = [];
      for (let j = 0; j <= totalPoints; j++) {
        points.push({
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        });
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('a__line', 'js-line');
      this.svg.appendChild(path);
      this.paths.push(path);
      this.lines.push(points);
    }

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('preserveAspectRatio', 'none');
  }

  movePoints(time) {
    const { lines, mouse, noise } = this;

    lines.forEach((points) => {
      points.forEach((p) => {
        const move =
          noise.perlin2(
            (p.x + time * 0.0125) * 0.002,
            (p.y + time * 0.005) * 0.0015
          ) * 12;
        p.wave.x = Math.cos(move) * 32;
        p.wave.y = Math.sin(move) * 16;

        const dx = p.x - mouse.sx;
        const dy = p.y - mouse.sy;
        const d = Math.hypot(dx, dy);
        const l = Math.max(175, mouse.vs);

        if (d < l) {
          const s = 1 - d / l;
          const f = Math.cos(d * 0.001) * s;
          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065;
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065;
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.005;
        p.cursor.vy += (0 - p.cursor.y) * 0.005;
        p.cursor.vx *= 0.925;
        p.cursor.vy *= 0.925;
        p.cursor.x += p.cursor.vx * 2;
        p.cursor.y += p.cursor.vy * 2;
        p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x));
        p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
      });
    });
  }

  moved(point, withCursorForce = true) {
    const coords = {
      x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
      y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
    };
    coords.x = Math.round(coords.x * 10) / 10;
    coords.y = Math.round(coords.y * 10) / 10;
    return coords;
  }

  drawLines() {
    const { lines, paths } = this;

    lines.forEach((points, lIndex) => {
      let p1 = this.moved(points[0], false);
      let d = `M ${p1.x} ${p1.y}`;

      points.forEach((_, pIndex) => {
        const isLast = pIndex === points.length - 1;
        p1 = this.moved(points[pIndex], !isLast);
        const p2 = this.moved(
          points[pIndex + 1] || points[points.length - 1],
          !isLast
        );
        d += ` L ${p1.x} ${p1.y}`;
      });

      paths[lIndex].setAttribute('d', d);
    });
  }

  tick(time) {
    const { mouse } = this;

    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    const dx = mouse.x - mouse.lx;
    const dy = mouse.y - mouse.ly;
    const d = Math.hypot(dx, dy);

    mouse.v = d;
    mouse.vs += (d - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);
    mouse.lx = mouse.x;
    mouse.ly = mouse.y;
    mouse.a = Math.atan2(dy, dx);

    this.style.setProperty('--x', `${mouse.sx}px`);
    this.style.setProperty('--y', `${mouse.sy}px`);

    this.movePoints(time);
    this.drawLines();

    requestAnimationFrame(this.tick.bind(this));
  }
}

customElements.define('a-waves', AWaves);

/* Binary line - rounded bars, flickering 0s and 1s */
(function() {
  const binaryLines = document.querySelectorAll('.js-binary-flicker');
  if (!binaryLines.length) return;

  function wrapChars(el) {
    const text = el.dataset.text || el.textContent || '';
    el.innerHTML = '';
    for (const char of text) {
      const span = document.createElement('span');
      span.textContent = char;
      span.className = char === '/' ? 'binary-slash' : 'binary-digit';
      if (char === '0' || char === '1') span.dataset.original = char;
      el.appendChild(span);
    }
  }

  function flicker() {
    binaryLines.forEach((el) => {
      el.querySelectorAll('.binary-digit').forEach((span) => {
        if (Math.random() < 0.08) {
          span.textContent = span.textContent === '0' ? '1' : '0';
        }
      });
    });
  }

  binaryLines.forEach(wrapChars);
  setInterval(flicker, 180);
})();

/* Work section - subtle fade-in on scroll */
(function() {
  const section = document.getElementById('work');
  if (!section) return;

  const hole = section.querySelector('a-hole');
  const cards = section.querySelectorAll('.work-card-orbit');

  function updateAnimations() {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const trigger = viewportHeight * 0.8;
    const visible = rect.top < trigger;
    const progress = Math.max(0, Math.min(1, (trigger - rect.top) / (viewportHeight * 0.5)));
    const opacity = 0.4 + progress * 0.6;

    section.style.setProperty('--work-opacity', opacity);
    cards.forEach((card) => {
      card.style.opacity = opacity;
    });
  }

  window.addEventListener('scroll', updateAnimations, { passive: true });
  window.addEventListener('resize', updateAnimations);
  updateAnimations();
})();
