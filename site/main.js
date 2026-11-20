// FA landing page: entrance + scroll-driven motion. No dependencies.
// Every [data-scrub] element gets --p (0..1) = how far it has travelled through the viewport; CSS turns that into motion.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  if (reduce) root.classList.add('still');

  // Hero headline: words rise one after another.
  document.querySelectorAll('.words > span').forEach((w, i) => w.style.setProperty('--i', i));
  requestAnimationFrame(() => root.classList.add('ready'));

  // Reveal on scroll, small stagger inside a group.
  const items = document.querySelectorAll('.reveal');
  items.forEach((el, i) => el.style.setProperty('--d', `${(i % 4) * 90}ms`));
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  // Scroll scrubbing.
  const scrub = [...document.querySelectorAll('[data-scrub]')];
  const sayWords = [...document.querySelectorAll('.say > span')];
  const heroArt = document.querySelector('.hero-art');
  if (!reduce) {
    let queued = false;
    const frame = () => {
      queued = false;
      const vh = window.innerHeight;
      for (const el of scrub) {
        const r = el.getBoundingClientRect();
        // 0 when the top enters at the bottom of the screen, 1 when the element's middle reaches the middle
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh / 2 + r.height / 2)));
        el.style.setProperty('--p', p.toFixed(3));
      }
      const say = sayWords[0]?.parentElement;
      if (say) {
        const p = parseFloat(say.style.getPropertyValue('--p')) || 0;
        sayWords.forEach((w, i) => w.style.setProperty('--f', Math.min(1, Math.max(0, p * 3.4 - i * 0.9)).toFixed(3)));
      }
      if (heroArt) heroArt.style.setProperty('--y', `${Math.min(window.scrollY, vh) * 0.18}px`);
    };
    const ask = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    frame();
  } else {
    scrub.forEach((el) => el.style.setProperty('--p', 1));
    sayWords.forEach((w) => w.style.setProperty('--f', 1));
  }

  // Video: autoplay only when motion is allowed; otherwise keep the poster.
  document.querySelectorAll('video[data-video]').forEach((v) => {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  });
})();
