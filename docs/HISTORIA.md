# Historia del proyecto · Docentes 4.0

Reconstruida el 2026-11-27 a partir del repositorio: `git log`, `README.md` y el código. En ese momento no existía `docs/DIARIO.md`. Lo que no se puede deducir del repositorio se indica como tal.

## 1. Qué es

Es la web del grupo de trabajo «Docentes 4.0: Inteligencia colectiva e IA» del IES Vega de Mar (curso 2026-27). Según la portada, son unos diez docentes que se reúnen una tarde al mes para aprender a usar la IA en el aula, con una regla de oro: nunca meter datos del alumnado en la IA y usar solo Gemini con la cuenta @g.educaand.es.

- **Para quién**: los miembros del GT (portada, sesiones, participantes, recursos, guía rápida), el claustro (presentación del Plan de Actuación Digital) y el alumnado de TIC (recursos interactivos de binario/ASCII y de la máquina de von Neumann).
- **Tecnología**:
  - Páginas HTML estáticas sin compilación, publicadas con GitHub Pages (`.nojekyll`) y metidas en el site de Google del GT (Insertar › Incrustar › URL). Lo común está en `comun/` (`gt.css`, `gt.js`, `api.js`).
  - Una app de Google Apps Script (`app/src/*.gs`, `Interfaz.html`) con una hoja de cálculo como base de datos y dos despliegues: **PUBLICO** (anónimo, devuelve en JSON solo lo publicado) y **APP** (cuentas del dominio: formularios, solicitudes de acceso y Administración). Se despliega con `clasp` usando `app/desplegar.js`.
  - Un marcador del navegador (`app/marcador/marcador.js`) que pasa el acta a Séneca.
  - Herramientas en Node (simulador local de Apps Script y prueba de la interfaz con Playwright) y en Python (`herramientas/qr.py`, que genera los QR en SVG).

## 2. Lo hecho, por fechas

### 2026-11-09/10 · Arranque: portada, sesión 1 y participantes
- Commit inicial y, ese mismo día, la portada (`index.html`), la presentación de la **Sesión 1** (`sesion01/`) y la página de **Participantes**, con el site personal de un miembro.
- El acta de la sesión va dentro de la presentación (`<script type="application/json" id="datos-acta">`). El día 10 se ajustó a la franja de 16:00 a 19:00 y se enlazó con el site del GT.
- Nota: el commit inicial tiene una hora (21:17) posterior a la del siguiente (20:21). Lo más probable es que se deba a zonas horarias distintas al hacer los commits, pero el repositorio no lo aclara.

### 2026-11-12 · Recurso «Binario y ASCII» y presentación al claustro
- **Binario y ASCII** (TIC 1.º Bachillerato, `recursos/binario-ascii/`): se subió la versión original y, en el mismo día, se adaptó para que cupiera en la pizarra sin scroll (16:9 y 4:3). También se añadió el tema oscuro, se corrigieron contenidos, se incorporó una diapositiva sobre Unicode/UTF-8 y se cambió la conversión de decimal a binario por el «método de los cajones» de Julio. Llegaron además el botón con QR para abrir el recurso en el móvil, los retos con 6 niveles por racha y la petición del nombre y grupo del alumno. Ese nombre no se comprueba; el commit dice que Julio lo prefirió así antes que servirlo desde Apps Script.
- **Claustro** (`claustro/`): presentación del Plan de Actuación Digital 2026-27 (protección de datos, guía del CTPDA, Séneca, el GT, el site TDE, portátiles y STEAM, Jano y difusión). Con varios retoques: enlaces a la normativa, diapositivas a pantalla completa, barra de navegación y avance con clic, Código de Conducta TIC, Política de Seguridad TIC en el BOJA y el portal eAprendizaje.

### 2026-11-13 · App del GT y site renovado
- En el commit más grande del proyecto aparecen la **app de Apps Script** (permisos, solicitudes de acceso con aviso por correo, proyectos, recursos con aprobación, participantes con avatar y la vista de acta para Séneca), el **marcador** «Rellenar acta GT», el **simulador local** con 29 pruebas, la **portada nueva** y las páginas **Apunta al cielo**, **Recursos** y **Participantes**, que leen el despliegue PUBLICO. Después se añadieron a `comun/api.js` las direcciones de los despliegues.
- Binario y ASCII: el QR ahora lleva a la página /binario del site y el progreso se guarda en el navegador. Se añadieron el modo **Escalera** por defecto con medallas (de bronce a diamante), una «llave» escondida en la ventana de la medalla que muestra un mensaje en binario, el ajuste para que los retos quepan en el móvil sin scroll y el paso automático al siguiente ejercicio 1,5 s después de un acierto.

### 2026-11-16 · Arreglo para iPhone y recurso «Von Neumann»
- Binario y ASCII: la altura se mide con `visualViewport` para que en Safari del iPhone y dentro del site se vean los botones de abajo.
- **La máquina de von Neumann** (`recursos/von-neumann/`): simulador con vista binaria y vista codificada, memoria de 16 celdas (8 bits) o de 32 (9 bits), programas de ejemplo (según el commit, inspirados en el simulador de lab.xitrus.es) y el programa de la pizarra. Los programas propios se guardan en el navegador, y hay 10 retos con medallas y un QR.

### 2026-11-22 · Mejoras de la app y guía rápida
- App: recortador de avatar con zoom y encuadre, y acta que se carga según el número de sesión, con enlaces al site (`Config.gs` pasa a la versión `1.1.0`).
- **Guía rápida** (`manual/`): «La web del GT, paso a paso» para los miembros del grupo (entrar con la cuenta del centro, apuntar al cielo, compartir recursos).

## 3. Estado actual (2026-11-27)

**Funciona, o eso indica el repositorio:**
- Las páginas públicas: portada con la próxima sesión y las fases del curso, Sesión 1, Participantes, Apunta al cielo, Recursos, Claustro, Guía rápida y los dos recursos de TIC.
- La app de Apps Script con sus dos despliegues. Según el README, el simulador local pasa 29/29 pruebas, y `Pruebas.gs` tiene efectivamente 29 comprobaciones. Al hacer esta historia **no se pudieron ejecutar las pruebas** porque el entorno pedía permiso para lanzar `node`, así que este resultado no está comprobado ahora.
- `comun/api.js` ya tiene las direcciones de los despliegues, generadas por `desplegar.js`.

**A medias o sin aclarar:**
- Solo existe la presentación de la Sesión 1. La portada tiene previstas las sesiones 2 (2026-11-30), 3 (2027-01-11), 4 (2027-02-01) y 5 (2027-03-01), todavía sin página, y avisa de que las fechas de enero en adelante están por confirmar.
- La tabla del README no recoge todas las páginas: faltan `claustro/`, `manual/`, `recursos/binario-ascii/` y `recursos/von-neumann/`. Por los commits, Binario y Von Neumann se incrustan en páginas propias del site (/binario, entre otras), pero el repositorio no lo documenta.
- Parte de la configuración no está en git, a propósito: `.clasp.json`, `despliegues.local.json`, `src/Despliegue.gs` (generado) y `src/Integrantes.gs` (nombres de Séneca). Sin esos ficheros no se puede desplegar desde una copia limpia.

**Fallos conocidos:** no hay issues, TODO ni FIXME en el código, y ningún commit habla de errores abiertos. Los problemas de visualización en el móvil y el iPhone que mencionan los commits del 13 y el 16 de noviembre se dieron por resueltos.

## 4. Pendiente

Lo que deja ver el repositorio (no hay diario ni lista de tareas):
- Preparar la página de la Sesión 2 (2026-11-30: aula de informática, traer la agenda del profe funcionando, empezar con el Cuaderno de Séneca) y las siguientes. Para cada una hay que añadir su `pagina` en `SESIONES` de `index.html` y su acta en `datos-acta`.
- Confirmar las fechas de las sesiones de enero en adelante.
- Seguir las fases del curso que marca la portada: Cuaderno de Séneca (diciembre-enero), Situaciones de aprendizaje (febrero-marzo) y Repositorio y memoria (abril-mayo).
- Opcional: completar la tabla del README con las páginas que faltan.

## 5. Cómo se publica y se prueba

**Páginas públicas**: se publican con GitHub Pages desde la rama principal (la dirección está en el README) y se incrustan en el site del GT. Al cambiar un QR hay que regenerarlo con `herramientas/qr.py`.

**App** (desde `app/`, según el README):
```bash
node herramientas/simular-apps-script.js   # pruebas en local (29 comprobaciones, dos pasadas)
node herramientas/probar-interfaz.js [correo] [vista] [captura.png]   # interfaz en Chromium con Playwright
node herramientas/poner-marcador.js        # tras cambiar marcador/marcador.js
node desplegar.js                          # clasp: sube y publica PUBLICO y APP y reescribe ../comun/api.js
```
- `desplegar.js` necesita `.clasp.json` y la sesión de `clasp` de la cuenta educaand. Los IDs de despliegue se mantienen, así que las URL no cambian. Después hay que subir a git el `comun/api.js` que genera.
- Si cambian los permisos del manifiesto, la cuenta propietaria ejecuta `instalar()` en el editor (se puede repetir sin problema). En Apps Script, las pruebas se lanzan con `ejecutarPruebas()`.
- El simulador sirve para encontrar errores de lógica, pero no sustituye a las pruebas en Apps Script (lo dice su propia cabecera).
