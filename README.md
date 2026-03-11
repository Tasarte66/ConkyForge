# tasarte

# 🛠️ ConkyForge - User Guide

Welcome to ConkyForge! A visual, browser-based tool to design your Conky widgets without writing endless lines of code manually.

## 📋 Prerequisites (Dependencies)
To ensure all modules work perfectly, you need to install a few packages on your Linux distribution:

* **Conky with Lua/Cairo support:** Ensure you have the `conky-all` package installed (on Ubuntu/Debian) or `conky` compiled with lua support.
* **Playerctl:** To control media players. (`sudo apt install playerctl` or equivalent).
* **Audacious:** (Optional) If you plan to use the native Audacious module.
* **Sensors:** To read temperatures and fan speeds. (`sudo apt install lm-sensors`).
* **Nvidia-smi:** For the concentric GPU ring (only required if using NVIDIA graphic cards).
* **Python 3:** Required for the email checking script.

## 🚀 How to use ConkyForge

1.  **Open the editor:** Double-click the ConkyForge HTML file to open it in your web browser.
2.  **Set up your canvas:** On the left panel, adjust the width, height, colors, and your screen resolution.
3.  **Add Widgets:** Click the buttons on the left panel to spawn elements onto the canvas.
4.  **Place and resize:** Drag the widgets to your desired position. You can resize them by dragging the bottom-right corner.
    * *Sniper Trick:* If you double-click a block, you can adjust its position by adding or subtracting exact pixels (X and Y offsets) for perfect alignment.
5.  **Forge Conky:** Press the bottom "FORJAR CONKY" button. The browser will automatically download two files:
    * `conky.conf`: The main engine.
    * `visuals.lua`: The magic handling rings, complex graphs, and custom fonts.

## 📂 Where to place the files

Move the downloaded files to your personal Conky configuration folder:
```bash
mkdir -p ~/.config/conky/
mv Downloads/conky.conf ~/.config/conky/
mv Downloads/visuals.lua ~/.config/conky/
Make sure the "Ruta absoluta archivo LUA" (Absolute Lua path) in the ConkyForge left panel matches the exact path where you saved the visuals.lua file (Example: /home/YOUR_USER/.config/conky/visuals.lua).

✉️ Email Setup (mail.py)
If you use the Email widget:

Open the mail.py file with a text editor.

Change USERNAME to your email address.

Change PASSWORD to your password. If you use Gmail or Outlook, you will need to generate an "App Password" from your account's security settings. Regular passwords will not work.

Save the file in ~/.config/conky/mail.py and grant execution permissions: chmod +x ~/.config/conky/mail.py.


# 🛠️ ConkyForge - Manual de Usuario

¡Bienvenido a ConkyForge! Una herramienta visual y en tu navegador para diseñar tus widgets de Conky sin tener que escribir interminables líneas de código a mano.

## 📋 Requisitos Previos (Dependencias)
Para que todos los módulos funcionen a la perfección, necesitas instalar algunos paquetes en tu distribución Linux:

* **Conky con soporte Lua/Cairo:** Asegúrate de tener instalado el paquete `conky-all` (en Ubuntu/Debian) o tener `conky` compilado con soporte lua.
* **Playerctl:** Para controlar reproductores multimedia. (`sudo apt install playerctl` o equivalente).
* **Audacious:** (Opcional) Si vas a usar el módulo nativo de Audacious.
* **Sensors:** Para medir temperaturas y ventiladores. (`sudo apt install lm-sensors`).
* **Nvidia-smi:** Para el anillo concéntrico de la GPU (solo necesario si usas tarjetas NVIDIA).
* **Python 3:** Requerido para el script de lectura de correo electrónico.

## 🚀 Cómo usar ConkyForge

1.  **Abre el editor:** Haz doble clic en el archivo HTML de ConkyForge para abrirlo en tu navegador.
2.  **Configura tu lienzo:** En el panel izquierdo, ajusta el ancho, el alto, los colores y la resolución de tu pantalla.
3.  **Añade Widgets:** Pulsa en los botones del panel izquierdo para ir añadiendo elementos al lienzo.
4.  **Coloca y ajusta:** Arrastra los widgets a la posición que desees. Puedes estirar su tamaño agarrando la esquina inferior derecha.
    * *Truco de Francotirador:* Si haces doble clic sobre un bloque, podrás ajustar su posición sumando o restando píxeles exactos (X e Y) para alinearlo a la perfección.
5.  **Forjar Conky:** Pulsa el botón inferior "FORJAR CONKY". El navegador descargará automáticamente dos archivos:
    * `conky.conf`: El motor principal.
    * `visuals.lua`: La magia que dibuja los anillos, gráficas complejas y fuentes personalizadas.

## 📂 Dónde colocar los archivos

Mueve los archivos descargados a tu carpeta personal de configuración de Conky:
```bash
mkdir -p ~/.config/conky/
mv Descargas/conky.conf ~/.config/conky/
mv Descargas/visuals.lua ~/.config/conky/

Asegúrate de que la "Ruta absoluta archivo LUA" en el panel izquierdo de ConkyForge coincida con la ruta donde has guardado el archivo visuals.lua (Ejemplo: /home/TU_USUARIO/.config/conky/visuals.lua).

✉️ Configurar el Correo (mail.py)
Si usas el widget de correo:

Abre el archivo mail.py con un editor de texto.

Cambia USERNAME por tu correo electrónico.

Cambia PASSWORD por tu contraseña. Si usas Gmail u Outlook, necesitarás crear una "Contraseña de aplicación" desde las opciones de seguridad de tu cuenta. No funciona con la contraseña normal.

Guarda el archivo en ~/.config/conky/mail.py y dale permisos de ejecución: chmod +x ~/.config/conky/mail.py.
