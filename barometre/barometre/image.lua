require 'cairo'

home = os.getenv ('HOME')

--Fonction d'affichage
function conky_fDrawImage(path,x,y,w,h,arc)

	path = string.gsub(path, "~", home)
	path = string.gsub(path, "$HOME", home)

	local cs = cairo_xlib_surface_create(conky_window.display, conky_window.drawable, conky_window.visual, conky_window.width, conky_window.height)
	
	local function fDrawImage(path,x,y,w,h,arc)
		x=x+(w/2)
		y=y+(h/2)
		local img =  cairo_image_surface_create_from_png(path)
		local w_img, h_img = cairo_image_surface_get_width (img), cairo_image_surface_get_height (img)

		local cr = cairo_create (cs)
		cairo_translate (cr, x, y)

		if arc then
			cairo_rotate (cr, arc)
		end

		cairo_scale (cr, w/w_img, h/h_img)
		cairo_set_source_surface (cr, img, -w_img/2, -h_img/2)
		cairo_paint (cr)
		cairo_destroy(cr)
		cairo_surface_destroy (img)
	end
	fDrawImage(path,x,y,w,h,arc)
	cairo_surface_destroy(cs)
	return ""
end
