// Simulador local de Apps Script para ejecutar Pruebas.gs con Node (adaptado del de Jano):
//   node herramientas/simular-apps-script.js [carpeta src]
// Imita SpreadsheetApp, CacheService, PropertiesService, LockService, DriveApp, ContentService,
// HtmlService, ScriptApp y Utilities lo justo para estas pruebas.
// Sirve para encontrar errores de lógica antes de desplegar; NO sustituye a las pruebas en Apps Script.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function fmt(d, tz, pat) {
  if (pat === 'Z') {
    const s = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).format(d);
    const m = s.match(/GMT([+-]\d{2}):(\d{2})/);
    return m ? m[1] + m[2] : '+0000';
  }
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]));
  return pat.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', p.hour)
    .replace('mm', p.minute).replace('ss', p.second).replace(/^M$/, String(Number(p.month))).replace(/^H$/, String(Number(p.hour)));
}

class Range {
  constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr: nr || 1, nc: nc || 1 }); }
  getValues() { const o = []; for (let i = 0; i < this.nr; i++) { const f = []; for (let j = 0; j < this.nc; j++) { const row = this.sh.data[this.r - 1 + i]; f.push(row && row[this.c - 1 + j] !== undefined ? row[this.c - 1 + j] : ''); } o.push(f); } return o; }
  getValue() { return this.getValues()[0][0]; }
  // Como Sheets: un texto con apóstrofo inicial se guarda sin él; uno que empieza por = + - @ sería una fórmula.
  setValues(v) { v = v.map(f => f.map(x => { if (typeof x !== 'string') return x; if (x[0] === "'") return x.slice(1); if (/^[=+\-@]/.test(x)) throw new Error('Se escribiría una fórmula: ' + x); return x; })); if (v.length !== this.nr || v[0].length !== this.nc) throw new Error('dimensiones'); if (this.r + this.nr - 1 > this.sh.maxRows) throw new Error('fuera de rango'); for (let i = 0; i < this.nr; i++) { while (this.sh.data.length < this.r + i) this.sh.data.push([]); for (let j = 0; j < this.nc; j++) this.sh.data[this.r - 1 + i][this.c - 1 + j] = v[i][j]; } return this; }
  setValue(v) { return this.setValues([[v]]); }
  clearContent() { for (let i = 0; i < this.nr; i++) { const row = this.sh.data[this.r - 1 + i]; if (row) for (let j = 0; j < this.nc; j++) row[this.c - 1 + j] = ''; } return this; }
  getRow() { return this.r; }
  createTextFinder(q) { const rg=this; const o={mc:false,me:false}; const tf={ matchCase(v){o.mc=v;return tf;}, matchEntireCell(v){o.me=v;return tf;}, useRegularExpression(){return tf;},
    findAll(){ const r=[]; const vals=rg.getValues(); for(let i=0;i<vals.length;i++) for(let j=0;j<vals[i].length;j++){ let v=String(vals[i][j]); let qq=String(q); if(!o.mc){v=v.toLowerCase();qq=qq.toLowerCase();} if(o.me? v===qq : v.includes(qq)) r.push(new Range(rg.sh, rg.r+i, rg.c+j, 1,1)); } return r; },
    findNext(){ return tf.findAll()[0]||null; } }; return tf; }
  setNumberFormat() { return this; } setFontWeight() { return this; } setBackground() { return this; }
  // Validación de datos por columna (basta para las pruebas): como en Sheets, insertColumnsAfter la hereda de la columna de referencia.
  setDataValidation(v) { for (let j = 0; j < this.nc; j++) this.sh.val[this.c + j] = v; return this; }
  clearDataValidations() { for (let j = 0; j < this.nc; j++) delete this.sh.val[this.c + j]; return this; }
  getDataValidation() { return this.sh.val[this.c] || null; }
}
class Sheet {
  constructor(name) { this.name = name; this.data = []; this.maxRows = 1000; this.maxCols = 26; this.val = {}; }
  getName() { return this.name; }
  getRange(r, c, nr, nc) { return new Range(this, r, c, nr, nc); }
  getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  clearContents() { this.data = []; return this; }
  getLastRow() { for (let i = this.data.length - 1; i >= 0; i--) if (this.data[i] && this.data[i].some(x => x !== '' && x !== undefined)) return i + 1; return 0; }
  getLastColumn() { return Math.max(0, ...this.data.map(r => r.length)); }
  getMaxRows() { return this.maxRows; } getMaxColumns() { return this.maxCols; }
  deleteColumns(a, n) { this.maxCols -= n; }
  insertColumnsAfter(a, n) {
    this.maxCols += n;
    const val = {};
    Object.keys(this.val).forEach((k) => { val[+k > a ? +k + n : +k] = this.val[k]; });
    if (this.val[a]) for (let i = 1; i <= n; i++) val[a + i] = this.val[a];
    this.val = val;
  }
  deleteRow(a) { this.deleteRows(a, 1); }
  insertRowsAfter(a, n) { this.maxRows += n; }
  deleteRows(a, n) { if (this.maxRows - n < 2) throw new Error('no se pueden borrar todas'); this.data.splice(a - 1, n); this.maxRows -= n; }
  setFrozenRows() {} autoResizeColumns() {}
}
class Book {
  constructor(id, name) { this.id = id; this.name = name; this.sheets = [new Sheet('Hoja 1')]; }
  getId() { return this.id + "-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; } getUrl() { return 'https://x/' + this.id; } getName() { return this.name; }
  getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }
  insertSheet(n) { if (this.getSheetByName(n)) throw new Error('existe'); const s = new Sheet(n); this.sheets.push(s); return s; }
  getSheets() { return this.sheets.slice(); }
  deleteSheet(s) { this.sheets = this.sheets.filter(x => x !== s); }
  setSpreadsheetTimeZone() {}
}
const books = {}; let nb = 0;
const drive = {}; let nd = 0;
function nodoDrive(id){ const n=drive[id]; if(!n) throw new Error("No existe "+id); return n; }
function iter(a){ let i=0; return { hasNext:()=>i<a.length, next:()=>a[i++] }; }
function objDrive(id){ const n=nodoDrive(id); const o={ getId:()=>id, getName:()=>n.name, getUrl:()=>"https://drive/"+id, isTrashed:()=>!!n.trashed,
  setTrashed:(v)=>{ n.trashed=v; Object.values(drive).forEach(x=>{ if(x.parent===id) x.trashed=v; }); }, getParents:()=>iter(n.parent?[objDrive(n.parent)]:[]),
  moveTo:(f)=>{ n.parent=f.getId(); return o; }, createFolder:(nm)=>{ const nid="F"+(++nd); drive[nid]={name:nm,folder:true,parent:id}; return objDrive(nid); },
  getFilesByName:(nm)=>iter(Object.keys(drive).filter(k=>drive[k].parent===id&&!drive[k].folder&&!drive[k].trashed&&drive[k].name===nm).map(objDrive)) }; return o; }
drive.ROOT={name:"Mi unidad",folder:true};
const props = {}; const cache = {};
const src = path.resolve(process.argv[2] || path.join(__dirname, "..", "src"));
const ctx = {
  console,
  SpreadsheetApp: {
    openById: id => { const b = books[String(id).replace("-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","")]; if (!b) throw new Error('No se encuentra la hoja ' + id); return b; }, create: n => { const b = new Book('L' + (++nb), n); books[b.id] = b; drive[b.id + "-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"] = { name: n, parent: "ROOT" }; return b; }, flush() {},
    newDataValidation: () => { const r = { lista: null }; const b = { requireValueInList(l) { r.lista = l; return b; }, setAllowInvalid() { return b; }, build() { return r; } }; return b; }
  },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] || null, setProperty: (k, v) => { props[k] = v; }, deleteProperty: k => { delete props[k]; } }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { if (v.length > 100000) throw new Error('grande'); cache[k] = v; }, remove: k => { delete cache[k]; } }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  Utilities: { formatDate: fmt, getUuid: () => require('crypto').randomUUID(), DigestAlgorithm: { SHA_256: 'sha256' }, computeDigest: (a, t) => [...require('crypto').createHash('sha256').update(String(t)).digest()], base64EncodeWebSafe: (b) => Buffer.from(b).toString('base64url') },
  Session: { getEffectiveUser: () => ({ getEmail: () => 'propietario@g.educaand.es' }), getActiveUser: () => ({ getEmail: () => '' }) },
  ScriptApp: { getProjectTriggers: () => [], deleteTrigger() {}, requireAllScopes() {}, AuthMode: { FULL: 'FULL' }, getService: () => ({ getUrl: () => 'https://script.google.com/a/macros/g.educaand.es/s/PRUEBA/exec' }), WeekDay: { MONDAY: 'MONDAY', TUESDAY: 'TUESDAY', WEDNESDAY: 'WEDNESDAY', THURSDAY: 'THURSDAY', FRIDAY: 'FRIDAY', SATURDAY: 'SATURDAY', SUNDAY: 'SUNDAY' },
    newTrigger: () => { const b = { timeBased: () => b, everyMinutes: () => b, everyHours: () => b, onMonthDay: () => b, onWeekDay: (d) => { if (!d) throw new Error('día de la semana no válido'); return b; }, atHour: () => b, inTimezone: () => b, create: () => b }; return b; } },
  DriveApp: { getFileById: (id)=>{ const n=nodoDrive(id); if(n.folder) throw new Error("no es fichero"); return objDrive(id); },
    getFolderById: (id)=>{ const n=nodoDrive(id); if(!n.folder) throw new Error("no es carpeta"); return objDrive(id); }, getRootFolder: ()=>objDrive("ROOT") },
  MailApp: { sendEmail: ()=>{ throw new Error("no debería enviarse correo real en pruebas"); } },
  ContentService: { MimeType: { TEXT: "text", JSON: "json" }, createTextOutput: (t) => { const o = { c: t, getContent: () => o.c, setMimeType: () => o, getMimeType: () => "text" }; return o; } },
  HtmlService: { XFrameOptionsMode: { ALLOWALL: "ALLOWALL" }, createHtmlOutput: (h) => { const o = { getContent: () => h, setTitle: () => o, addMetaTag: () => o, setXFrameOptionsMode: () => o }; return o; },
    createTemplateFromFile: (n) => { const t = { evaluate: () => { const h = fs.readFileSync(path.join(src, n + ".html"), "utf8").replace(/<\?!= *(\w+) *\?>/g, (m, k) => t[k]); const o = { getContent: () => h, setTitle: () => o, addMetaTag: () => o, setXFrameOptionsMode: () => o }; return o; } }; return t; } },
  UrlFetchApp: {},
};
vm.createContext(ctx);

for (const f of fs.readdirSync(src).filter(x=>x.endsWith(".gs")).map(x=>x.slice(0,-3))) {
  vm.runInContext(fs.readFileSync(path.join(src, f + '.gs'), 'utf8'), ctx, { filename: f + '.gs' });
}
vm.runInContext("instalar(); var R = ejecutarPruebas();", ctx);
if (ctx.R.fallos.length) console.log(ctx.R.fallos.join("\n"));
// Segunda pasada para comprobar que las pruebas son repetibles.
vm.runInContext("var R2 = ejecutarPruebas();", ctx);
console.log("Pasada 2:", ctx.R2.correctas + "/" + ctx.R2.total);
process.exitCode = ctx.R.correctas === ctx.R.total && ctx.R2.correctas === ctx.R2.total ? 0 : 1;
