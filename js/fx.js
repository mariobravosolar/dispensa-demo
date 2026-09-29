/* ============================================================
   Dispensa — efectos compartidos (toasts, confeti, monedas, contadores,
   revelado al hacer scroll). Todas las vistas los usan vía DEMO.fx.
   ============================================================ */
(function () {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toast(titulo, texto, ico) {
    const cont = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="ico">${ico || '✓'}</span><div><b></b><small></small></div>`;
    t.querySelector('b').textContent = titulo;
    t.querySelector('small').textContent = texto || '';
    cont.appendChild(t);
    setTimeout(() => { t.classList.add('sale'); setTimeout(() => t.remove(), 420); }, 3600);
  }

  function confeti(x, y, n) {
    if (reducido) return;
    const colores = ['#E8A87C', '#D9A441', '#8FB5A3', '#B8A1D9', '#7B4F80', '#D9EFA8'];
    x = x ?? innerWidth / 2; y = y ?? innerHeight / 3;
    for (let i = 0; i < (n || 70); i++) {
      const c = document.createElement('i');
      c.className = 'confeti';
      c.style.background = colores[i % colores.length];
      c.style.left = x + 'px'; c.style.top = y + 'px';
      document.body.appendChild(c);
      const ang = Math.random() * Math.PI * 2, vel = 120 + Math.random() * 260;
      const dx = Math.cos(ang) * vel, dy = Math.sin(ang) * vel - 180;
      c.animate([
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 420}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => c.remove();
    }
  }

  /** Hace volar monedas de token desde un elemento hasta otro */
  function monedas(desde, hasta, n) {
    if (reducido || !desde || !hasta) return Promise.resolve();
    const a = desde.getBoundingClientRect(), b = hasta.getBoundingClientRect();
    const promesas = [];
    for (let i = 0; i < (n || 6); i++) {
      const m = document.createElement('span');
      m.className = 'moneda moneda-vuela'; m.textContent = 'T';
      m.style.left = (a.left + a.width / 2 - 14) + 'px'; m.style.top = (a.top + a.height / 2 - 14) + 'px';
      document.body.appendChild(m);
      const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
      promesas.push(new Promise(res => {
        m.animate([
          { transform: 'translate(0,0) scale(.6)', opacity: 0 },
          { transform: `translate(${dx * .4 + (Math.random() - .5) * 80}px, ${dy * .4 - 90}px) scale(1.1)`, opacity: 1, offset: .45 },
          { transform: `translate(${dx}px, ${dy}px) scale(.5)`, opacity: .2 }
        ], { duration: 850, delay: i * 70, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).onfinish = () => { m.remove(); res(); };
      }));
    }
    return Promise.all(promesas);
  }

  /** Anima un número desde su valor actual hasta `a` */
  function contar(el, a, dur, formato) {
    if (!el) return;
    const de = parseFloat(el.dataset.valor ?? el.textContent.replace(/[^\d.-]/g, '')) || 0;
    el.dataset.valor = a;
    const f = formato || (v => Math.round(v).toLocaleString('es-CL'));
    if (reducido) { el.textContent = f(a); return; }
    const t0 = performance.now(); dur = dur || 900;
    (function paso(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = f(de + (a - de) * e);
      if (p < 1) requestAnimationFrame(paso);
    })(t0);
  }

  /** Revelado al hacer scroll. Solo oculta lo que está bajo el pliegue,
      así la primera pantalla siempre se ve completa. */
  function revelar(raiz) {
    if (reducido || !('IntersectionObserver' in window)) return;
    const els = (raiz || document).querySelectorAll('.revela');
    const io = new IntersectionObserver(ent => ent.forEach(e => {
      if (e.isIntersecting) { e.target.classList.remove('pendiente'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pendiente'); io.observe(el); }
    });
  }

  const espera = ms => new Promise(r => setTimeout(r, reducido ? 0 : ms));

  /** Escribe texto en un input letra por letra (para las animaciones de llenado) */
  async function tipear(input, texto, vel) {
    input.value = '';
    for (const ch of texto) { input.value += ch; input.dispatchEvent(new Event('input', { bubbles: true })); await espera(vel || 38); }
  }

  window.DEMO = window.DEMO || {};
  DEMO.fx = { toast, confeti, monedas, contar, revelar, espera, tipear, reducido };
})();
