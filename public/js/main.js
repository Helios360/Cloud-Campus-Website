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


/* ─── THEME TOGGLE + PERSISTENCE ─── */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.querySelector('.theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}
window.toggleTheme = toggleTheme;

// Sync button icon with stored theme on load
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('theme') || document.documentElement.dataset.theme || 'dark');
});


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


/* ─── MOBILE MENU ─── */
(function () {
  const mobBtn  = document.querySelector('.mob-btn');
  const navLinks = document.querySelector('.nav-links');
  if (!mobBtn || !navLinks) return;

  // Build overlay + sliding panel
  const overlay = document.createElement('div');
  overlay.className = 'mob-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const panel = document.createElement('nav');
  panel.className = 'mob-nav';
  panel.setAttribute('aria-label', 'Navigation mobile');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'mob-close';
  closeBtn.setAttribute('aria-label', 'Fermer le menu');
  closeBtn.textContent = '✕';
  panel.appendChild(closeBtn);

  navLinks.querySelectorAll('.nl').forEach(nl => {
    if (nl.classList.contains('has-dd')) {
      const label = document.createElement('div');
      label.className = 'mob-section';
      label.textContent = nl.firstChild.textContent.trim().replace(/[▾\s]+$/, '').trim();
      panel.appendChild(label);
      nl.querySelectorAll('.dd a').forEach(a => {
        const link = a.cloneNode(true);
        link.className = 'mob-link';
        panel.appendChild(link);
      });
    } else {
      const link = nl.cloneNode(true);
      link.className = 'mob-link';
      panel.appendChild(link);
    }
  });

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  function openMenu() {
    document.body.classList.add('mob-open');
    overlay.removeAttribute('aria-hidden');
    mobBtn.setAttribute('aria-expanded', 'true');
    mobBtn.textContent = '✕';
  }

  function closeMenu() {
    document.body.classList.remove('mob-open');
    overlay.setAttribute('aria-hidden', 'true');
    mobBtn.setAttribute('aria-expanded', 'false');
    mobBtn.textContent = '☰';
  }

  mobBtn.addEventListener('click', () =>
    document.body.classList.contains('mob-open') ? closeMenu() : openMenu()
  );
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeMenu(); });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
})();


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