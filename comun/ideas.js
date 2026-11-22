/* Docentes 4.0 · «¡Necesito inspiración!»: ideas de proyecto escritas con IA para que cada uno las adapte.
   Botón: <button data-gt-inspiracion>¡Necesito inspiración!</button> (requiere gt.js). Todo se pinta con textContent. */
(function () {
  var IDEAS = [
    /* Para quitarse carga burocrática */
    { t: 'Programación didáctica que se mantiene sola', p: 'Cualquier materia · menos papeleo', d: 'Una hoja con criterios, saberes, situaciones de aprendizaje e instrumentos, y un script que genera el documento oficial y avisa si un criterio se ha quedado sin evaluar.', s: 'Primero la estructura de la hoja; después el generador del documento; al final, las comprobaciones y avisos.' },
    { t: 'Cuaderno de evaluación por criterios', p: 'Cualquier materia · menos papeleo', d: 'Una hoja de cálculo donde cada actividad se asocia a sus criterios y la nota de la evaluación sale sola, con las ponderaciones del departamento.', s: 'La IA escribe las fórmulas y el script; tú defines criterios y pesos. Se prueba con datos inventados antes de usarla de verdad.' },
    { t: 'Banco de comentarios para los informes', p: 'Cualquier materia · menos papeleo', d: 'Un banco de frases de retroalimentación por criterio y nivel de logro, sin nombres, y una hoja que compone el comentario de cada informe a partir de tus marcas.', s: 'Redactar el banco con la IA, revisarlo, y montar la hoja que combina las frases. Los datos del alumnado nunca pasan por la IA.' },
    { t: 'Generador de exámenes con variantes', p: 'Cualquier materia · menos papeleo', d: 'Un banco de preguntas etiquetado por criterio y dificultad, y una herramienta que monta modelos A, B y C equivalentes con su solucionario.', s: 'Crear el banco poco a poco, unidad a unidad, y después la herramienta que mezcla y maqueta.' },
    { t: 'Plantillas de documentos del departamento', p: 'Jefaturas y departamentos · menos papeleo', d: 'Actas de reunión, memoria final, plan de pendientes o informe de recuperación: plantillas que se rellenan desde un formulario y se guardan ordenadas en Drive.', s: 'Una plantilla por sesión. Al final del curso, la memoria sale casi sola.' },
    { t: 'Asistente para la memoria final de curso', p: 'Cualquier materia · menos papeleo', d: 'Durante el curso vas anotando en una hoja lo que funciona y lo que no; en junio, un Gem te ayuda a redactar la memoria a partir de esas notas.', s: 'Diseñar la hoja de notas, usarla unos meses y preparar el Gem con el formato de memoria del centro.' },
    { t: 'Correos y avisos a familias en plantilla', p: 'Tutorías · menos papeleo', d: 'Plantillas para los mensajes que más se repiten (material, salidas, recuperaciones) y una hoja que los personaliza y prepara los borradores.', s: 'Redactar las plantillas con la IA, revisar el tono y montar el combinador. Los datos reales los pone la hoja, nunca la IA.' },
    { t: 'Planificador de la PAU por semanas', p: 'Bachillerato · menos papeleo', d: 'Un calendario que reparte los contenidos de la PAU entre las semanas que quedan, recalcula si se pierde una clase y avisa de lo que va atrasado.', s: 'Volcar el temario, programar el reparto y añadir el recálculo y los avisos.' },
    { t: 'Inventario y préstamo del material', p: 'Tecnología, Música o laboratorios · menos papeleo', d: 'Una app sencilla para saber qué hay, qué está prestado y qué está roto, con QR en cada caja o instrumento.', s: 'La hoja de inventario, las etiquetas QR, la app de préstamos y, al final, los avisos de devolución.' },
    { t: 'Mis guiones de clase, siempre a mano', p: 'Cualquier materia · menos papeleo', d: 'Una web personal con el guion de cada sesión, los enlaces y materiales, y lo que quedó pendiente para la siguiente clase.', s: 'Diseñar la plantilla de guion, la web que los ordena y la búsqueda por unidad.' },

    /* Inglés */
    { t: 'Entrenador de Writing para la PAU', p: 'Inglés · 2.º Bachillerato', d: 'Una web con tareas tipo PAU, la rúbrica oficial y modelos comentados en tres niveles, con una lista de comprobación que el alumno revisa antes de entregar.', s: 'Una tipología de texto por sesión: opinión, carta, ensayo…' },
    { t: 'Simulacros de Reading con preguntas tipo PAU', p: 'Inglés · Bachillerato', d: 'Textos adaptados de temas de actualidad con preguntas como las de la prueba, corrección automática y explicación de cada respuesta.', s: 'Crear el formato de pregunta, generar y revisar textos por bloques y montar la corrección.' },
    { t: 'Gem de conversación para practicar Speaking', p: 'Inglés · Bachillerato', d: 'Un Gem que hace de examinador o de compañero de conversación sobre temas del curso, con nivel ajustable y correcciones amables al final.', s: 'Escribir las instrucciones, probarlo tú mismo muchas veces y afinarlo hasta que no se salga del papel.' },
    { t: 'Aventura de vocabulario por niveles', p: 'Inglés · 1.º y 2.º ESO', d: 'Un juego web por islas temáticas (casa, colegio, comida…) con ejercicios de vocabulario, sonido e imágenes, y medallas al completar cada isla.', s: 'Una isla nueva por sesión. Se puede ir ampliando todo el curso.' },
    { t: 'Historias interactivas de «elige tu camino»', p: 'Inglés · ESO', d: 'Relatos cortos en inglés sencillo en los que el alumno elige qué pasa, con el vocabulario y la gramática de cada unidad.', s: 'Diseñar la historia, escribirla con la IA, ilustrarla y programar las ramas.' },

    /* Programación y computación */
    { t: 'Juez automático de ejercicios de programación', p: 'Programación · 2.º Bachillerato', d: 'Una web donde el alumno pega su código y se comprueba con casos de prueba, con pistas progresivas si falla.', s: 'Elegir el lenguaje, montar el comprobador, crear el banco de problemas y las pistas.' },
    { t: 'Visualizador de algoritmos', p: 'Computación · 2.º Bachillerato', d: 'Animaciones paso a paso de ordenación, búsqueda o recursividad, con el código resaltado línea a línea.', s: 'Un algoritmo por sesión, con su animación y unas preguntas para comprobar que se entiende.' },
    { t: 'Proyecto final guiado con IA como copiloto', p: 'Programación · 2.º Bachillerato', d: 'Una guía para que el alumnado haga una app real usando la IA de forma honesta: qué preguntar, cómo revisar el código y cómo documentarlo.', s: 'Hacer tú el proyecto modelo primero, convertirlo en guía por fases y preparar la rúbrica.' },

    /* Tecnología */
    { t: 'Retos cortos que enganchan', p: 'Tecnología · 2.º y 4.º ESO', d: 'Retos de 15 minutos (montar, programar, arreglar) con tarjetas, tiempos y medallas, pensados para grupos que se desconectan con facilidad.', s: 'Diseñar la mecánica, crear un bloque de retos por unidad y el marcador de la clase.' },
    { t: 'Taller de proyectos con roles', p: 'Tecnología · ESO', d: 'Fichas de proyecto en las que cada alumno tiene un papel claro (jefe de taller, programador, documentalista…) y un diario de avance muy visual.', s: 'Preparar los roles, las fichas y el panel de avance, y probarlo con un proyecto real.' },
    { t: 'Simulador de circuitos con misiones', p: 'Tecnología · ESO', d: 'Una web para montar circuitos virtuales que cumplan una misión (encender, alarma, semáforo) antes de pasar al material real.', s: 'Misiones de dificultad creciente, una o dos por sesión.' },
    { t: 'Normas del taller en formato juego', p: 'Tecnología · ESO', d: 'Un juego de situaciones del taller: el alumno decide qué hacer y ve la consecuencia. Sirve de «carné» antes de usar herramientas.', s: 'Escribir las situaciones, ilustrarlas y programar el juego y el carné.' },

    /* Biología */
    { t: 'Atlas interactivo de biología', p: 'Biología · Bachillerato', d: 'Imágenes y esquemas con zonas que se pulsan para ver la explicación, con modo repaso y modo examen.', s: 'Un tema por sesión: célula, tejidos, aparatos, genética…' },
    { t: 'Simulador de genética y herencia', p: 'Biología · Bachillerato', d: 'Cruces, árboles genealógicos y problemas generados con la solución paso a paso, de dificultad creciente.', s: 'Programar el generador de problemas y después las explicaciones y los niveles.' },
    { t: 'Casos clínicos para razonar', p: 'Biología · Bachillerato', d: 'Casos inventados que se resuelven en varias pistas: síntomas, pruebas y diagnóstico, uniendo varios temas del currículo.', s: 'Escribir los casos con la IA, revisarlos con rigor y montarlos como juego de pistas.' },

    /* Física */
    { t: 'Laboratorio virtual de física', p: 'Física · Bachillerato', d: 'Simuladores de tiro parabólico, péndulo o campos con parámetros que se cambian y tablas para sacar gráficas y conclusiones.', s: 'Un simulador por sesión con su guion de práctica.' },
    { t: 'Problemas con solución paso a paso', p: 'Física · Bachillerato', d: 'Un banco de problemas con datos que cambian cada vez, la resolución guiada y los errores típicos explicados.', s: 'Un bloque del temario por sesión: cinemática, dinámica, energía, campos…' },

    /* Música */
    { t: 'Entrenador de lectura musical y ritmo', p: 'Música · ESO', d: 'Un juego web de lectura de notas y ritmos con sonido, niveles y retos de clase.', s: 'Notas, después ritmos, después dictados, y el marcador por grupos.' },
    { t: 'Estudio de creación musical guiado', p: 'Música · ESO', d: 'Retos para componer con herramientas web (secuenciador, bases, acordes) con plantillas para cada curso.', s: 'Elegir la herramienta, preparar retos por nivel y la forma de compartir las creaciones.' },
    { t: 'Línea del tiempo de la música que suena', p: 'Música · ESO', d: 'Una línea del tiempo interactiva por épocas con audiciones, instrumentos y un juego de «¿de qué época es?».', s: 'Una época por sesión, con su audición y sus preguntas.' },

    /* Diversificación */
    { t: 'Ciencia de lo cotidiano en pequeñas misiones', p: 'Ámbito científico-técnico · 3.º ESO (diversificación)', d: 'Problemas de matemáticas y ciencias sacados de la vida real (la factura de la luz, una receta, un viaje) en misiones cortas con apoyo visual.', s: 'Una misión por sesión, con su versión con más apoyos y otra con menos.' },
    { t: 'Materiales de un mismo tema en tres niveles', p: 'Ámbito científico-técnico · diversificación', d: 'Cada tema con lectura fácil, versión estándar y reto, con pictogramas y glosario, para atender a todos sin preparar tres clases.', s: 'Una unidad cada vez: texto, actividades y glosario en los tres niveles.' },
    { t: 'Diario de logros del grupo', p: 'Ámbito científico-técnico · diversificación', d: 'Un panel visual en el que el grupo ve lo que ha conseguido cada semana, para reforzar la motivación.', s: 'Diseñar el panel, los logros y cómo se actualiza en dos minutos al final de la clase.' },

    /* Para cualquiera */
    { t: 'Escape room de tu materia', p: 'Cualquier materia', d: 'Un juego web con historia, pruebas encadenadas y pistas, para repasar antes de un examen.', s: 'Diseñar la historia y las pruebas, programarlo, probarlo con un grupo y pulirlo.' },
    { t: 'Tutor de la materia en Gemini (un Gem)', p: 'Cualquier materia', d: 'Un Gem que conoce tus apuntes y criterios, que guía con preguntas y no da las respuestas hechas.', s: 'Escribir las instrucciones, cargar los materiales y afinarlo con muchas pruebas.' },
    { t: 'Podcast o vídeos cortos de la materia', p: 'Cualquier materia', d: 'Guiones con IA, voz sintética e imágenes para explicar un concepto en tres minutos, reunidos en una web.', s: 'Un episodio por sesión. Al final del curso tienes una serie.' }
  ];

  function azar(n, evitar) {
    var libres = IDEAS.filter(function (x) { return evitar.indexOf(x) < 0; });
    if (libres.length < n) libres = IDEAS.slice();
    var r = [];
    while (r.length < n && libres.length) r.push(libres.splice(Math.floor(Math.random() * libres.length), 1)[0]);
    return r;
  }

  var dialogo = null, lista, vistas = [];
  function crear() {
    var el = GT.el;
    dialogo = el('dialog', 'inspira');
    dialogo.setAttribute('aria-labelledby', 'inspiraTitulo');
    var cab = el('div', 'inspira-cab');
    var h = el('h2', null, '¡Ideas para inspirarte!'); h.id = 'inspiraTitulo';
    var cerrar = el('button', 'inspira-cerrar', '×'); cerrar.type = 'button'; cerrar.setAttribute('aria-label', 'Cerrar');
    cerrar.addEventListener('click', function () { dialogo.close(); });
    cab.appendChild(h); cab.appendChild(cerrar);
    dialogo.appendChild(cab);
    dialogo.appendChild(el('p', 'inspira-aviso', 'Estas ideas las ha escrito una IA: no son proyectos reales de ningún docente. Tómalas como punto de partida y adáptalas a tu materia, a tus grupos y a lo que te haría la vida más fácil.'));
    lista = el('div', 'inspira-lista'); lista.setAttribute('aria-live', 'polite');
    dialogo.appendChild(lista);
    var pie = el('div', 'inspira-pie');
    var mas = el('button', 'boton', 'Aún necesito más inspiración'); mas.type = 'button';
    mas.addEventListener('click', function () { pintar(2); });
    var vale = el('button', 'boton claro', 'Ya tengo idea'); vale.type = 'button';
    vale.addEventListener('click', function () { dialogo.close(); });
    pie.appendChild(mas); pie.appendChild(vale);
    dialogo.appendChild(pie);
    dialogo.addEventListener('click', function (e) { if (e.target === dialogo) dialogo.close(); });
    document.body.appendChild(dialogo);
  }
  function pintar(n) {
    var nuevas = azar(n, vistas);
    vistas = nuevas;
    lista.textContent = '';
    nuevas.forEach(function (x) {
      var c = GT.el('article', 'inspira-idea');
      c.appendChild(GT.el('span', 'inspira-para', x.p));
      c.appendChild(GT.el('h3', null, x.t));
      c.appendChild(GT.el('p', null, x.d));
      c.appendChild(GT.el('p', 'inspira-sesiones', 'Cómo crece sesión a sesión: ' + x.s));
      lista.appendChild(c);
    });
    lista.scrollTop = 0;
  }
  window.GT = window.GT || {};
  GT.inspiracion = function () {
    document.querySelectorAll('[data-gt-inspiracion]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!dialogo) crear();
        vistas = [];
        pintar(3);
        if (dialogo.showModal) dialogo.showModal(); else dialogo.setAttribute('open', '');
      });
    });
  };
})();
