#!/usr/bin/env node
/* Mete el marcador «Rellenar acta GT» (marcador/marcador.js) en el href del botón de src/Interfaz.html.
   node herramientas/poner-marcador.js  — repetirlo cada vez que cambie marcador.js. */
'use strict';
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const codigo = fs.readFileSync(path.join(raiz, 'marcador', 'marcador.js'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('/*')).join('\n');
const url = 'javascript:' + encodeURIComponent(codigo).replace(/'/g, '%27');
const f = path.join(raiz, 'src', 'Interfaz.html');
const html = fs.readFileSync(f, 'utf8');
const nuevo = html.replace(/(<a class="boton marcador" id="marcador" href=")[^"]*(")/, (m, a, b) => a + url + b);
if (nuevo === html && html.indexOf(url) < 0) throw new Error('No encuentro el botón del marcador en Interfaz.html');
fs.writeFileSync(f, nuevo);
console.log('Marcador puesto (' + url.length + ' caracteres).');
