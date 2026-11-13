/**
 * Datos.gs — Personas, solicitudes, proyectos, recursos y participantes.
 *
 * Toda escritura va dentro de conBloqueo_ y todo lo que llega del navegador
 * pasa por textoSeguro_/textoLargoSeguro_/enlaceSeguro_/enteroEn_.
 * Las acciones son idempotentes: Google puede repetir una petición.
 */

/** Solo pruebas: si no es null, los correos se guardan aquí en vez de enviarse. */
var CORREOS_PRUEBAS_ = null;

var LIMITE_AVATAR = 48000;

// =====================================================================
//  ROLES
// =====================================================================

/** 'admin' (cuenta propietaria), 'autor' (en PERSONAS), 'dominio' (cuenta del centro sin permiso) o null. */
function rolDe_(correo) {
  correo = normalizarCorreo_(correo);
  if (!correo) return null;
  if (esPropietario_(correo)) return 'admin';
  if (!esCorreoDelDominio_(correo)) return null;
  return persona_(correo) ? 'autor' : 'dominio';
}

function persona_(correo) {
  correo = normalizarCorreo_(correo);
  return leerFilas_('PERSONAS').filter(function (p) { return normalizarCorreo_(p.correo) === correo; })[0] || null;
}

/** Nombre con el que firma: el de PERSONAS, o el del correo. */
function nombreDe_(correo) {
  var p = persona_(correo);
  if (p && p.nombre) return p.nombre;
  return esPropietario_(correo) ? 'Julio' : nombreDesdeCorreo_(correo);
}

// =====================================================================
//  SOLICITUDES DE ACCESO
// =====================================================================

/** Registra la petición (una sola pendiente por correo) y avisa por correo al administrador. Devuelve 'pedida', 'ya_pedida' o 'ya_tiene'. */
function pedirAcceso_(correo) {
  var r = conBloqueo_(function () {
    if (rolDe_(correo) !== 'dominio') return 'ya_tiene';
    var pend = leerFilas_('SOLICITUDES').filter(function (s) { return normalizarCorreo_(s.correo) === correo && s.estado === 'pendiente'; });
    if (pend.length) return 'ya_pedida';
    anadirFila_('SOLICITUDES', { correo: correo, pedida_utc: ahoraIso_(), estado: 'pendiente', resuelta_utc: '' });
    registrar_(correo, 'pedir_acceso', '');
    return 'pedida';
  });
  if (r === 'pedida') {
    enviarCorreo_(correoPropietario_(), NOMBRE_APP + ': ' + correo + ' pide acceso',
      correo + ' quiere añadir proyectos y recursos en la web del grupo de trabajo.\n\n' +
      'Para autorizarle o rechazarlo, entra en Administración:\n' + urlApp_() + '?v=admin\n');
  }
  return r;
}

function enviarCorreo_(para, asunto, cuerpo) {
  if (CORREOS_PRUEBAS_ !== null) { CORREOS_PRUEBAS_.push({ para: para, asunto: asunto, cuerpo: cuerpo }); return; }
  try { MailApp.sendEmail(para, asunto, cuerpo, { name: NOMBRE_APP }); } catch (e) { console.error('No se pudo enviar el correo: ' + e); }
}

function resolverSolicitudes_(correo, estado) {
  leerFilas_('SOLICITUDES').forEach(function (s) {
    if (normalizarCorreo_(s.correo) === correo && s.estado === 'pendiente') actualizarCampos_('SOLICITUDES', s._fila, { estado: estado, resuelta_utc: ahoraIso_() });
  });
}

// =====================================================================
//  PERSONAS AUTORIZADAS
// =====================================================================

function autorizar_(admin, p) {
  var correo = normalizarCorreo_(p && p.correo);
  if (!esCorreoDelDominio_(correo)) throw errorUsuario_('Solo cuentas @' + DOMINIO_CENTRO + '.');
  if (esPropietario_(correo)) throw errorUsuario_('Esa es tu cuenta: ya eres administrador.');
  var nombre = textoSeguro_(p.nombre, 60) || nombreDesdeCorreo_(correo);
  var papel = PAPELES.indexOf(p.papel) >= 0 ? p.papel : 'miembro';
  return conBloqueo_(function () {
    var ya = persona_(correo);
    if (ya) actualizarCampos_('PERSONAS', ya._fila, { nombre: nombre, papel: papel });
    else anadirFila_('PERSONAS', { correo: correo, nombre: nombre, papel: papel, alta_utc: ahoraIso_() });
    resolverSolicitudes_(correo, 'aprobada');
    registrar_(admin, 'autorizar', correo);
    return true;
  });
}

function rechazar_(admin, correo) {
  correo = normalizarCorreo_(correo);
  return conBloqueo_(function () { resolverSolicitudes_(correo, 'rechazada'); registrar_(admin, 'rechazar', correo); return true; });
}

/** Quita el permiso. Sus proyectos y recursos se quedan (se pueden ocultar o eliminar aparte). */
function quitarPersona_(admin, correo) {
  correo = normalizarCorreo_(correo);
  return conBloqueo_(function () {
    var p = persona_(correo);
    if (p) { borrarFila_('PERSONAS', p._fila); registrar_(admin, 'quitar_persona', correo); }
    return true;
  });
}

// =====================================================================
//  PROYECTOS «APUNTA AL CIELO»
// =====================================================================

function proyectoDesde_(p) {
  var titulo = textoSeguro_(p && p.titulo, 80), descripcion = textoLargoSeguro_(p && p.descripcion, 400);
  var peldano = enteroEn_(p && p.peldano, 1, 4);
  if (!titulo) throw errorUsuario_('Ponle nombre al proyecto.');
  if (!descripcion) throw errorUsuario_('Cuenta en dos líneas de qué va.');
  if (!peldano) throw errorUsuario_('Elige el peldaño.');
  return { titulo: titulo, descripcion: descripcion, peldano: String(peldano), enlace: enlaceSeguro_(p.enlace) };
}

function proyectoPorId_(id) {
  id = idSeguro_(id);
  return id ? leerFilas_('PROYECTOS').filter(function (x) { return x.id === id; })[0] || null : null;
}

/** Crea o actualiza un proyecto. Cada autor solo toca los suyos; el administrador, cualquiera (y su visibilidad). */
function guardarProyecto_(correo, esAdmin, p) {
  var datos = proyectoDesde_(p);
  return conBloqueo_(function () {
    var ya = p.id ? proyectoPorId_(p.id) : null;
    if (p.id && !ya) throw errorUsuario_('Ese proyecto ya no existe.');
    if (ya) {
      if (!esAdmin && normalizarCorreo_(ya.autor_correo) !== correo) throw errorNoAutorizado_();
      datos.modificado_utc = ahoraIso_();
      if (esAdmin) {
        if (p.visible === 'si' || p.visible === 'no') datos.visible = p.visible;
        var autor = textoSeguro_(p.autor_nombre, 60);
        if (autor) datos.autor_nombre = autor;
      }
      actualizarCampos_('PROYECTOS', ya._fila, datos);
      registrar_(correo, 'editar_proyecto', ya.id);
      return ya.id;
    }
    /* Idempotente: el mismo autor con el mismo título no duplica. */
    var igual = leerFilas_('PROYECTOS').filter(function (x) { return normalizarCorreo_(x.autor_correo) === correo && x.titulo === datos.titulo; })[0];
    if (igual) return igual.id;
    var id = nuevoId_('P');
    datos.id = id; datos.autor_correo = correo; datos.autor_nombre = nombreDe_(correo); datos.visible = 'si';
    datos.creado_utc = datos.modificado_utc = ahoraIso_();
    anadirFila_('PROYECTOS', datos);
    registrar_(correo, 'crear_proyecto', id);
    return id;
  });
}

function borrarProyecto_(admin, id) {
  return conBloqueo_(function () {
    var ya = proyectoPorId_(id);
    if (ya) { borrarFila_('PROYECTOS', ya._fila); registrar_(admin, 'borrar_proyecto', ya.id + ' ' + ya.titulo); }
    return true;
  });
}

// =====================================================================
//  RECURSOS
// =====================================================================

function recursoDesde_(p) {
  var titulo = textoSeguro_(p && p.titulo, 100), descripcion = textoLargoSeguro_(p && p.descripcion, 300);
  var tipo = TIPOS_RECURSO.indexOf(p && p.tipo) >= 0 ? p.tipo : 'Otro';
  if (!titulo) throw errorUsuario_('Ponle título al recurso.');
  if (!descripcion) throw errorUsuario_('Di para qué sirve.');
  var enlace = enlaceSeguro_(p.enlace);
  if (!enlace) throw errorUsuario_('Falta el enlace.');
  return { titulo: titulo, descripcion: descripcion, tipo: tipo, enlace: enlace };
}

function recursoPorId_(id) {
  id = idSeguro_(id);
  return id ? leerFilas_('RECURSOS').filter(function (x) { return x.id === id; })[0] || null : null;
}

/** Propuesta nueva: queda pendiente salvo que la haga el administrador. */
function proponerRecurso_(correo, esAdmin, p) {
  var datos = recursoDesde_(p);
  return conBloqueo_(function () {
    var igual = leerFilas_('RECURSOS').filter(function (x) { return normalizarCorreo_(x.autor_correo) === correo && x.enlace === datos.enlace; })[0];
    if (igual) return { id: igual.id, estado: igual.estado };
    var id = nuevoId_('R');
    datos.id = id; datos.autor_correo = correo; datos.autor_nombre = (esAdmin ? textoSeguro_(p.autor_nombre, 60) : '') || nombreDe_(correo);
    datos.estado = esAdmin ? 'publicado' : 'pendiente';
    datos.creado_utc = datos.modificado_utc = ahoraIso_();
    anadirFila_('RECURSOS', datos);
    registrar_(correo, 'proponer_recurso', id);
    return { id: id, estado: datos.estado };
  });
}

/** Solo administrador: editar, aprobar (estado publicado), ocultar o volver a mostrar. */
function guardarRecurso_(admin, p) {
  var datos = recursoDesde_(p);
  if (['pendiente', 'publicado', 'oculto'].indexOf(p.estado) >= 0) datos.estado = p.estado;
  var autor = textoSeguro_(p.autor_nombre, 60);
  if (autor) datos.autor_nombre = autor;
  return conBloqueo_(function () {
    var ya = recursoPorId_(p.id);
    if (!ya) throw errorUsuario_('Ese recurso ya no existe.');
    datos.modificado_utc = ahoraIso_();
    actualizarCampos_('RECURSOS', ya._fila, datos);
    registrar_(admin, 'editar_recurso', ya.id + ' ' + (datos.estado || ''));
    return ya.id;
  });
}

function borrarRecurso_(admin, id) {
  return conBloqueo_(function () {
    var ya = recursoPorId_(id);
    if (ya) { borrarFila_('RECURSOS', ya._fila); registrar_(admin, 'borrar_recurso', ya.id + ' ' + ya.titulo); }
    return true;
  });
}

// =====================================================================
//  PARTICIPANTES (tarjetas con foto o avatar)
// =====================================================================

function participantePorId_(id) {
  id = idSeguro_(id);
  return id ? leerFilas_('PARTICIPANTES').filter(function (x) { return x.id === id; })[0] || null : null;
}

/** avatar: data URL nueva (png, jpeg o webp), '' para dejar la que hay, 'QUITAR' para borrarla. */
function guardarParticipante_(admin, p) {
  var nombre = textoSeguro_(p && p.nombre, 40);
  if (!nombre) throw errorUsuario_('Falta el nombre.');
  var papel = ['coordinador', 'miembro', 'invitada'].indexOf(p.papel) >= 0 ? p.papel : 'miembro';
  var site = enlaceSeguro_(p.site);
  var orden = enteroEn_(p.orden, 0, 999);
  var datos = { nombre: nombre, papel: papel, site: site, orden: String(orden === null ? 50 : orden) };
  var av = String(p.avatar || '');
  if (av === 'QUITAR') datos.avatar = '';
  else if (av) {
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(av)) throw errorUsuario_('La imagen no es válida.');
    if (av.length > LIMITE_AVATAR) throw errorUsuario_('La imagen es demasiado grande.');
    datos.avatar = av;
  }
  return conBloqueo_(function () {
    var ya = p.id ? participantePorId_(p.id) : null;
    if (p.id && !ya) throw errorUsuario_('Esa persona ya no está en la lista.');
    if (ya) { actualizarCampos_('PARTICIPANTES', ya._fila, datos); registrar_(admin, 'editar_participante', ya.id); return ya.id; }
    var igual = leerFilas_('PARTICIPANTES').filter(function (x) { return x.nombre === nombre; })[0];
    if (igual) { actualizarCampos_('PARTICIPANTES', igual._fila, datos); return igual.id; }
    datos.id = nuevoId_('A');
    if (datos.avatar === undefined) datos.avatar = '';
    anadirFila_('PARTICIPANTES', datos);
    registrar_(admin, 'crear_participante', datos.id);
    return datos.id;
  });
}

function borrarParticipante_(admin, id) {
  return conBloqueo_(function () {
    var ya = participantePorId_(id);
    if (ya) { borrarFila_('PARTICIPANTES', ya._fila); registrar_(admin, 'borrar_participante', ya.nombre); }
    return true;
  });
}

function porOrden_(a, b) { return (Number(a.orden) || 0) - (Number(b.orden) || 0) || (a.nombre < b.nombre ? -1 : 1); }

// =====================================================================
//  LO PÚBLICO (despliegue anónimo): nunca lleva correos
// =====================================================================

function publico_(que) {
  var r = { ok: true, actualizado: ahoraIso_() };
  if (que === 'todo' || que === 'cielo') {
    r.proyectos = leerFilas_('PROYECTOS').filter(function (x) { return x.visible !== 'no'; })
      .sort(function (a, b) { return a.modificado_utc < b.modificado_utc ? 1 : -1; })
      .map(function (x) { return { autor: x.autor_nombre, titulo: x.titulo, descripcion: x.descripcion, peldano: Number(x.peldano) || 1, enlace: x.enlace }; });
  }
  if (que === 'todo' || que === 'recursos') {
    r.recursos = leerFilas_('RECURSOS').filter(function (x) { return x.estado === 'publicado'; })
      .map(function (x) { return { tipo: x.tipo, titulo: x.titulo, descripcion: x.descripcion, enlace: x.enlace, autor: x.autor_nombre }; });
  }
  if (que === 'todo' || que === 'participantes') {
    r.participantes = leerFilas_('PARTICIPANTES').sort(porOrden_)
      .map(function (x) { return { nombre: x.nombre, papel: x.papel, site: x.site, avatar: x.avatar }; });
  }
  return r;
}
