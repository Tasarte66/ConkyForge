--[[
2023 Bleys
]]

require 'cairo'

function rgb_to_rgba(color,alpha)
	return ((color / 0x10000) % 0x100) / 255., ((color / 0x100) % 0x100) / 255., (color % 0x100) / 255., alpha
end
function draw_day(cr,xx,yy,bcolor,balpha) -- zeichne Hintergrund für aktuellen Tag / draw current Day Background 
    local corner_r=20
    local bg_color=color   --rot / red (Farbe/Color)) 
    local bg_alpha=alpha
	local w=15
	local h=12
    local x=xx
    local y=yy -12
	cairo_set_source_rgba(cr,rgb_to_rgba(bcolor,balpha))
	cairo_move_to(cr,x,y)
	cairo_line_to(cr,x+w,y)
	cairo_line_to(cr,x+w,y+h)
	cairo_line_to(cr,x,y+h)
	cairo_line_to(cr,x,y)
	cairo_close_path(cr)
	cairo_stroke(cr) -- Markierung "Heute" durch Umrandung / Marking today by border
--	cairo_fill(cr) -- Markierung "Heute" durch Hintergrund / Marking today by background
end

function draw_bg(cr, color, alpha, typ)
    local corner_r = 0
    local bg_color = color
    local bg_alpha = alpha

    local w = conky_window.width
    local h = conky_window.height

    cairo_set_source_rgba(cr, rgb_to_rgba(bg_color, bg_alpha))
    cairo_move_to(cr, corner_r, 0)
    cairo_line_to(cr, w - corner_r, 0)
    cairo_curve_to(cr, w, 0, w, 0, w, corner_r)
    cairo_line_to(cr, w, h - corner_r)
    cairo_curve_to(cr, w, h, w, h, w - corner_r, h)
    cairo_line_to(cr, corner_r, h)
    cairo_curve_to(cr, 0, h, 0, h, 0, h - corner_r)
    cairo_line_to(cr, 0, corner_r)
    cairo_curve_to(cr, 0, 0, 0, 0, corner_r, 0)
    cairo_close_path(cr)

    if typ == 1 then
        cairo_fill(cr)
    else
        cairo_set_source_rgba(cr, rgb_to_rgba(bg_color, 0))  -- Set alpha to 0 for transparent border
        cairo_stroke(cr)
    end
end


function conky_main()
	if conky_window==nil then return end
	local cs=cairo_xlib_surface_create(conky_window.display,conky_window.drawable,conky_window.visual, conky_window.width,conky_window.height)	
	local cr=cairo_create(cs)
	local updates=conky_parse('${updates}')
	update_num=tonumber(updates)
	if update_num>5 then
        color=0x5a5a5a 
        alpha=0.3  -- Adjusted alpha for translucent effect
        typ=1
        draw_bg(cr, color, alpha, typ) -- Draw translucent background

    -- Draw line (rectangle with height of 3 pixels)
    cairo_rectangle(cr, 10, 6, 718, 2)
    cairo_set_source_rgba(cr, rgb_to_rgba(0xffffff, 1.0))
    cairo_fill(cr)

    cairo_rectangle(cr, 10, 220, 284, 2)
    cairo_set_source_rgba(cr, rgb_to_rgba(0xffffff, 1.0))
    cairo_fill(cr)

    cairo_rectangle(cr, 430, 220, 296, 2)
    cairo_set_source_rgba(cr, rgb_to_rgba(0xffffff, 1.0))
    cairo_fill(cr)

	end

   cairo_surface_destroy(cs)
   cairo_destroy(cr)
end
