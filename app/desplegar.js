#!/usr/bin/env node
/**
 * desplegar.js — Sube el código y publica los dos despliegues de la app del GT.
 *
 *   cd app && node desplegar.js
 *
 * Un Web App tiene un único nivel de acceso por versión, así que se publican dos:
 *   - PUBLICO: acceso anónimo; solo devuelve en JSON lo publicado (para las páginas de GitHub Pages).
 *   - APP:     acceso dominio; formularios, administración y acta.
 * Los IDs se guardan en despliegues.local.json (no va a git) y no cambian: las URLs son siempre las mismas.
 * Al terminar escribe ../comun/api.js con las dos URLs para las páginas públicas.
 */
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const USUARIO_CLASP = 'educaand';
const DOMINIO = 'g.educaand.es';
const RAIZ = __dirname;
const MANIFIESTO = path.join(RAIZ, 'src', 'appsscript.json');
const FICHERO_DESPLIEGUE = path.join(RAIZ, 'src', 'Despliegue.gs');
const ESTADO = path.join(RAIZ, 'despliegues.local.json');
const API_JS = path.join(RAIZ, '..', 'comun', 'api.js');

function clasp(args) {
  const cmd = 'clasp --user ' + USUARIO_CLASP + ' ' + args;
  console.log('> ' + cmd);
  const salida = execSync(cmd, { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(salida);
  return salida;
}

function url(tipo, id) {
  return tipo === 'PUBLICO' ? 'https://script.google.com/macros/s/' + id + '/exec' : 'https://script.google.com/a/macros/' + DOMINIO + '/s/' + id + '/exec';
}

function configurar(tipo, estado) {
  const m = JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8'));
  m.webapp = { executeAs: 'USER_DEPLOYING', access: tipo === 'PUBLICO' ? 'ANYONE_ANONYMOUS' : 'DOMAIN' };
  fs.writeFileSync(MANIFIESTO, JSON.stringify(m, null, 2) + '\n');
  fs.writeFileSync(FICHERO_DESPLIEGUE, [
    '/** Despliegue.gs — GENERADO POR desplegar.js. No editar ni subir a git. */',
    'var DESPLIEGUE = ' + JSON.stringify(tipo) + ';',
    'var URL_DESPLIEGUE_APP = ' + JSON.stringify(estado.app ? url('APP', estado.app) : '') + ';',
    ''
  ].join('\n'));
}

function publicar(tipo, estado) {
  configurar(tipo, estado);
  clasp('push --force');
  const clave = tipo === 'PUBLICO' ? 'publico' : 'app';
  const salida = clasp('deploy ' + (estado[clave] ? '-i ' + estado[clave] + ' ' : '') + '-d "Docentes 4.0 ' + tipo + ' ' + new Date().toISOString() + '"');
  if (!estado[clave]) {
    const m = salida.match(/(AKfy[\w-]+)/);
    if (!m) throw new Error('No se pudo leer el ID del despliegue ' + tipo);
    estado[clave] = m[1];
    fs.writeFileSync(ESTADO, JSON.stringify(estado, null, 2) + '\n');
  }
}

function main() {
  if (!fs.existsSync(path.join(RAIZ, '.clasp.json'))) throw new Error('Falta .clasp.json (scriptId y "rootDir": "src").');
  const estado = fs.existsSync(ESTADO) ? JSON.parse(fs.readFileSync(ESTADO, 'utf8')) : {};
  try {
    if (!estado.app) publicar('APP', estado);
    publicar('PUBLICO', estado);
    publicar('APP', estado);
  } finally {
    configurar('APP', estado);
  }
  fs.writeFileSync(API_JS, '/* Generado por app/desplegar.js: direcciones de la app del GT. */\nvar GT_API = ' + JSON.stringify(url('PUBLICO', estado.publico)) +
    ';\nvar GT_APP = ' + JSON.stringify(url('APP', estado.app)) + ';\n');
  console.log('\nPUBLICO (anónimo, solo lectura): ' + url('PUBLICO', estado.publico));
  console.log('APP (cuentas @' + DOMINIO + '):     ' + url('APP', estado.app));
  console.log('Escrito ' + API_JS + ': súbelo a git para que las páginas públicas lo usen.');
}

main();
