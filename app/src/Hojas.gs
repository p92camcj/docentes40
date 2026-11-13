/**
 * Hojas.gs — Esquema del libro «Docentes 4.0 (datos)» y acceso a sus hojas.
 *
 *  - Columnas nuevas, siempre al final: asegurarHoja_ añade las que falten.
 *  - Celdas en formato texto; marcas de tiempo en UTC ISO 8601.
 *  - En las pruebas, cada hoja tiene una copia con el sufijo _TEST.
 */
var ESQUEMA = {
  /** Quién puede añadir proyectos y proponer recursos. El administrador (la cuenta propietaria) no hace falta apuntarlo. */
  PERSONAS: ['correo', 'nombre', 'papel', 'alta_utc'],
  SOLICITUDES: ['correo', 'pedida_utc', 'estado', 'resuelta_utc'],
  /** visible: 'si' | 'no' (oculto por el administrador). */
  PROYECTOS: ['id', 'autor_correo', 'autor_nombre', 'titulo', 'descripcion', 'peldano', 'enlace', 'visible', 'creado_utc', 'modificado_utc'],
  /** estado: 'pendiente' | 'publicado' | 'oculto'. */
  RECURSOS: ['id', 'autor_correo', 'autor_nombre', 'tipo', 'titulo', 'descripcion', 'enlace', 'estado', 'creado_utc', 'modificado_utc'],
  /** Tarjetas de la página Participantes. papel: 'coordinador' | 'miembro' | 'invitada'. avatar: imagen como data URL (la reduce la página de administración). */
  PARTICIPANTES: ['id', 'nombre', 'papel', 'site', 'avatar', 'orden'],
  REGISTRO: ['fecha_utc', 'correo', 'accion', 'detalle']
};

var SUFIJO_PRUEBAS_ = '';
var LIBRO_MEMO_ = null;

function libro_() {
  if (!LIBRO_MEMO_) {
    var id = PropertiesService.getScriptProperties().getProperty(PROPIEDAD_LIBRO) || '';
    if (!id) throw new Error('La aplicación no está instalada: ejecuta instalar() en el editor.');
    LIBRO_MEMO_ = SpreadsheetApp.openById(id);
  }
  return LIBRO_MEMO_;
}

function hoja_(nombre) {
  if (!ESQUEMA[nombre]) throw new Error('Hoja desconocida: ' + nombre);
  return libro_().getSheetByName(nombre + SUFIJO_PRUEBAS_) || asegurarHoja_(nombre);
}

function asegurarHoja_(nombre) {
  var cab = ESQUEMA[nombre], l = libro_(), h = l.getSheetByName(nombre + SUFIJO_PRUEBAS_);
  if (!h) {
    h = l.insertSheet(nombre + SUFIJO_PRUEBAS_);
    h.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
    h.setFrozenRows(1);
    h.getRange(1, 1, h.getMaxRows(), cab.length).setNumberFormat('@');
    return h;
  }
  var actual = h.getLastColumn() ? h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0].map(String) : [];
  var faltan = cab.filter(function (c) { return actual.indexOf(c) < 0; });
  if (faltan.length) {
    if (h.getMaxColumns() < actual.length + faltan.length) h.insertColumnsAfter(h.getMaxColumns(), actual.length + faltan.length - h.getMaxColumns());
    h.getRange(1, actual.length + 1, 1, faltan.length).setValues([faltan]).setFontWeight('bold');
    h.getRange(1, actual.length + 1, h.getMaxRows(), faltan.length).setNumberFormat('@');
  }
  return h;
}

function columnas_(h) {
  var cab = h.getLastColumn() ? h.getRange(1, 1, 1, h.getLastColumn()).getValues()[0] : [];
  var mapa = {};
  cab.forEach(function (c, i) { mapa[String(c).trim()] = i; });
  return mapa;
}

/** Filas como objetos {campo: texto, _fila: n}. */
function leerFilas_(nombre) {
  var h = hoja_(nombre), n = h.getLastRow();
  if (n < 2) return [];
  var col = columnas_(h), campos = ESQUEMA[nombre];
  var datos = h.getRange(2, 1, n - 1, h.getLastColumn()).getValues();
  var filas = [];
  datos.forEach(function (f, i) {
    if (f.every(function (v) { return v === '' || v === null; })) return;
    var o = { _fila: i + 2 };
    campos.forEach(function (c) {
      var v = col[c] === undefined ? '' : f[col[c]];
      o[c] = Object.prototype.toString.call(v) === '[object Date]' ? v.toISOString() : String(v === null ? '' : v);
    });
    filas.push(o);
  });
  return filas;
}

/** Un texto leído de la hoja («=…») volvería a ser fórmula al reescribirlo: se neutraliza en toda escritura. */
function celdaSegura_(v) {
  var s = String(v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function filaComoArray_(h, obj) {
  var col = columnas_(h), fila = [];
  for (var i = 0; i < h.getLastColumn(); i++) fila.push('');
  Object.keys(col).forEach(function (c) { if (obj[c] !== undefined && obj[c] !== null) fila[col[c]] = celdaSegura_(obj[c]); });
  return fila;
}

function anadirFila_(nombre, obj) {
  var h = hoja_(nombre), fila = filaComoArray_(h, obj), n = h.getLastRow() + 1;
  if (n > h.getMaxRows()) h.insertRowsAfter(h.getMaxRows(), 100);
  h.getRange(n, 1, 1, fila.length).setNumberFormat('@').setValues([fila]);
  return n;
}

function actualizarCampos_(nombre, numFila, cambios) {
  var h = hoja_(nombre), col = columnas_(h);
  Object.keys(cambios).forEach(function (c) {
    if (col[c] === undefined) throw new Error('Columna desconocida en ' + nombre + ': ' + c);
    h.getRange(numFila, col[c] + 1).setValue(celdaSegura_(cambios[c]));
  });
}

function borrarFila_(nombre, numFila) {
  var h = hoja_(nombre);
  if (h.getMaxRows() <= 2) h.insertRowsAfter(h.getMaxRows(), 10);
  h.deleteRow(numFila);
}

/** Bloqueo para todas las escrituras; flush antes de soltarlo. */
function conBloqueo_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var r = fn();
    SpreadsheetApp.flush();
    return r;
  } finally {
    lock.releaseLock();
  }
}

function registrar_(correo, accion, detalle) {
  anadirFila_('REGISTRO', { fecha_utc: ahoraIso_(), correo: correo, accion: accion, detalle: String(detalle || '').slice(0, 300) });
}
