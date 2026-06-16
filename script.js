/* ── theme toggle ── */
const toggle = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme');
if (saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches)) {
  document.body.classList.add('light');
}
toggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
});

/* ── terminal typewriter ── */
const lines = [
  { type: 'cmd',    text: 'whoami' },
  { type: 'output', text: 'jeff. nomad by choice, builder by nature, curious by default.', highlight: true },
  { type: 'cmd',    text: 'ls ./shipped' },
  { type: 'output', text: "Letterhome/   Clickguard/   Go On PR/   404: Office Not Found/" },
  { type: 'cmd',    text: 'cat why.txt' },
  { type: 'output', text: 'the day job pays the bills. this is what i actually love.', highlight: true },
];

const body = document.getElementById('terminal-body');
const cursor = document.getElementById('t-cursor');
let done = false;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function jitter(base, variance = 0.4) {
  return base * (1 + (Math.random() - 0.5) * variance);
}

async function typeLine(text, el) {
  for (const ch of text) {
    el.textContent += ch;
    await sleep(jitter(32));
  }
}

async function runTerminal() {
  await sleep(300);

  for (const line of lines) {
    const el = document.createElement('div');
    el.className = 't-line';
    body.insertBefore(el, cursor);

    if (line.type === 'cmd') {
      const prompt = document.createElement('span');
      prompt.className = 't-prompt';
      prompt.textContent = '$ ';
      el.appendChild(prompt);
      const cmd = document.createElement('span');
      cmd.className = 't-cmd';
      el.appendChild(cmd);
      await typeLine(line.text, cmd);
      await sleep(jitter(170, 0.5));
    } else {
      el.className += ' t-output' + (line.highlight ? ' highlight' : '');
      await sleep(50);
      await typeLine(line.text, el);
      await sleep(jitter(100));
    }
  }

  done = true;
  document.getElementById('hero-sub').classList.add('visible');
  initPrompt();
}

/* ── nav scroll class ── */
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── scroll reveal ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.project').forEach(el => observer.observe(el));

/* ── spotlight follows mouse (subtle) ── */
const spotlight = document.querySelector('.spotlight');
let rafId;
document.addEventListener('mousemove', e => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    spotlight.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
  });
}, { passive: true });


/* ────────────────────────────────────────────────
   interactive terminal
──────────────────────────────────────────────── */
const projects = {
  letterhome: {
    name: 'Letterhome', url: 'https://letterhome.ca',
    desc: 'Print and mail real letters to Canada from anywhere. No Canadian address required.',
    stack: 'Node.js · Express · SQLite · Stripe'
  },
  clickguard: {
    name: 'ClickGuard', url: 'https://github.com/officenotfound/Clickguard',
    desc: 'Kills the double click bug in Logitech mice. A software fix, not a new mouse.',
    stack: 'Swift · SwiftUI · Cocoa · macOS'
  },
  goonpr: {
    name: 'Go on PR', url: 'https://officenotfound.github.io/goon/',
    desc: 'A quietly elegant site for a boutique PR agency.',
    stack: 'Next.js · React · TypeScript · Tailwind',
    aliases: ['goon', 'goonpr', 'go-on-pr', 'gopr', 'pr']
  },
  '404': {
    name: '404: Office Not Found', url: 'https://404officenotfound.com',
    desc: 'The remote work resource I wish I had when I started. Learn from my failures.',
    stack: 'WordPress · HTML · CSS',
    aliases: ['office', 'officenotfound']
  }
};

function resolveProject(arg) {
  if (!arg) return null;
  const a = arg.toLowerCase().replace(/[\/'"]/g, '');
  if (projects[a]) return projects[a];
  for (const key in projects) {
    const p = projects[key];
    if (key === a) return p;
    if (p.aliases && p.aliases.includes(a)) return p;
    if (p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === a.replace(/[^a-z0-9]/g, '')) return p;
  }
  return null;
}

let inputLine, input;

function initPrompt() {
  if (inputLine) return;
  cursor.style.display = 'none';
  body.classList.add('interactive');

  inputLine = document.createElement('div');
  inputLine.className = 't-line t-input-line';
  inputLine.innerHTML = '<span class="t-prompt">$ </span>';
  input = document.createElement('input');
  input.type = 'text';
  input.className = 't-input';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('aria-label', 'terminal input');
  input.placeholder = "type 'help'";
  inputLine.appendChild(input);
  body.appendChild(inputLine);

  body.addEventListener('click', () => input.focus());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      runCommand(val);
    }
  });

  // focus on desktop only, so we don't pop the mobile keyboard on load
  if (window.matchMedia('(pointer: fine)').matches) input.focus();
}

function echoCommand(cmd) {
  const line = document.createElement('div');
  line.className = 't-line';
  line.innerHTML = '<span class="t-prompt">$ </span><span class="t-cmd"></span>';
  line.querySelector('.t-cmd').textContent = cmd;
  body.insertBefore(line, inputLine);
}

function print(text, cls) {
  const line = document.createElement('div');
  line.className = 't-line t-output' + (cls ? ' ' + cls : '');
  line.textContent = text;
  body.insertBefore(line, inputLine);
  return line;
}

function printRaw(html) {
  const line = document.createElement('div');
  line.className = 't-line t-output';
  line.innerHTML = html;
  body.insertBefore(line, inputLine);
  return line;
}

function scrollTermToBottom() {
  body.scrollTop = body.scrollHeight;
}

const pick = a => a[Math.floor(Math.random() * a.length)];
const SWEAR_RE = /\b(f+u+c+k\w*|f+c+k\w*|fuk\w*|wtf|wtaf|stfu|gtfo|fml|sh[i1]t\w*|bull?sh[i1]t\w*|dipsh\w*|b[i1]tch\w*|bastard\w*|assh\w*|ass|assh?at|assclown|jacka\w*|dumba\w*|dumbf\w*|d[i1]ck\w*|piss\w*|crap\w*|damn\w*|dammit|goddamn\w*|bollocks|bollox|bugger|wank\w*|prick|c+u+n+t\w*|motherf\w*|twat|arse\w*|douche\w*|knob(head|end)?|tosser|slag|slut\w*|whore\w*|skank\w*|scumbag|ballsack|screw\s*you|sod\s*off|shut\s*up|suck\w*|loser|stupid\w*|idiot\w*|moron\w*|imbecile|retard\w*)\b/i;
const SWEAR_REPLIES = [
  'language. this terminal has feelings too.',
  'wow. and you kiss your keyboard with that mouth?',
  'error: profanity buffer overflow. take a breath.',
  '$ sudo apt install chill',
  'noted. my creator swears at me daily, so.',
  'bleep. that one is going straight in the commit message.',
  'respectfully... same, honestly.',
  '404: filter not found. carry on then.',
  'permission denied: that word is above your clearance.',
  'easy, tiger. it is just a portfolio.',
];

function runCommand(raw) {
  const cmd = raw.trim();
  if (cmd) echoCommand(cmd);
  const [name, ...rest] = cmd.split(/\s+/);
  const arg = rest.join(' ');
  const c = name.toLowerCase();

  if (cmd === '') { /* blank */ }
  else if (c === 'help') {
    print('available commands:');
    print('  ls                 list projects', 'dim');
    print('  cat <project>      details + stack', 'dim');
    print('  open <project>     launch a project', 'dim');
    print('  whoami             who is this guy', 'dim');
    print('  theme              flip light / dark', 'dim');
    print('  crt                retro monitor mode', 'dim');
    print('  contact            how to reach me', 'dim');
    print('  clear              wipe the screen', 'dim');
  }
  else if (c === 'ls') {
    print('Letterhome/   ClickGuard/   Go-on-PR/   404/');
  }
  else if (c === 'whoami') {
    print('jeff. nomad by choice, builder by nature, curious by default.', 'highlight');
  }
  else if (c === 'cat') {
    const p = resolveProject(arg);
    if (p) { print(p.name); print(p.desc, 'dim'); print(p.stack, 'dim'); }
    else print('cat: ' + (arg || '') + ': no such project. try `ls`.', 't-error');
  }
  else if (c === 'open') {
    const p = resolveProject(arg);
    if (p) { print('opening ' + p.name + ' ↗', 'highlight'); window.open(p.url, '_blank', 'noopener'); }
    else print('open: ' + (arg || '') + ': no such project. try `ls`.', 't-error');
  }
  else if (c === 'theme') {
    document.getElementById('theme-toggle').click();
    print('lights ' + (document.body.classList.contains('light') ? 'on' : 'off') + '.', 'dim');
  }
  else if (c === 'crt') {
    document.body.classList.toggle('crt');
    print(document.body.classList.contains('crt') ? 'crt mode on. welcome to 1983.' : 'crt mode off.', 'dim');
  }
  else if (c === 'contact') {
    printRaw('<a href="mailto:404officenotfound@gmail.com" style="color:var(--accent)">404officenotfound@gmail.com</a>');
  }
  else if (c === 'clear') {
    body.querySelectorAll('.t-line:not(.t-input-line)').forEach(l => l.remove());
    const st = body.querySelector('.t-static'); if (st) st.remove();
  }
  else if (c === 'matrix') { matrixRain(); print('wake up, neo...', 'highlight'); }
  else if (c === 'pong') { print('booting pong...  [ esc ] to quit, mouse / arrows to move', 'dim'); playPong(); }
  else if (c === 'sudo') { print('nice try. you are not in the sudoers file. this incident will be reported.', 't-error'); }
  else if (c === 'rm' && /(-rf|--no-preserve-root)/.test(arg)) { print('absolutely not.', 't-error'); }
  else if (c === 'coffee') { print('brewing... ☕ always.', 'highlight'); }
  else if (c === 'hire' || cmd.toLowerCase() === 'hire me') { printRaw('let’s talk → <a href="mailto:404officenotfound@gmail.com" style="color:var(--accent)">404officenotfound@gmail.com</a>'); }
  else if (c === 'exit' || c === 'q') { print('there is no escape. (but you can scroll.)', 'dim'); }
  else if (c === 'echo') { print(arg); }
  else if (SWEAR_RE.test(cmd)) { print(pick(SWEAR_REPLIES), 'highlight'); }
  else { print('command not found: ' + name + '. type `help`.', 't-error'); }

  scrollTermToBottom();
}

/* ── live clock + uptime in the title bar ── */
(function () {
  const title = document.querySelector('.terminal-title');
  if (!title) return;
  const START = new Date('2024-01-01T00:00:00');
  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const days = Math.floor((now - START) / 86400000);
    title.textContent = `jeffrey@jeffbuilds  ${hh}:${mm}:${ss}  up ${days}d`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── matrix rain easter egg ── */
let matrixRunning = false;
function matrixRain() {
  if (matrixRunning) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  matrixRunning = true;

  const canvas = document.createElement('canvas');
  canvas.className = 'matrix-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const chars = 'アイウエオカキクケコサシスセソ01010101ｱｲｳｴｵｶｷｸｹｺ'.split('');
  const fontSize = 16;
  const cols = Math.floor(w / fontSize);
  const drops = Array(cols).fill(1);

  let frames = 0;
  const total = 260;
  let fade = 1;

  function draw() {
    ctx.fillStyle = 'rgba(11,11,11,0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.92 ? '#cfe6ff' : '#4d9fff';
      ctx.globalAlpha = fade;
      ctx.fillText(ch, x, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    ctx.globalAlpha = 1;
    frames++;
    if (frames > total) fade -= 0.04;
    if (fade <= 0) {
      canvas.remove();
      matrixRunning = false;
      return;
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }, { once: true });
}

/* ── type "matrix" anywhere to trigger it ── */
let keyBuf = '';
document.addEventListener('keydown', e => {
  if (document.activeElement === input) return; // terminal handles its own
  if (e.key.length !== 1) return;
  keyBuf = (keyBuf + e.key.toLowerCase()).slice(-6);
  if (keyBuf === 'matrix') { matrixRain(); keyBuf = ''; }
});


/* ────────────────────────────────────────────────
   boot — runs last, after all definitions exist
──────────────────────────────────────────────── */
// always type the intro; hide the crawlable static fallback now that JS is running
const staticBlock = document.querySelector('.t-static');
if (staticBlock) staticBlock.style.display = 'none';
runTerminal();


/* ────────────────────────────────────────────────
   pong — CRT takeover of the terminal screen
──────────────────────────────────────────────── */
let pongActive = false;
function playPong() {
  if (pongActive) return;
  pongActive = true;
  if (input) input.blur();

  const prevOverflow = body.style.overflow;
  body.style.overflow = 'hidden';
  body.scrollTop = 0;

  const wrap = document.createElement('div');
  wrap.className = 'pong';
  const canvas = document.createElement('canvas');
  const scan = document.createElement('div');
  scan.className = 'pong-scan';
  const hint = document.createElement('div');
  hint.className = 'pong-hint';
  hint.textContent = 'first to 7  ·  [ esc ] quit';
  wrap.appendChild(canvas);
  wrap.appendChild(scan);
  wrap.appendChild(hint);
  body.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W, H;
  function resize() {
    W = body.clientWidth;
    H = body.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const GREEN = '#6cf0a0';
  const padW = 7;
  let padH = Math.max(46, H * 0.2);
  const player = { x: 16, y: H / 2 - padH / 2 };
  const ai = { x: () => W - 16 - padW, y: H / 2 - padH / 2 };
  let pScore = 0, aScore = 0;
  let over = false, overText = '';

  const ball = {};
  function resetBall(dir) {
    ball.x = W / 2; ball.y = H / 2;
    const speed = Math.max(4.2, W * 0.009);
    const angle = (Math.random() * 0.6 - 0.3);
    ball.vx = (dir || (Math.random() > 0.5 ? 1 : -1)) * speed * Math.cos(angle);
    ball.vy = speed * Math.sin(angle) + (Math.random() - 0.5) * 2;
  }
  resetBall();

  // input
  let targetY = null;
  const keys = {};
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    targetY = cy - padH / 2;
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); quit(); return; }
    if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S'].includes(e.key)) {
      e.preventDefault();
      keys[e.key.toLowerCase()] = e.type === 'keydown';
    }
  }
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('touchmove', e => { e.preventDefault(); onMove(e); }, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKey);
  window.addEventListener('resize', resize);

  function clampPaddle(p) { p.y = Math.max(0, Math.min(H - padH, p.y)); }

  let raf;
  function loop() {
    // player movement
    if (targetY !== null) player.y += (targetY - player.y) * 0.35;
    const kbSpeed = Math.max(5, H * 0.02);
    if (keys['arrowup'] || keys['w']) { player.y -= kbSpeed; targetY = null; }
    if (keys['arrowdown'] || keys['s']) { player.y += kbSpeed; targetY = null; }
    clampPaddle(player);

    if (!over) {
      // ai movement (eased, imperfect)
      const aiCenter = ai.y + padH / 2;
      const aiSpeed = Math.max(3.4, H * 0.012);
      if (ball.y < aiCenter - 8) ai.y -= aiSpeed;
      else if (ball.y > aiCenter + 8) ai.y += aiSpeed;
      clampPaddle(ai);

      // ball
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.y < 4) { ball.y = 4; ball.vy *= -1; }
      if (ball.y > H - 4) { ball.y = H - 4; ball.vy *= -1; }

      // paddle collisions
      if (ball.vx < 0 && ball.x - 4 <= player.x + padW && ball.x > player.x &&
          ball.y >= player.y && ball.y <= player.y + padH) {
        ball.vx = Math.abs(ball.vx) * 1.04;
        ball.vy += ((ball.y - (player.y + padH / 2)) / padH) * 6;
      }
      const aix = ai.x();
      if (ball.vx > 0 && ball.x + 4 >= aix && ball.x < aix + padW &&
          ball.y >= ai.y && ball.y <= ai.y + padH) {
        ball.vx = -Math.abs(ball.vx) * 1.04;
        ball.vy += ((ball.y - (ai.y + padH / 2)) / padH) * 6;
      }

      // scoring
      if (ball.x < -10) { aScore++; checkWin(); resetBall(1); }
      if (ball.x > W + 10) { pScore++; checkWin(); resetBall(-1); }
    }

    // draw
    ctx.fillStyle = '#060a08';
    ctx.fillRect(0, 0, W, H);
    // net
    ctx.strokeStyle = 'rgba(108,240,160,0.3)';
    ctx.setLineDash([6, 10]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);
    // score
    ctx.fillStyle = 'rgba(108,240,160,0.85)';
    ctx.font = '700 26px Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pScore, W / 2 - 40, 32);
    ctx.fillText(aScore, W / 2 + 40, 32);
    // glow paddles + ball
    ctx.shadowColor = GREEN; ctx.shadowBlur = 12; ctx.fillStyle = GREEN;
    ctx.fillRect(player.x, player.y, padW, padH);
    ctx.fillRect(ai.x(), ai.y, padW, padH);
    ctx.fillRect(ball.x - 4, ball.y - 4, 8, 8);
    ctx.shadowBlur = 0;

    if (over) {
      ctx.fillStyle = GREEN;
      ctx.font = '700 22px Menlo, monospace';
      ctx.fillText(overText, W / 2, H / 2 - 4);
      ctx.font = '12px Menlo, monospace';
      ctx.fillStyle = 'rgba(108,240,160,0.7)';
      ctx.fillText('[ esc ] to return', W / 2, H / 2 + 22);
    }

    raf = requestAnimationFrame(loop);
  }

  function checkWin() {
    if (pScore >= 7) { over = true; overText = 'YOU WIN'; }
    else if (aScore >= 7) { over = true; overText = 'GAME OVER'; }
  }

  function quit() {
    if (!pongActive) return;
    pongActive = false;
    cancelAnimationFrame(raf);
    canvas.removeEventListener('mousemove', onMove);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKey);
    window.removeEventListener('resize', resize);
    wrap.remove();
    body.style.overflow = prevOverflow;
    if (input && window.matchMedia('(pointer: fine)').matches) input.focus();
    print('thanks for playing.', 'dim');
    scrollTermToBottom();
  }

  loop();
}
