(function () {
  /* Rellenar acta GT · v0.1 · Rellena el acta de grupo de trabajo de Séneca. Nunca guarda: el Aceptar lo pulsa el coordinador. */
  var NARANJA = '3px solid #e8850c';
  function buscarForm(w) {
    try {
      var d = w.document;
      if (d.forms.FORMULARIO && d.forms.FORMULARIO.F_ACTA) return { w: w, f: d.forms.FORMULARIO };
    } catch (e) { return null; }
    for (var i = 0; i < w.frames.length; i++) { var r = buscarForm(w.frames[i]); if (r) return r; }
    return null;
  }
  var donde = buscarForm(window.top) || buscarForm(window);
  if (!donde) { alert('Rellenar acta GT: abre primero en Séneca la pantalla del acta (Actas de grupo de trabajo › Nueva).'); return; }
  var f = donde.f;
  function latin1(s) {
    var t = String(s || '').replace(/[“”„]/g, '"').replace(/[‘’‚]/g, "'").replace(/[–—]/g, '-').replace(/…/g, '...').replace(/€/g, 'EUR').replace(/•/g, '-').replace(/\r\n?/g, '\n').replace(/[  ]/g, ' ');
    return t.replace(/[^\n -~¡-ÿ]/g, '');
  }
  function largo(s) { return s.length + (s.match(/\n/g) || []).length; }
  function recortar(s, max) {
    if (largo(s) <= max) return s;
    while (largo(s) > max - 3) { var c = s.lastIndexOf(' ', s.length - 2); s = c > 0 ? s.slice(0, c) : s.slice(0, -1); }
    return s + '...';
  }
  function poner(el, v) {
    el.value = v;
    ['input', 'change'].forEach(function (t) { el.dispatchEvent(new donde.w.Event(t, { bubbles: true })); });
    el.style.outline = NARANJA;
  }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function coincide(nombreSeneca, buscado) {
    var palabras = norm(nombreSeneca).split(' '), b = norm(buscado).split(' ');
    return b.length > 0 && b[0] !== '' && b.every(function (x) { return palabras.indexOf(x) >= 0; });
  }
  function aplicar(texto) {
    var d;
    try { d = JSON.parse(texto); } catch (e) { alert('Rellenar acta GT: lo pegado no son los datos del acta. Vuelve a pulsar «Copiar para Séneca» en la página del GT.'); return; }
    if (!d || d.tipo !== 'acta-gt') { alert('Rellenar acta GT: lo pegado no son los datos del acta.'); return; }
    var avisos = [];
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(d.fecha || '')) avisos.push('La fecha no tiene el formato dd/mm/aaaa.');
    poner(f.F_ACTA, d.fecha || '');
    [['C_REVISION', d.revision, 'Revisión'], ['C_ACUERDOS', d.acuerdos, 'Acuerdos'], ['C_ENLACES', d.enlaces, 'Enlaces']].forEach(function (c) {
      var el = f[c[0]]; if (!el) { avisos.push('No encuentro el campo ' + c[2] + '.'); return; }
      var v = latin1(c[1]); var r = recortar(v, 2000);
      if (r !== v) avisos.push(c[2] + ': pasaba de 2000 caracteres y lo he recortado.');
      poner(el, r);
    });
    var asistentes = d.asistentes || [], marcados = [], usados = {};
    for (var i = 1; f['SELECCION_' + i]; i++) {
      var cb = f['SELECCION_' + i], nom = f['NOMBRE_' + i] ? f['NOMBRE_' + i].value : '';
      var quien = null;
      asistentes.forEach(function (a) { if (!quien && coincide(nom, a)) quien = a; });
      var debe = !!quien;
      if (quien) { usados[quien] = 1; marcados.push(nom); }
      if (cb.disabled) continue;
      if (cb.checked !== debe) cb.click();
      cb.value = cb.checked ? 'S' : 'N';
      var celda = cb.closest ? cb.closest('tr') : null; if (celda) celda.style.outline = debe ? NARANJA : '';
    }
    var sin = asistentes.filter(function (a) { return !usados[a]; });
    if (sin.length) avisos.push('No encuentro en Integrantes a: ' + sin.join(', ') + '. Márcalos a mano.');
    alert('Acta rellenada (en naranja). Asisten ' + marcados.length + '.\n' + (avisos.length ? '\nRevisa:\n- ' + avisos.join('\n- ') + '\n' : '') + '\nRevisa y pulsa Aceptar en Séneca.');
  }
  function pedir() {
    var t = prompt('Rellenar acta GT\n\nPega aquí (Ctrl+V) los datos copiados de la página del GT y pulsa Aceptar:');
    if (t) aplicar(t);
  }
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(function (t) { if (t && t.indexOf('"acta-gt"') >= 0) aplicar(t); else pedir(); }, pedir);
  } else pedir();
})();
