/**
 * Instalar.gs — Instalación idempotente: libro, hojas y datos de partida.
 *
 * Se ejecuta desde el editor con la cuenta propietaria. Se puede repetir:
 * crea lo que falta y migra columnas. Los datos de partida solo se escriben
 * si su hoja está vacía.
 */
function instalar() {
  exigirPropietario_();
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  var props = PropertiesService.getScriptProperties();
  var log = [];
  if (!props.getProperty(PROPIEDAD_LIBRO)) {
    var libro = SpreadsheetApp.create(NOMBRE_APP + ' (datos)');
    libro.setSpreadsheetTimeZone(ZONA_HORARIA);
    props.setProperty(PROPIEDAD_LIBRO, libro.getId());
    LIBRO_MEMO_ = libro;
    log.push('Libro creado: ' + libro.getUrl());
  }
  Object.keys(ESQUEMA).forEach(function (n) { asegurarHoja_(n); });
  var hoja1 = libro_().getSheetByName('Hoja 1') || libro_().getSheetByName('Sheet1');
  if (hoja1 && libro_().getSheets().length > 1) libro_().deleteSheet(hoja1);
  sembrar_(log);
  log.push('Libro de datos: ' + libro_().getUrl());
  log.push('Listo. Abre la web con ?v=admin para autorizar al resto del grupo.');
  log.forEach(function (l) { console.log(l); });
  return log.join('\n');
}

/** Lo que ya había en las páginas del GT el 13 de noviembre de 2026. */
function sembrar_(log) {
  var ahora = ahoraIso_(), yo = correoPropietario_();
  var s = 'https:' + '/' + '/sites.google.com/g.educaand.es/';
  if (!leerFilas_('PARTICIPANTES').length) {
    [['Julio', 'coordinador', s + 'docente40julio'], ['Raquel', 'miembro', s + 'docente40raquel'], ['Adrián', 'miembro', s + 'docente40adrian'],
      ['Carmen', 'miembro', s + 'docente40carmen'], ['JF', 'miembro', s + 'docente40jf'], ['José', 'miembro', ''],
      ['Abel', 'miembro', s + 'docente40abel-lpez'], ['Fabiola', 'invitada', s + 'docente40fabiola'], ['Alejandra', 'invitada', '']
    ].forEach(function (x, i) { anadirFila_('PARTICIPANTES', { id: nuevoId_('A'), nombre: x[0], papel: x[1], site: x[2], avatar: '', orden: String((i + 1) * 10) }); });
    log.push('PARTICIPANTES: los 9 de la página actual.');
  }
  if (!leerFilas_('PROYECTOS').length) {
    [['Reservas e incidencias del centro', 'Carritos, kits y espacios reservados desde el site, y las incidencias de cada aula con su parte semanal para mantenimiento.', 3],
      ['Jano: quién usó cada portátil', 'El alumno se identifica al encender el portátil y queda registrado cuánto tiempo lo usó. El siguiente peldaño de la escalera.', 2]
    ].forEach(function (x) {
      anadirFila_('PROYECTOS', { id: nuevoId_('P'), autor_correo: yo, autor_nombre: 'Julio', titulo: x[0], descripcion: x[1], peldano: String(x[2]), enlace: '', visible: 'si', creado_utc: ahora, modificado_utc: ahora });
    });
    log.push('PROYECTOS: los dos de Julio.');
  }
  if (!leerFilas_('RECURSOS').length) {
    [['Prompt', 'Prompt de la agenda del profe', 'Prompt por apartados para que Gemini cree tu agenda con guardado en tu Drive.', URL_SITE + '/sesiones/sesion-01', 'Sesión 1'],
      ['Presentación', 'Sesión 1: IA para el día a día', 'La presentación completa, con los prompts para copiar.', URL_SITE + '/sesiones/sesion-01', 'Sesión 1'],
      ['Web', 'Calendario de adviento de código', 'Un reto de programación cada día de diciembre.', s + 'codeadviento2025/inicio', 'Julio'],
      ['Web', 'TIC 2.º Bachillerato', 'Site de la asignatura, con las apps de realidad virtual hechas por el alumnado.', s + 'juliocc/tic2', 'Julio'],
      ['Carpeta', 'Lectura planificada DUA', 'Ejemplos de un mismo texto adaptado a varios niveles.', 'https:' + '/' + '/drive.google.com/drive/folders/1ZTt-cKdle0e2YEjVkL9aCFQnHNtTOEgU', 'Sesión 1'],
      ['Normativa', 'Orden de 31 de agosto de 2026 (BOJA)', 'Para pedir a Gemini una infografía o un resumen por perfiles.', 'https:' + '/' + '/www.juntadeandalucia.es/eboja/2026/168/c03/BOJA26-216803-00064-11426-01_00342656.pdf', 'Sesión 1']
    ].forEach(function (x) {
      anadirFila_('RECURSOS', { id: nuevoId_('R'), autor_correo: yo, autor_nombre: x[4], tipo: x[0], titulo: x[1], descripcion: x[2], enlace: x[3], estado: 'publicado', creado_utc: ahora, modificado_utc: ahora });
    });
    log.push('RECURSOS: los 6 de la sesión 1.');
  }
}
