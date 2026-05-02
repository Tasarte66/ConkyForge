# 🛠️ ConkyForge V.3

**El mejor creador y editor visual de Conky basado en web**

ConkyForge es una potente herramienta web 100 % local que permite a los usuarios de Linux diseñar, personalizar y generar widgets de escritorio Conky complejos de forma visual, sin escribir una sola línea de código ni tener que lidiar manualmente con scripts de Lua.

![Vista previa de ConkyForge](enlace-a-tu-captura-de-pantalla-aquí.png)
*(Nota: ¡Sustituye el enlace anterior por una captura de pantalla de tu herramienta y tu escritorio!)*

## ✨ Características

* **🎨 Lienzo visual:** Observa cómo tu diseño de Conky toma forma en tiempo real.
* **📦 One-Click Forge (exportación ZIP):** Empaqueta todo tu tema (configuraciones, scripts Lua y scripts de inicio de Bash) en un archivo `.zip` limpio al instante.
* **📊 Gráficos Lua avanzados:** Añade fácilmente anillos de CPU/RAM, gráficos fluidos, geometría de neón, globos terráqueos en 3D y ecualizadores de audio con tecnología Cairo.
* **☀️ Integración meteorológica:** Compatibilidad integrada para generar scripts de seguimiento meteorológico.
* **🔒 100 % local y seguro:** Todo se ejecuta en tu navegador. Sin servidor backend, sin recopilación de datos. ¡Funciona completamente sin conexión!

## ⚠️ Notas importantes y consejos profesionales (lectura obligatoria)

Antes de empezar a crear, ten en cuenta los siguientes detalles técnicos para sacar el máximo partido a ConkyForge:

* **Canvas frente a la realidad:** El lienzo web es un potente visualizador, pero **no** es una representación exacta 1:1 del resultado final. Los diferentes entornos de escritorio, resoluciones y fuentes del sistema harán que el Conky real se vea ligeramente diferente en tu pantalla.
* **Modo Sniper y ajustes precisos:** Al utilizar el «Modo Sniper», los ajustes se aplican al código generado, pero el lienzo web en sí no se actualizará visualmente. Debes fijarte en el Conky real que se ejecuta en tu pantalla y utilizarlo como referencia en tiempo real. ConkyForge V.3 es una potente herramienta con espectaculares widgets y funciones de dibujo Lua-Cairo que te ahorrarán miles de líneas de código, ¡pero ajustarlo a la perfección absoluta es un arte que aún requiere cierta observación manual!
* **Iconos meteorológicos que faltan:** Si el widget meteorológico muestra caracteres corruptos en lugar de iconos de sol/nube, debes cumplir dos requisitos. Primero, concede permisos de ejecución al script (`chmod +x ~/.config/conky/weather.sh`). Segundo, asegúrate de tener instalada la **fuente Hack Nerd** en tu sistema.
* **Cerrar formas circulares:** Si intentas cerrar completamente una forma circular en el lienzo, agarra el controlador de redimensionamiento y encógela hasta convertirla en una elipse muy estrecha. Una vez hecho esto, aparecerá un **punto rojo**. Haz clic en ese punto rojo para cerrar la forma correctamente.

## 🚀 Cómo utilizarlo

### Opción 1: Pruébalo en vivo (GitHub Pages)
*(Si habilitas GitHub Pages, pon el enlace aquí: `https://yourusername.github.io/conkyforge`)*

### Opción 2: Ejecútalo localmente
1. Clona o descarga este repositorio.
2. Abre `indexES.html` (o `indexEN.html` para inglés) en tu navegador web favorito.
3. Diseña tu configuración perfecta de Conky utilizando el panel lateral.
4. Haz clic en **🔥 FORGE CONKY**.
5. Se descargará un archivo `ConkyForge_Tema.zip` se descargará en tu equipo.

## ⚙️ Instalación en tu escritorio Linux

Una vez que hayas descargado el archivo `.zip`:

1. Extrae el contenido en tu carpeta de configuración de Conky (normalmente `~/.config/conky/`).
2. Asegúrate de que los scripts de bash sean ejecutables:
   ```bash
   chmod +x ~/.config/conky/start_conky.sh
   # Si has añadido el tiempo:
   chmod +x ~/.config/conky/weather.sh
   
   Ejecuta el script de inicio:


   ~/.config/conky/start_conky.sh
   
##📂 Estructura del proyecto
/css - Barras de desplazamiento personalizadas y estilos específicos de la interfaz de usuario.

/js - El motor principal (script.js) y la biblioteca JSZip local para la exportación sin conexión.

indexEN.html - Interfaz en inglés.

indexES.html - Interfaz en español.

🤝 Colaboración
¡No dudes en bifurcar este proyecto, enviar solicitudes de incorporación de cambios o abrir incidencias si quieres añadir nuevos módulos de Conky a Forge!

📜 Licencia
Este proyecto es de código abierto y está disponible bajo la licencia MIT.


