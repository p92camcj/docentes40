# Diario del proyecto

Lo leen y lo escriben Dukas (el orquestador de Julio), sus sesiones de Claude Code y cualquier hilo de Claude
que trabaje en este repositorio. **Al empezar, lee las últimas entradas. Al terminar, añade una al final** con:
fecha, qué se hizo, decisiones tomadas y qué queda pendiente. Lo más reciente va abajo.

## 2026-11-27 09:45 · Reconstruir la historia del proyecto

- Hecho por: Dukas (tarea tbe579e5e5727)

> He escrito la historia del proyecto en `docs/HISTORIA.md` y he creado `CLAUDE.md` con la sección del diario de Dukas, tal cual la pediste. Está en el commit `faa057a` de la rama `orq/tbe579e5e5727`, sin push. No he podido ejecutar las pruebas de la app: el entorno pedía permiso para lanzar `node` y nadie podía darlo.
>
> **Qué hice**
> - **`docs/HISTORIA.md`** tiene las cinco partes pedidas. La historia agrupa los 26 commits en cinco hitos, del 9 al 22 de noviembre de 2026:
>   - el arranque, con la portada, la Sesión 1 y Participantes;
>   - el recurso de Binario y ASCII y la presentación al claustro;
>   - la app de Apps Script y el site renovado;
>   - el arreglo para el iPhone y el simulador de Von Neumann;
>   - el recortador de avatar, el acta por número de sesión y la guía rápida.
> - **`CLAUDE.md`** no existía, así que lo he creado solo con esa sección.
>
> **Cómo lo comprobé**
> - Saqué la información del `git log` (fechas, mensajes y ficheros tocados), del README y del código. No existía `docs/DIARIO.md`.
> - Las sesiones previstas (2 a 5) las tomé de `index.html`.
> - El README dice que las pruebas pasan 29 de 29. Solo he confirmado que `Pruebas.gs` tiene 29 comprobaciones. En la historia queda escrito que ese resultado no se ha comprobado ahora.
>
> **Decisiones** (anotadas en `.orquestador/autodecisiones.json`, que git ignora y por eso no va en el commit)
> - La contraseña de la «llave» de Binario y ASCII sale en un mensaje de commit, pero no la he copiado: la historia describe la función sin…

**Decisiones**
- ¿Se copia en HISTORIA.md la contraseña de la 'llave' de Binario y ASCII que aparece en un commit? → No: se describe la función sin dar la contraseña (decidió Claude)
- ¿Se completa la tabla del README con las páginas que faltan? → No; se deja anotado como pendiente opcional en HISTORIA.md (decidió Claude)

<details><summary>Archivos</summary>

```
CLAUDE.md        | 10 ++++++++
 docs/HISTORIA.md | 74 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 84 insertions(+)
```
</details>
