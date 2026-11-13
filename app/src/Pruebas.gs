/**
 * Pruebas.gs — ejecutarPruebas() desde el editor (unos segundos). Trabaja
 * sobre hojas _TEST que borra al empezar y al terminar; no envía correos.
 */
function ejecutarPruebas() {
  exigirPropietario_();
  var res = { correctas: 0, total: 0, fallos: [] };
  var ADMIN = correoPropietario_(), ANA = 'ana.prueba@' + DOMINIO_CENTRO, LUIS = 'luis.prueba@' + DOMINIO_CENTRO;
  function ok(nombre, cond) { res.total++; if (cond) res.correctas++; else res.fallos.push(nombre); }
  function lanza(fn) { try { fn(); return false; } catch (e) { return true; } }
  function como(correo, fn) { var a = CORREO_ACTIVO_PRUEBAS_; CORREO_ACTIVO_PRUEBAS_ = correo; try { return fn(); } finally { CORREO_ACTIVO_PRUEBAS_ = a; } }
  function limpiar() { Object.keys(ESQUEMA).forEach(function (n) { var h = libro_().getSheetByName(n + '_TEST'); if (h) libro_().deleteSheet(h); }); }

  SUFIJO_PRUEBAS_ = '_TEST'; CORREOS_PRUEBAS_ = [];
  try {
    limpiar();
    var global = (function () { return this; })();

    // 1. Lista blanca: toda función global sin «_» final está en FUNCIONES_GLOBALES, y al revés.
    var globales = Object.keys(global).filter(function (k) { return typeof global[k] === 'function' && !/_$/.test(k); });
    ok('1. globales declaradas', globales.every(function (k) { return FUNCIONES_GLOBALES[k]; }) && Object.keys(FUNCIONES_GLOBALES).every(function (k) { return typeof global[k] === 'function'; }));
    // 2. Cada una empieza por su comprobación.
    ok('2. primera instrucción', Object.keys(FUNCIONES_GLOBALES).every(function (k) {
      var tipo = FUNCIONES_GLOBALES[k];
      if (tipo === 'entrada') return true;
      var cuerpo = String(global[k]).replace(/^[^{]*\{\s*/, '');
      return tipo === 'propietario' ? cuerpo.indexOf('exigirPropietario_()') === 0 : new RegExp("^(var \\w+ = )?exigir_\\('" + tipo + "'\\)").test(cuerpo);
    }));

    // 3. Roles.
    ok('3. roles', rolDe_(ADMIN) === 'admin' && rolDe_(ANA) === 'dominio' && rolDe_('x@gmail.com') === null && rolDe_('') === null);
    ok('4. sin permiso no publica', como(ANA, function () { return lanza(function () { appGuardarProyecto({ titulo: 'a', descripcion: 'b', peldano: 1 }); }); }));
    ok('5. sin permiso no administra', como(ANA, function () { return lanza(function () { adminDatos(); }); }));

    // 6. Pedir acceso: una solicitud y un correo, aunque se repita.
    var r1 = pedirAcceso_(ANA), r2 = pedirAcceso_(ANA);
    ok('6. pedir acceso', r1 === 'pedida' && r2 === 'ya_pedida' && CORREOS_PRUEBAS_.length === 1 && CORREOS_PRUEBAS_[0].para === ADMIN && CORREOS_PRUEBAS_[0].cuerpo.indexOf('?v=admin') > 0);
    ok('7. el admin ve la solicitud', como(ADMIN, function () { return adminDatos().solicitudes.length === 1; }));

    // 8. Autorizar.
    como(ADMIN, function () { adminAutorizar({ correo: ANA, nombre: 'Ana', papel: 'miembro' }); });
    ok('8. autorizada', rolDe_(ANA) === 'autor' && como(ADMIN, function () { return adminDatos().solicitudes.length === 0; }) && pedirAcceso_(ANA) === 'ya_tiene');
    ok('9. solo cuentas del centro', como(ADMIN, function () { return adminAutorizar({ correo: 'x@gmail.com' }).ok === false; }));

    // 10. Proyectos.
    var p = como(ANA, function () { return appGuardarProyecto({ titulo: 'Rúbricas', descripcion: 'Banco de rúbricas', peldano: 2, enlace: '' }); });
    var p2 = como(ANA, function () { return appGuardarProyecto({ titulo: 'Rúbricas', descripcion: 'Banco de rúbricas', peldano: 2 }); });
    ok('10. crear proyecto (idempotente)', p.ok && p2.resultado === p.resultado && leerFilas_('PROYECTOS').length === 1);
    var ed = como(ANA, function () { return appGuardarProyecto({ id: p.resultado, titulo: 'Rúbricas', descripcion: 'Banco', peldano: 3 }); });
    ok('11. editar el suyo', ed.ok && leerFilas_('PROYECTOS')[0].peldano === '3' && leerFilas_('PROYECTOS')[0].autor_nombre === 'Ana');
    como(ADMIN, function () { adminAutorizar({ correo: LUIS, nombre: 'Luis' }); });
    ok('12. no edita el ajeno', como(LUIS, function () { return lanza(function () { appGuardarProyecto({ id: p.resultado, titulo: 'X', descripcion: 'Y', peldano: 1 }); }); }));
    ok('13. validación', como(ANA, function () {
      return appGuardarProyecto({ titulo: '', descripcion: 'a', peldano: 1 }).ok === false && appGuardarProyecto({ titulo: 'a', descripcion: 'a', peldano: 9 }).ok === false &&
        appGuardarProyecto({ titulo: 'a', descripcion: 'a', peldano: 1, enlace: 'javascript:alert(1)' }).ok === false;
    }));
    var f = como(ANA, function () { return appGuardarProyecto({ titulo: '=HYPERLINK("x")', descripcion: '+1', peldano: 1 }); });
    ok('14. fórmulas como texto', f.ok && leerFilas_('PROYECTOS').filter(function (x) { return x.id === f.resultado; })[0].titulo.indexOf('HYPERLINK') >= 0);
    ok('15. público: proyectos sin correos', publico_('cielo').proyectos.length === 2 && JSON.stringify(publico_('todo')).indexOf('@') < 0);
    como(ADMIN, function () { adminGuardarProyecto({ id: f.resultado, titulo: 'Otro', descripcion: 'x', peldano: 1, visible: 'no' }); });
    ok('16. ocultar proyecto', publico_('cielo').proyectos.length === 1);
    como(ADMIN, function () { adminBorrarProyecto(f.resultado); });
    ok('17. borrar proyecto', leerFilas_('PROYECTOS').length === 1);

    // 18. Recursos: pendientes hasta que el admin los aprueba.
    var rr = como(ANA, function () { return appProponerRecurso({ titulo: 'Prompt de rúbricas', descripcion: 'Para hacer rúbricas', tipo: 'Prompt', enlace: 'https:' + '/' + '/ejemplo.es/r' }); });
    ok('18. recurso pendiente', rr.ok && rr.resultado.estado === 'pendiente' && publico_('recursos').recursos.length === 0);
    ok('19. recurso sin enlace no', como(ANA, function () { return appProponerRecurso({ titulo: 'a', descripcion: 'b', tipo: 'Web', enlace: '' }).ok === false; }));
    como(ADMIN, function () { adminGuardarRecurso({ id: rr.resultado.id, titulo: 'Prompt de rúbricas', descripcion: 'Para hacer rúbricas', tipo: 'Prompt', enlace: 'https:' + '/' + '/ejemplo.es/r', estado: 'publicado' }); });
    ok('20. aprobar recurso', publico_('recursos').recursos.length === 1 && publico_('recursos').recursos[0].autor === 'Ana');
    ok('21. el autor no aprueba', como(ANA, function () { return lanza(function () { adminGuardarRecurso({ id: rr.resultado.id, estado: 'publicado' }); }); }));
    var radm = como(ADMIN, function () { return appProponerRecurso({ titulo: 'Del admin', descripcion: 'x', tipo: 'Web', enlace: 'https:' + '/' + '/ejemplo.es/a' }); });
    ok('22. el admin publica directo', radm.resultado.estado === 'publicado');
    como(ADMIN, function () { adminBorrarRecurso(radm.resultado.id); });
    ok('23. borrar recurso', publico_('recursos').recursos.length === 1);

    // 24. Participantes y avatar.
    var png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    var pa = como(ADMIN, function () { return adminGuardarParticipante({ nombre: 'Ana', papel: 'miembro', site: '', avatar: png, orden: 5 }); });
    ok('24. participante con avatar', pa.ok && publico_('participantes').participantes[0].avatar === png);
    ok('25. avatar no válido', como(ADMIN, function () {
      return adminGuardarParticipante({ id: pa.resultado, nombre: 'Ana', avatar: 'data:text/html;base64,PHNjcmlwdD4=' }).ok === false &&
        adminGuardarParticipante({ id: pa.resultado, nombre: 'Ana', avatar: 'data:image/png;base64,' + new Array(50001).join('A') }).ok === false;
    }));
    como(ADMIN, function () { adminGuardarParticipante({ id: pa.resultado, nombre: 'Ana', papel: 'miembro', site: '', orden: 5 }); });
    ok('26. sin avatar nuevo se conserva', publico_('participantes').participantes[0].avatar === png);
    como(ADMIN, function () { adminGuardarParticipante({ id: pa.resultado, nombre: 'Ana', papel: 'miembro', site: '', avatar: 'QUITAR' }); });
    ok('27. quitar avatar', publico_('participantes').participantes[0].avatar === '');

    // 28. Quitar permiso.
    como(ADMIN, function () { adminQuitarPersona(LUIS); });
    ok('28. quitar persona', rolDe_(LUIS) === 'dominio');

    // 29. doGet.
    var t1 = como('x@gmail.com', function () { return doGet({ parameter: {} }).getContent(); });
    var t2 = como(LUIS, function () { return doGet({ parameter: { v: 'cielo' } }).getContent(); });
    var t3 = como(ANA, function () { return doGet({ parameter: { v: 'admin' } }).getContent(); });
    var t4 = como(ADMIN, function () { return doGet({ parameter: { v: 'admin' } }).getContent(); });
    ok('29. doGet según rol', t1.indexOf('@' + DOMINIO_CENTRO) > 0 && t2.indexOf('Pedir acceso') > 0 && t3.indexOf('solo para el coordinador') > 0 && t4.indexOf('<') >= 0);
  } catch (e) {
    res.fallos.push('EXCEPCIÓN: ' + (e && e.stack || e));
  } finally {
    try { limpiar(); } catch (e) {}
    SUFIJO_PRUEBAS_ = ''; CORREOS_PRUEBAS_ = null;
  }
  console.log('Pruebas: ' + res.correctas + '/' + res.total + (res.fallos.length ? '\nFallos:\n- ' + res.fallos.join('\n- ') : ''));
  return res;
}
