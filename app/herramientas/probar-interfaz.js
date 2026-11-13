// Prueba la interfaz en Chromium con el código .gs del simulador detrás (google.script.run de mentira).
//   node herramientas/probar-interfaz.js [correo] [vista] [captura.png]
const fs = require('fs'), path = require('path'), vm = require('vm');
const { chromium } = require('playwright');
// Carga el simulador sin ejecutar sus pruebas: se reutiliza su contexto.
const simSrc = fs.readFileSync(path.join(__dirname, 'simular-apps-script.js'), 'utf8').split('vm.createContext(ctx);')[0] + 'module.exports = ctx;';
const m = { exports: {} }; new Function('require', 'module', '__dirname', 'process', simSrc)(require, m, __dirname, { argv: [] });
const ctx = m.exports; vm.createContext(ctx);
const src = path.join(__dirname, '..', 'src');
for (const f of fs.readdirSync(src).filter(x => x.endsWith('.gs'))) vm.runInContext(fs.readFileSync(path.join(src, f), 'utf8'), ctx, { filename: f });
vm.runInContext("instalar(); INTEGRANTES_SENECA = [['Julio','Camacho Cañamon, Julio'],['Raquel','Vicente Bellido, Raquel']]; CORREOS_PRUEBAS_ = []; pedirAcceso_('lucia.prueba@g.educaand.es');", ctx);
const correo = process.argv[2] || 'propietario@g.educaand.es', vista = process.argv[3] || 'admin', captura = process.argv[4];
(async () => {
  ctx.CORREO_ACTIVO_PRUEBAS_ = correo;
  const html = vm.runInContext("doGet({parameter:{v:'" + vista + "'}}).getContent()", ctx);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errores = []; p.on('pageerror', e => errores.push(e.message)); p.on('console', x => { if (x.type() === 'error') errores.push(x.text()); });
  await p.exposeFunction('__gs', (nombre, args) => { ctx.__a = args; try { return { ok: true, v: JSON.parse(JSON.stringify(vm.runInContext(nombre + '.apply(null, __a)', ctx) ?? null)) }; } catch (e) { return { ok: false, e: String(e.message) }; } });
  await p.addInitScript(() => {
    window.google = { script: { get run() { let ok = () => {}, ko = () => {}; const r = new Proxy({}, { get(_, k) {
      if (k === 'withSuccessHandler') return f => { ok = f; return r; }; if (k === 'withFailureHandler') return f => { ko = f; return r; };
      return (...a) => window.__gs(k, a).then(x => x.ok ? ok(x.v) : ko(new Error(x.e))); } }); return r; } } };
  });
  await p.route('http://app.local/', r => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
  await p.goto('http://app.local/'); await p.waitForTimeout(500);
  module.exports = { p, ctx };
  const guion = process.env.GUION ? require(path.resolve(process.env.GUION)) : null;
  if (guion) await guion(p, ctx);
  if (captura) await p.screenshot({ path: captura, fullPage: true });
  console.log('errores:', errores.length ? errores : 'ninguno');
  await b.close();
})();
