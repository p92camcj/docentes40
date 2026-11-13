/**
 * Panel.gs — Página web, permisos y funciones globales.
 *
 * MODELO DE SEGURIDAD (el de Jano y TDE Recursos)
 * google.script.run alcanza cualquier función GLOBAL cuyo nombre no acabe en
 * «_». Toda la lógica interna acaba en «_». Las únicas globales son las de
 * FUNCIONES_GLOBALES y la PRIMERA instrucción de cada una es su comprobación:
 * exigirPropietario_() o exigir_('permiso'). La interfaz oculta botones por
 * comodidad, no por seguridad. Las pruebas 1 y 2 fallan si no se cumple.
 *
 * Roles: admin (la cuenta propietaria), autor (en PERSONAS) y dominio
 * (cuenta del centro sin permiso: solo puede pedirlo).
 */

var FUNCIONES_GLOBALES = {
  doGet: 'entrada',
  instalar: 'propietario',
  ejecutarPruebas: 'propietario',
  appInicio: 'autor',
  appGuardarProyecto: 'autor',
  appProponerRecurso: 'autor',
  adminDatos: 'admin',
  adminAutorizar: 'admin',
  adminRechazar: 'admin',
  adminQuitarPersona: 'admin',
  adminGuardarProyecto: 'admin',
  adminBorrarProyecto: 'admin',
  adminGuardarRecurso: 'admin',
  adminBorrarRecurso: 'admin',
  adminGuardarParticipante: 'admin',
  adminBorrarParticipante: 'admin'
};

var PERMISOS = { autor: ['autor', 'admin'], admin: ['admin'] };

function exigir_(permiso) {
  var correo = correoActivo_();
  var rol = rolDe_(correo);
  if (!rol || !PERMISOS[permiso] || PERMISOS[permiso].indexOf(rol) < 0) throw errorNoAutorizado_();
  return { correo: correo, rol: rol };
}

function exigirPropietario_() {
  var activo = correoActivo_();
  if (activo && !esPropietario_(activo)) throw errorNoAutorizado_();
}

function texto_(t) { return ContentService.createTextOutput(t); }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * PUBLICO: JSON de lo publicado (?que=cielo|recursos|participantes|todo).
 * APP: ?v=cielo|recursos|admin abre la página (solo con permiso); ?v=pedir
 * registra la petición de acceso. Sin permiso, texto plano.
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (despliegue_() === 'PUBLICO') {
    var que = ['cielo', 'recursos', 'participantes', 'todo'].indexOf(p.que) >= 0 ? p.que : 'todo';
    try { return json_(publico_(que)); } catch (err) { return json_({ ok: false, error: 'NO_DISPONIBLE' }); }
  }
  var correo = correoActivo_();
  var rol;
  try { rol = rolDe_(correo); } catch (err) { return texto_(NOMBRE_APP + ' no está disponible ahora mismo. Inténtalo dentro de un rato.'); }
  if (!rol) {
    return texto_('La web del grupo de trabajo ' + NOMBRE_APP + ' es para el profesorado del ' + NOMBRE_CENTRO + '.\n\n' +
      (correo ? 'Has entrado con ' + correo + '. ' : '') + 'Entra con tu cuenta @' + DOMINIO_CENTRO +
      '. Si tienes varias cuentas abiertas, abre el enlace en una ventana de incógnito con solo esa cuenta.');
  }
  if (p.v === 'pedir') {
    var r = rol === 'dominio' ? pedirAcceso_(correo) : 'ya_tiene';
    return texto_(r === 'ya_tiene' ? 'Ya tienes acceso, ' + correo + '. Vuelve a la web del grupo y pulsa «Añadir mi proyecto» o «Compartir un recurso».'
      : r === 'ya_pedida' ? 'Tu solicitud ya estaba enviada, ' + correo + '. En cuanto Julio la apruebe podrás añadir lo tuyo.'
      : 'Solicitud enviada, ' + correo + '. A Julio le llega un correo; cuando la apruebe podrás añadir tu proyecto y compartir recursos.\n\nYa puedes cerrar esta pestaña.');
  }
  if (rol === 'dominio') {
    return texto_('Aún no tienes permiso para añadir proyectos o recursos, ' + correo + '.\n\n' +
      'Para pedirlo, vuelve a la web del grupo y pulsa «Pedir acceso», o abre esta misma dirección terminada en ?v=pedir');
  }
  if (p.v === 'admin' && rol !== 'admin') return texto_('Esta página es solo para el coordinador del grupo.');
  var vista = ['cielo', 'recursos', 'admin'].indexOf(p.v) >= 0 ? p.v : 'cielo';
  var t = HtmlService.createTemplateFromFile('Interfaz');
  t.datosIniciales = JSON.stringify({
    correo: correo, rol: rol, nombre: nombreDe_(correo), vista: vista, version: VERSION,
    peldanos: PELDANOS, tipos: TIPOS_RECURSO, papeles: PAPELES, site: URL_SITE,
    integrantes: rol === 'admin' ? integrantesSeneca_() : []
  }).replace(/</g, '\\u003c');
  return t.evaluate().setTitle(NOMBRE_APP).addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// =====================================================================
//  FUNCIONES GLOBALES · AUTORES
// =====================================================================

/** Lo mío: proyectos y recursos propuestos. */
function appInicio() {
  var u = exigir_('autor');
  return {
    proyectos: leerFilas_('PROYECTOS').filter(function (x) { return normalizarCorreo_(x.autor_correo) === u.correo; }).map(limpiarProyecto_),
    recursos: leerFilas_('RECURSOS').filter(function (x) { return normalizarCorreo_(x.autor_correo) === u.correo; }).map(limpiarRecurso_)
  };
}

/** p: {id?, titulo, descripcion, peldano, enlace} */
function appGuardarProyecto(p) {
  var u = exigir_('autor');
  return envolver_(function () { return guardarProyecto_(u.correo, false, p || {}); });
}

/** p: {titulo, descripcion, tipo, enlace} */
function appProponerRecurso(p) {
  var u = exigir_('autor');
  return envolver_(function () { return proponerRecurso_(u.correo, u.rol === 'admin', p || {}); });
}

// =====================================================================
//  FUNCIONES GLOBALES · ADMINISTRACIÓN
// =====================================================================

function adminDatos() {
  exigir_('admin');
  return {
    solicitudes: leerFilas_('SOLICITUDES').filter(function (s) { return s.estado === 'pendiente'; }).map(function (s) {
      return { correo: s.correo, pedida_utc: s.pedida_utc, nombre: nombreDesdeCorreo_(s.correo) };
    }),
    personas: leerFilas_('PERSONAS').map(function (x) { return { correo: x.correo, nombre: x.nombre, papel: x.papel }; }),
    proyectos: leerFilas_('PROYECTOS').map(limpiarProyecto_),
    recursos: leerFilas_('RECURSOS').map(limpiarRecurso_),
    participantes: leerFilas_('PARTICIPANTES').sort(porOrden_).map(function (x) {
      return { id: x.id, nombre: x.nombre, papel: x.papel, site: x.site, avatar: x.avatar, orden: x.orden };
    })
  };
}

function adminAutorizar(p) { var u = exigir_('admin'); return envolver_(function () { return autorizar_(u.correo, p || {}); }); }
function adminRechazar(correo) { var u = exigir_('admin'); return envolver_(function () { return rechazar_(u.correo, correo); }); }
function adminQuitarPersona(correo) { var u = exigir_('admin'); return envolver_(function () { return quitarPersona_(u.correo, correo); }); }
function adminGuardarProyecto(p) { var u = exigir_('admin'); return envolver_(function () { return guardarProyecto_(u.correo, true, p || {}); }); }
function adminBorrarProyecto(id) { var u = exigir_('admin'); return envolver_(function () { return borrarProyecto_(u.correo, id); }); }
function adminGuardarRecurso(p) { var u = exigir_('admin'); return envolver_(function () { return guardarRecurso_(u.correo, p || {}); }); }
function adminBorrarRecurso(id) { var u = exigir_('admin'); return envolver_(function () { return borrarRecurso_(u.correo, id); }); }
function adminGuardarParticipante(p) { var u = exigir_('admin'); return envolver_(function () { return guardarParticipante_(u.correo, p || {}); }); }
function adminBorrarParticipante(id) { var u = exigir_('admin'); return envolver_(function () { return borrarParticipante_(u.correo, id); }); }

// =====================================================================
//  AYUDAS
// =====================================================================

/** Los errores pensados para el usuario viajan como {error}; el resto se registra y sale genérico. */
function envolver_(fn) {
  try {
    return { ok: true, resultado: fn() };
  } catch (e) {
    var m = String(e && e.message || e);
    if (m.indexOf('GT_USUARIO|') === 0) return { ok: false, error: m.slice(11) };
    if (e && e.codigo === 'NO_AUTORIZADO') throw e;
    console.error(e && e.stack || m);
    return { ok: false, error: 'No se ha podido guardar. Inténtalo otra vez dentro de un rato.' };
  }
}

function limpiarProyecto_(x) {
  return { id: x.id, autor: x.autor_nombre, titulo: x.titulo, descripcion: x.descripcion, peldano: Number(x.peldano) || 1, enlace: x.enlace, visible: x.visible !== 'no', modificado: x.modificado_utc };
}

function limpiarRecurso_(x) {
  return { id: x.id, autor: x.autor_nombre, tipo: x.tipo, titulo: x.titulo, descripcion: x.descripcion, enlace: x.enlace, estado: x.estado, creado: x.creado_utc };
}
