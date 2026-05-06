/* ═══════════════════════════════
   CLOUD CAMPUS — main.js
   ═══════════════════════════════ */

/* ─── BLACKSMITH-STYLE WORD-BY-WORD HERO REVEAL ─── */
(function () {
  const h1 = document.querySelector('.hero h1');
  if (!h1) return;

  const words = [
    { t: 'Formez-vous', c: false },
    { t: 'aux',         c: false },
    { t: 'métiers',     c: false },
    { t: 'du',          c: false },
    { t: 'digital',     c: true  },
    { t: 'en',          c: false },
    { t: 'alternance',  c: true },
  ];

  h1.innerHTML = words.map((w, i) => {
    const cls   = w.c ? 'w acc' : 'w';
    const delay = (.25 + i * .075).toFixed(3);
    return `<span class="${cls}" style="animation-delay:${delay}s">${w.t}</span> `;
  }).join('');
})();


/* ─── THEME TOGGLE ─── */
function toggleTheme() {
  const html = document.documentElement;
  const btn  = document.querySelector('.theme-btn');
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  if (btn) btn.textContent = html.dataset.theme === 'dark' ? '🌙' : '☀️';
}
// Expose globally so inline onclick works
window.toggleTheme = toggleTheme;


/* ─── INTERSECTION OBSERVER — SCROLL REVEALS ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('v');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.sr').forEach(el => revealObserver.observe(el));
window.revealObserver = revealObserver;


/* ─── ANIMATED COUNTERS ─── */
document.querySelectorAll('.v[data-target]').forEach(el => {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const target = +el.dataset.target;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      let current  = 0;
      const step   = target / 45;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = prefix + target + suffix;
          clearInterval(timer);
        } else {
          el.textContent = prefix + Math.floor(current) + suffix;
        }
      }, 25);

      counterObserver.disconnect();
    });
  }, { threshold: .3 });

  counterObserver.observe(el);
});


/* ─── MAGNETIC BUTTON EFFECT ─── */
document.querySelectorAll('.btn-gl, .btn-g').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width  / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * .15}px, ${y * .15}px) scale(1.02)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform  = '';
    btn.style.transition = 'transform .5s cubic-bezier(0.16,1,0.3,1)';
    setTimeout(() => { btn.style.transition = ''; }, 500);
  });
});


/* ─── NAVBAR HIDE / SHOW ON SCROLL ─── */
let lastScroll = 0;
const header   = document.querySelector('header');

window.addEventListener('scroll', () => {
  const st = window.scrollY;
  if (header) {
    header.style.transition = 'transform .4s cubic-bezier(0.16,1,0.3,1)';
    header.style.transform  = (st > lastScroll && st > 120)
      ? 'translateY(-100%)'
      : 'translateY(0)';
  }
  lastScroll = st;
}, { passive: true });


/* ─── SUBTLE HERO GRID PARALLAX ─── */
const heroGrid = document.querySelector('.hero-grid');

window.addEventListener('scroll', () => {
  if (heroGrid) {
    heroGrid.style.transform = `translateY(${window.scrollY * .3}px)`;
  }
}, { passive: true });


/* ─── FORMS (mailto helper) ─── */
function buildMailtoUrl({ to, subject = '', body = '' }) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const qs = params.toString();
  // Keep the address readable (no percent-encoding for "@" etc.)
  return `mailto:${to}${qs ? `?${qs}` : ''}`;
}

function openMailto({ to, subject = '', body = '' }) {
  const url = buildMailtoUrl({ to, subject, body });
  // Must be triggered by a user gesture (click/submit) to avoid popup blockers
  window.location.href = url;
}

// Expose globally for inline handlers on static pages
window.openMailto = openMailto;

// EOF