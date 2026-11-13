/* Docentes 4.0 · utilidades comunes: modo claro/oscuro, lectura de la app y creación de elementos.
   Los datos siempre se pintan con textContent. */
(function () {
  var raiz = document.documentElement;
  try { var t = localStorage.getItem('gt-tema'); if (t) raiz.setAttribute('data-theme', t); } catch (e) {}
  function oscuro() { var t = raiz.getAttribute('data-theme'); return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function pintar(b) { var o = oscuro(); b.querySelector('span').textContent = o ? 'Modo claro' : 'Modo oscuro'; b.setAttribute('aria-label', o ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'); }
  window.GT = {
    el: function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; },
    /* Botón de contraste: <button class="tema" data-gt-tema></button> */
    tema: function () {
      document.querySelectorAll('[data-gt-tema]').forEach(function (b) {
        b.type = 'button';
        b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg><span></span>';
        pintar(b);
        b.addEventListener('click', function () { var n = oscuro() ? 'light' : 'dark'; raiz.setAttribute('data-theme', n); try { localStorage.setItem('gt-tema', n); } catch (e) {} document.querySelectorAll('[data-gt-tema]').forEach(pintar); });
      });
    },
    /* Lo publicado en la app (despliegue anónimo). que: cielo | recursos | participantes */
    leer: function (que) {
      if (!window.GT_API) return Promise.reject(new Error('sin API'));
      return fetch(window.GT_API + '?que=' + que).then(function (r) { return r.json(); }).then(function (d) { if (!d || !d.ok) throw new Error('error'); return d; });
    },
    /* Enlace que abre fuera del site (los iframes del site no dejan navegar la página entera). */
    enlace: function (a, url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; return a; },
    app: function (v) { return window.GT_APP ? window.GT_APP + '?v=' + v : ''; }
  };
})();
