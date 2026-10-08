Aventura de Idiomas V43

Corrección de raíz de la boca del robot:
- Se eliminó la boca superpuesta por CSS.
- El estado de boca abierta está integrado en una segunda imagen del robot, con las mismas dimensiones y posición que la imagen original.
- Durante speech synthesis se alternan las dos imágenes completas, evitando desplazamientos de coordenadas.
- Se conserva la lógica de V42: audio, micrófono, reconocimiento de RED y navegación.

Archivos: index.html, style.css, app.js, mundo_inicio.png, robot_animado.png, robot_abierto.png
