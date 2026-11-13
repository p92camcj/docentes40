# Docentes 4.0

Grupo de trabajo «Docentes 4.0: Inteligencia colectiva e IA» · IES Vega de Mar · curso 2026-27.

Las páginas se publican con GitHub Pages y se incrustan en el site del GT (Insertar › Incrustar › URL).

| Página del site | Se incrusta |
|---|---|
| Inicio | https://p92camcj.github.io/docentes40/ |
| Apunta al cielo | https://p92camcj.github.io/docentes40/cielo/ |
| Recursos | https://p92camcj.github.io/docentes40/recursos/ |
| Participantes | https://p92camcj.github.io/docentes40/participantes/ |
| Sesiones › Sesión 1 | https://p92camcj.github.io/docentes40/sesion01/ |
| Administración (oculta del menú) | la URL de la app (`GT_APP` en `comun/api.js`) con `?v=admin` |

## Cómo funciona

- `comun/`: estilo, botón claro/oscuro y lectura de datos comunes a todas las páginas. `comun/api.js` lo escribe `app/desplegar.js`.
- `app/`: Apps Script (cuenta educaand) con la hoja de datos. Dos despliegues:
  - **PUBLICO** (anónimo): solo devuelve en JSON lo publicado, sin correos. Lo leen Apunta al cielo, Recursos y Participantes.
  - **APP** (cuentas @g.educaand.es): añadir proyecto, proponer recurso, pedir acceso y Administración (personas, proyectos, recursos, participantes con foto y acta de Séneca). Solo entra en Administración la cuenta propietaria.
- Pedir acceso manda un correo a la cuenta propietaria. Los proyectos de las personas autorizadas salen al momento; los recursos esperan a que el administrador los apruebe.
- Cada presentación de sesión lleva su acta en `<script type="application/json" id="datos-acta">`. Administración › Acta la lee y el marcador «Rellenar acta GT» la pasa a Séneca.

## App

```bash
cd app
node herramientas/simular-apps-script.js   # pruebas en local (29/29, dos pasadas)
node herramientas/poner-marcador.js        # tras cambiar marcador/marcador.js
node desplegar.js                          # sube y publica los dos despliegues (clasp --user educaand)
```

- `src/Integrantes.gs` (no va a git) define `INTEGRANTES_SENECA = [['Julio', 'Apellidos, Nombre'], …]` con los nombres tal como salen en Séneca.
- Tras cambiar permisos del manifiesto, el propietario ejecuta `instalar()` en el editor (idempotente).
- En Apps Script: `ejecutarPruebas()` desde el editor.

Nunca se publican datos, imágenes, voz ni producciones del alumnado.
