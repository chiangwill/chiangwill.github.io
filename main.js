// ─────────────────────────────────────
// Boot Sequence
// ─────────────────────────────────────
const bootData = [
  { text: '[  0.000] Initializing kernel...',                delay: 0 },
  { text: '[  0.121] Loading profile: will.chiang',          delay: 120, cls: '' },
  { text: '[  0.283] Mounting ~/projects ~/experience...',   delay: 260 },
  { text: '[  0.391] Starting zsh...',                       delay: 380 },
  { text: '[  0.512] Loading powerlevel10k configuration...', delay: 500 },
  { text: '[  0.634] git status... ✓  main is clean',        delay: 620, cls: 'bline-ok' },
  { text: '[  0.701] All systems operational.',              delay: 700, cls: 'bline-ok' },
  { text: '',                                                 delay: 750 },
  { text: 'Welcome to will-chiang.dev',                      delay: 800, cls: 'bline-hi' },
];

const bootScreen = document.getElementById('boot-screen');
const bootLines  = document.getElementById('boot-lines');
let bootDone = false;

function dismissBoot() {
  if (bootDone) return;
  bootDone = true;
  bootScreen.classList.add('out');
  setTimeout(() => { bootScreen.style.display = 'none'; }, 420);
}

function runBoot() {
  bootData.forEach(({ text, delay, cls }) => {
    setTimeout(() => {
      if (bootDone) return;
      const el = document.createElement('div');
      el.className = 'bline' + (cls ? ' ' + cls : '');
      el.textContent = text;
      bootLines.appendChild(el);
    }, delay);
  });
  setTimeout(dismissBoot, 1400);
}

document.addEventListener('keydown', dismissBoot, { once: true });
bootScreen.addEventListener('click', dismissBoot);
runBoot();

// ─────────────────────────────────────
// Last Login Timestamp
// ─────────────────────────────────────
const loginEl = document.getElementById('last-login');
if (loginEl) {
  const d = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const pad = n => String(n).padStart(2, '0');
  loginEl.textContent = `${days[d.getDay()]} ${months[d.getMonth()]} ${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ─────────────────────────────────────
// Navbar Show/Hide
// ─────────────────────────────────────
const navbar = document.getElementById('navbar');
const hero   = document.getElementById('hero');

new IntersectionObserver(([e]) => {
  navbar.classList.toggle('show', !e.isIntersecting);
}, { threshold: 0.1 }).observe(hero);

// ─────────────────────────────────────
// Scroll Reveal
// ─────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ─────────────────────────────────────
// Interactive Terminal
// ─────────────────────────────────────
const tinput = document.getElementById('tinput');
const iout   = document.getElementById('iout');
const idir   = document.getElementById('idir');

const history = [];
let histIdx = -1;

// Helper: build a prompt HTML fragment (same style as static prompts)
function promptHTML(dir) {
  return `<div class="prompt">
    <span class="seg seg-ctx"> will </span>
    <span class="seg-arrow arrow-ctx"></span>
    <span class="seg seg-dir"> ${dir} </span>
    <span class="seg-arrow arrow-dir"></span>
    <span class="seg seg-git">  main </span>
    <span class="seg-arrow arrow-git"></span>
    <span class="pchar">❯</span>
  </div>`;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Commands
const cmds = {
  help: () =>
`Available commands:

  <span class="hl-cyan">about</span>          Who is Will?
  <span class="hl-cyan">experience</span>     Work history
  <span class="hl-cyan">projects</span>       Project list
  <span class="hl-cyan">skills</span>         Tech stack
  <span class="hl-cyan">contact</span>        Get in touch
  <span class="hl-cyan">whoami</span>         Quick intro
  <span class="hl-cyan">ping</span>           Ping Will
  <span class="hl-cyan">git log</span>        Portfolio commit history
  <span class="hl-cyan">neofetch</span>       System info
  <span class="hl-cyan">history</span>        Command history
  <span class="hl-cyan">clear</span>          Clear this section
  <span class="hl-cyan">sudo rm -rf /</span>  Nice try`,

  whoami: () =>
`<span class="hl-cyan">will</span> — Backend & Data Engineer

  MSc Space Science → turned software engineer.
  Python/Django specialist, ETL pipeline builder, LLM workflow architect.
  Currently at Interview.tw, based in Kaohsiung, Taiwan.`,

  about:      () => { scrollTo('about');      return '↑ scrolled to #about'; },
  experience: () => { scrollTo('experience'); return '↑ scrolled to #experience'; },
  projects:   () => { scrollTo('projects');   return '↑ scrolled to #projects'; },
  skills:     () => { scrollTo('skills');     return '↑ scrolled to #skills'; },
  contact:    () => { scrollTo('contact');    return '↑ scrolled to #contact'; },

  ping: () => {
    const rng = () => (Math.random() * 4 + 0.3).toFixed(3);
    return `PING will.chiang (127.0.0.1): 56 bytes of data.
64 bytes from will.chiang: icmp_seq=0 ttl=64 time=${rng()} ms
64 bytes from will.chiang: icmp_seq=1 ttl=64 time=${rng()} ms
64 bytes from will.chiang: icmp_seq=2 ttl=64 time=${rng()} ms

--- will.chiang ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
  },

  'git log': () =>
`<span class="hl-yellow">commit a3f8e2d</span> (<span class="hl-cyan">HEAD -> main</span>, <span class="hl-green">origin/main</span>)
Author: Will Chiang &lt;b41510@gmail.com&gt;
Date:   ${new Date().toDateString()}

    redesign: terminal style with Material Palenight + p10k

<span class="hl-yellow">commit 82be2a0</span>
Author: Will Chiang &lt;b41510@gmail.com&gt;
Date:   Mon Mar 17 2026

    add jp_job_crawler project

<span class="hl-yellow">commit 428f6ef</span>
Author: Will Chiang &lt;b41510@gmail.com&gt;
Date:   Mon Mar 17 2026

    init portfolio`,

  neofetch: () =>
`                    <span class="hl-cyan">will</span><span class="hl-blue">@</span><span class="hl-cyan">portfolio</span>
                    ──────────────────────
  <span class="hl-blue">OS</span>:       macOS 15 Sequoia
  <span class="hl-blue">Shell</span>:    zsh + powerlevel10k
  <span class="hl-blue">Theme</span>:    Material Palenight
  <span class="hl-blue">Font</span>:     JetBrains Mono
  <span class="hl-blue">Role</span>:     Backend &amp; Data Engineer
  <span class="hl-blue">Uptime</span>:   6+ years
  <span class="hl-blue">Languages</span>: Python, Django, FastAPI

  <span style="color:#F07178">███</span><span style="color:#F78C6C">███</span><span style="color:#FFCB6B">███</span><span style="color:#C3E88D">███</span><span style="color:#89DDFF">███</span><span style="color:#82AAFF">███</span><span style="color:#C792EA">███</span>`,

  ls: () => 'about/  experience/  projects/  skills/  contact/',
  pwd: () => '/home/will/portfolio',

  'cat resume': () =>
`<span class="hl-red">cat: resume.pdf: No such file</span>
<span class="hl-blue">Hint:</span> Try LinkedIn → linkedin.com/in/will-chiang-b93789182`,

  exit:      () => `<span class="hl-fg-dim">There's no escaping the portfolio.</span>`,
  'cd ..':   () => `<span class="hl-red">cd: permission denied:</span> you're already home.`,
  'sudo su': () => `<span class="hl-red">Sorry, user visitor is not in the sudoers file.</span>`,
  'sudo rm -rf /': () =>
`<span class="hl-red">Password:</span> ············
<span class="hl-red">sudo: Permission denied.</span>
The portfolio will not be deleted.`,

  history: () => {
    if (!history.length) return 'No commands in history.';
    return history.map((c, i) => `  ${String(history.length - i).padStart(3)}  ${c}`).join('\n');
  },

  clear: () => {
    iout.innerHTML = '';
    return null;
  },
};

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function runCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) return;

  history.unshift(cmd);
  histIdx = -1;

  // Echo
  const dir = idir.textContent.trim();
  const echo = document.createElement('div');
  echo.className = 'icmd-echo prompt-line';
  echo.innerHTML = promptHTML(dir) + `<span class="cmd">${esc(raw)}</span>`;
  iout.appendChild(echo);

  // Execute
  const handler = cmds[cmd.toLowerCase()];
  let result;

  if (handler) {
    result = handler();
  } else if (cmd.toLowerCase().startsWith('cd ')) {
    const target = cmd.slice(3).trim();
    idir.textContent = ` ~/${target} `;
    result = null;
  } else {
    result = `<span class="hl-red">zsh: command not found: ${esc(cmd)}</span>\nType <span class="hl-yellow">help</span> to see available commands.`;
  }

  if (result !== null) {
    const resp = document.createElement('div');
    resp.className = 'iresp';
    resp.innerHTML = result;
    iout.appendChild(resp);
    resp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

tinput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    runCommand(tinput.value);
    tinput.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < history.length - 1) tinput.value = history[++histIdx];
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    histIdx > 0 ? tinput.value = history[--histIdx] : (histIdx = -1, tinput.value = '');
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const v = tinput.value.trim().toLowerCase();
    const matches = Object.keys(cmds).filter(c => c.startsWith(v));
    if (matches.length === 1) tinput.value = matches[0];
  }
});

// Click anywhere in interactive section to focus
document.getElementById('interactive').addEventListener('click', () => tinput.focus());

// Auto-focus on desktop after boot
setTimeout(() => {
  if (window.innerWidth > 768) tinput.focus();
}, 1600);
