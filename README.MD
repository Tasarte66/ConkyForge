# 🛠️ ConkyForge V.3

**The Ultimate Web-Based Conky Builder & Visual Editor**

ConkyForge is a powerful, 100% local web tool that allows Linux users to design, customize, and generate complex Conky desktop widgets visually—without writing a single line of code or messing with Lua scripts manually.


## ✨ Features

* **🎨 Visual Canvas:** See your Conky layout take shape in real-time.
* **📦 One-Click Forge (ZIP Export):** Packages your entire theme (Configs, Lua scripts, and Bash starters) into a clean `.zip` file instantly.
* **📊 Advanced Lua Graphics:** Easily add CPU/RAM rings, fluid graphs, neon geometry, 3D globes, and audio equalizers powered by Cairo.
* **☀️ Weather Integration:** Built-in support for generating weather tracking scripts.
* **🔒 100% Local & Secure:** Everything runs in your browser. No server backend, no data collection. It works completely offline!

## ⚠️ Important Notes & Pro-Tips (Must Read)

Before you start forging, please keep the following technical details in mind to get the best experience out of ConkyForge:

* **Canvas vs. Reality:** The web canvas is a powerful visualizer, but it is **not** an exact pixel-perfect 1:1 representation of the final result. Different desktop environments, resolutions, and system fonts will render the actual Conky slightly differently on your screen.
* **Sniper Mode & Fine-Tuning:** When using "Sniper Mode", your adjustments are applied to the generated code, but the web canvas itself will not update visually. You must look at the actual Conky running on your screen and use it as your real-time reference. ConkyForge V.3 is a potent tool with spectacular widgets and Lua-Cairo drawing features that will save you thousands of lines of code, but tweaking it to absolute perfection is an art that still requires some manual observation!
* **Missing Weather Icons:** If the weather widget displays broken characters instead of sun/cloud icons, you need to fulfill two requirements. First, grant execution permissions to the script (`chmod +x ~/.config/conky/weather.sh`). Second, ensure you have the **Hack Nerd Font** installed on your system.
* **Closing Circular Shapes:** If you are trying to completely close a circular shape on the canvas, grab the resize handle and shrink it into a very narrow ellipse. Once you do this, a **red dot** will appear. Click that red dot to successfully close the shape.

## 🚀 How to Use

### https://github.com/Tasarte66/ConkyForge

###Run it Locally
1. Clone or download this repository.
2. Open `index.html` (or `indexES.html` for Spanish) in your favorite web browser.
3. Design your perfect Conky setup using the side panel.
4. Click on **🔥 FORGE CONKY**.
5. A `ConkyForge_Tema.zip` will be downloaded to your machine.

## ⚙️ Installation on your Linux Desktop

Once you have downloaded your forged `.zip` file:

1. Extract the contents into your Conky config folder (usually `~/.config/conky/`).
2. Make sure the bash scripts are executable:
   ```bash
   chmod +x ~/.config/conky/start_conky.sh
   # If you added weather:
   chmod +x ~/.config/conky/weather.sh
   
   Run the starter script:


   ~/.config/conky/start_conky.sh
   
##📂 Project Structure
/css - Custom scrollbars and specific UI styles.

/js - The core engine (script.js) and local JSZip library for offline exporting.

indexEN.html - English interface.

indexES.html - Spanish interface.

🤝 Contributing
Feel free to fork this project, submit pull requests, or open issues if you want to add new Conky modules to the Forge!

📜 License
This project is open-source and available under the MIT License.
