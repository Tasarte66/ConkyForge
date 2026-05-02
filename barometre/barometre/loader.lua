
require 'cairo'

function conky_loader_lua()
usrhome = os.getenv("HOME")
	dofile (usrhome .."/.conky/forlogan/barometre/barometre.lua")
	dofile (usrhome .."/.conky/forlogan/conky/lua/image.lua")	
        dofile (usrhome .."/.conky/forlogan/conky/lua/draw_bg.lua")

        conky_main_weather()
                
end
