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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  // skip the typewriter: show the final terminal state instantly
  const staticBlock = document.querySelector('.t-static');
  if (staticBlock) staticBlock.style.display = 'block';
  cursor.style.display = 'none';
  document.getElementById('hero-sub').classList.add('visible');
} else {
  runTerminal();
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
