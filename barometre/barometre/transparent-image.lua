--[[
2024 Koentje

usage:  ${lua conky_image /path/to/picture 2 2 380 425}

]]

require 'cairo'
require "imlib2"
home_path = os.getenv ('HOME')


function fDrawImage(cr,path,xx,yy,ww,hh)
    cairo_save (cr)
    local img =  cairo_image_surface_create_from_png(path)
    local w_img, h_img = cairo_image_surface_get_width(img), cairo_image_surface_get_height(img)
    cairo_translate (cr, xx, yy)
    cairo_scale (cr, ww/w_img, hh/h_img)
    cairo_set_source_surface (cr, img, xx + 6, yy + 3)
    cairo_paint (cr)
    cairo_surface_destroy (img)
    collectgarbage ()
    cairo_restore (cr)
end


function conky_image(img,xxx,yyy,www,hhh)
if conky_window==nil then return '' end
  local cs=cairo_xlib_surface_create(conky_window.display,conky_window.drawable,conky_window.visual, conky_window.width,conky_window.height)
  local cr=cairo_create(cs)
  local updates=conky_parse('${updates}')
  update_num=tonumber(updates)

--  if update_num>4 then
    fDrawImage(cr,img,xxx,yyy,www,hhh)
--  end

   cairo_surface_destroy(cs)
   cairo_destroy(cr)
   return ''
end
