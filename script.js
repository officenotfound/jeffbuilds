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
  { type: 'output', text: "Conciera/   Nicago/   Letterhome/   Clickguard/   Go On PR/   404: Office Not Found/" },
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

/* ── hello, devtools ── */
console.log('%chey, you opened devtools 👀', 'color:#4d9fff;font-weight:700;font-size:13px');
console.log('%cthis whole thing is hand-coded. no framework, no build step, 0 dependencies.', 'color:#888');
console.log('%csource → https://github.com/officenotfound/jeffbuilds', 'color:#888');
console.log('%cps: type `help` in the terminal up top. there are games in here.', 'color:#888');


/* ────────────────────────────────────────────────
   interactive terminal
──────────────────────────────────────────────── */
const projects = {
  conciera: {
    name: 'Conciera', url: 'https://conciera.ca',
    desc: 'An AI phone front desk for Canadian healthcare clinics that answers, books, and routes patient calls.',
    stack: 'Next.js · Supabase · Vapi · Twilio',
    aliases: ['conciera']
  },
  nicago: {
    name: 'Nicago', url: 'https://www.nicago.com',
    desc: 'Helping people escape high costs and relocate to Nicaragua. Guides, real estate referrals, and expat consulting.',
    stack: 'Next.js · TypeScript · Tailwind · Supabase',
    aliases: ['nica', 'nicaragua']
  },
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

  const history = [];
  let hi = 0;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      if (val.trim()) history.push(val);
      hi = history.length;
      input.value = '';
      runCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length) { hi = Math.max(0, hi - 1); input.value = history[hi]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length) { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.trim().toLowerCase();
      if (!v) return;
      const matches = COMMANDS.filter(c => c.startsWith(v));
      if (matches.length === 1) input.value = matches[0] + ' ';
      else if (matches.length > 1) { echoCommand(input.value); print(matches.join('   '), 'dim'); scrollTermToBottom(); }
    } else if (soundOn && e.key.length === 1) {
      clickSound();
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
const COMMANDS = ['help', 'ls', 'cat', 'open', 'whoami', 'about', 'now', 'stats', 'uses', 'theme', 'crt', 'sound', 'radio', 'contact', 'clear', 'pong', 'tetris', 'snake'];

/* ── optional keyboard click sound ── */
let soundOn = false;
let audioCtx = null;
function clickSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420 + Math.random() * 80, t);
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.05);
  } catch (e) { /* no audio */ }
}
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
    print('  about / now        who i am, what i am up to', 'dim');
    print('  whoami / stats     the short version', 'dim');
    print('  uses               what this site is built with', 'dim');
    print('  theme / crt        flip the lights / retro mode', 'dim');
    print('  sound              toggle keyboard clicks', 'dim');
    print('  pong tetris snake  yes, really', 'dim');
    print('  contact            how to reach me', 'dim');
    print('  clear              wipe the screen', 'dim');
    print('  ↑ ↓ recall  ·  tab completes', 'dim');
  }
  else if (c === 'ls') {
    print('Conciera/   Nicago/   Letterhome/   ClickGuard/   Go-on-PR/   404/');
  }
  else if (c === 'whoami') {
    print('jeff. nomad by choice, builder by nature, curious by default.', 'highlight');
  }
  else if (c === 'about') {
    print('canadian, working remote, usually somewhere warmer than canada.');
    print('i build websites and tools, mostly to fix things that annoyed me.', 'dim');
    print('the stuff listed here is the work i actually care about.', 'dim');
  }
  else if (c === 'now') {
    print('currently building: Conciera, an AI phone front desk for clinics.');
    print('also keeping the other projects alive and poking at new ideas.', 'dim');
    print('always up for an interesting problem.', 'dim');
  }
  else if (c === 'stats') {
    print('projects shipped:  ' + Object.keys(projects).length + ' (and counting)');
    print('stack in rotation: Node.js, Swift, Next.js, WordPress, vanilla JS', 'dim');
    print('building since:    2024', 'dim');
  }
  else if (c === 'uses') {
    print('how this site is made:');
    print('  os         macOS', 'dim');
    print('  code       hand-written, vanilla js, no framework, 0 deps', 'dim');
    print('  fonts      JetBrains Mono + Inter', 'dim');
    print('  hosting    github pages, cloudflare dns', 'dim');
    print('  analytics  goatcounter (no cookies)', 'dim');
  }
  else if (c === 'sound') {
    const want = arg.toLowerCase();
    soundOn = want === 'off' ? false : want === 'on' ? true : !soundOn;
    if (soundOn) clickSound();
    print('keyboard sound ' + (soundOn ? 'on. clackety clack.' : 'off.'), 'dim');
  }
  else if (c === 'snake') { print('booting snake...  arrows / WASD / swipe to turn  ·  [ esc ] quit', 'dim'); playSnake(); }
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
  else if (c === 'radio') {
    if (window._bellPlayer) {
      window._bellPlayer.open();
      window._bellPlayer.play();
      print('tuning in to art bell. coast to coast, baby.', 'dim');
    }
  }
  else if (c === 'matrix') { matrixRain(); print('wake up, neo...', 'highlight'); }
  else if (c === 'pong') { print('booting pong...  move: mouse / arrows / drag  ·  [ esc ] quit', 'dim'); playPong(); }
  else if (c === 'tetris') { print('booting tetris...  arrows + space, or swipe + tap  ·  [ esc ] quit', 'dim'); playTetris(); }
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
let tetrisActive = false;
let snakeActive = false;
function playPong() {
  if (pongActive || tetrisActive || snakeActive) return;
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

  const baseSpeed = Math.max(2.6, W * 0.0055); // gentle to start
  let rallyMul = 0.8;                          // ramps up as the rally / match goes on

  const ball = {};
  function resetBall(dir) {
    ball.x = W / 2; ball.y = H / 2;
    const speed = baseSpeed * rallyMul;
    const angle = (Math.random() * 0.5 - 0.25);
    ball.vx = (dir || (Math.random() > 0.5 ? 1 : -1)) * speed * Math.cos(angle);
    ball.vy = speed * Math.sin(angle) + (Math.random() - 0.5) * 1.5;
  }
  function bounce(padY, dir) {
    rallyMul = Math.min(rallyMul + 0.06, 2.4); // every paddle hit nudges the pace up
    const rel = Math.max(-1, Math.min(1, (ball.y - (padY + padH / 2)) / (padH / 2)));
    const spd = baseSpeed * rallyMul;
    const ang = rel * 0.9;
    ball.vx = dir * spd * Math.cos(ang);
    ball.vy = spd * Math.sin(ang);
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
      // ai movement (eased, imperfect, scales gently with pace)
      const aiCenter = ai.y + padH / 2;
      const aiSpeed = Math.max(3.0, H * 0.011) * Math.min(1.4, 0.8 + rallyMul * 0.2);
      if (ball.y < aiCenter - 10) ai.y -= aiSpeed;
      else if (ball.y > aiCenter + 10) ai.y += aiSpeed;
      clampPaddle(ai);

      // ball
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.y < 4) { ball.y = 4; ball.vy *= -1; }
      if (ball.y > H - 4) { ball.y = H - 4; ball.vy *= -1; }

      // paddle collisions
      if (ball.vx < 0 && ball.x - 4 <= player.x + padW && ball.x > player.x &&
          ball.y >= player.y && ball.y <= player.y + padH) {
        ball.x = player.x + padW + 4;
        bounce(player.y, 1);
      }
      const aix = ai.x();
      if (ball.vx > 0 && ball.x + 4 >= aix && ball.x < aix + padW &&
          ball.y >= ai.y && ball.y <= ai.y + padH) {
        ball.x = aix - 4;
        bounce(ai.y, -1);
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


/* ────────────────────────────────────────────────
   tetris — CRT takeover of the terminal screen
──────────────────────────────────────────────── */
function playTetris() {
  if (pongActive || tetrisActive || snakeActive) return;
  tetrisActive = true;
  if (input) input.blur();

  const prevOverflow = body.style.overflow;
  body.style.overflow = 'hidden';
  body.scrollTop = 0;

  const wrap = document.createElement('div');
  wrap.className = 'pong';            // reuse the CRT frame styling
  const canvas = document.createElement('canvas');
  const scan = document.createElement('div');
  scan.className = 'pong-scan';
  wrap.appendChild(canvas);
  wrap.appendChild(scan);
  body.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = body.clientWidth, H = body.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const COLS = 10, ROWS = 18;
  const cell = Math.max(8, Math.floor(Math.min(H / ROWS, W / (COLS + 7))));
  const boardW = cell * COLS, boardH = cell * ROWS;
  const ox = Math.floor((W - boardW) / 2);
  const oy = Math.floor((H - boardH) / 2);

  const SHAPES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
  };
  const COLORS = { I:'#4dd0ff', O:'#ffd54d', T:'#b388ff', S:'#6cf0a0', Z:'#ff6b6b', J:'#5b8cff', L:'#ffa64d' };
  const KEYS = Object.keys(SHAPES);

  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  let cur, curX, curY, curColor;
  let bag = [];
  let lines = 0, score = 0, over = false;

  function nextType() {
    if (!bag.length) { bag = KEYS.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; } }
    return bag.pop();
  }
  function rotate(m) { return m[0].map((_, i) => m.map(r => r[i]).reverse()); }
  function collide(shape, x, y) {
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++)
        if (shape[r][c]) {
          const bx = x + c, by = y + r;
          if (bx < 0 || bx >= COLS || by >= ROWS) return true;
          if (by >= 0 && grid[by][bx]) return true;
        }
    return false;
  }
  function dropInterval() { return Math.max(110, 700 - Math.floor(lines / 8) * 70); }
  function spawn() {
    const t = nextType();
    cur = SHAPES[t].map(r => r.slice());
    curColor = COLORS[t];
    curX = ((COLS - cur[0].length) / 2) | 0;
    curY = 0;                      // appear in the well immediately
    dropAcc = dropInterval() / 2;  // half-tick head start so the next piece comes twice as fast
    if (collide(cur, curX, curY)) { over = true; }
  }
  function lock() {
    for (let r = 0; r < cur.length; r++)
      for (let c = 0; c < cur[r].length; c++)
        if (cur[r][c] && curY + r >= 0) grid[curY + r][curX + c] = curColor;
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r].every(v => v)) { grid.splice(r, 1); grid.unshift(Array(COLS).fill(null)); cleared++; r++; }
    }
    if (cleared) { lines += cleared; score += [0, 100, 300, 500, 800][cleared]; }
    spawn();
  }
  function step() {
    if (collide(cur, curX, curY + 1)) lock();
    else curY++;
  }
  function hardDrop() {
    let d = 0;
    while (!collide(cur, curX, curY + 1)) { curY++; d++; }
    score += d * 2;
    lock();
  }
  function tryRotate() {
    const r = rotate(cur);
    for (const dx of [0, -1, 1, -2, 2]) {
      if (!collide(r, curX + dx, curY)) { cur = r; curX += dx; return; }
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); quit(); return; }
    if (over) return;
    const k = e.key;
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','x','X'].includes(k)) e.preventDefault();
    if (k === 'ArrowLeft' && !collide(cur, curX - 1, curY)) curX--;
    else if (k === 'ArrowRight' && !collide(cur, curX + 1, curY)) curX++;
    else if (k === 'ArrowDown') { if (!collide(cur, curX, curY + 1)) { curY++; score += 1; } dropAcc = 0; }
    else if (k === 'ArrowUp' || k === 'x' || k === 'X') tryRotate();
    else if (k === ' ') hardDrop();
  }
  window.addEventListener('keydown', onKey);

  // touch: swipe left/right to move, down to hard drop, up or tap to rotate
  let tsx = 0, tsy = 0;
  function tStart(e) { const t = e.touches[0]; tsx = t.clientX; tsy = t.clientY; }
  function tEnd(e) {
    if (over) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tsx, dy = t.clientY - tsy, ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < 16 && ay < 16) { tryRotate(); return; }
    if (ax > ay) { if (dx > 0) { if (!collide(cur, curX + 1, curY)) curX++; } else { if (!collide(cur, curX - 1, curY)) curX--; } }
    else { if (dy > 0) hardDrop(); else tryRotate(); }
  }
  canvas.addEventListener('touchstart', tStart, { passive: true });
  canvas.addEventListener('touchend', tEnd, { passive: true });
  wrap.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

  function block(x, y, color, glow) {
    ctx.fillStyle = color;
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 8; }
    ctx.fillRect(ox + x * cell + 1, oy + y * cell + 1, cell - 2, cell - 2);
    ctx.shadowBlur = 0;
  }

  let raf, last = performance.now(), dropAcc = 0;
  function frame(now) {
    const dt = now - last; last = now;
    if (!over) {
      const interval = dropInterval();
      dropAcc += dt;
      while (dropAcc >= interval) { step(); dropAcc -= interval; if (over) break; }
    }

    // bg
    ctx.fillStyle = '#060a08'; ctx.fillRect(0, 0, W, H);
    // well
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(ox, oy, boardW, boardH);
    ctx.strokeStyle = 'rgba(108,240,160,0.25)'; ctx.strokeRect(ox + 0.5, oy + 0.5, boardW, boardH);
    // locked
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) block(c, r, grid[r][c], true);
    // current
    if (!over) for (let r = 0; r < cur.length; r++) for (let c = 0; c < cur[r].length; c++) if (cur[r][c] && curY + r >= 0) block(curX + c, curY + r, curColor, true);

    // hud
    ctx.fillStyle = '#6cf0a0'; ctx.textAlign = 'left';
    ctx.font = '700 13px Menlo, monospace';
    const hx = Math.max(6, ox - 84);
    ctx.fillText('TETRIS', hx, oy + 16);
    ctx.font = '11px Menlo, monospace';
    ctx.fillStyle = 'rgba(108,240,160,0.8)';
    ctx.fillText('lines  ' + lines, hx, oy + 40);
    ctx.fillText('score  ' + score, hx, oy + 58);
    ctx.fillText('level  ' + (Math.floor(lines / 8) + 1), hx, oy + 76);

    // controls (right gutter)
    const rx = ox + boardW + 14;
    ctx.fillStyle = '#6cf0a0'; ctx.font = '700 12px Menlo, monospace';
    ctx.fillText('CONTROLS', rx, oy + 16);
    ctx.font = '11px Menlo, monospace'; ctx.fillStyle = 'rgba(108,240,160,0.8)';
    ['← →  move', '↑    rotate', '↓    soft', 'space hard', 'esc  quit'].forEach((t, i) => ctx.fillText(t, rx, oy + 40 + i * 18));

    if (over) {
      ctx.textAlign = 'center'; ctx.fillStyle = '#6cf0a0';
      ctx.font = '700 20px Menlo, monospace';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 4);
      ctx.font = '12px Menlo, monospace'; ctx.fillStyle = 'rgba(108,240,160,0.7)';
      ctx.fillText('[ esc ] to return', W / 2, H / 2 + 20);
    }
    raf = requestAnimationFrame(frame);
  }

  function quit() {
    if (!tetrisActive) return;
    tetrisActive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKey);
    wrap.remove();
    body.style.overflow = prevOverflow;
    if (input && window.matchMedia('(pointer: fine)').matches) input.focus();
    print('thanks for playing.', 'dim');
    scrollTermToBottom();
  }

  spawn();
  raf = requestAnimationFrame(frame);
}


/* ────────────────────────────────────────────────
   snake — CRT takeover of the terminal screen
──────────────────────────────────────────────── */
function playSnake() {
  if (pongActive || tetrisActive || snakeActive) return;
  snakeActive = true;
  if (input) input.blur();

  const prevOverflow = body.style.overflow;
  body.style.overflow = 'hidden';
  body.scrollTop = 0;

  const wrap = document.createElement('div');
  wrap.className = 'pong';
  const canvas = document.createElement('canvas');
  const scan = document.createElement('div');
  scan.className = 'pong-scan';
  wrap.appendChild(canvas);
  wrap.appendChild(scan);
  body.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = body.clientWidth, H = body.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cell = Math.max(10, Math.floor(Math.min(W, H) / 18));
  const cols = Math.floor(W / cell), rows = Math.floor(H / cell);
  const ox = Math.floor((W - cols * cell) / 2), oy = Math.floor((H - rows * cell) / 2);

  let snake = [{ x: (cols / 2) | 0, y: (rows / 2) | 0 }];
  let dir = { x: 1, y: 0 }, nextDir = { x: 1, y: 0 };
  let food = randFood();
  let score = 0, over = false;
  let stepMs = 130, acc = 0, last = performance.now(), raf;

  function randFood() {
    let f;
    do { f = { x: (Math.random() * cols) | 0, y: (Math.random() * rows) | 0 }; }
    while (snake.some(s => s.x === f.x && s.y === f.y));
    return f;
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); quit(); return; }
    const k = e.key.toLowerCase();
    const map = { arrowup: [0,-1], arrowdown: [0,1], arrowleft: [-1,0], arrowright: [1,0], w: [0,-1], s: [0,1], a: [-1,0], d: [1,0] };
    if (map[k]) {
      e.preventDefault();
      const [x, y] = map[k];
      if (x !== -dir.x || y !== -dir.y) nextDir = { x, y }; // no instant reverse
    }
  }
  window.addEventListener('keydown', onKey);

  // touch: swipe to turn
  let tsx = 0, tsy = 0;
  function tStart(e) { const t = e.touches[0]; tsx = t.clientX; tsy = t.clientY; }
  function tEnd(e) {
    const t = e.changedTouches[0];
    const dx = t.clientX - tsx, dy = t.clientY - tsy;
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
    const nd = Math.abs(dx) > Math.abs(dy) ? { x: dx > 0 ? 1 : -1, y: 0 } : { x: 0, y: dy > 0 ? 1 : -1 };
    if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd;
  }
  canvas.addEventListener('touchstart', tStart, { passive: true });
  canvas.addEventListener('touchend', tEnd, { passive: true });
  wrap.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)) {
      over = true; return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++; food = randFood();
      if (stepMs > 60) stepMs -= 4; // speed up
    } else {
      snake.pop();
    }
  }

  function draw(now) {
    const dt = now - last; last = now;
    if (!over) { acc += dt; while (acc >= stepMs) { tick(); acc -= stepMs; if (over) break; } }

    ctx.fillStyle = '#060a08'; ctx.fillRect(0, 0, W, H);
    // food
    ctx.fillStyle = '#ff6b6b'; ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 10;
    ctx.fillRect(ox + food.x * cell + 2, oy + food.y * cell + 2, cell - 4, cell - 4);
    // snake
    ctx.fillStyle = '#6cf0a0'; ctx.shadowColor = '#6cf0a0'; ctx.shadowBlur = 8;
    snake.forEach(s => ctx.fillRect(ox + s.x * cell + 1, oy + s.y * cell + 1, cell - 2, cell - 2));
    ctx.shadowBlur = 0;
    // score
    ctx.fillStyle = 'rgba(108,240,160,0.85)'; ctx.textAlign = 'left'; ctx.font = '700 14px Menlo, monospace';
    ctx.fillText('score ' + score, ox + 4, oy + 16);
    ctx.textAlign = 'right'; ctx.font = '11px Menlo, monospace'; ctx.fillStyle = 'rgba(108,240,160,0.6)';
    ctx.fillText('[ esc ] quit', ox + cols * cell - 4, oy + 16);

    if (over) {
      ctx.textAlign = 'center'; ctx.fillStyle = '#6cf0a0'; ctx.font = '700 22px Menlo, monospace';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 4);
      ctx.font = '12px Menlo, monospace'; ctx.fillStyle = 'rgba(108,240,160,0.7)';
      ctx.fillText('score ' + score + '  ·  [ esc ] to return', W / 2, H / 2 + 20);
    }
    raf = requestAnimationFrame(draw);
  }

  function quit() {
    if (!snakeActive) return;
    snakeActive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKey);
    wrap.remove();
    body.style.overflow = prevOverflow;
    if (input && window.matchMedia('(pointer: fine)').matches) input.focus();
    print('thanks for playing.', 'dim');
    scrollTermToBottom();
  }

  raf = requestAnimationFrame(draw);
}

/* ── Art Bell / Coast to Coast player ── */
(function () {
  const SOURCES = [
    'the-ultimate-art-bell-collection_202201',
    'ArtBell_Somewhere_In_Time'
  ];

  // Fan-ranked legendary episodes — matched against titles, highest score sorts first
  const PRIORITY = [
    { score: 100, terms: ['area 51 caller', 'area51 caller'] },
    { score: 98,  terms: ['bob lazar'] },
    { score: 95,  terms: ["mel's hole", 'mels hole', 'mel hole'] },
    { score: 92,  terms: ['shadow people'] },
    { score: 90,  terms: ['whitley strieber'] },
    { score: 88,  terms: ['hale-bopp', 'hale bopp', 'hale_bopp'] },
    { score: 86,  terms: ['ghost to ghost', 'ghosts to ghosts', 'ghost2ghost'] },
    { score: 84,  terms: ['john titor', 'time travel'] },
    { score: 82,  terms: ['remote viewing', 'remote view'] },
    { score: 80,  terms: ['david icke'] },
    { score: 78,  terms: ['gordon michael scallion', 'scallion'] },
    { score: 76,  terms: ['ed dames'] },
    { score: 74,  terms: ['richard hoagland'] },
    { score: 72,  terms: ['cattle mutilation', 'cattle mutil'] },
    { score: 70,  terms: ['bigfoot', 'sasquatch'] },
    { score: 68,  terms: ['roswell'] },
    { score: 66,  terms: ['mothman'] },
    { score: 64,  terms: ['alien abduction', 'abduction'] },
    { score: 62,  terms: ['dreamland'] },
  ];

  function epScore(title) {
    const t = title.toLowerCase();
    for (const p of PRIORITY) {
      if (p.terms.some(term => t.includes(term))) return p.score;
    }
    return 0;
  }

  let episodes = [], currentIdx = -1, audio = null;
  let playing = false, shuffleOn = false, expanded = false;
  let loaded = false, loading = false;
  let shuffleQueue = [];

  const playerEl   = document.getElementById('bell-player');
  const barEl      = document.getElementById('bell-bar');
  const ppBtn      = document.getElementById('bell-pp');
  const pp2Btn     = document.getElementById('bell-pp2');
  const pp2Icon    = document.getElementById('bell-pp2-icon');
  const pp2Label   = document.getElementById('bell-pp2-label');
  const prevBtn    = document.getElementById('bell-prev');
  const nextBtn    = document.getElementById('bell-next');
  const shuffleBtn = document.getElementById('bell-shuffle');
  const chevronBtn = document.getElementById('bell-chevron');
  const panelEl    = document.getElementById('bell-panel');
  const epLabel    = document.getElementById('bell-ep-label');
  const listEl     = document.getElementById('bell-list');
  const seekEl     = document.getElementById('bell-seek');
  const fillEl     = document.getElementById('bell-fill');
  const miniFill   = document.getElementById('bell-mini-fill');
  const timeEl     = document.getElementById('bell-time');
  const durEl      = document.getElementById('bell-dur');
  const volRange   = document.getElementById('bell-vol');
  const volPct     = document.getElementById('bell-vol-pct');
  const searchEl   = document.getElementById('bell-search');

  function fmt(s) {
    if (!isFinite(s) || s < 0) return '--:--';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
             : `${m}:${String(sec).padStart(2,'0')}`;
  }

  function setPlayingUI(on) {
    const glyph = on ? '⏸' : '▶';
    const lbl   = on ? 'pause' : 'play';
    ppBtn.textContent = glyph;
    if (pp2Icon)  pp2Icon.textContent  = glyph;
    if (pp2Label) pp2Label.textContent = lbl;
    playerEl.classList.toggle('on', on);
  }

  function getAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.volume = 0.8;
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration * 100) + '%';
      fillEl.style.width = pct;
      if (miniFill) miniFill.style.width = pct;
      timeEl.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); });
    audio.addEventListener('ended', advanceEpisode);
    audio.addEventListener('error', advanceEpisode);
    return audio;
  }

  async function playIdx(idx) {
    if (idx < 0 || idx >= episodes.length) return;
    currentIdx = idx;
    const ep = episodes[idx];

    if (!ep.url) {
      const rows = listEl.querySelectorAll('.bell-row');
      if (rows[idx]) rows[idx].querySelector('.bell-row-title').textContent = '⏳ ' + ep.title;
      const url = await resolveUrl(ep);
      if (!url) { advanceEpisode(); return; }
    }

    const a = getAudio();
    a.src = ep.url;
    a.play().catch(() => {});
    playing = true;
    setPlayingUI(true);
    epLabel.textContent = ep.title;
    fillEl.style.width = '0';
    if (miniFill) miniFill.style.width = '0';
    durEl.textContent = '--:--';
    timeEl.textContent = '0:00';
    highlightRow(idx);
    // auto-expand on first play
    if (!expanded) openPanel();
  }

  async function resolveUrl(ep) {
    try {
      const res = await fetch(`https://archive.org/metadata/${ep.identifier}/files`);
      const data = await res.json();
      const files = Array.isArray(data) ? data : (data.result || []);
      const mp3 = files.find(f => f.name?.toLowerCase().endsWith('.mp3') && f.source === 'original')
               || files.find(f => f.name?.toLowerCase().endsWith('.mp3'));
      if (mp3) ep.url = `https://archive.org/download/${ep.identifier}/${encodeURIComponent(mp3.name)}`;
    } catch(e) {}
    return ep.url || null;
  }

  function advanceEpisode() {
    if (!episodes.length) return;
    if (shuffleOn) {
      if (!shuffleQueue.length) buildShuffle();
      playIdx(shuffleQueue.shift());
    } else {
      playIdx((currentIdx + 1) % episodes.length);
    }
  }

  function prevEpisode() {
    if (!episodes.length) return;
    playIdx(currentIdx <= 0 ? episodes.length - 1 : currentIdx - 1);
  }

  function buildShuffle() {
    shuffleQueue = episodes.map((_, i) => i).filter(i => i !== currentIdx);
    for (let i = shuffleQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffleQueue[i], shuffleQueue[j]] = [shuffleQueue[j], shuffleQueue[i]];
    }
  }

  function highlightRow(idx) {
    listEl.querySelectorAll('.bell-row').forEach((r, i) => r.classList.toggle('on', i === idx));
    const active = listEl.querySelector('.bell-row.on');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  async function openPanel() {
    expanded = true;
    panelEl.hidden = false;
    chevronBtn.textContent = '▴';
    if (!loaded && !loading) await loadEpisodes();
  }

  function closePanel() {
    expanded = false;
    panelEl.hidden = true;
    chevronBtn.textContent = '▾';
  }

  async function togglePlay() {
    if (!loaded && !loading) await loadEpisodes();
    if (!episodes.length) return;
    if (playing) {
      getAudio().pause();
      playing = false;
      setPlayingUI(false);
    } else {
      if (currentIdx === -1) { playIdx(0); }
      else { getAudio().play().catch(() => {}); playing = true; setPlayingUI(true); }
    }
  }

  // clicking the bar area (not the pp button) toggles the panel
  barEl.addEventListener('click', async e => {
    if (e.target === ppBtn || ppBtn.contains(e.target)) return;
    expanded ? closePanel() : await openPanel();
  });

  ppBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
  if (pp2Btn) pp2Btn.addEventListener('click', togglePlay);
  if (prevBtn) prevBtn.addEventListener('click', prevEpisode);
  nextBtn.addEventListener('click', advanceEpisode);

  shuffleBtn.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    shuffleBtn.classList.toggle('on', shuffleOn);
    if (shuffleOn) buildShuffle();
  });

  chevronBtn.addEventListener('click', e => {
    e.stopPropagation();
    expanded ? closePanel() : openPanel();
  });

  seekEl.addEventListener('click', e => {
    const a = getAudio();
    if (!a.duration) return;
    const r = seekEl.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
  });

  function setVolume(v) {
    v = Math.min(1, Math.max(0, v));
    getAudio().volume = v;
    const pct = Math.round(v * 100);
    if (volRange) volRange.value = pct;
    if (volPct)   volPct.textContent = pct + '%';
  }

  if (volRange) volRange.addEventListener('input', () => setVolume(volRange.value / 100));

  playerEl.addEventListener('wheel', e => {
    e.preventDefault();
    setVolume(getAudio().volume - e.deltaY * 0.001);
  }, { passive: false });

  // episode search filter
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.toLowerCase().trim();
      listEl.querySelectorAll('.bell-row').forEach(r => {
        const title = episodes[parseInt(r.dataset.i)]?.title.toLowerCase() || '';
        r.style.display = (!q || title.includes(q)) ? '' : 'none';
      });
      const anyVisible = [...listEl.querySelectorAll('.bell-row')].some(r => r.style.display !== 'none');
      let noRes = listEl.querySelector('.bell-no-results');
      if (!anyVisible && q) {
        if (!noRes) { noRes = document.createElement('div'); noRes.className = 'bell-no-results'; noRes.textContent = 'no episodes match'; listEl.appendChild(noRes); }
      } else if (noRes) noRes.remove();
    });
  }

  async function loadEpisodes() {
    loading = true;
    listEl.innerHTML = '<div class="bell-hint">fetching episodes from archive.org...</div>';
    const all = [];

    for (const id of SOURCES) {
      try {
        const res  = await fetch(`https://archive.org/metadata/${id}`);
        const data = await res.json();

        if (data.files && data.files.length) {
          const originals = data.files.filter(f =>
            f.name?.toLowerCase().endsWith('.mp3') &&
            f.source === 'original' &&
            !f.name.toLowerCase().includes('/extras/') &&
            !f.name.toLowerCase().startsWith('extras/')
          );
          const mp3s = originals.length
            ? originals
            : data.files.filter(f =>
                f.name?.toLowerCase().endsWith('.mp3') &&
                !f.name.toLowerCase().includes('/extras/') &&
                !f.name.toLowerCase().startsWith('extras/')
              );
          mp3s.forEach(f => {
            const title = (f.title || f.name.replace(/\.mp3$/i,'').replace(/[_-]+/g,' ')).trim();
            all.push({
              title,
              url: `https://archive.org/download/${id}/${encodeURIComponent(f.name)}`,
              date: f.mtime ? new Date(parseInt(f.mtime)*1000).toISOString().slice(0,10) : '',
              identifier: id
            });
          });
        }

        if (data.metadata?.mediatype === 'collection' || !data.files?.some(f => f.name?.toLowerCase().endsWith('.mp3'))) {
          const sr = await fetch(
            `https://archive.org/advancedsearch.php?q=collection:${id}&output=json&rows=200&fl[]=identifier,title,date&sort[]=date+asc`
          );
          const sd = await sr.json();
          (sd.response?.docs || []).forEach(doc => {
            all.push({ title: doc.title || doc.identifier, date: doc.date?.slice(0,10) || '', identifier: doc.identifier, url: null });
          });
        }
      } catch(e) { console.warn('[bell]', id, e); }
    }

    // dedupe by title, then sort: legendary episodes first, then chronological
    const seen = new Set();
    const deduped = all.filter(ep => { const k = ep.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    deduped.sort((a, b) => {
      const sd = epScore(b.title) - epScore(a.title);
      if (sd !== 0) return sd;
      return (a.date || '').localeCompare(b.date || '');
    });
    episodes = deduped;
    loaded = true;
    loading = false;
    const stn = document.querySelector('.bell-station');
    if (stn) stn.textContent = 'live from the high desert';
    renderList();
  }

  const SOURCE_LABELS = {
    'the-ultimate-art-bell-collection_202201': 'The Ultimate Art Bell Collection',
    'ArtBell_Somewhere_In_Time': 'Art Bell: Somewhere in Time'
  };

  function fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function renderList() {
    if (!episodes.length) {
      listEl.innerHTML = '<div class="bell-err">no episodes found</div>';
      return;
    }
    listEl.innerHTML = episodes.map((ep, i) => {
      const score = epScore(ep.title);
      const badge = score >= 80 ? '<span class="bell-badge">★ fan favorite</span>' : '';
      const source = SOURCE_LABELS[ep.identifier] || ep.identifier || '';
      return `
      <div class="bell-row${i === currentIdx ? ' on' : ''}" data-i="${i}">
        <div class="bell-row-preview">
          <div class="bell-row-title">${ep.title}</div>
          ${ep.date ? `<div class="bell-row-date">${ep.date}</div>` : ''}
        </div>
        <div class="bell-row-detail">
          <div class="bell-row-full-title">${ep.title}</div>
          <div class="bell-row-meta">
            ${ep.date ? `<span>${fmtDate(ep.date)}</span>` : ''}
            ${source ? `<span>${source}</span>` : ''}
            ${badge}
          </div>
          <div class="bell-row-play">▶ play episode</div>
        </div>
      </div>`;
    }).join('');
    listEl.querySelectorAll('.bell-row').forEach(r =>
      r.addEventListener('click', () => playIdx(parseInt(r.dataset.i)))
    );
  }

  // terminal command: `radio`
  window._bellPlayer = { open() { if (!expanded) chevronBtn.click(); }, play() { ppBtn.click(); } };
})();
