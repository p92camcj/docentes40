(function () {
  /* Radiografía de Séneca · v1.0
     Describe la pantalla abierta (marcos, formularios, campos, botones, tablas y funciones de la página)
     para pegárselo a Gemini y que pueda escribir un marcador. No copia datos: los textos de las celdas
     y los valores de los campos salen como su forma (Xxxxx, 99/99/9999); los nombres de personas,
     correos, DNI y teléfonos se tapan también en etiquetas y opciones. No envía nada a ningún sitio. */
  var MAX_OPC = 8, MAX_FUNC = 80, MAX_FILAS_EJEMPLO = 2;

  /* ---------- tapar datos personales ---------- */
  function forma(s) {
    s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    if (!s) return '';
    var f = s.replace(/[A-ZÁÉÍÓÚÜÑÇ]/g, 'X').replace(/[a-záéíóúüñç]/g, 'x').replace(/[0-9]/g, '9');
    f = f.replace(/x{4,}/g, 'xxx').replace(/9{5,}/g, '99999');
    return f.length > 40 ? f.slice(0, 40) + '…' : f;
  }
  var PERSONAL = [
    /[A-Za-zÁÉÍÓÚÑáéíóúñ.\-]+@[A-Za-z0-9.\-]+/g,
    /\b[XYZxyz]?\d{7,8}[A-Za-z]\b/g,
    /\b[6789]\d{2}[ .]?\d{2,3}[ .]?\d{2,3}[ .]?\d{0,3}\b/g,
    /\b\d{6,}\b/g,
    /[A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+(?:[ \-][A-ZÁÉÍÓÚÑa-záéíóúüñ]+){0,3}, [A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+(?: [A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+){0,2}/g
  ];
  function tapar(s) {
    s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    PERSONAL.forEach(function (re) { s = s.replace(re, function (m) { return '[' + forma(m) + ']'; }); });
    return s.length > 80 ? s.slice(0, 80) + '…' : s;
  }
  function codigo(s) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    s = s.replace(/'[^']*'|"[^"]*"/g, function (m) { return /^['"][A-Za-z0-9_.\-]{0,30}['"]$/.test(m) ? m : m.charAt(0) + forma(m.slice(1, -1)) + m.charAt(0); });
    return s.length > 140 ? s.slice(0, 140) + '…' : s;
  }

  /* ---------- utilidades ---------- */
  var salida = [];
  function L(nivel, t) { salida.push(new Array(nivel + 1).join('  ') + t); }
  function attr(el, a) { var v = el.getAttribute(a); return v == null ? '' : v; }
  function textoSin(el) {
    var c = el.cloneNode(true), q = c.querySelectorAll('select,textarea,script,style,option');
    for (var i = 0; i < q.length; i++) if (q[i].parentNode) q[i].parentNode.removeChild(q[i]);
    return c.textContent;
  }
  function columna(el) {
    var td = el.closest ? el.closest('td,th') : null, tabla = td && td.closest('table');
    if (!td || !tabla) return '';
    var fila = tabla.tHead && tabla.tHead.rows.length ? tabla.tHead.rows[tabla.tHead.rows.length - 1] : (tabla.rows[0] && tabla.rows[0].querySelector('th') ? tabla.rows[0] : null);
    if (!fila || fila.contains(td)) return '';
    var pos = 0, celdas = td.parentNode.cells;
    for (var i = 0; i < celdas.length && celdas[i] !== td; i++) pos += celdas[i].colSpan || 1;
    for (var j = 0, p = 0; j < fila.cells.length; j++) { if (p >= pos) return 'columna «' + tapar(fila.cells[j].textContent).slice(0, 40) + '»'; p += fila.cells[j].colSpan || 1; }
    return '';
  }
  function etiqueta(el, d) {
    var id = el.id, t = '';
    if (/^(button|submit|hidden)$/.test(el.type)) return '';
    if (id) { try { var l = d.querySelector('label[for="' + id.replace(/"/g, '') + '"]'); if (l) t = l.textContent; } catch (e) {} }
    if (!t && el.closest) { var l2 = el.closest('label'); if (l2) t = textoSin(l2); }
    if (!t) t = attr(el, 'title') || attr(el, 'placeholder') || attr(el, 'aria-label');
    if (!t) { var col = columna(el); if (col) return col; }
    if (!t && el.closest) {
      var celda = el.closest('td,th');
      var prev = celda ? celda.previousElementSibling : null;
      if (prev && !prev.querySelector('input,select,textarea')) t = prev.textContent;
      if (String(t).replace(/\s+/g, ' ').trim().length > 50) t = '';
    }
    return tapar(t).slice(0, 60);
  }
  function patron(nombre) { return String(nombre || '').replace(/\d+$/, '{n}').replace(/_\d+_/g, '_{n}_'); }

  /* ---------- un campo ---------- */
  function describirCampo(el, d) {
    var tag = el.tagName.toLowerCase(), tipo = tag === 'input' ? (attr(el, 'type') || 'text').toLowerCase() : tag;
    var p = [tipo];
    if (el.name) p.push('name="' + el.name + '"');
    if (el.id && el.id !== el.name) p.push('id="' + el.id + '"');
    var et = etiqueta(el, d); if (et) p.push(/^columna «/.test(et) ? 'en la ' + et : 'etiqueta: «' + et + '»');
    if (attr(el, 'maxlength')) p.push('maxlength=' + attr(el, 'maxlength'));
    if (el.required || /oblig/i.test(el.className)) p.push('obligatorio');
    if (el.disabled) p.push('desactivado');
    if (el.readOnly) p.push('solo lectura');
    if (el.className) p.push('class="' + String(el.className).slice(0, 50) + '"');
    if (tipo === 'checkbox' || tipo === 'radio') {
      p.push('value="' + String(el.value).slice(0, 6) + '"');
      p.push(el.checked ? 'marcado' : 'sin marcar');
    } else if (tipo === 'select') {
      p.push(el.options.length + ' opciones');
      if (el.multiple) p.push('múltiple');
    } else if (tipo !== 'button' && tipo !== 'submit') {
      p.push(el.value ? 'valor con forma «' + forma(el.value) + '»' : 'vacío');
    } else {
      p.push('texto «' + tapar(el.tagName === 'BUTTON' ? el.textContent : el.value) + '»');
    }
    ['onclick', 'onchange', 'onblur', 'onkeyup', 'onfocus'].forEach(function (h) { if (attr(el, h)) p.push(h + '="' + codigo(attr(el, h)) + '"'); });
    return p.join(' · ');
  }
  function describirOpciones(sel, nivel) {
    var n = Math.min(sel.options.length, MAX_OPC);
    for (var i = 0; i < n; i++) {
      var o = sel.options[i];
      L(nivel, 'opción value="' + tapar(o.value).slice(0, 20) + '" «' + tapar(o.text) + '»' + (o.selected ? ' (elegida)' : ''));
    }
    if (sel.options.length > n) L(nivel, '… y ' + (sel.options.length - n) + ' opciones más');
  }

  /* ---------- campos agrupados (SELECCION_1…SELECCION_25 → una línea) ---------- */
  function describirCampos(lista, d, nivel) {
    var grupos = {}, orden = [];
    lista.forEach(function (el) {
      var tipo = (el.tagName + (el.type || '')).toLowerCase();
      var clave = /\d+$|_\d+_/.test(el.name || '') ? patron(el.name) + '|' + tipo : null;
      if (clave) {
        if (!grupos[clave]) { grupos[clave] = []; orden.push({ g: clave }); }
        grupos[clave].push(el);
      } else orden.push({ el: el });
    });
    orden.forEach(function (x) {
      if (x.el) {
        L(nivel, '- ' + describirCampo(x.el, d));
        if (x.el.tagName === 'SELECT') describirOpciones(x.el, nivel + 2);
      } else {
        var g = grupos[x.g];
        if (g.length === 1) { L(nivel, '- ' + describirCampo(g[0], d)); if (g[0].tagName === 'SELECT') describirOpciones(g[0], nivel + 2); return; }
        var nums = g.map(function (e) { var m = e.name.match(/(\d+)(?!.*\d)/); return m ? +m[1] : 0; });
        L(nivel, '- REPETIDO ' + g.length + ' veces: name="' + patron(g[0].name) + '" con {n} de ' + Math.min.apply(null, nums) + ' a ' + Math.max.apply(null, nums) + '. El primero:');
        L(nivel + 2, describirCampo(g[0], d));
        if (g[0].tagName === 'SELECT') describirOpciones(g[0], nivel + 3);
      }
    });
  }

  /* ---------- tablas ---------- */
  function describirCelda(td) {
    var campos = td.querySelectorAll('input,select,textarea,button,a');
    var partes = [];
    for (var i = 0; i < campos.length && i < 4; i++) {
      var c = campos[i];
      if (c.tagName === 'A') partes.push('enlace' + (attr(c, 'onclick') ? ' onclick="' + codigo(attr(c, 'onclick')) + '"' : '') + (/^javascript:/i.test(attr(c, 'href')) ? ' href="' + codigo(attr(c, 'href')) + '"' : ''));
      else partes.push((c.tagName === 'INPUT' ? (c.type || 'text') : c.tagName.toLowerCase()) + (c.name ? ' name="' + c.name + '"' : ''));
    }
    var t = forma(textoSin(td));
    return (t ? '«' + t + '»' : '(vacía)') + (partes.length ? ' + ' + partes.join(', ') : '');
  }
  function describirTabla(t, i, nivel) {
    var filas = t.rows, cab = [], primeraDatos = 0;
    if (!filas.length) return;
    var filaCab = t.tHead && t.tHead.rows.length ? t.tHead.rows[t.tHead.rows.length - 1] : null;
    if (!filaCab && filas[0].querySelector('th')) filaCab = filas[0];
    if (filaCab) for (var c = 0; c < filaCab.cells.length; c++) cab.push(tapar(filaCab.cells[c].textContent) || '(sin título)');
    var cuerpo = [];
    for (var r = 0; r < filas.length; r++) if (filas[r] !== filaCab && !(t.tHead && t.tHead.contains(filas[r]))) cuerpo.push(filas[r]);
    var desc = 'tabla ' + i + (t.id ? ' id="' + t.id + '"' : '') + (t.className ? ' class="' + String(t.className).slice(0, 50) + '"' : '') + ' · ' + cuerpo.length + ' filas de datos';
    var extra = ['data-totalregistros'].filter(function (a) { return t.hasAttribute(a); }).map(function (a) { return a + '=' + forma(t.getAttribute(a)); });
    L(nivel, desc + (extra.length ? ' · ' + extra.join(' ') : ''));
    if (cab.length) L(nivel + 1, 'columnas: ' + cab.map(function (x, k) { return (k + 1) + ') ' + x; }).join(' | '));
    for (var e = 0; e < cuerpo.length && e < MAX_FILAS_EJEMPLO; e++) {
      var celdas = [];
      for (var k = 0; k < cuerpo[e].cells.length; k++) celdas.push((k + 1) + ') ' + describirCelda(cuerpo[e].cells[k]));
      L(nivel + 1, 'fila ' + (e + 1) + ' (forma, sin datos): ' + celdas.join(' | '));
    }
  }

  /* ---------- funciones propias de la página ---------- */
  function funciones(w) {
    var r = [];
    try {
      Object.keys(w).forEach(function (k) {
        if (r.length >= MAX_FUNC) return;
        var f; try { f = w[k]; } catch (e) { return; }
        if (typeof f !== 'function' || /^on/.test(k) || /^webkit/i.test(k)) return;
        var s; try { s = Function.prototype.toString.call(f); } catch (e) { return; }
        if (/\[native code\]/.test(s)) return;
        var m = s.match(/^[^(]*\(([^)]*)\)/);
        r.push(k + '(' + (m ? m[1].replace(/\s+/g, '') : '') + ')');
      });
    } catch (e) {}
    return r;
  }

  /* ---------- un documento (marco) ---------- */
  function describirDocumento(w, ruta, nivel) {
    var d;
    try { d = w.document; d.body; } catch (e) { L(nivel, ruta + ': marco de otro dominio (no se puede leer)'); return; }
    if (!d || !d.documentElement) return;
    var nombre = '';
    try { nombre = w.name || ''; } catch (e) {}
    L(nivel, '## ' + ruta + (nombre ? ' (name="' + nombre + '")' : '') + ' · ' + (w.location ? w.location.pathname : '') + ' · codificación ' + (d.characterSet || '?'));
    if (d.title) L(nivel + 1, 'título: «' + tapar(d.title) + '»');
    var tit = d.querySelectorAll('h1,h2,h3,h4,legend,.titulo,.cabecera,caption');
    for (var i = 0; i < tit.length && i < 12; i++) { var tt = tapar(tit[i].textContent); if (tt) L(nivel + 1, tit[i].tagName.toLowerCase() + ': «' + tt + '»'); }
    var zonas = d.querySelectorAll('main, .container-fluid, #contenido, [id*="ontenido"]');
    if (zonas.length) L(nivel + 1, 'zonas: ' + Array.prototype.slice.call(zonas, 0, 5).map(function (z) { return z.tagName.toLowerCase() + (z.id ? '#' + z.id : '') + (z.className ? '.' + String(z.className).split(/\s+/).join('.') : ''); }).join(', '));
    var scripts = Array.prototype.slice.call(d.scripts).map(function (s) { return s.src ? s.src.split('?')[0].split('/').pop() : ''; }).filter(Boolean);
    if (scripts.length) L(nivel + 1, 'scripts: ' + scripts.slice(0, 20).join(', '));
    var fs = funciones(w);
    if (fs.length) L(nivel + 1, 'funciones propias: ' + fs.join(', '));

    for (var f = 0; f < d.forms.length; f++) {
      var fo = d.forms[f];
      L(nivel + 1, 'FORMULARIO ' + f + ': name="' + attr(fo, 'name') + '"' + (fo.id ? ' id="' + fo.id + '"' : '') + ' method=' + (attr(fo, 'method') || 'get') + ' action="' + (attr(fo, 'action') ? attr(fo, 'action').split('?')[0] : '') + '"' + (attr(fo, 'onsubmit') ? ' onsubmit="' + codigo(attr(fo, 'onsubmit')) + '"' : '') + ' · ' + fo.elements.length + ' campos');
      var campos = Array.prototype.filter.call(fo.elements, function (e) { return e.tagName !== 'FIELDSET' && e.tagName !== 'OBJECT'; });
      var ocultos = campos.filter(function (e) { return e.type === 'hidden'; });
      describirCampos(campos.filter(function (e) { return e.type !== 'hidden'; }), d, nivel + 2);
      if (ocultos.length) { L(nivel + 2, 'campos ocultos (' + ocultos.length + '):'); describirCampos(ocultos, d, nivel + 3); }
    }
    var sueltos = Array.prototype.filter.call(d.querySelectorAll('input,select,textarea'), function (e) { return !e.form; });
    if (sueltos.length) { L(nivel + 1, 'campos fuera de formulario (' + sueltos.length + '):'); describirCampos(sueltos, d, nivel + 2); }

    var acc = d.querySelectorAll('button, a[onclick], a[href^="javascript"], [onclick]:not(input):not(button):not(a), input[type=button], input[type=submit], input[type=image]');
    var vistos = {}, n = 0;
    for (var a = 0; a < acc.length && n < 40; a++) {
      var b = acc[a], txt = tapar(b.textContent || b.value || attr(b, 'title') || attr(b, 'alt')).slice(0, 40);
      var h = attr(b, 'onclick') || (/^javascript:/i.test(attr(b, 'href')) ? attr(b, 'href') : '');
      var clave = txt + '|' + patron(h);
      if (vistos[clave]) { vistos[clave]++; continue; }
      vistos[clave] = 1; n++;
      if (n === 1) L(nivel + 1, 'BOTONES Y ENLACES CON ACCIÓN:');
      L(nivel + 2, '- ' + b.tagName.toLowerCase() + (b.id ? '#' + b.id : '') + ' «' + txt + '»' + (h ? ' → ' + codigo(h) : ''));
    }
    var ts = d.querySelectorAll('table');
    var utiles = Array.prototype.filter.call(ts, function (t) { return t.rows.length > 1 && !t.querySelector('table'); });
    if (utiles.length) { L(nivel + 1, 'TABLAS (' + utiles.length + ' con datos; de cada una, columnas y forma de las primeras filas):'); utiles.slice(0, 8).forEach(function (t, i) { describirTabla(t, i, nivel + 2); }); }

    var marcos = 0; try { marcos = w.frames.length; } catch (e) {}
    for (var m = 0; m < marcos; m++) describirDocumento(w.frames[m], ruta + '.frames[' + m + ']', nivel + 1);
  }

  var raiz = window; try { if (window.top.document) raiz = window.top; } catch (e) {}
  salida.push('RADIOGRAFÍA DE SÉNECA (estructura sin datos: textos como forma Xxxx/9999, personas tapadas entre [ ])');
  salida.push('Fecha: ' + new Date().toISOString().slice(0, 10) + ' · Navegador: ' + (navigator.userAgent.match(/(Chrome|Firefox|Edg)\/\d+/) || ['?'])[0]);
  describirDocumento(raiz, 'top', 0);
  var texto = salida.join('\n');

  /* ---------- enseñarla ---------- */
  function docVisible(w) {
    try {
      var d = w.document;
      if (d.body && d.body.tagName !== 'FRAMESET') return d;
      for (var i = 0; i < w.frames.length; i++) { var r = docVisible(w.frames[i]); if (r) return r; }
    } catch (e) {}
    return null;
  }
  var H = docVisible(raiz) || document, viejo = H.getElementById('radiografia-seneca');
  if (viejo) viejo.parentNode.removeChild(viejo);
  var caja = H.createElement('div');
  caja.id = 'radiografia-seneca';
  caja.style.cssText = 'position:fixed;z-index:2147483647;top:12px;right:12px;width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 24px);display:flex;flex-direction:column;gap:8px;background:#fff;color:#222;border:3px solid #e8850c;border-radius:10px;padding:12px;font:14px/1.4 Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35)';
  var tit = H.createElement('strong'); tit.textContent = 'Radiografía de esta pantalla';
  var aviso = H.createElement('div');
  aviso.textContent = 'Revísala antes de pegarla en Gemini: no debe aparecer ningún nombre, correo ni dato del alumnado. Si ves alguno, bórralo aquí mismo.';
  aviso.style.cssText = 'background:#fff3e0;padding:6px 8px;border-radius:6px;font-size:13px';
  var area = H.createElement('textarea');
  area.value = texto;
  area.style.cssText = 'width:100%;box-sizing:border-box;height:50vh;font:12px/1.35 Consolas,monospace;white-space:pre;border:1px solid #ccc;border-radius:6px;padding:6px';
  var fila = H.createElement('div'); fila.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;align-items:center';
  var info = H.createElement('span'); info.style.cssText = 'margin-right:auto;font-size:12px;color:#666'; info.textContent = texto.length + ' caracteres';
  function boton(t, fn, fuerte) {
    var b = H.createElement('button'); b.type = 'button'; b.textContent = t;
    b.style.cssText = 'font:bold 14px Arial,sans-serif;padding:7px 14px;border-radius:6px;cursor:pointer;border:1px solid #0b7a3e;' + (fuerte ? 'background:#0b7a3e;color:#fff' : 'background:#fff;color:#0b7a3e');
    b.onclick = fn; return b;
  }
  var copiar = boton('Copiar', function () {
    area.select();
    var ok = false; try { ok = H.execCommand('copy'); } catch (e) {}
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(area.value).then(function () { copiar.textContent = 'Copiada ✓'; }, function () { copiar.textContent = ok ? 'Copiada ✓' : 'Cópiala con Ctrl+C'; });
    else copiar.textContent = ok ? 'Copiada ✓' : 'Cópiala con Ctrl+C';
  }, true);
  fila.appendChild(info);
  fila.appendChild(boton('Cerrar', function () { caja.parentNode.removeChild(caja); }));
  fila.appendChild(copiar);
  caja.appendChild(tit); caja.appendChild(aviso); caja.appendChild(area); caja.appendChild(fila);
  (H.body || H.documentElement).appendChild(caja);
})();
