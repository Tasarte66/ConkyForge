--[[ barometr_v.0.1.lua by olgmen 07.12.2010 ]]

require 'cairo'


function conky_main_weather()

weather_settings = {			-- SORTIE GRAPHIQUE

{					-- arrière-plan
sectors = 1,
gap_sectors = -1,
radius = 120,
thickness = 120,
bg_colour1 = {{0, 0x000000, 0.0}},	-- fond du grand cercle
},

{					-- cercle
sectors = 1,
gap_sectors = -1,
radius = 32,
thickness = 1,
bg_colour1 = {{0, 0xFFFFFF, 0.7}},
bg_colour2 = {{0, 0x1B1A25, 1},{0.5, 0x7D7D78, 0.9},{1, 0x5D5D78, 0}}, -- cercle rose des winds
},

{					-- fond d'échelle barométrique
radius = 71,
thickness = 7,
sectors = 1,
fill_sectors = true,
start_angle = -120,
end_angle = 120,
bg_colour1 = {{0, 0xffffff, 0.75}},	-- blanc
},

{					-- divisions de l'échelle du baromètre
radius = 70,
thickness = 5,
sectors = 80,
gap_sectors = 1,
fill_sectors = true,
start_angle = -120,
end_angle = 120,
bg_colour1 = {{0, 0x000000, 1}},	-- noir
},

{					-- divisions de l'échelle du thermomètre
radius = 0,
sectors = 1,
gap_sectors = 21,
start_angle = 125,
end_angle = 235,
bg_colour1 = {{0, 0xffffff, 0.1}},	-- blanc
},

{					-- thermomètre
name = "temperature",
--arg = conky_parse('${execi 600 sed -n 3p /home/rafa/.conky/conky-draw/barometre/conditions.txt}'),
arg = tonumber(conky_parse('${execi 600 sed -n 3p /home/rafa/.conky/conky-draw/barometre/conditions.txt}')),
max = 30,
radius = 70,
thickness = 9,
sectors = 6,
start_angle = 130,
end_angle = 230,
inverse_arc = true,
cap = "r",
bg_colour1 = {{0.0, 0x999999, 0.0},{0.5, 0x999999, 0.5},{1.0, 0x999999, 0.0}},
fg_colour1 = {{0.0, 0xff0000, 0.0},{0.5, 0x6495ee, 1.0},{1.0, 0xff0000, 0.0}},
fg_colour2 = {{0.0, 0x6495ee, 0.2},{0.5, 0x6495ee, 1.0},{1.0, 0x6495ee, 0.2}},
bd_colour1 = {{0.0, 0x00FF00, 1.0},{0.5, 0x00FF00, 1.0},{1.0, 0x00FF00, 1.0}},
},
				
}

text_settings = {			-- EXTRACTION DE TEXTE

{					-- température
text = "TEMPERATURE " .. conky_parse('${execi 600 sed -n 3p /home/rafa/.conky/conky-draw/barometre/conditions.txt}') .. " C",
font_name = "Ubuntu Mono",		-- nom de la police
font_size = 11,				-- taille de la police
bold = true,
inside	= true,				-- positionnement du texte dans le sens inverse des aiguilles d'une montre
start_angle = 233,
end_angle = 135,
radius = 60,
},


{					--échelle thermométrique 
text = "-20-10 0 10 20 30 40",
font_name = "URW Chancery L",
font_size = 12,
bold = true,
inside = true,
start_angle = 240,
end_angle = 130,
radius = 80,
},

{					-- météo
text = "Stormy   Rain   Change   Fair   Very Dry",
font_name = "URW Chancery L",
font_size = 15,
bold = true,
start_angle = 245,
end_angle = 472,
radius = 74,		
},
	
{					-- pressure en mb
text = "PRESSURE " .. conky_parse('${execi 600 sed -n 1p /home/rafa/.conky/conky-draw/barometre/conditions.txt}') .. "mb",
font_name = "Ubuntu Mono",
font_size = 12,
bold = true,
start_angle = 290,
end_angle = 407,
radius = 55,
},

{					-- la vitesse du wind
text = "WIND " .. conky_parse('${execi 600 sed -n 5p /home/rafa/.conky/conky-draw/barometre/conditions.txt}') .. "mph",
font_name = "Ubuntu Mono",
font_size = 11,
bold = true,
start_angle = 58,
end_angle = 120,
radius = 55,
},

{					-- 	humidité
text = "HUMIDITY " .. conky_parse('${execi 600 sed -n 4p /home/rafa/.conky/conky-draw/barometre/conditions.txt}') .. "%",
font_name = "Ubuntu Mono",
font_size = 11,
bold = true,
inside = true,
start_angle = 228,
end_angle = 140,
radius = 51,
},

{					-- direction du wind
text = "DIR " .. conky_parse('${execi 600 sed -n 2p /home/rafa/.conky/conky-draw/barometre/conditions.txt}'),
font_name = "Ubuntu Mono",
font_size = 12,
bold = true,
start_angle = 236,
end_angle = 274,
radius = 55,
},


}

image_settings = {			-- sortie de l'image centrale

{
name = os.getenv ('HOME')..'/.conky/forlogan/barometre/wind_rose.png',	-- chemin de l'image , pour modifier taille modifier le taille de l'image dans son dossier
},
			
}

needle_settings = {			-- aiguille

{
name = "wind",				-- direction du wind
arg = conky_parse('${execi 600 sed -n 2p /home/rafa/.conky/conky-draw/barometre/conditions.txt}'),
max = 360,
length_of_arrows = 1,			-- longueur aiguille bleu
width_of_arrows = 3,			-- épaisseur aiguille aiguille bleu
},

{					-- pressure
name = "pressure",
arg = conky_parse('${execi 600 sed -n 1p /home/rafa/.conky/conky-draw/barometre/conditions.txt}'),
max = 80,
start_angle = 242,
end_angle = 480,
length_of_arrows = 1.75, ----longueur aiguille rouge 
width_of_arrows = 2, --largeur aiguille rouge
},

}		
----------- END --------------

	if conky_window == nil then return end

	local cs = cairo_xlib_surface_create(conky_window.display, conky_window.drawable, conky_window.visual, conky_window.width, conky_window.height)

	cr = cairo_create(cs)

if conky_window == nil then return end

local cs = cairo_xlib_surface_create(conky_window.display, conky_window.drawable, conky_window.visual, conky_window.width, conky_window.height)
cr = cairo_create(cs)

if tonumber(conky_parse('${updates}')) > 1 then
    for i in pairs(weather_settings) do
        draw_weather_graph(weather_settings[i])
    end

    for i in pairs(text_settings) do
        draw_circle_text(text_settings[i])
    end

    for i in pairs(image_settings) do
        draw_image(image_settings[i])
    end

    for i in pairs(needle_settings) do
        draw_needle_graph(needle_settings[i])
    end

    -- Add code to draw "Barometer" with shadow
    draw_barometer_text()

end

cairo_destroy(cr)
cairo_surface_destroy(cs)

end
-- -------------------------------------------------

-- Fonction to draw "Barometer" text with shadow
--function draw_barometer_text()
    --local font = "Dyuthi"
    --local font_size = 14
    --local x = conky_window.width / 2  - 34 -- Centered horizontally
    --local y = conky_window.height - 8  -- Positioned at the bottom

    -- Set the font size and family
    --cairo_select_font_face(cr, font, CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD)
    --cairo_set_font_size(cr, font_size)

    -- Draw shadow (black text, offset by 1px)
    --cairo_set_source_rgba(cr, 0, 0, 0, 1)  -- Black color
    --cairo_move_to(cr, x + 1, y + 1)  -- Offset by 1px in both directions
    --cairo_show_text(cr, "Barometer")

    -- Draw the main text (white)
    --cairo_set_source_rgba(cr, 1, 1, 1, 1)  -- White color
    --cairo_move_to(cr, x, y)  -- Position at the center-bottom
    --cairo_show_text(cr, "Barometer")

    --cairo_stroke(cr)
--end

-- Rest of the functions

-- -------------------------------------------------
--fonction de sortie graphique
function draw_weather_graph(t)
-- --------------------------------
-- fonction de codage des couleurs

	local function rgba_to_r_g_b_a(tcolour)
		colour,alpha=tcolour[2],tcolour[3]
		return ((colour / 0x10000) % 0x100) / 255., 
			((colour / 0x100) % 0x100) / 255., (colour % 0x100) / 255., alpha
	end
-- ----------------------------------
	local function calc_delta(tcol1,tcol2)
		--calculate deltas P R G B A to table_colour 1

		for x = 1, #tcol1 do
			tcol1[x].dA	= 0
			tcol1[x].dP = 0
	 		tcol1[x].dR = 0
			tcol1[x].dG = 0
			tcol1[x].dB = 0
			if tcol2~=nil and #tcol1 == #tcol2 then
				local r1,g1,b1,a1 = rgba_to_r_g_b_a(tcol1[x])
				local r2,g2,b2,a2 = rgba_to_r_g_b_a(tcol2[x])
				tcol1[x].dP = (tcol2[x][1]-tcol1[x][1])/t.sectors
		 		tcol1[x].dR = (r2-r1)/t.sectors
				tcol1[x].dG = (g2-g1)/t.sectors
				tcol1[x].dB = (b2-b1)/t.sectors
				tcol1[x].dA = (a2-a1)/t.sectors		
				
			end
		end
		
		return tcol1
	end
-- --------------------------------------------



-----------------------------------------------
	local function draw_scale (x, y, radius, max)

		local i = 0
		local winkel = math.rad(3)
cairo_set_source_rgba(cr,1,1,1,1)
		for i = 0, max/2 - 1, 1 do

		cairo_set_line_width(cr,1)
		cairo_move_to(cr, x -radius- math.sin(winkel*i)*radius, y-radius - math.cos(winkel*i)*radius)
		cairo_line_to(cr, x-radius - math.sin(winkel*i)*(radius*0.9), y-radius-math.cos(winkel*i)*(radius*0.9))
		cairo_stroke(cr)
		end
	end

-- -------------------------------------------
	--check valeurs
	local function setup(t)

--sauvegarde des données et des réglages 

	cairo_save(cr)

-- paramètres par défaut

		if t.name		== nil then t.name= "" end
		if t.arg		== nil then t.arg = "" end
		if t.max		== nil then t.max = 100 end
		if t.x 			== nil then t.x = conky_window.width/12.6 + 84 end  -- originale  2 milieu conky
		if t.y			== nil then t.y = conky_window.height/2.25 + 10 end      -- = haut
		if t.height		== nil then t.height = conky_window.width end
		if t.width		== nil then t.width = conky_window.width end
		if t.radius		== nil then t.radius = (conky_window.width/2)*0.9 end
		if t.start_angle	== nil then t.start_angle=0 end
		if t.end_angle		== nil then t.end_angle = 360 end
		if t.thickness		== nil then t.thickness = 10 end
		if t.sectors		== nil then t.sectors = 10 end
		if t.gap_sectors	== nil then t.gap_sectors = 1 end
		if t.fill_sector	== nil then t.fill_sector = false end
		if t.sectors		== 1   then t.fill_sector = false end
		if t.border_size	== nil then t.border_size = 0 end
		if t.cap		== nil then t.cap = "p" end

-- couleur d'arrière-plan
		if t.bg_colour1 == nil then
			t.bg_colour1 = {{0, 0x00ffff, 0.1},{0.5, 0x00FFFF, 0.5},{1, 0x00FFFF, 0.1}}
		end
-- paramètre couleur
		if t.fg_colour1 == nil then
			t.fg_colour1 = {{0, 0x00FF00, 0.1},{0.5, 0x00FF00, 1},{1, 0x00FF00, 0.1}}
		end
-- couleur de l'habillage
		if t.bd_colour1 == nil then
			t.bd_colour1 = {{0, 0xFFFF00, 0.5},{0.5, 0xFFFF00, 1},{1, 0xFFFF00, 0.5}}
		end

-- vérifier le rapport entre la largeur et le rayon de l'anneau

		if t.thickness > t.radius then t.thickness = t.radius*0.1 end
		t.int_radius = t.radius - t.thickness

-- vérifier les données relatives à l'angle

		if t.start_angle >= t.end_angle then

			 local tmp_angle = t.end_angle
			 t.end_angle = t.start_angle
			 t.start_angle = tmp_angle
		 -- print ("inversed angles")

			if t.end_angle-t.start_angle > 360 and t.start_angle > 0 then
				t.end_angle = 360 + t.start_angle
				print ("reduce angles")
			end
		
			if t.end_angle + t.start_angle > 360 and t.start_angle <= 0 then
				t.end_angle = 360 + t.start_angle
				print ("reduce angles")
			end

			if t.int_radius < 0 then t.int_radius = 0 end

			if t.int_radius > t.radius then
				local tmp_radius = t.radius
				t.radius = t.int_radius
				t.int_radius = tmp_radius
				print ("inversed radius")
			end

			if t.int_radius == t.radius then
				t.int_radius = 0
				print ("int radius set to 0")
			end
		end

-- vérification du tableau des couleurs

		for i = 1, #t.bg_colour1 do

			if #t.bg_colour1[i] ~= 3 then t.bg_colour1[i] = {1, 0xFFFFFF, 0.5} end
		end

		for i = 1, #t.fg_colour1 do
			if #t.fg_colour1[i] ~= 3 then t.fg_colour1[i] = {1, 0xFF0000, 1} end
		end

		for i = 1, #t.bd_colour1 do
			if #t.bd_colour1[i] ~= 3 then t.bd_colour1[i] = {1, 0xFFFF00, 1} end
		end
	
		if t.bg_colour2 ~= nil then

			for i = 1, #t.bg_colour2 do
				if #t.bg_colour2[i] ~= 3 then t.bg_colour2[i] = {1, 0xFFFFFF, 0.5} end
			end
		end

		if t.fg_colour2 ~= nil then
			for i = 1, #t.fg_colour2 do
				if #t.fg_colour2[i] ~= 3 then t.fg_colour2[i] = {1, 0xFF0000, 1} end
			end
		end

		if t.bd_colour2 ~= nil then
			for i = 1, #t.bd_colour2 do
				if #t.bd_colour2[i] ~= 3 then t.bd_colour2[i] = {1, 0xFFFF00, 1} end
			end
		end

		t.fg_colour1 = calc_delta(t.fg_colour1,t.fg_colour2)
		t.bg_colour1 = calc_delta(t.bg_colour1,t.bg_colour2)
		t.bd_colour1 = calc_delta(t.bd_colour1,t.bd_colour2)
	end
	

	setup(t)
	
	--initialiser  cairo contexte
	cairo_save(cr)
	cairo_translate(cr, t.x, t.y)
	cairo_set_line_join (cr, CAIRO_LINE_JOIN_ROUND)
	cairo_set_line_cap (cr, CAIRO_LINE_CAP_ROUND)

	--prendre valeur
	local value = 0
-- --------------------------------------------- traitement de la sortie de température
	if t.name == "temperature" then t.name = "" end

-- -------------------------------------------------------------------------
	if t.name ~= "" then

		value = tonumber(conky_parse(string.format('${%s %s}', t.name, t.arg)))
	else
		value = tonumber(t.arg)
	end
	if value==nil then value =0 end

	-- initialiser les secteurs
	--angle d'un secteur :
	angleA = ((t.end_angle-t.start_angle)/t.sectors)*math.pi/180
	--valeur d'un secteur : 
	valueA = t.max/t.sectors
	-- premier angle d'un secteur :
	lastAngle = t.start_angle*math.pi/180

	local function draw_sector(type_arc,angle0,angle,valpc, idx)
	 
		--cette fonction dessine une partie de l'arc
	 	--type d'arc, angle0 = angle d'orientation, angle= angle du secteur,
	 	--valpc = pourcentage à l'intérieur du secteur, idx = numéro du secteur #.
		 if type_arc=="bg" then 		--arrière plan
			 if valpc==1 then return end
		 	tcolor=t.bg_colour1
		 elseif type_arc=="fg" then	--avant plan
		 	if valpc==0 then return end
		 	tcolor=t.fg_colour1
		 elseif type_arc=="bd" then	--bordure
		 	tcolor=t.bd_colour1
		 end 

		--angles équivalents à gap_sector
		local ext_delta=math.atan(t.gap_sectors/(2*t.radius))
		local int_delta=math.atan(t.gap_sectors/(2*t.int_radius))

		--angles des arcs
		local ext_angle=(angle-ext_delta*2)*valpc
		local int_angle=(angle-int_delta*2)*valpc

		--définir les couleurs à utiliser pour ce secteur
		if #tcolor==1 then 
			--couleur unie
			local vR,vG,vB,vA = rgba_to_r_g_b_a(tcolor[1])
			cairo_set_source_rgba(cr,vR+tcolor[1].dR*idx,
									vG+tcolor[1].dG*idx,
									vB+tcolor[1].dB*idx,
									vA+tcolor[1].dA*idx	)
		else
			--couleurrayonnante
			local pat=cairo_pattern_create_radial(0,0,t.int_radius,0,0,t.radius)
			for i=1, #tcolor do
				local vP,vR,vG,vB,vA = tcolor[i][1], rgba_to_r_g_b_a(tcolor[i])
				cairo_pattern_add_color_stop_rgba (pat, 
									vP+tcolor[i].dP*idx,
									vR+tcolor[i].dR*idx,
									vG+tcolor[i].dG*idx,
									vB+tcolor[i].dB*idx,
									vA+tcolor[i].dA*idx	)
			end
			cairo_set_source (cr, pat)
			cairo_pattern_destroy(pat)
		end

		--commencer à dessiner
		 cairo_save(cr)
		--L'axe des x est parallèle au début du secteur
		cairo_rotate(cr,angle0-math.pi/2)

		local ri,re = t.int_radius ,t.radius

		--point A 
		local angle_a
	
		if t.cap == "p" then 
			angle_a = int_delta
			if t.inverse_arc and type_arc ~="bg" then
				angle_a = angle-int_angle-int_delta
			end
			if not(t.inverse_arc) and type_arc =="bg" then
				angle_a = int_delta+int_angle
			end
		else --t.cap=="r"
			angle_a = ext_delta
			if t.inverse_arc and type_arc~="bg" then
				angle_a = angle-ext_angle-ext_delta
			end
			if not(t.inverse_arc) and type_arc=="bg" then
				angle_a = ext_delta+ext_angle
			end
		end
		local ax,ay = ri*math.cos(angle_a),ri*math.sin(angle_a)

		--point B
		local angle_b = ext_delta
		if t.cap == "p" then 
			if t.inverse_arc and type_arc ~="bg" then
				angle_b = angle-ext_angle-ext_delta
			end
			if not(t.inverse_arc) and type_arc=="bg" then
				angle_b = ext_delta+ext_angle
			end
		else
			if t.inverse_arc and type_arc ~="bg" then
				angle_b = angle-ext_angle-ext_delta
			end
			if not(t.inverse_arc) and type_arc=="bg" then
				angle_b = ext_delta+ext_angle
			end
		end
		local bx,by = re*math.cos(angle_b),re*math.sin(angle_b)

		-- EXTERNAL ARC B --> C
		if t.inverse_arc then
			if type_arc=="bg" then
				b0,b1= ext_delta, angle-ext_delta-ext_angle
			else
				b0,b1= angle-ext_angle-ext_delta, angle-ext_delta
			end
		else
			if type_arc=="bg" then
				b0,b1= ext_delta+ext_angle, angle-ext_delta
			else
				b0,b1= ext_delta, ext_angle+ext_delta
			end
		end
		
		---POINT D
		local angle_c 
		if t.cap == "p" then 
			angle_d = angle-int_delta
			if t.inverse_arc and type_arc=="bg" then
				angle_d = angle-int_delta-int_angle	
			end
			if not(t.inverse_arc) and type_arc~="bg" then
				angle_d=int_delta+int_angle
			end
		else
			angle_d = angle-ext_delta
			if t.inverse_arc and type_arc=="bg" then
				angle_d =angle-ext_delta-ext_angle
			end
			if not(t.inverse_arc) and type_arc~="bg" then
				angle_d = ext_angle+ext_delta
			end
		end
		local dx,dy = ri*math.cos(angle_d),ri*math.sin(angle_d)
		
		-- INTERNAL ARC D --> A
		if t.cap=="p" then	
			if t.inverse_arc then	
				if type_arc=="bg" then
					d0,d1= angle-int_delta-int_angle,int_delta
				else
					d0,d1= angle-int_delta, angle- int_angle-int_delta
				end
			else
				if type_arc=="bg" then
					d0,d1= angle-int_delta, int_delta+int_angle
				else
					d0,d1= int_delta+int_angle, int_delta
				end
			end
		else
			if t.inverse_arc then	
				if type_arc=="bg" then	
					d0,d1= angle-ext_delta-ext_angle,ext_delta
				else
					d0,d1= angle-ext_delta, angle- ext_angle-ext_delta
				end
			else
				if type_arc=="bg" then	
					d0,d1= angle-ext_delta,ext_delta+ext_angle
				else	
					d0,d1= ext_angle+ext_delta, ext_delta
				end
			end			
		end
			
		--secteur du dessin
		cairo_move_to(cr,ax,ay)
		cairo_line_to(cr,bx,by)
		cairo_arc(cr,0,0,re,b0,b1)
		cairo_line_to(cr,dx,dy) 
		cairo_arc_negative(cr,0,0,ri,d0,d1)
		 cairo_close_path (cr);

		--secteur de trait ou de remplissage
		 if type_arc=="bd" then
		 	cairo_set_line_width(cr,t.border_size)
		 	cairo_stroke(cr)
		 else
			 cairo_fill(cr)
		 end

		 cairo_restore(cr)

	 end
	-- dessiner des secteurs
	local n0,n1,n2 = 1,t.sectors,1
	if t.inverse_arc then n0,n1,n2 = t.sectors,1,-1 end
	local index = 0
	for i = n0,n1,n2 do 
		index = index +1
		local valueZ=1
		local cstA, cstB = (i-1),i
		if t.inverse_arc then cstA,cstB = (t.sectors-i), (t.sectors-i+1) end
		
		if value>valueA *cstA and value<valueA*cstB then
			if not t.fill_sector then
				valueZ = (value-valueA*cstA)/valueA
			end
		else
			if value<valueA*cstB then valueZ=0 end
		end
		
		local start_angle= lastAngle+(i-1)*angleA
		if t.foreground ~= false then 
			draw_sector("fg",start_angle,angleA,valueZ, index)
		end
		if t.background ~= false then 
			draw_sector("bg",start_angle,angleA,valueZ, i)
		end
		if t.border_size>0 then draw_sector("bd",start_angle,angleA,1, i) end
	end

	cairo_restore(cr)

end


--[[FIN DU WIDGET DES ANNEAUX-SECTEURS]]
-- -----------------------------------------------------------------------
-- [[ TEXTE ]] --

-- fonction permettant d'ajouter des zéros non significatifs

function addzero100(num)

	if tonumber(num) == nil then return end	--tonumber(num) == 0 end

	if tonumber(num) < 10 then
		return "00" .. num
	elseif tonumber(num) <100 then
		return "0" .. num
	else
		return num
	end
end
-- ------------------------------------------


function string:split(delimiter)

	local result = { }
	local from  = 1
	local delim_from, delim_to = string.find(self, delimiter, from)

	while delim_from do
		table.insert(result, string.sub(self, from, delim_from-1))
		from = delim_to + 1
		delim_from, delim_to = string.find(self, delimiter, from)
	end

	table.insert(result, string.sub(self, from))
	return result
end
-- -----------------------------------------
-- fonction de codage des couleurs

function rgb_to_r_g_b2(tcolour)
    colour,alpha=tcolour[2],tcolour[3]
    return ((colour / 0x10000) % 0x100) / 255., ((colour / 0x100) % 0x100) / 255., (colour % 0x100) / 255., alpha
end
-- ----------------------------------

	function calc_delta(tcol1,tcol2)
		--calculate deltas P R G B A to table_colour 1

		for x = 1, #tcol1 do
			tcol1[x].dA	= 0
			tcol1[x].dP = 0
	 		tcol1[x].dR = 0
			tcol1[x].dG = 0
			tcol1[x].dB = 0
			if tcol2~=nil and #tcol1 == #tcol2 then
				local r1,g1,b1,a1 = rgba_to_r_g_b_a(tcol1[x])
				local r2,g2,b2,a2 = rgba_to_r_g_b_a(tcol2[x])
				tcol1[x].dP = (tcol2[x][1]-tcol1[x][1])/t.sectors
		 		tcol1[x].dR = (r2-r1)/t.sectors
				tcol1[x].dG = (g2-g1)/t.sectors
				tcol1[x].dB = (b2-b1)/t.sectors
				tcol1[x].dA = (a2-a1)/t.sectors		
				
			end
		end
	return tcol1
end
-- --------------------------------------------

function draw_circle_text(t)

-- vérification des paramètres d'entrée et réglage des paramètres par défaut

	if t.text	== nil then t.text = "Conky c'est pour pour le moral !" end
	if t.x		== nil then t.x = conky_window.width/12.6 + 84 end --texte origiale = 2 milieu conky
	if t.y		== nil then t.y = conky_window.height/2.25 + 10 end  -- = haut
	if t.radius	== nil then t.radius = (conky_window.width/2)*0.9 end
	if t.font_name	== nil then t.font_name = "Free Sans" end
	if t.font_size	== nil then t.font_size = 14 end
	if t.start_angle	== nil then t.start_angle = 120 end
	if t.end_angle		== nil then t.end_angle = 240 end
	if t.italic		== nil then t.italic = false end
	if t.oblique		== nil then t.oblique = false end
	if t.bold		== nil then t.bold = false end
	if t.inside		== nil then inside = nil end
	if t.align		== nil then t.align = 0 end

	local slant = CAIRO_FONT_SLANT_NORMAL
	local weight =CAIRO_FONT_WEIGHT_NORMAL
	if t.italic then slant = CAIRO_FONT_SLANT_ITALIC end
	if t.oblique then slant = CAIRO_FONT_SLANT_OBLIQUE end
	if t.bold then weight = CAIRO_FONT_WEIGHT_BOLD end

	cairo_select_font_face(cr, t.font_name, slant,weight)

	local inum = string.len(t.text)

	if t.inside ~= nil then
		deg = (t.start_angle - t.end_angle)/(inum - 1)
	else
		range = t.end_angle
		deg = (t.end_angle - t.start_angle)/(inum-1)
	end

	degrads = 1*(math.pi/180)
	local textcut = string.gsub(t.text, ".", "%1@@@")
	texttable = string.split(textcut, "@@@")

	for i = 1, inum do

		ival = i

		if t.inside ~= nil then
			interval = (degrads*(t.start_angle - (deg*(i - 1)))) + t.align
			interval2 = degrads*(t.start_angle - (deg*(i - 1)))
		else
			interval = (degrads*(t.start_angle + (deg*(i - 1)))) + t.align
			interval2 = degrads*(t.start_angle + (deg*(i - 1)))
		end

		txs = 0 + t.radius*(math.sin(interval))
		tys = 0 - t.radius*(math.cos(interval))

		cairo_set_font_size (cr, t.font_size)
		--cairo_set_source_rgba(cr, 1, 1, 1, 1)
        cairo_set_source_rgba(cr, 0x2a / 255, 0x9a / 255, 0xd2 / 255, 1) -- set the text color to Bleys blue
		cairo_move_to (cr, txs + t.x, tys + t.y)

		if t.inside ~= nil then
			cairo_rotate (cr, interval2 + (180*math.pi/180))
		else
			cairo_rotate (cr, interval2)
		end

		cairo_show_text (cr, (texttable[i]))

		if t.inside ~= nil then 
			cairo_rotate (cr, -interval2 - (180*math.pi/180))
		else
			cairo_rotate (cr, -interval2)
		end
	end

end
-- ---------------------------------
function draw_image(t)
-- --------------------------------

-- paramètres par défaut

		if t.name		== nil then t.name= "" end
		if t.x 			== nil then t.x = conky_window.width/12.6 + 84 end  --rose devant original 2 milieu conky
		if t.y			== nil then t.y = conky_window.height/2.25 + 10 end -- = haut
		if t.height		== nil then t.height = conky_window.width end
		if t.width		== nil then t.width = conky_window.width end

-- taille de l'image

	image_bg = cairo_image_surface_create_from_png (t.name)

-- obtenir les données de largeur et de hauteur de l'image

	w1 = cairo_image_surface_get_width (image_bg)
	h1 = cairo_image_surface_get_height (image_bg)

-- affichage
	cairo_set_source_surface (cr, image_bg, t.x - w1/2, t.y - h1/2)
	cairo_paint (cr)
	cairo_surface_destroy (image_bg)

end
-- --------------------------------------------------

function draw_needle_graph (t)

-- paramètres par défaut

	if t.name		== nil then t.name= "time" end
	if t.arg		== nil then t.arg = "%S" end
	if t.max		== nil then t.max = 60 end
	if t.x 			== nil then t.x = conky_window.width/12.6 + 84 end  -- aiguille originale = 2 milieu conky
	if t.y			== nil then t.y = conky_window.height/2.30 + 10 end  -- = haut
	if t.radius		== nil then t.radius = 100 end
	if t.start_angle	== nil then t.start_angle = 0 end
	if t.end_angle		== nil then t.end_angle = 360 end
	if t.width_of_arrows	== nil then t.width_of_arrows = 2 end
	if t.length_of_arrows	== nil then t.length_of_arrows = 2.2 end

	if t.name == "wind" then

		if t.arg	== "S"		then t.arg = 180.0 end
		if t.arg	== "SSW"	then t.arg = 202.5 end
		if t.arg	== "SW"		then t.arg = 225.0 end
		if t.arg	== "WSW"	then t.arg = 247.5 end
		if t.arg	== "W"		then t.arg = 270.0 end
		if t.arg	== "WNW"	then t.arg = 292.5 end
		if t.arg	== "NW"		then t.arg = 315.0 end
		if t.arg	== "NNW"	then t.arg = 337.5 end
		if t.arg	== "N"		then t.arg = 360.0 end
		if t.arg	== "NNE"	then t.arg = 22.5 end
		if t.arg	== "NE"		then t.arg = 45.0 end
		if t.arg	== "ENE"	then t.arg = 67.5 end
		if t.arg	== "E"		then t.arg = 90.0 end
		if t.arg	== "ESE"	then t.arg = 112.5 end
		if t.arg	== "SE"		then t.arg = 135.0 end
		if t.arg	== "SSE"	then t.arg = 157.5 end
	end

	value = tonumber(conky_parse(t.arg))

	if value == nil then value = 0 end
-- angle de départ
	local sa = t.start_angle * (math.pi / 180)
-- angle final
	local ea = t.end_angle * (math.pi / 180)

-- calcul de l'angle de la flèche

	gamma = math.pi/2-math.atan(t.width_of_arrows/(t.radius*t.length_of_arrows))
	arc = ((ea - sa)/t.max)* value + sa
	arc0=arc-gamma
	arc1=arc+gamma

	xx = t.x + t.radius*math.sin(arc)*t.length_of_arrows
	yy = t.y - t.radius*math.cos(arc)*t.length_of_arrows
	x0 = t.x + t.width_of_arrows*math.sin(arc0)
	y0 = t.y - t.width_of_arrows*math.cos(arc0)
	x1 = t.x + t.width_of_arrows*math.sin(arc1)
	y1 = t.y - t.width_of_arrows*math.cos(arc1)

	cairo_set_line_width(cr,1)
	cairo_set_source_rgba(cr, 0, 0, 0, 0.5)


-- dessiner une flèche
	cairo_move_to (cr, x0, y0)
	cairo_curve_to (cr, x0, y0, xx, yy, x1, y1)
	cairo_arc(cr, t.x, t.y, t.width_of_arrows, arc1, arc0)

	pat = cairo_pattern_create_radial (t.x, t.y, t.radius/10, t.x, t.y, t.radius*t.length_of_arrows)

	if t.name == "wind" then

--régler la couleur du wind de bleu à rouge (pas très visible)

		cairo_pattern_add_color_stop_rgba (pat, 0.6, 0.1647, 0.6039, 0.8235, 1)   --bleu
		cairo_pattern_add_color_stop_rgba (pat, 0.6, 1, 1, 0.8, 1) --rouge
	else


-- pour la pressure rouge
		cairo_pattern_add_color_stop_rgba (pat, 0, 0.8, 0, 0, 0.8)
		cairo_pattern_add_color_stop_rgba (pat, 1, 1, 0, 0, 1)  -- rouge
	end

cairo_set_source (cr, pat)
	cairo_fill (cr)
	cairo_pattern_destroy (pat)

    -- Draw the first white line
    cairo_rectangle(cr, 10, 6, 178, 2)
    cairo_set_source_rgba(cr, rgb_to_rgba(0xffffff, 1.0))  -- White color
    cairo_fill(cr)

    -- Draw the second white line
    cairo_rectangle(cr, 10, 220, 48, 2)
    cairo_set_source_rgba(cr, rgb_to_rgba(0xffffff, 1.0))  -- White color
    cairo_fill(cr)

    -- Draw the third white line
    cairo_rectangle(cr, 138, 220, 48, 2)
    cairo_set_source_rgba(cr, rgb_to_rgba(0xffffff, 1.0))  -- White color
    cairo_fill(cr)

    -- Draw the translucent background
    color = 0x5a5a5a
    alpha = 0.15  -- Adjusted alpha for translucent effect
    typ = 1
    draw_bg(cr, color, alpha, typ) -- Draw translucent background

end

