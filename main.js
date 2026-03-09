// ── Particle canvas ──
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let W, H, particles;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function initParticles() {
  particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.5 + 0.1,
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = W;
    if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H;
    if (p.y > H) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(148,163,184,${p.alpha})`;
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

resize();
initParticles();
drawParticles();
window.addEventListener('resize', () => { resize(); initParticles(); });

// ── Typewriter ──
const phrases = [
  'Backend Engineer.',
  'Python / Django Specialist.',
  'Data & LLM Engineer.',
  'CI/CD Enthusiast.',
];
let pi = 0, ci = 0, deleting = false;
const tw = document.getElementById('typewriter');

function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    ci++;
    tw.innerHTML = phrase.slice(0, ci) + '<span class="cursor"></span>';
    if (ci === phrase.length) {
      deleting = true;
      setTimeout(type, 2000);
      return;
    }
    setTimeout(type, 65);
  } else {
    ci--;
    tw.innerHTML = phrase.slice(0, ci) + '<span class="cursor"></span>';
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(type, 400);
      return;
    }
    setTimeout(type, 35);
  }
}

setTimeout(type, 800);

// ── Scroll reveal ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Mouse parallax on orbs ──
document.addEventListener('mousemove', e => {
  const mx = (e.clientX / window.innerWidth - 0.5) * 30;
  const my = (e.clientY / window.innerHeight - 0.5) * 30;
  document.querySelector('.orb-1').style.transform = `translate(${mx}px, ${my}px)`;
  document.querySelector('.orb-2').style.transform = `translate(${-mx}px, ${-my}px)`;
  document.querySelector('.orb-3').style.transform = `translate(${mx * 0.5}px, ${my * 0.5}px)`;
});
