/**
 * Utiles.gs — Fechas, identidad, errores y saneado de entradas (como en TDE Recursos).
 */

var RELOJ_PRUEBAS_ = null;
function ahora_() { return RELOJ_PRUEBAS_ !== null ? new Date(RELOJ_PRUEBAS_) : new Date(); }
function ahoraIso_() { return ahora_().toISOString(); }

var CORREO_ACTIVO_PRUEBAS_ = null;
function normalizarCorreo_(c) { return String(c === undefined || c === null ? '' : c).trim().toLowerCase(); }
function correoActivo_() {
  return CORREO_ACTIVO_PRUEBAS_ !== null ? CORREO_ACTIVO_PRUEBAS_ : normalizarCorreo_(Session.getActiveUser().getEmail());
}
function correoPropietario_() { return normalizarCorreo_(Session.getEffectiveUser().getEmail()); }
function esPropietario_(correo) { return !!correo && correo === correoPropietario_(); }
function esCorreoDelDominio_(correo) {
  var p = normalizarCorreo_(correo).split('@');
  return p.length === 2 && /^[a-z0-9._%+-]+$/.test(p[0]) && p[1] === DOMINIO_CENTRO;
}

/** Error con un mensaje pensado para mostrarse tal cual. */
function errorUsuario_(mensaje) {
  var e = new Error('GT_USUARIO|' + mensaje);
  e.codigo = 'USUARIO';
  return e;
}
function errorNoAutorizado_() {
  var e = new Error('No autorizado.');
  e.codigo = 'NO_AUTORIZADO';
  return e;
}

/** Una línea: quita controles, recorta y evita que la hoja lo tome por fórmula. */
function textoSeguro_(valor, maximo) {
  if (valor === undefined || valor === null) return '';
  var s = String(valor).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (maximo && s.length > maximo) s = s.slice(0, maximo);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
/** Varias líneas: conserva los saltos. */
function textoLargoSeguro_(valor, maximo) {
  if (valor === undefined || valor === null) return '';
  var s = String(valor).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (maximo && s.length > maximo) s = s.slice(0, maximo);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
/** Enlace: solo https y sin espacios; vacío si no lo es. */
function enlaceSeguro_(valor) {
  var s = String(valor === undefined || valor === null ? '' : valor).trim();
  if (!s) return '';
  if (!/^https:\/\/[^\s"'<>]+$/.test(s) || s.length > 500) throw errorUsuario_('El enlace tiene que empezar por https:' + '/' + '/ y no llevar espacios.');
  return s;
}
function idSeguro_(valor) {
  var s = String(valor === undefined || valor === null ? '' : valor).trim();
  return /^[A-Z]-[A-Z0-9]{10}$/.test(s) ? s : '';
}
function enteroEn_(valor, minimo, maximo) {
  var n = Number(valor);
  return Math.floor(n) === n && n >= minimo && n <= maximo ? n : null;
}
function nuevoId_(prefijo) {
  return prefijo + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase();
}
/** Nombre a partir del correo: «ana.garcia» → «Ana Garcia». */
function nombreDesdeCorreo_(correo) {
  return normalizarCorreo_(correo).split('@')[0].split(/[._-]+/).filter(Boolean).map(function (p) {
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join(' ');
}
