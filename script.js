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
  { type: 'output', text: 'letterhome/   clickguard/   go-on-pr/   404/' },
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
    await sleep(jitter(55));
  }
}

async function runTerminal() {
  await sleep(500);

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
      await sleep(jitter(280, 0.5));
    } else {
      el.className += ' t-output' + (line.highlight ? ' highlight' : '');
      await sleep(80);
      await typeLine(line.text, el);
      await sleep(jitter(160));
    }
  }

  // final prompt line
  const finalLine = document.createElement('div');
  finalLine.className = 't-line';
  const finalPrompt = document.createElement('span');
  finalPrompt.className = 't-prompt';
  finalPrompt.textContent = '$ ';
  finalLine.appendChild(finalPrompt);
  body.insertBefore(finalLine, cursor);

  done = true;
  document.getElementById('hero-sub').classList.add('visible');
}

runTerminal();

/* ── nav scroll class ── */
window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── scramble text on hover ── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';

function scramble(el) {
  const original = el.dataset.original || el.textContent;
  el.dataset.original = original;
  let i = 0;
  clearInterval(el._scrambleTimer);
  el._scrambleTimer = setInterval(() => {
    el.textContent = original.split('').map((ch, idx) => {
      if (ch === ' ' || ch === '.') return ch;
      if (idx < i) return original[idx];
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    i += 0.6;
    if (i >= original.length) {
      el.textContent = original;
      clearInterval(el._scrambleTimer);
    }
  }, 28);
}

document.querySelectorAll('.scramble-target').forEach(el => {
  el.closest('.card').addEventListener('mouseenter', () => scramble(el));
});

/* ── magnetic cards ── */
document.querySelectorAll('[data-magnetic]').forEach(el => {
  const strength = 0.1;

  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * strength;
    const y = (e.clientY - r.top  - r.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1), opacity 0.5s ease, border-color 0.25s, box-shadow 0.25s';
    el.style.transform = 'translate(0,0)';
    setTimeout(() => { el.style.transition = ''; }, 400);
  });
});

/* ── scroll reveal ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card').forEach(el => observer.observe(el));

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
