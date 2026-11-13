/**
 * Config.gs — Constantes de la aplicación del GT «Docentes 4.0».
 *
 * La aplicación tiene dos despliegues del mismo código (desplegar.js):
 *   - APP:     acceso DOMINIO. Formularios de proyectos y recursos, petición
 *              de acceso, administración y acta. Identidad: Session.getActiveUser().
 *   - PUBLICO: acceso anónimo. Solo devuelve en JSON lo publicado (sin correos)
 *              para las páginas públicas de GitHub Pages que se incrustan en el site.
 */
var NOMBRE_APP = 'Docentes 4.0';
var NOMBRE_CENTRO = 'IES Vega de Mar';
var DOMINIO_CENTRO = 'g.educaand.es';
var ZONA_HORARIA = 'Europe/Madrid';
var VERSION = '1.0.0';
var PROPIEDAD_LIBRO = 'ID_LIBRO';

/** Páginas del site del GT (las de la web pública que se incrustan allí). */
var URL_SITE = 'https:' + '/' + '/sites.google.com/g.educaand.es/docentes40';

/** Papeles de PERSONAS. El administrador es siempre la cuenta propietaria. */
var PAPELES = ['miembro', 'invitada'];
var PELDANOS = ['Idea', 'Prototipo', 'En el aula', 'Compartido'];
var TIPOS_RECURSO = ['Prompt', 'Web', 'App', 'Carpeta', 'Normativa', 'Presentación', 'Otro'];

/** Despliegue que ejecuta esta versión: lo fija Despliegue.gs (generado por desplegar.js). */
function despliegue_() {
  return typeof DESPLIEGUE === 'string' ? DESPLIEGUE : 'APP';
}

function urlApp_() {
  if (typeof URL_DESPLIEGUE_APP === 'string' && URL_DESPLIEGUE_APP) return URL_DESPLIEGUE_APP;
  try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; }
}

/** Nombres tal como salen en Séneca para el acta: Integrantes.gs (no va a git) define INTEGRANTES_SENECA. */
function integrantesSeneca_() {
  return typeof INTEGRANTES_SENECA !== 'undefined' && Array.isArray(INTEGRANTES_SENECA) ? INTEGRANTES_SENECA : [];
}
